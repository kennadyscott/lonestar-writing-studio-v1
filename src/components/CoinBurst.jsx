import React, { useEffect, useRef, useState } from 'react'
import { useT } from '../lib/i18n/index.jsx'

/* Coins earned, celebrated (2026-10-05). Her ask: "when students complete something and they
 * earn coins, they need a little pop up or coins falling or something that shows they earned
 * those coins". Every coin the platform pays lands in state.coinEvents, so this watches that
 * list: any event it has not seen before plays a shower of coins and a "+N coins" card that
 * says what earned them. api.js nudges a state refresh whenever a response carries coins, so
 * the card shows the moment the coins are paid. */

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

// fixed spots so the shower looks the same every time and never jumps between renders
const DROPS = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  delay: ((i * 53) % 60) / 100,
  dur: 1.25 + ((i * 29) % 50) / 100,
  size: 18 + ((i * 17) % 14),
  spin: (i % 2 ? 1 : -1) * (240 + ((i * 41) % 300)),
}))

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
    setBurst({ key: fresh.map((e) => e.id).join('|'), total: fresh.reduce((a, e) => a + e.coins, 0), lines })
  }, [events, meId])
  return [burst, () => setBurst(null)]
}

export default function CoinBurst({ burst, onDone }) {
  const t = useT()
  useEffect(() => {
    if (!burst) return
    const id = setTimeout(onDone, 3400)
    return () => clearTimeout(id)
  }, [burst, onDone])
  if (!burst) return null
  return (
    <div className="coin-burst" key={burst.key} aria-live="polite">
      <div className="coin-rain" aria-hidden="true">
        {DROPS.map((d, i) => (
          <span key={i} className="coin-drop" style={{ left: d.x + '%', width: d.size, height: d.size, animationDelay: d.delay + 's', animationDuration: d.dur + 's', '--spin': d.spin + 'deg' }} />
        ))}
      </div>
      <button className="coin-card" onClick={onDone} aria-label={t('+{n} coins', { n: burst.total })}>
        <span className="coin-card-disc" aria-hidden="true" />
        <span className="coin-card-words">
          <span className="coin-card-total">+{burst.total} <small>{t('coins')}</small></span>
          {burst.lines.map((l) => (
            <span key={l.label} className="coin-card-line">{t(l.label)}{burst.lines.length > 1 ? ` · +${l.coins}` : ''}</span>
          ))}
        </span>
      </button>
    </div>
  )
}
