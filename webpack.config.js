const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: ['react-hot-loader/patch', './app/main.jsx'],

  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.styl$/,
        loaders: ['style-loader', 'css-loader', 'stylus-loader'],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: [
                'transform-react-jsx',
                'transform-class-properties',
                'transform-decorators-legacy',
              ],
            },
          },
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.json', '.jsx', '.css'],
  },

  devtool: 'source-map',

  context: __dirname,

  target: 'web',

  devServer: {
    contentBase: __dirname,
    hot: true,
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      template: 'app/template.html',
    }),
  ],
}
