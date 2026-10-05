import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '../lib/i18n/index.jsx'

/* Coins earned, celebrated (2026-10-05). Her ask: "when students complete something and they
 * earn coins, they need a little pop up or coins falling or something that shows they earned
 * those coins". She tried a Higgsfield treasure chest to tap open and a top-bar coin wallet,
 * then: "I just want like coins to rain down and it tells them they earned coins. We don't
 * need the coin counter in the top." So: the ClassCade coin (public/coins/coin.svg, drawn to match
 * her ClassCade screenshot) rains down and a card says how many coins and what earned them.
 * Every coin the platform pays lands in state.coinEvents, so useCoinWatch watches that list;
 * api.js nudges a state refresh whenever a response carries coins. */

const BASE = import.meta.env.BASE_URL || '/'
const COIN_IMG = BASE + 'coins/coin.svg' // the ClassCade coin, drawn to match her screenshot

const LABELS = {
  fluency_round: 'Fluency tile stamped',
  fluency_line: 'Bingo! 3 in a row',
  fluency_grid: 'Fluency card cleared',
  typing_round: 'Typing round',
  proof_job: 'Lit Labyrinth job',
  quick_write: 'Finished a Quick Write',
  published_piece: 'Published a finished piece',
  daily_challenge: 'Daily Revision Challenge',
  first_revision: 'First revision',
  goal_achieved: 'Goal reached',
  held_the_pen: 'Held the pen',
  trait_growth: 'Grew a writing trait',
}

export function useCoinWatch(state, meId) {
  const seen = useRef(null)
  const [burst, setBurst] = useState(null)
  const events = state?.coinEvents
  useEffect(() => {
    if (!events) return
    const mine = events.filter((e) => e.studentId === meId)
    if (seen.current == null) { seen.current = new Set(mine.map((e) => e.id)); return }
    const fresh = mine.filter((e) => !seen.current.has(e.id) && (e.coins || 0) > 0)
    // a demo reset swaps the whole list: start over quietly rather than celebrate old coins
    if (fresh.length > 3 && fresh.length === mine.length) { seen.current = new Set(mine.map((e) => e.id)); return }
    mine.forEach((e) => seen.current.add(e.id))
    if (!fresh.length) return
    const lines = []
    for (const e of fresh) {
      const label = LABELS[e.type] || 'Coins earned'
      const row = lines.find((l) => l.label === label)
      if (row) row.coins += e.coins
      else lines.push({ label, coins: e.coins })
    }
    const total = fresh.reduce((a, e) => a + e.coins, 0)
    setBurst((prev) => ({
      key: fresh.map((e) => e.id).join('|'),
      total: total + (prev ? prev.total : 0),
      lines: prev ? [...prev.lines, ...lines] : lines,
    }))
  }, [events, meId]) // eslint-disable-line react-hooks/exhaustive-deps
  return [burst, useCallback(() => setBurst(null), [])]
}

// fixed spots so the shower looks the same every time and never jumps between renders
const DROPS = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  delay: ((i * 53) % 70) / 100,
  dur: 1.4 + ((i * 29) % 60) / 100,
  size: 26 + ((i * 17) % 22),
  spin: (i % 2 ? 1 : -1) * (200 + ((i * 41) % 260)),
  sway: ((i * 23) % 60) - 30,
}))

export default function CoinBurst({ burst, onDone }) {
  const t = useT()
  useEffect(() => {
    if (!burst) return
    const id = setTimeout(onDone, 3600)
    return () => clearTimeout(id)
  }, [burst, onDone])
  if (!burst) return null
  return (
    <div className="coin-burst" aria-live="polite">
      <div className="coin-rain" aria-hidden="true">
        {DROPS.map((d, i) => (
          <img key={i} src={COIN_IMG} alt="" className="coin-drop"
            style={{ left: d.x + '%', width: d.size, height: d.size, animationDelay: d.delay + 's', animationDuration: d.dur + 's', '--spin': d.spin + 'deg', '--sway': d.sway + 'px' }} />
        ))}
      </div>
      <button className="coin-card" onClick={onDone} aria-label={t('+{n} coins', { n: burst.total })}>
        <img src={COIN_IMG} alt="" className="coin-card-disc" />
        <span className="coin-card-words">
          <span className="coin-card-total">+{burst.total} <small>{t('coins')}</small></span>
          {burst.lines.map((l, i) => (
            <span key={l.label + i} className="coin-card-line">{t(l.label)}{burst.lines.length > 1 ? ` · +${l.coins}` : ''}</span>
          ))}
        </span>
      </button>
    </div>
  )
}
