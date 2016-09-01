import postcss from 'postcss'
import chalk from 'chalk'

const ant = postcss.plugin('postcss-ant', (options = {}) => {
  return (css) => {
    // Assign global setting defaults.
    let globalGutter = options.gutter || '30px'
    let globalGridType = options.type || 'nth'

    // Did the user specify global settings?
    css.walkAtRules(rule => {
      if (rule.name === 'ant-gutter') {
        globalGutter = rule.params
      }

      if (rule.name === 'ant-type') {
        globalGridType = rule.params
      }
    })

    // Check every declaration for ant(...)[x].
    // Syntax: ant(sizes, [gutter], [grid type])[1-based index]
    css.walkDecls(decl => {
      if (decl.value.match(/^ant\(([^]*?)\)\s*\[(.*)\]$/)) {
        let gutter = globalGutter
        let gridType = globalGridType

        // Catch/assign args.
        const matches = decl.value.match(/^ant\(([^]*?)\)\s*\[(.*)\]$/)
        const parenArgs = postcss.list.comma(matches[1])
        const sizes = parenArgs[0].split(/\s+/)
        const antIndex = Number(matches[2].trim()) - 1

        if (!sizes[antIndex]) {
          console.log(`
---------------------------------------------------------------------------

${chalk.red.underline('ant error')}: [${chalk.red(matches[2])}] isn't a valid index in:

${decl.parent.selector} {
  ${decl};
}

Remember the indexes are 1-based, not 0-based like you're probably used to.
Try ant(${matches[1]})[${chalk.green(matches[2] - 1)}] instead.

If you're pretty sure you're doing everything right, please file a bug at:
https://github.com/corysimmons/postcss-ant/issues/new

---------------------------------------------------------------------------

          `)
        }

        // Assign regex for mapping.
        const units = /em$|ex$|%$|px$|cm$|mm$|in$|pt$|pc$|ch$|rem$|vh$|vw$|vmin$|vmax$/
        const gridTypes = /^nth$|^negative-margin$/
        const resultTypes = /^offset$|^offset-big$|^offset-small$|^move$/

        let resultType = null

        // Overwrite global settings if local settings are defined.
        parenArgs.map(arg => {
          if (arg !== parenArgs[0]) {
            if (arg.match(gridTypes)) {
              gridType = arg
            } else if (arg.match(resultTypes)) {
              resultType = arg
            } else if (arg.match(units) || arg.match(/0/)) {
              gutter = arg
            }
          }
        })

        // Set gutter to false if it is 0. This lets us do things like `if (gutter) ...` while still having access to `${gutter}`.
        if (parseInt(gutter, 10) === 0) {
          gutter = 0
        }

        // Sort sizes into fixed and fraction arrays, and count number of autos.
        let fixedArr = []
        let fracArr = []
        let numAuto = 0
        sizes.forEach(size => {
          if (size.match(units)) {
            fixedArr.push(size)
          } else if (size.match(/\/|\./)) {
            fracArr.push(size)
          } else if (size.match(/auto/)) {
            numAuto += 1
          }
        })

        // Get the sum of all the fixed numbers.
        const numFixed = fixedArr.length
        let sumFixed = ''
        if (numFixed === 1) {
          sumFixed = `${fixedArr.join(' + ')}`
        } else if (numFixed > 1) {
          sumFixed = `(${fixedArr.join(' + ')})`
        } else {
          sumFixed = 0
        }

        // Get the sum of all the fractions.
        const numFrac = fracArr.length
        let sumFrac = ''
        if (numFrac > 0) {
          sumFrac = `(${fracArr.join(' + ')})`
        } else {
          sumFrac = 0
        }

        // Alias sizes[index] to val because it's shorter.
        const val = sizes[antIndex]

        // Section: Conditional Math Hell -- Abandon all hope, ye who enter here...

        // val is a fixed number
        if (val.match(units)) {
          if (gutter) {
            switch (gridType) {
              // nth grids
              case 'nth':
                switch (resultType) {
                  case 'offset-big':
                    decl.value = `calc(${val} + (${gutter} * 2))`
                    break
                  case 'offset-small':
                  case 'move':
                    decl.value = `calc(${val} + ${gutter})`
                    break
                  default:
                    decl.value = val
                }
                break

              // negative-margin grids
              case 'negative-margin':
                switch (resultType) {
                  case 'offset':
                    decl.value = `calc(${val} + (${gutter} * 1.5))`
                    break
                  case 'move':
                    decl.value = `calc(${val} + ${gutter})`
                    break
                  default:
                    decl.value = val
                }
                break

              default:
                console.log(`
  ---------------------------------------------------------------------------

  ${chalk.red.underline('ant error')} 1

  Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new

  ---------------------------------------------------------------------------

                `)
            }
            return
          } else {
            // gutless
            decl.value = `${val}`
            return
          }
        }

        // val is a fraction
        if (val.match(/\/|\./)) {
          // fraction(s) only
          if (numFrac > 0 && numFixed === 0 && numAuto === 0) {
            if (gutter) {
              switch (gridType) {
                // nth grids
                case 'nth':
                  switch (resultType) {
                    case 'offset-big':
                      decl.value = `calc(99.99% * ${val} - (${gutter} - ${gutter} * ${val}) + (${gutter} * 2))`
                      break
                    case 'offset-small':
                    case 'move':
                      decl.value = `calc(99.99% * ${val} - (${gutter} - ${gutter} * ${val}) + ${gutter})`
                      break
                    default:
                      decl.value = `calc(99.99% * ${val} - (${gutter} - ${gutter} * ${val}))`
                  }
                  break

                // negative-margin grids
                case 'negative-margin':
                  switch (resultType) {
                    case 'offset':
                      decl.value = `calc(99.99% * ${val} + (${gutter} / 2))`
                      break
                    case 'move':
                      decl.value = `calc(99.99% * ${val})`
                      break
                    default:
                      decl.value = `calc(99.99% * ${val} - ${gutter})`
                  }
                  break

                default:
                  console.log(`
---------------------------------------------------------------------------

${chalk.red.underline('ant error')} 2

Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new

---------------------------------------------------------------------------

                  `)
              }
              return
            } else {
              // gutless
              decl.value = `calc(99.999999% * ${val})`
              return
            }
          }

          // fraction(s) and fixed number(s) only
          if (numFrac > 0 && numFixed > 0 && numAuto === 0) {
            if (gutter) {
              switch (gridType) {
                // nth grids
                case 'nth':
                  switch (resultType) {
                    case 'offset-big':
                      decl.value = `calc((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val} - (${gutter} - ${gutter} * ${val}) + (${gutter} * 2))`
                      break
                    case 'offset-small':
                    case 'move':
                      decl.value = `calc((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val} - (${gutter} - ${gutter} * ${val}) + ${gutter})`
                      break
                    default:
                      decl.value = `calc((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val} - (${gutter} - ${gutter} * ${val}))`
                  }
                  break

                // negative-margin grids
                case 'negative-margin':
                  switch (resultType) {
                    case 'offset':
                      decl.value = `calc(99.99% * ${val} + (${gutter} / 2))`
                      break
                    case 'move':
                      decl.value = `calc((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val})`
                      break
                    default:
                      decl.value = `calc((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val} - ${gutter})`
                  }
                  break

                default:
                  console.log(`
--------------------------------------------------------------------------

${chalk.red.underline('ant error')} 3

Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new

--------------------------------------------------------------------------

                  `)
              }
              return
            } else {
              // gutless
              decl.value = `calc((99.999999% - ${sumFixed}) * ${val})`
              return
            }
          }

          // fraction(s) and auto(s) only
          if (numFrac > 0 && numAuto > 0 && numFixed === 0) {
            if (gutter) {
              switch (gridType) {
                // nth grids
                case 'nth':
                  switch (resultType) {
                    case 'offset-big':
                      decl.value = `calc((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val} - (${gutter} - ${gutter} * ${val}) + (${gutter} * 2))`
                      break
                    case 'offset-small':
                    case 'move':
                      decl.value = `calc((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val} - (${gutter} - ${gutter} * ${val}) + ${gutter})`
                      break
                    default:
                      decl.value = `calc(99.99% * ${val} - (${gutter} - ${gutter} * ${val}))`
                  }
                  break

                // negative-margin grids
                case 'negative-margin':
                  switch (resultType) {
                    case 'offset':
                      decl.value = `calc(99.99% * ${val} + (${gutter} / 2))`
                      break
                    case 'move':
                      decl.value = `calc((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val})`
                      break
                    default:
                      decl.value = `calc(99.99% * ${val} - ${gutter})`
                  }
                  break

                default:
                  console.log(`
--------------------------------------------------------------------------

${chalk.red.underline('ant error')} 4

Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new

--------------------------------------------------------------------------

                  `)
              }
              return
            } else {
              // gutless
              decl.value = `calc(99.999999% * ${val})`
              return
            }
          }

          // // fraction(s) and auto(s) only
          // if (numFrac > 0 && numAuto > 0 && numFixed === 0) {
          //   if (gutter) {
          //     if (gridType === 'nth') {
          //       decl.value = `calc(99.99% * ${val} - (${gutter} - ${gutter} * ${val}))`
          //       return
          //     }
          //     if (gridType === 'negative-margin') {
          //       decl.value = `calc(99.99% * ${val} - ${gutter})`
          //       return
          //     }
          //   } else {
          //     decl.value = `calc(99.999999% * ${val})`
          //     return
          //   }
          // }

          // fraction(s), fixed number(s), and auto(s)
          if (numFrac > 0 && numFixed > 0 && numAuto > 0) {
            if (gutter) {
              if (gridType === 'nth') {
                decl.value = `calc((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val} - (${gutter} - ${gutter} * ${val}))`
                return
              }
              if (gridType === 'negative-margin') {
                decl.value = `calc((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${val} - ${gutter})`
                return
              }
            } else {
              decl.value = `calc((99.999999% - ${sumFixed}) * ${val})`
              return
            }
          }
        }

        // val is auto
        if (val.match(/auto/)) {
          // auto(s) only
          if (numAuto > 0 && numFrac === 0 && numFixed === 0) {
            if (gutter) {
              if (gridType === 'nth') {
                decl.value = `calc((99.99% - ((${numAuto} - 1) * ${gutter})) / ${numAuto})`
                return
              }
              if (gridType === 'negative-margin') {
                decl.value = `calc((99.99% - ((${numAuto}) * ${gutter})) / ${numAuto})`
                return
              }
            } else {
              decl.value = `calc(99.999999% / ${numAuto})`
              return
            }
          }

          // auto(s) and fixed number(s) only
          if (numAuto > 0 && numFixed > 0 && numFrac === 0) {
            if (gutter) {
              if (gridType === 'nth') {
                decl.value = `calc((99.99% - ${sumFixed} - ((${numFixed} + ${numAuto} - 1) * ${gutter})) / ${numAuto})`
                return
              }
              if (gridType === 'negative-margin') {
                decl.value = `calc((99.99% - ${sumFixed} - ((${numFixed} + ${numAuto}) * ${gutter})) / ${numAuto})`
                return
              }
            } else {
              decl.value = `calc((99.999999% - ${sumFixed}) / ${numAuto})`
              return
            }
          }

          // auto(s) and fraction(s) only
          if (numAuto > 0 && numFrac > 0 && numFixed === 0) {
            if (gutter) {
              if (gridType === 'nth') {
                decl.value = `calc(((99.99% - (99.99% * ${sumFrac} - (${gutter} - ${gutter} * ${sumFrac}))) / ${numAuto}) - ${gutter})`
                return
              }
              if (gridType === 'negative-margin') {
                decl.value = `calc(((99.99% - (99.99% * ${sumFrac})) / ${numAuto}) - ${gutter})`
                return
              }
            } else {
              decl.value = `calc((99.999999% - (99.999999% * ${sumFrac})) / ${numAuto})`
              return
            }
          }

          // auto(s), fraction(s), and fixed number(s)
          if (numAuto > 0 && numFrac > 0 && numFixed > 0) {
            if (gutter) {
              if (gridType === 'nth') {
                decl.value = `calc((99.99% - ((${sumFixed} + (${gutter} * ${numFixed})) + ((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${sumFrac} - (${gutter} - ${gutter} * ${sumFrac}))) - (${gutter} * ${numAuto})) / ${numAuto})`
                return
              }
              if (gridType === 'negative-margin') {
                decl.value = `calc((99.99% - ((${sumFixed} + (${gutter} * ${numFixed})) + ((99.99% - (${sumFixed} + (${gutter} * ${numFixed}))) * ${sumFrac} - (${gutter} * ${numFrac}))) - (${gutter} * ${numAuto})) / ${numAuto} - ${gutter})`
                return
              }
            } else {
              decl.value = `calc((99.999999% - (${sumFixed} + ((99.999999% - ${sumFixed}) * ${sumFrac}))) / ${numAuto})`
              return
            }
          }
        }
      }
    })
  }
})

export default ant
