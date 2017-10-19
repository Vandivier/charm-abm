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
1. webpack-dev-server doesn't currently work with static externals. Instead, `cp` with bash to build and serve via Express.
1. patch and turtle breeds are wonky within asx, and non-binding. Using POJOs is easier and more semantic.

## Model Issues
1. Years of experience does not give a premium
1. Education, intelligence, and skills are not multi-specific
1. People don't form families, have children, or die
1. Education is a boolean
1. There is only one consumption good
1. People only have leisure, time, and consumption preference
1. Savings and investment are exogenous and homogenous
1. Home, job, and school locations are iird
1. Seed values are largely exogenous and arbitrary
1. Capital doesn't really exist
1. Form organization and processes are ignored
1. Diminishing marginal values are nowhere
1. Curiosity is exogenous and random
