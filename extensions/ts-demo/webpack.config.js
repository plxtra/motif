// #region requires
const path = require("path");
// #endregion requires

module.exports = {
    // #region entry
    entry: [
        path.resolve(__dirname, "src/index.ts"),
    ],
    // #endregion entry

    // #region output
    output: {
        filename: 'ts-demo.js',
        path: path.resolve(__dirname, 'dist/'),
    },
    // #endregion output

    // #region source-map
    devtool: 'source-map',
    // #endregion source-map

    // #region resolve
    resolve: {
        extensions: ['.ts', '.js'],
        symlinks: true,
    },
    // #endregion resolve

    // #region rules
    module: {
        rules: [
            {
                test: /.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        "configFile": "../tsconfig.json",
                    },
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
    // #endregion rules

    // // #region plugins
    // plugins: [
    //     new webpack.DefinePlugin({
    //         env: JSON.stringify(process.env)
    //     }),
    // ]
    // // #endregion plugins
};
