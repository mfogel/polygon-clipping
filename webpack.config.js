var path = require('path')

module.exports = {
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'polygon-clipping.js',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    library: 'polygon-clipping',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}
