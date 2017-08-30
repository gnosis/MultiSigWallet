module.exports = {
  entry: './src/index.js',
  output: {
    filename: './dist/ledgerwallet.js',
    libraryTarget: 'var',
    library: 'ledgerwallet',
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
