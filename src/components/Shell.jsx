import React from 'react'
import { BRAND } from '../lib/brand.js'
import { useLang, useT, LANGS } from '../lib/i18n/index.jsx'

/* Language switch — first control in the bar, so it is findable before anything
   else on the page has been read. */
export function LangToggle() {
  const { lang, setLang, t } = useLang()
  return (
    <div className="lang-toggle" role="group" aria-label={t('Language')}>
      <span className="lang-label">{t('Language')}</span>
      {LANGS.map((l) => (
        <button key={l.code} onClick={() => setLang(l.code)} aria-pressed={lang === l.code}
          title={l.label} className={lang === l.code ? 'on' : ''}>
          <span aria-hidden>{l.flag}</span> {l.short}
        </button>
      ))}
    </div>
  )
}

export function TopBar({ who, onArcade, onLogo }) {
  const t = useT()
  return (
    <header className="topbar">
      <button className="logo-chip" onClick={onLogo} title={t('Home')}>
        <img src={BRAND.logo} alt="LoneStar CR" />
      </button>

      <LangToggle />

      <div style={{ flex: 1 }} />

      <button className="cc-btn" onClick={onArcade} title={t('Switch to ClassCade')}>
        <img src={BRAND.classcade} alt="ClassCade" />
        <span className="split" />
        <span>
          <small>{t('SWITCH TO')}</small>
          <b>ClassCade</b>
        </span>
      </button>

      <div className="who">
        <div className="av-init">{who.initials}</div>
        <div>
          <div className="nm">{who.name}</div>
          <div className="sub">{who.sub}</div>
        </div>
        <button className="pwr" title={t('Log out (demo)')}>⏻</button>
      </div>
    </header>
  )
}

export function DemoTools({ onResetDemo, onPublisher }) {
  const t = useT()
  if (!onResetDemo && !onPublisher) return null
  return (
    <div className="rolepick" style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {onPublisher && (
        <button onClick={onPublisher} style={{ display: 'block', width: '100%', padding: '6px 8px', borderRadius: 8, background: '#eef6f9', color: '#0f97c2', fontSize: 11.5, fontWeight: 800 }}>
          🛠 {t('Publisher console')}
        </button>
      )}
      {onResetDemo && (
        <button onClick={onResetDemo} style={{ display: 'block', width: '100%', padding: '6px 8px', borderRadius: 8, background: '#eef3f6', color: 'var(--muted)', fontSize: 11.5, fontWeight: 800 }}>
          ↺ {t('Reset demo data')}
        </button>
      )}
    </div>
  )
}

export function CoinChip({ n }) {
  return <span className="coin"><span className="disc" />{n.toLocaleString()}</span>
}
