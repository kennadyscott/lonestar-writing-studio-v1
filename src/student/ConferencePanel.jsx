import React, { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api.js'
import { useT } from '../lib/i18n/index.jsx'

export default function ConferencePanel({ sub, draft, readOnly, health, onChange }) {
  const t = useT()
  const [messages, setMessages] = useState(draft.conference || [])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scroller = useRef(null)

  useEffect(() => { setMessages(draft.conference || []) }, [draft.id, draft.conference])
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight }, [messages, busy])

  async function send(text) {
    if (busy) return
    setBusy(true)
    if (text) setMessages((m) => [...m, { role: 'user', text, ts: 'now' }])
    setInput('')
    try {
      const reply = await api.confer(sub.id, text)
      setMessages((m) => [...m, { role: 'assistant', text: reply.text, source: reply.source, redirect: reply.redirect }])
      onChange && onChange()
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', text: t('(Sorry — I had trouble connecting. Try again.)'), source: 'error' }])
    }
    setBusy(false)
  }

  const empty = messages.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 22 }}>💬</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{t('Writing Conference')}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {t('Your coach asks questions — it never writes for you.')}
            <span style={{ marginLeft: 6, color: health.hasKey ? 'var(--good)' : 'var(--warn)' }}>
              {health.hasKey ? t('● live ({model})', { model: health.model }) : t('● scripted (add API key for live)')}
            </span>
          </div>
        </div>
      </div>

      <div ref={scroller} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 220 }}>
        {empty && (
          <div style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', margin: 'auto', maxWidth: 260 }}>
            {readOnly ? t('No conference happened on this version.') : (
              <>{t('Pull up a chair. Tap')} <b>{t('Start conferring')}</b> {t('and your coach will ask you a question about your draft.')}</>
            )}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            {m.role === 'assistant' && <div style={{ fontSize: 11, color: 'var(--cc-blue)', fontWeight: 700, marginBottom: 3 }}>{t('COACH')} {m.redirect ? t('· kept the pen with you 🖊️') : ''}</div>}
            <div style={{
              padding: '10px 13px', borderRadius: 14, fontSize: 14, lineHeight: 1.45,
              background: m.role === 'user' ? 'var(--navy-1)' : (m.redirect ? '#fff6e8' : '#eef4f7'),
              color: m.role === 'user' ? '#fff' : 'var(--ink)',
              border: m.redirect ? '1px solid #f0d49a' : 'none',
              borderBottomRightRadius: m.role === 'user' ? 4 : 14, borderBottomLeftRadius: m.role === 'user' ? 14 : 4,
            }}>{m.text}</div>
          </div>
        ))}
        {busy && <div style={{ alignSelf: 'flex-start', color: 'var(--muted)', fontSize: 13, fontStyle: 'italic' }}>{t('coach is thinking…')}</div>}
      </div>

      {!readOnly && (
        <div style={{ borderTop: '1px solid var(--line)', padding: 12 }}>
          {empty ? (
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }} disabled={busy} onClick={() => send('')}>
              {t('Start conferring →')}
            </button>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) send(input.trim()) }} style={{ display: 'flex', gap: 8 }}>
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('Answer your coach…')}
                     style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 14 }} />
              <button className="btn" disabled={busy || !input.trim()}>{t('Send')}</button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
