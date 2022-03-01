import * as fs from "fs";
import { IBuildTaskOption } from "../@types";
import { IBuildResult } from "../@types";
import * as path from "path";
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
  const staticDir = path.join(__dirname, "../static");
  const htmlTemplate = path.join(staticDir, "index.html");
  const htmlStr = fs.readFileSync(htmlTemplate, "utf8");
  htmlStr.substring(0, 100);
  const { adNetwork, needMerge } = options.packages[PACKAGE_NAME];
  log(needMerge);
  log(result);
  if (needMerge === true) {
    const paths = result.paths;
    const fileList = fs.readdirSync(paths.dir);
    const mergeTool = new MergeBuilder(result.paths.dir);
    mergeTool.merge(adNetwork);
  }

  //fs.readFileSync()
}

export function unload() {
  console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
}
