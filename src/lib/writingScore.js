import { gradingFor, SIMPLE_NOTES, NEXT_MOVES, NEXT_MOVES_SIMPLE } from './languageBridge.js'

/*
 * Shared scoring for constructed responses. One heuristic judge so the feedback
 * screen and the data card can never disagree about a score.
 */

export const STRATEGIES = {
  RACE: [
    { key: 'restate', letter: 'R', label: 'Restate the Question', color: '#b8329f', bg: '#f7e2f4' },
    { key: 'answer', letter: 'A', label: 'Answer the Question', color: '#2f7fd0', bg: '#dceafa' },
    { key: 'cite', letter: 'C', label: 'Cite Evidence from the Text', color: '#3f9146', bg: '#dff0dc' },
    { key: 'explain', letter: 'E', label: 'Explain', color: '#d1732a', bg: '#fbe6d4' },
  ],
  CER: [
    { key: 'claim', letter: 'C', label: 'Make a Claim', color: '#2f7fd0', bg: '#dceafa' },
    { key: 'cite', letter: 'E', label: 'Give Evidence', color: '#3f9146', bg: '#dff0dc' },
    { key: 'explain', letter: 'R', label: 'Reasoning', color: '#d1732a', bg: '#fbe6d4' },
  ],
}

const STOP = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'your', 'you', 'what', 'why', 'how', 'was', 'were', 'are', 'for', 'his', 'her', 'their', 'them', 'they', 'about', 'into', 'text', 'story', 'use', 'using', 'write', 'answer', 'question'])
const wordsOf = (t) => (t || '').toLowerCase().match(/[a-z']+/g) || []
const contentWords = (t) => wordsOf(t).filter((w) => w.length > 3 && !STOP.has(w))

const CITE_CUES = ['the text says', 'the story says', 'according to', 'the author', 'paragraph', 'for example', 'for instance', 'it says', 'in the text', 'the passage']
const EXPLAIN_CUES = ['because', 'this shows', 'this means', 'which means', 'that is why', 'so that', 'therefore', 'this proves', 'as a result', 'this tells']

/* Judge one answer against the strategy anchors. Returns per-anchor hit + the
 * sentence the student reads, written the way the live product words it. */
export function judge(answer, prompt, strategyKey, level = null) {
  const g = gradingFor(level)
  const text = (answer || '').trim()
  const lower = text.toLowerCase()
  const w = wordsOf(text)
  const first = (text.split(/(?<=[.!?])\s/)[0] || '').toLowerCase()
  const promptWords = new Set(contentWords(prompt))
  const shared = [...new Set(contentWords(first))].filter((x) => promptWords.has(x))
  const firstClause = text.split(/(?<=[.!?])\s/)[0] || text

  // Content tests never move. The language bar does — see languageBridge.js.
  const restated = shared.length >= g.restateShared
  const answered = w.length >= g.answerMinWords
  const cited = /"[^"]{4,}"/.test(text) || CITE_CUES.some((c) => lower.includes(c))
  const explained = EXPLAIN_CUES.some((c) => lower.includes(c))

  const snippet = (s, n = 12) => {
    const parts = (s || '').trim().split(/\s+/).slice(0, n).join(' ')
    return parts + ((s || '').trim().split(/\s+/).length > n ? '…' : '')
  }

  const notes = {
    restate: restated
      ? `You restated the question before you answered it — you started with "${snippet(firstClause, 8)}"`
      : `You didn't restate the question in your answer.`,
    claim: answered
      ? `You made a claim: "${snippet(firstClause, 10)}"`
      : `You didn't state a clear claim to start your answer.`,
    answer: answered
      ? `You answered the question by saying "${snippet(firstClause, 10)}"`
      : `Your answer stops before it says what you think — say your idea in a full sentence.`,
    cite: cited
      ? `You used evidence from the text to back up your answer.`
      : `You didn't provide any evidence from the text to support your answer.`,
    explain: explained
      ? `You explained how your evidence connects to your answer.`
      : `You didn't explain how your answer connects to the story.`,
  }

  const hits = { restate: restated, claim: answered, answer: answered, cite: cited, explain: explained }
  // A Beginning reader gets the note in words they can actually read. The
  // judgement is identical — only the sentence they see is plainer.
  const noteFor = (key) => (level === 'beginning' && SIMPLE_NOTES[key])
    ? SIMPLE_NOTES[key][hits[key] ? 'hit' : 'miss']
    : notes[key]
  const anchors = STRATEGIES[strategyKey].map((a) => ({ ...a, hit: !!hits[a.key], note: noteFor(a.key) }))
  return anchors
}

/* The single highest-priority thing to fix, in RACE order. Returned as a key
 * plus the English sentence, so a caller can translate it for the bilingual
 * feedback a Beginning student gets. */
export function nextMoveFor(anchors, level = null) {
  const missed = anchors.filter((a) => !a.hit)
  if (!missed.length) return null
  const key = missed[0].key
  const table = level === 'beginning' ? NEXT_MOVES_SIMPLE : NEXT_MOVES
  return { key, label: missed[0].label, text: table[key] || NEXT_MOVES[key] }
}

/* One paragraph of coaching, returned as a translatable template plus its
 * variables. The UI calls t(template, vars) so Spanish gets a real sentence
 * instead of an English one with a translated fragment glued on. */
export function feedbackParts(anchors, level = null) {
  const missed = anchors.filter((a) => !a.hit)
  const landed = anchors.filter((a) => a.hit)
  if (!missed.length) {
    return {
      template: level === 'beginning'
        ? 'You did every part. Nice work. Keep writing like this.'
        : 'You hit every part of the strategy — your answer restates, answers, backs itself up with the text, and explains the connection. Keep writing like this.',
      vars: {},
      move: null,
    }
  }
  const move = nextMoveFor(anchors, level)
  if (level === 'beginning') {
    return landed.length
      ? { template: 'Good start. Now do one thing: {move}', vars: { move: move.text }, move }
      : { template: "Let's do one thing: {move}", vars: { move: move.text }, move }
  }
  if (!landed.length) {
    return { template: "Let's build this answer one step at a time. {move}", vars: { move: move.text }, move }
  }
  // Labels travel untranslated; the UI runs each through t() before filling
  // them in, so a Spanish reader gets Spanish anchor names.
  const names = landed.map((a) => a.label).slice(0, 2)
  return {
    template: names.length === 2
      ? 'Your answer already handles {a} and {b} — that part is working. {move}'
      : 'Your answer already handles {a} — that part is working. {move}',
    vars: { a: names[0], b: names[1] || '', move: move.text },
    labelVars: ['a', 'b'],
    moveVar: 'move',
    move,
  }
}

/* Plain-string form, for anything that is not rendering through t(). */
export function feedbackParagraph(anchors, level = null) {
  const { template, vars } = feedbackParts(anchors, level)
  let out = template
  for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v))
  return out
}


/* Split one submission into per-question answers, judge each, and total it up. */
export function scoreSubmission(assignment, sub, level = null) {
  const draft = sub.drafts[sub.drafts.length - 1]
  const strategyKey = assignment?.strategy || (assignment?.subject === 'science' ? 'CER' : 'RACE')
  const count = Math.max(1, assignment?.questions || 1)
  const paras = (draft?.content || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const chunks = count === 1
    ? [draft?.content || '']
    : paras.length >= count
      ? (() => { const per = Math.ceil(paras.length / count); return Array.from({ length: count }, (_, i) => paras.slice(i * per, (i + 1) * per).join('\n\n')) })()
      : Array.from({ length: count }, (_, i) => paras[i] || '')

  const questionText = (i) => (assignment?.questionPrompts?.[i]) || assignment?.prompt || ''
  const questions = chunks.map((answer, i) => {
    const anchors = judge(answer, questionText(i), strategyKey, level)
    const hits = anchors.filter((x) => x.hit).length
    return { answer, prompt: questionText(i), anchors, hits, pct: Math.round((hits / anchors.length) * 100) }
  })

  const rubricMax = assignment?.format === 'ECR' ? 4 : 2
  const pct = Math.round(questions.reduce((a, q) => a + q.pct, 0) / questions.length)
  return {
    strategyKey,
    strategyName: strategyKey === 'CER' ? 'C.E.R.' : 'R.A.C.E.',
    questions,
    pct,
    rubricMax,
    rubricScore: Math.round((pct / 100) * rubricMax),
  }
}
