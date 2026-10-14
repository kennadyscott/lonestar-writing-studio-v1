import React, { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useT } from '../lib/i18n/index.jsx'
import { useSay, Glossed, Directions } from './Scaffold.jsx'
import { PEER_TASKS, checkRule } from '../../server/peerTasks.mjs'
import { coachFor, offending, wordsThatWork } from './revisionCoach.js'

/*
 * Daily Revision Challenge — three parts:
 *   1 (evaluate): score Pip's draft against the RUBRIC (focused layout, no tabs).
 *   2 (rewrite):  revise directly beneath the original, working from the REVISION
 *                 CHECKLIST (their rubric judgments) beside the draft.
 *   3 (done):     submit for feedback (coach headline + next steps + coins).
 */

function Stepper({ phase }) {
  const say = useSay()
  const steps = [
    { k: 'evaluate', n: 1, label: say('Evaluate with the rubric') },
    { k: 'rewrite', n: 2, label: say('Revise with your checklist') },
    { k: 'done', n: 3, label: say('Get feedback') },
  ]
  const idx = steps.findIndex((s) => s.k === phase)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.k}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 800,
              background: i < idx ? 'var(--good)' : i === idx ? 'var(--navy)' : '#dfe9ef', color: i <= idx ? '#fff' : 'var(--muted)' }}>
              {i < idx ? '✓' : s.n}
            </span>
            <span style={{ fontSize: 13, fontWeight: i === idx ? 800 : 600, color: i === idx ? 'var(--ink)' : 'var(--muted)' }}>
              <Glossed text={s.label} />
            </span>
          </div>
          {i < steps.length - 1 && <span style={{ flex: 'none', width: 34, height: 2, background: i < idx ? 'var(--good)' : '#dfe9ef', borderRadius: 2 }} />}
        </React.Fragment>
      ))}
    </div>
  )
}

function FeedbackModal({ result, onClose }) {
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
          <h2 style={{ margin: '4px 0 2px' }}><Glossed text={t('Revision submitted!')} /></h2>
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
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>{t('Back to my dashboard')}</button>
      </div>
    </div>
  )
}

/* ---- Step 1: the rubric (compact rows, inline Yes/No) ---- */
function RubricPanel({ asg, answers, setAnswers, onStartRewrite, busy }) {
  const t = useT()
  const list = asg.checklist || []
  const judged = Object.keys(answers).length
  const allAnswered = list.every((_, i) => answers[i] === true || answers[i] === false)

  const seg = (i, v, label, color) => {
    const on = answers[i] === v
    return (
      <button onClick={() => setAnswers({ ...answers, [i]: v })}
        style={{ padding: '6px 13px', borderRadius: 7, fontWeight: 800, fontSize: 12.5,
          background: on ? color : 'transparent', color: on ? '#fff' : 'var(--muted)' }}>
        {label}
      </button>
    )
  }

  return (
    <div className="card" style={{ border: '2px solid #f0cf8a', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', background: 'linear-gradient(120deg,#fff6e3,#fff)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>📋</span>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 15 }}><Glossed text={t('The Rubric')} /></b>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            <Directions text="Score {name}'s draft the way a grader would." vars={{ name: asg.teacher.name.split(' ')[0] }} />
          </div>
        </div>
        <span className="pill" style={{ background: judged === list.length ? '#e6f6ee' : '#fdf1dc', color: judged === list.length ? 'var(--good)' : '#b97e10' }}>
          {t('{n}/{total} scored', { n: judged, total: list.length })}
        </span>
      </div>

      <div style={{ padding: '4px 18px 6px' }}>
        {list.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < list.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#eef3f6', color: 'var(--muted)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{item}</span>
            <div style={{ display: 'inline-flex', background: '#eef3f6', borderRadius: 9, padding: 2, flexShrink: 0 }}>
              {seg(i, true, t('✓ Yes'), 'var(--good)')}
              {seg(i, false, t('✗ No'), '#d84a57')}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 18px 16px' }}>
        <button className="btn" disabled={!allAnswered || busy} onClick={onStartRewrite} style={{ width: '100%', justifyContent: 'center' }}>
          {allAnswered ? t('Done scoring — now revise it →') : t('Score all {n} criteria to continue', { n: list.length })}
        </button>
      </div>
    </div>
  )
}

/* ---- Step 2: the revision checklist (their judgments become fix targets) ---- */
function ChecklistPanel({ asg, sub, answers, fixed, setFixed }) {
  const t = useT()
  const say = useSay()
  const list = asg.checklist || []
  const mine = sub.evaluation || answers
  const key = sub.rubricKey || null
  const agree = sub.agreement || null
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 9, height: '100%', overflowY: 'auto' }}>
      {agree && (
        <div style={{ background: agree.matched === agree.total ? '#f1faf4' : '#fff8ec', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, lineHeight: 1.45 }}>
          <b><Glossed text={say('You matched the rubric on {a} of {b}.', { a: agree.matched, b: agree.total })} /></b>{' '}
          <Glossed text={agree.matched === agree.total
            ? say('You read this draft exactly like a grader would.')
            : say('The ✗ marks below are the rubric’s own scoring — fix those as you revise.')} />
        </div>
      )}
      <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
        <b style={{ color: '#d84a57' }}>{t('Fix the ✗ items')}</b>{' '}
        <Directions inline text="as you revise, and check them off as you go." />
      </div>
      {list.map((item, i) => {
        const graderFailed = key ? key[i] === false : mine[i] === false
        const disagreed = key ? key[i] !== (mine[i] === true) : false
        const done = !!fixed[i]
        return (
          <button key={i} onClick={() => setFixed({ ...fixed, [i]: !done })}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', padding: '10px 12px', borderRadius: 12,
              border: graderFailed && !done ? '1.5px solid #f0b9be' : '1px solid var(--line)',
              background: done ? '#e6f6ee' : graderFailed ? '#fff8f8' : '#fff' }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800,
              background: done ? 'var(--good)' : '#fff', border: done ? 'none' : '1.5px solid #c8d6de', color: '#fff' }}>{done ? '✓' : ''}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, lineHeight: 1.4, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--good)' : 'var(--ink)' }}>{item}</span>
              <span style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: '2px 8px', background: graderFailed ? '#fdecec' : '#e9f7ef', color: graderFailed ? '#c0392b' : 'var(--good)' }}>
                  {t('rubric:')} {graderFailed ? t('✕ not met') : t('✓ met')}
                </span>
                {disagreed && <span style={{ fontSize: 10.5, fontWeight: 800, borderRadius: 999, padding: '2px 8px', background: '#fff3d6', color: '#8a6400' }}>{mine[i] === true ? t('you said yes') : t('you said no')}</span>}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

/*
 * B · Guided (Kennady, 2026-10-14: "this is really confusing process to follow and kids would not know what to do here").
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
      <div className="card rev-editor">
        <div className="rev-editor-head">
          <b><Glossed text={t("{name}'s draft — fix it right here", { name: asg.teacher.name })} /></b>
          <span>{t('{n} words · autosaves', { n: (content || '').split(/\s+/).filter(Boolean).length })}</span>
        </div>
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
            <div className="rev-big">{t('You fixed {a} of {b} problems!', { a: fixedCount, b: problems.length })}</div>
            <ul className="rev-sum">
              {problems.map((r, k) => <li key={r.i} className={fixedNow(r) ? 'ok' : ''}><span aria-hidden>{fixedNow(r) ? '✓' : '○'}</span>
                <button type="button" onClick={() => { setSummary(false); setAt(k) }}>{coachFor(r.text).ask}</button></li>)}
            </ul>
            <button className="btn gold" disabled={busy} onClick={() => onFinish(spot)}>{t('📬 Get feedback')}</button>
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
                {met
                  ? <button type="button" className="btn" onClick={next}>{at < problems.length - 1 ? t('Next problem →') : t('Finish →')}</button>
                  : <button type="button" className="rev-link" onClick={next}>{t('Skip for now')}</button>}
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
  const [phase, setPhase] = useState(sub.phase || 'evaluate')
  const [answers, setAnswers] = useState(() => (sub.evaluation ? Object.fromEntries(sub.evaluation.map((v, i) => [i, v])) : {}))
  const [fixed, setFixed] = useState({})
  const [content, setContent] = useState(working.content)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const timer = useRef(null)
  // A (today's three steps) or B (guided), to compare; guided is the default.
  const [look, setLook] = useState(() => { try { return localStorage.getItem('lscr.revLook') || 'b' } catch { return 'b' } })
  const pickLook = (k) => { setLook(k); try { localStorage.setItem('lscr.revLook', k) } catch { /* fine */ } }

  useEffect(() => { setPhase(sub.phase || 'evaluate') }, [sub.phase])

  function edit(v) {
    setContent(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => api.saveContent(working.id, v), 500)
  }

  async function startRewrite() {
    setBusy(true)
    try {
      const list = (asg.checklist || []).map((_, i) => answers[i] === true)
      await api.evaluate(sub.id, list)
      setPhase('rewrite')
      onChange && onChange()
    } finally { setBusy(false) }
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

  const changed = content.trim() !== original.content.trim()
  const wc = (content || '').split(/\s+/).filter(Boolean).length

  return (
    <div>
      <FeedbackModal result={result} onClose={() => { setResult(null); onBack && onBack() }} />
      {onBack && <button className="backlink" onClick={onBack}>{t('← Back to My Writing')}</button>}

      {/* challenge banner */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: look === 'b' ? 14 : 4, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: 30 }}>🤖</div>
        <div style={{ flex: 1, minWidth: 260 }}>
          {look === 'b'
            ? <><div style={{ fontSize: 18, fontWeight: 800, color: '#0d2f55' }}>{t('Help {name} fix this draft', { name: asg.teacher.name })}</div>
                <div style={{ fontSize: 14, marginTop: 2, color: 'var(--muted)', fontWeight: 600 }}>{t('One problem at a time.')} 🪙 {t('Earn 50 coins')}</div></>
            : <><div className="eyebrow">{t('Daily Revision Challenge')} · {asg.genre} · {t('Grade {n} rubric', { n: asg.gradeLevel })}</div>
                <div style={{ fontSize: 14, marginTop: 2 }}>{asg.prompt}</div></>}
        </div>
        <div className="rev-looks" role="group" aria-label={t('Challenge versions')}>
          {[['a', 'A · Current'], ['b', 'B · Guided']].map(([k, label]) => <button key={k} type="button" aria-pressed={look === k} className={look === k ? 'on' : ''} onClick={() => pickLook(k)}>{label}</button>)}
        </div>
      </div>

      {look === 'b' && <GuidedRevision asg={asg} sub={sub} original={original} content={content} edit={edit} busy={busy} onFinish={finishGuided} />}

      {look === 'a' && <Stepper phase={phase} />}

      {/* ============ STEP 1: read + score against the rubric ============ */}
      {look === 'a' && phase === 'evaluate' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(340px,1fr)', gap: 16, alignItems: 'start' }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f6f9fb' }}>
              <b style={{ fontSize: 14 }}><Glossed text={t("🤖 {name}'s draft", { name: asg.teacher.name })} /></b>
              <span className="pill" style={{ background: '#eef3f6', color: 'var(--muted)' }}>{t('read only')}</span>
            </div>
            <div style={{ padding: '16px 18px', fontSize: 15, lineHeight: 1.7, color: '#3a4149', whiteSpace: 'pre-wrap' }}>{original.content}</div>
          </div>
          <RubricPanel asg={asg} answers={answers} setAnswers={setAnswers} onStartRewrite={startRewrite} busy={busy} />
        </div>
      )}

      {/* ============ STEP 2/3: revise beneath the original, checklist + coach beside ============ */}
      {look === 'a' && phase !== 'evaluate' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.45fr) minmax(300px,1fr)', gap: 16, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f6f9fb' }}>
                <b style={{ fontSize: 14 }}><Glossed text={t("🤖 {name}'s original draft", { name: asg.teacher.name })} /></b>
                <span className="pill" style={{ background: '#eef3f6', color: 'var(--muted)' }}>{t('read only')}</span>
              </div>
              <div style={{ padding: 16, fontSize: 14, lineHeight: 1.6, color: '#3a4149', whiteSpace: 'pre-wrap' }}>{original.content}</div>
            </div>

            <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f2fafd' }}>
                <b style={{ fontSize: 14 }}><Glossed text={t('✍️ Your revision')} /></b>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t('{n} words · autosaves', { n: wc })}</span>
              </div>
              <textarea value={content} onChange={(e) => edit(e.target.value)} disabled={phase === 'done'}
                placeholder={t('Rewrite it here — make it the response Pip WISHES they wrote…')}
                style={{ flex: 1, minHeight: 260, border: 'none', outline: 'none', resize: 'vertical', padding: 16, fontSize: 15.5, lineHeight: 1.65, fontFamily: 'Manrope, sans-serif', color: 'var(--ink)', background: '#fff' }} />
              <div style={{ borderTop: '1px solid var(--line)', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: changed ? 'var(--good)' : 'var(--muted)', fontWeight: 600 }}>
                  {phase === 'done' ? t('✓ Submitted') : changed ? t("✓ You're changing it — keep going") : t('Start reshaping the original above')}
                </span>
                {phase !== 'done' && (
                  <button className="btn gold" disabled={busy || !changed} onClick={submit}>{t('📬 Submit for feedback')}</button>
                )}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 440 }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
              <div style={{ flex: 1, padding: '12px', fontWeight: 800, fontSize: 13.5, background: '#fff', color: 'var(--navy)', borderBottom: '2px solid var(--navy)', textAlign: 'center' }}>
                <Glossed text={t('✅ Revision Checklist')} />
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ChecklistPanel asg={asg} sub={sub} answers={answers} fixed={fixed} setFixed={setFixed} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
