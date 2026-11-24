// What every script here shares: reading the themes folder with the plugin's
// own checker, so the community accepts exactly what the plugin accepts.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { BUILT_IN, build, extras, isSameName, parseTheme, slug } from '../lib/themes.ts'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
export const THEMES = join(ROOT, 'themes')
export const SUFFIX = '.cctheme.json'

/** Checks one theme file's text as the plugin does: its shape, then whether the app paints it. */
export const check = text => {
  const parsed = parseTheme(text)

  if (!parsed.ok) {
    return { ok: false, error: parsed.error }
  }
  const built = build(parsed.value)

  if (!built.ok) {
    return { ok: false, error: built.error }
  }
  if (BUILT_IN.some(one => isSameName(one.name, parsed.value.name))) {
    return { ok: false, error: `a built-in theme is already called ${parsed.value.name}; pick another name` }
  }

  return { ok: true, theme: parsed.value, slug: slug(parsed.value.name) }
}

/** Every theme in the folder, checked; a file that fails is reported, not listed. */
export const readAll = () => {
  const themes = []
  const failures = []

  for (const file of readdirSync(THEMES).filter(name => name.endsWith(SUFFIX)).sort()) {
    const result = check(readFileSync(join(THEMES, file), 'utf8'))

    if (!result.ok) {
      failures.push(`themes/${file}: ${result.error}`)
    } else if (`${result.slug}${SUFFIX}` !== file) {
      failures.push(`themes/${file}: a theme called ${result.theme.name} belongs in ${result.slug}${SUFFIX}`)
    } else {
      themes.push({ file: `themes/${file}`, theme: result.theme })
    }
  }

  return { themes, failures }
}

/**
 * The index the plugin reads to draw the community shelf: per theme, where its
 * file is and a card of it. A card is the theme without its about page and
 * without a moving scene, which the plugin fetches when the theme is opened.
 */
export const indexOf = themes => ({
  format: 'claude-theme-index/1',
  themes: themes
    .map(({ file, theme }) => {
      const { about: _about, background, ...rest } = theme
      const card = background === undefined || 'scene' in background ? rest : { ...rest, background }

      return { file, extras: extras(theme), card }
    })
    .sort((a, b) => a.card.name.localeCompare(b.card.name)),
})

export const writeIndex = themes => {
  const text = `${JSON.stringify(indexOf(themes), null, 2)}\n`
  writeFileSync(join(ROOT, 'index.json'), text)

  return text
}
