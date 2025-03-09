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
      let wasm_str = window.wasmMap[url];
      this.href = wasm_str;
    } else this.href = this.origin.href;
  }
}
