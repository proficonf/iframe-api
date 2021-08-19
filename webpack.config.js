const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        'iframe-api': './src/index.js'
    },
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
        library: ['Proficonf', 'ProficonfIframeApi'],
        libraryTarget: 'umd',
        globalObject: 'this'
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Proficonf Embedded Room Example',
            template: 'example.html'
        })
    ],
    resolve: {
        extensions: ['.js']
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: false,
        port: 9000
    },
    cache: false
};