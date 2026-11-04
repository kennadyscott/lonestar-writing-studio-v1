import React, { useState } from 'react'
import { BRAND } from '../lib/brand.js'

/*
 * A Lit Lab lesson in Luna's lesson frame (2026-11-04: "We are going to weave Luna into Lit Lab. I like how the lessons/framework is
 * set up for Luna once you go into the lesson - can we make the regular lit lab match this structure?"). The same open book as
 * LessonPage.jsx and its lsn-* styles: the lesson's steps down a slim left page, the open one showing what it is about, Luna's tip
 * under them, the step across the rest of the screen, and Back / Step n of N / Continue pinned to the bottom.
 */

const BASE = import.meta.env.BASE_URL || '/'

// Luna's line under the steps: the step's example when it has one, otherwise where the student is in the lesson.
const tipFor = (step, i, total) =>
  step.example ? 'Here is how it sounds. Read it out loud!'
    : i === 0 ? 'One step at a time. Read it, then say it in your own words.'
      : i === total - 1 ? 'That is every step. You are ready to practice!'
        : 'Good! Keep going. Each step builds on the last one.'

export function LitLabLesson({ lesson, topic, complete, draft, onDraft, onDone, onBack }) {
  const steps = lesson.steps || []
  const [step, setStep] = useState(Math.min(draft?.page || 0, Math.max(0, steps.length - 1)))
  const [reached, setReached] = useState(Math.max(draft?.reached || 0, step))
  const go = (i) => {
    const r = Math.max(reached, i)
    setStep(i); setReached(r); onDraft({ page: i, reached: r }); window.scrollTo(0, 0)
  }
  const cur = steps[step] || { title: lesson.title, body: '' }
  const last = step === steps.length - 1
  const pct = Math.round(((step + 1) / Math.max(1, steps.length)) * 100)
  const finish = complete ? onBack : onDone
  return (
    <div className="lsn lsn-b ll-lesson">
      <div aria-hidden className="lsn-bg" style={{ '--bg': `url(${BASE}bg-nook.jpg)` }} />
      <div className="lsn-book">
        <aside className="lsn-page lsn-left">
          <div className="lsn-kicker">Lit Lab · {topic?.short || topic?.title || 'Lesson'}</div>
          <h1 className="lsn-title">{lesson.title}</h1>
          <ol className="lsn-tabs">
            {steps.map((s, i) => {
              const on = i === step, past = i < reached && !on
              return (
                <li key={i}>
                  <button className={'lsn-tab' + (on ? ' cur' : '') + (past ? ' past' : '')} disabled={i > reached} onClick={() => i <= reached && go(i)} aria-current={on ? 'step' : undefined}>
                    <span className="lsn-tab-n">{past ? '✓' : i + 1}</span>{s.title}
                  </button>
                  {on && (
                    <div className="lsn-tab-detail">
                      <div className="lsn-step-sub">{s.body}</div>
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
          <div className="lsn-tip">
            <img src={BRAND.luna} alt="" className="lsn-tip-luna" />
            <div className="lsn-tip-bubble">{tipFor(cur, step, steps.length)}</div>
          </div>
        </aside>
        <main className="lsn-page lsn-right ll-step">
          <div className="ll-step-n">Step {step + 1} of {steps.length}</div>
          <h2 className="lsn-step-title ll-step-title">{cur.title}</h2>
          <p className="ll-step-body">{cur.body}</p>
          {cur.example && (
            <figure className="ll-step-example">
              <figcaption>See it in action</figcaption>
              <blockquote>{cur.example}</blockquote>
            </figure>
          )}
        </main>
      </div>
      <div className="lsn-nav">
        <div className="lsn-nav-in">
          <button className="lsn-btn ghost" onClick={step === 0 ? onBack : () => go(step - 1)}>{step === 0 ? '← Back to my pathway' : '← Back'}</button>
          {step > 0 && <button className="lsn-exit" onClick={onBack}>Exit to my pathway</button>}
          <div className="lsn-nav-prog" aria-label={`${step + 1} of ${steps.length}`}>
            <span className="lsn-nav-step">Step {step + 1} of {steps.length} · {cur.title}</span>
            <span className="lsn-nav-bar"><span style={{ width: `${pct}%` }} /></span>
          </div>
          {last
            ? <button className="lsn-btn done" onClick={finish}>{complete ? 'Back to my pathway' : 'Finish lesson & start practice ✓'}</button>
            : <button className="lsn-btn" onClick={() => go(step + 1)}>Continue →</button>}
        </div>
      </div>
    </div>
  )
}
