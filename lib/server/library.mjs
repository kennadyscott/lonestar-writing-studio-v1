// The learning-path library: one router, two front doors.
//
// The same handlers run behind the local Node server and behind the Vercel
// function, so what a publisher proves on a laptop is what ships. The rule the
// whole platform turns on lives here, in publish(): a path with proofing errors
// cannot go live. Saving is always allowed — work in progress is normal — but
// approval is gated on the content actually being playable.
//
// Students never read a draft. Publishing snapshots the draft into an immutable
// version row and points the path at it, so editing tomorrow cannot change a
// worksheet under a class that is halfway through it today.

import { readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { store, backend } from './store.mjs'
import { proofPath, pointsOf } from '../proof/checks.mjs'
import { joinStandards } from '../content/taxonomy.mjs'
import { rawTopics } from '../../server/proofRoom.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')

const ok = (json) => ({ status: 200, json })
const bad = (msg, extra = {}) => ({ status: 400, json: { error: msg, ...extra } })
const gone = (msg) => ({ status: 404, json: { error: msg } })

/* Video ids the platform can see. Local runs read the folder; a deployed run
 * uses whatever the media manifest says. Either way an unknown id is a warning,
 * never a block — a publisher may be authoring ahead of the recording. */
export function videoIds() {
  const dir = join(ROOT, 'public', 'solutions')
  if (!existsSync(dir)) return []
  try { return readdirSync(dir).filter((f) => f.endsWith('.mp4')).map((f) => f.replace(/\.mp4$/, '')) } catch { return [] }
}

const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40)
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/* The row a publisher sees in the list: status, plus whether the draft has
 * moved ahead of what students are getting. */
async function summarize(p) {
  const live = p.live_version != null ? await store.getVersion(p.id, p.live_version) : null
  const draft = p.draft || null
  const proof = proofPath(draft, { videoIds: videoIds() })
  return {
    id: p.id,
    title: draft?.title || p.title || p.id,
    short: draft?.short || p.short,
    state: draft?.state || p.state || null,
    grade: draft?.grade ?? p.grade,
    domain: draft?.domain || p.domain || null,
    standards: draft?.standards || p.standards,
    icon: draft?.icon || p.icon,
    status: p.status || 'draft',
    liveVersion: p.live_version ?? null,
    updatedAt: p.updated_at,
    unpublishedChanges: !!(live && !same(live.content, draft)),
    errors: proof.errors,
    warnings: proof.warnings,
    points: proof.points,
    stops: proof.stops,
  }
}

export async function libraryRoute({ method, pathname, body = {}, authorized }) {
  const seg = pathname.replace(/^\/api\/library\/?/, '').split('/').filter(Boolean)

  // Students read the approved snapshots. No key, no auth, nothing private.
  if (method === 'GET' && seg[0] === 'live') {
    const topics = await store.livePaths()
    return ok({ topics })
  }

  if (!authorized) return { status: 401, json: { error: 'This is the publisher console. Enter the workspace key to continue.' } }

  if (method === 'GET' && seg[0] === 'meta') {
    return ok({ backend, videos: videoIds(), passcode: !!process.env.PUBLISHER_PASSCODE, shipped: rawTopics().map((t) => t.id) })
  }

  if (seg[0] !== 'paths') {
    if (method === 'POST' && seg[0] === 'seed') return seed(body)
    return gone('No such library route.')
  }

  const id = seg[1]

  if (method === 'GET' && !id) {
    const rows = await store.listPaths()
    const full = []
    for (const r of rows) full.push(await summarize(await store.getPath(r.id)))
    return ok({ paths: full })
  }

  if (method === 'POST' && !id) {
    const topic = body.topic || {}
    const newId = slug(topic.id || topic.title || 'new_path') || `path_${Date.now()}`
    if (await store.getPath(newId)) return bad(`A path with the id "${newId}" already exists.`)
    const draft = {
      id: newId, title: topic.title || 'Untitled learning path', short: topic.short || topic.title || 'Untitled',
      state: topic.state || 'TX', grade: topic.grade ?? null, domain: topic.domain || '',
      standards: topic.standards || '', blurb: topic.blurb || '', icon: topic.icon || '📘',
      core: topic.core || [], skillBuilders: topic.skillBuilders || {}, full: topic.full || null,
    }
    const row = await store.putPath({ id: newId, title: draft.title, short: draft.short, state: draft.state, grade: draft.grade, domain: draft.domain, standards: draft.standards, blurb: draft.blurb, icon: draft.icon, status: 'draft', live_version: null, draft })
    return ok({ path: await summarize(row) })
  }

  const row = id ? await store.getPath(id) : null
  if (!row) return gone(`No learning path called "${id}".`)

  if (method === 'GET' && !seg[2]) {
    return ok({
      path: await summarize(row),
      draft: row.draft,
      versions: await store.listVersions(id),
      proof: proofPath(row.draft, { videoIds: videoIds() }),
      videos: videoIds(),
    })
  }

  if (method === 'PUT' && !seg[2]) {
    const topic = body.topic
    if (!topic || typeof topic !== 'object') return bad('No content sent.')
    const draft = { ...topic, id }
    const saved = await store.putPath({
      id, title: draft.title, short: draft.short, state: draft.state, grade: draft.grade,
      domain: draft.domain, standards: joinStandards(draft.standards), blurb: draft.blurb, icon: draft.icon, draft,
      status: row.status === 'published' ? 'published' : row.status || 'draft',
      live_version: row.live_version ?? null,
    })
    return ok({ path: await summarize(saved), proof: proofPath(draft, { videoIds: videoIds() }) })
  }

  if (method === 'DELETE' && !seg[2]) {
    if (row.status === 'published') return bad('Take it off the live site before deleting it.')
    await store.deletePath(id)
    return ok({ ok: true })
  }

  // Approve: proof, snapshot, point students at it.
  if (method === 'POST' && seg[2] === 'publish') {
    const draft = row.draft
    const proof = proofPath(draft, { videoIds: videoIds() })
    if (!proof.ok) return { status: 422, json: { error: `${proof.errors} ${proof.errors === 1 ? 'problem has' : 'problems have'} to be fixed before this can go live.`, proof } }
    const versions = await store.listVersions(id)
    const version = (versions[0]?.version || 0) + 1
    await store.addVersion({
      path_id: id, version, content: draft, note: body.note || '',
      points: proof.points, approved_by: body.by || 'workspace',
    })
    const saved = await store.putPath({ id, status: 'published', live_version: version, draft })
    return ok({ path: await summarize(saved), version, proof })
  }

  if (method === 'POST' && seg[2] === 'unpublish') {
    const saved = await store.putPath({ id, status: 'draft', live_version: null, draft: row.draft })
    return ok({ path: await summarize(saved) })
  }

  if (method === 'POST' && seg[2] === 'review') {
    const saved = await store.putPath({ id, status: row.status === 'published' ? 'published' : 'in_review', draft: row.draft })
    return ok({ path: await summarize(saved) })
  }

  // Pull an old version back onto the workbench. The live one is untouched
  // until it is published again, so this is always safe.
  if (method === 'POST' && seg[2] === 'restore') {
    const v = await store.getVersion(id, Number(body.version))
    if (!v) return gone(`No version ${body.version}.`)
    const saved = await store.putPath({ id, draft: v.content, status: row.status, live_version: row.live_version ?? null })
    return ok({ path: await summarize(saved), draft: v.content })
  }

  return gone('No such library route.')
}

/* Bootstrap: lift the paths that ship in the code into the library, so a fresh
 * database opens with the real content instead of an empty screen. */
async function seed(body) {
  const topics = body.topics || rawTopics()
  const made = []
  for (const t of topics) {
    const existing = await store.getPath(t.id)
    if (existing && !body.overwrite) continue
    await store.putPath({
      id: t.id, title: t.title, short: t.short, state: t.state, grade: t.grade, domain: t.domain,
      standards: joinStandards(t.standards), blurb: t.blurb, icon: t.icon, status: existing?.status || 'draft',
      live_version: existing?.live_version ?? null, draft: t,
    })
    made.push(t.id)
  }
  return ok({ seeded: made, backend })
}

export { proofPath, pointsOf }
