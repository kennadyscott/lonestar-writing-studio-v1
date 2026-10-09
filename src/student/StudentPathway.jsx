import React, { useEffect, useState } from 'react'
import { buildStudentPathway, recordWorksheet, scoreAssessment } from '../lib/studentPathway.mjs'
import './StudentPathway.css'

const names = { pre: 'Pre-test', lesson: 'Lesson', practice: 'Practice', post: 'Post-test' }
const marks = { pre: '01', lesson: '▤', practice: '✦', post: '✓' }
const done = (step) => step.state === 'complete'
const attempted = (step) => step.attempted && step.score < 85
const available = (step) => (done(step) && !attempted(step)) || step.state === 'current'
const titleOf = (sheet) => sheet.title.replace(/^Full Topic:\s*/i, '')
const statusOf = (step) => done(step) ? 'Complete' : step.state === 'current' ? 'Up next' : step.state === 'unavailable' ? 'Coming soon' : 'Later'

function shuffledIds(options) {
  const ids = options.map((option) => option.id)
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ids[i], ids[j]] = [ids[j], ids[i]]
  }
  return ids
}

function loadRecord(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch { return {} }
}

// This is an isolated, explicitly labeled sample journey. It neither awards
// coins nor writes to the learner's existing worksheet or assessment records.
export default function StudentPathway({ topic, content, Worksheet, onBackToMap }) {
  const storageKey = `lscr.pathway-preview.v1.${topic.id}`
  const [record, setRecord] = useState(() => loadRecord(storageKey))
  const [active, setActive] = useState(null)
  const [saveFailed, setSaveFailed] = useState(false)
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(record)); setSaveFailed(false) }
    catch { setSaveFailed(true) }
  }, [storageKey, record])
  useEffect(() => { window.scrollTo(0, 0) }, [active?.id])

  const steps = buildStudentPathway(topic, record, content)
  const next = steps.find((step) => step.state === 'current' || step.state === 'unavailable')
  const finished = steps.length > 0 && steps.every(done)
  const completed = steps.filter(done).length
  const open = (step) => { if (available(step)) setActive(step) }
  const sheets = [...topic.core, ...(topic.full ? [topic.full] : [])]
  const completeLesson = (step) => {
    const updated = { ...record, lessons: { ...record.lessons, [step.worksheetId]: true } }
    setRecord(updated)
    const nextStep = buildStudentPathway(topic, updated, content).find((s) => s.state === 'current')
    setActive(nextStep?.type === 'practice' && nextStep.worksheetId === step.worksheetId ? nextStep : null)
  }
  const saveDraft = (id, draft) => setRecord((r) => ({ ...r, drafts: { ...r.drafts, [id]: draft } }))

  return (
    <section className="student-pathway" aria-label={`${topic.short || topic.title} pathway`}>
      <div className="sp-preview-note"><b>Pathway preview</b><span>Sample lessons and tests · Existing practice activities</span></div>
      {saveFailed && <p role="status">Progress is kept for this visit, but this browser could not save it for later.</p>}
      {active ? (
        <>
          <div className="sp-player-toolbar">
            <button className="sp-button secondary" onClick={() => setActive(null)}>Back to my pathway</button>
            <span>{names[active.type]} · {topic.short || topic.title}</span>
            {active.type === 'practice' && <small style={{ flexBasis: '100%' }}>Finished activities are saved. Your current activity restarts if you leave.</small>}
          </div>
          {active.type === 'practice' ? (
            <Worksheet key={active.id} ws={active.sheet} topic={topic} progress={record.worksheets || {}} preview pathwayMode
              resume={record.drafts?.[active.id]} onProgress={(draft) => saveDraft(active.id, draft)}
              onDone={(pct) => setRecord((r) => recordWorksheet(r, active.worksheetId, pct))}
              onQuit={() => setActive(null)} onClose={() => setActive(null)} onNext={() => setActive(null)} />
          ) : active.type === 'lesson' ? (
            <Lesson key={active.id} step={active} complete={!!record.lessons?.[active.worksheetId]}
              draft={record.drafts?.[active.id]} onDraft={(draft) => saveDraft(active.id, draft)}
              onDone={() => completeLesson(active)} onBack={() => setActive(null)} />
          ) : (
            <Assessment key={active.id} step={active} result={record[active.type]} draft={record.drafts?.[active.id]}
              onDraft={(draft) => saveDraft(active.id, draft)}
              onDone={(result) => setRecord((r) => ({ ...r, [active.type]: result }))}
              onBack={() => setActive(null)} />
          )}
        </>
      ) : (
        <>
          <header className="sp-hero" style={{ '--path-art': `url(${import.meta.env.BASE_URL || '/'}lit-valley.jpg)` }}>
            <div className="sp-eyebrow">Your learning path · Grade {topic.grade}</div>
            <h1>{topic.short || topic.title}</h1>
            <p>Learn a skill. Put it into practice. See how much you grow.</p>
            <div className="sp-hero-meta"><span>{topic.core.length} skills</span><span>{sheets.reduce((n, s) => n + s.activities.length, 0)} practice activities</span><span>{completed} of {steps.length} steps complete</span></div>
          </header>
          <div className="sp-flow" aria-label="Pathway sequence">
            <span>Pre-test</span><span aria-hidden>→</span>
            <div className="sp-flow-loop"><span>Lesson</span><span aria-hidden>→</span><span>Practice</span><small>for each skill</small></div>
            <span aria-hidden>→</span><span>Post-test</span>
          </div>
          <div className="sp-layout">
            <div className="sp-journey">
              <TestCard step={steps.find((s) => s.type === 'pre')} onOpen={open} />
              {sheets.map((sheet, i) => {
                const own = steps.filter((s) => s.worksheetId === sheet.id)
                const builder = topic.skillBuilders?.[sheet.id]
                const branch = builder ? steps.filter((s) => s.worksheetId === builder.id) : []
                const retry = own.find((s) => s.id.endsWith(':retry'))
                const group = [...own, ...branch]
                const isComplete = group.length > 0 && group.every(done)
                return (
                  <section key={sheet.id} className={`sp-skill-card ${group.some((s) => s.state === 'current') ? 'is-current' : isComplete ? 'is-complete' : ''}`}>
                    <div className="sp-skill-heading">
                      <span className="sp-step-icon">{isComplete ? '✓' : sheet === topic.full ? '✦' : String(i + 1).padStart(2, '0')}</span>
                      <div className="sp-step-copy"><small>{sheet === topic.full ? 'Bring it all together' : `Skill ${i + 1}`}</small><h2>{titleOf(sheet)}</h2><p>{sheet.skill}</p></div>
                      {isComplete && <span className="sp-status">Complete</span>}
                    </div>
                    <div className="sp-skill-actions">{own.filter((s) => s !== retry).map((s) => <WorkStep key={s.id} step={s} onOpen={open} />)}</div>
                    {!!branch.length && <div className="sp-branch"><b>A little extra practice</b><p>Your Skill Builder helps with this skill before you try again.</p><div className="sp-skill-actions">{branch.map((s) => <WorkStep key={s.id} step={s} onOpen={open} />)}</div></div>}
                    {retry && <div className="sp-skill-actions"><WorkStep step={retry} onOpen={open} retry /></div>}
                  </section>
                )
              })}
              <TestCard step={steps.find((s) => s.type === 'post')} onOpen={open} />
            </div>
            <aside className="sp-sidebar">
              <div className="sp-next-card">
                <div className="sp-next-label">{finished ? 'Path complete' : 'Your next step'}</div>
                <h2>{finished ? 'Look how far you’ve come!' : next?.type === 'pre' ? 'Start with what you know' : next?.type === 'post' ? 'Show your growth' : next?.type === 'lesson' ? 'Learn the skill' : 'Put it into practice'}</h2>
                <p>{finished ? 'You finished your lessons, practice, and post-test.' : next?.type === 'pre' ? 'A short pre-test gives you a starting point. You don’t need to know everything yet.' : next?.type === 'post' ? 'You’ve put in the work. Now see what you can do on your own.' : next?.title}</p>
                {next && <button className="sp-button" disabled={!available(next)} onClick={() => open(next)}>{next.state === 'unavailable' ? 'Content coming soon' : `${record.drafts?.[next.id] ? 'Continue' : 'Start'} ${names[next.type].toLowerCase()}`}</button>}
                {finished && <><div className="sp-score-pair"><span>Pre-test<b>{record.pre?.score}%</b></span><span>Post-test<b>{record.post?.score}%</b></span></div><button className="sp-button" onClick={onBackToMap}>Back to the Labyrinth</button></>}
                <div className="sp-progress-track" role="progressbar" aria-label="Pathway progress" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={completed}><span style={{ width: `${steps.length ? completed / steps.length * 100 : 0}%` }} /></div>
                <small>{completed} of {steps.length} steps complete</small>
                <div className="sp-summary"><div className="sp-summary-row"><span>Pre-test</span><b>{record.pre?.complete ? `${record.pre.score}%` : 'Not started'}</b></div><div className="sp-summary-row"><span>Skills practiced</span><b>{topic.core.filter((s) => record.worksheets?.[s.id]?.passed).length} / {topic.core.length}</b></div><div className="sp-summary-row"><span>Post-test</span><b>{record.post?.complete ? `${record.post.score}%` : 'At the end'}</b></div></div>
                <p className="sp-help">Take it one step at a time. You can revisit any lesson you’ve finished.</p>
              </div>
            </aside>
          </div>
        </>
      )}
    </section>
  )
}

function WorkStep({ step, onOpen, retry }) {
  return <button className={`sp-work-step is-${step.state}`} disabled={!available(step)} onClick={() => onOpen(step)}>
    <span className="sp-work-icon" aria-hidden>{done(step) ? '✓' : marks[step.type]}</span>
    <span className="sp-work-copy"><strong>{retry ? 'Try the practice again' : names[step.type]}</strong><small>{step.type === 'lesson' ? `${step.lesson?.steps.length || 0} short steps` : `${step.sheet?.activities.length || 0} activities`}{done(step) && step.score != null ? ` · ${step.score}%` : ''}</small></span>
    <span className="sp-work-state">{attempted(step) ? 'Attempted' : done(step) ? step.type === 'practice' ? 'Again' : 'Review' : statusOf(step)}</span>
  </button>
}

function TestCard({ step, onOpen }) {
  if (!step) return null
  return <section className={`sp-test-card is-${step.state}`}>
    <span className="sp-step-icon" aria-hidden>{done(step) ? '✓' : step.type === 'pre' ? '✧' : '⚑'}</span>
    <div className="sp-step-copy"><small>{step.type === 'pre' ? 'Your starting point' : 'The finish line'}</small><h2>{names[step.type]}</h2><p>{step.type === 'pre' ? 'Show what you already know.' : 'Show what you’ve learned.'} · {step.assessment?.items.length || 0} questions</p></div>
    <button className="sp-stage-action" disabled={!available(step)} onClick={() => onOpen(step)}>{done(step) ? `Results · ${step.score}%` : step.state === 'current' ? `Start ${names[step.type].toLowerCase()}` : step.state === 'unavailable' ? 'Coming soon' : 'After practice'}</button>
  </section>
}

function Lesson({ step, complete, draft, onDraft, onDone, onBack }) {
  const pages = step.lesson.steps
  const [page, setPage] = useState(Math.min(draft?.page || 0, pages.length - 1))
  const go = (index) => { setPage(index); onDraft({ page: index }); window.scrollTo(0, 0) }
  const current = pages[page]
  return <article className="sp-player-card">
    <div className="sp-player-head"><div><div className="sp-eyebrow">Lesson</div><h1>{step.lesson.title}</h1></div><span className="sp-counter">{page + 1} / {pages.length}</span></div>
    <div className="sp-lesson-tabs" aria-label="Lesson progress">{pages.map((p, i) => <span key={i} className={i === page ? 'active' : i < page ? 'done' : ''}>{i < page ? '✓' : i + 1}<span>{p.title}</span></span>)}</div>
    <div className="sp-lesson-copy"><h2>{current.title}</h2><p>{current.body}</p>{current.example && <blockquote className="sp-example"><small>See it in action</small><p>{current.example}</p></blockquote>}</div>
    <div className="sp-player-footer"><button className="sp-button secondary" disabled={page === 0} onClick={() => go(page - 1)}>Previous</button>{page + 1 < pages.length ? <button className="sp-button" onClick={() => go(page + 1)}>Next</button> : <button className="sp-button" onClick={complete ? onBack : onDone}>{complete ? 'Back to my pathway' : 'Finish lesson & start practice'}</button>}</div>
  </article>
}

function Assessment({ step, result, draft, onDraft, onDone, onBack }) {
  const items = step.assessment.items
  const [index, setIndex] = useState(Math.min(draft?.index || 0, items.length - 1))
  const [answers, setAnswers] = useState(draft?.answers || {})
  const [order] = useState(() => draft?.order || Object.fromEntries(items.map((it) => [it.id, shuffledIds(it.options)])))
  const item = items[index]
  const answer = answers[item.id] || []
  const options = (order[item.id] || []).map((id) => item.options.find((o) => o.id === id)).filter(Boolean)
  const change = (value) => { const next = { ...answers, [item.id]: value }; setAnswers(next); onDraft({ index, answers: next, order }) }
  const go = (i) => { setIndex(i); onDraft({ index: i, answers, order }); window.scrollTo(0, 0) }
  const ready = item.kind === 'order' ? answer.length === item.options.length : answer.length > 0
  const submit = () => {
    const correct = items.filter((it) => scoreAssessment(it, answers[it.id])).length
    onDone({ complete: true, score: Math.round(correct / items.length * 100), correct, total: items.length, answers })
    window.scrollTo(0, 0)
  }
  if (result?.complete) return <article className="sp-player-card sp-completion"><div className="sp-eyebrow">{names[step.type]} complete</div><h1>{step.type === 'pre' ? 'Your starting point is set.' : 'You finished your pathway!'}</h1><div className="sp-result-score">{result.score}%</div><p>{result.correct} of {result.total} correct</p><p>{step.type === 'pre' ? 'Now learn each skill, then put it into practice. Your pre-test score won’t hold you back.' : 'You’ve worked through the lessons and practice. Take a look at how far you’ve come.'}</p><button className="sp-button" onClick={onBack}>{step.type === 'pre' ? 'Continue to my lessons' : 'See my completed path'}</button></article>
  return <article className="sp-player-card">
    <div className="sp-player-head"><div><div className="sp-eyebrow">{names[step.type]} · {step.type === 'pre' ? 'Try your best' : 'Show what you know'}</div><h1>{step.assessment.title}</h1></div><span className="sp-counter">{index + 1} / {items.length}</span></div>
    <div className="sp-question"><h2>{item.prompt}</h2>
      {item.kind === 'inline' ? <div className="sp-inline"><label htmlFor="sp-inline-answer">Choose the missing word</label><select id="sp-inline-answer" value={answer[0] || ''} onChange={(e) => change(e.target.value ? [e.target.value] : [])}><option value="">Choose an answer…</option>{options.map((o) => <option key={o.id} value={o.id}>{o.text}</option>)}</select></div>
        : item.kind === 'order' ? <><p>Tap the pieces in order to build the sentence. Tap a chosen piece to remove it.</p><div className="sp-order-answer" aria-label="Your sentence">{answer.length ? answer.map((id, i) => <button key={id} onClick={() => change(answer.filter((x) => x !== id))} aria-label={`Remove ${item.options.find((o) => o.id === id)?.text}`}><b>{i + 1}</b> {item.options.find((o) => o.id === id)?.text}</button>) : <span>Your sentence will appear here.</span>}</div><div className="sp-order-pool" aria-label="Sentence pieces">{options.map((o) => <button key={o.id} disabled={answer.includes(o.id)} onClick={() => change([...answer, o.id])}>{o.text}</button>)}</div></>
          : <><p>{item.kind === 'multi' ? 'Choose all that apply.' : 'Choose one answer.'}</p><div className="sp-options" role={item.kind === 'multi' ? 'group' : 'radiogroup'} aria-label={item.prompt}>{options.map((o, i) => <button key={o.id} role={item.kind === 'multi' ? 'checkbox' : 'radio'} aria-checked={answer.includes(o.id)} className={`sp-option ${answer.includes(o.id) ? 'selected' : ''}`} onClick={() => change(item.kind === 'multi' ? answer.includes(o.id) ? answer.filter((id) => id !== o.id) : [...answer, o.id] : [o.id])}><span className="sp-choice-marker">{item.kind === 'multi' ? answer.includes(o.id) ? '✓' : '' : String.fromCharCode(65 + i)}</span>{o.text}</button>)}</div></>}
    </div>
    <div className="sp-player-footer"><button className="sp-button secondary" disabled={index === 0} onClick={() => go(index - 1)}>Previous</button><span className="sp-counter">{index + 1} of {items.length} questions</span><button className="sp-button" disabled={!ready} onClick={index + 1 === items.length ? submit : () => go(index + 1)}>{index + 1 === items.length ? 'Finish test' : 'Next question'}</button></div>
  </article>
}
