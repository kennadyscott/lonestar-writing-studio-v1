import { createContext, useContext, useEffect, useState } from 'react'

// Prototype switch: which grade band the demo is dressed for. Stamped on <html>
// as data-band so any page can restyle per band. ?band=2-3 links straight to one.
// Bands follow the Astra framework (her note, 2026-10-02: "bring 4th grade over"):
// 2-3, 4-5 (the baseline), 6-8, 9-12.
export const BANDS = ['2-3', '4-5', '6-8', '9-12']
const KEY = 'lscr.band'

function initial() {
  try {
    const q = new URLSearchParams(location.search).get('band')
    if (BANDS.includes(q)) return q
    const s = localStorage.getItem(KEY)
    if (BANDS.includes(s)) return s
  } catch {}
  return '4-5'
}

export function useBand() {
  const [band, setBand] = useState(initial)
  useEffect(() => {
    document.documentElement.dataset.band = band
    try { localStorage.setItem(KEY, band) } catch {}
  }, [band])
  return [band, setBand]
}

export const BandContext = createContext('4-5')
export const useBandValue = () => useContext(BandContext)
