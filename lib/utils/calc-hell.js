// @flow

// This is where we:
//   1. Distribute all sizes to respective arrays
//   2. Reduce those arrays to single values (for cleaner formulas)
//   3. Return a clean calc formula (via string building functions) based on opts and the pluck index

export default (sizes: Array<string>, opts: {
  gutter: Array<string>,
  rounders: Array<string>,
  pluck: number,
  bump: string,
  technique: string
}): string => {

  if (opts.bump !== '') {
    opts.bump = opts.bump.trim()

    // Strip any quotes from bump
    if (/'|"/g.test(opts.bump)) {
      opts.bump = opts.bump.replace(/'|"/g, '')
    }

    // Put a space between operators in bump() if none exists. e.g. bump(+2px) turns into calc(... + 2px)
    const operatorRegexp = /(\+|-|\*|\/)(?=[^\s])/g
    if (operatorRegexp.test(opts.bump)) {
      opts.bump = opts.bump.replace(operatorRegexp, operator => `${operator} `)
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
    if (opts.bump !== '' && fixedsRegexp.test(sizes[pluck])) {
      return `calc(${formula} ${opts.bump})`
    } else if (fixedsRegexp.test(sizes[pluck])) {
      return sizes[pluck]
    } else if (opts.bump !== '') {
      return `calc((${formula}) ${opts.bump})`
    } else {
      return `calc(${formula})`
    }
  }

  // Subtract 1 from pluck so it can be nth compatible (good for preprocessor looping), but easily interpolated in formulas.
  const pluck = opts.pluck - 1

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

  // Allows us to interpolate specific string combos within a formula's template literal.
  // Looks ugly throughout calc hell, but it keeps the outputted calc formulas much cleaner.
  // Truncated parameter names (arr, zer, one, mor) chosen to help with multiline alignment.
  function arrBuilder ({arr = [], ...args}): string {
    if (arr.length === 0) {
      return args['zer']
    } else if (arr.length === 1) {
      return args['one']
    } else if (arr.length > 1) {
      return args['mor']
    } else {
      return ''
    }
  }

  // If a sum val exists, interpolate yes, else interpolate no (or nothing)
  function sumBuilder (sum, yes, no) {
    if (sum !== '') {
      return yes
    } else {
      return no || ''
    }
  }

  // If a gutter is set, return the string of yes, else return string of no.
  function gutBuilder(gut, yes, no) {
    if (parseInt(gut, 10)) {
      return yes
    } else {
      return no || ''
    }
  }

  // If a technique is set, find out which technique is being used and interpolate a string accordingly.
  function techBuilder(tech, nth: string, negativeMargin: string) {
    switch (tech) {
      case 'nth':
        return nth

      case 'negative-margin':
        return negativeMargin

      default:
        return ''
    }
  }

  // Aliases/caching for terser/faster formulas
  const val = sizes[pluck]
  const tech = opts.technique
  // todo: Add conditional for generate-grid multi-gutter assignment.
  const gut = parseInt(opts.gutter[0], 10) !== 0 ? opts.gutter[0] : 0

  const valFixed = fixedsRegexp.test(val) ? true : false
  const valFraction = fractionsRegexp.test(val) ? true : false
  const valFr = frsRegexp.test(val) ? true : false

  const numFixed = fixeds.length
  const numFractions = fractions.length
  const numFrs = frs.length

  // If gutter, use first rounder, if no gutter, use second rounder. Alias for terser formulas.
  function rounder (gut) {
    if (gut !== 0) {
      return opts.rounders[0]
    } else {
      return opts.rounders[1]
    }
  }

  const settings = () => {
    console.log(`
sizes: ${String(sizes)}

opts: ${JSON.stringify(opts, null, 2)}
    `)
  }

  // Abandon hope! 👺

  // - ✔︎ fixed number only
  // Taken care of towards the top of this file.

  // - fraction(s) only
  if (valFraction && numFixed === 0 && numFrs === 0) {
    //neg: return `calc(99.99% * ${val} - ${gut}${bump})`
    return result = formula(`${rounder(gut)} * ${val}${techBuilder(tech, gutBuilder(gut, ` - (${gut} - ${gut} * ${val})`), gutBuilder(gut, ` - ${gut}`))}`)
  }

  // - fraction(s) and fixed number(s) only
  if (valFraction && numFixed > 0 && numFrs === 0) {
  }

  return 'postcss-ant: How the hell did you get here? Please file a bug at https://github.com/corysimmons/postcss-ant/issues/new'
}
