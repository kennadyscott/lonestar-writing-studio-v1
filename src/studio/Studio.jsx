import React, { useEffect, useState, useCallback } from 'react'
import { library, getKey, setKey } from '../lib/library.js'
import { STATES, GRADES } from '../../lib/content/taxonomy.mjs'

/*
 * ClearK12 Content Studio — the level above the products.
 *
 * Standards, topics and vocabulary are curated once and consumed everywhere, so
 * they are owned here rather than by whichever product happened to need them
 * first. The products sit below: Crystal Writing, ClearLessons, Crystal Quest,
 * Fluency. They read this; they do not own it.
 *
 * The storage was always at this level — core is a schema above every product's
 * own. What was wrong was the door: the only way to load standards was through
 * one product's console, which made that product look like the owner of shared
 * data. This is the door at the level the data already lives at.
 */

const NAVY = '#16386b'
const CYAN = '#0f97c2'
const INK = '#0e2748'
const PAPER = '#eef3f7'
const GREEN = '#1e7a4a'
const AMBER = '#b47b13'
const RED = '#c0392b'

const field = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #dde5ec', fontFamily: 'inherit', fontSize: 13.5, background: '#fff' }
const label = { fontSize: 10.5, fontWeight: 800, letterSpacing: .7, color: '#5b6b7c', display: 'block', marginBottom: 3 }
const btn = (bg, fg = '#fff') => ({ background: bg, color: fg, border: 'none', borderRadius: 9, padding: '9px 15px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' })
const Panel = ({ children, pad = 18 }) => <div style={{ background: '#fff', borderRadius: 15, border: '1px solid #dde5ec', padding: pad }}>{children}</div>

// The products this studio supplies. Only the ones that actually read core are
// linked; the rest are named so the shape of the platform is visible.
const PRODUCTS = [
  { id: 'writing', name: 'Crystal Writing', blurb: 'Writing paths and the Proof Room', href: 'publisher', live: true, icon: '💎' },
  { id: 'lessons', name: 'ClearLessons', blurb: 'Lesson decks and workbooks', live: false, icon: '📘' },
  { id: 'quest', name: 'Crystal Quest', blurb: 'Maths adventure', live: false, icon: '🗺' },
  { id: 'fluency', name: 'Fluency', blurb: 'Practice and drills', live: false, icon: '⚡' },
]

export default function Studio() {
  const [meta, setMeta] = useState(null)
  const [locked, setLocked] = useState(false)
  const [tab, setTab] = useState('standards')
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    try { setMeta(await library.meta()); setLocked(false) }
    catch (e) { if (e.status === 401) setLocked(true); else setErr(e.message) }
  }, [])
  useEffect(() => { load() }, [load])

  if (locked) return <KeyGate onDone={load} />
  if (err) return <Center><b style={{ color: RED }}>{err}</b></Center>
  if (!meta) return <Center>Opening the studio…</Center>

  const tabs = [['standards', 'Standards'], ['vocab', 'Vocabulary'], ['topics', 'Topics'], ['tools', 'Products'], ['cost', 'Cost']]

  return (
    <div style={{ minHeight: '100vh', background: PAPER, fontFamily: 'Manrope, system-ui, sans-serif', color: INK }}>
      <header style={{ background: `linear-gradient(180deg,#2c5a97 0%,${NAVY} 62%,${INK} 100%)`, color: '#fff', padding: '15px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, maxWidth: 1240, margin: '0 auto' }}>
          <span style={{ fontSize: 23 }}>🅲</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 18, letterSpacing: -.2 }}>ClearK12 Content Studio</b>
            <div style={{ fontSize: 11.5, color: '#a8dff5', fontWeight: 700 }}>
              Standards, vocabulary and topics — shared by every product
            </div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .5, background: 'rgba(255,255,255,.14)', color: '#a8dff5', borderRadius: 999, padding: '4px 10px' }}>
            {meta.backend === 'supabase' ? 'SUPABASE' : 'LOCAL FILE'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 13, maxWidth: 1240, margin: '13px auto 0', flexWrap: 'wrap' }}>
          {tabs.map(([k, t]) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ ...btn(tab === k ? '#fff' : 'rgba(255,255,255,.12)', tab === k ? NAVY : '#a8dff5'), fontSize: 12.5, padding: '7px 14px' }}>{t}</button>
          ))}
        </div>
      </header>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tab === 'standards' && <Standards meta={meta} onChanged={load} />}
        {tab === 'tools' && <Products />}
        {tab !== 'standards' && tab !== 'tools' && <NotYet what={tabs.find(([k]) => k === tab)[1]} />}
      </div>
    </div>
  )
}

const Center = ({ children }) => (
  <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', fontFamily: 'Manrope, sans-serif', color: '#5b6b7c' }}>{children}</div>
)

function NotYet({ what }) {
  return (
    <Panel>
      <b style={{ fontSize: 15.5, color: NAVY }}>{what}</b>
      <p style={{ fontSize: 13.5, color: '#5b6b7c', margin: '5px 0 0', maxWidth: 620 }}>
        This belongs here and is not built yet. {what === 'Vocabulary'
          ? 'ClearLessons already holds 364 terms with 480 grade-level definitions — they move here so a word means the same thing in every product.'
          : what === 'Topics'
          ? 'ClearLessons holds 29, seeded from a screenshot and flagged where the source was cut off.'
          : 'Every product writes its spend here so the total is answerable in one place.'}
      </p>
    </Panel>
  )
}

function KeyGate({ onDone }) {
  const [v, setV] = useState(getKey())
  const [bad, setBad] = useState(false)
  async function go(e) {
    e.preventDefault(); setBad(false); setKey(v.trim())
    try { await library.meta(); onDone() } catch { setBad(true); setKey('') }
  }
  return (
    <Center>
      <form onSubmit={go} style={{ background: '#fff', border: '1px solid #dde5ec', borderRadius: 15, padding: 26, width: 380, maxWidth: '92vw' }}>
        <div style={{ fontSize: 30, marginBottom: 6 }}>🅲</div>
        <b style={{ fontSize: 17, color: INK }}>ClearK12 Content Studio</b>
        <p style={{ fontSize: 13.5, color: '#5b6b7c', margin: '5px 0 14px' }}>This workspace is shared. Enter the key to continue.</p>
        <input style={{ ...field, marginBottom: 10 }} type="password" autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder="Workspace key" />
        {bad && <div style={{ fontSize: 12.5, color: RED, fontWeight: 700, marginBottom: 10 }}>That key was not accepted.</div>}
        <button type="submit" style={{ ...btn(CYAN), width: '100%' }}>Open the studio</button>
      </form>
    </Center>
  )
}

/* ---------- standards ---------- */

const SUBJECTS = ['ELAR', 'Math', 'Science', 'Social Studies']

function Standards({ meta, onChanged }) {
  const [q, setQ] = useState({ state: 'TX', subject: '', grade: '', q: '' })
  const [data, setData] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const count = typeof meta.catalog === 'number' ? meta.catalog : null
  const cerr = meta.catalog && typeof meta.catalog === 'object' ? meta.catalog.error : null
  const available = meta.catalogAvailable || 0

  const search = useCallback(async () => {
    try { setData(await library.standards({ ...q, limit: 60 })) } catch (e) { setData({ rows: [], total: 0, error: e.message }) }
  }, [q])
  useEffect(() => { if (count) search() }, [search, count])

  async function importCatalog() {
    setBusy(true); setMsg(null)
    try { const r = await library.importCatalog(); setMsg({ ok: true, text: `${r.count.toLocaleString()} standards loaded.` }); await onChanged() }
    catch (e) { setMsg({ ok: false, text: e.message }) } finally { setBusy(false) }
  }

  return (
    <>
      <Panel>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px' }}>
            <b style={{ fontSize: 15.5, color: NAVY }}>The standards catalog</b>
            <p style={{ fontSize: 13, color: '#5b6b7c', margin: '4px 0 0', maxWidth: 620 }}>
              Verbatim from TEA, parsed from the published chapter documents. Every row carries the page it came from, and
              breakouts are rows in their own right because 5.11D (ii) is what a worksheet actually teaches.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 27, fontWeight: 800, color: count ? NAVY : '#93a3b3', lineHeight: 1 }}>
              {count == null ? '—' : count.toLocaleString()}
            </div>
            <div style={{ ...label, marginTop: 4 }}>IN THE CATALOG</div>
          </div>
        </div>

        {cerr && (
          <div style={{ background: '#fdecea', color: RED, borderRadius: 10, padding: '10px 12px', fontSize: 12.5, fontWeight: 700, margin: '12px 0 0' }}>
            {/schema must be one of|does not exist|permission denied/i.test(cerr)
              ? 'The core schema is not reachable yet — it needs to be exposed to the API and granted to the service role.'
              : cerr}
          </div>
        )}
        {msg && (
          <div style={{ background: msg.ok ? '#dcf0e4' : '#fdecea', color: msg.ok ? GREEN : RED, borderRadius: 10, padding: '10px 12px', fontSize: 12.5, fontWeight: 700, margin: '12px 0 0' }}>
            {msg.text}
          </div>
        )}
        {meta.backend === 'supabase' && (
          <button onClick={importCatalog} disabled={busy}
            style={{ ...btn(count ? '#e7edf3' : CYAN, count ? NAVY : '#fff'), marginTop: 12 }}>
            {busy ? 'Importing…' : count ? 'Re-import from TEA' : `Import the TEKS catalog (${available.toLocaleString()})`}
          </button>
        )}
      </Panel>

      {!!count && (
        <Panel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ flex: '1 1 240px' }}>
              <span style={label}>SEARCH</span>
              <input style={field} value={q.q} placeholder="pronouns, fractions, 5.11D…"
                onChange={(e) => setQ({ ...q, q: e.target.value })} />
            </div>
            <div style={{ flex: '0 0 120px' }}>
              <span style={label}>STATE</span>
              <select style={field} value={q.state} onChange={(e) => setQ({ ...q, state: e.target.value })}>
                {STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ flex: '0 0 150px' }}>
              <span style={label}>SUBJECT</span>
              <select style={field} value={q.subject} onChange={(e) => setQ({ ...q, subject: e.target.value })}>
                <option value="">All</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: '0 0 110px' }}>
              <span style={label}>GRADE</span>
              <select style={field} value={q.grade} onChange={(e) => setQ({ ...q, grade: e.target.value })}>
                <option value="">All</option>
                {GRADES.slice(0, 9).map((g) => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
          </div>

          {data?.error && <div style={{ color: RED, fontSize: 13, fontWeight: 700 }}>{data.error}</div>}
          {data && !data.error && (
            <>
              <div style={{ ...label, marginBottom: 7 }}>
                {data.total.toLocaleString()} MATCH{data.total === 1 ? '' : 'ES'}{data.total > data.rows.length ? ` · SHOWING ${data.rows.length}` : ''}
              </div>
              <div style={{ maxHeight: '58vh', overflowY: 'auto', border: '1px solid #e7edf3', borderRadius: 11 }}>
                {data.rows.map((r) => (
                  <div key={r.id} style={{ display: 'flex', gap: 11, padding: '9px 12px', borderBottom: '1px solid #f0f4f7', alignItems: 'flex-start' }}>
                    <code style={{ flex: '0 0 108px', fontSize: 12, fontWeight: 800, color: CYAN }}>{r.standard_id}</code>
                    <div style={{ flex: '0 0 130px', fontSize: 12, fontWeight: 700, color: NAVY }}>{r.domain}</div>
                    <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: INK }}>{r.description}</div>
                    <div style={{ flex: '0 0 120px', fontSize: 11, color: '#93a3b3', fontWeight: 700, textAlign: 'right' }}>
                      {r.subject === 'Social Studies' ? 'SS' : r.subject} {r.grade}
                      {r.course && r.course !== 'Grade Level' && (
                        <div style={{ color: AMBER, fontSize: 10, marginTop: 1 }} title={r.course}>
                          {r.course.includes('Algebra') ? 'ADVANCED · ALG I' : 'ADVANCED'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!data.rows.length && <div style={{ padding: 18, fontSize: 13, color: '#5b6b7c' }}>Nothing matches.</div>}
              </div>
            </>
          )}
        </Panel>
      )}
    </>
  )
}

/* ---------- products ---------- */

function Products() {
  return (
    <Panel>
      <b style={{ fontSize: 15.5, color: NAVY }}>Products</b>
      <p style={{ fontSize: 13, color: '#5b6b7c', margin: '4px 0 14px', maxWidth: 620 }}>
        Each one keeps its own content and its own student records, and reads this studio for the things that should mean
        the same everywhere.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 10 }}>
        {PRODUCTS.map((p) => (
          <a key={p.id} href={p.live ? p.href : undefined}
            style={{ display: 'block', textDecoration: 'none', border: '1px solid #dde5ec', borderRadius: 13, padding: '13px 14px', background: p.live ? '#fff' : '#f7fafc', cursor: p.live ? 'pointer' : 'default', opacity: p.live ? 1 : .68 }}>
            <div style={{ fontSize: 20, marginBottom: 5 }}>{p.icon}</div>
            <b style={{ fontSize: 14, color: NAVY }}>{p.name}</b>
            <div style={{ fontSize: 12, color: '#5b6b7c', fontWeight: 700, marginTop: 2 }}>{p.blurb}</div>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .5, color: p.live ? GREEN : '#93a3b3', marginTop: 7 }}>
              {p.live ? 'OPEN →' : 'NOT WIRED UP YET'}
            </div>
          </a>
        ))}
      </div>
    </Panel>
  )
}
