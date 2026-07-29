import React, { useState, useMemo, useEffect } from 'react'
import { api, TRAIT_LABELS } from '../lib/api.js'
import { BRAND } from '../lib/brand.js'
import FluencyGame from './FluencyGame.jsx'
import ModuleBadge from '../components/ModuleBadge.jsx'
import { DataGoalsTab, ShareWallTab } from './GrowthPage.jsx'

const TODAY = new Date('2026-07-02T00:00:00')
const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
const daysTo = (d) => d ? Math.round((new Date(d + 'T00:00:00') - TODAY) / 86400000) : Infinity

function DueChip({ dueDate, status }) {
  if (status === 'completed') return <span className="pill green">✓ Turned in</span>
  const dt = daysTo(dueDate)
  if (dueDate == null) return <span style={{ fontSize: 13, color: 'var(--muted)' }}>No due date</span>
  const color = dt < 0 ? '#e5484d' : dt <= 2 ? '#e08a2b' : 'var(--muted)'
  const label = dt < 0 ? `Overdue` : dt === 0 ? 'Due today' : dt === 1 ? 'Due tomorrow' : `Due ${fmt(dueDate)}`
  return <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
}

const STATUS_CHIP = {
  in_progress: { c: '#e5f1fb', t: 'var(--ecr)' },
  not_started: { c: '#eef3f6', t: '#5c7285' },
  completed: { c: '#e6f6ee', t: 'var(--good)' },
}

function FormatBadge({ format }) {
  if (!format) return <span title="Self-started practice" style={{ fontSize: 11, fontWeight: 800, letterSpacing: .4, color: '#8a94a0', background: '#eef3f6', padding: '3px 9px', borderRadius: 7 }}>PRACTICE</span>
  const meta = format === 'ECR'
    ? { bg: 'var(--ecr)', full: 'Extended Constructed Response' }
    : { bg: 'var(--scr)', full: 'Short Constructed Response' }
  return <span title={meta.full} style={{ fontSize: 11, fontWeight: 800, letterSpacing: .4, color: '#fff', background: meta.bg, padding: '3px 9px', borderRadius: 7 }}>{format}</span>
}

function WayTile({ icon, title, sub, onClick, busy }) {
  return (
    <button onClick={onClick} disabled={busy}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, background: '#fff',
        border: '1px solid var(--line)', borderRadius: 14, padding: '16px 10px', cursor: busy ? 'wait' : 'pointer' }}>
      <span style={{ fontSize: 26 }}>{icon}</span>
      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>{title}</span>
      <span style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.35 }}>{sub}</span>
    </button>
  )
}

function LunaNook({ modules, onLuna }) {
  const current = modules.find((m) => m.status === 'in_progress') || modules[0]
  const idx = modules.indexOf(current)
  const BASE = import.meta.env.BASE_URL || '/'
  return (
    <div style={{ borderRadius: 20, background: '#0d2440', border: '2px solid rgba(9,26,52,.6)', overflow: 'hidden', boxShadow: '0 10px 26px rgba(20,15,70,.32)' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 18px',
        background: `linear-gradient(90deg, rgba(13,36,64,.94) 0%, rgba(13,36,64,.5) 42%, rgba(13,36,64,.15) 70%), url(${BASE}nook-header.jpg) right center / cover no-repeat` }}>
        <span style={{ width: 56, height: 56, borderRadius: '50%', padding: 2.5, flexShrink: 0, background: 'conic-gradient(from 200deg,#35c3e8,#a5e6ff,#35c3e8)', display: 'grid', placeItems: 'center' }}>
          <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0d2440', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            <img src={BRAND.luna} alt="Luna" style={{ height: 40 }} />
          </span>
        </span>
        <div>
          <b style={{ fontSize: 17, color: '#fff' }}>Luna's Writing Nook</b>
          <div style={{ fontSize: 12.5, color: '#a8dff5', fontWeight: 700 }}>Your writing path</div>
        </div>
      </div>
      <div style={{ background: '#fdfcf8', margin: '2px 14px 14px', borderRadius: 14, padding: '16px 20px' }}>
        <b style={{ fontSize: 15, color: '#1c1650' }}>Module {idx + 1}: {current.label}</b>
        <div style={{ fontSize: 12.5, color: CYAN_TEXT, fontWeight: 800, margin: '4px 0 8px' }}>4 of 6 activities completed</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 9, background: '#e8e6f2', borderRadius: 6 }}>
            <div style={{ height: '100%', width: `${current.progress * 100}%`, background: 'linear-gradient(90deg,#35c3e8,#1479b8)', borderRadius: 6 }} />
          </div>
          <b style={{ fontSize: 13, color: CYAN_TEXT }}>{Math.round(current.progress * 100)}%</b>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {modules.map((m) => (
            <span key={m.id} title={m.label} style={{ opacity: m.status === 'not_started' ? .4 : 1 }}>
              <ModuleBadge id={m.id} size={30} dim={m.status === 'not_started'} />
            </span>
          ))}
          <span style={{ flex: 1 }} />
          <button onClick={onLuna} style={{ background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 58%,#0e2748 100%)', color: '#fff', fontWeight: 800, fontSize: 13.5, borderRadius: 999, padding: '10px 26px', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.28), 0 5px 14px rgba(53,195,232,.45)', cursor: 'pointer' }}>
            Go to my path →
          </button>
        </div>
      </div>
    </div>
  )
}

// Average-score-over-time line (single series, direct-labeled per point).
function ScoreLine({ points }) {
  const W = 320, H = 128, PX = 26, PT = 26, PB = 24
  const lo = Math.min(...points.map((p) => p.pct)) - 6
  const hi = Math.max(...points.map((p) => p.pct)) + 6
  const x = (i) => PX + (i * (W - 2 * PX)) / (points.length - 1)
  const y = (v) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB)
  const line = points.map((p, i) => `${x(i)},${y(p.pct)}`).join(' ')
  const area = `${x(0)},${H - PB} ${line} ${x(points.length - 1)},${H - PB}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 360, display: 'block' }} role="img" aria-label="Average writing score over time">
      <defs>
        <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06aade" stopOpacity=".22" />
          <stop offset="100%" stopColor="#06aade" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#scoreFill)" />
      <polyline points={line} fill="none" stroke="#06aade" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.pct)} r="4" fill="#fff" stroke="#06aade" strokeWidth="2.5">
            <title>{`${p.label}: ${p.pct}%`}</title>
          </circle>
          <text x={x(i)} y={y(p.pct) - 9} textAnchor="middle" fontSize="11" fontWeight="700" fill="#14344a">{p.pct}%</text>
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#5c7285">{p.label}</text>
        </g>
      ))}
    </svg>
  )
}

function GrowthSummaryCard({ gs, onGrowth }) {
  const away = Math.max(0, gs.goalPercent - gs.currentAverage)
  const stats = [
    { k: 'Current Average', v: `${gs.currentAverage}% ↗`, sub: `↑ ${gs.weeklyDelta}% this week`, c: 'var(--good)' },
    { k: 'Writing Streak', v: `${gs.streakDays} days 🔥`, sub: 'Keep it up!', c: 'var(--muted)' },
    { k: 'Badges Earned', v: `${gs.badges} 🏅`, sub: 'See all badges', c: 'var(--muted)' },
  ]
  return (
    <div className="card" style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.2fr 0.9fr', gap: 24, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 800 }}>My Data 📊</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: '6px 0 12px' }}>Your averages at a glance — dig deeper in Data & Goals.</p>
        <button className="btn" style={{ padding: '8px 18px' }} onClick={onGrowth}>See full data →</button>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>Average Score Over Time</div>
        <ScoreLine points={gs.scoreOverTime} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800 }}>Goal Progress</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 0 6px' }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Goal: {gs.goalPercent}%</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)' }}>{gs.currentAverage}%</span>
        </div>
        <div style={{ height: 12, background: '#e6eef3', borderRadius: 7 }}>
          <div style={{ height: '100%', width: `${(gs.currentAverage / gs.goalPercent) * 100}%`, background: 'linear-gradient(90deg,var(--cyan-bright),var(--teal))', borderRadius: 7 }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          You're <b style={{ color: 'var(--cyan-bright)' }}>{away}%</b> away from your goal!
        </div>
      </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 16 }}>
        {stats.map((t) => (
          <div key={t.k}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{t.k}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--teal)' }}>{t.v}</div>
            <div style={{ fontSize: 10.5, color: t.c, fontWeight: 600 }}>{t.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Home tab: one featured assignment ---- */
function UpNextCard({ row, busy, begin, onAll }) {
  if (!row) return null
  const s = STATUS_CHIP[row.status]
  return (
    <div style={{ position: 'relative', background: '#fff', border: '2.5px solid #0a7dba', borderRadius: 18, boxShadow: '0 8px 24px rgba(6,170,222,.16)', padding: '24px 22px 14px' }}>
      <span style={{ position: 'absolute', top: -14, left: 18, background: 'linear-gradient(120deg,#f5b400,#e89a00)', color: '#3d2c00', fontSize: 11.5, fontWeight: 800, letterSpacing: .6, padding: '5px 15px', borderRadius: 999, boxShadow: '0 2px 8px rgba(180,120,0,.35)' }}>
        ⭐ UP NEXT FOR YOU
      </span>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ transform: 'scale(1.2)', transformOrigin: 'left center' }}><FormatBadge format={row.a.format} /></span>
            <span style={{ fontWeight: 800, fontSize: 23, color: '#0d2f55' }}>{row.a.title}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <span className="pill" style={{ background: s.c, color: s.t }}>{row.a.type}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{row.a.teacher.name}</span>
            <DueChip dueDate={row.a.dueDate} status={row.status} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 9 }}>
          <button className="btn" disabled={busy} onClick={() => begin(row)} style={{ padding: '13px 30px', fontSize: 15.5 }}>
            {row.status === 'in_progress' ? 'Continue →' : 'Begin ▶'}
          </button>
          <button onClick={onAll} style={{ color: 'var(--link)', fontSize: 13, fontWeight: 800 }}>See all assignments →</button>
        </div>
      </div>
    </div>
  )
}

/* ---- Assignments tab: active goal banner ---- */
function GoalBanner({ me, onData }) {
  return (
    <div className="card" style={{ padding: '14px 20px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(120deg,#eef6f9,#fff)' }}>
      <span style={{ fontSize: 28 }}>🎯</span>
      {me.goal ? (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow">My active goal</div>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>{me.goal.text}</div>
            {me.goal.trait && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Trait: {TRAIT_LABELS[me.goal.trait]} · your coach keeps this in mind when you confer</div>}
          </div>
          <button className="btn ghost" style={{ padding: '7px 16px', whiteSpace: 'nowrap' }} onClick={onData}>Manage goal →</button>
        </>
      ) : (
        <>
          <div style={{ flex: 1 }}>
            <div className="eyebrow">No goal set</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Pick one thing to focus on — it shapes your coaching.</div>
          </div>
          <button className="btn" onClick={onData}>Set a goal →</button>
        </>
      )}
    </div>
  )
}

/* ---- Daily Writing Path: the Writing Launchpad (mission control) ---- */
const STEP_META = {
  assignments: { icon: '📄', label: "Today's Assignment", accent: 'Show What You Know', badge: '💻', art: 'head-assignment.jpg',
    desc: 'Work on the writing your teacher assigned — draft, revise, or polish.', ctaWord: 'Start Assignment', illus: ['📄', '✨'] },
  quickwrite: { icon: '⚡', label: 'Quick Write', accent: 'Spark a Response', badge: '⚡', art: 'head-quickwrite.jpg',
    desc: "Write a short response to today's question using clear ideas.", ctaWord: 'Start Writing', illus: ['📓', '🖊️'] },
  luna: { icon: '🌟', label: "Luna's Writing Nook", accent: 'Level Up Your Skills', badge: '🌟', art: 'head-luna.jpg',
    desc: 'Complete one activity in your current module.', ctaWord: "Open Luna's Nook", illus: ['🌟', '📚'] },
  revision: { icon: '✏️', label: 'Daily Revision Challenge', accent: 'Make It Shine', badge: '✏️', art: 'head-revision.jpg',
    desc: 'Improve one short piece of writing by fixing and strengthening sentences.', ctaWord: 'Take the Challenge', illus: ['✏️', '✨'] },
  freewrite: { icon: '🕊️', label: 'Free Write', accent: 'Follow Your Idea', badge: '✍️', art: 'head-freewrite.jpg',
    desc: 'Write about anything you choose. Start with a prompt or your own topic.', ctaWord: 'Start a New Free Write', illus: ['📖', '🌙'] },
  games: { icon: '🎯', label: 'Fluency Games', accent: 'Build Your Flow', badge: '🎮', art: 'head-games.jpg',
    desc: 'Play short games that help you write complete sentences quickly and smoothly.', ctaWord: 'Play', illus: ['🎮', '⭐'] },
  bank: { icon: '🗂️', label: 'Writing Bank', accent: 'Revise & Publish', badge: '🗂️',
    desc: 'Every piece you have started — revise it, publish it, or share it to the wall.', ctaWord: 'Open the Bank', illus: ['🗂️', '⭐'] },
  goal_data: { icon: '🎯', label: 'My Writing Goals', accent: 'Choose Your Next Focus', badge: '⭐', art: 'head-goals.jpg',
    desc: 'Check the skill you are working on and see your progress.', ctaWord: 'View My Goal', illus: ['⭐', '📈'] },
}
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MISSION_COLORS = ['#8b5cf6', '#2f8ceb', '#0b8a8f']

const MISSION_GRADS = [['#8b5cf6', '#6d3fd8'], ['#2f8ceb', '#1668c4'], ['#0b8a8f', '#067276']]

function WritingLaunchpad({ state, me, wp, busy, upNext, onMission, onHow, onStuck, onQuickWrite, onFreeWrite, onGames, onBank, nudge }) {
  const firstName = (me.name || '').split(' ')[0]
  const day = DAY_NAMES[wp?.day ?? new Date().getDay()]
  const quest = !!(wp?.steps && !wp.completed)
  const weekend = !wp?.steps
  const curIdx = quest ? wp.done.findIndex((d) => !d) : -1
  const doneCount = wp?.steps ? wp.done.filter(Boolean).length : 0

  // featured content per card — one engaging element, minimal text
  const qp = state.quickPrompts?.length ? state.quickPrompts[Math.floor(Date.now() / 86400000) % state.quickPrompts.length] : null
  const mod = state.modules?.find((m) => m.status === 'in_progress') || state.modules?.[0]
  const lastFree = (state.submissions || []).filter((x) => x.studentId === me.id && state.assignments.find((a) => a.id === x.assignmentId)?.genre === 'free').slice(-1)[0]
  const lastFreeTitle = lastFree ? state.assignments.find((a) => a.id === lastFree.assignmentId)?.title : null
  const fmtName = (f) => (f === 'ECR' ? 'Extended Constructed Response' : f === 'SCR' ? 'Short Constructed Response' : f)
  const bankCount = (state.submissions || []).filter((x) => x.studentId === me.id && ['free', 'quick'].includes(state.assignments.find((a) => a.id === x.assignmentId)?.genre)).length
  const featureFor = (t, gamesPlayed) => ({
    bank: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: CYAN_TEXT }}>🗂️ {bankCount} piece{bankCount === 1 ? '' : 's'} in your bank</div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#41586b', marginTop: 7 }}>Publish your best to the Writing Wall 🌟</div>
      </div>
    ),
    quickwrite: (
      <div style={{ textAlign: 'left' }}>
        <span style={{ display: 'inline-block', background: 'linear-gradient(120deg,#e0a51c,#c98a08)', color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 1.2, borderRadius: '8px 8px 0 0', padding: '4px 12px' }}>💬 TODAY'S PROMPT</span>
        <div style={{ background: '#e9f5fb', border: '1.5px solid rgba(53,195,232,.4)', borderRadius: '0 12px 12px 12px', padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 30, lineHeight: .9, color: CYAN_TEXT }}>“</span>
          <b style={{ fontSize: 14.5, color: '#241d5e', lineHeight: 1.35 }}>{qp ? qp.title : 'A fresh prompt each day'}</b>
        </div>
      </div>
    ),
    assignments: upNext ? (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.3, color: CYAN_TEXT, textTransform: 'uppercase' }}>{fmtName(upNext.a.format || 'SCR')}</div>
        <div style={{ fontSize: 16.5, fontWeight: 800, color: '#1c1650', lineHeight: 1.3, marginTop: 6 }}>{upNext.a.title}</div>
      </div>
    ) : (
      <div style={{ fontSize: 14, fontWeight: 700, color: '#41586b', textAlign: 'center' }}>Pick any assignment to begin</div>
    ),
    luna: (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(state.modules || []).map((m, mi) => {
            const done = m.status === 'complete'
            const cur = m.status === 'in_progress'
            return (
              <React.Fragment key={m.id}>
                {mi > 0 && <span style={{ flex: 1, borderTop: '2px dashed #bcd8e8', margin: '0 3px', minWidth: 7 }} />}
                <span title={m.label} style={{ width: cur ? 34 : 23, height: cur ? 34 : 23, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: cur ? 15 : 10, flexShrink: 0,
                  background: done ? CARD_PURPLE : cur ? 'linear-gradient(135deg,#f5c542,#e89a00)' : '#e3eef5',
                  color: done || cur ? '#fff' : '#9fbfd6',
                  boxShadow: cur ? '0 0 12px rgba(245,180,0,.55)' : 'none', border: cur ? '2px solid #fff' : 'none' }}>
                  {done ? '✓' : cur ? '🌟' : '★'}
                </span>
              </React.Fragment>
            )
          })}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: CYAN_TEXT, textAlign: 'center', marginTop: 9 }}>
          {mod ? `You're on Module ${state.modules.indexOf(mod) + 1}: ${mod.label}` : 'Your writing path'}
        </div>
      </div>
    ),
    revision: (
      <div style={{ fontSize: 14, fontWeight: 800, color: CYAN_TEXT, textAlign: 'center' }}>✨ One challenge — make it shine</div>
    ),
    freewrite: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#41586b' }}>Where will your idea go today?</div>
        {lastFreeTitle && <div style={{ fontSize: 12.5, fontWeight: 800, color: CYAN_TEXT, marginTop: 7 }}>📄 Last piece: {lastFreeTitle}</div>}
      </div>
    ),
    games: (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: '#0d5f66' }}>🎮 Play Two to Move Forward</div>
        {gamesPlayed != null && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10 }}>
            {[0, 1].map((i) => (
              <span key={i} style={{ width: 21, height: 21, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: '#fff',
                background: i < gamesPlayed ? 'var(--good)' : '#e3eef5', border: i < gamesPlayed ? 'none' : '2px dashed #9fbfd6' }}>{i < gamesPlayed ? '✓' : ''}</span>
            ))}
          </div>
        )}
      </div>
    ),
    goal_data: (
      <div style={{ textAlign: 'left', background: '#e9f5fb', borderRadius: 12, padding: '10px 14px' }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.3, color: CYAN_TEXT }}>🎯 CURRENT GOAL</div>
        <b style={{ fontSize: 13.5, color: '#241d5e', lineHeight: 1.35, display: 'block', marginTop: 4 }}>{me.goal ? me.goal.text : 'No goal set — pick one!'}</b>
      </div>
    ),
  })[t]

  const freeTiles = [
    { icon: '⚡', title: 'Quick Write', sub: 'A timed prompt to warm up', onClick: onQuickWrite },
    { icon: '🕊️', title: 'Free Write', sub: 'Write anything, no rules', onClick: onFreeWrite },
    { icon: '🎯', title: 'Fluency Games', sub: 'A library of games to play', onClick: onGames },
  ]

  return (
    <div className="card" style={{ padding: '16px 18px 12px' }}>

      {/* quiet heading — the cards carry the design; starfield glows behind the box */}
      <div style={{ position: 'relative' }}>
        <div style={{ padding: '6px 4px 22px', display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: '#c99312', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9 }}>✦</span>{quest ? `Today · ${day}` : weekend ? `${day} · Open Studio` : `Today · ${day} · Complete`}<span style={{ fontSize: 9 }}>✦</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#10294a', margin: '2px 0 0' }}>{quest ? 'Launch Sequence' : 'Mission Control'}</div>
          </div>
          <div style={{ paddingBottom: 6 }}>
            <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700 }}>
              {quest ? 'Complete 3 missions to power up your day!' : weekend ? 'No missions — pick anything and fly.' : 'All 3 missions complete. Mission Control is yours!'}
            </div>
            {quest && (
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#16386b', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11 }}>{wp.stuck ? '🔓' : '🔒'}</span>
                {wp.stuck ? 'Missions unlocked — finish all 3 in any order.' : 'Finish each mission to unlock the next.'}
              </div>
            )}
          </div>
        </div>
        {quest ? (
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28, padding: 0, marginTop: 0, alignItems: 'stretch' }}>
            {wp.steps.map((t, i) => {
              const done = wp.done[i]
              const current = i === curIdx || (wp.stuck && !done)
              return (
                <TaskCard key={t} meta={STEP_META[t]} feature={featureFor(t, Math.min(wp.gamesPlayed, 2))} number={i + 1}
                  status={done ? 'done' : current ? 'current' : 'future'}
                  note={wp.stuck && wp.stuckStep === t && !done ? '😵 Flagged stuck — help is on the way' : null}
                  onStuckLink={!wp.stuck && i === curIdx && wp.done.filter((d) => !d).length > 1 ? onStuck : null}
                  ctaLabel={STEP_META[t].ctaWord} onAction={() => onMission(i)} busy={busy} big />
              )
            })}
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, padding: 0, marginTop: 0, alignItems: 'stretch' }}>
            <TaskCard meta={STEP_META.quickwrite} feature={featureFor('quickwrite', null)} status="free" ctaLabel="Start Writing" onAction={onQuickWrite} busy={busy} />
            <TaskCard meta={STEP_META.freewrite} feature={featureFor('freewrite', null)} status="free" ctaLabel="Start a Free Write" onAction={onFreeWrite} busy={busy} />
            <TaskCard meta={STEP_META.games} feature={featureFor('games', null)} status="free" ctaLabel="Play" onAction={onGames} busy={busy} />
            <TaskCard meta={STEP_META.bank} feature={featureFor('bank', null)} status="free" ctaLabel="Open the Bank" onAction={onBank} busy={busy} />
          </div>
        )}
      </div>

      {/* reward track — every milestone shows its payoff */}
      {wp?.steps ? (
        <div style={{ background: '#f4f8fb', borderRadius: 13, padding: '13px 20px', margin: '16px 0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(140deg,#f5c542,#e89a00)', display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>⭐</span>
            <b style={{ fontSize: 13.5 }}>{doneCount} of 3 missions completed</b>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#8a6400', background: '#fdf1d2', borderRadius: 999, padding: '5px 14px' }}>
              🪙 {doneCount * 10 + (wp.completed ? 25 : 0)} of 55 coins banked today
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 12 }}>
            {[0, 1, 2].map((i) => {
              const done = wp.done[i]
              const isNext = !done && i === wp.done.findIndex((d) => !d)
              return (
                <React.Fragment key={i}>
                  {i > 0 && <div style={{ flex: 1, height: 4, borderRadius: 3, marginTop: 11, background: wp.done[i - 1] ? 'linear-gradient(90deg,#f5c542,#e89a00)' : '#dbe5ee' }} />}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 120 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 800,
                      background: done ? 'linear-gradient(140deg,#f5c542,#e89a00)' : '#fff', color: done ? '#fff' : '#8fa5b8',
                      border: done ? 'none' : isNext ? '2px solid #f0b429' : '2px dashed #c3d3e0',
                      boxShadow: done ? '0 0 10px rgba(245,180,0,.55)' : 'none' }}>
                      {done ? '✓' : i + 1}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 800, borderRadius: 999, padding: '3px 11px', whiteSpace: 'nowrap',
                      background: done ? '#fdf1d2' : '#eef3f6', color: done ? '#8a6400' : '#7d94a6' }}>
                      🪙 +10{done ? ' ✓' : ''}
                    </span>
                    {i === 1 && (
                      <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 999, padding: '3px 11px', whiteSpace: 'nowrap',
                        background: doneCount >= 2 ? '#e6f6ee' : '#eef3f6', color: doneCount >= 2 ? 'var(--good)' : '#7d94a6' }}>
                        🤖 {doneCount >= 2 ? 'Challenge unlocked!' : 'Unlocks the 100-coin Challenge'}
                      </span>
                    )}
                    {i === 2 && (
                      <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 999, padding: '3px 11px', whiteSpace: 'nowrap',
                        background: wp.completed ? '#e6f6ee' : '#eef3f6', color: wp.completed ? 'var(--good)' : '#7d94a6' }}>
                        🏆 +25 bonus · Mission Control
                      </span>
                    )}
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      ) : null}

    </div>
  )
}

function HowItWorksModal({ onClose }) {
  const rows = [
    ['🗓️', 'Every school day has a 3-mission writing path — a different mix each day.'],
    ['1️⃣', 'Do the missions in order. The colored button shows your current mission.'],
    ['🎯', 'On Fluency Game days, play 2 games and the mission checks itself off.'],
    ['🤖', "Nova's Daily Revision Challenge is a bonus — it unlocks after your first 2 missions and pays 100 coins."],
    ['🎁', 'Finish all 3: +25 coins, your streak grows, and Mission Control unlocks for free choice.'],
    ['🏖️', 'Weekends are open flight — no path, Mission Control is unlocked all day.'],
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 70 }} onClick={onClose}>
      <div className="card" style={{ padding: 26, width: 460, maxWidth: '94vw' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>🚀</span><b style={{ fontSize: 17 }}>How the Writing Launchpad works</b>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(([icon, text], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.45 }}>
              <span style={{ fontSize: 16 }}>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
        <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={onClose}>Got it!</button>
      </div>
    </div>
  )
}

/* ---- celebration when the final stop lands (trophy mockup) ---- */
function PathCelebration({ wp, streak, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,9,38,.78)', display: 'grid', placeItems: 'center', zIndex: 70 }}>
      <div style={{ position: 'relative', width: 620, maxWidth: '94vw', background: '#f4f9fc', borderRadius: 28,
        border: '2px solid #57c8ec', boxShadow: '0 0 60px rgba(53,195,232,.35), 0 24px 60px rgba(0,0,0,.5)',
        padding: '38px 44px 34px', textAlign: 'center', animation: 'popIn .35s ease' }}>
        <span style={{ position: 'absolute', top: 26, left: 34, color: '#6fcdf0', fontSize: 20 }}>✦</span>
        <span style={{ position: 'absolute', top: 44, left: 58, color: '#e2c96a', fontSize: 11 }}>✦</span>
        <span style={{ position: 'absolute', top: 30, right: 38, color: '#6fcdf0', fontSize: 16 }}>✦</span>
        <span style={{ position: 'absolute', top: 52, right: 62, color: '#a8dff5', fontSize: 10 }}>✦</span>
        <span style={{ position: 'absolute', bottom: 34, left: 40, color: '#a8dff5', fontSize: 13 }}>✦</span>
        <span style={{ position: 'absolute', bottom: 46, right: 44, color: '#6fcdf0', fontSize: 12 }}>✦</span>

        <img src={BRAND.trophy} alt="" style={{ width: 230, mixBlendMode: 'multiply', WebkitMaskImage: 'radial-gradient(ellipse 62% 58% at 50% 50%, #000 52%, transparent 76%)', maskImage: 'radial-gradient(ellipse 62% 58% at 50% 50%, #000 52%, transparent 76%)' }} />

        <h2 style={{ margin: '10px 0 8px', fontSize: 36, fontWeight: 800, color: '#151238', letterSpacing: -.5 }}>Sequence Complete</h2>
        <p style={{ color: '#43406e', margin: '0 0 22px', fontSize: 16.5, fontWeight: 600 }}>
          You did the writer's work today — <b style={{ color: CYAN_TEXT }}>Mission Control</b> is <b style={{ color: CYAN_TEXT }}>unlocked</b>.
        </p>

        {/* stat chips */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid #ead9a0', borderRadius: 999, padding: '10px 20px', fontSize: 14.5, fontWeight: 800, color: '#8a6400', boxShadow: '0 3px 10px rgba(190,150,30,.12)' }}>
            🪙 Coins Earned <span style={{ background: '#fdf1d2', borderRadius: 999, padding: '2px 10px' }}>+25</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid #f2c9b0', borderRadius: 999, padding: '10px 20px', fontSize: 14.5, fontWeight: 800, color: '#c2571f', boxShadow: '0 3px 10px rgba(194,87,31,.12)' }}>
            🔥 Streak <span style={{ background: '#fdeee3', borderRadius: 999, padding: '2px 10px' }}>{streak} days</span>
          </span>
        </div>

        <button onClick={onClose}
          style={{ width: '100%', padding: '16px 0', borderRadius: 14, fontSize: 16.5, fontWeight: 800, letterSpacing: .3, color: '#fff',
            background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 58%,#0e2748 100%)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.28), 0 8px 24px rgba(53,195,232,.5)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          🚀 Take me to Mission Control <span>→</span>
        </button>
      </div>
    </div>
  )
}

/* ---- I'm Stuck: open the studio, notify the teacher, coach self-advocacy ---- */
function StuckModal({ teacher, stepLabel, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,9,38,.72)', display: 'grid', placeItems: 'center', zIndex: 70 }}>
      <div style={{ width: 560, maxWidth: '94vw', background: '#fff', borderRadius: 24, padding: '30px 34px', animation: 'popIn .3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <span style={{ width: 52, height: 52, borderRadius: '50%', background: '#fdf1dc', display: 'grid', placeItems: 'center', fontSize: 26, flexShrink: 0 }}>😵</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Stuck? That happens to every writer.</h2>
            <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>Here's what just happened:</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: '#e6f6ee', borderRadius: 12, padding: '11px 14px' }}>
            <span style={{ fontSize: 18 }}>🔓</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5 }}><b>Your other two missions just opened up.</b> Jump into either one — sometimes starting something different shakes an idea loose.</span>
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: '#e5f1fb', borderRadius: 12, padding: '11px 14px' }}>
            <span style={{ fontSize: 18 }}>📨</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5 }}><b>{teacher} has been notified</b> that you're stuck{stepLabel ? <> on <b>{stepLabel}</b></> : null}, so help is on the way.</span>
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: '#e9f5fb', borderRadius: 12, padding: '11px 14px' }}>
            <span style={{ fontSize: 18 }}>🗣️</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>
              <b>Advocate for yourself, too.</b> If {teacher} isn't at their computer, it's always okay to ask for help in a respectful way — try:
              <i style={{ display: 'block', marginTop: 5, color: '#0f97c2' }}>"Excuse me — I'm stuck on my writing. Could you help me when you have a minute?"</i>
            </span>
          </div>
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', background: '#fdf1dc', borderRadius: 12, padding: '11px 14px' }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5 }}><b>All 3 missions still count.</b> Come back to the one you're stuck on when help arrives or a fresh idea strikes.</span>
          </div>
        </div>
        <button onClick={onClose}
          style={{ width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 15.5, fontWeight: 800, color: '#fff', background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 58%,#0e2748 100%)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.28), 0 6px 18px rgba(53,195,232,.5)', cursor: 'pointer' }}>
          Got it — show me my open missions →
        </button>
      </div>
    </div>
  )
}

/* ---- slim ribbons for the unlocked dashboard ---- */
function PathRibbon({ wp, onResume }) {
  const day = DAY_NAMES[wp?.day ?? new Date().getDay()]
  if (!wp) return null
  if (!wp.steps) return null
  return (
    <div style={{ borderRadius: 16, background: 'linear-gradient(115deg,#1e8a5c,#2e9e6b)', color: '#fff', padding: '11px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, boxShadow: '0 4px 16px rgba(46,158,107,.3)' }}>
      <span style={{ fontSize: 22 }}>🎉</span>
      <b style={{ fontSize: 14.5 }}>{day}'s path complete — Mission Control is open. Write, play, revise, share!</b>
    </div>
  )
}

/* ---- demo-only: scrub through the week ---- */
function DemoWeekStrip({ wp, onPick }) {
  const realDow = new Date().getDay()
  const effective = wp?.day ?? realDow
  const days = [[1, 'Monday'], [2, 'Tuesday'], [3, 'Wednesday'], [4, 'Thursday'], [5, 'Friday'], [0, '🏖️ Weekend']]
  return (
    <div style={{ marginTop: 26, border: '2px dashed #c3d5e4', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: 'rgba(255,255,255,.85)', position: 'relative', zIndex: 1 }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' }}>🎛️ Demo · preview the week</span>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
        {days.map(([d, label]) => (
          <button key={d} onClick={() => onPick(d)}
            style={{ padding: '7px 15px', borderRadius: 999, fontSize: 12.5, fontWeight: 800,
              background: effective === d ? '#0d2f55' : '#fff', color: effective === d ? '#fff' : 'var(--teal)',
              border: '1.5px solid ' + (effective === d ? '#0d2f55' : 'var(--line)') }}>
            {label}
          </button>
        ))}
      </div>
      <button onClick={() => onPick(null)} title="Back to the real day"
        style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', padding: '7px 10px' }}>↩ Real today</button>
    </div>
  )
}

/* ---- unified task card: illustration, badge, plain title + accent, desc, details, CTA ---- */
let lastSeenMissions = { key: null, n: 0 } // survives route changes so the payoff toast fires after returning home

const CARD_PURPLE = '#16386b' // deep LoneStar navy
const CYAN = '#35c3e8' // bright logo-script blue
const CYAN_TEXT = '#0f97c2' // cyan dark enough for text on white
function TaskCard({ meta, feature, number, status, note, ctaLabel, onAction, onStuckLink, busy, big }) {
  const done = status === 'done'
  const current = status === 'current' || status === 'free'
  const future = status === 'future'
  return (
    <div style={{ position: 'relative', background: '#fff', borderRadius: 20, display: 'flex', flexDirection: 'column',
      border: done ? '2px solid #7ccfa4' : current && status !== 'free' ? '2.5px solid #f0b429' : '2px solid #2b2361',
      boxShadow: current && status !== 'free' ? '0 12px 32px rgba(240,180,41,.4), 0 0 0 5px rgba(245,197,66,.22)' : '0 8px 20px rgba(30,25,80,.14)',
      filter: future ? 'saturate(.5) opacity(.75)' : 'none', overflow: 'visible' }}>
      {current && !done && status !== 'free' && (
        <>
          <span style={{ position: 'absolute', top: -10, right: 14, color: '#f5c542', fontSize: 16, zIndex: 3, textShadow: '0 0 8px rgba(245,197,66,.8)' }}>✦</span>
          <span style={{ position: 'absolute', bottom: 26, left: -9, color: '#f5c542', fontSize: 11, zIndex: 3, textShadow: '0 0 6px rgba(245,197,66,.8)' }}>✦</span>
        </>
      )}
      {number != null && (
        <span style={{ position: 'absolute', top: -14, left: -14, width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', zIndex: 3,
          background: done ? 'var(--good)' : current ? 'linear-gradient(135deg,#f5c542,#e89a00)' : CARD_PURPLE, color: '#fff', fontWeight: 800, fontSize: 17, border: '3px solid #fff',
          boxShadow: current && !done ? '0 4px 14px rgba(232,154,0,.6)' : '0 4px 12px rgba(30,25,80,.35)' }}>
          {done ? '✓' : number}
        </span>
      )}
      {/* illustration zone */}
      <div style={{ position: 'relative', height: big ? 158 : 108, borderRadius: '17px 17px 0 0', overflow: 'hidden',
        background: meta.art
          ? `url(${import.meta.env.BASE_URL || '/'}${meta.art}) center 32% / cover no-repeat`
          : 'radial-gradient(ellipse at 75% 20%, rgba(120,90,220,.55) 0%, transparent 55%), linear-gradient(160deg,#251c52,#3d2f80)' }}>
        {!meta.art && <>
        <span style={{ position: 'absolute', top: 12, left: '14%', color: '#f5d97a', fontSize: 11 }}>✦</span>
        <span style={{ position: 'absolute', top: 30, right: '16%', color: 'rgba(255,255,255,.75)', fontSize: 8 }}>✦</span>
        <span style={{ position: 'absolute', bottom: 26, left: '24%', color: 'rgba(255,255,255,.5)', fontSize: 7 }}>✦</span>
        <span style={{ position: 'absolute', top: 16, right: '38%', color: '#f5d97a', fontSize: 8 }}>✦</span>
        <span style={{ position: 'absolute', left: '50%', top: '44%', transform: 'translate(-50%,-50%) rotate(-6deg)', fontSize: 44, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.45))' }}>{meta.illus[0]}</span>
        <span style={{ position: 'absolute', left: '64%', top: '58%', fontSize: 22, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.4))' }}>{meta.illus[1]}</span>
        </>}
      </div>
      {/* circular badge bridging the zones */}
      <span style={{ alignSelf: 'center', marginTop: -26, width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', zIndex: 2,
        background: done ? 'var(--good)' : CARD_PURPLE, border: current && !done && status !== 'free' ? '4px solid #f5c542' : '4px solid #fff', fontSize: 22,
        boxShadow: current && !done && status !== 'free' ? '0 0 16px rgba(245,197,66,.65)' : '0 4px 12px rgba(30,25,80,.3)' }}>
        {done ? '✓' : meta.badge}
      </span>
      {/* content */}
      <div style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: big ? 17.5 : 15.5, letterSpacing: .4, textTransform: 'uppercase', color: '#1c1650', lineHeight: 1.2 }}>{meta.label}</div>
        <div style={{ fontSize: 13, color: CYAN_TEXT, fontWeight: 800, marginTop: 3 }}>{meta.accent}</div>
        <p style={{ fontSize: big ? 13.5 : 12.5, color: '#41586b', lineHeight: 1.5, margin: '9px 0 0', fontWeight: 600 }}>{meta.desc}</p>
        <div style={{ borderTop: '1px solid var(--line)', margin: '11px 0 10px' }} />
        {/* featured content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2px 0' }}>
          {feature}
        </div>
        {/* CTA */}
        <button disabled={busy || (!current && !done ? true : done)} onClick={current ? onAction : undefined}
          style={{ marginTop: 12, width: '100%', padding: '12px 0', borderRadius: 12, fontWeight: 800, fontSize: 13.5, letterSpacing: .6, textTransform: 'uppercase',
            color: done ? 'var(--good)' : current ? '#fff' : '#9db0c0',
            background: done ? '#e6f6ee' : current ? 'linear-gradient(180deg,#2c5a97 0%,#16386b 58%,#0e2748 100%)' : '#eef0f6',
            boxShadow: current ? 'inset 0 1.5px 0 rgba(255,255,255,.28), 0 6px 18px rgba(53,195,232,.45)' : 'none', cursor: current ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {done ? '✓ Done!' : current ? <>{ctaLabel} <span>→</span></> : `After Mission ${number - 1}`}
        </button>
        {note && <div style={{ fontSize: 11.5, fontWeight: 800, color: '#b3641d', marginTop: 8 }}>{note}</div>}
        {onStuckLink && (
          <button onClick={onStuckLink} disabled={busy}
            style={{ marginTop: 8, fontSize: 11.5, fontWeight: 800, color: '#b3641d', textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', cursor: 'pointer' }}>
            😵 I'm stuck on this — open my other missions
          </button>
        )}
      </div>
    </div>
  )
}

/* ---- unlocked studio: mockup banner cards with art vignettes ---- */
function BigTask({ icon, title, sub, grad, art, onClick, busy }) {
  const [c1, c2] = grad
  const BASE = import.meta.env.BASE_URL || '/'
  return (
    <button disabled={busy} onClick={onClick}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, minHeight: 118, padding: '18px 22px 18px 198px', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 16, background: `linear-gradient(120deg,${c1},${c2})`,
        border: '2px solid rgba(18,12,58,.5)', boxShadow: '0 10px 26px rgba(20,15,70,.32)', color: '#fff', cursor: 'pointer' }}>
      <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 195,
        background: `linear-gradient(90deg, transparent 55%, ${c1}), url(${BASE}${art}) left center / cover no-repeat` }} />
      <span style={{ position: 'absolute', top: 12, right: 88, color: 'rgba(255,255,255,.65)', fontSize: 12 }}>✦</span>
      <span style={{ position: 'absolute', bottom: 13, right: 200, color: 'rgba(255,255,255,.4)', fontSize: 9 }}>✦</span>
      <span style={{ position: 'absolute', top: 22, right: 268, color: 'rgba(255,255,255,.5)', fontSize: 8 }}>✦</span>
      <span style={{ position: 'relative', width: 58, height: 58, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 27,
        background: 'rgba(255,255,255,.15)', border: '2.5px solid rgba(255,255,255,.8)', boxShadow: '0 0 20px rgba(255,255,255,.3)' }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <span style={{ display: 'block', fontSize: 20, fontWeight: 800, textShadow: '0 1px 6px rgba(0,0,0,.3)' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.9)', fontWeight: 600, marginTop: 3 }}>{sub}</span>
      </span>
      <span style={{ position: 'relative', background: '#fff', color: c1, fontWeight: 800, borderRadius: 999, padding: '10px 24px', fontSize: 14.5, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,.25)' }}>Go →</span>
    </button>
  )
}

/* ---- Daily Challenge banner: navy space theme (mockup) ---- */
function Spark({ x, y, c, s: size, glyph = '✦' }) {
  return <span style={{ position: 'absolute', left: x, top: y, color: c, fontSize: size, pointerEvents: 'none', textShadow: `0 0 8px ${c}` }}>{glyph}</span>
}

function Comet({ x, y, c, rot = -18, w = 80 }) {
  return <span style={{ position: 'absolute', left: x, top: y, width: w, height: 3, borderRadius: 3, background: `linear-gradient(90deg, transparent, ${c})`, transform: `rotate(${rot}deg)`, pointerEvents: 'none', boxShadow: `0 0 6px ${c}` }} />
}

function DailyBanner({ dc, busy, onGo, locked, missionsDone }) {
  return (
    <div className="nova-banner" style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, color: '#fff', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      background: 'radial-gradient(ellipse at 12% 15%, rgba(100,70,210,.4) 0%, transparent 45%), radial-gradient(ellipse at 88% 85%, rgba(80,55,180,.35) 0%, transparent 50%), linear-gradient(110deg,#151040 0%,#1e1656 55%,#151040 100%)',
      boxShadow: '0 10px 30px rgba(8,16,50,.45)' }}>

      {/* star field + comets */}
      <Spark x="30%" y={12} c="#ffffff" s={9} />
      <Spark x="44%" y="72%" c="#8fd8ff" s={13} />
      <Spark x="56%" y={16} c="#ffd76b" s={11} glyph="⭐" />
      <Spark x="63%" y="58%" c="#ffffff" s={7} />
      <Spark x="71%" y={26} c="#5aa8ff" s={18} />
      <Spark x="80%" y="70%" c="#ffd76b" s={9} />
      <Spark x="90%" y={14} c="#ffd76b" s={14} glyph="⭐" />
      <Spark x="95%" y="60%" c="#8fd8ff" s={8} />
      <Comet x="47%" y="80%" c="#ff8fb0" rot={-14} w={70} />
      <Comet x="58%" y="34%" c="#ffd76b" rot={-20} w={90} />
      <Comet x="86%" y="42%" c="#5ad7ff" rot={-16} w={64} />

      {/* Nova robot art */}
      <div style={{ position: 'relative', flexShrink: 0, filter: locked ? 'grayscale(.45) brightness(.85)' : 'none' }}>
        <img className="nova-robot" src={`${import.meta.env.BASE_URL || '/'}nova-robot.jpg`} alt="Nova the Robot" style={{ width: 148, display: 'block',
          WebkitMaskImage: 'radial-gradient(ellipse 68% 68% at 50% 50%, #000 52%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 68% 68% at 50% 50%, #000 52%, transparent 80%)' }} />
        {locked && <span style={{ position: 'absolute', bottom: 4, right: 8, width: 34, height: 34, borderRadius: '50%', background: '#f5b400', display: 'grid', placeItems: 'center', fontSize: 17, boxShadow: '0 2px 10px rgba(0,0,0,.45)', zIndex: 2 }}>🔒</span>}
      </div>

      {/* content */}
      <div style={{ flex: 1, minWidth: 300, position: 'relative' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 2.2, color: '#e8f1ff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span>Daily Challenge</span>
          <span style={{ color: '#5aa8ff', fontSize: 10 }}>●</span>
          <span>Revision</span>
          {dc?.genre && (<><span style={{ color: '#5aa8ff', fontSize: 10 }}>●</span><span>{dc.genre}</span></>)}
        </div>
        <div style={{ fontSize: 23, fontWeight: 800, margin: '6px 0 4px', textShadow: '0 1px 8px rgba(0,0,0,.4)' }}>
          {dc?.done ? "Today's challenge is done — nice work! ✓" : `${dc?.author || 'A robot'} wrote something rough — can you fix it up?`}
        </div>
        <div style={{ fontSize: 14.5, color: '#c9dbf4', marginBottom: 13 }}>
          {dc?.done ? 'A brand-new challenge lands tomorrow. You can still look back at your revision.'
            : locked ? 'A bonus challenge — finish 2 missions in your Launch Sequence to unlock it!'
            : "Judge it against the rubric, then rewrite it stronger. It's not yours, so revise boldly!"}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '8px 20px', fontSize: 13.5, fontWeight: 800, letterSpacing: .6,
          background: 'linear-gradient(120deg,#f5c542,#e89a00)', color: '#3d2c00', border: '1.5px solid rgba(255,225,140,.9)', boxShadow: '0 0 16px rgba(245,180,0,.55)' }}>
          🪙 EARN 100 COINS!
        </span>
      </div>

      {/* rubric tablet vignette */}
      <img aria-hidden className="nova-rubric" src={`${import.meta.env.BASE_URL || '/'}rubric-vig.jpg`} alt="" style={{ width: 190, flexShrink: 0, alignSelf: 'center', display: 'block',
        WebkitMaskImage: 'radial-gradient(ellipse 66% 66% at 50% 50%, #000 50%, transparent 80%)',
        maskImage: 'radial-gradient(ellipse 66% 66% at 50% 50%, #000 50%, transparent 80%)' }} />

      {/* locked: dim the whole banner under an explicit lock panel */}
      {locked && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 6, borderRadius: 22, display: 'grid', placeItems: 'center',
          background: 'rgba(7,11,34,.72)', backdropFilter: 'saturate(.35) blur(1.5px)', border: '2px dashed rgba(150,170,220,.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 30px', maxWidth: '92%' }}>
            <span style={{ width: 62, height: 62, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 30,
              background: 'linear-gradient(135deg,#f5c542,#e89a00)', border: '3px solid rgba(255,235,170,.9)', boxShadow: '0 0 26px rgba(245,180,0,.6)' }}>🔒</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 3.5, color: '#ffd76b', textTransform: 'uppercase', textShadow: '0 0 12px rgba(245,180,0,.5)' }}>Locked</div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: '#eaf1ff', margin: '3px 0 7px' }}>
                Finish 2 Launch Sequence missions to open the Daily Challenge.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {[0, 1].map((i) => (
                  <span key={i} style={{ width: 15, height: 15, borderRadius: '50%',
                    background: i < missionsDone ? '#57d98a' : 'rgba(255,255,255,.16)',
                    border: '2px solid ' + (i < missionsDone ? '#57d98a' : 'rgba(255,255,255,.45)'),
                    boxShadow: i < missionsDone ? '0 0 8px rgba(87,217,138,.7)' : 'none' }} />
                ))}
                <span style={{ fontSize: 13, fontWeight: 800, color: '#c9dbf4' }}>{missionsDone} of 2 missions done</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#3d2c00', background: 'linear-gradient(120deg,#f5c542,#e89a00)', borderRadius: 999, padding: '4px 12px', marginLeft: 6 }}>
                  🪙 Worth 100 coins
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* glowing CTA */}
      <button disabled={busy || locked} onClick={locked ? undefined : onGo}
        style={{ position: 'relative', flexShrink: 0, whiteSpace: 'nowrap', color: locked ? '#8fa3c8' : '#fff', fontWeight: 800, fontSize: locked ? 15 : 19, borderRadius: 20, padding: locked ? '18px 24px' : '20px 32px',
          background: locked ? 'rgba(30,25,80,.6)' : 'linear-gradient(120deg,#1d3a8f,#2a4dab)', border: locked ? '2.5px solid #3d3670' : '2.5px solid #55d7ff',
          boxShadow: locked ? 'none' : '0 0 26px rgba(85,215,255,.55), inset 0 0 18px rgba(85,215,255,.22)', cursor: locked ? 'default' : 'pointer' }}>
        {locked ? `🔒 Unlocks after 2 missions (${missionsDone}/2)` : dc?.done ? 'Review →' : dc?.started ? 'Keep going →' : 'Start Revising →'}
      </button>
    </div>
  )
}

/* ---- Share Wall right rail (mockup) ---- */
function relTime(d) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(d + 'T12:00:00')) / 86400000))
  if (days === 0) return 'Today'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function ShareWallRail({ state, me, onChange, onViewAll }) {
  const wall = (state.shareWall || []).slice(0, 3)
  async function kudo(id) { await api.kudos(id); onChange && onChange() }
  return (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20 }}>🌟</span>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 16 }}>Share Wall</b>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>See what other students are writing!</div>
        </div>
        <button className="btn ghost" style={{ padding: '6px 13px', fontSize: 12.5 }} onClick={onViewAll}>View all →</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginTop: 8 }}>
        {wall.map((e, i) => (
          <div key={e.id} style={{ padding: '13px 0', borderBottom: i < wall.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#eef3f6', display: 'grid', placeItems: 'center', fontSize: 17 }}>{e.avatar}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.15 }}>{e.studentName}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{e.genre}</div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, margin: '7px 0 6px', color: '#0d2f55' }}>{e.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => kudo(e.id)} title="Give kudos"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#d84a57', fontWeight: 800, fontSize: 13.5, padding: 0 }}>
                ❤️ {e.kudos}
              </button>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{relTime(e.sharedOn)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Fluency game picker: the growing games library, by grade level ---- */
function GamePickerModal({ games, grade, onPlayBuiltin, onPlayed, onClose, mission, playedCount = 0, seed = '' }) {
  const [playing, setPlaying] = useState(null)
  const playable = games.filter((g) => g.kind !== 'soon')
  let list = games
  if (mission && playable.length > 1) {
    let h = 0
    for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    const a = h % playable.length
    const b = (a + 1 + ((h >>> 3) % (playable.length - 1))) % playable.length
    list = [playable[a], playable[b]]
  }

  /* in-dashboard game window — the dashboard is one click away */
  if (playing) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', background: '#0e0b33' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', background: '#131048', color: '#fff', borderBottom: '2px solid rgba(255,255,255,.12)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22 }}>{playing.icon}</span>
          <b style={{ fontSize: 15.5 }}>{playing.title}</b>
          <span style={{ fontSize: 12, color: '#b9aef2', fontWeight: 700 }}>{playing.skill}</span>
          <span style={{ flex: 1 }} />
          {mission && <span style={{ fontSize: 12.5, fontWeight: 800, color: '#ffd76b' }}>Game {Math.min(playedCount + 1, 2)} of 2</span>}
          <button onClick={() => { onPlayed && onPlayed(); setPlaying(null) }}
            style={{ background: 'var(--good)', color: '#fff', fontWeight: 800, fontSize: 13, borderRadius: 999, padding: '8px 18px', cursor: 'pointer' }}>
            ✓ Done playing
          </button>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.14)', color: '#fff', fontWeight: 800, fontSize: 13, borderRadius: 999, padding: '8px 18px', cursor: 'pointer' }}>
            ✕ Back to Dashboard
          </button>
        </div>
        <iframe src={playing.url} title={playing.title} style={{ flex: 1, border: 'none', background: '#fff' }} />
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }} onClick={onClose}>
      <div className="card" style={{ width: 520, maxWidth: '94vw', padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>🎮</span>
          <b style={{ fontSize: 18 }}>{mission ? "Today's Two Games" : 'Fluency Games'}</b>
          <button onClick={onClose} style={{ marginLeft: 'auto', fontSize: 22, color: 'var(--muted)' }}>×</button>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 14px' }}>
          {mission
            ? <>Play <b>both games</b> to move forward — they open right here, so the dashboard is never far away.</>
            : <>Quick games that build writing muscles. New games are added by grade level — you're in <b>Grade {grade}</b>.</>}
        </p>
        {mission && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            {[0, 1].map((i) => (
              <span key={i} style={{ flex: 1, height: 7, borderRadius: 5, background: i < playedCount ? 'var(--good)' : '#e6eef3' }} />
            ))}
            <b style={{ fontSize: 12.5, color: playedCount >= 2 ? 'var(--good)' : 'var(--muted)' }}>{Math.min(playedCount, 2)}/2</b>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
          {list.map((g) => {
            const soon = g.kind === 'soon'
            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--line)', borderRadius: 12, padding: mission ? '16px 16px' : '11px 14px', opacity: soon ? .6 : 1 }}>
                <span style={{ width: mission ? 52 : 42, height: mission ? 52 : 42, borderRadius: 12, background: '#e8f5fb', display: 'grid', placeItems: 'center', fontSize: mission ? 27 : 22, flexShrink: 0 }}>{g.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: mission ? 15.5 : 14.5 }}>{g.title}</div>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginTop: 3 }}>
                    <span className="pill" style={{ fontSize: 10.5, padding: '2px 8px', background: '#e2f2f3', color: 'var(--scr)' }}>{g.skill}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)' }}>Grades {g.grades}</span>
                  </div>
                </div>
                {soon ? (
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--muted)' }}>COMING SOON</span>
                ) : g.kind === 'external' ? (
                  <button className="btn" style={{ padding: mission ? '9px 20px' : '7px 16px', fontSize: 13 }} onClick={() => setPlaying(g)}>Play ▶</button>
                ) : (
                  <button className="btn" style={{ padding: mission ? '9px 20px' : '7px 16px', fontSize: 13 }} onClick={() => onPlayBuiltin(g)}>Play ▶</button>
                )}
              </div>
            )
          })}
        </div>
        {!mission && (
          <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '12px 0 0', textAlign: 'center' }}>
            🎮 Quick rounds, instant feedback — every game plays right here on this screen.
          </p>
        )}
      </div>
    </div>
  )
}

/* ---- Free Write chooser: revise an unfinished story or start fresh ---- */
function FreeWriteModal({ stories, onPick, onNew, onClose, onBank, busy }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }} onClick={onClose}>
      <div className="card" style={{ width: 500, maxWidth: '94vw', padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>🕊️</span>
          <b style={{ fontSize: 18 }}>Free Write</b>
          <button onClick={onClose} style={{ marginLeft: 'auto', fontSize: 22, color: 'var(--muted)' }}>×</button>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 14px' }}>You have unfinished stories — pick one up where you left off, or start something brand new.</p>

        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: .5, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 8 }}>✏️ Revise stories</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
          {stories.map(({ sub, a, wcount, excerpt }) => (
            <button key={sub.id} onClick={() => onPick(sub.id)} disabled={busy}
              style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', border: '1px solid var(--line)', borderRadius: 12, padding: '11px 14px', background: '#fff' }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 14 }}>{a.title}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {excerpt || 'Nothing written yet'} · {wcount} words · Draft {sub.drafts.length}
                </span>
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--link)', whiteSpace: 'nowrap' }}>Revise →</span>
            </button>
          ))}
        </div>

        <button className="btn" disabled={busy} onClick={onNew} style={{ width: '100%', justifyContent: 'center', padding: '11px 0' }}>
          ✨ Start new writing piece
        </button>
        {onBank && (
          <button onClick={onBank} style={{ width: '100%', marginTop: 10, color: 'var(--link)', fontSize: 13, fontWeight: 800 }}>
            🗂️ See everything in my Writing Bank →
          </button>
        )}
      </div>
    </div>
  )
}

/* ---- Assignments tab: companion-product sections ---- */
function ClearSheetsCard({ sheets }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>🧾</span><b style={{ fontSize: 15 }}>ClearSheets</b>
        <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>· Worksheets</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sheets.map((w) => (
          <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{w.title}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                <span className="pill" style={{ fontSize: 10.5, padding: '2px 8px', background: '#e2f2f3', color: 'var(--scr)' }}>{w.subject}</span>
                {w.status === 'done'
                  ? <span style={{ fontSize: 11.5, color: 'var(--good)', fontWeight: 700 }}>✓ Done</span>
                  : <DueChip dueDate={w.due} status="not_started" />}
              </div>
            </div>
            <button className={w.status === 'done' ? 'btn ghost' : 'btn'} style={{ padding: '6px 14px', fontSize: 12.5 }} title="Opens in ClearSheets">
              {w.status === 'done' ? 'Review' : 'Open'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Crystal Instruction brand: magenta gem + pink wordmark.
function CrystalGem({ size = 20 }) {
  return (
    <svg viewBox="0 0 100 130" width={size} height={size * 1.3} aria-hidden="true">
      <polygon points="50,2 96,52 4,52" fill="#f27bea" />
      <polygon points="50,2 96,52 50,52" fill="#ee3fe0" />
      <polygon points="4,52 96,52 50,128" fill="#e62edf" />
      <polygon points="50,52 96,52 50,128" fill="#c21fb5" />
    </svg>
  )
}

function CrystalQuestCard({ quests }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px', background: 'linear-gradient(120deg,#e62edf,#a916a5)', color: '#fff' }}>
        <CrystalGem size={17} />
        <b style={{ fontSize: 15 }}>Crystal Quest</b>
        <span style={{ fontSize: 11.5, opacity: .9, fontWeight: 600 }}>· Independent learning paths</span>
      </div>
      <div style={{ padding: '13px 16px', display: 'flex', flexDirection: 'column', gap: 13, flex: 1 }}>
        {quests.map((q) => (
          <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: '#fbe4f9', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <CrystalGem size={17} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{q.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, margin: '1px 0 5px' }}>{q.area} · <span style={{ color: '#c21fb5', fontWeight: 800 }}>{q.crystals}</span></div>
              <div style={{ height: 6, background: '#f7ddf5', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${q.progress * 100}%`, background: 'linear-gradient(90deg,#f06ee6,#c21fb5)', borderRadius: 4 }} />
              </div>
            </div>
            <button className="btn" style={{ padding: '6px 14px', fontSize: 12.5, background: '#c21fb5' }} title="Opens in Crystal Quest">Continue</button>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 'auto' }}>Earn crystals by finishing each step of a path — at your own pace.</div>
      </div>
    </div>
  )
}

/* ---- Full assignments list (owns its filter state) ---- */
function AssignmentsCard({ rows, busy, begin }) {
  const [tab, setTab] = useState('active')
  const [sort, setSort] = useState('due')
  const [typeFilter, setTypeFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [query, setQuery] = useState('')

  const types = ['all', ...Array.from(new Set(rows.map((r) => r.a.type)))]
  const filtered = rows
    .filter((r) => (tab === 'completed' ? r.status === 'completed' : r.status !== 'completed'))
    .filter((r) => typeFilter === 'all' || r.a.type === typeFilter)
    .filter((r) => formatFilter === 'all' || r.a.format === formatFilter)
    .filter((r) => r.a.title.toLowerCase().includes(query.toLowerCase()))
    .sort((x, y) => {
      if (sort === 'due') return (daysTo(x.a.dueDate)) - (daysTo(y.a.dueDate))
      if (sort === 'title') return x.a.title.localeCompare(y.a.title)
      if (sort === 'type') return x.a.type.localeCompare(y.a.type)
      if (sort === 'teacher') return x.a.teacher.name.localeCompare(y.a.teacher.name)
      return 0
    })

  return (
    <div className="card" style={{ overflow: 'hidden', flex: 1 }}>
      <div style={{ display: 'flex', gap: 8, padding: '14px 16px 12px' }}>
        {['active', 'completed'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '9px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13.5,
              background: tab === t ? 'var(--teal-mid)' : '#eef3f6', color: tab === t ? '#fff' : 'var(--muted)' }}>
            {t === 'active' ? '📋 Active Assignments' : '📗 Completed Assignments'}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: '#f8fbfd', flexWrap: 'wrap' }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍 Search assignments…"
          style={{ flex: 1, minWidth: 140, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 13 }} />
        <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)} style={selStyle}>
          <option value="all">All formats</option>
          <option value="SCR">SCR only</option>
          <option value="ECR">ECR only</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selStyle}>
          {types.map((t) => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={selStyle}>
          <option value="due">Sort: Due date</option>
          <option value="title">Sort: Title</option>
          <option value="type">Sort: Type</option>
          <option value="teacher">Sort: Teacher</option>
        </select>
      </div>
      <div>
        {filtered.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)' }}>Nothing here — try the other tab or clear filters.</div>}
        {filtered.map((row) => {
          const s = STATUS_CHIP[row.status]
          return (
            <div key={row.a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{row.a.title}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                  <FormatBadge format={row.a.format} />
                  <span className="pill" style={{ background: s.c, color: s.t }}>{row.a.type}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <span style={{ width: 21, height: 21, borderRadius: '50%', background: '#e2eef5', color: 'var(--teal)', display: 'grid', placeItems: 'center', fontSize: 9.5, fontWeight: 800 }}>{row.a.teacher.initials}</span>
                    {row.a.teacher.name}
                  </span>
                </div>
              </div>
              <div style={{ width: 112, textAlign: 'right' }}><DueChip dueDate={row.a.dueDate} status={row.status} /></div>
              <div style={{ width: 104, textAlign: 'right' }}>
                <button className={row.status === 'not_started' ? 'btn' : 'btn ghost'} style={{ padding: '8px 16px' }} disabled={busy} onClick={() => begin(row)}>
                  {row.status === 'completed' ? 'Review' : row.status === 'in_progress' ? 'Continue' : 'Begin ▶'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function StudentHome({ state, me, onOpen, onLuna, onQuickWrite, onBank, onWall, onAssignment, onChange }) {
  const [homeTab, setHomeTab] = useState('home')
  const [busy, setBusy] = useState(false)
  const [game, setGame] = useState(null) // built-in game key, e.g. 'combine'
  const [fwChooser, setFwChooser] = useState(false)
  const [gamePicker, setGamePicker] = useState(false)
  const [stuckOpen, setStuckOpen] = useState(false)
  const [payoff, setPayoff] = useState(null)


  const rows = useMemo(() => {
    const subFor = (aid) => state.submissions.find((s) => s.assignmentId === aid && s.studentId === me.id)
    return state.assignments
      .filter((a) => !a.isPeerRevision)
      .map((a) => {
        const sub = subFor(a.id)
        const status = sub?.completedAt ? 'completed' : sub ? 'in_progress' : 'not_started'
        return { a, sub, status }
      })
  }, [state, me.id])

  // featured: the most urgent not-completed assignment
  const upNext = rows.filter((r) => r.status !== 'completed').sort((x, y) => daysTo(x.a.dueDate) - daysTo(y.a.dueDate))[0]

  async function launch(mode) {
    setBusy(true)
    try { const r = await api.quickWrite(mode); setFwChooser(false); onOpen(r.submissionId) } finally { setBusy(false) }
  }

  // unfinished free-write stories (for the Free Write chooser)
  const openStories = state.submissions
    .filter((s) => s.studentId === me.id && !s.completedAt)
    .map((s) => ({ sub: s, a: state.assignments.find((a) => a.id === s.assignmentId) }))
    .filter(({ a }) => a && a.genre === 'free')
    .map(({ sub, a }) => {
      const last = sub.drafts[sub.drafts.length - 1]
      const words = (last.content || '').trim().split(/\s+/).filter(Boolean)
      return { sub, a, wcount: words.length, excerpt: words.slice(0, 9).join(' ') }
    })

  function freeWrite() {
    if (openStories.length > 0) setFwChooser(true)
    else launch('free')
  }
  async function peer() {
    setBusy(true)
    try { const r = await api.peerRevision(); onOpen(r.submissionId) } finally { setBusy(false) }
  }
  async function begin(row) {
    if (row.sub) return onOpen(row.sub.id)
    setBusy(true)
    try { const r = await api.start(row.a.id); onOpen(r.submissionId) } finally { setBusy(false) }
  }

  const gs = state.growthSummary
  const dc = state.dailyChallenge
  const wp = state.writingPath

  // one-sentence orientation: point the student at today's priority
  const nudge = (() => {
    const day = DAY_NAMES[wp?.day ?? new Date().getDay()]
    const due = upNext?.a.dueDate != null ? daysTo(upNext.a.dueDate) : null
    const dueWord = due != null && due < 0 ? 'overdue' : due === 0 ? 'due today' : due === 1 ? 'due tomorrow' : null
    if (wp?.steps && !wp.completed) {
      const curIdx = wp.done.findIndex((d) => !d)
      const aIdx = wp.steps.indexOf('assignments')
      if (dueWord && aIdx >= 0 && !wp.done[aIdx]) return `"${upNext.a.title}" is ${dueWord} — it's mission ${aIdx + 1} on today's path. Let's knock it out. 💪`
      if (!wp.started) return `${day}'s path is ready — 3 quick missions, starting with ${STEP_META[wp.steps[0]].label}. 🚀`
      return `Mission ${curIdx + 1} is up: ${STEP_META[wp.steps[curIdx]].label}. Keep it rolling! ⚡`
    }
    if (wp?.steps && wp.completed) {
      if (dueWord) return `Path complete! Want to get ahead? "${upNext.a.title}" is ${dueWord}. 🌟`
      return `Today's path is done — Mission Control is all yours. 🎉`
    }
    return `No missions on ${day}s — write anything, play anything. 🏖️`
  })()
  const pathLocked = !!(wp && wp.steps && !wp.completed)
  const missionsDone = wp?.steps ? wp.done.filter(Boolean).length : 0
  const challengeLocked = !!(wp?.steps && missionsDone < 2)

  function launchStep(step) {
    if (step === 'assignments') onAssignment(upNext?.a)
    else if (step === 'quickwrite') onQuickWrite()
    else if (step === 'luna') onLuna()
    else if (step === 'revision') peer()
    else if (step === 'freewrite') freeWrite()
    else if (step === 'games') setGamePicker(true)
    else if (step === 'goal_data') setHomeTab('data')
  }
  async function missionStart(i) {
    if (!wp?.steps || wp.done[i]) return
    const curIdx = wp.done.findIndex((d) => !d)
    if (!wp.stuck && i !== curIdx) return
    if (!wp.started) { try { await api.pathStart(); onChange && onChange() } catch {} }
    launchStep(wp.steps[i])
  }
  // Friday's Goals & Data step completes by visiting the Data & Goals tab
  useEffect(() => {
    if (homeTab !== 'data' || !wp || !wp.steps || wp.completed || !wp.started) return
    const idx = wp.done.findIndex((d) => !d)
    if (idx >= 0 && wp.steps[idx] === 'goal_data') {
      api.pathAdvance('goal_data').then(() => onChange && onChange()).catch(() => {})
    }
  }, [homeTab])
  async function imStuck() {
    setBusy(true)
    try { await api.pathStuck(); onChange && onChange(); setStuckOpen(true) } finally { setBusy(false) }
  }
  // payoff toast when a mission lands (not on the 3rd — the trophy owns that moment)
  useEffect(() => {
    if (!wp?.steps) return
    const key = `${wp.date}-${wp.day}`
    const doneNow = wp.done.filter(Boolean).length
    if (lastSeenMissions.key !== key) { lastSeenMissions = { key, n: doneNow }; return }
    const prev = lastSeenMissions.n
    lastSeenMissions.n = doneNow
    if (wp.completed) { setPayoff(null); return }
    if (doneNow > prev) setPayoff({ n: doneNow, challenge: doneNow === 2 })
  }, [wp?.steps ? wp.done.filter(Boolean).length : 0])

  function pickDemoDay(d) {
    api.pathDemoDay(d).then(() => onChange && onChange()).catch(() => {})
  }
  function gamePlayed() {
    api.pathGame().then((r) => {
      onChange && onChange()
      const pth = r.path
      if (pth?.steps) {
        const gi = pth.steps.indexOf('games')
        if (gi >= 0 && pth.done[gi]) { setGamePicker(false); setGame(false) }
      }
    }).catch(() => {})
  }
  // one-time celebration when today's path completes
  const celebrateKey = wp ? `pathCelebrated-${wp.date}-${wp.day ?? 'x'}` : null
  const [celebrate, setCelebrate] = useState(false)
  const [how, setHow] = useState(false)
  useEffect(() => {
    if (wp?.completed && wp.steps && celebrateKey && !localStorage.getItem(celebrateKey)) {
      localStorage.setItem(celebrateKey, '1')
      setCelebrate(true)
    }
  }, [wp?.completed])

  return (
    <div>
      {game && <FluencyGame gameKey={game} onClose={() => setGame(null)} onFinished={gamePlayed} />}
      {gamePicker && (
        <GamePickerModal games={state.fluencyGames || []} grade={me.gradeLevel ?? 6} onPlayed={gamePlayed}
          mission={!!(wp?.steps && wp.steps.includes('games') && !wp.done[wp.steps.indexOf('games')])}
          playedCount={wp?.gamesPlayed ?? 0} seed={`${wp?.date || ''}-${wp?.day ?? ''}`}
          onPlayBuiltin={(g) => { setGamePicker(false); setGame((g && g.game) || 'stretch') }}
          onClose={() => setGamePicker(false)} />
      )}
      {fwChooser && (
        <FreeWriteModal stories={openStories} busy={busy} onBank={() => { setFwChooser(false); onBank && onBank() }}
          onPick={(id) => { setFwChooser(false); onOpen(id) }}
          onNew={() => launch('free')}
          onClose={() => setFwChooser(false)} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 14, position: 'relative', zIndex: 1 }}>
        {/* Luna delivers the personalized nudge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: 640 }}>
          <span style={{ width: 52, height: 52, borderRadius: '50%', padding: 2.5, flexShrink: 0, background: 'conic-gradient(from 200deg,#35c3e8,#a5e6ff,#35c3e8)', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(53,195,232,.35)' }}>
            <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0d2440', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              <img src={BRAND.luna} alt="Luna" style={{ height: 38 }} />
            </span>
          </span>
          <div style={{ position: 'relative', background: '#fff', border: '1.5px solid #c7e0f2', borderRadius: '4px 16px 16px 16px', padding: '10px 16px',
            fontSize: 13.5, fontWeight: 700, color: '#28536e', lineHeight: 1.45, boxShadow: '0 6px 18px rgba(13,47,85,.12)' }}>
            <b style={{ color: '#0d2f55' }}>Hi Kayla!</b> {nudge}
          </div>
        </div>
        <div style={{ display: 'inline-flex', background: '#fff', borderRadius: 14, padding: 5, gap: 3, position: 'relative', zIndex: 2,
          border: '1.5px solid #d5e2ec', boxShadow: '0 6px 20px rgba(13,47,85,.16)' }}>
          {[['home', '🏠 Home'], ['assignments', '📋 Assignments'], ['data', '📊 Data & Goals']].map(([k, label]) => (
            <button key={k} onClick={() => setHomeTab(k)}
              style={{ padding: '11px 22px', borderRadius: 10, fontSize: 14.5, fontWeight: 800,
                background: homeTab === k ? 'linear-gradient(180deg,#2c5a97 0%,#16386b 58%,#0e2748 100%)' : 'transparent',
                color: homeTab === k ? '#fff' : '#16386b',
                boxShadow: homeTab === k ? 'inset 0 1.5px 0 rgba(255,255,255,.3), 0 4px 12px rgba(13,47,85,.3)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= HOME ================= */}
      {homeTab === 'home' && (<>
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `url(${import.meta.env.BASE_URL || '/'}bg-stars.jpg) center / cover no-repeat`, opacity: .22 }} />
      {celebrate && (
        <PathCelebration wp={wp} streak={gs?.streakDays ?? 0} onClose={() => setCelebrate(false)} />
      )}
      {how && <HowItWorksModal onClose={() => setHow(false)} />}
      {payoff && !wp?.completed && (() => {
        const nextIdx = wp?.steps ? wp.done.findIndex((d) => !d) : -1
        return (
          <div style={{ position: 'fixed', bottom: 26, left: '50%', transform: 'translateX(-50%)', zIndex: 65, maxWidth: '94vw',
            background: '#0d2440', color: '#fff', borderRadius: 18, padding: '14px 20px', display: 'flex', gap: 14, alignItems: 'center',
            boxShadow: '0 14px 44px rgba(0,0,0,.45), 0 0 24px rgba(53,195,232,.3)', border: '1.5px solid #35c3e8', animation: 'popIn .3s ease', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 28 }}>🪙</span>
            <div style={{ minWidth: 0 }}>
              <b style={{ fontSize: 14.5 }}>Mission {payoff.n} complete — +10 coins deposited!</b>
              <div style={{ fontSize: 12.5, color: '#a8dff5', fontWeight: 700, marginTop: 2 }}>
                {payoff.challenge ? 'The Daily Challenge just unlocked — 100 coins on the table! 🤖' : 'Nice work — keep it rolling!'}
              </div>
            </div>
            {nextIdx >= 0 && (
              <button onClick={() => { setPayoff(null); missionStart(nextIdx) }}
                style={{ background: 'linear-gradient(120deg,#f5c542,#e89a00)', color: '#3d2c00', fontWeight: 800, fontSize: 13.5, borderRadius: 999, padding: '11px 20px', whiteSpace: 'nowrap', cursor: 'pointer', boxShadow: '0 0 16px rgba(245,180,0,.5)' }}>
                ▶ Start Mission {nextIdx + 1} →
              </button>
            )}
            <button onClick={() => { setPayoff(null); setGame(['stretch', 'combine', 'transitions', 'fragments', 'wordswap'][Math.floor(Math.random() * 5)]) }}
              style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', fontWeight: 800, fontSize: 12, borderRadius: 999, padding: '9px 14px', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              🕹️ Bonus round
            </button>
            <button onClick={() => setPayoff(null)} style={{ color: '#8fb4d6', fontSize: 18, cursor: 'pointer', background: 'none' }}>✕</button>
          </div>
        )
      })()}
      {stuckOpen && (
        <StuckModal teacher={state.teacher?.name || 'your teacher'}
          stepLabel={wp?.stuckStep ? STEP_META[wp.stuckStep]?.label : null}
          onClose={() => setStuckOpen(false)} />
      )}

      {pathLocked ? (
        /* QUEST — the Launch Sequence */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <WritingLaunchpad state={state} me={me} wp={wp} busy={busy} upNext={upNext} onMission={missionStart} onHow={() => setHow(true)} onStuck={imStuck} nudge={nudge}
            onQuickWrite={onQuickWrite} onFreeWrite={freeWrite} onGames={() => setGamePicker(true)} onBank={onBank} />
          <DailyBanner dc={dc} busy={busy} onGo={peer} locked={challengeLocked} missionsDone={missionsDone} />
        </div>
      ) : (
        /* MISSION CONTROL — deliberately distinct: stacked mosaic of banner cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <PathRibbon wp={wp} onResume={(i) => launchStep(wp.steps[i])} />
          <div className="home-split" style={{ gridTemplateColumns: '1fr 1fr', flex: 'none' }}>
            <BigTask icon="⚡" title="Quick Write" sub="A timed prompt to warm up your brain" grad={['#2f3f96', '#1e2a6b']} art="vig-quickwrite.jpg" busy={busy} onClick={onQuickWrite} />
            <BigTask icon="✒️" title="Free Write" sub="Your page, your rules — write anything" grad={['#1d40ae', '#152f82']} art="vig-freewrite.jpg" busy={busy} onClick={freeWrite} />
            <BigTask icon="🎮" title="Fluency Games" sub="A whole arcade of writing games" grad={['#0d5f66', '#08454b']} art="vig-games.jpg" onClick={() => setGamePicker(true)} />
            <BigTask icon="🗂️" title="Writing Bank" sub="Revise, publish & share your pieces" grad={['#c8860a', '#a26a04']} art="vig-bank.jpg" onClick={onBank} />
          </div>
          <LunaNook modules={state.modules} onLuna={onLuna} />
          <DailyBanner dc={dc} busy={busy} onGo={peer} locked={challengeLocked} missionsDone={missionsDone} />
        </div>
      )}

      <DemoWeekStrip wp={wp} onPick={pickDemoDay} />
      </>)}

      {/* ================= ASSIGNMENTS ================= */}
      {homeTab === 'assignments' && (<>
        <GoalBanner me={me} onData={() => setHomeTab('data')} />
        <div className="assign-grid">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <AssignmentsCard rows={rows} busy={busy} begin={begin} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <ClearSheetsCard sheets={state.clearSheets || []} />
            <CrystalQuestCard quests={state.crystalQuests || []} />
          </div>
        </div>
        {gs && <GrowthSummaryCard gs={gs} onGrowth={() => setHomeTab('data')} />}
      </>)}

      {/* ================= DATA & GOALS ================= */}
      {homeTab === 'data' && <DataGoalsTab state={state} me={me} onChange={onChange} />}
    </div>
  )
}

const selStyle = { padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 13, background: '#fff', fontWeight: 600, color: 'var(--ink)' }
