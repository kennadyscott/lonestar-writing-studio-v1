import React, { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api.js'
import ConferencePanel from './ConferencePanel.jsx'
import TraitPanel from './TraitPanel.jsx'
import PromptsPanel from './PromptsPanel.jsx'

function CoinToast({ data, onClose }) {
  if (!data) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.45)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={onClose}>
      <div className="card" style={{ padding: 28, width: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 46 }}>🎉</div>
        <h2 style={{ margin: '6px 0' }}>Revision saved!</h2>
        {data.newMilestones.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>New version saved. Keep going — bigger changes earn coins!</p>
        ) : (
          <>
            <p style={{ color: 'var(--muted)', marginTop: 0 }}>You earned <b>{data.coinsAwarded}</b> ClassCade coins for how you worked:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '14px 0' }}>
              {data.newMilestones.map((m) => (
                <div key={m.id} className="pill gold" style={{ justifyContent: 'space-between', fontSize: 13, padding: '8px 12px' }}>
                  <span>{m.label}</span><span className="coin"><span className="disc" />+{m.coins}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <button className="btn" style={{ marginTop: 6 }} onClick={onClose}>Keep writing</button>
      </div>
    </div>
  )
}

export default function WritingStudio({ state, sub, health, onChange, onBack }) {
  const asg = state.assignments.find((a) => a.id === sub.assignmentId)
  const isFree = asg.genre === 'free'
  const published = !!sub.published
  const currentDraft = sub.drafts[sub.drafts.length - 1]
  const [selectedId, setSelectedId] = useState(currentDraft.id)
  const selected = sub.drafts.find((d) => d.id === selectedId) || currentDraft
  const isCurrent = selected.id === currentDraft.id
  const [content, setContent] = useState(selected.content)
  const [tab, setTab] = useState('conference')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [pub, setPub] = useState(null) // publish celebration
  const [sharedNow, setSharedNow] = useState(false)
  const timer = useRef(null)

  // keep selection on the working draft as new versions appear
  useEffect(() => { setSelectedId(currentDraft.id) }, [currentDraft.id])
  useEffect(() => { setContent(selected.content) }, [selected.id])

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
    <div>
      <CoinToast data={toast} onClose={() => setToast(null)} />

      {pub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }}>
          <div className="card" style={{ padding: 30, width: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🌟</div>
            <h2 style={{ margin: '4px 0' }}>Published!</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 12px', fontSize: 14.5 }}>"{asg.title}" is a finished piece — drafted, revised, and done. That's real writing.</p>
            {pub.coins > 0 && (
              <div className="pill gold" style={{ justifyContent: 'center', padding: '9px 14px', fontSize: 14, marginBottom: 12 }}>
                🏅 Published a finished piece&nbsp;&nbsp;<span className="coin"><span className="disc" />+{pub.coins}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn" style={{ justifyContent: 'center', background: sharedNow ? 'var(--good)' : '#c2571f' }}
                disabled={sharedNow} onClick={shareToWall}>
                {sharedNow ? '✓ Shared to the Writing Wall!' : '💛 Share to the Writing Wall'}
              </button>
              <button className="btn ghost" style={{ justifyContent: 'center' }} onClick={() => { setPub(null); onBack && onBack() }}>
                Back to my dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {onBack && <button className="backlink" onClick={onBack}>← Back to My Writing</button>}

      {/* prompt banner */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ fontSize: 24 }}>📣</div>
        <div style={{ flex: 1 }}>
          <div className="eyebrow">{asg.format ? `${asg.format} · ` : ''}{asg.type || asg.genre} · Grade {asg.gradeLevel}{asg.scopeStage ? ` · ${asg.scopeStage}` : ''}</div>
          <div style={{ fontSize: 14, marginTop: 2 }}>{asg.prompt}</div>
        </div>
      </div>

      {/* version strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>Versions:</span>
        {sub.drafts.map((d) => {
          const on = d.id === selectedId
          const isCur = d.id === currentDraft.id
          return (
            <button key={d.id} onClick={() => setSelectedId(d.id)}
              style={{ padding: '6px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                border: on ? '2px solid var(--navy-1)' : '1px solid var(--line)',
                background: on ? '#eef4f7' : '#fff', color: 'var(--ink)' }}>
              {d.isOriginal ? 'Original' : `Draft ${d.n}`}{isCur ? ' · now' : ''}
            </button>
          )
        })}
        {!isCurrent && <span className="pill" style={{ background: '#fff4d6', color: '#a37400' }}>viewing history — read only</span>}
      </div>

      {/* two-column workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 16, alignItems: 'stretch' }}>
        {/* editor */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ fontSize: 15 }}>
              {published ? `🌟 ${asg.title} — Published` : isFree && isCurrent && selected.n > 1 ? `✏️ Revising Draft ${selected.n}` : `Draft ${selected.n} ${isCurrent ? '(working copy)' : ''}`}
            </b>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{wc} words</span>
          </div>
          {isCurrent && !published ? (
            <textarea value={content} onChange={(e) => edit(e.target.value)} placeholder="Start writing your argument here…"
              style={{ flex: 1, minHeight: 380, border: 'none', outline: 'none', resize: 'none', padding: 18, fontSize: 16, lineHeight: 1.6, fontFamily: 'Manrope, sans-serif', color: 'var(--ink)' }} />
          ) : (
            <div style={{ flex: 1, minHeight: 380, padding: 18, fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#3a4149' }}>{selected.content}</div>
          )}
          {isCurrent && published && (
            <div style={{ borderTop: '1px solid var(--line)', padding: 12, display: 'flex', justifyContent: 'center' }}>
              <span className="pill gold" style={{ padding: '8px 16px' }}>🌟 Published — find it anytime in your Writing Bank</span>
            </div>
          )}
          {isCurrent && !published && (
            <div style={{ borderTop: '1px solid var(--line)', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                {isFree ? 'Autosaves as you type · completing a draft saves it to your Versions' : 'Autosaves as you type · saving a revision snapshots this version'}
              </span>
              {isFree ? (
                <span style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn ghost" disabled={saving} onClick={saveAndClose} title="Save and finish later">💾 Save Writing</button>
                  {currentDraft.n === 1 ? (
                    <button className="btn gold" disabled={saving || wc < 5} onClick={saveRevision}>
                      {saving ? 'Saving…' : '✅ First Draft Complete'}
                    </button>
                  ) : (
                    <>
                      <button className="btn ghost" disabled={saving || wc < 5} onClick={saveRevision} title="Snapshot this draft and keep revising">
                        ✅ Draft {currentDraft.n} Complete
                      </button>
                      <button className="btn gold" disabled={saving || wc < 5} onClick={publishWork}>
                        {saving ? 'Saving…' : '🌟 Publish Work'}
                      </button>
                    </>
                  )}
                </span>
              ) : (
                <button className="btn gold" disabled={saving || wc < 5} onClick={saveRevision}>{saving ? 'Saving…' : '💾 Save this revision'}</button>
              )}
            </div>
          )}
        </div>

        {/* coach + traits */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 480 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
            {['conference', asg.genre === 'free' ? 'prompts' : 'traits'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: '12px', fontWeight: 700, fontSize: 14, background: tab === t ? '#fff' : '#f6f8f9',
                  color: tab === t ? 'var(--navy-1)' : 'var(--muted)', borderBottom: tab === t ? '2px solid var(--navy-1)' : '2px solid transparent' }}>
                {t === 'conference' ? '💬 Confer' : t === 'prompts' ? '🎲 Prompts' : '🎯 Traits'}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            {tab === 'conference'
              ? <ConferencePanel sub={sub} draft={selected} readOnly={!isCurrent} health={health} onChange={onChange} />
              : tab === 'prompts'
                ? <PromptsPanel />
                : <TraitPanel draft={selected} readOnly={!isCurrent} onChange={onChange} />}
          </div>
        </div>
      </div>
    </div>
  )
}
