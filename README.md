# Summary

Charm ABM is my third attempt to build an agent based model of education.

The current implementation leverages ASX and Webpack.

## Developer Information

It's not on NPM at the moment, so you have to clone the repo:
* install [node-gyp](https://github.com/nodejs/node-gyp)
* `git clone`
* `npm install`
* `npm run dev-no-watch`
* open `http://<path to asx>/models` to run a model. Check console for messages

Instead of `npm run dev-no-watch` you can:
* `npm run dev` to enable Webpack's built-in watch.
* `npm run prod` to build minified.

## Github Pages

This model is currently implemented as a static model served by GitHub using gh-pages.

Express or another server could be easily implemented. It may or may not be coming soon.

The ASX repo has additional models you can view in a similar way:
* [http://backspaces.github.io/asx/models?diffuse](http://backspaces.github.io/asx/models?diffuse)

