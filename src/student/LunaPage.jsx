import React, { useState } from 'react'
import { BRAND } from '../lib/brand.js'
import ModuleBadge from '../components/ModuleBadge.jsx'
import { useT } from '../lib/i18n/index.jsx'
import { Directions, Glossed, useSay } from './Scaffold.jsx'

/*
 * Luna's Writing Nook — the student's module page.
 * Dashboard backdrop, wordmark header, slim Writing Journey band, then one
 * white panel: mission header + the six lessons as a 3 x 2 grid of Luna V2
 * cards joined by gold constellation rules. Profile sidebar on the right.
 * Lesson data is prototype content until the decks are converted.
 */

// Backdrop is the dashboard's: canvas colour + bg-enchanted.jpg (enchanted forest) at 22%.

const BASE = import.meta.env.BASE_URL || '/'
const NAVY = '#0d2f55'
const GLASS = 'rgba(9, 32, 68, .82)'
const CARD_SHADOW = '0 6px 22px rgba(2, 20, 50, .22)'



// Module 1 activity path (prototype data — mirrors the live product's lessons).
// Art panels are cropped from the Luna V2 lesson-card renders (public/lessons/).
// Titles and blurbs stay English here (module scope, no hook) — every render
// site runs them through t(); the Spanish lives in i18n/es/luna.js.
const M1_ACTIVITIES = [
  { n: 1, title: 'Restate the Question', stars: 3, status: 'passed', art: 'l1' },
  { n: 2, title: 'Answer the Question', stars: 3, status: 'passed', art: 'l2' },
  { n: 3, title: 'Cite the Evidence', stars: 2, status: 'passed', art: 'l3' },
  { n: 4, title: 'Explain Your Thinking', stars: 3, status: 'passed', art: 'l4' },
  { n: 5, title: 'RACE', stars: 0, status: 'in_progress', art: 'l5' },
  { n: 6, title: 'Module 1 Test', sub: "Show what you've learned!", stars: 0, status: 'todo', art: 'l6', final: true },
]
const LESSON_ART = (key) => `${BASE}lessons/${key}.webp`
const GOLD_FRAME = '#e9b93a'

const MISSION_BLURB = {
  m1: 'Build a strong foundation for clear, thoughtful answers.',
  m2: 'Stretch your answers into full, well-organized responses.',
  m3: 'Learn the moves great writers make in every piece.',
  m4: 'Plan, draft, and polish like a pro.',
  m5: 'Make good writing great by revising with purpose.',
  m6: 'Catch every slip so your ideas shine through.',
}

function Stars({ n, size = 17, dimColor = 'rgba(20,52,74,.18)' }) {
  const t = useT()
  return (
    <span style={{ fontSize: size, letterSpacing: 1.5, lineHeight: 1 }} aria-label={t('{n} of 3 stars', { n })}>
      {[1, 2, 3].map((i) => <span key={i} style={{ color: i <= n ? '#f5b400' : dimColor }}>★</span>)}
    </span>
  )
}

function Glass({ children, style }) {
  return (
    <div style={{ background: GLASS, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 18, boxShadow: CARD_SHADOW, ...style }}>
      {children}
    </div>
  )
}

function White({ children, style }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid var(--gold-line)', borderRadius: 18, boxShadow: 'var(--shadow)', ...style }}>
      {children}
    </div>
  )
}

/* ---------------- activity cards ---------------- */

function ActivityCard({ a, onOpen }) {
  const t = useT()
  const say = useSay()
  const passed = a.status === 'passed'
  const current = a.status === 'in_progress'
  const locked = a.status === 'todo'
  const [hover, setHover] = useState(false)
  const clickable = passed || current
  const frame = current ? `0 0 0 3px ${GOLD_FRAME}, 0 0 26px rgba(245,180,0,.55), 0 10px 26px rgba(2,20,50,.18)` : `0 0 0 2px ${GOLD_FRAME}, var(--shadow)`
  return (
    <div role={clickable ? 'button' : undefined} tabIndex={clickable ? 0 : -1}
      onClick={() => clickable && onOpen?.(a)} onKeyDown={(e) => clickable && (e.key === 'Enter' || e.key === ' ') && onOpen?.(a)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      /* The card itself no longer clips: a glossary definition opens below the
         lesson title and has to be able to escape the card. Only the art panel
         clips, which is all the rounded corners ever needed it for. */
      style={{ position: 'relative', background: '#fff', borderRadius: 18, cursor: clickable ? 'pointer' : 'default',
        boxShadow: frame, opacity: locked && !a.final ? .72 : 1, transform: hover && clickable ? 'translateY(-2px)' : 'none', transition: 'transform .15s, box-shadow .15s' }}>

      {/* art panel */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '720 / 246', background: '#0d2f55', overflow: 'hidden', borderRadius: '18px 18px 0 0' }}>
        <img src={LESSON_ART(a.art)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: locked ? 'saturate(.7) brightness(.85)' : 'none' }} />
        {locked && <span aria-hidden style={{ position: 'absolute', top: 8, right: 10, width: 22, height: 22, borderRadius: 6, background: 'rgba(255,255,255,.85)', display: 'grid', placeItems: 'center', fontSize: 12 }}>🔒</span>}
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: GOLD_FRAME, opacity: .9 }} />
      </div>

      {/* white panel */}
      <div style={{ padding: '10px 10px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.6, color: a.final ? '#c98f00' : 'var(--link)' }}>{a.final ? t('FINAL CHALLENGE') : t('LESSON {n}', { n: a.n })}</div>
        {/* Lesson titles carry the strategy words — Restate, Cite, Evidence,
            RACE, Module — so they are tappable. The whole card is a click
            target, so a tap on a glossed word must not also open the lesson;
            with no level set there is no button here and nothing changes. */}
        <div style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.15, color: NAVY, letterSpacing: '-.01em' }}
          onClick={(e) => { if (e.target.closest && e.target.closest('button')) e.stopPropagation() }}>
          <Glossed text={t(a.title)} />
        </div>
        {a.sub && <div style={{ fontSize: 12, color: '#4a6f8c', fontWeight: 600 }}>{say(a.sub)}</div>}
        <div style={{ margin: '2px 0 0' }}><Stars n={a.stars} size={20} dimColor="#d3dbe3" /></div>
        {current ? (
          <button onClick={(e) => { e.stopPropagation(); onOpen?.(a) }} style={{ width: '100%', marginTop: 6, padding: '9px 0', borderRadius: 10, fontWeight: 800, fontSize: 14, color: NAVY, background: 'linear-gradient(180deg,#ffd44d 0%,#f5b400 100%)', boxShadow: '0 3px 0 #c98f00, 0 0 18px rgba(245,180,0,.45)' }}>
            {t('✦ Continue →')}
          </button>
        ) : passed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4, fontSize: 13.5, fontWeight: 700, color: hover ? 'var(--link)' : '#4a6f8c' }}>
            <span aria-hidden style={{ width: 20, height: 20, borderRadius: '50%', background: '#2e9e6b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>✓</span>
            {hover ? t('View summary →') : t('Passed')}
          </div>
        ) : (
          <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 600, color: '#7d93a6' }}>{a.final ? t('Unlocks after lesson 5') : t('Up next')}</div>
        )}
      </div>
    </div>
  )
}

/* ---------------- journey band ---------------- */

const BAND = { background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid var(--gold-line)', borderRadius: 16, boxShadow: 'var(--shadow)' }

function BandHead({ modules, right }) {
  const t = useT()
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.1, color: 'var(--link)' }}>{t('YOUR WRITING JOURNEY')}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#5c7285' }}>{right || <>{t('{n} Modules · A Brighter You', { n: modules.length })} <span style={{ color: '#f5b400' }}>✦</span></>}</div>
    </div>
  )
}

// A — every module in one slim row.
function JourneyAll({ modules, currentId }) {
  const t = useT()
  return (
    <div style={{ ...BAND, padding: '7px 16px 8px', marginBottom: 12 }}>
      <BandHead modules={modules} />
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {modules.map((m, i) => {
          const locked = m.status === 'not_started'
          const cur = m.id === currentId
          const done = m.status === 'completed'
          return (
            <React.Fragment key={m.id}>
              {i > 0 && <div className="constellation-rule" style={{ flex: '0 0 auto', width: 22, marginTop: 15, display: 'flex', alignItems: 'center', gap: 3 }}><i /><span /></div>}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center', background: cur ? '#eaf6fd' : 'transparent', borderRadius: 10, padding: '3px 6px' }}>
                <div style={{ position: 'relative', width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: cur ? '0 0 0 2.5px #f5b400, 0 0 16px rgba(245,180,0,.5)' : 'none', background: cur ? '#fff' : 'transparent' }}>
                  <ModuleBadge id={m.id} size={cur ? 27 : 23} dim={locked} />
                  {done && <span style={{ position: 'absolute', top: -3, right: -4, width: 14, height: 14, borderRadius: '50%', background: '#2e9e6b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 8.5, fontWeight: 800 }}>✓</span>}
                  {locked && <span style={{ position: 'absolute', top: -5, right: -5, fontSize: 10 }}>🔒</span>}
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, lineHeight: 1.2, color: cur ? NAVY : locked ? '#8aa0b2' : '#2f5573', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  <span style={{ color: cur ? '#0a7dba' : 'inherit' }}>M{i + 1}</span> · {t(m.label)}
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- sidebar bits ---------------- */

function Stat({ icon, label, children, last }) {
  return (
    <div style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: last ? 'none' : '1px solid #e6eef3' }}>
      <span style={{ fontSize: 24, width: 34, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#5c7285' }}>{label}</div>
        {children}
      </div>
    </div>
  )
}

function ProgressRing({ pct }) {
  const R = 22, C = 2 * Math.PI * R
  return (
    <svg width="58" height="58" viewBox="0 0 58 58" style={{ flexShrink: 0 }}>
      <circle cx="29" cy="29" r={R} fill="none" stroke="#e2eef5" strokeWidth="7" />
      <circle cx="29" cy="29" r={R} fill="none" stroke="#06aade" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} transform="rotate(-90 29 29)" />
      <text x="29" y="33" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#14344a">{Math.round(pct * 100)}%</text>
    </svg>
  )
}


/* ---------------- all lessons, in order ---------------- */

// Rows of three. Between cards, the homepage's gold constellation rule
// carries the eye from one lesson to the next; between rows a full-width
// rule does the same, so the order reads 1 → 2 → 3, then 4 → 5 → 6.
function Connector({ style }) {
  return (
    <div className="constellation-rule" aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 4, ...style }}>
      <i /><span />
    </div>
  )
}

function LessonGrid({ acts, onOpen }) {
  const rows = []
  for (let i = 0; i < acts.length; i += 3) rows.push(acts.slice(i, i + 3))
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rows.map((row, r) => (
        <React.Fragment key={r}>
          {r > 0 && <Connector style={{ margin: '2px 6px' }} />}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, padding: '4px 4px' }}>
            {row.map((a, i) => (
              <React.Fragment key={a.n}>
                {i > 0 && <Connector style={{ width: 34, flexShrink: 0, alignSelf: 'center', margin: '0 2px' }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ActivityCard a={a} onOpen={onOpen} />
                </div>
              </React.Fragment>
            ))}
            {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, k) => <div key={`pad${k}`} style={{ flex: 1, marginLeft: 34 }} />)}
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

/* ---------------- page ---------------- */

export default function LunaPage({ state, me, onBack, onOpenLesson }) {
  const t = useT()
  const say = useSay()
  const modules = state.modules
  const current = modules.find((m) => m.status === 'in_progress') || modules[0]
  const currentIdx = modules.indexOf(current)
  const acts = M1_ACTIVITIES
  const done = acts.filter((a) => a.status === 'passed').length
  const left = acts.length - done
  const pct = done / acts.length
  const starsEarned = acts.reduce((s, a) => s + a.stars, 0)
  const starsMax = acts.length * 3
  const streak = Number(state.growthSummary?.streakDays) || 0
  const coins = me?.coins ?? 0
  const level = Math.floor(coins / 300) + 1
  const levelPct = (coins % 300) / 300
  const earned = ['m1', 'm5', 'm4']
  // English label: LessonPage translates it on render, so switching language
  // mid-lesson does not leave a snapshot of the old one on screen.
  const open = (a) => onOpenLesson?.(a, `Module ${currentIdx + 1}: ${current.label}`)

  return (
    <div style={{ margin: '-26px calc(50% - 50vw) -70px', padding: '16px 0 18px', minHeight: 'calc(100vh - 64px)', position: 'relative', boxSizing: 'border-box', color: 'var(--ink)',
      background: 'var(--canvas)' }}>
      {/* same backdrop as the dashboard */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `url(${BASE}bg-enchanted.jpg) center / cover no-repeat`, opacity: .22 }} />

      <div style={{ position: 'relative', maxWidth: 1500, margin: '0 auto', padding: '0 clamp(22px, 2.6vw, 56px)' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <img src={BRAND.luna} alt="Luna" style={{ height: 78, filter: 'drop-shadow(0 6px 14px rgba(2,20,50,.25))' }} />
          <img src={BRAND.lunaWordmark} alt={t("Luna's Writing Nook")} style={{ height: 'clamp(54px, 5vw, 74px)', width: 'auto', display: 'block', marginTop: 2 }} />
          <div style={{ flex: 1 }} />
          {onBack && (
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,.92)', border: '1px solid var(--gold-line)', borderRadius: 12, padding: '9px 16px', fontWeight: 800, fontSize: 13, color: NAVY, boxShadow: 'var(--shadow)' }}>
              {t('← Back to Previous Page')}
            </button>
          )}
        </div>

        <JourneyAll modules={modules} currentId={current.id} />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 270px', gap: 16, alignItems: 'start' }}>
          {/* ===== main column ===== */}
          <div>
            {/* mission panel: header + lessons together */}
            <White style={{ padding: '16px 20px 20px', color: 'var(--ink)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', paddingBottom: 14, marginBottom: 18, borderBottom: '1px solid #e6eef3' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.1, color: 'var(--link)', marginBottom: 4 }}>{t('MISSION {n}', { n: String(currentIdx + 1).padStart(2, '0') })}</div>
                  <div style={{ fontSize: 'clamp(19px, 1.7vw, 24px)', fontWeight: 800, color: NAVY, lineHeight: 1.15 }}>{t('Master the {label}', { label: t(current.label) })}</div>
                  {/* The mission blurb is the page's directions — the one Listen on this page. */}
                  <div style={{ fontSize: 13, color: '#4a6f8c', fontWeight: 600, marginTop: 2 }}><Directions text={MISSION_BLURB[current.id]} /></div>
                </div>
                <div style={{ minWidth: 220, maxWidth: 320, flex: '0 1 320px' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--link)', marginBottom: 4 }}>{t('{done} of {total} lessons', { done, total: acts.length })} · {left === 0 ? t('mission complete!') : t('{n} to go', { n: left })}</div>
                  <div style={{ position: 'relative', height: 12, background: '#e6eef3', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct * 100}%`, background: 'linear-gradient(90deg,#02b2d5,#0a7dba)', borderRadius: 8 }} />
                    <span style={{ position: 'absolute', right: 6, top: 0, fontSize: 10, fontWeight: 800, lineHeight: '12px', color: '#4a6f8c' }}>{Math.round(pct * 100)}%</span>
                  </div>
                </div>
              </div>
              <LessonGrid acts={acts} onOpen={open} />
            </White>
          </div>

          {/* ===== writer profile ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--ink)' }}>
            <White style={{ overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(120deg, ${NAVY}, #02384d)`, color: '#fff', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 19 }}>⭐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.1 }}>{t('My Writer Profile')}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>{t('A brighter writer is you!')} <span style={{ color: '#ffd44d' }}>✦</span></div>
                </div>
                <span style={{ fontSize: 18, opacity: .85 }}>⚙️</span>
              </div>

              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e6eef3' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'radial-gradient(circle at 50% 40%, #bfe8ff, #7fd0f5 70%)', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 3px #f5b400', flexShrink: 0 }}>
                  <img src={BRAND.luna} alt="" style={{ height: 38 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: NAVY }}>{t('Rising Writer · Level {n}', { n: level })}</div>
                  <div style={{ height: 8, background: '#e6eef3', borderRadius: 6, margin: '5px 0 4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(6, levelPct * 100)}%`, background: 'linear-gradient(90deg,#02b2d5,#0a7dba)', borderRadius: 6 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#5c7285', fontWeight: 600 }}>{say("Keep going! You're making great progress!")}</div>
                </div>
              </div>

              <Stat icon="⭐" label={t('Stars Earned')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: NAVY }}>{starsEarned} <span style={{ fontSize: 13, color: '#5c7285', fontWeight: 700 }}>/ {starsMax}</span></div>
                  <span style={{ fontSize: 15, letterSpacing: 1 }}>{[1, 2, 3, 4, 5, 6].map((i) => <span key={i} style={{ color: i <= Math.round(starsEarned / starsMax * 6) ? '#f5b400' : '#d7dfe6' }}>★</span>)}</span>
                </div>
              </Stat>

              <Stat icon="🔥" label={t('Current Streak')}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: NAVY }}>{streak} <span style={{ fontSize: 13, color: '#5c7285', fontWeight: 700 }}>{t('days in a row!')}</span></div>
                  <span style={{ marginLeft: 'auto', fontSize: 22 }}>📅</span>
                </div>
              </Stat>

              <div style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e6eef3' }}>
                <ProgressRing pct={pct} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5c7285' }}>{t('Module Progress')}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.4, color: NAVY }}>{pct >= .5 ? say("Great work! You're more than halfway there!") : say('Every activity gets you closer!')}</div>
                </div>
              </div>

              <div style={{ padding: '9px 14px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#5c7285', marginBottom: 6 }}>{t('Badges Earned')}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {earned.map((id) => <ModuleBadge key={id} id={id} size={36} />)}
                  {['x1', 'x2'].map((k) => <span key={k} style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8ee', display: 'grid', placeItems: 'center', color: '#b4c0cb', fontSize: 18 }}>★</span>)}
                </div>
              </div>

            </White>

            <White style={{ padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15.5, color: NAVY }}>{say("You're doing amazing, writer!")}</div>
                <div style={{ fontSize: 12.5, color: '#5c7285', lineHeight: 1.4, fontWeight: 600 }}>{say('Keep up the great work and finish strong!')} <span style={{ color: '#f5b400' }}>✦</span></div>
              </div>
            </White>
          </div>
        </div>

      </div>
    </div>
  )
}
