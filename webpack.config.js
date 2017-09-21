//ref: https://www.youtube.com/watch?v=soI7X-7OSb4

const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const sDist = path.resolve(__dirname, 'dist')

module.exports = {
    entry: './src/app.js',
    output: {
        path: sDist,
        filename: 'app.bundle.js'
    },
    devServer: {
        contentBase: sDist
    },
    plugins: [
    new HtmlWebpackPlugin({
            template: './src/index.html'
        })
  ],
    resolve: {
        modules: [
            path.resolve('./node_modules/asx-abm/dist'),
            path.resolve('./node_modules')
          ]
    }
}