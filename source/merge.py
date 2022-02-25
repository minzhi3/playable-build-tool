import json
import os
import sys
import base64


RootDir = os.getcwd()
print(RootDir)

html_path = os.path.join(RootDir, 'playable/index.html')
output_path = os.path.join(RootDir, 'build/web-mobile/index.html')
wrapper_path = os.path.join(RootDir, 'playable/wrapper.js')
setting_path = os.path.join(RootDir, 'build/web-mobile/src/settings.json')
application_js_path = os.path.join(RootDir, 'build/web-mobile/application.js')
index_js_path = os.path.join(RootDir, 'build/web-mobile/index.js')
cc_index_js_path = os.path.join(
    RootDir, 'build/web-mobile/assets/main/index.js')
engine_path = os.path.join(RootDir, 'build/web-mobile/cocos-js/cc.js')
bundle_path = os.path.join(RootDir, 'build/web-mobile/src/chunks/bundle.js')
hook_path = os.path.join(RootDir, 'playable/download-hook.js')
style_path = os.path.join(RootDir, 'build/web-mobile/style.css')

res_path = os.path.join(RootDir, 'build/web-mobile/assets/main/')
system_js_path = os.path.join(RootDir, 'build/web-mobile/src/system.bundle.js')
polyfill_path = os.path.join(
    RootDir, 'build/web-mobile/src/polyfills.bundle.js')

dapi_path = os.path.join(RootDir, 'playable/dapi.js')
dapi_body_path = os.path.join(RootDir, 'playable/dapi-body.js')

engine_match_key = '<!--ENGINE-->'
bundle_match_key = '<!--BUNDLE-->'
entrypoint_match_key = '<!--ENTRYPOINT-->'
resmap_match_key = '<!--RESMAP-->'
hook_match_key = '<!--DOWNLOAD_HOOK-->'
system_js_match_key = '<!--SYSTEM_JS-->'
polyfill_match_key = '<!--POLYFILLS-->'
import_map_match_key = '<!--IMPORT_MAP-->'
dapi_match_key = '<!--DAPI_HEAD-->'
dapi_body_match_key = '<!--DAPI_BODY-->'


#addScriptPathList = [settingScrPath, mainScrPath, engineScrPath, projectScrPath]

fileByteList = ['.png', '.bin', '.mp3']
excludeList = ['/index.js']
base64PreList = {
    '.png': 'data:image/png;base64,',
    '.bin': 'data:application/octet-stream;base64,',
    '.mp3': 'data:audio/mpeg;base64,',
    '.ttf': ''
}


def read_in_chunks(filePath, chunk_size=1024*1024):
    """
    Lazy function (generator) to read a file piece by piece.
    Default chunk size: 1M
    You can set your own chunk size
    """
    extName = os.path.splitext(filePath)[1]
    if extName in fileByteList:
        file_object = open(filePath, 'rb')
        base64Str = base64.b64encode(file_object.read())
        preName = base64PreList[extName]
        if preName != None:
            base64Str = preName + base64Str.decode('utf-8')
        return base64Str
    elif extName == '':
        return None

    file_object = open(filePath)
    return file_object.read()


def writeToPath(path, data):
    with open(path, 'w') as f:
        f.write(data)


def getResMap(jsonObj, path):
    fileList = os.listdir(path)
    for fileName in fileList:
        absPath = path + '/' + fileName
        if (os.path.isdir(absPath)):
            getResMap(jsonObj, absPath)
        elif (os.path.isfile(absPath)):
            dataStr = read_in_chunks(absPath)
            absPath = absPath.replace(res_path, '')
            if absPath in excludeList:
                print('skip ' + absPath)
            else:
                if dataStr != None:
                    jsonObj[absPath] = dataStr
                    print(absPath)


def getResMapScript():
    jsonObj = {}
    getResMap(jsonObj, res_path)
    resStr = '<script>\nwindow.resMap = ' + json.dumps(jsonObj) + '</script>\n'
    return resStr


def start():
    html_str = read_in_chunks(html_path)
    wrapper_str = read_in_chunks(wrapper_path)

    style_str = '<style>\n' + read_in_chunks(style_path) + '</style>\n'
    html_str = html_str.replace('<!--STYLE-->', style_str, 1)

    # system_js
    system_js_str = '<script>\n' + \
        read_in_chunks(system_js_path) + '</script>\n'
    html_str = html_str.replace(system_js_match_key, system_js_str, 1)

    # polyfill_js
    polyfill_str = '<script>\n' + read_in_chunks(polyfill_path) + '</script>\n'
    html_str = html_str.replace(polyfill_match_key, polyfill_str, 1)

    html_str = html_str.replace(
        import_map_match_key, '<script type="systemjs-importmap">{"imports": {"cc": "./cocos-js/cc.js"}}</script>', 1)

    # entrypoint
    application_str = 'function loadApplication(){\n' + \
        read_in_chunks(application_js_path) + '}\n'
    application_str = application_str.replace(
        'cc = engine;', 'cc = engine;\nhook(cc);\n', 1)
    application_str = application_str.replace(
        'requestSettings();', 'resolve();')
    index_str = 'function loadIndex(){\n' + \
        read_in_chunks(index_js_path) + '}\n'
    entrypoint_str = '<script>\n' + application_str + \
        index_str + wrapper_str + '</script>\n'
    html_str = html_str.replace(entrypoint_match_key, entrypoint_str, 1)

    # dapi
    dapi_str = '<script>\n' + read_in_chunks(dapi_path) + '</script>\n'
    dapi_body_str = '<script>\n' + \
        read_in_chunks(dapi_body_path) + '</script>\n'
    #html_str = html_str.replace(dapi_match_key, dapi_str, 1) # use in ironSoure
    #html_str = html_str.replace(dapi_body_match_key, dapi_body_str, 1) # use in ironSource

    # engine
    replace_str = [
      't.load=function(e,i){return new Promise((function(n){(null==i?void 0:i.audioLoadMode)!==xyt.DOM_AUDIO&&Hyt.support?Xyt.load(e).then((function(e){n(new t(e))})).catch((function(){}))',
      't.load=function(e,i){return new Promise((function(n,r){(null==i?void 0:i.audioLoadMode)!==xyt.DOM_AUDIO&&Hyt.support?Xyt.load(e).then((function(e){n(new t(e))})).catch((function(e){r(e)}))',
      't.load=function(e){return new Promise((function(i){t.loadNative(e).then((function(n){i(new t(n,e))})).catch((function(){}))}))}',
      't.load=function(e){return new Promise((function(i,r){t.loadNative(e).then((function(n){i(new t(n,e))})).catch((function(e){r(e)}))}))}',
      '.catch((function(t){i(t)}))}function Jyt',
      '.catch((function(t){i()}))}function Jyt'
    ]
    origin_engine_str = read_in_chunks(engine_path)
    fix_engine_str = origin_engine_str.replace(replace_str[0],replace_str[1])
    fix_engine_str = fix_engine_str.replace(replace_str[2],replace_str[3])
    fix_engine_str = fix_engine_str.replace(replace_str[4],replace_str[5])
    engine_str = '<script>\nfunction loadCC(){\n' + \
        fix_engine_str + '}\n</script>\n'
    html_str = html_str.replace(engine_match_key, engine_str, 1)

    # bundle
    bundle_str = '<script>\nfunction loadBundle(){\n' + read_in_chunks(
        bundle_path) + '}\n</script>\n'
    html_str = html_str.replace(bundle_match_key, bundle_str, 1)

    # hook
    hook_str = '<script>\n' + read_in_chunks(hook_path) + '</script>\n'
    #skip loading mp3
    #hook_str = hook_str.replace('oldHook(url, options, onComplete)','onComplete()')
    html_str = html_str.replace(hook_match_key, hook_str, 1)

    # resmap
    resStr = getResMapScript()
    cc_index_str = '<script>\nfunction loadCCIndex(){\n' + read_in_chunks(
        cc_index_js_path) + '}\n</script>\n'
    setting_str = '<script>window._CCSettings = ' + \
        read_in_chunks(setting_path) + '</script>\n'
    html_str = html_str.replace(
        resmap_match_key, resStr + '\n' + cc_index_str + setting_str, 1)

    writeToPath(output_path, html_str)


if __name__ == '__main__':
    start()
