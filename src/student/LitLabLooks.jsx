import React from 'react'
import { useT } from '../lib/i18n/index.jsx'

/*
 * The Lit Labyrinth path on the Practice card, as a trail (Kennady, 2026-10-14: "What are your ideas on some more student
 * friendly ways to present data?"). Stepping stones from the pre-test to the post-test, each with its score; a Skill Builder
 * is its own purple ⚡ stop after the skill it helped ("Put Skill Builder in as a stop instead of a badge"); the header reads
 * pre-test -> post-test (or now) and the growth, as a percent. It sits on the domain's land art ("Stick with land"), which
 * fills the whole panel, washed light so it never competes with the data. Tried and dropped: star cards ("too busy"),
 * donuts ("awful"), a then-and-now bar chart, a drawn meadow.
 */

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

function Head({ m, carousel, children }) {
  return (
    <div className="ll-head">
      <b className="ll-name">{m.name}</b>
      {children}
      <span style={{ flex: 1 }} />
      <Carousel carousel={carousel} />
    </div>
  )
}

/* Pre-test -> post-test (or -> now) with the growth, for the trail's header (2026-10-14: "it isn't clear how they did on each
 * area or like what the growth was from pre to post"). Growth is shown as a percent, as on the rest of the card. */
function GrowthStrip({ m }) {
  const t = useT()
  const done = m.post?.score != null
  const up = m.now == null ? null : m.now - m.pre
  return (
    <span className="ll-growth">
      <span className="ll-g-pre">{t('Pre-test')} <b>{m.pre}%</b></span>
      <span className="ll-g-arrow" aria-hidden>→</span>
      {m.now == null
        ? <span className="ll-g-now wait">{t('Post-test')} <b>🔒</b></span>
        : <span className="ll-g-now">{done ? t('Post-test') : t('Now')} <b>{m.now}%</b></span>}
      {up != null && <span className={'ll-g-up' + (up < 0 ? ' down' : '')}>{up >= 0 ? '+' : ''}{up}%{!done && <small> {t('so far')}</small>}</span>}
    </span>
  )
}

const STONE = { mastered: '✓', next: '', working: '…', tried: '…', locked: '🔒', open: '' }
/* PROTOTYPE (2026-10-15: "Let's play around with the colors, spacing, structure of the path. I love it, I just think it could
 * present better"): A as it is; B a straight timeline (names in one row, scores as plain text under them, numbered locked
 * stops); C a gentle curve with each score inside its stone (no score boxes). Kept in this browser. */
export const TRAIL_STYLES = [['a', 'Today'], ['b', 'Timeline'], ['c', 'Scores in stones']]
const smoothPath = (pts) => {
  // a soft curve through the points (Catmull-Rom as cubic Béziers)
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`
  }
  return d
}
export function TrailLook({ m, carousel }) {
  const t = useT()
  const [look, setLookRaw] = React.useState(() => { try { const v = localStorage.getItem('lscr.trailStyle'); return TRAIL_STYLES.some(([k]) => k === v) ? v : 'b' } catch { return 'b' } })
  const setLook = (v) => { setLookRaw(v); try { localStorage.setItem('lscr.trailStyle', v) } catch { /* fine */ } }
  const nodes = [{ key: 'start', kind: 'start', icon: '🚩', label: t('Pre-test'), pill: m.pre + '%', pillKind: 'pre', score: m.pre }]
  let n = 0
  for (const s of m.skills) {
    n += 1
    const usedSb = s.sb != null || s.state === 'sb'
    if (usedSb) {
      // the skill shows its first try; the Skill Builder is the next stop on the trail
      // once the Skill Builder carried it to mastery the skill is cleared (green check); its pill keeps the first try
      const cleared = s.sb != null
      nodes.push({ key: s.id, kind: cleared ? 'mastered' : 'tried', icon: cleared ? '✓' : STONE.tried, label: s.short, full: s.title, pill: s.acts + '%', pillKind: 'low', done: true, score: s.acts, n, firstTry: true })
      nodes.push({ key: s.id + ':sb', kind: s.sb != null ? 'sbstop' : 'sbstop sb', icon: '⚡', small: true, label: t('Skill Builder'),
        pill: s.sb != null ? s.sb + '%' : null, pillKind: 'good', done: s.sb != null, here: s.sb == null, score: s.sb })
    } else {
      nodes.push({ key: s.id, kind: s.state, icon: STONE[s.state], label: s.short, full: s.title,
        pill: s.acts == null ? null : s.acts + '%', pillKind: s.state === 'mastered' ? 'good' : 'low',
        done: s.state === 'mastered', here: s.state === 'next', score: s.acts, n })
    }
  }
  if (m.post) nodes.push({ key: 'post', kind: 'post-' + m.post.state, icon: '🏆', label: t('Post-test'), done: m.post.state === 'done', here: m.post.state === 'next',
    pill: m.post.score != null ? m.post.score + '%' : null, pillKind: 'post', growth: m.post.score != null ? m.post.score - m.pre : null, score: m.post.score })
  nodes[0].done = true
  const N = nodes.length
  // A winds up and down; B is one straight line; C is a gentle curve
  const yOf = (i) => (look === 'b' ? 36 : look === 'c' ? (i % 2 === 0 ? 42 : 28) : i % 2 === 0 ? 50 : 24)
  const pts = nodes.map((_, i) => [((i + 0.5) / N) * 1000, yOf(i)])
  const doneUpTo = nodes.reduce((k, nd, i) => (nd.done ? i : k), 0)
  // what sits inside a stone: A the icon; B a number on locked stops; C the score on finished ones
  const face = (nd) => {
    const locked = /locked|open/.test(nd.kind)
    if (look === 'c' && nd.score != null && (nd.done || nd.kind.startsWith('post-done'))) return <b className="ll-in-score">{nd.score}</b>
    if (look === 'c' && nd.here && nd.score != null) return <b className="ll-in-score now">{nd.score}</b>
    if (look !== 'a' && locked && nd.n) return <span className="ll-in-n">{nd.n}</span>
    return nd.icon
  }
  return (
    <div className={'ll ll-a trail-' + look}>
      <Head m={m} carousel={carousel}><GrowthStrip m={m} /></Head>
      <div className="ll-trail on-land">
        <svg className="ll-trail-line" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden>
          {look === 'c' ? <>
            <path d={smoothPath(pts)} className="todo" vectorEffect="non-scaling-stroke" />
            <path d={smoothPath(pts.slice(0, doneUpTo + 1))} className="done" vectorEffect="non-scaling-stroke" />
          </> : <>
            <polyline points={pts.map((p) => p.join(',')).join(' ')} className="todo" vectorEffect="non-scaling-stroke" />
            <polyline points={pts.slice(0, doneUpTo + 1).map((p) => p.join(',')).join(' ')} className="done" vectorEffect="non-scaling-stroke" />
          </>}
        </svg>
        {nodes.map((nd, i) => (
          <div key={nd.key} className={'ll-stone-wrap' + (nd.here ? ' is-here' : '')} style={{ left: ((i + 0.5) / N) * 100 + '%', top: yOf(i) + '%' }}>
            {nd.here && <span className="ll-here">📍 {t('You are here')}</span>}
            <span className={'ll-stone ' + nd.kind + (nd.small ? ' small' : '') + (nd.firstTry ? ' first-try' : '')} title={nd.full || nd.label}>
              {face(nd)}
            </span>
            {nd.growth != null && <span className={'ll-stone-growth' + (nd.growth < 0 ? ' down' : '')}>{nd.growth >= 0 ? '+' : ''}{nd.growth}%</span>}
            <span className="ll-stone-under">
              <span className={'ll-stone-label ' + nd.kind}>{nd.label}</span>
              {look !== 'c' && nd.pill && <span className={'ll-pill ' + nd.pillKind}>{nd.pill}</span>}
            </span>
          </div>
        ))}
      </div>
      <div className="ll-foot">
        <div className="ll-key">
          <span><i className="mastered">✓</i>{t('Cleared')}</span>
          <span><i className="sbstop">⚡</i>{t('Skill Builder')}</span>
        </div>
        <span style={{ flex: 1 }} />
        <span className="style-pick ll-style-pick" role="group" aria-label="Prototype: trail style">
          {TRAIL_STYLES.map(([k, nm], i) => <button key={k} className={look === k ? 'on' : ''} aria-pressed={look === k} onClick={() => setLook(k)}>{'ABC'[i]}<small>{nm}</small></button>)}
        </span>
      </div>
    </div>
  )
}
