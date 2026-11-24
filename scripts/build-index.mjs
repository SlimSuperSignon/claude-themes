// Rebuilds index.json from the themes folder. With --check, changes nothing and
// fails when a theme is not valid or the index is out of date.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { ROOT, indexOf, readAll, writeIndex } from './community.mjs'

const isCheck = process.argv.includes('--check')
const { themes, failures } = readAll()

for (const failure of failures) {
  console.error(failure)
}
if (failures.length > 0) {
  process.exit(1)
}
if (isCheck) {
  const file = join(ROOT, 'index.json')
  const now = existsSync(file) ? readFileSync(file, 'utf8') : ''

  if (now !== `${JSON.stringify(indexOf(themes), null, 2)}\n`) {
    console.error('index.json is out of date: run "node scripts/build-index.mjs"')
    process.exit(1)
  }
  console.log(`${themes.length} themes are valid and the index is up to date`)
} else {
  writeIndex(themes)
  console.log(`index.json lists ${themes.length} themes`)
}
