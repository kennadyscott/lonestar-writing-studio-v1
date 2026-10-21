import React, { useState, useEffect } from 'react'
import { api, TRAIT_LABELS } from '../lib/api.js'
import { scoreSubmission } from '../lib/writingScore.js'
import { useT, useLocale } from '../lib/i18n/index.jsx'
import { useSay, Glossed, Directions, Speak } from './Scaffold.jsx'
import { isGrade2, useBandValue } from '../lib/gradeBand.js'

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

/* ================= Data & Goals tab ================= */
export function DataGoalsTab({ state, me, onChange, onReview }) {
  const t = useT()
  const say = useSay()
  const locale = useLocale() // was referenced below but never declared — crashed as soon as a goal existed
  const subs = state.submissions.filter((s) => s.studentId === me.id)
  const mp = state.monthlyProgress
  // Goals (Kennady, 2026-10-21): "remove the writer's conference and just make the goal back to what it was - they can pick one,
  // say they reached it, or write one in." The conference, its prototype switches and "my last conference" are gone.
  const [picking, setPicking] = useState(false)
  const [custom, setCustom] = useState('')
  const goal = me.goal
  const history = me.goalHistory || []
  const [toast, setToast] = useState(null)
  const [mpTab, setMpTab] = useState('scr')
  const band = useBandValue()
  // The page is version C (Kennady, 2026-10-14: "I like version C - that's perfect"): My goal beside At a Glance (with a count of
  // goals reached and their trophies), then the year's chart, RACE and the growth story.

  async function choose(g) { await api.setGoal(g); setPicking(false); onChange && onChange() }
  async function setCustomGoal() { if (!custom.trim()) return; await api.setGoal({ text: custom.trim(), trait: null }); setCustom(''); setPicking(false); onChange && onChange() }
  async function achieve() { const r = await api.achieveGoal(); setToast(r.coins); onChange && onChange() }

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
          <button className="btn" style={{ marginTop: 14 }} onClick={() => { setToast(null); setPicking(true) }}>{t('Pick my next goal')}</button>
        </div>
      </div>
    )}
  </>


  const d = state.writingData?.ELA
  const series = mpTab === 'scr' ? mp.scr : mp.ecr
  const now = series[series.length - 1], grew = Math.round((now - series[0]) * 10) / 10
  const RACE = [['R', 'Restate'], ['A', 'Answer'], ['C', 'Cite'], ['E', 'Explain']]
  // second grade: stars, not scores; no score chart or R-A-C-E bars (the teacher still has the numbers)
  const g2 = isGrade2(band)
  const stars = Math.max(0, Math.min(4, Math.round(now)))
  return (
    <div className="dg-b">
      {modals}

        <div className="dg-top">
          <div className="card dg-goal c">
            <span className="dg-kicker">🎯 {t('My goal')}</span>
            {goal ? <>
              <b className="dg-goal-text">{t(goal.text)}</b>
              <div className="dg-goal-acts">
                <button className="btn gold" onClick={achieve}>{t('🎉 I reached it!')}</button>
                {!picking && <button className="btn ghost" onClick={() => setPicking(true)}>{t('Change goal')}</button>}
              </div>
            </> : <>
              <b className="dg-goal-text">{history.length ? t('🎉 Goal reached! What is next?') : t('Pick one thing to focus on.')}</b>
              {!picking && <div className="dg-goal-acts"><button className="btn" onClick={() => setPicking(true)}>{t('Pick my goal')}</button></div>}
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
                g2
                  ? { tone: 'teal', icon: '⭐', v: <span className="dg-stars" aria-label={t('{n} of 4 stars', { n: stars })}>{'★'.repeat(stars)}<span>{'★'.repeat(4 - stars)}</span></span>, k: t('My writing stars') }
                  : { tone: 'teal', icon: '📈', v: <>{now}<small>/4</small></>, k: mpTab === 'scr' ? t('SCR score') : t('ECR score'), up: grew > 0 ? `▲ ${grew} ${t('since Sep')}` : null },
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
        {picking && (
          <div className="card dg-pick">
            <div className="dg-row">
              <b>{t('🎯 Pick my goal')}</b>
              <button className="btn ghost" style={{ padding: '6px 14px' }} onClick={() => setPicking(false)}>{t('Back')}</button>
            </div>
            <p className="dg-pick-note"><Glossed text={say('Pick one thing to focus on, or write your own. You can change it anytime.')} /></p>
            <div className="dg-pick-grid">
              {PRESET_GOALS.map((g) => {
                const on = goal?.id === g.id
                return (
                  <button key={g.id} className={'dg-pick-opt' + (on ? ' on' : '')} aria-pressed={on} onClick={() => choose(g)}>
                    <span className="dg-pick-icon" aria-hidden>{g.icon}</span>
                    <span>
                      <span className="dg-pick-text">{t(g.text)}</span>
                      <span className="dg-pick-trait">{t(TRAIT_LABELS[g.trait])}</span>
                    </span>
                  </button>
                )
              })}
              <div className="dg-pick-own">
                <span aria-hidden>✏️</span>
                <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={t('Or write your own goal…')} aria-label={t('Write your own goal')}
                  maxLength={140} onKeyDown={(e) => e.key === 'Enter' && setCustomGoal()} />
                <button className="btn" disabled={!custom.trim()} onClick={setCustomGoal}>{t('Set goal')}</button>
              </div>
            </div>
          </div>
        )}

      {!g2 && <div className="dg-main">
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
      </div>}

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
