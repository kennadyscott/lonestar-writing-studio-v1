// Push the solution videos to Cloudflare R2.
//
// R2 speaks S3, and Node speaks SigV4 well enough with node:crypto, so this
// adds no dependency and no CLI to install. It uploads only what has changed,
// then writes a manifest so the rest of the app knows which videos exist
// without asking R2 at runtime — proofing should not depend on a network call
// to a bucket, and a student's page load certainly should not.
//
//   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET=... \
//     node tools/upload-media.mjs [--force]

import { createHash, createHmac } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, 'public', 'solutions')
const MANIFEST = join(ROOT, 'data', 'media-manifest.json')

const ACCOUNT = process.env.R2_ACCOUNT_ID || ''
const KEY = process.env.R2_ACCESS_KEY_ID || ''
const SECRET = process.env.R2_SECRET_ACCESS_KEY || ''
const BUCKET = process.env.R2_BUCKET || ''
const FORCE = process.argv.includes('--force')

if (!ACCOUNT || !KEY || !SECRET || !BUCKET) {
  console.error('Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET.')
  process.exit(1)
}

const HOST = `${ACCOUNT}.r2.cloudflarestorage.com`
const sha256 = (b) => createHash('sha256').update(b).digest('hex')
const hmac = (k, v) => createHmac('sha256', k).update(v).digest()

function sign(method, key, body, contentType) {
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const date = amzDate.slice(0, 8)
  const payloadHash = sha256(body)
  const canonicalUri = `/${BUCKET}/${key}`
  const headers = {
    host: HOST,
    'content-type': contentType,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  }
  const signed = Object.keys(headers).sort()
  const canonicalHeaders = signed.map((h) => `${h}:${headers[h]}\n`).join('')
  const signedHeaders = signed.join(';')
  const canonicalRequest = [method, canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')
  const scope = `${date}/auto/s3/aws4_request`
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n')
  let k = hmac(`AWS4${SECRET}`, date)
  for (const part of ['auto', 's3', 'aws4_request']) k = hmac(k, part)
  const signature = createHmac('sha256', k).update(toSign).digest('hex')
  return {
    url: `https://${HOST}${canonicalUri}`,
    headers: {
      ...headers,
      authorization: `AWS4-HMAC-SHA256 Credential=${KEY}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  }
}

const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { videos: {} }
const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.mp4')).sort() : []
if (!files.length) { console.error(`No .mp4 files in ${DIR}`); process.exit(1) }

const videos = {}
let sent = 0
let skipped = 0

for (const file of files) {
  const id = file.replace(/\.mp4$/, '')
  const body = readFileSync(join(DIR, file))
  const hash = sha256(body)
  if (!FORCE && prev.videos?.[id]?.sha256 === hash) {
    videos[id] = prev.videos[id]; skipped++
    process.stdout.write(`\r  ${sent} uploaded, ${skipped} unchanged`)
    continue
  }
  const { url, headers } = sign('PUT', file, body, 'video/mp4')
  const r = await fetch(url, { method: 'PUT', headers, body })
  if (!r.ok) {
    console.error(`\n${file}: ${r.status} ${(await r.text()).slice(0, 300)}`)
    process.exit(1)
  }
  videos[id] = { sha256: hash, bytes: body.length }
  sent++
  process.stdout.write(`\r  ${sent} uploaded, ${skipped} unchanged`)
}

writeFileSync(MANIFEST, JSON.stringify({
  bucket: BUCKET,
  updated: new Date().toISOString(),
  videos,
}, null, 1) + '\n')

const total = Object.values(videos).reduce((n, v) => n + v.bytes, 0)
console.log(`\n${Object.keys(videos).length} videos, ${(total / 1e6).toFixed(1)} MB.`)
console.log(`Manifest written to data/media-manifest.json.`)
console.log(`Set VITE_MEDIA_BASE to the bucket's public URL, with a trailing slash.`)
