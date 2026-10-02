import React, { useState, useMemo, useEffect } from 'react'
import { api, TRAIT_LABELS } from '../lib/api.js'
import { BRAND } from '../lib/brand.js'
import FluencyGame from './FluencyGame.jsx'
import TypingGame from './TypingGame.jsx'
import ModuleBadge from '../components/ModuleBadge.jsx'
import { DataGoalsTab, ShareWallTab, ReactionBar } from './GrowthPage.jsx'
import { useT, useLocale } from '../lib/i18n/index.jsx'
import { levelOf, MATRIX, SUPPORT_AREAS } from '../lib/languageBridge.js'
import { useSay, Glossed, Directions } from './Scaffold.jsx'
import { todaysQuickPrompt, completedQuickWrite } from './QuickWritePage.jsx'
import { topicStatus, clearingTitle, buildStops, nextStopOf, kindLabel, landName, landImg, LAND_ORDER } from './ProofRoom.jsx'
import { bandGrade, pathsGrade } from '../lib/proofDemo.js'
import { useBandValue } from '../lib/gradeBand.js'
import { writingStreak } from '../lib/streak.js'


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
  const done = 4, total = 6 // demo figures, as the bar has always shown
  // Her "Writing Journey" mockup: deep navy, a glowing crystal-blue edge, the
  // module name in crystal blue, and a glowing button. The current module keeps its gold.
  // One lane (2026-09-24): title, module and progress stacked on the left so
  // Go to my path never wraps under the badges.
  return (
    <div>
      <div className="luna-bar lg journey one-lane">
        <div className="journey-row">
          <div className="journey-who">
            <div style={{ minWidth: 0 }}>
              {/* written out, not the logo (her call, 2026-09-24), with the logo's crystal cluster beside it */}
              <div className="journey-title-row">
                <img className="journey-gem" src={BRAND.crystalSet} alt="" />
                <div className="journey-title">{t("Luna's Writing Adventure")}</div>
              </div>
              {/* the only allowed break is after "Module 1:", never inside the module name */}
              <div className="journey-sub">
                {t('Module {n}', { n: idx + 1 })}: <span className="journey-modname">{current.label}</span>
              </div>
              <div className="journey-progress" title={t('{done} of {total} activities', { done, total })}>
                <div className="journey-track"><div className="journey-fill" style={{ width: `${current.progress * 100}%` }} /></div>
                <b>{done} / {total}</b>
              </div>
            </div>
          </div>

          {/* the six modules, still readable */}
          <div className="luna-bar-mods">
            {modules.map((m, mi) => {
              const cur = m.status === 'in_progress'
              return (
                <button key={m.id} className={`luna-mod${cur ? ' on' : ''}`} onClick={() => onLuna?.(m.id)} title={`${t('Module {n}', { n: mi + 1 })}: ${m.label}`}
                  aria-current={cur ? 'step' : undefined}>
                  <ModuleBadge id={m.id} size={52} />
                  <span className="luna-mod-label" style={cur ? undefined : { color: 'var(--scene-sky)' }}>
                    {MODULE_SHORT[m.id] ? t(MODULE_SHORT[m.id]) : `M${mi + 1}`}
                  </span>
                </button>
              )
            })}
          </div>

          <span className="journey-divider" aria-hidden />
          <button className="journey-btn" onClick={() => onLuna?.()}>
            {t('Go to my path')} <span aria-hidden>→</span>
          </button>
        </div>
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
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: '6px 0 12px' }}>
          <Directions text="Your averages at a glance — dig deeper in Data & Goals." />
        </p>
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
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{row.a.teacher.display || row.a.teacher.name}</span>
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
/*
 * The Language Bridge strip. The level is set by the teacher from the
 * student's LPAC/TELPAS designation, so this is read-only here — it exists so
 * a student (and anyone demoing) can see what the bridge is turning on for
 * them without opening a piece of writing first.
 */
function BridgeBanner({ level }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const lv = levelOf(level)
  if (!lv) return null
  const rows = SUPPORT_AREAS.map((a) => ({ ...a, got: MATRIX[level]?.[a.id] })).filter((a) => a.got)
  return (
    <div className="card" style={{ padding: '12px 18px', marginBottom: 18, border: `1px solid ${lv.color}44`, background: `linear-gradient(120deg,${lv.color}0e,#fff)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 24 }}>🌉</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="eyebrow">{t('Language Bridge')}</div>
          <div style={{ fontSize: 15.5, fontWeight: 800 }}>
            {t('{n} supports are on for you', { n: rows.length })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            <Directions text="Your teacher set this. The writing you are asked to do is the same as everyone else." />
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: .5, color: '#fff', background: lv.color, borderRadius: 999, padding: '5px 13px' }}>
          {t(lv.label)}
        </span>
        <button onClick={() => setOpen((v) => !v)}
          style={{ fontSize: 12.5, fontWeight: 800, color: lv.color, background: '#fff', border: `1.5px solid ${lv.color}55`, borderRadius: 999, padding: '7px 15px' }}>
          {open ? t('Hide') : t('See what I get')}
        </button>
      </div>
      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${lv.color}33`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 10 }}>
          {rows.map((a) => (
            <div key={a.id} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 11px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .4, color: lv.color, textTransform: 'uppercase' }}>{t(a.label)}</div>
              <div style={{ fontSize: 12.5, color: '#33566e', marginTop: 2, lineHeight: 1.4 }}>{t(a.got)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GoalBanner({ me, classFocus }) {
  const t = useT()
  const say = useSay()
  // read-only on Home — the goal is set and managed in a writing conference
  const half = { flex: '1 1 320px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '4px 2px' }
  return (
    <div className="card gold-edge" style={{ padding: '14px 20px', display: 'flex', alignItems: 'stretch', gap: 20, flexWrap: 'wrap',
      background: 'linear-gradient(120deg,#eef6f9,#fff)' }}>
      <div style={half}>
        <span style={{ fontSize: 28 }}>🎯</span>
        {me.goal ? (
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">{t('My goal')}</div>
            <div className="goal-text">{me.goal.text}</div>
          </div>
        ) : (
          <div style={{ minWidth: 0 }}>
            <div className="eyebrow">{t('My goal')}</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              <Glossed text={say("You'll name your next goal in a writing conference with your teacher.")} />
            </div>
          </div>
        )}
      </div>

      <span aria-hidden className="goal-split" style={{ width: 1, background: 'var(--line)', alignSelf: 'stretch' }} />

      <div style={half}>
        <span style={{ fontSize: 28 }}>👥</span>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow" style={{ color: CYAN_TEXT }}>{t('Class focus')}</div>
          {classFocus ? (
            <div className="goal-text">{classFocus.text}</div>
          ) : (
            <div style={{ fontSize: 15, fontWeight: 700 }}>{say('Your class focus shows up here when your teacher sets one.')}</div>
          )}
        </div>
      </div>
    </div>
  )
}

const CYAN_TEXT = '#0f97c2' // cyan dark enough for text on white

/* ---- the studio dashboard: mockup banner cards with art vignettes ---- */
function BigTask({ icon, title, sub, bg, tint, onClick, busy }) {
  // Her Practice mockup: the painting fills the whole tile, the object sits on
  // the left, and the words start a third of the way in beside a gold-ringed
  // icon. `tint` is only the colour behind the painting while it loads.
  const BASE = import.meta.env.BASE_URL || '/'
  return (
    <button className="big-task prac-tile" disabled={busy} onClick={onClick}
      style={{ '--tile-img': `url(${BASE}${bg})`, '--tile-tint': tint }}>
      <span aria-hidden className="prac-art" />
      {/* no icon ring: the painting already says what the card is (her call, 2026-10-01) */}
      <span className="prac-words">
        <span className="prac-title">{title}</span>
        <span className="prac-sub">{sub}</span>
      </span>
      <span aria-hidden className="prac-chev">›</span>
    </button>
  )
}

/* ---- Practice: the Proof Room gets the whole left side (2026-09-30) ---- */
// Her painting across the top, then the student's own topics with their
// progress, so the big space shows what is inside rather than a big picture.
/* The Practice card shows the path as a clean learning path — every clearing as a
 * checklist row with the activities inside it; the next one opens up (her pick, B
 * of A/B, 2026-10-01). The map waits one step in, inside the Lit Labyrinth. */
const plainPassage = (text) => String(text || '').replace(/\[\[([^|\]]*)\|[^\]]*\]\]/g, '$1')
const STOP_GLYPH = { passed: '✓', locked: '🔒', sb: '🌿' }
function stopLabel(stop, t) {
  if (stop.capstone) return t('Final milestone')
  if (stop.state === 'sb') return t('Branch')
  return null
}
function UpNext({ stop, onStart, onMap, compact }) {
  const t = useT()
  const ws = stop.ws
  const act = ws.activities?.[0]
  return (
    <div className={'lp-next' + (compact ? ' compact' : '')}>
      {!compact && <div className="lp-next-kicker">{t('Up next')} · {stop.state === 'sb' ? t('Branch') : stop.capstone ? t('Final milestone') : t('Clearing')}</div>}
      {!compact && <div className="lp-next-title">{clearingTitle(ws)}</div>}
      <div className="lp-chips">
        {ws.activities.map((a, i) => <span key={i} className={i === 0 ? 'on' : ''}>{i + 1} {kindLabel(a.kind, t)}</span>)}
      </div>
      {act?.brief && <div className="lp-brief">{act.brief}</div>}
      {act?.text && <div className="lp-passage"><span>{plainPassage(act.text)}</span></div>}
      <div className="lp-next-foot">
        <button className="btn" onClick={onStart}>{stop.state === 'retry' ? t('Try it again →') : t('Start this clearing →')}</button>
        {onMap && <button className="btn ghost" onClick={onMap}>{t('See the map →')}</button>}
      </div>
    </div>
  )
}
function PathChecklist({ stops, next, onStart, onMap }) {
  const t = useT()
  return (
    <ol className="lp lp-b">
      {stops.map((s, i) => (
        <li key={s.ws.id + i} className={'lp-row ' + s.state + (s === next ? ' next' : '') + (s.capstone ? ' cap' : '')}>
          <div className="lp-row-head">
            <span className="lp-dot">{STOP_GLYPH[s.state] || (s.capstone ? '★' : i + 1)}</span>
            <span className="lp-row-name">
              {clearingTitle(s.ws)}
              {stopLabel(s, t) && <span className="lp-step-tag">{stopLabel(s, t)}</span>}
            </span>
            {s !== next && <span className="lp-row-acts">{s.ws.activities.map((a) => kindLabel(a.kind, t)).join(' · ')}</span>}
            <span className="lp-row-state">
              {s.state === 'passed' ? t('Best {n}%', { n: s.best }) : s.state === 'locked' ? t('Locked') : s === next ? t('Up next') : ''}
            </span>
          </div>
          {s === next && <UpNext stop={s} onStart={onStart} onMap={onMap} compact />}
        </li>
      ))}
    </ol>
  )
}

/*
 * The Lit Labyrinth as a progress report (her note, 2026-10-02: "more report /
 * data style and then they can click into the map to continue ... an indication
 * of pre-test to post-test, growth percentages, progression of the lesson that
 * also indicates skill builder"). One path: pre-test -> now, growth, a column per
 * clearing (its Skill Builder beside it) against the 85% mastery line, then the
 * post-test (the Full Topic proof).
 * DEMO: the Lit Labyrinth has no pre-test stop yet, so the baseline is a fixed
 * demo number per path, and a first visit with no progress gets a sample
 * mid-path history so the report has something to show.
 */
const MASTERY = 85
const demoPretest = (id) => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 38 + (h % 17) }
function seedDemoProgress(tp, progress) {
  const [c1, c2] = tp.core || []
  if (!c1) return null
  // v2 (her note, 2026-10-02: "show a Skill Builder was completed for Irregular
  // verbs"): clearing 1 was missed, its Skill Builder done, then mastered;
  // clearing 2 was missed and its Skill Builder is up next.
  const seed = { ...progress, [c1.id]: { best: 100, passed: true } }
  const sb1 = tp.skillBuilders?.[c1.id]
  if (sb1) seed[sb1.id] = { best: 90, passed: true }
  if (c2) seed[c2.id] = { best: 62, passed: false }
  try {
    localStorage.setItem('proofProgress', JSON.stringify(seed))
    const done = JSON.parse(localStorage.getItem('proofDemoSeeded') || '[]')
    localStorage.setItem('proofDemoSeeded', JSON.stringify([...(Array.isArray(done) ? done : []), tp.id]))
    localStorage.setItem('proofDemoVer', '2')
  } catch { /* fine */ }
  return seed
}
// browsers that already hold the v1 sample (or her own play) get the v2 story:
// a done Skill Builder under clearing 1; v1's done Skill Builder under clearing 2 comes off
function upgradeDemoV2(tp, progress, wasSeeded) {
  const [c1, c2] = tp.core || []
  if (!c1) return null
  const next = { ...progress }
  const sb1 = tp.skillBuilders?.[c1.id]
  if (sb1 && next[c1.id]?.passed && !(next[sb1.id]?.best > 0)) next[sb1.id] = { best: 90, passed: true }
  const sb2 = c2 && tp.skillBuilders?.[c2.id]
  if (wasSeeded && sb2 && next[c2.id]?.best === 62 && !next[c2.id]?.passed && next[sb2.id]?.best === 92) delete next[sb2.id]
  try { localStorage.setItem('proofProgress', JSON.stringify(next)); localStorage.setItem('proofDemoVer', '2') } catch { /* fine */ }
  return next
}

// (B, the "journey line", was tried and dropped: her pick 2026-10-02 was "I like A and C".)
function GrowthBadge({ pts, pct }) {
  const t = useT()
  if (pts == null) return null
  return (
    <div className={'gr-growth' + (pts < 0 ? ' down' : '')}>
      <b>{pts >= 0 ? '+' : ''}{pts} pts</b>
      <span>{pct >= 0 ? '+' : ''}{pct}% {t('growth')}</span>
    </div>
  )
}
// C: "scorecard": a report-card table, one row per skill with its own pre-test,
// best score, growth bar and status; the Skill Builder sits as a sub-row under
// the clearing it supports; a mastery ring and pre -> now up top.
const demoSkillPre = (id) => { let h = 7; for (const c of String(id)) h = (h * 33 + c.charCodeAt(0)) >>> 0; return 28 + (h % 30) }
function ReportScorecard({ tp, progress, core, pre, now, pts, pct, mastered, full, next, nextLabel, onStart }) {
  const t = useT()
  // her note (2026-10-02): "it's so busy". One panel (growth + the flow + one
  // button), and a table where only rows with something to say carry color.
  const rows = skillRowsOf(tp, progress, next, t).filter((r) => !r.pretest)
  return (
    <div className="gr grc grc2">
      <div className="grc-panel">
        <div className="grc2-top">
          <div className="grc-prenow">
            <div className="gr-num"><span className="gr-num-l">{t('Pre-test')}</span><span className="gr-num-v pre">{pre}%</span></div>
            <span className="gr-arrow" aria-hidden>→</span>
            <div className="gr-num"><span className="gr-num-l">{full?.best > 0 ? t('Post-test') : t('Now')}</span><span className="gr-num-v">{now == null ? '—' : now + '%'}</span></div>
          </div>
          <GrowthBadge pts={pts} pct={pct} />
          <span className="grc2-mastered"><b>{mastered}/{core.length}</b> {t('skills mastered')}</span>
        </div>
        <div className="grc-go">
          <PathFlow next={next} progress={progress} compact />
          <span style={{ flex: 1 }} />
          {next && <button className="btn" onClick={onStart}>{next.state === 'sb' ? t('Start the Skill Builder →') : t('Continue') + ': ' + nextLabel + ' →'}</button>}
        </div>
      </div>
      <table className="grc-table">
        <thead><tr><th>{t('Skill')}</th><th>{t('Pre-test')}</th><th>{t('Best')}</th><th>{t('Growth')}</th><th>{t('Status')}</th></tr></thead>
        <tbody>
          {rows.map((r) => {
            const [cls, lab] = rowStatus(r, t)
            const quiet = r.best == null && !r.next
            return (
              <tr key={r.key} className={(r.sb ? 'sb ' : '') + (r.post ? 'post ' : '') + (r.next ? 'next ' : '') + (quiet ? 'quiet' : '')}>
                <td className="grc-skill">{r.sb ? <span className="grc-sbmark">↳</span> : <span className={'grc-n ' + (quiet ? '' : cls)}>{r.post ? '★' : r.passed ? '✓' : r.n}</span>}<span>{r.label}</span></td>
                <td className="grc-num">{r.pre != null && !r.post ? r.pre + '%' : ''}</td>
                <td className="grc-num"><b>{r.best != null ? r.best + '%' : ''}</b></td>
                <td>{r.best != null && !r.sb ? <GrowthCell r={r} /> : null}</td>
                <td>{quiet ? <span className="grc-quiet">{lab}</span> : <span className={'grc-pill ' + cls + (r.sb ? ' sb' : '')}>{lab}</span>}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// D: "mastery overview" (her note, 2026-10-02: "Jeremy also wants to be able to
// see at a glance like 'topics mastered' 'domains mastered' and what is in those").
// The C panel with domain / topic / skill counts, then a row per domain (land)
// with every topic in it. DEMO: one more path in another domain is shown as
// finished so a domain reads as mastered.
function seedDemoMastery(mine, leadId, progress) {
  const pick = mine.find(({ tp, st }) => tp.id !== leadId && !st.started && tp.domain !== mine.find((m) => m.tp.id === leadId)?.tp.domain)
  if (!pick) return null
  const tp = pick.tp
  const seed = { ...progress }
  ;(tp.core || []).forEach((w, i) => { seed[w.id] = { best: [100, 92, 96, 88, 100, 94][i % 6], passed: true } })
  if (tp.full) seed[tp.full.id] = { best: 94, passed: true }
  try {
    localStorage.setItem('proofProgress', JSON.stringify(seed))
    const done = JSON.parse(localStorage.getItem('proofDemoSeeded') || '[]')
    localStorage.setItem('proofDemoSeeded', JSON.stringify([...(Array.isArray(done) ? done : []), 'mastery:' + tp.grade]))
  } catch { /* fine */ }
  return seed
}
// one row per skill (C's table), shared by C and D: the clearing, its Skill
// Builder as a sub-row, the post-test last; ws kept so D can list activities
function skillRowsOf(tp, progress, next, t) {
  const core = tp.core || []
  const rows = []
  const isNext = (id) => !!next && next.ws.id === id
  // the flow (her note, 2026-10-02): Pre-test, lesson, activities, Skill Builder if needed, post-test
  rows.push({ key: tp.id + ':pre', pretest: true, label: t('Pre-test') + ' · ' + t('every skill on this path'), best: demoPretest(tp.id), passed: true })
  core.forEach((ws, i) => {
    const p = progress[ws.id] || {}
    rows.push({ key: ws.id, ws, n: i + 1, label: clearingTitle(ws), pre: demoSkillPre(ws.id), best: p.best > 0 ? p.best : null, passed: !!p.passed, next: isNext(ws.id), locked: !p.best && !isNext(ws.id) && i > 0 && !progress[core[i - 1].id]?.passed })
    const sb = tp.skillBuilders?.[ws.id]
    const sp = sb && progress[sb.id]
    if (sb && (sp?.best > 0 || isNext(sb.id))) rows.push({ key: sb.id, ws: sb, sb: true, label: t('Skill Builder'), best: sp?.best > 0 ? sp.best : null, passed: !!sp?.passed, next: isNext(sb.id) })
  })
  if (tp.full) {
    const f = progress[tp.full.id] || {}
    rows.push({ key: tp.full.id, ws: tp.full, post: true, label: t('Post-test') + ' · ' + clearingTitle(tp.full), pre: demoPretest(tp.id), best: f.best > 0 ? f.best : null, passed: !!f.passed, next: isNext(tp.full.id), locked: !(f.best > 0) && !isNext(tp.full.id) })
  }
  return rows
}
const rowStatus = (r, t) => r.pretest ? ['pre', t('Taken')] : r.passed ? ['ok', r.sb ? t('Done') : t('Mastered')] : r.next ? ['next', t('Up next')] : r.best != null ? ['low', t('Below 85%')] : r.locked ? ['off', t('Locked')] : ['off', t('Not started')]
function GrowthCell({ r }) {
  const g = r.best != null && r.pre != null ? r.best - r.pre : null
  return (
    <span className="grc-growth">
      {r.pre != null && (
        <span className="grc-bar" title={r.best != null ? `${r.pre}% → ${r.best}%` : `${r.pre}%`}>
          <i className="grc-m" style={{ left: MASTERY + '%' }} />
          {r.best != null && <span className="grc-fill" style={{ left: Math.min(r.pre, r.best) + '%', width: Math.abs(r.best - r.pre) + '%' }} />}
          <span className="grc-d pre" style={{ left: r.pre + '%' }} />
          {r.best != null && <span className={'grc-d ' + (r.passed ? 'ok' : 'low')} style={{ left: r.best + '%' }} />}
        </span>
      )}
      {g != null && <em className={g >= 0 ? 'up' : 'down'}>{g >= 0 ? '+' : ''}{g}</em>}
    </span>
  )
}
// the five stages every path runs (her flow, 2026-10-02), with where the student is
function PathFlow({ next, progress, compact = false }) {
  const t = useT()
  const steps = [['pre', t('Pre-test')], ['lesson', t('Lesson')], ['acts', t('Activities')], ['sb', t('Skill Builder')], ['post', t('Post-test')]]
  const cur = !next ? 'done' : next.capstone ? 'post' : next.state === 'sb' ? 'sb' : (progress[next.ws.id]?.best > 0 ? 'acts' : 'lesson')
  const at = steps.findIndex(([k]) => k === cur)
  return (
    <ol className={'grf' + (compact ? ' compact' : '')} aria-label={t('How a path works')}>
      {steps.map(([k, label], i) => (
        <li key={k} className={(cur === 'done' || i < at ? 'done' : i === at ? 'cur' : '') + (k === 'sb' ? ' opt' : '')}>
          <span className="grf-n">{cur === 'done' || i < at ? '✓' : i + 1}</span>
          <span className="grf-l">{label}{k === 'sb' && <small>{t('if needed')}</small>}</span>
        </li>
      ))}
    </ol>
  )
}
const Chevron = ({ open }) => <span className={'gre-chev' + (open ? ' open' : '')} aria-hidden>›</span>

// D: C + the old D in one drill-down (her ask, 2026-10-02: "combine C and D
// where the skills are drop-downs and we can see the full list of
// activities"). Domains -> topics -> skills -> activities. The domain and topic
// the student is working in open on arrival.
function ReportMastery({ mine, progress, grade, lead, next, onStart, onMap, onOpen }) {
  const t = useT()
  const doms = LAND_ORDER.map((d) => {
    const list = mine.filter(({ tp }) => tp.domain === d)
    const done = list.filter(({ st }) => st.finished).length
    return { d, list, done, mastered: list.length > 0 && done === list.length }
  })
  const domMastered = doms.filter((x) => x.mastered).length
  const topicsDone = mine.filter(({ st }) => st.finished).length
  const skillsAll = mine.reduce((n, { tp }) => n + (tp.core || []).length, 0)
  const skillsDone = mine.reduce((n, { tp }) => n + (tp.core || []).filter((w) => progress[w.id]?.passed).length, 0)
  const nowOf = (tp) => {
    const full = tp.full && progress[tp.full.id]
    const tried = (tp.core || []).map((w) => progress[w.id]?.best || 0).filter((b) => b > 0)
    return full?.best > 0 ? full.best : tried.length ? Math.round(tried.reduce((a, b) => a + b, 0) / tried.length) : null
  }
  const growth = mine.filter(({ st }) => st.started).map(({ tp }) => { const n = nowOf(tp); return n == null ? null : n - demoPretest(tp.id) }).filter((g) => g != null)
  const avgGrowth = growth.length ? Math.round(growth.reduce((a, b) => a + b, 0) / growth.length) : null
  const nextLabel = next ? (next.state === 'sb' ? t('Skill Builder') + ': ' + clearingTitle(next.ws) : next.capstone ? t('Post-test') : clearingTitle(next.ws)) : null

  const [open, setOpen] = useState(() => ({ [lead?.tp.domain]: true, [lead?.tp.id]: true }))
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }))

  return (
    <div className="gr grd gre">
      {/* her note (2026-10-02): no blue box - "a smaller: 1/5 domains, 1/6 topics,
          average growth ... so we can bring all the other stuff up" */}
      <div className="gre-strip">
        <span className="gre-stat"><b>{domMastered}<small>/{doms.length}</small></b>{t('domains mastered')}</span>
        <span className="gre-stat"><b>{topicsDone}<small>/{mine.length}</small></b>{t('topics mastered')}</span>
        {avgGrowth != null && <span className={'gre-stat growth' + (avgGrowth < 0 ? ' down' : '')}><b>{avgGrowth >= 0 ? '+' : ''}{avgGrowth}</b>{t('pts average growth')}</span>}
        <span style={{ flex: 1 }} />
        {next && <button className="btn gre-go" onClick={onStart} title={t('Up next') + ': ' + nextLabel}>{t('Continue')}: {nextLabel} →</button>}
      </div>

      <div className="grd-doms">
        {doms.map((x) => {
          const dOpen = !!open[x.d] && x.list.length > 0
          return (
            <div key={x.d} className={'gre-dom' + (x.mastered ? ' mastered' : '') + (x.list.length ? '' : ' empty') + (dOpen ? ' open' : '')}>
              <button className="grd-dom gre-dom-head" onClick={() => x.list.length && toggle(x.d)} aria-expanded={dOpen} disabled={!x.list.length}>
                <img className="grd-thumb" src={landImg(x.d)} alt="" />
                <span className="grd-dom-name">
                  <b>{landName(x.d)}</b>
                  <span>{x.list.length ? t('{done} of {n} topics mastered', { done: x.done, n: x.list.length }) : t('No Grade {n} paths yet', { n: grade })}</span>
                  {x.list.length > 0 && <span className="grd-bar"><i style={{ width: (x.done / x.list.length) * 100 + '%' }} /></span>}
                </span>
                <span className="grd-topics">
                  {!dOpen && x.list.map(({ tp, st }) => (
                    <span key={tp.id} className={'grd-chip ' + (st.finished ? 'done' : st.started ? 'here' : 'fresh')}>
                      {st.finished && <i aria-hidden>✓</i>}<span>{tp.short || tp.title}</span>
                    </span>
                  ))}
                </span>
                {x.mastered && <span className="grd-badge">{t('Mastered')}</span>}
                {x.list.length > 0 && <Chevron open={dOpen} />}
              </button>

              {dOpen && (
                <div className="gre-topics">
                  {x.list.map(({ tp, st }) => {
                    const tOpen = !!open[tp.id]
                    const now = nowOf(tp)
                    const pre = demoPretest(tp.id)
                    const cls = st.finished ? 'ok' : st.started ? 'next' : 'off'
                    const rows = tOpen ? skillRowsOf(tp, progress, lead?.tp.id === tp.id ? next : null, t) : []
                    return (
                      <div key={tp.id} className={'gre-topic' + (tOpen ? ' open' : '')}>
                        <button className="gre-topic-head" onClick={() => toggle(tp.id)} aria-expanded={tOpen}>
                          <Chevron open={tOpen} />
                          <span className="gre-topic-name"><b>{tp.short || tp.title}</b><span>{t('{n} of {m} skills mastered', { n: st.cleared, m: st.total })}</span></span>
                          <span className="gre-prenow"><span className="pre">{pre}%</span> → <b>{now == null ? '—' : now + '%'}</b>{now != null && <em className={now - pre >= 0 ? 'up' : 'down'}>{now - pre >= 0 ? '+' : ''}{now - pre}</em>}</span>
                          <span className={'grc-pill ' + cls}>{st.finished ? t('Mastered') : st.started ? t('In progress') : t('Not started')}</span>
                        </button>
                        {tOpen && (
                          <div className="gre-skills">
                            <div className="gre-skill gre-skill-head" aria-hidden>
                              <span>{t('Skill')}</span><span>{t('Pre-test')}</span><span>{t('Best')}</span><span>{t('Growth')}</span><span>{t('Status')}</span>
                            </div>
                            {rows.map((r) => {
                              const [scls, lab] = rowStatus(r, t)
                              const sOpen = !!open[r.key]
                              return (
                                <div key={r.key} className={'gre-skill-wrap' + (r.pretest ? ' pretest' : '') + (r.sb ? ' sb' : '') + (r.post ? ' post' : '') + (r.next ? ' next' : '') + (sOpen ? ' open' : '')}>
                                  <button className="gre-skill" onClick={() => !r.pretest && toggle(r.key)} aria-expanded={r.pretest ? undefined : sOpen}>
                                    <span className="grc-skill">
                                      {r.pretest ? <span className="gre-chev" aria-hidden /> : <Chevron open={sOpen} />}
                                      {r.sb ? <span className="grc-sbmark">↳</span> : <span className={'grc-n ' + scls}>{r.pretest ? 'P' : r.post ? '★' : r.passed ? '✓' : r.n}</span>}
                                      <span>{r.label}</span>
                                    </span>
                                    <span className="grc-num">{r.pre != null ? r.pre + '%' : ''}</span>
                                    <span className="grc-num"><b>{r.best != null ? r.best + '%' : '—'}</b></span>
                                    <GrowthCell r={r} />
                                    <span><span className={'grc-pill ' + scls + (r.sb ? ' sb' : '')}>{lab}</span></span>
                                  </button>
                                  {sOpen && !r.pretest && (
                                    <ol className="gre-acts">
                                      {/* the flow: a short lesson first, then the activities (her note, 2026-10-02) */}
                                      {!r.sb && !r.post && (
                                        <li className={r.best != null ? 'done' : ''}>
                                          <span className="gre-act-n">{r.best != null ? '✓' : '▶'}</span>
                                          <span className="gre-act-kind">{t('Lesson')}</span>
                                          <span className="gre-act-brief">{t('Mini-lesson: watch the model, then try it.')}</span>
                                        </li>
                                      )}
                                      {(r.ws.activities || []).map((a, i) => (
                                        <li key={i} className={r.passed ? 'done' : ''}>
                                          <span className="gre-act-n">{r.passed ? '✓' : i + 1}</span>
                                          <span className="gre-act-kind">{kindLabel(a.kind, t)}</span>
                                          <span className="gre-act-brief">{a.brief || ''}</span>
                                        </li>
                                      ))}
                                      {(!r.ws.activities || !r.ws.activities.length) && <li className="gre-act-none">{t('No activities yet')}</li>}
                                      <li className="gre-act-go"><button className="btn ghost" onClick={() => onOpen(tp.id, r.ws.id)}>{r.passed ? t('Practice again') : t('Open this skill →')}</button></li>
                                    </ol>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GrowthReport({ look = 'a', tp, progress, stops, next, onStart, onMap }) {
  const t = useT()
  const core = tp.core || []
  const pre = demoPretest(tp.id)
  const full = tp.full ? (progress[tp.full.id] || {}) : null
  const cols = [{ key: 'pre', label: t('Pre-test'), score: pre, kind: 'pre' }]
  core.forEach((ws, i) => {
    const p = progress[ws.id] || {}
    const st = stops.find((x) => x.ws.id === ws.id)?.state || 'locked'
    cols.push({ key: ws.id, label: clearingTitle(ws), n: i + 1, score: p.best > 0 ? p.best : null, kind: p.passed ? 'passed' : p.best > 0 ? 'below' : st === 'locked' ? 'locked' : 'open', next: next && next.ws.id === ws.id })
    const sb = tp.skillBuilders?.[ws.id]
    const sp = sb && progress[sb.id]
    if (sb && (sp?.best > 0 || (next && next.ws.id === sb.id))) cols.push({ key: sb.id, label: t('Skill Builder'), score: sp?.best > 0 ? sp.best : null, kind: 'sb', next: next && next.ws.id === sb.id })
  })
  if (tp.full) cols.push({ key: tp.full.id, label: t('Post-test'), score: full.best > 0 ? full.best : null, kind: full.passed ? 'post' : full.best > 0 ? 'below' : 'post-off', next: next && next.ws.id === tp.full.id })

  const tried = core.map((w) => progress[w.id]?.best || 0).filter((b) => b > 0)
  const now = full?.best > 0 ? full.best : tried.length ? Math.round(tried.reduce((a, b) => a + b, 0) / tried.length) : null
  const pts = now == null ? null : now - pre
  const pct = now == null ? null : Math.round(((now - pre) / pre) * 100)
  const mastered = core.filter((w) => progress[w.id]?.passed).length
  const sbDone = core.filter((w) => { const sb = tp.skillBuilders?.[w.id]; return sb && progress[sb.id]?.passed }).length
  const nextLabel = next ? (next.state === 'sb' ? t('Skill Builder') + ': ' + clearingTitle(next.ws) : next.capstone ? t('Post-test') : clearingTitle(next.ws)) : null

  const foot = (
        <div className="gr-foot">
          {nextLabel && <div className="gr-next"><span>{t('Up next')}</span><b>{nextLabel}</b></div>}
          <span style={{ flex: 1 }} />
          <button className="btn ghost" onClick={onMap}>{t('Open the map')}</button>
          {next && <button className="btn" onClick={onStart}>{next.state === 'retry' ? t('Try it again →') : next.state === 'sb' ? t('Start the Skill Builder →') : t('Continue →')}</button>}
        </div>
  )
  const d = { tp, progress, core, pre, now, pts, pct, mastered, sbDone, full, cols, foot, next, nextLabel, onStart, onMap }
  if (look === 'c') return <ReportScorecard {...d} />

  return (
    <div className="gr">
      {/* the way in sits first so it is always above the fold on a Chromebook */}
      {foot}
      <div className="gr-top">
        <div className="gr-hero" aria-label={t('Growth on this path')}>
          <div className="gr-num"><span className="gr-num-l">{t('Pre-test')}</span><span className="gr-num-v pre">{pre}%</span></div>
          <span className="gr-arrow" aria-hidden>→</span>
          <div className="gr-num"><span className="gr-num-l">{full?.best > 0 ? t('Post-test') : t('Now')}</span><span className="gr-num-v">{now == null ? '—' : now + '%'}</span></div>
          {pts != null && (
            <div className={'gr-growth' + (pts < 0 ? ' down' : '')}>
              <b>{pts >= 0 ? '+' : ''}{pts} pts</b>
              <span>{pct >= 0 ? '+' : ''}{pct}% {t('growth')}</span>
            </div>
          )}
        </div>
        <div className="gr-kpis">
          <div className="gr-kpi"><b>{mastered}<small>/{core.length}</small></b><span>{t('Clearings mastered')}</span></div>
          <div className="gr-kpi"><b>{sbDone}</b><span>{t('Skill Builders done')}</span></div>
          <div className="gr-kpi"><b>{full?.best > 0 ? full.best + '%' : '🔒'}</b><span>{full?.best > 0 ? t('Post-test') : t('Post-test opens after clearing {n}', { n: core.length })}</span></div>
        </div>
      </div>

      <div className="gr-chart" role="img" aria-label={t('Scores along the path')}>
        <div className="gr-plot">
          {[0, 50, 100].map((v) => <span key={v} className="gr-grid" style={{ bottom: v + '%' }}><i>{v}</i></span>)}
          <span className="gr-mastery" style={{ bottom: MASTERY + '%' }}><i>{t('Mastery')} {MASTERY}%</i></span>
          {cols.map((c) => (
            <div key={c.key} className={'gr-col ' + c.kind + (c.next ? ' next' : '')} title={`${c.label}: ${c.score == null ? (c.kind === 'locked' || c.kind === 'post-off' ? t('Locked') : t('Not started')) : c.score + '%'}`}>
              <span className="gr-bar" style={{ height: (c.score ?? 0) + '%' }}>
                {c.score != null && <em>{c.score}</em>}
              </span>
              {c.score == null && <span className="gr-empty" aria-hidden>{c.kind === 'locked' || c.kind === 'post-off' ? '🔒' : c.next ? '▶' : ''}</span>}
            </div>
          ))}
        </div>
        <div className="gr-labels">
          {cols.map((c) => (
            <div key={c.key} className={'gr-lab ' + c.kind + (c.next ? ' next' : '')}>
              <span className="gr-lab-k">{c.kind === 'pre' || c.kind.startsWith('post') ? '' : c.kind === 'sb' ? '↳' : c.n}</span>
              <span className="gr-lab-t">{c.label}</span>
            </div>
          ))}
        </div>
        <div className="gr-legend">
          <span><i className="pre" />{t('Pre-test')}</span>
          <span><i className="passed" />{t('Mastered')}</span>
          <span><i className="below" />{t('Below 85%')}</span>
          <span><i className="sb" />{t('Skill Builder')}</span>
          <span><i className="post" />{t('Post-test')}</span>
        </div>
      </div>

    </div>
  )
}

// studio: the grade 8 / high-school Writer's Studio wears it as plain "Skill Practice"
export function ProofRoomFeature({ onOpen, studio = false }) {
  const t = useT()
  const say = useSay()
  const BASE = import.meta.env.BASE_URL || '/'
  const [topics, setTopics] = useState(null)
  useEffect(() => {
    let live = true
    const load = api.proofStudio ? api.proofStudio() : api.proofContent()
    load.then((r) => live && setTopics(r.topics || [])).catch(() => api.proofContent().then((r) => live && setTopics(r.topics || [])).catch(() => live && setTopics([])))
    return () => { live = false }
  }, [])
  let progress = {}
  try { progress = JSON.parse(localStorage.getItem('proofProgress') || '{}') } catch { /* fine */ }
  const [seeded, setSeeded] = useState(null)
  if (seeded) progress = seeded
  // prototype: three ways to present the report (her ask, 2026-10-02: "make 3 different versions ... in an ABC")
  const [look, setLookState] = useState(() => { try { const v = localStorage.getItem('lscr.reportLook'); return v === 'c' || v === 'd' ? v : 'a' } catch { return 'a' } })
  const setLook = (v) => { setLookState(v); try { localStorage.setItem('lscr.reportLook', v) } catch { /* fine */ } }
  const band = useBandValue()
  const grade = bandGrade(band, topics)
  const shown = pathsGrade(band, topics)
  const mine = (topics || []).filter((tp) => Number(tp.grade) === shown)
    .map((tp) => ({ tp, st: topicStatus(tp, progress) }))
    .sort((a, b) => (a.st.finished ? 2 : a.st.started ? 0 : 1) - (b.st.finished ? 2 : b.st.started ? 0 : 1))
  // The path under way leads the card; the list holds the rest.
  const resume = mine.find(({ st }) => st.started && !st.finished)
  const lead = resume || mine[0]
  const stops = lead ? buildStops(lead.tp, progress) : []
  const next = nextStopOf(stops)
  const start = () => (next ? onOpen(lead.tp.id, next.ws.id) : onOpen(lead.tp.id))
  // a path nobody has touched gets the sample history once (see GrowthReport),
  // per path, so every band's demo opens on a report with something in it
  useEffect(() => {
    if (!lead) return
    let done = []
    try { const v = JSON.parse(localStorage.getItem('proofDemoSeeded') || '[]'); done = Array.isArray(v) ? v : [] } catch { /* fine */ }
    let ver = 0
    try { ver = Number(localStorage.getItem('proofDemoVer') || 0) } catch { /* fine */ }
    if (done.includes(lead.tp.id) || resume) {
      if (ver < 2) { const s = upgradeDemoV2(lead.tp, progress, done.includes(lead.tp.id)); if (s) setSeeded(s) }
      return
    }
    const s = seedDemoProgress(lead.tp, progress); if (s) setSeeded(s)
  }, [lead?.tp.id]) // eslint-disable-line react-hooks/exhaustive-deps
  // D needs a finished path in another domain to show a domain mastered (demo, once per grade)
  useEffect(() => {
    if (look !== 'd' || !lead || !topics) return
    let done = []
    try { const v = JSON.parse(localStorage.getItem('proofDemoSeeded') || '[]'); done = Array.isArray(v) ? v : [] } catch { /* fine */ }
    if (done.includes('mastery:' + lead.tp.grade) || mine.some(({ st }) => st.finished)) return
    const s = seedDemoMastery(mine, lead.tp.id, progress); if (s) setSeeded(s)
  }, [look, lead?.tp.id, topics]) // eslint-disable-line react-hooks/exhaustive-deps

  // The path you are on, as its own little trail of clearings (her pick of three,
  // 2026-09-30). The other-path rows came out so the section fits above the fold.
  return (
      <div className={'prf-card prf-c' + (studio ? ' studio' : '')}>
        <div className="prf-c-head" style={studio ? undefined : { '--prf-img': `url(${BASE}lit-valley.jpg)` }}>
          <div className="prf-c-words">
          <span className="proof-kicker">{studio ? t('Skill practice') : t('Practice')} · {t('Grade {n}', { n: grade })}{topics && shown !== grade && <span className="band-borrow">{t('showing Grade {n} paths for now', { n: shown })}</span>}</span>
          <span className="prf-c-title">{studio ? t('Your growth report') : t('The Lit Labyrinth')}</span>
          </div>
          {/* every path lives in the Lit Labyrinth itself; the card keeps only the one you're on */}
          <div className="gr-abc" role="group" aria-label="Report layout (prototype)">
            {[['a', 'A'], ['c', 'C'], ['d', 'D']].map(([k, l]) => <button key={k} className={look === k ? 'on' : ''} aria-pressed={look === k} onClick={() => setLook(k)}>{l}</button>)}
          </div>
          <button className="prf-c-all" onClick={() => onOpen()}>{t('See every path →')}</button>
        </div>
        <div className="prf-body">
          {!topics && <div className="prf-empty">{t('Loading…')}</div>}
          {topics && !lead && <div className="prf-empty">{t('New paths are on the way. No Grade {n} paths are published yet.', { n: grade })}</div>}
          {lead && (
            <div className="prf-c-lead">
{look === 'a' && (
              <div className="prf-c-line">
                <span className="prf-resume-kicker">{resume ? t('Continue Your Path') : t('Start here')}</span>
                <span className="prf-c-path">{lead.tp.short || lead.tp.title}</span>
              </div>
              )}
              {look === 'd' ? <ReportMastery mine={mine} progress={progress} grade={grade} lead={lead} next={next} onStart={start} onMap={() => onOpen(lead.tp.id)} onOpen={(id, wsId) => onOpen(id, wsId)} /> : <GrowthReport look={look} tp={lead.tp} progress={progress} stops={stops} next={next} onStart={start} onMap={() => onOpen(lead.tp.id)} />}
            </div>
          )}
        </div>
      </div>
  )
}

/* ---- Home: the Quick Write block beside the assignments ---- */
function QuickWriteBlock({ state, me, onQuickWrite, busy }) {
  const t = useT()
  const BASE = import.meta.env.BASE_URL || '/'
  const pick = todaysQuickPrompt(state)
  const done = !!completedQuickWrite(state, me.id, pick)
  const streak = writingStreak(state.growthSummary)
  return (
    // The painting sits behind the whole block (her mockup): the wolf fills the
    // top, and the text reads over a navy fade at the bottom.
    <div className="qw-block" style={{ '--qw-img': `url(${BASE}qw-wolf.jpg)` }}>
      <div aria-hidden className="qw-art" />
      <div className="qw-body">
        {/* the label, as a badge: it is the one thing that says what this block is */}
        <div className="qw-label"><span aria-hidden>⚡</span>{t('Quick Write')}</div>
        <div className="qw-prompt">
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--scene-sky)', textTransform: 'uppercase' }}>{t("Today's prompt")}</div>
          <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2, margin: '2px 0 5px', textWrap: 'balance' }}>{pick.title}</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.45, color: 'rgba(255,255,255,.9)' }}>{pick.prompt}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 999, padding: '4px 11px', fontSize: 12, fontWeight: 700 }}>
            🔥 {t('{n} day streak', { n: streak.days })}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,180,0,.18)', border: '1px solid rgba(245,197,66,.55)', borderRadius: 999, padding: '4px 11px', fontSize: 12, fontWeight: 700, color: '#ffe6a3' }}>
            🪙 +10 {t('coins')}
          </span>
        </div>
        {done && (
          <div style={{ fontSize: 12.5, color: 'var(--scene-mist)', lineHeight: 1.4 }}>{t('Done for today. A new prompt comes tomorrow.')}</div>
        )}
        <span style={{ flex: 1 }} />
        <button onClick={onQuickWrite} disabled={busy}
          style={{ width: '100%', padding: '13px 18px', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', color: done ? 'var(--scene-deep)' : '#fff',
            background: done ? '#eaf5fb' : 'linear-gradient(120deg, var(--scene-blue), var(--scene-navy))', border: done ? '1.5px solid #fff' : '2px solid var(--scene-sky)',
            boxShadow: done ? 'none' : '0 0 18px rgba(168,223,245,.4), inset 0 0 12px rgba(168,223,245,.18)' }}>
          {done ? t('✓ See what I wrote →') : t('Start writing →')}
        </button>
      </div>
    </div>
  )
}

/* ---- Daily Challenge banner: navy space theme (mockup) ---- */


function DailyBanner({ dc, busy, onGo }) {
  const t = useT()
  const say = useSay()
  // Pip the squirrel reading in the crystal forest (her mockup, 2026-09-24) sits
  // on the left; the words sit on the navy beside Pip. daily-bg.jpg was the robot.
  return (
    <div className="nova-banner daily-banner" style={{ '--daily-img': `url(${import.meta.env.BASE_URL || '/'}daily-pip.jpg)` }}>
      <span aria-hidden className="daily-art" />
      <div className="daily-words">
        <div className="daily-kicker">
          <span>{t('Daily Challenge')}</span>
          <span className="daily-dot">●</span>
          <span>{t('Revision')}</span>
          {dc?.genre && (<><span className="daily-dot">●</span><span>{dc.genre}</span></>)}
        </div>
        <div className="daily-title">
          {dc?.done
            ? t("Today's challenge is done — nice work! ✓")
            : <Glossed text={say('{author} wrote something rough — can you fix it up?', { author: dc?.author || t('A friend') })} />}
        </div>
        <div className="daily-dir">
          <Directions text={dc?.done
            ? 'A brand-new challenge lands tomorrow. You can still look back at your revision.'
            : "Judge it against the rubric, then rewrite it stronger. It's not yours, so revise boldly!"} />
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '9px 22px', fontSize: 13.5, fontWeight: 800, letterSpacing: .6,
          background: 'linear-gradient(120deg,#f5c542,#e89a00)', color: '#3d2c00', border: '1.5px solid rgba(255,225,140,.9)', boxShadow: '0 0 16px rgba(245,180,0,.55)' }}>
          {t('🪙 EARN 50 COINS!')}
        </span>
      </div>

      {/* glowing CTA */}
      <button disabled={busy} onClick={onGo} className="daily-cta">
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

function ShareWallStrip({ state, onChange, onViewAll, side = false }) {
  const t = useT()
  const wall = (state.shareWall || []).slice(0, side ? 1 : 3)
  async function react(id, type) { await api.react(id, type); onChange && onChange() }
  if (!wall.length) return null
  return (
    <div className={'card' + (side ? ' wall-side' : '')} style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🌟</span>
        <div style={{ flex: 1, minWidth: side ? 140 : 200 }}>
          <b style={{ fontSize: 16 }}>{t('Share Wall')}</b>
          <div className="wall-dir-line" style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            <Directions text="See what other students are writing — cheer them on with 👍 ❤️ 🎉" />
          </div>
        </div>
        <button className="btn ghost" style={{ padding: '7px 15px', fontSize: 13 }} onClick={onViewAll}>{t('View all →')}</button>
      </div>
      <div className="wall-strip">
        {wall.map((e) => (
          <div key={e.id} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '13px 15px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(150deg,#fbfdfe,#fff)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span className="wall-post-av" style={{ width: 34, height: 34, borderRadius: '50%', background: '#eef3f6', display: 'grid', placeItems: 'center', fontSize: 17, flexShrink: 0 }}>{e.avatar}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="wall-post-name" style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.15 }}>{e.studentName}</div>
                <div className="wall-post-meta" style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{e.genre} · {relTime(e.sharedOn, t)}</div>
              </div>
            </div>
            <div className="wall-post-title" style={{ fontSize: 14.5, fontWeight: 800, margin: '9px 0 5px', color: '#0d2f55' }}>{e.title}</div>
            <div className="wall-ex" style={{ fontSize: 12.5, color: '#41586b', lineHeight: 1.5, flex: 1 }}>
              {e.excerpt.slice(0, 120)}{e.excerpt.length > 120 ? '…' : ''}
            </div>
            <div className="wall-react" style={{ marginTop: 11 }}>
              <ReactionBar entry={e} onReact={react} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Fluency Zone: one tile per category; play one, reveal the coins; clear the grid for a bonus ---- */
// Tile art: her enchanted-forest Fluency Zone cards (public/zone/<id>-forest3.webp, 2026-09-24:
// her third set; -forest came out too gold and -forest2 was not right either). Replaced the space-theme set.
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

function FluencyGridModal({ categories, games, grid, grade, busy, onPlay, onReset, onClose, lastReveal }) {
  const t = useT()
  const say = useSay()
  const byKey = Object.fromEntries(games.map((g) => [g.game, g]))
  const playable = (c) => c.games.map((k) => byKey[k]).filter((g) => g && g.kind === 'builtin')
  const cleared = grid?.cleared || {}
  const missed = grid?.missed || {}
  const tiles = categories.map((c) => ({ ...c, options: playable(c), done: cleared[c.id] || null, miss: missed[c.id] || null }))
  const inPlay = tiles.filter((tile) => tile.options.length > 0)
  const doneCount = inPlay.filter((tile) => tile.done).length
  const allClear = inPlay.length > 0 && doneCount === inPlay.length
  const earned = Object.values(cleared).reduce((a, x) => a + (x.coins || 0), 0) + (grid?.bonusPaid ? 50 : 0)
  const BASE = import.meta.env.BASE_URL || '/'
  const NAVY = '#0d2f55'
  const [lockedNote, setLockedNote] = useState(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="zone-backdrop" onClick={onClose}>
      <div className="zone-sheet" role="dialog" aria-modal="true" aria-labelledby="zone-title" onClick={(e) => e.stopPropagation()}>

        {/* header stays on screen; the tiles scroll underneath it */}
        <div className="zone-sheet-head" style={{ padding: '16px 22px 14px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow">{t('The Writing Studio')} · {t('Grade {n}', { n: grade })}</div>
              <h2 id="zone-title" className="page" style={{ margin: '2px 0 4px', fontSize: 26 }}>{t('Fluency Zone')} <span style={{ color: 'var(--gold)' }}>✦</span></h2>
              <p className="page-sub" style={{ margin: 0, fontSize: 13.5 }}>
                <Directions inline text="Tap a tile and we pick the game. Score 90% for 20 coins, 70% for 10. Under 70% and you play that tile again." />
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ background: '#fff', border: '1px solid var(--gold-line)', borderRadius: 999, padding: '6px 14px 6px 10px', display: 'flex', alignItems: 'center', gap: 7, fontWeight: 800, fontSize: 16, color: NAVY }}>
                <Coin size={16} />{earned}
              </div>
              <button onClick={onClose} aria-label={t('Close')} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--line)', color: 'var(--muted)', fontSize: 18, fontWeight: 700, display: 'grid', placeItems: 'center', background: '#fff' }}>×</button>
            </div>
          </div>
          <div className="zone-progress">
            <div className="zone-progress-top">
              <span>{t('{done} of {total} cleared', { done: doneCount, total: inPlay.length })}</span>
              <span>🏆 {t('+50 bonus coins')}</span>
            </div>
            <div className="zone-progress-track" role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={inPlay.length} aria-label={t('{done} of {total} cleared', { done: doneCount, total: inPlay.length })}>
              <div className="zone-progress-fill" style={{ width: `${inPlay.length ? (doneCount / inPlay.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        <div className="zone-sheet-body">
        {allClear && (
          <div style={{ margin: '14px 22px 0', display: 'flex', alignItems: 'center', gap: 14, background: '#fff8e1', border: '1px solid var(--gold-line)', borderRadius: 14, padding: '10px 16px' }}>
            <span style={{ fontSize: 26 }}>🏆</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: NAVY }}>{t('Board cleared!')} {grid?.bonusPaid ? t('+50 bonus coins banked.') : ''}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{say('Reset the board for a fresh round of surprise games.')}</div>
            </div>
            <button className="btn" disabled={busy} onClick={onReset}>↺ {t('Reset & play again')}</button>
          </div>
        )}

        {/* tiles */}
        {lockedNote && (
          <div className="zone-locked-note" role="status">{t('{name} is already cleared. Reset the board to play it again.', { name: lockedNote })}</div>
        )}
        <div className="zone-grid">
          {tiles.map((tile) => {
            const soon = tile.options.length === 0
            const done = !!tile.done
            const miss = !done && tile.miss
            const justNow = lastReveal === tile.id
            const played = done ? byKey[tile.done.game] : null
            const openable = !done && !soon && !busy
            function activate() {
              if (busy || soon) return
              if (done) { setLockedNote(tile.title); return }
              setLockedNote(null)
              onPlay(tile)
            }
            return (
              <div key={tile.id} className={`zone-tile${openable ? ' playable' : ''}`} role={!soon ? 'button' : undefined} tabIndex={!soon ? 0 : -1}
                aria-disabled={done || undefined}
                title={done ? t('{name} is already cleared. Reset the board to play it again.', { name: tile.title }) : undefined}
                onClick={activate} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), activate())}
                style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                background: done ? '#f4f6f8' : miss ? '#fff8f6' : '#fff', border: `1px solid ${done ? '#cbd8e2' : miss ? '#e08a2b' : 'var(--gold-line)'}`,
                boxShadow: justNow ? '0 0 0 3px #f5b400, 0 8px 24px rgba(245,180,0,.3)' : 'var(--shadow)', opacity: soon ? .75 : 1, cursor: soon ? 'default' : 'pointer' }}>
                {/* art panel cropped from her card render; the crops are ~2.2:1 so cover shows them whole */}
                <div aria-hidden style={{ width: '100%', aspectRatio: '720 / 328', backgroundImage: `url(${BASE}zone/${tile.id}-forest3.webp)`, backgroundSize: 'cover', backgroundPosition: 'center 40%', borderBottom: '1px solid var(--gold-line)', filter: done ? 'saturate(.2) brightness(.85)' : soon ? 'saturate(.5)' : 'none' }} />
                {done && <span aria-hidden style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: '#2e9e6b', border: '2px solid #fff', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>✓</span>}
                {miss && <span aria-hidden style={{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%', background: '#e08a2b', border: '2px solid #fff', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 800 }}>!</span>}
                {soon && <span aria-hidden style={{ position: 'absolute', top: 8, right: 10, fontSize: 14 }}>🔒</span>}
                <div style={{ padding: '8px 12px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: NAVY, lineHeight: 1.15 }}>{tile.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, minHeight: 15 }}><Glossed text={tile.blurb} /></div>
                  <div style={{ flex: 1 }} />
                  {done ? (
                    <>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}><Coin /> <b style={{ fontSize: 16, color: NAVY }}>+{tile.done.coins}</b> · {tile.done.pct != null ? `${tile.done.pct}% · ` : ''}{played?.title}</div>
                      <div className="zone-done">✓ {t('Completed')}</div>
                    </>
                  ) : miss ? (
                    <>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#b23b3b' }}>{tile.miss.pct != null ? `${tile.miss.pct}% · ` : ''}{t('Under 70% · try again')}</div>
                      <div className="zone-retry">{t('Try again')}</div>
                    </>
                  ) : soon ? (
                    <div style={{ marginTop: 18, border: '1px solid var(--line)', color: 'var(--muted)', fontWeight: 800, fontSize: 11, letterSpacing: 1, borderRadius: 999, padding: '7px 14px', width: '100%' }}>{t('COMING SOON')}</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)' }}><Coin /> {t('up to')} <b style={{ fontSize: 15, color: NAVY }}>+{maxCoinsFor(tile.options)}</b></div>
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
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 14px' }}>
          <Directions text="You have unfinished stories — pick one up where you left off, or start something brand new." />
        </p>

        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: .5, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 8 }}>✏️ {t('Revise stories')}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
          {stories.map(({ sub, a, wcount, excerpt }) => (
            <button key={sub.id} onClick={() => onPick(sub.id)} disabled={busy}
              style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', border: '1px solid var(--line)', borderRadius: 12, padding: '11px 14px', background: '#fff' }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 14 }}>{(a.title || '').trim() || t('Untitled')}</span>
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
  // The card stretches to the Quick Write block beside it and
  // the list grows into the room instead of leaving a gap under it. The list is
  // absolutely positioned so it never pushes the row taller itself.
  const listRef = React.useRef(null)
  const [visible, setVisible] = useState(3)
  const t = useT()
  const say = useSay()
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

  // How many rows actually fit, so "N more" is true however tall the list is.
  useEffect(() => {
    const el = listRef.current; if (!el) return
    const count = () => {
      const rowsEls = [...el.querySelectorAll('.assign-row')]
      setVisible(rowsEls.filter((r) => r.offsetTop + r.offsetHeight <= el.clientHeight + 2).length)
    }
    count()
    const ro = new ResizeObserver(count); ro.observe(el)
    return () => ro.disconnect()
  }, [filtered.length, tab])
  const hidden = Math.max(0, filtered.length - visible)

  const listBody = (
    <>
        {filtered.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)' }}>{say('Nothing here — try the other tab or clear filters.')}</div>}
        {filtered.map((row) => {
          const s = STATUS_CHIP[row.status]
          return (
            <div key={row.a.id} className="assign-row">
              <div className="assign-main">
                <div className="assign-title">{row.a.title}</div>
                <div className="assign-meta">
                  <FormatBadge format={row.a.format} />
                  <span className="pill" style={{ background: s.c, color: s.t }}>{row.a.type}</span>
                  {/* just the teacher's name as a student says it: no initials chip */}
                  <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{row.a.teacher.display || row.a.teacher.name}</span>
                </div>
              </div>
              <div className="assign-actions">
                <div className="assign-due"><DueChip dueDate={row.a.dueDate} status={row.status} /></div>
                <div className="assign-go">
                  <button className={row.status === 'not_started' ? 'btn' : 'btn ghost'} disabled={busy} onClick={() => begin(row)}>
                    {row.status === 'completed' ? t('Review') : row.status === 'in_progress' ? t('Continue') : t('Begin')}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
    </>
  )

  return (
    <div className="card" style={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="assign-head">
        <div className="seg">
          {['active', 'completed'].map((k) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {k === 'active' ? t('Active assignments') : t('Completed')}
            </button>
          ))}
        </div>
        {headerAction}
      </div>
      <div className="assign-filters">
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
      <div style={{ position: 'relative', flex: 1, minHeight: 246 }}>
        <div ref={listRef} style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}>{listBody}</div>
      </div>
      {hidden > 0 && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--line)', fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', textAlign: 'center' }}>
          ↕ {t('{n} more — scroll the list', { n: hidden })}
        </div>
      )}
    </div>
  )
}

export default function StudentHome({ state, me, onOpen, onReview, onLuna, onQuickWrite, onBank, onWall, onProofRoom, onChange }) {
  const t = useT()
  const say = useSay()
  // The tab survives a trip away and back (Writing Bank, Free Write, the Daily
  // Challenge all leave the dashboard), so Practice returns to Practice.
  const [homeTab, setHomeTabState] = useState(() => {
    try { return sessionStorage.getItem('lscr.homeTab') || 'home' } catch { return 'home' }
  })
  const setHomeTab = (v) => { setHomeTabState(v); try { sessionStorage.setItem('lscr.homeTab', v) } catch { /* fine */ } }
  const tab = ['home', 'practice', 'data'].includes(homeTab) ? homeTab : 'home'
  const TABS = [['home', 'Home'], ['practice', 'Practice'], ['data', 'Data & Goals']]
  const [busy, setBusy] = useState(false)
  const [game, setGame] = useState(null) // { key, category } for a grid game; category null when launched elsewhere
  const [lastReveal, setLastReveal] = useState(null)
  const [gridBusy, setGridBusy] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
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
    try { const r = await api.fluencyFinish(payload); setLastReveal(r?.passed ? game.category : null); await onChange?.() } catch {} finally { setGridBusy(false) }
  }
  const rows = useMemo(() => {
    const subFor = (aid) => state.submissions.find((s) => s.assignmentId === aid && s.studentId === me.id)
    return state.assignments
      // Only teacher assignments: the student's own Free Writes and Quick Writes live in the Writing Bank.
      .filter((a) => !a.isPeerRevision && !['free', 'quick'].includes(a.genre))
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
        background: `url(${import.meta.env.BASE_URL || '/'}bg-enchanted.jpg) center / cover no-repeat`,
        // Practice already carries five paintings, so the forest behind it steps back.
        opacity: tab === 'practice' ? .1 : .22, transition: 'opacity .3s' }} />
      {game?.key === 'typing'
        ? <TypingGame grade={me.gradeLevel ?? 6} onClose={closeGame} onChange={onChange} onFinished={(r) => finishGridGame(r)} payHere={!game?.category} />
        : game && <FluencyGame gameKey={game.key} onClose={closeGame} onFinished={(r) => finishGridGame(r)} />}
      {leaveConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 95 }} onClick={() => setLeaveConfirm(false)}>
          <div className="card" style={{ width: 400, maxWidth: '92vw', padding: '22px 24px', border: '1px solid var(--gold-line)', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 34 }}>⚠️</div>
            <div style={{ fontWeight: 800, fontSize: 17, margin: '6px 0 4px' }}>{t('Leave this game?')}</div>
            <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.45 }}>
              <Directions text="This round won't count. To clear the tile you'll need to start the game over and finish it." />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <button className="btn" onClick={() => setLeaveConfirm(false)} style={{ background: 'var(--good)' }}>{t('Keep playing')}</button>
              <button onClick={() => { setLeaveConfirm(false); setGame(null); setGameFinished(false) }} style={{ background: '#fff', border: '1.5px solid var(--line)', borderRadius: 10, padding: '9px 16px', fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>{t('Leave anyway')}</button>
            </div>
          </div>
        </div>
      )}
      {gamePicker && (
        <FluencyGridModal categories={state.fluencyCategories || []} games={state.fluencyGames || []} grid={state.fluencyGrid} grade={me.gradeLevel ?? 6} busy={gridBusy} lastReveal={lastReveal}
          onPlay={(tile) => { const pick = tile.options[Math.floor(Math.random() * tile.options.length)]; setLastReveal(null); setGameFinished(false); setGame({ key: pick.game, category: tile.id }) }}
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
        <div className="seg nav-tabs" role="tablist" aria-label={t('Dashboard sections')} style={{ position: 'relative', zIndex: 2 }}>
          {TABS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setHomeTab(k)}>
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      {/* ================= HOME ================= */}
      {tab === 'home' && (<>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <BridgeBanner level={me.supportLevel} />
        <GoalBanner me={me} classFocus={state.classFocus} />
        <div className="home-main stretch">
          <AssignmentsCard rows={rows} busy={busy} begin={begin} />
          <QuickWriteBlock state={state} me={me} onQuickWrite={onQuickWrite} busy={busy} />
        </div>
        <LunaNook modules={state.modules} onLuna={onLuna} />
      </div>
      </>)}

      {/* ================= PRACTICE ================= */}
      {tab === 'practice' && (
        // data-clean: the quiet Practice page (her pick 2026-10-01: A's white cards + B's clean Lit Labyrinth block)
        <div className="practice-view" data-clean="" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1560, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* The Lit Labyrinth takes the whole left side; the rest stack beside it (2026-09-30). */}
          <div className="practice-split">
            <ProofRoomFeature onOpen={onProofRoom} />
            <div className="practice-side">
              <BigTask icon="🪶" title={t('Free Write')} sub={<Glossed text={say('Your page, your rules — write anything')} />} bg="prac-free.jpg" tint="#231d5a" busy={busy} onClick={freeWrite} />
              <BigTask icon="🎮" title={t('Fluency Zone')} sub={<Glossed text={say('Small games, big progress · double coins')} />} bg="prac-fluency.jpg" tint="#0b3a3e" onClick={() => setGamePicker(true)} />
              <BigTask icon="🗂️" title={t('Writing Bank')} sub={<Glossed text={say('Revise, publish & share your pieces')} />} bg="prac-bank.jpg" tint="#4a3010" onClick={onBank} />
              <DailyBanner dc={dc} busy={busy} onGo={peer} />
              {/* the Share Wall fills the space under the side cards (her call, 2026-09-30) */}
              <ShareWallStrip state={state} onChange={onChange} onViewAll={onWall} side />
            </div>
          </div>
        </div>
      )}

      {/* ================= DATA & GOALS ================= */}
      {tab === 'data' && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <DataGoalsTab state={state} me={me} onChange={onChange} onReview={onReview} />
        </div>
      )}
    </div>
  )
}

const selStyle = { padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 13, background: '#fff', fontWeight: 600, color: 'var(--ink)' }
