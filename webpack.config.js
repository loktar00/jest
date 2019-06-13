var path = require('path');

module.exports = {
    entry: './src/index.js',
    mode: 'development', // | 'production' | 'none'
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    devtool: 'source-map',
    devServer: {
        contentBase: [path.join(__dirname, '/dist'), path.join(__dirname, '/assets')],
        compress: true,
        port: 8000,
        writeToDisk: true
    },
    output: {
        filename: 'index.js',
        path: `${__dirname}/dist`,
    }
};
