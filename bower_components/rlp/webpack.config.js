module.exports = {
  entry: './index.js',
  output: {
    filename: './dist/rlp.js',
    libraryTarget: 'var',
    library: 'rlp',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
};
