const webpack = require('webpack');

module.exports = {
  devtool: 'inline-source-map',

  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: { presets: ['es2015'] },
    }],
  },

  plugins: [
    new webpack.NoErrorsPlugin(),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //     drop_console: true,
    //     drop_debugger: true,
    //     unused: true,
    //     collapse_vars: true,
    //   },
    // }),
  ],
};
