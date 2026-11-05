import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, mkdir, copyFile, writeFile, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

test('Pages preserves client URLs and bytes, excludes invalid/source files, and has no runtime', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pvzge-static-pages-test-'))
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' })
  try {
    await mkdir(join(root, 'scripts'))
    await mkdir(join(root, '中文 space'))
    for (const script of ['build-levels-index.mjs', 'build-static-pages.mjs'])
      await copyFile(new URL(`../scripts/${script}`, import.meta.url), join(root, 'scripts', script))
    const text = JSON.stringify({ objects: [{ objclass: 'LevelDefinition', objdata: {} }] })
    await writeFile(join(root, '中文 space', 'One.JSON'), text)
    await writeFile(join(root, 'invalid.json'), '{broken')
    await writeFile(join(root, 'secret.txt'), 'not a level')
    git('init', '-q')
    git('add', '.')
    git('-c', 'user.name=Static fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture')
    execFileSync(process.execPath, ['scripts/build-static-pages.mjs'], { cwd: root })
    const output = join(root, 'public-pages')
    const directory = JSON.parse(await readFile(join(output, 'api/github-levels/git/trees/main'), 'utf8'))
    const entry = directory.tree.find(item => item.type === 'blob')
    assert.equal(entry.path, '中文 space/One.JSON')
    assert.equal(entry.url, 'https://levels.pvzge.com/api/github-levels/raw/main/%E4%B8%AD%E6%96%87%20space/One.JSON')
    assert.equal(entry.sha, createHash('sha1').update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest('hex'))
    assert.equal(directory.truncated, false)
    assert.equal(await readFile(join(output, 'api/github-levels/raw/main/中文 space/One.JSON'), 'utf8'), text)
    assert.deepEqual((await readdir(output)).sort(), ['404.html', '_headers', 'api'])
    assert.equal(directory.tree.some(item => item.path === 'invalid.json' || item.path === 'secret.txt'), false)
    assert.match(await readFile(join(output, '_headers'), 'utf8'), /Access-Control-Allow-Origin: \*/)
    assert.match(await readFile(join(output, '_headers'), 'utf8'), /Content-Type: application\/json/)
    assert.match(await readFile(join(output, '404.html'), 'utf8'), /Not Found/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
