import * as path from "path";
import * as fs from "fs";
import JSZip from "jszip";
import ejs from "ejs";

const base64PreList = new Map<string, string>([
  [".png", "data:image/png;base64,"],
  [".jpg", "data:image/jpeg;base64,"],
  [".gif", "data:image/gif;base64,"],
  [".mp3", "data:audio/mpeg;base64,"],
  [".wav", "data:audio/wav;base64,"],
  [".ogg", "data:audio/ogg;base64,"],
  [".bin", "data:application/octet-stream;base64,"],
  [".cconb", "data:application/octet-stream;base64,"],
  [".ttf", ""],
]);
export class MergeBuilder {
  rootDest: string;
  html_path: string;
  output_folder: string;
  wrapper_path: string;
  setting_path: string;
  application_js_path: string;
  index_js_path: string;
  cc_index_js_path: string;
  engine_path: string;
  bundle_path: string;
  hook_path: string;
  style_path: string;
  res_path: string;
  system_js_path: string;
  polyfill_path: string;
  facebook_xhr_path: string;
  project_name: string;

  applicationJsPath: string;
  template_path: string;
  constructor(_rootRest: string, project_name: string) {
    this.rootDest = _rootRest;
    this.project_name = project_name;
    this.application_js_path = path.join(this.rootDest, "application.js");
    this.index_js_path = path.join(this.rootDest, "index.js");
    this.wrapper_path = path.join(__dirname, "../static/wrapper.js");

    this.html_path = path.join(__dirname, "../static/index.html");
    this.output_folder = path.join(this.rootDest, "playable");

    this.cc_index_js_path = path.join(this.rootDest, "assets/main/index.js");
    this.engine_path = path.join(this.rootDest, "cocos-js/cc.js");
    this.bundle_path = path.join(this.rootDest, "src/chunks/bundle.js");
    this.hook_path = path.join(__dirname, "../static/download-hook.js");
    this.style_path = path.join(this.rootDest, "style.css");

    this.res_path = path.join(this.rootDest, "assets/main/");
    this.system_js_path = path.join(this.rootDest, "src/system.bundle.js");
    this.polyfill_path = path.join(this.rootDest, "src/polyfills.bundle.js");

    this.setting_path = path.join(this.rootDest, "src/settings.json");
    this.facebook_xhr_path = path.join(__dirname, "./fb-xmlhttprequest.js");
    this.template_path = path.join(__dirname, "../static/templates");
  }
  readFile(filePath: string) {
    if (!filePath) return "";
    const extName = path.extname(filePath);
    let ret: string;
    if (base64PreList.has(extName)) {
      const buffer = fs.readFileSync(filePath);
      const base64 = Buffer.from(buffer).toString("base64");
      const preName = base64PreList.get(extName);
      ret = preName + base64;
    } else if (extName === "") {
      ret = "";
    } else {
      ret = fs.readFileSync(filePath, "utf8");
    }
    return ret;
  }

  getResMap(jsonMap: Map<string, string>, _path: string) {
    const fileList = fs.readdirSync(_path, { withFileTypes: true });
    for (const file of fileList) {
      const absPath = path.resolve(_path, file.name);
      if (file.isDirectory()) {
        this.getResMap(jsonMap, absPath);
      } else {
        let relativePath = absPath.replace(this.res_path, "/");
        if (process.platform == "win32") {
          relativePath = relativePath.replaceAll("\\", "/");
        }
        jsonMap.set(relativePath, this.readFile(absPath));
      }
    }
  }
  getResMapScript() {
    let jsonObj = new Map<string, string>();
    this.getResMap(jsonObj, this.res_path);
    const object = Object.fromEntries(jsonObj);
    console.log(object);
    const resStr = "window.resMap = " + JSON.stringify(object) + "\n";
    return resStr;
  }
  simpleReplace(targetStr: string, findStr: string, replaceStr: string) {
    const group = targetStr.split(findStr, 2);
    return group[0] + replaceStr + group[1];
  }

  generateScript(filePath: string, content: string, splitJs = false) {
    if (!splitJs) {
      return `<script>\n` + content + `</script>\n`;
    } else {
      const formatPathString = path.basename(filePath);
      const assetsPath = path.join(this.output_folder, "merge-assets");
      const exists = fs.existsSync(assetsPath);
      if (!exists) fs.mkdirSync(assetsPath);
      fs.writeFileSync(path.join(assetsPath, formatPathString), content);
      return `<script src="merge-assets/${formatPathString}"> </script>\n`;
    }
  }

  async archive(outputPath: string) {
    const zipFile = new JSZip();
    const getAllFiles = (
      dirPath: string,
      arrayOfFiles?: string[]
    ): string[] => {
      const files = fs.readdirSync(dirPath);

      arrayOfFiles = arrayOfFiles || [];

      files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
          arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
        } else {
          arrayOfFiles.push(path.join(dirPath, file));
        }
      });

      return arrayOfFiles;
    };
    const fileList = getAllFiles(outputPath);
    fileList.forEach((filePath) => {
      const content = fs.readFileSync(filePath);
      const relativePath = path.relative(this.output_folder, filePath);
      zipFile.file(relativePath, content);
    });
    const content = await zipFile.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });
    await fs.promises.writeFile(
      path.join(this.output_folder, `${this.project_name}.zip`),
      content
    );
  }

  async merge(adNetwork: string) {
    //create folder
    if (!fs.existsSync(this.output_folder)) fs.mkdirSync(this.output_folder);

    //set inline
    let splitJs = false;
    if (
      adNetwork === "facebook" ||
      adNetwork === "mintegral" ||
      adNetwork == "google"
    ) {
      splitJs = true;
    }

    const style_str =
      "<style>\n" + this.readFile(this.style_path) + "</style>\n";
    // system_js
    const system_js_str =
      "<script>\n" + this.readFile(this.system_js_path) + "</script>\n";
    // polyfill_js
    const polyfill_str =
      "<script>\n" + this.readFile(this.polyfill_path) + "</script>\n";

    let wrapper_str = this.readFile(this.wrapper_path);

    // entrypoint
    let application_str =
      "function loadApplication(){\n" +
      this.readFile(this.application_js_path) +
      "}\n";
    application_str = application_str.replace(
      "cc = engine;",
      "cc = engine;\nhook(cc);\n"
    );
    application_str = application_str.replace(
      "requestSettings();",
      "resolve();"
    );
    //for mintegral loading scene
    if (adNetwork === "mintegral") {
      application_str = application_str.replace(
        ".concat(launchScene));",
        ".concat(launchScene));\nif (onLoadComplete) onLoadComplete();"
      );
    }
    const index_str =
      "function loadIndex(){\n" + this.readFile(this.index_js_path) + "}\n";
    const entrypoint_str =
      "<script>\n" + application_str + index_str + wrapper_str + "</script>\n";

    // hook
    let hook_str = "<script>\n" + this.readFile(this.hook_path) + "</script>\n";
    if (adNetwork === "google") {
      //skip loading mp3
      hook_str = hook_str.replace(
        "oldHook[ext](url, options, onComplete)",
        "onComplete()"
      );
    }

    //bundle
    const bundle_str =
      "function loadMyBundle(){\n" + this.readFile(this.bundle_path) + "\n}\n";

    //engine
    let engine_str =
      "function loadCC(){\n" + this.readFile(this.engine_path) + "\n}\n";
    //for issue in facebook audio
    if (adNetwork === "facebook") {
      engine_str = engine_str.replaceAll(
        "new XMLHttpRequest",
        "new FBXMLHttpRequest"
      );
    }
    let engine_content = this.generateScript(
      this.engine_path,
      engine_str,
      splitJs
    );
    //for issue in facebook audio
    if (adNetwork === "facebook") {
      const fb_content = this.generateScript(
        this.facebook_xhr_path,
        this.readFile(this.facebook_xhr_path),
        splitJs
      );
      engine_content = fb_content + "\n" + engine_content;
    }
    // resmap
    const resStr = this.getResMapScript();
    const cc_index_str =
      "function loadCCIndex(){\n" +
      this.readFile(this.cc_index_js_path) +
      "\n}\n";
    const setting_str =
      "window._CCSettings = " + this.readFile(this.setting_path) + "\n";

    const ejsData = {
      styleTag: style_str,
      body: {
        systemJs: system_js_str,
        polyfills: polyfill_str,
        importMap:
          '<script type="systemjs-importmap">{"imports": {"cc": "./cocos-js/cc.js"}}</script>',
        resourceMap: this.generateScript(
          "res-map.js",
          resStr + "\n" + cc_index_str + setting_str,
          splitJs
        ),
        engine: engine_content,
        downloadHook: hook_str,
        bundle: this.generateScript(this.bundle_path, bundle_str, splitJs),
        entryPoint: entrypoint_str,
      },
    };
    const content = await ejs.renderFile(
      path.join(this.template_path, `${adNetwork}.ejs`),
      ejsData,
      {}
    );
    let htmlName = "index.html";
    if (!splitJs) {
      htmlName = `${this.project_name}.html`;
    }
    await fs.promises.writeFile(
      path.join(this.output_folder, htmlName),
      content
    );
    console.log("writeFile");
    if (splitJs) {
      await this.archive(this.output_folder);
      console.log("archive");
    }
  }
}
