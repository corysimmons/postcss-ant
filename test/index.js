import fs from 'fs'
import postcss from 'postcss'
import ant from '..'
import test from 'ava'
import precss from 'precss'
import scss from 'postcss-scss'
import calc from 'postcss-calc'

const fileIn = fs.readFileSync('../demo/css/in.scss', 'utf8')

postcss([
  precss,
  ant,
  calc
]).process(fileIn, {
  parser: scss
}).then(result => {
  const expected = fs.readFileSync('../demo/css/expected.css', 'utf8')
  test(t => {
    t.deepEqual(result.css, expected)
  })
})
