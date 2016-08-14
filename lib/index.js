import postcss from 'postcss'

// ant
const ant = postcss.plugin('postcss-ant', () => {
  return (css) => {
    // Stash atRule gutter (global gutter) for later.
    let globalGutter = ''
    css.walkAtRules(rule => {
      if (rule.name === 'ant-gutter') {
        globalGutter = rule.params
      }
    })

    css.walkDecls(decl => {
      console.log(decl.value.split(/,/))

      // If declaration's value begins with `ant(`.
      if (decl.value.match(/^ant\(/)) {
        // Section: Define sizes and gutter.
        let gutter = '30px'

        // Set as local gutter if it exists. No need to set global gutter if local is set.
        if (decl.value.match(/,/)) {
          gutter = decl.value.split(/,/)[1]
          gutter = gutter.split(/\)\[/)[0].trim()
        // Set global gutter to whatever the atRule gutter was earlier.
        } else if (globalGutter.length) {
          gutter = globalGutter
        }

        // Set gutter to false if it doesn't exist, this lets us do things like `if (gutter) ...`.
        if (parseInt(gutter, 10) === 0) {
          gutter = false
        }

        // Section: Get the sizes and put them in an array.
        // If no local gutter, just grab the string between `ant(` and `)[`.
        let sizes = ''

        // If there is no local gutter, grab sizes string and convert to array.
        if (!decl.value.match(/,/)) {
          // Grab everything after `ant(`.
          sizes = decl.value.split(/^ant\(/)[1]
          // Grab everything before `)[`. This should leave a string of space separated sizes.
          sizes = sizes.split(/\)\[/)[0].trim()
        // If local gutter, grab the string between `ant(` and the comma, then convert to array.
        } else {
          // Grab everything after `ant(`.
          sizes = decl.value.split(/^ant\(/)[1]
          // Drop the local gutter.
          sizes = sizes.split(/,/)[0].trim()
        }

        // Convert sizes string to an array.
        sizes = sizes.split(' ')

        // Section: Grab the index.
        const index = parseInt(decl.value.match(/\[(.*)\]/)[1].trim(), 10) - 1

        // Sort sizes into arrays.
        const units = /em|ex|%|px|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax/
        let fixedArr = []
        let fracArr = []
        let numAuto = 0
        sizes.forEach((size) => {
          if (size) {
            if (size.match(units)) {
              fixedArr.push(size)
            } else if (size.match(/\/|\./)) {
              fracArr.push(size)
            } else if (size.match(/auto/)) {
              numAuto += 1
            }
          }
        })

        const numFixed = fixedArr.length
        let sumFixed = ''
        if (numFixed === 1) {
          sumFixed = `${fixedArr.join(' + ')}`
        } else if (numFixed > 1) {
          sumFixed = `(${fixedArr.join(' + ')})`
        } else {
          sumFixed = 0
        }

        const numFrac = fracArr.length
        let sumFrac = ''
        if (numFrac > 0) {
          sumFrac = `(${fracArr.join(' + ')})`
        } else {
          sumFrac = 0
        }

        // Alias sizes[index] to val because it's shorter.
        const val = sizes[index]

        // val is a fixed number, we don't need to go any further.
        if (val.match(units)) {
          decl.value = sizes[index]
          return
        }

        // Section: Conditional Math Hell -- Abandon all hope, ye who enter here...

        // val is a fraction
        if (val.match(/\/|\./)) {
          // fraction(s) only
          if (numFrac > 0 && numFixed === 0 && numAuto === 0) {
            if (gutter) {
              decl.value = `calc(100% * ${val} - (${gutter} - ${gutter} * ${val}))`
              return
            } else {
              decl.value = `calc(100% * ${val})`
              return
            }
          }

          // fraction(s) and fixed number(s) only
          if (numFrac > 0 && numFixed > 0 && numAuto === 0) {
            if (gutter) {
              decl.value = `calc((100% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val} - (${gutter} - ${gutter} * ${val}))`
              return
            } else {
              decl.value = `calc(100% * ${val} - ${sumFixed})`
              return
            }
          }

          // fraction(s) and auto(s) only
          if (numFrac > 0 && numAuto > 0 && numFixed === 0) {
            if (gutter) {
              decl.value = `calc(100% * ${val} - (${gutter} - ${gutter} * ${val}))`
              return
            } else {
              decl.value = `calc(100% * ${val})`
              return
            }
          }

          // fractions(s), fixed number(s), and auto(s)
          if (numFrac > 0 && numFixed > 0 && numAuto > 0) {
            if (gutter) {
              decl.value = `calc((100% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val} - (${gutter} - ${gutter} * ${val}))`
              return
            } else {
              decl.value = `calc((100% - ${sumFixed}) * ${val})`
              return
            }
          }
        }

        // val is auto
        if (val.match(/auto/)) {
          // auto(s) only
          if (numAuto > 0 && numFrac === 0 && numFixed === 0) {
            if (gutter) {
              decl.value = `calc((100% - ((${numAuto} - 1) * ${gutter})) / ${numAuto})`
              return
            } else {
              decl.value = `calc(100% / ${numAuto})`
              return
            }
          }

          // auto(s) and fixed number(s) only
          if (numAuto > 0 && numFixed > 0 && numFrac === 0) {
            if (gutter) {
              decl.value = `calc((100% - ${sumFixed} - ((${numFixed} + ${numAuto} - 1) * ${gutter})) / ${numAuto})`
              return
            } else {
              decl.value = `calc((100% - ${sumFixed}) / ${numAuto})`
              return
            }
          }

          // auto(s) and fraction(s) only
          if (numAuto > 0 && numFrac > 0 && numFixed === 0) {
            if (gutter) {
              decl.value = `calc(((100% - (100% * ${sumFrac} - (${gutter} - ${gutter} * ${sumFrac}))) / ${numAuto}) - ${gutter})`
              return
            } else {
              decl.value = `calc((100% - (100% * ${sumFrac})) / ${numAuto})`
              return
            }
          }

          // auto(s), fraction(s), and fixed number(s)
          if (numAuto > 0 && numFrac > 0 && numFixed > 0) {
            if (gutter) {
              decl.value = `calc((100% - ((${sumFixed} + (${gutter} * ${numFixed})) + ((100% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${sumFrac} - (${gutter} - ${gutter} * ${sumFrac}))) - (${gutter} * ${numAuto})) / ${numAuto})`
              return
            } else {
              decl.value = `calc((100% - (${sumFixed} + ((100% - ${sumFixed}) * ${sumFrac}))) / ${numAuto})`
              return
            }
          }
        }
      }
    })
  }
})

export default ant
