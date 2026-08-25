import React, { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api.js'
import { TIERS, MODES, tierFor, buildRound } from '../../server/typingBank.mjs'

/*
 * Type Right — typing practice where the keystrokes are also convention practice.
 * Four modes over seven grade tiers. A round is scored on accuracy and speed and
 * nothing else: no data leaves this screen. Clear 85% and the round pays coins.
 */

const NAVY = '#16386b'
const CYAN = '#0f97c2'
const PASS_MARK = 85

/* Per-character comparison, so a student sees the mistake at the moment it happens. */
function charStates(typed, target) {
  const out = []
  for (let i = 0; i < target.length; i++) {
    const t = typed[i]
    out.push({ ch: target[i], state: t == null ? 'todo' : t === target[i] ? 'ok' : 'bad' })
  }
  return out
}

function Target({ typed, target }) {
  const chars = charStates(typed, target)
  const cursor = Math.min(typed.length, target.length)
  return (
    <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 25, lineHeight: 1.6, letterSpacing: .4, wordBreak: 'break-word' }}>
      {chars.map((c, i) => (
        <span key={i} style={{
          color: c.state === 'ok' ? '#1e7a4a' : c.state === 'bad' ? '#c0392b' : '#8fa5b8',
          background: c.state === 'bad' ? '#fdecec' : i === cursor ? 'rgba(53,195,232,.28)' : 'transparent',
          borderRadius: 3, textDecoration: c.state === 'bad' ? 'underline wavy #c0392b' : 'none',
          borderLeft: i === cursor ? '2px solid #0f97c2' : '2px solid transparent',
        }}>{c.ch === ' ' && c.state === 'bad' ? '␣' : c.ch}</span>
      ))}
      {typed.length > target.length && (
        <span style={{ color: '#c0392b', background: '#fdecec', borderRadius: 3 }}>{typed.slice(target.length)}</span>
      )}
    </div>
  )
}

export default function TypingGame({ grade = 6, onClose, onChange }) {
  const [level, setLevel] = useState(Math.max(2, Math.min(8, grade)))
  const [mode, setMode] = useState(null)
  const [items, setItems] = useState([])
  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [posPick, setPosPick] = useState(null)
  const [locked, setLocked] = useState(false) // item answered, waiting for Next
  const [stats, setStats] = useState({ keys: 0, wrong: 0, exact: 0, posRight: 0, posAsked: 0 })
  const [startedAt, setStartedAt] = useState(null)
  const [result, setResult] = useState(null)
  const inputRef = useRef(null)
  const tier = tierFor(level)
  const item = items[idx]

  useEffect(() => { if (mode && !locked) inputRef.current?.focus() }, [mode, idx, locked])

  // Enter should always move the round along, even when focus has wandered off
  // the input (clicking Check with the mouse, tabbing to a word-type button).
  useEffect(() => {
    if (!mode || result) return
    const onKey = (e) => {
      if (e.key !== 'Enter') return
      e.preventDefault()
      if (locked) next()
      else if (typed && (mode !== 'sort' || posPick)) submitItem()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, locked, idx, typed, posPick, result])

  function start(m) {
    setMode(m)
    setItems(buildRound(level, m, Math.floor(Date.now() / 1000) % 9973))
    setIdx(0); setTyped(''); setPosPick(null); setLocked(false)
    setStats({ keys: 0, wrong: 0, exact: 0, posRight: 0, posAsked: 0 })
    setStartedAt(Date.now())
    setResult(null)
  }

  // every keystroke counts once — this is the accuracy number
  function onType(v) {
    if (locked) return
    const prev = typed
    if (v.length > prev.length) {
      const i = v.length - 1
      const right = item.target[i] === v[i]
      setStats((s) => ({ ...s, keys: s.keys + 1, wrong: s.wrong + (right ? 0 : 1) }))
    }
    setTyped(v)
  }

  function submitItem() {
    if (locked || !item) return
    const exact = typed === item.target
    const posOk = mode !== 'sort' ? true : posPick === item.pos
    setStats((s) => ({
      ...s,
      exact: s.exact + (exact ? 1 : 0),
      posAsked: s.posAsked + (mode === 'sort' ? 1 : 0),
      posRight: s.posRight + (mode === 'sort' && posOk ? 1 : 0),
    }))
    setLocked(true)
  }

  async function next() {
    if (idx + 1 < items.length) {
      setIdx(idx + 1); setTyped(''); setPosPick(null); setLocked(false)
      return
    }
    // round over — score it
    const seconds = Math.max(1, (Date.now() - startedAt) / 1000)
    const typedChars = items.slice(0, items.length).reduce((a, x) => a + x.target.length, 0)
    const accuracy = stats.keys ? Math.round(((stats.keys - stats.wrong) / stats.keys) * 100) : 0
    const wpm = Math.round((typedChars / 5) / (seconds / 60))
    const payload = { accuracy, wpm, mode, grade: level, exact: stats.exact, items: items.length }
    let awarded = null
    try { awarded = await api.typingFinish(payload) } catch { awarded = null }
    setResult({ ...payload, seconds: Math.round(seconds), ...(awarded || {}) })
    onChange && onChange()
  }

  const exactOk = locked && typed === item?.target
  const posOk = mode === 'sort' && locked ? posPick === item?.pos : null

  /* ---------- results ---------- */
  if (result) {
    const passed = result.accuracy >= PASS_MARK
    return (
      <Shell onClose={onClose} level={level} tier={tier} mode={mode}>
        <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
          <div style={{ fontSize: 46 }}>{passed ? '🎉' : '💪'}</div>
          <h2 style={{ margin: '4px 0 2px', fontSize: 24 }}>{passed ? 'Round cleared!' : 'Round finished'}</h2>
          <p style={{ color: 'var(--muted)', margin: '0 0 16px', fontSize: 14 }}>
            {MODES.find((m) => m.key === mode)?.label} · Level {level}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 26, flexWrap: 'wrap', marginBottom: 16 }}>
            <Stat big label="ACCURACY" value={`${result.accuracy}%`} tone={passed ? 'var(--good)' : '#c99312'} />
            <Stat label="SPEED" value={`${result.wpm} wpm`} sub={`target ${tier.wpm}`} />
            <Stat label="EXACT" value={`${result.exact}/${result.items}`} sub="typed perfectly" />
          </div>

          <div style={{ height: 12, borderRadius: 8, background: '#eef3f6', position: 'relative', margin: '0 auto 8px', maxWidth: 420 }}>
            <div style={{ position: 'absolute', inset: 0, width: `${Math.min(100, result.accuracy)}%`, borderRadius: 8,
              background: passed ? 'linear-gradient(90deg,#57d98a,#1e7a4a)' : 'linear-gradient(90deg,#f5c542,#e89a00)' }} />
            <div style={{ position: 'absolute', left: `${PASS_MARK}%`, top: -5, bottom: -5, width: 2, background: NAVY }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700, maxWidth: 420, margin: '0 auto 16px', textAlign: 'right' }}>
            ↑ {PASS_MARK}% earns coins
          </div>

          {result.coins > 0 ? (
            <div className="pill gold" style={{ justifyContent: 'center', padding: '10px 16px', fontSize: 14, maxWidth: 420, margin: '0 auto' }}>
              🪙 +{result.coins} ClassCade coins{result.doubled ? ' · double for Fluency Practice' : ''}
            </div>
          ) : (
            <div style={{ background: '#f4f8fb', borderRadius: 10, padding: '11px 16px', fontSize: 13, color: 'var(--muted)', fontWeight: 700, maxWidth: 420, margin: '0 auto' }}>
              {result.capped
                ? "You've earned all the typing coins for today — keep practicing for the speed."
                : `Hit ${PASS_MARK}% accuracy to earn coins. Slow down a little — accuracy first, speed follows.`}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => start(mode)}>↻ Play again</button>
            <button className="btn ghost" onClick={() => { setMode(null); setResult(null) }}>Pick another mode</button>
          </div>
        </div>
      </Shell>
    )
  }

  /* ---------- menu ---------- */
  if (!mode) {
    return (
      <Shell onClose={onClose} level={level} tier={tier}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: 'var(--muted)' }}>LEVEL</span>
          <div style={{ display: 'inline-flex', background: '#eef3f6', borderRadius: 10, padding: 3, gap: 2 }}>
            {TIERS.map((t) => (
              <button key={t.grade} onClick={() => setLevel(t.grade)}
                style={{ padding: '6px 13px', borderRadius: 8, fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  background: level === t.grade ? '#fff' : 'transparent', color: level === t.grade ? NAVY : 'var(--muted)',
                  boxShadow: level === t.grade ? 'var(--shadow)' : 'none' }}>
                {t.grade}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background: '#f4f8fb', borderRadius: 12, padding: '12px 16px', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
          <div><b>{tier.unit}</b> · {tier.keys}</div>
          <div style={{ color: 'var(--muted)' }}>Working on: {tier.convention}</div>
          <div style={{ color: 'var(--muted)' }}>Goal: {tier.wpm} words per minute at {tier.target}% accuracy</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 11 }}>
          {MODES.map((m) => (
            <button key={m.key} onClick={() => start(m.key)}
              style={{ textAlign: 'left', border: '1.5px solid var(--line)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', background: '#fff' }}>
              <div style={{ fontSize: 24 }}>{m.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 15, marginTop: 5, color: NAVY }}>{m.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 3, lineHeight: 1.45 }}>{m.blurb}</div>
            </button>
          ))}
        </div>
      </Shell>
    )
  }

  /* ---------- playing ---------- */
  const buckets = tier.grammar
  return (
    <Shell onClose={onClose} level={level} tier={tier} mode={mode}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--muted)' }}>{idx + 1} of {items.length}</span>
        <div style={{ flex: 1, height: 7, background: '#eef3f6', borderRadius: 5 }}>
          <div style={{ height: '100%', width: `${(idx / items.length) * 100}%`, background: 'linear-gradient(90deg,#35c3e8,#0f97c2)', borderRadius: 5 }} />
        </div>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: CYAN }}>
          {stats.keys ? Math.round(((stats.keys - stats.wrong) / stats.keys) * 100) : 100}%
        </span>
      </div>

      {mode === 'fixit' && (
        <div style={{ background: '#fff8ec', border: '1.5px solid #f0d9a8', borderRadius: 12, padding: '11px 15px', marginBottom: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, color: '#8a6400' }}>FIX IT AS YOU TYPE — {item.skill.toUpperCase()}</div>
          <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 15, color: '#7a6224', marginTop: 4 }}>{item.given}</div>
        </div>
      )}

      {/* In Fix It, showing the corrected sentence would just be copying — the
          student types from the rule, and the comparison appears on Check. */}
      <div style={{ background: '#fbfdfe', border: '1.5px solid var(--line)', borderRadius: 14, padding: '18px 20px', minHeight: 96 }}>
        {mode === 'fixit' && !locked ? (
          <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 25, lineHeight: 1.6, letterSpacing: .4, wordBreak: 'break-word', color: '#16386b', minHeight: 40 }}>
            {typed || <span style={{ color: '#b8c8d4' }}>Type the sentence the way it should be written…</span>}
            <span style={{ borderLeft: '2px solid #0f97c2', marginLeft: 1 }} />
          </div>
        ) : (
          <Target typed={typed} target={item.target} />
        )}
      </div>

      <input ref={inputRef} value={typed} onChange={(e) => onType(e.target.value)}
        onPaste={(e) => e.preventDefault()} spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off"
        placeholder="Type it here…"
        style={{ width: '100%', marginTop: 12, padding: '13px 15px', borderRadius: 12, border: `2px solid ${locked ? (exactOk ? 'var(--good)' : '#e0a0a0') : '#cfe0ec'}`,
          fontFamily: 'ui-monospace, monospace', fontSize: 17, background: locked ? '#f7f9fb' : '#fff' }} />

      {mode === 'sort' && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: .6, color: 'var(--muted)', marginBottom: 7 }}>WHAT KIND OF WORD IS IT?</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {buckets.map((b) => {
              const chosen = posPick === b
              const reveal = locked && b === item.pos
              return (
                <button key={b} disabled={locked} onClick={() => setPosPick(b)}
                  style={{ padding: '9px 16px', borderRadius: 999, fontSize: 13.5, fontWeight: 800, cursor: locked ? 'default' : 'pointer', textTransform: 'capitalize',
                    background: reveal ? '#e6f6ee' : chosen ? '#e9f5fb' : '#eef3f6',
                    color: reveal ? 'var(--good)' : chosen ? CYAN : 'var(--muted)',
                    border: `1.5px solid ${reveal ? 'var(--good)' : chosen ? CYAN : 'transparent'}` }}>
                  {b}{reveal ? ' ✓' : ''}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {locked && (
        <div style={{ marginTop: 12, background: exactOk && posOk !== false ? '#f1faf4' : '#fff7f7', borderRadius: 12, padding: '11px 15px', fontSize: 13.5, lineHeight: 1.5 }}>
          {exactOk ? <b style={{ color: 'var(--good)' }}>✓ Exactly right.</b> : <b style={{ color: '#c0392b' }}>✕ Not quite.</b>}{' '}
          {!exactOk && <>The correct version is <b style={{ fontFamily: 'ui-monospace, monospace' }}>{item.target}</b></>}
          {mode === 'sort' && posOk === false && <div style={{ marginTop: 3 }}>“{item.target}” is a <b>{item.pos}</b>.</div>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
        <button className="btn ghost" onClick={() => { setMode(null); setResult(null) }} style={{ padding: '9px 16px' }}>← Modes</button>
        <span style={{ flex: 1, fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>Press Enter to check, Enter again for the next one</span>
        {locked
          ? <button className="btn" onClick={next}>{idx + 1 < items.length ? 'Next →' : 'See my score →'}</button>
          : <button className="btn" disabled={!typed || (mode === 'sort' && !posPick)} onClick={submitItem}>Check ✓</button>}
      </div>
    </Shell>
  )
}

function Stat({ label, value, sub, tone, big }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: big ? 40 : 26, fontWeight: 800, color: tone || NAVY, lineHeight: 1.15 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 }}>{sub}</div>}
    </div>
  )
}

function Shell({ children, onClose, level, tier, mode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 80, padding: 16 }} onClick={onClose}>
      <div className="card" style={{ width: 640, maxWidth: '96vw', maxHeight: '94vh', overflowY: 'auto', padding: 0 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '14px 20px', background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 62%,#0e2748 100%)', color: '#fff', display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ fontSize: 22 }}>⌨️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 17 }}>Type Right</b>
            <div style={{ fontSize: 12, color: '#a8dff5', fontWeight: 700 }}>
              Level {level} · {mode ? MODES.find((m) => m.key === mode)?.label : tier.unit}
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#a8dff5', fontSize: 22, background: 'none', cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ padding: '18px 20px 20px' }}>{children}</div>
      </div>
    </div>
  )
}
