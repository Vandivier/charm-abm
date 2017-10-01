# Summary

Charm ABM is my third attempt to build an agent based model of education.

The current implementation leverages ASX and Webpack.

## Developer Information
* `git clone`
* `npm install` with Git Bash or similar. Doesn't work with cmd.
* `npm start`
* open [http://localhost:3000/](http://localhost:3000/) in your favorite browser rhyming with frome.

You may need to install install [node-gyp](https://github.com/nodejs/node-gyp) before `npm install`

## Github Pages

This model is currently implemented as a static model served by GitHub using gh-pages.

Express or another server could be easily implemented. It may or may not be coming soon.

The ASX repo has additional models you can view in a similar way:
* [http://backspaces.github.io/asx/models?diffuse](http://backspaces.github.io/asx/models?diffuse)

# TODO
* [Nuxtify](https://github.com/nuxt-community/express-template)

# Lessons Learned
* webpack-dev-server doesn't currently work with static externals. Instead, `cp` with bash to build and serve via Express.
