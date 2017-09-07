//  TODO: maybe use gulp or grunt or something
//  TODO: make this package available via npm
//  TODO: refactor to do as many build steps concurrently as possible.

const BUILD = require('./build-utils');
const fs = require('fs');

console.log(BUILD.pkgkey('mkdirs'));        // testing require('build-utils');

//  recursively delete mkdirs
//  recursively build empty mkdirs

//  npm run build-libs
//  npm run build-models
//  npm run build-dist
//  squash dist/AS.js > dist/AS.min.js
//  squash dist/AS.module.js > dist/AS.module.min.js
//  npm run build-docs 
//  cp docs/README.md .
