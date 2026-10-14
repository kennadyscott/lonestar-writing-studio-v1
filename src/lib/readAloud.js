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

/*
 * Pick the most natural voice this device has (Kennady, 2026-10-14: "That robot AI voice is awful"). The browser lists voices
 * in no useful order; on a Mac the first US voice is the old compact Samantha, and the list is full of novelty voices (Zarvox,
 * Bells, Bad News). Rank instead: the neural "Natural"/"Online" voices (Edge, Windows), then Google's (Chrome, Chromebooks),
 * then Apple's downloaded Premium/Enhanced voices and Siri, then the plainer system voices. Novelty voices are never chosen.
 */
const NOVELTY = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|rocko|eddy|flo|reed|sandy|shelley)\b/i
function voiceScore(v, langTag) {
  const name = v.name || ''
  const lang = (v.lang || '').replace('_', '-')
  if (NOVELTY.test(name)) return -1
  let s = 0
  if (/natural/i.test(name)) s += 100
  else if (/online/i.test(name) && /microsoft/i.test(name)) s += 90
  else if (/^google/i.test(name)) s += 80
  else if (/premium/i.test(name)) s += 75
  else if (/enhanced|siri/i.test(name)) s += 65
  else if (/\b(ava|zoe|allison|susan|nathan|evan|tom|aria|jenny|guy|samantha)\b/i.test(name)) s += 20
  if (/\b(ava|aria|jenny|zoe|allison|samantha)\b/i.test(name)) s += 5 // a warm, clear voice for young readers
  if (lang === langTag) s += 10
  return s
}
const VOICE_PICK_KEY = 'lscr.voice'
export function pickVoice(langTag) {
  if (!VOICES.length) loadVoices()
  const base = langTag.split('-')[0]
  const inLang = VOICES.filter((v) => v.lang && v.lang.toLowerCase().startsWith(base))
  try { // a voice chosen on the voice sampler page wins, if this device has it
    const chosen = localStorage.getItem(VOICE_PICK_KEY)
    const hit = chosen && inLang.find((v) => v.name === chosen)
    if (hit) return hit
  } catch { /* fine */ }
  let best = null, bestScore = -1
  for (const v of inLang) { const sc = voiceScore(v, langTag); if (sc > bestScore) { best = v; bestScore = sc } }
  return best
}
export const rankedVoices = (langTag = 'en-US') => {
  if (!VOICES.length) loadVoices()
  const base = langTag.split('-')[0]
  return VOICES.filter((v) => v.lang && v.lang.toLowerCase().startsWith(base) && voiceScore(v, langTag) >= 0)
    .sort((a, b) => voiceScore(b, langTag) - voiceScore(a, langTag))
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

/*
 * Second grade reads aloud by default (her note, 2026-10-14). Directions that appear on a screen queue themselves here; a moment
 * later they are spoken in order, once each. Browsers only allow speech after the student's first tap, which a screen change
 * already is. The student can turn it off (the 🔊 switch), and the choice is kept in this browser.
 */
const AUTO_KEY = 'lscr.g2read'
const autoListeners = new Set()
export const autoReadOn = () => { try { return localStorage.getItem(AUTO_KEY) !== '0' } catch { return true } }
export function setAutoRead(on) {
  try { localStorage.setItem(AUTO_KEY, on ? '1' : '0') } catch { /* fine */ }
  if (!on) { autoQueue = []; try { window.speechSynthesis.cancel() } catch { /* fine */ } }
  autoListeners.forEach((fn) => fn())
}
export const onAutoReadChange = (fn) => { autoListeners.add(fn); return () => autoListeners.delete(fn) }
let autoQueue = []
let autoTimer = null
const spokenRecently = new Map() // text -> time, so a re-render does not read the same words twice
export function autoRead(text, lang = 'en') {
  if (!canSpeak() || !text || !autoReadOn()) return
  const now = Date.now()
  if ((spokenRecently.get(text) || 0) > now - 8000) return
  spokenRecently.set(text, now)
  autoQueue.push({ text, lang })
  clearTimeout(autoTimer)
  autoTimer = setTimeout(() => {
    const items = autoQueue; autoQueue = []
    try { window.speechSynthesis.cancel() } catch { /* fine */ }
    for (const it of items) {
      for (const s of splitSentences(it.text)) {
        const u = new SpeechSynthesisUtterance(s)
        u.lang = VOICE_LANG[it.lang] || VOICE_LANG.en
        u.rate = 0.9
        const v = pickVoice(u.lang); if (v) u.voice = v
        try { window.speechSynthesis.speak(u) } catch { /* fine */ }
      }
    }
  }, 450)
}
