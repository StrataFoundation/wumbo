const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const path = require("path");
const webpack = require("webpack");

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new SentryCliPlugin({
      include: path.resolve("./dist"),
      ignoreFile: '.sentrycliignore',
      ignore: ['node_modules', 'webpack.common.js', 'webpack.dev.js', 'webpack.prod.js'],
      configFile: 'sentry.properties',
      org: 'wumbo-inc',
      project: 'wumbo-inc'
    }),
  ]
});
