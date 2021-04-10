const path = require('path');
const webpack = require('webpack');

const buildPath = path.resolve(__dirname, 'dist');

const server = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: [
          'ts-loader',
          'eslint-loader'
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'server.js',
    path: buildPath
  },
  target: 'node',
};

module.exports = server;
