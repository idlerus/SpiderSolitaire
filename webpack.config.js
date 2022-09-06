const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  context: __dirname,
  entry: {
    soli: './src/soli.ts',
    soliBoot: './src/soliBoot.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Soli',
    libraryTarget: "umd",
    globalObject: "this",
    umdNamedDefine: true,
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.s?[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'test.html',
      template: 'src/test.html',
      chunks: ['soliBoot']
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    }
  }
};
