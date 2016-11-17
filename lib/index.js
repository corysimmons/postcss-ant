// @flow
import postcss from 'postcss'
import valueParser from 'postcss-value-parser'
import methods from './methods'
import errHandler from './utils/error-handler'
import getSize from './utils/get-size'
import generateGrid from './helpers/generate-grid'

// Stash global settings in an opts obj
const ant: Function = postcss.plugin('postcss-ant', (opts: {
  rounders: Array<string>,
  gutters: Array<string>,
  bump: string,
  pluck: number,
  namespace: string,
  support: string,
  technique: string,
  children: string
} = {
  rounders: postcss.list.comma('99.99%, 99.999999%'),
  gutters: postcss.list.comma('30px, 30px'),
  bump: '',
  pluck: 1,
  namespace: '',
  support: 'flexbox',
  technique: 'nth',
  children: 'nth-child'
}) => {
  return (css: {
    walkAtRules: Function,
    walkDecls: Function
  }) => {
    // Update global settings if there are atRule settings
    css.walkAtRules((rule: {
      name: string,
      params: string,
      remove: Function
    }) => {
      switch (rule.name) {
        case 'ant-namespace':
          opts.namespace = rule.params
          rule.remove()
          break
        case 'ant-gutters':
          opts.gutters = postcss.list.comma(rule.params)
          rule.remove()
          break
        case 'ant-rounders':
          opts.rounders = postcss.list.comma(rule.params)
          rule.remove()
          break
        case 'ant-support':
          opts.support = rule.params
          rule.remove()
          break
        case 'ant-technique':
          opts.technique = rule.params
          rule.remove()
          break
        case 'ant-children':
          opts.children = rule.params
          rule.remove()
          break
        default:
          break
      }
    })

    // Walk declarations. Shallow walk with valueParser to stash local opts in opts obj. Then deepest-first walks over methods.
    css.walkDecls((decl: {
      value: string,
      source: {
        start: {
          line: number,
          column: number
        },
        input: {
          file: string
        }
      }
    }) => {
      // Ensure user is combining methods correctly.
      // Throw helpful suggestions to help newcomers. Don't be too strict and limit boundary-pushers.
      errHandler(opts, decl)

      let localOpts = {
        rounders: opts.rounders,
        gutters: opts.gutters,
        bump: opts.bump,
        pluck: opts.pluck,
        namespace: opts.namespace,
        support: opts.support,
        technique: opts.technique,
        children: opts.children
      }

      // Create object to pass to various helpers to determine if something was specified on a local level.
      // Everything defaults to false and is converted to true if so.
      let locallySpecified = {
        gutters: false,
        rows: false
      }

      // Local settings walk
      const optsParsed: {
        toString: Function
      } = valueParser(decl.value).walk((node: {
        type: string,
        value: string,
        nodes: Array<{
          type: string,
          value: string
        }>
      }) => {
        const optsRegexp = new RegExp(`${localOpts.namespace}(?=gutters?|rounders?|support|pluck|bump|technique|children)`)
        if (node.type === 'function' && optsRegexp.test(node.value)) {
          node.type = 'word' // transform existing function node into a word so we can replace its value with a string

          switch (node.value) {
            case `${localOpts.namespace}gutter`:
            case `${localOpts.namespace}gutters`:
              locallySpecified.gutters = true
              localOpts.gutters = postcss.list.comma(valueParser.stringify(node.nodes)) ? postcss.list.comma(valueParser.stringify(node.nodes)) : opts.gutters
              break

            case `${localOpts.namespace}rounder`:
            case `${localOpts.namespace}rounders`:
              localOpts.rounders = postcss.list.comma(valueParser.stringify(node.nodes)) ? postcss.list.comma(valueParser.stringify(node.nodes)) : opts.rounders
              break

            case `${localOpts.namespace}support`:
              localOpts.support = valueParser.stringify(node.nodes) ? valueParser.stringify(node.nodes) : opts.support
              break

            case `${localOpts.namespace}pluck`:
              localOpts.pluck = Number(valueParser.stringify(node.nodes)) ? Number(valueParser.stringify(node.nodes)) : opts.pluck
              break

            case `${localOpts.namespace}bump`:
              localOpts.bump = ` ${valueParser.stringify(node.nodes)}` ? ` ${valueParser.stringify(node.nodes)}` : opts.bump
              break

            case `${localOpts.namespace}technique`:
              localOpts.technique = valueParser.stringify(node.nodes) ? valueParser.stringify(node.nodes) : opts.technique
              break

            case `${localOpts.namespace}children`:
              localOpts.children = valueParser.stringify(node.nodes) ? valueParser.stringify(node.nodes) : opts.children
              break

            default:
              break
          }

          // Poorly erase the function (leaves whitespace). It would be nice if there was a .remove() method in valueParser.
          node.value = ''
        }
      }, false) // shallow

      // pow() walk
      const powsParsed: {
        toString: Function
      } = valueParser(optsParsed.toString()).walk((node: {
        type: string,
        value: string,
        nodes: Array<{
          type: string,
          value: string
        }>
      }) => {
        const powRegexp = new RegExp(`${localOpts.namespace}pow`)
        if (node.type === 'function' && powRegexp.test(node.value)) {
          node.type = 'word'
          node.value = String(methods.pow(node))
        }
      }, true) // deep

      // sum() walk
      const sumsParsed: {
        toString: Function
      } = valueParser(powsParsed.toString()).walk((node: {
        type: string,
        value: string,
        nodes: Array<{
          type: string,
          value: string
        }>
      }) => {
        const sumRegexp = new RegExp(`${localOpts.namespace}sum`)
        if (node.type === 'function' && sumRegexp.test(node.value)) {
          node.type = 'word'
          node.value = String(methods.sum(node))
        }
      }, true) // deep

      // Assign the current decl.value to whatever has been processed so far.
      // Trimming to remove excess spaces created when we removed local setting methods (e.g. the space left over after pluck() is removed).
      decl.value = sumsParsed.toString().trim()

      // Prep arr to collect all the ratio()s in this specific decl.value
      let numerators: Array<number> = []

      // ratio() walk
      const ratiosParsed: {
        toString: Function
      } = valueParser(sumsParsed.toString()).walk((node: {
        type: string,
        value: string,
        nodes: Array<{
          type: string,
          value: string
        }>
      }) => {
        const ratioRegexp = new RegExp(`${localOpts.namespace}ratio`)
        if (node.type === 'function' && ratioRegexp.test(node.value)) {
          numerators.push(methods.pow(node))
        }
      }, false) // shallow because I'm weaksauce :(

      methods.ratio(decl, numerators, localOpts)

      // Walk to grab columns() first size set length for use with rows().
      // Also check if columns is set.
      const columnsRegexp = new RegExp(`${localOpts.namespace}(?=columns)`)
      let foundColumns: boolean = false
      let firstColumnSetLength: number = 0
      valueParser(decl.value).walk((node: {
        type: string,
        value: string,
        nodes: Array<{
          type: string,
          value: string
        }>
      }) => {
        if (node.type === 'function' && columnsRegexp.test(node.value)) {
          foundColumns = true

          const firstColumnSet = postcss.list.comma(valueParser.stringify(node.nodes))[0]

          if (firstColumnSet !== 'reset') {
            firstColumnSetLength = postcss.list.space(firstColumnSet).length
          }
        }
      }, true)

      // Walk to grab columns() last size set length for use with generate-grid.
      let lastColumnSetLength: number = 0
      valueParser(decl.value).walk((node: {
        type: string,
        value: string,
        nodes: Array<{
          type: string,
          value: string
        }>
      }) => {
        if (node.type === 'function' && columnsRegexp.test(node.value)) {
          const numberOfColumnSizeSets = postcss.list.comma(valueParser.stringify(node.nodes)).length
          const lastColumnSet = postcss.list.comma(valueParser.stringify(node.nodes))[numberOfColumnSizeSets - 1]

          if (lastColumnSet !== 'reset') {
            lastColumnSetLength = postcss.list.space(lastColumnSet).length
          }
        }
      }, true)

      // Does the decl.value contain both columns() and rows()? Stash bool for use in generate-grid (to help cleanup output).
      let foundColumnsAndRows: boolean = false
      if (foundColumns) {
        valueParser(decl.value).walk((node: {
          type: string,
          value: string,
          nodes: Array<{
            type: string,
            value: string
          }>
        }) => {
          const rowsRegexp = new RegExp(`${localOpts.namespace}(?=rows)`)
          if (node.type === 'function' && rowsRegexp.test(node.value)) {
            locallySpecified.rows = true
            foundColumnsAndRows = true
          }
        }, true)
      }

      // Finally, we walk/process all sizes(), columns(), and rows(), and get a calc formula back from getSize.
      let prevSourceIndex: number = 0
      const sizesParsed: {
        toString: Function
      } = valueParser(decl.value).walk((node: {
        type: string,
        value: string,
        nodes: Array<{
          type: string,
          value: string
        }>
      }) => {
        const sizesRegexp = new RegExp(`${localOpts.namespace}(?=sizes?|columns|rows)`)
        if (node.type === 'function' && sizesRegexp.test(node.value)) {
          switch (node.value) {
            case `${localOpts.namespace}size`:
            case `${localOpts.namespace}sizes`:
              // Replace the decl.value with the final output
              decl.value = getSize(node, localOpts, decl)[0]
              break

            case `${localOpts.namespace}columns`:
            case `${localOpts.namespace}rows`:
              const ggRegexp = new RegExp(`${localOpts.namespace}(?=generate-grid|gg)`)
              // Ensure the property is generate-grid or gg
              if (ggRegexp.test(decl.prop)) {
                generateGrid(node, localOpts, node.value, decl, firstColumnSetLength, foundColumnsAndRows, prevSourceIndex, locallySpecified, lastColumnSetLength)
              }
              break

            default:
              break
          }
        }
      }, false)

      // Delete generate-grid if it was used
      const cleanParsed: {
        toString: Function
      } = valueParser(sizesParsed.toString()).walk((node: {
        type: string,
        value: string,
        nodes: Array<{
          type: string,
          value: string
        }>
      }) => {
        if (node.type === 'function') {
          if (node.value === `${localOpts.namespace}columns` || node.value === `${localOpts.namespace}rows`) {
            // Remove selector if no other nodes present.
            if (decl.parent) {
              if (decl.parent.nodes.every(node => node === decl)) {
                decl.parent.remove()
              }
            }

            // Remove generate-grid declaration.
            decl.remove()
          }
        }
      }, true)
    })
  }
})

export default ant
