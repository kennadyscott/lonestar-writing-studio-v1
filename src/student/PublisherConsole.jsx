import React, { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { ART_CHOICES } from './ProofRoom.jsx'

/*
 * Publisher console — where the questions come from.
 *
 * The Proof Room reads its content from the API rather than from a frozen
 * import, so a publisher can open a worksheet, change what it asks, add or drop
 * items, and have students see it on the next load. Deliberately plain: this is
 * the authoring surface, not a student screen.
 *
 * Authoring notes that matter:
 *   hunt     errors are marked inline in the passage as [[wrong|right]]
 *   fix      one blank per item, written as ____ inside the sentence
 *   maze     grid rows of S start · X finish · # wall · . open · A–J gates
 *   compose  the checks are rules; wording is free, the named moves are not
 */

const NAVY = '#16386b'
const CYAN = '#0f97c2'

export const field = {
  width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)',
  fontFamily: 'inherit', fontSize: 13.5, background: '#fff',
}
export const label = { fontSize: 10.5, fontWeight: 800, letterSpacing: .7, color: 'var(--muted)', display: 'block', marginBottom: 3 }

export default function PublisherConsole({ onClose }) {
  const [topics, setTopics] = useState(null)
  const [ti, setTi] = useState(0)
  const [wsKey, setWsKey] = useState(null)     // { kind: 'core'|'sb'|'full', id }
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { api.proofContent().then((r) => setTopics(r.topics)).catch(() => setTopics([])) }, [])

  if (!topics) return <Shell onClose={onClose}><div style={{ padding: 30, color: 'var(--muted)' }}>Loading content…</div></Shell>
  const topic = topics[ti]
  if (!topic) return <Shell onClose={onClose}><div style={{ padding: 30 }}>No topics loaded.</div></Shell>

  const sheets = [
    ...topic.core.map((w) => ({ kind: 'core', w })),
    ...Object.entries(topic.skillBuilders || {}).map(([forId, w]) => ({ kind: 'sb', w, forId })),
    ...(topic.full ? [{ kind: 'full', w: topic.full }] : []),
  ]
  const current = sheets.find((s) => s.w.id === wsKey) || sheets[0]

  function mutate(fn) {
    setTopics((all) => {
      const copy = JSON.parse(JSON.stringify(all))
      fn(copy[ti])
      return copy
    })
    setDirty(true); setSaved(false)
  }
  function editSheet(fn) {
    mutate((t) => {
      const target = t.core.find((w) => w.id === current.w.id)
        || Object.values(t.skillBuilders || {}).find((w) => w.id === current.w.id)
        || (t.full && t.full.id === current.w.id ? t.full : null)
      if (target) fn(target)
    })
  }
  async function save() {
    setSaving(true)
    try { await api.saveTopic(topic); setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2500) }
    finally { setSaving(false) }
  }
  async function revert() {
    const r = await api.revertProof()
    setTopics(r.topics); setDirty(false)
  }

  return (
    <Shell onClose={onClose}
      right={
        <>
          {dirty && <span style={{ fontSize: 12, fontWeight: 800, color: '#f5c542' }}>unsaved changes</span>}
          {saved && <span style={{ fontSize: 12, fontWeight: 800, color: '#8ff0bd' }}>✓ published</span>}
          <button onClick={revert} style={{ background: 'rgba(255,255,255,.14)', color: '#a8dff5', borderRadius: 999, padding: '6px 13px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>
            Revert to shipped
          </button>
          <button onClick={save} disabled={!dirty || saving}
            style={{ background: dirty ? '#f0b429' : 'rgba(255,255,255,.14)', color: dirty ? '#3d2c00' : '#8fb4d6',
              borderRadius: 999, padding: '7px 16px', fontSize: 12.5, fontWeight: 800, cursor: dirty ? 'pointer' : 'default' }}>
            {saving ? 'Publishing…' : 'Publish changes'}
          </button>
        </>
      }>
      <div className="conf-split" style={{ minHeight: 0, height: '100%' }}>
        {/* the set */}
        <div style={{ borderRight: '1px solid var(--line)', background: '#fbfdfe', padding: '14px 16px', overflowY: 'auto' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: NAVY }}>{topic.title}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>{topic.standards} · Grade {topic.grade}</div>

          {['core', 'sb', 'full'].map((kind) => (
            <div key={kind} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: .9, color: CYAN, marginBottom: 6 }}>
                {kind === 'core' ? 'CORE PATH' : kind === 'sb' ? 'SKILL BUILDERS' : 'CAPSTONE'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {sheets.filter((s) => s.kind === kind).map(({ w }) => {
                  const on = current.w.id === w.id
                  return (
                    <button key={w.id} onClick={() => setWsKey(w.id)}
                      style={{ textAlign: 'left', borderRadius: 9, padding: '8px 11px', fontSize: 13, fontWeight: on ? 800 : 600, cursor: 'pointer',
                        background: on ? '#e9f5fb' : 'transparent', color: on ? NAVY : '#4a627a',
                        border: on ? '1.5px solid #9fd9ef' : '1.5px solid transparent' }}>
                      {w.title}
                      <span style={{ display: 'block', fontSize: 10.5, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>
                        {w.activities.length} activities · {w.id}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* the worksheet */}
        <div style={{ padding: '14px 18px', overflowY: 'auto', minHeight: 0 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '2 1 220px' }}>
              <span style={label}>WORKSHEET TITLE</span>
              <input style={field} value={current.w.title} onChange={(e) => editSheet((w) => { w.title = e.target.value })} />
            </div>
            <div style={{ flex: '3 1 260px' }}>
              <span style={label}>SKILL LINE</span>
              <input style={field} value={current.w.skill} onChange={(e) => editSheet((w) => { w.skill = e.target.value })} />
            </div>
          </div>

          {current.w.activities.map((a, ai) => (
            <ActivityEditor key={ai} act={a} index={ai} count={current.w.activities.length}
              onEdit={(fn) => editSheet((w) => fn(w.activities[ai]))}
              onRemove={() => editSheet((w) => { w.activities.splice(ai, 1) })} />
          ))}
        </div>
      </div>
    </Shell>
  )
}

export function ActivityEditor({ act, index, count, onEdit, onRemove, alwaysOpen }) {
  const [open, setOpen] = useState(alwaysOpen || index === 0)
  const kindName = { hunt: 'Error hunt', fix: 'Fill it in', maze: 'Maze', compose: 'Write it', passage: 'Read & answer' }[act.kind] || act.kind

  return (
    <div style={alwaysOpen
      ? { background: '#fff' }
      : { border: '1.5px solid var(--line)', borderRadius: 13, marginBottom: 11, background: '#fff', overflow: 'hidden' }}>
      {!alwaysOpen && <button onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: open ? '#f4f8fb' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .8, color: '#fff', background: NAVY, borderRadius: 6, padding: '3px 8px' }}>{index + 1}</span>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800, color: NAVY }}>{kindName}</span>
        <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>
          {act.kind === 'hunt' ? 'markup [[wrong|right]]' : act.kind === 'maze' ? `${Object.keys(act.gates || {}).length} gates` : `${(act.items || []).length} items`}
        </span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{open ? '▲' : '▼'}</span>
      </button>}

      {open && (
        <div style={alwaysOpen
          ? { padding: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 11 }
          : { padding: '12px 14px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div>
            <span style={label}>WHAT THE STUDENT SEES ABOVE THE WORK</span>
            <input style={field} value={act.brief || ''} onChange={(e) => onEdit((a) => { a.brief = e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 220px' }}>
              <span style={label}>PICTURE</span>
              <select style={field} value={act.art ?? ''} onChange={(e) => onEdit((a) => { a.art = e.target.value })}>
                {ART_CHOICES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ flex: '0 0 120px' }}>
              <span style={label}>SIDE</span>
              <select style={field} value={act.artSide || 'right'} onChange={(e) => onEdit((a) => { a.artSide = e.target.value })}>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            <label style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 800, color: NAVY, padding: '9px 0', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!act.artMirror}
                onChange={(e) => onEdit((a) => { a.artMirror = e.target.checked })} />
              Face the other way
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 240px' }}>
              <span style={label}>HINT</span>
              <input style={field} value={act.hint || ''} onChange={(e) => onEdit((a) => { a.hint = e.target.value })} />
            </div>
            <div style={{ flex: '1 1 240px' }}>
              <span style={label}>DIRECTIONS OVERRIDE (blank = the standard wording)</span>
              <input style={field} value={act.directions || ''} placeholder="leave blank to inherit"
                onChange={(e) => onEdit((a) => { a.directions = e.target.value || undefined })} />
            </div>
          </div>

          {act.kind === 'hunt' && (
            <div>
              <span style={label}>PASSAGE — mark each planted error as [[wrong|right]]</span>
              <textarea style={{ ...field, minHeight: 130, lineHeight: 1.6, resize: 'vertical' }} value={act.text || ''}
                onChange={(e) => onEdit((a) => { a.text = e.target.value })} />
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                Videos, in the order the errors appear: <code>{(act.videos || []).join(', ') || 'none'}</code>
              </div>
            </div>
          )}

          {act.kind === 'fix' && (
            <>
              <div>
                <span style={label}>HOW THE STUDENT ANSWERS</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['type', 'Type it'], ['select', 'Click an option'], ['drag', 'Drag from a bank']].map(([m, lbl]) => {
                    const on = (act.mode || 'type') === m
                    return (
                      <button key={m} onClick={() => onEdit((a) => { a.mode = m })}
                        style={{ borderRadius: 8, padding: '7px 13px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer',
                          background: on ? NAVY : '#eef3f6', color: on ? '#fff' : '#4a627a' }}>{lbl}</button>
                    )
                  })}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  Click needs options on every item. Drag needs a word bank — one entry per blank.
                </div>
              </div>
              <div>
                <span style={label}>WORD BANK (comma separated)</span>
                <input style={field} value={(act.bank || []).join(', ')}
                  onChange={(e) => onEdit((a) => { a.bank = e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
              </div>
              {(act.items || []).map((it, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', background: '#fbfdfe', borderRadius: 10, padding: '9px 11px' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--muted)', paddingBottom: 9 }}>{i + 1}</span>
                  <div style={{ flex: '3 1 260px' }}>
                    <span style={label}>SENTENCE — use ____ for the blank</span>
                    <input style={field} value={it.given} onChange={(e) => onEdit((a) => { a.items[i].given = e.target.value })} />
                  </div>
                  <div style={{ flex: '1 1 110px' }}>
                    <span style={label}>ANSWER</span>
                    <input style={field} value={it.answer} onChange={(e) => onEdit((a) => { a.items[i].answer = e.target.value })} />
                  </div>
                  {(act.mode === 'select') && (
                    <div style={{ flex: '2 1 200px' }}>
                      <span style={label}>OPTIONS (comma separated — one must match the answer)</span>
                      <input style={field} value={(it.options || []).join(', ')}
                        onChange={(e) => onEdit((a) => { a.items[i].options = e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
                    </div>
                  )}
                  <div style={{ flex: '1 1 90px' }}>
                    <span style={label}>VIDEO ID</span>
                    <input style={field} value={it.video || ''} placeholder="none"
                      onChange={(e) => onEdit((a) => { a.items[i].video = e.target.value || undefined })} />
                  </div>
                  <button onClick={() => onEdit((a) => { a.items.splice(i, 1) })}
                    style={{ color: '#c0392b', fontSize: 12, fontWeight: 800, background: '#fdecec', borderRadius: 7, padding: '7px 10px', cursor: 'pointer' }}>Remove</button>
                </div>
              ))}
              <button onClick={() => onEdit((a) => { a.items.push({ given: 'New sentence with a ____ in it.', answer: '' }) })}
                style={{ alignSelf: 'flex-start', fontSize: 12.5, fontWeight: 800, color: CYAN, background: '#eef6f9', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>
                + Add an item
              </button>
            </>
          )}

          {act.kind === 'maze' && (
            <>
              <div>
                <span style={label}>GRID — one row per line · S start · X finish · # wall · . open · A–J gates</span>
                <textarea style={{ ...field, fontFamily: 'ui-monospace, monospace', minHeight: 130, letterSpacing: 3, resize: 'vertical' }}
                  value={(act.grid || []).join('\n')}
                  onChange={(e) => onEdit((a) => { a.grid = e.target.value.split('\n').map((r) => r.trim()).filter(Boolean) })} />
              </div>
              {Object.entries(act.gates || {}).map(([k, g]) => (
                <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', background: '#fbfdfe', borderRadius: 10, padding: '9px 11px' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#8a6400', paddingBottom: 9, width: 18 }}>{k}</span>
                  <div style={{ flex: 1 }}>
                    <span style={label}>WRONG FORM (shown at the gate)</span>
                    <input style={field} value={g.wrong} onChange={(e) => onEdit((a) => { a.gates[k].wrong = e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={label}>CORRECT FORM</span>
                    <input style={field} value={g.right} onChange={(e) => onEdit((a) => { a.gates[k].right = e.target.value })} />
                  </div>
                </div>
              ))}
            </>
          )}

          {act.kind === 'compose' && (
            <>
              {(act.items || []).map((it, i) => (
                <div key={i} style={{ background: '#fbfdfe', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <span style={label}>PROMPT</span>
                    <input style={field} value={it.prompt} onChange={(e) => onEdit((a) => { a.items[i].prompt = e.target.value })} />
                  </div>
                  <div>
                    <span style={label}>SENTENCES TO COMBINE (one per line)</span>
                    <textarea style={{ ...field, minHeight: 56, resize: 'vertical' }} value={(it.pieces || []).join('\n')}
                      onChange={(e) => onEdit((a) => { a.items[i].pieces = e.target.value.split('\n').filter(Boolean) })} />
                  </div>
                  <div>
                    <span style={label}>WORKED EXAMPLE</span>
                    <input style={field} value={it.model || ''} onChange={(e) => onEdit((a) => { a.items[i].model = e.target.value })} />
                  </div>
                  <div>
                    <span style={label}>REQUIRED MOVES — the only things scored</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(it.checks || []).map((c, j) => (
                        <span key={j} style={{ background: '#eef6f9', color: CYAN, borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 800 }}>{c.label}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
                      Rules are edited in the content file for now — wording, sentences, and the example are live here.
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {count > 1 && (
            <button onClick={onRemove}
              style={{ alignSelf: 'flex-start', fontSize: 12, fontWeight: 800, color: '#c0392b', background: '#fdecec', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
              Remove this activity
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Shell({ children, onClose, right }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.6)', display: 'grid', placeItems: 'center', zIndex: 85, padding: 14 }} onClick={onClose}>
      <div className="card" style={{ width: 1120, maxWidth: '97vw', height: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '13px 18px', background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 62%,#0e2748 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 20 }}>🛠</span>
          <div style={{ flex: 1, minWidth: 150 }}>
            <b style={{ fontSize: 16 }}>Publisher console</b>
            <div style={{ fontSize: 11.5, color: '#a8dff5', fontWeight: 700 }}>Proof Room content — edit the questions students get</div>
          </div>
          {right}
          <button onClick={onClose} style={{ color: '#a8dff5', fontSize: 21, background: 'none', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      </div>
    </div>
  )
}
