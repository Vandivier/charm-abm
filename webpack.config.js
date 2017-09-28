//ref: https://www.youtube.com/watch?v=soI7X-7OSb4

'use strict'

const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const sDist = path.resolve(__dirname, 'dist')

module.exports = {
    entry: [
        'webpack-dev-server/client?http://' + require('ip').address() + ':5000/', // ref: https://github.com/webpack/webpack-dev-server/issues/416, 5000 matches webpack-dev-server.js
        path.resolve(__dirname, 'src/app.js')
    ],
    output: {
        path: sDist,
        filename: 'app.bundle.js'
    },
    devServer: {
        contentBase: sDist,
        proxy: {
            '/static': '/src/static'
        }
    },
    plugins: [
    new HtmlWebpackPlugin({
            template: './src/index.html'
        })
  ]
}
