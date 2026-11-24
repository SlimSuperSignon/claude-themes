// Turns a "Submit a theme" issue into a theme file. Reads the issue from the
// environment (never from the command line), checks the theme as the plugin
// does, and writes the file, the owners list and the index. What it says is
// written to intake-result.md for the workflow to post on the issue.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { ROOT, SUFFIX, THEMES, check, readAll, writeIndex } from './community.mjs'

const body = process.env.ISSUE_BODY ?? ''
const author = process.env.ISSUE_AUTHOR ?? ''
const OWNERS = join(ROOT, 'owners.json')

const finish = (isAccepted, message, outputs = {}) => {
  writeFileSync(join(ROOT, 'intake-result.md'), `${message}\n`)
  if (process.env.GITHUB_OUTPUT) {
    const lines = Object.entries({ accepted: String(isAccepted), ...outputs }).map(([key, value]) => `${key}=${value}`)
    appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`)
  }
  console.log(message)
  process.exit(isAccepted ? 0 : 1)
}

/** The theme's JSON out of the issue: the fenced block the form makes, else the outermost braces. */
const themeText = () => {
  const fenced = /```(?:json)?\s*\n([\s\S]*?)\n```/.exec(body)
  const text = fenced ? fenced[1] : body
  const from = text.indexOf('{')
  const to = text.lastIndexOf('}')

  return from >= 0 && to > from ? text.slice(from, to + 1) : ''
}

if (!/^[A-Za-z0-9-]{1,39}$/.test(author)) {
  finish(false, 'This submission could not be read: the issue has no author.')
}
const text = themeText()

if (text === '') {
  finish(false, 'No theme was found in this issue. Paste the whole contents of your `.cctheme.json` file into the **Theme file** box, then save the issue: it is checked again on every edit.')
}
const result = check(text)

if (!result.ok) {
  finish(false, `This theme was not accepted yet:\n\n> ${result.error}\n\nFix the file, then edit this issue and paste the new contents: it is checked again on every edit.`)
}
const owners = existsSync(OWNERS) ? JSON.parse(readFileSync(OWNERS, 'utf8')) : {}
const owner = owners[result.slug]
const isListed = existsSync(join(THEMES, `${result.slug}${SUFFIX}`))

// A theme already here belongs to whoever published it; one with no owner on record is the maintainers'.
if (isListed && (owner === undefined || owner.toLowerCase() !== author.toLowerCase())) {
  finish(false, `A community theme is already called **${result.theme.name}**, published by someone else. Change \`"name"\` in your file, then edit this issue with the new contents.`)
}
const isUpdate = isListed

writeFileSync(join(THEMES, `${result.slug}${SUFFIX}`), `${JSON.stringify(result.theme, null, 2)}\n`)
owners[result.slug] = author
writeFileSync(OWNERS, `${JSON.stringify(Object.fromEntries(Object.entries(owners).sort()), null, 2)}\n`)

const { themes, failures } = readAll()

if (failures.length > 0) {
  finish(false, `The theme passed, but the community's own files have a problem a maintainer needs to fix:\n\n> ${failures.join('\n> ')}`)
}
writeIndex(themes)
finish(
  true,
  `**${result.theme.name}** passed every check${isUpdate ? ' and will replace the version already in the community' : ''}. It goes live once a maintainer approves it.`,
  { slug: result.slug, update: String(isUpdate) },
)
