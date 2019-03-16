var path = require('path');

module.exports = {
    entry: './src/index.ts',
    target: "node",
    devtool: 'source-map',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    resolve: {
        extensions: ['.ts', '.js'] //resolve all the modules other than index.ts
    },
    module: {
        rules: [
            {
                use: 'ts-loader',
                test: /\.ts?$/
            }
        ]
    },
}
