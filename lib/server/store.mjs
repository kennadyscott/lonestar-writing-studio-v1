// Where learning paths live.
//
// Two implementations behind one interface. Supabase is the real one; the JSON
// file is what runs on a laptop with no credentials, so the platform can be
// built and demoed before the project exists. Which one you get is decided by
// whether SUPABASE_URL is set — nothing else in the app knows the difference.
//
// Supabase is reached over PostgREST with plain fetch, so this file adds no
// dependency. The service key never leaves the server: every write goes through
// an API route, and the table has RLS on with no policies, which means the
// anon key can read nothing even if it leaks.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const FILE = process.env.LIBRARY_FILE || join(HERE, '..', '..', 'server', 'library.json')

const URL_ = process.env.SUPABASE_URL || ''
const KEY = process.env.SUPABASE_SERVICE_KEY || ''

export const backend = URL_ && KEY ? 'supabase' : 'file'

/* ---------- supabase ---------- */

async function pg(path, init = {}) {
  const r = await fetch(`${URL_}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: KEY,
      authorization: `Bearer ${KEY}`,
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
  })
  const text = await r.text()
  if (!r.ok) throw new Error(`supabase ${r.status}: ${text.slice(0, 300)}`)
  return text ? JSON.parse(text) : null
}

const supabaseStore = {
  async listPaths() {
    return pg('paths?select=id,title,short,grade,standards,blurb,icon,status,live_version,updated_at&order=updated_at.desc')
  },
  async getPath(id) {
    const rows = await pg(`paths?id=eq.${encodeURIComponent(id)}&select=*`)
    return rows[0] || null
  },
  async putPath(row) {
    const rows = await pg('paths', {
      method: 'POST',
      headers: { prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
    })
    return rows[0]
  },
  async deletePath(id) {
    await pg(`paths?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })
    return true
  },
  async listVersions(pathId) {
    return pg(`path_versions?path_id=eq.${encodeURIComponent(pathId)}&select=version,note,points,created_at&order=version.desc`)
  },
  async getVersion(pathId, version) {
    const rows = await pg(`path_versions?path_id=eq.${encodeURIComponent(pathId)}&version=eq.${version}&select=*`)
    return rows[0] || null
  },
  async addVersion(row) {
    const rows = await pg('path_versions', {
      method: 'POST', headers: { prefer: 'return=representation' }, body: JSON.stringify(row),
    })
    return rows[0]
  },
  async livePaths() {
    // Students get the approved snapshot, never the working draft.
    const paths = await pg("paths?status=eq.published&live_version=not.is.null&select=id,live_version&order=sort.asc.nullslast,title.asc")
    const out = []
    for (const p of paths) {
      const v = await this.getVersion(p.id, p.live_version)
      if (v) out.push(v.content)
    }
    return out
  },
}

/* ---------- json file ---------- */

const blank = { paths: [], versions: [] }
const read = () => { try { return existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : { ...blank } } catch { return { ...blank } } }
const write = (d) => writeFileSync(FILE, JSON.stringify(d, null, 2))
const clone = (x) => JSON.parse(JSON.stringify(x))

const fileStore = {
  async listPaths() {
    return read().paths.map(({ draft, ...rest }) => rest)
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))
  },
  async getPath(id) { return clone(read().paths.find((p) => p.id === id) || null) },
  async putPath(row) {
    const d = read()
    const i = d.paths.findIndex((p) => p.id === row.id)
    const next = { ...(i >= 0 ? d.paths[i] : {}), ...row, updated_at: new Date().toISOString() }
    if (i >= 0) d.paths[i] = next; else d.paths.push({ created_at: next.updated_at, ...next })
    write(d)
    return clone(next)
  },
  async deletePath(id) {
    const d = read()
    d.paths = d.paths.filter((p) => p.id !== id)
    d.versions = d.versions.filter((v) => v.path_id !== id)
    write(d); return true
  },
  async listVersions(pathId) {
    return read().versions.filter((v) => v.path_id === pathId)
      .map(({ content, ...rest }) => rest).sort((a, b) => b.version - a.version)
  },
  async getVersion(pathId, version) {
    return clone(read().versions.find((v) => v.path_id === pathId && v.version === Number(version)) || null)
  },
  async addVersion(row) {
    const d = read()
    d.versions.push({ created_at: new Date().toISOString(), ...row })
    write(d); return clone(row)
  },
  async livePaths() {
    const d = read()
    return d.paths
      .filter((p) => p.status === 'published' && p.live_version != null)
      .sort((a, b) => (a.sort ?? 99) - (b.sort ?? 99) || String(a.title).localeCompare(String(b.title)))
      .map((p) => (d.versions.find((v) => v.path_id === p.id && v.version === p.live_version) || {}).content)
      .filter(Boolean)
      .map(clone)
  },
}

export const store = backend === 'supabase' ? supabaseStore : fileStore
