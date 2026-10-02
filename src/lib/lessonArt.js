import { useBandValue } from './gradeBand.js'

const BASE = import.meta.env.BASE_URL

// Lesson card art by grade band (2026-10-02). 2-3 keeps the woodland set
// (public/lessons/m<module>-<lesson>.jpg); 4-5 and up get the older Astra-world
// set in public/lessons/45/ — Astra, Pip, Moss, Briar and Wren, twilight
// forest and crystal caverns. 6-8 borrows 4-5's set until it has its own.
export function lessonArtSrc(key, band) {
  const older = band && band !== '2-3' && /^m\d-\d+$/.test(key || '')
  return `${BASE}lessons/${older ? '45/' : ''}${key}.jpg`
}

export function useLessonArt() {
  const band = useBandValue()
  return (key) => lessonArtSrc(key, band)
}
