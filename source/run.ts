// This file is used to test the build tool locally. It is not used in the extension.

import { MergeBuilder } from "./merge";

async function run() {
  const merge = new MergeBuilder(
    "../playable-demo-cocos/build/web-mobile",
    "playable-demo",
    "3.8"
  );
  await merge.merge("test", true, false, "3.8");
}

run();
