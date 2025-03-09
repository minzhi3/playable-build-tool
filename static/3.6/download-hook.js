function dataURItoBlob(dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);
  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: mimeString});


}

function downloadFile(url, options, onProgress, onComplete) {
  console.log(url)
  var assetName = ""
  if (url[0]==="a")
    assetName = url.replace("assets","/" + window.currentBundle)
  else
    assetName = "/" + url
  var base64 = window.resMap[assetName]
  if (options.xhrResponseType === 'json'){
    onComplete(null, JSON.parse(base64))
    return
  }
  if (options.xhrResponseType === 'text'){
    onComplete(null, base64)
    return
  }
  var blob = dataURItoBlob(base64)
  if (options.xhrResponseType === 'arraybuffer')
    blob.arrayBuffer().then(result => {
      if (window.isZip) {        
        const uncompressed = pako.inflate(result)
        onComplete(null, uncompressed)
      } else {
        onComplete(null, result)
      }
    })
  else if (options.xhrResponseType === 'blob')
    onComplete(null, blob)
    
}

function downloadDomImage(url, options, onComplete) {
  var img = new Image();

  if (window.location.protocol !== 'file:') {
    img.crossOrigin = 'anonymous';
  }

  function loadCallback() {
    img.removeEventListener('load', loadCallback);
    img.removeEventListener('error', errorCallback);

    if (onComplete) {
      onComplete(null, img);
    }
  }

  function errorCallback() {
    img.removeEventListener('load', loadCallback);
    img.removeEventListener('error', errorCallback);

    if (onComplete) {
      onComplete(new Error(getError(4930, url)));
    }
  }

  img.addEventListener('load', loadCallback);
  img.addEventListener('error', errorCallback);

  var assetName = url.replace("assets","/" + window.currentBundle)
  var base64 = window.resMap[assetName]
  img.src = base64;
  return img;
}

function downloadBlob(url, options, onComplete) {
  options.xhrResponseType = 'blob';
  downloadFile(url, options, options.onFileProgress, onComplete);
};

function downloadJson(url, options, onComplete) {
  options.xhrResponseType = 'json';
  downloadFile(url, options, options.onFileProgress, onComplete);
};

function downloadText(url, options, onComplete) {
  options.xhrResponseType = 'text';
  downloadFile(url, options, options.onFileProgress, onComplete);
};

function downloadArrayBuffer(url, options, onComplete) {
  options.xhrResponseType = 'arraybuffer';
  downloadFile(url, options, options.onFileProgress, onComplete);
};

var downloaded = {};
function downloadScript(url, options, onComplete) {
  if (downloaded[url]) {
    if (onComplete) {
      onComplete(null);
    }

    return null;
  }
  if (url.indexOf("index.js") > 0){
    loadCCIndex()
    downloaded[url] = true;
    onComplete(null);
  }
}
function downloadBundle(nameOrUrl, options, onComplete) {
  console.log("bundle",nameOrUrl)
  window.currentBundle = nameOrUrl;
  var config = nameOrUrl + "/config.json";
  var count = 0;
  var out = null;
  var error = null;
  downloadJson(config, options, function (err, response) {
    error = err;
    out = response;

    if (out) {
      out.base = "assets/";
    }
    if (++count === 2) {
      onComplete(error, out);
    }
  });
  var jspath = "/index.js";
  downloadScript(jspath, options, function (err) {
    error = err;

    if (++count === 2) {
      onComplete(err, out);
    }
  });
}
var oldHook
function downloadAudio(url, options, onComplete) {
  var ext
  if (url) {
    var path = url.replace("assets","/" + window.currentBundle)
    ext = url.slice(-4)
    url = window.resMap[path]
  }
  //console.log(url,options)
  if (ext) {
    oldHook[ext](url, options, onComplete)
  }
  else
    onComplete()
}

function downloadCCONB(url, options, onComplete) {
  downloadArrayBuffer(url, options, function (err, arrayBuffer) {
    if (err) {
      onComplete(err);
      return;
    }
    try {
      var ccon = cc.internal.decodeCCONBinary(new Uint8Array(arrayBuffer));
      onComplete(null, ccon);
    } catch (err) {
      onComplete(err);
    }
  });
}

window.hook = function (cc) {
  console.log('run hook')
  cc.assetManager.downloader.register('.bin', downloadArrayBuffer);
  cc.assetManager.downloader.register('.cconb', downloadCCONB);
  cc.assetManager.downloader.register('.png', downloadDomImage);
  cc.assetManager.downloader.register('.jpg', downloadDomImage);
  cc.assetManager.downloader.register('.gif', downloadDomImage);
  cc.assetManager.downloader.register('.json', downloadJson);
  cc.assetManager.downloader.register('.js', downloadScript);
  cc.assetManager.downloader.register('.plist', downloadText);
  cc.assetManager.downloader.register('bundle', downloadBundle);
  if (!oldHook)
    oldHook = {
      ".mp3": cc.assetManager.downloader._downloaders[".mp3"],
      ".wav": cc.assetManager.downloader._downloaders[".wav"],
      ".ogg": cc.assetManager.downloader._downloaders[".ogg"]
    }
  cc.assetManager.downloader.register('.mp3', downloadAudio);
  cc.assetManager.downloader.register('.wav', downloadAudio);
  cc.assetManager.downloader.register('.ogg', downloadAudio);
}
