class FBXMLHttpRequest {
  public responseType: string;
  public onload: Function;
  public onerror: Function;
  public ontimeout: Function;
  public onabort: Function;
  method: string;
  url: string;
  async: boolean;
  private _status: number;
  private _response: ArrayBuffer;
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
  async send(body: any) {
    return window
      .fetch(this.url)
      .then((response) => {
        this._status = response.status;
        return response.blob();
      })
      .then((blob) => {
        return blob.arrayBuffer();
      })
      .then((arrayBuffer) => {
        this._response = arrayBuffer;
        this.onload();
      });
  }
}
