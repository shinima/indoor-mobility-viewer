const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['react-hot-loader/patch', './app/main.tsx'],

  output: {
    path: path.resolve(__dirname, 'build'),
    publicPath: '/',
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.ya?ml/,
        loaders: ['json-loader', 'yaml-loader'],
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.styl$/,
        loaders: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.json', '.css', '.ts', '.tsx'],
  },

  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',

  context: __dirname,

  target: 'web',

  devServer: {
    contentBase: __dirname,
    hot: true,
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new HtmlWebpackPlugin({
      template: 'app/template.html',
    }),
  ],
}
