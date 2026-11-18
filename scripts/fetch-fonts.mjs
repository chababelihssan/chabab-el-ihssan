// Télécharge Cairo + Lalezar (Google Fonts, licence OFL) vers public/fonts/ UNE SEULE FOIS.
// Sans dépendance. Ignoré si les fichiers existent déjà (build hors-ligne OK après le 1er commit).
// Usage : node scripts/fetch-fonts.mjs   (lancé aussi automatiquement par "npm run build")
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const OUT = new URL('../public/fonts/', import.meta.url)
const CSS_URL = process.env.FONTS_CSS_URL ||
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Lalezar&display=swap'
// Un User-Agent moderne => Google renvoie du woff2
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// Fichiers attendus (référencés par src/fonts.css et index.html)
const WANTED = {
  'cairo-arabic.woff2': { family: 'Cairo', subset: 'arabic' },
  'cairo-latin.woff2': { family: 'Cairo', subset: 'latin' },
  'lalezar-arabic.woff2': { family: 'Lalezar', subset: 'arabic' },
  'lalezar-latin.woff2': { family: 'Lalezar', subset: 'latin' },
}

const missing = Object.keys(WANTED).filter((f) => !fs.existsSync(new URL(f, OUT)))
if (!missing.length) { console.log('[fonts] déjà présentes — rien à faire'); process.exit(0) }

const get = async (url, asText) => {
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`)
  return asText ? r.text() : Buffer.from(await r.arrayBuffer())
}

try {
  const css = await get(CSS_URL, true)
  // Blocs: /* arabic */ @font-face { font-family: 'Cairo'; ... src: url(...) ... }
  const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g)]
  fs.mkdirSync(OUT, { recursive: true })
  for (const file of missing) {
    const { family, subset } = WANTED[file]
    // Cairo est une police variable : un seul fichier couvre tous les graisses 400-700
    const b = blocks.find(([, sub, body]) => sub === subset && body.includes(`'${family}'`))
    const url = b && (b[2].match(/url\(([^)]+\.woff2)\)/) || [])[1]
    if (!url) throw new Error(`bloc introuvable: ${family}/${subset}`)
    fs.writeFileSync(new URL(file, OUT), await get(url.replace(/['"]/g, ''), false))
    console.log('[fonts] ✓', file)
  }
} catch (e) {
  console.error('[fonts] ÉCHEC :', e.message)
  console.error('[fonts] Lancez "node scripts/fetch-fonts.mjs" avec internet puis committez public/fonts/.')
  process.exit(1) // le build échoue => l'ancien site reste en ligne (jamais de site sans police)
}
