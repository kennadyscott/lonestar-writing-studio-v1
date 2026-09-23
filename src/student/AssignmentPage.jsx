import React, { useState } from 'react'
import { useT } from '../lib/i18n/index.jsx'

/*
 * AssignmentPage — replica of the live LoneStar CR assignment runner
 * (passage left, numbered SCR questions right). Demo passage: "The Big Move".
 * "Complete Assignment" is a demo affordance that finishes the path mission.
 */

const NAVY = '#123a56'
const TEAL = '#18a7c9'

const PASSAGE = [
  "Mia was excited and nervous at the same time. Her family was moving to a new town, and she didn't know what to expect. She had lived in her old house for as long as she could remember. Now, everything was changing.",
  'On the day of the move, Mia packed her favorite toys and books. She carefully placed her stuffed bear, Mr. Cuddles, in a special box. "You\'ll keep me company in the new house," she said, hugging him tightly. Her parents were busy loading the moving truck, but Mia felt a little lonely.',
  'When they arrived at the new house, Mia looked around. The house was big and had a huge backyard. She could see a swing set and a tree that looked perfect for climbing. But she also saw that there were no familiar faces.',
  'The next day, Mia decided to explore her new neighborhood. She walked down the street and saw a group of kids playing soccer. They looked like they were having fun. Mia took a deep breath and walked over to them. "Can I play too?" she asked.',
  "The kids smiled and welcomed her to join. Mia felt a spark of happiness. As they played, she realized that making new friends might not be so hard after all. She kicked the ball and laughed, feeling a little more at home.",
  'As the sun began to set, Mia thought about her old home and her new one. She knew that growing up meant facing new challenges, but she also felt excited about the adventures that lay ahead.',
]

const QUESTIONS = [
  'What did Mia pack for the move, and why was it important to her?',
  'In paragraph 2, how does Mia feel while her parents load the truck? Use evidence from the text.',
  'What does Mia notice when she first arrives at the new house?',
  'Why does Mia take a deep breath before asking the kids if she can play?',
  "How do Mia's feelings change from the beginning of the story to the end?",
  'What lesson does Mia learn about facing new challenges? Support your answer with text evidence.',
]

export default function AssignmentPage({ a, onBack, onComplete, busy }) {
  const [q, setQ] = useState(0)
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(''))
  const [submitted, setSubmitted] = useState(Array(QUESTIONS.length).fill(false))
  const [zoom, setZoom] = useState(1)
  const t = useT()

  const answeredCount = submitted.filter(Boolean).length
  const allDone = answeredCount === QUESTIONS.length

  function setAnswer(v) {
    setAnswers((arr) => arr.map((x, i) => (i === q ? v : x)))
  }
  function submitAnswer() {
    if (!answers[q].trim()) return
    setSubmitted((arr) => arr.map((x, i) => (i === q ? true : x)))
    const next = QUESTIONS.findIndex((_, i) => i !== q && !submitted[i] && !(i === q))
    const after = submitted.map((x, i) => (i === q ? true : x)).findIndex((x) => !x)
    if (after >= 0) setQ(after)
  }

  return (
    <div>
      {/* page header: title + zoom + save/exit + demo complete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <h1 className="page" style={{ margin: 0, fontSize: 26 }}>{t('Assignment')}</h1>
        {a && (
          <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--muted)', marginLeft: 4 }}>
            {a.format === 'ECR' ? t('Extended Constructed Response') : t('Short Constructed Response')} · {a.title}
          </span>
        )}
        <span style={{ flex: 1 }} />
        <button title={t('Zoom in')} onClick={() => setZoom((z) => Math.min(1.3, z + 0.1))}
          style={{ width: 42, height: 40, borderRadius: 10, border: `1.5px solid ${TEAL}`, background: '#fff', color: TEAL, fontSize: 17, fontWeight: 800 }}>⊕</button>
        <button title={t('Zoom out')} onClick={() => setZoom((z) => Math.max(0.85, z - 0.1))}
          style={{ width: 42, height: 40, borderRadius: 10, border: `1.5px solid ${TEAL}`, background: TEAL, color: '#fff', fontSize: 17, fontWeight: 800 }}>⊖</button>
        <button onClick={onBack}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: NAVY, color: '#fff', fontWeight: 800, fontSize: 13.5, borderRadius: 10, padding: '11px 20px' }}>
          {t('↩ Save And Exit')}
        </button>
        <button disabled={busy} onClick={onComplete}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--good)', color: '#fff', fontWeight: 800, fontSize: 13.5, borderRadius: 10, padding: '11px 20px',
            boxShadow: '0 4px 14px rgba(46,158,107,.35)' }}>
          {t('✓ Complete Assignment')}
        </button>
      </div>

      <div className="home-split" style={{ gridTemplateColumns: '1fr 1.05fr', alignItems: 'start' }}>
        {/* ---- passage ---- */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 150, display: 'flex', alignItems: 'center', background: '#eef1f4', borderRadius: 9, padding: '9px 14px' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>{t('Passage')}</span>
              <b style={{ marginLeft: 'auto', fontSize: 14 }}>The Big Move</b>
            </div>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1.5px solid ${TEAL}`, color: NAVY, background: '#fff', fontWeight: 800, fontSize: 13, borderRadius: 9, padding: '9px 14px' }}>
              {t('📖 Dictionary')}
            </button>
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1.5px solid ${TEAL}`, color: NAVY, background: '#fff', fontWeight: 800, fontSize: 13, borderRadius: 9, padding: '9px 14px' }}>
              {t('🖥️ Line Reader')}
            </button>
            <button title={t('Reset zoom')} onClick={() => setZoom(1)}
              style={{ width: 38, height: 38, borderRadius: 9, border: `1.5px solid ${TEAL}`, background: '#fff', color: TEAL, fontSize: 15 }}>⟳</button>
          </div>
          <div style={{ fontSize: 14 * zoom, lineHeight: 1.65, color: '#233c50', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PASSAGE.map((para, i) => (
              <p key={i} style={{ margin: 0 }}>{i + 1}. {para}</p>
            ))}
          </div>
        </div>

        {/* ---- questions ---- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <b style={{ fontSize: 13.5, color: '#233c50' }}>{t('Question No.')}</b>
            {QUESTIONS.map((_, i) => {
              const cur = i === q
              const done = submitted[i]
              return (
                <button key={i} onClick={() => setQ(i)}
                  style={{ width: 30, height: 30, borderRadius: 7, fontWeight: 800, fontSize: 13,
                    background: cur ? NAVY : done ? '#f3e388' : '#fff',
                    color: cur ? '#fff' : '#233c50',
                    border: cur ? `1.5px solid ${NAVY}` : done ? '1.5px solid #d9c33f' : '1.5px solid #c9d6de' }}>
                  {i + 1}
                </button>
              )
            })}
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: allDone ? 'var(--good)' : 'var(--muted)' }}>
              {t('{n}/{total} answered', { n: answeredCount, total: QUESTIONS.length })}
            </span>
          </div>

          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#233c50', paddingBottom: 12, borderBottom: `2px solid ${TEAL}`, marginBottom: 14 }}>
              {t('Read the question carefully. Then enter your answer in the box provided.')}
            </div>
            <p style={{ fontSize: 14, color: '#233c50', margin: '0 0 14px' }}>{QUESTIONS[q]}</p>

            {/* editor */}
            <div style={{ border: '1.5px solid #c9d6de', borderRadius: '8px 8px 0 0', borderBottom: 'none', padding: '8px 12px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <b style={{ fontSize: 14, width: 16, textAlign: 'center' }}>B</b>
              <i style={{ fontSize: 14, fontFamily: 'Georgia,serif', width: 12, textAlign: 'center' }}>I</i>
              <u style={{ fontSize: 14, width: 12, textAlign: 'center' }}>U</u>
              <span style={{ width: 1, height: 18, background: '#c9d6de' }} />
              <span style={{ fontSize: 13, color: '#6b8296' }}>1≡</span>
              <span style={{ fontSize: 13, color: '#6b8296' }}>•≡</span>
            </div>
            <textarea value={answers[q]} maxLength={475} onChange={(e) => setAnswer(e.target.value)}
              placeholder={t('Write your answer here....')}
              style={{ width: '100%', minHeight: 190, border: '1.5px solid #c9d6de', borderRadius: '0 0 8px 8px', padding: '12px 14px', fontSize: 14, lineHeight: 1.55, fontFamily: 'inherit', resize: 'vertical', outline: 'none', display: 'block' }} />
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>{t('Max. {n} characters', { n: 475 })}</div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 14 }}>
              {submitted[q] && <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--good)' }}>{t('✓ Answer submitted')}</span>}
              <button onClick={submitAnswer} disabled={!answers[q].trim()}
                style={{ background: answers[q].trim() ? NAVY : '#c3d0da', color: '#fff', fontWeight: 800, fontSize: 13.5, borderRadius: 10, padding: '12px 24px' }}>
                {t('Submit Answer')}
              </button>
            </div>
          </div>

          {allDone && (
            <div className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, background: '#e6f6ee', border: '1.5px solid #7ccfa4' }}>
              <span style={{ fontSize: 24 }}>🎉</span>
              <b style={{ flex: 1, fontSize: 14, color: '#1e6a44' }}>{t('All {n} questions answered — great work!', { n: QUESTIONS.length })}</b>
              <button disabled={busy} onClick={onComplete}
                style={{ background: 'var(--good)', color: '#fff', fontWeight: 800, fontSize: 13.5, borderRadius: 999, padding: '10px 22px' }}>
                {t('✓ Complete Assignment')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
