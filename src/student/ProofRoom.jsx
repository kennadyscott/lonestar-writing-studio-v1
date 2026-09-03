import React, { useState, useEffect, useMemo, useRef } from 'react'
import { api } from '../lib/api.js'
import { topicList, topicFor, PASS_MARK } from '../../server/proofRoom.mjs'

/*
 * The Proof Room — pick a topic, walk its path.
 *
 * A worksheet runs whole: its activities play back to back and score as one
 * piece of work, because they were written to hang together. Clear 85% and the
 * next stop opens. Miss it and that skill's Skill Builder drops onto the path
 * and has to be cleared before the core path continues. The last stop is the
 * full-topic proof.
 */

const NAVY = '#16386b'
const CYAN = '#0f97c2'
const GOLD = '#f0b429'

const norm = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ')

// The worksheet illustrations, lifted straight out of the source decks.
// Scoped to the Proof Room on purpose: this 3D character art is a different
// visual language from Luna and the robots, and it reads as "the worksheet
// world" precisely because it does not appear anywhere else in the studio.
// Do not reuse these on the dashboard, in Luna's Nook, or in Fluency Practice.
const ART = (f) => (import.meta.env.BASE_URL || '/') + f
const KID_CLIPBOARD = ART('kid-clipboard.png')
const KID_READER = ART('kid-reader.png')

const HOW_TO = {
  hunt: 'Click on each word that is wrong. Type the correct word, then press ✓. Clicking a word that is already correct counts against you.',
  fix: 'Type the missing word in each blank. Use the word bank above — every word is used once. Check your answers when the last blank is filled.',
  maze: 'Move with the arrow keys, or click a square next to you. Every verb blocking the path is written wrong — fix it to walk through. Get it right the first time to earn the point.',
}

const SOLUTION = (id) => (import.meta.env.BASE_URL || '/') + 'solutions/' + id + '.mp4'

function WatchButton({ id, onPlay, label = 'Watch the solution' }) {
  if (!id) return null
  return (
    <button onClick={() => onPlay(id)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eef6f9', color: CYAN, border: '1.5px solid #cfe6f0',
        borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      ▶ {label}
    </button>
  )
}

function SolutionPlayer({ id, onClose }) {
  if (!id) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,14,24,.72)', display: 'grid', placeItems: 'center', zIndex: 90, padding: 20 }} onClick={onClose}>
      <div style={{ width: 720, maxWidth: '94vw', background: '#0d2440', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', color: '#fff' }}>
          <span style={{ fontSize: 17 }}>▶</span>
          <b style={{ flex: 1, fontSize: 14.5 }}>How to solve it</b>
          <button onClick={onClose} style={{ color: '#a8dff5', fontSize: 20, background: 'none', cursor: 'pointer' }}>×</button>
        </div>
        <video src={SOLUTION(id)} controls autoPlay style={{ width: '100%', display: 'block', background: '#000' }} />
      </div>
    </div>
  )
}

function Beside({ src, children, flip }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexDirection: flip ? 'row-reverse' : 'row' }}>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      <img className="act-figure" src={src} alt="" style={{ height: 210, flexShrink: 0, alignSelf: 'flex-end' }} />
    </div>
  )
}

function Directions({ text }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#eef6f9', border: '1.5px solid #cfe6f0',
      borderRadius: 12, padding: '11px 14px', marginBottom: 12 }}>
      <span style={{ fontSize: 15, lineHeight: 1.3 }}>📋</span>
      <div>
        <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, color: CYAN }}>DIRECTIONS</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#1f4a68', marginTop: 2 }}>{text}</div>
      </div>
    </div>
  )
}

export default function ProofRoom({ grade = 5, onClose, onChange }) {
  const [topicId, setTopicId] = useState(null)
  const [progress, setProgress] = useState({})   // worksheetId -> { best, passed }
  const [running, setRunning] = useState(null)   // worksheet being played
  const topics = useMemo(() => topicList(), [])
  const topic = useMemo(() => (topicId ? topicFor(topicId) : null), [topicId])

  useEffect(() => {
    try { setProgress(JSON.parse(localStorage.getItem('proofProgress') || '{}')) } catch { setProgress({}) }
  }, [])
  function record(wsId, pct) {
    setProgress((p) => {
      const prev = p[wsId] || { best: 0, passed: false }
      const next = { ...p, [wsId]: { best: Math.max(prev.best, pct), passed: prev.passed || pct >= PASS_MARK } }
      try { localStorage.setItem('proofProgress', JSON.stringify(next)) } catch {}
      return next
    })
  }

  if (running) {
    return <Worksheet ws={running} onQuit={() => setRunning(null)}
      onDone={(pct) => { record(running.id, pct); onChange && onChange() }}
      onClose={onClose} topic={topic} progress={progress} onNext={(ws) => setRunning(ws)} />
  }
  if (topic) {
    return <TopicPath topic={topic} progress={progress} onPlay={setRunning} onBack={() => setTopicId(null)} onClose={onClose} />
  }

  return (
    <Shell onClose={onClose} sub="Bring writing in broken, take it out clean">
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: NAVY, lineHeight: 1.25 }}>Pick a topic and start the path.</div>
        <p style={{ fontSize: 13, color: '#3f5f76', lineHeight: 1.5, margin: '5px 0 0' }}>
          Work the skills one at a time. Clear each one and the next opens — the last stop proves the whole topic.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {topics.map((t) => {
          const done = t.stops // placeholder count for display
          return (
            <button key={t.id} onClick={() => setTopicId(t.id)}
              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, border: '1.5px solid var(--line)',
                borderRadius: 16, padding: '15px 17px', background: '#fff', cursor: 'pointer' }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 22, background: '#eef6f9' }}>{t.icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: NAVY }}>{t.title}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{t.blurb}</span>
                <span style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 800, letterSpacing: .5, color: CYAN, marginTop: 6 }}>
                  {t.standards} · GRADE {t.grade} · {done} STOPS
                </span>
              </span>
              <span className="btn" style={{ flexShrink: 0, padding: '9px 17px', fontSize: 13 }}>Open path →</span>
            </button>
          )
        })}
        <div style={{ border: '1.5px dashed var(--line)', borderRadius: 16, padding: '15px 17px', fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
          More topics arrive as your teacher loads them.
        </div>
      </div>
    </Shell>
  )
}

/* ---------------- the path ---------------- */
function TopicPath({ topic, progress, onPlay, onBack, onClose }) {
  // walk the core list; a missed stop drops its Skill Builder in as a detour
  const stops = []
  let blocked = false
  for (const ws of topic.core) {
    const p = progress[ws.id] || { best: 0, passed: false }
    const sb = topic.skillBuilders[ws.id]
    const sbP = progress[sb.id] || { best: 0, passed: false }
    const needsSb = p.best > 0 && !p.passed && !sbP.passed
    stops.push({ ws, state: blocked ? 'locked' : p.passed ? 'passed' : needsSb ? 'retry' : 'open', best: p.best })
    if (needsSb) stops.push({ ws: sb, state: 'sb', best: sbP.best, forId: ws.id })
    if (!p.passed) blocked = true
  }
  const allCore = topic.core.every((w) => (progress[w.id] || {}).passed)
  const fullP = progress[topic.full.id] || { best: 0, passed: false }
  stops.push({ ws: topic.full, state: fullP.passed ? 'passed' : allCore ? 'open' : 'locked', best: fullP.best, capstone: true })

  const cleared = topic.core.filter((w) => (progress[w.id] || {}).passed).length
  const pct = Math.round((cleared / topic.core.length) * 100)

  return (
    <Shell onClose={onClose} sub={topic.title} onBack={onBack}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f4f8fb', borderRadius: 13, padding: '12px 15px', marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 22 }}>{topic.icon}</span>
        <div style={{ flex: 1, minWidth: 170 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .7, color: CYAN }}>{topic.standards} · GRADE {topic.grade}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{cleared} of {topic.core.length} skills cleared</div>
        </div>
        <div style={{ flex: '1 1 140px', minWidth: 120, height: 9, background: '#e3ecf2', borderRadius: 6 }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 6, background: 'linear-gradient(90deg,#35c3e8,#0f97c2)' }} />
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        {/* the road */}
        <span aria-hidden style={{ position: 'absolute', left: 27, top: 18, bottom: 18, width: 4, borderRadius: 3,
          background: 'repeating-linear-gradient(180deg,#d5e2ec 0 10px,transparent 10px 18px)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stops.map((s, i) => <Stop key={s.ws.id} stop={s} n={i + 1} onPlay={onPlay} />)}
        </div>
      </div>
    </Shell>
  )
}

function Stop({ stop, onPlay }) {
  const { ws, state, best } = stop
  const isSb = state === 'sb'
  const locked = state === 'locked'
  const passed = state === 'passed'
  const capstone = stop.capstone

  const tone = passed ? 'var(--good)' : isSb ? '#a37400' : locked ? '#9fb3c2' : capstone ? GOLD : CYAN
  const bg = passed ? '#f1faf4' : isSb ? '#fff8ec' : locked ? '#f7f9fb' : '#fff'
  const border = passed ? '1.5px solid #b8e6cd' : isSb ? '2px solid #f0b429' : locked ? '1.5px solid var(--line)'
    : capstone ? '2px solid #f0b429' : '2px solid #9fd9ef'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, position: 'relative', zIndex: 1 }}>
      <span style={{ width: 56, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 800,
          background: passed ? 'var(--good)' : isSb ? GOLD : locked ? '#e3ecf2' : capstone ? GOLD : '#fff',
          color: passed || isSb || capstone ? '#fff' : locked ? '#9fb3c2' : CYAN,
          border: passed || isSb || capstone ? '3px solid #fff' : '3px solid #9fd9ef',
          boxShadow: passed || isSb || capstone ? '0 3px 10px rgba(20,60,90,.25)' : 'none' }}>
          {passed ? '✓' : locked ? '🔒' : capstone ? '🏆' : isSb ? '🛠' : '📄'}
        </span>
      </span>

      <div style={{ flex: 1, minWidth: 0, background: bg, border, borderRadius: 14, padding: '12px 15px',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          {isSb && <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: .8, color: '#a37400' }}>SKILL BUILDER · REQUIRED FIRST</div>}
          {capstone && <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: .8, color: '#a37400' }}>FULL TOPIC · THE FINISH LINE</div>}
          <div style={{ fontSize: 14.5, fontWeight: 800, color: locked ? '#8fa5b8' : NAVY, lineHeight: 1.25 }}>{ws.title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{ws.skill}</div>
        </div>

        {best > 0 && (
          <span className="pill" style={{ background: passed ? '#e6f6ee' : '#fdecec', color: passed ? 'var(--good)' : '#c0392b', fontWeight: 800 }}>
            best {best}%
          </span>
        )}
        <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {ws.activities.length} activities · {ws.points} pts
        </span>

        {locked ? (
          <span style={{ fontSize: 12, fontWeight: 800, color: '#9fb3c2', whiteSpace: 'nowrap' }}>Clear the stop above</span>
        ) : (
          <button className={passed ? 'btn ghost' : 'btn'} style={{ padding: '9px 18px', fontSize: 13, whiteSpace: 'nowrap' }}
            onClick={() => onPlay(ws)}>
            {passed ? 'Run it again' : isSb ? 'Build it up →' : best > 0 ? 'Try again →' : 'Start →'}
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------------- one worksheet, start to finish ---------------- */
function Worksheet({ ws, topic, progress, onQuit, onDone, onClose, onNext }) {
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState([])     // points earned per activity
  const [result, setResult] = useState(null)
  const [video, setVideo] = useState(null)
  const act = ws.activities[step]

  function finishActivity(earned) {
    const next = [...scores, earned]
    setScores(next)
    if (step + 1 < ws.activities.length) { setStep(step + 1); return }
    const got = next.reduce((a, b) => a + b, 0)
    const pct = Math.max(0, Math.round((got / ws.points) * 100))
    onDone(pct)
    api.drillFinish({ worksheetId: ws.id, accuracy: pct }).then((r) => setResult({ pct, got, ...(r || {}) })).catch(() => setResult({ pct, got }))
  }

  if (result) {
    const passed = result.pct >= PASS_MARK
    const sb = topic?.skillBuilders?.[ws.id]
    const coreIdx = topic ? topic.core.findIndex((w) => w.id === ws.id) : -1
    const nextCore = coreIdx >= 0 && coreIdx + 1 < (topic?.core.length || 0) ? topic.core[coreIdx + 1] : null
    return (
      <Shell onClose={onClose} sub={ws.title}>
        <div style={{ textAlign: 'center' }}>
          <img src={passed ? KID_READER : KID_CLIPBOARD} alt=""
            style={{ height: 150, display: 'block', margin: '0 auto -6px' }} />
          <h2 style={{ margin: '4px 0 2px', fontSize: 24 }}>{passed ? 'Stop cleared!' : 'Not clean enough yet'}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 14px' }}>
            {result.got} of {ws.points} points · {ws.activities.length} activities
          </p>

          <div style={{ fontSize: 52, fontWeight: 800, color: passed ? 'var(--good)' : '#c99312', lineHeight: 1 }}>{result.pct}%</div>
          <div style={{ height: 12, borderRadius: 8, background: '#eef3f6', position: 'relative', margin: '12px auto 6px', maxWidth: 420 }}>
            <div style={{ position: 'absolute', inset: 0, width: `${Math.min(100, result.pct)}%`, borderRadius: 8,
              background: passed ? 'linear-gradient(90deg,#57d98a,#1e7a4a)' : 'linear-gradient(90deg,#f5c542,#e89a00)' }} />
            <div style={{ position: 'absolute', left: `${PASS_MARK}%`, top: -5, bottom: -5, width: 2, background: NAVY }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, maxWidth: 420, margin: '0 auto 16px', textAlign: 'right' }}>
            ↑ {PASS_MARK}% clears the stop
          </div>

          {result.coins > 0 && (
            <div className="pill gold" style={{ justifyContent: 'center', padding: '10px 16px', fontSize: 14, maxWidth: 400, margin: '0 auto 12px' }}>
              🪙 +{result.coins} ClassCade coins
            </div>
          )}

          {!passed && sb && (
            <div style={{ background: '#fff8ec', border: '1.5px solid #f0d9a8', borderRadius: 12, padding: '13px 16px', maxWidth: 440, margin: '0 auto', textAlign: 'left' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .8, color: '#a37400' }}>SKILL BUILDER UNLOCKED</div>
              <div style={{ fontSize: 13.5, marginTop: 3, lineHeight: 1.5 }}>
                <b>{sb.title}</b> just dropped onto your path. Build the skill back up there, then come take this stop again.
              </div>
            </div>
          )}
          {!passed && !sb && (
            <div style={{ background: '#f4f8fb', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--muted)', fontWeight: 700, maxWidth: 420, margin: '0 auto' }}>
              Give it another run — you keep your best score.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            {passed && nextCore && (
              <button className="btn" onClick={() => { setResult(null); setStep(0); setScores([]); onNext(nextCore) }}>
                Next stop: {nextCore.title} →
              </button>
            )}
            {!passed && sb && (
              <button className="btn" onClick={() => { setResult(null); setStep(0); setScores([]); onNext(sb) }}>
                🛠 Build it up: {sb.title.replace('SB: ', '')} →
              </button>
            )}
            <button className={passed && nextCore ? 'btn ghost' : !passed && sb ? 'btn ghost' : 'btn'} onClick={onQuit}>Back to the path</button>
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell onClose={onClose} sub={ws.title} onBack={onQuit}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, flexWrap: 'wrap' }}>
        {ws.activities.map((a, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 800,
            background: i < step ? '#e6f6ee' : i === step ? '#e9f5fb' : '#eef3f6',
            color: i < step ? 'var(--good)' : i === step ? CYAN : 'var(--muted)' }}>
            {i < step ? '✓' : i + 1} {a.kind === 'hunt' ? 'Error hunt' : a.kind === 'maze' ? 'Verb maze' : 'Fill it in'}
          </span>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>one worksheet · scored together</span>
      </div>

      <SolutionPlayer id={video} onClose={() => setVideo(null)} />
      {act.kind === 'hunt' ? <HuntActivity key={step} act={act} onDone={finishActivity} onPlay={setVideo} />
        : act.kind === 'maze' ? <MazeActivity key={step} act={act} onDone={finishActivity} onPlay={setVideo} />
        : <FixActivity key={step} act={act} onDone={finishActivity} onPlay={setVideo} />}
    </Shell>
  )
}

/* --- activity: hunt the planted errors --- */
function HuntActivity({ act, onDone, onPlay }) {
  const [caught, setCaught] = useState({})
  const [fixes, setFixes] = useState({})
  const [typing, setTyping] = useState(null)
  const [draft, setDraft] = useState('')
  const [misses, setMisses] = useState(0)
  const [flash, setFlash] = useState(null)
  const [tries, setTries] = useState({})   // error index -> wrong attempts at the fix

  const fixedCount = Object.keys(fixes).length
  const done = fixedCount === act.errorCount

  function tap(tok, ti) {
    if (!tok.bad) { setMisses((n) => n + 1); setFlash(ti); setTimeout(() => setFlash(null), 600); return }
    if (fixes[tok.i]) return
    setCaught((c) => ({ ...c, [tok.i]: true })); setTyping(tok.i); setDraft('')
  }
  function submit(tok) {
    if (norm(draft) !== norm(tok.fix)) {
      setTries((t) => ({ ...t, [tok.i]: (t[tok.i] || 0) + 1 }))
      setDraft('')
      const vid = (act.videos || [])[tok.i]
      if (vid && onPlay) onPlay(vid)
      return
    }
    setFixes((f) => ({ ...f, [tok.i]: true })); setTyping(null); setDraft('')
  }

  return (
    <div>
      <Directions text={act.directions || HOW_TO.hunt} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 11 }}>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: NAVY, flex: 1, minWidth: 190 }}>{act.brief}</span>
        <span className="pill" style={{ background: '#eef4f8', color: NAVY }}>{fixedCount} of {act.errorCount} fixed</span>
        <span className="pill" style={{ background: misses ? '#fdecec' : '#f1faf4', color: misses ? '#c0392b' : 'var(--good)' }}>
          {misses} false {misses === 1 ? 'alarm' : 'alarms'}
        </span>
      </div>

      <Beside src={KID_CLIPBOARD}>
      <div style={{ background: '#fbfdfe', border: '1.5px solid var(--line)', borderRadius: 14, padding: '16px 18px', fontSize: 15.5, lineHeight: 2.05 }}>
        {act.tokens.map((tok, ti) => {
          if (!tok.bad) return (
            <span key={ti} onClick={() => tap(tok, ti)}
              style={{ cursor: 'pointer', borderRadius: 4, background: flash === ti ? '#fdecec' : 'transparent', transition: 'background .2s' }}>{tok.t}</span>
          )
          if (fixes[tok.i]) return <span key={ti} style={{ background: '#e6f6ee', color: 'var(--good)', fontWeight: 800, borderRadius: 5, padding: '1px 6px' }}>{tok.fix}</span>
          if (typing === tok.i) return (
            <span key={ti} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff8ec', border: '1.5px solid #f0b429', borderRadius: 8, padding: '2px 6px', margin: '0 2px' }}>
              <s style={{ color: '#c0392b', fontWeight: 700 }}>{tok.t}</s>
              <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(tok) }} placeholder="type the fix"
                style={{ width: 140, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 14 }} />
              <button onClick={() => submit(tok)} disabled={!draft.trim()}
                style={{ fontSize: 12, fontWeight: 800, color: draft.trim() ? '#fff' : '#9db0c0', background: draft.trim() ? NAVY : '#eef0f6', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>✓</button>
              {(tries[tok.i] || 0) >= 2 && (
                <>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#a37400' }}>it is <b>{tok.fix}</b></span>
                  <WatchButton id={(act.videos || [])[tok.i]} onPlay={onPlay} label="Why?" />
                </>
              )}
            </span>
          )
          if (caught[tok.i]) return (
            <span key={ti} onClick={() => { setTyping(tok.i); setDraft('') }}
              style={{ cursor: 'pointer', background: '#fff3d6', color: '#8a6400', fontWeight: 800, borderRadius: 5, padding: '1px 6px', textDecoration: 'underline wavy #e0a51c' }}>{tok.t}</span>
          )
          return <span key={ti} onClick={() => tap(tok, ti)} style={{ cursor: 'pointer' }}>{tok.t}</span>
        })}
      </div>
      </Beside>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <span style={{ flex: 1, fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>💡 {act.hint}</span>
        <button className="btn" onClick={() => onDone(Math.max(0, fixedCount - Math.floor(misses / 2)))}>
          {done ? 'Next activity →' : 'Done with this one →'}
        </button>
      </div>
    </div>
  )
}

/* --- activity: walk the maze, fixing the verb at every gate --- */
function MazeActivity({ act, onDone, onPlay }) {
  const grid = act.grid
  const H = grid.length, W = grid[0].length
  const cellAt = (r, c) => (r >= 0 && r < H && c >= 0 && c < W ? grid[r][c] : '#')
  const startPos = useMemo(() => {
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) if (grid[r][c] === 'S') return { r, c }
    return { r: 0, c: 0 }
  }, [act])

  const [pos, setPos] = useState(startPos)
  const [trail, setTrail] = useState({ [`${startPos.r},${startPos.c}`]: true })
  const [cleared, setCleared] = useState({})   // gate letter -> true once opened
  const [earned, setEarned] = useState({})     // gate letter -> true if right first try
  const [gate, setGate] = useState(null)       // { letter, r, c }
  const [draft, setDraft] = useState('')
  const [tries, setTries] = useState(0)
  const [shake, setShake] = useState(false)
  const [reveal, setReveal] = useState(false)
  const total = Object.keys(act.gates).length
  const done = cellAt(pos.r, pos.c) === 'X'

  function move(dr, dc) {
    if (gate || done) return
    const nr = pos.r + dr, nc = pos.c + dc
    const ch = cellAt(nr, nc)
    if (ch === '#') return
    if (/[A-J]/.test(ch) && !cleared[ch]) { setGate({ letter: ch, r: nr, c: nc }); setDraft(''); setTries(0); setReveal(false); return }
    setPos({ r: nr, c: nc })
    setTrail((t) => ({ ...t, [`${nr},${nc}`]: true }))
  }

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
      if (!map[e.key]) return
      e.preventDefault()
      move(...map[e.key])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pos, gate, done])

  function tryGate() {
    const g = act.gates[gate.letter]
    if (norm(draft) === norm(g.right)) {
      setCleared((c) => ({ ...c, [gate.letter]: true }))
      if (tries === 0) setEarned((e) => ({ ...e, [gate.letter]: true }))
      setPos({ r: gate.r, c: gate.c })
      setTrail((t) => ({ ...t, [`${gate.r},${gate.c}`]: true }))
      setGate(null); setDraft('')
      return
    }
    const n = tries + 1
    setTries(n); setShake(true); setTimeout(() => setShake(false), 400)
    if (n >= 2) setReveal(true)
    setDraft('')
    if (act.video && onPlay) onPlay(act.video)
  }

  const openedCount = Object.keys(cleared).length
  const firstTry = Object.keys(earned).length

  return (
    <div>
      <Directions text={act.directions || HOW_TO.maze} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 11 }}>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: NAVY, flex: 1, minWidth: 190 }}>{act.brief}</span>
        <span className="pill" style={{ background: '#eef4f8', color: NAVY }}>{openedCount} of {total} verbs fixed</span>
        <span className="pill" style={{ background: '#f1faf4', color: 'var(--good)' }}>{firstTry} first-try</span>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${W}, 40px)`, gap: 3, background: '#dbe8f1', padding: 8, borderRadius: 14 }}>
          {grid.map((row, r) => row.split('').map((ch, c) => {
            const here = pos.r === r && pos.c === c
            const walked = trail[`${r},${c}`]
            const isGate = /[A-J]/.test(ch)
            const open = isGate && cleared[ch]
            const wall = ch === '#'
            const adjacent = Math.abs(pos.r - r) + Math.abs(pos.c - c) === 1 && !wall
            return (
              <button key={`${r},${c}`} disabled={!adjacent || !!gate}
                onClick={() => move(r - pos.r, c - pos.c)}
                title={isGate ? act.gates[ch].wrong : ''}
                style={{ width: 40, height: 40, borderRadius: 9, display: 'grid', placeItems: 'center',
                  fontSize: isGate ? 11 : 15, fontWeight: 800, cursor: adjacent && !gate ? 'pointer' : 'default',
                  background: wall ? '#16386b' : here ? '#f0b429' : ch === 'X' ? '#e6f6ee'
                    : isGate ? (open ? '#e6f6ee' : '#fff3d6') : walked ? '#dff1fa' : '#fbfdfe',
                  color: isGate ? (open ? 'var(--good)' : '#8a6400') : ch === 'X' ? 'var(--good)' : NAVY,
                  border: here ? '2px solid #b9860c' : adjacent && !gate ? '2px solid #9fd9ef' : '2px solid transparent',
                  boxShadow: here ? '0 0 0 3px rgba(240,180,41,.3)' : 'none' }}>
                {here ? '🚶' : ch === 'S' ? 'S' : ch === 'X' ? '🏁' : isGate ? (open ? '✓' : ch) : ''}
              </button>
            )
          }))}
        </div>

        <div style={{ flex: '1 1 220px', minWidth: 200 }}>
          {gate ? (
            <div style={{ background: '#fff8ec', border: '2px solid #f0b429', borderRadius: 14, padding: '14px 16px',
              transform: shake ? 'translateX(-4px)' : 'none', transition: 'transform .08s' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .8, color: '#a37400' }}>GATE {gate.letter} — BLOCKED</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#c0392b', margin: '6px 0 2px', textDecoration: 'line-through' }}>
                {act.gates[gate.letter].wrong}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 9 }}>Write it correctly to walk through.</div>
              <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') tryGate() }} placeholder="past tense…"
                style={{ width: '100%', padding: '9px 11px', borderRadius: 9, border: '1.5px solid #cfe0ec', fontFamily: 'inherit', fontSize: 15 }} />
              {tries > 0 && !reveal && <div style={{ fontSize: 12, color: '#c0392b', fontWeight: 700, marginTop: 6 }}>Not it — one more try for the point.</div>}
              {reveal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginTop: 7 }}>
                  <span style={{ fontSize: 12.5, color: '#a37400', fontWeight: 700 }}>It is <b>{act.gates[gate.letter].right}</b> — type it to pass.</span>
                  <WatchButton id={act.video} onPlay={onPlay} label="Watch the maze solution" />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn" style={{ padding: '8px 16px', fontSize: 13 }} disabled={!draft.trim()} onClick={tryGate}>Unlock →</button>
                <button className="btn ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setGate(null)}>Back up</button>
              </div>
            </div>
          ) : done ? (
            <div style={{ background: '#f1faf4', border: '2px solid #b8e6cd', borderRadius: 14, padding: '16px' }}>
              <div style={{ fontSize: 26 }}>🏁</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--good)', marginTop: 4 }}>You made it out.</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
                {firstTry} of {total} verbs fixed on the first try.
              </div>
            </div>
          ) : (
            <div style={{ background: '#f4f8fb', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, color: 'var(--muted)', marginBottom: 8 }}>VERBS IN YOUR WAY</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(act.gates).map(([k, g]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, display: 'grid', placeItems: 'center', fontSize: 10.5, fontWeight: 800,
                      background: cleared[k] ? 'var(--good)' : '#fff3d6', color: cleared[k] ? '#fff' : '#8a6400' }}>{cleared[k] ? '✓' : k}</span>
                    <span style={{ textDecoration: cleared[k] ? 'none' : 'line-through', color: cleared[k] ? 'var(--good)' : '#c0392b', fontWeight: 700 }}>
                      {cleared[k] ? g.right : g.wrong}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <span style={{ flex: 1, fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>💡 {act.hint}</span>
        <button className="btn" disabled={!done} onClick={() => onDone(firstTry)}>
          {done ? 'Next activity →' : 'Reach the finish flag first'}
        </button>
      </div>
    </div>
  )
}

/* --- activity: fill in the blank from a word bank --- */
function FixActivity({ act, onDone, onPlay }) {
  const [answers, setAnswers] = useState(act.items.map(() => ''))
  const [checked, setChecked] = useState(false)
  const right = act.items.map((it, i) => norm(answers[i]) === norm(it.answer))
  const score = right.filter(Boolean).length

  // a miss brings up the recording for that item straight away
  function check() {
    setChecked(true)
    const firstMiss = act.items.findIndex((it, i) => norm(answers[i]) !== norm(it.answer) && it.video)
    if (firstMiss >= 0 && onPlay) onPlay(act.items[firstMiss].video)
  }

  return (
    <div>
      <Directions text={act.directions || HOW_TO.fix} />
      <div style={{ fontSize: 13.5, fontWeight: 800, color: NAVY, marginBottom: 10 }}>{act.brief}</div>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 13 }}>
        {act.bank.map((w) => (
          <span key={w} style={{ background: '#eef6f9', color: CYAN, borderRadius: 999, padding: '6px 14px', fontSize: 13, fontWeight: 800 }}>{w}</span>
        ))}
      </div>

      <Beside src={KID_READER} flip>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {act.items.map((it, i) => {
          const [before, after] = it.given.split('____')
          const ok = checked && right[i]
          const bad = checked && !right[i]
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', background: ok ? '#f1faf4' : bad ? '#fff7f7' : '#fbfdfe',
              border: `1px solid ${ok ? '#b8e6cd' : bad ? '#f0b9be' : 'var(--line)'}`, borderRadius: 11, padding: '10px 13px', fontSize: 14, lineHeight: 1.6 }}>
              <span style={{ width: 20, fontSize: 11.5, fontWeight: 800, color: 'var(--muted)' }}>{i + 1}.</span>
              <span style={{ flex: 1, minWidth: 190 }}>
                {before}
                <input value={answers[i]} disabled={checked}
                  onChange={(e) => setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))}
                  style={{ width: 132, margin: '0 4px', padding: '4px 9px', borderRadius: 7, border: '1.5px solid #cfe0ec', fontFamily: 'inherit', fontSize: 14, background: checked ? '#fff' : '#fff' }} />
                {after}
              </span>
              {checked && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: ok ? 'var(--good)' : '#c0392b' }}>
                    {ok ? '✓' : `✕ ${it.answer}`}
                  </span>
                  <WatchButton id={it.video} onPlay={onPlay} label={ok ? 'Watch' : 'Why?'} />
                </span>
              )}
            </div>
          )
        })}
      </div>
      </Beside>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <span style={{ flex: 1, fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>💡 {act.hint}</span>
        {checked
          ? <button className="btn" onClick={() => onDone(score)}>Next activity → <b style={{ marginLeft: 6 }}>{score}/{act.items.length}</b></button>
          : <button className="btn" disabled={answers.every((a) => !a.trim())} onClick={check}>Check my answers ✓</button>}
      </div>
    </div>
  )
}

function Shell({ children, onClose, sub, onBack }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 80, padding: 16 }} onClick={onClose}>
      <div className="card" style={{ width: 760, maxWidth: '96vw', maxHeight: '94vh', overflowY: 'auto', padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '14px 20px', background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 62%,#0e2748 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ fontSize: 22 }}>🧾</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 17 }}>The Proof Room</b>
            <div style={{ fontSize: 12, color: '#a8dff5', fontWeight: 700 }}>{sub}</div>
          </div>
          {onBack && (
            <button onClick={onBack} style={{ color: '#a8dff5', fontSize: 12.5, fontWeight: 800, background: 'rgba(255,255,255,.12)', borderRadius: 999, padding: '6px 13px', cursor: 'pointer' }}>← Path</button>
          )}
          <button onClick={onClose} style={{ color: '#a8dff5', fontSize: 22, background: 'none', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '18px 20px 20px' }}>{children}</div>
      </div>
    </div>
  )
}
