// Type Right — typing practice where every keystroke is also convention practice.
//
// Seven cumulative tiers, grade 2 → 8. Each tier changes four things at once:
// the UNIT of text, the KEYS in play, the GRAMMAR being sorted, and the
// CONVENTION being enforced. Higher tiers keep the earlier work in the mix —
// a grade-6 sentence still wants series commas, just inside a longer sentence.
//
// Nothing here feeds the writing data. A round reports accuracy and speed, and
// that is the end of it.

export const TIERS = [
  {
    grade: 2, unit: 'Words and short sentences', keys: 'Letters · space · period · Shift',
    grammar: ['noun', 'verb'], convention: 'Capital letters for names and I, a period at the end',
    wpm: 9, target: 90,
    words: [
      { w: 'cat', pos: 'noun' }, { w: 'dog', pos: 'noun' }, { w: 'bus', pos: 'noun' }, { w: 'desk', pos: 'noun' },
      { w: 'book', pos: 'noun' }, { w: 'tree', pos: 'noun' }, { w: 'friend', pos: 'noun' }, { w: 'school', pos: 'noun' },
      { w: 'lunch', pos: 'noun' }, { w: 'teacher', pos: 'noun' }, { w: 'rain', pos: 'noun' }, { w: 'bird', pos: 'noun' },
      { w: 'run', pos: 'verb' }, { w: 'jump', pos: 'verb' }, { w: 'read', pos: 'verb' }, { w: 'write', pos: 'verb' },
      { w: 'sing', pos: 'verb' }, { w: 'help', pos: 'verb' }, { w: 'play', pos: 'verb' }, { w: 'walk', pos: 'verb' },
      { w: 'eat', pos: 'verb' }, { w: 'sit', pos: 'verb' }, { w: 'look', pos: 'verb' }, { w: 'talk', pos: 'verb' },
    ],
    fixits: [
      { given: 'my dog can run', answer: 'My dog can run.', skill: 'capital + period' },
      { given: 'i like to read', answer: 'I like to read.', skill: 'capital I' },
      { given: 'we play at recess', answer: 'We play at recess.', skill: 'capital + period' },
      { given: 'sam has a red bike', answer: 'Sam has a red bike.', skill: 'name' },
      { given: 'the cat sat down', answer: 'The cat sat down.', skill: 'capital + period' },
      { given: 'i see a big bus', answer: 'I see a big bus.', skill: 'capital I' },
      { given: 'mrs lee is my teacher', answer: 'Mrs. Lee is my teacher.', skill: 'title + name' },
      { given: 'we eat lunch at noon', answer: 'We eat lunch at noon.', skill: 'capital + period' },
      { given: 'ben and i are friends', answer: 'Ben and I are friends.', skill: 'name + capital I' },
      { given: 'the bird can fly', answer: 'The bird can fly.', skill: 'capital + period' },
    ],
    sentences: [
      'The dog ran fast.', 'I can read a book.', 'We sit on the rug.', 'My friend is kind.',
      'The bus is here.', 'I like to help.', 'Sam ate his lunch.', 'The rain fell down.',
    ],
  },

  {
    grade: 3, unit: 'Simple sentences', keys: '+ question mark · exclamation point',
    grammar: ['noun', 'verb', 'adjective'], convention: 'All three end marks, days and months, names',
    wpm: 14, target: 90,
    words: [
      { w: 'garden', pos: 'noun' }, { w: 'library', pos: 'noun' }, { w: 'planet', pos: 'noun' }, { w: 'river', pos: 'noun' },
      { w: 'answer', pos: 'noun' }, { w: 'question', pos: 'noun' }, { w: 'story', pos: 'noun' }, { w: 'reason', pos: 'noun' },
      { w: 'explain', pos: 'verb' }, { w: 'describe', pos: 'verb' }, { w: 'wonder', pos: 'verb' }, { w: 'notice', pos: 'verb' },
      { w: 'gather', pos: 'verb' }, { w: 'decide', pos: 'verb' }, { w: 'follow', pos: 'verb' }, { w: 'measure', pos: 'verb' },
      { w: 'quiet', pos: 'adjective' }, { w: 'bright', pos: 'adjective' }, { w: 'heavy', pos: 'adjective' }, { w: 'gentle', pos: 'adjective' },
      { w: 'curious', pos: 'adjective' }, { w: 'crowded', pos: 'adjective' }, { w: 'muddy', pos: 'adjective' }, { w: 'careful', pos: 'adjective' },
    ],
    fixits: [
      { given: 'where did you find that book', answer: 'Where did you find that book?', skill: 'question mark' },
      { given: 'watch out for the puddle', answer: 'Watch out for the puddle!', skill: 'exclamation' },
      { given: 'our class trip is on friday', answer: 'Our class trip is on Friday.', skill: 'day of the week' },
      { given: 'my birthday is in march', answer: 'My birthday is in March.', skill: 'month' },
      { given: 'do you want to read with me', answer: 'Do you want to read with me?', skill: 'question mark' },
      { given: 'the river was very quiet', answer: 'The river was very quiet.', skill: 'capital + period' },
      { given: 'ms garza gave us a story', answer: 'Ms. Garza gave us a story.', skill: 'title + name' },
      { given: 'that was the best day ever', answer: 'That was the best day ever!', skill: 'exclamation' },
      { given: 'how many planets are there', answer: 'How many planets are there?', skill: 'question mark' },
      { given: 'we go to the library on tuesday', answer: 'We go to the library on Tuesday.', skill: 'day of the week' },
    ],
    sentences: [
      'The garden was bright and quiet.', 'Where does that river go?', 'Our teacher read us a story.',
      'I noticed something strange today.', 'That book was really heavy!', 'Can you explain your answer?',
      'The library closes at four.', 'She gave a careful answer.',
    ],
  },

  {
    grade: 4, unit: 'Simple and compound sentences', keys: '+ comma · apostrophe',
    grammar: ['noun', 'verb', 'adjective', 'adverb'], convention: 'Commas in a series, contractions',
    wpm: 18, target: 92,
    words: [
      { w: 'evidence', pos: 'noun' }, { w: 'opinion', pos: 'noun' }, { w: 'detail', pos: 'noun' }, { w: 'purpose', pos: 'noun' },
      { w: 'author', pos: 'noun' }, { w: 'paragraph', pos: 'noun' }, { w: 'meaning', pos: 'noun' }, { w: 'example', pos: 'noun' },
      { w: 'support', pos: 'verb' }, { w: 'compare', pos: 'verb' }, { w: 'revise', pos: 'verb' }, { w: 'suggest', pos: 'verb' },
      { w: 'connect', pos: 'verb' }, { w: 'explore', pos: 'verb' }, { w: 'prove', pos: 'verb' }, { w: 'include', pos: 'verb' },
      { w: 'specific', pos: 'adjective' }, { w: 'important', pos: 'adjective' }, { w: 'unusual', pos: 'adjective' }, { w: 'helpful', pos: 'adjective' },
      { w: 'quickly', pos: 'adverb' }, { w: 'carefully', pos: 'adverb' }, { w: 'finally', pos: 'adverb' }, { w: 'clearly', pos: 'adverb' },
    ],
    fixits: [
      { given: 'i packed a book a snack and my coat', answer: 'I packed a book, a snack, and my coat.', skill: 'series commas' },
      { given: 'we cant go outside today', answer: "We can't go outside today.", skill: 'contraction' },
      { given: 'she doesnt know the answer yet', answer: "She doesn't know the answer yet.", skill: 'contraction' },
      { given: 'the store sells apples pears and plums', answer: 'The store sells apples, pears, and plums.', skill: 'series commas' },
      { given: 'its going to rain all weekend', answer: "It's going to rain all weekend.", skill: 'contraction' },
      { given: 'my brother reads writes and draws every night', answer: 'My brother reads, writes, and draws every night.', skill: 'series commas' },
      { given: 'they havent finished the project', answer: "They haven't finished the project.", skill: 'contraction' },
      { given: 'bring a pencil paper and your notebook', answer: 'Bring a pencil, paper, and your notebook.', skill: 'series commas' },
      { given: 'i didnt notice the detail at first', answer: "I didn't notice the detail at first.", skill: 'contraction' },
      { given: 'the author used facts examples and quotes', answer: 'The author used facts, examples, and quotes.', skill: 'series commas' },
    ],
    sentences: [
      'I packed a book, a snack, and my coat.', "She doesn't agree with that opinion.",
      'The author gave three specific examples.', 'We revised, edited, and published our stories.',
      "It's important to support your claim.", 'Finally, the rain stopped and we went out.',
      'He answered quickly, but he was wrong.', "Don't forget to include your evidence.",
    ],
  },

  {
    grade: 5, unit: 'Compound sentences', keys: '+ quotation marks',
    grammar: ['noun', 'verb', 'adjective', 'adverb', 'pronoun'], convention: 'Dialogue punctuation, possessive apostrophes',
    wpm: 23, target: 92,
    words: [
      { w: 'conclusion', pos: 'noun' }, { w: 'argument', pos: 'noun' }, { w: 'source', pos: 'noun' }, { w: 'audience', pos: 'noun' },
      { w: 'transition', pos: 'noun' }, { w: 'narrative', pos: 'noun' }, { w: 'summary', pos: 'noun' }, { w: 'passage', pos: 'noun' },
      { w: 'analyze', pos: 'verb' }, { w: 'persuade', pos: 'verb' }, { w: 'organize', pos: 'verb' }, { w: 'introduce', pos: 'verb' },
      { w: 'conclude', pos: 'verb' }, { w: 'develop', pos: 'verb' }, { w: 'restate', pos: 'verb' }, { w: 'respond', pos: 'verb' },
      { w: 'convincing', pos: 'adjective' }, { w: 'relevant', pos: 'adjective' }, { w: 'vivid', pos: 'adjective' }, { w: 'logical', pos: 'adjective' },
      { w: 'however', pos: 'adverb' }, { w: 'instead', pos: 'adverb' },
      { w: 'they', pos: 'pronoun' }, { w: 'their', pos: 'pronoun' },
    ],
    fixits: [
      { given: 'wait for me shouted marcus', answer: '"Wait for me!" shouted Marcus.', skill: 'dialogue' },
      { given: 'the dogs bowl was empty', answer: "The dog's bowl was empty.", skill: 'possessive' },
      { given: 'i finished my draft and then i revised it', answer: 'I finished my draft, and then I revised it.', skill: 'compound comma' },
      { given: 'can we go now asked lena', answer: '"Can we go now?" asked Lena.', skill: 'dialogue' },
      { given: 'my sisters backpack is by the door', answer: "My sister's backpack is by the door.", skill: 'possessive' },
      { given: 'she read the passage but she missed the detail', answer: 'She read the passage, but she missed the detail.', skill: 'compound comma' },
      { given: 'this is my favorite part said dad', answer: '"This is my favorite part," said Dad.', skill: 'dialogue' },
      { given: 'the teachers desk was covered in papers', answer: "The teacher's desk was covered in papers.", skill: 'possessive' },
      { given: 'we could walk or we could ride the bus', answer: 'We could walk, or we could ride the bus.', skill: 'compound comma' },
      { given: 'i already know the answer whispered ana', answer: '"I already know the answer," whispered Ana.', skill: 'dialogue' },
    ],
    sentences: [
      '"Wait for me!" shouted Marcus.', "The dog's bowl was empty again.",
      'I finished my draft, and then I revised it.', 'Her argument was logical, but it lacked evidence.',
      '"Can we go now?" asked Lena.', 'They organized their notes before they started.',
      'The source was relevant, so she quoted it.', 'Instead of guessing, reread the passage.',
    ],
  },

  {
    grade: 6, unit: 'Complex sentences', keys: '+ parentheses · hyphen',
    grammar: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition'], convention: 'Comma after an introductory element, titles in quotes',
    wpm: 28, target: 95,
    words: [
      { w: 'claim', pos: 'noun' }, { w: 'counterargument', pos: 'noun' }, { w: 'reasoning', pos: 'noun' }, { w: 'context', pos: 'noun' },
      { w: 'perspective', pos: 'noun' }, { w: 'structure', pos: 'noun' }, { w: 'inference', pos: 'noun' }, { w: 'theme', pos: 'noun' },
      { w: 'justify', pos: 'verb' }, { w: 'elaborate', pos: 'verb' }, { w: 'demonstrate', pos: 'verb' }, { w: 'acknowledge', pos: 'verb' },
      { w: 'clarify', pos: 'verb' }, { w: 'emphasize', pos: 'verb' },
      { w: 'credible', pos: 'adjective' }, { w: 'precise', pos: 'adjective' }, { w: 'thorough', pos: 'adjective' }, { w: 'effective', pos: 'adjective' },
      { w: 'therefore', pos: 'adverb' }, { w: 'clearly', pos: 'adverb' },
      { w: 'beneath', pos: 'preposition' }, { w: 'between', pos: 'preposition' }, { w: 'during', pos: 'preposition' }, { w: 'without', pos: 'preposition' },
    ],
    fixits: [
      { given: 'after the storm passed we walked to the creek', answer: 'After the storm passed, we walked to the creek.', skill: 'intro clause' },
      { given: 'we read the poem the road not taken in class', answer: 'We read the poem "The Road Not Taken" in class.', skill: 'title in quotes' },
      { given: 'because the evidence was thin her claim fell apart', answer: 'Because the evidence was thin, her claim fell apart.', skill: 'intro clause' },
      { given: 'in my opinion the second reason is stronger', answer: 'In my opinion, the second reason is stronger.', skill: 'intro phrase' },
      { given: 'my favorite chapter is the long winter', answer: 'My favorite chapter is "The Long Winter."', skill: 'title in quotes' },
      { given: 'while i was revising i found three fragments', answer: 'While I was revising, I found three fragments.', skill: 'intro clause' },
      { given: 'to be honest i skipped the counterargument', answer: 'To be honest, I skipped the counterargument.', skill: 'intro phrase' },
      { given: 'although the source was old it was still credible', answer: 'Although the source was old, it was still credible.', skill: 'intro clause' },
      { given: 'we listened to the song riding the wind twice', answer: 'We listened to the song "Riding the Wind" twice.', skill: 'title in quotes' },
      { given: 'before you write down your claim reread the prompt', answer: 'Before you write down your claim, reread the prompt.', skill: 'intro clause' },
    ],
    sentences: [
      'After the storm passed, we walked to the creek.', 'Because the evidence was thin, her claim fell apart.',
      'We read the poem "The Road Not Taken" in class.', 'In my opinion, the second reason is stronger.',
      'While revising, I found three fragments (and fixed them).', 'Therefore, the author acknowledges the other side.',
      'The well-written conclusion did more than repeat the claim.', 'Between the two sources, this one is more credible.',
    ],
  },

  {
    grade: 7, unit: 'Multi-clause sentences', keys: '+ semicolon · colon',
    grammar: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction'], convention: 'Semicolons, colons, appositives',
    wpm: 33, target: 95,
    words: [
      { w: 'rebuttal', pos: 'noun' }, { w: 'credibility', pos: 'noun' }, { w: 'implication', pos: 'noun' }, { w: 'nuance', pos: 'noun' },
      { w: 'synthesis', pos: 'noun' }, { w: 'rhetoric', pos: 'noun' },
      { w: 'refute', pos: 'verb' }, { w: 'concede', pos: 'verb' }, { w: 'integrate', pos: 'verb' }, { w: 'evaluate', pos: 'verb' },
      { w: 'attribute', pos: 'verb' }, { w: 'qualify', pos: 'verb' },
      { w: 'compelling', pos: 'adjective' }, { w: 'objective', pos: 'adjective' }, { w: 'ambiguous', pos: 'adjective' }, { w: 'substantial', pos: 'adjective' },
      { w: 'consequently', pos: 'adverb' }, { w: 'nevertheless', pos: 'adverb' }, { w: 'moreover', pos: 'adverb' },
      { w: 'throughout', pos: 'preposition' }, { w: 'despite', pos: 'preposition' },
      { w: 'although', pos: 'conjunction' }, { w: 'whereas', pos: 'conjunction' }, { w: 'unless', pos: 'conjunction' },
    ],
    fixits: [
      { given: 'the data was clear the conclusion was not', answer: 'The data was clear; the conclusion was not.', skill: 'semicolon' },
      { given: 'she needed three things evidence reasoning and a rebuttal', answer: 'She needed three things: evidence, reasoning, and a rebuttal.', skill: 'colon' },
      { given: 'my coach mr alvarez runs the writing club', answer: 'My coach, Mr. Alvarez, runs the writing club.', skill: 'appositive' },
      { given: 'the study was small nevertheless it was useful', answer: 'The study was small; nevertheless, it was useful.', skill: 'semicolon + adverb' },
      { given: 'bring the following a source a quote and a citation', answer: 'Bring the following: a source, a quote, and a citation.', skill: 'colon' },
      { given: 'our newest source a 2024 report changed the argument', answer: 'Our newest source, a 2024 report, changed the argument.', skill: 'appositive' },
      { given: 'he conceded the point he did not abandon his claim', answer: 'He conceded the point; he did not abandon his claim.', skill: 'semicolon' },
      { given: 'one thing matters most credibility', answer: 'One thing matters most: credibility.', skill: 'colon' },
      { given: 'the author a former teacher writes about schools', answer: 'The author, a former teacher, writes about schools.', skill: 'appositive' },
      { given: 'the argument was compelling moreover it was well sourced', answer: 'The argument was compelling; moreover, it was well sourced.', skill: 'semicolon + adverb' },
    ],
    sentences: [
      'The data was clear; the conclusion was not.', 'She needed three things: evidence, reasoning, and a rebuttal.',
      'My coach, Mr. Alvarez, runs the writing club.', 'Despite the nuance, the claim held up.',
      'The study was small; nevertheless, it was useful.', 'He refuted the point, whereas she conceded it.',
      'Throughout the essay, the author qualifies the claim.', 'Consequently, the rebuttal changed my thinking.',
    ],
  },

  {
    grade: 8, unit: 'Short paragraphs', keys: 'Full keyboard',
    grammar: ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction'], convention: 'Quoting a source, varied sentence openers',
    wpm: 38, target: 95,
    words: [
      { w: 'premise', pos: 'noun' }, { w: 'discourse', pos: 'noun' }, { w: 'correlation', pos: 'noun' }, { w: 'paradox', pos: 'noun' },
      { w: 'citation', pos: 'noun' }, { w: 'methodology', pos: 'noun' },
      { w: 'substantiate', pos: 'verb' }, { w: 'undermine', pos: 'verb' }, { w: 'corroborate', pos: 'verb' }, { w: 'contextualize', pos: 'verb' },
      { w: 'presuppose', pos: 'verb' }, { w: 'reconcile', pos: 'verb' },
      { w: 'plausible', pos: 'adjective' }, { w: 'inherent', pos: 'adjective' }, { w: 'redundant', pos: 'adjective' }, { w: 'meticulous', pos: 'adjective' },
      { w: 'ostensibly', pos: 'adverb' }, { w: 'arguably', pos: 'adverb' }, { w: 'conversely', pos: 'adverb' },
      { w: 'regarding', pos: 'preposition' }, { w: 'beyond', pos: 'preposition' },
      { w: 'whereas', pos: 'conjunction' }, { w: 'provided', pos: 'conjunction' }, { w: 'lest', pos: 'conjunction' },
    ],
    fixits: [
      { given: 'the author writes the evidence speaks for itself page 4', answer: 'The author writes, "The evidence speaks for itself" (page 4).', skill: 'quoting a source' },
      { given: 'according to the report costs fell by 12 percent', answer: 'According to the report, costs fell by 12 percent.', skill: 'attribution' },
      { given: 'the premise is plausible however the data is thin', answer: 'The premise is plausible; however, the data is thin.', skill: 'semicolon + adverb' },
      { given: 'she argues that the policy ostensibly helps students undermines them', answer: 'She argues that the policy, which ostensibly helps students, undermines them.', skill: 'nonrestrictive clause' },
      { given: 'one critic calls it redundant another calls it meticulous', answer: 'One critic calls it redundant; another calls it meticulous.', skill: 'semicolon' },
      { given: 'as the study notes correlation is not causation', answer: 'As the study notes, "Correlation is not causation."', skill: 'quoting a source' },
      { given: 'conversely the second source corroborates the claim', answer: 'Conversely, the second source corroborates the claim.', skill: 'intro adverb' },
      { given: 'the writer states we cannot reconcile these findings', answer: 'The writer states, "We cannot reconcile these findings."', skill: 'quoting a source' },
      { given: 'provided the citation is accurate the argument stands', answer: 'Provided the citation is accurate, the argument stands.', skill: 'intro clause' },
      { given: 'regarding methodology the report is meticulous', answer: 'Regarding methodology, the report is meticulous.', skill: 'intro phrase' },
    ],
    sentences: [
      'The author writes, "The evidence speaks for itself" (page 4).',
      'According to the report, costs fell by 12 percent.',
      'The premise is plausible; however, the data is thin.',
      'Conversely, the second source corroborates the claim.',
      'Arguably, the paradox is inherent in the methodology.',
      'One critic calls it redundant; another calls it meticulous.',
      'Regarding methodology, the report is meticulous.',
      'Provided the citation is accurate, the argument stands.',
    ],
  },
]

export const tierFor = (grade) => TIERS.find((t) => t.grade === Math.max(2, Math.min(8, grade || 6))) || TIERS[4]

export const MODES = [
  { key: 'words', label: 'Word Sprint', icon: '⌨️', blurb: 'Type each vocabulary word exactly.' },
  { key: 'sort', label: 'Sort & Type', icon: '🗂️', blurb: 'Type the word, then say what kind of word it is.' },
  { key: 'fixit', label: 'Fix It & Type It', icon: '🛠️', blurb: 'Add the capitals and punctuation as you type.' },
  { key: 'sentences', label: 'Sentence Sprint', icon: '🏁', blurb: 'Type the whole sentence, exactly as written.' },
]

// A round is ten items, drawn from the tier and shuffled by a seed the caller
// supplies, so a student is not retyping the same ten every time.
export function buildRound(grade, mode, seed = 0) {
  const tier = tierFor(grade)
  const pick = (arr, n) => {
    const out = [...arr]
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.abs((seed + i * 7919) % (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out.slice(0, n)
  }
  if (mode === 'words') return pick(tier.words, 10).map((x) => ({ target: x.w }))
  if (mode === 'sort') return pick(tier.words, 8).map((x) => ({ target: x.w, pos: x.pos }))
  if (mode === 'fixit') return pick(tier.fixits, 8).map((x) => ({ given: x.given, target: x.answer, skill: x.skill }))
  return pick(tier.sentences, 8).map((x) => ({ target: x }))
}
