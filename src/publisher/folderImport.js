// Read a topic folder in the browser.
//
// A .pptx is a zip, and the browser can open one with no help: the central
// directory is a few offsets, and DecompressionStream('deflate-raw') does the
// rest. That matters more than tidiness — parsing here means the decks never
// travel anywhere, so a folder of any size imports without meeting an upload
// limit or waiting on a network.
//
// Solution videos are the exception and are deliberately left behind: a hundred
// recordings is tens of megabytes, which belongs in object storage rather than
// in a request body. They are counted and reported so nobody imagines they came.

const dec = new TextDecoder()

/* ---------- zip ---------- */

async function unzip(buffer) {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  let eocd = buffer.byteLength - 22
  while (eocd >= 0 && view.getUint32(eocd, true) !== 0x06054b50) eocd--
  if (eocd < 0) throw new Error('Not a zip file')

  const count = view.getUint16(eocd + 10, true)
  let p = view.getUint32(eocd + 16, true)
  const out = {}

  for (let i = 0; i < count; i++) {
    const nameLen = view.getUint16(p + 28, true)
    const extraLen = view.getUint16(p + 30, true)
    const commentLen = view.getUint16(p + 32, true)
    const method = view.getUint16(p + 10, true)
    const compSize = view.getUint32(p + 20, true)
    const local = view.getUint32(p + 42, true)
    const name = dec.decode(bytes.subarray(p + 46, p + 46 + nameLen))

    const lNameLen = view.getUint16(local + 26, true)
    const lExtraLen = view.getUint16(local + 28, true)
    const start = local + 30 + lNameLen + lExtraLen
    const raw = bytes.subarray(start, start + compSize)

    if (method === 0) out[name] = raw
    else if (method === 8) {
      const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      out[name] = new Uint8Array(await new Response(stream).arrayBuffer())
    }
    p += 46 + nameLen + extraLen + commentLen
  }
  return out
}

/* ---------- deck text ---------- */

const unescapeXml = (s) => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")

function slideText(parts) {
  return Object.keys(parts)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => Number(a.match(/(\d+)/)[1]) - Number(b.match(/(\d+)/)[1]))
    .map((n) => dec.decode(parts[n])
      .split('</a:p>')
      .map((para) => unescapeXml([...para.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map((m) => m[1]).join('')).trim())
      .filter(Boolean))
}

/* ---------- art ---------- */

const sha1 = async (bytes) => {
  const d = await crypto.subtle.digest('SHA-1', bytes)
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 10)
}

function rawArt(parts) {
  return Object.entries(parts)
    .filter(([n, d]) => /^ppt\/media\/.*\.(png|jpe?g)$/i.test(n) && d.length >= 20000)
    .map(([, d]) => d)
}

/* Trim the transparent margin and cut to the height the page renders at. The
 * decks ship these at 1080x1350 and about a megabyte each; the studio shows
 * them 210 pixels tall. */
async function toWebp(bytes) {
  const bmp = await createImageBitmap(new Blob([bytes]))
  const c = document.createElement('canvas')
  c.width = bmp.width; c.height = bmp.height
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bmp, 0, 0)

  const { data } = ctx.getImageData(0, 0, c.width, c.height)
  let top = c.height, left = c.width, right = -1, bottom = -1
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (data[(y * c.width + x) * 4 + 3] > 8) {
        if (y < top) top = y
        if (y > bottom) bottom = y
        if (x < left) left = x
        if (x > right) right = x
      }
    }
  }
  if (right < 0) { top = 0; left = 0; right = c.width - 1; bottom = c.height - 1 }

  const w = right - left + 1
  const h = bottom - top + 1
  const scale = h > 480 ? 480 / h : 1
  const o = document.createElement('canvas')
  o.width = Math.round(w * scale); o.height = Math.round(h * scale)
  o.getContext('2d').drawImage(bmp, left, top, w, h, 0, 0, o.width, o.height)

  const blob = await new Promise((res) => o.toBlob(res, 'image/webp', 0.88))
  const buf = new Uint8Array(await blob.arrayBuffer())
  let bin = ''
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000))
  return { base64: btoa(bin), bytes: buf.length }
}

/* ---------- the folder ---------- */

const isSB = (n) => /^sb[\s_-]/i.test(n)
const isFull = (n) => /full\s*topic/i.test(n)
const stripSB = (n) => n.replace(/^sb[\s_-]+/i, '').trim()
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40)

/* Group a flat FileList into the worksheet folders it came from. */
export function groupFolder(fileList) {
  const files = [...fileList]
  const rootName = files[0]?.webkitRelativePath?.split('/')[0] || 'Topic'
  const folders = new Map()
  let videos = 0
  for (const f of files) {
    const parts = (f.webkitRelativePath || f.name).split('/')
    if (parts.length < 3) continue
    const ws = parts[1]
    if (/\.mp4$/i.test(f.name)) { videos++; continue }
    if (!/\.pptx$/i.test(f.name)) continue
    if (!folders.has(ws)) folders.set(ws, f)
  }
  return { rootName, folders, videos }
}

export async function readTopicFolder(fileList, meta = {}, onProgress = () => {}) {
  const { rootName, folders, videos } = groupFolder(fileList)
  if (!folders.size) throw new Error('No .pptx files found. Expected one subfolder per worksheet.')

  const names = [...folders.keys()]
  const core = names.filter((n) => !isSB(n) && !isFull(n)).sort()
  const sbs = names.filter(isSB)
  const full = names.find(isFull) || null
  const topicId = slug(meta.id || meta.title || rootName)

  // Parse every deck first, so the images that appear in all of them can be
  // recognised as page furniture rather than guessed at by file size.
  const parsed = new Map()
  let done = 0
  for (const [name, file] of folders) {
    onProgress(`Reading ${name}…`, done / folders.size)
    const parts = await unzip(await file.arrayBuffer())
    const art = []
    for (const bytes of rawArt(parts)) art.push({ h: await sha1(bytes), bytes })
    parsed.set(name, { slides: slideText(parts), art, deck: file.name })
    done++
  }
/* Page furniture is what appears in EVERY deck and is small: the QR code and the
 * house banner. Both conditions matter. Ubiquity alone is too eager on a short
 * topic, where two worksheets sharing one drawing look identical to a logo; size
 * alone throws away small artwork. And with only a couple of decks the ubiquity
 * signal means little, so it is not applied at all. */
  const seen = new Map()
  const size = new Map()
  for (const { art } of parsed.values()) {
    for (const a of art) size.set(a.h, a.bytes.length)
    for (const h of new Set(art.map((a) => a.h))) seen.set(h, (seen.get(h) || 0) + 1)
  }
  const chrome = new Set([...seen]
    .filter(([h, n]) => n === parsed.size && parsed.size >= 3 && (size.get(h) || 0) < 120000)
    .map(([h]) => h))

  const images = new Map()
  const build = async (name, id) => {
    const got = parsed.get(name)
    const keep = got.art.filter((a) => !chrome.has(a.h))
    const ids = []
    for (const a of keep) {
      const artId = `art-${a.h}`
      ids.push(artId)
      if (!images.has(artId)) {
        onProgress(`Preparing artwork…`, 0.8)
        images.set(artId, await toWebp(a.bytes))
      }
    }
    return {
      id, title: name.replace(/^sb[\s_-]+/i, 'SB: '),
      standards: [], skill: '', activities: [],
      flag: 'Imported from the deck. The activities have not been written yet — the source text is below, and nothing here can go live until somebody converts it.',
      source: { deck: got.deck, slides: got.slides, art: ids, videos: [] },
    }
  }

  const coreSheets = []
  for (const n of core) coreSheets.push(await build(n, `${topicId}_${slug(n)}`))
  const skillBuilders = {}
  const orphans = []
  for (const n of sbs) {
    const target = coreSheets.find((w) => slug(w.title) === slug(stripSB(n)))
    const ws = await build(n, `${topicId}_sb_${slug(stripSB(n))}`)
    if (target) skillBuilders[target.id] = ws
    else orphans.push(n)
  }
  const fullSheet = full ? await build(full, `${topicId}_full`) : null

  onProgress('Done', 1)
  return {
    topic: {
      id: topicId,
      title: meta.title || rootName,
      short: meta.short || meta.title || rootName,
      state: meta.state || 'TX',
      grade: meta.grade || null,
      domain: meta.domain || '',
      standards: [], blurb: '', icon: meta.icon || '📘',
      core: coreSheets, skillBuilders, full: fullSheet,
    },
    images: [...images.entries()].map(([id, v]) => ({ id, base64: v.base64, bytes: v.bytes })),
    stats: {
      core: coreSheets.length,
      skillBuilders: Object.keys(skillBuilders).length,
      capstone: !!fullSheet,
      chrome: chrome.size,
      videos,
      orphans,
    },
  }
}
