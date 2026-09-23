import React from 'react'
import { CoinChip } from '../components/Shell.jsx'
import { useT } from '../lib/i18n/index.jsx'
import { useSay, Glossed, Directions } from './Scaffold.jsx'

// Module scope, so these stay English: the render site runs them through
// say()/t(), which is where the hooks are allowed to live.
const LABELS = {
  first_revision: 'Revised after conferring',
  kept_revising: 'Kept revising',
  trait_growth: 'Grew on the rubric',
  held_the_pen: 'Kept the pen (did your own thinking)',
}

const WHY = [
  'Coins reward the behaviors that make writers: drafting, conferring, revising.',
  "You even earn for keeping the pen — doing your own thinking when it'd be easier to ask for the answer.",
  'No coins for your grade. Effort and growth are what count.',
  "Big, meaningful revisions earn more than tiny edits — so it can't be gamed.",
]

export default function ArcadePage({ me, state, onBack }) {
  const t = useT()
  const say = useSay()
  const events = state.coinEvents.filter((e) => e.studentId === me.id).slice().reverse()
  return (
    <div>
      {onBack && <button className="backlink" onClick={onBack}>{t('← Back to Dashboard')}</button>}
      <div className="eyebrow">{t('Powered by ClassCade')}</div>
      <h1 className="page">{t('Your Arcade Coins 🎮')}</h1>
      <p className="page-sub">
        <Directions text="You earn coins for how you write — showing up, conferring, and revising — never for your grade." />
      </p>

      <div className="card" style={{ padding: 26, background: 'linear-gradient(120deg,#3a2f6b,#5b4aa0)', color: '#fff', marginBottom: 20 }}>
        <div style={{ opacity: .85, fontSize: 13, letterSpacing: .5, textTransform: 'uppercase' }}>{t('Coin Balance')}</div>
        <div style={{ fontSize: 44, fontWeight: 800 }}>{me.coins.toLocaleString()}</div>
        <div style={{ opacity: .9, fontSize: 14 }}>{say('Spend them in the ClassCade arcade — you earned every one by growing as a writer.')}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <b>{t('How you earned coins')}</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {events.length === 0 && <span style={{ color: 'var(--muted)' }}><Glossed text={say('Revise a draft to start earning!')} /></span>}
            {events.map((e) => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
                <span style={{ fontSize: 14 }}><Glossed text={LABELS[e.type] ? t(LABELS[e.type]) : e.type} /></span>
                <CoinChip n={e.coins} />
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <b>{t("Why it's built this way")}</b>
          <ul style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, paddingLeft: 18 }}>
            {WHY.map((line) => <li key={line}><Glossed text={say(line)} /></li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}
