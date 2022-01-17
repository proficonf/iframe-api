const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (_, argv) => {
    const isTesting = process.env.BABEL_ENV === 'test';
    const isDev = process.env.NODE_ENV === 'development';

    const config = {
        entry: isTesting
            ? glob.sync(__dirname + '/spec/**/*.spec.js')
            : {
                'iframe-api': './src/index.js',
            },
        mode: 'development',
        devtool: isDev 
            ? 'inline-source-map'
            : false,
        output: {
            path: path.resolve(__dirname, 'dist'),
            publicPath: '/',
            filename: '[name].js',
            library: 'Proficonf',
            libraryTarget: 'umd',
            globalObject: 'this',
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
        module: {
            rules: isTesting
                ? []
                : [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env']
                            }
                        }
                    }
                ]
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            port: 9001
        },
        cache: false,
        optimization: {
            removeAvailableModules: true,
            removeEmptyChunks: true,
            splitChunks:  false,
            minimize: !isTesting,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    extractComments: true,
                })
            ],

        }
    };

    return config;
};
