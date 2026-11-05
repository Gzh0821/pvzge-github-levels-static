import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstat, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = resolve(root, 'public-pages')
const origin = 'https://levels.pvzge.com'
const base = '/api/github-levels'
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' })

// Reuse the upstream strict JSON, LevelDefinition, depth and node validation.
execFileSync(process.execPath, ['scripts/build-levels-index.mjs'], {
  cwd: root,
  stdio: 'inherit',
})
const index = JSON.parse(await readFile(resolve(root, 'levels-index.json'), 'utf8'))
if (index.version !== 1 || !Array.isArray(index.levels) || index.levels.length > 4000)
  throw Error('static-level-count-limit')

const entries = git('ls-tree', '-r', '-t', '-l', '-z', 'HEAD')
  .split('\0').filter(Boolean).map(record => {
    const tab = record.indexOf('\t')
    const [mode, type, sha, size] = record.slice(0, tab).trim().split(/\s+/)
    return { path: record.slice(tab + 1), mode, type, sha, ...(type === 'blob' ? { size: Number(size) } : {}) }
  })
const byPath = new Map(entries.map(entry => [entry.path, entry]))
const files = []
let totalBytes = 0
for (const level of index.levels) {
  if (typeof level.path !== 'string' || /[\\\x00-\x1f\x7f]/.test(level.path) ||
      !level.path.split('/').every(part => part && part !== '.' && part !== '..'))
    throw Error('static-level-path-invalid')
  const entry = byPath.get(level.path)
  const path = resolve(root, level.path)
  const stat = await lstat(path)
  if (!entry || entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode) ||
      !stat.isFile() || stat.size > 10_000_000)
    throw Error('static-level-file-invalid')
  const bytes = await readFile(path)
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  const blobSha = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  if (bytes.length !== level.size || bytes.length !== entry.size ||
      sha256 !== level.sha256 || blobSha !== entry.sha)
    throw Error('static-level-hash-mismatch')
  totalBytes += bytes.length
  if (totalBytes > 64_000_000) throw Error('static-level-total-limit')
  files.push({ entry, bytes })
}
if (!files.length) throw Error('static-levels-empty')

const paths = new Set(files.map(file => file.entry.path))
const directories = new Set()
for (const path of paths) {
  let parent = dirname(path)
  while (parent !== '.') {
    directories.add(parent)
    parent = dirname(parent)
  }
}
const tree = entries.filter(entry => paths.has(entry.path) || directories.has(entry.path))
  .map(entry => ({ ...entry, ...(paths.has(entry.path) ? {
    url: `${origin}${base}/raw/main/${entry.path.split('/').map(encodeURIComponent).join('/')}`,
  } : {}) }))
const directory = JSON.stringify({
  sha: git('rev-parse', 'HEAD^{tree}').trim(),
  url: `${origin}${base}/git/trees/main?recursive=1`,
  tree,
  truncated: false,
})
if (Buffer.byteLength(directory) > 25 * 1024 * 1024) throw Error('static-directory-size-limit')

// This directory contains only static JSON and Pages header/404 configuration.
await rm(output, { recursive: true, force: true })
for (const { entry, bytes } of files) {
  const destination = resolve(output, `api/github-levels/raw/main/${entry.path}`)
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, bytes)
}
await mkdir(resolve(output, 'api/github-levels/git/trees'), { recursive: true })
await writeFile(resolve(output, 'api/github-levels/git/trees/main'), directory)
await writeFile(resolve(output, '_headers'), `/api/github-levels/*\n  Content-Type: application/json; charset=utf-8\n  Access-Control-Allow-Origin: *\n  Access-Control-Expose-Headers: ETag, Content-Length\n  Cache-Control: public, max-age=60\n  X-Content-Type-Options: nosniff\n`)
await writeFile(resolve(output, '404.html'), '<!doctype html><meta charset="utf-8"><title>Not Found</title>Not Found\n')
console.log(JSON.stringify({ service: 'github-levels-static-pages', levels: files.length,
  entries: tree.length, bytes: totalBytes, output: 'public-pages', functions: false, r2: false }))
