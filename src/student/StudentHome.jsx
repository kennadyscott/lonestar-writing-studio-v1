import React, { useState, useMemo } from 'react'
import { api, TRAIT_LABELS } from '../lib/api.js'
import { BRAND } from '../lib/brand.js'
import FluencyGame from './FluencyGame.jsx'
import TypingGame from './TypingGame.jsx'
import ProofRoom from './ProofRoom.jsx'
import ModuleBadge from '../components/ModuleBadge.jsx'
import { DataGoalsTab, ShareWallTab, ReactionBar } from './GrowthPage.jsx'
import { useT, useLocale } from '../lib/i18n/index.jsx'

const TODAY = new Date('2026-07-02T00:00:00')
const fmt = (d, locale = 'en-US') => d ? new Date(d + 'T00:00:00').toLocaleDateString(locale, { month: 'short', day: 'numeric' }) : '—'
const daysTo = (d) => d ? Math.round((new Date(d + 'T00:00:00') - TODAY) / 86400000) : Infinity

function DueChip({ dueDate, status }) {
  const t = useT()
  const locale = useLocale()
  if (status === 'completed') return <span className="pill green">{t('✓ Turned in')}</span>
  const dt = daysTo(dueDate)
  if (dueDate == null) return <span style={{ fontSize: 13, color: 'var(--muted)' }}>{t('No due date')}</span>
  const color = dt < 0 ? '#e5484d' : dt <= 2 ? '#e08a2b' : 'var(--muted)'
  const label = dt < 0 ? t('Overdue') : dt === 0 ? t('Due today') : dt === 1 ? t('Due tomorrow') : t('Due {date}', { date: fmt(dueDate, locale) })
  return <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
}

const STATUS_CHIP = {
  in_progress: { c: '#e5f1fb', t: 'var(--ecr)' },
  not_started: { c: '#eef3f6', t: '#5c7285' },
  completed: { c: '#e6f6ee', t: 'var(--good)' },
}

function FormatBadge({ format }) {
  const t = useT()
  if (!format) return <span title={t('Self-started practice')} style={{ fontSize: 11, fontWeight: 800, letterSpacing: .4, color: '#8a94a0', background: '#eef3f6', padding: '3px 9px', borderRadius: 7 }}>{t('PRACTICE')}</span>
  const meta = format === 'ECR'
    ? { bg: 'var(--ecr)', full: t('Extended Constructed Response') }
    : { bg: 'var(--scr)', full: t('Short Constructed Response') }
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

const MODULE_SHORT = { m1: 'SCR', m2: 'ECR', m3: 'Stellar', m4: 'Process', m5: 'Revision', m6: 'Editing' }

function LunaNook({ modules, onLuna }) {
  const t = useT()
  const current = modules.find((m) => m.status === 'in_progress') || modules[0]
  const idx = modules.indexOf(current)
  const BASE = import.meta.env.BASE_URL || '/'
  return (
    <div className="luna-bar" style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', border: '2px solid rgba(9,26,52,.6)', boxShadow: '0 8px 22px rgba(20,15,70,.3)',
      background: `linear-gradient(90deg, rgba(13,36,64,.96) 0%, rgba(13,36,64,.9) 46%, rgba(13,36,64,.55) 74%, rgba(13,36,64,.35) 100%), url(${BASE}nook-header.jpg) right center / cover no-repeat` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '12px 18px', flexWrap: 'wrap' }}>

        {/* who + where you are */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, flex: '1 1 260px', minWidth: 0 }}>
          <span style={{ width: 46, height: 46, borderRadius: '50%', padding: 2.5, flexShrink: 0, background: 'conic-gradient(from 200deg,#35c3e8,#a5e6ff,#35c3e8)', display: 'grid', placeItems: 'center' }}>
            <span style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#0d2440', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              <img src={BRAND.luna} alt="Luna" style={{ height: 32 }} />
            </span>
          </span>
          <div style={{ minWidth: 0 }}>
            <b style={{ fontSize: 15, color: '#fff' }}>{t("Luna's Writing Nook")}</b>
            <div style={{ fontSize: 12, color: '#a8dff5', fontWeight: 700 }}>
              {t('Module {n}', { n: idx + 1 })}: {current.label} · {t('{done} of {total} activities', { done: 4, total: 6 })}
            </div>
          </div>
        </div>

        {/* progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: '1 1 150px', minWidth: 130, maxWidth: 240 }}>
          <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,.22)', borderRadius: 6 }}>
            <div style={{ height: '100%', width: `${current.progress * 100}%`, background: 'linear-gradient(90deg,#35c3e8,#a5e6ff)', borderRadius: 6 }} />
          </div>
          <b style={{ fontSize: 12.5, color: '#a8dff5' }}>{Math.round(current.progress * 100)}%</b>
        </div>

        {/* the six modules, still readable */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, flexShrink: 0 }}>
          {modules.map((m, mi) => {
            const cur = m.status === 'in_progress'
            return (
              <button key={m.id} onClick={onLuna} title={`${t('Module {n}', { n: mi + 1 })}: ${m.label}`}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 62, padding: '5px 2px', borderRadius: 10, cursor: 'pointer',
                  background: cur ? 'rgba(245,197,66,.16)' : 'transparent', border: cur ? '1.5px solid #f0b429' : '1.5px solid transparent' }}>
                <ModuleBadge id={m.id} size={38} dim={m.status === 'not_started'} />
                <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: .3, color: cur ? '#f5c542' : m.status === 'not_started' ? '#7f9bb4' : '#a8dff5', whiteSpace: 'nowrap' }}>
                  {MODULE_SHORT[m.id] ? t(MODULE_SHORT[m.id]) : `M${mi + 1}`}
                </span>
              </button>
            )
          })}
        </div>

        <button className="btn" onClick={onLuna} style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
          {t('Go to my path')}
        </button>
      </div>
    </div>
  )
}

// Average-score-over-time line (single series, direct-labeled per point).
function ScoreLine({ points }) {
  const t = useT()
  const W = 320, H = 128, PX = 26, PT = 26, PB = 24
  const lo = Math.min(...points.map((p) => p.pct)) - 6
  const hi = Math.max(...points.map((p) => p.pct)) + 6
  const x = (i) => PX + (i * (W - 2 * PX)) / (points.length - 1)
  const y = (v) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB)
  const line = points.map((p, i) => `${x(i)},${y(p.pct)}`).join(' ')
  const area = `${x(0)},${H - PB} ${line} ${x(points.length - 1)},${H - PB}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 360, display: 'block' }} role="img" aria-label={t('Average writing score over time')}>
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
  const t = useT()
  const away = Math.max(0, gs.goalPercent - gs.currentAverage)
  const stats = [
    { k: t('Current Average'), v: `${gs.currentAverage}% ↗`, sub: t('↑ {n}% this week', { n: gs.weeklyDelta }), c: 'var(--good)' },
    { k: t('Writing Streak'), v: t('{n} days 🔥', { n: gs.streakDays }), sub: t('Keep it up!'), c: 'var(--muted)' },
    { k: t('Badges Earned'), v: `${gs.badges} 🏅`, sub: t('See all badges'), c: 'var(--muted)' },
  ]
  return (
    <div className="card" style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.2fr 0.9fr', gap: 24, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 800 }}>{t('My Data 📊')}</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: '6px 0 12px' }}>{t('Your averages at a glance — dig deeper in Data & Goals.')}</p>
        <button className="btn" style={{ padding: '8px 18px' }} onClick={onGrowth}>{t('See full data →')}</button>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>{t('Average Score Over Time')}</div>
        <ScoreLine points={gs.scoreOverTime} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800 }}>{t('Goal Progress')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 0 6px' }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{t('Goal: {n}%', { n: gs.goalPercent })}</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)' }}>{gs.currentAverage}%</span>
        </div>
        <div style={{ height: 12, background: '#e6eef3', borderRadius: 7 }}>
          <div style={{ height: '100%', width: `${(gs.currentAverage / gs.goalPercent) * 100}%`, background: 'linear-gradient(90deg,var(--cyan-bright),var(--teal))', borderRadius: 7 }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          {t("You're")} <b style={{ color: 'var(--cyan-bright)' }}>{away}%</b> {t('away from your goal!')}
        </div>
      </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 16 }}>
        {stats.map((st) => (
          <div key={st.k}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{st.k}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--teal)' }}>{st.v}</div>
            <div style={{ fontSize: 10.5, color: st.c, fontWeight: 600 }}>{st.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Home tab: one featured assignment ---- */
function UpNextCard({ row, busy, begin, onAll }) {
  const t = useT()
  if (!row) return null
  const s = STATUS_CHIP[row.status]
  return (
    <div style={{ position: 'relative', background: '#fff', border: '2.5px solid #0a7dba', borderRadius: 18, boxShadow: '0 8px 24px rgba(6,170,222,.16)', padding: '24px 22px 14px' }}>
      <span style={{ position: 'absolute', top: -14, left: 18, background: 'linear-gradient(120deg,#f5b400,#e89a00)', color: '#3d2c00', fontSize: 11.5, fontWeight: 800, letterSpacing: .6, padding: '5px 15px', borderRadius: 999, boxShadow: '0 2px 8px rgba(180,120,0,.35)' }}>
        {t('⭐ UP NEXT FOR YOU')}
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
          <button className="btn lg" disabled={busy} onClick={() => begin(row)}>
            {row.status === 'in_progress' ? t('Continue') : t('Begin')}
          </button>
          <button onClick={onAll} style={{ color: 'var(--link)', fontSize: 13, fontWeight: 800 }}>{t('See all assignments →')}</button>
        </div>
      </div>
    </div>
  )
}

/* ---- Assignments tab: active goal banner ---- */
function GoalBanner({ me, classFocus }) {
  const t = useT()
  // read-only on Home — the goal is set and managed in a writing conference
  const half = { flex: '1 1 320px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '4px 2px' }
  return (
    <div className="card gold-edge" style={{ padding: '14px 20px', marginBottom: 18, display: 'flex', alignItems: 'stretch', gap: 20, flexWrap: 'wrap',
      background: 'linear-gradient(120deg,#eef6f9,#fff)' }}>
      <div style={half}>
        <span style={{ fontSize: 28 }}>🎯</span>
        {me.goal ? (
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">{t('My goal')}</div>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>{me.goal.text}</div>
            {me.goal.trait && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{t('Trait: {trait} · your coach keeps this in mind when you confer', { trait: t(TRAIT_LABELS[me.goal.trait]) })}</div>}
          </div>
        ) : (
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">{t('My goal')}</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{t("You'll name your next goal in a writing conference with your teacher.")}</div>
          </div>
        )}
      </div>

      <span aria-hidden className="goal-split" style={{ width: 1, background: 'var(--line)', alignSelf: 'stretch' }} />

      <div style={half}>
        <span style={{ fontSize: 28 }}>👥</span>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ color: CYAN_TEXT }}>{t('Class focus')}</div>
          {classFocus ? (
            <>
              <div style={{ fontSize: 15.5, fontWeight: 800 }}>{classFocus.text}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                {classFocus.note ? `${classFocus.note} · ` : ''}{t('what the whole class is working on')}{classFocus.setBy ? t(' — set by {name}', { name: classFocus.setBy }) : ''}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 15, fontWeight: 700 }}>{t('Your class focus shows up here when your teacher sets one.')}</div>
          )}
        </div>
      </div>
    </div>
  )
}

const CYAN_TEXT = '#0f97c2' // cyan dark enough for text on white

/* ---- the studio dashboard: mockup banner cards with art vignettes ---- */
function BigTask({ icon, title, sub, grad, art, onClick, busy, compact }) {
  const t = useT()
  const [c1, c2] = grad
  const BASE = import.meta.env.BASE_URL || '/'
  if (compact) {
    return (
      <button disabled={busy} onClick={onClick}
        style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, minHeight: 82, padding: '11px 13px 11px 94px', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 10, background: `linear-gradient(120deg,${c1},${c2})`,
          border: '1.5px solid rgba(245,180,0,.45)', boxShadow: '0 8px 20px rgba(20,15,70,.28)', color: '#fff', cursor: 'pointer', width: '100%' }}>
        <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 92,
          background: `linear-gradient(90deg, transparent 45%, ${c1}), url(${BASE}${art}) left center / cover no-repeat` }} />
        <span style={{ position: 'relative', width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 16,
          background: 'rgba(255,255,255,.15)', border: '2px solid #fff', boxShadow: '0 0 0 1.5px #f5b400' }}>{icon}</span>
        <span style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <span style={{ display: 'block', fontSize: 15, fontWeight: 800, textShadow: '0 1px 6px rgba(0,0,0,.3)', whiteSpace: 'nowrap' }}>{title}</span>
          <span style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.88)', fontWeight: 600, marginTop: 2, lineHeight: 1.3 }}>{sub}</span>
        </span>
        <span style={{ position: 'relative', background: '#fff', color: c1, fontWeight: 700, borderRadius: 8, padding: '6px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>{t('Go')}</span>
      </button>
    )
  }
  return (
    <button disabled={busy} onClick={onClick}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, minHeight: 118, padding: '18px 22px 18px 198px', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 16, background: `linear-gradient(120deg,${c1},${c2})`,
        border: '1.5px solid rgba(245,180,0,.45)', boxShadow: '0 10px 26px rgba(20,15,70,.32)', color: '#fff', cursor: 'pointer' }}>
      <span aria-hidden style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 195,
        background: `linear-gradient(90deg, transparent 55%, ${c1}), url(${BASE}${art}) left center / cover no-repeat` }} />
      <span style={{ position: 'absolute', top: 12, right: 88, color: 'rgba(255,255,255,.65)', fontSize: 12 }}>✦</span>
      <span style={{ position: 'absolute', bottom: 13, right: 200, color: 'rgba(255,255,255,.4)', fontSize: 9 }}>✦</span>
      <span style={{ position: 'absolute', top: 22, right: 268, color: 'rgba(255,255,255,.5)', fontSize: 8 }}>✦</span>
      <span style={{ position: 'relative', width: 58, height: 58, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 27,
        background: 'rgba(255,255,255,.15)', border: '2px solid #fff', boxShadow: '0 0 0 1.5px #f5b400' }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <span style={{ display: 'block', fontSize: 20, fontWeight: 800, textShadow: '0 1px 6px rgba(0,0,0,.3)' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.9)', fontWeight: 600, marginTop: 3 }}>{sub}</span>
      </span>
      <span style={{ position: 'relative', background: '#fff', color: c1, fontWeight: 700, borderRadius: 10, padding: '8px 16px', fontSize: 13.5, whiteSpace: 'nowrap' }}>{t('Go')}</span>
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

function DailyBanner({ dc, busy, onGo }) {
  const t = useT()
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
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img className="nova-robot" src={`${import.meta.env.BASE_URL || '/'}nova-robot.jpg`} alt={t('Nova the Robot')} style={{ width: 148, display: 'block',
          WebkitMaskImage: 'radial-gradient(ellipse 68% 68% at 50% 50%, #000 52%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 68% 68% at 50% 50%, #000 52%, transparent 80%)' }} />
      </div>

      {/* content */}
      <div style={{ flex: 1, minWidth: 300, position: 'relative' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 2.2, color: '#e8f1ff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span>{t('Daily Challenge')}</span>
          <span style={{ color: '#5aa8ff', fontSize: 10 }}>●</span>
          <span>{t('Revision')}</span>
          {dc?.genre && (<><span style={{ color: '#5aa8ff', fontSize: 10 }}>●</span><span>{dc.genre}</span></>)}
        </div>
        <div style={{ fontSize: 23, fontWeight: 800, margin: '6px 0 4px', textShadow: '0 1px 8px rgba(0,0,0,.4)', textWrap: 'balance' }}>
          {dc?.done ? t("Today's challenge is done — nice work! ✓") : t('{author} wrote something rough — can you fix it up?', { author: dc?.author || t('A robot') })}
        </div>
        <div style={{ fontSize: 14.5, color: '#c9dbf4', marginBottom: 13 }}>
          {dc?.done ? t('A brand-new challenge lands tomorrow. You can still look back at your revision.')
            : t("Judge it against the rubric, then rewrite it stronger. It's not yours, so revise boldly!")}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '8px 20px', fontSize: 13.5, fontWeight: 800, letterSpacing: .6,
          background: 'linear-gradient(120deg,#f5c542,#e89a00)', color: '#3d2c00', border: '1.5px solid rgba(255,225,140,.9)', boxShadow: '0 0 16px rgba(245,180,0,.55)' }}>
          {t('🪙 EARN 100 COINS!')}
        </span>
      </div>

      {/* rubric tablet vignette */}
      <img aria-hidden className="nova-rubric" src={`${import.meta.env.BASE_URL || '/'}rubric-vig.jpg`} alt="" style={{ width: 190, flexShrink: 0, alignSelf: 'center', display: 'block',
        WebkitMaskImage: 'radial-gradient(ellipse 66% 66% at 50% 50%, #000 50%, transparent 80%)',
        maskImage: 'radial-gradient(ellipse 66% 66% at 50% 50%, #000 50%, transparent 80%)' }} />

      {/* glowing CTA */}
      <button disabled={busy} onClick={onGo}
        style={{ position: 'relative', flexShrink: 0, whiteSpace: 'nowrap', color: '#fff', fontWeight: 800, fontSize: 19, borderRadius: 20, padding: '20px 32px',
          background: 'linear-gradient(120deg,#1d3a8f,#2a4dab)', border: '2.5px solid #55d7ff',
          boxShadow: '0 0 26px rgba(85,215,255,.55), inset 0 0 18px rgba(85,215,255,.22)', cursor: 'pointer' }}>
        {dc?.done ? t('Review →') : dc?.started ? t('Keep going →') : t('Start Revising →')}
      </button>
    </div>
  )
}

/* ---- Share Wall right rail (mockup) ---- */
// `t` is passed in: this runs outside a component, so it cannot call useT().
function relTime(d, t) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(d + 'T12:00:00')) / 86400000))
  if (days === 0) return t('Today')
  if (days < 7) return t('{n}d ago', { n: days })
  return t('{n}w ago', { n: Math.floor(days / 7) })
}

function ShareWallStrip({ state, onChange, onViewAll }) {
  const t = useT()
  const wall = (state.shareWall || []).slice(0, 3)
  async function react(id, type) { await api.react(id, type); onChange && onChange() }
  if (!wall.length) return null
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🌟</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <b style={{ fontSize: 16 }}>{t('Share Wall')}</b>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{t('See what other students are writing — cheer them on with 👍 ❤️ 🎉')}</div>
        </div>
        <button className="btn ghost" style={{ padding: '7px 15px', fontSize: 13 }} onClick={onViewAll}>{t('View all →')}</button>
      </div>
      <div className="wall-strip">
        {wall.map((e) => (
          <div key={e.id} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '13px 15px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(150deg,#fbfdfe,#fff)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#eef3f6', display: 'grid', placeItems: 'center', fontSize: 17, flexShrink: 0 }}>{e.avatar}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.15 }}>{e.studentName}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{e.genre} · {relTime(e.sharedOn, t)}</div>
              </div>
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 800, margin: '9px 0 5px', color: '#0d2f55' }}>{e.title}</div>
            <div style={{ fontSize: 12.5, color: '#41586b', lineHeight: 1.5, flex: 1 }}>
              {e.excerpt.slice(0, 120)}{e.excerpt.length > 120 ? '…' : ''}
            </div>
            <div style={{ marginTop: 11 }}>
              <ReactionBar entry={e} onReact={react} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Fluency Zone: one tile per category; play one, reveal the coins; clear the grid for a bonus ---- */
// Tile art is cropped from the Fluency Zone card renders (public/zone/).
const maxCoinsFor = () => 20

// A small gold coin, so we do not depend on the platform's coin emoji.
function Coin({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden style={{ display: 'inline-block', verticalAlign: '-2px' }}>
      <circle cx="10" cy="10" r="9" fill="#f5b400" stroke="#c98f00" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="6" fill="none" stroke="#ffe08a" strokeWidth="1.2" />
      <text x="10" y="13.4" textAnchor="middle" fontSize="9" fontWeight="800" fill="#7a5200" fontFamily="Manrope, sans-serif">¢</text>
    </svg>
  )
}

function FluencyGridModal({ categories, games, grid, grade, busy, onPlay, onReset, onClose, lastReveal, lastMiss }) {
  const t = useT()
  const byKey = Object.fromEntries(games.map((g) => [g.game, g]))
  const playable = (c) => c.games.map((k) => byKey[k]).filter((g) => g && g.kind === 'builtin')
  const cleared = grid?.cleared || {}
  const tiles = categories.map((c) => ({ ...c, options: playable(c), done: cleared[c.id] || null }))
  const inPlay = tiles.filter((tile) => tile.options.length > 0)
  const doneCount = inPlay.filter((tile) => tile.done).length
  const allClear = inPlay.length > 0 && doneCount === inPlay.length
  const earned = Object.values(cleared).reduce((a, x) => a + (x.coins || 0), 0) + (grid?.bonusPaid ? 50 : 0)
  const BASE = import.meta.env.BASE_URL || '/'
  const arcadeFont = { fontFamily: '"Lilita One", "Baloo 2", Manrope, sans-serif' }
  const NAVY = '#0d2f55'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 55, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 860, maxWidth: '96vw', borderRadius: 20, overflow: 'hidden', color: 'var(--ink)', background: 'rgba(255,255,255,.97)', border: '1px solid var(--gold-line)', boxShadow: '0 24px 60px rgba(2,20,50,.35)' }}>

        {/* header: the same dark strip as Luna's Writing Nook on the home page, her backdrop faint behind it */}
        <div style={{ position: 'relative', padding: '12px 22px 12px', color: '#fff', backgroundImage: `linear-gradient(90deg, rgba(13,36,64,.96) 0%, rgba(13,36,64,.9) 50%, rgba(13,36,64,.7) 100%), url(${BASE}zone/backdrop.webp)`, backgroundSize: 'cover', backgroundPosition: 'center 30%', borderBottom: '1px solid var(--gold-line)' }}>
          <button onClick={onClose} aria-label={t('Close')} style={{ position: 'absolute', top: 12, right: 14, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.35)', color: '#fff', fontSize: 17, fontWeight: 800, display: 'grid', placeItems: 'center' }}>×</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0, marginRight: 'auto' }}>
              <div style={{ ...arcadeFont, fontSize: 'clamp(24px, 2.6vw, 32px)', lineHeight: 1, letterSpacing: '.02em' }}>
                <span style={{ color: '#fff' }}>{t('FLUENCY')}</span> <span style={{ color: '#f5b400' }}>{t('ZONE')}</span>
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.8)', marginTop: 4 }}>{t('Tap a tile and we pick the game. Score 90% for 20 coins, 70% for 10. Under 70% and you play that tile again.')} {t('Grade {n}', { n: grade })}.</div>
            </div>
            <div style={{ flexShrink: 0, marginRight: 40, background: 'rgba(255,255,255,.1)', border: '1px solid var(--gold-line)', borderRadius: 999, padding: '6px 16px 6px 12px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 18 }}>
              <Coin size={18} />{earned}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.1)', border: '1px solid var(--gold-line)', borderRadius: 999, padding: '7px 14px', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', order: 3, marginLeft: 'auto' }}>
              <span style={{ letterSpacing: .6 }}>{t('ROUND')} {grid?.round || 1}</span>
              <span style={{ display: 'inline-flex', gap: 5 }} aria-label={t('{done} of {total} cleared', { done: doneCount, total: inPlay.length })}>
                {inPlay.map((tile) => <span key={tile.id} style={{ width: 9, height: 9, borderRadius: '50%', background: tile.done ? '#f5b400' : 'rgba(255,255,255,.28)', boxShadow: tile.done ? '0 0 6px #f5b400' : 'none' }} />)}
              </span>
              <span style={{ color: 'rgba(255,255,255,.35)' }}>|</span>
              <span>🏆 {t('Clear the board for')} <span style={{ color: '#f5b400' }}>{t('+50 bonus coins')}</span></span>
            </div>
          </div>
        </div>

        {allClear && (
          <div style={{ margin: '14px 22px 0', display: 'flex', alignItems: 'center', gap: 14, background: '#fff8e1', border: '1px solid var(--gold-line)', borderRadius: 14, padding: '10px 16px' }}>
            <span style={{ fontSize: 26 }}>🏆</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: NAVY }}>{t('Board cleared!')} {grid?.bonusPaid ? t('+50 bonus coins banked.') : ''}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{t('Reset the board for a fresh round of surprise games.')}</div>
            </div>
            <button className="btn" disabled={busy} onClick={onReset}>↺ {t('Reset & play again')}</button>
          </div>
        )}

        {/* tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, padding: '14px 22px 4px' }}>
          {tiles.map((tile) => {
            const soon = tile.options.length === 0
            const done = !!tile.done
            const justNow = lastReveal === tile.id
            const played = done ? byKey[tile.done.game] : null
            return (
              <div key={tile.id} className={`zone-tile${!done && !soon ? ' playable' : ''}`} role={!done && !soon ? 'button' : undefined} tabIndex={!done && !soon ? 0 : -1}
                onClick={() => !done && !soon && !busy && onPlay(tile)} onKeyDown={(e) => !done && !soon && !busy && (e.key === 'Enter' || e.key === ' ') && onPlay(tile)}
                style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                background: done ? '#f4f6f8' : '#fff', border: `1px solid ${done ? '#cbd8e2' : 'var(--gold-line)'}`,
                boxShadow: justNow ? '0 0 0 3px #f5b400, 0 8px 24px rgba(245,180,0,.3)' : 'var(--shadow)', opacity: soon ? .75 : 1, cursor: !done && !soon ? 'pointer' : 'default' }}>
                {/* art panel cropped from her card render; the crops are ~2.2:1 so cover shows them whole */}
                <div aria-hidden style={{ width: '100%', aspectRatio: '720 / 328', backgroundImage: `url(${BASE}zone/${tile.id}.webp)`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid var(--gold-line)', filter: done ? 'saturate(.2) brightness(.85)' : soon ? 'saturate(.5)' : 'none' }} />
                {done && <span aria-hidden style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: '#2e9e6b', border: '2px solid #fff', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>✓</span>}
                {soon && <span aria-hidden style={{ position: 'absolute', top: 8, right: 10, fontSize: 14 }}>🔒</span>}
                <div style={{ padding: '8px 12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: NAVY, lineHeight: 1.15 }}>{tile.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, minHeight: 15 }}>{tile.blurb}</div>
                  <div style={{ flex: 1 }} />
                  {done ? (
                    <>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}><Coin /> <b style={{ fontSize: 16, color: NAVY }}>+{tile.done.coins}</b> · {tile.done.pct != null ? `${tile.done.pct}% · ` : ''}{played?.title}</div>
                      <div style={{ marginTop: 6, background: '#2e9e6b', color: '#fff', fontWeight: 800, fontSize: 12.5, borderRadius: 999, padding: '7px 14px', width: '100%' }}>✓ {t('Completed')}</div>
                    </>
                  ) : soon ? (
                    <div style={{ marginTop: 18, border: '1px solid var(--line)', color: 'var(--muted)', fontWeight: 800, fontSize: 11, letterSpacing: 1, borderRadius: 999, padding: '7px 14px', width: '100%' }}>{t('COMING SOON')}</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: lastMiss === tile.id ? '#b23b3b' : 'var(--muted)' }}>{lastMiss === tile.id ? <>{t('Under 70% · try again')}</> : <><Coin /> {t('up to')} <b style={{ fontSize: 15, color: NAVY }}>+{maxCoinsFor(tile.options)}</b></>}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>{tile.options.length === 1 ? tile.options[0].title : t('Surprise: {n} games in the mix', { n: tile.options.length })}</div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ padding: '8px 22px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
          <Coin /> {t('20 coins for 90%+, 10 for 70%+. Every round pays')} <b style={{ color: NAVY }}>{t('double coins')}</b> {t('in ClassCade')} <span style={{ color: '#f5b400' }}>✦</span>
        </div>
      </div>
    </div>
  )
}

/* ---- Free Write chooser: revise an unfinished story or start fresh ---- */
function FreeWriteModal({ stories, onPick, onNew, onClose, onBank, busy }) {
  const t = useT()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }} onClick={onClose}>
      <div className="card" style={{ width: 500, maxWidth: '94vw', padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>🕊️</span>
          <b style={{ fontSize: 18 }}>{t('Free Write')}</b>
          <button onClick={onClose} aria-label={t('Close')} style={{ marginLeft: 'auto', fontSize: 22, color: 'var(--muted)' }}>×</button>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 14px' }}>{t('You have unfinished stories — pick one up where you left off, or start something brand new.')}</p>

        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: .5, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 8 }}>✏️ {t('Revise stories')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
          {stories.map(({ sub, a, wcount, excerpt }) => (
            <button key={sub.id} onClick={() => onPick(sub.id)} disabled={busy}
              style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', border: '1px solid var(--line)', borderRadius: 12, padding: '11px 14px', background: '#fff' }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 14 }}>{a.title}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {excerpt || t('Nothing written yet')} · {t('{n} words', { n: wcount })} · {t('Draft {n}', { n: sub.drafts.length })}
                </span>
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--link)', whiteSpace: 'nowrap' }}>{t('Revise →')}</span>
            </button>
          ))}
        </div>

        <button className="btn" disabled={busy} onClick={onNew} style={{ width: '100%', justifyContent: 'center', padding: '11px 0' }}>
          ✨ {t('Start new writing piece')}
        </button>
        {onBank && (
          <button onClick={onBank} style={{ width: '100%', marginTop: 10, color: 'var(--link)', fontSize: 13, fontWeight: 800 }}>
            🗂️ {t('See everything in my Writing Bank →')}
          </button>
        )}
      </div>
    </div>
  )
}


/* ---- Full assignments list (owns its filter state) ---- */
function AssignmentsCard({ rows, busy, begin, headerAction }) {
  const t = useT()
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
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 10px' }}>
        <div className="seg">
          {['active', 'completed'].map((k) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {k === 'active' ? t('Active assignments') : t('Completed')}
            </button>
          ))}
        </div>
        {headerAction && <><span style={{ flex: 1 }} />{headerAction}</>}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: '#f8fbfd', flexWrap: 'wrap' }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('🔍 Search assignments…')}
          style={{ flex: 1, minWidth: 140, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 13 }} />
        <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)} style={selStyle}>
          <option value="all">{t('All formats')}</option>
          <option value="SCR">{t('SCR only')}</option>
          <option value="ECR">{t('ECR only')}</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selStyle}>
          {types.map((ty) => <option key={ty} value={ty}>{ty === 'all' ? t('All types') : ty}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={selStyle}>
          <option value="due">{t('Sort: Due date')}</option>
          <option value="title">{t('Sort: Title')}</option>
          <option value="type">{t('Sort: Type')}</option>
          <option value="teacher">{t('Sort: Teacher')}</option>
        </select>
      </div>
      <div style={{ maxHeight: 246, overflowY: 'auto' }}>
        {filtered.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)' }}>{t('Nothing here — try the other tab or clear filters.')}</div>}
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
                <button className={row.status === 'not_started' ? 'btn' : 'btn ghost'} disabled={busy} onClick={() => begin(row)}>
                  {row.status === 'completed' ? t('Review') : row.status === 'in_progress' ? t('Continue') : t('Begin')}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {filtered.length > 3 && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--line)', fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textAlign: 'center' }}>
          ↕ {t('{n} more — scroll the list', { n: filtered.length - 3 })}
        </div>
      )}
    </div>
  )
}

export default function StudentHome({ state, me, onOpen, onReview, onLuna, onQuickWrite, onBank, onWall, onChange }) {
  const t = useT()
  const [homeTab, setHomeTab] = useState('home')
  const [busy, setBusy] = useState(false)
  const [game, setGame] = useState(null) // { key, category } for a grid game; category null when launched elsewhere
  const [lastReveal, setLastReveal] = useState(null)
  const [gridBusy, setGridBusy] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [lastMiss, setLastMiss] = useState(null)
  const [leaveConfirm, setLeaveConfirm] = useState(false)
  const [fwChooser, setFwChooser] = useState(false)
  const [gamePicker, setGamePicker] = useState(false)

  // A grid game finished: record the clear, reveal the coins, refresh state.
  // Closing a zone game before it is finished forfeits the round: ask first.
  function closeGame() {
    if (game?.category && !gameFinished) { setLeaveConfirm(true); return }
    setGame(null); setGameFinished(false)
  }
  async function finishGridGame(result) {
    setGameFinished(true)
    if (!game?.category) return
    const payload = { category: game.category, game: game.key, score: result?.score ?? null, total: result?.total ?? null, accuracy: result?.accuracy ?? null }
    setGridBusy(true)
    try { const r = await api.fluencyFinish(payload); if (r?.passed) { setLastReveal(game.category); setLastMiss(null) } else { setLastMiss(game.category); setLastReveal(null) } await onChange?.() } catch {} finally { setGridBusy(false) }
  }
  const [proofRoom, setProofRoom] = useState(false)
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
    // a finished teacher assignment opens its feedback, not the draft editor
    if (row.sub?.completedAt && !['free', 'quick'].includes(row.a.genre) && onReview) return onReview(row.sub.id)
    if (row.sub) return onOpen(row.sub.id)
    setBusy(true)
    try { const r = await api.start(row.a.id); onOpen(r.submissionId) } finally { setBusy(false) }
  }

  const dc = state.dailyChallenge

  return (
    <div>
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `url(${import.meta.env.BASE_URL || '/'}bg-stars.jpg) center / cover no-repeat`, opacity: .22 }} />
      {game?.key === 'typing'
        ? <TypingGame grade={me.gradeLevel ?? 6} onClose={closeGame} onChange={onChange} onFinished={(r) => finishGridGame(r)} payHere={!game?.category} />
        : game && <FluencyGame gameKey={game.key} onClose={closeGame} onFinished={(r) => finishGridGame(r)} />}
      {leaveConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 95 }} onClick={() => setLeaveConfirm(false)}>
          <div className="card" style={{ width: 400, maxWidth: '92vw', padding: '22px 24px', border: '1px solid var(--gold-line)', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 34 }}>⚠️</div>
            <div style={{ fontWeight: 800, fontSize: 17, margin: '6px 0 4px' }}>{t('Leave this game?')}</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.45 }}>{t("This round won't count. To clear the tile you'll need to start the game over and finish it.")}</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <button className="btn" onClick={() => setLeaveConfirm(false)} style={{ background: 'var(--good)' }}>{t('Keep playing')}</button>
              <button onClick={() => { setLeaveConfirm(false); setGame(null); setGameFinished(false) }} style={{ background: '#fff', border: '1.5px solid var(--line)', borderRadius: 10, padding: '9px 16px', fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{t('Leave anyway')}</button>
            </div>
          </div>
        </div>
      )}
      {proofRoom && <ProofRoom grade={me.gradeLevel ?? 5} onClose={() => setProofRoom(false)} onChange={onChange} />}
      {gamePicker && (
        <FluencyGridModal categories={state.fluencyCategories || []} games={state.fluencyGames || []} grid={state.fluencyGrid} grade={me.gradeLevel ?? 6} busy={gridBusy} lastReveal={lastReveal} lastMiss={lastMiss}
          onPlay={(tile) => { const pick = tile.options[Math.floor(Math.random() * tile.options.length)]; setLastReveal(null); setLastMiss(null); setGameFinished(false); setGame({ key: pick.game, category: tile.id }) }}
          onReset={async () => { setGridBusy(true); try { await api.fluencyReset(); await onChange?.() } finally { setGridBusy(false); setLastReveal(null) } }}
          onClose={() => setGamePicker(false)} />
      )}
      {fwChooser && (
        <FreeWriteModal stories={openStories} busy={busy} onBank={() => { setFwChooser(false); onBank && onBank() }}
          onPick={(id) => { setFwChooser(false); onOpen(id) }}
          onNew={() => launch('free')}
          onClose={() => setFwChooser(false)} />
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 14, position: 'relative', zIndex: 1 }}>
        <div className="seg" style={{ position: 'relative', zIndex: 2 }}>
          {[['home', 'Home'], ['data', 'Data & Goals']].map(([k, label]) => (
            <button key={k} className={homeTab === k ? 'on' : ''} onClick={() => setHomeTab(k)}>
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      {/* ================= HOME ================= */}
      {homeTab === 'home' && (<>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <GoalBanner me={me} classFocus={state.classFocus} />
        <div className="home-main">
          <AssignmentsCard rows={rows} busy={busy} begin={begin}
            headerAction={
              <button onClick={onQuickWrite} disabled={busy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 999, fontSize: 13, fontWeight: 800, color: '#fff', cursor: 'pointer',
                  background: 'linear-gradient(120deg,#2f3f96,#1e2a6b)', boxShadow: '0 4px 12px rgba(30,42,107,.35)' }}>
                ⚡ {t('Quick Write')}
              </button>
            } />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <BigTask compact icon="🧾" title={t('The Proof Room')} sub={t("Find what's broken. Make it right.")} grad={['#0f5c8c', '#0a3d5f']} art="vig-quickwrite.jpg" busy={busy} onClick={() => setProofRoom(true)} />
            <BigTask compact icon="✒️" title={t('Free Write')} sub={t('Your page, your rules — write anything')} grad={['#1d40ae', '#152f82']} art="vig-freewrite.jpg" busy={busy} onClick={freeWrite} />
            <BigTask compact icon="🎮" title={t('Fluency Zone')} sub={t('Small games, big progress · double coins')} grad={['#0d5f66', '#08454b']} art="vig-games.jpg" onClick={() => setGamePicker(true)} />
            <BigTask compact icon="🗂️" title={t('Writing Bank')} sub={t('Revise, publish & share your pieces')} grad={['#c8860a', '#a26a04']} art="vig-bank.jpg" onClick={onBank} />
          </div>
        </div>
        <LunaNook modules={state.modules} onLuna={onLuna} />
        <ShareWallStrip state={state} onChange={onChange} onViewAll={onWall} />
        <DailyBanner dc={dc} busy={busy} onGo={peer} />
      </div>
      </>)}

      {/* ================= DATA & GOALS ================= */}
      {homeTab === 'data' && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <DataGoalsTab state={state} me={me} onChange={onChange} onReview={onReview} />
        </div>
      )}
    </div>
  )
}

const selStyle = { padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 13, background: '#fff', fontWeight: 600, color: 'var(--ink)' }
