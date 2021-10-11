/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const srcDir = './src/';

module.exports = {
  entry: {
    popup: path.join(__dirname, srcDir + 'popup.ts'),
    background: path.join(__dirname, srcDir + 'background.ts'),
  },

  output: {
    path: path.join(__dirname, './dist/'),
    filename: '[name].js',
  },

  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks: 'initial',
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },

  plugins: [
    new CopyPlugin({
      patterns: [{ from: '.', to: './', context: 'public' }],
      options: {},
    }),
  ],
};
