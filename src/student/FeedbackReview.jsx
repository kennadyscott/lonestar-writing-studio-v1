import React, { useState } from 'react'

/*
 * FeedbackReview — what a student sees when they review a COMPLETED assignment.
 * Mirrors the live LoneStar CR feedback runner: rubric + strategy score rings,
 * one plain-language feedback paragraph, collapsible prompt/answer/rubric, and
 * the writing-strategy anchors marked hit or missed, one screen per question.
 *
 * The anchor judgments are scripted heuristics (same spirit as server/fallback.mjs)
 * so the whole screen is explorable with no API key.
 */

const NAVY = '#123a56'
const STRATEGIES = {
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
function judge(answer, prompt, strategyKey) {
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
function feedbackParagraph(anchors) {
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

function Ring({ label, sub, value, max, pct, color, track }) {
  const R = 46, C = 2 * Math.PI * R
  const frac = pct != null ? pct / 100 : max ? value / max : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ textAlign: 'right', lineHeight: 1.1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, letterSpacing: .4 }}>{label}</div>
        {sub && <div style={{ fontSize: 15, fontWeight: 800, color, letterSpacing: .4 }}>{sub}</div>}
      </div>
      <svg viewBox="0 0 110 110" style={{ width: 104, height: 104, flexShrink: 0 }} role="img" aria-label={`${label}: ${pct != null ? pct + '%' : value + ' of ' + max}`}>
        <circle cx="55" cy="55" r={R} fill="none" stroke={track} strokeWidth="13" />
        <circle cx="55" cy="55" r={R} fill="none" stroke={color} strokeWidth="13" strokeLinecap="round"
          strokeDasharray={`${Math.max(0.001, frac) * C} ${C}`} transform="rotate(-90 55 55)" />
        {pct != null ? (
          <text x="55" y="62" textAnchor="middle" fontSize="23" fontWeight="800" fill={NAVY}>{pct}%</text>
        ) : (
          <>
            <text x="47" y="62" textAnchor="middle" fontSize="26" fontWeight="800" fill={NAVY}>{value}</text>
            <text x="66" y="64" textAnchor="middle" fontSize="16" fontWeight="800" fill="#8fa5b8">/{max}</text>
          </>
        )}
      </svg>
    </div>
  )
}

function Reveal({ icon = '👁', label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ flex: '1 1 190px', minWidth: 0 }}>
      <button onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: '1.5px solid #d5e2ec',
          borderRadius: 999, padding: '9px 16px', fontSize: 13.5, fontWeight: 800, color: NAVY, cursor: 'pointer', boxShadow: '0 2px 8px rgba(13,47,85,.08)' }}>
        <span>{icon}</span>{label}<span style={{ fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ marginTop: 8, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', fontSize: 13.5, lineHeight: 1.55, color: '#26455c', whiteSpace: 'pre-wrap' }}>
          {children}
        </div>
      )}
    </div>
  )
}

export default function FeedbackReview({ state, sub, onBack }) {
  const [q, setQ] = useState(0)
  const a = state.assignments.find((x) => x.id === sub.assignmentId)
  const draft = sub.drafts[sub.drafts.length - 1]
  const strategyKey = a?.strategy || (a?.subject === 'science' ? 'CER' : 'RACE')

  // Multi-question SCR sets store one draft, so each question reads the matching
  // chunk of the response; single-question assignments use the whole thing.
  const count = Math.max(1, a?.questions || 1)
  const chunks = (() => {
    const paras = (draft.content || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    if (count === 1) return [draft.content || '']
    if (paras.length >= count) {
      const per = Math.ceil(paras.length / count)
      return Array.from({ length: count }, (_, i) => paras.slice(i * per, (i + 1) * per).join('\n\n'))
    }
    return Array.from({ length: count }, (_, i) => paras[i] || '')
  })()

  const questionText = (i) => (a?.questionPrompts?.[i]) || a?.prompt || ''
  const answer = chunks[q] || ''
  const anchors = judge(answer, questionText(q), strategyKey)
  const hitCount = anchors.filter((x) => x.hit).length
  const pct = Math.round((hitCount / anchors.length) * 100)
  const rubricMax = a?.format === 'ECR' ? 4 : 2
  const rubricScore = Math.round((hitCount / anchors.length) * rubricMax)
  const strategyName = strategyKey === 'CER' ? 'C.E.R.' : 'R.A.C.E.'

  const rubricRows = strategyKey === 'CER'
    ? ['Makes a claim that answers the question', 'Uses evidence from the text', 'Explains the reasoning that connects them']
    : ['Restates the question in the answer', 'Answers every part of the question', 'Uses evidence from the text', 'Explains how the evidence proves the answer']

  return (
    <div>
      <button className="backlink" onClick={onBack}>← Back to Dashboard</button>

      <div style={{ maxWidth: 940, margin: '0 auto', background: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--line)', boxShadow: '0 10px 30px rgba(13,47,85,.12)' }}>

        {/* header bar */}
        <div style={{ background: NAVY, color: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 26 }}>🌟</span>
          <b style={{ flex: 1, textAlign: 'center', fontSize: 19, letterSpacing: .3 }}>Your Writing Feedback</b>
          <span style={{ width: 26 }} />
        </div>

        <div style={{ padding: '18px 22px 22px', background: '#fbfdfe' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'inline-block', background: '#eef3f6', color: NAVY, borderRadius: 999, padding: '6px 16px', fontSize: 13.5, fontWeight: 800 }}>
              Question No: {q + 1}{count > 1 ? ` of ${count}` : ''}
            </span>
          </div>

          {/* score rings */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34, flexWrap: 'wrap', margin: '14px 0 6px' }}>
            <Ring label="RUBRIC" sub="SCORE" value={rubricScore} max={rubricMax} color="#f0b429" track="#f6ecd9" />
            <Ring label={strategyName} sub="SCORE" pct={pct} color="#e2622b" track="#f8e5da" />
          </div>

          {/* the coaching paragraph */}
          <div style={{ position: 'relative', border: '2px solid #2f7fd0', background: '#eaf3fb', borderRadius: 12, padding: '16px 20px', margin: '14px 0 16px' }}>
            <span style={{ position: 'absolute', top: -19, left: 10, fontSize: 28, lineHeight: 1 }}>💡</span>
            <div style={{ textAlign: 'center', fontSize: 17, fontWeight: 800, color: NAVY, letterSpacing: .6, marginBottom: 6 }}>OUR FEEDBACK TO YOU</div>
            <div style={{ textAlign: 'center', fontSize: 14.5, lineHeight: 1.6, color: '#1f4a68' }}>{feedbackParagraph(anchors)}</div>
          </div>

          {/* what they wrote, on demand */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 18 }}>
            <Reveal label="Question Prompt">{questionText(q) || 'No prompt on file for this question.'}</Reveal>
            <Reveal label="Your Answer">{answer.trim() || 'No response recorded for this question.'}</Reveal>
            <Reveal label="Rubric">
              {rubricRows.map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginTop: i ? 6 : 0 }}>
                  <span style={{ fontWeight: 800, color: '#8fa5b8' }}>{i + 1}.</span><span>{r}</span>
                </div>
              ))}
            </Reveal>
          </div>

          {/* the strategy anchors */}
          <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 800, letterSpacing: 1.4, color: NAVY, marginBottom: 10 }}>WRITING STRATEGY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {anchors.map((an) => (
              <div key={an.key} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f4f9fc', border: '1.5px solid #dbe8f1', borderRadius: 12, padding: '12px 16px' }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 17, fontWeight: 800, color: an.color, background: an.bg }}>{an.letter}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: .8, textTransform: 'uppercase', color: an.color }}>{an.label}</div>
                  <div style={{ fontSize: 13.5, color: '#33566e', marginTop: 2, lineHeight: 1.45 }}>{an.note}</div>
                </div>
                <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 800, color: '#fff', background: an.hit ? 'var(--good)' : '#c0392b' }}>
                  {an.hit ? '✓' : '✕'}
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: '#f4f8fb', borderRadius: 10, padding: '11px 16px', margin: '16px 0 0', textAlign: 'center', fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>
            {hitCount === anchors.length
              ? '🏆 Every anchor hit. Bring this same strategy to your next piece.'
              : '📈 Keep practicing! Review the feedback above and try again to level up your score.'}
          </div>
        </div>

        {/* footer nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
          {q > 0 && (
            <button onClick={() => setQ(q - 1)} style={{ padding: '11px 18px', borderRadius: 11, fontWeight: 800, fontSize: 13.5, color: 'var(--muted)', background: '#eef3f6', cursor: 'pointer' }}>← Back</button>
          )}
          <span style={{ flex: 1, fontSize: 12.5, color: 'var(--muted)', fontWeight: 700 }}>{a?.title}{a?.format ? ` · ${a.format}` : ''}</span>
          <button onClick={() => (q + 1 < count ? setQ(q + 1) : onBack())}
            style={{ padding: '12px 26px', borderRadius: 12, fontWeight: 800, fontSize: 14, color: '#fff', cursor: 'pointer',
              background: 'linear-gradient(180deg,#2c5a97 0%,#16386b 58%,#0e2748 100%)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,.28), 0 5px 14px rgba(53,195,232,.42)' }}>
            {q + 1 < count ? 'Next →' : 'Done →'}
          </button>
        </div>
      </div>
    </div>
  )
}
