import React, { useEffect, useState, useCallback } from 'react'
import { library, getKey, setKey } from '../lib/library.js'
import { ActivityEditor, field, label } from '../student/PublisherConsole.jsx'
import { Worksheet } from '../student/ProofRoom.jsx'
import { prepareTopic } from '../../server/proofRoom.mjs'

/*
 * The Path Library — where learning paths are built, proofed and approved.
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

const STATUS = {
  draft: { text: 'Draft', bg: '#e7edf3', fg: '#5b6b7c' },
  in_review: { text: 'Ready for review', bg: '#fdf1d8', fg: AMBER },
  published: { text: 'Live', bg: '#dcf0e4', fg: GREEN },
}

function StatusPill({ status, version }) {
  const s = STATUS[status] || STATUS.draft
  return (
    <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .5, background: s.bg, color: s.fg, borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap' }}>
      {s.text}{status === 'published' && version != null ? ` · v${version}` : ''}
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
      setSel((s) => s || paths[0]?.id || null)
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
        <span style={{ fontSize: 21 }}>🗂</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <b style={{ fontSize: 17, letterSpacing: -.2 }}>Path Library</b>
          <div style={{ fontSize: 11.5, color: '#a8dff5', fontWeight: 700 }}>
            LoneStar CR · build, proof and approve learning paths
          </div>
        </div>
        <span title={meta?.backend === 'supabase' ? 'Content is stored in Supabase' : 'Content is stored in a local file — set SUPABASE_URL to use the database'}
          style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .5, background: 'rgba(255,255,255,.14)', color: '#a8dff5', borderRadius: 999, padding: '4px 10px' }}>
          {meta?.backend === 'supabase' ? 'SUPABASE' : 'LOCAL FILE'}
        </span>
        {onExit && <button onClick={onExit} style={{ ...btn('rgba(255,255,255,.14)', '#a8dff5'), padding: '7px 13px', fontSize: 12.5 }}>Student view →</button>}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '288px 1fr', alignItems: 'start', gap: 18, padding: 18, maxWidth: 1360, margin: '0 auto' }}>
        <Rail paths={paths} sel={sel} onSelect={setSel} onChanged={load} />
        {sel
          ? <Workbench key={sel} id={sel} onChanged={load} />
          : <Panel><Empty /></Panel>}
      </div>
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

function Rail({ paths, sel, onSelect, onChanged }) {
  const [busy, setBusy] = useState('')
  async function seed() { setBusy('seed'); try { await library.seed(); await onChanged() } finally { setBusy('') } }
  async function create() {
    const title = prompt('Name the learning path')
    if (!title) return
    setBusy('new')
    try { const r = await library.create({ title, short: title }); await onChanged(); onSelect(r.path.id) }
    catch (e) { alert(e.message) } finally { setBusy('') }
  }
  return (
    <div style={{ position: 'sticky', top: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Panel pad={12}>
        <div style={{ ...label, marginBottom: 8 }}>LEARNING PATHS · {paths.length}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '52vh', overflowY: 'auto' }}>
          {paths.map((p) => {
            const on = p.id === sel
            return (
              <button key={p.id} onClick={() => onSelect(p.id)}
                style={{ textAlign: 'left', border: on ? `1.5px solid ${CYAN}` : '1.5px solid transparent', background: on ? '#f2f9fc' : '#fff', borderRadius: 11, padding: '9px 11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 15 }}>{p.icon || '📘'}</span>
                  <b style={{ flex: 1, fontSize: 13.5, color: NAVY, lineHeight: 1.25 }}>{p.title}</b>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <StatusPill status={p.status} version={p.liveVersion} />
                  {p.errors > 0 && <span style={{ fontSize: 10.5, fontWeight: 800, color: RED }}>● {p.errors} to fix</span>}
                  {p.errors === 0 && p.unpublishedChanges && <span style={{ fontSize: 10.5, fontWeight: 800, color: AMBER }}>● changes not live</span>}
                </div>
                <div style={{ fontSize: 11, color: '#5b6b7c', fontWeight: 700, marginTop: 4 }}>
                  {p.grade ? `Grade ${p.grade} · ` : ''}{p.stops} stops · {p.points} pts
                </div>
              </button>
            )
          })}
        </div>
      </Panel>
      <Panel pad={12}>
        <button onClick={create} disabled={!!busy} style={{ ...btn(NAVY), width: '100%', marginBottom: 7 }}>+ New learning path</button>
        <button onClick={seed} disabled={!!busy} style={{ ...btn('#e7edf3', NAVY), width: '100%' }}>
          {busy === 'seed' ? 'Loading…' : 'Load the paths that ship with the app'}
        </button>
      </Panel>
    </div>
  )
}

/* ---------- the workbench ---------- */

function Workbench({ id, onChanged }) {
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
    ['build', 'Build'],
    ['proof', `Proof${proof?.errors ? ` · ${proof.errors}` : ''}`],
    ['publish', 'Approve & publish'],
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Panel pad={16}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 26 }}>{draft.icon || '📘'}</span>
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 19, color: NAVY, letterSpacing: -.2 }}>{draft.title}</h2>
            <div style={{ fontSize: 12.5, color: '#5b6b7c', fontWeight: 700, marginTop: 2 }}>
              {draft.standards || 'No standards listed'}{draft.grade ? ` · Grade ${draft.grade}` : ''} · {proof?.points || 0} points
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusPill status={p.status} version={p.liveVersion} />
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

      {tab === 'build' && <BuildTab draft={draft} mutate={mutate} />}
      {tab === 'proof' && <ProofTab draft={draft} proof={proof} dirty={dirty} onSave={save} videos={data.videos} />}
      {tab === 'publish' && <PublishTab path={p} proof={proof} versions={data.versions} dirty={dirty}
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
            <div style={{ fontSize: 10.5, color: '#5b6b7c', fontWeight: 700 }}>{(s.w.activities || []).length} activities</div>
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
            </div>
            {(current.w.activities || []).map((a, ai) => (
              <ActivityEditor key={ai} act={a} index={ai} count={current.w.activities.length}
                onEdit={(fn) => editSheet((w) => fn(w.activities[ai]))}
                onRemove={() => editSheet((w) => { w.activities.splice(ai, 1) })} />
            ))}
          </>
        )}
      </Panel>
    </div>
  )
}

/* ---------- proof ---------- */

function ProofTab({ draft, proof, dirty, onSave, videos }) {
  const [play, setPlay] = useState(null)
  const prepared = React.useMemo(() => { try { return prepareTopic(draft) } catch { return null } }, [draft])
  const sheets = sheetsOf(draft)

  const groups = {}
  for (const p of proof?.problems || []) (groups[p.where] ||= []).push(p)
  const clean = proof && proof.errors === 0 && proof.warnings === 0

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
              <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 9, background: p.level === 'error' ? '#fdecea' : '#fdf7e8', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: .5, color: '#fff', background: p.level === 'error' ? RED : AMBER, borderRadius: 5, padding: '2px 6px', marginTop: 1, whiteSpace: 'nowrap' }}>
                  {p.level === 'error' ? 'FIX' : 'LOOK'}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{p.msg}</div>
                  {p.fix && <div style={{ fontSize: 12, color: '#5b6b7c', marginTop: 1 }}>{p.fix}</div>}
                </div>
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

function PublishTab({ path, proof, versions, dirty, onRefresh, onProof }) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState(null)
  const blocked = (proof?.errors ?? 0) > 0

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
          <Note color={RED}>
            {proof.errors} {proof.errors === 1 ? 'problem' : 'problems'} must be fixed before this can go live.{' '}
            <button onClick={onProof} style={{ background: 'none', border: 'none', color: RED, fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', font: 'inherit', padding: 0 }}>See them →</button>
          </Note>
        )}
        {!blocked && !dirty && path.unpublishedChanges && (
          <Note color={AMBER}>The draft has moved ahead of what students are seeing.</Note>
        )}
        {msg && <Note color={msg.ok ? GREEN : RED}>{msg.text}</Note>}

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
          {path.status === 'published'
            ? <button disabled={!!busy} onClick={() => run(() => library.unpublish(path.id), 'unpublish')} style={btn('#e7edf3', NAVY)}>Take off the live site</button>
            : <button disabled={!!busy} onClick={() => run(() => library.review(path.id), 'review')} style={btn('#e7edf3', NAVY)}>Mark ready for review</button>}
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
