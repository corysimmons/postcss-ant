// @flow
import postcss from 'postcss'
import valueParser from 'postcss-value-parser'
import methods from './methods'
import getSize from './utils/get-size'
import generateGrid from './helpers/generate-grid'

// Stash global settings in an opts obj
const ant: Function = postcss.plugin('postcss-ant', (opts: {
  rounders: Array<string>,
  gutter: Array<string>,
  bump: string,
  pluck: number,
  namespace: string,
  support: string,
  technique: string,
  children: string
} = {
  rounders: '99.99% 99.999999%'.trim().split(/\s+/),
  gutter: '30px 30px'.trim().split(/\s+/),
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
        case 'ant-gutter':
          opts.gutter = rule.params.split(/\s+/)
          rule.remove()
          break
        case 'ant-rounders':
          opts.rounders = rule.params.split(/\s+/)
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
        const optsRegexp = new RegExp(`${opts.namespace}(?=gutter|rounders|support|pluck|bump|technique|children)`)
        if (node.type === 'function' && optsRegexp.test(node.value)) {
          node.type = 'word' // transform existing function node into a word so we can replace its value with a string

          switch (node.value) {
            case `${opts.namespace}gutter`:
              if (node.nodes.length > 1) {
                opts.gutter = [node.nodes[0].value, node.nodes[2].value]
              } else {
                opts.gutter = [node.nodes[0].value]
              }
              break

            case `${opts.namespace}rounders`:
              opts.rounders = [node.nodes[0].value, node.nodes[2].value]
              break

            case `${opts.namespace}support`:
              opts.support = node.nodes[0].value
              break

            case `${opts.namespace}pluck`:
              opts.pluck = Number(node.nodes[0].value)
              break

            case `${opts.namespace}bump`:
              opts.bump = ` ${valueParser.stringify(node.nodes)}`
              break

            case `${opts.namespace}technique`:
              opts.technique = node.nodes[0].value
              break

            case `${opts.namespace}children`:
              opts.children = node.nodes[0].value
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
        const powRegexp = new RegExp(`${opts.namespace}pow`)
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
        const sumRegexp = new RegExp(`${opts.namespace}sum`)
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
        const ratioRegexp = new RegExp(`${opts.namespace}ratio`)
        if (node.type === 'function' && ratioRegexp.test(node.value)) {
          numerators.push(methods.pow(node))
        }
      }, false) // shallow because I'm weaksauce :(

      methods.ratio(decl, numerators, opts)

      // Walk to grab columns() first size set length for use with rows()
      let firstColumnSetLength: number = 0
      const columnsParsed: {
        toString: Function
      } = valueParser(ratiosParsed.toString()).walk((node: {
        type: string,
        value: string,
        nodes: Array<{
          type: string,
          value: string
        }>
      }) => {
        const columnsRegexp = new RegExp(`${opts.namespace}(?=columns)`)
        if (node.type === 'function' && columnsRegexp.test(node.value)) {
          if (node.value === 'columns') {
            firstColumnSetLength = postcss.list.space(postcss.list.comma(valueParser.stringify(node.nodes))[0]).length
          }
        }
      }, true)

      // Finally, we walk/process all sizes(), columns(), and rows(), and get a calc formula back from getSize.
      const sizesParsed: {
        toString: Function
      } = valueParser(columnsParsed.toString()).walk((node: {
        type: string,
        value: string,
        nodes: Array<{
          type: string,
          value: string
        }>
      }) => {
        const sizesRegexp = new RegExp(`${opts.namespace}(?=sizes|columns|rows)`)
        if (node.type === 'function' && sizesRegexp.test(node.value)) {
          switch (node.value) {
            case `${opts.namespace}sizes`:
              // Replace the decl.value with the final output
              decl.value = getSize(node, opts, decl)[0]
              break

            case `${opts.namespace}columns`:
            case `${opts.namespace}rows`:
              generateGrid(node, opts, node.value, decl, firstColumnSetLength)
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
          if (node.value === `${opts.namespace}columns` || node.value === `${opts.namespace}rows`) {
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
