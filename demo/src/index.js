import chokidar from 'chokidar'
import fs from 'fs'
import postcss from 'postcss'
import precss from 'precss'
import scss from 'postcss-scss'
import ant from '..'
import calc from 'postcss-calc'

const watcher = chokidar.watch([
  'demo/css/in.scss',
  'demo/index.html'
], {
  ignored: /[\/\\]\./,
  persistent: true
})

const process = () => {
  const fileIn = fs.readFileSync('demo/css/in.scss', 'utf8')

  postcss([
    precss,
    ant,
    calc
  ]).process(fileIn, {
    parser: scss
  }).then(result => {
    fs.writeFile('demo/css/out.css', result.css, (err) => {
      if (err) throw err
    })
  })
}

process()

watcher.on('change', path => {
  process()
})
