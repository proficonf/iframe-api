const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        'iframe-api': './src/index.js',
        'example': './example/index.js'
    },
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
        library: 'Proficonf',
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Proficonf Embedded Room Example',
            template: './example/index.html'
        })
    ],
    resolve: {
        extensions: ['.js']
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 9000
    },
    cache: false
};