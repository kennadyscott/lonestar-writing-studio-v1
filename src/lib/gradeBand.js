import { createContext, useContext, useEffect, useState } from 'react'

// Prototype switch: which grade band the demo is dressed for. Stamped on <html>
// as data-band so any page can restyle per band. ?band=2-4 links straight to one.
export const BANDS = ['2-4', '5-7', '8-12']
const KEY = 'lscr.band'

function initial() {
  try {
    const q = new URLSearchParams(location.search).get('band')
    if (BANDS.includes(q)) return q
    const s = localStorage.getItem(KEY)
    if (BANDS.includes(s)) return s
  } catch {}
  return '5-7'
}

export function useBand() {
  const [band, setBand] = useState(initial)
  useEffect(() => {
    document.documentElement.dataset.band = band
    try { localStorage.setItem(KEY, band) } catch {}
  }, [band])
  return [band, setBand]
}

export const BandContext = createContext('5-7')
export const useBandValue = () => useContext(BandContext)
