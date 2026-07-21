const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { container } = require("webpack");
module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
    clean: true,
  },
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
    ],
  },
  plugins: [
    new container.ModuleFederationPlugin({
      name: "hostDashboard",
      filename: "remoteEntry.js",
      exposes: { "./App": "./src/app.tsx" },
      shared: {
        react: { singleton: true, requiredVersion: "^18.3.1", strictVersion: true },
        "react-dom": { singleton: true, requiredVersion: "^18.3.1", strictVersion: true },
      },
    }),
    new HtmlWebpackPlugin({ template: "./src/index.html" }),
  ],
  devServer: {
    port: 3002,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
    static: path.join(__dirname, "dist"),
  },
};
