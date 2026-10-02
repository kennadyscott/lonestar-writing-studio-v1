import { useBandValue } from './gradeBand.js'

const BASE = import.meta.env.BASE_URL

// Lesson card art by grade band (2026-10-02):
// 2-3  public/lessons/m<module>-<lesson>.jpg - the woodland set
// 4-5  public/lessons/45/ - the Astra cast (Astra, Pip, Moss, Briar, Wren),
//      twilight forest and crystal caverns
// 6-8  public/lessons/68/ - no characters (her call): places and object
//      close-ups, Astra only as a trace. 9-12 borrows it for now.
const BAND_DIR = { '4-5': '45/', '6-7': '68/', '8': '68/', '6-8': '68/', '9-12': '68/' }
export function lessonArtSrc(key, band) {
  const dir = /^m\d-\d+$/.test(key || '') ? (BAND_DIR[band] || '') : ''
  return `${BASE}lessons/${dir}${key}.jpg`
}

export function useLessonArt() {
  const band = useBandValue()
  return (key) => lessonArtSrc(key, band)
}
