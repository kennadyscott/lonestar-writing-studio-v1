import React, { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api.js'
import { BRAND } from '../lib/brand.js'

/*
 * Quick Write — the live product's 3-part flow, refreshed in the studio brand:
 *   1. Assignment intro (title + prompt + Start)
 *   2. "Are you ready?" goal-timer modal (3:00) with Begin
 *   3. Timed writing screen with live countdown + editor -> submit for coins
 */


function Digits({ seconds, light }) {
  const mm = String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, '0')
  const ss = String(Math.max(0, seconds) % 60).padStart(2, '0')
  const chars = [mm[0], mm[1], ':', ss[0], ss[1]]
  return (
    <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      {chars.map((c, i) => c === ':'
        ? <b key={i} style={{ color: light ? '#fff' : 'var(--ink)', fontSize: 20 }}>:</b>
        : <span key={i} style={{ width: 38, height: 44, borderRadius: 9, background: light ? 'rgba(235,248,253,.95)' : '#dff2f9', color: '#0d2f55', display: 'grid', placeItems: 'center', fontSize: 21, fontWeight: 800 }}>{c}</span>
      )}
    </span>
  )
}

function StopwatchArt({ size = 54 }) {
  return <span style={{ fontSize: size * 0.8, filter: 'drop-shadow(0 2px 3px rgba(2,56,77,.3))' }}>⏱️</span>
}

export default function QuickWritePage({ state, onBack, onChange }) {
  // teacher-configured goal time (from their system)
  const GOAL_SECONDS = state.settings?.quickWriteSeconds ?? 180
  const setBy = state.settings?.quickWriteSetBy
  // rotate the static prompt bank daily
  const bank = state.quickPrompts || []
  const pick = bank.length ? bank[Math.floor(Date.now() / 86400000) % bank.length] : { title: 'Quick Write', prompt: 'Write!' }

  const [stage, setStage] = useState('intro') // intro | ready | writing | done
  const [secondsLeft, setSecondsLeft] = useState(GOAL_SECONDS)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const editorRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (stage !== 'writing') return
    timerRef.current = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [stage])
  useEffect(() => { if (secondsLeft <= 0 && stage === 'writing') clearInterval(timerRef.current) }, [secondsLeft, stage])

  const wc = text.trim().split(/\s+/).filter(Boolean).length
  const timeUp = secondsLeft <= 0

  function cmd(c) { document.execCommand(c, false, null); editorRef.current?.focus() }

  async function submit() {
    setBusy(true)
    try {
      const r = await api.quickWrite('quick', { title: pick.title, prompt: pick.prompt, content: text.trim(), complete: true })
      setResult({ coins: r.coins, words: wc, streakDays: r.streakDays, streakExtended: r.streakExtended })
      setStage('done')
      onChange && onChange()
    } finally { setBusy(false) }
  }

  return (
    <div>
      {onBack && <button className="backlink" onClick={onBack}>← Back to Dashboard</button>}

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', margin: '4px 0 18px' }}>
        <h1 className="page" style={{ margin: 0, fontSize: 42, color: '#0d2440' }}>Quick Write</h1>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,180,0,.14)', color: '#a37400', fontWeight: 800, fontSize: 14, borderRadius: 999, padding: '10px 16px', border: '1px solid rgba(245,180,0,.4)' }}>
          About {Math.max(1, Math.round((state.settings?.quickWriteSeconds ?? 180) / 60))} min
        </span>
      </div>

      <div className={stage === 'intro' ? undefined : 'card'} style={stage === 'intro' ? undefined : { overflow: 'hidden', position: 'relative' }}>


        {/* ============ intro: one screen, one click ============ */}
        {stage === 'intro' && (
          <div className="qw-stage">
            <img className="qw-stage-art" src={`${import.meta.env.BASE_URL || '/'}qw-hero.jpg`} alt="" />
            <div className="qw-stage-veil" />
            <article className="qw-paper">
              <div className="qw-assigned">★ Teacher assigned</div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: '#0f97c2', marginBottom: 6 }}>Writing topic</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#0d2440', lineHeight: 1.1, margin: '0 0 8px', letterSpacing: '-.03em' }}>{pick.title}</div>
              <div className="constellation-rule" aria-hidden><i /><i /><i /><span /></div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: '#0f97c2', marginBottom: 8 }}>Writing prompt</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#10294a', lineHeight: 1.45, marginBottom: 16 }}>{pick.prompt}</div>
              <div className="qw-think">
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span className="qw-coach-ic">💡</span>
                  <div style={{ fontSize: 14, color: '#28506b', lineHeight: 1.4 }}>
                    <b style={{ display: 'block', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: '#0f97c2', marginBottom: 2 }}>Think about</b>
                    {pick.hint || 'What details and examples will make your idea clear to a reader?'}
                  </div>
                </div>
                {[
                  ['★', 'Share your ideas.', 'Your voice matters. Big ideas can spark real change.'],
                  ['✦', 'Be creative.', 'There are no wrong answers — just your unique voice.'],
                  ['♥', 'Make it meaningful.', 'Explain the why, and who your idea would help.'],
                ].map(([ic, title, body]) => (
                  <div className="qw-coach" key={title}>
                    <span className="qw-coach-ic">{ic}</span>
                    <div><b>{title}</b> {body}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStage('writing')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 58%,#0e2748 100%)', color: '#fff', fontWeight: 800, fontSize: 16, borderRadius: 999, padding: '14px 24px',
                  boxShadow: '0 8px 22px rgba(53,195,232,.35), 0 0 0 1px rgba(245,180,0,.4)', cursor: 'pointer' }}>
                Start writing
              </button>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', marginTop: 10 }}>
                The {Math.floor(GOAL_SECONDS / 60)}:{String(GOAL_SECONDS % 60).padStart(2, '0')} timer starts right away{setBy ? ` · goal set by ${setBy}` : ''}
              </div>
            </article>
            <img className="qw-luna" src={BRAND.luna} alt="" />
          </div>
        )}

        {/* ============ 3. timed writing ============ */}
        {(stage === 'writing' || stage === 'done') && (
          <div style={{ padding: '20px 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>Title</div>
                <div style={{ fontSize: 19, fontWeight: 800, margin: '1px 0 12px' }}>{pick.title}</div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>Writing Prompt</div>
                <div style={{ fontSize: 15, lineHeight: 1.5 }}>{pick.prompt}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Digits seconds={secondsLeft} />
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: timeUp ? 'var(--good)' : 'var(--muted)' }}>
                  {timeUp ? '⏰ Time! Finish your thought & submit' : 'keep writing…'}
                </div>
              </div>
            </div>

            {/* editor */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 12, marginTop: 18, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 10px', borderBottom: '1px solid var(--line)', background: '#f8fbfd' }}>
                {[['bold', <b key="b">B</b>], ['italic', <i key="i">I</i>], ['underline', <u key="u">U</u>], ['insertOrderedList', '1.'], ['insertUnorderedList', '••']].map(([c, label]) => (
                  <button key={c} onMouseDown={(e) => { e.preventDefault(); cmd(c) }} disabled={stage === 'done'}
                    style={{ width: 32, height: 30, borderRadius: 7, fontSize: 14, fontWeight: 700, color: 'var(--ink)', background: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e8f2f8'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    {label}
                  </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{wc} words</span>
              </div>
              <div ref={editorRef} contentEditable={stage !== 'done'} suppressContentEditableWarning
                onInput={(e) => setText(e.currentTarget.innerText || '')}
                data-placeholder="Write your answer here…"
                style={{ minHeight: 260, padding: '14px 16px', fontSize: 15.5, lineHeight: 1.65, outline: 'none', color: 'var(--ink)', background: stage === 'done' ? '#fafcfd' : '#fff' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>
                {stage === 'done' ? '✓ Submitted' : 'Quick writes are about showing up — words over perfection.'}
              </span>
              {stage === 'writing' && (
                <button className="btn gold" disabled={busy || wc === 0} onClick={submit}>📬 I'm done — submit</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* completion modal */}
      {stage === 'done' && result && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }} onClick={onBack}>
          <div className="card" style={{ padding: 30, width: 400, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48 }}>⚡</div>
            <h2 style={{ margin: '4px 0 4px' }}>Quick write done!</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 14px', fontSize: 14.5 }}>
              You wrote <b style={{ color: 'var(--ink)' }}>{result.words} words</b> — showing up is how writers are made.
            </p>
            {result.coins > 0 && (
              <div className="pill gold" style={{ justifyContent: 'center', padding: '9px 14px', fontSize: 14 }}>
                🏅 Finished a timed Quick Write&nbsp;&nbsp;<span className="coin"><span className="disc" />+{result.coins}</span>
              </div>
            )}
            {result.streakDays > 0 && (
              <div className="pill" style={{ justifyContent: 'center', padding: '9px 14px', fontSize: 14, marginTop: 8, background: '#fdeee3', color: '#c2571f', width: '100%' }}>
                🔥 Writing streak: <b>{result.streakDays} days</b>{result.streakExtended ? ' — extended today!' : ''}
              </div>
            )}
            <button className="btn" style={{ marginTop: 18, width: '100%', justifyContent: 'center' }} onClick={onBack}>Back to my dashboard</button>
          </div>
        </div>
      )}
    </div>
  )
}
