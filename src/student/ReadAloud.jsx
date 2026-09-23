import React from 'react'
import { useT, useLang } from '../lib/i18n/index.jsx'
import { canSpeak, rateFor, readsAloud, splitSentences, useSpeech } from '../lib/readAloud.js'
import { levelOf } from '../lib/languageBridge.js'

/*
 * The listen button, and a block of text that highlights the sentence being
 * read. Both go quiet when the browser has no speech synthesis rather than
 * offering a control that does nothing.
 */

export function ListenButton({ segments, level, speaking, onPlay, onStop, compact = false }) {
  const t = useT()
  const lv = levelOf(level)
  if (!canSpeak() || !readsAloud(level) || !segments?.length) return null
  const color = lv ? lv.color : '#0a7dba'
  return (
    <button onClick={() => (speaking ? onStop() : onPlay())}
      title={speaking ? t('Stop reading') : t('Read this out loud to me')}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
        background: speaking ? color : '#fff', color: speaking ? '#fff' : color,
        border: `1.5px solid ${color}66`, borderRadius: 999,
        padding: compact ? '4px 10px' : '6px 13px', fontSize: compact ? 11.5 : 12.5, fontWeight: 800 }}>
      <span aria-hidden>{speaking ? '■' : '▶'}</span>
      {speaking ? t('Stop') : t('Listen')}
    </button>
  )
}

/*
 * One passage, read sentence by sentence. Beginning gets the highlight because
 * the matrix asks for sentence-by-sentence tracking; Intermediate just gets
 * the audio, with its key words already bolded by the caller.
 */
export function ReadAloudText({ text, lang = 'en', level, style, highlight = true, children }) {
  const { speak, stop, speaking, index } = useSpeech()
  const { lang: uiLang } = useLang()
  const sentences = splitSentences(text)
  const on = canSpeak() && readsAloud(level)
  const segments = sentences.map((s) => ({ text: s, lang }))
  const track = highlight && level === 'beginning'
  const lv = levelOf(level)

  if (!on) return <div style={style}>{children ?? text}</div>

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ ...style, flex: 1, minWidth: 0 }}>
        {track
          ? sentences.map((s, i) => (
              <span key={i} style={{
                background: i === index ? `${lv.color}2e` : 'transparent',
                borderRadius: 4, padding: '1px 2px', transition: 'background .15s',
                boxShadow: i === index ? `0 0 0 1px ${lv.color}55` : 'none' }}>
                {s}{i < sentences.length - 1 ? ' ' : ''}
              </span>
            ))
          : (children ?? text)}
      </div>
      <ListenButton segments={segments} level={level} speaking={speaking}
        onPlay={() => speak(segments, { rate: rateFor(level) })} onStop={stop} compact />
      {/* uiLang is read so the control re-renders when the interface language
          flips, which changes the button's own wording. */}
      <span hidden>{uiLang}</span>
    </div>
  )
}

export default ReadAloudText
