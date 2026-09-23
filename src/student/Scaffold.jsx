import React, { useState } from 'react'
import { useT, useLang } from '../lib/i18n/index.jsx'
import { useBridgeLevel } from '../lib/bridgeContext.jsx'
import { levelOf } from '../lib/languageBridge.js'
import { markTerms, simplerFor } from '../lib/scaffold.js'
import { canSpeak, rateFor, readsAloud, splitSentences, useSpeech } from '../lib/readAloud.js'

/*
 * The scaffolding primitives every student surface can adopt.
 *
 * All three read the level from context, so a surface needs no props and no
 * knowledge of the bridge to take part. With no level set they render exactly
 * what they were given, which is what keeps adoption safe.
 */

/* ---- say(): the level-appropriate, translated string ---- */
export function useSay() {
  const t = useT()
  const level = useBridgeLevel()
  // simplerFor falls through to the original when there is no simpler
  // version, and t() falls through to English when there is no translation,
  // so a Beginning Spanish reader gets simple Spanish where we wrote one and
  // the real sentence everywhere else.
  return (text, vars) => t(simplerFor(level, text), vars)
}

/* ---- Glossed: any string, with its academic words tappable ---- */
function Term({ part }) {
  const t = useT()
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  // Terms in the right half of the screen open their popup leftward, so it
  // is not clipped by a sidebar or the viewport edge.
  const [flip, setFlip] = useState(false)
  const g = part.term
  const toggle = (e) => {
    e.stopPropagation(); e.preventDefault()
    try { setFlip(e.currentTarget.getBoundingClientRect().left > window.innerWidth * 0.55) } catch {}
    setOpen((v) => !v)
  }
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {/* A term can sit inside a clickable tile. The tap is for the meaning,
          not the tile, so it must not bubble. */}
      <button onClick={toggle} title={t('Tap for what this word means')}
        style={{ font: 'inherit', color: 'inherit', background: 'transparent', padding: 0,
          borderBottom: '1.5px dotted #0a7dba', cursor: 'help' }}>
        {part.text}
      </button>
      {open && (
        <span style={{ position: 'absolute', zIndex: 40, top: 'calc(100% + 5px)', ...(flip ? { right: 0 } : { left: 0 }), width: 220,
          background: '#fff', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px',
          boxShadow: '0 8px 22px rgba(13,47,85,.18)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--ink)', lineHeight: 1.4 }}>{g.kid}</span>
          {g.es && <span style={{ display: 'block', fontSize: 11.5, color: '#0a7dba', fontWeight: 700, marginTop: 4 }}>{g.es}</span>}
        </span>
      )}
    </span>
  )
}

/*
 * Wrap any text so its academic words can be tapped. Off above Advanced, per
 * the matrix: vocabulary support is "nuance and precision only" there, which
 * is not a word list. Marks the first occurrence of each term only.
 */
export function Glossed({ children, text, force = false }) {
  const level = useBridgeLevel()
  const raw = text != null ? text : (typeof children === 'string' ? children : null)
  const on = force || level === 'beginning' || level === 'intermediate'
  if (!on || raw == null) return <>{children ?? text}</>
  return <>{markTerms(raw).map((p, i) => (p.term ? <Term key={i} part={p} /> : <React.Fragment key={i}>{p.text}</React.Fragment>))}</>
}

/* ---- Speak: read any text aloud ---- */
export function Speak({ text, lang, compact = true, style }) {
  const t = useT()
  const { lang: uiLang } = useLang()
  const level = useBridgeLevel()
  const { speak, stop, speaking } = useSpeech()
  if (!canSpeak() || !readsAloud(level) || !text) return null
  const lv = levelOf(level)
  const color = lv ? lv.color : '#0a7dba'
  // A translated direction is spoken in the language it is shown in; anything
  // left in English is spoken in English.
  const segments = splitSentences(text).map((s) => ({ text: s, lang: lang || uiLang }))
  return (
    <button onClick={() => (speaking ? stop() : speak(segments, { rate: rateFor(level) }))}
      title={speaking ? t('Stop reading') : t('Read this out loud to me')}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, verticalAlign: 'middle',
        background: speaking ? color : '#fff', color: speaking ? '#fff' : color,
        border: `1.5px solid ${color}66`, borderRadius: 999,
        padding: compact ? '3px 9px' : '6px 13px', fontSize: compact ? 11 : 12.5, fontWeight: 800, ...style }}>
      <span aria-hidden>{speaking ? '■' : '▶'}</span>
      {speaking ? t('Stop') : t('Listen')}
    </button>
  )
}

/*
 * A block of directions, scaffolded. This is the shape almost every surface
 * needs: the sentence at the right level, its academic words tappable, and a
 * way to hear it. With no level set it is just the text.
 */
export function Directions({ text, vars, style, inline = false, children }) {
  const say = useSay()
  const level = useBridgeLevel()
  const said = text != null ? say(text, vars) : null
  if (!level || said == null) return <span style={style}>{children ?? said}</span>
  return (
    <span style={{ display: inline ? 'inline' : 'flex', gap: 8, alignItems: 'flex-start', ...style }}>
      <span style={{ flex: inline ? undefined : 1, minWidth: 0 }}><Glossed text={said} /></span>
      <Speak text={said} />
    </span>
  )
}

export default Directions
