/*
 * Language Bridge — the SIOP-aligned ELD support layer.
 *
 * Source: her "Language Bridge | SIOP" spec. Three levels condensed from the
 * ELPS/TELPAS five, nine support areas, each stepping down as proficiency
 * rises. The governing principle is scaffold ACCESS, not rigor: the question a
 * student answers is always the grade-level question. Only the support around
 * it changes.
 *
 * Level and interface language are BOTH teacher-set per student — they arrive
 * on the student record, never chosen by the student. The demo panel that
 * flips them is a demo affordance so we can explore all three quickly.
 */

export const LEVELS = [
  { id: 'beginning', label: 'Beginning', blurb: 'New to English', color: '#b4478a' },
  { id: 'intermediate', label: 'Intermediate', blurb: 'Developing academic English', color: '#0a7dba' },
  { id: 'advanced', label: 'Advanced', blurb: 'Near grade-level proficiency', color: '#2e9e6b' },
]
export const levelOf = (id) => LEVELS.find((l) => l.id === id) || null

// The nine areas, kept in the spec's order so the doc and the code line up.
export const SUPPORT_AREAS = [
  { id: 'prompt', label: 'Prompt support' },
  { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'input', label: 'Comprehensible input' },
  { id: 'sentence', label: 'Sentence support' },
  { id: 'structure', label: 'Response structure' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'production', label: 'Language production' },
  { id: 'translanguaging', label: 'Translanguaging' },
  { id: 'feedback', label: 'Feedback' },
]

// What each level gets, per area. `null` = no support at this level.
export const MATRIX = {
  beginning: {
    prompt: 'Prompt broken into small steps with visuals and simplified language',
    vocabulary: 'Picture glossary, bilingual glossary, audio pronunciation',
    input: 'Read aloud, slowed pacing, sentence-by-sentence highlighting',
    sentence: 'Full sentence frames',
    structure: 'Color-coded RACE organizer with frames filled in',
    evidence: 'Evidence choices highlighted for you',
    production: 'Say it aloud first, then speech-to-text',
    translanguaging: 'Fully translated directions and home-language brainstorming',
    feedback: 'One thing at a time, in both languages',
  },
  intermediate: {
    prompt: 'Prompt chunked with academic vocabulary clarified',
    vocabulary: 'Click a word for its definition',
    input: 'Read aloud optional, key words highlighted',
    sentence: 'Sentence starters',
    structure: 'RACE structure on the side for reference',
    evidence: 'You highlight evidence, we check it matches',
    production: 'Speech-to-text on the side',
    translanguaging: 'Key words and false cognates',
    feedback: 'Language-focused coaching',
  },
  advanced: {
    prompt: 'The original prompt, with optional vocabulary support',
    vocabulary: 'Nuance and precision only',
    input: null,
    sentence: 'Optional academic phrase bank',
    structure: null,
    evidence: null,
    production: null,
    translanguaging: null,
    feedback: 'Elaboration and precision',
  },
}

/* ---- Sentence support ------------------------------------------------- *
 * Beginning gets FRAMES (blanks to complete), not starters — the spec is
 * explicit about that. Intermediate gets starters. Advanced gets an optional
 * phrase bank and nothing is inserted for them.
 */
export const SENTENCE_SUPPORT = {
  beginning: {
    kind: 'frames',
    title: 'Sentence frames',
    hint: 'Finish each sentence. The blanks show you what goes there.',
    items: [
      'The question asks ______.',
      'I think ______ because ______.',
      'In the text it says, "______."',
      'This shows that ______.',
    ],
  },
  intermediate: {
    kind: 'starters',
    title: 'Sentence starters',
    hint: 'Start with one of these, then finish the idea in your own words.',
    items: [
      'The question asks…',
      'One reason is…',
      'According to the text…',
      'This evidence shows…',
      'Another example is…',
    ],
  },
  advanced: {
    kind: 'phrases',
    title: 'Academic phrase bank',
    hint: 'Optional. Reach for these when you want a more precise move.',
    items: [
      'The passage says…',
      'This demonstrates…',
      'Furthermore…',
      'This suggests that…',
      'In contrast…',
    ],
  },
}

/* ---- RACE organizer ---------------------------------------------------- */
// Labels are spelled out rather than the bare RACE words: the one-word forms
// collide with the strategy-anchor labels elsewhere, which translate as
// imperatives, and a shared key cannot render two ways.
export const RACE_PARTS = [
  { key: 'R', label: 'Restate the question', color: '#e668c9', ask: 'Turn the question into the start of your answer.', frame: 'The question asks ______.' },
  { key: 'A', label: 'Answer it', color: '#6db7f2', ask: 'Answer it in one clear sentence.', frame: 'I think ______.' },
  { key: 'C', label: 'Cite the text', color: '#7fd483', ask: 'Bring in proof from the text.', frame: 'In the text it says, "______."' },
  { key: 'E', label: 'Explain your proof', color: '#f2b27e', ask: 'Say how your proof answers the question.', frame: 'This shows that ______.' },
]

/* ---- Feedback voice ---------------------------------------------------- *
 * Her TELPAS-trait table. Same trait, different demand by level.
 */
export const FEEDBACK_VOICE = {
  beginning: {
    vocabulary: 'Try this word instead.',
    sentence_complexity: 'Write one more sentence.',
    elaboration: 'Add evidence.',
    organization: 'Answer the question.',
    comprehensibility: 'Read this part out loud.',
  },
  intermediate: {
    vocabulary: 'Try a more precise word.',
    sentence_complexity: 'Combine these ideas into one sentence.',
    elaboration: 'Explain how your evidence supports your answer.',
    organization: 'Add a transition word.',
    comprehensibility: 'Clarify this sentence.',
  },
  advanced: {
    vocabulary: 'Use more precise academic language.',
    sentence_complexity: 'Vary your sentence structure.',
    elaboration: 'Can you elaborate more fully?',
    organization: 'Connect your evidence more clearly.',
    comprehensibility: 'Tighten this for your reader.',
  },
}

/* ---- Writing expectation by level -------------------------------------- *
 * Her open question 1. The CONTENT bar never moves — did you answer the
 * question, did you use evidence. Only the LANGUAGE bar moves, along
 * words → phrases → simple → connected → academic discourse. Without this a
 * Beginning student is graded against grade-level prose and always fails.
 */
export const LANGUAGE_EXPECTATION = {
  beginning: { label: 'Words, phrases, simple patterns', example: 'Aliens see kids. They funny.', minWords: 8 },
  intermediate: { label: 'Short connected sentences; errors expected', example: 'The aliens wanted to learn because the kids were having fun.', minWords: 20 },
  advanced: { label: 'Connected sentences moving toward academic discourse', example: null, minWords: 35 },
}

/* ---- How a level changes GRADING --------------------------------------- *
 * Her open question 1, made concrete. Restate / cite / explain are content
 * moves and their tests never change. The only thing that moves is how much
 * ENGLISH a student has to produce before the answer counts as answered, and
 * how much of the question's wording they have to echo back to count as a
 * restate. A student with no support level is graded exactly as before.
 */
export const DEFAULT_GRADING = { answerMinWords: 12, restateShared: 2 }
export const GRADING = {
  beginning: { answerMinWords: 6, restateShared: 1 },
  intermediate: { answerMinWords: 10, restateShared: 2 },
  advanced: { answerMinWords: 12, restateShared: 2 },
}
export const gradingFor = (level) => GRADING[level] || DEFAULT_GRADING

/* ---- The one next move, worded for the level --------------------------- *
 * Her open question 4: on attempt 1 an emergent bilingual student gets ONE
 * thing to fix, not four. These strings are the whole vocabulary of that
 * coaching, so they translate cleanly for the bilingual case at Beginning.
 */
export const NEXT_MOVES = {
  restate: 'Start by turning the question into your first sentence, then answer it.',
  claim: 'Open with one sentence that says exactly what you think.',
  answer: 'Say your idea in a full sentence so your reader knows where you stand.',
  cite: 'Add a detail or a short quote from the text that proves your answer.',
  explain: 'Add a sentence starting with "This shows…" or "because…" to connect your evidence to your answer.',
}
export const NEXT_MOVES_SIMPLE = {
  restate: 'Start with the words from the question.',
  claim: 'Say what you think in one sentence.',
  answer: 'Say what you think in one sentence.',
  cite: 'Add one thing the text says.',
  explain: 'Add "This shows ______." at the end.',
}

/* Plain-English versions of the anchor notes for Beginning readers. */
export const SIMPLE_NOTES = {
  restate: { hit: 'You used words from the question. Good.', miss: 'Use words from the question first.' },
  claim: { hit: 'You said what you think. Good.', miss: 'Say what you think.' },
  answer: { hit: 'You said what you think. Good.', miss: 'Say what you think in one sentence.' },
  cite: { hit: 'You used the text. Good.', miss: 'Add one thing the text says.' },
  explain: { hit: 'You told why. Good.', miss: 'Tell why. Try "This shows ______."' },
}

/* Does this level get its feedback in both languages? (Spec: Beginning only.) */
export const isBilingualFeedback = (level) => level === 'beginning'
/* Does this level get one item on the first attempt instead of all four? */
export const isOneThingAtATime = (level, attempt) => !!level && attempt <= 1

/* ---- Vocabulary ---------------------------------------------------------- *
 * Support area 2. One shared glossary keyed by the word, so an assignment
 * only has to list which words it needs. `kid` is the definition a sixth
 * grader reads; `es` is the Spanish gloss a Beginning student also gets.
 * Advanced gets no glossary — the spec reserves it for nuance they ask for.
 */
export const GLOSSARY = {
  'recess': { kid: 'Free time outside during the school day.', es: 'el recreo' },
  'argument': { kid: 'Writing that takes a side and gives reasons.', es: 'un argumento' },
  'principal': { kid: 'The person in charge of the whole school.', es: 'el director / la directora' },
  'opinion': { kid: 'What you think about something.', es: 'una opinión' },
  'support': { kid: 'To back up what you said with proof.', es: 'apoyar' },
  'invention': { kid: 'Something new that a person made.', es: 'un invento' },
  'take a side': { kid: 'To pick yes or no and stay with it.', es: 'tomar una posición' },
  'reason': { kid: 'The why behind what you think.', es: 'una razón' },
  'garden': { kid: 'A place where plants and flowers grow.', es: 'un jardín' },
  'narrative': { kid: 'A story with events in order.', es: 'una narración' },
  'desert': { kid: 'A place with very little rain. Hot and dry.', es: 'un desierto' },
  'adapt': { kid: 'To change so you can live somewhere.', es: 'adaptarse' },
  'inform': { kid: 'To teach your reader something true.', es: 'informar' },
  'detail': { kid: 'A small fact that makes your idea clear.', es: 'un detalle' },
  'imagine': { kid: 'To picture something in your mind.', es: 'imaginar' },
  'American Revolution': { kid: 'The war where the United States became its own country.', es: 'la Revolución Estadounidense' },
  'brave': { kid: 'Doing something even when you are scared.', es: 'valiente' },
  'kindness': { kid: 'Treating people in a way that helps them.', es: 'la amabilidad' },
  'matter': { kid: 'To be important.', es: 'importar' },
  'explanation': { kid: 'Telling why something is true.', es: 'una explicación' },
  'example': { kid: 'One real case that shows your idea.', es: 'un ejemplo' },
}
export const glossFor = (words) => (words || []).map((w) => ({ word: w, ...(GLOSSARY[w] || {}) })).filter((g) => g.kid)

/* ---- Prompt support ------------------------------------------------------ *
 * Support area 1, and the one a student notices first. The QUESTION never
 * gets easier — all three levels are answering the same grade-level prompt.
 * What changes is how much of it arrives at once:
 *   Beginning    — a simplified restatement plus the prompt broken into steps
 *   Intermediate — the real prompt, chunked, with its academic words flagged
 *   Advanced     — the prompt exactly as written
 */
export function promptSupportFor(level, bridge) {
  if (!level || !bridge) return null
  if (level === 'advanced') return null
  if (level === 'beginning') {
    return {
      mode: 'steps',
      title: 'What this is asking',
      simple: bridge.simplePrompt || null,
      steps: bridge.steps || [],
      gloss: glossFor(bridge.vocab),
      bilingual: true,
    }
  }
  return {
    mode: 'chunks',
    title: 'The prompt, one piece at a time',
    chunks: bridge.chunks || [],
    gloss: glossFor(bridge.vocab),
    bilingual: false,
  }
}
