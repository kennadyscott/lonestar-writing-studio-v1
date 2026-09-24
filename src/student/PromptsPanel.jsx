import React, { useState } from 'react'
import { useT } from '../lib/i18n/index.jsx'
import { writingStreak } from '../lib/streak.js'
import { Directions } from './Scaffold.jsx'

/*
 * Free Write idea bank — two randomizers:
 *   🎲 Story sparks  — 30 fun situations to write about
 *   ✏️ First lines   — 30 opening lines to steal and run with
 * Display-only: the student still does all the writing.
 *
 * i18n: the SPARKS and FIRST_LINES banks below stay in English on purpose —
 * this platform teaches English writing, so the story prompt a student writes
 * from is the lesson content, not interface chrome. Only the UI around the
 * banks is translated.
 */

const SPARKS = [
  'Your pet suddenly starts talking — but only to complain.',
  'You find a backpack that packs itself with exactly what you will need tomorrow.',
  'The school vending machine starts giving out mysterious items instead of snacks.',
  'You wake up ten inches tall. Breakfast is now a mission.',
  'A dragon shows up at school and insists it is a new student.',
  'You get a text from your future self. It is a warning.',
  'The library book you opened starts reading YOU.',
  'Every time you sneeze, you swap places with someone in the room.',
  'Your shadow quit this morning. It left a note.',
  'You are elected mayor of your town for one week.',
  'The last slice of pizza holds a secret.',
  'Gravity turns off for exactly ten minutes.',
  'You find a door in your basement that was not there yesterday.',
  'Your grandma reveals she used to be a spy — and she needs your help one last time.',
  'All the teachers vanish at noon. The students must run the school.',
  'You inherit a llama farm. The llamas have strong opinions.',
  'Rain falls UP on Tuesdays now.',
  'You can suddenly hear what animals think — starting with the class hamster.',
  'Your video game character climbs out of the screen and asks for a snack.',
  'The new kid at school is definitely a robot. Probably.',
  'You find a remote control that can pause everyone but you.',
  'Your sandwich starts giving you life advice at lunch.',
  'The moon disappears for one night — and you saw who took it.',
  'You win a contest to live in a treehouse mansion for a year.',
  'You find socks that make you invisible — but only one of them works.',
  'The field trip bus takes a wrong turn into another century.',
  'Every lie you tell becomes true one hour later.',
  'A message in a bottle washes up with YOUR name on it.',
  'Your reflection waves at you first.',
  'The world’s grumpiest wizard moves in next door.',
]

const FIRST_LINES = [
  'The door at the end of the hallway had never been there before — until today.',
  'On my twelfth birthday, my grandmother finally told me the family secret.',
  'The last thing I expected to find in my locker was a map.',
  'Everyone in town knew the rule: never whistle after dark.',
  'The new substitute teacher never blinked. Not once.',
  "I found the note folded inside my library book: 'Don't trust the janitor.'",
  'It started raining on a Tuesday and did not stop for forty days.',
  'My little brother swears the goldfish spoke to him. Now I believe him.',
  'The day the power went out, we discovered what was living in the basement.',
  'Nobody ever won the summer talent show three years in a row. Until me.',
  'The spaceship was small, about the size of a shoebox, and it was parked on my desk.',
  'I was not supposed to open the box until my birthday. I opened it anyway.',
  'The town clock struck thirteen, and everything went quiet.',
  'My best friend moved away two years ago. Today she showed up at my door, soaking wet and out of breath.',
  'There are three rules at Camp Widgeon. I broke all of them before lunch.',
  'The elevator only has four buttons, but last night there were five.',
  "Grandpa's old radio only plays stations from the past. Tonight, it played tomorrow.",
  'When the tide went out, it took the whole ocean with it.',
  'I traded my sandwich for a marble. Best trade of my life.',
  'The wolf watched us from the tree line, patient as winter.',
  'Every family photo has the same stranger in the background.',
  "The message on the whiteboard was not there when class started: 'MEET ME AT NOON.'",
  'My shoes were on the wrong feet, my backpack was gone, and I was pretty sure this was not my house.',
  "The zoo called. They said my mom left something behind. We've never been to the zoo.",
  'At exactly 3:03 every afternoon, the hallway smells like cookies. No one knows why.',
  'I only meant to borrow the bike for an hour.',
  'The first snow of the year arrived in July.',
  'My name was on the trophy in the case — but I had never played a game in my life.',
  'The whisper came from inside the backpack.',
  'We were not lost. We just did not know where we were, which Dad said was different.',
]

// English is kept here; each display string is passed through t() at the render site.
const MODES = {
  spark: { bank: SPARKS, tag: 'Story spark', hint: 'No rules — twist it, break it, or ignore it. Your page, your story.', empty: '{n} fun story ideas are waiting. Spin one!' },
  line: { bank: FIRST_LINES, tag: 'First line', hint: 'Steal this line as your opener — then take the story anywhere.', empty: '{n} opening lines are ready. Spin one and keep it going!' },
}


// Quick sparks: one tap for a themed prompt, no spin.
const QUICK = [
  { key: 'spark', icon: '⭐', label: 'A surprising discovery', pick: (b) => b.findIndex((x) => /found|discover|door|box|map|attic/i.test(x)) },
  { key: 'spark', icon: '💭', label: 'What if…?', pick: (b) => b.findIndex((x) => /^what if/i.test(x)) },
  { key: 'line', icon: '❤️', label: "A moment I'll always remember", pick: () => -1 },
]

export default function PromptsPanel({ summary, streakDays = 0 }) {
  const t = useT()
  const streak = summary ? writingStreak(summary) : { days: streakDays, extendedToday: false }
  const [mode, setMode] = useState('spark')
  const [idx, setIdx] = useState(null)
  const [spins, setSpins] = useState(0)
  const m = MODES[mode]

  function spin(bankKey) {
    const key = bankKey || mode
    const bank = MODES[key].bank
    let next = Math.floor(Math.random() * bank.length)
    if (key === mode && next === idx) next = (next + 1) % bank.length
    if (key !== mode) setMode(key)
    setIdx(next)
    setSpins((s) => s + 1)
  }
  function quick(q) {
    const bank = MODES[q.key].bank
    const found = q.pick(bank)
    const next = found >= 0 ? found : Math.floor(Math.random() * bank.length)
    setMode(q.key); setIdx(next); setSpins((s) => s + 1)
  }
  function switchMode(k) { setMode(k); setIdx(null) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 22 }}>💡</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15.5, color: '#0d2f55' }}>{t('Inspiration Hub')}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            <Directions text="Need an idea? Spin for inspiration — then write wherever it takes you." />
          </div>
        </div>
        {streak.days > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff8e1', border: '1px solid var(--gold-line)', borderRadius: 999, padding: '5px 12px', flexShrink: 0 }}>
            <span style={{ fontSize: 15 }} aria-hidden="true">🔥</span>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0d2f55' }}>{t('{n} days', { n: streak.days })}</div>
              <div style={{ fontSize: 10, color: '#8a6d1a', fontWeight: 600 }}>{streak.extendedToday ? t('Extended today') : t('Keep it going!')}</div>
            </div>
          </div>
        )}
      </div>

      {/* mode toggle */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', background: '#eaf1f6', borderRadius: 10, padding: 3 }}>
          {[['spark', '🎲 Story Sparks'], ['line', '✏️ First Lines']].map(([k, label]) => (
            <button key={k} onClick={() => switchMode(k)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12.5, fontWeight: 800,
                background: mode === k ? '#fff' : 'transparent', color: mode === k ? 'var(--navy)' : 'var(--muted)',
                boxShadow: mode === k ? 'var(--shadow)' : 'none' }}>
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center' }}>
        {idx === null ? (
          <>
            {/* a plain glowing die; the ringed-planet dice was the space set */}
            <span aria-hidden style={{ width: 120, height: 120, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 64,
              background: 'radial-gradient(circle at 50% 42%, #fff8e1 0%, #e8f3f9 62%, #d6e9f3 100%)', boxShadow: '0 0 26px rgba(245,197,66,.45), inset 0 0 18px rgba(92,192,230,.25)' }}>🎲</span>
            <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 250, margin: 0, lineHeight: 1.5 }}>
              {t(m.empty, { n: m.bank.length })}
            </p>
            <button className="btn" style={{ padding: '12px 28px', fontSize: 15, borderRadius: 12 }} onClick={() => spin()}>
              {mode === 'spark' ? t('🎲 Spin a prompt') : t('✏️ Give me a first line')}
            </button>
          </>
        ) : (
          <>
            <div key={mode + spins} style={{ background: 'linear-gradient(140deg,#eaf6fd,#d8eefa)', border: '1.5px solid #bfe0f2', borderRadius: 16, padding: '22px 20px', width: '100%', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 10, left: 14, color: '#8fcbe8', fontSize: 13 }}>✦</span>
              <span style={{ position: 'absolute', bottom: 12, right: 16, color: '#f5c542', fontSize: 12 }}>✦</span>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: .6, color: 'var(--link)', textTransform: 'uppercase', marginBottom: 8 }}>{t(m.tag)} #{idx + 1}</div>
              <div style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.5, color: '#0d2f55', fontStyle: mode === 'line' ? 'italic' : 'normal' }}>
                {mode === 'line' ? `“${m.bank[idx]}”` : m.bank[idx]}
              </div>
            </div>
            <button className="btn ghost" style={{ padding: '9px 22px' }} onClick={() => spin()}>{t('🎲 Another one!')}</button>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, maxWidth: 260 }}>
              <Directions text={m.hint} inline />
            </p>
          </>
        )}
      </div>

      {/* quick sparks */}
      <div style={{ padding: '14px 16px 16px', borderTop: '1px solid var(--line)', marginTop: 14 }}>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>{t('Or try a quick spark…')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
          {QUICK.map((q) => (
            <button key={q.label} onClick={() => quick(q)}
              style={{ background: '#fff', border: '1px solid var(--gold-line)', borderRadius: 12, padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, boxShadow: 'var(--shadow)' }}>
              <span style={{ fontSize: 18 }}>{q.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0d2f55', lineHeight: 1.25, textAlign: 'center' }}>{t(q.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
