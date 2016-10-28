// @flow
import valueParser from 'postcss-value-parser'
import postcss from 'postcss'
import getSize from '../utils/get-size'
import ruleSetter from '../utils/rule-setter'
import invertBy from 'lodash/invertBy'

export default (node, opts, direction, decl, firstColumnSetLength, foundColumnsAndRows, prevSourceIndex) => {
  // Grab all the contents within the function and sort them into size sets.
  const value: string = valueParser.stringify(node.nodes)
  const sizeSets: Array<string> = postcss.list.comma(value)
  let totalSizes: number = 0
  sizeSets.map(sizeSet => {
    totalSizes += postcss.list.space(sizeSet).length
  })

  // Determine if this is the last/first columns() or rows() call in the declaration value.
  let lastCall: boolean = false
  let firstCall: boolean = false
  if (node.sourceIndex > prevSourceIndex) {
    lastCall = true
  }
  if (node.sourceIndex === 0){
    firstCall = true
  }

  // Set both gutters if only 1 gutter has been specified
  if (opts.gutters.length === 1) {
    opts.gutters = [opts.gutters[0], opts.gutters[0]]
  }

  // Assign grid depending on support()
  if (value !== 'reset') {
    if (firstCall) {
      if (opts.support === 'flexbox') {
        switch (opts.technique) {
          case 'nth':
            ruleSetter(
              `${decl.parent.selector}`,
              [
                `display: flex`,
                `flex-wrap: wrap`
              ],
              decl
            )
            break

          case 'negative-margin':
            ruleSetter(
              `${decl.parent.selector}`,
              [
                `display: flex`,
                `flex-wrap: wrap`,
                `margin-right: calc(-${opts.gutters[0]} / 2)`,
                `margin-left: calc(-${opts.gutters[0]} / 2)`
              ],
              decl
            )
            ruleSetter(
              `${decl.parent.selector} > *`,
              [
                `margin-right: calc(${opts.gutters[0]} / 2)`,
                `margin-left: calc(${opts.gutters[0]} / 2)`
              ],
              decl
            )
            break

          default:
            break
        }
      } else if (opts.support === 'float') {
        ruleSetter(
          `${decl.parent.selector} > *`,
          [
            `float: left`
          ],
          decl
        )
        ruleSetter(
          `${decl.parent.selector}::after`,
          [
            `content: ''`,
            `display: table`,
            `clear: both`
          ],
          decl
        )
      }
    }
  }

  // Explicit reset support
  if (value === 'reset') {
    switch (node.value) {
      case 'columns':
        switch (opts.technique) {
          case 'nth':
            ruleSetter(
              `${decl.parent.selector} > *:${opts.children}(n)`,
              [
                `width: auto`,
                `margin-left: 0`
              ],
              decl
            )
            break

          case 'negative-margin':
            ruleSetter(
              `${decl.parent.selector}`,
              [
                `margin-right: 0`,
                `margin-left: 0`
              ],
              decl
            )
            ruleSetter(
              `${decl.parent.selector} > *:${opts.children}(n)`,
              [
                `width: auto`,
                `margin-right: 0`,
                `margin-left: 0`
              ],
              decl
            )
            break

          default:
            break
        }

        return

      case 'rows':
        ruleSetter(
          `${decl.parent.selector} > *:${opts.children}(n)`,
          [
            `height: auto`,
            `margin-top: 0`
          ],
          decl
        )
        return

      default:
        break
    }
  }

  // Convert columns() to width and rows() to height for shorter conditionals and usage when assigning sizes to that particular dimension.
  const getDirection = () => {
    switch (direction) {
      case `${opts.namespace}columns`:
        return 'width'

      case `${opts.namespace}rows`:
        return 'height'

      default:
        break
    }
  }

  // Implicitly reset dimensions and margins with each generate-grid. This prevents a huge amount of media query gotchas.
  if (foundColumnsAndRows && firstCall) {
    switch (opts.technique) {
      case 'nth':
        ruleSetter(`${decl.parent.selector} > *:${opts.children}(n)`, [
          `width: auto`,
          `height: auto`,
          `margin-top: 0`,
          `margin-left: ${opts.gutters[0]}`
        ], decl)
        break

      case 'negative-margin':
        ruleSetter(`${decl.parent.selector} > *:${opts.children}(n)`, [
          `width: auto`,
          `height: auto`,
          `margin-top: 0`,
          `margin-right: calc(${opts.gutters[0]} / 2)`,
          `margin-left: calc(${opts.gutters[0]} / 2)`
        ], decl)
        break

      default:
        break
    }

    ruleSetter(`${decl.parent.selector} > *:${opts.children}(n + ${firstColumnSetLength + 1})`, [
      `margin-top: ${opts.gutters[1]}`
    ], decl)
  } else if (firstCall) {
    switch (getDirection()) {
      case 'width':
        switch (opts.technique) {
          case 'nth':
            ruleSetter(`${decl.parent.selector} > *:${opts.children}(n)`, [
              `width: auto`,
              `margin-left: ${opts.gutters[0]}`
            ], decl)
            break

          case 'negative-margin':
            ruleSetter(`${decl.parent.selector} > *:${opts.children}(n)`, [
              `width: auto`,
              `margin-right: calc(${opts.gutters[0]} / 2)`,
              `margin-left: calc(${opts.gutters[0]} / 2)`
            ], decl)

          default:
            break
        }

        break

      case 'height':
        ruleSetter(`${decl.parent.selector} > *:${opts.children}(n)`, [
          `height: auto`,
          `margin-top: 0`
        ], decl)

        // This technique prevents people from having to know how many elements appear on the last row.
        ruleSetter(`${decl.parent.selector} > *:${opts.children}(n + ${firstColumnSetLength + 1})`, [
          `margin-top: ${opts.gutters[1]}`
        ], decl)

        break

      default:
        break
    }
  }

  // If columns(100%) and technique is negative-margin, then erase negative-margins
  if (node.value === 'columns' && value === '100%' && opts.technique === 'negative-margin') {
    ruleSetter(
      `${decl.parent.selector}`,
      [
        `margin-right: 0`,
        `margin-left: 0`
      ],
      decl
    )
    ruleSetter(
      `${decl.parent.selector} > *:${opts.children}(n)`,
      [
        `width: 100%`,
        `margin-right: 0`,
        `margin-left: 0`
      ],
      decl
    )
    return
  }

  let counter: number = 0
  const incrementToTotalSizes = () => {
    counter += 1

    if (counter <= totalSizes) {
      return counter
    }
  }

  // Set dimension with cycling nth selector
  // Loop through each size in each size set, applying rulesets as we go.
  getSize(node, opts, decl).map(sizes => {
    // Do some work to ensure selectors (when casting sizes) are combined/stacked neatly.
    let obj = {}
    sizes.map(size => {
      // Cast selector: size pairs to obj
      // example: {'.foo > *:nth-child(4n + 1)': '1px', ...}
      obj[`${decl.parent.selector} > *:${opts.children}(${totalSizes}n + ${incrementToTotalSizes()})`] = size
    })

    // Find matching sizes, then invert the object so selectors are in an array
    // example: {'1px': [ '.foo > *:nth-child(4n + 1)', '.foo > *:nth-child(4n + 2)' ], ...}
    const inverted = invertBy(obj) // thank god for lodash...

    // Cast our sizing-specific rulesets
    for (const size in inverted) {
      ruleSetter(
        inverted[size].join(`,\n${decl.raws.before.substring(3)}`),
        [
          `${getDirection()}: ${size}`
        ],
        decl
      )
    }
  })

  // Negate column margins on nth grids
  // The first column in a row will never have a margin-left. We add the length of the previously used size set on each iteration. Start on 1.
  if (opts.technique === 'nth') {
    if (getDirection() === 'width') {
      let collectedSetLengths: number = 1
      let selectors: Array<string> = []
      sizeSets.map(sizeSet => {
        selectors.push(`${decl.parent.selector} > *:${opts.children}(${totalSizes}n + ${collectedSetLengths})`)
        collectedSetLengths += postcss.list.space(sizeSet).length
      })

      ruleSetter(
        selectors.join(`,\n${decl.raws.before.substring(3)}`),
        [
          `margin-left: 0`
        ],
        decl
      )
    }
  }
}
