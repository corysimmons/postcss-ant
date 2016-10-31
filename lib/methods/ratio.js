// @flow
// todo: This works pretty well, but isn't technically correct. ratio() doesn't take nesting into context and using regex for this isn't optimal.
// Will revisit when someone complains. In the meantime, would really appreciate some insight on how to solve this and/or a PR.
export default (decl: {
  value: string
}, numerators: Array<number>, opts: {
  namespace: string
}) => {
  if (numerators.length) {
    const denominator: number = numerators.reduce((prev, curr) => prev + curr)
    const ratioRegexp = new RegExp(`${opts.namespace}ratio\\([^]+?\\)`)

    numerators.forEach((numerator, i) => {
      decl.value = decl.value.replace(ratioRegexp, `${numerators[i]}/${denominator}`)
    })
  }
}
