// Push the TEKS catalog into ClearK12 Studio's core schema.
//
// The parse happens on a laptop because it needs the PDFs; the write happens
// through the deployed API because that is where the service key lives. Runs
// are idempotent — rows upsert on (state, subject, grade, standard_id), so
// re-importing a corrected chapter updates in place instead of duplicating.
//
//   STUDIO_KEY=... node tools/push-core.mjs https://your-app.vercel.app [data/teks-tx.json]

import { readFileSync } from 'node:fs'

const base = (process.argv[2] || '').replace(/\/$/, '')
const file = process.argv[3] || new URL('../data/teks-tx.json', import.meta.url).pathname
const key = process.env.STUDIO_KEY || ''

if (!base) { console.error('Usage: STUDIO_KEY=... node tools/push-core.mjs https://your-app.vercel.app'); process.exit(1) }

const { rows } = JSON.parse(readFileSync(file, 'utf8'))
console.log(`${rows.length} standards from ${file}`)

const CHUNK = 400
let done = 0
for (let i = 0; i < rows.length; i += CHUNK) {
  const slice = rows.slice(i, i + CHUNK)
  const r = await fetch(`${base}/api/library/core/standards`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-studio-key': key },
    body: JSON.stringify({ rows: slice }),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) { console.error(`\nfailed at row ${i}: ${j.error || r.status}`); process.exit(1) }
  done += slice.length
  process.stdout.write(`\r  imported ${done}/${rows.length}`)
}
console.log('\ndone.')
