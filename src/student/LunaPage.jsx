import React from 'react'
import { BRAND } from '../lib/brand.js'
import ModuleBadge from '../components/ModuleBadge.jsx'

/*
 * Luna's Writing Nook — night-sky mockup (2026-09-15).
 * Full-bleed illustrated sky (public/luna-sky.webp) muted by SKY_DIM, a dark
 * glass "Your Writing Journey" band, a Mission card, activity cards on a
 * 3-column path with dotted connectors, and the "My Writer Profile" sidebar.
 */

// How much to calm the background art (0 = full intensity, 1 = solid navy).
const SKY_DIM = 0.58

const SKY = (import.meta.env.BASE_URL || '/') + 'luna-sky.webp'
const NAVY = '#0d2f55'
const GLASS = 'rgba(9, 32, 68, .62)'
const CARD_SHADOW = '0 6px 22px rgba(2, 20, 50, .35)'

const RACE_TILES = [['R', '#e668c9'], ['A', '#6db7f2'], ['C', '#7fd483'], ['E', '#f2b27e']]

// Module 1 activity path (prototype data — mirrors the live product's lessons).
const M1_ACTIVITIES = [
  { n: 1, title: 'Restate the Question', stars: 3, status: 'passed', art: '💬' },
  { n: 2, title: 'Answer the Question', stars: 3, status: 'passed', art: '💡' },
  { n: 3, title: 'Cite the Evidence', stars: 2, status: 'passed', art: '🔍' },
  { n: 4, title: 'Explain Your Thinking', stars: 3, status: 'passed', art: '🧠' },
  { n: 5, title: 'RACE', stars: 0, status: 'in_progress', art: 'RACE' },
  { n: 6, title: 'Module 1: Short Constructed Response Test', stars: 0, status: 'todo', art: '💻' },
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

function ActivityCard({ a }) {
  const passed = a.status === 'passed'
  const current = a.status === 'in_progress'
  const todo = a.status === 'todo'
  return (
    <div style={{ position: 'relative', background: '#fff', borderRadius: 18, padding: 10, boxShadow: current ? '0 0 0 3px #f5b400, 0 10px 30px rgba(245,180,0,.35)' : CARD_SHADOW, opacity: todo ? .92 : 1 }}>
      <span style={{ position: 'absolute', top: -13, left: -13, width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(140deg,#06aade,#0a7dba)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 15, boxShadow: '0 2px 8px rgba(2,20,50,.4)', border: '2px solid #fff', zIndex: 2 }}>{a.n}</span>
      {passed && <span style={{ position: 'absolute', top: -12, right: -12, width: 30, height: 30, borderRadius: '50%', background: '#2e9e6b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 800, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(2,20,50,.35)', zIndex: 2 }}>✓</span>}
      {current && (
        <span style={{ position: 'absolute', top: -12, right: 14, background: '#f5b400', color: NAVY, fontWeight: 800, fontSize: 10.5, letterSpacing: .6, borderRadius: 8, padding: '4px 10px', boxShadow: '0 2px 8px rgba(2,20,50,.35)', zIndex: 2 }}>CURRENT ACTIVITY</span>
      )}
      {todo && <span style={{ position: 'absolute', top: -12, right: 14, background: '#dfe8ef', color: '#4a6f8c', fontWeight: 800, fontSize: 10.5, letterSpacing: .6, borderRadius: 8, padding: '4px 10px', zIndex: 2 }}>UP NEXT</span>}

      <div style={{ position: 'relative', height: 108, borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(135deg,#0d2f55 0%,#123a63 60%,#1b2f52 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ position: 'absolute', top: 8, left: 12, color: 'rgba(255,255,255,.55)', fontSize: 10 }}>✦</span>
        <span style={{ position: 'absolute', bottom: 10, right: 14, color: '#f5b400', fontSize: 11 }}>✦</span>
        <span style={{ position: 'absolute', top: 14, right: 26, color: 'rgba(255,255,255,.35)', fontSize: 8 }}>✦</span>
        <div style={{ position: 'absolute', bottom: -18, left: 0, right: 0, height: 34, background: 'radial-gradient(ellipse at 50% 100%, #3f7a3a 0%, #2c5a3a 45%, transparent 72%)' }} />
        <img src={BRAND.luna} alt="" style={{ height: 66, position: 'relative' }} />
        {a.art === 'RACE' ? (
          <span style={{ display: 'inline-flex', gap: 3, position: 'relative' }}>
            {RACE_TILES.map(([l, c]) => (
              <span key={l} style={{ width: 24, height: 24, borderRadius: 6, background: c, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, transform: `rotate(${(l.charCodeAt(0) % 3 - 1) * 8}deg)`, boxShadow: '0 2px 4px rgba(0,0,0,.3)' }}>{l}</span>
            ))}
          </span>
        ) : (
          <span style={{ fontSize: 36, position: 'relative', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.45))' }}>{a.art}</span>
        )}
      </div>

      <div style={{ padding: '10px 6px 6px' }}>
        <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.25, minHeight: 36, color: NAVY }}>{a.title}</div>
        <div style={{ margin: '4px 0 10px' }}><Stars n={a.stars} /></div>
        {current ? (
          <button title="Activity opens in the full product" style={{ width: '100%', padding: '11px 0', borderRadius: 11, fontWeight: 800, fontSize: 14, color: NAVY, background: 'linear-gradient(180deg,#ffd44d,#f5b400)', boxShadow: '0 3px 0 #c98f00' }}>
            Continue Activity →
          </button>
        ) : passed ? (
          <button title="Activity opens in the full product" style={{ width: '100%', padding: '9px 0', borderRadius: 10, fontWeight: 800, fontSize: 13, color: '#fff', background: 'linear-gradient(120deg,#41b9e3,#0a7dba)' }}>
            📊 View Summary
          </button>
        ) : (
          <button disabled style={{ width: '100%', padding: '9px 0', borderRadius: 10, fontWeight: 800, fontSize: 13, color: '#7d93a6', background: '#eef3f6', cursor: 'default' }}>
            🔒 Coming Soon
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------------- journey band ---------------- */

function Journey({ modules, currentId }) {
  return (
    <Glass style={{ padding: '14px 22px 16px', marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.2, color: '#ffd44d' }}>✦ YOUR WRITING JOURNEY</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.75)' }}>{modules.length} Modules · A Brighter You <span style={{ color: '#ffd44d' }}>✦</span></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {modules.map((m, i) => {
          const locked = m.status === 'not_started'
          const cur = m.id === currentId
          const done = m.status === 'completed'
          return (
            <React.Fragment key={m.id}>
              {i > 0 && <div style={{ flex: '0 0 auto', width: 28, borderTop: '2px dashed rgba(255,255,255,.35)', marginTop: 26 }} />}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center',
                background: cur ? 'rgba(255,255,255,.12)' : 'transparent', borderRadius: 14, padding: '8px 6px' }}>
                <div style={{ position: 'relative', width: 54, height: 54, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  background: cur ? 'radial-gradient(circle, rgba(255,212,77,.35), transparent 70%)' : 'rgba(255,255,255,.08)',
                  boxShadow: cur ? '0 0 0 3px #f5b400, 0 0 24px rgba(245,180,0,.6)' : 'none' }}>
                  <ModuleBadge id={m.id} size={cur ? 44 : 36} dim={locked} />
                  {done && <span style={{ position: 'absolute', top: -2, right: -4, width: 17, height: 17, borderRadius: '50%', background: '#2e9e6b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800 }}>✓</span>}
                  {locked && <span style={{ position: 'absolute', top: -4, right: -6, fontSize: 12 }}>🔒</span>}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 800, lineHeight: 1.25, color: cur ? '#fff' : locked ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.9)' }}>
                  Module {i + 1}:<br />{m.label}
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </Glass>
  )
}

/* ---------------- sidebar bits ---------------- */

function Stat({ icon, label, children, last }) {
  return (
    <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: last ? 'none' : '1px solid #e6eef3' }}>
      <span style={{ fontSize: 30, width: 40, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
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

/* ---------------- page ---------------- */

export default function LunaPage({ state, me, onBack }) {
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

  return (
    <div style={{ margin: '-26px calc(50% - 50vw) -70px', padding: '28px 0 70px', minHeight: 'calc(100vh - 64px)', position: 'relative', boxSizing: 'border-box', color: '#fff',
      backgroundColor: NAVY,
      backgroundImage: `linear-gradient(180deg, rgba(8,28,64,${SKY_DIM + .1}) 0%, rgba(8,28,64,${SKY_DIM}) 30%, rgba(8,28,64,${SKY_DIM}) 70%, rgba(8,28,64,${SKY_DIM + .15}) 100%), url(${SKY})`,
      backgroundSize: 'cover, cover', backgroundPosition: 'center top, center top', backgroundAttachment: 'scroll, fixed' }}>

      <div style={{ position: 'relative', maxWidth: 1780, margin: '0 auto', padding: '0 clamp(22px, 2.6vw, 56px)' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginBottom: 22 }}>
          <img src={BRAND.luna} alt="Luna" style={{ height: 118, filter: 'drop-shadow(0 6px 14px rgba(2,20,50,.5))' }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 'clamp(30px, 3.2vw, 46px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.01em', textShadow: '0 3px 14px rgba(2,20,50,.6)' }}>
              Luna's <span style={{ color: '#7fe3ff' }}>Writing Nook</span>
            </h1>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 6, color: 'rgba(255,255,255,.92)', textShadow: '0 2px 8px rgba(2,20,50,.6)' }}>Think it. Write it. Shine! <span style={{ color: '#ffd44d' }}>✦</span></div>
          </div>
          <div style={{ flex: 1 }} />
          {onBack && (
            <button onClick={onBack} style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,.96)', borderRadius: 12, padding: '11px 20px', fontWeight: 800, fontSize: 14, color: NAVY, boxShadow: CARD_SHADOW }}>
              ← Back to Previous Page
            </button>
          )}
        </div>

        <Journey modules={modules} currentId={current.id} />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 22, alignItems: 'start' }}>
          {/* ===== main column ===== */}
          <div>
            {/* mission card */}
            <White style={{ padding: '16px 22px 18px', marginBottom: 30, color: 'var(--ink)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '6px 24px', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'inline-block', background: NAVY, color: '#ffd44d', fontWeight: 800, fontSize: 12, letterSpacing: 1.4, padding: '5px 14px', borderRadius: 8, marginBottom: 10 }}>★ MISSION {String(currentIdx + 1).padStart(2, '0')}</span>
                <div style={{ fontSize: 'clamp(20px, 1.9vw, 27px)', fontWeight: 800, color: NAVY, lineHeight: 1.15 }}>Master the {current.label}</div>
                <div style={{ fontSize: 14.5, color: '#4a6f8c', fontWeight: 600, marginTop: 4 }}>{MISSION_BLURB[current.id]}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0a7dba', marginBottom: 6 }}>{done} of {acts.length} activities completed</div>
                  <div style={{ position: 'relative', height: 14, background: '#e6eef3', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct * 100}%`, background: 'linear-gradient(90deg,#02b2d5,#0a7dba)', borderRadius: 8 }} />
                    <span style={{ position: 'absolute', right: 6, top: 0, fontSize: 10.5, fontWeight: 800, lineHeight: '14px', color: '#4a6f8c' }}>{Math.round(pct * 100)}%</span>
                  </div>
                </div>
                <img src={BRAND.luna} alt="" style={{ height: 62 }} />
                <div style={{ position: 'relative', background: '#fff', border: '2px solid #bcd9ec', borderRadius: 14, padding: '8px 12px', fontSize: 13, fontWeight: 800, color: '#0a7dba', whiteSpace: 'nowrap' }}>
                  {left === 0 ? 'Mission complete!' : `${left === 1 ? 'One activity' : `${['', '', 'Two', 'Three', 'Four', 'Five', 'Six'][left] || left} activities`} left!`}
                  <span style={{ position: 'absolute', left: -9, top: '50%', width: 12, height: 12, background: '#fff', borderLeft: '2px solid #bcd9ec', borderBottom: '2px solid #bcd9ec', transform: 'translateY(-50%) rotate(45deg)' }} />
                </div>
              </div>
            </White>

            {/* activity path */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '48px 44px', padding: '6px 14px 0' }}>
              {acts.map((a, i) => (
                <div key={a.n} style={{ position: 'relative' }}>
                  {i % 3 !== 2 && i < acts.length - 1 && (
                    <div aria-hidden style={{ position: 'absolute', top: 58, right: -44, width: 44, borderTop: '3px dotted rgba(255,255,255,.7)', zIndex: 1 }} />
                  )}
                  {i === 2 && acts.length > 3 && (
                    <div aria-hidden style={{ position: 'absolute', left: '50%', bottom: -48, height: 48, borderLeft: '3px dotted rgba(255,255,255,.7)', zIndex: 1 }} />
                  )}
                  <ActivityCard a={a} />
                </div>
              ))}
            </div>
          </div>

          {/* ===== writer profile ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--ink)' }}>
            <White style={{ overflow: 'hidden' }}>
              <div style={{ background: `linear-gradient(120deg, ${NAVY}, #02384d)`, color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>⭐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.1 }}>My Writer Profile</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>A brighter writer is you! <span style={{ color: '#ffd44d' }}>✦</span></div>
                </div>
                <span style={{ fontSize: 18, opacity: .85 }}>⚙️</span>
              </div>

              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #e6eef3' }}>
                <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'radial-gradient(circle at 50% 40%, #bfe8ff, #7fd0f5 70%)', display: 'grid', placeItems: 'center', boxShadow: '0 0 0 3px #f5b400', flexShrink: 0 }}>
                  <img src={BRAND.luna} alt="" style={{ height: 48 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15.5, color: NAVY }}>Rising Writer · Level {level}</div>
                  <div style={{ height: 9, background: '#e6eef3', borderRadius: 6, margin: '7px 0 5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(6, levelPct * 100)}%`, background: 'linear-gradient(90deg,#02b2d5,#0a7dba)', borderRadius: 6 }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#5c7285', fontWeight: 600 }}>Keep going! You're making great progress!</div>
                </div>
              </div>

              <Stat icon="⭐" label="Stars Earned">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>{starsEarned} <span style={{ fontSize: 13, color: '#5c7285', fontWeight: 700 }}>/ {starsMax}</span></div>
                  <span style={{ fontSize: 15, letterSpacing: 1 }}>{[1, 2, 3, 4, 5, 6].map((i) => <span key={i} style={{ color: i <= Math.round(starsEarned / starsMax * 6) ? '#f5b400' : '#d7dfe6' }}>★</span>)}</span>
                </div>
              </Stat>

              <Stat icon="🔥" label="Current Streak">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>{streak} <span style={{ fontSize: 13, color: '#5c7285', fontWeight: 700 }}>days in a row!</span></div>
                  <span style={{ marginLeft: 'auto', fontSize: 22 }}>📅</span>
                </div>
              </Stat>

              <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid #e6eef3' }}>
                <ProgressRing pct={pct} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5c7285' }}>Module Progress</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.4, color: NAVY }}>{pct >= .5 ? "Great work! You're more than halfway there!" : 'Every activity gets you closer!'}</div>
                </div>
              </div>

              <div style={{ padding: '13px 16px', borderBottom: '1px solid #e6eef3' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#5c7285', marginBottom: 8 }}>Badges Earned</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {earned.map((id) => <ModuleBadge key={id} id={id} size={42} />)}
                  {['x1', 'x2'].map((k) => <span key={k} style={{ width: 42, height: 42, borderRadius: '50%', background: '#e2e8ee', display: 'grid', placeItems: 'center', color: '#b4c0cb', fontSize: 18 }}>★</span>)}
                </div>
              </div>

              <div style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 30, width: 40, textAlign: 'center' }}>🪙</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#5c7285' }}>ClassCade Coins</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: NAVY }}>{coins.toLocaleString()}</div>
                </div>
                <button title="Shop opens in ClassCade" style={{ background: '#fff', border: '1.5px solid #bcd9ec', borderRadius: 10, padding: '8px 12px', fontWeight: 800, fontSize: 12.5, color: '#0a7dba' }}>View Shop →</button>
              </div>
            </White>

            <White style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={BRAND.luna} alt="Luna" style={{ height: 64 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15.5, color: NAVY }}>You're doing amazing, writer!</div>
                <div style={{ fontSize: 12.5, color: '#5c7285', lineHeight: 1.4, fontWeight: 600 }}>Keep up the great work and finish strong! <span style={{ color: '#f5b400' }}>✦</span></div>
              </div>
            </White>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 34, fontSize: 14, fontStyle: 'italic', color: 'rgba(255,255,255,.8)', textShadow: '0 2px 8px rgba(2,20,50,.6)' }}>
          "Every great writer starts with a single idea." <span style={{ color: '#ffd44d' }}>✦</span>
        </div>
      </div>
    </div>
  )
}
