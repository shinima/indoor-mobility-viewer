const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MinifyPlugin = require('babel-minify-webpack-plugin')

module.exports = env => {
  env = env || {}
  const isProduction = env.prod
  return {
    entry: ['react-hot-loader/patch', './app/main.tsx'],

    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProduction ? 'indoor-mobility-viewer.[chunkhash:6].js' : 'bundle.js',
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

    devtool: isProduction ? false : 'source-map',

    context: __dirname,

    target: 'web',

    devServer: {
      contentBase: __dirname,
      hot: true,
    },

    plugins: [
      new webpack.NamedModulesPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      }),
      new HtmlWebpackPlugin({
        filename: isProduction ? 'indoor-mobility-viewer.html' : 'index.html',
        template: 'app/template.html',
      }),
    ].concat(isProduction ? [
      new MinifyPlugin(undefined, { comments: false }),
    ] : [
      new webpack.HotModuleReplacementPlugin(),
    ]),
  }
}
