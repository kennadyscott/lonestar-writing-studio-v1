import React, { useState } from 'react'
import { useT } from '../lib/i18n/index.jsx'
import { levelOf, SENTENCE_SUPPORT, RACE_PARTS, LANGUAGE_EXPECTATION } from '../lib/languageBridge.js'

/*
 * The student-facing Language Bridge panel.
 *
 * Shown only when the teacher has set a support level. It scaffolds HOW a
 * student writes, never WHAT they are asked — the prompt stays grade level at
 * every level, which is the whole point of the spec.
 *
 * Beginning gets frames inserted for them (her open question 3); Intermediate
 * gets starters they choose to use; Advanced gets an optional phrase bank.
 */

export function LanguageBridgePanel({ level, onInsert, compact = false, race = true, canStartFrames = false }) {
  const t = useT()
  const lv = levelOf(level)
  const [openRace, setOpenRace] = useState(level === 'beginning')
  if (!lv) return null

  const sentence = SENTENCE_SUPPORT[level]
  const expect = LANGUAGE_EXPECTATION[level]
  // RACE is a constructed-response organizer. A timed free write has no
  // question to restate, so that surface passes race={false}.
  const showRace = race && level !== 'advanced'
  const startFrames = () => RACE_PARTS.forEach((p) => onInsert && onInsert(p.frame))

  return (
    <div style={{ border: `1px solid ${lv.color}44`, borderRadius: 14, background: '#fff', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: `${lv.color}12`, borderBottom: `1px solid ${lv.color}33` }}>
        <span style={{ fontSize: 17 }}>🌉</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0d2f55' }}>{t('Language Bridge')}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{t(lv.blurb)}</div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: .5, color: '#fff', background: lv.color, borderRadius: 999, padding: '3px 9px' }}>
          {t(lv.label)}
        </span>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Beginning: the spec asks for the frames to be there already, not
            hunted for. This drops all four in with one press. */}
        {level === 'beginning' && canStartFrames && showRace && (
          <button onClick={startFrames}
            style={{ width: '100%', background: `${lv.color}12`, border: `1.5px solid ${lv.color}55`, borderRadius: 10, padding: '9px 12px', fontSize: 12.5, fontWeight: 800, color: '#0d2f55' }}>
            {t('✏️ Start me off with the frames')}
          </button>
        )}

        {/* sentence support */}
        <div>
          <div style={{ fontWeight: 800, fontSize: 12.5, color: '#0d2f55' }}>{t(sentence.title)}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 7 }}>{t(sentence.hint)}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {sentence.items.map((item) => (
              <button key={item} onClick={() => onInsert && onInsert(item)} title={t('Add this to your writing')}
                style={{ background: '#f6fafd', border: '1px solid var(--line)', borderRadius: 9, padding: '6px 10px', fontSize: 12, color: 'var(--ink)', textAlign: 'left', fontWeight: 600 }}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* RACE organizer */}
        {showRace && (
          <div>
            <button onClick={() => setOpenRace((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 12.5, color: '#0d2f55', padding: 0 }}>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{openRace ? '▼' : '▶'}</span>
              {t('RACE organizer')}
            </button>
            {openRace && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 7 }}>
                {RACE_PARTS.map((p) => (
                  <div key={p.key} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', background: '#fbfdfe', border: '1px solid var(--line)', borderRadius: 10, padding: '7px 9px' }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, background: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{p.key}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 12, color: '#0d2f55' }}>{t(p.label)}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.35 }}>{t(p.ask)}</div>
                    </div>
                    {level === 'beginning' && (
                      <button onClick={() => onInsert && onInsert(p.frame)} title={t('Add this to your writing')}
                        style={{ fontSize: 11, fontWeight: 800, color: 'var(--link)', flexShrink: 0, padding: '2px 4px' }}>+</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* what "done" looks like at this level */}
        {!compact && expect && (
          <div style={{ background: '#f6fafd', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 10px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .5, color: 'var(--link)', textTransform: 'uppercase' }}>{t('Your goal right now')}</div>
            <div style={{ fontSize: 12, color: 'var(--ink)', marginTop: 2, lineHeight: 1.4 }}>{t(expect.label)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* A one-line badge for surfaces too small for the full panel. */
export function LanguageBridgeBadge({ level }) {
  const t = useT()
  const lv = levelOf(level)
  if (!lv) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${lv.color}14`, border: `1px solid ${lv.color}44`, borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 800, color: '#0d2f55' }}>
      🌉 {t('Language Bridge')} · {t(lv.label)}
    </span>
  )
}
