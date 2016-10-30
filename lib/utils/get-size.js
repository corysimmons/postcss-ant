// @flow
import calcHell from './calc-hell'
import valueParser from 'postcss-value-parser'
import postcss from 'postcss'

// This is where we split up sizes and size sets into arrays. Then we pass that to calcHell to return the appropriate calc formula.

export default (node: {
  type: string,
  value: string,
  nodes: Array<{
    type: string,
    value: string
  }>
}, localOpts: {
  rounders: Array<string>,
  gutters: Array<string>,
  bump: string,
  pluck: number,
  namespace: string,
  support: string,
  technique: string
}, decl: {
  source: {
    start: {
      line: number,
      column: number
    },
    input: {
      file: string
    }
  }
}): Array<string> => {
  // Stringify and stash the value of the function
  const value: string = valueParser.stringify(node.nodes)

  let results: Array<string> = []

  switch (node.value) {
    // If sizes(), we don't need to split into sets. We need to use pluck though.
    case `${localOpts.namespace}size`:
    case `${localOpts.namespace}sizes`:
      const sizes: Array<string> = postcss.list.space(value)
      results.push(calcHell(sizes, localOpts))
      break

    // If columns or rows, we need to split sizes into sets and return a value for each size in each set.
    case `${localOpts.namespace}columns`:
    case `${localOpts.namespace}rows`:
      const sizeSets: Array<string> = postcss.list.comma(value)

      // Map over size sets and output the correct calc formula for each size in the set.
      sizeSets.map(set => {
        // Split sizes by space
        const sizes = postcss.list.space(set)

        const setResults = []

        for (let i = 1; i <= sizes.length; i++) {
          // Intentionally assign pluck to 1..2..3.. so we can pluck the correct size for each size in a set.
          localOpts.pluck = i
          setResults.push(calcHell(sizes, localOpts, node))
        }

        results.push(setResults)
      })
      break

    default:
      break
  }

  return results
}
