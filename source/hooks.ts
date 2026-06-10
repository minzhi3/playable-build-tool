import { IBuildTaskOption } from "../@types";
import { IBuildResult } from "../@types";
import { MergeBuilder } from "./merge";

type BooleanOption = boolean | "true" | "false";

interface IOptions {
  isPlayable?: BooleanOption;
  gzip?: BooleanOption;
  loading?: BooleanOption;
  adNetwork?: string;
}

const PACKAGE_NAME = "playable-build-tool";

interface ITaskOptions extends IBuildTaskOption {
  packages: {
    [PACKAGE_NAME]: IOptions;
  };
}

function log(...arg: any[]) {
  return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError = true;

function toBooleanOption(value: BooleanOption | undefined, defaultValue = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return defaultValue;
}

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
  const availableVersion = ["3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"];
  if (availableVersion.indexOf(mainVersion) < 0) {
    console.error(
      `Unsupported cocos version ${Editor.App.version}.\nPlease use cocos creator between 3.2 ~ 3.8.);`
    );
    return;
  }
  let fileType = "3.8";
  if (Number(versionArray[1]) <= 5) fileType = "3.5";
  else if (Number(versionArray[1]) <= 6) fileType = "3.6";
  const packageOptions = options.packages[PACKAGE_NAME] || {};
  const adNetwork = packageOptions.adNetwork || "test";
  const isPlayable = toBooleanOption(packageOptions.isPlayable);
  const gzip = toBooleanOption(packageOptions.gzip);
  const loading = toBooleanOption(packageOptions.loading, true);
  if (isPlayable) {
    const mergeTool = new MergeBuilder(
      result.paths.dir,
      options.name,
      fileType
    );
    await mergeTool.merge(adNetwork, gzip, loading, fileType);
  }

  //fs.readFileSync()
}

export function unload() {
  console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
