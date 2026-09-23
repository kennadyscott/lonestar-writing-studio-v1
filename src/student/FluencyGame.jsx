import React, { useEffect, useState } from 'react'
import { useT } from '../lib/i18n/index.jsx'
import { Directions, Glossed, Speak, useSay } from './Scaffold.jsx'

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
  context: {
    title: 'Context Clues', icon: '🔍', skill: 'Vocabulary',
    intro: 'Detective time! Use the other words in the sentence to work out what the CAPITAL word means.',
    items: [
      { q: 'The hikers were FAMISHED after walking all day with no lunch, so they ate everything in the cooler.', o: ['very hungry', 'very tired', 'lost'], a: 0, why: 'No lunch all day and eating everything in sight = very hungry.' },
      { q: 'Maya was RELUCTANT to jump in; she stood at the edge of the pool for ten minutes.', o: ['excited', 'unwilling', 'freezing'], a: 1, why: 'Standing at the edge for ten minutes shows she did not want to jump.' },
      { q: 'The room was so CLUTTERED that we could not see the floor under the toys and papers.', o: ['dark', 'messy and crowded', 'tiny'], a: 1, why: 'Toys and papers hiding the floor = a messy, crowded room.' },
      { q: "Grandpa's stories are always ACCURATE; he checks every date before he tells them.", o: ['long', 'funny', 'correct'], a: 2, why: 'Checking every date is how you make sure something is correct.' },
      { q: 'The kitten was TIMID, hiding under the couch whenever the doorbell rang.', o: ['easily frightened', 'playful', 'sleepy'], a: 0, why: 'Hiding at a doorbell is what a shy, easily frightened animal does.' },
      { q: 'After the storm, DEBRIS of branches and shingles covered the yard.', o: ['fresh snow', 'scattered broken pieces', 'a row of flowers'], a: 1, why: 'Branches and shingles left by a storm are broken, scattered pieces.' },
      { q: 'Our teacher gave us AMPLE time, a whole week, to finish the poster.', o: ['not enough', 'exactly one hour of', 'more than enough'], a: 2, why: '"A whole week" tells you there was plenty of time.' },
      { q: 'The old bridge was FRAGILE, so only one person could cross at a time.', o: ['easily broken', 'very wide', 'brand new'], a: 0, why: 'Only one person at a time means the bridge might break.' },
      { q: "The crowd's cheers were DEAFENING; I had to cover my ears.", o: ['quiet', 'extremely loud', 'far away'], a: 1, why: 'Covering your ears is the clue: the noise was extremely loud.' },
      { q: 'Sam was ELATED when his name was called for first place; he jumped up and down.', o: ['very happy', 'confused', 'embarrassed'], a: 0, why: 'First place and jumping up and down = very happy.' },
    ],
  },
  thisvsthat: {
    title: 'This vs. That', icon: '⚖️', skill: 'Commonly Confused Words',
    intro: 'Two words sound alike. Only one fits the blank. Weigh them up and pick the right one.',
    items: [
      { q: '___ going to the park after school.', o: ['Their', "They're", 'There'], a: 1, why: '"They\'re" = "they are". They ARE going to the park.' },
      { q: 'The dog wagged ___ tail.', o: ["it's", 'its'], a: 1, why: '"Its" shows belonging. "It\'s" means "it is", and "it is tail" makes no sense.' },
      { q: 'Do you know ___ turn it is?', o: ["who's", 'whose'], a: 1, why: '"Whose" asks about belonging. "Who\'s" means "who is".' },
      { q: '___ are three cookies left.', o: ['Their', 'There', "They're"], a: 1, why: '"There" points to a place or says something exists: THERE are cookies.' },
      { q: 'Everyone ___ Jo finished the race.', o: ['accept', 'except'], a: 1, why: '"Except" leaves someone out. "Accept" means to receive or agree.' },
      { q: "You're taller ___ me.", o: ['then', 'than'], a: 1, why: '"Than" compares two things. "Then" is about time.' },
      { q: 'We ___ the whole pizza!', o: ['eight', 'ate'], a: 1, why: '"Ate" is what you did to the pizza. "Eight" is the number.' },
      { q: 'The ___ was calm, with no waves at all.', o: ['see', 'sea'], a: 1, why: 'The "sea" is the water. "See" is what your eyes do.' },
      { q: 'Turn left, ___ walk two blocks.', o: ['than', 'then'], a: 1, why: '"Then" means next in time. "Than" only compares.' },
      { q: "I can't wait for ___ party this weekend.", o: ['your', "you're"], a: 0, why: '"Your" shows belonging. "You\'re" means "you are".' },
    ],
  },
  wordwork: {
    title: 'Word Work', icon: '🔤', skill: 'Word Parts',
    intro: 'Prefixes, suffixes and roots are building blocks. Take the word apart and pick what the part means.',
    items: [
      { q: "In 'unhappy', the prefix 'un-' means ___.", o: ['very', 'not', 'again'], a: 1, why: 'Un + happy = NOT happy.' },
      { q: "'Rewrite' means to write ___.", o: ['again', 'quickly', 'badly'], a: 0, why: '"Re-" means again: redo, replay, rewrite.' },
      { q: "Add a suffix to 'teach' to name a person who teaches.", o: ['teaching', 'teacher', 'teachable'], a: 1, why: '"-er" names the person who does the action.' },
      { q: "The root 'port' means 'carry'. 'Transport' means to carry ___.", o: ['from one place to another', 'in your pocket', 'very carefully'], a: 0, why: '"Trans-" means across, so transport = carry across.' },
      { q: "'Careless' means ___.", o: ['full of care', 'without care', 'caring more'], a: 1, why: '"-less" means without: careless, fearless, homeless.' },
      { q: "Which prefix makes 'possible' mean 'not possible'?", o: ['re-', 'pre-', 'im-'], a: 2, why: 'Impossible = not possible. "Im-" is a form of "in-", meaning not.' },
      { q: "'Preview' means to view something ___.", o: ['after', 'before', 'twice'], a: 1, why: '"Pre-" means before: preview, preheat, pretest.' },
      { q: "The suffix '-est' in 'tallest' means ___.", o: ['a little', 'the most', 'the least'], a: 1, why: 'Tall, taller, tallest: "-est" is the most of all.' },
      { q: "In 'bicycle', the prefix 'bi-' means ___.", o: ['two', 'fast', 'round'], a: 0, why: 'Two wheels. Bi- also gives us binoculars (two eyes).' },
      { q: "The root 'aud' means 'hear'. An 'audience' is a group that ___.", o: ['performs', 'listens', 'pays'], a: 1, why: 'Audience, audio, audible: all about hearing.' },
    ],
  },
  spelling: {
    title: 'Spelling', icon: '🐝', skill: 'Spelling',
    intro: 'Three spellings, one is right. Trust your eyes, then check the tip.',
    items: [
      { q: 'Which is spelled correctly?', o: ['becuase', 'because', 'beacause'], a: 1, why: 'Big Elephants Can Always Understand Small Elephants: b-e-c-a-u-s-e.' },
      { q: 'Which is spelled correctly?', o: ['friend', 'freind', 'frend'], a: 0, why: 'A friend is there to the END: fri-END.' },
      { q: 'Which is spelled correctly?', o: ['beautifull', 'butiful', 'beautiful'], a: 2, why: 'Big Elephants Are Ugly: b-e-a-u, then -tiful with one L.' },
      { q: 'Which is spelled correctly?', o: ['seperate', 'separate', 'separete'], a: 1, why: 'There is A RAT in sep-A-RAT-e.' },
      { q: 'Which is spelled correctly?', o: ['receive', 'recieve', 'receeve'], a: 0, why: 'I before E except after C: rec-EI-ve.' },
      { q: 'Which is spelled correctly?', o: ['definately', 'definitly', 'definitely'], a: 2, why: 'It is FINITE inside: de-FINITE-ly.' },
      { q: 'Which is spelled correctly?', o: ['tomorrow', 'tommorow', 'tomorow'], a: 0, why: 'One M, two Rs: to-mor-row.' },
      { q: 'Which is spelled correctly?', o: ['beleive', 'believe', 'belive'], a: 1, why: 'Never beLIEve a LIE: be-LIE-ve.' },
      { q: 'Which is spelled correctly?', o: ['suprise', 'surprize', 'surprise'], a: 2, why: 'Two Rs, and it ends in -ise: sur-prise.' },
      { q: 'Which is spelled correctly?', o: ['different', 'diffrent', 'differant'], a: 0, why: 'Two Fs and -ent: dif-fer-ent.' },
    ],
  },
  conventions: {
    title: 'Conventions', icon: '✒️', skill: 'Punctuation & Capitalization',
    intro: 'Capitals, commas, apostrophes and end marks. Pick the sentence that gets the rule right.',
    items: [
      { q: 'Which sentence is correct?', o: ['My cousin lives in austin, texas.', 'My cousin lives in Austin, Texas.', 'My Cousin lives in Austin, texas.'], a: 1, why: 'City and state names are proper nouns: capital A, capital T. "Cousin" is not a name.' },
      { q: 'Which sentence is correct?', o: ["The dog's bowl is empty.", "The dogs bowl is empty.", "The dog's bowl is empty"], a: 0, why: 'The bowl belongs to the dog, so dog gets an apostrophe-s, and the sentence needs its period.' },
      { q: 'Which sentence is correct?', o: ['We packed sandwiches apples and juice.', 'We packed sandwiches, apples, and juice.', 'We packed, sandwiches, apples, and juice.'], a: 1, why: 'Commas separate items in a list. No comma after "packed".' },
      { q: 'Which sentence is correct?', o: ['Watch out for that car', 'Watch out for that car!', 'watch out for that car!'], a: 1, why: 'A warning gets an exclamation mark, and every sentence starts with a capital.' },
      { q: 'Which sentence is correct?', o: ["Its time to go, and it's raining.", "It's time to go, and its raining.", "It's time to go, and it's raining."], a: 2, why: 'Both mean "it is", so both are "it\'s" with the apostrophe.' },
      { q: 'Which sentence is correct?', o: ['On monday we start our project.', 'On Monday we start our Project.', 'On Monday we start our project.'], a: 2, why: 'Days of the week are capitalized. "Project" is an ordinary noun.' },
      { q: 'Which sentence is correct?', o: ['"Can we leave now?" asked Priya.', '"Can we leave now" asked Priya?', '"Can we leave now?", asked Priya.'], a: 0, why: 'The question mark belongs inside the quotation marks, right after the question.' },
      { q: 'Which sentence is correct?', o: ['After lunch we went to the library.', 'After lunch, we went to the library.', 'After, lunch we went to the library.'], a: 1, why: 'A comma follows an introductory phrase like "After lunch".' },
      { q: 'Which sentence is correct?', o: ["The teachers' lounge has two coffee makers.", "The teachers lounge has two coffee makers.", "The teacher's lounge's has two coffee makers."], a: 0, why: 'The lounge belongs to many teachers: plural, then the apostrophe.' },
      { q: 'Which sentence is correct?', o: ['I wanted to go, but it was too late.', 'I wanted to go but, it was too late.', 'I wanted to go, but, it was too late.'], a: 0, why: 'The comma goes before "but" when it joins two complete sentences.' },
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

/*
 * Language: the BANKS above are the lesson itself, so they stay in English —
 * every `q` that carries the sentence under study and every option `o`. Only
 * the coaching voice is translated at the render site: intros, skill labels,
 * the `why` notes, and the prompts below, which are pure instructions with no
 * English item inside them.
 */
const INSTRUCTION_PROMPTS = new Set([
  'Which one is a complete sentence?',
  'Which is spelled correctly?',
  'Which sentence is correct?',
])

const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const ROUND_SIZE = 8
// Same gate the board uses: 90%+ pays 20, 70–89% pays 10, under 70% pays nothing.
function coinsFor(score, total) {
  if (!total) return 0
  const pct = Math.round((score / total) * 100)
  return pct >= 90 ? 20 : pct >= 70 ? 10 : 0
}

function CoinAward({ coins }) {
  const t = useT()
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!coins) return undefined
    let n = 0
    const id = setInterval(() => {
      n += 1
      setShown(n)
      if (n >= coins) clearInterval(id)
    }, coins > 10 ? 35 : 50)
    return () => clearInterval(id)
  }, [coins])
  if (!coins) return null
  return (
    <div className="coin-award" role="status" aria-label={t('+{n} coins', { n: coins })}>
      <span className="coin-award-disc" aria-hidden />
      <div className="coin-award-num" aria-hidden>+{shown}</div>
    </div>
  )
}

function RoundActions({ onAgain, onClose, againFirst }) {
  const t = useT()
  const again = <button key="again" className={againFirst ? 'btn' : 'btn ghost'} style={{ width: '100%', justifyContent: 'center' }} onClick={onAgain}>{t('Play again')}</button>
  const back = <button key="back" className={againFirst ? 'btn ghost' : 'btn'} style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>{t('Back to the board')}</button>
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{againFirst ? <>{again}{back}</> : <>{back}{again}</>}</div>
}

function QuizGame({ bank, onClose, onFinished }) {
  const t = useT()
  const [items, setItems] = useState(() => shuffle(bank.items).slice(0, ROUND_SIZE))
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null) // option index after answering
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const finished = idx >= items.length
  const earned = coinsFor(score, items.length)
  const it = items[idx]
  // The question text, at the level the student reads. A pure instruction
  // prompt is translated; a sentence under study stays in English, so it is
  // also spoken in English whatever the interface language is.
  const isInstruction = it ? INSTRUCTION_PROMPTS.has(it.q) : false
  const qText = it ? (isInstruction ? t(it.q) : it.q) : ''

  function pick(i) {
    if (picked != null) return
    setPicked(i)
    if (i === it.a) { setScore((s) => s + 1); setStreak((s) => { const n = s + 1; setBest((b) => Math.max(b, n)); return n }) }
    else setStreak(0)
  }
  function next() {
    setPicked(null)
    if (idx + 1 >= items.length) { setIdx(items.length); onFinished && onFinished({ score, total: items.length }) }
    else setIdx(idx + 1)
  }
  function playAgain() {
    setItems(shuffle(bank.items).slice(0, ROUND_SIZE))
    setIdx(0)
    setPicked(null)
    setScore(0)
    setStreak(0)
    setBest(0)
  }

  return (
    <div>
      {finished ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 46 }}>{score >= items.length - 1 ? '🏆' : score >= items.length / 2 ? '🌟' : '💪'}</div>
          <h3 style={{ margin: '6px 0 4px', fontSize: 22 }}>{t('{score} of {total} correct!', { score, total: items.length })}</h3>
          <CoinAward coins={earned} />
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 16px' }}>
            {best >= 4 ? t('Best streak: {n} in a row 🔥', { n: best }) : score >= items.length / 2 ? t('Solid round — play again to beat it!') : t('Every round makes the next one easier.')}
          </p>
          <RoundActions onAgain={playAgain} onClose={onClose} againFirst={earned === 0} />
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 800, color: 'var(--muted)', marginBottom: 10 }}>
            <span>{t('Question {n} of {total}', { n: idx + 1, total: items.length })}</span>
            <span>⭐ {score}{streak >= 2 ? ` · ${t('🔥 {n} streak', { n: streak })}` : ''}</span>
          </div>
          {/* The sentence under study stays in English; only a pure instruction prompt is translated.
              The question is the one thing on this screen worth hearing, so the Listen lives here. */}
          <div style={{ background: '#eef4f7', borderRadius: 12, padding: '14px 16px', marginBottom: 12, fontSize: 16.5, fontWeight: 700, lineHeight: 1.45, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ flex: 1, minWidth: 0 }}><Glossed text={qText} /></span>
            <Speak text={qText} lang={isInstruction ? undefined : 'en'} />
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
              💡 <Glossed text={t(it.why)} />
            </div>
          )}
          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <button className="btn" disabled={picked == null} onClick={next}>
              {idx + 1 >= items.length ? t('See my score →') : t('Next →')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StretchGame({ onClose, onFinished }) {
  const t = useT()
  const say = useSay()
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
    else { setRound(-1); onFinished && onFinished({ score: null, total: null }) }
  }
  function playAgain() {
    setRound(0)
    setText('')
    setDone([])
  }

  if (round === -1) return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 15 }}><Glossed text={say('You stretched {n} sentences — nice fluency workout! 💪', { n: done.length })} /></p>
      <CoinAward coins={10} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0', textAlign: 'left' }}>
        {done.map((d, i) => (
          <div key={i} style={{ background: '#f6f8f9', borderRadius: 10, padding: '8px 12px', fontSize: 14 }}>
            <span style={{ color: 'var(--muted)' }}>{d.base}</span> → <b>{d.stretched || t('(skipped)')}</b>
          </div>
        ))}
      </div>
      <RoundActions onAgain={playAgain} onClose={onClose} againFirst={false} />
    </div>
  )
  return (
    <div>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>{t('Round {n} of {total}', { n: round + 1, total: STRETCH_ROUNDS.length })}</div>
      <div style={{ background: '#eef4f7', borderRadius: 12, padding: 16, marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{say('Stretch this sentence:')}</div>
        {/* The sentence being stretched is the English writing itself — never translated. */}
        <div style={{ fontSize: 20, fontWeight: 700 }}>{r.base}</div>
        {/* The round's ask is the direction — the one Listen on this screen. */}
        <div style={{ fontSize: 13, color: 'var(--cc-blue)', marginTop: 6 }}><Directions text={r.ask} /></div>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} autoFocus
        placeholder={say('Start with "{base}…" and keep going', { base: r.base.replace(/\.$/, '') })}
        style={{ width: '100%', minHeight: 90, borderRadius: 10, border: '1px solid var(--line)', padding: 12, fontFamily: 'inherit', fontSize: 15, resize: 'vertical' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <span style={{ fontSize: 13, color: strong ? 'var(--good)' : 'var(--muted)' }}>
          {extra === 0 ? say('Add at least a few vivid words') : strong ? t('🔥 Now that paints a picture!') : t('{n} words — keep stretching', { n: extra })}
        </span>
        <button className="btn" disabled={extra < 2} onClick={next}>{round + 1 < STRETCH_ROUNDS.length ? t('Next →') : t('Finish')}</button>
      </div>
    </div>
  )
}

export default function FluencyGame({ gameKey = 'stretch', onClose, onFinished }) {
  const t = useT()
  const bank = BANKS[gameKey]
  // Game titles are product names — they stay in English in every language.
  const title = bank ? `${bank.icon} ${bank.title}` : '✨ Sentence Stretch'
  const skill = bank ? bank.skill : 'Sentence Fluency'
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }} onClick={onClose}>
      <div className="card" style={{ width: 560, maxWidth: '92vw', maxHeight: '92vh', overflowY: 'auto', padding: 26 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          {/* The eyebrow and the title carry the heavy words — Fluency,
              Transitions, Conventions, Fragment — so they are tappable. */}
          <div><span className="eyebrow"><Glossed text={`${t('Fluency Game')} · ${t(skill)}`} /></span><h2 style={{ margin: '2px 0', fontSize: 20 }}><Glossed text={title} /></h2></div>
          <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: 'var(--muted)' }}>×</button>
        </div>
        {bank && <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px' }}><Directions text={bank.intro} /></p>}
        {bank
          ? <QuizGame bank={bank} onClose={onClose} onFinished={onFinished} />
          : <StretchGame onClose={onClose} onFinished={onFinished} />}
      </div>
    </div>
  )
}
