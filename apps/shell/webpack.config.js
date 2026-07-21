const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { container } = require("webpack");

module.exports = (_environment, argv = {}) => ({
  entry: './src/index.tsx',
  output: { path: path.resolve(__dirname, 'dist'), publicPath: 'auto', clean: true },
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
  module: { rules: [{ test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ }, { test: /\.css$/, use: ['style-loader', 'css-loader'] }] },
  plugins: [
    new container.ModuleFederationPlugin({ name: "shell", shared: { react: { singleton: true, requiredVersion: "^18.3.1", strictVersion: true }, "react-dom": { singleton: true, requiredVersion: "^18.3.1", strictVersion: true } } }),
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
    new CopyPlugin({ patterns: [{ from: argv.mode === "development" ? "src/config.local.js" : "src/config.template.js", to: "config.js" }] })
  ],
  devServer: { port: 3000, historyApiFallback: true, static: path.join(__dirname, "dist") }
});
