import valueParser from 'postcss-value-parser'
import postcss from 'postcss'
import getSize from '../utils/get-size'
import ruleSetter from '../utils/rule-setter'

export default (node, opts, direction, decl, firstColumnSetLength) => {
  // Assign grid depending on support()
  if (opts.support === 'flexbox') {
    ruleSetter(
      `${decl.parent.selector}`,
      [
        `display: flex`,
        `flex-wrap: wrap`
      ],
      decl
    )
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

  // Grab all the contents within the function and sort them into size sets.
  const value: string = valueParser.stringify(node.nodes)
  const sizeSets: Array<string> = postcss.list.comma(value)
  let totalSizes: number = 0
  sizeSets.map(sizeSet => {
    totalSizes += postcss.list.space(sizeSet).length
  })

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

  // Reset dimensions and margins with each generate-grid. This prevents a huge amount of media query gotchas.
  // todo: This can be refactored to avoid media query gotchas but requires a lot of conditionals.
  switch (getDirection()) {
    case 'width':
      ruleSetter(`${decl.parent.selector} > *:${opts.children}(n)`, [
        `width: auto`,
        `margin-left: 0`
      ], decl)

      ruleSetter(`${decl.parent.selector} > *:${opts.children}(1n)`, [
        `margin-left: ${opts.gutter[0]}`
      ], decl)

      break

    case 'height':
      ruleSetter(`${decl.parent.selector} > *:${opts.children}(n)`, [
        `height: auto`,
        `margin-top: 0`
      ], decl)

      // This technique prevents people from having to know how many elements appear on the last row.
      if (opts.gutter.length === 1) {
        ruleSetter(`${decl.parent.selector} > *:${opts.children}(n + ${firstColumnSetLength + 1})`, [
          `margin-top: ${opts.gutter[0]}`
        ], decl)
      } else {
        ruleSetter(`${decl.parent.selector} > *:${opts.children}(n + ${firstColumnSetLength + 1})`, [
          `margin-top: ${opts.gutter[1]}`
        ], decl)
      }

      break

    default:
      break
  }

  let counter: number = 0
  const incrementToTotalSizes = () => {
    counter += 1

    if (counter <= totalSizes) {
      return counter
    }
  }

  // Loop through each size in each size set, applying rulesets as we go.
  getSize(node, opts, decl).map(setResults => {
    setResults.map(sizeResult => {
      // Set dimension with cycling nth selector
      // todo: Kill bloat. Collect sizes into an array, then loop over that array for matches. If matches, only create a single ruleset. This is probably what declarer did.
      ruleSetter(
        `${decl.parent.selector} > *:${opts.children}(${totalSizes}n + ${incrementToTotalSizes()})`,
        [
          `${getDirection()}: ${sizeResult}`
        ],
        decl
      )
    })
  })

  // Negate column margins
  // The first column in a row will never have a margin-left.
  if (getDirection() === 'width') {
    let collectedSetLengths: number = 1
    sizeSets.map(sizeSet => {
      ruleSetter(
        `${decl.parent.selector} > *:${opts.children}(${totalSizes}n + ${collectedSetLengths})`,
        [
          `margin-left: 0`
        ],
        decl
      )

      collectedSetLengths += postcss.list.space(sizeSet).length
    })
  }
}
