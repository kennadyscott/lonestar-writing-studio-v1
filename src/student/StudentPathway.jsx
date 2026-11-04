import React, { useEffect, useState } from 'react'
import { buildStudentPathway, recordWorksheet } from '../lib/studentPathway.mjs'
import { StudentTestCard } from './testCard/StudentTestCard.jsx'
import { scoreStudentItem } from './testCard/studentTestItem.mjs'
import { useBandValue } from '../lib/gradeBand.js'
import './StudentPathway.css'
import { Path45Trail, Path45Dashboard, samplePathRecord } from './Path45Looks.jsx'
import { LitLabLesson } from './LitLabLesson.jsx'

const names = { pre: 'Pre-test', lesson: 'Lesson', practice: 'Practice', post: 'Post-test' }
const done = (step) => step.state === 'complete'
const attempted = (step) => step.attempted && step.score < 85
const available = (step) => (done(step) && !attempted(step)) || step.state === 'current'
const titleOf = (sheet) => sheet.title.replace(/^Full Topic:\s*/i, '')


function loadRecord(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch { return {} }
}

// This is an isolated, explicitly labeled sample journey. It neither awards
// coins nor writes to the learner's existing worksheet or assessment records.
export default function StudentPathway({ topic, content, Worksheet, onBackToMap }) {
  const band = useBandValue()
  const storageKey = `lscr.pathway-preview.v1.${topic.id}`
  const [record, setRecord] = useState(() => loadRecord(storageKey))
  const [active, setActive] = useState(null)
  const [saveFailed, setSaveFailed] = useState(false)
  // PROTOTYPE (grades 3-5, 2026-10-14): A Trail or B Dashboard, and sample progress to see it new / partway / done (display only)
  // Kennady chose A Trail (2026-11-03: "I prefer Trail"); the A/B switch is gone. B Dashboard stays in Path45Looks.jsx.
  const look = 'a'
  // Every band walks the trail (2026-11-04: "Adjust the other grade levels to match this style - both the pathway and what the
  // lesson looks like when you open it up"), dressed for its band in StudentPathway.css. The per-band lists it replaced are gone.
  const is45 = true
  const [sample, setSampleRaw] = useState(() => { try { return localStorage.getItem('lscr.pathSample') || 'partway' } catch { return 'partway' } })
  const setSample = (v) => { setSampleRaw(v); try { localStorage.setItem('lscr.pathSample', v) } catch { /* fine */ } }
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(record)); setSaveFailed(false) }
    catch { setSaveFailed(true) }
  }, [storageKey, record])
  useEffect(() => { window.scrollTo(0, 0) }, [active?.id])

  // Starting any step starts the path, so the rest of the Lit Lab locks behind it (November 3, 2026).
  const open = (step) => { if (!available(step)) return; setActive(step); setRecord((r) => (r.started ? r : { ...r, started: true })) }
  const completeLesson = (step) => {
    const updated = { ...record, lessons: { ...record.lessons, [step.worksheetId]: true } }
    setRecord(updated)
    const nextStep = buildStudentPathway(topic, updated, content).find((s) => s.state === 'current')
    setActive(nextStep?.type === 'practice' && nextStep.worksheetId === step.worksheetId ? nextStep : null)
  }
  const saveDraft = (id, draft) => setRecord((r) => ({ ...r, drafts: { ...r.drafts, [id]: draft } }))

  // A pre-test or post-test gets the whole screen (October 12, 2026: on a Chromebook "There is SO MUCH space not being utilized well
  // at the top and then the student has to scroll to see the whole question"): no breadcrumb, note or toolbar row; the way back sits
  // in the test card's own header.
  const testing = !!active && (active.type === 'pre' || active.type === 'post')
  // A lesson opens in Luna's lesson frame and, like a test, takes the whole screen (2026-11-04: "make the regular lit lab match this structure").
  const immersive = testing || (!!active && active.type === 'lesson')
  return (
    <section className={'student-pathway' + (testing ? ' sp-testing' : '')} aria-label={`${topic.short || topic.title} pathway`}>
      {!immersive && <div className="sp-preview-note"><b>Pathway preview</b><span>Sample lessons and tests · Existing practice activities</span>
        {is45 && !active && <span className="sp-proto">
          <span className="style-pick" role="group" aria-label="Prototype: sample progress"><span className="lbl">Sample</span>{[['new', 'New'], ['partway', 'Partway'], ['done', 'Done'], ['mine', 'Mine']].map(([k, n]) => <button key={k} className={sample === k ? 'on' : ''} onClick={() => setSample(k)}>{n}</button>)}</span>
        </span>}
      </div>}
      {saveFailed && <p role="status">Progress is kept for this visit, but this browser could not save it for later.</p>}
      {active ? (
        <>
          {!immersive && <div className="sp-player-toolbar">
            <button className="sp-button secondary" onClick={() => setActive(null)}>Back to my pathway</button>
            <span>{names[active.type]} · {topic.short || topic.title}</span>
            {active.type === 'practice' && <small style={{ flexBasis: '100%' }}>Finished activities are saved. Your current activity restarts if you leave.</small>}
          </div>}
          {active.type === 'practice' ? (
            <Worksheet key={active.id} ws={active.sheet} topic={topic} progress={record.worksheets || {}} preview pathwayMode
              resume={record.drafts?.[active.id]} onProgress={(draft) => saveDraft(active.id, draft)}
              onDone={(pct) => setRecord((r) => recordWorksheet(r, active.worksheetId, pct))}
              onQuit={() => setActive(null)} onClose={() => setActive(null)} onNext={() => setActive(null)} />
          ) : active.type === 'lesson' ? (
            <Lesson key={active.id} step={active} topic={topic} complete={!!record.lessons?.[active.worksheetId]}
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
        <Path45Look look={look} topic={topic} record={sample === 'mine' ? record : samplePathRecord(sample, topic)}
          model={pathModel(topic, content, sample === 'mine' ? record : samplePathRecord(sample, topic))} onOpen={open} onBack={onBackToMap} />
      )}
    </section>
  )
}

function pathModel(topic, content, record) {
  const steps = buildStudentPathway(topic, record, content)
  const sheets = [...(topic.core || []), topic.full].filter(Boolean)
  const skills = sheets.map((sheet, i) => {
    const own = steps.filter((step) => step.worksheetId === sheet.id && !step.skillBuilder)
    const lesson = own.find((step) => step.type === 'lesson')
    const practice = own.find((step) => step.type === 'practice' && !step.retry)
    const extra = [
      ...steps.filter((step) => step.skillBuilder && step.forId === sheet.id),
      ...own.filter((step) => step.retry),
    ]
    return {
      id: sheet.id,
      n: i + 1,
      full: sheet === topic.full,
      title: titleOf(sheet),
      skill: sheet.skill,
      lesson,
      practice,
      extra,
      lessonSteps: lesson?.lesson?.steps?.length || lesson?.lesson?.pages?.length || 0,
      activities: practice?.sheet?.activities?.length || 0,
    }
  })
  const pre = steps.find((step) => step.type === 'pre')
  const post = steps.find((step) => step.type === 'post')
  const current = steps.find((step) => step.state === 'current' || step.state === 'unavailable')
  return {
    title: topic.short || topic.title,
    steps,
    pre,
    post,
    skills,
    current,
    finished: steps.length > 0 && steps.every(done),
    gained: done(pre) && done(post) && pre.score != null && post.score != null ? post.score - pre.score : null,
  }
}

function Path45Look({ look, ...props }) {
  return look === 'b' ? <Path45Dashboard {...props} /> : <Path45Trail {...props} />
}

function Lesson({ step, topic, complete, draft, onDraft, onDone, onBack }) {
  return <LitLabLesson lesson={step.lesson} topic={topic} complete={complete} draft={draft} onDraft={onDraft} onDone={onDone} onBack={onBack} />
}

// A pre-test or post-test, one question at a time on the shared student test card: answer, check (one try; a wrong answer shows the
// hint), then the next question. The score is the share of questions right, counted when the test is finished.
const cardItem = (it) => ({ ...it, picture: it.picture ? { ...it.picture, src: `${import.meta.env.BASE_URL || '/'}${it.picture.src}` } : undefined })
function Assessment({ step, result, draft, onDraft, onDone, onBack }) {
  const items = step.assessment.items
  const [index, setIndex] = useState(Math.min(draft?.index || 0, items.length - 1))
  const [answers, setAnswers] = useState(draft?.answers || {})
  const [checked, setChecked] = useState(draft?.checked || {})
  const [seed] = useState(() => draft?.seed || Math.random().toString(36).slice(2))
  const item = items[index]
  const save = (patch) => onDraft({ index, answers, checked, seed, ...patch })
  const go = (i) => { setIndex(i); save({ index: i }); window.scrollTo(0, 0) }
  const submit = () => {
    const correct = items.filter((it) => scoreStudentItem(cardItem(it), answers[it.id])).length
    onDone({ complete: true, score: Math.round(correct / items.length * 100), correct, total: items.length, answers })
    window.scrollTo(0, 0)
  }
  if (result?.complete) return <article className="sp-player-card sp-completion"><div className="sp-eyebrow">{names[step.type]} complete</div><h1>{step.type === 'pre' ? 'Your starting point is set.' : 'You finished your pathway!'}</h1><div className="sp-result-score">{result.score}%</div><p>{result.correct} of {result.total} correct</p><p>{step.type === 'pre' ? 'Now learn each skill, then put it into practice. Your pre-test score won’t hold you back.' : 'You’ve worked through the lessons and practice. Take a look at how far you’ve come.'}</p><button className="sp-button" onClick={onBack}>{step.type === 'pre' ? 'Continue to my lessons' : 'See my completed path'}</button></article>
  const last = index + 1 === items.length
  return <StudentTestCard key={item.id} item={cardItem(item)} answer={answers[item.id] || []}
    onAnswer={(a) => { const next = { ...answers, [item.id]: a }; setAnswers(next); save({ answers: next }) }}
    checked={!!checked[item.id]} onCheck={() => { const next = { ...checked, [item.id]: true }; setChecked(next); save({ checked: next }) }}
    eyebrow={`${names[step.type]} · ${step.type === 'pre' ? 'Try your best' : 'Show what you know'}`} title={step.assessment.title}
    index={index} total={items.length} progress={items.map((it, i) => (i === index ? 'on' : checked[it.id] ? 'done' : ''))}
    onBack={onBack} onPrev={() => go(index - 1)} onNext={last ? submit : () => go(index + 1)} nextLabel={last ? 'Finish test' : 'Next question'} seed={seed} />
}
