// Usage: node scripts/set-version.mjs 0.4.0
// Writes one version into every file the desktop app reads it from.
import { readFileSync, writeFileSync } from 'node:fs'

const ver = (process.argv[2] || '').replace(/^v/, '')
if (!/^\d+\.\d+\.\d+([-+][\w.]+)?$/.test(ver)) {
  console.error(`not a version: "${process.argv[2] ?? ''}"`)
  process.exit(1)
}

const edit = (file, fn) => writeFileSync(file, fn(readFileSync(file, 'utf8')))
const json = (file) =>
  edit(file, (t) => {
    const j = JSON.parse(t)
    j.version = ver
    return JSON.stringify(j, null, 2) + '\n'
  })

json('package.json')
json('src-tauri/tauri.conf.json')
edit('src-tauri/Cargo.toml', (t) => t.replace(/^version = ".*"$/m, `version = "${ver}"`))
edit('src-tauri/Cargo.lock', (t) =>
  t.replace(/(\[\[package\]\]\nname = "packall"\nversion = )".*"/, `$1"${ver}"`)
)
console.log(`version set to ${ver}`)
