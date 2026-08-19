import React, { useEffect } from 'react'
import { BRAND } from '../lib/brand.js'
import { api } from '../lib/api.js'
import ModuleBadge from '../components/ModuleBadge.jsx'

/*
 * Luna's Writing Nook — activity-path view per brand mockup:
 * sky background, module header w/ activity count, numbered activity cards with
 * stars + status on a dashed path, and a "Your Progress" sidebar.
 */

const RACE_TILES = [['R', '#e668c9'], ['A', '#6db7f2'], ['C', '#7fd483'], ['E', '#f2b27e']]

// Module 1 activity path (prototype data — mirrors the live product's lessons).
const M1_ACTIVITIES = [
  { n: 1, title: 'Restate The Question', stars: 0, status: 'in_progress', art: '💬' },
  { n: 2, title: 'Answer The Question', stars: 3, status: 'passed', art: '💡' },
  { n: 3, title: 'Cite The Evidence', stars: 2, status: 'passed', art: '🔍' },
  { n: 4, title: 'Explain Your Thinking', stars: 3, status: 'passed', art: '🧠' },
  { n: 5, title: 'RACE', stars: 3, status: 'passed', art: 'RACE' },
  { n: 6, title: 'Module 1: Short Constructed Response Test', stars: 0, status: 'todo', art: '💻' },
]

function Stars({ n }) {
  return (
    <span style={{ fontSize: 17, letterSpacing: 2 }} aria-label={`${n} of 3 stars`}>
      {[1, 2, 3].map((i) => <span key={i} style={{ color: i <= n ? '#f5b400' : '#d7dfe6' }}>★</span>)}
    </span>
  )
}

function ActivityCard({ a }) {
  const passed = a.status === 'passed'
  const inProgress = a.status === 'in_progress'
  return (
    <div style={{ position: 'relative', background: '#fff', borderRadius: 16, boxShadow: '0 2px 10px rgba(2,56,77,.10)', padding: 10, width: 220, flexShrink: 0 }}>
      {/* number chip */}
      <span style={{ position: 'absolute', top: -11, left: -11, width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(140deg,#06aade,#0a7dba)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, boxShadow: '0 2px 6px rgba(2,56,77,.3)', zIndex: 2 }}>{a.n}</span>
      {passed && <span style={{ position: 'absolute', top: -10, right: -10, width: 27, height: 27, borderRadius: '50%', background: '#2e9e6b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 800, boxShadow: '0 2px 6px rgba(2,56,77,.25)', zIndex: 2 }}>✓</span>}

      {/* art block */}
      <div style={{ position: 'relative', height: 104, borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(135deg,#0d2f55 0%,#123a63 60%,#1b2f52 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <span style={{ position: 'absolute', top: 8, left: 12, color: 'rgba(255,255,255,.5)', fontSize: 10 }}>✦</span>
        <span style={{ position: 'absolute', bottom: 10, right: 14, color: '#f5b400', fontSize: 11 }}>✦</span>
        <span style={{ position: 'absolute', top: 14, right: 26, color: 'rgba(255,255,255,.35)', fontSize: 8 }}>✦</span>
        <img src={BRAND.luna} alt="" style={{ height: 62 }} />
        {a.art === 'RACE' ? (
          <span style={{ display: 'inline-flex', gap: 3 }}>
            {RACE_TILES.map(([l, c]) => (
              <span key={l} style={{ width: 22, height: 22, borderRadius: 5, background: c, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, transform: `rotate(${(l.charCodeAt(0) % 3 - 1) * 8}deg)` }}>{l}</span>
            ))}
          </span>
        ) : (
          <span style={{ fontSize: 34, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.4))' }}>{a.art}</span>
        )}
      </div>

      <div style={{ padding: '10px 6px 6px' }}>
        <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.25, minHeight: 36 }}>{a.title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0 10px' }}>
          <Stars n={a.stars} />
          {passed && <span className="pill green" style={{ fontSize: 11 }}>PASSED ✓</span>}
          {inProgress && <span className="pill" style={{ fontSize: 11, background: '#fdf1dc', color: '#b97e10' }}>IN PROGRESS</span>}
          {a.status === 'todo' && <span className="pill" style={{ fontSize: 11, background: '#eef3f6', color: 'var(--muted)' }}>UP NEXT</span>}
        </div>
        <button title="Activity opens in the full product" style={{ width: '100%', padding: '9px 0', borderRadius: 10, fontWeight: 800, fontSize: 13, color: '#fff', background: passed ? 'linear-gradient(120deg,#41b9e3,#06aade)' : 'linear-gradient(120deg,#06aade,#0a7dba)' }}>
          {passed ? '📊 View Summary' : '📖 Open Activity'}
        </button>
      </div>
    </div>
  )
}

function Dash() {
  return <div style={{ flex: 1, minWidth: 18, borderTop: '3px dashed #8fcbe8', alignSelf: 'center', margin: '0 2px', position: 'relative', top: -8 }} />
}

function ProgressRing({ pct }) {
  const R = 26, C = 2 * Math.PI * R
  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle cx="34" cy="34" r={R} fill="none" stroke="#e2eef5" strokeWidth="8" />
      <circle cx="34" cy="34" r={R} fill="none" stroke="#06aade" strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${C * pct} ${C}`} transform="rotate(-90 34 34)" />
      <text x="34" y="38" textAnchor="middle" fontSize="14" fontWeight="800" fill="#14344a">{Math.round(pct * 100)}%</text>
    </svg>
  )
}

function PathBar({ modules, currentId }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.78)', borderRadius: 16, padding: '12px 18px 14px', marginBottom: 20, boxShadow: '0 2px 10px rgba(2,56,77,.08)' }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, color: '#4a6f8c', marginBottom: 8 }}>YOUR WRITING PATH</div>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {modules.map((m, i) => {
          const locked = m.status === 'not_started'
          const cur = m.id === currentId
          const done = m.status === 'completed'
          return (
            <React.Fragment key={m.id}>
              {i > 0 && <div style={{ flex: '0 0 auto', width: 24, borderTop: '3px dashed #8fcbe8', marginTop: 26 }} />}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center',
                background: cur ? '#fff' : 'transparent', borderRadius: 12, padding: '8px 6px',
                boxShadow: cur ? '0 2px 8px rgba(2,56,77,.15)' : 'none', border: cur ? '1.5px solid #8fcbe8' : '1.5px solid transparent' }}>
                <div style={{ position: 'relative' }}>
                  <ModuleBadge id={m.id} size={40} dim={locked} />
                  {done && <span style={{ position: 'absolute', top: -4, right: -7, width: 17, height: 17, borderRadius: '50%', background: '#2e9e6b', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800 }}>✓</span>}
                  {locked && <span style={{ position: 'absolute', top: -4, right: -7, fontSize: 12 }}>🔒</span>}
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: .4, color: done ? 'var(--good)' : cur ? 'var(--link)' : '#7d93a6' }}>
                  {done ? 'COMPLETED' : cur ? 'IN PROGRESS' : 'LOCKED'}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.25, color: locked ? '#8aa0b2' : '#0d2f55' }}>
                  Module {i + 1}: {m.label}
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default function LunaPage({ state, onBack, onChange }) {
  const modules = state.modules
  const current = modules.find((m) => m.status === 'in_progress') || modules[0]
  const currentIdx = modules.indexOf(current)
  const acts = M1_ACTIVITIES
  const done = acts.filter((a) => a.status === 'passed').length
  const starsEarned = acts.reduce((s, a) => s + a.stars, 0)
  const starsMax = acts.length * 3
  const streak = state.growthSummary?.streakDays ?? 7

  return (
    <div style={{ margin: '-26px calc(50% - 50vw) -70px', padding: '26px 0 70px', minHeight: 'calc(100vh - 76px)',
      position: 'relative', overflow: 'hidden', boxSizing: 'border-box',
      background: 'linear-gradient(180deg,#bfe2f5 0%,#dbeefa 45%,#eaf6fd 100%)' }}>
      {/* sky decorations */}
      <span style={{ position: 'absolute', top: 30, left: '14%', color: '#fff', fontSize: 16 }}>✦</span>
      <span style={{ position: 'absolute', top: 90, left: '46%', color: '#f5c542', fontSize: 13 }}>✦</span>
      <span style={{ position: 'absolute', top: 46, right: '10%', color: '#fff', fontSize: 11 }}>✦</span>
      <span style={{ position: 'absolute', bottom: 140, left: '6%', color: '#f5c542', fontSize: 12 }}>✦</span>
      <div style={{ position: 'absolute', bottom: -60, left: -40, width: 300, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,.5)', filter: 'blur(6px)' }} />
      <div style={{ position: 'absolute', bottom: -80, right: -30, width: 380, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,.45)', filter: 'blur(8px)' }} />

      <div style={{ position: 'relative', maxWidth: 1780, margin: '0 auto', padding: '0 clamp(22px, 2.6vw, 56px)' }}>
        {/* page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: '#0d2f55' }}>Luna's Writing Nook</h1>
            <div style={{ fontSize: 15, color: '#4a6f8c', fontWeight: 600 }}>Think it. Write it. Shine! <span style={{ color: '#f5b400' }}>✦</span></div>
          </div>
          <img src={BRAND.luna} alt="Luna" style={{ height: 74, marginLeft: 8 }} />
          <div style={{ flex: 1 }} />
          {onBack && (
            <button onClick={onBack} style={{ background: '#fff', border: '1.5px solid #bcd9ec', borderRadius: 12, padding: '11px 20px', fontWeight: 800, fontSize: 14, color: '#0a5b76', boxShadow: '0 2px 8px rgba(2,56,77,.08)' }}>
              ← Back to Previous Page
            </button>
          )}
        </div>

        <PathBar modules={modules} currentId={current.id} />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20, alignItems: 'start' }}>
          {/* ===== main column ===== */}
          <div>
            {/* module header */}
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 10px rgba(2,56,77,.10)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
              <ModuleBadge id={current.id} size={52} />
              <b style={{ fontSize: 19, whiteSpace: 'nowrap' }}>Module {currentIdx + 1}: {current.label}</b>
              <span style={{ background: '#e2f2fb', color: '#0a7dba', fontWeight: 800, fontSize: 12.5, borderRadius: 999, padding: '6px 14px', whiteSpace: 'nowrap' }}>{done} of {acts.length} activities completed</span>
              <div style={{ flex: 1, height: 10, background: '#e6eef3', borderRadius: 6, minWidth: 80 }}>
                <div style={{ height: '100%', width: `${(done / acts.length) * 100}%`, background: 'linear-gradient(90deg,#02b2d5,#0a7dba)', borderRadius: 6 }} />
              </div>
              <span style={{ color: '#f5b400', fontSize: 18 }}>✦</span>
            </div>

            {/* activity path — row 1 */}
            <div style={{ display: 'flex', alignItems: 'stretch', marginBottom: 34, paddingLeft: 12 }}>
              {acts.slice(0, 4).map((a, i) => (
                <React.Fragment key={a.n}>
                  {i > 0 && <Dash />}
                  <ActivityCard a={a} />
                </React.Fragment>
              ))}
            </div>

            {/* activity path — row 2 */}
            <div style={{ display: 'flex', alignItems: 'stretch', paddingLeft: 12, justifyContent: 'center', gap: 0 }}>
              <div style={{ width: 120 }} />
              {acts.slice(4).map((a, i) => (
                <React.Fragment key={a.n}>
                  {i > 0 && <Dash />}
                  <ActivityCard a={a} />
                </React.Fragment>
              ))}
            </div>

          </div>

          {/* ===== progress sidebar ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 10px rgba(2,56,77,.10)', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(120deg,#0d2f55,#02384d)', color: '#fff', fontWeight: 800, fontSize: 15, padding: '11px 16px' }}>✨ Your Progress</div>

              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontSize: 32 }}>⭐</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}>Stars Earned</div>
                  <div style={{ fontSize: 21, fontWeight: 800 }}>{starsEarned} <span style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700 }}>/ {starsMax}</span></div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Keep shining! ✦</div>
                </div>
              </div>

              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontSize: 32 }}>🔥</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}>Current Streak</div>
                  <div style={{ fontSize: 21, fontWeight: 800 }}>{streak} <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>days in a row!</span></div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 22 }}>📅</span>
              </div>

              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--line)' }}>
                <ProgressRing pct={done / acts.length} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}>Module Progress</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.4 }}>Great work! You're more than halfway there!</div>
                </div>
              </div>

              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>Badges Earned</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <ModuleBadge id="m1" size={40} />
                  <ModuleBadge id="m5" size={40} />
                  <ModuleBadge id="m4" size={40} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', marginLeft: 4 }}>3 of 5 badges</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 10px rgba(2,56,77,.10)', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={BRAND.luna} alt="Luna" style={{ height: 58 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0d2f55' }}>You're doing amazing, writer!</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.4 }}>Keep up the great work and finish strong! <span style={{ color: '#f5b400' }}>✦</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
