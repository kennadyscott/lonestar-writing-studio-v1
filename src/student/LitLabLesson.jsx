import React, { useState } from 'react'
import { BRAND } from '../lib/brand.js'

const BASE = import.meta.env.BASE_URL || '/'

/*
 * A Lit Lab lesson in Luna's lesson structure (2026-11-04: "We are going to weave Luna into Lit Lab. I like how the lessons/framework
 * is set up for Luna once you go into the lesson - can we make the regular lit lab match this structure?"), in a modern look rather
 * than the open book ("I don't really like the 'book pages' vibe - can we go something a bit more modern looking?"): the lesson's
 * steps in a card down the left with a progress meter and Luna's tip, the step in a wide card beside it, and Back / Step n of N /
 * Continue pinned to the bottom (the Luna lesson's bar).
 */

// Luna's line under the steps: the step's example when it has one, otherwise where the student is in the lesson.
const tipFor = (step, i, total) =>
  step.example ? 'Here is how it sounds. Read it out loud!'
    : i === 0 ? 'One step at a time. Read it, then say it in your own words.'
      : i === total - 1 ? 'That is every step. You are ready to practice!'
        : 'Good! Keep going. Each step builds on the last one.'

export function LitLabLesson({ lesson, topic, complete, draft, onDraft, onDone, onBack }) {
  const steps = lesson.steps || []
  const total = Math.max(1, steps.length)
  const [step, setStep] = useState(Math.min(draft?.page || 0, total - 1))
  const [reached, setReached] = useState(Math.max(draft?.reached || 0, step))
  const go = (i) => {
    const r = Math.max(reached, i)
    setStep(i); setReached(r); onDraft({ page: i, reached: r }); window.scrollTo(0, 0)
  }
  const cur = steps[step] || { title: lesson.title, body: '' }
  const last = step === steps.length - 1
  const pct = Math.round(((step + 1) / total) * 100)
  const finish = complete ? onBack : onDone
  return (
    <div className="llx ll-lesson">
      {/* the student home's scene, faint behind the cards */}
      <div aria-hidden className="scene-bg" style={{ backgroundImage: `url(${BASE}bg-enchanted.jpg)` }} />
      <div className="llx-in">
        <aside className="llx-rail" aria-label="Lesson steps">
          <span className="llx-chip">Lit Lab · {topic?.short || topic?.title || 'Lesson'}</span>
          <h1 className="llx-title">{lesson.title}</h1>
          <div className="llx-meter" aria-label={`${step + 1} of ${total} steps`}>
            <span className="llx-meter-txt"><b>{step + 1}</b> of {total} steps</span>
            <span className="llx-meter-bar"><span style={{ width: `${pct}%` }} /></span>
          </div>
          <ol className="llx-steps">
            {steps.map((s, i) => {
              const on = i === step, past = i < reached && !on
              return (
                <li key={i}>
                  <button className={'llx-step' + (on ? ' on' : '') + (past ? ' past' : '')} disabled={i > reached} onClick={() => i <= reached && go(i)} aria-current={on ? 'step' : undefined}>
                    <span className="llx-step-n" aria-hidden="true">{past ? '✓' : i + 1}</span>
                    <span className="llx-step-name">{s.title}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          <div className="llx-tip">
            <img src={BRAND.luna} alt="" />
            <p><b>Luna</b>{tipFor(cur, step, steps.length)}</p>
          </div>
        </aside>
        <main className="llx-stage">
          <span className="llx-kicker">Step {step + 1}</span>
          <h2 className="llx-h">{cur.title}</h2>
          <p className="llx-body">{cur.body}</p>
          {cur.example && (
            <figure className="llx-example">
              <figcaption><span aria-hidden="true">✨</span> See it in action</figcaption>
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
