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
/* PROTOTYPE (2026-10-15: "I still prefer A. I like the zig zag - I think the top data/percentages is throwing me off. It's
 * important, but it doesn't display well."): the trail stays as it is; three ways to show the pre-test, now and growth.
 *   A  as it is (one line beside the path name)   B  three stat tiles   C  a growth bar from the pre-test to now */
export const TRAIL_HEADS = [['a', 'Today'], ['b', 'Stat tiles'], ['c', 'Growth bar']]
function StatTiles({ m }) {
  const t = useT()
  const done = m.post?.score != null
  const up = m.now == null ? null : m.now - m.pre
  return (
    <span className="ll-tiles">
      <span className="ll-tile"><small>{t('Pre-test')}</small><b>{m.pre}%</b></span>
      <span className="ll-tile"><small>{done ? t('Post-test') : t('Now')}</small><b>{m.now == null ? '—' : m.now + '%'}</b></span>
      <span className={'ll-tile grow' + (up == null ? ' wait' : up < 0 ? ' down' : '')}><small>{t('Growth')}</small><b>{up == null ? '—' : (up >= 0 ? '+' : '') + up + '%'}</b></span>
    </span>
  )
}
function GrowthBar({ m }) {
  const t = useT()
  const done = m.post?.score != null
  const now = m.now
  const up = now == null ? null : now - m.pre
  const lo = Math.min(m.pre, now ?? m.pre), hi = Math.max(m.pre, now ?? m.pre)
  return (
    <div className="ll-gbar" aria-label={t('Pre-test {a}%, now {b}%', { a: m.pre, b: now ?? '—' })}>
      <span className="ll-gbar-k">{t('Pre-test')} <b>{m.pre}%</b></span>
      <span className="ll-gbar-track">
        {now != null && <span className={'ll-gbar-fill' + (up < 0 ? ' down' : '')} style={{ left: lo + '%', width: (hi - lo) + '%' }} />}
        <span className="ll-gbar-dot pre" style={{ left: m.pre + '%' }} />
        {now != null && <span className="ll-gbar-dot now" style={{ left: now + '%' }} />}
      </span>
      <span className="ll-gbar-k">{now == null ? <>{t('Post-test')} <b>🔒</b></> : <>{done ? t('Post-test') : t('Now')} <b>{now}%</b></>}</span>
      {up != null && <span className={'ll-g-up' + (up < 0 ? ' down' : '')}>{up >= 0 ? '+' : ''}{up}%{!done && <small> {t('so far')}</small>}</span>}
    </div>
  )
}
export function TrailLook({ m, carousel }) {
  const t = useT()
  const [head, setHeadRaw] = React.useState(() => { try { const v = localStorage.getItem('lscr.trailHead'); return TRAIL_HEADS.some(([k]) => k === v) ? v : 'b' } catch { return 'b' } })
  const setHead = (v) => { setHeadRaw(v); try { localStorage.setItem('lscr.trailHead', v) } catch { /* fine */ } }
  const nodes = [{ key: 'start', kind: 'start', icon: '🚩', label: t('Pre-test'), pill: m.pre + '%', pillKind: 'pre', score: m.pre }]
  let n = 0
  for (const s of m.skills) {
    n += 1
    const usedSb = s.sb != null || s.state === 'sb'
    if (usedSb) {
      // the skill shows its first try; the Skill Builder is the next stop on the trail
      // once the Skill Builder carried it to mastery the skill is cleared (green check); its pill keeps the first try
      const cleared = s.sb != null
      nodes.push({ key: s.id, kind: cleared ? 'mastered' : 'tried', icon: cleared ? '✓' : STONE.tried, label: s.short, full: s.title, pill: s.acts + '%', pillKind: 'low', done: true, score: s.acts, n })
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
  // the trail winds up and down; the high stones sit low enough that "You are here" clears the data above
  const yOf = (i) => (i % 2 === 0 ? 56 : 31)
  const pts = nodes.map((_, i) => [((i + 0.5) / N) * 1000, yOf(i)])
  const doneUpTo = nodes.reduce((k, nd, i) => (nd.done ? i : k), 0)
  return (
    <div className={'ll ll-a head-' + head}>
      <Head m={m} carousel={carousel}>{head === 'a' ? <GrowthStrip m={m} /> : head === 'b' ? <StatTiles m={m} /> : null}</Head>
      {head === 'c' && <GrowthBar m={m} />}
      <div className="ll-trail on-land">
        <svg className="ll-trail-line" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden>
          <polyline points={pts.map((p) => p.join(',')).join(' ')} className="todo" vectorEffect="non-scaling-stroke" />
          <polyline points={pts.slice(0, doneUpTo + 1).map((p) => p.join(',')).join(' ')} className="done" vectorEffect="non-scaling-stroke" />
        </svg>
        {nodes.map((nd, i) => (
          <div key={nd.key} className={'ll-stone-wrap' + (nd.here ? ' is-here' : '')} style={{ left: ((i + 0.5) / N) * 100 + '%', top: yOf(i) + '%' }}>
            {nd.here && <span className="ll-here">📍 {t('You are here')}</span>}
            <span className={'ll-stone ' + nd.kind + (nd.small ? ' small' : '')} title={nd.full || nd.label}>
              {nd.icon}
            </span>
            {nd.growth != null && <span className={'ll-stone-growth' + (nd.growth < 0 ? ' down' : '')}>{nd.growth >= 0 ? '+' : ''}{nd.growth}%</span>}
            <span className="ll-stone-under">
              <span className={'ll-stone-label ' + nd.kind}>{nd.label}</span>
              {nd.pill && <span className={'ll-pill ' + nd.pillKind}>{nd.pill}</span>}
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
        <span className="style-pick ll-style-pick" role="group" aria-label="Prototype: how the scores show">
          {TRAIL_HEADS.map(([k, nm], i) => <button key={k} className={head === k ? 'on' : ''} aria-pressed={head === k} onClick={() => setHead(k)}>{'ABC'[i]}<small>{nm}</small></button>)}
        </span>
      </div>
    </div>
  )
}
