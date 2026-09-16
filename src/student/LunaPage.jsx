import React, { useLayoutEffect, useRef, useState } from 'react'
import { BRAND } from '../lib/brand.js'
import ModuleBadge from '../components/ModuleBadge.jsx'

/*
 * Luna's Writing Nook — night-sky mockup (2026-09-15).
 * Full-bleed illustrated sky (public/luna-sky.webp) muted by SKY_DIM, a dark
 * glass "Your Writing Journey" band, a Mission card, activity cards on a
 * 3-column path with dotted connectors, and the "My Writer Profile" sidebar.
 */

// Backdrop is the dashboard's: canvas colour + bg-stars.jpg at 22%.

const BASE = import.meta.env.BASE_URL || '/'
const NAVY = '#0d2f55'
const GLASS = 'rgba(9, 32, 68, .82)'
const CARD_SHADOW = '0 6px 22px rgba(2, 20, 50, .22)'


const RACE_TILES = [['R', '#e668c9'], ['A', '#6db7f2'], ['C', '#7fd483'], ['E', '#f2b27e']]

// Module 1 activity path (prototype data — mirrors the live product's lessons).
const M1_ACTIVITIES = [
  { n: 1, title: 'Restate the Question', stars: 3, status: 'passed', art: '💬' },
  { n: 2, title: 'Answer the Question', stars: 3, status: 'passed', art: '💡' },
  { n: 3, title: 'Cite the Evidence', stars: 2, status: 'passed', art: '🔍' },
  { n: 4, title: 'Explain Your Thinking', stars: 3, status: 'passed', art: '🧠' },
  { n: 5, title: 'RACE', stars: 0, status: 'in_progress', art: 'RACE' },
  { n: 6, title: 'Module 1 Test', sub: "Show what you've learned!", stars: 0, status: 'todo', art: '💻', final: true },
]

const MISSION_BLURB = {
  m1: 'Build a strong foundation for clear, thoughtful answers.',
  m2: 'Stretch your answers into full, well-organized responses.',
  m3: 'Learn the moves great writers make in every piece.',
  m4: 'Plan, draft, and polish like a pro.',
  m5: 'Make good writing great by revising with purpose.',
  m6: 'Catch every slip so your ideas shine through.',
}

function Stars({ n, size = 17, dimColor = 'rgba(20,52,74,.18)' }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1.5, lineHeight: 1 }} aria-label={`${n} of 3 stars`}>
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
    <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: 18, boxShadow: CARD_SHADOW, ...style }}>
      {children}
    </div>
  )
}

/* ---------------- activity cards ---------------- */

function ActivityCard({ a, onOpen }) {
  const passed = a.status === 'passed'
  const current = a.status === 'in_progress'
  const todo = a.status === 'todo'
  const tag = (bg, fg, text) => <span style={{ position: 'absolute', top: -9, right: 10, background: bg, color: fg, fontWeight: 800, fontSize: 8.5, letterSpacing: .5, borderRadius: 6, padding: '3px 7px', boxShadow: '0 2px 6px rgba(2,20,50,.25)', zIndex: 2, whiteSpace: 'nowrap' }}>{text}</span>
  return (
    <div style={{ position: 'relative', background: '#fff', borderRadius: 14, padding: 7, boxShadow: current ? '0 0 0 2.5px #f5b400, 0 8px 24px rgba(245,180,0,.35)' : a.final ? '0 0 0 2px #ffd44d, 0 8px 26px rgba(245,180,0,.3)' : CARD_SHADOW, opacity: todo && !a.final ? .94 : 1 }}>
      <span style={{ position: 'absolute', top: -10, left: -10, width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(140deg,#06aade,#0a7dba)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12.5, boxShadow: '0 2px 6px rgba(2,20,50,.35)', border: '2px solid #fff', zIndex: 2 }}>{a.n}</span>
      {passed && <span style={{ position: 'absolute', top: -9, right: -9, width: 24, height: 24, borderRadius: '50%', background: '#2e9e6b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, border: '2px solid #fff', boxShadow: '0 2px 6px rgba(2,20,50,.3)', zIndex: 2 }}>✓</span>}
      {current && tag('#f5b400', NAVY, 'CURRENT')}
      {todo && !a.final && tag('#dfe8ef', '#4a6f8c', 'UP NEXT')}
      {a.final && <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%) rotate(-3deg)', background: 'linear-gradient(180deg,#ffd44d,#f5b400)', color: NAVY, fontWeight: 800, fontSize: 9.5, letterSpacing: .7, borderRadius: 8, padding: '4px 12px', boxShadow: '0 2px 8px rgba(2,20,50,.3)', zIndex: 2, whiteSpace: 'nowrap' }}>FINAL CHALLENGE</span>}

      <div style={{ position: 'relative', height: 66, borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(135deg,#0d2f55 0%,#123a63 60%,#1b2f52 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <span style={{ position: 'absolute', top: 5, left: 8, color: 'rgba(255,255,255,.55)', fontSize: 8 }}>✦</span>
        <span style={{ position: 'absolute', bottom: 6, right: 9, color: '#f5b400', fontSize: 9 }}>✦</span>
        <div style={{ position: 'absolute', bottom: -14, left: 0, right: 0, height: 26, background: 'radial-gradient(ellipse at 50% 100%, #3f7a3a 0%, #2c5a3a 45%, transparent 72%)' }} />
        <img src={BRAND.luna} alt="" style={{ height: 42, position: 'relative' }} />
        {a.art === 'RACE' ? (
          <span style={{ display: 'inline-flex', gap: 2, position: 'relative' }}>
            {RACE_TILES.map(([l, c]) => (
              <span key={l} style={{ width: 15, height: 15, borderRadius: 4, background: c, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 9.5, transform: `rotate(${(l.charCodeAt(0) % 3 - 1) * 8}deg)`, boxShadow: '0 1px 3px rgba(0,0,0,.3)' }}>{l}</span>
            ))}
          </span>
        ) : (
          <span style={{ fontSize: 24, position: 'relative', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.45))' }}>{a.art}</span>
        )}
      </div>

      <div style={{ padding: '7px 3px 2px' }}>
        <div style={{ fontWeight: 800, fontSize: a.final ? 13 : 11.5, lineHeight: 1.2, minHeight: a.sub ? 0 : 28, color: NAVY, textAlign: a.final ? 'center' : 'left' }}>{a.title}</div>
        {a.sub && <div style={{ fontSize: 10.5, color: '#5c7285', textAlign: 'center', marginTop: 1 }}>{a.sub}</div>}
        <div style={{ margin: '2px 0 6px', display: 'flex', alignItems: 'center', justifyContent: a.final ? 'center' : 'space-between', gap: 6 }}>
          <Stars n={a.stars} size={12} />
          {passed && <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: .4, background: '#2e9e6b', color: '#fff', borderRadius: 999, padding: '2px 7px' }}>✓ PASSED</span>}
        </div>
        {current ? (
          <button onClick={() => onOpen?.(a)} style={{ width: '100%', padding: '7px 0', borderRadius: 8, fontWeight: 800, fontSize: 11.5, color: NAVY, background: 'linear-gradient(180deg,#ffd44d,#f5b400)', boxShadow: '0 2px 0 #c98f00' }}>
            Continue →
          </button>
        ) : passed ? (
          <button onClick={() => onOpen?.(a)} style={{ width: '100%', padding: '6px 0', borderRadius: 8, fontWeight: 800, fontSize: 11, color: '#fff', background: 'linear-gradient(120deg,#41b9e3,#0a7dba)' }}>
            📊 Summary
          </button>
        ) : (
          a.final ? (
          <button disabled style={{ width: '100%', padding: '7px 0', borderRadius: 8, fontWeight: 800, fontSize: 11.5, color: '#9a7a1c', background: 'linear-gradient(180deg,#fff1bf,#ffe08a)', cursor: 'default' }}>
            🔒 Start Challenge →
          </button>
          ) : (
          <button disabled style={{ width: '100%', padding: '6px 0', borderRadius: 8, fontWeight: 800, fontSize: 11, color: '#7d93a6', background: '#eef3f6', cursor: 'default' }}>
            🔒 Coming soon
          </button>
          )
        )}
      </div>
    </div>
  )
}

/* ---------------- journey band ---------------- */

const BAND = { background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1.5px solid #bcd9ec', borderRadius: 16, boxShadow: CARD_SHADOW }

function BandHead({ modules, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 5 }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.1, color: '#0a7dba' }}>✦ YOUR WRITING JOURNEY</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#5c7285' }}>{right || <>{modules.length} Modules · A Brighter You <span style={{ color: '#f5b400' }}>✦</span></>}</div>
    </div>
  )
}

// A — every module in one slim row.
function JourneyAll({ modules, currentId }) {
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
              {i > 0 && <div style={{ flex: '0 0 auto', width: 18, borderTop: '2px dashed #8fcbe8', marginTop: 16 }} />}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center', background: cur ? '#eaf6fd' : 'transparent', borderRadius: 10, padding: '3px 6px' }}>
                <div style={{ position: 'relative', width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: cur ? '0 0 0 2.5px #f5b400, 0 0 16px rgba(245,180,0,.5)' : 'none', background: cur ? '#fff' : 'transparent' }}>
                  <ModuleBadge id={m.id} size={cur ? 27 : 23} dim={locked} />
                  {done && <span style={{ position: 'absolute', top: -3, right: -4, width: 14, height: 14, borderRadius: '50%', background: '#2e9e6b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 8.5, fontWeight: 800 }}>✓</span>}
                  {locked && <span style={{ position: 'absolute', top: -5, right: -5, fontSize: 10 }}>🔒</span>}
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, lineHeight: 1.2, color: cur ? NAVY : locked ? '#8aa0b2' : '#2f5573', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  <span style={{ color: cur ? '#0a7dba' : 'inherit' }}>M{i + 1}</span> · {m.label}
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

function LessonSwitch({ value, onChange }) {
  const opt = (v, label) => (
    <button onClick={() => onChange(v)} style={{ padding: '5px 10px', borderRadius: 8, fontWeight: 800, fontSize: 11.5, background: value === v ? NAVY : 'transparent', color: value === v ? '#fff' : '#4a6f8c' }}>{label}</button>
  )
  return (
    <div title="Prototype only: two ways to show the lessons" style={{ display: 'inline-flex', gap: 2, padding: 2, background: 'rgba(255,255,255,.9)', border: '1.5px solid #bcd9ec', borderRadius: 10, boxShadow: CARD_SHADOW }}>
      <span style={{ alignSelf: 'center', fontSize: 10.5, fontWeight: 800, letterSpacing: .6, color: '#7d93a6', padding: '0 6px 0 8px' }}>LESSONS</span>
      {opt('all', 'A · All on the map')}
      {opt('one', 'B · One at a time')}
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


/* ---------------- string lights ---------------- */

// Quadratic curve between two card centres with a gentle sag, then bulbs
// spaced along it. Everything in container pixels, measured after layout.
function stringPath(a, b, sag = 34) {
  const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2 + sag
  const pts = []
  for (let i = 0; i <= 48; i++) {
    const t = i / 48, u = 1 - t
    pts.push({ x: u * u * a.x + 2 * u * t * cx + t * t * b.x, y: u * u * a.y + 2 * u * t * cy + t * t * b.y })
  }
  const bulbs = []
  let acc = 0, next = 22
  for (let i = 1; i < pts.length; i++) {
    acc += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    if (acc >= next) { bulbs.push(pts[i]); next += 26 }
  }
  return { d: `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`, bulbs }
}

function StringLights({ centres, w, h, sag }) {
  if (centres.length < 2 || !w) return null
  const segs = []
  for (let i = 1; i < centres.length; i++) segs.push(stringPath(centres[i - 1], centres[i], sag))
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }} aria-hidden>
      <defs>
        <filter id="bulbGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      {segs.map((s, i) => (
        <g key={i}>
          <path d={s.d} fill="none" stroke="rgba(13,47,85,.55)" strokeWidth="2" strokeLinecap="round" />
          {s.bulbs.map((b, j) => {
            const gold = j % 5 === 2
            return (
              <g key={j}>
                <circle cx={b.x} cy={b.y} r="7.5" fill={gold ? 'rgba(255,196,40,.55)' : 'rgba(0,170,255,.5)'} filter="url(#bulbGlow)" />
                <circle cx={b.x} cy={b.y} r="3.6" fill={gold ? '#ffc933' : '#1fb6ff'} stroke="#fff" strokeWidth="1.2" />
                <circle cx={b.x - 1} cy={b.y - 1.1} r="1.1" fill="#fff" />
              </g>
            )
          })}
        </g>
      ))}
    </svg>
  )
}

/* ---------------- all lessons in a row ---------------- */

function IslandPath({ acts, onOpen }) {
  const box = useRef(null)
  const cardRefs = useRef([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [centres, setCentres] = useState([])

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      setSize({ w: r.width, h: r.height })
      setCentres(cardRefs.current.filter(Boolean).map((c) => {
        const q = c.getBoundingClientRect()
        return { x: q.left - r.left + q.width / 2, y: q.top - r.top + q.height * .42 }
      }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [acts.length])

  return (
    <div ref={box} style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'clamp(10px, 1.6%, 22px)', padding: '30px 6px 8px', marginTop: 12 }}>
      <StringLights centres={centres} w={size.w} h={size.h} sag={18} />
      {acts.map((a, i) => (
        <div key={a.n} ref={(el) => { cardRefs.current[i] = el }}
          style={{ width: a.final ? 'clamp(150px, 17%, 186px)' : 'clamp(120px, 14.5%, 156px)', flexShrink: 0, position: 'relative', zIndex: 2 }}>
          <ActivityCard a={a} onOpen={onOpen} />
        </div>
      ))}
    </div>
  )
}

/* ---------------- one lesson at a time (filmstrip) ---------------- */

// Five slots: the focused lesson big in the middle, its neighbours a step
// smaller, the outer two smaller still. `zoom` scales layout too, so nothing
// overlaps; widths are set so the five fill the row.
const SLOTS = [
  { w: 'clamp(96px, 11%, 118px)', zoom: .85, op: .55 },
  { w: 'clamp(118px, 14%, 140px)', zoom: 1, op: .8 },
  { w: 'clamp(150px, 17%, 172px)', zoom: 1.2, op: 1 },
  { w: 'clamp(118px, 14%, 140px)', zoom: 1, op: .8 },
  { w: 'clamp(96px, 11%, 118px)', zoom: .85, op: .55 },
]

function LessonCarousel({ acts, onOpen }) {
  const start = Math.max(0, acts.findIndex((a) => a.status === 'in_progress'))
  const [i, setI] = useState(start)
  const box = useRef(null)
  const slotRefs = useRef([])
  const [geo, setGeo] = useState({ w: 0, h: 0, pts: [] })
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      const pts = slotRefs.current.filter(Boolean).map((c) => { const q = c.getBoundingClientRect(); return { x: q.left - r.left + q.width / 2, y: q.top - r.top + 4 } })
      setGeo({ w: r.width, h: r.height, pts: [{ x: 0, y: 30 }, ...pts, { x: r.width, y: 30 }] })
    }
    measure(); const ro = new ResizeObserver(measure); ro.observe(el); return () => ro.disconnect()
  }, [i])
  const go = (d) => setI((k) => Math.min(acts.length - 1, Math.max(0, k + d)))
  const onKey = (e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1) }
  const arrow = (d) => {
    const ok = d < 0 ? i > 0 : i < acts.length - 1
    return (
      <button onClick={() => go(d)} disabled={!ok} aria-label={d < 0 ? 'Previous lesson' : 'Next lesson'}
        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [d < 0 ? 'left' : 'right']: 0, width: 44, height: 44, borderRadius: '50%', background: ok ? NAVY : 'rgba(255,255,255,.7)', border: ok ? 'none' : '1.5px solid #bcd9ec', color: ok ? '#fff' : '#b4c0cb', fontSize: 24, fontWeight: 800, display: 'grid', placeItems: 'center', boxShadow: CARD_SHADOW, cursor: ok ? 'pointer' : 'default', zIndex: 4 }}>
        {d < 0 ? '‹' : '›'}
      </button>
    )
  }
  slotRefs.current = []
  return (
    <div ref={box} tabIndex={0} onKeyDown={onKey} style={{ position: 'relative', outline: 'none', padding: '44px 56px 50px', marginTop: 10 }}>
      <StringLights centres={geo.pts} w={geo.w} h={geo.h} sag={22} />
      {arrow(-1)}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'clamp(12px, 2.4%, 30px)' }}>
        {SLOTS.map((slot, sIdx) => {
          const k = i + (sIdx - 2)
          const a = acts[k]
          const focus = sIdx === 2
          return (
            <div key={sIdx} ref={(el) => { if (a) slotRefs.current.push(el) }} onClick={() => a && !focus && setI(k)}
              style={{ width: slot.w, flexShrink: 0, zoom: slot.zoom, opacity: a ? slot.op : 0, transition: 'opacity .18s', cursor: a && !focus ? 'pointer' : 'default', filter: focus ? 'none' : 'saturate(.8)', pointerEvents: a ? 'auto' : 'none', position: 'relative', zIndex: focus ? 3 : 2 }}>
              {a ? <div style={{ pointerEvents: focus ? 'auto' : 'none' }}><ActivityCard a={a} onOpen={onOpen} /></div> : <div style={{ height: 1 }} />}
            </div>
          )
        })}
      </div>
      {arrow(1)}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, textAlign: 'center', fontSize: 12.5, fontWeight: 800, color: NAVY, letterSpacing: .4, zIndex: 3 }}>Lesson {i + 1} of {acts.length} · {acts[i].title}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 8, display: 'flex', justifyContent: 'center', gap: 8, zIndex: 3 }} aria-label="Lessons">
        {acts.map((x, k) => {
          const on = k === i
          const c = x.status === 'passed' ? '#2e9e6b' : x.status === 'in_progress' ? '#f5b400' : '#c9d6e0'
          return <button key={x.n} onClick={() => setI(k)} aria-label={`Lesson ${k + 1}`} style={{ width: on ? 22 : 9, height: 9, borderRadius: 5, background: c, boxShadow: '0 0 0 2px rgba(255,255,255,.9)', transition: 'width .15s', padding: 0 }} />
        })}
      </div>
    </div>
  )
}

/* ---------------- page ---------------- */

export default function LunaPage({ state, me, onBack, onOpenLesson }) {
  const modules = state.modules
  const current = modules.find((m) => m.status === 'in_progress') || modules[0]
  const currentIdx = modules.indexOf(current)
  const acts = M1_ACTIVITIES
  const done = acts.filter((a) => a.status === 'passed').length
  const left = acts.length - done
  const pct = done / acts.length
  const starsEarned = acts.reduce((s, a) => s + a.stars, 0)
  const starsMax = acts.length * 3
  const streak = state.growthSummary?.streakDays ?? 7
  const coins = me?.coins ?? 0
  const level = Math.floor(coins / 300) + 1
  const levelPct = (coins % 300) / 300
  const earned = ['m1', 'm5', 'm4']
  const open = (a) => onOpenLesson?.(a, `Module ${currentIdx + 1}: ${current.label}`)
  const [lessons, setLessons] = useState(() => { try { return localStorage.getItem('luna.lessons') || 'all' } catch { return 'all' } })
  const pickLessons = (v) => { setLessons(v); try { localStorage.setItem('luna.lessons', v) } catch {} }

  return (
    <div style={{ margin: '-26px calc(50% - 50vw) -70px', padding: '16px 0 18px', minHeight: 'calc(100vh - 64px)', position: 'relative', boxSizing: 'border-box', color: 'var(--ink)',
      background: 'var(--canvas)' }}>
      {/* same backdrop as the dashboard */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `url(${BASE}bg-stars.jpg) center / cover no-repeat`, opacity: .22 }} />

      <div style={{ position: 'relative', maxWidth: 1500, margin: '0 auto', padding: '0 clamp(22px, 2.6vw, 56px)' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <img src={BRAND.luna} alt="Luna" style={{ height: 78, filter: 'drop-shadow(0 6px 14px rgba(2,20,50,.25))' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(26px, 2.5vw, 36px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.01em', color: NAVY }}>
              Luna's <span style={{ color: '#035c78' }}>Writing Nook</span>
            </h1>
            <div style={{ fontSize: 14.5, fontWeight: 700, marginTop: 3, color: '#4a6f8c' }}>Think it. Write it. Shine! <span style={{ color: '#f5b400' }}>✦</span></div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onBack && (
            <button onClick={onBack} style={{ background: '#fff', border: '1.5px solid #bcd9ec', borderRadius: 12, padding: '9px 16px', fontWeight: 800, fontSize: 13, color: NAVY, boxShadow: CARD_SHADOW }}>
              ← Back to Previous Page
            </button>
          )}
          <LessonSwitch value={lessons} onChange={pickLessons} />
          </div>
        </div>

        <JourneyAll modules={modules} currentId={current.id} />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 270px', gap: 16, alignItems: 'start' }}>
          {/* ===== main column ===== */}
          <div>
            {/* mission card */}
            <White style={{ padding: '10px 18px 12px', marginBottom: 0, color: 'var(--ink)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '4px 20px', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'inline-block', background: NAVY, color: '#ffd44d', fontWeight: 800, fontSize: 12, letterSpacing: 1.4, padding: '3px 10px', borderRadius: 7, marginBottom: 5, fontSize: 10.5 }}>★ MISSION {String(currentIdx + 1).padStart(2, '0')}</span>
                <div style={{ fontSize: 'clamp(18px, 1.6vw, 23px)', fontWeight: 800, color: NAVY, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Master the {current.label}</div>
                <div style={{ fontSize: 13, color: '#4a6f8c', fontWeight: 600, marginTop: 2 }}>{MISSION_BLURB[current.id]}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ minWidth: 190 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0a7dba', marginBottom: 4 }}>{done} of {acts.length} activities completed</div>
                  <div style={{ position: 'relative', height: 12, background: '#e6eef3', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct * 100}%`, background: 'linear-gradient(90deg,#02b2d5,#0a7dba)', borderRadius: 8 }} />
                    <span style={{ position: 'absolute', right: 6, top: 0, fontSize: 10, fontWeight: 800, lineHeight: '12px', color: '#4a6f8c' }}>{Math.round(pct * 100)}%</span>
                  </div>
                </div>
                <img src={BRAND.luna} alt="" style={{ height: 48 }} />
                <div style={{ position: 'relative', background: '#fff', border: '2px solid #bcd9ec', borderRadius: 14, padding: '6px 10px', fontSize: 12, fontWeight: 800, color: '#0a7dba', whiteSpace: 'nowrap' }}>
                  {left === 0 ? 'Mission complete!' : `${left === 1 ? 'One activity' : `${['', '', 'Two', 'Three', 'Four', 'Five', 'Six'][left] || left} activities`} left!`}
                  <span style={{ position: 'absolute', left: -9, top: '50%', width: 12, height: 12, background: '#fff', borderLeft: '2px solid #bcd9ec', borderBottom: '2px solid #bcd9ec', transform: 'translateY(-50%) rotate(45deg)' }} />
                </div>
              </div>
            </White>

            {/* activity path, on the islands */}
            {lessons === 'one' ? <LessonCarousel acts={acts} onOpen={open} /> : <IslandPath acts={acts} onOpen={open} />}
          </div>

          {/* ===== writer profile ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--ink)' }}>
            <White style={{ overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(120deg, ${NAVY}, #02384d)`, color: '#fff', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 19 }}>⭐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1.1 }}>My Writer Profile</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>A brighter writer is you! <span style={{ color: '#ffd44d' }}>✦</span></div>
                </div>
                <span style={{ fontSize: 18, opacity: .85 }}>⚙️</span>
              </div>

              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e6eef3' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'radial-gradient(circle at 50% 40%, #bfe8ff, #7fd0f5 70%)', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 3px #f5b400', flexShrink: 0 }}>
                  <img src={BRAND.luna} alt="" style={{ height: 38 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: NAVY }}>Rising Writer · Level {level}</div>
                  <div style={{ height: 8, background: '#e6eef3', borderRadius: 6, margin: '5px 0 4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(6, levelPct * 100)}%`, background: 'linear-gradient(90deg,#02b2d5,#0a7dba)', borderRadius: 6 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#5c7285', fontWeight: 600 }}>Keep going! You're making great progress!</div>
                </div>
              </div>

              <Stat icon="⭐" label="Stars Earned">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: NAVY }}>{starsEarned} <span style={{ fontSize: 13, color: '#5c7285', fontWeight: 700 }}>/ {starsMax}</span></div>
                  <span style={{ fontSize: 15, letterSpacing: 1 }}>{[1, 2, 3, 4, 5, 6].map((i) => <span key={i} style={{ color: i <= Math.round(starsEarned / starsMax * 6) ? '#f5b400' : '#d7dfe6' }}>★</span>)}</span>
                </div>
              </Stat>

              <Stat icon="🔥" label="Current Streak">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: NAVY }}>{streak} <span style={{ fontSize: 13, color: '#5c7285', fontWeight: 700 }}>days in a row!</span></div>
                  <span style={{ marginLeft: 'auto', fontSize: 22 }}>📅</span>
                </div>
              </Stat>

              <div style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #e6eef3' }}>
                <ProgressRing pct={pct} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5c7285' }}>Module Progress</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.4, color: NAVY }}>{pct >= .5 ? "Great work! You're more than halfway there!" : 'Every activity gets you closer!'}</div>
                </div>
              </div>

              <div style={{ padding: '9px 14px', borderBottom: '1px solid #e6eef3' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#5c7285', marginBottom: 6 }}>Badges Earned</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {earned.map((id) => <ModuleBadge key={id} id={id} size={36} />)}
                  {['x1', 'x2'].map((k) => <span key={k} style={{ width: 36, height: 36, borderRadius: '50%', background: '#e2e8ee', display: 'grid', placeItems: 'center', color: '#b4c0cb', fontSize: 18 }}>★</span>)}
                </div>
              </div>

              <div style={{ padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24, width: 34, textAlign: 'center' }}>🪙</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5c7285' }}>ClassCade Coins</div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: NAVY }}>{coins.toLocaleString()}</div>
                </div>
                <button title="Shop opens in ClassCade" style={{ background: '#fff', border: '1.5px solid #bcd9ec', borderRadius: 10, padding: '8px 12px', fontWeight: 800, fontSize: 12.5, color: '#0a7dba' }}>View Shop →</button>
              </div>
            </White>

            <White style={{ padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={BRAND.luna} alt="Luna" style={{ height: 52 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15.5, color: NAVY }}>You're doing amazing, writer!</div>
                <div style={{ fontSize: 12.5, color: '#5c7285', lineHeight: 1.4, fontWeight: 600 }}>Keep up the great work and finish strong! <span style={{ color: '#f5b400' }}>✦</span></div>
              </div>
            </White>
          </div>
        </div>

      </div>
    </div>
  )
}
