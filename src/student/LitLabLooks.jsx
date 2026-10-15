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

const STONE = { mastered: '✓', next: '', working: '…', tried: '…', locked: '🔒', open: '' }
/* The trail's scores as three At-a-Glance tiles (her pick, 2026-10-15: "I prefer the tiles"; the one-line strip "doesn't display
 * well"; a growth bar was the other option). */
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
export function TrailLook({ m, carousel }) {
  const t = useT()
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
    <div className="ll ll-a head-b">
      <Head m={m} carousel={carousel}><StatTiles m={m} /></Head>
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
      </div>
    </div>
  )
}
