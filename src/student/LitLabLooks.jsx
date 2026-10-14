import React from 'react'
import { useT } from '../lib/i18n/index.jsx'

/*
 * Three student-friendly ways to show a Lit Labyrinth path's data on the Practice card (Kennady, 2026-10-14: "What are your
 * ideas on some more student friendly ways to present data? Build me three different options for the front card of Lit Lab.
 * Use an ABC prototype picker"). Each takes the same model (pathModel in StudentHome.jsx):
 *   A  Trail        — stepping stones on a winding trail; no numbers, just done / boosted / you are here / locked
 *   C  Then & Now   — two big bars, where you started and where you are, against the 85% goal
 */

// Stars came out (2026-10-14: "I don't like stars - it's too busy")
export const LIT_LOOKS = [['a', 'Trail'], ['c', 'Then & Now'], ['d', 'Donuts']]

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
    return up > 0 ? t('You finished the path and grew {n}%! 🎉', { n: up }) : t('You finished the path! 🎉')
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

/* ---------- A · Trail ---------- */
/* Two prototype choices inside the trail (2026-10-14: "How do show they completed skill builder for support? Can the trail
 * have a cute little background"): the background (the domain's land art, a drawn meadow, or none) and how a Skill Builder
 * shows (a ⚡ badge on the skill's stone, or its own small stop on the trail). Kept in this browser. */
const TRAIL_SCENES = [['land', 'Land'], ['meadow', 'Meadow'], ['none', 'None']]
const TRAIL_SB = [['badge', 'Badge'], ['stop', 'Stop']]
const useStored = (key, list) => {
  const [v, setV] = React.useState(() => { try { const x = localStorage.getItem(key); return list.some(([k]) => k === x) ? x : list[0][0] } catch { return list[0][0] } })
  return [v, (x) => { setV(x); try { localStorage.setItem(key, x) } catch { /* fine */ } }]
}
function Meadow() {
  // a quiet drawn scene: sky, two rolling hills, a few round trees and flowers
  const tree = (x, y, s, c) => (
    <g key={x + '-' + y} transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="0" width="6" height="16" rx="2" fill="#b98a5e" />
      <circle cx="0" cy="-6" r="14" fill={c} />
      <circle cx="-8" cy="2" r="9" fill={c} />
      <circle cx="9" cy="1" r="10" fill={c} />
    </g>
  )
  return (
    <svg className="ll-meadow" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs><linearGradient id="llSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d6edff" /><stop offset="1" stopColor="#f2fae9" /></linearGradient></defs>
      <rect width="1000" height="200" fill="url(#llSky)" />
      <g fill="#fff" opacity=".9"><ellipse cx="120" cy="34" rx="40" ry="12" /><ellipse cx="150" cy="28" rx="26" ry="12" /><ellipse cx="620" cy="22" rx="34" ry="10" /><ellipse cx="648" cy="17" rx="22" ry="10" /></g>
      <path d="M0 140 C 120 105 260 125 380 132 S 640 100 780 118 S 940 128 1000 112 V200 H0Z" fill="#c9ecb9" />
      <path d="M0 172 C 160 150 300 168 460 166 S 760 146 1000 160 V200 H0Z" fill="#ade09a" />
      {tree(28, 128, 1.1, '#7cc976')}{tree(62, 140, .8, '#66b964')}{tree(966, 112, 1, '#7cc976')}{tree(938, 130, .75, '#66b964')}{tree(520, 120, .6, '#8fd18a')}{tree(300, 128, .55, '#8fd18a')}
      <g>{[[210, 176, '#ff9db5'], [236, 182, '#ffd166'], [700, 172, '#c7a6ff'], [728, 178, '#ff9db5'], [860, 176, '#ffd166'], [380, 184, '#c7a6ff']].map(([x, y, c]) => <circle key={x} cx={x} cy={y} r="4" fill={c} />)}</g>
    </svg>
  )
}
const STONE = { mastered: '✓', boosted: '✓', next: '', sb: '', working: '…', tried: '…', locked: '🔒', open: '' }
function TrailLook({ m, carousel, land }) {
  const t = useT()
  const [scene, setScene] = useStored('lscr.trailScene', TRAIL_SCENES)
  const [sbStyle, setSbStyle] = useStored('lscr.trailSb', TRAIL_SB)
  const nodes = [{ key: 'start', kind: 'start', icon: '🚩', label: t('Pre-test'), pill: m.pre + '%', pillKind: 'pre' }]
  for (const s of m.skills) {
    const usedSb = s.sb != null || s.state === 'sb'
    if (sbStyle === 'stop' && usedSb) {
      // the skill shows its first try; the Skill Builder is the next stop on the trail
      // once the Skill Builder carried it to mastery the skill is cleared (green check); its pill keeps the first try
      const cleared = s.sb != null
      nodes.push({ key: s.id, kind: cleared ? 'mastered' : 'tried', icon: cleared ? '✓' : STONE.tried, label: s.short, full: s.title, pill: s.acts + '%', pillKind: 'low', done: true })
      nodes.push({ key: s.id + ':sb', kind: s.sb != null ? 'sbstop' : 'sbstop sb', icon: '⚡', small: true, label: t('Skill Builder'),
        pill: s.sb != null ? s.sb + '%' : null, pillKind: 'good', done: s.sb != null, here: s.sb == null })
    } else {
      nodes.push({ key: s.id, kind: s.state, icon: STONE[s.state], label: s.short, full: s.title, sub: s.state === 'sb' ? t('Skill Builder') : null,
        // how they did: the score, and when a Skill Builder helped, the first try and then the Skill Builder
        pill: s.acts == null ? null : s.sb != null ? `${s.acts}% → ${s.sb}%` : s.acts + '%',
        pillKind: s.state === 'mastered' || s.state === 'boosted' ? 'good' : 'low',
        done: s.state === 'mastered' || s.state === 'boosted', here: s.state === 'next' || s.state === 'sb' })
    }
  }
  if (m.post) nodes.push({ key: 'post', kind: 'post-' + m.post.state, icon: '🏆', label: t('Post-test'), done: m.post.state === 'done', here: m.post.state === 'next',
    pill: m.post.score != null ? m.post.score + '%' : null, pillKind: 'post', growth: m.post.score != null ? m.post.score - m.pre : null })
  nodes[0].done = true
  const N = nodes.length
  const yOf = (i) => (i % 2 === 0 ? 50 : 24) // percent from the top: the trail winds up and down
  const pts = nodes.map((_, i) => `${((i + 0.5) / N) * 1000},${yOf(i)}`)
  const doneUpTo = nodes.reduce((k, nd, i) => (nd.done ? i : k), 0)
  const sceneStyle = scene === 'land' && land ? { backgroundImage: `linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.62)), url(${land})` } : undefined
  return (
    <div className="ll ll-a">
      <Head m={m} carousel={carousel}><GrowthStrip m={m} /></Head>
      <div className={'ll-trail scene-' + scene} style={sceneStyle}>
        {scene === 'meadow' && <Meadow />}
        <svg className="ll-trail-line" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden>
          <polyline points={pts.join(' ')} className="todo" vectorEffect="non-scaling-stroke" />
          <polyline points={pts.slice(0, doneUpTo + 1).join(' ')} className="done" vectorEffect="non-scaling-stroke" />
        </svg>
        {nodes.map((nd, i) => (
          <div key={nd.key} className={'ll-stone-wrap'} style={{ left: ((i + 0.5) / N) * 100 + '%', top: yOf(i) + '%' }}>
            {nd.here && <span className="ll-here">📍 {t('You are here')}</span>}
            <span className={'ll-stone ' + nd.kind + (nd.small ? ' small' : '')} title={nd.full || nd.label}>
              {nd.icon}
              {nd.kind === 'boosted' && <i className="ll-boost" title={t('A Skill Builder helped')}>⚡</i>}
            </span>
            {nd.growth != null && <span className={'ll-stone-growth' + (nd.growth < 0 ? ' down' : '')}>{nd.growth >= 0 ? '+' : ''}{nd.growth}%</span>}
            <span className="ll-stone-under">
              <span className={'ll-stone-label ' + nd.kind}>{nd.label}{nd.sub && <small>{nd.sub}</small>}</span>
              {nd.pill && <span className={'ll-pill ' + nd.pillKind}>{nd.pill}{nd.kind === 'boosted' && ' ⚡'}</span>}
            </span>
          </div>
        ))}
      </div>
      <div className="ll-foot">
        <div className="ll-key">
          <span><i className="mastered">✓</i>{t('Cleared')}</span>
          <span><i className={sbStyle === 'stop' ? 'sbstop' : 'boosted'}>⚡</i>{sbStyle === 'stop' ? t('Skill Builder stop') : t('Skill Builder helped')}</span>
        </div>
        <span style={{ flex: 1 }} />
        <span className="ll-proto" role="group" aria-label="Prototype: trail background">
          <span>Scene</span>{TRAIL_SCENES.map(([k, n]) => <button key={k} className={scene === k ? 'on' : ''} onClick={() => setScene(k)}>{n}</button>)}
        </span>
        <span className="ll-proto" role="group" aria-label="Prototype: how a Skill Builder shows">
          <span>Skill Builder</span>{TRAIL_SB.map(([k, n]) => <button key={k} className={sbStyle === k ? 'on' : ''} onClick={() => setSbStyle(k)}>{n}</button>)}
        </span>
      </div>
    </div>
  )
}

/* ---------- C · Donuts ---------- */
/* Each skill is a ring filled to its score (2026-10-14: "Donuts?"). When a Skill Builder helped, the ring tells it: gold up to
 * the first try, then green on to the Skill Builder's score, so the green slice is what the extra practice added. */
function Donut({ size = 62, first = null, final = null, tone = 'good', children, cls = '' }) {
  const r = 42, c = 2 * Math.PI * r
  const seg = (from, to) => ({ strokeDasharray: `${(Math.max(0, to - from) / 100) * c} ${c}`, strokeDashoffset: -(from / 100) * c })
  const twoPart = first != null && final != null && final > first
  return (
    <span className={'ll-donut ' + cls} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r={r} className="track" />
        {twoPart ? <>
          <circle cx="50" cy="50" r={r} className="arc low" style={seg(0, first)} />
          <circle cx="50" cy="50" r={r} className="arc good" style={seg(first, final)} />
        </> : (final ?? first) != null && <circle cx="50" cy="50" r={r} className={'arc ' + tone} style={seg(0, final ?? first)} />}
      </svg>
      <span className="ll-donut-in">{children}</span>
    </span>
  )
}
function DonutsLook({ m, carousel }) {
  const t = useT()
  return (
    <div className="ll ll-d">
      <Head m={m} carousel={carousel}><GrowthStrip m={m} /></Head>
      <div className="ll-donuts">
        <div className="ll-dn big">
          <Donut size={84} final={m.pre} tone="pre"><b>{m.pre}%</b></Donut>
          <span className="ll-dn-l">{t('Pre-test')}</span>
          <span className="ll-dn-s">{t('Where you started')}</span>
        </div>
        <span className="ll-dn-gap" aria-hidden />
        {m.skills.map((s) => {
          const sbUsed = s.sb != null
          return (
            <div key={s.id} className={'ll-dn ' + s.state} title={s.title}>
              <Donut first={s.acts} final={sbUsed ? s.sb : s.acts} tone={s.state === 'mastered' ? 'good' : 'low'} cls={s.state}>
                {s.score != null ? <b>{s.score}%</b> : s.state === 'locked' ? '🔒' : s.state === 'next' || s.state === 'sb' ? '📍' : ''}
              </Donut>
              <span className="ll-dn-l">{s.short}</span>
              <span className={'ll-dn-s' + (sbUsed || s.state === 'sb' ? ' sb' : '')}>
                {sbUsed ? `⚡ ${s.acts}% → ${s.sb}%` : s.state === 'sb' ? '⚡ ' + t('Skill Builder next') : s.state === 'next' ? t('Up next') : s.state === 'mastered' ? t('Mastered') : s.state === 'working' ? t('Keep going') : ''}
              </span>
            </div>
          )
        })}
        <span className="ll-dn-gap" aria-hidden />
        {m.post && (
          <div className={'ll-dn big post ' + m.post.state}>
            {m.post.score != null && <span className={'ll-stone-growth' + (m.post.score - m.pre < 0 ? ' down' : '')}>{m.post.score - m.pre >= 0 ? '+' : ''}{m.post.score - m.pre}%</span>}
            <Donut size={84} final={m.post.score} tone="post" cls={m.post.state}>{m.post.score != null ? <b>{m.post.score}%</b> : '🏆'}</Donut>
            <span className="ll-dn-l">{t('Post-test')}</span>
            <span className="ll-dn-s">{m.post.score != null ? t('Where you finished') : t('Opens at the end')}</span>
          </div>
        )}
      </div>
      <div className="ll-key">
        <span><i className="dk good" />{t('Mastered')}</span>
        <span><i className="dk low" />{t('First try')}</span>
        <span><i className="dk sbpair" />{t('⚡ Skill Builder added')}</span>
      </div>
    </div>
  )
}

const STATUS_B = { mastered: 'Mastered!', boosted: 'Mastered with practice ⚡', next: 'Up next', sb: 'Skill Builder next', working: 'Keep practicing', locked: 'Locked', open: 'Not started' }

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
          {up == null ? <><span aria-hidden>🌱</span><b>{t('Ready to grow')}</b></> : up > 0 ? <><span aria-hidden>🚀</span><b>+{up}%</b><small>{t('growth')}</small></> : <><span aria-hidden>💪</span><b>{t('Keep going')}</b></>}
        </div>
      </div>
      <div className="ll-chips">
        <span className="ll-chips-l">{t('Your clearings')}</span>
        {m.skills.map((s) => <span key={s.id} className={'ll-skill ' + s.state} title={s.title + ' · ' + t(STATUS_B[s.state])}><i aria-hidden>{CHIP_C[s.state]}</i>{s.short}{s.acts != null && <em className="ll-skill-n">{s.sb != null ? `${s.acts}% → ${s.sb}%` : s.acts + '%'}</em>}</span>)}
        {m.post && <span className={'ll-skill post-' + m.post.state}><i aria-hidden>🏆</i>{t('Post-test')}{m.post.score != null && <em className="ll-skill-n">{m.post.score}%</em>}</span>}
      </div>
    </div>
  )
}

export function LitLabLook({ look, model, carousel }) {
  if (!model) return null
  if (look === 'c') return <ThenNowLook m={model} carousel={carousel} />
  if (look === 'd') return <DonutsLook m={model} carousel={carousel} />
  return <TrailLook m={model} carousel={carousel} land={model.land} />
}
