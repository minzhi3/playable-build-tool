class XMLFBHttpRequest {
  public responseType: string;
  public withCredentials: boolean;
  public onload: Function;
  public onerror: Function;
  public ontimeout: Function;
  public onabort: Function;
  public onprogress: Function;
  method: string;
  url: string;
  async: boolean;
  private _status: number;
  private _response: ArrayBuffer | Blob;
  get status() {
    return this._status;
  }
  get response() {
    return this._response;
  }
  open(_method: string, _url: string, _async: boolean) {
    this.method = _method;
    this.url = _url;
    this.async = _async;
  }
  overrideMimeType(mime: string) {}
  setRequestHeader(name: string, value: string) {}
  async send(body: any) {
    try {
      const response = await window.fetch(this.url);
      /*const response = {
        ok: true,
        status: 200,
        statusText: "ok",
        blob() {
          return new Blob();
        },
      };*/
      if (!response.ok) this.onerror(response.statusText);
      else {
        this._status = response.status;
        const blob = await response.blob();
        if (this.responseType === "blob") {
          this._response = blob;
        } else {
          const arrayBuffer = await blob.arrayBuffer();
          this._response = arrayBuffer;
        }
        this.onload();
      }
    } catch (e) {
      this.onerror(e);
    }
  }
}
