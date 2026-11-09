import React, { useMemo, useState } from 'react'
import { BRAND } from '../lib/brand.js'
import { lookBand, useBandValue } from '../lib/gradeBand.js'
import { CSS as WALK_CSS, LessonPageView, lessonSlides, pageTitle, sectionOf, slideGate, walkPages, youngReader } from './LessonWalkthrough.jsx'
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
// A page's name on the left: its kind, without the part number the section already gives.
const pageName = (p) => (p.type === 'breakout_title' ? 'Welcome' : String(p.label || '').replace(/\s+\d+$/, ''))
const walkTip = (p) => ({ breakout_title: 'Welcome! Let us find out what today is about.', learning_target: 'This is what you will be able to do by the end.', warm_up: 'A quick warm-up to wake up your brain!', vocabulary: 'Tap a word to see what it means.', instruction: 'Watch and read closely. This is the big idea.', group_instruction: 'Talk it over. Explaining it helps you learn it.', example: 'Follow along with the example, then try it.', checkpoint: 'Your turn! Show what you know.', checkpoint_b: 'One more try to lock it in.', exit_ticket: 'Last stop! Show what you learned today.' })[p.type] || 'Keep going. You have got this!'

function LitLabWalk({ lesson, topic, complete, draft, onDraft, onDone, onBack }) {
  const pages = useMemo(() => walkPages(lesson), [lesson])
  // Slide by slide (2026-11-09: "think more slide by slide based rather than a scrolling lesson"): each page plays as short
  // slides (slidesOf), one thing at a time on its theme's scene, and Continue steps through them.
  const slides = useMemo(() => lessonSlides(pages), [pages])
  const total = Math.max(1, slides.length)
  const [at, setAt] = useState(Math.min(draft?.slide || 0, total - 1))
  const [done, setDone] = useState(draft?.done || {})
  const [reached, setReached] = useState(Math.max(draft?.reached || 0, at))
  const save = (patch) => onDraft({ slide: at, done, reached, ...patch })
  const go = (i) => {
    const r = Math.max(reached, i)
    setAt(i); setReached(r); save({ slide: i, reached: r }); window.scrollTo(0, 0)
  }
  const slide = slides[at]
  if (!slide) return null
  const { page, pageAt } = slide
  const mine = done[pageAt] || {}
  const { open, wait } = slideGate(slide, mine)
  const last = at === slides.length - 1
  const pct = Math.round(((at + 1) / total) * 100)
  // Each page's first slide, and the furthest slide the student has opened on it.
  const firstOf = pages.map((_, p) => slides.findIndex((sl) => sl.pageAt === p))
  const sections = pages.reduce((out, p, i) => { const name = sectionOf(p); const prev = out[out.length - 1]; if (prev && prev.name === name) prev.pages.push(i); else out.push({ name, pages: [i] }); return out }, [])
  const finish = complete ? onBack : onDone
  return (
    <div className="llx ll-lesson ll-walk">
      <div aria-hidden className="scene-bg" style={{ backgroundImage: `url(${BASE}bg-enchanted.jpg)` }} />
      <div className="llx-in">
        <aside className="llx-rail" aria-label="Lesson steps">
          <span className="llx-chip">Lit Lab · {topic?.short || topic?.title || 'Lesson'}</span>
          <h1 className="llx-title">{lesson.title}</h1>
          <div className="llx-meter" aria-label={`Step ${at + 1} of ${total}`}>
            <span className="llx-meter-txt"><b>{at + 1}</b> of {total} steps</span>
            <span className="llx-meter-bar"><span style={{ width: `${pct}%` }} /></span>
          </div>
          <div className="llx-sections">
            {sections.map((sec) => {
              const here = sec.pages.includes(pageAt), finished = sec.pages.every((p) => firstOf[p] < reached && p !== pageAt) && !here
              return (
                <section key={sec.name} className={'llx-sec' + (here ? ' on' : '') + (finished ? ' done' : '')}>
                  <button className="llx-sec-head" disabled={firstOf[sec.pages[0]] > reached} onClick={() => !here && firstOf[sec.pages[0]] <= reached && go(firstOf[sec.pages[0]])} aria-expanded={here}>
                    <span>{sec.name}</span><small>{finished ? '✓ Done' : `${sec.pages.length} ${sec.pages.length === 1 ? 'page' : 'pages'}`}</small>
                  </button>
                  {here && (
                    <ol className="llx-steps">
                      {sec.pages.map((p) => {
                        const on = p === pageAt, past = p < pageAt
                        return (
                          <li key={p}>
                            <button className={'llx-step' + (on ? ' on' : '') + (past ? ' past' : '')} disabled={firstOf[p] > reached} onClick={() => firstOf[p] <= reached && !on && go(firstOf[p])} aria-current={on ? 'step' : undefined} title={pageTitle(pages[p])}>
                              <span className="llx-step-n" aria-hidden="true">{past ? '✓' : p + 1}</span>
                              <span className="llx-step-name">{pageName(pages[p])}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </section>
              )
            })}
          </div>
          <Guide text={walkTip(page)} />
        </aside>
        <main className="llx-page">
          <div className={'llw llw-wide' + (youngReader(lesson) ? ' llw-young' : '')}>
            <style>{WALK_CSS}</style>
            <LessonPageView key={at} lesson={lesson} page={page} picture={lessonPicture} student done={mine} Play={ActivityPreview} assetBase={BASE} wide only={slide.only} slideOf={slide}
              onCheck={(i) => { const next = { ...done, [pageAt]: { ...(done[pageAt] || {}), [i]: true } }; setDone(next); save({ done: next }) }} />
          </div>
        </main>
      </div>
      <div className="lsn-nav">
        <div className="lsn-nav-in">
          <button className="lsn-btn ghost" onClick={at === 0 ? onBack : () => go(at - 1)}>{at === 0 ? '← Back to my pathway' : '← Back'}</button>
          {at > 0 && <button className="lsn-exit" onClick={onBack}>Exit to my pathway</button>}
          <div className="lsn-nav-prog" aria-label={`Step ${at + 1} of ${total}`}>
            <span className="lsn-nav-step">{open ? `Step ${at + 1} of ${total} · ${pageTitle(page)}` : wait}</span>
            <span className="lsn-nav-bar"><span style={{ width: `${pct}%` }} /></span>
          </div>
          {last
            ? <button className="lsn-btn done" disabled={!open} title={open ? '' : wait} onClick={finish}>{complete ? 'Back to my pathway' : 'Finish lesson & start practice ✓'}</button>
            : <button className="lsn-btn" disabled={!open} title={open ? '' : wait} onClick={() => go(at + 1)}>Continue →</button>}
        </div>
      </div>
    </div>
  )
}

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
