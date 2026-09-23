import React from 'react'
import { BRAND } from '../lib/brand.js'
import { useLang, useT, LANGS } from '../lib/i18n/index.jsx'
import { LEVELS } from '../lib/languageBridge.js'

export function TopBar({ who, onArcade, onLogo }) {
  const t = useT()
  return (
    <header className="topbar">
      <button className="logo-chip" onClick={onLogo} title={t('Home')}>
        <img src={BRAND.logo} alt="LoneStar CR" />
      </button>

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

export function DemoTools({ onResetDemo, onPublisher, settings, onSettings }) {
  const { lang, setLang, t } = useLang()
  if (!onResetDemo && !onPublisher && !onSettings) return null

  // Everything here is a DEMO affordance. In the product, interface language and
  // Language Bridge level are set by the teacher from the student's LPAC/TELPAS
  // designation — a student never picks them.
  const pick = (patch) => onSettings && onSettings(patch)

  // The Language Bridge picker is hidden from the demo for now (2026-09-22):
  // the whole product is built and deployed, but the CEO is about to explore
  // the site and this is one more thing to explain. Add ?bridge=1 to the URL
  // to bring the picker back. Nothing else about the feature is touched.
  const showBridge = (() => {
    try { return new URLSearchParams(window.location.search).has('bridge') } catch { return false }
  })()

  return (
    <div className="rolepick" style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 210 }}>
      {onSettings && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: .7, color: 'var(--muted)', textTransform: 'uppercase' }}>
            Demo · teacher settings
          </div>

          <div>
            <div className="demo-sub">Interface language</div>
            <div className="lang-toggle">
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => { setLang(l.code); pick({ lang: l.code }) }}
                  aria-pressed={lang === l.code} title={l.label} className={lang === l.code ? 'on' : ''}>
                  <span aria-hidden>{l.flag}</span> {l.short}
                </button>
              ))}
            </div>
          </div>

          {showBridge && <div>
            <div className="demo-sub">Language Bridge</div>
            <div className="level-pick">
              <button onClick={() => pick({ supportLevel: null })}
                className={!settings?.supportLevel ? 'on' : ''} title="Not an emergent bilingual student">Off</button>
              {LEVELS.map((l) => (
                <button key={l.id} onClick={() => pick({ supportLevel: l.id })}
                  className={settings?.supportLevel === l.id ? 'on' : ''} title={`${l.label} — ${l.blurb}`}
                  style={settings?.supportLevel === l.id ? { background: l.color, color: '#fff' } : undefined}>
                  {l.label[0]}
                </button>
              ))}
            </div>
          </div>}
        </div>
      )}

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
