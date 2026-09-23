import React, { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useT, useLocale } from '../lib/i18n/index.jsx'
import { Directions, Glossed, Speak, useSay } from './Scaffold.jsx'

/*
 * Writing Bank — every self-started piece (free writes + quick writes) in one
 * place: revise, publish, share to the Writing Wall, or discard.
 */

const BK = (import.meta.env.BASE_URL || '/') + 'bank/'
const THUMBS = ['feather', 'book', 'door', 'sunset']
// Stable per piece: same id always draws the same picture.
const thumbFor = (id) => THUMBS[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % THUMBS.length]

// Module-level option lists keep their English labels; every label below is run
// through t() where it is rendered.
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
  const t = useT()
  const say = useSay()
  const locale = useLocale()
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
      const name = (a.title || '').trim() || t('Untitled')
      return { sub, a, name, st: statusOf(sub), wcount: words.length, excerpt: words.slice(0, 14).join(' '), shared: sharedIds.has(sub.id), at: last.updatedAt || last.createdAt || '' }
    })

  const pendingDelete = confirmId ? pieces.find((p) => p.sub.id === confirmId) : null
  useEffect(() => {
    if (!confirmId) return
    const onKey = (e) => { if (e.key === 'Escape') setConfirmId(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmId])

  const visible = pieces
    .filter((p) => (filter === 'all' ? true : filter === 'published' ? p.sub.published : (!p.sub.published && !p.sub.completedAt)))
    .filter((p) => (type === 'all' ? true : p.a.genre === type))
    .filter((p) => {
      const needle = q.trim().toLowerCase()
      if (!needle) return true
      return (p.name || '').toLowerCase().includes(needle) || (p.excerpt || '').toLowerCase().includes(needle)
    })
    .sort((x, y) => (sort === 'longest' ? y.wcount - x.wcount : sort === 'oldest' ? (x.at > y.at ? 1 : -1) : (y.at > x.at ? 1 : -1)))

  const total = pieces.length
  const publishedCount = pieces.filter((p) => p.sub.published).length
  const progressCount = total - publishedCount
  const relTime = (iso) => {
    if (!iso) return t('today')
    const days = Math.floor((Date.now() - new Date(iso)) / 86400000)
    if (days <= 0) return t('today')
    if (days === 1) return t('yesterday')
    if (days < 30) return t('{n} days ago', { n: days })
    return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '')
  }

  async function act(fn) { setBusy(true); try { await fn(); onChange && onChange() } finally { setBusy(false) } }

  /*
   * Publish-vs-share is the one decision on this page a student cannot undo in
   * their own head, so each modal offers ONE Listen that reads the whole
   * decision — both the what-it-does line and the who-can-see-it line. The
   * sentences stay split into their existing t() keys so the bolding (and the
   * Spanish already written against those keys) survives; these strings are
   * the same parts, joined, for the speech.
   */
  const ca = confirmAction
  const teacherName = state.teacher?.name || t('your teacher')
  const pieceName = (title) => (title || '').trim() || t('Untitled')
  const shareBody = ca && `"${pieceName(ca.a.title)}${say('" will appear on the class Writing Wall.')} ${t('Who can see it:')} ${say('only the students and teacher in')} ${t("{teacher}'s class", { teacher: teacherName })}. ${say('It never leaves your classroom, and you or your teacher can take it down anytime.')}`
  const publishBody = ca && `${say('Publishing marks')} "${pieceName(ca.a.title)}" ${say('as finished — it becomes')} ${t('read-only')} ${say('and earns')} ${t('+15 coins')}. ${t('Who can see it:')} ${say('just you and your teacher — publishing does')} ${t('not')} ${say('put it on the Writing Wall. Sharing is a separate choice you make after.')}`

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
      {onBack && <button className="backlink" onClick={onBack}>{t('← Back to Dashboard')}</button>}

      {/* title */}
      <div style={{ marginBottom: 16 }}>
        <div className="eyebrow">{t('The Writing Studio')}</div>
        <h1 className="page" style={{ margin: '2px 0' }}>{t('🗂️ My Writing Bank')}</h1>
        <p className="page-sub" style={{ margin: 0 }}>
          <Directions text="Every piece you've started — revise it, publish it, share it, or clear it out." inline />
          {onWall && <> · <button onClick={onWall} style={{ color: 'var(--link)', fontWeight: 800, fontSize: 14 }}>{t('🌟 Visit the Writing Wall →')}</button></>}
        </p>
      </div>

      {/* stats + new piece */}
      <div className="bank-head">
        <div className="card bank-stats">
          {[
            { icon: '📄', bg: '#e5f1fb', n: total, label: 'pieces', sub: 'Total writing pieces' },
            { icon: '✅', bg: '#e6f6ee', n: publishedCount, label: 'published', sub: 'Shared with the world' },
            { icon: '✏️', bg: '#fdf3df', n: progressCount, label: 'in progress', sub: 'Keep going — great ideas ahead!' },
          ].map((x) => (
            <div key={x.label} className="bank-stat">
              <span className="bank-stat-icon" style={{ background: x.bg }} aria-hidden="true">{x.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                  <b>{x.n}</b>
                  <span className="bank-stat-label">{t(x.label)}</span>
                </div>
                <div className="bank-stat-sub">{t(x.sub)}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn bank-new" onClick={startNew} disabled={busy}>
          <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center', fontSize: 15 }}>+</span>
          {t('Start a New Piece')} <span aria-hidden="true" style={{ opacity: .7 }}>›</span>
        </button>
      </div>

      {/* filters + search + type + sort */}
      <div className="card" style={{ padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', background: '#dcebf3', borderRadius: 11, padding: 3 }}>
          {FILTERS.map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 800,
                background: filter === k ? 'var(--teal-mid)' : 'transparent', color: filter === k ? '#fff' : 'var(--teal)' }}>
              {t(label)}
            </button>
          ))}
        </div>
        <div className="bank-search">
          <span aria-hidden="true" style={{ fontSize: 14, color: 'var(--muted)' }}>🔍</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search your writing pieces…')}
            aria-label={t('Search your writing pieces…')} />
          {q.trim() && (
            <button type="button" className="bank-search-clear" onClick={() => setQ('')}>{t('Clear search')}</button>
          )}
        </div>
        {[[type, setType, TYPES], [sort, setSort, SORTS]].map(([val, set, opts], i) => (
          <select key={i} value={val} onChange={(e) => set(e.target.value)}
            style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '9px 12px', font: 'inherit', fontSize: 13, fontWeight: 700, color: 'var(--ink)', background: '#fff' }}>
            {opts.map(([k, label]) => <option key={k} value={k}>{t(label)}</option>)}
          </select>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="card" role="status" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }} aria-hidden="true">🗂️</div>
          <Directions text={
            q.trim()
              ? 'Nothing matches "{query}".'
              : pieces.length === 0
                ? 'Nothing here yet — start a Free Write or Quick Write and it will land in your bank.'
                : type === 'quick'
                  ? 'No Quick Writes yet. Finish one and it shows up here.'
                  : type === 'free'
                    ? 'No Free Writes yet. Start one and it shows up here.'
                    : 'Nothing matches these filters.'
          } vars={q.trim() ? { query: q.trim() } : undefined} inline />
        </div>
      )}

      {visible.length > 0 && <ul className="bank-pieces" aria-label={t('Your pieces')}>
        {visible.map(({ sub, a, name, st, wcount, excerpt, shared, at }) => (
          <li key={sub.id} className="card bank-piece">
            <span aria-hidden style={{ width: 104, height: 70, borderRadius: 12, flexShrink: 0, overflow: 'hidden', border: '1px solid var(--gold-line)',
              backgroundImage: `url(${BK}${thumbFor(sub.id)}.webp)`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="bank-piece-copy">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 className="bank-piece-title">{name}</h2>
                <span className="pill" style={{ background: st.bg, color: st.c, fontSize: 11 }}>{t(st.label)}</span>
                {shared && <span className="pill" style={{ background: '#fdeef4', color: '#c23f74', fontSize: 11 }}>{t('💛 On the Writing Wall')}</span>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, maxWidth: 560, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {excerpt || t('Nothing written yet')}{excerpt ? '…' : ''}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3, fontWeight: 600 }}>
                📄 {t('{n} words', { n: wcount })} · 📚 <Glossed text={t(sub.drafts.length > 1 ? '{n} drafts' : '{n} draft', { n: sub.drafts.length })} /> · 🏷️ {t(a.genre === 'free' ? 'Free Write' : 'Quick Write')} · 🕐 {t('Last updated {when}', { when: relTime(at) })}
              </div>
            </div>

            <div className="bank-row-actions">
              <div className="bank-row-main">
                <button className="btn ghost" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy} onClick={() => onOpen(sub.id)}>
                  {sub.published ? t('Read') : sub.drafts.length > 1 ? t('Revise →') : t('Open →')}
                </button>
                {!sub.published && wcount > 0 && (
                  <button className="btn" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy}
                    onClick={() => setConfirmAction({ kind: 'publish', sub, a })}>{t('🌟 Publish')}</button>
                )}
                {sub.published && !shared && (
                  <button className="btn" style={{ padding: '7px 15px', fontSize: 13, background: '#c2571f' }} disabled={busy}
                    onClick={() => setConfirmAction({ kind: 'share', sub, a })}>{t('💛 Share to Wall')}</button>
                )}
              </div>
              <button type="button" className="bank-delete" disabled={busy}
                aria-label={t('Delete {title}', { title: name })}
                onClick={() => setConfirmId(sub.id)}>{t('Delete')}</button>
            </div>
          </li>
        ))}
      </ul>}

      {pendingDelete && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 70, padding: 16 }} onClick={() => !busy && setConfirmId(null)}>
          <div className="card" role="dialog" aria-modal="true" aria-labelledby="bank-delete-title" style={{ width: 460, maxWidth: '94vw', padding: '26px 28px' }} onClick={(e) => e.stopPropagation()}>
            <b id="bank-delete-title" style={{ display: 'block', fontSize: 18, marginBottom: 10 }}>{t('Delete "{title}"?', { title: pendingDelete.name })}</b>
            <div style={{ background: '#fdeeee', border: '1px solid #f0b9be', borderRadius: 12, padding: '11px 14px', fontSize: 14, lineHeight: 1.5, marginBottom: 18, color: '#8d1d24' }}>
              <Directions text="This permanently removes it from your Writing Bank. You can't undo this." />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="btn ghost" autoFocus style={{ padding: '12px 20px', minHeight: 44 }} onClick={() => setConfirmId(null)}>{t('Keep it')}</button>
              <button type="button" className="bank-delete" disabled={busy} style={{ minWidth: 120 }}
                onClick={() => act(async () => { await api.discard(pendingDelete.sub.id); setConfirmId(null) })}>{t('Yes, delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* guardrail: confirm publish/share with plain-language audience info */}
      {confirmAction && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 70 }} onClick={() => setConfirmAction(null)}>
          <div className="card" style={{ width: 460, maxWidth: '94vw', padding: '26px 28px' }} onClick={(e) => e.stopPropagation()}>
            {confirmAction.kind === 'share' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>💛</span>
                  <b style={{ fontSize: 18 }}><Glossed text={t('Share to the Writing Wall?')} /></b>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 10px' }}>
                  "<b>{pieceName(confirmAction.a.title)}</b>
                  <Glossed text={say('" will appear on the class Writing Wall.')} />
                </p>
                <div style={{ background: '#e5f1fb', borderRadius: 12, padding: '11px 14px', fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>
                  👀 <b>{t('Who can see it:')}</b> <Glossed text={say('only the students and teacher in')} /> <b>{t("{teacher}'s class", { teacher: teacherName })}</b>.
                  {' '}<Glossed text={say('It never leaves your classroom, and you or your teacher can take it down anytime.')} />
                  {' '}<Speak text={shareBody} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="btn ghost" style={{ padding: '10px 20px' }} onClick={() => setConfirmAction(null)}>{t('Not yet')}</button>
                  <button className="btn" style={{ padding: '10px 22px', background: '#c2571f' }} disabled={busy}
                    onClick={() => act(async () => { await api.share(confirmAction.sub.id); setConfirmAction(null) })}>
                    {t('💛 Yes, share it')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>🌟</span>
                  <b style={{ fontSize: 18 }}><Glossed text={t('Publish this piece?')} /></b>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 10px' }}>
                  <Glossed text={say('Publishing marks')} /> "<b>{pieceName(confirmAction.a.title)}</b>" <Glossed text={say('as finished — it becomes')} /> <b>{t('read-only')}</b> <Glossed text={say('and earns')} /> <b>{t('+15 coins')}</b>.
                </p>
                <div style={{ background: '#e5f1fb', borderRadius: 12, padding: '11px 14px', fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>
                  👀 <b>{t('Who can see it:')}</b> <Glossed text={say('just you and your teacher — publishing does')} /> <b>{t('not')}</b> <Glossed text={say('put it on the Writing Wall. Sharing is a separate choice you make after.')} />
                  {' '}<Speak text={publishBody} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button className="btn ghost" style={{ padding: '10px 20px' }} onClick={() => setConfirmAction(null)}>{t('Keep working on it')}</button>
                  <button className="btn" style={{ padding: '10px 22px' }} disabled={busy}
                    onClick={() => act(async () => { await api.publish(confirmAction.sub.id); setConfirmAction(null) })}>
                    {t('🌟 Publish it')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
