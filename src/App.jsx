import React, { useEffect, useState, useCallback } from 'react'
import { api } from './lib/api.js'
import { TopBar, DemoTools } from './components/Shell.jsx'
import { ShareWallTab } from './student/GrowthPage.jsx'
import StudentHome from './student/StudentHome.jsx'
import WritingStudio from './student/WritingStudio.jsx'
import RevisionStudio from './student/RevisionStudio.jsx'
import ArcadePage from './student/ArcadePage.jsx'
import LunaPage from './student/LunaPage.jsx'
import QuickWritePage from './student/QuickWritePage.jsx'
import WritingBankPage from './student/WritingBankPage.jsx'
import FeedbackReview from './student/FeedbackReview.jsx'
import PublisherConsole from './student/PublisherConsole.jsx'

const ME_STUDENT = 'stu_kscott'

export default function App() {
  const [state, setState] = useState(null)
  const [health, setHealth] = useState({ hasKey: false })
  const [view, setView] = useState('home')
  const [openSub, setOpenSub] = useState(null) // submission id for the studio
  const [reviewSub, setReviewSub] = useState(null) // completed submission being reviewed
  const [publisher, setPublisher] = useState(false)

  const refresh = useCallback(async () => setState(await api.state()), [])
  useEffect(() => { refresh(); api.health().then(setHealth) }, [refresh])

  // Always refresh state before opening a submission — quick/free writes and
  // "Begin" create the submission server-side and it must be in state first.
  const openSubmission = useCallback(async (id) => { setState(await api.state()); setOpenSub(id) }, [])

  if (!state) return <div style={{ padding: 40, fontFamily: 'Manrope, sans-serif' }}>Loading the Writing Studio…</div>

  const me = state.students.find((s) => s.id === ME_STUDENT)
  const who = { name: me.name, sub: state.teacher.school, initials: me.initials }

  const goHome = () => { setView('home'); setOpenSub(null); setReviewSub(null) }

  async function resetDemo() {
    await api.reset()
    goHome()
    await refresh()
  }

  let body
  const sub = openSub ? state.submissions.find((s) => s.id === openSub) : null
  const reviewing = reviewSub ? state.submissions.find((s) => s.id === reviewSub) : null
  if (view === 'home' && reviewing) {
    body = <FeedbackReview state={state} sub={reviewing} onBack={goHome} />
  } else if (view === 'home' && sub) {
    body = sub.isPeerRevision
      ? <RevisionStudio state={state} sub={sub} health={health} onChange={refresh} onBack={goHome} />
      : <WritingStudio state={state} sub={sub} health={health} onChange={refresh} onBack={goHome} />
  } else if (view === 'home') {
    body = <StudentHome state={state} me={me} onOpen={openSubmission} onReview={(id) => setReviewSub(id)} onLuna={() => setView('luna')} onQuickWrite={() => setView('quickwrite')} onBank={() => setView('bank')} onWall={() => setView('wall')} onChange={refresh} />
  } else if (view === 'luna') {
    body = <LunaPage state={state} onBack={goHome} onChange={refresh} />
  } else if (view === 'quickwrite') {
    body = <QuickWritePage state={state} onBack={goHome} onChange={refresh} />
  } else if (view === 'wall') {
    body = (
      <div>
        <button className="backlink" onClick={goHome}>← Back to Dashboard</button>
        <ShareWallTab state={state} me={me} onChange={refresh} />
      </div>
    )
  } else if (view === 'bank') {
    body = <WritingBankPage state={state} me={me} onBack={goHome} onOpen={openSubmission} onWall={() => setView('wall')} onChange={refresh} />
  } else {
    body = <ArcadePage me={me} state={state} onBack={goHome} />
  }

  return (
    <div className="app">
      <TopBar
        who={who}
        onArcade={() => { setView('arcade'); setOpenSub(null) }}
        onLogo={goHome}
      />
      <div className="content">{body}</div>
      <DemoTools onResetDemo={resetDemo} onPublisher={() => setPublisher(true)} />
      {publisher && <PublisherConsole onClose={() => setPublisher(false)} />}
    </div>
  )
}
