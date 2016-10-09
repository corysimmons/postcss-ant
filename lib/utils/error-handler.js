import chalk from 'chalk'

export default (decl, error, suggestion) => {
  const header = `------------------------
   postcss-ant error:
------------------------
`
  const line = `   ${decl.source.input.file}:${decl.source.start.line}:${decl.source.start.column}`
  const footer = `If you're pretty confident you're doing everything correct, please file an issue at https://github.com/corysimmons/postcss-ant/issues/new`

  if (error && suggestion) {
    console.error(`
${header}
${chalk.red('✖︎ ', error)}
${chalk.red(line)}

${chalk.green('✔︎ ', suggestion)}

${footer}
    `)
  } else if (error) {
    console.error(`
${header}
${chalk.red('✖︎ ', error)}
${chalk.red(line)}

${footer}
    `)
  } else {
    console.error('Provide an error to errHandler, Dummy.')
  }
}
