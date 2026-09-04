// Load a topic folder into the library.
//
// A topic folder is what comes out of the worksheet pipeline: one subfolder per
// worksheet, each holding a .pptx and a Solution Videos folder. This does the
// part of the conversion that is mechanical and refuses to guess at the part
// that is not.
//
// It DOES: work out the path's shape from the folder names, pull the deck text
// and the character art out of every .pptx, copy and compress the solution
// videos under predictable ids, and create the path in the library at the
// Imported stage with the source text attached to each worksheet.
//
// It does NOT write activities. Deciding that question 3 is a numbered passage
// with a click-the-error and two rewrites, and what the answers are, is reading
// comprehension — and a wrong answer key that looks confident is worse than an
// empty worksheet. Every imported worksheet lands with no activities and a flag
// saying so, which proofing reports and which blocks publishing until a person
// has been through it.
//
//   node tools/import-topic.mjs "~/Downloads/Edit Drafts Parts of Speech" \
//        --title "Edit Drafts: Parts of Speech" --grade 5 --domain Composition
//   ... add --push http://localhost:8788 to send it to a running library.

import { readdirSync, existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, statSync } from 'node:fs'
import { join, basename, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { unzipSync } from 'node:zlib'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const args = process.argv.slice(2)
const folder = (args[0] || '').replace(/^~/, process.env.HOME || '~')
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback
}
if (!folder || !existsSync(folder)) {
  console.error('Usage: node tools/import-topic.mjs "<topic folder>" [--title T] [--grade 5] [--state TX] [--domain D] [--push URL]')
  process.exit(1)
}

const DRY = args.includes('--dry')

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40)

/* ---------- the shape of the path, from the folder names ---------- */

const subs = readdirSync(folder, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

const isSB = (n) => /^sb[\s_-]/i.test(n)
const isFull = (n) => /full\s*topic/i.test(n)
const stripSB = (n) => n.replace(/^sb[\s_-]+/i, '').trim()

const core = subs.filter((n) => !isSB(n) && !isFull(n)).sort()
const sbs = subs.filter(isSB)
const full = subs.find(isFull) || null

if (!core.length) { console.error(`No worksheet folders in ${folder}.`); process.exit(1) }

/* ---------- deck text and art ---------- */

function pptxParts(file) {
  // A .pptx is a zip. Read the central directory rather than shelling out, so
  // this works with nothing installed.
  const buf = readFileSync(file)
  const parts = {}
  let i = buf.length - 22
  while (i > 0 && buf.readUInt32LE(i) !== 0x06054b50) i--
  let n = buf.readUInt16LE(i + 10)
  let off = buf.readUInt32LE(i + 16)
  for (let k = 0; k < n; k++) {
    const nameLen = buf.readUInt16LE(off + 28)
    const extraLen = buf.readUInt16LE(off + 30)
    const commentLen = buf.readUInt16LE(off + 32)
    const local = buf.readUInt32LE(off + 42)
    const name = buf.toString('utf8', off + 46, off + 46 + nameLen)
    const method = buf.readUInt16LE(off + 10)
    const size = buf.readUInt32LE(off + 24)
    const lnLen = buf.readUInt16LE(local + 26)
    const leLen = buf.readUInt16LE(local + 28)
    const start = local + 30 + lnLen + leLen
    const raw = buf.subarray(start, start + buf.readUInt32LE(off + 20))
    try { parts[name] = method === 0 ? raw : unzipSync(raw, { finishFlush: 2 }) } catch { /* skip */ }
    off += 46 + nameLen + extraLen + commentLen
  }
  return parts
}

function slideText(parts) {
  const slides = Object.keys(parts)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => Number(a.match(/(\d+)/)[1]) - Number(b.match(/(\d+)/)[1]))
  return slides.map((n) => {
    const xml = parts[n].toString('utf8')
    const paras = xml.split('</a:p>')
    return paras.map((p) => {
      const runs = [...p.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => m[1])
      return runs.join('')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .trim()
    }).filter(Boolean)
  })
}

/* The QR code and the "Worksheets, Clearly Enhanced" banner sit in every deck at
 * identical bytes, so they are recognised by being in every deck rather than by
 * a size guess that would also throw away small art. */
function artFrom(parts) {
  const found = []
  for (const [name, data] of Object.entries(parts)) {
    if (!/^ppt\/media\/.*\.(png|jpe?g)$/i.test(name)) continue
    if (data.length < 20000) continue
    found.push({ h: createHash('sha1').update(data).digest('hex').slice(0, 10), data })
  }
  return found
}

/* Named by content, so the same drawing used by two worksheets is one file and
 * a re-import overwrites rather than accumulates. Trimmed of its transparent
 * margin and cut to the height it actually renders at — the decks ship these at
 * 1080x1350 and about a megabyte each, which is thirty times what the page uses. */
function writeArt(items, outDir, dry) {
  const written = []
  for (const a of items) {
    const id = `art-${a.h}`
    written.push(id)
    const dest = join(outDir, `${id}.webp`)
    if (dry || existsSync(dest)) continue
    const tmp = join(outDir, `.${id}.src`)
    writeFileSync(tmp, a.data)
    try {
      execFileSync('python3', ['-c', `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGBA')
bb = im.getbbox()
if bb: im = im.crop(bb)
if im.height > 480:
    im = im.resize((round(im.width * 480 / im.height), 480), Image.LANCZOS)
im.save(sys.argv[2], 'WEBP', quality=88, method=6)
`, tmp, dest], { stdio: 'ignore' })
    } catch { /* leave it out rather than ship a megabyte */ }
    try { execFileSync('rm', ['-f', tmp]) } catch {}
  }
  return written
}

/* ---------- videos ---------- */

let ffmpeg = null
try {
  ffmpeg = execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'], { encoding: 'utf8' }).trim()
} catch { /* videos get copied without re-encoding */ }

function videosFor(dir, wsId, outDir, dry) {
  const vdir = readdirSync(dir, { withFileTypes: true }).find((d) => d.isDirectory() && /solution/i.test(d.name))
  if (!vdir) return []
  const from = join(dir, vdir.name)
  const out = []
  for (const f of readdirSync(from).filter((f) => f.toLowerCase().endsWith('.mp4'))) {
    const m = f.match(/#\s*(\d+)/)
    const id = `${wsId}-${m ? m[1] : slug(f)}`
    const dest = join(outDir, `${id}.mp4`)
    if (dry || existsSync(dest)) { out.push({ id, n: m ? Number(m[1]) : null, kb: 0 }); continue }
    if (ffmpeg) {
      try {
        execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', join(from, f),
          '-c:v', 'libx264', '-crf', '30', '-preset', 'slow', '-tune', 'stillimage',
          '-c:a', 'aac', '-b:a', '64k', '-ac', '1', '-movflags', '+faststart', dest], { stdio: 'ignore' })
      } catch { copyFileSync(join(from, f), dest) }
    } else copyFileSync(join(from, f), dest)
    out.push({ id, n: m ? Number(m[1]) : null, kb: Math.round(statSync(dest).size / 1024) })
  }
  return out.sort((a, b) => (a.n || 0) - (b.n || 0))
}

/* ---------- build the path ---------- */

const ART_OUT = join(ROOT, 'public', 'art')
const VID_OUT = join(ROOT, 'public', 'solutions')
mkdirSync(ART_OUT, { recursive: true })
mkdirSync(VID_OUT, { recursive: true })

const title = opt('title', basename(folder))
const topicId = slug(opt('id', title))

function readWorksheet(name, wsId) {
  const dir = join(folder, name)
  const deck = readdirSync(dir).find((f) => f.toLowerCase().endsWith('.pptx'))
  if (!deck) return null
  const parts = pptxParts(join(dir, deck))
  const slides = slideText(parts)
  const art = writeArt((rawArt.get(name) || []).filter((a) => !CHROME.has(a.h)), ART_OUT, DRY)
  const videos = videosFor(dir, wsId, VID_OUT, DRY)
  return {
    id: wsId,
    title: name.replace(/^sb[\s_-]+/i, 'SB: '),
    standards: [],
    skill: '',
    activities: [],
    flag: 'Imported from the deck. The activities have not been written yet — the source text is below, and nothing here can go live until somebody converts it.',
    source: { deck, slides, videos: videos.map((v) => v.id), art },
  }
}

/* Read every deck's art before writing any of it, so the images that appear in
 * all of them can be recognised for what they are: the QR code and the house
 * banner, which are page furniture and not worksheet art. A size threshold
 * cannot tell those apart from a small drawing — being in every single deck can. */
const rawArt = new Map()   // worksheet folder -> [{h, data}]
for (const name of [...core, ...sbs, ...(full ? [full] : [])]) {
  const dir = join(folder, name)
  const deck = readdirSync(dir).find((f) => f.toLowerCase().endsWith('.pptx'))
  if (deck) rawArt.set(name, artFrom(pptxParts(join(dir, deck))))
}
const deckCount = rawArt.size
const seenIn = new Map()
for (const items of rawArt.values()) for (const h of new Set(items.map((a) => a.h))) seenIn.set(h, (seenIn.get(h) || 0) + 1)
const CHROME = new Set([...seenIn.entries()].filter(([, n]) => n === deckCount && deckCount > 1).map(([h]) => h))
if (CHROME.size) console.log(`  ignoring ${CHROME.size} image${CHROME.size === 1 ? ' that appears' : 's that appear'} in every deck (QR code, banner)`)

const coreSheets = core.map((n, i) => readWorksheet(n, `${topicId}_${slug(n)}`)).filter(Boolean)
const skillBuilders = {}
for (const sb of sbs) {
  const target = coreSheets.find((w) => slug(w.title) === slug(stripSB(sb)))
  const ws = readWorksheet(sb, `${topicId}_sb_${slug(stripSB(sb))}`)
  if (ws && target) skillBuilders[target.id] = ws
  else if (ws) console.warn(`  ! "${sb}" has no matching core worksheet — skipped`)
}
const fullSheet = full ? readWorksheet(full, `${topicId}_full`) : null

const topic = {
  id: topicId,
  title,
  short: opt('short', title),
  state: opt('state', 'TX'),
  grade: opt('grade', null),
  domain: opt('domain', ''),
  standards: [],
  blurb: '',
  icon: opt('icon', '📘'),
  core: coreSheets,
  skillBuilders,
  full: fullSheet,
}

const outFile = join(ROOT, 'data', `import-${topicId}.json`)
mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(topic, null, 1) + '\n')

console.log(`${title}`)
console.log(`  ${coreSheets.length} core, ${Object.keys(skillBuilders).length} skill builders, ${fullSheet ? '1 capstone' : 'no capstone'}`)
const vids = [...coreSheets, ...Object.values(skillBuilders), ...(fullSheet ? [fullSheet] : [])]
  .reduce((n, w) => n + w.source.videos.length, 0)
console.log(`  ${vids} solution videos${DRY ? ' (not written — dry run)' : ffmpeg ? ' (compressed)' : ' (copied — no ffmpeg found)'}`)
const artCount = new Set([...coreSheets, ...Object.values(skillBuilders), ...(fullSheet ? [fullSheet] : [])]
  .flatMap((w) => w.source.art)).size
console.log(`  ${artCount} distinct illustrations${DRY ? ' (not written — dry run)' : ''}`)
console.log(`  written to ${outFile.replace(ROOT + '/', '')}`)
console.log(`\n  Every worksheet is flagged and has no activities yet. That is the point:`)
console.log(`  the deck text is attached to each one for whoever converts it.`)

const push = opt('push', null)
if (push) {
  const r = await fetch(`${push.replace(/\/$/, '')}/api/library/seed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-studio-key': process.env.STUDIO_KEY || '' },
    body: JSON.stringify({ topics: [topic], overwrite: true }),
  })
  const j = await r.json().catch(() => ({}))
  console.log(r.ok ? `\n  pushed to ${push} — ${JSON.stringify(j.seeded || j)}` : `\n  push failed: ${j.error || r.status}`)
}
