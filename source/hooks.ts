import { IBuildTaskOption } from "../@types";
import { IBuildResult } from "../@types";
import { MergeBuilder } from "./merge";

interface IOptions {
  commonTest1: number;
  commonTest2: "opt1" | "opt2";
  webTestOption: boolean;
}

const PACKAGE_NAME = "playable-build-tool";

interface ITaskOptions extends IBuildTaskOption {
  packages: {
    "cocos-plugin-template": IOptions;
  };
}

function log(...arg: any[]) {
  return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError = true;

export async function load() {
  console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
  allAssets = await Editor.Message.request("asset-db", "query-assets");
}

export async function onBeforeBuild(options: ITaskOptions) {}

export async function onBeforeCompressSettings(
  options: ITaskOptions,
  result: IBuildResult
) {}

export async function onAfterCompressSettings(
  options: ITaskOptions,
  result: IBuildResult
) {}

export async function onAfterBuild(
  options: ITaskOptions,
  result: IBuildResult
) {
  const versionArray = Editor.App.version.split(".");
  const mainVersion = `${versionArray[0]}.${versionArray[1]}`;
  const availableVersion = ["3.2", "3.3", "3.4", "3.5", "3.6"];
  if (availableVersion.indexOf(mainVersion) < 0) {
    console.error(
      `Unsupported cocos version ${Editor.App.version}.\nPlease use cocos creator between 3.2 ~ 3.6.);`
    );
    return;
  }
  let fileType = "3.6";
  if (Number(versionArray[1]) <= 5) fileType = "3.5";
  const { adNetwork, isPlayable, gzip, loading } =
    options.packages[PACKAGE_NAME];
  if (isPlayable === true) {
    const mergeTool = new MergeBuilder(
      result.paths.dir,
      options.name,
      fileType
    );
    await mergeTool.merge(adNetwork, gzip, loading);
  }

  //fs.readFileSync()
}

export function unload() {
  console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
