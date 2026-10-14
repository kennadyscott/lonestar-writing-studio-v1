import { createContext, useContext, useEffect, useState } from 'react'

// Prototype switch: which grade band the demo is dressed for. Stamped on <html>
// as data-band so any page can restyle per band. ?band=2-3 links straight to one.
// Content bands follow the Astra framework (her note, 2026-10-02: "bring 4th
// grade over"): 2-3, 4-5 (the baseline), 6-8, 9-12. The LOOK splits grade 8
// off (her note, same day: "Move 8th grade into the 9-12 band aesthetically.
// They will receive the same content as the 6th - 8th"), so the switch has a
// separate 8 button: 6-8 content, high-school Writer's Studio look.
// 3rd grade moved up with 4th and 5th (her note, 2026-10-14: "I want to lump 3rd grade up with 4th & 5th"), so 2nd grade stands
// alone and can be made different: bands 2 · 3-5 · 6-7 · 8 · 9-12. Old '2-3' / '4-5' links and saved choices still work.
export const BANDS = ['2', '3-5', '6-7', '8', '9-12']
// which look a switch position wears (CSS keys on data-band = this); 3-5 wears the 4-5 look
export const lookBand = (b) => (b === '8' || b === '9-12' ? '9-12' : b === '6-7' ? '6-8' : b === '3-5' ? '4-5' : b)
// which content band it reads from
export const contentBand = (b) => (b === '6-7' || b === '8' ? '6-8' : b === '3-5' ? '4-5' : b === '2' ? '2-3' : b)
/** Second grade: its own look and supports. */
export const isGrade2 = (b) => b === '2'
const LEGACY = { '6-8': '6-7', '2-3': '2', '4-5': '3-5' }
const KEY = 'lscr.band'

function initial() {
  try {
    const q = new URLSearchParams(location.search).get('band')
    if (BANDS.includes(q)) return q
    if (LEGACY[q]) return LEGACY[q]
    const s = localStorage.getItem(KEY)
    if (BANDS.includes(s)) return s
    if (LEGACY[s]) return LEGACY[s]
  } catch {}
  return '3-5'
}

export function useBand() {
  const [band, setBand] = useState(initial)
  useEffect(() => {
    document.documentElement.dataset.band = lookBand(band)
    try { localStorage.setItem(KEY, band) } catch {}
  }, [band])
  return [band, setBand]
}

export const BandContext = createContext('3-5')
export const useBandValue = () => useContext(BandContext)
