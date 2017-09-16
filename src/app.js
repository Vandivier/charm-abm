'use strict'

import AS from 'asx-abm';

console.log(AS);

//import dat from '';

/*
<script src = "https://unpkg.com/three@0.85.2/examples/js/libs/dat.gui.min.js"></script>
?       https://unpkg.com/three@0.85.2/examples/js/controls/OrbitControls.js
stats   https://unpkg.com/three@0.85.2/examples/js/libs/stats.min.js
THREE   https://unpkg.com/three@0.85.2/build/three.min.js

AS      ../dist/AS.min.js
TODO: what about ../dist/AS.module.min.js
*/

let app = document.location.search.substring(1) || 'scripts/diffuse'
if (app.endsWith('/')) app = app.slice(0, -1)       // trailing / problem with SimpleHTTPServer. ref: https://github.com/backspaces/asx/issues/11
let [appDir, appName] = app.split('/')
if (appName === undefined) {
    console.log('Note: app path is "dir/name", dir is "scripts" or "src"')
    console.log('..Using "scripts" as default')
    appName = appDir
    appDir = 'scripts'
}
const loc = `./${appDir}/${appName}.js`
console.log('running:', loc, 'dir:', appDir, 'name:', appName + '.js')
document.title = `asx:${appName}`

switch (appDir) {
    case 'scripts':
        AS.util.setScript(loc);
        break
    case 'src':
        AS.util.setScript(loc, {
            type: 'module'
        });
        break
    default:
        throw `Oops: ${appDir} not valid dir`
}