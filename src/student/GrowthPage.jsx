import React, { useState } from 'react'
import { api, TRAIT_LABELS } from '../lib/api.js'

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
                    <div style={{ width: '68%', height: v != null ? `${(v / 4) * 100}%` : '2px', background: v != null ? color : '#e6e8ec', borderRadius: '4px 4px 0 0' }} />
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
  const fill = pct >= 80 ? 'var(--good)' : pct > 0 ? '#e8b33c' : 'transparent'
  return (
    <div style={{ flex: 1, height: 10, background: '#e9f0f5', borderRadius: 6 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: fill, borderRadius: 6, transition: 'width .3s' }} />
    </div>
  )
}

function ScrPanel({ rows }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(120deg,#0a5b76,#035c78)', color: '#fff', padding: '8px 13px', fontWeight: 800, fontSize: 12.5 }}>
        SCR · Strategy Anchor Adherence
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((r) => (
          <div key={r.label} title={`${r.k} = ${ANCHOR_MEANING[r.label] || r.label}`} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 25, height: 25, borderRadius: 7, background: 'var(--navy)', color: ANCHOR_COLORS[r.label] || '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13 }}>{r.k}</span>
            <span style={{ width: 38, fontSize: 12, fontWeight: 800, textAlign: 'right' }}>{r.pct}%</span>
            <DataBar pct={r.pct} />
            <span style={{ width: 14, fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, textAlign: 'right' }} title={`${r.n} response${r.n === 1 ? '' : 's'} assessed`}>{r.n}</span>
          </div>
        ))}
        <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>R·A·C·E — Restate, Answer, Cite, Explain</div>
      </div>
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
    <div style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(120deg,#14538c,#123b6d)', color: '#fff', padding: '8px 13px', fontWeight: 800, fontSize: 12.5 }}>
        ECR · Rubric Domains
      </div>
      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {section('Organization & Development', org)}
        <div style={{ borderTop: '1px solid var(--line)', margin: '4px 0' }} />
        {section('Conventions', conv)}
      </div>
    </div>
  )
}

function WritingDataCard({ writingData }) {
  const [subject, setSubject] = useState('ELA')
  const [fmt, setFmt] = useState('SCR')
  const d = writingData[subject]
  const hasEcr = subject === 'ELA' // Science & Social Studies collect SCR only
  const view = hasEcr ? fmt : 'SCR'
  const scrEmpty = d.scr.every((r) => r.pct === 0 && !r.n)

  const toggleStyle = (on) => ({
    padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 800,
    background: on ? '#fff' : 'transparent', color: on ? 'var(--navy)' : 'var(--muted)',
    boxShadow: on ? 'var(--shadow)' : 'none',
  })

  return (
    <div className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <b style={{ fontSize: 15 }}>📊 My Writing Data</b>
        <div style={{ display: 'inline-flex', background: '#eaf1f6', borderRadius: 9, padding: 2 }}>
          {writingData.subjects.map((sub) => (
            <button key={sub} onClick={() => setSubject(sub)} style={toggleStyle(subject === sub)}>{sub}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 12px' }}>
        {hasEcr ? (
          <div style={{ display: 'inline-flex', background: '#eaf1f6', borderRadius: 9, padding: 2 }}>
            <button onClick={() => setFmt('SCR')} style={toggleStyle(view === 'SCR')}>SCR</button>
            <button onClick={() => setFmt('ECR')} style={toggleStyle(view === 'ECR')}>ECR</button>
          </div>
        ) : (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--scr)' }}>✍️ {subject} collects SCR data only</span>
        )}
        <span style={{ fontSize: 11.5, color: 'var(--muted)', marginLeft: 'auto' }}>vs. the grading rubric</span>
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
    </div>
  )
}

/* ================= Data & Goals tab ================= */
export function DataGoalsTab({ state, me, onChange }) {
  const subs = state.submissions.filter((s) => s.studentId === me.id)
  const mp = state.monthlyProgress
  const [picking, setPicking] = useState(!me.goal)
  const [custom, setCustom] = useState('')
  const [toast, setToast] = useState(null)
  const [mpTab, setMpTab] = useState('scr')

  const traitDrafts = subs.flatMap((s) => s.drafts.map((d) => ({ d, s }))).filter((x) => x.d.traits).sort((a, b) => (a.d.createdAt > b.d.createdAt ? 1 : -1))
  const latest = traitDrafts[traitDrafts.length - 1]
  const nextStep = latest ? { headline: latest.d.traits.headline, title: state.assignments.find((a) => a.id === latest.s.assignmentId)?.title } : null

  async function choose(g) { await api.setGoal(g); setPicking(false); onChange && onChange() }
  async function setCustomGoal() { if (!custom.trim()) return; await api.setGoal({ text: custom.trim(), trait: null }); setCustom(''); setPicking(false); onChange && onChange() }
  async function achieve() { const r = await api.achieveGoal(); setToast(r.coins); onChange && onChange() }

  const revisions = subs.reduce((a, s) => a + Math.max(0, s.drafts.length - 1), 0)
  const finished = subs.filter((s) => s.completedAt).length
  const growthCoins = state.coinEvents.filter((e) => e.studentId === me.id).reduce((a, e) => a + e.coins, 0)

  const mpToggle = (on) => ({
    padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 800,
    background: on ? '#fff' : 'transparent', color: on ? 'var(--navy)' : 'var(--muted)', boxShadow: on ? 'var(--shadow)' : 'none',
  })

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

      {/* nudge + shout-out */}
      {(nextStep || me.shoutOut) && (
        <div style={{ display: 'grid', gridTemplateColumns: nextStep && me.shoutOut ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 18 }}>
          {nextStep && (
            <div className="card" style={{ padding: 18, background: 'linear-gradient(120deg,#fff6e8,#fff)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 26 }}>💡</div>
              <div>
                <div className="eyebrow" style={{ color: '#a37400' }}>Your coach's next step</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3, lineHeight: 1.4 }}>{nextStep.headline}</div>
                {nextStep.title && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>From "{nextStep.title}"</div>}
              </div>
            </div>
          )}
          {me.shoutOut && (
            <div className="card" style={{ padding: 18, background: 'linear-gradient(120deg,#eef6f2,#fff)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#d7ead9', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, color: 'var(--good)', flexShrink: 0 }}>{me.shoutOut.initials}</div>
              <div>
                <div className="eyebrow" style={{ color: 'var(--good)' }}>Shout-out from {me.shoutOut.from} 📣</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 3, lineHeight: 1.45, fontStyle: 'italic' }}>"{me.shoutOut.text}"</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* focus goal */}
      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <b style={{ fontSize: 17 }}>🎯 My Focus Goal</b>
          {me.goal && !picking && <button className="btn ghost" style={{ padding: '6px 14px' }} onClick={() => setPicking(true)}>Change goal</button>}
        </div>

        {me.goal && !picking ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(120deg,#eef6f9,#fff)', border: '1px solid var(--line)', borderRadius: 12, padding: 18, marginTop: 10 }}>
            <div style={{ fontSize: 34 }}>{PRESET_GOALS.find((g) => g.id === me.goal.id)?.icon || '✍️'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{me.goal.text}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                {me.goal.trait ? `Trait: ${TRAIT_LABELS[me.goal.trait]} · ` : ''}Set {fmtDate(me.goal.setOn)} · your coach will keep this in mind when you confer
              </div>
            </div>
            <button className="btn gold" onClick={achieve}>🎉 I reached this goal!</button>
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>Pick one thing to focus on next. You can change it anytime.</div>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 18, marginBottom: 18, alignItems: 'stretch' }}>
        <WritingDataCard writingData={state.writingData} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <b style={{ fontSize: 15 }}>📈 Monthly Progress <span style={{ fontWeight: 600, fontSize: 11.5, color: 'var(--muted)' }}>{mp.year} · avg score /4</span></b>
              <div style={{ display: 'inline-flex', background: '#eaf1f6', borderRadius: 9, padding: 2 }}>
                <button onClick={() => setMpTab('scr')} style={mpToggle(mpTab === 'scr')}>SCR</button>
                <button onClick={() => setMpTab('ecr')} style={mpToggle(mpTab === 'ecr')}>ECR</button>
              </div>
            </div>
            {mpTab === 'scr'
              ? <MonthChart label="SCR — Short Response" months={mp.months} data={mp.scr} color="var(--scr)" height={64} />
              : <MonthChart label="ECR — Extended Response" months={mp.months} data={mp.ecr} color="var(--ecr)" height={64} />}
          </div>

          <div className="card" style={{ padding: '16px 18px', flex: 1 }}>
            <b style={{ fontSize: 15 }}>🔥 My Writing Habits</b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {[
                { k: 'Revisions made', v: revisions, sub: 'Every revision makes you stronger', icon: '📝' },
                { k: 'Pieces finished', v: finished, sub: 'Start to polished', icon: '⭐' },
                { k: 'Coins from growing', v: growthCoins.toLocaleString(), sub: 'Earned by how you write', icon: '🪙' },
              ].map((s) => (
                <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f4f9fc', borderRadius: 12, padding: '8px 14px' }}>
                  <div style={{ fontSize: 19, fontWeight: 800, minWidth: 38 }}>{s.v}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 700 }}>{s.k}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.sub}</div></div>
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
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
export function ShareWallTab({ state, me, onChange }) {
  const subs = state.submissions.filter((s) => s.studentId === me.id)
  const shareWall = state.shareWall || []
  const sharedSubIds = new Set(shareWall.map((e) => e.submissionId).filter(Boolean))
  const shareable = subs.filter((s) => s.completedAt && !s.isPeerRevision && !sharedSubIds.has(s.id))

  async function share(subId) { await api.share(subId); onChange && onChange() }
  async function kudo(id) { await api.kudos(id); onChange && onChange() }

  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <b style={{ fontSize: 17 }}>🌟 Share Wall <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--muted)' }}>See what other students are writing!</span></b>
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
            <button onClick={() => kudo(e.id)} title="Give kudos"
              style={{ marginTop: 10, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff0f1', color: '#d84a57', border: '1px solid #f6d6d9', borderRadius: 999, padding: '5px 12px', fontSize: 13, fontWeight: 700 }}>
              ❤️ {e.kudos}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
