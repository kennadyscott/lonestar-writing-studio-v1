import React, { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api.js'
import { LanguageBridgePanel } from './LanguageBridge.jsx'
import PromptBridge from './PromptBridge.jsx'
import { ReadAloudText } from './ReadAloud.jsx'
import TraitPanel from './TraitPanel.jsx'
import PromptsPanel from './PromptsPanel.jsx'
import { useT } from '../lib/i18n/index.jsx'

function CoinToast({ data, onClose }) {
  const t = useT()
  if (!data) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.45)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={onClose}>
      <div className="card" style={{ padding: 28, width: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 46 }}>🎉</div>
        <h2 style={{ margin: '6px 0' }}>{t('Revision saved!')}</h2>
        {data.newMilestones.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>{t('New version saved. Keep going — bigger changes earn coins!')}</p>
        ) : (
          <>
            <p style={{ color: 'var(--muted)', marginTop: 0 }}>{t('You earned')} <b>{data.coinsAwarded}</b> {t('ClassCade coins for how you worked:')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '14px 0' }}>
              {data.newMilestones.map((m) => (
                <div key={m.id} className="pill gold" style={{ justifyContent: 'space-between', fontSize: 13, padding: '8px 12px' }}>
                  <span>{m.label}</span><span className="coin"><span className="disc" />+{m.coins}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <button className="btn" style={{ marginTop: 6 }} onClick={onClose}>{t('Keep writing')}</button>
      </div>
    </div>
  )
}

const FW = (import.meta.env.BASE_URL || '/') + 'freewrite/'

export default function WritingStudio({ state, sub, health, onChange, onBack }) {
  const supportLevel = state.students?.find((x) => x.id === sub.studentId)?.supportLevel || null
  const t = useT()
  const asg = state.assignments.find((a) => a.id === sub.assignmentId)
  const isFree = asg.genre === 'free'
  const published = !!sub.published
  const currentDraft = sub.drafts[sub.drafts.length - 1]
  const [selectedId, setSelectedId] = useState(currentDraft.id)
  const selected = sub.drafts.find((d) => d.id === selectedId) || currentDraft
  const isCurrent = selected.id === currentDraft.id
  const [content, setContent] = useState(selected.content)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [pub, setPub] = useState(null) // publish celebration
  const [sharedNow, setSharedNow] = useState(false)
  const timer = useRef(null)

  // keep selection on the working draft as new versions appear
  useEffect(() => { setSelectedId(currentDraft.id) }, [currentDraft.id])
  useEffect(() => { setContent(selected.content) }, [selected.id])

  // Language Bridge inserts a frame/starter where the student is writing.
  function insertSupport(text) {
    const el = document.querySelector('#ws-editor')
    const cur = content || ''
    if (!el) { edit((cur ? cur.replace(/\s*$/, '') + ' ' : '') + text); return }
    const a = el.selectionStart ?? cur.length, b = el.selectionEnd ?? cur.length
    const pad = a > 0 && !/\s$/.test(cur.slice(0, a)) ? ' ' : ''
    const next = cur.slice(0, a) + pad + text + cur.slice(b)
    edit(next)
    requestAnimationFrame(() => { el.focus(); const p = a + pad.length + text.length; el.setSelectionRange(p, p) })
  }

  function edit(v) {
    setContent(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => api.saveContent(currentDraft.id, v), 500)
  }

  async function saveRevision() {
    setSaving(true)
    clearTimeout(timer.current)
    await api.saveContent(currentDraft.id, content)
    const res = await api.saveRevision(sub.id)
    setToast(res)
    await onChange()
    setSaving(false)
  }

  // free write: publish the finished piece
  async function publishWork() {
    setSaving(true)
    clearTimeout(timer.current)
    await api.saveContent(currentDraft.id, content)
    const r = await api.publish(sub.id)
    setPub(r)
    await onChange()
    setSaving(false)
  }
  async function shareToWall() {
    await api.share(sub.id)
    setSharedNow(true)
    onChange && onChange()
  }

  // free write: save & close — finish or revise later from the Free Write chooser
  async function saveAndClose() {
    setSaving(true)
    clearTimeout(timer.current)
    await api.saveContent(currentDraft.id, content)
    await onChange()
    setSaving(false)
    onBack && onBack()
  }

  const wc = (content || '').split(/\s+/).filter(Boolean).length

  return (
    <div style={isFree ? { margin: '-26px calc(50% - 50vw) -70px', padding: '18px clamp(22px, 2.6vw, 56px) 40px', minHeight: 'calc(100vh - 64px)', boxSizing: 'border-box',
      backgroundImage: `linear-gradient(rgba(233,240,249,.5), rgba(233,240,249,.5)), url(${FW}sky.webp)`, backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed' } : undefined}>
      <div style={isFree ? { maxWidth: 1180, margin: '0 auto' } : undefined}>
      <CoinToast data={toast} onClose={() => setToast(null)} />

      {pub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }}>
          <div className="card" style={{ padding: 30, width: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🌟</div>
            <h2 style={{ margin: '4px 0' }}>{t('Published!')}</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 12px', fontSize: 14.5 }}>{t('"{title}" is a finished piece — drafted, revised, and done. That\'s real writing.', { title: asg.title })}</p>
            {pub.coins > 0 && (
              <div className="pill gold" style={{ justifyContent: 'center', padding: '9px 14px', fontSize: 14, marginBottom: 12 }}>
                {t('🏅 Published a finished piece')}&nbsp;&nbsp;<span className="coin"><span className="disc" />+{pub.coins}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn" style={{ justifyContent: 'center', background: sharedNow ? 'var(--good)' : '#c2571f' }}
                disabled={sharedNow} onClick={shareToWall}>
                {sharedNow ? t('✓ Shared to the Writing Wall!') : t('💛 Share to the Writing Wall')}
              </button>
              <button className="btn ghost" style={{ justifyContent: 'center' }} onClick={() => { setPub(null); onBack && onBack() }}>
                {t('Back to my dashboard')}
              </button>
            </div>
          </div>
        </div>
      )}

      {onBack && <button className="backlink" onClick={onBack}>{t('← Back to My Writing')}</button>}

      {isFree ? (
        /* Free Write: a plain title, so the page gets straight to the writing */
        <div style={{ marginBottom: 10 }}>
          <div className="eyebrow">{t('The Writing Studio')}</div>
          <h1 className="page" style={{ margin: '2px 0 0' }}>{t('Free Write')}</h1>
        </div>
      ) : (
        /* prompt banner */
        <div className="card" style={{ padding: '14px 18px', marginBottom: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: 24 }}>📣</div>
          <div style={{ flex: 1 }}>
            <div className="eyebrow">{asg.format ? `${asg.format} · ` : ''}{asg.type || asg.genre} · {t('Grade {n}', { n: asg.gradeLevel })}{asg.scopeStage ? ` · ${asg.scopeStage}` : ''}</div>
            {/* The prompt is always the grade-level English. Read-aloud only
                changes whether the student can hear it. */}
            <ReadAloudText text={asg.prompt} lang="en" level={supportLevel}
              style={{ fontSize: 14, marginTop: 2 }} />
            {/* The language objective is a publisher field that rides on the
                assignment. It only shows for students the teacher has placed
                on the Language Bridge — everyone else sees the prompt alone. */}
            {supportLevel && asg.languageObjective && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--line)' }}>
                <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: .6, color: 'var(--link)', textTransform: 'uppercase' }}>{t('Language objective')}</span>
                <div style={{ fontSize: 13, color: '#33607f', marginTop: 1, lineHeight: 1.45 }}>{asg.languageObjective}</div>
              </div>
            )}
            <PromptBridge level={supportLevel} bridge={asg.bridge} />
          </div>
        </div>
      )}

      {/* version strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>{t('Versions:')}</span>
        {sub.drafts.map((d) => {
          const on = d.id === selectedId
          const isCur = d.id === currentDraft.id
          return (
            <button key={d.id} onClick={() => setSelectedId(d.id)}
              style={{ padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: on ? '2px solid var(--navy-1)' : '1px solid var(--line)',
                background: on ? '#eef4f7' : '#fff', color: 'var(--ink)' }}>
              {d.isOriginal ? t('Original') : t('Draft {n}', { n: d.n })}{isCur ? ` · ${t('now')}` : ''}
            </button>
          )
        })}
        {!isCurrent && <span className="pill" style={{ background: '#fff4d6', color: '#a37400' }}>{t('viewing history — read only')}</span>}
      </div>

      {/* two-column workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 16, alignItems: 'stretch' }}>
        {/* editor */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ fontSize: 15 }}>
              {published ? `🌟 ${asg.title} — ${t('Published')}` : isFree && isCurrent && selected.n > 1 ? t('✏️ Revising Draft {n}', { n: selected.n }) : `${t('Draft {n}', { n: selected.n })} ${isCurrent ? t('(working copy)') : ''}`}
            </b>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t('{n} words', { n: wc })}</span>
          </div>
          {isCurrent && !published ? (
            <textarea id="ws-editor" value={content} onChange={(e) => edit(e.target.value)} placeholder={isFree ? t('Start writing here…\nAnything goes.') : t('Start writing your argument here…')}
              style={{ flex: 1, minHeight: 380, border: 'none', outline: 'none', resize: 'none', padding: 18, fontSize: 16, lineHeight: 1.6, fontFamily: 'Manrope, sans-serif', color: 'var(--ink)' }} />
          ) : (
            <div style={{ flex: 1, minHeight: 380, padding: 18, fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#3a4149' }}>{selected.content}</div>
          )}
          {isCurrent && published && (
            <div style={{ borderTop: '1px solid var(--line)', padding: 12, display: 'flex', justifyContent: 'center' }}>
              <span className="pill gold" style={{ padding: '8px 16px' }}>{t('🌟 Published — find it anytime in your Writing Bank')}</span>
            </div>
          )}
          {isCurrent && !published && (
            <div style={{ borderTop: '1px solid var(--line)', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {isFree ? t('Autosaves as you type · completing a draft saves it to your Versions') : t('Autosaves as you type · saving a revision snapshots this version')}
              </span>
              {isFree ? (
                <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn ghost" disabled={saving} onClick={saveAndClose} title={t('Save and finish later')}>{t('💾 Save Writing')}</button>
                  {currentDraft.n === 1 ? (
                    <button className="btn gold" disabled={saving || wc < 5} onClick={saveRevision}>
                      {saving ? t('Saving…') : t('✅ First Draft Complete')}
                    </button>
                  ) : (
                    <>
                      <button className="btn ghost" disabled={saving || wc < 5} onClick={saveRevision} title={t('Snapshot this draft and keep revising')}>
                        {t('✅ Draft {n} Complete', { n: currentDraft.n })}
                      </button>
                      <button className="btn gold" disabled={saving || wc < 5} onClick={publishWork}>
                        {saving ? t('Saving…') : t('🌟 Publish Work')}
                      </button>
                    </>
                  )}
                </span>
              ) : (
                <button className="btn gold" disabled={saving || wc < 5} onClick={saveRevision}>{saving ? t('Saving…') : t('💾 Save this revision')}</button>
              )}
            </div>
          )}
        </div>

        {/* Language Bridge (teacher-set) sits above whichever panel this is */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* RACE is a constructed-response organizer — a free write has no
            question to restate, so it gets sentence support only. */}
        {supportLevel && <LanguageBridgePanel level={supportLevel} onInsert={insertSupport}
          race={!isFree} canStartFrames={!(content || '').trim()} />}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: supportLevel ? 320 : 480 }}>
          {isFree ? (
            <PromptsPanel streakDays={state.growthSummary?.streakDays ?? 0} />
          ) : (
            <>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
                <div style={{ flex: 1, padding: '12px', fontWeight: 700, fontSize: 14, background: '#fff', color: 'var(--navy-1)',
                  borderBottom: '2px solid var(--navy-1)', textAlign: 'center' }}>{t('🎯 Traits')}</div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <TraitPanel draft={selected} readOnly={!isCurrent} onChange={onChange} />
              </div>
            </>
          )}
        </div>
        </div>
      </div>

      {isFree && (
        <div style={{ marginTop: 18, borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)', border: '1px solid var(--gold-line)' }}>
          <img src={`${FW}footer.webp`} alt="Writing builds brighter thinkers. Every word you write makes your mind a little stronger." style={{ display: 'block', width: '100%', height: 'auto' }} />
        </div>
      )}
      </div>
    </div>
  )
}
