
function load(name){
  for (var i = 0; i < window.jsList.length; i++){
    if (name === window.jsList[i]){
      window.loadFunc[i]()
      return true
    }
  }
  return false
}

var existingHook = System.constructor.prototype.instantiate;
System.constructor.prototype.instantiate = function (url, parentUrl) {
  console.log(url)
  var loaded = false;
  for (var i = 0;i < window.jsList.length;i++){
    if (url.indexOf(window.jsList[i]) > 0){
      var result = load(window.jsList[i]);
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