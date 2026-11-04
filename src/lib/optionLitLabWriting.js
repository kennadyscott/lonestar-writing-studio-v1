/*
 * OPTION, not the product (Kennady, November 3, 2026: "I want to see what this would look like in the actual student prototype
 * platform we've been building" ... "as an OPTION - do not override anything that we have built").
 *
 * Luna's Writing Nook as Lit Lab's Writing strand. It is off unless the address has ?option=litlab; with it off, nothing here
 * runs and every page is exactly as built. With it on:
 *   - Luna's six modules are paths in their own land, Writing (after Composition), opened in order. Module 1 (Short Constructed Response, Level 2, grades
 *     5-6) is built the
 *     Lit Lab way: a short check, a lesson and practice per breakout (Topic Sentence, Evidence or Examples, Explanation,
 *     Concluding Sentence), the Full Topic (Complete SCR), and a check at the end.
 *   - Home's Luna bar is Lit Lab's: the path under way (reading or writing, one at a time) and Begin.
 *
 * Breakout names and order are Luna's (CMS crawl, September 24, 2026). The passage, lessons and questions are sample content
 * written for this option, not Luna's; writing is checked in code against named moves, never by AI.
 */

export const OPTION_TOPIC_ID = 'opt_litlab_scr_g5'
/** Luna's modules run in order (Kennady, November 3, 2026: "really be followed in a sequence"), in their own Writing land. `seq` is the module number; a module opens once the one before it is finished. */
export const LUNA_SEQUENCE = 'luna'

/** On only when the address asks for it. */
export function litLabWritingOn() {
  try { return new URLSearchParams(window.location.search).get('option') === 'litlab' } catch { return false }
}

const need = (label, rule) => ({ label, rule })
const HAS = (...any) => ({ type: 'contains', any })
const ANY = (...of) => ({ type: 'any', of })
const options = (...labels) => labels.map((text, i) => ({ id: String.fromCharCode(97 + i), text }))

const PASSAGE = [
  'When the empty lot on Pine Street filled up with weeds and broken bottles, most neighbors walked past it without looking.',
  'Ten-year-old Rosa did not.',
  'Every day on her way home from school, she pictured rows of tomatoes and sunflowers.',
  'One Saturday, Rosa knocked on doors with a clipboard and asked, “Would you help turn the lot into a garden?”',
  'Some neighbors shook their heads, but Mr. Ortiz from the corner store offered shovels, and the twins upstairs promised to pull weeds.',
  'The work was harder than Rosa expected.',
  'The ground was packed hard, and the first seeds washed away in a storm.',
  'Rosa felt like giving up, but she remembered Mr. Ortiz saying, “Gardens grow slowly. So do good ideas.”',
  'The next week, she planted again, this time with a fence of sticks to hold the soil.',
  'By August, the lot was green, and neighbors who once walked past now stopped to pick beans and trade recipes.',
]
const QUESTION = 'What kind of person is Rosa? Use evidence from the text to support your answer.'

const TRAIT = ANY(HAS('determined', 'does not give up', "doesn't give up", 'did not give up', "didn't give up", 'never gives up', 'never gave up', 'keeps trying', 'kept trying', 'hard working', 'hardworking', 'persistent', 'not a quitter'))
const INTRO = HAS('the text says', 'according to', 'in the text', 'the story says', 'the passage says', 'the author writes', 'in the story', 'the text states')
const DETAIL = HAS('planted again', 'giving up', 'storm', 'washed away', 'knocked on doors', 'clipboard', 'fence of sticks')
const EXPLAIN = HAS('this shows', 'this proves', 'this means', 'this tells', 'because', 'which shows')

const sheet = (id, title, skill, activities) => ({ id, title, standards: ['5.7C'], skill, activities })

const core = [
  sheet('opt_scr_topic', 'Topic Sentence', 'Answer the question in one clear sentence', [
    { kind: 'passage', brief: 'Read the story. Then answer the questions.', hint: 'A topic sentence uses the question’s key words and gives your answer.', sentences: PASSAGE, questions: [
      { kind: 'blank', ask: `Question: “${QUESTION}” Which is the best topic sentence?`, answer: 'Rosa is a determined person who does not give up.', options: ['Rosa likes sunflowers.', 'Rosa is a determined person who does not give up.', 'This story is about a garden.', 'I think it was a good story.'] },
      { kind: 'blank', ask: 'Which words from the question should your topic sentence repeat?', answer: 'Rosa ... kind of person', options: ['Rosa ... kind of person', 'evidence ... text', 'support ... answer', 'Pine Street ... weeds'] },
    ] },
    { kind: 'compose', brief: 'Write your own topic sentence.', hint: 'Repeat the key words, then give your answer.', items: [
      { prompt: 'Write a topic sentence that answers: How does the neighborhood change in the story?', checks: [
        need('Names the neighborhood or neighbors', HAS('neighborhood', 'neighbors')),
        need('Says how it changes', HAS('change', 'became', 'grew', 'now', 'went from', 'closer', 'together', 'friendlier')),
        need('One sentence', { type: 'maxSentences', n: 1 }),
        need('A full thought', { type: 'minWords', n: 6 }),
      ], model: 'The neighborhood changes from a place where people ignore each other to a place where neighbors work together.' },
    ] },
  ]),
  sheet('opt_scr_evidence', 'Evidence or Examples', 'Prove your answer with words from the text', [
    { kind: 'passage', brief: 'Find the proof in the story.', hint: 'The best evidence shows Rosa doing the thing your answer says.', sentences: PASSAGE, questions: [
      { kind: 'blank', ask: 'Which sentence best proves that Rosa is determined?', answer: PASSAGE[8], options: [PASSAGE[2], PASSAGE[4], PASSAGE[8], PASSAGE[9]] },
      { kind: 'blank', ask: 'Which words tell the reader that evidence is coming?', answer: 'According to the text,', options: ['I think that', 'According to the text,', 'In my opinion,', 'The end.'] },
    ] },
    { kind: 'compose', brief: 'Write one sentence of evidence.', hint: 'Start with words like “The text says” and use a detail from the story.', items: [
      { prompt: 'Give evidence that Rosa is determined. Start with words that show it comes from the text.', checks: [
        need('Shows it comes from the text', INTRO),
        need('Uses a detail from the story', DETAIL),
        need('A full sentence', { type: 'minWords', n: 8 }),
      ], model: 'The text says that after the storm washed away her seeds, Rosa planted again with a fence of sticks.' },
    ] },
  ]),
  sheet('opt_scr_explain', 'Explanation', 'Tell how the evidence proves your answer', [
    { kind: 'passage', brief: 'Pick the explanation that does its job.', hint: 'An explanation tells WHY the evidence proves the answer. It does not just repeat the evidence.', sentences: PASSAGE, questions: [
      { kind: 'blank', ask: 'Evidence: “The next week, she planted again.” Which sentence best explains it?', answer: 'This shows Rosa is determined because she kept trying after the storm ruined her first seeds.', options: ['This shows Rosa planted seeds.', 'This shows Rosa is determined because she kept trying after the storm ruined her first seeds.', 'Rosa’s garden had sunflowers.', 'Gardens need a lot of water.'] },
    ] },
    { kind: 'compose', brief: 'Write the explanation.', hint: 'Start with “This shows” and say how the evidence proves Rosa is determined.', items: [
      { prompt: 'Explain how this evidence shows Rosa is determined: “Rosa felt like giving up, but … she planted again.”', checks: [
        need('Uses explaining words', EXPLAIN),
        need('Connects to your answer', TRAIT),
        need('Says more than the evidence', { type: 'minWords', n: 10 }),
      ], model: 'This shows Rosa is determined because she kept working on the garden even when she wanted to quit.' },
    ] },
  ]),
  sheet('opt_scr_conclude', 'Concluding Sentence', 'Wrap up your answer in new words', [
    { kind: 'passage', brief: 'Choose the best way to finish.', hint: 'A concluding sentence says your answer again in new words. It does not add new evidence.', sentences: PASSAGE, questions: [
      { kind: 'blank', ask: 'Which is the best concluding sentence for a response about Rosa being determined?', answer: 'Rosa’s determination is what turned an empty lot into a garden.', options: ['Also, Mr. Ortiz had shovels.', 'The end.', 'Rosa’s determination is what turned an empty lot into a garden.', 'Sunflowers can grow very tall.'] },
    ] },
    { kind: 'compose', brief: 'Write a concluding sentence.', hint: 'Say your answer again in new words. Leave out new evidence.', items: [
      { prompt: 'Write a concluding sentence for a response that says Rosa is determined.', checks: [
        need('Names Rosa', HAS('rosa')),
        need('Returns to your answer', TRAIT),
        need('One sentence', { type: 'maxSentences', n: 1 }),
        need('Not “The end”', { type: 'notContains', any: ['the end'] }),
      ], model: 'Because Rosa never gave up, an empty lot became a garden for the whole neighborhood.' },
    ] },
  ]),
]

const full = sheet('opt_scr_full', 'Full Topic: Complete SCR', 'Put all four parts together', [
  { kind: 'passage', brief: 'Write a complete short constructed response.', hint: 'Topic sentence, evidence, explanation, concluding sentence.', sentences: PASSAGE, questions: [
    { kind: 'write', ask: QUESTION, placeholder: 'Rosa is …', checks: [
      need('Topic sentence answers the question', ANY(TRAIT, HAS('rosa is'))),
      need('Evidence from the text', INTRO),
      need('A detail from the story', DETAIL),
      need('An explanation', EXPLAIN),
      need('Four or more sentences', { type: 'minSentences', n: 4 }),
    ], model: 'Rosa is a determined person who does not give up. According to the text, when the storm washed away her first seeds, “she planted again, this time with a fence of sticks.” This shows Rosa is determined because she kept working even when she felt like quitting. Rosa’s determination is what turned an empty lot into a garden.' },
  ] },
])

const step = (title, body, example) => ({ title, body, ...(example ? { example } : {}) })
const lessons = {
  opt_scr_topic: { title: 'Topic sentence', steps: [
    step('Read the question for its job', 'The question tells you what to write about. Find its key words.', 'What kind of person is Rosa? → key words: Rosa, kind of person'),
    step('Turn the question into an answer', 'Repeat the key words and give your answer in one sentence.', 'Rosa is a determined person.'),
    step('Keep it short', 'The topic sentence only answers. The proof comes next.'),
  ] },
  opt_scr_evidence: { title: 'Evidence or examples', steps: [
    step('Go back to the text', 'Your answer needs proof. Look for a sentence that shows it.'),
    step('Pick the strongest proof', 'The best evidence shows the character doing what your answer says.', '“The next week, she planted again.”'),
    step('Tell the reader it is evidence', 'Start with words like “The text says” or “According to the text.”', 'According to the text, Rosa planted again after the storm.'),
  ] },
  opt_scr_explain: { title: 'Explanation', steps: [
    step('Say why it proves your answer', 'Evidence shows. Explanation tells why it matters.'),
    step('Use explaining words', 'Start with “This shows” or “This proves.”', 'This shows Rosa is determined because she kept trying.'),
    step('Connect back to your answer', 'Use your answer word again, like determined.'),
  ] },
  opt_scr_conclude: { title: 'Concluding sentence', steps: [
    step('Wrap it up', 'The last sentence tells the reader you are finished.'),
    step('Say it again in new words', 'Return to your answer, but say it a new way.', 'Rosa’s determination turned an empty lot into a garden.'),
    step('No new evidence', 'Save new details for a new response.'),
  ] },
  opt_scr_full: { title: 'Put it all together', steps: [
    step('Four parts, in order', 'Topic sentence, evidence, explanation, concluding sentence.'),
    step('Check each part', 'Does each sentence do its job? Read it once for each part.'),
  ] },
}

const pre = { title: 'Before you begin: Short Constructed Response', items: [
  { id: 'opt-pre-1', kind: 'single', hint: 'A topic sentence answers the question using its key words.', prompt: 'Question: “Why does Rosa start the garden?” Which is the best topic sentence?', options: options('Rosa starts the garden because she wants the empty lot to be beautiful.', 'Gardens are nice.', 'The story has a storm in it.'), correct: ['a'] },
  { id: 'opt-pre-2', kind: 'single', hint: 'Evidence comes from the text.', prompt: 'Which sentence gives evidence?', options: options('I think Rosa is nice.', 'The text says Rosa knocked on doors with a clipboard.', 'Rosa is a good person.'), correct: ['b'] },
  { id: 'opt-pre-3', kind: 'order', hint: 'Answer first, then prove it, then explain it, then wrap it up.', prompt: 'Put the parts of a response in order.', options: options('Topic sentence', 'Evidence', 'Explanation', 'Concluding sentence'), correct: ['a', 'b', 'c', 'd'] },
  { id: 'opt-pre-4', kind: 'single', hint: 'A concluding sentence does not add new evidence.', prompt: 'Which is the best concluding sentence?', options: options('Also, there were twins upstairs.', 'Rosa’s hard work changed her whole neighborhood.', 'The end.'), correct: ['b'] },
] }
const post = { title: 'Show what you learned: Short Constructed Response', items: [
  { id: 'opt-post-1', kind: 'single', prompt: 'Question: “How do the neighbors feel about the garden at the end?” Which is the best topic sentence?', options: options('The neighbors feel proud of the garden at the end.', 'There are beans.', 'It is August.'), correct: ['a'] },
  { id: 'opt-post-2', kind: 'single', prompt: 'Which sentence gives evidence?', options: options('According to the text, neighbors stopped to pick beans and trade recipes.', 'The neighbors are happy, I think.', 'Gardens are good for neighborhoods.'), correct: ['a'] },
  { id: 'opt-post-3', kind: 'order', prompt: 'Put the parts of a response in order.', options: options('Topic sentence', 'Evidence', 'Explanation', 'Concluding sentence'), correct: ['a', 'b', 'c', 'd'] },
  { id: 'opt-post-4', kind: 'single', prompt: 'Which sentence explains the evidence?', options: options('This shows the neighbors feel proud because they now spend time in the garden together.', 'The neighbors picked beans.', 'Recipes are fun.'), correct: ['a'] },
] }

/** The writing path as a Lit Lab topic, in the Writing land at grade 5 (Luna Level 2 is grades 5-6). */
export const OPTION_TOPIC = {
  id: OPTION_TOPIC_ID,
  title: 'Short Constructed Response',
  short: 'SCR',
  grade: 5,
  state: 'TX',
  domain: 'Writing',
  standards: ['5.7C'],
  blurb: 'From Luna Module 1: four parts of a short response, then write a whole one.',
  icon: '✍️',
  option: true,
  seqGroup: LUNA_SEQUENCE,
  seq: 1,
  core,
  full,
}

/*
 * Modules 2-6 ("add them all because I want to see what the full composition area would look like"). Breakout names and order
 * are Luna's Level 2 lessons (CMS crawl, September 24, 2026). Their lessons and practice are not converted yet, so each step
 * reads "Content coming soon" on the path; ECR ends in writing a whole response, the others in a module check.
 */
const later = (n, id, title, short, icon, lessons, fullTitle) => ({
  id, title, short, grade: 5, state: 'TX', domain: 'Writing', standards: [], icon,
  blurb: `From Luna Module ${n}.`, option: true, seqGroup: LUNA_SEQUENCE, seq: n,
  core: lessons.map((t, i) => ({ id: `${id}_${i + 1}`, title: t, standards: [], skill: '', activities: [] })),
  full: { id: `${id}_full`, title: `Full Topic: ${fullTitle}`, standards: [], skill: '', activities: [] },
})
export const LATER_TOPICS = [
  later(2, 'opt_litlab_ecr_g5', 'Extended Constructed Response', 'ECR', '📝', ['Central Idea and Claim', 'Effective Organization', 'Selecting Evidence', 'Expression of Ideas', 'Conventions'], 'Write an Extended Constructed Response'),
  later(3, 'opt_litlab_stellar_g5', 'Stellar Writers', 'Stellar Writers', '⭐', ['Writing Sentences', 'Connecting Ideas', 'Details and Evidence', 'Vocabulary and Language'], 'Module 3 Check'),
  later(4, 'opt_litlab_process_g5', 'The Writing Process', 'Writing Process', '🗺️', ['Topic, Audience, Purpose', 'Annotating and Gathering Information', 'Writing an Outline', 'From Outline to Draft', 'Revise and Edit'], 'Module 4 Check'),
  later(5, 'opt_litlab_revision_g5', 'Revision', 'Revision', '🔁', ['Expanding Sentences', 'Adding and Removing Sentences', 'Elaborate, Combine, and Rearrange', 'Vocabulary and Language Skills'], 'Module 5 Check'),
  later(6, 'opt_litlab_editing_g5', 'Editing', 'Editing', '✏️', ['Capitalization', 'Usage', 'Punctuation', 'Spelling'], 'Module 6 Check'),
]
const LATER_IDS = new Set(LATER_TOPICS.map((t) => t.id))

/** The pathway's lessons and checks for the option topic. A fresh copy each time, like the demo's. */
export function optionPathwayFor(topic) {
  if (topic?.id === OPTION_TOPIC_ID) return JSON.parse(JSON.stringify({ preview: true, pre, post, lessons }))
  // not converted yet: the path shows its steps, each one "coming soon"
  if (LATER_IDS.has(topic?.id)) return { preview: true, lessons: {}, tests: false }
  return null
}

/** The topic list with the writing path added, when the option is on. */
export function withOptionTopics(topics) {
  if (!litLabWritingOn() || !Array.isArray(topics) || topics.some((t) => t.id === OPTION_TOPIC_ID)) return topics
  return [...topics, ...JSON.parse(JSON.stringify([OPTION_TOPIC, ...LATER_TOPICS]))]
}

/*
 * Prototype switch on Home's Lit Lab bar (Kennady, November 3, 2026: "give me a couple prototype controls here: already started,
 * not started, fully unlocked"). Already started loads SCR partway (pre-test and Topic Sentence done); Not started clears every
 * path's progress; Fully unlocked lifts every lock (one path, one area, module order) "so we can see it fully unlocked".
 */
const DEMO_KEY = 'lscr.litlabDemo'
const PATH_PREFIX = 'lscr.pathway-preview.v1.'
export const LITLAB_DEMOS = [['started', 'Already started'], ['new', 'Not started'], ['open', 'Fully unlocked']]
export function litLabDemo() {
  try { return localStorage.getItem(DEMO_KEY) || 'new' } catch { return 'new' }
}
/** Every lock lifted: the demo's Fully unlocked. */
export const litLabAllOpen = () => litLabWritingOn() && litLabDemo() === 'open'
export function setLitLabDemo(mode) {
  try {
    if (mode !== 'open') Object.keys(localStorage).filter((k) => k.startsWith(PATH_PREFIX)).forEach((k) => localStorage.removeItem(k))
    if (mode === 'started') localStorage.setItem(PATH_PREFIX + OPTION_TOPIC_ID, JSON.stringify({ started: true, pre: { complete: true, score: 50 }, lessons: { opt_scr_topic: true }, worksheets: { opt_scr_topic: { best: 90, passed: true, attempts: 1 } } }))
    localStorage.setItem(DEMO_KEY, mode)
  } catch { /* fine */ }
}
