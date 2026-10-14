import React, { useState, useEffect, useRef } from 'react'
import { api, TRAIT_LABELS } from '../lib/api.js'
import { scoreSubmission } from '../lib/writingScore.js'
import { useT, useLocale } from '../lib/i18n/index.jsx'
import { useSay, Glossed, Directions, Speak } from './Scaffold.jsx'

/*
 * Student "Data & Goals" and "Share Wall" tabs — rendered inside the home page's
 * three-tab switch (Assignments · Data & Goals · Share Wall).
 */

const fmtDate = (d, locale = 'en-US') => d ? new Date(d).toLocaleDateString(locale, { month: 'short', day: 'numeric' }) : ''

/* ---------- Monthly progress chart (compact) ---------- */
function MonthChart({ label, months, data, color, height = 84 }) {
  const t = useT()
  const vals = data.filter((v) => v != null)
  const cur = vals[vals.length - 1], first = vals[0]
  const delta = cur != null && first != null ? +(cur - first).toFixed(1) : 0
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} /> {t(label)}
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {t('now')} <b style={{ color: 'var(--ink)' }}>{cur?.toFixed(1) ?? '—'}</b>/4
          {delta > 0 && <span style={{ color: 'var(--good)', fontWeight: 700 }}> ▲ +{delta}</span>}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height, textAlign: 'right' }}>
          {[4, 2, 0].map((t) => <span key={t} style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1 }}>{t}</span>)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ position: 'relative', height }}>
            {[0, 50].map((p) => <div key={p} style={{ position: 'absolute', top: `${p}%`, left: 0, right: 0, borderTop: '1px solid #edf2f6' }} />)}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: 5, alignItems: 'flex-end', borderBottom: '1px solid var(--line)' }}>
              {months.map((m, i) => {
                const v = data[i]
                return (
                  <div key={m} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }} title={v != null ? t('{m}: {v}/4', { m, v }) : t('{m}: no data', { m })}>
                    <div style={{ width: '62%', height: v != null ? `${(v / 4) * 100}%` : '2px', background: v != null ? color : '#e6e8ec', borderRadius: '7px 7px 2px 2px' }} />
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {months.map((m) => <div key={m} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--muted)', marginTop: 4 }}>{m}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- SCR / ECR writing data (rubric-level, per subject) ---------- */
// Anchor chips keyed by label: RACE (ELA / Social Studies) and CER (Science)
// share letters (C, E, R) with different meanings, so lookups go by label.
const ANCHOR_COLORS = {
  Restate: '#e668c9', Answer: '#6db7f2', Cite: '#7fd483', Explain: '#f2b27e',
  Claim: '#e668c9', Evidence: '#7fd483', Reasoning: '#f2b27e',
}

function DataBar({ pct }) {
  const fill = pct >= 80 ? 'var(--good)' : pct > 0 ? 'var(--gold)' : 'transparent'
  return (
    <div className="data-bar">
      <i style={{ width: `${pct}%`, background: fill }} />
    </div>
  )
}

function EcrCombined({ org, conv }) {
  const t = useT()
  const section = (label, rows) => (
    <>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', color: 'var(--ecr)', margin: '2px 0 1px' }}>{label}</div>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 122, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={t(r.label)}>{t(r.label)}</span>
          <span style={{ width: 34, fontSize: 12, fontWeight: 800, textAlign: 'right', color: r.pct === 0 ? 'var(--muted)' : 'var(--ink)' }}>{r.pct}%</span>
          <DataBar pct={r.pct} />
        </div>
      ))}
    </>
  )
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 6 }}><Glossed text={t('Rubric')} /></div>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 14 }}>{t('ECR domains')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {section(<Glossed text={t('Organization & Development')} />, org)}
        <div style={{ borderTop: '1px solid var(--line)', margin: '6px 0' }} />
        {section(<Glossed text={t('Conventions')} />, conv)}
      </div>
    </div>
  )
}

/* ================= Writing conference: the RDTL protocol =================
 * Research → Decide → Teach → Link. A 4–7 minute teacher-and-writer conference
 * that ends by naming the next goal, so the goal is set WITH the teacher rather
 * than picked off a list. Teaching the writer, not fixing the draft.
 */
const RDTL_STEPS = [
  {
    key: 'research', letter: 'R', label: 'Research', seconds: 120, time: '1–2 min', icon: '🔍',
    aim: 'Tell your teacher what you are working on.',
    moves: [
      'Say what you are working on as a writer today.',
      'Read a little of your writing out loud.',
      'Say which part is giving you trouble.',
      'Your teacher will ask questions — think out loud, there is no wrong answer.',
    ],
  },
  {
    key: 'decide', letter: 'D', label: 'Decide', seconds: 30, time: '30 sec', icon: '🎯',
    aim: 'Hear one thing you did well, then pick one thing to learn.',
    moves: [
      'Your teacher names something you already did well — write it down so you remember it.',
      'Together you pick ONE thing to work on today.',
      'Just one. One thing you can actually use in your next piece.',
    ],
  },
  {
    key: 'teach', letter: 'T', label: 'Teach', seconds: 120, time: '2 min', icon: '🧑‍🏫',
    aim: 'Watch how it works, then try it in your own writing.',
    moves: [
      'Your teacher shows you the strategy using an example.',
      'Say the strategy back in your own words.',
      'Try it right now in your own draft — you keep the pen.',
    ],
  },
  {
    key: 'link', letter: 'L', label: 'Link', seconds: 30, time: '30 sec', icon: '🔗',
    aim: 'Turn what you learned into your goal.',
    moves: [
      'This is not just for today — you will use it every time you write.',
      'Say your goal out loud in your own words so it sticks.',
    ],
  },
]

const mmss = (n) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`

/* One clock for the whole conference — it counts up and never stops, so the
 * teacher can see how long they have been sitting with this writer. */
function MeetingClock() {
  const t = useT()
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setSecs((v) => v + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const long = secs >= 420 // the protocol asks for 4–7 minutes
  return (
    <span title={t('Time in this conference')}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '5px 13px', fontSize: 13, fontWeight: 800,
        fontVariantNumeric: 'tabular-nums', background: long ? 'rgba(245,197,66,.2)' : 'rgba(255,255,255,.14)',
        color: long ? '#f5c542' : '#a8dff5', border: `1px solid ${long ? 'rgba(245,197,66,.5)' : 'rgba(255,255,255,.22)'}` }}>
      ⏱ {mmss(secs)}
    </span>
  )
}

function ConferenceEvidence({ state, me }) {
  const t = useT()
  const say = useSay()
  const [openId, setOpenId] = useState(null)
  const anchors = state.writingData?.ELA?.scr || []
  const mine = state.submissions
    .filter((s) => s.studentId === me.id && !s.isPeerRevision)
    .map((s) => ({ s, a: state.assignments.find((x) => x.id === s.assignmentId) }))
    .filter(({ a }) => a && !['free', 'quick'].includes(a.genre))
  const rows = mine.filter(({ s }) => s.completedAt).sort((x, y) => (x.s.completedAt < y.s.completedAt ? 1 : -1))
  const drafting = mine.filter(({ s }) => !s.completedAt)
  const freeWrites = state.submissions
    .filter((s) => s.studentId === me.id && !s.isPeerRevision)
    .map((s) => ({ s, a: state.assignments.find((x) => x.id === s.assignmentId) }))
    .filter(({ a }) => a && a.genre === 'free')
    .sort((x, y) => ((y.s.completedAt || y.s.drafts[y.s.drafts.length - 1].createdAt) > (x.s.completedAt || x.s.drafts[x.s.drafts.length - 1].createdAt) ? 1 : -1))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflowY: 'auto', paddingRight: 4 }}>
      <div>
        <div className="eyebrow" style={{ color: '#0f97c2' }}>{t('What the writing shows')}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}><Directions text="Look at this together — it is the evidence for the conversation." /></div>
      </div>

      {/* the anchors, small enough to glance at mid-conversation */}
      <div style={{ background: '#f4f8fb', borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, color: 'var(--muted)', marginBottom: 8 }}><Glossed text={t('SCR · STRATEGY ANCHORS')} /></div>
        {anchors.map((r) => (
          <div key={r.k} style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 6 }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: '#fff', background: '#16386b' }}>{r.k}</span>
            <span style={{ fontSize: 12, fontWeight: 700, width: 52, color: 'var(--ink)' }}>{t(r.label)}</span>
            <div style={{ flex: 1, height: 8, background: '#e3ecf2', borderRadius: 5 }}>
              <div style={{ height: '100%', width: `${r.pct}%`, borderRadius: 5, background: r.pct >= 75 ? 'var(--good)' : r.pct >= 50 ? '#e0a51c' : '#c0392b' }} />
            </div>
            <b style={{ fontSize: 11.5, width: 34, textAlign: 'right', color: r.pct >= 75 ? 'var(--good)' : r.pct >= 50 ? '#a37400' : '#c0392b' }}>{r.pct}%</b>
          </div>
        ))}
      </div>

      {drafting.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, color: '#a37400', marginBottom: 8 }}>
            {t('IN PROGRESS RIGHT NOW · {n}', { n: drafting.length })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {drafting.map(({ s, a }) => {
              const draft = s.drafts[s.drafts.length - 1]
              const open = openId === s.id
              const wc = (draft.content || '').trim().split(/\s+/).filter(Boolean).length
              return (
                <div key={s.id} style={{ border: '1.5px solid #f0d9a8', borderRadius: 12, overflow: 'hidden', background: '#fffdf7' }}>
                  <button onClick={() => setOpenId(open ? null : s.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textAlign: 'left', cursor: 'pointer', background: 'transparent' }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: '#fff', background: a.format === 'ECR' ? 'var(--ecr)' : 'var(--scr)', padding: '2px 7px', borderRadius: 6 }}>{a.format || 'SCR'}</span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.25 }}>{a.title}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#a37400', whiteSpace: 'nowrap' }}>{t('Draft {n}', { n: draft.n })} · {t('{n}w', { n: wc })}</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{open ? '▲' : '▼'}</span>
                  </button>
                  {open && (
                    <div style={{ padding: '2px 12px 12px', borderTop: '1px solid #f0d9a8' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .6, color: 'var(--muted)', margin: '10px 0 5px' }}>{t('WHERE THE DRAFT IS NOW')}</div>
                      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: '#33566e', background: '#fff', border: '1px solid var(--line)', borderRadius: 9, padding: '9px 11px', maxHeight: 170, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {(draft.content || '').trim() || <Glossed text={say('Nothing written yet — this is a good place to start the conference.')} />}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, color: 'var(--muted)', marginBottom: 8 }}>
          {t('FINISHED WRITING')}{rows.length ? ` · ${rows.length}` : ''}
        </div>
        {rows.length === 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--muted)', background: '#f4f8fb', borderRadius: 10, padding: '12px 14px' }}>
            <Glossed text={say('Nothing turned in yet — talk about what is in progress instead.')} />
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map(({ s, a }) => {
            const sc = scoreSubmission(a, s)
            const open = openId === s.id
            const tone = sc.pct >= 75 ? 'var(--good)' : sc.pct >= 50 ? '#a37400' : '#c0392b'
            return (
              <div key={s.id} style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                <button onClick={() => setOpenId(open ? null : s.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textAlign: 'left', cursor: 'pointer', background: open ? '#f4f8fb' : '#fff' }}>
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: '#fff', background: a.format === 'ECR' ? 'var(--ecr)' : 'var(--scr)', padding: '2px 7px', borderRadius: 6 }}>{a.format || 'SCR'}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.25 }}>{a.title}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: tone, whiteSpace: 'nowrap' }}>{sc.rubricScore}/{sc.rubricMax} · {sc.pct}%</span>
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>{open ? '▲' : '▼'}</span>
                </button>
                {open && (
                  <div style={{ padding: '2px 12px 12px', borderTop: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .6, color: 'var(--muted)', margin: '10px 0 5px' }}>{t('WHAT THEY WROTE')}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.55, color: '#33566e', background: '#fbfdfe', border: '1px solid var(--line)', borderRadius: 9, padding: '9px 11px', maxHeight: 150, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                      {sc.questions[0].answer.trim() || t('No response recorded.')}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .6, color: 'var(--muted)', margin: '11px 0 5px' }}>{sc.strategyName}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {sc.questions[0].anchors.map((an) => (
                        <div key={an.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, lineHeight: 1.4 }}>
                          <span style={{ width: 17, height: 17, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800, color: '#fff', background: an.hit ? 'var(--good)' : '#c0392b' }}>{an.hit ? '✓' : '✕'}</span>
                          <span style={{ color: an.hit ? 'var(--muted)' : '#33566e', fontWeight: an.hit ? 600 : 700 }}>{t(an.label)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {freeWrites.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, color: '#3b5fb8', marginBottom: 8 }}>
            {t('THEIR OWN FREE WRITES · {n}', { n: freeWrites.length })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {freeWrites.map(({ s, a }) => {
              const draft = s.drafts[s.drafts.length - 1]
              const open = openId === s.id
              const wc = (draft.content || '').trim().split(/\s+/).filter(Boolean).length
              return (
                <div key={s.id} style={{ border: '1px solid #d6dffa', borderRadius: 12, overflow: 'hidden', background: '#fbfcff' }}>
                  <button onClick={() => setOpenId(open ? null : s.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textAlign: 'left', cursor: 'pointer', background: 'transparent' }}>
                    <span style={{ fontSize: 14 }}>{s.published ? '🌟' : '✒️'}</span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, lineHeight: 1.25 }}>{a.title}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#3b5fb8', whiteSpace: 'nowrap' }}>
                      {s.published ? t('Published') : t('Draft {n}', { n: draft.n })} · {t('{n}w', { n: wc })}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{open ? '▲' : '▼'}</span>
                  </button>
                  {open && (
                    <div style={{ padding: '2px 12px 12px', borderTop: '1px solid #d6dffa' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .6, color: 'var(--muted)', margin: '10px 0 5px' }}>
                        {s.published ? t('THE PIECE THEY PUBLISHED') : t('WHERE THIS ONE STANDS')}
                      </div>
                      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: '#33566e', background: '#fff', border: '1px solid var(--line)', borderRadius: 9, padding: '9px 11px', maxHeight: 170, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {(draft.content || '').trim() || t('Started, but nothing written yet.')}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 7 }}>
                        <Glossed text={say('Their own choice of topic — no rubric on this one.')} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {me.goal && (
        <div style={{ background: '#eef6f9', borderRadius: 12, padding: '11px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, color: '#0f97c2' }}>{t('THE GOAL WE SET LAST TIME')}</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3, lineHeight: 1.4 }}>{t(me.goal.text)}</div>
          {me.goal.teachingPoint && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{t('Taught as:')} {me.goal.teachingPoint}</div>}
        </div>
      )}
    </div>
  )
}

function ConferenceProtocol({ teacher, state, me, onClose, onSetGoal }) {
  const t = useT()
  const say = useSay()
  const locale = useLocale()
  const [i, setI] = useState(0)
  const [notes, setNotes] = useState({ working: '', strength: '', teachingPoint: '', strategy: '', tried: false })
  const [goalText, setGoalText] = useState('')
  const [trait, setTrait] = useState('')
  const [saving, setSaving] = useState(false)
  const step = RDTL_STEPS[i]
  const set = (k) => (e) => setNotes((n) => ({ ...n, [k]: e.target.value }))

  // the goal starts life as the teaching point — the writer can reword it
  useEffect(() => {
    if (i === 3 && !goalText && notes.teachingPoint.trim()) setGoalText(notes.teachingPoint.trim())
  }, [i])

  async function finish() {
    if (!goalText.trim()) return
    setSaving(true)
    try {
      await onSetGoal({
        text: goalText.trim(), trait: trait || null, source: 'conference',
        strength: notes.strength.trim(), teachingPoint: notes.teachingPoint.trim(), strategy: notes.strategy.trim(),
      })
    } finally { setSaving(false) }
  }

  const field = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 14, marginTop: 6 }
  const lbl = { fontSize: 12, fontWeight: 800, letterSpacing: .6, textTransform: 'uppercase', color: '#16386b' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 70, padding: 16 }} onClick={onClose}>
      <div className="card" style={{ width: 1180, maxWidth: '97vw', height: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }} onClick={(e) => e.stopPropagation()}>

        {/* header */}
        <div style={{ padding: '18px 22px 14px', background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 62%,#0e2748 100%)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🤝</span>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 18 }}>{t('Writing Conference')}</b>
              <div style={{ fontSize: 12.5, color: '#a8dff5', fontWeight: 700, marginTop: 2 }}>
                {t('You and {teacher}', { teacher })} · {t('about 5 minutes')} · {t('Research')} · {t('Decide')} · {t('Teach')} · {t('Link')}
              </div>
            </div>
            <MeetingClock />
            <button onClick={onClose} style={{ color: '#a8dff5', fontSize: 22, background: 'none', cursor: 'pointer', marginLeft: 4 }}>×</button>
          </div>

          {/* step rail */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
            {RDTL_STEPS.map((st, idx) => {
              const done = idx < i, cur = idx === i
              return (
                <React.Fragment key={st.key}>
                  {idx > 0 && <span style={{ flex: 1, height: 3, borderRadius: 3, background: done || cur ? 'linear-gradient(90deg,#f5c542,#e89a00)' : 'rgba(255,255,255,.22)' }} />}
                  <button onClick={() => setI(idx)} title={t(st.label)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 999, padding: '6px 13px', cursor: 'pointer',
                      background: cur ? 'linear-gradient(120deg,#f5c542,#e89a00)' : done ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.14)',
                      color: cur ? '#3d2c00' : done ? '#16386b' : 'rgba(255,255,255,.8)', fontWeight: 800, fontSize: 12.5,
                      border: cur ? '1.5px solid rgba(255,235,170,.9)' : '1.5px solid transparent' }}>
                    <span style={{ fontSize: 13 }}>{done ? '✓' : st.letter}</span>{t(st.label)}
                  </button>
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* evidence on the left, the protocol on the right */}
        <div className="conf-split" style={{ flex: 1, minHeight: 0 }}>
          <div style={{ borderRight: '1px solid var(--line)', background: '#fbfdfe', padding: '16px 18px', minHeight: 0, overflow: 'hidden' }}>
            <ConferenceEvidence state={state} me={me} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* body */}
        <div style={{ padding: '20px 22px 8px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 22 }}>{step.icon}</span>
            <b style={{ fontSize: 17 }}>{t(step.label)}</b>
            <span className="pill" style={{ background: '#eef4f8', color: '#16386b' }}>{t('about {time}', { time: t(step.time) })}</span>
          </div>
          {/* RDTL_STEPS stays English at module scope; the level is applied here, at the render site */}
          <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700, margin: '6px 0 12px' }}><Directions text={step.aim} /></div>

          <div style={{ background: '#f4f8fb', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            {step.moves.map((m, mi) => (
              <div key={mi} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.5, marginTop: mi ? 7 : 0 }}>
                <span style={{ color: CONF_CYAN, fontWeight: 800 }}>›</span><span><Glossed text={say(m)} /></span>
              </div>
            ))}
            {/* one Listen for the whole list of moves, not one per line */}
            <Speak text={step.moves.map((m) => say(m)).join(' ')} style={{ marginTop: 10 }} />
          </div>

          {step.key === 'research' && (
            <label style={{ display: 'block' }}>
              <span style={lbl}>{t('What am I working on?')}</span>
              <textarea value={notes.working} onChange={set('working')} rows={3} placeholder={t('In your own words…')} style={{ ...field, resize: 'vertical' }} />
            </label>
          )}

          {step.key === 'decide' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'block' }}>
                <span style={lbl}>{t('What I already did well')}</span>
                <input value={notes.strength} onChange={set('strength')} placeholder={t('I backed up my reason with a detail from the text…')} style={field} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={lbl}>{t('The one thing I am learning today')}</span>
                <input value={notes.teachingPoint} onChange={set('teachingPoint')} placeholder={t('Say what the other side thinks before I answer it.')} style={field} />
              </label>
            </div>
          )}

          {step.key === 'teach' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'block' }}>
                <span style={lbl}>{t('The strategy I am trying')}</span>
                <input value={notes.strategy} onChange={set('strategy')} placeholder={t('We used "The Big Move," paragraph 3, as our example')} style={field} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, background: '#f4f8fb', borderRadius: 10, padding: '11px 14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={notes.tried} onChange={(e) => setNotes((n) => ({ ...n, tried: e.target.checked }))} style={{ width: 17, height: 17 }} />
                {t('I tried it in my own writing')}
              </label>
            </div>
          )}

          {step.key === 'link' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(notes.strength || notes.teachingPoint) && (
                <div style={{ background: '#eef6f9', borderRadius: 12, padding: '12px 16px', fontSize: 13.5, lineHeight: 1.55 }}>
                  {notes.strength && <div><b>{t('What I did well:')}</b> {notes.strength}</div>}
                  {notes.teachingPoint && <div style={{ marginTop: 4 }}><b>{t('What I am learning:')}</b> {notes.teachingPoint}</div>}
                </div>
              )}
              <label style={{ display: 'block' }}>
                <span style={lbl}>{t('My goal, in my own words')}</span>
                <textarea value={goalText} onChange={(e) => setGoalText(e.target.value)} rows={2} maxLength={140}
                  placeholder={t('Say it the way you would say it to a friend…')} style={{ ...field, resize: 'vertical' }} />
                <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>{goalText.length}/140</span>
              </label>
              <label style={{ display: 'block' }}>
                <span style={lbl}>{t('Which part of writing is this? (optional)')}</span>
                <select value={trait} onChange={(e) => setTrait(e.target.value)} style={{ ...field, background: '#fff' }}>
                  <option value="">{t('Skip this — just my goal')}</option>
                  {Object.entries(TRAIT_LABELS).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}
                </select>
              </label>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px 20px' }}>
          <button onClick={() => (i === 0 ? onClose() : setI(i - 1))}
            style={{ padding: '11px 18px', borderRadius: 11, fontWeight: 800, fontSize: 13.5, color: 'var(--muted)', background: '#eef3f6', cursor: 'pointer' }}>
            {i === 0 ? t('Cancel') : t('← Back')}
          </button>
          <span style={{ flex: 1, fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{say('Step {n} of 4 · work through it together', { n: i + 1 })}</span>
          {i < 3 ? (
            <button onClick={() => setI(i + 1)}
              style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, color: '#fff', cursor: 'pointer',
                background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 58%,#0e2748 100%)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.28), 0 5px 14px rgba(53,195,232,.42)' }}>
              {t('Next: {step} →', { step: t(RDTL_STEPS[i + 1].label) })}
            </button>
          ) : (
            <button onClick={finish} disabled={!goalText.trim() || saving}
              style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: goalText.trim() ? 'pointer' : 'default',
                color: goalText.trim() ? '#3d2c00' : '#9db0c0', background: goalText.trim() ? 'linear-gradient(120deg,#f5c542,#e89a00)' : '#eef0f6',
                boxShadow: goalText.trim() ? '0 0 16px rgba(245,180,0,.5)' : 'none' }}>
              {t('🎯 This is my goal')}
            </button>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const CONF_CYAN = '#0f97c2'

/* ================= Data & Goals tab ================= */
export function DataGoalsTab({ state, me, onChange, onReview }) {
  const t = useT()
  const say = useSay()
  const locale = useLocale() // was referenced below but never declared — crashed as soon as a goal existed
  const subs = state.submissions.filter((s) => s.studentId === me.id)
  const mp = state.monthlyProgress
  // Goals and conferences (Kennady, 2026-10-14): "The conference is locked until the teacher unlocks it on their end. If it isn't
  // time for a new conference, they can 'see my last conference'. I also don't want them to be able to change their goal until
  // they reach it. And they should build their first goal with their teacher during their first conference." "I want every goal
  // to come from a conference": there is no goal picker. Two prototype switches show each case (the teacher's side sets these).
  const [confOpen, setConfOpen] = useState(() => { try { return localStorage.getItem('lscr.confOpen') === '1' } catch { return false } })
  const [demoFirst, setDemoFirst] = useState(() => { try { return localStorage.getItem('lscr.demoFirstConf') === '1' } catch { return false } })
  const setOpen = (v) => { setConfOpen(v); try { localStorage.setItem('lscr.confOpen', v ? '1' : '0') } catch { /* fine */ } }
  const setFirst = (v) => { setDemoFirst(v); try { localStorage.setItem('lscr.demoFirstConf', v ? '1' : '0') } catch { /* fine */ } }
  const [lastConf, setLastConf] = useState(false)
  const goal = demoFirst ? null : me.goal
  const history = demoFirst ? [] : (me.goalHistory || [])
  const firstTime = !goal && !history.length
  const [toast, setToast] = useState(null)
  const [mpTab, setMpTab] = useState('scr')
  const [conferring, setConferring] = useState(false)
  // The page is version C (Kennady, 2026-10-14: "I like version C - that's perfect"): My goal beside At a Glance (with a count of
  // goals reached and their trophies), Conference with my teacher as its own bar, then the year's chart, RACE and the growth story.

  async function achieve() { const r = await api.achieveGoal(); setToast(r.coins); onChange && onChange() }
  async function conferenceGoal(payload) { await api.setGoal(payload); setConferring(false); if (demoFirst) setFirst(false); onChange && onChange() }

  const revisions = subs.reduce((a, s) => a + Math.max(0, s.drafts.length - 1), 0)
  const finished = subs.filter((s) => s.completedAt).length

  const stories = subs.filter((s) => s.drafts.filter((d) => d.traits).length > 1 && !s.isPeerRevision)
  const growthStories = stories.map((sub) => {
    const asg = state.assignments.find((a) => a.id === sub.assignmentId)
    const withTraits = sub.drafts.filter((d) => d.traits)
    const first = withTraits[0], last = withTraits[withTraits.length - 1]
    return (
      <div key={sub.id} className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <b style={{ fontSize: 17 }}>{t('📖 Growth Story — "{title}"', { title: asg.title })}</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t('Draft {a} → Draft {b}', { a: first.n, b: last.n })}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 14px' }}><Directions text="Look what revising did — same writer, {n} drafts apart." vars={{ n: withTraits.length }} /></p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[{ d: first, tag: 'First draft', bg: '#f6f8f9' }, { d: last, tag: 'Latest draft', bg: '#eef6f2' }].map((c) => (
            <div key={c.tag} style={{ background: c.bg, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>{t(c.tag)}</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6, maxHeight: 90, overflow: 'hidden', color: '#3a4149' }}>
                {c.d.content.slice(0, 180)}{c.d.content.length > 180 ? '…' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  })

  const modals = <>
    {toast != null && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.45)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={() => setToast(null)}>
        <div className="card" style={{ padding: 28, width: 380, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: 46 }}>🏆</div>
          <h2 style={{ margin: '6px 0' }}>{t('Goal reached!')}</h2>
          <p style={{ color: 'var(--muted)', margin: '0 0 6px' }}>{say('Amazing work sticking with it. You earned')}</p>
          <div className="coin" style={{ fontSize: 22, justifyContent: 'center' }}><span className="disc" style={{ width: 20, height: 20 }} />+{toast}</div>
          <p style={{ color: 'var(--muted)', margin: '10px 0 0', fontSize: 14 }}>{say('Your next goal will come from your next conference.')}</p>
          <button className="btn" style={{ marginTop: 14 }} onClick={() => setToast(null)}>{t('Done')}</button>
        </div>
      </div>
    )}
    {conferring && <ConferenceProtocol teacher={state.teacher?.name || t('your teacher')} state={state} me={me} onClose={() => setConferring(false)} onSetGoal={conferenceGoal} />}
  </>

  const proto = (
    <div className="dg-proto" role="group" aria-label={t('Prototype controls')}>
      <span>{t('Prototype')}</span>
      <div className="dg-proto-seg">
        <button type="button" aria-pressed={!confOpen} className={!confOpen ? 'on' : ''} onClick={() => setOpen(false)}>🔒 {t('Locked')}</button>
        <button type="button" aria-pressed={confOpen} className={confOpen ? 'on' : ''} onClick={() => setOpen(true)}>🔓 {t('Open')}</button>
      </div>
      <div className="dg-proto-seg">
        <button type="button" aria-pressed={demoFirst} className={demoFirst ? 'on' : ''} onClick={() => setFirst(true)}>{t('First conference')}</button>
        <button type="button" aria-pressed={!demoFirst} className={!demoFirst ? 'on' : ''} onClick={() => setFirst(false)}>{t('Has a goal')}</button>
      </div>
    </div>
  )
  // what the last conference saved with the goal it set (sample words stand in where the demo goal has none)
  const lastSource = goal?.source === 'conference' ? goal : history.slice().reverse().find((g) => g.source === 'conference') || goal || history[history.length - 1]
  const lastCard = lastConf && lastSource && (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.45)', display: 'grid', placeItems: 'center', zIndex: 55, padding: 16 }} onClick={() => setLastConf(false)}>
      <div className="card dg-lastconf" role="dialog" aria-modal="true" aria-labelledby="dg-lastconf-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sw2-reader-x" onClick={() => setLastConf(false)} aria-label={t('Close')}>×</button>
        <span className="dg-kicker">🤝 {t('My last conference')} · {fmtDate(lastSource.setOn, locale)}</span>
        <h2 id="dg-lastconf-title">{t('With {teacher}', { teacher: state.teacher?.name || t('your teacher') })}</h2>
        <dl>
          <dt>{t('What I did well')}</dt><dd>{lastSource.strength || say('You state your opinion clearly, right at the start.')}</dd>
          <dt>{t('What we worked on')}</dt><dd>{lastSource.teachingPoint || say('Giving a real reason, then backing it up with an example.')}</dd>
          <dt>{t('My strategy')}</dt><dd>{lastSource.strategy || say('Use "because" and "for example" in each body paragraph.')}</dd>
          <dt>{t('The goal we set')}</dt><dd><b>{t(lastSource.text)}</b></dd>
        </dl>
      </div>
    </div>
  )

  const d = state.writingData?.ELA
  const series = mpTab === 'scr' ? mp.scr : mp.ecr
  const now = series[series.length - 1], grew = Math.round((now - series[0]) * 10) / 10
  const RACE = [['R', 'Restate'], ['A', 'Answer'], ['C', 'Cite'], ['E', 'Explain']]
  return (
    <div className="dg-b">
      {modals}
      {lastCard}
      {proto}

        <div className="dg-top">
          <div className="card dg-goal c">
            <span className="dg-kicker">🎯 {t('My goal')}</span>
            {goal ? <>
              <b className="dg-goal-text">{t(goal.text)}</b>
              {/* no changing it until it is reached */}
              <div className="dg-goal-acts"><button className="btn gold" onClick={achieve}>{t('🎉 I reached it!')}</button></div>
            </> : firstTime ? <>
              <b className="dg-goal-text">{t("You'll build your first goal with your teacher.")}</b>
              <span className="dg-goal-note">{say('It happens in your first conference.')}</span>
            </> : <>
              <b className="dg-goal-text">{t('🎉 Goal reached!')}</b>
              <span className="dg-goal-note">{say('You and your teacher will set your next goal in your next conference.')}</span>
            </>}
            {history.length > 0 && (
              <div className="dg-trophies" aria-label={t("Goals you've reached")}>
                {history.map((g, i) => <span key={i} className="dg-trophy" title={`${t(g.text)} · ${fmtDate(g.achievedOn, locale)}`}>🏆</span>)}
                <span className="dg-trophy-label">{t("Goals you've reached")}</span>
              </div>
            )}
          </div>
          <section className="card dg-glance c" aria-label={t('At a Glance')}>
            <b className="dg-glance-title">{t('At a Glance')}</b>
            <div className="dg-stats four">
              {[
                { tone: 'teal', icon: '📈', v: <>{now}<small>/4</small></>, k: mpTab === 'scr' ? t('SCR score') : t('ECR score'), up: grew > 0 ? `▲ ${grew} ${t('since Sep')}` : null },
                { tone: 'violet', icon: '✏️', v: revisions, k: t('Revisions made') },
                { tone: 'orange', icon: '✅', v: finished, k: t('Pieces finished') },
                { tone: 'gold', icon: '🏆', v: history.length, k: t('Goals reached') },
              ].map((x, i) => (
                <div key={i} className={'dg-stat ' + x.tone}>
                  <span className="dg-stat-icon" aria-hidden>{x.icon}</span>
                  <div><div className="v">{x.v}</div><div className="k">{x.k}</div>{x.up && <div className="up">{x.up}</div>}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
        {/* the teacher opens a conference; until then it is locked and the last one can be read */}
        <div className={'dg-confer' + (confOpen ? '' : ' locked')}>
          <span className="dg-confer-icon" aria-hidden>{confOpen ? '🤝' : '🔒'}</span>
          {confOpen ? <>
            <div className="dg-confer-words"><b>{firstTime ? t('Your teacher is ready for your first conference!') : t('Your teacher is ready to meet!')}</b>
              <span>{firstTime ? say('Look at your writing together and build your first goal.') : say('Look at your work together and talk about your next step.')}</span></div>
            <button className="btn" onClick={() => setConferring(true)}>{firstTime ? t('Start my first conference →') : t('Start my conference →')}</button>
          </> : <>
            <div className="dg-confer-words"><b>{firstTime ? t('Your first conference is coming soon') : t('Your next conference is coming soon')}</b>
              <span>{say('It opens when your teacher is ready to meet with you.')}</span></div>
            {!firstTime && lastSource && <button className="btn ghost" onClick={() => setLastConf(true)}>{t('See my last conference')}</button>}
          </>}
        </div>

      <div className="dg-main">
        <div className="card dg-chart">
          <div className="dg-row">
            <b>{t('My scores this year')}</b>
            <div className="seg">
              <button className={mpTab === 'scr' ? 'on' : ''} onClick={() => setMpTab('scr')}>SCR</button>
              <button className={mpTab === 'ecr' ? 'on' : ''} onClick={() => setMpTab('ecr')}>ECR</button>
            </div>
          </div>
          {mpTab === 'scr'
            ? <MonthChart label="SCR — Short response" months={mp.months} data={mp.scr} color="var(--scr)" height={120} />
            : <MonthChart label="ECR — Extended response" months={mp.months} data={mp.ecr} color="var(--ecr)" height={120} />}
        </div>
        <div className="card dg-race">
          {mpTab === 'scr' ? <>
            <b>{t('How I use RACE')}</b>
            <div className="dg-race-rows">
              {RACE.map(([k, word]) => { const r = d?.scr.find((x) => x.k === k) || { pct: 0, label: word }; return (
                <div key={k} className="dg-race-row">
                  <span className="anchor-k" style={{ color: ANCHOR_COLORS[r.label] || 'var(--navy)' }}>{k}</span>
                  <span className="dg-race-word">{t(word)}</span>
                  <DataBar pct={r.pct} />
                  <span className="dg-race-pct">{r.pct}%</span>
                </div>) })}
            </div>
          </> : <EcrCombined org={d.ecrOrg} conv={d.ecrConv} />}
        </div>
      </div>

      {/* the growth story stays on the page (her note, 2026-10-14: "Keep the growth story even on the simpler version") */}
      {growthStories}
    </div>
  )
}

/* ================= Share Wall tab ================= */
export const REACTION_KINDS = [
  { key: 'like', glyph: '👍', label: 'Like', bg: '#eaf3fb', fg: '#2f7fd0', on: '#d3e7f8' },
  { key: 'heart', glyph: '❤️', label: 'Heart', bg: '#fff0f1', fg: '#d84a57', on: '#fbdcdf' },
  { key: 'celebrate', glyph: '🎉', label: 'Celebrate', bg: '#fff6e6', fg: '#b97e10', on: '#fbe9c8' },
]

export function ReactionBar({ entry, onReact, size = 'md' }) {
  const t = useT()
  const counts = { like: 0, heart: 0, celebrate: 0, ...(entry.reactions || {}) }
  const mine = entry.myReactions || []
  const pad = size === 'sm' ? '4px 9px' : size === 'lg' ? '8px 16px' : '6px 12px'
  const font = size === 'sm' ? 12 : size === 'lg' ? 15 : 13
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {REACTION_KINDS.map((r) => {
        const on = mine.includes(r.key)
        return (
          <button key={r.key} onClick={() => onReact(entry.id, r.key)} title={on ? t('Undo {reaction}', { reaction: t(r.label).toLowerCase() }) : t(r.label)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 999, padding: pad, fontSize: font, fontWeight: 800, cursor: 'pointer',
              background: on ? r.on : r.bg, color: r.fg, border: on ? `1.5px solid ${r.fg}` : '1.5px solid transparent' }}>
            <span style={{ fontSize: font + 1 }}>{r.glyph}</span>{counts[r.key]}
          </button>
        )
      })}
    </div>
  )
}

export function ShareWallTab({ state, me, onChange, onBack }) {
  const t = useT()
  const say = useSay()
  const subs = state.submissions.filter((s) => s.studentId === me.id)
  const shareWall = state.shareWall || []
  const sharedSubIds = new Set(shareWall.map((e) => e.submissionId).filter(Boolean))
  const shareable = subs.filter((s) => s.completedAt && !s.isPeerRevision && !sharedSubIds.has(s.id))
  const BASE = import.meta.env.BASE_URL || '/'

  async function share(subId) { await api.share(subId); onChange && onChange() }
  async function react(id, type) { await api.react(id, type); onChange && onChange() }

  // A bulletin board of pinned notes (Kennady, 2026-10-14: "I like the board - it's very cute. Let's stick with that."; she had
  // called the old wall "my least favorite UI of the entire platform"). A plain header and a slim "share yours" bar.
  const title = shareable.length ? (state.assignments.find((a) => a.id === shareable[0].assignmentId)?.title || '').trim() || t('Untitled') : ''
  // The whole piece, not just its opening (2026-10-14: "Some of their writing should be longer than what just fits on a post-it.
  // How do we see their full piece?"): a shared piece of your own reads from its latest draft; a classmate's from the wall post.
  const fullOf = (e) => {
    if (Array.isArray(e.body) && e.body.length) return e.body
    const sub = e.submissionId && state.submissions.find((x) => x.id === e.submissionId)
    const text = sub ? (sub.drafts[sub.drafts.length - 1]?.content || '') : ''
    const paras = text.split(/\n\s*\n|\n/).map((x) => x.trim()).filter(Boolean)
    return paras.length ? paras : [e.excerpt]
  }
  const [readId, setReadId] = useState(null)
  const reading = readId && shareWall.find((e) => e.id === readId)
  useEffect(() => {
    if (!reading) return
    const onKey = (ev) => { if (ev.key === 'Escape') setReadId(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [reading])
  const NOTE = ['#fff4c2', '#dff1ff', '#ffe3ec', '#e3f7e6', '#efe6ff', '#ffeedd']
  const who = (e, big) => (
    <div className="sw2-who">
      <span className={'sw2-av' + (big ? ' big' : '')} aria-hidden>{e.avatar}</span>
      <span className="sw2-name">{e.studentName}</span>
      <span className="sw2-genre">{t(e.genre)}</span>
    </div>
  )
  return (
    <div className="wall-page sw2">
      <div aria-hidden className="wall-backdrop" style={{ '--wall-bg': `url(${BASE}bg-enchanted.jpg)` }} />
      <div className="wall-inner">
        {onBack && <button className="backlink on-scene" onClick={onBack}>{t('← Back to Dashboard')}</button>}
        <div className="sw2-head">
          <h1 className="page" style={{ margin: 0 }}>{t('Share Wall')}</h1>
          <span className="sw2-hint">{say('Cheer with')} 👍 ❤️ 🎉</span>
        </div>

        {shareable.length > 0 && (
          <div className="sw2-sharebar">
            <span aria-hidden>✨</span>
            <span><b>{t('You finished "{title}"!', { title })}</b> {say('Proud of it? Share it with the class.')}</span>
            <button className="btn" onClick={() => share(shareable[0].id)}>{t('Share to wall')}</button>
          </div>
        )}

        {!shareWall.length && <div className="card sw2-empty">{t('Nothing on the wall yet. Finish a piece and be the first to share!')}</div>}

        {shareWall.length > 0 && (
          <div className="sw2-board">
            {shareWall.map((e, i) => (
              <article key={e.id} className="sw2-note" style={{ '--note': NOTE[i % NOTE.length], '--tilt': `${[-1.6, 1.2, -0.6, 1.6, -1.1, 0.7][i % 6]}deg` }}>
                <span className="sw2-pin" aria-hidden />
                <h2 className="sw2-title"><button type="button" className="sw2-open" onClick={() => setReadId(e.id)}>{e.title}</button></h2>
                <p className="sw2-ex clamp">{e.excerpt}</p>
                <button type="button" className="sw2-readmore" onClick={() => setReadId(e.id)}>{t('Read it all →')}</button>
                {who(e)}
                <ReactionBar entry={e} onReact={react} size="sm" />
              </article>
            ))}
          </div>
        )}

      </div>

      {reading && (
        <div className="sw2-reader-back" onClick={() => setReadId(null)}>
          <article className="sw2-reader" role="dialog" aria-modal="true" aria-labelledby="sw2-reader-title" onClick={(ev) => ev.stopPropagation()}>
            <button type="button" className="sw2-reader-x" onClick={() => setReadId(null)} aria-label={t('Close')}>×</button>
            <h2 id="sw2-reader-title" className="sw2-title huge">{reading.title}</h2>
            {who(reading, true)}
            <div className="sw2-full">{fullOf(reading).map((para, i) => <p key={i} className="sw2-ex big">{para}</p>)}</div>
            <ReactionBar entry={reading} onReact={react} size="lg" />
          </article>
        </div>
      )}
    </div>
  )
}
