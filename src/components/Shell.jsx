import React from 'react'
import { BRAND } from '../lib/brand.js'

export function TopBar({ who, onArcade, onLogo }) {
  return (
    <header className="topbar">
      <button className="logo-chip" onClick={onLogo} title="Home">
        <img src={BRAND.logo} alt="LoneStar CR" />
      </button>

      <div style={{ flex: 1 }} />

      <button className="cc-btn" onClick={onArcade} title="Switch to ClassCade">
        <img src={BRAND.classcade} alt="ClassCade" />
        <span className="split" />
        <span>
          <small>SWITCH TO</small>
          <b>ClassCade</b>
        </span>
      </button>

      <div className="who">
        <div className="av-init">{who.initials}</div>
        <div>
          <div className="nm">{who.name}</div>
          <div className="sub">{who.sub}</div>
        </div>
        <button className="pwr" title="Log out (demo)">⏻</button>
      </div>
    </header>
  )
}

export function DemoTools({ onResetDemo }) {
  if (!onResetDemo) return null
  return (
    <div className="rolepick">
      <button onClick={onResetDemo} style={{ display: 'block', width: '100%', padding: '6px 8px', borderRadius: 8, background: '#eef3f6', color: 'var(--muted)', fontSize: 11.5, fontWeight: 800 }}>
        ↺ Reset demo data
      </button>
    </div>
  )
}

export function CoinChip({ n }) {
  return <span className="coin"><span className="disc" />{n.toLocaleString()}</span>
}
