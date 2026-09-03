import React, { useState, useMemo } from 'react'
import { api } from '../lib/api.js'
import { jobsFor } from '../../server/proofRoom.mjs'

/*
 * The Proof Room — worksheets as jobs. A job is a piece of writing with errors
 * planted in it: hunt them in flowing text, type the fix, and a wrong tap is a
 * false alarm that counts against you. Nothing feeds the writing data; a job
 * reports how clean the copy is when you hand it back, and pays coins at 75%.
 */

const NAVY = '#16386b'
const CYAN = '#0f97c2'
const PASS_MARK = 75

function scoreOf(fixed, total, falseAlarms) {
  if (!total) return 0
  return Math.max(0, Math.round((fixed / (total + falseAlarms)) * 100))
}

export default function ProofRoom({ grade = 5, onClose, onChange }) {
  const jobs = useMemo(() => jobsFor(grade), [grade])
  const [job, setJob] = useState(null)
  const [caught, setCaught] = useState({})     // error index -> true once tapped
  const [fixes, setFixes] = useState({})       // error index -> accepted typed fix
  const [typing, setTyping] = useState(null)   // error index currently being fixed
  const [draftFix, setDraftFix] = useState('')
  const [falseAlarms, setFalseAlarms] = useState(0)
  const [flash, setFlash] = useState(null)     // token index that was a false alarm
  const [result, setResult] = useState(null)

  function open(j) {
    setJob(j); setCaught({}); setFixes({}); setTyping(null); setDraftFix('')
    setFalseAlarms(0); setFlash(null); setResult(null)
  }

  function tap(tok, ti) {
    if (result) return
    if (!tok.bad) {
      setFalseAlarms((n) => n + 1)
      setFlash(ti)
      setTimeout(() => setFlash(null), 700)
      return
    }
    if (caught[tok.i]) return
    setCaught((c) => ({ ...c, [tok.i]: true }))
    setTyping(tok.i)
    setDraftFix('')
  }

  function submitFix(tok) {
    const ok = draftFix.trim().toLowerCase() === tok.fix.trim().toLowerCase()
    if (!ok) return
    setFixes((f) => ({ ...f, [tok.i]: tok.fix }))
    setTyping(null); setDraftFix('')
  }

  async function handIn() {
    const total = job.errorCount
    const fixedCount = Object.keys(fixes).length
    const accuracy = scoreOf(fixedCount, total, falseAlarms)
    let awarded = null
    try { awarded = await api.drillFinish({ jobId: job.id, accuracy, fixed: fixedCount, total, falseAlarms }) } catch { awarded = null }
    setResult({ accuracy, fixed: fixedCount, total, falseAlarms, ...(awarded || {}) })
    onChange && onChange()
  }

  /* ---------- the job list ---------- */
  if (!job) {
    return (
      <Shell onClose={onClose} sub="Bring writing in broken, take it out clean">
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 14 }}>
          Every job is a real piece of writing with mistakes planted in it. Find them, fix them, hand it back clean.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobs.map((j) => (
            <button key={j.id} onClick={() => open(j)}
              style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 13, border: '1.5px solid var(--line)', borderRadius: 14,
                padding: '13px 15px', background: '#fff', cursor: 'pointer' }}>
              <span style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 20, background: '#eef6f9' }}>🔍</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: NAVY }}>{j.title}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{j.skill}</span>
                <span style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 800, letterSpacing: .5, color: CYAN, marginTop: 5 }}>
                  {j.strand.toUpperCase()} · GRADE {j.grade}
                </span>
              </span>
              <span style={{ flexShrink: 0, textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#a37400' }}>{j.errorCount} to find</span>
                <span className="btn" style={{ display: 'inline-block', marginTop: 6, padding: '7px 15px', fontSize: 12.5 }}>Take the job →</span>
              </span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', textAlign: 'center', marginTop: 14 }}>
          More jobs arrive as your teacher assigns skills.
        </div>
      </Shell>
    )
  }

  /* ---------- results ---------- */
  if (result) {
    const passed = result.accuracy >= PASS_MARK
    const missed = result.total - result.fixed
    return (
      <Shell onClose={onClose} sub={job.title}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44 }}>{passed ? '🧾' : '💪'}</div>
          <h2 style={{ margin: '4px 0 2px', fontSize: 23 }}>{passed ? 'Clean copy!' : 'Handed back'}</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 16px' }}>{job.strand} · Grade {job.grade}</p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 26, flexWrap: 'wrap', marginBottom: 16 }}>
            <Stat big label="CLEAN COPY" value={`${result.accuracy}%`} tone={passed ? 'var(--good)' : '#c99312'} />
            <Stat label="FIXED" value={`${result.fixed}/${result.total}`} sub={missed ? `${missed} slipped through` : 'nothing missed'} />
            <Stat label="FALSE ALARMS" value={result.falseAlarms} sub={result.falseAlarms ? 'good writing, flagged' : 'none — sharp eye'} />
          </div>

          {result.coins > 0 ? (
            <div className="pill gold" style={{ justifyContent: 'center', padding: '10px 16px', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
              🪙 +{result.coins} ClassCade coins
            </div>
          ) : (
            <div style={{ background: '#f4f8fb', borderRadius: 10, padding: '11px 16px', fontSize: 13, color: 'var(--muted)', fontWeight: 700, maxWidth: 400, margin: '0 auto' }}>
              {result.capped
                ? "You've earned all the Proof Room coins for today — the practice still counts."
                : `Hand back ${PASS_MARK}% clean copy to earn coins. Flagging good writing costs you, so read before you tap.`}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => open(job)}>↻ Run it again</button>
            <button className="btn ghost" onClick={() => setJob(null)}>Back to the jobs</button>
          </div>
        </div>
      </Shell>
    )
  }

  /* ---------- the hunt ---------- */
  const total = job.errorCount
  const fixedCount = Object.keys(fixes).length
  const allFound = Object.keys(caught).length === total && !typing
  const live = scoreOf(fixedCount, total, falseAlarms)

  return (
    <Shell onClose={onClose} sub={job.title}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: NAVY, flex: 1, minWidth: 200 }}>{job.brief}</span>
        <span className="pill" style={{ background: '#eef4f8', color: NAVY }}>{fixedCount} of {total} fixed</span>
        <span className="pill" style={{ background: falseAlarms ? '#fdecec' : '#f1faf4', color: falseAlarms ? '#c0392b' : 'var(--good)' }}>
          {falseAlarms} false {falseAlarms === 1 ? 'alarm' : 'alarms'}
        </span>
      </div>

      <div style={{ background: '#fbfdfe', border: '1.5px solid var(--line)', borderRadius: 14, padding: '16px 18px', fontSize: 15.5, lineHeight: 2.05 }}>
        {job.tokens.map((tok, ti) => {
          if (!tok.bad) {
            return (
              <span key={ti} onClick={() => tap(tok, ti)}
                style={{ cursor: 'pointer', borderRadius: 4, background: flash === ti ? '#fdecec' : 'transparent', transition: 'background .2s' }}>
                {tok.t}
              </span>
            )
          }
          const isFixed = fixes[tok.i]
          const isCaught = caught[tok.i]
          if (isFixed) {
            return (
              <span key={ti} style={{ background: '#e6f6ee', color: 'var(--good)', fontWeight: 800, borderRadius: 5, padding: '1px 6px' }}>{tok.fix}</span>
            )
          }
          if (isCaught && typing === tok.i) {
            return (
              <span key={ti} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff8ec', border: '1.5px solid #f0b429', borderRadius: 8, padding: '2px 6px', margin: '0 2px' }}>
                <s style={{ color: '#c0392b', fontWeight: 700 }}>{tok.t}</s>
                <input autoFocus value={draftFix} onChange={(e) => setDraftFix(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitFix(tok) }}
                  placeholder="type the fix"
                  style={{ width: 128, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 14 }} />
                <button onClick={() => submitFix(tok)} disabled={!draftFix.trim()}
                  style={{ fontSize: 12, fontWeight: 800, color: draftFix.trim() ? '#fff' : '#9db0c0', background: draftFix.trim() ? NAVY : '#eef0f6', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>✓</button>
              </span>
            )
          }
          if (isCaught) {
            return (
              <span key={ti} onClick={() => { setTyping(tok.i); setDraftFix('') }}
                style={{ cursor: 'pointer', background: '#fff3d6', color: '#8a6400', fontWeight: 800, borderRadius: 5, padding: '1px 6px', textDecoration: 'underline wavy #e0a51c' }}>
                {tok.t}
              </span>
            )
          }
          return (
            <span key={ti} onClick={() => tap(tok, ti)} style={{ cursor: 'pointer', borderRadius: 4 }}>{tok.t}</span>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <button className="btn ghost" onClick={() => setJob(null)} style={{ padding: '9px 16px' }}>← Jobs</button>
        <span style={{ flex: 1, fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>
          {allFound ? 'Every error found — hand it back.' : `💡 ${job.hint}`}
        </span>
        <span className="pill" style={{ background: '#eef4f8', color: CYAN }}>clean copy {live}%</span>
        <button className="btn" onClick={handIn}>{allFound ? 'Hand it back ✓' : 'Hand it back anyway'}</button>
      </div>
    </Shell>
  )
}

function Stat({ label, value, sub, tone, big }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: big ? 38 : 25, fontWeight: 800, color: tone || NAVY, lineHeight: 1.15 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>{sub}</div>}
    </div>
  )
}

function Shell({ children, onClose, sub }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 80, padding: 16 }} onClick={onClose}>
      <div className="card" style={{ width: 700, maxWidth: '96vw', maxHeight: '94vh', overflowY: 'auto', padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '14px 20px', background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 62%,#0e2748 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ fontSize: 22 }}>🧾</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 17 }}>The Proof Room</b>
            <div style={{ fontSize: 12, color: '#a8dff5', fontWeight: 700 }}>{sub}</div>
          </div>
          <button onClick={onClose} style={{ color: '#a8dff5', fontSize: 22, background: 'none', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '18px 20px 20px' }}>{children}</div>
      </div>
    </div>
  )
}
