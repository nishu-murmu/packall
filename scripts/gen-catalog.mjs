// Regenerates the TypeScript catalogue from catalog/packall.json.
//
//   npm run catalog
//
// catalog/packall.json is the single source of truth: the Rust core reads it
// with include_str!, the Go core embeds it, and this script emits the two
// TypeScript modules the desktop frontend imports. Edit the JSON, run this,
// commit both. `npm run catalog:check` fails if they have drifted apart.
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const check = process.argv.includes('--check')

const doc = JSON.parse(await readFile(path.join(root, 'catalog', 'packall.json'), 'utf8'))
if (doc.version !== 1) throw new Error(`unsupported catalogue version: ${doc.version}`)

const q = (value) => JSON.stringify(value)
const indent = (depth) => '  '.repeat(depth)

/** Render a value as TypeScript, one field per line, matching the repo's style. */
function render(value, depth) {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((item) => `${indent(depth + 1)}${render(item, depth + 1)}`)
    return `[\n${items.join(',\n')},\n${indent(depth)}]`
  }
  if (value && typeof value === 'object') {
    const fields = Object.entries(value).map(([key, inner]) => `${indent(depth + 1)}${key}: ${render(inner, depth + 1)}`)
    return `{\n${fields.join(',\n')},\n${indent(depth)}}`
  }
  return q(value)
}

const header = `// GENERATED FILE — do not edit by hand.
// Source: catalog/packall.json. Regenerate with: npm run catalog
`

const categoriesTs = `${header}import type { Category, CategoryId } from "./types"

export const CATEGORIES: Category[] = ${render(doc.categories, 0)}

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c
    return acc
  },
  {} as Record<CategoryId, Category>
)
`

const softwareTs = `${header}import type { SoftwareEntry } from "./types"

export const SOFTWARE: SoftwareEntry[] = ${render(doc.software, 0)}

export const SOFTWARE_MAP: Record<string, SoftwareEntry> = Object.fromEntries(
  SOFTWARE.map((entry) => [entry.id, entry])
)
`

const outputs = [
  ['src/lib/categories.ts', categoriesTs],
  ['src/lib/software.ts', softwareTs],
]

let drifted = false
for (const [file, contents] of outputs) {
  const target = path.join(root, file)
  if (check) {
    const current = await readFile(target, 'utf8').catch(() => null)
    if (current !== contents) {
      console.error(`✘ ${file} is out of date — run: npm run catalog`)
      drifted = true
    }
    continue
  }
  await writeFile(target, contents)
  console.log(`  ${file}`)
}

if (check) {
  if (drifted) process.exit(1)
  console.log(`catalogue in sync (${doc.software.length} apps, ${doc.categories.length} categories)`)
} else {
  console.log(`Generated from ${doc.software.length} apps in ${doc.categories.length} categories`)
}
