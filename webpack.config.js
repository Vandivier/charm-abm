//ref: https://www.youtube.com/watch?v=soI7X-7OSb4

'use strict'

const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const sDist = path.resolve(__dirname, 'dist')

module.exports = {
    entry: [
        path.resolve(__dirname, 'src/app.js')
    ],
    output: {
        path: sDist,
        filename: 'app.bundle.js'
    },
    devServer: {
        contentBase: sDist,
        port: 8080
    },
    plugins: [
    new HtmlWebpackPlugin({
            template: './src/index.html'
        })
  ]
}
