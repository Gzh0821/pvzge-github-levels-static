import levelText from './level-text.mjs'

const text = value => typeof value === 'string'
  ? value.replace(/<\/?(?:color|size|b|i|u|outline)(?:=[^>]*)?>/gi, '').trim().slice(0, 4096) : ''

function localized(base, translations, number) {
  const values = { default: /^\[[A-Z0-9_]+\]$/.test(base || '') ? '' : text(base), ...levelText[base] }
  for (const [key, value] of Object.entries(translations || {})) {
    if (['zh', 'en', 'es', 'ru', 'zh-CN', 'es-ES', 'ru-RU'].includes(key) && text(value)) values[key] = text(value)
  }
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value).map(([key, value]) =>
    [key, text(value).replaceAll('<LEVELNUMBER>', String(number ?? '')).replaceAll('<PLAYERNAME>', key === 'zh' ? '玩家' : 'Player')])
    .filter(([, value]) => !/<[A-Z_]+>/.test(value)))
}

export function summarizeLevel(raw, path) {
  const objects = raw.objects || []
  const data = name => objects.find(object => object?.objclass === name)?.objdata
  const definition = data('LevelDefinition') || {}
  const seed = data('SeedBankProperties')
  const manager = objects.find(object => object?.objclass === 'WaveManagerProperties' && Array.isArray(object.objdata?.Waves))?.objdata
  return {
    title: { default: text(raw['#comment'] || path.split('/').at(-1)), ...localized(definition.Name, definition.NameMultiLanguage, definition.LevelNumber) },
    description: localized(definition.Description, definition.DescriptionMultiLanguage, definition.LevelNumber),
    author: text(definition.WrittenBy || definition.WritenBy),
    folder: path.split('/')[0],
    stage: /^RTID\((.+)@(?:LevelModules|CurrentLevel)\)$/.exec(definition.StageModule || '')?.[1] || '',
    startingSun: Number.isFinite(definition.StartingSun) ? definition.StartingSun : null,
    seedMode: data('ConveyorSeedBankProperties') ? 'conveyor' : seed ? (seed.SelectionMethod || 'chooser') : 'none',
    waveCount: manager ? manager.Waves.length : null,
  }
}
