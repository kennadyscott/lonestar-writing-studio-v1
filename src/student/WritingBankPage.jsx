import React, { useState } from 'react'
import { api } from '../lib/api.js'

/*
 * Writing Bank — every self-started piece (free writes + quick writes) in one
 * place: revise, publish, share to the Writing Wall, or discard.
 */

const BK = (import.meta.env.BASE_URL || '/') + 'bank/'
const THUMBS = ['feather', 'book', 'door', 'sunset']
// Stable per piece: same id always draws the same picture.
const thumbFor = (id) => THUMBS[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % THUMBS.length]

const TYPES = [
  ['all', 'All types'],
  ['free', 'Free Write'],
  ['quick', 'Quick Write'],
]
const SORTS = [
  ['newest', 'Sort: Newest'],
  ['oldest', 'Sort: Oldest'],
  ['longest', 'Sort: Longest'],
]

const FILTERS = [
  ['all', 'All'],
  ['progress', 'In progress'],
  ['published', 'Published'],
]

function statusOf(sub) {
  if (sub.published) return { k: 'published', label: '🌟 Published', bg: '#fff4d6', c: '#a37400' }
  if (sub.completedAt) return { k: 'completed', label: '✓ Completed', bg: '#e6f6ee', c: 'var(--good)' }
  return { k: 'progress', label: '✏️ In progress', bg: '#e5f1fb', c: 'var(--ecr)' }
}

export default function WritingBankPage({ state, me, onBack, onOpen, onWall, onChange }) {
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('newest')
  const [confirmId, setConfirmId] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // { kind: 'publish'|'share', sub, a }
  const [busy, setBusy] = useState(false)

  const sharedIds = new Set((state.shareWall || []).map((e) => e.submissionId).filter(Boolean))

  const pieces = state.submissions
    .filter((s) => s.studentId === me.id)
    .map((sub) => ({ sub, a: state.assignments.find((a) => a.id === sub.assignmentId) }))
    .filter(({ a }) => a && ['free', 'quick'].includes(a.genre))
    .map(({ sub, a }) => {
      const last = sub.drafts[sub.drafts.length - 1]
      const words = (last.content || '').trim().split(/\s+/).filter(Boolean)
      return { sub, a, st: statusOf(sub), wcount: words.length, excerpt: words.slice(0, 14).join(' '), shared: sharedIds.has(sub.id), at: last.createdAt || '' }
    })

  const visible = pieces
    .filter((p) => (filter === 'all' ? true : filter === 'published' ? p.sub.published : (!p.sub.published && !p.sub.completedAt)))
    .filter((p) => (type === 'all' ? true : p.a.genre === type))
    .filter((p) => {
      const needle = q.trim().toLowerCase()
      if (!needle) return true
      return (p.a.title || '').toLowerCase().includes(needle) || (p.excerpt || '').toLowerCase().includes(needle)
    })
    .sort((x, y) => (sort === 'longest' ? y.wcount - x.wcount : sort === 'oldest' ? (x.at > y.at ? 1 : -1) : (y.at > x.at ? 1 : -1)))

  const total = pieces.length
  const publishedCount = pieces.filter((p) => p.sub.published).length
  const progressCount = total - publishedCount
  const relTime = (iso) => {
    if (!iso) return 'today'
    const days = Math.floor((Date.now() - new Date(iso)) / 86400000)
    if (days <= 0) return 'today'
    if (days === 1) return 'yesterday'
    if (days < 30) return `${days} days ago`
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', d: 'numeric', year: 'numeric' }).replace(',', '')
  }

  async function act(fn) { setBusy(true); try { await fn(); onChange && onChange() } finally { setBusy(false) } }

  // Start a New Piece: make a fresh free write and open it.
  async function startNew() {
    setBusy(true)
    try {
      const r = await api.quickWrite('free')
      await onChange?.()              // the new piece must be in state before the studio opens
      onOpen && onOpen(r.submissionId)
    } finally { setBusy(false) }
  }

  return (
    <div style={{ margin: '-26px calc(50% - 50vw) -70px', padding: '22px clamp(22px, 2.6vw, 56px) 40px', minHeight: 'calc(100vh - 64px)', boxSizing: 'border-box',
      backgroundImage: `linear-gradient(rgba(240,246,252,.55), rgba(240,246,252,.75)), url(${BK}sky.webp)`, backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      {onBack && <button className="backlink" onClick={onBack}>← Back to Dashboard</button>}

      {/* title */}
      <div style={{ marginBottom: 16 }}>
        <div className="eyebrow">The Writing Studio</div>
        <h1 className="page" style={{ margin: '2px 0' }}>🗂️ My Writing Bank</h1>
        <p className="page-sub" style={{ margin: 0 }}>
          Every piece you've started — revise it, publish it, share it, or clear it out.
          {onWall && <> · <button onClick={onWall} style={{ color: 'var(--link)', fontWeight: 800, fontSize: 14 }}>🌟 Visit the Writing Wall →</button></>}
        </p>
      </div>

      {/* stats + new piece */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 14, marginBottom: 14, alignItems: 'stretch' }}>
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', padding: '14px 4px' }}>
          {[
            { icon: '📄', bg: '#e5f1fb', n: total, label: 'pieces', sub: 'Total writing pieces' },
            { icon: '✅', bg: '#e6f6ee', n: publishedCount, label: 'published', sub: 'Shared with the world' },
            { icon: '✏️', bg: '#fdf3df', n: progressCount, label: 'in progress', sub: 'Keep going — great ideas ahead!' },
          ].map((x, i) => (
            <div key={x.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', borderLeft: i ? '1px solid var(--line)' : 'none' }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: x.bg, display: 'grid', placeItems: 'center', fontSize: 19, flexShrink: 0 }}>{x.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <b style={{ fontSize: 22, color: '#0d2f55' }}>{x.n}</b>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}>{x.label}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn" onClick={startNew} disabled={busy}
          style={{ padding: '0 26px', fontSize: 15.5, borderRadius: 14, background: 'linear-gradient(140deg,#0d2f55,#02384d)', minWidth: 230, justifyContent: 'center', gap: 10 }}>
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center', fontSize: 15 }}>+</span>
          Start a New Piece <span style={{ opacity: .7 }}>›</span>
        </button>
      </div>

      {/* filters + search + type + sort */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', background: '#dcebf3', borderRadius: 11, padding: 3 }}>
          {FILTERS.map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 800,
                background: filter === k ? 'var(--teal-mid)' : 'transparent', color: filter === k ? '#fff' : 'var(--teal)' }}>
              {label}
            </button>
          ))}
        </div>
        <label style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 12px' }}>
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your writing pieces…"
            style={{ flex: 1, border: 'none', outline: 'none', font: 'inherit', fontSize: 13.5, color: 'var(--ink)', background: 'transparent' }} />
        </label>
        {[[type, setType, TYPES], [sort, setSort, SORTS]].map(([val, set, opts], i) => (
          <select key={i} value={val} onChange={(e) => set(e.target.value)}
            style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '9px 12px', font: 'inherit', fontSize: 13, fontWeight: 700, color: 'var(--ink)', background: '#fff' }}>
            {opts.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🗂️</div>
          Nothing here yet — start a Free Write or Quick Write and it will land in your bank.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.map(({ sub, a, st, wcount, excerpt, shared, at }) => (
          <div key={sub.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span aria-hidden style={{ width: 104, height: 70, borderRadius: 12, flexShrink: 0, overflow: 'hidden', border: '1px solid var(--gold-line)',
              backgroundImage: `url(${BK}${thumbFor(sub.id)}.webp)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <b style={{ fontSize: 15.5 }}>{a.title}</b>
                <span className="pill" style={{ background: st.bg, color: st.c, fontSize: 11 }}>{st.label}</span>
                {shared && <span className="pill" style={{ background: '#fdeef4', color: '#c23f74', fontSize: 11 }}>💛 On the Writing Wall</span>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, maxWidth: 560, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {excerpt || 'Nothing written yet'}{excerpt ? '…' : ''}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3, fontWeight: 600 }}>
                📄 {wcount} words · 📚 {sub.drafts.length} draft{sub.drafts.length > 1 ? 's' : ''} · 🏷️ {a.genre === 'free' ? 'Free Write' : 'Quick Write'} · 🕐 Last updated {relTime(at)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn ghost" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy} onClick={() => onOpen(sub.id)}>
                {sub.published ? 'Read' : sub.drafts.length > 1 ? 'Revise →' : 'Open →'}
              </button>
              {!sub.published && wcount > 0 && (
                <button className="btn" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy}
                  onClick={() => setConfirmAction({ kind: 'publish', sub, a })}>🌟 Publish</button>
              )}
              {sub.published && !shared && (
                <button className="btn" style={{ padding: '7px 15px', fontSize: 13, background: '#c2571f' }} disabled={busy}
                  onClick={() => setConfirmAction({ kind: 'share', sub, a })}>💛 Share to Wall</button>
              )}
              {confirmId === sub.id ? (
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', background: '#fdeeee', border: '1px solid #f0b9be', borderRadius: 10, padding: '5px 10px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#d84a57' }}>Delete this piece? You can't undo this.</span>
                  <button style={{ fontSize: 12.5, fontWeight: 800, color: '#d84a57' }} disabled={busy}
                    onClick={() => act(async () => { await api.discard(sub.id); setConfirmId(null) })}>Yes, delete</button>
                  <button style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--muted)' }} onClick={() => setConfirmId(null)}>Keep it</button>
                </span>
              ) : (
                <button title="Discard this piece" style={{ fontSize: 16, color: 'var(--muted)', padding: 6 }} disabled={busy}
                  onClick={() => setConfirmId(sub.id)}>🗑️</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* guardrail: confirm publish/share with plain-language audience info */}
      {confirmAction && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 70 }} onClick={() => setConfirmAction(null)}>
          <div className="card" style={{ width: 460, maxWidth: '94vw', padding: '26px 28px' }} onClick={(e) => e.stopPropagation()}>
            {confirmAction.kind === 'share' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>💛</span>
                  <b style={{ fontSize: 18 }}>Share to the Writing Wall?</b>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 10px' }}>
                  "<b>{confirmAction.a.title}</b>" will appear on the class Writing Wall.
                </p>
                <div style={{ background: '#e5f1fb', borderRadius: 12, padding: '11px 14px', fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>
                  👀 <b>Who can see it:</b> only the students and teacher in <b>{state.teacher?.name || 'your teacher'}'s class</b>.
                  It never leaves your classroom, and you or your teacher can take it down anytime.
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="btn ghost" style={{ padding: '10px 20px' }} onClick={() => setConfirmAction(null)}>Not yet</button>
                  <button className="btn" style={{ padding: '10px 22px', background: '#c2571f' }} disabled={busy}
                    onClick={() => act(async () => { await api.share(confirmAction.sub.id); setConfirmAction(null) })}>
                    💛 Yes, share it
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>🌟</span>
                  <b style={{ fontSize: 18 }}>Publish this piece?</b>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 10px' }}>
                  Publishing marks "<b>{confirmAction.a.title}</b>" as finished — it becomes <b>read-only</b> and earns <b>+15 coins</b>.
                </p>
                <div style={{ background: '#e5f1fb', borderRadius: 12, padding: '11px 14px', fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>
                  👀 <b>Who can see it:</b> just you and your teacher — publishing does <b>not</b> put it on the Writing Wall. Sharing is a separate choice you make after.
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="btn ghost" style={{ padding: '10px 20px' }} onClick={() => setConfirmAction(null)}>Keep working on it</button>
                  <button className="btn" style={{ padding: '10px 22px' }} disabled={busy}
                    onClick={() => act(async () => { await api.publish(confirmAction.sub.id); setConfirmAction(null) })}>
                    🌟 Publish it
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* closing banner */}
      <div style={{ marginTop: 20, borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)', border: '1px solid var(--gold-line)' }}>
        <img src={`${BK}footer.webp`} alt="Every draft is a step forward. Write. Revise. Share. Your ideas matter." style={{ display: 'block', width: '100%', height: 'auto' }} />
      </div>
      </div>
    </div>
  )
}
