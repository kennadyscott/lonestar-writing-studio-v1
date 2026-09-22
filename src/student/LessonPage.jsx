import React, { useEffect, useMemo, useState } from 'react'
import { BRAND } from '../lib/brand.js'

/*
 * Lesson page — opened from a lesson card in Luna's Writing Nook.
 * Five steps down the left (Watch → Learn → Practice → Your Turn → Review), the
 * step's work in the middle, Luna's coaching on the right, Back / Save Draft /
 * Continue along the bottom. Progress = steps completed / 4.
 *
 * Content is prototype data: every Module 1 lesson runs the same Starburst
 * Prompts activity until the real lesson decks are converted.
 */

const NAVY = '#0d2f55'
const BASE = import.meta.env.BASE_URL || '/'
const STEPS = ['Watch', 'Learn', 'Practice', 'Your Turn', 'Review']

// The instruction video that opens the lesson. Prototype: poster frame only,
// the real clip is attached when the lesson decks are converted.
const VIDEO = { title: 'Instruction 1.2: Restate the Question', length: '3:42', poster: BASE + 'lessons/video-restate.webp' }

const STARBURST = {
  activity: 'Starburst Prompts: Sentence Expansion',
  directions: 'Answer the questions about the starter sentence. Use those answers to revise and write a more detailed sentence.',
  starter: 'It snarled.',
  prompts: [
    { key: 'what', icon: '👥', label: 'What?', hint: 'What was it?' },
    { key: 'when', icon: '📅', label: 'When?', hint: 'When did it happen?' },
    { key: 'why', icon: '❓', label: 'Why?', hint: 'Why did it snarl?' },
    { key: 'how', icon: '⚙️', label: 'How?', hint: 'How did it snarl?' },
  ],
  practice: {
    ask: 'Which sentence expands the starter with the most useful detail?',
    options: [
      { text: 'It snarled loudly.', why: 'Only one detail was added. We still do not know what "it" is.' },
      { text: 'When the mail carrier reached the gate, the old bulldog snarled through the fence because a stranger was too close.', why: 'What, when, why and how are all answered in one clear sentence.', right: true },
      { text: 'It snarled and it was a dog and it was mad and it was loud.', why: 'The details are there, but "and it was" four times makes a list, not a sentence.' },
    ],
  },
  luna: {
    0: 'Watch first. Then we will try it together!',
    1: 'Think about the details! Strong sentences help your writing shine.',
    2: 'Look for the sentence that answers the most questions without turning into a list.',
    3: 'Use your four answers. Start with WHEN or WHAT and keep it to one smooth sentence.',
    4: 'Look at how far your sentence came from two words!',
  },
}

const draftKey = (lesson) => `luna.lesson.${lesson.n}`

function Stepper({ step, done, onJump }) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
      {STEPS.map((label, i) => {
        const cur = i === step, past = i < done
        return (
          <li key={label} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, padding: '0 0 36px' }}>
            {i < STEPS.length - 1 && <span aria-hidden style={{ position: 'absolute', left: 17, top: 36, width: 2, height: 36, background: past ? '#0a7dba' : '#cbd8e2' }} />}
            <button onClick={() => i <= done && onJump(i)} disabled={i > done} aria-current={cur ? 'step' : undefined}
              style={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0, cursor: i <= done ? 'pointer' : 'default',
                background: cur || past ? NAVY : '#fff', color: cur || past ? '#fff' : '#7d93a6', border: cur || past ? 'none' : '2px solid #cbd8e2', boxShadow: cur ? '0 0 0 4px rgba(10,125,186,.18)' : 'none' }}>
              {past && !cur ? '✓' : i + 1}
            </button>
            <span style={{ fontSize: 15, fontWeight: cur ? 800 : 600, color: cur ? NAVY : i <= done ? '#2f5573' : '#7d93a6' }}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Field({ p, value, onChange }) {
  return (
    <label style={{ display: 'grid', gridTemplateColumns: '190px 1fr', alignItems: 'center', gap: 14, background: '#fbf7ec', borderRadius: 12, padding: '7px 14px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{p.icon}</span>
        <span>
          <span style={{ display: 'block', fontWeight: 800, fontSize: 15, color: NAVY }}>{p.label}</span>
          <span style={{ display: 'block', fontSize: 12.5, color: '#5c7285' }}>{p.hint}</span>
        </span>
      </span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Type your response here…"
        style={{ font: 'inherit', fontSize: 14, padding: '9px 14px', borderRadius: 9, border: '1.5px solid #cfdde8', background: '#fff', color: 'var(--ink)', outline: 'none' }} />
    </label>
  )
}

function WatchStep({ watched, onWatched }) {
  const [playing, setPlaying] = useState(false)
  const play = () => { setPlaying(true); onWatched() }
  return (
    <div>
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: '#0d2f55', aspectRatio: '16 / 9', boxShadow: '0 8px 26px rgba(2,20,50,.25)' }}>
        <img src={VIDEO.poster} alt={VIDEO.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {!playing && (
          <button onClick={play} aria-label="Play video" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(13,47,85,.18)' }}>
            <span style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,.94)', display: 'grid', placeItems: 'center', boxShadow: '0 8px 28px rgba(2,20,50,.4)', fontSize: 34, color: NAVY, paddingLeft: 6 }}>▶</span>
          </button>
        )}
        {/* player chrome */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '28px 16px 12px', background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.55))', color: '#fff', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, fontWeight: 700 }}>
          <button onClick={() => (playing ? setPlaying(false) : play())} aria-label={playing ? 'Pause' : 'Play'} style={{ color: '#fff', fontSize: 16, width: 24 }}>{playing ? '❚❚' : '▶'}</button>
          <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,.35)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: playing ? '38%' : watched ? '100%' : '0%', background: '#f5b400', borderRadius: 3, transition: 'width 1.2s linear' }} />
          </div>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{playing ? '1:24' : watched ? VIDEO.length : '0:00'} / {VIDEO.length}</span>
          <span aria-hidden>🔊</span>
          <span aria-hidden>⛶</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, fontSize: 13, color: '#4a6f8c', fontWeight: 600 }}>
        <span style={{ background: '#eaf6fd', color: '#0a7dba', fontWeight: 800, fontSize: 11, letterSpacing: .6, padding: '3px 8px', borderRadius: 6 }}>VIDEO</span>
        <span>{VIDEO.title} · {VIDEO.length}</span>
        <span style={{ marginLeft: 'auto', color: watched ? '#2e9e6b' : '#7d93a6' }}>{watched ? '✓ Watched' : 'Press play to begin'}</span>
      </div>
    </div>
  )
}

function LearnStep({ answers, setAnswers }) {
  return (
    <>
      <div style={{ background: '#eaf6fd', borderRadius: 14, padding: '14px 20px', textAlign: 'center', margin: '2px 0 10px' }}>
        <span style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(26px, 2.3vw, 34px)', fontWeight: 700, color: NAVY }}>
          <span style={{ color: '#f5b400', fontSize: '.6em', verticalAlign: 'middle', marginRight: 14 }}>✧</span>{STARBURST.starter}<span style={{ color: '#f5b400', fontSize: '.6em', verticalAlign: 'middle', marginLeft: 14 }}>✧</span>
        </span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {STARBURST.prompts.map((p) => <Field key={p.key} p={p} value={answers[p.key] || ''} onChange={(v) => setAnswers({ ...answers, [p.key]: v })} />)}
      </div>
    </>
  )
}

function PracticeStep({ pick, setPick }) {
  const { ask, options } = STARBURST.practice
  return (
    <>
      <div style={{ fontWeight: 800, fontSize: 16, color: NAVY, margin: '6px 0 12px' }}>{ask}</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {options.map((o, i) => {
          const chosen = pick === i
          const show = pick != null
          const tone = !show ? '#fff' : o.right ? '#e4f5ec' : chosen ? '#fdecec' : '#fff'
          return (
            <button key={i} onClick={() => setPick(i)} style={{ textAlign: 'left', background: tone, border: `1.5px solid ${chosen ? (o.right ? '#2e9e6b' : '#d9534f') : '#cfdde8'}`, borderRadius: 12, padding: '12px 14px', display: 'grid', gap: 4 }}>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{String.fromCharCode(65 + i)}. {o.text}</span>
              {show && (chosen || o.right) && <span style={{ fontSize: 12.5, color: o.right ? '#2e9e6b' : '#b23b3b', fontWeight: 700 }}>{o.right ? '✓ ' : '✗ '}{o.why}</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

function YourTurnStep({ answers, sentence, setSentence }) {
  const chips = STARBURST.prompts.map((p) => ({ label: p.label, v: (answers[p.key] || '').trim() })).filter((c) => c.v)
  return (
    <>
      <div style={{ fontWeight: 800, fontSize: 16, color: NAVY, margin: '6px 0 8px' }}>Now write the expanded sentence.</div>
      <div style={{ fontSize: 13.5, color: '#5c7285', marginBottom: 10 }}>Start from <b style={{ color: NAVY }}>{STARBURST.starter}</b> and work in your answers. One sentence, a capital letter to start, a period to end.</div>
      {chips.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {chips.map((c) => <span key={c.label} style={{ background: '#fbf7ec', border: '1px solid #f0dfae', borderRadius: 999, padding: '4px 10px', fontSize: 12.5 }}><b style={{ color: '#b97e10' }}>{c.label}</b> {c.v}</span>)}
        </div>
      )}
      <textarea value={sentence} onChange={(e) => setSentence(e.target.value)} rows={4} placeholder="Type your expanded sentence here…"
        style={{ width: '100%', font: 'inherit', fontSize: 16, lineHeight: 1.5, padding: '12px 14px', borderRadius: 12, border: '1.5px solid #cfdde8', background: '#fff', color: 'var(--ink)', resize: 'vertical', outline: 'none' }} />
    </>
  )
}

// Stars for the prototype: one for a real sentence, one for length, one for detail.
function score(sentence, answers) {
  const s = sentence.trim()
  if (!s) return { stars: 0, notes: ['Write your sentence to earn stars.'] }
  const notes = []
  let stars = 0
  const cap = /^[A-Z]/.test(s), end = /[.!?]$/.test(s)
  if (cap && end) { stars++; notes.push('✓ Starts with a capital and ends with a period.') } else notes.push(cap ? '• Add an end mark.' : '• Start with a capital letter.')
  const words = s.split(/\s+/).length
  if (words >= 8) { stars++; notes.push(`✓ ${words} words — a real expansion of two.`) } else notes.push(`• ${words} words so far. Aim for eight or more.`)
  const used = Object.values(answers).filter((v) => v && v.trim().length > 2 && s.toLowerCase().includes(v.trim().toLowerCase().split(/\s+/)[0])).length
  if (used >= 2) { stars++; notes.push(`✓ Uses ${used} of your Starburst answers.`) } else notes.push('• Work in at least two of your Starburst answers.')
  return { stars, notes }
}

function ReviewStep({ sentence, answers, pick }) {
  const { stars, notes } = score(sentence, answers)
  const right = STARBURST.practice.options[pick]?.right
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: '#eaf6fd', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: .6, color: '#0a7dba', marginBottom: 6 }}>YOU STARTED WITH</div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: NAVY }}>{STARBURST.starter}</div>
        </div>
        <div style={{ background: '#e4f5ec', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: .6, color: '#2e9e6b', marginBottom: 6 }}>YOU WROTE</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: NAVY, lineHeight: 1.4 }}>{sentence.trim() || <i style={{ color: '#7d93a6' }}>Nothing yet — go back to Your Turn.</i>}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '16px 0 10px' }}>
        <span style={{ fontSize: 30, letterSpacing: 3 }}>{[1, 2, 3].map((i) => <span key={i} style={{ color: i <= stars ? '#f5b400' : '#d7dfe6' }}>★</span>)}</span>
        <span style={{ fontWeight: 800, color: NAVY }}>{stars} of 3 stars</span>
        <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: right ? '#2e9e6b' : '#b97e10' }}>Practice: {right ? 'correct ✓' : pick == null ? 'skipped' : 'missed'}</span>
      </div>
      <ul style={{ margin: 0, padding: '0 0 0 4px', listStyle: 'none', display: 'grid', gap: 6, fontSize: 14, color: 'var(--ink)' }}>
        {notes.map((n) => <li key={n}>{n}</li>)}
      </ul>
    </>
  )
}

export default function LessonPage({ lesson, moduleLabel, onBack }) {
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(0) // furthest step reached
  const [answers, setAnswers] = useState({})
  const [pick, setPick] = useState(null)
  const [sentence, setSentence] = useState('')
  const [watched, setWatched] = useState(false)
  const [saved, setSaved] = useState('')

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(draftKey(lesson)) || 'null')
      if (d) { setAnswers(d.answers || {}); setPick(d.pick ?? null); setSentence(d.sentence || ''); setWatched(!!d.watched); setStep(d.step || 0); setDone(d.done || 0) }
    } catch {}
  }, [lesson.n])

  const save = (quiet) => {
    try { localStorage.setItem(draftKey(lesson), JSON.stringify({ answers, pick, sentence, watched, step, done })) } catch {}
    if (!quiet) { setSaved('Draft saved'); setTimeout(() => setSaved(''), 1600) }
  }
  const next = () => { const n = Math.min(STEPS.length - 1, step + 1); setStep(n); setDone(Math.max(done, n)); save(true) }
  const pct = Math.round(((step + 1) / STEPS.length) * 100)
  const canContinue = step === 0 ? watched : step === 1 ? STARBURST.prompts.filter((p) => (answers[p.key] || '').trim()).length >= 2 : step === 2 ? pick != null : step === 3 ? sentence.trim().length > 0 : false

  return (
    <div style={{ margin: '-26px calc(50% - 50vw) -70px', minHeight: 'calc(100vh - 64px)', display: 'grid', gridTemplateColumns: '190px minmax(0,1fr)', color: 'var(--ink)',
      background: 'var(--canvas)' }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `url(${BASE}bg-stars.jpg) center / cover no-repeat`, opacity: .22 }} />

      {/* left rail */}
      <aside style={{ position: 'relative', background: 'rgba(255,255,255,.72)', borderRight: '1px solid rgba(188,217,236,.7)', padding: '22px 18px 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .6, color: '#0a7dba' }}>{moduleLabel.split(':')[0].toUpperCase()}</div>
          <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: 700, fontSize: 22, color: NAVY, lineHeight: 1.15 }}>{lesson.title.replace(/^Module \d+: /, '')}</div>
          <div style={{ fontSize: 12, color: '#4a6f8c', marginTop: 4, lineHeight: 1.35 }}>Use what you know about {lesson.title.replace(/^Module \d+: /, '')} to expand a sentence.</div>
        </div>
        <Stepper step={step} done={done} onJump={setStep} />
        <div style={{ marginTop: 'auto', marginBottom: 110, fontFamily: '"Bradley Hand", "Segoe Script", cursive', fontSize: 22, lineHeight: 1.15, color: NAVY, opacity: .85 }}>Better<br />Writers<br />Brighter<br />Futures <span style={{ color: '#f5b400' }}>✦</span></div>
      </aside>

      {/* main */}
      <section style={{ padding: '18px clamp(22px, 2.6vw, 56px) 0', position: 'relative', zIndex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        <div style={{ position: 'relative', background: 'rgba(255,255,255,.96)', borderRadius: 22, boxShadow: '0 8px 30px rgba(2,20,50,.14)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 250px', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px 20px' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12, paddingRight: 0 }}>
              <div style={{ position: 'absolute', right: 268, top: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative', width: 'clamp(120px, 14vw, 220px)', height: 18, background: '#eef3f6', border: '1.5px solid #cfdde8', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#02b2d5,#0a7dba)', borderRadius: 10 }} />
                  <span style={{ position: 'absolute', left: 8, top: 0, lineHeight: '18px', fontSize: 10.5, fontWeight: 800, color: pct > 22 ? '#fff' : NAVY }}>{pct}%</span>
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: NAVY, whiteSpace: 'nowrap' }}>{step + 1} of {STEPS.length}</span>
              </div>
              <span style={{ width: 52, height: 52, borderRadius: '50%', background: '#fbf7ec', border: '1.5px solid #f0dfae', display: 'grid', placeItems: 'center', fontSize: 22, flexShrink: 0 }}>{['▶', '✎', '☑', '✍', '★'][step]}</span>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 21, fontWeight: 700, color: NAVY }}>{step === 0 ? VIDEO.title : step === 1 ? STARBURST.activity : `${STEPS[step]}: ${STARBURST.activity.split(':')[1].trim()}`}</div>
                <div style={{ fontSize: 13.5, color: '#4a6f8c', marginTop: 3, maxWidth: 560 }}>{step === 0 ? 'Watch Luna walk through the skill, then try it yourself in the next step.' : step === 1 ? STARBURST.directions : step === 2 ? 'Check your eye for detail before you write your own.' : step === 3 ? 'Bring your answers together into one strong sentence.' : 'See how your sentence grew, and where the stars came from.'}</div>
              </div>
            </div>
            {step === 0 && <WatchStep watched={watched} onWatched={() => setWatched(true)} />}
            {step === 1 && <LearnStep answers={answers} setAnswers={setAnswers} />}
            {step === 2 && <PracticeStep pick={pick} setPick={setPick} />}
            {step === 3 && <YourTurnStep answers={answers} sentence={sentence} setSentence={setSentence} />}
            {step === 4 && <ReviewStep sentence={sentence} answers={answers} pick={pick} />}
          </div>

          {/* Luna's side */}
          <div style={{ borderLeft: '1px solid #e6eef3', padding: '22px 18px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(180deg,#fff 0%,#f3f8fc 100%)' }}>
            <div style={{ position: 'relative', background: '#fff8e6', border: '1.5px solid #f0dfae', borderRadius: 16, padding: '12px 14px', width: '100%' }}>
              <div style={{ fontFamily: '"Bradley Hand", "Segoe Script", cursive', fontSize: 19, color: NAVY, marginBottom: 4 }}>Luna says…</div>
              <div style={{ fontSize: 13, lineHeight: 1.4, color: 'var(--ink)' }}>{STARBURST.luna[step]} <span style={{ color: '#f5b400' }}>✦</span></div>
              <span aria-hidden style={{ position: 'absolute', left: 28, bottom: -9, width: 16, height: 16, background: '#fff8e6', borderRight: '1.5px solid #f0dfae', borderBottom: '1.5px solid #f0dfae', transform: 'rotate(45deg)' }} />
            </div>
            <img src={BRAND.luna} alt="Luna" style={{ height: 120, margin: '26px 0 -6px', filter: 'drop-shadow(0 8px 12px rgba(2,20,50,.25))', position: 'relative', zIndex: 1 }} />
            <div style={{ width: '100%', display: 'grid', gap: 3, marginTop: 0 }}>
              {[['Ideas', '#1c4f86', '84%'], ['Revision', '#0d2f55', '92%'], ['Brighter Writing', '#e2a11b', '100%']].map(([t, c, w]) => (
                <div key={t} style={{ width: w, marginLeft: 'auto', marginRight: 'auto', background: c, color: '#fff', fontWeight: 800, fontSize: 12.5, padding: '9px 12px', borderRadius: 4, boxShadow: '0 2px 0 rgba(0,0,0,.25)' }}>{t}</div>
              ))}
            </div>
            <div style={{ flex: 1 }} />
          </div>
        </div>

        {/* bottom bar */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, padding: '0 0 18px' }}>
          <button onClick={step === 0 ? onBack : () => setStep(step - 1)} style={{ background: '#fff', border: '1.5px solid #bcd9ec', borderRadius: 10, padding: '11px 22px', fontWeight: 800, fontSize: 14, color: NAVY }}>← Back</button>
          <span style={{ fontSize: 13, color: '#2e9e6b', fontWeight: 700, minWidth: 90 }}>{saved}</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => save(false)} style={{ background: '#fff', border: '1.5px solid #bcd9ec', borderRadius: 10, padding: '11px 20px', fontWeight: 800, fontSize: 14, color: NAVY }}>💾 Save Draft</button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} disabled={!canContinue} title={canContinue ? '' : 'Finish this step first'} style={{ background: canContinue ? NAVY : '#9fb3c4', color: '#fff', borderRadius: 10, padding: '11px 26px', fontWeight: 800, fontSize: 15, cursor: canContinue ? 'pointer' : 'default' }}>Continue →</button>
          ) : (
            <button onClick={() => { save(true); onBack() }} style={{ background: '#2e9e6b', color: '#fff', borderRadius: 10, padding: '11px 26px', fontWeight: 800, fontSize: 15 }}>Finish lesson ✓</button>
          )}
        </div>
      </section>
    </div>
  )
}
