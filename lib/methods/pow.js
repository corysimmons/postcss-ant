// @flow
export default (node: {
  nodes: Array<{
    type: string,
    value: string
  }>
}): number => {
  const args = node.nodes
    .filter(arg => arg.type === 'word')
    .map(arg => Number(arg.value))

  return Math.pow(args[0], args[1])
}
