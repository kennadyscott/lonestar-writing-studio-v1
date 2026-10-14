import React, { useState } from 'react'
import { landImg } from './ProofRoom.jsx'

/*
 * Grades 3-5: the student's pathway as a trail (Kennady, 2026-10-14: "let's play with what the pathway preview looks like on the
 * student side"; she picked the trail, "I like the path - remove the other option"). It borrows the Practice card: the domain's
 * land art behind a trail of stones with each score, a Skill Builder as its own purple ⚡ stop, growth as a percent. Under it,
 * the stop you are on as a Home-page card with assignment-style rows. Tried and dropped: a quest board of cards, a one-step view.
 */

const isDone = (s) => s?.state === 'complete'
const isNow = (s) => s?.state === 'current' || s?.state === 'unavailable'
const canOpen = (s) => !!s && (s.state === 'current' || (isDone(s) && !(s.attempted && s.score < 85)))
const stateOf = (steps) => (steps.length && steps.every(isDone) ? 'done' : steps.some(isNow) ? 'now' : 'later')

/* The path as stops: pre-test, each skill (with its Skill Builder, if one came up), put it together, post-test. */
function stopsOf(model, record) {
  const stops = [{ key: 'pre', kind: 'test', n: 1, label: 'Pre-test', line: 'See what you already know.', parts: [{ step: model.pre, label: 'Pre-test', sub: `${model.pre?.assessment?.items?.length || 0} questions` }], state: stateOf([model.pre].filter(Boolean)), score: model.pre?.score }]
  for (const sk of model.skills) {
    const sbLesson = sk.extra.find((s) => s.skillBuilder && s.type === 'lesson')
    const sbPractice = sk.extra.find((s) => s.skillBuilder && s.type === 'practice')
    const retry = sk.extra.find((s) => s.retry)
    const parts = [
      { step: sk.lesson, label: 'Learn it', sub: `${sk.lessonSteps} short steps` },
      { step: sk.practice, label: 'Practice', sub: `${sk.activities} activities` },
      ...(sbLesson ? [{ step: sbLesson, label: 'Skill Builder lesson', sub: 'Extra help', sb: true }] : []),
      ...(sbPractice ? [{ step: sbPractice, label: 'Skill Builder practice', sub: 'Extra practice', sb: true }] : []),
      ...(retry ? [{ step: retry, label: 'Try it again', sub: `${sk.activities} activities` }] : []),
    ].filter((p) => p.step)
    const first = record?.worksheets?.[sk.id]?.first
    stops.push({
      key: sk.id, kind: sk.full ? 'full' : 'skill', n: stops.length + 1, label: sk.full ? 'Put it together' : sk.title, line: sk.skill,
      parts, state: stateOf(parts.map((p) => p.step)), score: sk.practice?.score, first: sbPractice ? (first ?? null) : null,
      sb: sbPractice ? { score: sbPractice.score, state: stateOf([sbLesson, sbPractice].filter(Boolean)) } : null,
    })
  }
  if (model.post) stops.push({ key: 'post', kind: 'test', n: stops.length + 1, label: 'Post-test', line: 'Show what you learned, on your own.', parts: [{ step: model.post, label: 'Post-test', sub: `${model.post?.assessment?.items?.length || 0} questions` }], state: stateOf([model.post]), score: model.post?.score })
  return stops
}

function Growth({ model }) {
  const pre = isDone(model.pre) ? model.pre.score : null
  const post = isDone(model.post) ? model.post.score : null
  return (
    <span className="ll-growth p45-growth">
      <span>Pre-test <b>{pre == null ? '—' : pre + '%'}</b></span>
      <span className="ll-g-arrow" aria-hidden>→</span>
      <span>Post-test <b>{post == null ? '🔒' : post + '%'}</b></span>
      {pre != null && post != null && <span className={'ll-g-up' + (post - pre < 0 ? ' down' : '')}>{post - pre >= 0 ? '+' : ''}{post - pre}%</span>}
    </span>
  )
}

export const PATH45_LOOKS = [['a', 'Trail'], ['b', 'Dashboard']]

const Back = ({ onBack }) => <button type="button" className="p45-back" onClick={onBack}>← Back to the map</button>

/* One stop as a Home-page card (2026-10-14: "I still don't love the Next Up box - can we match more of the aesthetic of the home
 * page?"): a white card, a small teal heading over the stop's name, and one assignment-style row per part (its name, a type
 * chip, a grey tag, the status in the due-date spot, and Home's navy Begin / outlined Look back buttons). */
const PART_CHIP = { lesson: ['LESSON', 'var(--ecr)'], practice: ['PRACTICE', 'var(--scr)'], pre: ['TEST', '#0d2f55'], post: ['TEST', '#0d2f55'] }
function NextCard({ pick, onOpen, onBackToNext }) {
  const heading = pick.state === 'now' ? 'Your next step' : pick.state === 'done' ? 'Done' : 'Coming up'
  // a finished stop is a summary line and one Review button (its lesson), not a row per part
  const review = pick.parts.find((p) => isDone(p.step) && canOpen(p.step))
  return (
    <section className={'card p45-nextcard ' + pick.state}>
      <div className="p45-nc-head">
        <div>
          <span className="p45-nc-k">{heading}{pick.kind === 'skill' ? ` · Skill ${pick.n - 1}` : ''}</span>
          <b className="p45-nc-title">{pick.label}</b>
          <span className="p45-nc-line">{pick.line}</span>
        </div>
        <span className="p45-nc-side">
          {onBackToNext && <button type="button" className="assign-more-b" onClick={onBackToNext}>Back to my next step</button>}
          {pick.state === 'done' && review && <button className="btn ghost" onClick={() => onOpen(review.step)}>Review</button>}
        </span>
      </div>
      {/* finished parts fold into one line, so only what is left gets a row */}
      {pick.state !== 'later' && pick.parts.some((p) => isDone(p.step)) && (
        <div className="p45-nc-done">
          {pick.parts.filter((p) => isDone(p.step)).map((p) => <span key={p.step.id} className={p.sb ? 'sb' : ''}>{p.sb ? '⚡' : '✓'} {p.label}{p.step.score != null ? ` ${p.step.score}%` : ''}</span>)}
        </div>
      )}
      <div className="assign-list-b p45-nc-list">
        {pick.parts.filter((p) => !isDone(p.step)).map((p) => {
          const s = p.step
          const [chip, bg] = p.sb ? ['⚡ SKILL BUILDER', '#8b6ee0'] : PART_CHIP[s.type] || ['STEP', '#0d2f55']
          return (
            <div key={s.id} className={'assign-row' + (isDone(s) ? ' done' : isNow(s) ? ' now' : ' later')}>
              <div className="assign-main">
                <div className="assign-title">{p.label}</div>
                <div className="assign-meta">
                  <span className="p45-type" style={{ background: bg }}>{chip}</span>
                  <span className="pill" style={{ background: '#eef3f6', color: '#5c7285' }}>{p.sub}</span>
                </div>
              </div>
              <div className="assign-actions">
                <div className="assign-due">
                  {isDone(s) ? <span className="pill green">✓ {s.score != null ? s.score + '%' : 'Done'}</span>
                    : isNow(s) ? <span className="p45-due now">{s.state === 'unavailable' ? 'Coming soon' : 'Up next'}</span>
                    : <span className="p45-due">🔒 Later</span>}
                </div>
                <div className="assign-go">
                  {isNow(s) && s.state !== 'unavailable' && <button className="btn" onClick={() => onOpen(s)}>Begin</button>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* The trail of stones (shared by both looks): each stop, plus a purple Skill Builder stop right after a skill that needed one. */
function TrailStones({ model, stops, pick, onPick, className = '' }) {
  const stones = []
  for (const s of stops) {
    stones.push({ key: s.key, stop: s, kind: s.kind === 'test' ? (s.key === 'pre' ? 'start' : 'post-' + (s.state === 'done' ? 'done' : s.state === 'now' ? 'next' : 'locked')) : s.state === 'done' ? 'mastered' : s.state === 'now' ? 'next' : 'locked',
      icon: s.key === 'pre' ? '🚩' : s.key === 'post' ? '🏆' : s.state === 'done' ? '✓' : s.state === 'now' ? '' : '🔒',
      label: s.label, pill: s.score != null && isDone(s.parts[0].step) ? (s.first != null ? s.first : s.score) + '%' : s.key === 'pre' && s.score != null ? s.score + '%' : null,
      pillKind: s.key === 'pre' ? 'pre' : s.key === 'post' ? 'post' : s.first != null ? 'low' : 'good', here: s.state === 'now', done: s.state === 'done' })
    if (s.sb) stones.push({ key: s.key + ':sb', stop: s, kind: 'sbstop' + (s.sb.state === 'now' ? ' sb' : ''), icon: '⚡', small: true, label: 'Skill Builder', pill: s.sb.score != null ? s.sb.score + '%' : null, pillKind: 'good', done: s.sb.state === 'done' })
  }
  const N = stones.length
  const yOf = (i) => (i % 2 === 0 ? 56 : 28)
  const pts = stones.map((_, i) => `${((i + 0.5) / N) * 1000},${yOf(i)}`)
  const doneUpTo = stones.reduce((k, st, i) => (st.done ? i : k), 0)
  const growth = isDone(model.pre) && isDone(model.post) ? model.post.score - model.pre.score : null
  return (
    <div className={'ll-trail on-land p45-trail ' + className}>
      <svg className="ll-trail-line" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden>
        <polyline points={pts.join(' ')} className="todo" vectorEffect="non-scaling-stroke" />
        <polyline points={pts.slice(0, doneUpTo + 1).join(' ')} className="done" vectorEffect="non-scaling-stroke" />
      </svg>
      {stones.map((st, i) => (
        <button type="button" key={st.key} className={'ll-stone-wrap p45-stone' + (pick?.key === st.stop.key ? ' picked' : '')} style={{ left: ((i + 0.5) / N) * 100 + '%', top: yOf(i) + '%' }} onClick={() => onPick(st.stop.key)}>
          {st.here && <span className="ll-here">📍 You are here</span>}
          <span className={'ll-stone ' + st.kind + (st.small ? ' small' : '')}>{st.icon}</span>
          {st.key === 'post' && growth != null && <span className="ll-stone-growth">{growth >= 0 ? '+' : ''}{growth}%</span>}
          <span className="ll-stone-under">
            <span className={'ll-stone-label ' + st.kind}>{st.label}</span>
            {st.pill && <span className={'ll-pill ' + st.pillKind}>{st.pill}</span>}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ---------- A · Trail ---------- */
export function Path45Trail({ model, record, topic, onOpen, onBack }) {
  const stops = stopsOf(model, record)
  const nowKey = stops.find((s) => s.state === 'now')?.key || stops[stops.length - 1].key
  const [sel, setSel] = useState(null)
  const pick = stops.find((s) => s.key === (sel || nowKey))
  return (
    <div className="p45 p45-a">
      <header className="p45-hero" style={{ '--p45-land': `url(${landImg(topic.domain)})` }}>
        <div className="p45-hero-top">
          <div>
            <p className="p45-kicker">Your path · Grade {topic.grade}</p>
            <h2>{model.title}</h2>
          </div>
          <Growth model={model} />
          <span style={{ flex: 1 }} />
          <Back onBack={onBack} />
        </div>
        <TrailStones model={model} stops={stops} pick={pick} onPick={setSel} />
      </header>
      <NextCard pick={pick} onOpen={onOpen} onBackToNext={sel && sel !== nowKey ? () => setSel(null) : null} />
    </div>
  )
}

/* ---------- B · Dashboard ----------
 * (2026-10-14: "Can you make a 'B' version of this page that would better align with our homepage aesthetic?", with the Practice
 * page as the picture.) The Lit Lab card's own parts: the navy art header, the gold Next bar, the trail on washed land art; and
 * beside it the stops as navy Practice bars (a status circle, the name, a score chip; the one you are on gets an Up next tag). */
export function Path45Dashboard({ model, record, topic, onOpen, onBack }) {
  const stops = stopsOf(model, record)
  const now = stops.find((s) => s.state === 'now')
  const nowPart = now?.parts.find((p) => isNow(p.step))
  const what = nowPart ? (nowPart.step.type === 'lesson' ? (nowPart.sb ? 'Skill Builder lesson' : 'Lesson') : nowPart.step.type === 'practice' ? (nowPart.sb ? 'Skill Builder' : nowPart.label === 'Try it again' ? 'Try it again' : 'Practice') : 'Test') : ''
  const BASE = import.meta.env.BASE_URL || '/'
  const goStop = (s) => { const p = s.parts.find((x) => isNow(x.step)) || s.parts.find((x) => isDone(x.step) && canOpen(x.step)); if (p && canOpen(p.step)) onOpen(p.step) }
  return (
    <div className="p45b">
      <div className="prf-card prf-c look-b p45b-main">
        <div className="prf-c-head" style={{ '--prf-img': `url(${BASE}lit-valley.jpg)` }}>
          <div className="prf-c-words">
            <span className="proof-kicker">Your path · Grade {topic.grade}</span>
            <span className="prf-c-title">{model.title}</span>
          </div>
          <div className="prf-c-actions"><button type="button" className="prf-c-all" onClick={onBack}>← Back to the map</button></div>
        </div>
        <div className="prf-body">
          {now && nowPart ? (
            <div className="gr-nextstep">
              <span className="gr-ns-n" aria-hidden>{now.key === 'pre' ? '🚩' : now.key === 'post' ? '🏆' : now.kind === 'full' ? '✦' : now.n - 1}</span>
              <div className="gr-ns-words">
                <span className="gr-ns-k">Next · {what}</span>
                <b>{now.label}</b>
              </div>
              <div className="gr-ns-go"><button className="btn gr-ns-btn" disabled={!canOpen(nowPart.step)} onClick={() => onOpen(nowPart.step)}>Start →</button></div>
            </div>
          ) : (
            <div className="gr-nextstep p45b-finished">
              <span className="gr-ns-n" aria-hidden>🏆</span>
              <div className="gr-ns-words"><span className="gr-ns-k">Path complete</span><b>You finished {model.title}!</b></div>
              <div className="gr-ns-go"><button className="btn gr-ns-btn" onClick={onBack}>Back to the map →</button></div>
            </div>
          )}
          <div className="gr-pathwrap ll-wrap" style={{ '--ll-land': `url(${landImg(topic.domain)})` }}>
            <div className="ll ll-a">
              <div className="ll-head"><Growth model={model} /></div>
              <TrailStones model={model} stops={stops} pick={null} onPick={(k) => { const s = stops.find((x) => x.key === k); if (s) goStop(s) }} className="p45b-trail" />
              <div className="ll-foot"><div className="ll-key"><span><i className="mastered">✓</i>Cleared</span><span><i className="sbstop">⚡</i>Skill Builder</span></div></div>
            </div>
          </div>
        </div>
      </div>
      <div className="p45b-side" aria-label="Your stops">
        {stops.map((s) => {
          const scoreShown = s.state === 'done' && (s.first ?? s.score) != null
          return (
            <button key={s.key} type="button" className={'p45b-bar ' + s.state} disabled={s.state === 'later'} onClick={() => goStop(s)}>
              <span className={'p45b-dot ' + s.state}>{s.key === 'pre' ? '🚩' : s.key === 'post' ? '🏆' : s.state === 'done' ? '✓' : s.state === 'later' ? '🔒' : s.kind === 'full' ? '✦' : s.n - 1}</span>
              <span className="p45b-words">
                {s.state === 'now' && <span className="p45b-tag">Up next</span>}
                <span className="p45b-title">{s.label}</span>
              </span>
              {s.sb && s.sb.score != null && <span className="p45b-sb" title="Skill Builder">⚡ {s.sb.score}%</span>}
              {scoreShown && <span className="p45b-score">{(s.first ?? s.score)}%</span>}
              <span aria-hidden className="p45b-chev">›</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}


/*
 * PROTOTYPE sample progress, so each look can be seen new, partway and done. Display only: the student's saved record is untouched.
 * Partway = pre-test 52%, skill 1 at 92%, skill 2 missed on the first try (60%), its Skill Builder (88%), then cleared (90%);
 * the lesson for skill 3 is next. Done = everything, with a second Skill Builder on skill 4, and the post-test at 91%.
 */
export function samplePathRecord(kind, topic) {
  if (kind === 'new' || !topic) return {}
  const core = topic.core || []
  const sbs = topic.skillBuilders || {}
  const lessons = {}
  const worksheets = {}
  const upTo = kind === 'done' ? core.length : 2
  const RUN = [{ best: 92 }, { first: 60, sb: 88, best: 90 }, { best: 100 }, { first: 64, sb: 86, best: 89 }, { best: 95 }, { best: 93 }]
  core.slice(0, upTo).forEach((ws, i) => {
    const r = RUN[i % RUN.length]
    lessons[ws.id] = true
    worksheets[ws.id] = { best: r.best, passed: true, attempts: r.sb != null ? 2 : 1, ...(r.first != null ? { first: r.first } : {}) }
    const sb = sbs[ws.id]
    if (r.sb != null && sb) { lessons[sb.id] = true; worksheets[sb.id] = { best: r.sb, passed: true, attempts: 1 } }
  })
  const rec = { pre: { complete: true, score: 52 }, lessons, worksheets }
  if (kind === 'done') {
    if (topic.full) { lessons[topic.full.id] = true; worksheets[topic.full.id] = { best: 94, passed: true, attempts: 1 } }
    rec.post = { complete: true, score: 91 }
  }
  return rec
}
