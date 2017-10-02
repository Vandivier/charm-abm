# Summary

Charm ABM is my third attempt to build an agent based model of education.

The current implementation leverages ASX and Webpack.

## Developer Information
* `git clone`
* `npm install` with Git Bash or similar. Doesn't work with cmd.
* `npm start`
* open [http://localhost:3000/](http://localhost:3000/) in your favorite browser rhyming with frome.

You may need to install install [node-gyp](https://github.com/nodejs/node-gyp) before `npm install`

## Usage

Stop and start the model by clicking.

## TODO
* [Nuxtify](https://github.com/nuxt-community/express-template)
* [CI and test Cypress](https://docs.cypress.io/guides/guides/continuous-integration.html#)

## Lessons Learned
* webpack-dev-server doesn't currently work with static externals. Instead, `cp` with bash to build and serve via Express.
