import React, { useEffect, useRef, useState } from 'react'
import { useT } from '../lib/i18n/index.jsx'
import { Directions } from './Scaffold.jsx'

/*
 * Second-grade writing help (Kennady, 2026-10-14: "I do want them typing though - they need to be typing to practice. But let's
 * give them a speech to text option occasionally"). Typing stays the way to write: the starters and picture words are hints to
 * read, not buttons that write for them. "Say a sentence" turns one spoken sentence into text, a couple of times per piece.
 */

const STARTERS = ['I like…', 'One day…', 'First,…', 'Then…', 'Because…', 'At the end…']
const PICTURE_WORDS = [['😀', 'happy'], ['😢', 'sad'], ['😮', 'surprised'], ['🏫', 'school'], ['🏠', 'home'], ['🐶', 'dog'], ['☀️', 'sunny'], ['🌧️', 'rainy']]
const SAYS_PER_PIECE = 2

const sentenceCount = (text) => (String(text || '').match(/[^.!?]*[a-z][^.!?]*[.!?]+/gi) || []).length

/** The goal for a second-grade piece (2-4 sentences), the count so far, and the hints. */
export function WritingHelp({ text }) {
  const t = useT()
  const n = sentenceCount(text)
  return (
    <div className="g2-help">
      <div className={'g2-goal' + (n >= 2 ? ' ok' : '')}>
        <Directions text="Write 2 to 4 sentences." inline />
        <b>{n >= 2 ? '✓ ' : ''}{t('{n} of 4 sentences', { n: Math.min(n, 4) })}</b>
      </div>
      <div className="g2-hints">
        <span className="g2-hints-label">{t('Start with:')}</span>
        {STARTERS.map((s) => <span key={s} className="g2-chip">{t(s)}</span>)}
      </div>
      <div className="g2-hints">
        <span className="g2-hints-label">{t('Words you can use:')}</span>
        {PICTURE_WORDS.map(([e, w]) => <span key={w} className="g2-chip pic"><span aria-hidden>{e}</span> {t(w)}</span>)}
      </div>
    </div>
  )
}

const Recognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null

/** Say one sentence and it is typed in for you, up to twice per piece (kept per piece in this browser). */
export function SayASentence({ pieceKey, onText, disabled = false }) {
  const t = useT()
  const key = 'lscr.g2says.' + pieceKey
  const [used, setUsed] = useState(() => { try { return Number(localStorage.getItem(key)) || 0 } catch { return 0 } })
  const [listening, setListening] = useState(false)
  const [note, setNote] = useState('')
  const rec = useRef(null)
  useEffect(() => () => { try { rec.current?.abort() } catch { /* fine */ } }, [])
  if (!Recognition) return null
  const left = Math.max(0, SAYS_PER_PIECE - used)

  function start() {
    if (listening || left <= 0 || disabled) return
    const r = new Recognition()
    r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 1
    rec.current = r
    setNote(''); setListening(true)
    r.onresult = (e) => {
      let said = (e.results?.[0]?.[0]?.transcript || '').trim()
      if (!said) return
      said = said[0].toUpperCase() + said.slice(1)
      if (!/[.!?]$/.test(said)) said += '.'
      onText(said)
      const n = used + 1
      setUsed(n); try { localStorage.setItem(key, String(n)) } catch { /* fine */ }
      setNote(t('Now read it and fix anything that is not right.'))
    }
    r.onerror = () => setNote(t("I didn't catch that. Try again, or type it."))
    r.onend = () => setListening(false)
    try { r.start() } catch { setListening(false) }
  }

  return (
    <span className="g2-say">
      <button type="button" className={'g2-say-btn' + (listening ? ' on' : '')} disabled={disabled || (left <= 0 && !listening)} onClick={listening ? () => rec.current?.stop() : start}>
        <span aria-hidden>🎤</span> {listening ? t('Listening… tap when done') : left > 0 ? t('Say a sentence') : t('Keep typing!')}
        {!listening && left > 0 && <small>{t('{n} left', { n: left })}</small>}
      </button>
      {note && <span className="g2-say-note">{note}</span>}
    </span>
  )
}
