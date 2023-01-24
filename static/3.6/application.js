var oldSettingInit
function loadApplication() {
  System.register([], function (_export, _context) {
    "use strict";

    var cc, Application;

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

    return {
      setters: [],
      execute: function () {
        _export("Application", Application = /*#__PURE__*/function () {
          function Application() {
            _classCallCheck(this, Application);

            this.settingsPath = '';
            this.showFPS = true;
          }

          _createClass(Application, [{
            key: "init",
            value: function init(engine) {
              window.progress.value = 40;
              cc = engine;
              cc.game.onPostBaseInitDelegate.add(this.onPostInitBase.bind(this));
              cc.game.onPostSubsystemInitDelegate.add(this.onPostSystemInit.bind(this));
              hook(cc);
            }
          }, {
            key: "onPostInitBase",
            value: function onPostInitBase() {// cc.settings.overrideSettings('assets', 'server', '');
              oldSettingInit = cc.settings.init
              cc.settings._settings = window._CCSettings
            }
          }, {
            key: "onPostSystemInit",
            value: function onPostSystemInit() {// do custom logic
            }
          }, {
            key: "start",
            value: function start() {
              return cc.game.init({
                debugMode: true ? cc.DebugMode.INFO : cc.DebugMode.ERROR,
                settingsPath: this.settingsPath,
                overrideSettings: {
                  // assets: {
                  //      preloadBundles: [{ bundle: 'main', version: 'xxx' }],
                  // }
                  profiling: {
                    showFPS: this.showFPS
                  }
                }
              }).then(function () {
                window.progress.value = 50;
                var launchScene = window._CCSettings.launch.launchScene
                return cc.director.preloadScene(launchScene, function (count) {
                  if (window.progress) {
                    window.progress.value = 50 + count / 5
                  }
                }, function () {
                  return cc.game.run(function (){
                    window.progress.value = 100;
                    document.getElementById("loading-zone").style.display = "none";
                  });
                })
              });
            }
          }]);

          return Application;
        }());
      }
    };
  });
}