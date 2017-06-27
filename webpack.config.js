const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './app/main.jsx',

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
              plugins: ['transform-react-jsx', 'transform-class-properties'],
            },
          },
        ],
      },
    ],
  },

  resolve: {
    // 解析模块请求的选项
    // （不适用于对 loader 解析）

    modules: [
      'node_modules',
      path.resolve(__dirname, 'app'),
    ],
    // 用于查找模块的目录

    extensions: ['.js', '.json', '.jsx', '.css'],
    // 使用的扩展名
  },

  devtool: 'source-map',

  context: __dirname,

  target: 'web',

  devServer: {
    contentBase: path.join(__dirname, 'public'),
    hot: false,
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: 'app/template.html',
    }),
  ],
  // 附加插件列表

}
