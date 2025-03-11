import { MergeBuilder } from "./merge";

async function run() {
  const merge = new MergeBuilder(
    "../playable-demo2/build/web-mobile",
    "playable-demo2",
    "3.5"
  );
  await merge.merge("test", true, false, "3.5");
}

run();
