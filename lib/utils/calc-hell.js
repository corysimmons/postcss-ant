// @flow
import valueParser from 'postcss-value-parser'

// This is where we:
//   1. Distribute all sizes to respective arrays
//   2. Reduce those arrays to single values (for cleaner formulas)
//   3. Return a clean calc formula (via string building functions) based on localOpts and the pluck index

export default (sizes: Array<string>, localOpts: {
  gutters: Array<string>,
  rounders: Array<string>,
  pluck: number,
  bump: string,
  technique: string,
  nth: string
}, node: {
  type: string,
  value: string,
  nodes: Array<{
    type: string,
    value: string
  }>
}): string => {
  // Stash function name and value if node exists
  let funcName: string = ''
  let value: string = ''
  if (node) {
    if (node.type === 'function') {
      // Name of the function
      funcName = node.value
      // Whatever the function contains
      value = valueParser.stringify(node.nodes)
    }
  }

  // Ensure bump() is a usable value
  if (localOpts.bump !== '') {
    localOpts.bump = localOpts.bump.trim()

    // Strip any quotes from bump
    if (/'|"/g.test(localOpts.bump)) {
      localOpts.bump = localOpts.bump.replace(/'|"/g, '')
    }

    // Put a space between operators in bump() if none exists. e.g. bump(+2px) turns into calc(... + 2px)
    const operatorRegexp = /(\+|-|\*|\/)(?=[^\s])/g
    if (operatorRegexp.test(localOpts.bump)) {
      localOpts.bump = localOpts.bump.replace(operatorRegexp, operator => `${operator} `)
    }
  }

  // Prep arrs for: fixed (any valid CSS length), fractions (which include decimals), fr (replacing auto)
  let fixeds: Array<string> = []
  let fractions: Array<string> = []
  let frs: Array<string> = []

  const fixedsRegexp = /em|ex|%|px$|cm|mm|in|pt|pc|ch|rem|vh|vw|vmin|vmax/
  const fractionsRegexp = /\/|\./
  const frsRegexp = /fr$/

  // Final return value
  let result: string = ''

  // Function to return the final calc formula
  function formula (formula) {
    if (localOpts.bump !== '' && fixedsRegexp.test(sizes[pluck])) {
      return `calc(${formula} ${localOpts.bump})`
    } else if (fixedsRegexp.test(sizes[pluck])) {
      return sizes[pluck]
    } else if (localOpts.bump !== '') {
      return `calc((${formula}) ${localOpts.bump})`
    } else {
      return `calc(${formula})`
    }
  }

  // Subtract 1 from pluck so it can be nth compatible (good for preprocessor looping), but easily interpolated in formulas.
  const pluck = localOpts.pluck - 1

  // Bail early if they're just serving a fixed number.
  if (fixedsRegexp.test(sizes[pluck])) {
    return result = formula(sizes[pluck])
  }

  // Organize fixed numbers, fractions/decimals, and fr units, to their own arrays.
  sizes.map(size => {
    fixedsRegexp.test(size) ? fixeds.push(size) : null
    fractionsRegexp.test(size) ? fractions.push(size) : null
    frsRegexp.test(size) ? frs.push(size) : null
  })

  // Condense fixed numbers to a single value. We can still pluck single values from the existing arrays -- this just helps make our formulas smaller.
  const sumFixed = fixeds.length ? fixeds.reduce((prev, curr) => `${prev} + ${curr}`) : ''

  // Convert fractions to floats and combine with user-defined floats. Again, condensing to a single value for cleaner formulas.
  let sumFraction: number
  if (fractions.length) {
    sumFraction = fractions.reduce((prev, curr): number => {
      if (typeof prev === 'string') {
        if (/\//.test(prev)) {
          prev = prev.split('/')[0] / prev.split('/')[1]
        }
      }

      if (typeof curr === 'string') {
        if (/\//.test(curr)) {
          curr = Number(curr.split('/')[0]) / Number(curr.split('/')[1])
        }
      }

      return prev + Number(curr)
    }, 0)
  }

  // Condensing fr units for cleaner formulas.
  const sumFr = frs.length ? frs.reduce((prev, curr) => parseInt(prev, 10) + parseInt(curr, 10) + 'fr') : null

  let val = ''
  if (frsRegexp.test(sizes[pluck])) {
    const thisFr = sizes[pluck].replace('fr', '')
    val = thisFr
    // todo: continue replacing auto with fr sizes
  } else {
    val = sizes[pluck]
  }

  // Aliases/caching for terser/faster formulas
  const tech = localOpts.technique
  const gut = parseInt(localOpts.gutters[0], 10) !== 0 ? localOpts.gutters[0] : 0
  const bump = localOpts.bump

  const valFixed = fixedsRegexp.test(val) ? true : false
  const valFraction = fractionsRegexp.test(val) ? true : false
  const valFr = frsRegexp.test(val) ? true : false

  const numFixed = fixeds.length
  const numFractions = fractions.length
  const numFrs = frs.length

  // If gutter, use first rounder, if no gutter, use second rounder. Alias for terser formulas.
  const rounder = (gut) => {
    if (gut !== 0) {
      return localOpts.rounders[0]
    } else {
      return localOpts.rounders[1]
    }
  }

  // console.log all sizes and settings
  const s = () => {
    console.log(`
sizes: ${String(sizes)}

localOpts: ${JSON.stringify(localOpts, null, 2)}
    `)
  }

  // Conditional Calc Hell! Abandon hope! 👺

  // val is a fixed is covered above ^

  // val is a fraction
  if (fractionsRegexp.test(val)) {
    // fraction(s) only
    if (valFraction && numFixed === 0 && numFrs === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula(`${rounder(gut)} * ${val} - (${gut} - ${gut} * ${val})${bump}`)
          case 'negative-margin':
            return result = formula(`${rounder(gut)} * ${val} - ${gut}${bump}`)
          default:
            return
        }
      } else {
        return result = formula(`${rounder(gut)} * ${val}${bump}`)
      }
    }

    // fraction(s) and fixed number(s) only
    if (valFraction && numFixed > 0 && numFrs === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula(`(${rounder(gut)} - (${sumFixed} + (${gut} * ${numFixed}))) * ${val} - (${gut} - ${gut} * ${val})${bump}`)
          case 'negative-margin':
            return result = formula(`(${rounder(gut)} - (${sumFixed} + (${gut} * ${numFixed}))) * ${val} - ${gut}${bump}`)
          default:
            return
        }
        return
      } else {
        return result = formula(`(${rounder(gut)} - (${sumFixed})) * ${val}${bump}`)
      }
    }

    // fraction(s) and auto(s) only
    if (numFractions > 0 && numFrs > 0 && numFixed === 0) {
      if (gut) {
        switch (tech) {
          case 'nth':
            return result = formula(`${rounder(gut)} * ${val} - (${gut} - ${gut} * ${val})${bump}`)
          case 'negative-margin':
            return result = formula(`${rounder(gut)} * ${val} - ${gut}${bump}`)
          default:
            return
        }
        return
      } else {
        return result = formula(`${rounder(gut)} * ${val}${bump}`)
      }
    }
  } // end val is fraction

  return 'postcss-ant: How did you get here? Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new'
}
