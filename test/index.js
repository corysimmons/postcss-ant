import test from 'ava'
import fs from 'fs'
import path from 'path'
import postcss from 'postcss'
import ant from '../build'

function eq (description) {
  test(description, t => {
    t.deepEqual(
      fs.readFileSync(path.resolve(`../test/visual/${description}/lock.css`), 'utf8'),

      postcss()
        .use(ant)
        .process(fs.readFileSync(path.resolve(`../test/visual/${description}/out.css`), 'utf8'))
        .css
    )
  })
}

// 1. Make a well-named (e.g. technique/type--modifier) demo work/visually look good. Prefix it with _ until it works as expected, then remove prefix.
// 2. Manually copy final.css to lock.css.
// 3. Make one of these tests with the path of the demo.
// Note: Keep these grouped in technique order. Otherwise AVA craps bed.

eq('nth/fixed-only--with-gutter')
eq('nth/fixed-only--without-gutter')
eq('nth/fractions-only--with-gutter')
eq('nth/fractions-only--without-gutter')

eq('negative-margin/fixed-only--with-gutter')
eq('negative-margin/fixed-only--without-gutter')
