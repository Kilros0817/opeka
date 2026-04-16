// Generates web-types.json from <script props> JSDoc in component html files.
// Called by the vite-plugin-web-types plugin on dev start and file saves,
// and by the gen:web-types npm script as a fallback.

import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join, basename, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SCAN_DIRS = ['src/components']

export { ROOT, SCAN_DIRS }

// Walk folders and pick files where name matches parent dir (e.g. button/button.html).
// Skip _template, styleguide previews and inner partials.
function findComponentHtml(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('_') || entry.startsWith('.')) continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      findComponentHtml(full, out)
      continue
    }
    if (!entry.endsWith('.html')) continue
    if (entry.includes('.styleguide.') || entry.includes('.inner.')) continue
    const name = basename(entry, '.html')
    const parent = basename(dirname(full))
    if (name === parent) out.push(full)
  }
  return out
}

// Pull the JSDoc-style block out of <script props>.
function extractJsdoc(html) {
  const script = html.match(/<script\s+props[^>]*>([\s\S]*?)<\/script>/i)
  if (!script) return null
  const block = script[1].match(/\/\*([\s\S]*?)\*\//)
  if (!block) return null
  return block[1]
    .split('\n')
    .map(l => l.replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim()
}

// Expected comment shape:
//   x-foo
//
//   Short description.
//
//   Props:
//     name       — description (default: X)
//     variant    — blue | white | black (default: blue)
//
// We grab the description, then each prop line. If the description contains
// "A | B | C" we treat it as an enum for IDE autocomplete.
function parseJsdoc(text) {
  if (!text) return { description: '', attributes: [] }
  const lines = text.split('\n')
  const propsIdx = lines.findIndex(l => /^\s*Props\b.*:\s*$/i.test(l))

  // Everything between the `x-name` header and `Props:` (or EOF) is the description.
  const headerEnd = propsIdx === -1 ? lines.length : propsIdx
  const description = lines
    .slice(0, headerEnd)
    .filter(l => l.trim() && !/^x-[a-z0-9-]+$/i.test(l.trim()))
    .join(' ')
    .trim()

  if (propsIdx === -1) return { description, attributes: [] }

  const attributes = []
  for (let i = propsIdx + 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const m = line.match(/^\s*([a-z][a-z0-9-]*)\s+[—–-]\s+(.+)$/i)
    if (!m) continue
    const [, name, rest] = m
    const attr = { name, description: rest.trim() }

    const def = rest.match(/\(default:\s*([^)]+)\)/i)
    if (def) attr.default = def[1].trim()

    const withoutDefault = rest.replace(/\(default:[^)]+\)/i, '').trim()
    const enumMatch = withoutDefault.match(/(?:^|:\s*)([a-z][a-z0-9-]*(?:\s*\|\s*[a-z][a-z0-9-]*){1,})/i)
    if (enumMatch) {
      attr.value = { type: 'enum' }
      attr.values = enumMatch[1].split('|').map(s => ({ name: s.trim() }))
    }

    attributes.push(attr)
  }
  return { description, attributes }
}

export function generateWebTypes() {
  const elements = []
  const slotNames = new Set()

  for (const scanDir of SCAN_DIRS) {
    const abs = join(ROOT, scanDir)
    try { statSync(abs) } catch { continue }
    for (const file of findComponentHtml(abs)) {
      const name = `x-${basename(file, '.html')}`
      const html = readFileSync(file, 'utf8')
      const { description, attributes } = parseJsdoc(extractJsdoc(html))
      const el = { name, description: description || `${name} — see ${relative(ROOT, file)}` }
      if (attributes.length) el.attributes = attributes
      elements.push(el)

      // Collect named slots used by this component (<slot-name>).
      for (const m of html.matchAll(/<slot-([a-z][a-z0-9-]*)\b/gi)) slotNames.add(m[1])
    }
  }

  // For every named slot found, register its slot and fill tags so the IDE
  // stops treating `fill:xxx` as an undeclared XML namespace.
  for (const name of slotNames) {
    elements.push({ name: `slot-${name}`, description: `Named slot "${name}" — provides default content.` })
    elements.push({ name: `fill-${name}`, description: `Fills the "${name}" slot of the parent component.` })
  }

  // Built-in tags from posthtml-component and our styleguide snippet.
  elements.push(
    {
      name: 'sg-snippet',
      description: 'Styleguide code snippet. Serializes its content to escaped HTML with a title bar and a Copy button.',
      attributes: [{ name: 'title', description: 'Snippet title.', default: 'HTML' }],
    },
    {
      name: 'if',
      description: 'posthtml-component conditional block.',
      attributes: [{ name: 'condition', description: 'JS expression.' }],
    },
    {
      name: 'each',
      description: 'posthtml-expressions loop. Renders its children for each item.',
      attributes: [{ name: 'loop', description: 'Loop expression: `item in array` or `item, index in array`.' }],
    },
    { name: 'yield', description: 'posthtml-component slot for tag content.' },
    {
      name: 'component',
      description: 'posthtml-component include.',
      attributes: [{ name: 'src', description: 'Path to a partial, relative to src/.' }],
    },
  )

  elements.sort((a, b) => a.name.localeCompare(b.name))

  const webTypes = {
    $schema: 'https://json.schemastore.org/web-types',
    name: 'opeka-front',
    version: '1.0.0',
    'description-markup': 'markdown',
    contributions: { html: { elements } },
  }

  writeFileSync(join(ROOT, 'web-types.json'), JSON.stringify(webTypes, null, 2) + '\n')
  return { tags: elements.length, withAttrs: elements.filter(e => e.attributes).length }
}

// Run directly via `node scripts/gen-web-types.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  const { tags, withAttrs } = generateWebTypes()
  console.log(`✓ web-types.json: ${tags} tags (${withAttrs} with attrs)`)
}
