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
            'es2015',
            'stage-0',
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
