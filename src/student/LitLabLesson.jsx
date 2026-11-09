import React, { useState } from 'react'
import { BRAND } from '../lib/brand.js'
import { lookBand, useBandValue } from '../lib/gradeBand.js'
import { LessonFrame } from './LessonWalkthrough.jsx'
import { ActivityPreview } from './ProofRoom.jsx'

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

/**
 * The guide under the steps: Luna for grades 2-7; the grade 8 and high-school Writer's Studio has no mascot, so its tip stands
 * on its own (2026-11-04: each band's lesson "based on the grade level and overall style of that grade level").
 */
function Guide({ text }) {
  const studio = lookBand(useBandValue()) === '9-12'
  return (
    <div className={'llx-tip' + (studio ? ' studio' : '')}>
      {!studio && <img src={BRAND.luna} alt="" />}
      <p><b>{studio ? 'Tip' : 'Luna'}</b>{text}</p>
    </div>
  )
}

export function LitLabLesson(props) {
  return props.lesson?.pages ? <LitLabWalk {...props} /> : <LitLabSteps {...props} />
}

/*
 * A lesson written in the CMS (2026-11-04: "For reference, this is kind of what a lesson entails" — Breakout Title, Learning
 * Target, Warm-Up, then Instruction, Example, Another Example and Checkpoint for each part, and an Exit Ticket): its pages in the
 * same frame, grouped down the left as Get ready / Part 1 / Part 2 / Show what you know, the page itself in the middle exactly as the
 * CMS plays it (LessonPageView), and Continue opening when the page's activity, cards or video are done (pageGate).
 */
// A stored lesson picture: a full address, a theme scene shipped with this site, or an uploaded Lit Lab picture.
const lessonPicture = (v) => (!v ? null
  : /^https:\/\//i.test(v) ? v
    : /^\/lit-lab\/themes\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/.test(v) ? BASE + v.slice(1)
      : /^art-[A-Za-z0-9_-]+$/.test(v) ? `https://assets.cleark12.com/proof-room/v1/${v}.webp` : null)

function LitLabWalk({ lesson, topic, complete, draft, onDraft, onDone, onBack }) {
  // The lesson frame is shared with the CMS student preview (2026-11-09: "this exact structure from the site it is going to live
  // within"); this site styles it in StudentPathway.css with each band's look, and its guide is Luna or the high-school tip.
  return (
    <LessonFrame lesson={lesson} picture={lessonPicture} Play={ActivityPreview} assetBase={BASE} chip={`Lit Lab · ${topic?.short || topic?.title || 'Lesson'}`}
      background={`${BASE}bg-enchanted.jpg`} Tip={GuideTip} complete={complete} draft={draft} onDraft={onDraft} onDone={onDone} onBack={onBack} />
  )
}
const GuideTip = ({ text }) => <Guide text={text} />

/** A short sample lesson (the Lit Lab option's): a few steps, each a title, a line and an example. */
function LitLabSteps({ lesson, topic, complete, draft, onDraft, onDone, onBack }) {
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
          <Guide text={tipFor(cur, step, steps.length)} />
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
