// TODO: webpack loader so I can use await. This might be the same prob the AS supermodule had.

'use strict'

// webpack-style async module loading

const pStats = import(
                  /* webpackChunkName: "stats" */
                  /* webpackMode: "eager" */
                  'stats.js'
                );
const pThree = import(
                  /* webpackChunkName: "three" */
                  /* webpackMode: "eager" */
                  'three'
                );

Promise.all([pStats, pThree]).then(function(arrModules){
    var Stats = arrModules[0];
    window.THREE = arrModules[1] || {};
    /*
    debugger
    window.THREE = arrModules[1] && arrModules[1].default || {};
    */
});

// pOrbitControls needs THREE
const pOrbitControls = import(
                  /* webpackChunkName: "OrbitControls" */
                  /* webpackMode: "lazy" */
                  './lib/OrbitControls.wrapper.js'
                );

// TODO: requires SCSS loader. As an HTML script for now.
const pDat = Promise.resolve();

Promise.all([pDat, pOrbitControls]).then(function(arrModules){
    //var dat = arrModules[0];
    var OrbitControls = arrModules[1];

    const pAs = import(
                  /* webpackChunkName: "asx-abm" */
                  /* webpackMode: "lazy" */
                  './lib/AS.module.js'
                );

    pAs.then(_as => {
        window.AS = _as;
        initModel();
    });
});

function initModel() {
    AS.util.setScript('static/scripts/diffuse.js');
    /*
    let app = document.location.search.substring(1) || 'static/scripts/diffuse'
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
    */
}
