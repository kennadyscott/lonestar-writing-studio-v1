import React from 'react'
import { useT } from '../lib/i18n/index.jsx'

/*
 * Three student-friendly ways to show a Lit Labyrinth path's data on the Practice card (Kennady, 2026-10-14: "What are your
 * ideas on some more student friendly ways to present data? Build me three different options for the front card of Lit Lab.
 * Use an ABC prototype picker"). Each takes the same model (pathModel in StudentHome.jsx):
 *   A  Trail        — stepping stones on a winding trail; no numbers, just done / boosted / you are here / locked
 *   B  Star cards   — every skill earns 0-3 stars; the total is the headline
 *   C  Then & Now   — two big bars, where you started and where you are, against the 85% goal
 */

export const LIT_LOOKS = [['a', 'Trail'], ['b', 'Stars'], ['c', 'Then & Now']]

function Carousel({ carousel }) {
  const t = useT()
  if (!carousel || carousel.n < 2) return null
  return (
    <span className="gr-carousel" role="group" aria-label={t('Your paths')}>
      <button onClick={carousel.prev} aria-label={t('Previous path')}>‹</button>
      <span>{carousel.i + 1} {t('of')} {carousel.n}</span>
      <button onClick={carousel.next} aria-label={t('Next path')}>›</button>
    </span>
  )
}

/* One plain sentence about the path, in a kid's words. */
function cheer(m, t) {
  if (m.post?.score != null) {
    const up = m.post.score - m.pre
    return up > 0 ? t('You finished the path and grew {n} points! 🎉', { n: up }) : t('You finished the path! 🎉')
  }
  if (m.post?.state === 'next') return t('Every clearing is done. The post-test is next! 🏆')
  if (m.mastered === 0) return m.skills.some((s) => s.score != null) ? t('You have started. Keep going!') : t('Your first clearing is waiting!')
  return t('You have cleared {a} of {b}. Keep going!', { a: m.mastered, b: m.total })
}

function Head({ m, carousel, children }) {
  const t = useT()
  return (
    <div className="ll-head">
      <b className="ll-name">{m.name}</b>
      <span className="ll-cheer">{children ?? cheer(m, t)}</span>
      <span style={{ flex: 1 }} />
      <Carousel carousel={carousel} />
    </div>
  )
}

/* ---------- A · Trail ---------- */
const STONE = { mastered: '✓', boosted: '✓', next: '', sb: '', working: '…', locked: '🔒', open: '' }
function TrailLook({ m, carousel }) {
  const t = useT()
  const nodes = [
    { key: 'start', kind: 'start', icon: '🚩', label: t('Start') },
    ...m.skills.map((s) => ({ key: s.id, kind: s.state, icon: STONE[s.state], label: s.short, full: s.title, n: s.n, sub: s.state === 'sb' ? t('Skill Builder') : null })),
    ...(m.post ? [{ key: 'post', kind: 'post-' + m.post.state, icon: '🏆', label: t('Post-test') }] : []),
  ]
  const N = nodes.length
  const yOf = (i) => (i % 2 === 0 ? 58 : 30) // percent from the top: the trail winds up and down
  const pts = nodes.map((_, i) => `${((i + 0.5) / N) * 1000},${yOf(i)}`)
  const doneUpTo = nodes.reduce((k, nd, i) => (nd.kind === 'start' || nd.kind === 'mastered' || nd.kind === 'boosted' || nd.kind === 'post-done' ? i : k), 0)
  return (
    <div className="ll ll-a">
      <Head m={m} carousel={carousel} />
      <div className="ll-trail">
        <svg className="ll-trail-line" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden>
          <polyline points={pts.join(' ')} className="todo" vectorEffect="non-scaling-stroke" />
          <polyline points={pts.slice(0, doneUpTo + 1).join(' ')} className="done" vectorEffect="non-scaling-stroke" />
        </svg>
        {nodes.map((nd, i) => (
          <div key={nd.key} className={'ll-stone-wrap'} style={{ left: ((i + 0.5) / N) * 100 + '%', top: yOf(i) + '%' }}>
            {(nd.kind === 'next' || nd.kind === 'sb' || nd.kind === 'post-next') && <span className="ll-here">📍 {t('You are here')}</span>}
            <span className={'ll-stone ' + nd.kind} title={nd.full || nd.label}>
              {nd.icon}
              {nd.kind === 'boosted' && <i className="ll-boost" title={t('A Skill Builder helped')}>⚡</i>}
            </span>
            <span className={'ll-stone-label ' + nd.kind}>{nd.label}{nd.sub && <small>{nd.sub}</small>}</span>
          </div>
        ))}
      </div>
      <div className="ll-key">
        <span><i className="mastered">✓</i>{t('Cleared')}</span>
        <span><i className="boosted">⚡</i>{t('Skill Builder helped')}</span>
        <span><i className="locked">🔒</i>{t('Not open yet')}</span>
      </div>
    </div>
  )
}

/* ---------- B · Star cards ---------- */
const STATUS_B = { mastered: 'Mastered!', boosted: 'Mastered with practice ⚡', next: 'Up next', sb: 'Skill Builder next', working: 'Keep practicing', locked: 'Locked', open: 'Not started' }
function Stars({ n, max = 3 }) {
  return <span className="ll-stars" aria-label={n + ' / ' + max}>{Array.from({ length: max }, (_, i) => <i key={i} className={i < n ? 'on' : ''}>★</i>)}</span>
}
function StarsLook({ m, carousel }) {
  const t = useT()
  const earned = m.skills.reduce((a, s) => a + s.stars, 0) + (m.post?.stars || 0)
  const possible = m.skills.length * 3 + (m.post ? 3 : 0)
  return (
    <div className="ll ll-b">
      <Head m={m} carousel={carousel}>
        <span className="ll-total"><span aria-hidden>⭐</span> <b>{earned}</b> {t('of {n} stars', { n: possible })}</span>
      </Head>
      <div className="ll-cards" style={{ '--cols': m.skills.length + (m.post ? 2 : 1) }}>
        <div className="ll-card start">
          <span className="ll-card-k">{t('When you started')}</span>
          <b className="ll-card-t">{t('Pre-test')}</b>
          <Stars n={m.preStars} />
          <span className="ll-chip quiet">{t('Your starting point')}</span>
        </div>
        {m.skills.map((s) => (
          <div key={s.id} className={'ll-card ' + s.state}>
            <span className="ll-card-k">{s.state === 'locked' ? '🔒' : s.n}</span>
            <b className="ll-card-t" title={s.title}>{s.short}</b>
            <Stars n={s.stars} />
            <span className={'ll-chip ' + s.state}>{t(STATUS_B[s.state])}</span>
          </div>
        ))}
        {m.post && (
          <div className={'ll-card post ' + m.post.state}>
            <span className="ll-card-k">🏆</span>
            <b className="ll-card-t">{t('Post-test')}</b>
            <Stars n={m.post.stars || 0} />
            <span className={'ll-chip ' + (m.post.state === 'done' ? 'mastered' : m.post.state)}>{m.post.state === 'done' ? t('Finished!') : m.post.state === 'next' ? t('Up next') : t('Opens at the end')}</span>
          </div>
        )}
      </div>
      <div className="ll-key"><span>★★★ {t('85% or more')}</span><span>★★ {t('70 to 84%')}</span><span>★ {t('started')}</span></div>
    </div>
  )
}

/* ---------- C · Then & Now ---------- */
const CHIP_C = { mastered: '✓', boosted: '⚡', next: '📍', sb: '📍', working: '…', locked: '🔒', open: '○' }
function ThenNowLook({ m, carousel }) {
  const t = useT()
  const now = m.now
  const up = now == null ? null : now - m.pre
  const nowLabel = m.post?.score != null ? t('Post-test') : t('Right now')
  return (
    <div className="ll ll-c">
      <Head m={m} carousel={carousel} />
      <div className="ll-tn">
        <div className="ll-bars">
          <span className="ll-goal" style={{ left: 'calc(var(--lab) + (100% - var(--lab)) * .85)' }}><b>🎯 {t('Goal')} 85%</b></span>
          <div className="ll-bar-row">
            <span className="ll-bar-l">{t('When you started')}</span>
            <span className="ll-bar-track"><span className="ll-bar pre" style={{ width: m.pre + '%' }}><b>{m.pre}%</b></span></span>
          </div>
          <div className="ll-bar-row">
            <span className="ll-bar-l">{nowLabel}</span>
            <span className="ll-bar-track">
              {now == null
                ? <span className="ll-bar-wait">{t('Finish your first clearing to fill this bar')}</span>
                : <span className={'ll-bar now' + (now >= 85 ? ' goal' : '')} style={{ width: now + '%' }}><b>{now}%</b></span>}
            </span>
          </div>
        </div>
        <div className={'ll-bubble' + (up == null ? ' wait' : up < 0 ? ' down' : '')}>
          {up == null ? <><span aria-hidden>🌱</span><b>{t('Ready to grow')}</b></> : up > 0 ? <><span aria-hidden>🚀</span><b>+{up}</b><small>{t('points')}</small></> : <><span aria-hidden>💪</span><b>{t('Keep going')}</b></>}
        </div>
      </div>
      <div className="ll-chips">
        <span className="ll-chips-l">{t('Your clearings')}</span>
        {m.skills.map((s) => <span key={s.id} className={'ll-skill ' + s.state} title={s.title + ' · ' + t(STATUS_B[s.state])}><i aria-hidden>{CHIP_C[s.state]}</i>{s.short}</span>)}
        {m.post && <span className={'ll-skill post-' + m.post.state}><i aria-hidden>🏆</i>{t('Post-test')}</span>}
      </div>
    </div>
  )
}

export function LitLabLook({ look, model, carousel }) {
  if (!model) return null
  if (look === 'b') return <StarsLook m={model} carousel={carousel} />
  if (look === 'c') return <ThenNowLook m={model} carousel={carousel} />
  return <TrailLook m={model} carousel={carousel} />
}
