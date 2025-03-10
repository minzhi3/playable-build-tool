interface Window {
  wasmMap: { [key: string]: string };
}

class HookURL {
  public href: string;
  public origin: URL;
  constructor(url: string, base: string) {
    this.origin = new URL(url, base);
    console.log("HookURL", url, base);
    if (url.endsWith(".wasm")) {
      if (window.wasmMap.hasOwnProperty(url)) {
        let wasm_str = window.wasmMap[url];
        this.href = wasm_str;
      } else {
        let new_url = this.origin.href;
        new_url = new_url.replace("cocos-js/assets", "merge-assets");
        this.href = new_url;
      }
    } else this.href = this.origin.href;
  }
}
