const path = require('path');

module.exports = {
  entry: {
    'signature': [ './src/index.ts' ]
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
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].min.js',
    library: {
      name: 'signature',
      type: 'var',
    },
  },
  target: ['web', 'es5'],
};