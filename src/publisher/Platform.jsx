import React, { useEffect, useState, useCallback } from 'react'
import { library, getKey, setKey } from '../lib/library.js'
import { ActivityEditor, field, label } from '../student/PublisherConsole.jsx'
import { Worksheet, ActivityPreview } from '../student/ProofRoom.jsx'
import { prepareTopic } from '../../server/proofRoom.mjs'
import { STATES, GRADES, domainsFor, productFor, parseStandards, joinStandards, standardLooksRight } from '../../lib/content/taxonomy.mjs'
import { STAGES, stage as stageOf } from '../../lib/content/pipeline.mjs'

/*
 * Crystal Writing — the content platform.
 *
 * This is the factory floor. Learning paths are built here and supplied to the
 * state programs that consume them: Texas content feeds LoneStar CR. The state
 * is the organiser rather than the product name, because a second state should
 * arrive as a new shelf and not as a rename of everything.
 *
 * Within a state the library is browsed the way the work is actually divided —
 * grade, then domain — and every worksheet carries the standard it teaches, so
 * a path can be found by what it covers instead of by who titled it.
 *
 * The shape of the work is the shape of the screen: a path sits on the
 * workbench as a DRAFT for as long as it takes, gets PROOFED against what a
 * student would actually hit, and only then gets APPROVED, which snapshots it
 * and points the live site at that snapshot. Editing tomorrow cannot disturb a
 * class working through it today, because students never read the draft.
 *
 * The publish button is not a formality. A path with proofing errors cannot go
 * live — the server refuses it too, so the rule holds whoever is calling.
 */

const NAVY = '#16386b'
const CYAN = '#0f97c2'
const INK = '#0e2748'
const PAPER = '#eef3f7'
const GREEN = '#1e7a4a'
const AMBER = '#b47b13'
const RED = '#c0392b'
const FLAG = '#7b4bc4'

function StatusPill({ status, version, small }) {
  const st = stageOf(status)
  return (
    <span style={{ fontSize: small ? 10 : 10.5, fontWeight: 800, letterSpacing: .5, background: st.bg, color: st.fg, borderRadius: 999, padding: small ? '2px 8px' : '3px 9px', whiteSpace: 'nowrap' }}>
      {st.label}{status === 'published' && version != null ? ` \u00b7 v${version}` : ''}
    </span>
  )
}

const btn = (bg, fg = '#fff') => ({
  background: bg, color: fg, border: 'none', borderRadius: 9, padding: '9px 15px',
  fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
})

/* ---------- root ---------- */

export default function Platform({ onExit }) {
  const [meta, setMeta] = useState(null)
  const [locked, setLocked] = useState(false)
  const [paths, setPaths] = useState(null)
  const [sel, setSel] = useState(null)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    try {
      const m = await library.meta()
      setMeta(m); setLocked(false)
      const { paths } = await library.list()
      setPaths(paths)
      // No auto-select: the library is the front door, not whichever path sorts first.
    } catch (e) {
      if (e.status === 401) { setLocked(true); setMeta(null) } else setErr(e.message)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (locked) return <KeyGate onDone={load} />
  if (err) return <Centered><b style={{ color: RED }}>{err}</b></Centered>
  if (!paths) return <Centered>Opening the library…</Centered>

  return (
    <div style={{ minHeight: '100vh', background: PAPER, fontFamily: 'Manrope, system-ui, sans-serif', color: INK }}>
      <header style={{ background: `linear-gradient(180deg,#2c5a97 0%,${NAVY} 62%,${INK} 100%)`, color: '#fff', padding: '13px 22px', display: 'flex', alignItems: 'center', gap: 13 }}>
        <span style={{ fontSize: 21 }}>💎</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ fontSize: 17, letterSpacing: -.2 }}>Crystal Writing Content Studio</b>
          <div style={{ fontSize: 11.5, color: '#a8dff5', fontWeight: 700 }}>
            Content platform · build, proof and approve learning paths
          </div>
        </div>
        <span title={meta?.backend === 'supabase' ? 'Content is stored in Supabase' : 'Content is stored in a local file — set SUPABASE_URL to use the database'}
          style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .5, background: 'rgba(255,255,255,.14)', color: '#a8dff5', borderRadius: 999, padding: '4px 10px' }}>
          {meta?.backend === 'supabase' ? 'SUPABASE' : 'LOCAL FILE'}
        </span>
        {onExit && <button onClick={onExit} style={{ ...btn('rgba(255,255,255,.14)', '#a8dff5'), padding: '7px 13px', fontSize: 12.5 }}>Student view →</button>}
      </header>

      {sel
        ? <Workbench key={sel} id={sel} onChanged={load} onBack={() => setSel(null)} />
        : <Library paths={paths} meta={meta} onOpen={setSel} onChanged={load} />}
    </div>
  )
}

const Centered = ({ children }) => (
  <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', fontFamily: 'Manrope, sans-serif', color: '#5b6b7c' }}>{children}</div>
)

const Panel = ({ children, pad = 20 }) => (
  <div style={{ background: '#fff', borderRadius: 15, border: '1px solid #dde5ec', padding: pad }}>{children}</div>
)

function Empty() {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', color: '#5b6b7c' }}>
      <div style={{ fontSize: 34, marginBottom: 8 }}>🗂</div>
      <b style={{ fontSize: 16, color: INK }}>No learning paths yet</b>
      <p style={{ fontSize: 13.5, maxWidth: 380, margin: '6px auto 0' }}>
        Load the paths that ship with the app to start from real content, or begin an empty one.
      </p>
    </div>
  )
}

/* ---------- the key ---------- */

function KeyGate({ onDone }) {
  const [v, setV] = useState(getKey())
  const [bad, setBad] = useState(false)
  const [busy, setBusy] = useState(false)
  async function go(e) {
    e.preventDefault()
    setBusy(true); setBad(false)
    setKey(v.trim())
    try { await library.meta(); onDone() } catch { setBad(true); setKey('') } finally { setBusy(false) }
  }
  return (
    <Centered>
      <form onSubmit={go} style={{ background: '#fff', border: '1px solid #dde5ec', borderRadius: 15, padding: 26, width: 380, maxWidth: '92vw' }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>🗂</div>
        <b style={{ fontSize: 17, color: INK }}>Path Library</b>
        <p style={{ fontSize: 13.5, color: '#5b6b7c', margin: '5px 0 14px' }}>
          This workspace is shared. Enter the key to build and approve learning paths.
        </p>
        <input style={{ ...field, marginBottom: 10 }} type="password" autoFocus value={v}
          onChange={(e) => setV(e.target.value)} placeholder="Workspace key" />
        {bad && <div style={{ fontSize: 12.5, color: RED, fontWeight: 700, marginBottom: 10 }}>That key was not accepted.</div>}
        <button type="submit" disabled={busy || !v.trim()} style={{ ...btn(CYAN), width: '100%', opacity: busy || !v.trim() ? .5 : 1 }}>
          {busy ? 'Checking…' : 'Open the library'}
        </button>
      </form>
    </Centered>
  )
}

/* ---------- the rail ---------- */

function Rail({ paths, sel, onSelect, onChanged, meta }) {
  const [busy, setBusy] = useState('')
  const [oops, setOops] = useState('')
  const [stateCode, setStateCode] = useState(STATES[0]?.code || 'TX')
  const [grade, setGrade] = useState('')
  const [domain, setDomain] = useState('')

  async function seed() {
    setBusy('seed'); setOops('')
    try {
      const r = await library.seed()
      await onChanged()
      if (!r.seeded?.length) setOops('Nothing was loaded — those paths are already in the library.')
    } catch (e) { setOops(e.message) } finally { setBusy('') }
  }
  async function create() {
    const title = prompt('Name the learning path')
    if (!title) return
    setBusy('new')
    setOops('')
    try {
      const r = await library.create({ title, short: title, state: stateCode, grade: grade || null, domain: domain || '' })
      await onChanged(); onSelect(r.path.id)
    } catch (e) { setOops(e.message) } finally { setBusy('') }
  }

  const inState = paths.filter((p) => (p.state || 'TX') === stateCode)
  const shown = inState.filter((p) => (!grade || String(p.grade) === grade) && (!domain || p.domain === domain))
  const unfiled = inState.filter((p) => !p.grade || !p.domain).length

  // Grouped the way the work is divided: grade, then domain.
  const groups = []
  for (const p of shown) {
    const key = p.grade ? `Grade ${p.grade}` : 'Not filed yet'
    let g = groups.find((x) => x.key === key)
    if (!g) groups.push((g = { key, grade: p.grade ?? 99, items: [] }))
    g.items.push(p)
  }
  groups.sort((a, b) => a.grade - b.grade)

  const pick = { ...field, padding: '6px 8px', fontSize: 12, fontWeight: 700 }

  return (
    <div style={{ position: 'sticky', top: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Panel pad={12}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
          {STATES.map((st) => (
            <button key={st.code} onClick={() => setStateCode(st.code)}
              style={{ ...btn(st.code === stateCode ? NAVY : '#fff', st.code === stateCode ? '#fff' : '#5b6b7c'), border: st.code === stateCode ? 'none' : '1px solid #dde5ec', fontSize: 12, padding: '6px 11px', flex: 1 }}>
              {st.name}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#5b6b7c', fontWeight: 700, marginBottom: 10 }}>
          Supplies <b style={{ color: CYAN }}>{productFor(stateCode)}</b>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <select style={{ ...pick, flex: '0 0 82px' }} value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">All grades</option>
            {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select style={{ ...pick, flex: 1, minWidth: 0 }} value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="">All domains</option>
            {domainsFor(stateCode).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div style={{ ...label, marginBottom: 8 }}>
          {shown.length} OF {inState.length} PATHS
          {unfiled ? <span style={{ color: AMBER }}> · {unfiled} NOT FILED</span> : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '46vh', overflowY: 'auto' }}>
          {!shown.length && <div style={{ fontSize: 12.5, color: '#5b6b7c' }}>Nothing here yet.</div>}
          {groups.map((g) => (
            <div key={g.key}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .6, color: g.key === 'Not filed yet' ? AMBER : '#93a3b3', margin: '2px 0 4px' }}>
                {g.key.toUpperCase()}
              </div>
              {g.items.map((p) => {
                const on = p.id === sel
                return (
                  <button key={p.id} onClick={() => onSelect(p.id)}
                    style={{ textAlign: 'left', width: '100%', border: on ? `1.5px solid ${CYAN}` : '1.5px solid transparent', background: on ? '#f2f9fc' : '#fff', borderRadius: 11, padding: '9px 11px', marginBottom: 3, cursor: 'pointer', fontFamily: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 15 }}>{p.icon || '📘'}</span>
                      <b style={{ flex: 1, fontSize: 13.5, color: NAVY, lineHeight: 1.25 }}>{p.title}</b>
                    </div>
                    <div style={{ fontSize: 11, color: '#5b6b7c', fontWeight: 700, marginTop: 4 }}>
                      {p.domain || <span style={{ color: AMBER }}>No domain</span>} · {p.stops} stops · {p.points} pts
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                      <StatusPill status={p.status} version={p.liveVersion} />
                      {p.errors > 0 && <span style={{ fontSize: 10.5, fontWeight: 800, color: RED }}>● {p.errors} to fix</span>}
                      {p.flags > 0 && <span style={{ fontSize: 10.5, fontWeight: 800, color: FLAG }}>⚑ {p.flags} flagged</span>}
                      {p.errors === 0 && p.unpublishedChanges && <span style={{ fontSize: 10.5, fontWeight: 800, color: AMBER }}>● changes not live</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </Panel>
      <Panel pad={12}>
        <button onClick={create} disabled={!!busy} style={{ ...btn(NAVY), width: '100%', marginBottom: 7 }}>+ New learning path</button>
        <button onClick={seed} disabled={!!busy} style={{ ...btn('#e7edf3', NAVY), width: '100%' }}>
          {busy === 'seed' ? 'Loading…'
            : `Load the ${meta?.shipped?.length || ''} path${meta?.shipped?.length === 1 ? '' : 's'} that ship with the app`.replace('  ', ' ')}
        </button>
        <CatalogPanel meta={meta} />
        {oops && (
          <div style={{ marginTop: 8, background: '#fdecea', color: RED, borderRadius: 9, padding: '9px 11px', fontSize: 12.5, fontWeight: 700 }}>
            {oops}
          </div>
        )}
      </Panel>
    </div>
  )
}


/* Standards are tags, not a sentence. One code per chip, because the whole
 * point of tagging is that the library can be asked "what covers 5.11D(ii)?" —
 * a question a line of prose cannot answer. */
function StandardsInput({ value, onChange, state = 'TX', placeholder = '5.11D(ii)' }) {
  const codes = Array.isArray(value) ? value : parseStandards(value)
  const [typing, setTyping] = useState('')

  const commit = (raw) => {
    const added = parseStandards(raw)
    if (!added.length) return
    const next = [...codes]
    for (const c of added) if (!next.some((x) => x.toLowerCase() === c.toLowerCase())) next.push(c)
    onChange(next); setTyping('')
  }
  const drop = (i) => onChange(codes.filter((_, j) => j !== i))

  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, background: '#fff', padding: '5px 6px', display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
      {codes.map((c, i) => {
        const odd = !standardLooksRight(c, state)
        return (
          <span key={i} title={odd ? `This does not look like a ${state} code` : ''}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: odd ? '#fdf7e8' : '#eaf4f9', border: `1px solid ${odd ? AMBER + '55' : CYAN + '44'}`, color: odd ? AMBER : NAVY, borderRadius: 999, padding: '3px 5px 3px 9px', fontSize: 12, fontWeight: 800 }}>
            {odd && <span style={{ fontSize: 10 }}>⚠</span>}
            {c}
            <button onClick={() => drop(i)} aria-label={`Remove ${c}`}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', fontSize: 14, lineHeight: 1, padding: '0 2px', opacity: .65 }}>×</button>
          </span>
        )
      })}
      <input value={typing} placeholder={codes.length ? '' : placeholder}
        onChange={(e) => { const v = e.target.value; if (v.includes(',')) commit(v); else setTyping(v) }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(typing) }
          else if (e.key === 'Backspace' && !typing && codes.length) drop(codes.length - 1)
        }}
        onBlur={() => commit(typing)}
        style={{ flex: '1 1 90px', minWidth: 70, border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 13, padding: '4px 3px', background: 'transparent' }} />
    </div>
  )
}

/* Every code taught anywhere on the path, in the order the path teaches them. */
function coverageOf(t) {
  const seen = []
  const take = (ws) => { for (const c of ws?.standards || []) if (!seen.includes(c)) seen.push(c) }
  ;(t.core || []).forEach(take)
  Object.values(t.skillBuilders || {}).forEach(take)
  take(t.full)
  return seen
}

/* The shared standards catalog, read-only.
 *
 * This panel used to hold an Import button. A worksheet author pressing it
 * re-wrote the rows every other product tags against, from inside one product's
 * console -- which is exactly the coupling ClearK12 Studio exists to remove.
 * The catalog is curated there and read here. */
const STUDIO_URL = import.meta.env.VITE_STUDIO_URL || 'https://cleark12-studio.vercel.app'

function CatalogPanel({ meta }) {
  const count = typeof meta?.catalog === 'number' ? meta.catalog : null
  const err = meta?.catalog && typeof meta.catalog === 'object' ? meta.catalog.error : null

  if (meta?.backend !== 'supabase') return null

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #e7edf3' }}>
      <div style={{ ...label, marginBottom: 5 }}>STANDARDS CATALOG</div>
      {err ? (
        <div style={{ background: '#fdecea', color: RED, borderRadius: 9, padding: '9px 11px', fontSize: 12, fontWeight: 700, marginBottom: 7 }}>
          {/schema must be one of|does not exist|permission denied/i.test(err)
            ? 'The core schema is not reachable yet — check that it is exposed to the API and granted to the service role.'
            : err}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#5b6b7c', fontWeight: 700, marginBottom: 7 }}>
          {count ? <>{count.toLocaleString()} standards to tag against</> : <>Nothing loaded yet</>}
        </div>
      )}
      <a href={STUDIO_URL} target="_blank" rel="noreferrer"
        style={{ display: 'block', textAlign: 'center', textDecoration: 'none', ...btn('#e7edf3', NAVY), width: '100%', fontSize: 12.5 }}>
        Manage in ClearK12 Studio →
      </a>
      <div style={{ fontSize: 11, color: '#93a3b3', fontWeight: 700, marginTop: 6, lineHeight: 1.45 }}>
        Curated once, read by every product. This console does not change it.
      </div>
    </div>
  )
}


/* Where this topic has got to. Published is not in the list because putting a
 * path live is gated on proofing, so it lives on its own tab with its reasons. */
function StageControl({ path, onChanged }) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const st = stageOf(path.status)

  async function move(next) {
    if (!next || next === path.status) return
    if (path.status === 'published' && !confirm('This path is live. Moving it back takes it off the student site. Continue?')) return
    setBusy(true); setNote('')
    try {
      const r = await library.setStage(path.id, next)
      if (r.tookOffline) setNote('Taken off the live site.')
      await onChanged()
    } catch (e) { setNote(e.message) } finally { setBusy(false) }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
      {path.status === 'published' && <StatusPill status="published" version={path.liveVersion} />}
      <select value={path.status} disabled={busy} onChange={(e) => move(e.target.value)}
        title={st.blurb}
        style={{ ...field, width: 'auto', padding: '6px 9px', fontSize: 12, fontWeight: 800, color: st.fg, background: st.bg, border: `1.5px solid ${st.fg}33`, cursor: 'pointer' }}>
        {STAGES.map((x) => (
          <option key={x.id} value={x.id} disabled={x.id === 'published' && path.status !== 'published'}>
            {x.label}{x.id === 'published' && path.status !== 'published' ? ' (approve to publish)' : ''}
          </option>
        ))}
      </select>
      {note && <span style={{ fontSize: 11.5, fontWeight: 700, color: '#5b6b7c' }}>{note}</span>}
    </span>
  )
}

/* ---------- details ---------- */

function DetailsTab({ draft, mutate }) {
  const set = (k) => (e) => mutate((t) => { t[k] = e.target.value })
  const domains = domainsFor(draft.state || 'TX')
  const filed = draft.state && draft.grade && draft.domain

  return (
    <Panel>
      <b style={{ fontSize: 15.5, color: NAVY }}>Where this path is filed</b>
      <p style={{ fontSize: 13, color: '#5b6b7c', margin: '3px 0 14px', maxWidth: 620 }}>
        State, grade and domain are how the library is browsed — and how a teacher finds this without knowing what it is
        called. {draft.state ? <>Texas content is supplied to <b>{productFor(draft.state)}</b>.</> : null}
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: '0 0 130px' }}>
          <span style={label}>STATE</span>
          <select style={field} value={draft.state || ''} onChange={set('state')}>
            <option value="">Pick one</option>
            {STATES.map((st) => <option key={st.code} value={st.code}>{st.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '0 0 110px' }}>
          <span style={label}>GRADE</span>
          <select style={field} value={draft.grade == null ? '' : String(draft.grade)}
            onChange={(e) => mutate((t) => { t.grade = e.target.value === '' ? null : (/^\d+$/.test(e.target.value) ? Number(e.target.value) : e.target.value) })}>
            <option value="">Pick one</option>
            {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 220px' }}>
          <span style={label}>DOMAIN</span>
          <select style={field} value={draft.domain || ''} onChange={set('domain')}>
            <option value="">Pick one</option>
            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {!filed && <Note color={AMBER}>A path has to be filed under a state, grade and domain before it can go live.</Note>}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: '1 1 320px' }}>
          <span style={label}>TITLE</span>
          <input style={field} value={draft.title || ''} onChange={set('title')} />
        </div>
        <div style={{ flex: '0 0 170px' }}>
          <span style={label}>SHORT NAME</span>
          <input style={field} value={draft.short || ''} onChange={set('short')} />
        </div>
        <div style={{ flex: '0 0 80px' }}>
          <span style={label}>ICON</span>
          <input style={field} value={draft.icon || ''} onChange={set('icon')} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
          <span style={{ ...label, marginBottom: 0 }}>STANDARDS THIS PATH COVERS</span>
          <button onClick={() => mutate((t) => { t.standards = coverageOf(t) })}
            style={{ background: 'none', border: 'none', color: CYAN, fontSize: 11.5, fontWeight: 800, cursor: 'pointer', padding: 0 }}>
            Fill from the worksheets
          </button>
        </div>
        <StandardsInput state={draft.state || 'TX'} value={draft.standards}
          onChange={(v) => mutate((t) => { t.standards = v })} />
        {(() => {
          const cover = coverageOf(draft)
          const listed = parseStandards(draft.standards)
          const missing = cover.filter((c) => !listed.some((x) => x.toLowerCase() === c.toLowerCase()))
          return missing.length
            ? <div style={{ fontSize: 11.5, color: AMBER, fontWeight: 700, marginTop: 5 }}>
                Taught but not listed here: {missing.join(', ')}
              </div>
            : null
        })()}
      </div>
      <div>
        <span style={label}>BLURB</span>
        <input style={field} value={draft.blurb || ''} onChange={set('blurb')} />
      </div>
    </Panel>
  )
}


/* The library index. Built for a shelf that is going to hold hundreds of paths,
 * so it browses the way the work divides — state, then grade, then topic — and
 * leads with where each topic has got to rather than what is inside it. What is
 * inside is one click away, which is the builder. */
function Library({ paths, meta, onOpen, onChanged }) {
  const [stateCode, setStateCode] = useState(STATES[0]?.code || 'TX')
  const [grade, setGrade] = useState('')
  const [domain, setDomain] = useState('')
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState('')
  const [oops, setOops] = useState('')

  // Loading skips what is already on the shelf. Re-importing deliberately does
  // not — it is how content that was fixed in the code reaches a library that
  // already has an older copy of it, and it will overwrite an edited draft, so
  // it asks first and says what survives.
  const shipped = meta?.shipped || []
  const alreadyHere = shipped.length > 0 && shipped.every((id) => paths.some((p) => p.id === id))

  async function seed(overwrite) {
    if (overwrite && !confirm(
      'Re-import replaces the draft of every path that ships with the app, discarding any edits made here.\n\n' +
      'Its stage and the version students are seeing are kept — the new content arrives as unpublished changes.\n\nContinue?'
    )) return
    setBusy('seed'); setOops('')
    try {
      const r = await library.seed(overwrite)
      await onChanged()
      if (!r.seeded?.length) setOops('Nothing was loaded — those paths are already here. Use Re-import to replace them.')
      else setOops('')
    } catch (e) { setOops(e.message) } finally { setBusy('') }
  }
  async function create() {
    const title = prompt('Name the learning path')
    if (!title) return
    setBusy('new'); setOops('')
    try { const r = await library.create({ title, short: title, state: stateCode, grade: grade || null, domain: domain || '' }); await onChanged(); onOpen(r.path.id) }
    catch (e) { setOops(e.message) } finally { setBusy('') }
  }

  const inState = paths.filter((p) => (p.state || 'TX') === stateCode)
  const counts = Object.fromEntries(STAGES.map((st) => [st.id, inState.filter((p) => p.status === st.id).length]))
  const needle = q.trim().toLowerCase()
  const shown = inState.filter((p) =>
    (!grade || String(p.grade) === grade) &&
    (!domain || p.domain === domain) &&
    (!status || p.status === status) &&
    (!needle || `${p.title} ${p.domain || ''} ${joinStandards(p.standards)}`.toLowerCase().includes(needle)))

  const groups = []
  for (const p of shown) {
    const key = p.grade ? `Grade ${p.grade}` : 'Not filed yet'
    let g = groups.find((x) => x.key === key)
    if (!g) groups.push((g = { key, order: p.grade === 'K' ? 0 : Number(p.grade) || 99, rows: [] }))
    g.rows.push(p)
  }
  groups.sort((a, b) => a.order - b.order)
  for (const g of groups) g.rows.sort((a, b) => String(a.title).localeCompare(String(b.title)))

  const pick = { ...field, padding: '7px 9px', fontSize: 12.5, fontWeight: 700 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Panel pad={14}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {STATES.map((st) => (
            <button key={st.code} onClick={() => setStateCode(st.code)}
              style={{ ...btn(st.code === stateCode ? NAVY : '#fff', st.code === stateCode ? '#fff' : '#5b6b7c'), border: st.code === stateCode ? 'none' : '1px solid #dde5ec', fontSize: 13, padding: '8px 16px' }}>
              {st.name}
            </button>
          ))}
          <span style={{ fontSize: 12, color: '#5b6b7c', fontWeight: 700, marginLeft: 4 }}>
            supplies <b style={{ color: CYAN }}>{productFor(stateCode)}</b>
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={create} disabled={!!busy} style={btn(NAVY)}>+ New topic</button>
          <button onClick={() => seed(alreadyHere)} disabled={!!busy} style={btn('#e7edf3', NAVY)}
            title={alreadyHere ? 'Replace the shipped paths with the versions in the app' : 'Add the paths that ship with the app'}>
            {busy === 'seed' ? 'Loading…'
              : alreadyHere ? `↻ Re-import the ${shipped.length} shipped ${shipped.length === 1 ? 'path' : 'paths'}`
              : `Load the ${shipped.length || ''} that ship with the app`.replace('  ', ' ')}
          </button>
        </div>
        {oops && <div style={{ marginTop: 9, background: '#fdecea', color: RED, borderRadius: 9, padding: '9px 11px', fontSize: 12.5, fontWeight: 700 }}>{oops}</div>}
      </Panel>

      {/* where everything is, and a way to see only that */}
      <Panel pad={13}>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <StageChip label="All" n={inState.length} on={!status} onClick={() => setStatus('')} fg={NAVY} bg="#eef3f7" />
          {STAGES.map((st) => (
            <StageChip key={st.id} label={st.label} n={counts[st.id]} fg={st.fg} bg={st.bg}
              on={status === st.id} onClick={() => setStatus(status === st.id ? '' : st.id)} title={st.blurb} />
          ))}
        </div>
      </Panel>

      <Panel pad={0}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '13px 15px', borderBottom: '1px solid #e7edf3' }}>
          <input style={{ ...pick, flex: '1 1 220px' }} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search topics, domains, standards…" />
          <select style={{ ...pick, flex: '0 0 130px' }} value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="">All grades</option>
            {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select style={{ ...pick, flex: '0 0 190px' }} value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="">All domains</option>
            {domainsFor(stateCode).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <span style={{ fontSize: 12, color: '#5b6b7c', fontWeight: 700, alignSelf: 'center' }}>
            {shown.length} of {inState.length}
          </span>
        </div>

        {!shown.length && (
          <div style={{ padding: '46px 20px', textAlign: 'center', color: '#5b6b7c' }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🗂</div>
            <b style={{ fontSize: 15.5, color: INK }}>{inState.length ? 'Nothing matches those filters' : 'No topics yet'}</b>
            <p style={{ fontSize: 13.5, maxWidth: 400, margin: '6px auto 0' }}>
              {inState.length ? 'Clear a filter to see the rest.' : 'Load the paths that ship with the app, or start an empty topic.'}
            </p>
          </div>
        )}

        {groups.map((g) => (
          <div key={g.key}>
            <div style={{ ...label, padding: '10px 15px 6px', background: '#fafcfd', borderBottom: '1px solid #f0f4f7', margin: 0 }}>
              {g.key.toUpperCase()} · {g.rows.length}
            </div>
            {g.rows.map((p) => (
              <button key={p.id} onClick={() => onOpen(p.id)}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '12px 15px', background: '#fff', border: 'none', borderBottom: '1px solid #f0f4f7', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                <span style={{ fontSize: 19, flex: '0 0 auto' }}>{p.icon || '📘'}</span>
                <span style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <b style={{ fontSize: 14, color: NAVY, display: 'block' }}>{p.title}</b>
                  <span style={{ fontSize: 11.5, color: '#5b6b7c', fontWeight: 700 }}>
                    {p.domain || <span style={{ color: AMBER }}>No domain</span>}
                    {joinStandards(p.standards) ? ` · ${joinStandards(p.standards)}` : ''}
                  </span>
                </span>
                <span style={{ flex: '0 0 92px', fontSize: 11.5, color: '#5b6b7c', fontWeight: 700, textAlign: 'right' }}>
                  {p.stops} stops<br />{p.points} pts
                </span>
                <span style={{ flex: '0 0 116px', textAlign: 'right' }}>
                  {p.errors > 0 && <div style={{ fontSize: 11, fontWeight: 800, color: RED }}>● {p.errors} to fix</div>}
                  {p.flags > 0 && <div style={{ fontSize: 11, fontWeight: 800, color: FLAG }}>⚑ {p.flags} flagged</div>}
                  {!p.errors && !p.flags && p.unpublishedChanges && <div style={{ fontSize: 11, fontWeight: 800, color: AMBER }}>● not live</div>}
                  {!p.errors && !p.flags && !p.unpublishedChanges && <div style={{ fontSize: 11, color: '#a9b8c6', fontWeight: 700 }}>clean</div>}
                </span>
                <span style={{ flex: '0 0 118px', textAlign: 'right' }}><StatusPill status={p.status} version={p.liveVersion} /></span>
                <span style={{ flex: '0 0 14px', color: '#a9b8c6', fontSize: 15 }}>›</span>
              </button>
            ))}
          </div>
        ))}
      </Panel>

      {meta?.backend === 'supabase' && <CatalogNote meta={meta} />}
    </div>
  )
}

function StageChip({ label: l, n, on, onClick, fg, bg, title }) {
  return (
    <button onClick={onClick} title={title}
      style={{ display: 'flex', alignItems: 'center', gap: 7, borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontFamily: 'inherit',
        background: on ? fg : bg, color: on ? '#fff' : fg, border: `1.5px solid ${on ? fg : 'transparent'}` }}>
      <b style={{ fontSize: 15 }}>{n}</b>
      <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: .3 }}>{l}</span>
    </button>
  )
}

function CatalogNote({ meta }) {
  const n = typeof meta.catalog === 'number' ? meta.catalog : null
  if (!n) return null
  return (
    <div style={{ fontSize: 12, color: '#5b6b7c', textAlign: 'center', fontWeight: 700 }}>
      {n.toLocaleString()} standards available to tag against · curated in ClearK12 Studio
    </div>
  )
}

/* ---------- the workbench ---------- */

function Workbench({ id, onChanged, onBack }) {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('build')
  const [draft, setDraft] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [proof, setProof] = useState(null)

  const load = useCallback(async () => {
    const d = await library.get(id)
    setData(d); setDraft(d.draft); setProof(d.proof); setDirty(false)
  }, [id])
  useEffect(() => { load() }, [load])

  if (!data || !draft) return <Panel><Centered>Loading…</Centered></Panel>

  function mutate(fn) {
    setDraft((d) => { const c = JSON.parse(JSON.stringify(d)); fn(c); return c })
    setDirty(true)
  }
  async function save() {
    setSaving(true)
    try { const r = await library.save(id, draft); setProof(r.proof); setDirty(false); await onChanged() }
    catch (e) { alert(e.message) } finally { setSaving(false) }
  }

  const p = data.path
  const tabs = [
    ['details', 'Details'],
    ['build', 'Build'],
    ['proof', `Proof${(proof?.errors || 0) + (proof?.flags || 0) ? ` · ${(proof.errors || 0) + (proof.flags || 0)}` : ''}`],
    ['publish', 'Approve & publish'],
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Panel pad={16}>
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', color: CYAN, fontSize: 12.5, fontWeight: 800, cursor: 'pointer', padding: 0, marginBottom: 10 }}>
          ← All topics
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 26 }}>{draft.icon || '📘'}</span>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 19, color: NAVY, letterSpacing: -.2 }}>{draft.title}</h2>
            <div style={{ fontSize: 12.5, color: '#5b6b7c', fontWeight: 700, marginTop: 2 }}>
              {[STATES.find((x) => x.code === draft.state)?.name, draft.grade ? `Grade ${draft.grade}` : null, draft.domain]
                .filter(Boolean).join(' · ') || 'Not filed yet'} · {proof?.points || 0} points
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StageControl path={p} onChanged={async () => { await load(); await onChanged() }} />
            {dirty && <span style={{ fontSize: 11.5, fontWeight: 800, color: AMBER }}>unsaved</span>}
            <button onClick={save} disabled={!dirty || saving} style={{ ...btn(dirty ? CYAN : '#e7edf3', dirty ? '#fff' : '#93a3b3'), cursor: dirty ? 'pointer' : 'default' }}>
              {saving ? 'Saving…' : 'Save draft'}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 14, borderTop: '1px solid #e7edf3', paddingTop: 12 }}>
          {tabs.map(([k, t]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ ...btn(tab === k ? NAVY : '#fff', tab === k ? '#fff' : '#5b6b7c'), border: tab === k ? 'none' : '1px solid #dde5ec', fontSize: 12.5, padding: '7px 13px' }}>
              {t}
            </button>
          ))}
        </div>
      </Panel>

      {tab === 'details' && <DetailsTab draft={draft} mutate={mutate} />}
      {tab === 'build' && <BuildTab draft={draft} mutate={mutate} />}
      {tab === 'proof' && <ProofTab draft={draft} proof={proof} dirty={dirty} onSave={save} videos={data.videos} mutate={mutate} />}
      {tab === 'publish' && <PublishTab path={p} proof={proof} versions={data.versions} dirty={dirty} draft={draft}
        onRefresh={async () => { await load(); await onChanged() }} onProof={() => setTab('proof')} />}
    </div>
  )
}

/* ---------- build ---------- */

function sheetsOf(t) {
  return [
    ...(t.core || []).map((w, i) => ({ kind: 'core', w, label: `${i + 1}. ${w.title}` })),
    ...Object.entries(t.skillBuilders || {}).map(([forId, w]) => ({ kind: 'sb', w, forId, label: `SB · ${(w.title || '').replace(/^SB:\s*/, '')}` })),
    ...(t.full ? [{ kind: 'full', w: t.full, label: 'Full Topic' }] : []),
  ]
}

function BuildTab({ draft, mutate }) {
  const sheets = sheetsOf(draft)
  const [wsId, setWsId] = useState(sheets[0]?.w.id || null)
  const current = sheets.find((s) => s.w.id === wsId) || sheets[0]

  const editSheet = (fn) => mutate((t) => {
    const target = (t.core || []).find((w) => w.id === current.w.id)
      || Object.values(t.skillBuilders || {}).find((w) => w.id === current.w.id)
      || (t.full && t.full.id === current.w.id ? t.full : null)
    if (target) fn(target)
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 12, alignItems: 'start' }}>
      <Panel pad={12}>
        <div style={{ ...label, marginBottom: 8 }}>THE PATH</div>
        {!sheets.length && <div style={{ fontSize: 12.5, color: '#5b6b7c' }}>This path has no worksheets yet.</div>}
        {sheets.map((s) => (
          <button key={s.w.id} onClick={() => setWsId(s.w.id)}
            style={{ display: 'block', width: '100%', textAlign: 'left', background: s.w.id === current?.w.id ? '#f2f9fc' : 'transparent', border: s.w.id === current?.w.id ? `1.5px solid ${CYAN}` : '1.5px solid transparent', borderRadius: 9, padding: '7px 9px', marginBottom: 3, cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: s.kind === 'sb' ? AMBER : NAVY, lineHeight: 1.3 }}>{s.label}</div>
            <div style={{ fontSize: 10.5, color: '#5b6b7c', fontWeight: 700 }}>
              {(() => {
                const acts = s.w.activities || []
                const ok = acts.filter((a) => a.approved).length
                return <span style={{ color: acts.length && ok === acts.length ? GREEN : undefined, fontWeight: 800 }}>
                  {ok}/{acts.length} approved
                </span>
              })()}
              {s.w.flag ? <span style={{ color: FLAG }}>⚑ </span> : null}
              {(s.w.standards || []).length
                ? <> · <span style={{ color: CYAN }}>{joinStandards(s.w.standards)}</span></>
                : <> · <span style={{ color: AMBER }}>untagged</span></>}
            </div>
          </button>
        ))}
      </Panel>

      <Panel>
        {!current ? <Empty /> : (
          <>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              <div style={{ flex: '1 1 260px' }}>
                <span style={label}>WORKSHEET TITLE</span>
                <input style={field} value={current.w.title || ''} onChange={(e) => editSheet((w) => { w.title = e.target.value })} />
              </div>
              <div style={{ flex: '1 1 260px' }}>
                <span style={label}>THE SKILL IT TEACHES</span>
                <input style={field} value={current.w.skill || ''} onChange={(e) => editSheet((w) => { w.skill = e.target.value })} />
              </div>
              <div style={{ flex: '1 1 100%' }}>
                <span style={label}>⚑ FLAG — SOMETHING HERE NEEDS CONFIRMING BEFORE IT GOES LIVE</span>
                <input style={{ ...field, borderColor: current.w.flag ? FLAG : 'var(--line)' }}
                  placeholder="Leave blank if nothing is unsettled"
                  value={current.w.flag || ''}
                  onChange={(e) => editSheet((w) => { if (e.target.value.trim()) w.flag = e.target.value; else delete w.flag })} />
              </div>
              <div style={{ flex: '1 1 240px' }}>
                <span style={label}>STANDARDS — WHAT THIS WORKSHEET TEACHES</span>
                <StandardsInput state={draft.state || 'TX'} value={current.w.standards}
                  onChange={(v) => editSheet((w) => { w.standards = v })} />
              </div>
            </div>
            {(current.w.activities || []).map((a, ai) => (
              <ActivityCard key={`${current.w.id}-${ai}`} act={a} index={ai} count={current.w.activities.length}
                onEdit={(fn) => editSheet((w) => fn(w.activities[ai]))}
                onRemove={() => editSheet((w) => { w.activities.splice(ai, 1) })} />
            ))}
          </>
        )}
      </Panel>
    </div>
  )
}

/* An activity in the console shows as the student meets it, because that is what
 * a publisher is actually judging. The markup and the fields are one click away
 * for when they need changing, but they are not the default view of the work. */
function ActivityCard({ act, index, count, onEdit, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [replay, setReplay] = useState(0)
  const kindName = { hunt: 'Error hunt', fix: 'Fill it in', maze: 'Maze', compose: 'Write it', passage: 'Read & answer' }[act.kind] || act.kind
  const approved = !!act.approved

  // Approving records who and when, because "approved" with nothing behind it is
  // a tick box. Editing clears it: an activity that changed after sign-off has
  // not been signed off.
  const approve = () => onEdit((a) => { a.approved = new Date().toISOString() })
  const unapprove = () => onEdit((a) => { delete a.approved })
  const edited = (fn) => onEdit((a) => { fn(a); delete a.approved })

  return (
    <div style={{ border: `1.5px solid ${approved ? GREEN + '55' : 'var(--line)'}`, borderRadius: 13, marginBottom: 11, background: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: approved ? '#f2fbf6' : '#f4f8fb', borderBottom: '1px solid var(--line)' }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .8, color: '#fff', background: approved ? GREEN : NAVY, borderRadius: 6, padding: '3px 8px' }}>{index + 1}</span>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800, color: approved ? GREEN : NAVY }}>{kindName}</span>
        {act.flag && <span style={{ fontSize: 11, fontWeight: 800, color: FLAG }}>⚑ flagged</span>}
        {approved && (
          <button onClick={unapprove} title={`Approved ${new Date(act.approved).toLocaleString()} — click to withdraw`}
            style={{ ...btn('#dcf0e4', GREEN), border: 'none', fontSize: 11.5, padding: '5px 11px' }}>
            ✓ Approved
          </button>
        )}
        {!editing && (
          <button onClick={() => setReplay((n) => n + 1)} title="Start this activity over"
            style={{ ...btn('#fff', '#5b6b7c'), border: '1px solid #dde5ec', fontSize: 11.5, padding: '5px 11px' }}>↺ Reset</button>
        )}
        <button onClick={() => setEditing((e) => !e)}
          style={{ ...btn(editing ? NAVY : '#fff', editing ? '#fff' : NAVY), border: editing ? 'none' : `1px solid ${NAVY}33`, fontSize: 11.5, padding: '5px 12px' }}>
          {editing ? 'Done editing' : '✎ Edit'}
        </button>
      </div>

      {editing ? (
        <div style={{ padding: '4px 14px 12px' }}>
          {approved && (
            <div style={{ background: '#fdf7e8', color: AMBER, borderRadius: 9, padding: '8px 11px', fontSize: 12, fontWeight: 700, margin: '10px 0 2px' }}>
              This activity is approved. Changing it withdraws that.
            </div>
          )}
          <ActivityEditor act={act} index={index} count={count} onEdit={edited} onRemove={onRemove} alwaysOpen />
        </div>
      ) : (
        <div style={{ padding: '14px 16px 16px' }}>
          <ActivityPreview key={replay} act={act} onDone={approve}
            doneLabel={approved ? '✓ Approved' : '✓ Approve this activity'} />
        </div>
      )}
    </div>
  )
}

/* ---------- proof ---------- */

function ProofTab({ draft, proof, dirty, onSave, videos, mutate }) {
  const [play, setPlay] = useState(null)
  const prepared = React.useMemo(() => { try { return prepareTopic(draft) } catch { return null } }, [draft])
  const sheets = sheetsOf(draft)

  const groups = {}
  for (const p of proof?.problems || []) (groups[p.where] ||= []).push(p)
  const clean = proof && proof.errors === 0 && proof.warnings === 0 && (proof.flags || 0) === 0

  /* Clearing a flag is the deliberate act the flag exists to force, so it is a
   * button on the flag itself rather than a field buried in the editor. The
   * flag's own words identify it — they are written to be specific. */
  function clearFlag(msg) {
    mutate((t) => {
      const sheets = [...(t.core || []), ...Object.values(t.skillBuilders || {}), ...(t.full ? [t.full] : [])]
      for (const ws of sheets) {
        if (ws.flag === msg) delete ws.flag
        for (const a of ws.activities || []) {
          if (a.flag === msg) delete a.flag
          for (const it of a.items || []) if (it && it.flag === msg) delete it.flag
          for (const q of a.questions || []) if (q && q.flag === msg) delete q.flag
        }
      }
    })
  }

  function open(id) {
    const all = prepared ? [...(prepared.core || []), ...Object.values(prepared.skillBuilders || {}), ...(prepared.full ? [prepared.full] : [])] : []
    const ws = all.find((w) => w.id === id)
    if (ws) setPlay(ws)
  }

  return (
    <>
      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <b style={{ fontSize: 15.5, color: NAVY }}>What a student would hit</b>
          <div style={{ flex: 1 }} />
          {dirty && <button onClick={onSave} style={btn(CYAN)}>Save to re-proof</button>}
        </div>
        <p style={{ fontSize: 13, color: '#5b6b7c', margin: '0 0 14px', maxWidth: 620 }}>
          Every activity is walked the way a student walks it — mazes are solved, model answers are run against their own
          checks, and every blank is tested for whether the sentence already gives it away.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <Tally n={proof?.errors ?? 0} label="must fix" color={RED} />
          <Tally n={proof?.flags ?? 0} label="flagged" color={FLAG} />
          <Tally n={proof?.warnings ?? 0} label="worth a look" color={AMBER} />
          <Tally n={proof?.points ?? 0} label="points" color={NAVY} />
          <Tally n={proof?.stops ?? 0} label="stops" color={NAVY} />
        </div>

        {clean && (
          <div style={{ background: '#dcf0e4', border: `1px solid ${GREEN}33`, borderRadius: 11, padding: '13px 15px', color: GREEN, fontWeight: 800, fontSize: 13.5 }}>
            ✓ Nothing to fix. This path is ready to approve.
          </div>
        )}

        {Object.entries(groups).map(([where, list]) => (
          <div key={where} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: NAVY, marginBottom: 5 }}>{where}</div>
            {list.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 9, background: p.level === 'error' ? '#fdecea' : p.level === 'flag' ? '#f3eefb' : '#fdf7e8', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: .5, color: '#fff', background: p.level === 'error' ? RED : p.level === 'flag' ? FLAG : AMBER, borderRadius: 5, padding: '2px 6px', marginTop: 1, whiteSpace: 'nowrap' }}>
                  {p.level === 'error' ? 'FIX' : p.level === 'flag' ? 'FLAG' : 'LOOK'}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{p.msg}</div>
                  {p.fix && <div style={{ fontSize: 12, color: '#5b6b7c', marginTop: 1 }}>{p.fix}</div>}
                </div>
                {p.level === 'flag' && (
                  <button onClick={() => clearFlag(p.msg)} title="I have confirmed this"
                    style={{ ...btn('#fff', FLAG), border: `1px solid ${FLAG}44`, fontSize: 11.5, padding: '5px 10px', whiteSpace: 'nowrap' }}>
                    Confirmed
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}
      </Panel>

      <Panel>
        <b style={{ fontSize: 15.5, color: NAVY }}>Play it yourself</b>
        <p style={{ fontSize: 13, color: '#5b6b7c', margin: '3px 0 12px' }}>
          This is the student screen, not a mock-up of it — the same code, running your draft. Nothing here is scored or paid.
        </p>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {sheets.map((s) => (
            <button key={s.w.id} onClick={() => open(s.w.id)}
              style={{ ...btn('#e7edf3', NAVY), fontSize: 12.5, padding: '8px 13px' }}>▶ {s.label}</button>
          ))}
        </div>
        {videos?.length ? (
          <div style={{ fontSize: 11.5, color: '#5b6b7c', marginTop: 12, fontWeight: 700 }}>
            {videos.length} solution videos in the library
          </div>
        ) : null}
      </Panel>

      {play && (
        <Worksheet ws={play} topic={prepared} progress={{}} preview
          onQuit={() => setPlay(null)} onClose={() => setPlay(null)} onDone={() => {}} onNext={() => setPlay(null)} />
      )}
    </>
  )
}

const Tally = ({ n, label: l, color }) => (
  <div style={{ background: PAPER, borderRadius: 11, padding: '9px 15px', minWidth: 84 }}>
    <div style={{ fontSize: 21, fontWeight: 800, color: n ? color : '#93a3b3', lineHeight: 1 }}>{n}</div>
    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .5, color: '#5b6b7c', marginTop: 3 }}>{l.toUpperCase()}</div>
  </div>
)

/* ---------- approve & publish ---------- */

function PublishTab({ path, proof, versions, dirty, draft, onRefresh, onProof }) {
  // Approving activities is a person's job and proofing is a machine's; neither
  // stands in for the other, so publishing shows both and blocks only on the one
  // that means a student would hit a dead end.
  const acts = [...(draft?.core || []), ...Object.values(draft?.skillBuilders || {}), ...(draft?.full ? [draft.full] : [])]
    .flatMap((w) => (w.activities || []).map((a) => ({ ...a, sheet: w.title })))
  const signedOff = acts.filter((a) => a.approved).length
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState(null)
  const blocked = (proof?.errors ?? 0) > 0 || (proof?.flags ?? 0) > 0

  async function run(fn, kind) {
    setBusy(kind); setMsg(null)
    try { await fn(); setNote(''); await onRefresh(); setMsg({ ok: true, text: kind === 'publish' ? 'Approved. Students are on the new version.' : 'Done.' }) }
    catch (e) { setMsg({ ok: false, text: e.message }) }
    finally { setBusy('') }
  }

  return (
    <>
      <Panel>
        <b style={{ fontSize: 15.5, color: NAVY }}>Approve for the live site</b>
        <p style={{ fontSize: 13, color: '#5b6b7c', margin: '3px 0 14px', maxWidth: 640 }}>
          Approving takes a snapshot of the draft and points students at it. Later edits sit on the draft until they are
          approved too, so a class working through this path today will not have it change underneath them.
        </p>

        {dirty && (
          <Note color={AMBER}>You have unsaved changes. Save the draft first — approval snapshots what is saved.</Note>
        )}
        {blocked && (
          <Note color={(proof?.errors ?? 0) > 0 ? RED : FLAG}>
            {(proof?.errors ?? 0) > 0
              ? `${proof.errors} ${proof.errors === 1 ? 'problem' : 'problems'} must be fixed before this can go live.`
              : `${proof.flags} ${proof.flags === 1 ? 'flag is' : 'flags are'} still raised. Somebody has to confirm these before a class sees them.`}{' '}
            <button onClick={onProof} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', font: 'inherit', padding: 0 }}>See them →</button>
          </Note>
        )}
        {!blocked && !dirty && path.unpublishedChanges && (
          <Note color={AMBER}>The draft has moved ahead of what students are seeing.</Note>
        )}
        {msg && <Note color={msg.ok ? GREEN : RED}>{msg.text}</Note>}

        {acts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: PAPER, borderRadius: 11, padding: '11px 14px', marginTop: 4 }}>
            <div style={{ flex: '0 0 auto', fontSize: 21, fontWeight: 800, color: signedOff === acts.length ? GREEN : '#93a3b3', lineHeight: 1 }}>
              {signedOff}/{acts.length}
            </div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: '#5b6b7c', fontWeight: 700 }}>
              {signedOff === acts.length
                ? 'Every activity has been played through and approved.'
                : `${acts.length - signedOff} ${acts.length - signedOff === 1 ? 'activity has' : 'activities have'} not been approved yet. Proofing does not check whether anyone has read them.`}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 9, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 12 }}>
          <div style={{ flex: '1 1 280px' }}>
            <span style={label}>WHAT CHANGED (optional — kept with the version)</span>
            <input style={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. reworded the preposition items" />
          </div>
          <button disabled={blocked || dirty || !!busy}
            onClick={() => run(() => library.publish(path.id, note), 'publish')}
            style={{ ...btn(blocked || dirty ? '#e7edf3' : GREEN, blocked || dirty ? '#93a3b3' : '#fff'), cursor: blocked || dirty ? 'default' : 'pointer' }}>
            {busy === 'publish' ? 'Approving…' : path.liveVersion ? 'Approve new version' : 'Approve & go live'}
          </button>
          {path.status === 'published' && (
            <button disabled={!!busy} onClick={() => run(() => library.unpublish(path.id), 'unpublish')} style={btn('#e7edf3', NAVY)}>Take off the live site</button>
          )}
        </div>
      </Panel>

      <Panel>
        <b style={{ fontSize: 15.5, color: NAVY }}>Version history</b>
        <p style={{ fontSize: 13, color: '#5b6b7c', margin: '3px 0 12px' }}>
          Every approval is kept. Restoring puts an old version back on the workbench as a draft — the live site does not
          change until you approve again.
        </p>
        {!versions?.length && <div style={{ fontSize: 13, color: '#5b6b7c' }}>Nothing approved yet.</div>}
        {(versions || []).map((v) => (
          <div key={v.version} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 10, background: v.version === path.liveVersion ? '#dcf0e4' : PAPER, marginBottom: 5 }}>
            <b style={{ fontSize: 13, color: NAVY, width: 34 }}>v{v.version}</b>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: INK, fontWeight: 700 }}>{v.note || 'No note'}</div>
              <div style={{ fontSize: 11.5, color: '#5b6b7c', fontWeight: 700 }}>
                {new Date(v.created_at).toLocaleString()} · {v.points} points
                {v.version === path.liveVersion ? ' · live now' : ''}
              </div>
            </div>
            <button disabled={!!busy} onClick={() => run(() => library.restore(path.id, v.version), 'restore')}
              style={{ ...btn('#fff', NAVY), border: '1px solid #dde5ec', fontSize: 12, padding: '6px 11px' }}>
              Restore to draft
            </button>
          </div>
        ))}
      </Panel>
    </>
  )
}

const Note = ({ color, children }) => (
  <div style={{ background: color === RED ? '#fdecea' : color === AMBER ? '#fdf7e8' : '#dcf0e4', color, borderRadius: 10, padding: '10px 13px', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
    {children}
  </div>
)
