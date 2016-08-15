// postcss-raw
// template literals so preprocessors stfu and pass shit on to postcss plugins.
import postcss from 'postcss'

const raw = postcss.plugin('postcss-raw', () => {
  return (css) => {
    console.log(css)
  }
})

export default raw
