module.exports = {
  entry: './demo/js/components/App.js',

  output: {
    path: __dirname + '/demo/js',
    filename: 'bundle.js'
  },

  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel',
        query: {
          presets: [
            'react'
          ]
        }
      }
    ]
  },

  node: {
    fs: 'empty'
  },

  watch: true
}
