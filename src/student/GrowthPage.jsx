import React, { useState, useEffect, useRef } from 'react'
import { api, TRAIT_LABELS } from '../lib/api.js'
import { scoreSubmission } from '../lib/writingScore.js'

/*
 * Student "Data & Goals" and "Share Wall" tabs — rendered inside the home page's
 * three-tab switch (Assignments · Data & Goals · Share Wall).
 */

const PRESET_GOALS = [
  { id: 'g_ideas', trait: 'ideas', icon: '💡', text: 'Back up my opinion with strong, specific reasons' },
  { id: 'g_org', trait: 'organization', icon: '🧭', text: 'Organize my writing with a clear beginning, middle, and end' },
  { id: 'g_word', trait: 'word_choice', icon: '🎨', text: 'Swap plain words for exact, vivid ones' },
  { id: 'g_voice', trait: 'voice', icon: '🎤', text: 'Let my voice come through and write to my reader' },
  { id: 'g_fluency', trait: 'sentence_fluency', icon: '🌊', text: 'Vary my sentences so my writing flows when read aloud' },
]

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

/* ---------- Monthly progress chart (compact) ---------- */
function MonthChart({ label, months, data, color, height = 84 }) {
  const vals = data.filter((v) => v != null)
  const cur = vals[vals.length - 1], first = vals[0]
  const delta = cur != null && first != null ? +(cur - first).toFixed(1) : 0
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} /> {label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          now <b style={{ color: 'var(--ink)' }}>{cur?.toFixed(1) ?? '—'}</b>/4
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
                  <div key={m} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%' }} title={v != null ? `${m}: ${v}/4` : `${m}: no data`}>
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
const ANCHOR_MEANING = {
  Restate: 'Restate the question', Answer: 'Answer completely', Cite: 'Cite evidence', Explain: 'Explain your thinking',
  Claim: 'Make a clear claim', Evidence: 'Support it with evidence', Reasoning: 'Explain your reasoning',
}

function DataBar({ pct }) {
  const fill = pct >= 80 ? 'var(--good)' : pct > 0 ? 'var(--gold)' : 'transparent'
  return (
    <div className="data-bar">
      <i style={{ width: `${pct}%`, background: fill }} />
    </div>
  )
}

function ScrPanel({ rows }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Strategy</div>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 14 }}>Anchor adherence</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((r) => (
          <div key={r.label} title={`${r.k} = ${ANCHOR_MEANING[r.label] || r.label}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="anchor-k" style={{ color: ANCHOR_COLORS[r.label] || 'var(--navy)' }}>{r.k}</span>
            <span style={{ width: 42, fontSize: 13, fontWeight: 700 }}>{r.pct}%</span>
            <DataBar pct={r.pct} />
            <span style={{ width: 16, fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, textAlign: 'right' }} title={`${r.n} response${r.n === 1 ? '' : 's'} assessed`}>{r.n}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14 }}>R-A-C-E — Restate, Answer, Cite, Explain</div>
    </div>
  )
}

function EcrCombined({ org, conv }) {
  const section = (label, rows) => (
    <>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase', color: 'var(--ecr)', margin: '2px 0 1px' }}>{label}</div>
      {rows.map((r) => (
        <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 122, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.label}>{r.label}</span>
          <span style={{ width: 34, fontSize: 12, fontWeight: 800, textAlign: 'right', color: r.pct === 0 ? 'var(--muted)' : 'var(--ink)' }}>{r.pct}%</span>
          <DataBar pct={r.pct} />
        </div>
      ))}
    </>
  )
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 6 }}>Rubric</div>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 14 }}>ECR domains</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {section('Organization & Development', org)}
        <div style={{ borderTop: '1px solid var(--line)', margin: '6px 0' }} />
        {section('Conventions', conv)}
      </div>
    </div>
  )
}

function RecentResults({ state, me, onReview }) {
  const rows = state.submissions
    .filter((s) => s.studentId === me.id && s.completedAt && !s.isPeerRevision)
    .map((s) => ({ s, a: state.assignments.find((x) => x.id === s.assignmentId) }))
    .filter(({ a }) => a && !['free', 'quick'].includes(a.genre))
    .sort((x, y) => (x.s.completedAt < y.s.completedAt ? 1 : -1))
    .slice(0, 5)

  if (!rows.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f4f9fc', borderRadius: 10, padding: '14px 16px', fontSize: 13, color: 'var(--muted)' }}>
        🌵 Nothing turned in yet — finished assignments and their feedback land here.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map(({ s, a }) => {
        const sc = scoreSubmission(a, s)
        const strong = sc.pct >= 75
        const mid = sc.pct >= 50
        const tone = strong ? 'var(--good)' : mid ? '#c99312' : '#c0392b'
        const missed = sc.questions[0].anchors.filter((x) => !x.hit)
        return (
          <div key={s.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .4, color: '#fff', background: a.format === 'ECR' ? 'var(--ecr)' : 'var(--scr)', padding: '3px 8px', borderRadius: 7 }}>{a.format || 'SCR'}</span>
                <b style={{ fontSize: 14.5 }}>{a.title}</b>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                Turned in {fmtDate(s.completedAt)} · {a.teacher?.name}
                {missed.length > 0 && <> · next step: <b style={{ color: tone }}>{missed[0].label.toLowerCase()}</b></>}
              </div>
            </div>
            <div style={{ textAlign: 'center', minWidth: 78 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .8, color: 'var(--muted)' }}>RUBRIC</div>
              <b style={{ fontSize: 16, color: tone }}>{sc.rubricScore}<span style={{ fontSize: 12, color: 'var(--muted)' }}>/{sc.rubricMax}</span></b>
            </div>
            <div style={{ textAlign: 'center', minWidth: 78 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .8, color: 'var(--muted)' }}>{sc.strategyName}</div>
              <b style={{ fontSize: 16, color: tone }}>{sc.pct}%</b>
            </div>
            <button className="btn ghost" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }} onClick={() => onReview && onReview(s.id)}>See feedback →</button>
          </div>
        )
      })}
    </div>
  )
}

function WritingDataCard({ writingData, state, me, onReview }) {
  const [top, setTop] = useState('data')
  const [subject, setSubject] = useState('ELA')
  const [fmt, setFmt] = useState('SCR')
  const d = writingData[subject]
  const hasEcr = subject === 'ELA' // Science & Social Studies collect SCR only
  const view = hasEcr ? fmt : 'SCR'
  const scrEmpty = d.scr.every((r) => r.pct === 0 && !r.n)

  return (
    <div className="card gold-edge" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div className="data-title">My writing data</div>
        <div className="seg">
          <button className={top === 'recent' ? 'on' : ''} onClick={() => setTop('recent')}>Recently completed</button>
          {writingData.subjects.map((sub) => (
            <button key={sub} className={top === 'data' && subject === sub ? 'on' : ''} onClick={() => { setTop('data'); setSubject(sub) }}>{sub}</button>
          ))}
        </div>
      </div>

      {top === 'recent' ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 12 }}>Your most recent finished assignments — open one to see the feedback again.</div>
          <RecentResults state={state} me={me} onReview={onReview} />
        </div>
      ) : (<>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 16px' }}>
        {hasEcr ? (
          <div className="seg">
            <button className={view === 'SCR' ? 'on' : ''} onClick={() => setFmt('SCR')}>SCR</button>
            <button className={view === 'ECR' ? 'on' : ''} onClick={() => setFmt('ECR')}>ECR</button>
          </div>
        ) : (
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--scr)' }}>{subject} collects SCR data only</span>
        )}
        <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>vs. the grading rubric</span>
      </div>

      {view === 'SCR' ? (
        scrEmpty ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f4f9fc', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'var(--muted)' }}>
            🌵 Nothing here yet — data appears when Kayla answers {subject} prompts.
          </div>
        ) : (
          <ScrPanel rows={d.scr} />
        )
      ) : (
        <EcrCombined org={d.ecrOrg} conv={d.ecrConv} />
      )}
      </>)}
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
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSecs((v) => v + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const long = secs >= 420 // the protocol asks for 4–7 minutes
  return (
    <span title="Time in this conference"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 999, padding: '5px 13px', fontSize: 13, fontWeight: 800,
        fontVariantNumeric: 'tabular-nums', background: long ? 'rgba(245,197,66,.2)' : 'rgba(255,255,255,.14)',
        color: long ? '#f5c542' : '#a8dff5', border: `1px solid ${long ? 'rgba(245,197,66,.5)' : 'rgba(255,255,255,.22)'}` }}>
      ⏱ {mmss(secs)}
    </span>
  )
}

function ConferenceEvidence({ state, me }) {
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
        <div className="eyebrow" style={{ color: '#0f97c2' }}>What the writing shows</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Look at this together — it is the evidence for the conversation.</div>
      </div>

      {/* the anchors, small enough to glance at mid-conversation */}
      <div style={{ background: '#f4f8fb', borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, color: 'var(--muted)', marginBottom: 8 }}>SCR · STRATEGY ANCHORS</div>
        {anchors.map((r) => (
          <div key={r.k} style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 6 }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: '#fff', background: '#16386b' }}>{r.k}</span>
            <span style={{ fontSize: 12, fontWeight: 700, width: 52, color: 'var(--ink)' }}>{r.label}</span>
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
            IN PROGRESS RIGHT NOW · {drafting.length}
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
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: '#a37400', whiteSpace: 'nowrap' }}>Draft {draft.n} · {wc}w</span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{open ? '▲' : '▼'}</span>
                  </button>
                  {open && (
                    <div style={{ padding: '2px 12px 12px', borderTop: '1px solid #f0d9a8' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .6, color: 'var(--muted)', margin: '10px 0 5px' }}>WHERE THE DRAFT IS NOW</div>
                      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: '#33566e', background: '#fff', border: '1px solid var(--line)', borderRadius: 9, padding: '9px 11px', maxHeight: 170, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {(draft.content || '').trim() || 'Nothing written yet — this is a good place to start the conference.'}
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
          FINISHED WRITING{rows.length ? ` · ${rows.length}` : ''}
        </div>
        {rows.length === 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--muted)', background: '#f4f8fb', borderRadius: 10, padding: '12px 14px' }}>
            Nothing turned in yet — talk about what is in progress instead.
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
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .6, color: 'var(--muted)', margin: '10px 0 5px' }}>WHAT THEY WROTE</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.55, color: '#33566e', background: '#fbfdfe', border: '1px solid var(--line)', borderRadius: 9, padding: '9px 11px', maxHeight: 150, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                      {sc.questions[0].answer.trim() || 'No response recorded.'}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .6, color: 'var(--muted)', margin: '11px 0 5px' }}>{sc.strategyName}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {sc.questions[0].anchors.map((an) => (
                        <div key={an.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, lineHeight: 1.4 }}>
                          <span style={{ width: 17, height: 17, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800, color: '#fff', background: an.hit ? 'var(--good)' : '#c0392b' }}>{an.hit ? '✓' : '✕'}</span>
                          <span style={{ color: an.hit ? 'var(--muted)' : '#33566e', fontWeight: an.hit ? 600 : 700 }}>{an.label}</span>
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
            THEIR OWN FREE WRITES · {freeWrites.length}
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
                      {s.published ? 'Published' : `Draft ${draft.n}`} · {wc}w
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{open ? '▲' : '▼'}</span>
                  </button>
                  {open && (
                    <div style={{ padding: '2px 12px 12px', borderTop: '1px solid #d6dffa' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .6, color: 'var(--muted)', margin: '10px 0 5px' }}>
                        {s.published ? 'THE PIECE THEY PUBLISHED' : 'WHERE THIS ONE STANDS'}
                      </div>
                      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: '#33566e', background: '#fff', border: '1px solid var(--line)', borderRadius: 9, padding: '9px 11px', maxHeight: 170, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {(draft.content || '').trim() || 'Started, but nothing written yet.'}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 7 }}>
                        Their own choice of topic — no rubric on this one.
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
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, color: '#0f97c2' }}>THE GOAL WE SET LAST TIME</div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 3, lineHeight: 1.4 }}>{me.goal.text}</div>
          {me.goal.teachingPoint && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>Taught as: {me.goal.teachingPoint}</div>}
        </div>
      )}
    </div>
  )
}

function ConferenceProtocol({ teacher, state, me, onClose, onSetGoal }) {
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
              <b style={{ fontSize: 18 }}>Writing Conference</b>
              <div style={{ fontSize: 12.5, color: '#a8dff5', fontWeight: 700, marginTop: 2 }}>
You and {teacher} · about 5 minutes · Research · Decide · Teach · Link
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
                  <button onClick={() => setI(idx)} title={st.label}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 999, padding: '6px 13px', cursor: 'pointer',
                      background: cur ? 'linear-gradient(120deg,#f5c542,#e89a00)' : done ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.14)',
                      color: cur ? '#3d2c00' : done ? '#16386b' : 'rgba(255,255,255,.8)', fontWeight: 800, fontSize: 12.5,
                      border: cur ? '1.5px solid rgba(255,235,170,.9)' : '1.5px solid transparent' }}>
                    <span style={{ fontSize: 13 }}>{done ? '✓' : st.letter}</span>{st.label}
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
            <b style={{ fontSize: 17 }}>{step.label}</b>
            <span className="pill" style={{ background: '#eef4f8', color: '#16386b' }}>about {step.time}</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700, margin: '6px 0 12px' }}>{step.aim}</div>

          <div style={{ background: '#f4f8fb', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            {step.moves.map((m, mi) => (
              <div key={mi} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.5, marginTop: mi ? 7 : 0 }}>
                <span style={{ color: CONF_CYAN, fontWeight: 800 }}>›</span><span>{m}</span>
              </div>
            ))}
          </div>

          {step.key === 'research' && (
            <label style={{ display: 'block' }}>
              <span style={lbl}>What am I working on?</span>
              <textarea value={notes.working} onChange={set('working')} rows={3} placeholder="In your own words…" style={{ ...field, resize: 'vertical' }} />
            </label>
          )}

          {step.key === 'decide' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'block' }}>
                <span style={lbl}>What I already did well</span>
                <input value={notes.strength} onChange={set('strength')} placeholder="I backed up my reason with a detail from the text…" style={field} />
              </label>
              <label style={{ display: 'block' }}>
                <span style={lbl}>The one thing I am learning today</span>
                <input value={notes.teachingPoint} onChange={set('teachingPoint')} placeholder="Say what the other side thinks before I answer it." style={field} />
              </label>
            </div>
          )}

          {step.key === 'teach' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'block' }}>
                <span style={lbl}>The strategy I am trying</span>
                <input value={notes.strategy} onChange={set('strategy')} placeholder='We used "The Big Move," paragraph 3, as our example' style={field} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, background: '#f4f8fb', borderRadius: 10, padding: '11px 14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={notes.tried} onChange={(e) => setNotes((n) => ({ ...n, tried: e.target.checked }))} style={{ width: 17, height: 17 }} />
I tried it in my own writing
              </label>
            </div>
          )}

          {step.key === 'link' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(notes.strength || notes.teachingPoint) && (
                <div style={{ background: '#eef6f9', borderRadius: 12, padding: '12px 16px', fontSize: 13.5, lineHeight: 1.55 }}>
                  {notes.strength && <div><b>What I did well:</b> {notes.strength}</div>}
                  {notes.teachingPoint && <div style={{ marginTop: 4 }}><b>What I am learning:</b> {notes.teachingPoint}</div>}
                </div>
              )}
              <label style={{ display: 'block' }}>
                <span style={lbl}>My goal, in my own words</span>
                <textarea value={goalText} onChange={(e) => setGoalText(e.target.value)} rows={2} maxLength={140}
                  placeholder="Say it the way you would say it to a friend…" style={{ ...field, resize: 'vertical' }} />
                <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>{goalText.length}/140</span>
              </label>
              <label style={{ display: 'block' }}>
                <span style={lbl}>Which part of writing is this? (optional)</span>
                <select value={trait} onChange={(e) => setTrait(e.target.value)} style={{ ...field, background: '#fff' }}>
                  <option value="">Skip this — just my goal</option>
                  {Object.entries(TRAIT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>
          )}
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px 20px' }}>
          <button onClick={() => (i === 0 ? onClose() : setI(i - 1))}
            style={{ padding: '11px 18px', borderRadius: 11, fontWeight: 800, fontSize: 13.5, color: 'var(--muted)', background: '#eef3f6', cursor: 'pointer' }}>
            {i === 0 ? 'Cancel' : '← Back'}
          </button>
          <span style={{ flex: 1, fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Step {i + 1} of 4 · work through it together</span>
          {i < 3 ? (
            <button onClick={() => setI(i + 1)}
              style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, color: '#fff', cursor: 'pointer',
                background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 58%,#0e2748 100%)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.28), 0 5px 14px rgba(53,195,232,.42)' }}>
              Next: {RDTL_STEPS[i + 1].label} →
            </button>
          ) : (
            <button onClick={finish} disabled={!goalText.trim() || saving}
              style={{ padding: '12px 24px', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: goalText.trim() ? 'pointer' : 'default',
                color: goalText.trim() ? '#3d2c00' : '#9db0c0', background: goalText.trim() ? 'linear-gradient(120deg,#f5c542,#e89a00)' : '#eef0f6',
                boxShadow: goalText.trim() ? '0 0 16px rgba(245,180,0,.5)' : 'none' }}>
              🎯 This is my goal
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
  const subs = state.submissions.filter((s) => s.studentId === me.id)
  const mp = state.monthlyProgress
  const [picking, setPicking] = useState(!me.goal)
  const [custom, setCustom] = useState('')
  const [toast, setToast] = useState(null)
  const [mpTab, setMpTab] = useState('scr')
  const [conferring, setConferring] = useState(false)

  async function choose(g) { await api.setGoal(g); setPicking(false); onChange && onChange() }
  async function setCustomGoal() { if (!custom.trim()) return; await api.setGoal({ text: custom.trim(), trait: null }); setCustom(''); setPicking(false); onChange && onChange() }
  async function achieve() { const r = await api.achieveGoal(); setToast(r.coins); onChange && onChange() }
  async function conferenceGoal(payload) { await api.setGoal(payload); setConferring(false); setPicking(false); onChange && onChange() }

  const revisions = subs.reduce((a, s) => a + Math.max(0, s.drafts.length - 1), 0)
  const finished = subs.filter((s) => s.completedAt).length
  const growthCoins = state.coinEvents.filter((e) => e.studentId === me.id).reduce((a, e) => a + e.coins, 0)

  return (
    <div>
      {toast != null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.45)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={() => setToast(null)}>
          <div className="card" style={{ padding: 28, width: 380, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 46 }}>🏆</div>
            <h2 style={{ margin: '6px 0' }}>Goal reached!</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 6px' }}>Amazing work sticking with it. You earned</p>
            <div className="coin" style={{ fontSize: 22, justifyContent: 'center' }}><span className="disc" style={{ width: 20, height: 20 }} />+{toast}</div>
            <button className="btn" style={{ marginTop: 14 }} onClick={() => setToast(null)}>Pick my next goal</button>
          </div>
        </div>
      )}

      {conferring && (
        <ConferenceProtocol teacher={state.teacher?.name || 'your teacher'} state={state} me={me} onClose={() => setConferring(false)} onSetGoal={conferenceGoal} />
      )}

      {/* focus goal */}
      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <b style={{ fontSize: 17 }}>🎯 My Focus Goal</b>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {me.goal && !picking && <button className="btn ghost" style={{ padding: '6px 14px' }} onClick={() => setPicking(true)}>Change goal</button>}
            <button onClick={() => setConferring(true)}
              style={{ padding: '9px 18px', borderRadius: 11, fontWeight: 800, fontSize: 13.5, color: '#fff', cursor: 'pointer',
                background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 58%,#0e2748 100%)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.28), 0 5px 14px rgba(53,195,232,.42)' }}>
              🤝 Conference with my teacher
            </button>
          </div>
        </div>

        {me.goal && !picking ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(120deg,#eef6f9,#fff)', border: '1px solid var(--line)', borderRadius: 12, padding: 18, marginTop: 10 }}>
            <div style={{ fontSize: 34 }}>{PRESET_GOALS.find((g) => g.id === me.goal.id)?.icon || '✍️'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{me.goal.text}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                {me.goal.trait ? `Trait: ${TRAIT_LABELS[me.goal.trait]} · ` : ''}Set {fmtDate(me.goal.setOn)} · your coach will keep this in mind when you confer
              </div>
              {me.goal.source === 'conference' && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 7 }}>
                  <span className="pill" style={{ background: '#e9f5fb', color: '#0f97c2' }}>🤝 Set in a writing conference</span>
                  {me.goal.strength && <span style={{ fontSize: 12, color: 'var(--muted)' }}><b>What I did well:</b> {me.goal.strength}</span>}
                </div>
              )}
            </div>
            <button className="btn gold" onClick={achieve}>🎉 I reached this goal!</button>
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
              Best way: <button onClick={() => setConferring(true)} style={{ color: 'var(--link)', fontWeight: 800, background: 'none', cursor: 'pointer', padding: 0 }}>sit down with your teacher</button> and work out your goal together. Or pick one to focus on now — you can change it anytime.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {PRESET_GOALS.map((g) => {
                const on = me.goal?.id === g.id
                return (
                  <button key={g.id} onClick={() => choose(g)}
                    style={{ display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                      border: on ? '2px solid var(--navy)' : '1px solid var(--line)', background: on ? '#eef4f7' : '#fff', cursor: 'pointer' }}>
                    <span style={{ fontSize: 24 }}>{g.icon}</span>
                    <span>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>{g.text}</span>
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--link)', fontWeight: 700, marginTop: 2 }}>{TRAIT_LABELS[g.trait]}</span>
                    </span>
                  </button>
                )
              })}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 14px', borderRadius: 12, border: '1px dashed var(--line)', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 22 }}>✏️</span>
                <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Or write your own goal…"
                  onKeyDown={(e) => e.key === 'Enter' && setCustomGoal()}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 14 }} />
                <button className="btn" disabled={!custom.trim()} onClick={setCustomGoal}>Set goal</button>
              </div>
            </div>
          </div>
        )}

        {me.goalHistory?.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>🏆 Goals you've conquered</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {me.goalHistory.map((g, i) => (
                <span key={i} className="pill green" style={{ padding: '6px 12px' }}>✓ {g.text} <span style={{ opacity: .7, marginLeft: 4 }}>{fmtDate(g.achievedOn)}</span></span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* writing data + monthly/habits — one balanced row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 18, marginBottom: 18, alignItems: 'start' }}>
        <WritingDataCard writingData={state.writingData} state={state} me={me} onReview={onReview} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card gold-edge" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div className="data-title">Monthly progress</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{mp.year} · average score /4</div>
              </div>
              <div className="seg">
                <button className={mpTab === 'scr' ? 'on' : ''} onClick={() => setMpTab('scr')}>SCR</button>
                <button className={mpTab === 'ecr' ? 'on' : ''} onClick={() => setMpTab('ecr')}>ECR</button>
              </div>
            </div>
            {mpTab === 'scr'
              ? <MonthChart label="SCR — Short response" months={mp.months} data={mp.scr} color="var(--scr)" height={88} />
              : <MonthChart label="ECR — Extended response" months={mp.months} data={mp.ecr} color="var(--ecr)" height={88} />}
          </div>

          <div className="card gold-edge" style={{ padding: '18px 20px' }}>
            <div className="data-title">Writing habits</div>
            <div className="habit-grid">
              {[
                { k: 'Revisions made', v: revisions, sub: 'Each one makes you stronger' },
                { k: 'Pieces finished', v: finished, sub: 'Start to polished' },
                { k: 'Coins earned', v: growthCoins.toLocaleString(), sub: 'For how you write' },
              ].map((s) => (
                <div key={s.k} className="habit-tile">
                  <div className="v">{s.v}</div>
                  <div className="k">{s.k}</div>
                  <div className="s">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* growth stories */}
      {subs.filter((s) => s.drafts.filter((d) => d.traits).length > 1 && !s.isPeerRevision).map((sub) => {
        const asg = state.assignments.find((a) => a.id === sub.assignmentId)
        const withTraits = sub.drafts.filter((d) => d.traits)
        const first = withTraits[0], last = withTraits[withTraits.length - 1]
        return (
          <div key={sub.id} className="card" style={{ padding: 22, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <b style={{ fontSize: 17 }}>📖 Growth Story — "{asg.title}"</b>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Draft {first.n} → Draft {last.n}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 14px' }}>Look what revising did — same writer, {withTraits.length} drafts apart.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[{ d: first, tag: 'First draft', bg: '#f6f8f9' }, { d: last, tag: 'Latest draft', bg: '#eef6f2' }].map((c) => (
                <div key={c.tag} style={{ background: c.bg, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>{c.tag}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6, maxHeight: 90, overflow: 'hidden', color: '#3a4149' }}>
                    {c.d.content.slice(0, 180)}{c.d.content.length > 180 ? '…' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
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
  const counts = { like: 0, heart: 0, celebrate: 0, ...(entry.reactions || {}) }
  const mine = entry.myReactions || []
  const pad = size === 'sm' ? '4px 9px' : '6px 12px'
  const font = size === 'sm' ? 12 : 13
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {REACTION_KINDS.map((r) => {
        const on = mine.includes(r.key)
        return (
          <button key={r.key} onClick={() => onReact(entry.id, r.key)} title={on ? `Undo ${r.label.toLowerCase()}` : r.label}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 999, padding: pad, fontSize: font, fontWeight: 800, cursor: 'pointer',
              background: on ? r.on : r.bg, color: r.fg, border: on ? `1.5px solid ${r.fg}` : '1.5px solid transparent' }}>
            <span style={{ fontSize: font + 1 }}>{r.glyph}</span>{counts[r.key]}
          </button>
        )
      })}
    </div>
  )
}

export function ShareWallTab({ state, me, onChange }) {
  const subs = state.submissions.filter((s) => s.studentId === me.id)
  const shareWall = state.shareWall || []
  const sharedSubIds = new Set(shareWall.map((e) => e.submissionId).filter(Boolean))
  const shareable = subs.filter((s) => s.completedAt && !s.isPeerRevision && !sharedSubIds.has(s.id))

  async function share(subId) { await api.share(subId); onChange && onChange() }
  async function react(id, type) { await api.react(id, type); onChange && onChange() }

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <b style={{ fontSize: 17 }}>🌟 Share Wall <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--muted)' }}>See what other students are writing!</span></b>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Cheer for each other with a 👍, ❤️, or 🎉 — reactions only, no comments.</div>
        </div>
      </div>

      {shareable.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(120deg,#eef4ff,#fff)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 16px', margin: '14px 0' }}>
          <span style={{ fontSize: 22 }}>🎉</span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 14 }}>You finished "{state.assignments.find((a) => a.id === shareable[0].assignmentId)?.title}"!</b>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Proud of it? Share it with the class.</div>
          </div>
          <button className="btn" onClick={() => share(shareable[0].id)}>Share to wall →</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 14 }}>
        {shareWall.map((e) => (
          <div key={e.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#eef3f6', display: 'grid', placeItems: 'center', fontSize: 16 }}>{e.avatar}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>{e.studentName}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{e.genre}</div>
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{e.title}</div>
            <div style={{ fontSize: 12, color: '#3a4149', lineHeight: 1.5, marginTop: 4, flex: 1 }}>{e.excerpt}{e.excerpt.length >= 180 ? '…' : ''}</div>
            <div style={{ marginTop: 10 }}>
              <ReactionBar entry={e} onReact={react} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
