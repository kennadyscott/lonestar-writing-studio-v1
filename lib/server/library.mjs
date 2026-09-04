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

import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { store, backend, coreCount, coreSelect } from './store.mjs'
import { proofPath, pointsOf } from '../proof/checks.mjs'
import { joinStandards } from '../content/taxonomy.mjs'
import { normalizeStage, STAGE_IDS } from '../content/pipeline.mjs'
import { rawTopics } from '../../server/proofRoom.mjs'
import { SHIPPED } from '../../data/topics.mjs'

/* Everything that ships with the app: the path written in code, plus the ones
 * converted from deck folders and kept as data. A deployed host has no folder to
 * import from, so this is how content reaches it. */
const shippedTopics = () => [...rawTopics(), ...JSON.parse(JSON.stringify(SHIPPED))]

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')

const ok = (json) => ({ status: 200, json })
const bad = (msg, extra = {}) => ({ status: 400, json: { error: msg, ...extra } })
const gone = (msg) => ({ status: 404, json: { error: msg } })

/* Video ids the platform can see. Local runs read the folder; a deployed run
 * uses whatever the media manifest says. Either way an unknown id is a warning,
 * never a block — a publisher may be authoring ahead of the recording. */
export function videoIds() {
  // The manifest is written when videos are uploaded, so proofing knows what
  // exists without a network call to the bucket — a checker that needs R2 to be
  // up is a checker that fails for the wrong reason. Falls back to the folder,
  // which is what a laptop has before anything has been uploaded.
  const manifest = join(ROOT, 'data', 'media-manifest.json')
  if (existsSync(manifest)) {
    try { return Object.keys(JSON.parse(readFileSync(manifest, 'utf8')).videos || {}) } catch {}
  }
  const dir = join(ROOT, 'public', 'solutions')
  if (!existsSync(dir)) return []
  try { return readdirSync(dir).filter((f) => f.endsWith('.mp4')).map((f) => f.replace(/\.mp4$/, '')) } catch { return [] }
}

const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40)
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

/* Every worksheet on the path, in one list. */
const sheetsOf = (t) => [...(t?.core || []), ...Object.values(t?.skillBuilders || {}), ...(t?.full ? [t.full] : [])]

/* The stage a saved draft has earned on its own.
 *
 * Approving every worksheet IS approving the path, so nobody should have to
 * remember to say so twice — and the reverse matters more: withdrawing an
 * approval must not leave a path sitting at Approved on the strength of a
 * signature that no longer exists.
 *
 * Deliberately narrow. It only moves between the stages either side of that one
 * fact. QA is left alone, because finding problems is what QA is for and being
 * ejected from it mid-pass would be absurd. Published is never touched at all:
 * students are reading a snapshot, and what the draft is doing cannot quietly
 * change what they see. */
function earnedStage(draft, current) {
  const sheets = sheetsOf(draft)
  if (!sheets.length) return current
  const allApproved = sheets.every((w) => w.approved)
  if (allApproved && ['imported', 'draft', 'reviewed'].includes(current)) return 'approved'
  if (!allApproved && current === 'approved') return 'reviewed'
  return current
}

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
    status: normalizeStage(p.status),
    liveVersion: p.live_version ?? null,
    updatedAt: p.updated_at,
    unpublishedChanges: !!(live && !same(live.content, draft)),
    errors: proof.errors,
    warnings: proof.warnings,
    flags: proof.flags,
    points: proof.points,
    stops: proof.stops,
  }
}

export async function libraryRoute({ method, pathname, body = {}, query = {}, authorized }) {
  if (query && Object.keys(query).length && !body.query) body = { ...body, query }
  const seg = pathname.replace(/^\/api\/library\/?/, '').split('/').filter(Boolean)

  // Students read the approved snapshots. No key, no auth, nothing private.
  if (method === 'GET' && seg[0] === 'live') {
    const topics = await store.livePaths()
    return ok({ topics })
  }

  if (!authorized) return { status: 401, json: { error: 'This is the publisher console. Enter the workspace key to continue.' } }

  if (method === 'GET' && seg[0] === 'meta') {
    let catalog = null
    try { catalog = await coreCount('standards') } catch (e) { catalog = { error: String(e.message || e) } }
    return ok({
      backend, videos: videoIds(), passcode: !!process.env.PUBLISHER_PASSCODE,
      shipped: shippedTopics().map((t) => t.id),
      catalog,
    })
  }

  // The shared standards catalog is READ here and written nowhere.
  //
  // ClearK12 Studio owns it: one place curates the rows every product tags
  // against, so a release of this product cannot move them underneath the
  // others. The import button, the parser and the 2,395-row catalog itself all
  // live there now -- https://cleark12-studio.vercel.app -- which is why none
  // of them ship in this repo any more.
  if (method === 'GET' && seg[0] === 'core' && seg[1] === 'standards') {
    // The filters arrive as the query string, not in the body. Reading them off
    // `body.query` meant every search quietly returned the same unfiltered
    // first 60 rows, because a GET is dispatched with an empty body.
    const p = query || {}
    const { rows, total } = await coreSelect('standards', {
      where: { state: p.state, subject: p.subject, grade: p.grade, domain: p.domain, course: p.course },
      search: p.q || '', limit: Math.min(Number(p.limit) || 60, 200), offset: Number(p.offset) || 0,
    })
    return ok({ rows, total, count: await coreCount('standards'), backend })
  }

  // Artwork that came out of a deck in the browser. Stored beside the app when
  // it can be — a serverless host has no writable disk, so this reports what it
  // could not keep rather than failing an import over it.
  if (method === 'POST' && seg[0] === 'art') {
    const images = body.images || []
    const dir = join(ROOT, 'public', 'art')
    let saved = 0
    let reason = null
    for (const im of images) {
      if (!im?.id || !im?.base64) continue
      try {
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, `${im.id}.webp`), Buffer.from(im.base64, 'base64'))
        saved++
      } catch (e) { reason = reason || String(e.code || e.message) }
    }
    return ok({
      saved,
      missed: images.length - saved,
      reason: saved < images.length
        ? 'This host has no writable disk, so the artwork was not kept. The path imported without it.'
        : undefined,
    })
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
    const was = normalizeStage(row.status)
    const status = was === 'published' ? 'published' : earnedStage(draft, was)
    const saved = await store.putPath({
      id, title: draft.title, short: draft.short, state: draft.state, grade: draft.grade,
      domain: draft.domain, standards: joinStandards(draft.standards), blurb: draft.blurb, icon: draft.icon, draft,
      status, live_version: row.live_version ?? null,
    })
    return ok({
      path: await summarize(saved),
      proof: proofPath(draft, { videoIds: videoIds() }),
      stageMoved: status !== was ? { from: was, to: status } : null,
    })
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
    if (!proof.ok) {
      // Errors and flags both stop a publish, but they are different requests:
      // an error is a defect to fix, a flag is a question somebody has to answer.
      const bits = []
      if (proof.errors) bits.push(`${proof.errors} ${proof.errors === 1 ? 'problem' : 'problems'} to fix`)
      if (proof.flags) bits.push(`${proof.flags} ${proof.flags === 1 ? 'flag' : 'flags'} still raised`)
      return { status: 422, json: { error: `${bits.join(' and ')} before this can go live.`, proof } }
    }
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
    const saved = await store.putPath({ id, status: 'approved', live_version: null, draft: row.draft })
    return ok({ path: await summarize(saved) })
  }

  /* Draft a worksheet's activities from the deck text the import kept.
   *
   * Everything this produces is flagged and cannot be published. That is not
   * caution for its own sake: converting these worksheets by hand, the structure
   * was nearly always obvious and the answers were not, and on the hardest one
   * careful reading got five of eight right. What comes back is a first pass to
   * check against the source, not a result. */
  if (method === 'POST' && seg[2] === 'draft') {
    // Where the model call goes. The key belongs to ClearK12 Studio, not to this
    // product: one credential to rotate instead of four, no product ever holding
    // it, and — the reason that actually decides it — every draft lands in the
    // master cost log without each product remembering to report its own spend.
    // A direct key is the fallback for a laptop, and for before the Studio is up.
    const studio = process.env.STUDIO_AI_URL || ''
    const key = process.env.ANTHROPIC_API_KEY || ''
    if (!studio && !key) {
      return bad('No drafting service is configured. Set STUDIO_AI_URL to ClearK12 Studio, or ANTHROPIC_API_KEY for a direct call.')
    }

    const draft = row.draft
    const sheets = [...(draft.core || []), ...Object.values(draft.skillBuilders || {}), ...(draft.full ? [draft.full] : [])]
    const ws = sheets.find((w) => w.id === body.worksheetId)
    if (!ws) return gone(`No worksheet "${body.worksheetId}" on this path.`)
    if (!ws.source?.slides?.length) return bad('This worksheet has no deck text attached, so there is nothing to read.')

    const payload = {
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
      max_tokens: 8000,
      system: DRAFT_SYSTEM,
      messages: [{ role: 'user', content: draftUser(ws.title, ws.source.slides) }],
    }
    const r = studio
      ? await fetch(`${studio.replace(/\/$/, '')}/api/ai/messages`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-studio-key': process.env.STUDIO_AI_KEY || process.env.PUBLISHER_PASSCODE || '',
            // so the Studio's cost log can say who spent it
            'x-studio-product': 'crystal-writing',
            'x-studio-purpose': 'draft-activities',
          },
          body: JSON.stringify(payload),
        })
      : await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify(payload),
        })
    if (!r.ok) {
      const detail = (await r.text()).slice(0, 200)
      return { status: 502, json: { error: studio ? `ClearK12 Studio ${r.status}: ${detail}` : `Anthropic ${r.status}: ${detail}` } }
    }
    const data = await r.json()
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('')

    let parsed
    try { parsed = JSON.parse(text.replace(/^```json\s*|```$/g, '').trim()) }
    catch { return { status: 502, json: { error: 'The draft came back in a shape this could not read.', raw: text.slice(0, 400) } } }

    const acts = (parsed.activities || []).map((a) => ({
      ...a,
      flag: `Drafted from the deck, not verified. Play it against the source text before approving${parsed.notes ? ` — the drafter said: ${parsed.notes}` : ''}.`,
    }))
    if (!acts.length) return bad('Nothing could be drafted from this deck text.')

    ws.activities = acts
    if (!ws.skill && parsed.skill) ws.skill = parsed.skill
    if (!(ws.standards || []).length && Array.isArray(parsed.standards)) ws.standards = parsed.standards
    delete ws.approved
    ws.flag = 'Activities drafted from the deck. Every one needs checking against the source text before this worksheet is approved.'

    const saved = await store.putPath({ id, draft, status: normalizeStage(row.status), live_version: row.live_version ?? null })
    return ok({
      path: await summarize(saved),
      worksheet: ws.id,
      drafted: acts.length,
      notes: parsed.notes || null,
      proof: proofPath(draft, { videoIds: videoIds() }),
    })
  }

  // Move a path along the pipeline. Publishing is the one stage that is not
  // just a label, so it keeps its own route and its own gate.
  if (method === 'POST' && seg[2] === 'stage') {
    const next = normalizeStage(body.stage)
    if (!STAGE_IDS.includes(next)) return bad(`"${body.stage}" is not a stage.`)
    if (next === 'published') return bad('Use Approve & publish to put a path live.')
    if (row.status === 'published' && next !== 'published') {
      // Leaving Published means students stop seeing it; say so rather than
      // doing it quietly as a side effect of a dropdown.
      const saved = await store.putPath({ id, status: next, live_version: null, draft: row.draft })
      return ok({ path: await summarize(saved), tookOffline: true })
    }
    const saved = await store.putPath({ id, status: next, live_version: row.live_version ?? null, draft: row.draft })
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
  const topics = body.topics || shippedTopics()
  const made = []
  let discarded = 0
  for (const t of topics) {
    const existing = await store.getPath(t.id)
    if (existing && !body.overwrite) continue
    if (existing?.draft) {
      // Overwriting replaces the content, so approvals of the old content have
      // to go — they were signatures on something else. But going silently is
      // what makes them feel like a bug rather than a consequence.
      const sheets = [...(existing.draft.core || []), ...Object.values(existing.draft.skillBuilders || {}),
        ...(existing.draft.full ? [existing.draft.full] : [])]
      discarded += sheets.filter((w) => w.approved).length
        + sheets.reduce((n, w) => n + (w.activities || []).filter((a) => a.approved).length, 0)
    }
    await store.putPath({
      id: t.id, title: t.title, short: t.short, state: t.state, grade: t.grade, domain: t.domain,
      standards: joinStandards(t.standards), blurb: t.blurb, icon: t.icon, status: existing?.status || 'imported',
      live_version: existing?.live_version ?? null, draft: t,
    })
    made.push(t.id)
  }
  return ok({
    seeded: made, backend,
    discardedApprovals: discarded || undefined,
    warning: discarded ? `Replaced content that carried ${discarded} approval${discarded === 1 ? '' : 's'}. They are gone — they signed off content that no longer exists.` : undefined,
  })
}

export { proofPath, pointsOf }
