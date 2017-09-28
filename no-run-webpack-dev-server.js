// TODO: is it really just for DEV? can it not merge w/ Express config @ ./bin/www

const express = require('express')

const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./webpack.config.js');

const options = {
  //hot: true,// TODO: enable. ref: https://www.ctheu.com/2015/05/14/using-react-hot-loader-with-a-webpack-dev-server-and-a-node-server/
  stats: {
    colors: true
  },
  before(app) {
    app.use('/src/static', express.static('static'));
  }
};

webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);

server.listen(5000, () => {
  console.log('dev server listening on port 5000');
});
