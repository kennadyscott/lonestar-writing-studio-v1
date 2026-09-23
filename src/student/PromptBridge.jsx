import React, { useState } from 'react'
import { useT, useLang } from '../lib/i18n/index.jsx'
import { levelOf, promptSupportFor } from '../lib/languageBridge.js'

/*
 * Prompt support — the first of the spec's nine areas, and the one that makes
 * the three levels look different at a glance.
 *
 * The question itself never changes. A Beginning student and an Advanced
 * student are answering the same grade-level prompt; only how much of it
 * arrives at once is different. Advanced renders nothing here on purpose.
 */

function GlossChip({ g, bilingual }) {
  const [open, setOpen] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen((v) => !v)}
        style={{ background: open ? '#0a7dba' : '#eef6fb', color: open ? '#fff' : '#0d2f55', border: '1px solid #bcd9ec',
          borderRadius: 999, padding: '3px 10px', fontSize: 11.5, fontWeight: 800 }}>
        {g.word}
      </button>
      {open && (
        <span style={{ position: 'absolute', zIndex: 20, top: 'calc(100% + 6px)', left: 0, width: 230, background: '#fff',
          border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px', boxShadow: '0 8px 22px rgba(13,47,85,.18)' }}>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--ink)', lineHeight: 1.4 }}>{g.kid}</span>
          {bilingual && g.es && (
            <span style={{ display: 'block', fontSize: 11.5, color: '#0a7dba', fontWeight: 700, marginTop: 4 }}>{g.es}</span>
          )}
        </span>
      )}
    </span>
  )
}

export default function PromptBridge({ level, bridge }) {
  const t = useT()
  const { lang } = useLang()
  const lv = levelOf(level)
  const sup = promptSupportFor(level, bridge)
  if (!lv || !sup) return null

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        <span style={{ fontSize: 13 }}>🌉</span>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .6, color: lv.color, textTransform: 'uppercase' }}>{t(sup.title)}</span>
      </div>

      {/* Beginning: a plain restatement, then the question in steps. */}
      {sup.mode === 'steps' && (
        <>
          {sup.simple && (
            <div style={{ background: `${lv.color}10`, border: `1px solid ${lv.color}33`, borderRadius: 10, padding: '9px 12px',
              fontSize: 14.5, fontWeight: 700, color: '#0d2f55', lineHeight: 1.45, marginBottom: 9 }}>
              {t(sup.simple)}
            </div>
          )}
          <ol style={{ margin: '0 0 9px', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sup.steps.map((step, i) => (
              <li key={step} style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: lv.color, color: '#fff',
                  display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>{i + 1}</span>
                <span style={{ fontSize: 13.5, color: '#233c50' }}>{t(step)}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      {/* Intermediate: the real prompt, broken where the sentences break. It is
          never translated — at this level the student reads the actual English
          prompt, only in smaller pieces. Translanguaging is Beginning-only,
          which is why the steps above DO run through t() and these do not. */}
      {sup.mode === 'chunks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 9 }}>
          {sup.chunks.map((c) => (
            <div key={c} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: lv.color, flexShrink: 0, minHeight: 18 }} />
              <span style={{ fontSize: 13.5, color: '#233c50', lineHeight: 1.45 }}>{c}</span>
            </div>
          ))}
        </div>
      )}

      {/* Vocabulary. Tap a word for a definition; Beginning also gets Spanish. */}
      {sup.gloss.length > 0 && (
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .6, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 5 }}>
            {t('Tap a word you do not know')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {sup.gloss.map((g) => <GlossChip key={g.word} g={g} bilingual={sup.bilingual || lang === 'es'} />)}
          </div>
        </div>
      )}
    </div>
  )
}
