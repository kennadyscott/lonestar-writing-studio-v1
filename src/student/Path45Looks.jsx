import React, { useState } from 'react'
import { landImg } from './ProofRoom.jsx'

/*
 * Grades 3-5: three looks for the student's pathway (Kennady, 2026-10-14: "let's play with what the pathway preview looks like
 * on the student side. Give me three versions of what this could be in an ABC picker. Start with 3rd - 5th grade"). They borrow
 * what she picked on the Practice card: the domain's land art, the trail of stones with each score, a Skill Builder as its own
 * purple ⚡ stop, growth as a percent.
 *   A  Trail       the land-art header holds the trail; one "next step" panel underneath (tap any stone to see it)
 *   B  Quest board every stop is a card; the one you are on glows; a big Continue button
 *   C  One step    just the step you are on, big, with a slim row of dots for the whole path
 */

export const PATH45_LOOKS = [['a', 'Trail'], ['b', 'Quest board'], ['c', 'One step']]

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

/* One sub-step as a button: done (with its score), the one to do now, or later. */
function PartButton({ part, i, onOpen, big = false }) {
  const s = part.step
  const done = isDone(s)
  const now = isNow(s)
  const right = done ? (s.score != null ? `✓ ${s.score}%` : '✓ Done') : now ? (s.state === 'unavailable' ? 'Coming soon' : 'Start →') : '🔒 Later'
  return (
    <button type="button" className={'p45-part' + (done ? ' done' : now ? ' now' : ' later') + (part.sb ? ' sb' : '') + (big ? ' big' : '')} disabled={!canOpen(s)} onClick={() => onOpen(s)}>
      <span className="p45-part-n">{part.sb ? '⚡' : i + 1}</span>
      <span className="p45-part-words"><b>{part.label}</b><small>{part.sub}</small></span>
      <span className="p45-part-go">{right}</span>
    </button>
  )
}

const Back = ({ onBack }) => <button type="button" className="p45-back" onClick={onBack}>← Back to the map</button>

/* ---------- A · Trail ---------- */
function TrailLook({ model, record, topic, onOpen, onBack }) {
  const stops = stopsOf(model, record)
  const nowKey = stops.find((s) => s.state === 'now')?.key || stops[stops.length - 1].key
  const [sel, setSel] = useState(null)
  const pick = stops.find((s) => s.key === (sel || nowKey))
  // stones: each stop, plus a purple Skill Builder stop right after a skill that needed one
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
        <div className="ll-trail on-land p45-trail">
          <svg className="ll-trail-line" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden>
            <polyline points={pts.join(' ')} className="todo" vectorEffect="non-scaling-stroke" />
            <polyline points={pts.slice(0, doneUpTo + 1).join(' ')} className="done" vectorEffect="non-scaling-stroke" />
          </svg>
          {stones.map((st, i) => (
            <button type="button" key={st.key} className={'ll-stone-wrap p45-stone' + (pick?.key === st.stop.key ? ' picked' : '')} style={{ left: ((i + 0.5) / N) * 100 + '%', top: yOf(i) + '%' }} onClick={() => setSel(st.stop.key)}>
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
      </header>
      <section className={'p45-panel ' + pick.state}>
        <div className="p45-panel-head">
          <span className={'p45-badge ' + pick.state}>{pick.key === 'pre' ? '🚩' : pick.key === 'post' ? '🏆' : pick.state === 'done' ? '✓' : pick.state === 'later' ? '🔒' : pick.kind === 'full' ? '✦' : pick.n - 1}</span>
          <div>
            <p className="p45-kicker">{pick.state === 'now' ? 'Your next step' : pick.state === 'done' ? 'Done' : 'Coming up'}{pick.kind === 'skill' ? ` · Skill ${pick.n - 1}` : ''}</p>
            <h3>{pick.label}</h3>
            <p className="p45-line">{pick.line}</p>
          </div>
          {sel && sel !== nowKey && <button type="button" className="p45-link" onClick={() => setSel(null)}>Back to my next step</button>}
        </div>
        <div className="p45-parts">{pick.parts.map((p, i) => <PartButton key={p.step.id} part={p} i={i} onOpen={onOpen} />)}</div>
      </section>
    </div>
  )
}

/* ---------- B · Quest board ---------- */
function BoardLook({ model, record, topic, onOpen, onBack }) {
  const stops = stopsOf(model, record)
  const now = stops.find((s) => s.state === 'now')
  const nowPart = now?.parts.find((p) => isNow(p.step))
  const doneSkills = stops.filter((s) => s.kind !== 'test' && s.state === 'done').length
  const skills = stops.filter((s) => s.kind !== 'test').length
  return (
    <div className="p45 p45-b">
      <header className="p45-hero slim" style={{ '--p45-land': `url(${landImg(topic.domain)})` }}>
        <div className="p45-hero-top">
          <div>
            <p className="p45-kicker">Your path · Grade {topic.grade}</p>
            <h2>{model.title}</h2>
          </div>
          <div className="p45-hero-mid">
            <Growth model={model} />
            <span className="p45-count"><b>{doneSkills}</b> of {skills} skills done</span>
          </div>
          <span style={{ flex: 1 }} />
          {nowPart
            ? <button type="button" className="p45-continue" disabled={!canOpen(nowPart.step)} onClick={() => onOpen(nowPart.step)}>Continue: {now.label}{now.kind !== 'test' ? ` · ${nowPart.label}` : ''} →</button>
            : <Back onBack={onBack} />}
        </div>
      </header>
      <div className="p45-grid" style={{ '--cols': Math.min(4, Math.ceil(stops.length / 2)) }}>
        {stops.map((s) => {
          const go = s.parts.find((p) => isNow(p.step)) || s.parts[0]
          return (
            <article key={s.key} className={'p45-card ' + s.state + (s.kind === 'test' ? ' test' : '')}>
              <div className="p45-card-top">
                <span className={'p45-badge ' + s.state}>{s.key === 'pre' ? '🚩' : s.key === 'post' ? '🏆' : s.state === 'done' ? '✓' : s.state === 'later' ? '🔒' : s.n - 1}</span>
                <span className={'p45-chip ' + s.state}>{s.state === 'done' ? 'Done' : s.state === 'now' ? 'You are here' : 'Later'}</span>
              </div>
              <h3>{s.label}</h3>
              <p className="p45-line">{s.line}</p>
              <div className="p45-card-rows">
                {s.kind === 'test'
                  ? <span className="p45-row"><span>{s.parts[0].sub}</span><b>{s.score != null && s.state === 'done' ? s.score + '%' : ''}</b></span>
                  : <>
                    <span className={'p45-row' + (isDone(s.parts[0]?.step) ? ' ok' : '')}><span>Lesson</span><b>{isDone(s.parts[0]?.step) ? '✓' : ''}</b></span>
                    <span className={'p45-row' + (isDone(s.parts[1]?.step) ? ' ok' : '')}><span>Practice</span><b>{s.first != null ? s.first + '%' : s.score != null && isDone(s.parts[1]?.step) ? s.score + '%' : ''}</b></span>
                    {s.sb && <span className="p45-row sb"><span>⚡ Skill Builder</span><b>{s.sb.score != null ? s.sb.score + '%' : ''}</b></span>}
                  </>}
              </div>
              {s.state === 'now' && <button type="button" className="p45-card-go" disabled={!canOpen(go.step)} onClick={() => onOpen(go.step)}>{go.label === 'Learn it' ? 'Start the lesson' : 'Start ' + go.label.toLowerCase()} →</button>}
            </article>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- C · One step ---------- */
function FocusLook({ model, record, topic, onOpen, onBack }) {
  const stops = stopsOf(model, record)
  const nowKey = stops.find((s) => s.state === 'now')?.key
  const [sel, setSel] = useState(null)
  const pick = stops.find((s) => s.key === (sel || nowKey))
  const growth = isDone(model.pre) && isDone(model.post) ? model.post.score - model.pre.score : null
  const doneSkills = stops.filter((s) => s.kind !== 'test' && s.state === 'done').length
  const skills = stops.filter((s) => s.kind !== 'test').length
  return (
    <div className="p45 p45-c">
      <div className="p45-focus">
        <div className="p45-focus-art" style={{ '--p45-land': `url(${landImg(topic.domain)})` }}>
          <span className="p45-focus-step">{pick ? `Step ${pick.n} of ${stops.length}` : 'Path complete'}</span>
        </div>
        <div className="p45-focus-body">
          <p className="p45-kicker">{model.title} · {pick ? (pick.state === 'now' ? 'Up next' : pick.state === 'done' ? 'Done' : 'Coming up') : 'All done'}</p>
          {pick ? (
            <>
              <h2>{pick.label}</h2>
              <p className="p45-line big">{pick.line}</p>
              <div className="p45-parts stack">{pick.parts.map((p, i) => <PartButton key={p.step.id} part={p} i={i} onOpen={onOpen} big />)}</div>
              {sel && sel !== nowKey && <button type="button" className="p45-link" onClick={() => setSel(null)}>Back to my next step</button>}
            </>
          ) : (
            <>
              <h2>🏆 You finished the path!</h2>
              <p className="p45-line big">Pre-test {model.pre?.score}% → Post-test {model.post?.score}%{growth != null && <> · <b className="p45-up">{growth >= 0 ? '+' : ''}{growth}% growth</b></>}</p>
              <Back onBack={onBack} />
            </>
          )}
        </div>
      </div>
      <div className="p45-rail" aria-label="Your whole path">
        {stops.map((s, i) => (
          <React.Fragment key={s.key}>
            {i > 0 && <span className={'p45-rail-line' + (s.state !== 'later' ? ' on' : '')} aria-hidden />}
            <button type="button" className={'p45-dot ' + s.state + (pick?.key === s.key ? ' picked' : '')} onClick={() => setSel(s.key)} title={s.label}>
              <span className="p45-dot-c">{s.key === 'pre' ? '🚩' : s.key === 'post' ? '🏆' : s.state === 'done' ? '✓' : s.state === 'later' ? '🔒' : s.n - 1}</span>
              {s.sb && <i className="p45-dot-sb" title="Skill Builder">⚡</i>}
              <span className="p45-dot-l">{s.label}</span>
              <span className="p45-dot-s">{s.state === 'done' && (s.first ?? s.score) != null ? (s.first ?? s.score) + '%' : ''}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
      <div className="p45-foot">
        <span>Pre-test <b>{isDone(model.pre) ? model.pre.score + '%' : '—'}</b></span>
        <span><b>{doneSkills}</b> of {skills} skills done</span>
        <span>Post-test <b>{isDone(model.post) ? model.post.score + '%' : 'at the end'}</b></span>
        <span style={{ flex: 1 }} />
        {pick && <Back onBack={onBack} />}
      </div>
    </div>
  )
}

export function Path45Look({ look, model, record, topic, onOpen, onBack }) {
  const props = { model, record, topic, onOpen, onBack }
  if (look === 'b') return <BoardLook {...props} />
  if (look === 'c') return <FocusLook {...props} />
  return <TrailLook {...props} />
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
