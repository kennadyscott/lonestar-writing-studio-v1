// The Proof Room — worksheets as learning paths.
//
// Shape mirrors how the worksheets are actually built: a TOPIC holds several
// core worksheets, each with a Skill Builder shadow, all ending at one Full
// Topic capstone. A worksheet is never broken apart — its activities run in
// order and score as one piece of work, because they were written for cohesion.
//
//   Edit Drafts: Parts of Speech
//     core   Irregular Verbs → Adjectives → Conjunctive Adverbs → Prepositions → Pronouns
//     SB     one per core worksheet, unlocked only when that worksheet scores under 85%
//     full   Full Topic: Edit Drafts: Parts of Speech
//
// Activity types
//   hunt  a paragraph with errors planted inline as [[wrong|right]]
//   fix   sentences to complete or correct, with a word bank
//
// Job 1's hunt paragraph is verbatim from "Irregular Verbs.pptx" (Grade 5).

export const PASS_MARK = 85

const hunt = (brief, text, hint) => ({ kind: 'hunt', brief, text, hint })
const fix = (brief, bank, items, hint) => ({ kind: 'fix', brief, bank, items, hint })
// maze: S start, X finish, # wall, . open, A–J gates. Every gate sits on the only
// route through, so the verbs get corrected in the order the path meets them.
const maze = (brief, grid, gates, hint) => ({ kind: 'maze', brief, grid, gates, hint })

export const TOPICS = [
  {
    id: 'topic_pos',
    title: 'Edit Drafts: Parts of Speech',
    short: 'Parts of Speech',
    grade: 5,
    standards: 'TEKS 5.11D ii · iv · v · vi',
    blurb: 'Five skills, then one full-topic proof to finish the path.',
    icon: '✍️',
    core: [
      {
        id: 'ws_verbs', title: 'Irregular Verbs', skill: 'Past-tense verbs that break the rules',
        activities: [
          hunt('Four verbs in this story are wrong. Tyler would not want to turn this in.',
            `After dinner, Tyler looked for his math homework but could not find it anywhere. He [[runned|ran]] upstairs to check his room and searched under his bed. His sister [[catched|caught]] him tossing papers across the floor and offered to help. Tyler suddenly remembered that he had [[writed|written]] part of the assignment in the car after soccer practice. A few minutes later, they [[finded|found]] the homework inside his backpack, and Tyler happily brought it to the kitchen table to finish.`,
            'Every one of them is a verb that does not just add -ed.'),
          maze('Walk from START to FINISH. Every verb in your way is written wrong.',
            [
              'S.A.####',
              '#.#.####',
              '###B####',
              '#C..####',
              '#.###.##',
              '#...D..#',
              '###.##E#',
              '###.##.X',
            ],
            {
              A: { wrong: 'BLOWED', right: 'blew' },
              B: { wrong: 'CHOOSED', right: 'chose' },
              C: { wrong: 'RINGED', right: 'rang' },
              D: { wrong: 'DRINKED', right: 'drank' },
              E: { wrong: 'SPEAKED', right: 'spoke' },
            },
            'Dead ends are dead ends — back up and try another way.'),
          fix('Put each verb in the past tense.', ['choose', 'win', 'know', 'think', 'draw'], [
            { given: 'The scientist ____ carefully about the experiment.', answer: 'thought' },
            { given: 'Maria ____ a topic for her research project.', answer: 'chose' },
            { given: 'She ____ a detailed map of the trail.', answer: 'drew' },
            { given: 'The team had ____ every game that season.', answer: 'won' },
            { given: 'We ____ the answer as soon as the teacher asked the question.', answer: 'knew' },
          ], 'Say the sentence out loud with "yesterday" in front of it.'),
        ],
      },
      {
        id: 'ws_adj', title: 'Adjectives', skill: 'Words that describe, and how they compare',
        activities: [
          hunt('Four describing words are wrong. Find them.',
            `The science fair was the [[goodest|best]] one our school has ever held. Dev built a volcano that was [[more taller|taller]] than he was. Next to it sat the [[beautifulest|most beautiful]] model of the solar system, painted by hand. The judges said choosing a winner was [[difficulter|more difficult]] than they expected, and every project deserved a ribbon.`,
            'Short words add -er and -est. Long words use more and most.'),
          fix('Choose the describing word that fits.', ['fastest', 'louder', 'careful', 'enormous', 'happier'], [
            { given: 'A cheetah is the ____ land animal on earth.', answer: 'fastest' },
            { given: 'Thunder is much ____ than rain.', answer: 'louder' },
            { given: 'Be ____ with the glass beaker.', answer: 'careful' },
            { given: 'The whale was ____ — longer than our classroom.', answer: 'enormous' },
            { given: 'She felt ____ after she finished her draft.', answer: 'happier' },
          ], 'Two of these are comparing words. Which sentences compare?'),
        ],
      },
      {
        id: 'ws_conj', title: 'Conjunctive Adverbs', skill: 'Joining ideas with however, therefore, meanwhile',
        activities: [
          hunt('Four joining words are the wrong ones for the meaning.',
            `We planned to hike on Saturday. [[Therefore|However]], the forecast called for storms all weekend. My dad checked the radar twice; [[however|therefore]], we moved the trip to Sunday. My sister packed the cooler. [[However|Meanwhile]], I loaded the tent into the truck. The sun came out by noon; [[meanwhile|consequently]], the trail was dry enough to climb.`,
            'However = but. Therefore = so. Meanwhile = at the same time.'),
          fix('Join the two ideas with the right word.', ['however', 'therefore', 'meanwhile', 'finally', 'instead'], [
            { given: 'The library closed early; ____, we studied at home.', answer: 'therefore' },
            { given: 'I wanted the blue folder; ____, only green ones were left.', answer: 'however' },
            { given: 'Dad cooked dinner. ____, I set the table.', answer: 'meanwhile' },
            { given: 'We searched for an hour. ____, we found the key.', answer: 'finally' },
            { given: 'She did not guess. ____, she reread the passage.', answer: 'instead' },
          ], 'Read both halves first, then ask what the second half is doing to the first.'),
        ],
      },
      {
        id: 'ws_prep', title: 'Prepositions', skill: 'Words that place things in time and space',
        activities: [
          hunt('Four prepositions do not fit. Fix them.',
            `Our class waited [[at|in]] line for the bus [[on|at]] eight o'clock. The museum sat [[in|on]] the corner of Fifth and Main, right across from the park. We walked [[through|between]] the two marble lions and up the steps, and a guide met us just inside the door.`,
            'In, on, at each take a different kind of place or time.'),
          fix('Choose the preposition that fits.', ['beneath', 'during', 'across', 'toward', 'without'], [
            { given: 'The cat slept ____ the porch steps.', answer: 'beneath' },
            { given: 'We stayed quiet ____ the presentation.', answer: 'during' },
            { given: 'A bridge stretched ____ the river.', answer: 'across' },
            { given: 'The puppy ran ____ the open gate.', answer: 'toward' },
            { given: 'He finished the puzzle ____ any help.', answer: 'without' },
          ], 'Some place things in space, some in time.'),
        ],
      },
      {
        id: 'ws_pron', title: 'Pronouns', skill: 'Words that stand in for nouns — and agree with them',
        activities: [
          hunt('Four pronouns do not match what they stand for.',
            `Marcus and [[me|I]] signed up for the science fair together. The judges gave [[we|us]] a table near the door. Every student brought [[their|his or her]] own poster board. When Ana finished, [[them|she]] helped us carry the last of the supplies inside.`,
            'Try the sentence with only one person in it and your ear will hear it.'),
          fix('Choose the pronoun that fits.', ['I', 'me', 'they', 'its', 'whom'], [
            { given: 'Jorge and ____ walked to the library.', answer: 'I' },
            { given: 'The coach handed the ball to ____.', answer: 'me' },
            { given: 'The twins said ____ would bring the poster.', answer: 'they' },
            { given: 'The plant lost ____ leaves in the cold.', answer: 'its' },
            { given: 'To ____ should I address the letter?', answer: 'whom' },
          ], 'Its shows ownership. It is always shortens to it’s.'),
        ],
      },
    ],

    // Skill Builders: shorter, more scaffolded, and only ever seen after a miss.
    skillBuilders: {
      ws_verbs: {
        id: 'sb_verbs', title: 'SB: Irregular Verbs', skill: 'Build it back up, one verb at a time',
        activities: [
          fix('These verbs never add -ed. Type the past tense.', ['go', 'eat', 'see', 'take'], [
            { given: 'Yesterday I ____ to the store.', answer: 'went' },
            { given: 'She ____ breakfast before school.', answer: 'ate' },
            { given: 'We ____ a hawk on the fence.', answer: 'saw' },
            { given: 'He ____ the bus home.', answer: 'took' },
          ], 'Say "yesterday I..." before each one.'),
          hunt('Two verbs are wrong in this short note.',
            `Last night I [[readed|read]] two chapters of my book. Then I [[felled|fell]] asleep with the lamp still on.`,
            'Both of these change their whole shape in the past tense.'),
        ],
      },
      ws_adj: {
        id: 'sb_adj', title: 'SB: Adjectives', skill: 'Describing and comparing, step by step',
        activities: [
          fix('Compare two things: add -er, or use more.', ['tall', 'interesting', 'cold', 'careful'], [
            { given: 'A giraffe is ____ than a horse.', answer: 'taller' },
            { given: 'This book is ____ than the last one.', answer: 'more interesting' },
            { given: 'December is ____ than October.', answer: 'colder' },
            { given: 'Be ____ than you were last time.', answer: 'more careful' },
          ], 'One or two syllables take -er. Three or more take "more".'),
          hunt('Two describing words are wrong here.',
            `That was the [[funnest|most fun]] field trip of the year, and the bus ride home felt [[shorter|shorter]] than the ride there.`,
            'Only one of these two is actually broken — read carefully.'),
        ],
      },
      ws_conj: {
        id: 'sb_conj', title: 'SB: Conjunctive Adverbs', skill: 'However, therefore, meanwhile — one at a time',
        activities: [
          fix('Which word joins these two ideas?', ['however', 'therefore', 'meanwhile'], [
            { given: 'It rained all morning; ____, the game was canceled.', answer: 'therefore' },
            { given: 'I studied hard; ____, I still found the test tricky.', answer: 'however' },
            { given: 'Mom washed the car. ____, I mowed the lawn.', answer: 'meanwhile' },
            { given: 'The pen ran out of ink; ____, I borrowed a pencil.', answer: 'therefore' },
          ], 'Ask: does the second idea contrast, follow, or happen at the same time?'),
        ],
      },
      ws_prep: {
        id: 'sb_prep', title: 'SB: Prepositions', skill: 'In, on, at — and the rest',
        activities: [
          fix('Choose in, on, or at.', ['in', 'on', 'at'], [
            { given: 'We meet ____ 3:00 every Tuesday.', answer: 'at' },
            { given: 'My birthday is ____ July.', answer: 'in' },
            { given: 'The test is ____ Friday.', answer: 'on' },
            { given: 'She sat ____ the front row.', answer: 'in' },
          ], 'At = a clock time. On = a day. In = a month or a space you are inside.'),
        ],
      },
      ws_pron: {
        id: 'sb_pron', title: 'SB: Pronouns', skill: 'I or me, they or them',
        activities: [
          fix('Choose the pronoun that fits.', ['I', 'me', 'she', 'her'], [
            { given: 'Dad and ____ built the shelf.', answer: 'I' },
            { given: 'The teacher called on ____.', answer: 'me' },
            { given: '____ and Marcus finished first.', answer: 'she' },
            { given: 'Give the folder to ____.', answer: 'her' },
          ], 'Take the other person out of the sentence and say it again.'),
        ],
      },
    },

    full: {
      id: 'ws_full', title: 'Full Topic: Edit Drafts: Parts of Speech',
      skill: 'All five skills in one piece of writing',
      activities: [
        hunt('Six errors are hiding in this draft — one from each skill you have practiced, and one extra.',
          `Our class [[goed|went]] to the state capitol last Friday. It was the [[most big|biggest]] building I had ever walked into. Marcus and [[me|I]] stayed near the front of the group. Our guide met us [[in|at]] the top of the marble stairs. She talked for almost an hour; [[however|therefore]], we understood the whole history by the end. On the bus home, I [[writed|wrote]] two pages about it in my notebook.`,
          'One irregular verb, one adjective, one pronoun, one preposition, one joining word — and a second verb.'),
        fix('Finish each sentence with the right word.', ['knew', 'more careful', 'whom', 'during', 'meanwhile'], [
          { given: 'I ____ the answer before she finished asking.', answer: 'knew' },
          { given: 'This draft is ____ than my first one.', answer: 'more careful' },
          { given: 'To ____ did you give the permission slip?', answer: 'whom' },
          { given: 'Please stay seated ____ the assembly.', answer: 'during' },
          { given: 'I revised my ending. ____, my partner fixed the opening.', answer: 'meanwhile' },
        ], 'Each one comes from a different skill on this path.'),
      ],
    },
  },
]

/* Parse [[wrong|right]] into tokens the client renders and taps. */
export function parseHunt(text) {
  const parts = (text || '').split(/(\[\[[^\]]+\]\])/g)
  const tokens = []
  let errors = 0
  for (const part of parts) {
    const m = part.match(/^\[\[([^|]+)\|([^\]]+)\]\]$/)
    if (m) { tokens.push({ t: m[1], bad: true, fix: m[2], i: errors }); errors++ }
    else if (part) tokens.push({ t: part })
  }
  return { tokens, errorCount: errors }
}

/* A worksheet with its activities ready to play, and its point total. */
export function prepare(ws) {
  const activities = ws.activities.map((a) =>
    a.kind === 'hunt' ? { ...a, ...parseHunt(a.text), text: undefined } : { ...a })
  const points = activities.reduce((n, a) =>
    n + (a.kind === 'hunt' ? a.errorCount : a.kind === 'maze' ? Object.keys(a.gates).length : a.items.length), 0)
  return { ...ws, activities, points }
}

export function topicFor(id) {
  const t = TOPICS.find((x) => x.id === id) || TOPICS[0]
  return {
    ...t,
    core: t.core.map(prepare),
    skillBuilders: Object.fromEntries(Object.entries(t.skillBuilders).map(([k, v]) => [k, prepare(v)])),
    full: prepare(t.full),
  }
}

export const topicList = () => TOPICS.map((t) => ({
  id: t.id, title: t.title, short: t.short, grade: t.grade, standards: t.standards,
  blurb: t.blurb, icon: t.icon, stops: t.core.length + 1,
}))
