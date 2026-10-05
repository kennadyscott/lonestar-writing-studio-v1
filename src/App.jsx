import React, { useEffect, useState, useCallback, useRef } from 'react'
import { api } from './lib/api.js'
import { TopBar, DemoTools } from './components/Shell.jsx'
import { useLang } from './lib/i18n/index.jsx'
import { BridgeProvider } from './lib/bridgeContext.jsx'
import { ShareWallTab } from './student/GrowthPage.jsx'
import StudentHome from './student/StudentHome.jsx'
import WritingStudio from './student/WritingStudio.jsx'
import RevisionStudio from './student/RevisionStudio.jsx'
import ArcadePage from './student/ArcadePage.jsx'
import LunaPage from './student/LunaPage.jsx'
import LessonPage from './student/LessonPage.jsx'
import QuickWritePage from './student/QuickWritePage.jsx'
import WritingBankPage from './student/WritingBankPage.jsx'
import ProofRoom from './student/ProofRoom.jsx'
import { useBand, BandContext, lookBand } from './lib/gradeBand.js'
import FeedbackReview from './student/FeedbackReview.jsx'
import { HSLayout, HSHome, HSCourse, useHsTheme, useHsPalette } from './student/HighSchool.jsx'
import PublisherConsole from './student/PublisherConsole.jsx'
import { clearQuickWriteDrafts } from './student/QuickWritePage.jsx'
import CoinBurst, { useCoinWatch } from './components/CoinBurst.jsx'

const ME_STUDENT = 'stu_kscott'

export default function App() {
  const [state, setState] = useState(null)
  const [health, setHealth] = useState({ hasKey: false })
  const [view, setView] = useState('home')
  const [lesson, setLesson] = useState(null)
  // which Luna module is open: any order (her note, 2026-10-02); kept so Back from a lesson returns to it
  const [lunaModule, setLunaModule] = useState(null)
  // a Proof Room path opened straight from the Practice tab (null = the whole room)
  const [proofTopic, setProofTopic] = useState(null)
  const [proofWs, setProofWs] = useState(null) // a clearing to start straight away
  const [openSub, setOpenSub] = useState(null) // submission id for the studio
  const [reviewSub, setReviewSub] = useState(null) // completed submission being reviewed
  const [publisher, setPublisher] = useState(false)

  const { setLang } = useLang()
  const [band, setBand] = useBand()
  const [hsTheme, setHsTheme] = useHsTheme()
  const [hsPalette, setHsPalette] = useHsPalette()
  // A slower state fetch must not paint an older streak over one that just landed.
  const refreshGen = useRef(0)
  const refresh = useCallback(async () => {
    const gen = ++refreshGen.current
    const next = await api.state()
    if (gen !== refreshGen.current) return null
    setState(next)
    return next
  }, [])
  useEffect(() => { refresh(); api.health().then(setHealth) }, [refresh])
  // coins just paid: refresh so the celebration can see the new coin events
  useEffect(() => {
    const on = () => refresh()
    window.addEventListener('lscr:coins', on)
    return () => window.removeEventListener('lscr:coins', on)
  }, [refresh])
  const [coinBurst, clearCoinBurst] = useCoinWatch(state, ME_STUDENT)

  // Interface language is a teacher setting that rides on the student record.
  const meLang = state?.students?.find((s) => s.id === ME_STUDENT)?.lang
  useEffect(() => { if (meLang) setLang(meLang) }, [meLang, setLang])

  const saveSettings = useCallback(async (patch) => {
    await api.studentSettings(patch)
    await refresh()
  }, [refresh])

  // Always refresh state before opening a submission — quick/free writes and
  // "Begin" create the submission server-side and it must be in state first.
  const openSubmission = useCallback(async (id) => { setState(await api.state()); setOpenSub(id) }, [])

  if (!state) return <div style={{ padding: 40, fontFamily: 'Manrope, sans-serif' }}>Loading the Writing Studio…</div>

  const me = state.students.find((s) => s.id === ME_STUDENT)
  // 9-12 mockup: the seed school is an elementary; the high-school band shows a high school
  const studio = lookBand(band) === '9-12' // grade 8 and high school share the Writer's Studio look
  const school = band === '9-12' ? state.teacher.school.replace(/Elementary/, 'High School') : band === '8' || band === '6-7' ? state.teacher.school.replace(/Elementary/, 'Middle School') : state.teacher.school
  const who = { name: me.name, sub: school, initials: me.initials }

  const goHome = () => { setView('home'); setOpenSub(null); setReviewSub(null) }

  async function resetDemo() {
    clearQuickWriteDrafts()
    await api.reset()
    goHome()
    await refresh()
  }

  let body
  const sub = openSub ? state.submissions.find((s) => s.id === openSub) : null
  const reviewing = reviewSub ? state.submissions.find((s) => s.id === reviewSub) : null
  // A piece opened from the Writing Bank keeps view === 'bank', so Back returns there.
  const backFromStudio = view === 'bank' ? () => setOpenSub(null) : goHome
  if ((view === 'home' || view === 'bank') && reviewing) {
    // opened from the Writing Bank, Back returns to the bank
    body = <FeedbackReview state={state} sub={reviewing} onBack={view === 'bank' ? () => setReviewSub(null) : goHome} backLabel={view === 'bank' ? '← Back to Writing Bank' : undefined} />
  } else if ((view === 'home' || view === 'bank') && sub) {
    body = sub.isPeerRevision
      ? <RevisionStudio state={state} sub={sub} health={health} onChange={refresh} onBack={backFromStudio} />
      : <WritingStudio state={state} sub={sub} health={health} onChange={refresh} onBack={backFromStudio} />
  } else if (view === 'home') {
    body = <StudentHome state={state} me={me} onOpen={openSubmission} onReview={(id) => setReviewSub(id)} onLuna={(id) => { setLunaModule(id || null); setView('luna') }} onQuickWrite={() => setView('quickwrite')} onBank={() => setView('bank')} onWall={() => setView('wall')} onProofRoom={(topicId, wsId) => { setProofTopic(topicId || null); setProofWs(wsId || null); setView('proof') }} onChange={refresh} />
  } else if (view === 'luna') {
    body = <LunaPage state={state} me={me} initialModuleId={lunaModule} onPickModule={setLunaModule} onBack={goHome} onOpenLesson={(a, moduleLabel) => { setLesson({ a, moduleLabel }); setView('lesson') }} />
  } else if (view === 'lesson' && lesson) {
    body = <LessonPage lesson={lesson.a} moduleLabel={lesson.moduleLabel} supportLevel={me.supportLevel} onBack={() => setView('luna')} />
  } else if (view === 'quickwrite') {
    body = <QuickWritePage state={state} me={me} onBack={goHome} onChange={refresh} />
  } else if (view === 'wall') {
    body = <ShareWallTab state={state} me={me} onChange={refresh} onBack={goHome} />
  } else if (view === 'proof') {
    // Students see only their own grade; the prototype band switch picks it.
    body = <ProofRoom key={(proofTopic || 'room') + (proofWs || '') + band} band={band} initialTopicId={proofTopic} initialWsId={proofWs} onBack={goHome} onChange={refresh} />
  } else if (view === 'bank') {
    body = <WritingBankPage state={state} me={me} onBack={goHome} onOpen={openSubmission} onReview={(id) => setReviewSub(id)} onWall={() => setView('wall')} onChange={refresh} />
  } else {
    body = <ArcadePage me={me} state={state} onBack={goHome} />
  }

  // Pages that had no backdrop of their own get the dashboard's forest at the
  // same 22% (her note, 2026-10-02: "This page is missing a background." - Quick
  // Write). The Writing Bank, Share Wall, Free Write studio, Luna, lessons and
  // the Lit Labyrinth already paint their own.
  const subAsg = sub && state.assignments.find((a) => a.id === sub.assignmentId)
  const bare = (view === 'quickwrite' || view === 'arcade' || ((view === 'home' || view === 'bank') && (reviewing || (sub && subAsg?.genre !== 'free'))))
  if (bare) body = <div className="scene-page"><div aria-hidden className="scene-bg" style={{ backgroundImage: `url(${import.meta.env.BASE_URL || '/'}bg-enchanted.jpg)` }} /><div className="scene-inner">{body}</div></div>

  // Grades 9-12 mockup (2026-10-02): Home and the Writing Course get the
  // Writer's Studio layout; every other view still renders its 2-8 page.
  if (studio && (view === 'home' || view === 'luna') && !sub && !reviewing) {
    const nav = (k) => { setOpenSub(null); setReviewSub(null); if (k === 'proof') { setProofTopic(null); setProofWs(null) } setView(k) }
    body = (
      <HSLayout view={view} onNav={nav} me={me} grade={band === '8' ? 8 : 10} theme={hsTheme} setTheme={setHsTheme} palette={hsPalette} setPalette={setHsPalette}>
        {view === 'home'
          ? <HSHome state={state} me={me} onOpen={openSubmission} onReview={(id) => setReviewSub(id)} onNav={nav} onProofRoom={(topicId, wsId) => { setProofTopic(topicId || null); setProofWs(wsId || null); setView('proof') }} />
          : <HSCourse state={state} grade={band === '8' ? 8 : 10} onOpenLesson={(a, moduleLabel) => { setLesson({ a, moduleLabel }); setView('lesson') }} />}
      </HSLayout>
    )
  }

  return (
    <BandContext.Provider value={band}>
    <BridgeProvider level={me.supportLevel}>
    <div className="app">
      <TopBar
        who={who}
        onArcade={() => { setView('arcade'); setOpenSub(null) }}
        onLogo={goHome}
        band={band}
        onBand={setBand}
      />
      <div className="content">{body}</div>
      <DemoTools onResetDemo={resetDemo} onPublisher={() => setPublisher(true)}
        settings={{ lang: me.lang, supportLevel: me.supportLevel }} onSettings={saveSettings} />
      {publisher && <PublisherConsole onClose={() => setPublisher(false)} />}
      <CoinBurst burst={coinBurst} onDone={clearCoinBurst} />
    </div>
    </BridgeProvider>
    </BandContext.Provider>
  )
}
