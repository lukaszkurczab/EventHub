const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = (_environment, argv = {}) => ({
  entry: './src/index.ts',
  output: { path: path.resolve(__dirname, 'dist'), publicPath: 'auto', clean: true },
  resolve: { extensions: ['.ts', '.js'] },
  module: { rules: [{ test: /\.ts$/, loader: 'ts-loader', exclude: /node_modules/ }, { test: /\.css$/, use: ['style-loader', 'css-loader'] }] },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new CopyPlugin({ patterns: [{ from: argv.mode === "development" ? "src/config.local.js" : "src/config.template.js", to: "config.js" }] })
  ],
  devServer: { port: 3000, historyApiFallback: true, static: path.join(__dirname, "dist") }
});
