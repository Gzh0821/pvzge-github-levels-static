import test from 'node:test'
import assert from 'node:assert/strict'
import { summarizeLevel } from '../scripts/level-summary.mjs'

test('summary preserves localized titles, author spelling and explicit zeroes without inventing metadata', () => {
  const raw = { objects: [
    { objclass: 'LevelDefinition', objdata: { Name: 'Level', NameMultiLanguage: { zh: '<color=red>第 <LEVELNUMBER> 关</color>' }, LevelNumber: 7, WritenBy: 'Author', StartingSun: 0, StageModule: 'RTID(PirateStage@LevelModules)' } },
    { objclass: 'WaveManagerProperties', objdata: { Waves: [[], []] } },
    { objclass: 'ConveyorSeedBankProperties', objdata: {} },
  ] }
  const result = summarizeLevel(raw, 'Author/one.JSON')
  assert.equal(result.title.zh, '第 7 关')
  assert.equal(result.author, 'Author')
  assert.equal(result.startingSun, 0)
  assert.equal(result.waveCount, 2)
  assert.equal(result.stage, 'PirateStage')
  assert.equal(result.seedMode, 'conveyor')
  const missing = summarizeLevel({ objects: [] }, 'Folder/one.json')
  assert.deepEqual(missing.title, { default: 'one.json' })
  assert.equal(missing.author, '')
  assert.equal(missing.startingSun, null)
  const named = summarizeLevel({ objects: [{ objclass: 'LevelDefinition', objdata: { Name: '[EGYPT_LEVEL_NAME]', LevelNumber: 4 } }] }, 'one.json')
  assert.equal(named.title.zh, '神秘埃及 - 第 4 天')
})
