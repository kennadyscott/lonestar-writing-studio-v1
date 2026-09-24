import React, { useState } from 'react'
import { BRAND } from '../lib/brand.js'
import ModuleBadge from '../components/ModuleBadge.jsx'
import { useT } from '../lib/i18n/index.jsx'
import { Directions, Glossed, useSay } from './Scaffold.jsx'

/*
 * Luna's Writing Nook — the student's module page.
 * Dashboard backdrop, wordmark header, slim Writing Journey band, then one
 * white panel: mission header, then every lesson in a side rail beside a big
 * "Up next" card for the current one. No profile sidebar.
 * Lesson data is prototype content until the decks are converted.
 */

// Backdrop: canvas colour + bg-nook.jpg (her enchanted-forest clearing) at 22%.

const BASE = import.meta.env.BASE_URL || '/'
const NAVY = '#0d2f55'
const GLASS = 'rgba(9, 32, 68, .82)'
const SERIF = "Georgia, 'Times New Roman', serif" // storybook titles, per her Nook mockup
const CARD_SHADOW = '0 6px 22px rgba(2, 20, 50, .22)'



// Module 1 activity path (prototype data — mirrors the live product's lessons).
// Art panels are her enchanted-forest lesson paintings (public/lessons/g1-g6.jpg).
// Titles and blurbs stay English here (module scope, no hook) — every render
// site runs them through t(); the Spanish lives in i18n/es/luna.js.
const M1_ACTIVITIES = [
  { n: 1, title: 'Restate the Question', stars: 3, status: 'passed', art: 'g1' },
  { n: 2, title: 'Answer the Question', stars: 3, status: 'passed', art: 'g2' },
  { n: 3, title: 'Cite the Evidence', stars: 2, status: 'passed', art: 'g3' },
  { n: 4, title: 'Explain Your Thinking', stars: 3, status: 'passed', art: 'g4' },
  { n: 5, title: 'RACE', stars: 0, status: 'in_progress', art: 'g5' },
  { n: 6, title: 'Module 1 Test', sub: "Show what you've learned!", stars: 0, status: 'todo', art: 'g6', final: true },
]
// g1-g6: her 16:9 lesson cards (2026-09-24), replacing the f1-f6 strips. l1-l6.webp are the old space set.
const LESSON_ART = (key) => `${BASE}lessons/${key}.jpg`

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

/* ---------------- journey band ---------------- */

const BAND = { background: 'linear-gradient(180deg, rgba(11,49,80,.94), rgba(7,38,64,.94))', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1.5px solid rgba(92,192,230,.55)', borderRadius: 16,
  boxShadow: 'inset 0 0 22px rgba(92,192,230,.12), 0 0 14px rgba(92,192,230,.14), 0 6px 20px rgba(1,23,45,.25)' }

function BandHead({ modules, right }) {
  const t = useT()
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.6, color: 'var(--scene-sky)' }}>{t('YOUR WRITING JOURNEY')}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#bcd6e6' }}>{right || <>{t('{n} Modules · A Brighter You', { n: modules.length })} <span style={{ color: '#f5b400' }}>✦</span></>}</div>
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
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center', background: cur ? 'rgba(245,197,66,.14)' : 'transparent', border: cur ? '1px solid rgba(240,180,41,.55)' : '1px solid transparent', borderRadius: 10, padding: '3px 6px' }}>
                <div style={{ position: 'relative', width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: cur ? '0 0 0 2.5px #f5b400, 0 0 16px rgba(245,180,0,.5)' : '0 0 0 1px rgba(92,192,230,.35)', background: cur ? 'rgba(4,18,40,.7)' : 'rgba(4,18,40,.45)' }}>
                  <ModuleBadge id={m.id} size={cur ? 27 : 23} dim={locked} />
                  {done && <span style={{ position: 'absolute', top: -3, right: -4, width: 14, height: 14, borderRadius: '50%', background: '#2e9e6b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 8.5, fontWeight: 800 }}>✓</span>}
                  {locked && <span style={{ position: 'absolute', top: -5, right: -5, fontSize: 10 }}>🔒</span>}
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, lineHeight: 1.2, color: cur ? '#fff' : locked ? '#8fb3c8' : '#cfe7f3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  <span style={{ color: cur ? '#f5c542' : 'inherit' }}>M{i + 1}</span> · {t(m.label)}
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- lessons: the current one up front, the rest quiet ---------------- */

// Her "this feels super busy" (2026-09-24, she chose this over the old 3 x 2
// grid of equal paintings with gold frames and connector dots): the lesson the
// student is on gets the one big painting and the only gold; the others are
// small plain tiles in order.
function UpNextLesson({ a, onOpen }) {
  const t = useT()
  const say = useSay()
  const current = a.status === 'in_progress'
  return (
    <div className="nook-upnext" role="button" tabIndex={0} onClick={() => onOpen?.(a)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen?.(a)}>
      <div className="nook-upnext-art"><img src={LESSON_ART(a.art)} alt="" /></div>
      <div className="nook-upnext-words">
        <div className="nook-upnext-kicker">{current ? t('Up next') : t('Your next lesson')} · {a.final ? t('FINAL CHALLENGE') : t('LESSON {n}', { n: a.n })}</div>
        <div className="nook-upnext-title" onClick={(e) => { if (e.target.closest && e.target.closest('button')) e.stopPropagation() }}>
          <Glossed text={t(a.title)} />
        </div>
        {a.sub && <div style={{ fontSize: 14, color: '#4a6f8c', fontWeight: 600 }}>{say(a.sub)}</div>}
        <Stars n={a.stars} size={22} dimColor="#d3dbe3" />
        <button className="nook-upnext-btn" onClick={(e) => { e.stopPropagation(); onOpen?.(a) }}>
          {current ? t('✦ Continue →') : t('Start →')}
        </button>
      </div>
    </div>
  )
}

// The side rail (she chose it over tiles-below, 2026-09-24): every lesson in order, the current one lit gold.
function RailLesson({ a, isUp, onOpen }) {
  const t = useT()
  const passed = a.status === 'passed'
  const locked = a.status === 'todo' && !isUp
  const clickable = passed || isUp
  return (
    <div className={`nook-rail-row${isUp ? ' up' : ''}${locked ? ' locked' : ''}`} role={clickable ? 'button' : undefined} tabIndex={clickable ? 0 : -1}
      onClick={() => clickable && onOpen?.(a)} onKeyDown={(e) => clickable && (e.key === 'Enter' || e.key === ' ') && onOpen?.(a)}
      aria-current={isUp ? 'step' : undefined}>
      <span className="nook-rail-thumb"><img src={LESSON_ART(a.art)} alt="" /></span>
      <span className="nook-rail-words">
        <span className="nook-mini-kicker">{a.final ? t('FINAL CHALLENGE') : t('LESSON {n}', { n: a.n })}</span>
        <span className="nook-mini-title" onClick={(e) => { if (e.target.closest && e.target.closest('button')) e.stopPropagation() }}><Glossed text={t(a.title)} /></span>
      </span>
      {isUp ? <span className="nook-rail-now">{t('Now')}</span>
        : passed ? <span aria-label={t('Passed')} className="nook-mini-check">✓</span>
        : <span aria-hidden className="nook-rail-lock">🔒</span>}
    </div>
  )
}

function FocusLessons({ acts, onOpen }) {
  const t = useT()
  const up = acts.find((a) => a.status === 'in_progress') || acts.find((a) => a.status === 'todo') || acts[acts.length - 1]
  return (
    <div className="nook-railwrap">
      <nav className="nook-rail" aria-label={t('All lessons')}>
        <div className="nook-rest-label">{t('All lessons')}</div>
        {acts.map((a) => <RailLesson key={a.n} a={a} isUp={a === up} onOpen={onOpen} />)}
      </nav>
      <UpNextLesson a={up} onOpen={onOpen} />
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
  // English label: LessonPage translates it on render, so switching language
  // mid-lesson does not leave a snapshot of the old one on screen.
  const open = (a) => onOpenLesson?.(a, `Module ${currentIdx + 1}: ${current.label}`)

  return (
    <div style={{ margin: '-26px calc(50% - 50vw) -70px', padding: '16px 0 18px', minHeight: 'calc(100vh - 64px)', position: 'relative', boxSizing: 'border-box', color: 'var(--ink)',
      background: 'var(--canvas)' }}>
      {/* her forest-clearing painting, kept soft (22%) so the white panels stay calm */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `url(${BASE}bg-nook.jpg) center / cover no-repeat`, opacity: .22 }} />

      <div style={{ position: 'relative', maxWidth: 1500, margin: '0 auto', padding: '0 clamp(22px, 2.6vw, 56px)' }}>
        {/* header */}
        <div className="nook-head" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          <img className="nook-luna" src={BRAND.luna} alt="Luna" style={{ height: 78, filter: 'drop-shadow(0 6px 14px rgba(2,20,50,.25))' }} />
          <img src={BRAND.lunaAdventure} alt={t("Luna's Writing Adventure")} style={{ height: 'clamp(80px, 8vw, 118px)', width: 'auto', display: 'block', marginTop: 2 }} />
          <div style={{ flex: 1 }} />
          {onBack && (
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,.92)', border: '1px solid var(--gold-line)', borderRadius: 12, padding: '9px 16px', fontWeight: 800, fontSize: 13, color: NAVY, boxShadow: 'var(--shadow)', whiteSpace: 'nowrap' }}>
              {t('← Back to Previous Page')}
            </button>
          )}
        </div>

        <JourneyAll modules={modules} currentId={current.id} />

        {/* The Writer Profile sidebar is gone (2026-09-24, "we don't need this"): the lessons get the full width. */}
        <div>
          <div>
            {/* mission panel: header + lessons together */}
            <White style={{ padding: '16px 20px 20px', color: 'var(--ink)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', paddingBottom: 14, marginBottom: 18, borderBottom: '1px solid #e6eef3' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ fontFamily: SERIF, fontSize: 'clamp(22px, 2vw, 30px)', fontWeight: 700, color: NAVY, lineHeight: 1.15 }}>{t('Master the {label}', { label: t(current.label) })}</div>
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
              <FocusLessons acts={acts} onOpen={open} />
            </White>
          </div>
        </div>

      </div>
    </div>
  )
}
