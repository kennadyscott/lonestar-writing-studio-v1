import React, { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useT } from '../lib/i18n/index.jsx'
import { LanguageBridgePanel } from './LanguageBridge.jsx'
import { ReadAloudText } from './ReadAloud.jsx'

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

export default function QuickWritePage({ state, me, onBack, onChange }) {
  const t = useT()
  const supportLevel = me?.supportLevel || null
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

  // Drop a starter into the rich-text editor wherever the caret sits.
  function insertSupport(phrase) {
    const el = editorRef.current
    if (!el) return
    el.focus()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !el.contains(sel.anchorNode)) {
      const r = document.createRange()
      r.selectNodeContents(el); r.collapse(false)
      sel?.removeAllRanges(); sel?.addRange(r)
    }
    const existing = el.innerText || ''
    const pad = existing && !/\s$/.test(existing) ? ' ' : ''
    document.execCommand('insertText', false, pad + phrase + ' ')
    setText(el.innerText || '')
  }

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
      {onBack && <button className="backlink" onClick={onBack}>{t('← Back to Dashboard')}</button>}

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', margin: '4px 0 18px' }}>
        <h1 className="page" style={{ margin: 0 }}>{t('Quick Write')}</h1>
        <span className="pill gold" style={{ padding: '8px 12px', fontSize: 13 }}>
          {t('About {n} min', { n: Math.max(1, Math.round((state.settings?.quickWriteSeconds ?? 180) / 60)) })}
        </span>
      </div>

      <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>


        {/* ============ intro: one screen, one click ============ */}
        {stage === 'intro' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px,0.95fr) 1.1fr', gap: 34, padding: '26px 30px 22px', alignItems: 'center' }}>
              <img src={`${import.meta.env.BASE_URL || '/'}qw-hero.jpg`} alt=""
                style={{ width: '100%', borderRadius: 18, display: 'block', boxShadow: '0 12px 30px rgba(30,25,80,.25)' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 44, height: 44, borderRadius: '50%', background: '#e9f5fb', display: 'grid', placeItems: 'center', fontSize: 20 }}>🪶</span>
                  <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: '#0f97c2', textTransform: 'uppercase' }}>{t('Writing Topic')}</span>
                </div>
                <div style={{ fontSize: 42, fontWeight: 800, color: '#0d2440', lineHeight: 1.1, margin: '10px 0 10px' }}>{pick.title}</div>
                <div className="constellation-rule" aria-hidden><i /><i /><i /><span /></div>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: '#0f97c2', textTransform: 'uppercase', marginBottom: 8 }}>{t('Writing Prompt')}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#10294a', lineHeight: 1.4, marginBottom: 18 }}>{pick.prompt}</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#e9f5fb', borderRadius: 14, padding: '13px 16px', marginBottom: 22 }}>
                  <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>💡</span>
                  <div style={{ fontSize: 14, color: '#28506b', lineHeight: 1.45 }}>
                    <b style={{ color: '#0f97c2' }}>{t('Think about:')}</b> {pick.hint || t('What details and examples will make your idea clear to a reader?')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <button className="btn lg" onClick={() => setStage('writing')}>{t('Start writing')}</button>
                  <span style={{ fontSize: 12.5, fontWeight: 650, color: 'var(--muted)' }}>
                    {t('The {time} timer starts right away', { time: `${Math.floor(GOAL_SECONDS / 60)}:${String(GOAL_SECONDS % 60).padStart(2, '0')}` })}
                    {setBy ? ` · ${t('goal set by {who}', { who: setBy })}` : ''}
                  </span>
                </div>
              </div>
            </div>
            {/* benefits strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid var(--line)' }}>
              {[
                ['⭐', '#2e9e6b', 'Share Your Ideas', 'Your voice matters. Big ideas can spark real change!'],
                ['🚀', '#2f8ceb', 'Be Creative', 'There are no wrong answers — just your unique voice.'],
                ['💜', '#8b5cf6', 'Make It Meaningful', 'Explain the why behind your idea and how it helps others.'],
              ].map(([icon, c, title, blurb], i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '18px 22px', borderLeft: i ? '1px solid var(--line)' : 'none' }}>
                  <span style={{ fontSize: 24, filter: `drop-shadow(0 1px 2px ${c}55)` }}>{icon}</span>
                  <span>
                    <b style={{ display: 'block', fontSize: 14.5, color: '#0d2440' }}>{t(title)}</b>
                    <span style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.4 }}>{t(blurb)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ 3. timed writing ============ */}
        {(stage === 'writing' || stage === 'done') && (
          <div style={{ padding: '20px 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>{t('Title')}</div>
                <div style={{ fontSize: 19, fontWeight: 800, margin: '1px 0 12px' }}>{pick.title}</div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>{t('Writing Prompt')}</div>
                <ReadAloudText text={pick.prompt} lang="en" level={supportLevel}
                  style={{ fontSize: 15, lineHeight: 1.5 }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <Digits seconds={secondsLeft} />
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, color: timeUp ? 'var(--good)' : 'var(--muted)' }}>
                  {timeUp ? t('⏰ Time! Finish your thought & submit') : t('keep writing…')}
                </div>
              </div>
            </div>

            {supportLevel && stage === 'writing' && (
              <div style={{ marginTop: 16 }}>
                <LanguageBridgePanel level={supportLevel} onInsert={insertSupport} race={false} compact />
              </div>
            )}

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
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>{t('{n} words', { n: wc })}</span>
              </div>
              <div ref={editorRef} contentEditable={stage !== 'done'} suppressContentEditableWarning
                onInput={(e) => setText(e.currentTarget.innerText || '')}
                data-placeholder={t('Write your answer here…')}
                style={{ minHeight: 260, padding: '14px 16px', fontSize: 15.5, lineHeight: 1.65, outline: 'none', color: 'var(--ink)', background: stage === 'done' ? '#fafcfd' : '#fff' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>
                {stage === 'done' ? t('✓ Submitted') : t('Quick writes are about showing up — words over perfection.')}
              </span>
              {stage === 'writing' && (
                <button className="btn gold" disabled={busy || wc === 0} onClick={submit}>{t("📬 I'm done — submit")}</button>
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
            <h2 style={{ margin: '4px 0 4px' }}>{t('Quick write done!')}</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 14px', fontSize: 14.5 }}>
              {t('You wrote')} <b style={{ color: 'var(--ink)' }}>{t('{n} words', { n: result.words })}</b> {t('— showing up is how writers are made.')}
            </p>
            {result.coins > 0 && (
              <div className="pill gold" style={{ justifyContent: 'center', padding: '9px 14px', fontSize: 14 }}>
                {t('🏅 Finished a timed Quick Write')}&nbsp;&nbsp;<span className="coin"><span className="disc" />+{result.coins}</span>
              </div>
            )}
            {result.streakDays > 0 && (
              <div className="pill" style={{ justifyContent: 'center', padding: '9px 14px', fontSize: 14, marginTop: 8, background: '#fdeee3', color: '#c2571f', width: '100%' }}>
                {t('🔥 Writing streak:')} <b>{t('{n} days', { n: result.streakDays })}</b>{result.streakExtended ? t(' — extended today!') : ''}
              </div>
            )}
            <button className="btn" style={{ marginTop: 18, width: '100%', justifyContent: 'center' }} onClick={onBack}>{t('Back to my dashboard')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
