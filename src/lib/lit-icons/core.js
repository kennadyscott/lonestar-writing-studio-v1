import { jsx as rjsx, Fragment } from 'react/jsx-runtime'

/*
 * The platform's emoji, drawn as her enchanted-forest icons (Higgsfield, 2026-10-01:
 * "anywhere in the platform that there is an emoji … swap for an image").
 *
 * Every element the app builds goes through this JSX runtime (vite.config's
 * jsxImportSource), so an emoji anywhere in on-screen text — a JSX literal, a t()
 * string, seed data — renders as its painted icon without touching each call
 * site. Attributes (aria-label, title, placeholder) and form fields keep the plain
 * character. Interface marks (✓ ✗ ▶ ● ▲ ▼) are not in the table and stay as text.
 * An emoji with no icon yet also stays as text.
 */
export const ICONS = {
  '✏': 'pencil', '🌟': 'star', '💡': 'idea', '🎉': 'party',
  '🏆': 'trophy', '✍': 'quill', '🌉': 'bridge', '🔒': 'lock',
  '🔥': 'fire', '💛': 'heart-gold', '🔍': 'search', '🔎': 'search',
  '❤': 'heart', '🎯': 'target', '👍': 'thumbs-up', '🌿': 'fern', '✅': 'check',
  '⭐': 'star',
  // sheets 2–5 (2026-10-01): creatures + nature
  '🦊': 'fox', '🦌': 'deer', '🦔': 'hedgehog', '🐝': 'bee', '🌻': 'sunflower', '🕊': 'dove',
  '🌵': 'cactus', '🌊': 'wave', '🪶': 'feather', '💎': 'gem', '✨': 'sparkles', '⚡': 'lightning',
  '🧱': 'brick', '🪙': 'coin', '🏅': 'medal', '🧭': 'compass',
  // writing + school
  '📄': 'page', '📚': 'books', '📖': 'book-open', '📝': 'memo', '📋': 'clipboard', '🧾': 'receipt',
  '🖊': 'pen', '🏷': 'tag', '🔤': 'letters', '💬': 'speech', '💭': 'thought', '🎤': 'mic',
  '📣': 'megaphone', '🏫': 'school', '📅': 'calendar', '🕐': 'clock',
  // play + tools
  '🤖': 'robot', '🎲': 'die', '🎮': 'gamepad', '🧩': 'puzzle', '🏁': 'flag', '🚀': 'rocket',
  '🎨': 'palette', '🛠': 'tools', '⚙': 'gear', '💾': 'save', '🔗': 'link', '📬': 'mailbox',
  '🖥': 'computer', '🔊': 'speaker', '📊': 'chart-bars', '📈': 'chart-up',
  // people + feelings
  '💪': 'strong', '🤝': 'handshake', '👥': 'group', '👀': 'eyes', '👁': 'eye', '🧑': 'person',
  '🚶': 'walker', '🧠': 'brain', '💜': 'heart-purple', '⚖': 'scales', '⚠': 'warning', '🛣': 'road',
  '🗂': 'bank',
  // path icons that come from the curriculum data
  '🐱': 'cat',
}
// spares from the sheets, ready when an emoji calls for them: lantern, mushroom, crystals

const BASE = (import.meta.env.BASE_URL || '/') + 'icons/'
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const RE = new RegExp('(' + Object.keys(ICONS).sort((a, b) => b.length - a.length).map(escape).join('|') + ')️?', 'gu')
// never put an <img> inside these
const SKIP = new Set(['option', 'optgroup', 'textarea', 'title', 'style', 'script', 'text', 'tspan', 'textPath'])

function icon(ch, key) {
  return rjsx('img', { className: 'lit-ico', src: BASE + ICONS[ch] + '.webp', alt: '', 'aria-hidden': 'true', draggable: false }, key)
}

function splitText(s) {
  RE.lastIndex = 0
  if (!RE.test(s)) return null
  RE.lastIndex = 0
  const out = []
  let at = 0, m, n = 0
  while ((m = RE.exec(s))) {
    if (m.index > at) out.push(s.slice(at, m.index))
    out.push(icon(m[1], 'lit-ico-' + n++))
    at = m.index + m[0].length
  }
  if (at < s.length) out.push(s.slice(at))
  return out
}

export function withIcons(type, props) {
  // only real page elements: a component handed text (Glossed, Speak, read-aloud)
  // may split or speak it, so it must still get the plain string
  if (!props || typeof type !== 'string' || SKIP.has(type)) return props
  const kids = props.children
  if (typeof kids === 'string') {
    const parts = splitText(kids)
    return parts ? { ...props, children: parts } : props
  }
  if (Array.isArray(kids)) {
    let changed = false
    const next = kids.map((k, i) => {
      if (typeof k !== 'string') return k
      const parts = splitText(k)
      if (!parts) return k
      changed = true
      return rjsx(Fragment, { children: parts }, 'lit-run-' + i)
    })
    return changed ? { ...props, children: next } : props
  }
  return props
}
