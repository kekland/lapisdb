var path = require('path');
var TypedocWebpackPlugin = require('typedoc-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    target: "node",
    devtool: 'source-map',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
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
    plugins: [
        new TypedocWebpackPlugin({
            name: 'Sirano',
            mode: 'file',
            includeDeclarations: false,
            module: 'commonjs',
            target: 'es6',
            esModuleInterop: true,
            out: './docs'
        }, './src')
    ]
}
