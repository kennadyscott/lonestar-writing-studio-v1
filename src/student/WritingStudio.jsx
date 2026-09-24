import React, { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api.js'
import { LanguageBridgePanel } from './LanguageBridge.jsx'
import PromptBridge from './PromptBridge.jsx'
import { ReadAloudText } from './ReadAloud.jsx'
import TraitPanel from './TraitPanel.jsx'
import PromptsPanel from './PromptsPanel.jsx'
import { useT, useLocale } from '../lib/i18n/index.jsx'

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


function draftDate(iso, locale) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
}

function wordCount(text) {
  return (text || '').trim().split(/\s+/).filter(Boolean).length
}

function ReadPane({ draft, heading, publishedNote }) {
  const t = useT()
  return (
    <article className="card read-pane">
      <header className="read-pane-head">
        <h2 className="read-pane-title">{heading}</h2>
        <span>{t('{n} words', { n: wordCount(draft.content) })}</span>
      </header>
      <div className="read-pane-body">{draft.content}</div>
      {publishedNote && (
        <div className="read-pane-note">
          <span className="pill gold" style={{ padding: '8px 16px' }}>{t('🌟 Published — find it anytime in your Writing Bank')}</span>
        </div>
      )}
    </article>
  )
}

export default function WritingStudio({ state, sub, health, onChange, onBack }) {
  const supportLevel = state.students?.find((x) => x.id === sub.studentId)?.supportLevel || null
  const t = useT()
  const locale = useLocale()
  const [compare, setCompare] = useState(false)
  const asg = state.assignments.find((a) => a.id === sub.assignmentId)
  const isFree = asg.genre === 'free'
  const published = !!sub.published
  const currentDraft = sub.drafts[sub.drafts.length - 1]
  const [selectedId, setSelectedId] = useState(currentDraft.id)
  const selected = sub.drafts.find((d) => d.id === selectedId) || currentDraft
  const isCurrent = selected.id === currentDraft.id
  const [content, setContent] = useState(selected.content)
  const [title, setTitle] = useState(asg.title || '')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [pub, setPub] = useState(null) // publish celebration
  const [sharedNow, setSharedNow] = useState(false)
  const timer = useRef(null)
  // The bank reads React state, not the saved draft. Autosave has to push
  // the words (and the title) up, or the card still says nothing was written.
  const contentRef = useRef(selected.content || '')
  const dirtyRef = useRef(false)
  const titleRef = useRef(asg.title || '')
  const titleDirtyRef = useRef(false)
  const draftIdRef = useRef(currentDraft.id)
  const subIdRef = useRef(sub.id)
  const onChangeRef = useRef(onChange)
  const flushRef = useRef(async () => {})
  const leavingRef = useRef(false)
  draftIdRef.current = currentDraft.id
  subIdRef.current = sub.id
  onChangeRef.current = onChange

  flushRef.current = async () => {
    clearTimeout(timer.current)
    const jobs = []
    if (dirtyRef.current) {
      const text = contentRef.current
      const id = draftIdRef.current
      dirtyRef.current = false
      jobs.push(api.saveContent(id, text))
    }
    if (titleDirtyRef.current && isFree) {
      const next = titleRef.current
      titleDirtyRef.current = false
      jobs.push(api.renamePiece(subIdRef.current, next))
    }
    if (!jobs.length) return
    await Promise.all(jobs)
    await onChangeRef.current?.()
  }

  function poke() {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { void flushRef.current() }, 500)
  }

  // keep selection on the working draft as new versions appear
  useEffect(() => { setSelectedId(currentDraft.id) }, [currentDraft.id])
  useEffect(() => { setContent(selected.content || '') }, [selected.id])
  useEffect(() => () => {
    clearTimeout(timer.current)
    void flushRef.current()
  }, [])

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
    contentRef.current = v
    dirtyRef.current = true
    poke()
  }

  function editTitle(v) {
    const next = v.slice(0, 80)
    setTitle(next)
    titleRef.current = next
    titleDirtyRef.current = true
    poke()
  }

  // A free write needs a title before a draft is finished or published (her call,
  // 2026-09-24: "it's easy to bypass"). Saving to finish later still works.
  const titleInputRef = useRef(null)
  const [titleNudge, setTitleNudge] = useState(false)
  function needsTitle() {
    if (!isFree || (titleRef.current || '').trim()) return false
    setTitleNudge(true)
    const el = titleInputRef.current
    if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.focus() }
    return true
  }

  async function saveRevision() {
    if (needsTitle()) return
    setSaving(true)
    await flushRef.current()
    const res = await api.saveRevision(sub.id)
    setToast(res)
    await onChange()
    setSaving(false)
  }

  // free write: publish the finished piece
  async function publishWork() {
    if (needsTitle()) return
    setSaving(true)
    await flushRef.current()
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

  // Back, the logo, and Save Writing all leave the saved words in the bank card.
  async function leave() {
    if (leavingRef.current) return
    leavingRef.current = true
    setSaving(true)
    await flushRef.current()
    onBack && onBack()
  }

  const wc = (content || '').split(/\s+/).filter(Boolean).length
  const writing = isCurrent && !published && !compare
  function versionBits(d) {
    const name = d.isOriginal ? t('Original') : t('Draft {n}', { n: d.n })
    const when = draftDate(d.createdAt || d.updatedAt, locale)
    const mark = d.id === currentDraft.id && published ? t('Published') : ''
    return [name, when, mark].filter(Boolean).join(' · ')
  }

  return (
    <div style={isFree ? { margin: '-26px calc(50% - 50vw) -70px', padding: '18px clamp(22px, 2.6vw, 56px) 40px', minHeight: 'calc(100vh - 64px)', boxSizing: 'border-box', position: 'relative' } : undefined}>
      {/* the dashboard's enchanted forest at 22%; the sky/space backdrop is retired */}
      {isFree && <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `url(${import.meta.env.BASE_URL || '/'}bg-enchanted.jpg) center / cover no-repeat`, opacity: .22 }} />}
      <div style={isFree ? { maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 1 } : undefined}>
      <CoinToast data={toast} onClose={() => setToast(null)} />

      {pub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }}>
          <div className="card" style={{ padding: 30, width: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🌟</div>
            <h2 style={{ margin: '4px 0' }}>{t('Published!')}</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 12px', fontSize: 14.5 }}>{t('"{title}" is a finished piece — drafted, revised, and done. That\'s real writing.', { title: (asg.title || '').trim() || t('Untitled') })}</p>
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

      {onBack && <button className={`backlink${isFree ? ' on-scene' : ''}`} onClick={leave}>{t('← Back to My Writing')}</button>}

      {/* on a free write the title and versions share one frosted panel so they read over the forest */}
      <div className={isFree ? 'glass-head' : undefined} style={isFree ? { marginBottom: 14 } : undefined}>
      {isFree ? (
        <div style={{ marginBottom: 10 }}>
          <div className="eyebrow">{t('Free Write')}</div>
          <input ref={titleInputRef} className={`piece-title${!title.trim() ? ' empty' : ''}${titleNudge && !title.trim() ? ' needs' : ''}`}
            value={title} onChange={(e) => editTitle(e.target.value)} readOnly={published}
            placeholder={t('Give your piece a title…')} aria-label={t('Title')} aria-required="true" aria-invalid={titleNudge && !title.trim()} maxLength={80} />
          {!title.trim() && !published && (
            <div className={`piece-title-hint${titleNudge ? ' needs' : ''}`} role={titleNudge ? 'alert' : undefined}>
              {titleNudge ? t('✏️ Give your piece a title first, then finish your draft.') : t('✏️ Every piece needs a title.')}
            </div>
          )}
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
          const when = draftDate(d.createdAt || d.updatedAt, locale)
          return (
            <button key={d.id} onClick={() => { void flushRef.current().then(() => setSelectedId(d.id)) }}
              style={{ padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: on ? '2px solid var(--navy-1)' : '1px solid var(--line)',
                background: on ? '#eef4f7' : '#fff', color: 'var(--ink)' }}>
              {d.isOriginal ? t('Original') : t('Draft {n}', { n: d.n })}
              {when ? ` · ${when}` : ''}
              {isCur ? ` · ${published ? t('Published') : t('now')}` : ''}
            </button>
          )
        })}
        {sub.drafts.length > 1 && (
          <button type="button" className="btn ghost" aria-pressed={compare} onClick={() => setCompare((v) => !v)}
            style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 13 }}>
            {compare ? t('Close compare') : t('Compare side by side')}
          </button>
        )}
        {!isCurrent && !compare && <span className="pill" style={{ background: '#fff4d6', color: '#a37400' }}>{t('viewing history — read only')}</span>}
      </div>
      </div>

      {writing ? (
      <div className="write-layout">
        {/* editor */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ fontSize: 15 }}>
              {isFree && isCurrent && selected.n > 1 ? t('✏️ Revising Draft {n}', { n: selected.n }) : `${t('Draft {n}', { n: selected.n })} ${isCurrent ? t('(working copy)') : ''}`}
            </b>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t('{n} words', { n: wc })}</span>
          </div>
          <textarea id="ws-editor" value={content} onChange={(e) => edit(e.target.value)} placeholder={isFree ? t('Start writing here…\nAnything goes.') : t('Start writing your argument here…')}
            style={{ flex: 1, minHeight: 380, border: 'none', outline: 'none', resize: 'none', padding: 18, fontSize: 16, lineHeight: 1.6, fontFamily: 'Manrope, sans-serif', color: 'var(--ink)' }} />
          {isCurrent && !published && (
            <div style={{ borderTop: '1px solid var(--line)', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {isFree ? t('Autosaves as you type · completing a draft saves it to your Versions') : t('Autosaves as you type · saving a revision snapshots this version')}
              </span>
              {isFree ? (
                <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn ghost" disabled={saving} onClick={leave} title={t('Save and finish later')}>{t('💾 Save Writing')}</button>
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
            <PromptsPanel summary={state.growthSummary} />
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
      ) : (
        <div className={compare && sub.drafts.length > 1 ? 'read-layout compare' : 'read-layout'}>
          {compare && sub.drafts.length > 1 ? (
            <>
              <ReadPane draft={selected.id === currentDraft.id ? sub.drafts[sub.drafts.length - 2] : selected}
                heading={versionBits(selected.id === currentDraft.id ? sub.drafts[sub.drafts.length - 2] : selected)} />
              <ReadPane draft={currentDraft} publishedNote={published} heading={versionBits(currentDraft)} />
            </>
          ) : (
            <ReadPane draft={selected} publishedNote={published && isCurrent}
              heading={published && isCurrent
                ? `🌟 ${((asg.title || '').trim() || t('Untitled'))} — ${t('Published')}`
                : versionBits(selected)} />
          )}
        </div>
      )}

      {isFree && (
        <div className="fw-footer" style={{ '--fw-img': `url(${import.meta.env.BASE_URL || '/'}prac-free.jpg)` }}>
          <div className="fw-footer-words">
            <div className="fw-footer-kicker">{t('Writing builds brighter thinkers')}</div>
            <div className="fw-footer-line">{t('Every word you write makes your mind a little stronger.')}</div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
