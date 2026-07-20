const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { container } = require('webpack');

module.exports = {
  entry: './src/index.tsx',
  output: { path: path.resolve(__dirname, 'dist'), publicPath: 'auto', clean: true },
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
  module: { rules: [{ test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/ }, { test: /\.css$/, use: ['style-loader', 'css-loader'] }] },
  plugins: [
    new container.ModuleFederationPlugin({ name: 'shell', shared: { react: { singleton: true, requiredVersion: false }, 'react-dom': { singleton: true, requiredVersion: false } } }),
    new HtmlWebpackPlugin({ template: './src/index.html' }),
    new CopyPlugin({ patterns: [{ from: 'src/config.template.js', to: 'config.js' }] })
  ],
  devServer: { port: 3000, historyApiFallback: true, static: path.join(__dirname, 'dist') }
};
