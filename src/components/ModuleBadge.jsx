import React from 'react'

// Stand-ins for the official Luna module badges (CDN art is bot-protected, so
// we draw the same shapes/colors: crest+quill, medal+pencil, laurel+star,
// oval+bulb, crest+magnifier, gray+editing). Drop the real PNGs into
// public/badges/m1-m6.png to upgrade later.
const BADGES = {
  m1: { shape: 'pentagon', fill: '#e2572b', ring: '#f5a623', glyph: '🪶' },
  m2: { shape: 'circle', fill: '#f0b429', ring: '#d98e00', glyph: '📝' },
  m3: { shape: 'circle', fill: '#3f9d4e', ring: '#f0b429', glyph: '⭐' },
  m4: { shape: 'oval', fill: '#123b6d', ring: '#f0b429', glyph: '💡' },
  m5: { shape: 'pentagon', fill: '#7a3fa8', ring: '#e2572b', glyph: '🔍' },
  m6: { shape: 'pentagon', fill: '#b9c2c9', ring: '#98a4ad', glyph: '✏️' },
}

// Her 3D module badges (Higgsfield, 2026-10-02: "generate cooler badges for each of
// the Luna modules"): public/badges/m1-m6.webp. The drawn shapes below stay as the
// fallback if a picture ever fails to load.
const BASE = import.meta.env.BASE_URL || '/'

export default function ModuleBadge({ id, size = 40, dim = false }) {
  const b = BADGES[id] || BADGES.m1
  const [broken, setBroken] = React.useState(false)
  if (!broken && BADGES[id]) {
    return (
      <img src={`${BASE}badges/${id}.webp`} alt="" aria-hidden="true" width={size} height={size} draggable={false} onError={() => setBroken(true)}
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, display: 'block',
          filter: dim ? 'grayscale(.9) brightness(.8) opacity(.6)' : 'drop-shadow(0 2px 4px rgba(2,30,60,.35))' }} />
    )
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ flexShrink: 0, filter: dim ? 'grayscale(1) opacity(.55)' : 'drop-shadow(0 1px 2px rgba(2,56,77,.25))' }} aria-hidden="true">
      {b.shape === 'pentagon' && <path d="M50 4 L95 37 L78 94 L22 94 L5 37 Z" fill={b.fill} stroke={b.ring} strokeWidth="7" strokeLinejoin="round" />}
      {b.shape === 'circle' && <circle cx="50" cy="50" r="45" fill={b.fill} stroke={b.ring} strokeWidth="7" />}
      {b.shape === 'oval' && <ellipse cx="50" cy="50" rx="38" ry="46" fill={b.fill} stroke={b.ring} strokeWidth="7" />}
      <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontSize="40">{b.glyph}</text>
    </svg>
  )
}
