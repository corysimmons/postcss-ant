import React from 'react'
import ReactDOM from 'react-dom'

import Grid from './Grid'

class App extends React.Component {
  render() {
    return (
      <div>
        <Grid greeting="hi" />
        <Grid greeting="hello" />
        <Grid greeting="hola" />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))
