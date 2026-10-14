import React, { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { useT, useLocale } from '../lib/i18n/index.jsx'
import { Directions, Glossed, Speak, useSay } from './Scaffold.jsx'

/*
 * Writing Bank — every piece a student has written in one place: their free
 * writes and quick writes (revise, publish, share to the Writing Wall, or
 * discard) and, since 2026-10-01, the teacher's assignments once they are
 * turned in (see the feedback — never publish/discard).
 */

const BK = (import.meta.env.BASE_URL || '/') + 'bank/'
// Forest crops of her practice paintings (2026-09-24); feather/book/door/sunset were the sky set.
const THUMBS = ['quill-forest', 'cards-forest', 'notebook-forest', 'desk-forest']
// Stable per piece: same id always draws the same picture.
const thumbFor = (id) => THUMBS[[...String(id)].reduce((a, c) => a + c.charCodeAt(0), 0) % THUMBS.length]

// Cleaned up (Kennady, 2026-10-14: "Next, let's cleanup the Writing Bank"): no stats strip, search, type or sort; the tabs carry
// the counts, newest first; each row keeps its picture, title, status and first line, one main button, and a small delete.
// The option list keeps its English labels; every label is run through t() where it is rendered.
const FILTERS = [
  ['all', 'All'],
  ['progress', 'In progress'],
  ['published', 'Published'],
]

function statusOf(sub, kind) {
  if (kind === 'assign') return sub.completedAt
    ? { k: 'completed', label: '✓ Turned in', bg: '#e6f6ee', c: 'var(--good)' }
    : { k: 'progress', label: '✏️ In progress', bg: '#e5f1fb', c: 'var(--ecr)' }
  if (sub.published) return { k: 'published', label: '🌟 Published', bg: '#fff4d6', c: '#a37400' }
  if (sub.completedAt) return { k: 'completed', label: '✓ Completed', bg: '#e6f6ee', c: 'var(--good)' }
  return { k: 'progress', label: '✏️ In progress', bg: '#e5f1fb', c: 'var(--ecr)' }
}

export default function WritingBankPage({ state, me, onBack, onOpen, onReview, onWall, onChange }) {
  const t = useT()
  const say = useSay()
  const locale = useLocale()
  const [filter, setFilter] = useState('all')
  const [confirmId, setConfirmId] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // { kind: 'publish'|'share', sub, a }
  const [busy, setBusy] = useState(false)

  const sharedIds = new Set((state.shareWall || []).map((e) => e.submissionId).filter(Boolean))

  const pieces = state.submissions
    .filter((s) => s.studentId === me.id && !s.isPeerRevision)
    .map((sub) => ({ sub, a: state.assignments.find((a) => a.id === sub.assignmentId) }))
    // teacher assignments land here once turned in (her call, 2026-10-01); drafts stay on Home
    .filter(({ sub, a }) => a && (['free', 'quick'].includes(a.genre) || sub.completedAt))
    .map(({ sub, a }) => {
      const kind = ['free', 'quick'].includes(a.genre) ? a.genre : 'assign'
      const last = sub.drafts[sub.drafts.length - 1]
      const words = (last.content || '').trim().split(/\s+/).filter(Boolean)
      const name = (a.title || '').trim() || t('Untitled')
      return { sub, a, kind, name, st: statusOf(sub, kind), wcount: words.length, excerpt: words.slice(0, 14).join(' '), shared: sharedIds.has(sub.id), at: last.updatedAt || last.createdAt || '' }
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
    .sort((x, y) => (y.at > x.at ? 1 : -1))

  const total = pieces.length
  const publishedCount = pieces.filter((p) => p.sub.published).length
  const progressCount = pieces.filter((p) => !p.sub.published && !p.sub.completedAt).length
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
    <div style={{ margin: '-26px calc(50% - 50vw) -70px', padding: '22px clamp(22px, 2.6vw, 56px) 40px', minHeight: 'calc(100vh - 64px)', boxSizing: 'border-box', position: 'relative' }}>
      {/* the dashboard's enchanted forest, just as soft (22%); the sky/space backdrop is retired */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `url(${import.meta.env.BASE_URL || '/'}bg-enchanted.jpg) center / cover no-repeat`, opacity: .22 }} />
      <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1 }}>
      {onBack && <button className="backlink on-scene" onClick={onBack}>{t('← Back to Dashboard')}</button>}

      {/* title — on a frosted panel so it reads over the forest (2026-09-24) */}
      <div className="glass-head bank-top" style={{ marginBottom: 14 }}>
        <h1 className="page" style={{ margin: 0 }}>{t('🗂️ My Writing Bank')}</h1>
        <span style={{ flex: 1 }} />
        {onWall && <button className="bank-wall-link" onClick={onWall}>{t('🌟 Visit the Writing Wall →')}</button>}
        <button className="btn bank-new" onClick={startNew} disabled={busy}>
          <span aria-hidden="true" style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center', fontSize: 15 }}>+</span>
          {t('Start a new piece')}
        </button>
      </div>

      {/* the tabs carry the counts */}
      <div className="bank-tabs" role="tablist" aria-label={t('Your pieces')}>
        {FILTERS.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>
            {t(label)} <b>{k === 'all' ? total : k === 'published' ? publishedCount : progressCount}</b>
          </button>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="card" role="status" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }} aria-hidden="true">🗂️</div>
          <Directions text={
            pieces.length === 0
              ? 'Nothing here yet — start a Free Write or Quick Write and it will land in your bank.'
              : filter === 'published' ? 'Nothing published yet.' : 'Nothing in progress right now.'
          } inline />
        </div>
      )}

      {visible.length > 0 && <ul className="bank-pieces" aria-label={t('Your pieces')}>
        {visible.map(({ sub, a, kind, name, st, wcount, excerpt, shared, at }) => (
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
                {kind === 'assign' ? [t('Assignment'), a.format].filter(Boolean).join(' · ') : t(a.genre === 'free' ? 'Free Write' : 'Quick Write')} · {relTime(at)}
              </div>
            </div>

            {kind === 'assign' ? (
              <div className="bank-row-actions">
                <div className="bank-row-main">
                  {sub.completedAt && onReview
                    ? <button className="btn" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy} onClick={() => onReview(sub.id)}>{t('See feedback →')}</button>
                    : <button className="btn ghost" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy} onClick={() => onOpen(sub.id)}>{t('Keep writing →')}</button>}
                </div>
              </div>
            ) : (
            <div className="bank-row-actions">
              <div className="bank-row-main">
                <button className="btn ghost" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy} onClick={() => onOpen(sub.id)}>
                  {sub.published ? t('Read') : sub.drafts.length > 1 ? t('Revise →') : t('Open →')}
                </button>
                {/* a free write needs a title before it can be published (2026-09-24) */}
                {!sub.published && wcount > 0 && a.genre === 'free' && !(a.title || '').trim() ? (
                  <button className="btn" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy} onClick={() => onOpen(sub.id)}>{t('✏️ Add a title')}</button>
                ) : !sub.published && wcount > 0 && (
                  <button className="btn" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy}
                    onClick={() => setConfirmAction({ kind: 'publish', sub, a })}>{t('🌟 Publish')}</button>
                )}
                {sub.published && !shared && (
                  <button className="btn" style={{ padding: '7px 15px', fontSize: 13, background: '#c2571f' }} disabled={busy}
                    onClick={() => setConfirmAction({ kind: 'share', sub, a })}>{t('💛 Share to Wall')}</button>
                )}
              </div>
              <button type="button" className="bank-delete" disabled={busy}
                aria-label={t('Delete {title}', { title: name })} title={t('Delete')}
                onClick={() => setConfirmId(sub.id)}>🗑</button>
            </div>
            )}
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
