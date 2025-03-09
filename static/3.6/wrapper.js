function load(name){
  if (name === "index.js") {
    loadIndex()
    return true
  }
  else if (name === "application.js"){
    loadApplication()
    return true
  }else if (name === "cc.js"){
    loadCC()
    return true
  }else if (name === "bundle.js"){
    loadMyBundle()
    return true
  }else {
    return false
  }
}

var existingHook = System.constructor.prototype.instantiate;
System.constructor.prototype.instantiate = function (url, parentUrl) {
  console.log(url)
  var jsList = ["index.js", "application.js", "cc.js", "bundle.js"];
  var loaded = false;
  for (var i = 0;i < jsList.length;i++){
    if (url.indexOf(jsList[i]) > 0){
      var result = load(jsList[i]);
      if (result) {
        loaded = true;
        break;
      };
    }
  }
  if (loaded) return Promise.resolve(System.getRegister())
  else return Promise.resolve(existingHook.call(this, url, parentUrl))
};

function start(){
  System.import('./index.js').catch(function (err) { console.error(err); })
}