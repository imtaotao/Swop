const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
	entry: __dirname + "/test/d_test.ts",
  output: {
    path: __dirname,
    filename: "bundle.js",
  },
  resolve: {
    extensions: ['.js', '.ts', '.json'],
  },
  devtool: 'source-map',
  devServer: {
      contentBase: __dirname,
      historyApiFallback: true,
      inline: true,
      hot: true,
      stats: "errors-only",
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        use: {
          loader: "babel-loader",
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(ts)?$/,
        use: [
          'babel-loader',
          'ts-loader',
        ],
        exclude: /node_modules/,
      },
    ]
  },
	plugins: [
    new webpack.BannerPlugin('Swop'),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
	],
}