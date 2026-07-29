import React, { useState } from 'react'

/*
 * Built-in fluency games — all play in a popup over the dashboard, never a new tab.
 *   stretch     ✨ Sentence Stretch   — stretch a bare sentence with vivid detail (free response)
 *   combine     🔗 Combine It!        — pick the best combined sentence (quiz)
 *   transitions 🌉 Transition Bridge  — pick the transition that connects two ideas (quiz)
 *   fragments   🧩 Fragment Fixer     — spot the complete sentence (quiz)
 *   wordswap    💎 Word Upgrade       — swap a tired word for a vivid one (quiz)
 */

const STRETCH_ROUNDS = [
  { base: 'The dog ran.', ask: 'Where? How? Add details to make us SEE it.' },
  { base: 'She was happy.', ask: 'Show it instead of telling it — what did she do?' },
  { base: 'It was cold.', ask: 'Make us feel the cold. Add sights, sounds, or feelings.' },
  { base: 'The team won.', ask: 'How did they win? What did it feel like?' },
]

// Quiz banks: prompt, options (one correct), and a kid-sized "why".
const BANKS = {
  combine: {
    title: 'Combine It!', icon: '🔗', skill: 'Sentence Combining',
    intro: 'Two choppy sentences walk in… pick the ONE smooth sentence that combines them best.',
    items: [
      { q: 'The rain fell. The game continued.', o: ['Although the rain fell, the game continued.', 'The rain fell the game continued.', 'The rain fell and also the game it continued.'], a: 0, why: '"Although" connects the two ideas and shows they push against each other.' },
      { q: 'Maya loves soccer. Maya practices every day.', o: ['Maya loves soccer, practices every day.', 'Maya loves soccer, so she practices every day.', 'Maya loves soccer and Maya practices every day and.'], a: 1, why: '"So" shows the second idea happens BECAUSE of the first.' },
      { q: 'The cat was hungry. The bowl was empty.', o: ['The cat was hungry because the bowl was empty.', 'The cat was hungry the bowl was empty.', 'The cat, was hungry, the bowl, was empty.'], a: 0, why: '"Because" tells us the reason — that\'s the link between the ideas.' },
      { q: 'We packed our bags. We left for the airport.', o: ['We packed our bags, we left for the airport.', 'After we packed our bags, we left for the airport.', 'We packed our bags left for the airport.'], a: 1, why: '"After" puts the two events in time order with one smooth sentence.' },
      { q: 'The bridge was old. Cars still crossed it.', o: ['The bridge was old cars still crossed it.', 'The bridge was old, cars still crossed it.', 'Even though the bridge was old, cars still crossed it.'], a: 2, why: '"Even though" signals a surprise — old bridge, but still in use.' },
      { q: 'Leo studied hard. Leo aced the test.', o: ['Leo studied hard and then he did ace the test.', 'Leo studied hard and aced the test.', 'Leo studied hard, aced the test.'], a: 1, why: 'One subject, two verbs joined by "and" — short and smooth.' },
      { q: 'The soup was too hot. Nobody could eat it.', o: ['The soup was so hot that nobody could eat it.', 'The soup was too hot nobody could eat it.', 'The soup was too hot, and, nobody could eat it.'], a: 0, why: '"So…that" ties the cause to the result in one flowing sentence.' },
      { q: 'The library was quiet. It was a good place to think.', o: ['The library was quiet it was a good place to think.', 'The quiet library was a good place to think.', 'The library was quiet, a good place, to think.'], a: 1, why: 'Moving "quiet" in front of "library" combines the ideas without extra words.' },
      { q: 'Sam grabbed his umbrella. Dark clouds filled the sky.', o: ['Because dark clouds filled the sky, Sam grabbed his umbrella.', 'Sam grabbed his umbrella dark clouds filled the sky.', 'Sam grabbed his umbrella and dark clouds and the sky.'], a: 0, why: 'Starting with "Because" shows why Sam grabbed the umbrella.' },
      { q: 'The song was catchy. Everyone sang along.', o: ['The song was catchy, everyone sang along.', 'The song was catchy everyone sang along.', 'The song was so catchy that everyone sang along.'], a: 2, why: '"So…that" connects the cause (catchy) to the effect (singing).' },
    ],
  },
  transitions: {
    title: 'Transition Bridge', icon: '🌉', skill: 'Transitions',
    intro: 'Build the bridge! Pick the transition word that connects the two ideas best.',
    items: [
      { q: 'I wanted to play outside. ___, it started to rain.', o: ['However', 'Similarly', 'For example'], a: 0, why: '"However" signals the second idea works AGAINST the first.' },
      { q: 'First, gather your materials. ___, follow the steps in order.', o: ['In contrast', 'Next', 'Meanwhile'], a: 1, why: '"Next" keeps steps in time order.' },
      { q: 'Recycling helps the planet. ___, it keeps trash out of the ocean.', o: ['On the other hand', 'For example', 'Before long'], a: 1, why: '"For example" introduces a specific case of the big idea.' },
      { q: 'The hikers were exhausted. ___, they kept climbing.', o: ['Therefore', 'As a result', 'Even so'], a: 2, why: '"Even so" shows they pushed on DESPITE being tired.' },
      { q: 'It snowed all night. ___, school was canceled.', o: ['As a result', 'Instead', 'Likewise'], a: 0, why: '"As a result" links a cause to what happened because of it.' },
      { q: 'Dogs need daily walks. ___, cats mostly exercise themselves.', o: ['In addition', 'In contrast', 'For instance'], a: 1, why: '"In contrast" sets two different things side by side.' },
      { q: 'Read the question carefully. ___, check your answer.', o: ['Finally', 'Although', 'Besides'], a: 0, why: '"Finally" marks the last step.' },
      { q: 'The market sells fresh fruit. ___, it sells warm bread.', o: ['However', 'In addition', 'Otherwise'], a: 1, why: '"In addition" stacks a second similar idea on the first.' },
      { q: 'Practice a little every day. ___, you will improve faster than you expect.', o: ['Over time', 'In contrast', 'For example'], a: 0, why: '"Over time" shows the change happens gradually.' },
      { q: 'Bring a jacket. ___, you might be cold at the campfire.', o: ['Similarly', 'Otherwise', 'Meanwhile'], a: 1, why: '"Otherwise" warns what happens if you don\'t.' },
    ],
  },
  fragments: {
    title: 'Fragment Fixer', icon: '🧩', skill: 'Complete Sentences',
    intro: 'One of these is a COMPLETE sentence — the others are fragments in disguise. Find it!',
    items: [
      { q: 'Which one is a complete sentence?', o: ['Running down the hall.', 'The bell rang loudly.', 'Because I was late.'], a: 1, why: 'It has a subject (the bell) and a verb (rang) — a complete thought.' },
      { q: 'Which one is a complete sentence?', o: ['After the storm passed.', 'Under the old bridge.', 'The river rose quickly.'], a: 2, why: '"After the storm passed" and "Under the old bridge" leave you hanging.' },
      { q: 'Which one is a complete sentence?', o: ['My little brother snores.', 'When he falls asleep.', 'Louder than a truck.'], a: 0, why: 'Subject + verb + complete thought. The others are pieces.' },
      { q: 'Which one is a complete sentence?', o: ['Hoping for a snow day.', 'We watched the forecast.', 'All night long.'], a: 1, why: '"We watched" — someone does something. Complete!' },
      { q: 'Which one is a complete sentence?', o: ['The pizza disappeared fast.', 'Because everyone was starving.', 'Especially the cheesy slices.'], a: 0, why: '"Because…" starts a reason but never finishes the thought.' },
      { q: 'Which one is a complete sentence?', o: ['Jumping on the trampoline.', 'With her best friend.', 'They bounced until sunset.'], a: 2, why: '"They bounced" — subject and verb make it whole.' },
      { q: 'Which one is a complete sentence?', o: ['The lights flickered twice.', 'During the scary movie.', 'Hiding under the blanket.'], a: 0, why: 'The other two are missing who did what.' },
      { q: 'Which one is a complete sentence?', o: ['Before the race started.', 'Tied her shoes tight.', 'Nina stretched her legs.'], a: 2, why: '"Nina stretched" — a subject doing an action, thought complete.' },
      { q: 'Which one is a complete sentence?', o: ['In the middle of the night.', 'The puppy howled at the moon.', 'Waking the whole house.'], a: 1, why: 'It names who (the puppy) and what happened (howled).' },
      { q: 'Which one is a complete sentence?', o: ['Our rocket finally launched.', 'After three tries and two repairs.', 'Straight into the clouds.'], a: 0, why: 'Subject (rocket) + verb (launched) = liftoff. The rest are add-ons.' },
    ],
  },
  wordswap: {
    title: 'Word Upgrade', icon: '💎', skill: 'Word Choice',
    intro: 'The bold word is BORING. Pick the upgrade that paints the clearest picture.',
    items: [
      { q: 'The cheetah is very FAST.', o: ['quick', 'lightning-quick', 'speedy'], a: 1, why: '"Lightning-quick" makes you SEE the speed — the others are just synonyms for fast.' },
      { q: 'The soup was GOOD.', o: ['rich and buttery', 'nice', 'fine'], a: 0, why: '"Rich and buttery" tells your taste buds exactly what to expect.' },
      { q: 'He WALKED into the room.', o: ['went', 'moved', 'strolled'], a: 2, why: '"Strolled" shows HOW he walked — relaxed and easy.' },
      { q: 'The old house was SCARY.', o: ['bad', 'creaky and shadow-filled', 'not nice'], a: 1, why: 'Details like "creaky" and "shadow-filled" let the reader feel the creeps.' },
      { q: 'The crowd was LOUD.', o: ['thundering', 'noisy', 'big'], a: 0, why: '"Thundering" turns the noise into something you can almost hear.' },
      { q: 'She was SAD about the news.', o: ['unhappy', 'heartbroken', 'not glad'], a: 1, why: '"Heartbroken" shows how deep the feeling goes.' },
      { q: 'The mountain was BIG.', o: ['towering', 'large', 'very big'], a: 0, why: '"Towering" makes you tilt your head back to look up at it.' },
      { q: 'The baby bird was SMALL.', o: ['little', 'tiny as a thumb', 'not big'], a: 1, why: 'Comparing it to a thumb lets the reader measure it in their mind.' },
      { q: 'He ATE the sandwich.', o: ['devoured', 'had', 'consumed'], a: 0, why: '"Devoured" shows he was starving — one word tells a whole story.' },
      { q: 'The fireworks were PRETTY.', o: ['nice', 'okay', 'dazzling'], a: 2, why: '"Dazzling" sparkles — it matches the thing it describes.' },
    ],
  },
}

const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const ROUND_SIZE = 8

function QuizGame({ bank, onClose, onFinished }) {
  const [items] = useState(() => shuffle(bank.items).slice(0, ROUND_SIZE))
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null) // option index after answering
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const finished = idx >= items.length
  const it = items[idx]

  function pick(i) {
    if (picked != null) return
    setPicked(i)
    if (i === it.a) { setScore((s) => s + 1); setStreak((s) => { const n = s + 1; setBest((b) => Math.max(b, n)); return n }) }
    else setStreak(0)
  }
  function next() {
    setPicked(null)
    if (idx + 1 >= items.length) { setIdx(items.length); onFinished && onFinished() }
    else setIdx(idx + 1)
  }

  return (
    <div>
      {finished ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 46 }}>{score >= items.length - 1 ? '🏆' : score >= items.length / 2 ? '🌟' : '💪'}</div>
          <h3 style={{ margin: '6px 0 4px', fontSize: 22 }}>{score} of {items.length} correct!</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 16px' }}>
            {best >= 4 ? `Best streak: ${best} in a row 🔥` : score >= items.length / 2 ? 'Solid round — play again to beat it!' : 'Every round makes the next one easier.'}
          </p>
          <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Done — back to the dashboard</button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 10 }}>
            <span>Question {idx + 1} of {items.length}</span>
            <span>⭐ {score}{streak >= 2 ? ` · 🔥 ${streak} streak` : ''}</span>
          </div>
          <div style={{ background: '#eef4f7', borderRadius: 12, padding: '14px 16px', marginBottom: 12, fontSize: 16.5, fontWeight: 700, lineHeight: 1.45 }}>
            {it.q}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {it.o.map((opt, i) => {
              const isRight = picked != null && i === it.a
              const isWrongPick = picked === i && i !== it.a
              return (
                <button key={i} onClick={() => pick(i)} disabled={picked != null}
                  style={{ textAlign: 'left', padding: '11px 14px', borderRadius: 11, fontSize: 14.5, fontWeight: 600, lineHeight: 1.4, cursor: picked == null ? 'pointer' : 'default',
                    border: isRight ? '2px solid var(--good)' : isWrongPick ? '2px solid #e06c6c' : '1.5px solid var(--line)',
                    background: isRight ? '#e6f6ee' : isWrongPick ? '#fdecec' : '#fff' }}>
                  {isRight ? '✅ ' : isWrongPick ? '❌ ' : ''}{opt}
                </button>
              )
            })}
          </div>
          {picked != null && (
            <div style={{ background: '#e9f5fb', borderRadius: 10, padding: '9px 13px', fontSize: 13, marginTop: 10, lineHeight: 1.45 }}>
              💡 {it.why}
            </div>
          )}
          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <button className="btn" disabled={picked == null} onClick={next}>
              {idx + 1 >= items.length ? 'See my score →' : 'Next →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StretchGame({ onClose, onFinished }) {
  const [round, setRound] = useState(0)
  const [text, setText] = useState('')
  const [done, setDone] = useState([])
  const r = STRETCH_ROUNDS[round]
  const extra = text.trim().split(/\s+/).filter(Boolean).length
  const strong = extra >= 6

  function next() {
    setDone((d) => [...d, { base: r.base, stretched: text.trim(), words: extra }])
    setText('')
    if (round + 1 < STRETCH_ROUNDS.length) setRound(round + 1)
    else { setRound(-1); onFinished && onFinished() }
  }

  if (round === -1) return (
    <div>
      <p style={{ fontSize: 15 }}>You stretched {done.length} sentences — nice fluency workout! 💪</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0' }}>
        {done.map((d, i) => (
          <div key={i} style={{ background: '#f6f8f9', borderRadius: 10, padding: '8px 12px', fontSize: 14 }}>
            <span style={{ color: 'var(--muted)' }}>{d.base}</span> → <b>{d.stretched || '(skipped)'}</b>
          </div>
        ))}
      </div>
      <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Done — back to the dashboard</button>
    </div>
  )
  return (
    <div>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>Round {round + 1} of {STRETCH_ROUNDS.length}</div>
      <div style={{ background: '#eef4f7', borderRadius: 12, padding: 16, marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Stretch this sentence:</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{r.base}</div>
        <div style={{ fontSize: 13, color: 'var(--cc-blue)', marginTop: 6 }}>{r.ask}</div>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} autoFocus
        placeholder={`Start with "${r.base.replace(/\.$/, '')}…" and keep going`}
        style={{ width: '100%', minHeight: 90, borderRadius: 10, border: '1px solid var(--line)', padding: 12, fontFamily: 'inherit', fontSize: 15, resize: 'vertical' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <span style={{ fontSize: 13, color: strong ? 'var(--good)' : 'var(--muted)' }}>
          {extra === 0 ? 'Add at least a few vivid words' : strong ? '🔥 Now that paints a picture!' : `${extra} words — keep stretching`}
        </span>
        <button className="btn" disabled={extra < 2} onClick={next}>{round + 1 < STRETCH_ROUNDS.length ? 'Next →' : 'Finish'}</button>
      </div>
    </div>
  )
}

export default function FluencyGame({ gameKey = 'stretch', onClose, onFinished }) {
  const bank = BANKS[gameKey]
  const title = bank ? `${bank.icon} ${bank.title}` : '✨ Sentence Stretch'
  const skill = bank ? bank.skill : 'Sentence Fluency'
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }} onClick={onClose}>
      <div className="card" style={{ width: 560, maxWidth: '92vw', maxHeight: '92vh', overflowY: 'auto', padding: 26 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div><span className="eyebrow">Fluency Game · {skill}</span><h2 style={{ margin: '2px 0', fontSize: 20 }}>{title}</h2></div>
          <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: 'var(--muted)' }}>×</button>
        </div>
        {bank && <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px' }}>{bank.intro}</p>}
        {bank
          ? <QuizGame bank={bank} onClose={onClose} onFinished={onFinished} />
          : <StretchGame onClose={onClose} onFinished={onFinished} />}
      </div>
    </div>
  )
}
