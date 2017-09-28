// TODO: webpack loader so I can use await. This might be the same prob the AS supermodule had.

'use strict'

// can't use ES6 Modules this is not ES6.

//in html for now: <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.6.5/dat.gui.js"></script>
//var THREE = require('three');           // TODO: why require() works but import doesn't?
//var Stats = require('stats.js')();      // TODO: require('stats.js') vs require('stats.js')()

//var AS = require('asx-abm').AS; // it's somehow executing before the other imports, so we have to use html script tag

//import dat from 'dat.gui';    // weird one. https://github.com/dataarts/dat.gui
                                // https://github.com/dataarts/dat.gui/issues/132

//console.log(AS);

// webpack-style async module loading

const pThree = import(
                  /* webpackChunkName: "three" */
                  /* webpackMode: "eager" */
                  'three'
                );
const pStats = import(
                  /* webpackChunkName: "stats" */
                  /* webpackMode: "eager" */
                  'stats.js'
                );

Promise.all([pThree, pStats]).then(function(arrModules){
    var THREE = arrModules[0];
    var Stats = arrModules[1]();
    const pAs = import(
                  /* webpackChunkName: "asx-abm" */
                  /* webpackMode: "lazy" */
                  './lib/AS.module.js'
                );
    pAs.then(_as => {
        var AS = _as;
        debugger
        console.log(AS);
    })

});


let app = document.location.search.substring(1) || 'static/scripts/diffuse'
if (app.endsWith('/')) app = app.slice(0, -1)       // trailing / problem with SimpleHTTPServer. ref: https://github.com/backspaces/asx/issues/11
let [appDir, appName] = app.split('/')
if (appName === undefined) {
    console.log('Note: app path is "dir/name", dir is "scripts" or "src"')
    console.log('..Using "scripts" as default')
    appName = appDir
    appDir = 'scripts'
}

//import X from app


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

