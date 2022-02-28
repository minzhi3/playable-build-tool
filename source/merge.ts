import * as path from "path";
import * as fs from "fs";

/*class ContentInfo {
  paths: string[];
  contentList: string[];
  postProcess: Function[];
  key: string;
  constructor(_key = "") {
    this.key = _key;
  }
  async readContent(){
    const promiseList = this.paths.map(item => {
      return new Promise((resolve, reject) => {
        fs.readFile(item, "utf8", (data) =>{
          this.
        })
      })
    })
    this.contentList = await Promise.all(promiseList)
  }
  addPath(_path:string, _postProcess: () => {}){
    this.paths.push(_path)
    this.postProcess.push(_postProcess)
  }
  get outputString(){
    return this.contentList.reduce((prev, current) =>
      prev.concat(current)
    )
  }
}*/

const engine_match_key = "<!--ENGINE-->";
const bundle_match_key = "<!--BUNDLE-->";
const entrypoint_match_key = "<!--ENTRYPOINT-->";
const resmap_match_key = "<!--RESMAP-->";
const hook_match_key = "<!--DOWNLOAD_HOOK-->";
const system_js_match_key = "<!--SYSTEM_JS-->";
const polyfill_match_key = "<!--POLYFILLS-->";
const import_map_match_key = "<!--IMPORT_MAP-->";
const dapi_match_key = "<!--DAPI_HEAD-->";
const google_match_key = "<!--GOOGLE_HEAD-->";
const start_match_key = "<!--START-->";
const fileByteList = [".png", ".bin", ".mp3"];
const excludeList = ["/index.js"];
const base64PreList = new Map<string, string>([
  [".png", "data:image/png;base64,"],
  [".bin", "data:application/octet-stream;base64,"],
  [".mp3", "data:audio/mpeg;base64,"],
  [".ttf", ""],
]);
export class MergeBuilder {
  rootDest: string;
  html_path: string;
  output_path: string;
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
  dapi_path: string;
  dapi_body_path: string;
  mintegral_path: string;
  unity_path: string;

  applicationJsPath: string;
  constructor(_rootRest: string) {
    this.rootDest = _rootRest;
    this.application_js_path = path.join(this.rootDest, "application.js");
    this.index_js_path = path.join(this.rootDest, "index.js");
    this.wrapper_path = path.join(__dirname, "../static/wrapper.js");

    this.html_path = path.join(__dirname, "../static/index.html");
    this.output_path = path.join(this.rootDest, "merge.html");

    this.cc_index_js_path = path.join(this.rootDest, "assets/main/index.js");
    this.engine_path = path.join(this.rootDest, "cocos-js/cc.js");
    this.bundle_path = path.join(this.rootDest, "src/chunks/bundle.js");
    this.hook_path = path.join(__dirname, "../static/download-hook.js");
    this.style_path = path.join(this.rootDest, "style.css");

    this.res_path = path.join(this.rootDest, "assets/main/");
    this.system_js_path = path.join(this.rootDest, "src/system.bundle.js");
    this.polyfill_path = path.join(this.rootDest, "src/polyfills.bundle.js");

    this.dapi_path = path.join(__dirname, "../static/dapi.js");
    this.dapi_body_path = path.join(__dirname, "../static/dapi-body.js");
    this.setting_path = path.join(this.rootDest, "src/settings.json");
    this.mintegral_path = path.join(__dirname, "../static/mintegral.js");
    this.unity_path = path.join(__dirname, "../static/unity.js");
  }
  readFile(filePath: string) {
    console.log(filePath);
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
        const relativePath = absPath.replace(this.res_path, "/");
        jsonMap.set(relativePath, this.readFile(absPath));
      }
    }
  }
  getResMapScript() {
    let jsonObj = new Map<string, string>();
    this.getResMap(jsonObj, this.res_path);
    const object = Object.fromEntries(jsonObj);
    console.log(object);
    const resStr =
      "<script>\nwindow.resMap = " + JSON.stringify(object) + "</script>\n";
    return resStr;
  }
  simpleReplace(targetStr: string, findStr: string, replaceStr: string) {
    const group = targetStr.split(findStr, 2);
    return group[0] + replaceStr + group[1];
  }
  merge(adNetwork: string) {
    let html_str = this.readFile(this.html_path);

    const style_str =
      "<style>\n" + this.readFile(this.style_path) + "</style>\n";
    html_str = html_str.replace("<!--STYLE-->", style_str);

    // system_js
    const system_js_str =
      "<script>\n" + this.readFile(this.system_js_path) + "</script>\n";
    html_str = this.simpleReplace(html_str, system_js_match_key, system_js_str);

    // polyfill_js
    const polyfill_str =
      "<script>\n" + this.readFile(this.polyfill_path) + "</script>\n";
    html_str = html_str.replace(polyfill_match_key, polyfill_str);

    html_str = html_str.replace(
      import_map_match_key,
      '<script type="systemjs-importmap">{"imports": {"cc": "./cocos-js/cc.js"}}</script>'
    );

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
    const index_str =
      "function loadIndex(){\n" + this.readFile(this.index_js_path) + "}\n";
    const entrypoint_str =
      "<script>\n" + application_str + index_str + wrapper_str + "</script>\n";
    html_str = html_str.replace(entrypoint_match_key, entrypoint_str);

    if (adNetwork === "ironsource") {
      // dapi
      const dapi_str =
        "<script>\n" + this.readFile(this.dapi_path) + "</script>\n";
      html_str = this.simpleReplace(html_str, dapi_match_key, dapi_str);
    }

    // hook
    let hook_str = "<script>\n" + this.readFile(this.hook_path) + "</script>\n";
    if (adNetwork === "google") {
      //skip loading mp3
      hook_str = hook_str.replace(
        "oldHook(url, options, onComplete)",
        "onComplete()"
      );
      html_str = html_str.replace(
        google_match_key,
        '<script type="text/javascript" src="https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js"> </script>\n  <meta name="ad.size" content="width=320,height=480">'
      );
    }
    html_str = html_str.replace(hook_match_key, hook_str);

    //start
    switch (adNetwork) {
      case "mintegral":
        const mintegral_str =
          "<script>\n" +
          this.readFile(this.mintegral_path) +
          "\n</script>\n";
        html_str = html_str.replace(start_match_key, mintegral_str);
        break;
      case "ironsource":
        const dapi_body_str =
          "<script>\n" + this.readFile(this.dapi_body_path) + "</script>\n";
        html_str = html_str.replace(start_match_key, dapi_body_str);
        break;
      case "unity":
        const unity_path = "<script>\n" + this.readFile(this.unity_path) + "</script>\n";
        html_str = html_str.replace(start_match_key, unity_path);
        break;
      case "applovin":
      case "google":
      case "test":
      default:
        html_str = html_str.replace(
          start_match_key,
          '<script>\n  window.addEventListener("DOMContentLoaded", start);\n</script>'
        );
        break;
    }

    //bundle
    const bundle_str =
      "<script>\nfunction loadBundle(){\n" +
      this.readFile(this.bundle_path) +
      "}\n</script>\n";
    html_str = this.simpleReplace(html_str, bundle_match_key, bundle_str);

    //engine
    const engine_str =
      "<script>\nfunction loadCC(){\n" +
      this.readFile(this.engine_path) +
      "}\n</script>\n";
    html_str = this.simpleReplace(html_str, engine_match_key, engine_str);

    // resmap
    const resStr = this.getResMapScript();
    const cc_index_str =
      "<script>\nfunction loadCCIndex(){\n" +
      this.readFile(this.cc_index_js_path) +
      "}\n</script>\n";
    const setting_str =
      "<script>window._CCSettings = " +
      this.readFile(this.setting_path) +
      "</script>\n";
    html_str = html_str.replace(
      resmap_match_key,
      resStr + "\n" + cc_index_str + setting_str
    );
    fs.writeFileSync(this.output_path, html_str);
  }
}
