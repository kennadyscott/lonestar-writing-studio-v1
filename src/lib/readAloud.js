import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * Read-aloud — support area 3, "comprehensible input".
 *
 * Uses the browser's own speech synthesis, so the demo keeps working with no
 * network, no key and no vendor. The matrix sets the behaviour:
 *   Beginning    — slowed, and the sentence being read is highlighted
 *   Intermediate — normal speed, optional, key words highlighted
 *   Advanced     — nothing at all
 *
 * Everything is spoken one SENTENCE at a time rather than as one long
 * utterance. That is what makes sentence-by-sentence highlighting possible,
 * and it also sidesteps the long-utterance stall in Chromium.
 */

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

// Slower for a student with less English, never slower than is listenable.
export const RATE = { beginning: 0.8, intermediate: 0.95 }
export const rateFor = (level) => RATE[level] || 1
// Advanced is deliberately absent from the matrix, so no control is offered.
export const readsAloud = (level) => level === 'beginning' || level === 'intermediate'

export const VOICE_LANG = { en: 'en-US', es: 'es-MX' }

/* Split into sentences without lookbehind, which older Safari rejects. */
export function splitSentences(text) {
  const parts = String(text || '').match(/[^.!?¿¡]+[.!?]*/g) || []
  return parts.map((s) => s.trim()).filter(Boolean)
}

let VOICES = []
function loadVoices() {
  if (!canSpeak()) return
  try { VOICES = window.speechSynthesis.getVoices() || [] } catch { VOICES = [] }
}
if (canSpeak()) {
  loadVoices()
  // Chromium populates the list asynchronously, so the first call is empty.
  try { window.speechSynthesis.addEventListener('voiceschanged', loadVoices) } catch {}
}

/* Prefer the exact locale, then any voice in that language, then nothing —
 * a null voice still speaks, using the platform default. */
export function pickVoice(langTag) {
  if (!VOICES.length) loadVoices()
  const base = langTag.split('-')[0]
  return VOICES.find((v) => v.lang === langTag)
    || VOICES.find((v) => v.lang && v.lang.replace('_', '-') === langTag)
    || VOICES.find((v) => v.lang && v.lang.toLowerCase().startsWith(base))
    || null
}

/*
 * Speak a list of { text, lang } segments in order.
 *
 * `index` is the segment being spoken, for highlighting. Each segment carries
 * its own language because a Beginning student reads translated directions in
 * Spanish and the grade-level prompt in English on the same screen.
 */
export function useSpeech() {
  const [index, setIndex] = useState(-1)
  const [speaking, setSpeaking] = useState(false)
  const alive = useRef(true)
  const utter = useRef(null)      // keeps the utterance from being collected
  const guard = useRef(null)      // fires if onend never arrives
  const runId = useRef(0)

  const clearGuard = () => { if (guard.current) { clearTimeout(guard.current); guard.current = null } }

  const stop = useCallback(() => {
    runId.current += 1
    clearGuard()
    try { window.speechSynthesis.cancel() } catch {}
    setSpeaking(false)
    setIndex(-1)
  }, [])

  useEffect(() => () => { alive.current = false; runId.current += 1; clearGuard(); try { window.speechSynthesis.cancel() } catch {} }, [])

  const speak = useCallback((segments, { rate = 1 } = {}) => {
    if (!canSpeak() || !segments?.length) return
    runId.current += 1
    const run = runId.current
    clearGuard()
    try { window.speechSynthesis.cancel() } catch {}
    setSpeaking(true)

    let i = 0
    const next = () => {
      if (!alive.current || run !== runId.current) return
      if (i >= segments.length) { clearGuard(); setSpeaking(false); setIndex(-1); return }
      const seg = segments[i]
      setIndex(i)
      const u = new SpeechSynthesisUtterance(seg.text)
      u.lang = VOICE_LANG[seg.lang] || VOICE_LANG.en
      u.rate = rate
      const v = pickVoice(u.lang)
      if (v) u.voice = v
      let done = false
      const advance = () => { if (done) return; done = true; clearGuard(); i += 1; next() }
      u.onend = advance
      u.onerror = advance
      utter.current = u
      // If the engine stalls and never reports back, move on anyway rather
      // than leaving the student staring at a frozen highlight.
      const words = seg.text.split(/\s+/).length
      guard.current = setTimeout(advance, Math.ceil((words / (2.4 * rate)) * 1000) + 3000)
      try { window.speechSynthesis.speak(u) } catch { advance() }
    }
    next()
  }, [])

  return { speak, stop, speaking, index }
}
