import test from 'ava'
import postcss from 'postcss'
import ant from '../build'
import fs from 'fs'

const lockTest = dirPath => {
  test(dirPath, async t => {
    // const dirPath/locked.css contents
    const locked = new Promise((resolve, reject) => {
      fs.readFile(`./${dirPath}/locked.css`, 'utf8', (err, data) => {
        if (err) return reject(err)
        return resolve(data)
      })
    })

    // const parsed dirPath/style.css with postcss-ant
    const parsed = new Promise((resolve, reject) => {
      fs.readFile(`./${dirPath}/style.css`, 'utf8', (err, data) => {
        if (err) return reject(err)

        postcss([ant])
          .process(data)
          .then(result => {
            return resolve(result.css)
          })
          .catch(err => {
            return reject(err)
          })
      })
    })

    // Test equality of the two
    t.is(
      await locked,
      await parsed
    )
  })
}

// Explicitly defined tests so they can be commented-out/isolated if need be
lockTest('features/sizes/fixed')
lockTest('features/sizes/fractions')
lockTest('features/sizes/autos')
lockTest('features/sizes/fixed-fractions')
lockTest('features/sizes/fixed-autos')
lockTest('features/sizes/fractions-autos')

lockTest('features/gg/simple')
lockTest('features/gg/floats')
