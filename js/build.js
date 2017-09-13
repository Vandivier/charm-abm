//  TODO: maybe use gulp or grunt or something
//  TODO: make this package available via npm
//  TODO: refactor to do as many build steps concurrently as possible.
//  TODO: with shell, maybe BUILD and fs-extra aren't

'use strict'

const BUILD = require('./build-utils');
const fs = require('fs-extra');
const shell = require('shelljs');

const sarrMkdirs = BUILD.pkgkey('mkdirs'),
      sarrLibs = BUILD.pkgkey('libs');

//  flow mimicks as if you ran `npm run build` so we start with `npm run clean`
BUILD.rmrf(sarrMkdirs);
BUILD.mkdirp(sarrMkdirs);                   //  require('fs-extra').mkdirp doesn't support multiple dirs via space separated

//  npm run build-libs
BUILD.forEachSpace(sarrLibs, sLib => shell.cp(sLib, 'libs'));
shell.exec('node ../bin/wraplibs.js');

//  npm run build-models

//  npm run build-dist

//  squash dist/AS.js > dist/AS.min.js
//  squash dist/AS.module.js > dist/AS.module.min.js
//  npm run build-docs 
//  cp docs/README.md .
