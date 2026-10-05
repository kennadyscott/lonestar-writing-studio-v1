import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useT } from '../lib/i18n/index.jsx'

/* Coins earned, celebrated (2026-10-05). Her ask: "when students complete something and they
 * earn coins, they need a little pop up or coins falling or something that shows they earned
 * those coins", then "Can you use higgsfield to create it so it is cool/interesting/interactive".
 *
 * Every coin the platform pays lands in state.coinEvents, so useCoinWatch watches that list.
 * New coins drop in a painted treasure chest (Higgsfield art, public/coins/). The student taps
 * it, or it opens by itself: the Higgsfield clip plays the lid bursting open, and as the coins
 * spray out, painted coins fly out of the chest into the coin wallet in the top bar, which
 * counts up as they land. api.js nudges a state refresh whenever a response carries coins. */

const BASE = import.meta.env.BASE_URL || '/'
const COIN_IMG = BASE + 'coins/coin.png'
const CHEST_CLIP = BASE + 'coins/chest-open.mp4'
const CHEST_POSTER = BASE + 'coins/chest-poster.jpg'
const AUTO_OPEN_MS = 2800 // opens itself if nobody taps
const LID_OPEN_S = 1.35 // where the lid flies open in the clip

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
  const balance = state?.students?.find((s) => s.id === meId)?.coins ?? 0
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
      from: prev ? prev.from : balance - total, // the wallet shows this until the coins land
    }))
  }, [events, meId]) // eslint-disable-line react-hooks/exhaustive-deps
  return [burst, useCallback(() => setBurst(null), [])]
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function CoinBurst({ burst, onDone, onWallet }) {
  const t = useT()
  const [phase, setPhase] = useState('ready') // ready -> open -> leaving
  const vidRef = useRef(null)
  const chestRef = useRef(null)
  const timers = useRef([])
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout); timers.current = []
    onWallet?.(null)
    onDone?.()
  }, [onDone, onWallet])

  // coins fly from the chest to the wallet in the top bar; the wallet counts up as each lands
  const flyCoins = useCallback(() => {
    if (!burst) return
    const from = chestRef.current?.getBoundingClientRect()
    const wallet = document.querySelector('.coin-wallet')
    const to = wallet?.getBoundingClientRect()
    const n = Math.max(6, Math.min(14, Math.round(burst.total / 3)))
    const sx = from ? from.left + from.width / 2 : window.innerWidth / 2
    const sy = from ? from.top + from.height * 0.42 : 140
    const tx = to ? to.left + 16 : window.innerWidth - 120
    const ty = to ? to.top + to.height / 2 : 24
    let landed = 0
    for (let i = 0; i < n; i++) {
      const el = document.createElement('img')
      el.src = COIN_IMG; el.alt = ''; el.className = 'coin-fly'
      document.body.appendChild(el)
      // fan out to the sides of the chest (it sits near the top, so a tall arc would leave the screen)
      const ang = (-165 + (150 * i) / Math.max(1, n - 1)) * (Math.PI / 180)
      const r = 110 + ((i * 37) % 70)
      const px = sx + Math.cos(ang) * r, py = Math.max(60, sy + Math.sin(ang) * r * 0.45)
      const anim = el.animate([
        { transform: `translate(${sx - 18}px, ${sy - 18}px) scale(.4) rotate(0deg)`, opacity: 0 },
        { transform: `translate(${px - 18}px, ${py - 18}px) scale(1.05) rotate(${180 + i * 40}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${tx - 18}px, ${ty - 18}px) scale(.55) rotate(${540 + i * 40}deg)`, opacity: 1, offset: 0.92 },
        { transform: `translate(${tx - 18}px, ${ty - 18}px) scale(.3) rotate(${560 + i * 40}deg)`, opacity: 0 },
      ], { duration: 1150, delay: i * 70, easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'both' })
      anim.onfinish = () => {
        el.remove()
        landed++
        onWallet?.(burst.from + Math.round((burst.total * landed) / n))
        if (wallet) { wallet.classList.remove('bump'); void wallet.offsetWidth; wallet.classList.add('bump') }
      }
    }
  }, [burst, onWallet])

  const open = useCallback(() => {
    if (phase !== 'ready') return
    timers.current.forEach(clearTimeout); timers.current = []
    setPhase('open')
    // the coins leave the chest when the clip's lid opens, on the clip's own clock, so a slow
    // device that starts the video late still shows them spraying out of an open chest
    let flown = false
    const fly = () => { if (!flown) { flown = true; flyCoins() } }
    const leave = () => { setPhase('leaving'); later(finish, 500) }
    const v = vidRef.current
    if (v) {
      v.muted = true
      const watch = () => {
        if (v.currentTime >= LID_OPEN_S) fly()
        else if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(watch)
      }
      if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(watch)
      v.addEventListener('timeupdate', () => { if (v.currentTime >= LID_OPEN_S) fly() }) // backup when frame callbacks run slow
      v.addEventListener('ended', () => later(leave, 250), { once: true })
      v.addEventListener('error', () => { fly(); later(leave, 1600) }, { once: true })
      v.currentTime = 0
      v.play().catch(() => { fly(); later(leave, 1600) })
    } else { fly(); later(leave, 1600) }
    later(fly, 4500)     // the clip never got going: still pay the coins out
    later(leave, 9000)   // and never leave the chest on screen
  }, [phase, flyCoins, finish]) // eslint-disable-line react-hooks/exhaustive-deps

  // a new burst starts fresh: drop the chest in, open it by itself if nobody taps
  useEffect(() => {
    if (!burst) return
    setPhase('ready')
    if (reduced()) {
      later(() => onWallet?.(burst.from + burst.total), 300)
      later(finish, 2600)
    } else later(() => document.querySelector('.coin-chest-btn')?.click(), AUTO_OPEN_MS)
    return () => { timers.current.forEach(clearTimeout); timers.current = [] }
  }, [burst?.key]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!burst) return null
  return (
    <div className={'coin-burst ' + phase} key={burst.key} aria-live="polite">
      <div className="coin-stage">
        <button ref={chestRef} className="coin-chest-btn" onClick={open} aria-label={t('Open your chest: +{n} coins', { n: burst.total })}>
          <video ref={vidRef} className="coin-chest" src={CHEST_CLIP} poster={CHEST_POSTER} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />
          {phase === 'ready' && <span className="coin-tap">{t('Tap to open!')}</span>}
        </button>
        <div className="coin-words">
          <span className="coin-card-total"><img src={COIN_IMG} alt="" className="coin-card-disc" />+{burst.total} <small>{t('coins')}</small></span>
          {burst.lines.map((l, i) => (
            <span key={l.label + i} className="coin-card-line">{t(l.label)}{burst.lines.length > 1 ? ` · +${l.coins}` : ''}</span>
          ))}
        </div>
        <button className="coin-skip" onClick={finish} aria-label={t('Close')}>×</button>
      </div>
    </div>
  )
}
