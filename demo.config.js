module.exports = {
  devtool: 'source-map',
  entry: './demo/js/App.js',
  output: {
    filename: 'demo.js',
    path: __dirname + '/demo'
  },
  watch: true,
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
          ],
          plugins: [
            'transform-react-stateless-component-name'
          ]
        }
      }
    ]
  }
}
