import postcss from 'postcss'

// This wrapper makes adding rules and rulesets a bit easier to declare/read.

// Usage:
// ruleSetter(selector, [rules], decl)

export default (selector, rules, decl) => {
  // Creates .selector:nth-child(3n + 1) ... (3n + 2) ... (3n + 3) ... rules immediately before the current selector.
  // We add these before so the user can override generate-grid easily if need be.
  postcss.rule({
    selector: selector
  }).moveBefore(decl.parent)

  rules.map(rule => {
    const propVal = rule.split(':')

    decl.clone({
      prop: propVal[0].trim(),
      value: propVal[1].trim()
    }).moveTo(decl.parent.prev())
  })
}