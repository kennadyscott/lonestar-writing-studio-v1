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
export function judge(answer, prompt, strategyKey) {
  const text = (answer || '').trim()
  const lower = text.toLowerCase()
  const w = wordsOf(text)
  const first = (text.split(/(?<=[.!?])\s/)[0] || '').toLowerCase()
  const promptWords = new Set(contentWords(prompt))
  const shared = [...new Set(contentWords(first))].filter((x) => promptWords.has(x))
  const firstClause = text.split(/(?<=[.!?])\s/)[0] || text

  const restated = shared.length >= 2
  const answered = w.length >= 12
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
  const anchors = STRATEGIES[strategyKey].map((a) => ({ ...a, hit: !!hits[a.key], note: notes[a.key] }))
  return anchors
}

/* One paragraph of coaching: name what landed, then the single next move. */
export function feedbackParagraph(anchors) {
  const missed = anchors.filter((a) => !a.hit)
  const landed = anchors.filter((a) => a.hit)
  if (!missed.length) return 'You hit every part of the strategy — your answer restates, answers, backs itself up with the text, and explains the connection. Keep writing like this.'
  const nextMove = {
    restate: 'Start by turning the question into your first sentence, then answer it.',
    claim: 'Open with one sentence that says exactly what you think.',
    answer: 'Say your idea in a full sentence so your reader knows where you stand.',
    cite: 'Add a detail or a short quote from the text that proves your answer.',
    explain: 'Add a sentence starting with "This shows…" or "because…" to connect your evidence to your answer.',
  }[missed[0].key]
  if (!landed.length) return `Let's build this answer one step at a time. ${nextMove}`
  const names = landed.map((a) => a.label.toLowerCase()).slice(0, 2)
  const list = names.length === 2 ? `${names[0]} and ${names[1]}` : names[0]
  return `Your answer already handles ${list} — that part is working. ${nextMove}`
}


/* Split one submission into per-question answers, judge each, and total it up. */
export function scoreSubmission(assignment, sub) {
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
    const anchors = judge(answer, questionText(i), strategyKey)
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
