import React, { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useT } from '../lib/i18n/index.jsx'
import { useSay, Glossed, Directions } from './Scaffold.jsx'
import { PEER_TASKS, checkRule } from '../../server/peerTasks.mjs'
import { coachFor, offending, wordsThatWork } from './revisionCoach.js'

/*
 * Daily Revision Challenge (guided, 2026-10-14; the three-step rubric / checklist version came out: "Let's go with guided").
 * Pip's draft is edited in place while a coach takes the problems one at a time; Get feedback scores the revision on the
 * same rubric and pays the coins.
 */

function FeedbackModal({ result, onClose, onKeepFixing }) {
  const t = useT()
  const say = useSay()
  if (!result) return null
  const rubric = result.rubric
  const agree = result.agreement
  const pct = rubric ? Math.round((rubric.met / rubric.total) * 100) : null
  const tone = pct == null ? 'var(--navy)' : pct >= 80 ? 'var(--good)' : pct >= 50 ? '#c99312' : '#c0392b'
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60, padding: 16 }} onClick={onClose}>
      <div className="card" style={{ padding: 26, width: 520, maxWidth: '94vw', maxHeight: '92vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 42 }}>🎉</div>
          <h2 style={{ margin: '4px 0 2px' }}><Glossed text={result.allFixed === false ? t('Almost there!') : t('Revision submitted!')} /></h2>
          <p style={{ color: 'var(--muted)', margin: '0 0 14px', fontSize: 14 }}>
            <Directions inline text="You just did what real writers do — judge, then improve." />
          </p>
        </div>

        {rubric && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f4f8fb', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ textAlign: 'center', minWidth: 74 }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .8, color: 'var(--muted)' }}>{t('RUBRIC')}</div>
                <b style={{ fontSize: 22, color: tone }}>{rubric.met}<span style={{ fontSize: 14, color: 'var(--muted)' }}>/{rubric.total}</span></b>
              </div>
              <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, lineHeight: 1.5 }}>
                <b><Glossed text={say('Your revision was scored on the same rubric you just used.')} /></b>
                <div style={{ color: 'var(--muted)', marginTop: 2 }}>
                  <Glossed text={rubric.fixed > 0
                    ? say(rubric.fixed === 1 ? 'You fixed {n} criterion the draft was missing.' : 'You fixed {n} criteria the draft was missing.', { n: rubric.fixed })
                    : say('None of the missing criteria are fixed yet — the ✗ items below are where to go next.')} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {rubric.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, lineHeight: 1.4, padding: '7px 10px', borderRadius: 9,
                  background: it.met ? '#f1faf4' : '#fff7f7' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: '#fff',
                    background: it.met ? 'var(--good)' : '#c0392b' }}>{it.met ? '✓' : '✕'}</span>
                  <span style={{ flex: 1 }}>{it.text}</span>
                  {it.met && !it.wasMet && <span className="pill green" style={{ fontSize: 10.5, padding: '2px 8px' }}>{t('you fixed this')}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {agree && (
          <div style={{ background: '#eef6f9', borderRadius: 12, padding: '12px 14px', fontSize: 13.5, lineHeight: 1.45, marginBottom: 12 }}>
            <b>{t('Your grader eye:')}</b>{' '}
            <Glossed text={say('you matched the rubric on {a} of {b} criteria when you scored Pip\u2019s draft.', { a: agree.matched, b: agree.total })} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, margin: '12px 0' }}>
          {result.newMilestones.map((m) => (
            <div key={m.id} className="pill gold" style={{ justifyContent: 'space-between', fontSize: 13, padding: '8px 12px' }}>
              <span>🏅 {m.label}</span><span className="coin"><span className="disc" />+{m.coins}</span>
            </div>
          ))}
        </div>
        {result.allFixed === false ? <>
          <div style={{ background: '#fff7e6', borderRadius: 12, padding: '12px 14px', fontSize: 14, lineHeight: 1.45, marginBottom: 12, color: '#7a5600', fontWeight: 700 }}>
            🪙 {say(result.left === 1 ? 'No coins yet: {n} problem is still left. Fix it to earn 50 coins. Your work is saved.' : 'No coins yet: {n} problems are still left. Fix them to earn 50 coins. Your work is saved.', { n: result.left })}
          </div>
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={onKeepFixing}>{t('Keep fixing →')}</button>
        </> : <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>{t('Back to my dashboard')}</button>}
      </div>
    </div>
  )
}

/*
 * The guided challenge (Kennady, 2026-10-14: "this is really confusing process to follow and kids would not know what to do here").
 * One problem at a time, only the ones Pip's draft really has: spot it (yes / no, answered at once), then fix it right in the draft
 * with a tip, the words to look for, and a sentence starter; a check appears the moment the change meets the rubric line.
 */
function GuidedRevision({ asg, sub, original, content, edit, busy, onFinish }) {
  const t = useT()
  const say = useSay()
  const task = PEER_TASKS.find((x) => x.id === sub.peerTaskId)
  const band = task?.bands[asg.gradeBand || 'mid']
  const rules = band?.checklist || []
  const problems = rules.map((r, i) => ({ ...r, i })).filter((r) => r.check && !checkRule(r.check, original.content))
  const [at, setAt] = useState(0)
  const [spot, setSpot] = useState({}) // rubric index -> what they answered (true = "yes, it does")
  const [summary, setSummary] = useState(false)
  // "Next problem" before the fix: the draft glows with a cue to type in it (2026-10-14: "If they try to click 'Next problem'
  // without fixing the issue - highlight the draft with a 'type in the box to fix the draft' cue").
  const [nudge, setNudge] = useState(false)
  useEffect(() => { setNudge(false) }, [at, content])
  const box = useRef(null)
  const done = !!sub.completedAt
  const fixedNow = (r) => checkRule(r.check, content, original.content)
  const fixedCount = problems.filter(fixedNow).length

  const p = problems[at]
  const coach = p && coachFor(p.text)
  const answered = p && spot[p.i] !== undefined
  const met = p && fixedNow(p)
  const look = p ? offending(p.check, content) : []
  const ideas = p && !coach.starter ? wordsThatWork(p.check) : []
  const next = () => (at < problems.length - 1 ? setAt(at + 1) : setSummary(true))

  return (
    <div className="rev-guided">
      <div className={'card rev-editor' + (nudge ? ' nudge' : '')}>
        <div className="rev-editor-head">
          <b><Glossed text={t("{name}'s draft — fix it right here", { name: asg.teacher.name })} /></b>
          <span>{t('{n} words · autosaves', { n: (content || '').split(/\s+/).filter(Boolean).length })}</span>
        </div>
        {nudge && <div className="rev-cue" role="status">✏️ {t('Type in the box to fix the draft')}</div>}
        <textarea ref={box} value={content} onChange={(e) => edit(e.target.value)} disabled={done} aria-label={t("{name}'s draft — fix it right here", { name: asg.teacher.name })} />
      </div>

      <div className="card rev-coach" aria-live="polite">
        {done ? (
          <div className="rev-step">
            <div className="rev-big">✓ {t('Challenge done for today!')}</div>
            <p className="rev-tip">{say('A new draft from Pip lands tomorrow.')}</p>
          </div>
        ) : !problems.length ? (
          <div className="rev-step">
            <p className="rev-tip">{say('Read the draft, make it stronger, then get feedback.')}</p>
            <button className="btn gold" disabled={busy} onClick={() => onFinish({})}>{t('Get feedback')}</button>
          </div>
        ) : summary ? (
          <div className="rev-step">
            <div className="rev-big">{fixedCount === problems.length ? t('🎉 You fixed all {n} problems!', { n: problems.length }) : t('You fixed {a} of {b} problems.', { a: fixedCount, b: problems.length })}</div>
            {fixedCount < problems.length && <p className="rev-tip">🪙 {say('Fix all {n} to earn 50 coins.', { n: problems.length })}</p>}
            <ul className="rev-sum">
              {problems.map((r, k) => <li key={r.i} className={fixedNow(r) ? 'ok' : ''}><span aria-hidden>{fixedNow(r) ? '✓' : '○'}</span>
                <button type="button" onClick={() => { setSummary(false); setAt(k) }}>{coachFor(r.text).ask}</button></li>)}
            </ul>
            {fixedCount === problems.length
              ? <button className="btn gold" disabled={busy} onClick={() => onFinish(spot)}>{t('📬 Get feedback')} · 🪙 50</button>
              : <div className="rev-nav">
                  <button type="button" className="rev-link quiet" disabled={busy} onClick={() => onFinish(spot)}>{t('Get feedback without coins')}</button>
                  <span style={{ flex: 1 }} />
                  <button type="button" className="btn" onClick={() => { setSummary(false); setAt(Math.max(0, problems.findIndex((r) => !fixedNow(r)))) }}>{t('Keep fixing →')}</button>
                </div>}
          </div>
        ) : (
          <div className="rev-step">
            <div className="rev-progress">
              <span>{t('Problem {a} of {b}', { a: at + 1, b: problems.length })}</span>
              <span className="rev-dots" aria-hidden>{problems.map((r, k) => <i key={r.i} className={(fixedNow(r) ? 'ok' : '') + (k === at ? ' on' : '')} />)}</span>
            </div>
            <div className="rev-label">1 · {t('Spot it')}</div>
            <div className="rev-ask">{coach.ask}</div>
            {!answered ? (
              <div className="rev-yesno">
                <button type="button" className="btn ghost" onClick={() => setSpot({ ...spot, [p.i]: true })}>{t('Yes, it does')}</button>
                <button type="button" className="btn ghost" onClick={() => setSpot({ ...spot, [p.i]: false })}>{t("No, it doesn't")}</button>
              </div>
            ) : (
              <div className={'rev-verdict' + (spot[p.i] === false ? ' right' : '')}>
                {spot[p.i] === false ? <>🎯 {say('You spotted it! Now fix it.')}</> : <>👀 {say("Look again — Pip's draft doesn't do this yet. Let's fix it.")}</>}
              </div>
            )}
            {answered && <>
              <div className="rev-label">2 · {t('Fix it')}</div>
              <p className="rev-tip">{say(coach.tip)}</p>
              {look.length > 0 && <div className="rev-look">{t('Look for:')} {look.map((w) => <code key={w}>{w}</code>)}</div>}
              {/* hints only: the student types every change ("I want them to actually type though", 2026-10-14) */}
              {ideas.length > 0 && <div className="rev-look ideas">{t('Words that would work:')} {ideas.map((w) => <span key={w}>{w}</span>)}</div>}
              {coach.starter && <div className="rev-hint">{t('Try starting with:')} <em>{coach.starter.trim()}…</em></div>}
              <div className={'rev-status' + (met ? ' ok' : '')}>{met ? <>✓ {t('Fixed!')}</> : t('Not fixed yet — change the draft on the left.')}</div>
              <div className="rev-nav">
                {at > 0 && <button type="button" className="rev-link" onClick={() => setAt(at - 1)}>← {t('Back')}</button>}
                <span style={{ flex: 1 }} />
                {!met && <button type="button" className="rev-link quiet" onClick={next}>{t('Skip for now')}</button>}
                <button type="button" className="btn" onClick={() => { if (met) next(); else { setNudge(true); box.current?.focus() } }}>
                  {at < problems.length - 1 ? t('Next problem →') : t('Finish →')}
                </button>
              </div>
            </>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RevisionStudio({ state, sub, health, onChange, onBack }) {
  const t = useT()
  const asg = state.assignments.find((a) => a.id === sub.assignmentId)
  const original = sub.drafts[0]
  const working = sub.drafts[sub.drafts.length - 1]
  const [content, setContent] = useState(working.content)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const timer = useRef(null)

  function edit(v) {
    setContent(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => api.saveContent(working.id, v), 500)
  }

  async function submit() {
    setBusy(true)
    try {
      clearTimeout(timer.current)
      await api.saveContent(working.id, content)
      const r = await api.submitRevision(sub.id)
      setResult(r)
      onChange && onChange()
    } finally { setBusy(false) }
  }

  // Guided: record the spot-it answers as the step-1 judgments (a line Pip already meets counts as "yes"), then submit.
  async function finishGuided(spot) {
    setBusy(true)
    try {
      if (!sub.evaluation) {
        const task = PEER_TASKS.find((x) => x.id === sub.peerTaskId)
        const rules = task?.bands[asg.gradeBand || 'mid']?.checklist || []
        await api.evaluate(sub.id, rules.map((r, i) => (spot[i] !== undefined ? spot[i] : !!(r.check && checkRule(r.check, original.content)))))
      }
    } finally { setBusy(false) }
    await submit()
  }

  return (
    <div>
      <FeedbackModal result={result} onClose={() => { setResult(null); onBack && onBack() }} onKeepFixing={() => setResult(null)} />
      {onBack && <button className="backlink" onClick={onBack}>{t('← Back to My Writing')}</button>}

      {/* challenge banner */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 14, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 30 }}>🤖</div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0d2f55' }}>{t('Help {name} fix this draft', { name: asg.teacher.name })}</div>
          <div style={{ fontSize: 14, marginTop: 2, color: 'var(--muted)', fontWeight: 600 }}>{t('One problem at a time.')} 🪙 {t('Fix every problem to earn 50 coins')}</div>
        </div>
      </div>

      <GuidedRevision asg={asg} sub={sub} original={original} content={content} edit={edit} busy={busy} onFinish={finishGuided} />

    </div>
  )
}
