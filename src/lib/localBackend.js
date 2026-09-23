// Browser-only backend: runs the entire "API" in-memory so the app can be
// hosted as a pure static site (GitHub Pages). Reuses the same seed and the
// scripted (no-key) conference/traits logic as the real Node server.
import { seedState } from '../../server/seed.mjs'
import { fallbackConference, fallbackTraits, isBegging } from '../../server/fallback.mjs'
import { PEER_TASKS, bandFor, todaysTask, evaluateChecklist, answerKey, checklistText } from '../../server/peerTasks.mjs'
import { rawTopics } from '../../server/proofRoom.mjs'

const ME = 'stu_kscott'
const COIN_CAP = 150
const TYPING_DAILY_ROUNDS = 5 // paid typing rounds per day

// Fluency Zone coin rules: coins follow the score. 90-100% pays 20, 70-89%
// pays 10, under 70% does not clear the tile (play it again). Sentence
// Stretch has no right answers, so finishing it counts as a pass at 10.
const FLUENCY_BONUS = 50
const FLUENCY_PASS = 70
function fluencyScorePct(game, body) {
  if (game === 'typing') return Math.max(0, Math.min(100, Number(body.accuracy) || 0))
  if (game === 'stretch') return 75
  const total = Number(body.total) || 0
  if (!total) return 0
  return Math.round((Math.max(0, Math.min(Number(body.score) || 0, total)) / total) * 100)
}
function fluencyRoundCoins(pct) { return pct >= 90 ? 20 : pct >= FLUENCY_PASS ? 10 : 0 }
function fluencyPlayable(categories, games) {
  const builtin = new Set(games.filter((g) => g.kind === 'builtin').map((g) => g.game))
  return categories.filter((c) => c.games.some((g) => builtin.has(g))).map((c) => c.id)
}

// GitHub Pages has no server. Student work has to live in the browser or a
// finished Quick Write vanishes on the next refresh and never reaches the bank.
const STORE_KEY = 'lscr.studio'

function storage() {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch { return null }
}

function loadState() {
  const fresh = seedState()
  const ls = storage()
  if (!ls) return fresh
  let saved
  try {
    const raw = ls.getItem(STORE_KEY)
    if (!raw) return fresh
    saved = JSON.parse(raw)
  } catch { return fresh }
  if (!saved || !Array.isArray(saved.submissions) || !Array.isArray(saved.assignments) || !Array.isArray(saved.students)) return fresh
  for (const key of Object.keys(fresh)) {
    if (saved[key] === undefined) saved[key] = fresh[key]
  }
  saved.students = saved.students.map((s) => {
    const base = fresh.students.find((x) => x.id === s.id)
    return base ? { ...base, ...s } : s
  })
  for (const s of fresh.students) {
    if (!saved.students.some((x) => x.id === s.id)) saved.students.push(s)
  }
  return saved
}

let state = loadState()
// Matches the loaded state so the first read does not freeze a fresh seed into storage.
let snapshot = JSON.stringify(state)

function persist() {
  const ls = storage()
  if (!ls) return
  let next
  try { next = JSON.stringify(state) } catch { return }
  if (next === snapshot) return
  snapshot = next
  try { ls.setItem(STORE_KEY, next) } catch { /* private mode: this visit still works */ }
}

function forgetSaved() {
  snapshot = JSON.stringify(state)
  try { storage()?.removeItem(STORE_KEY) } catch {}
}

const clone = (x) => JSON.parse(JSON.stringify(x))
const now = () => new Date().toISOString()
const uid = (p) => p + '_' + Math.random().toString(36).slice(2, 9)
const findSub = (id) => state.submissions.find((s) => s.id === id)
const findAsg = (id) => state.assignments.find((a) => a.id === id)
const findStu = (id) => state.students.find((s) => s.id === id)
// the rubric rules behind a peer-revision submission
function bandOf(sub) {
  const task = PEER_TASKS.find((t) => t.id === sub.peerTaskId)
  const asg = state.assignments.find((a) => a.id === sub.assignmentId)
  return task ? task.bands[asg?.gradeBand || 'mid'] : null
}
const findDraft = (id) => {
  for (const sub of state.submissions) { const d = sub.drafts.find((x) => x.id === id); if (d) return { sub, draft: d } }
  return null
}
const words = (t) => (t || '').trim().split(/\s+/).filter(Boolean)

const QUICK_PROMPTS = [
  'If you could add one new rule to your school, what would it be and why?',
  'Should kids be allowed to have phones at school? Take a side.',
  'Convince a friend to read your favorite book.',
  'What is the best season of the year? Make your case.',
  'Should homework be optional? Argue your opinion.',
  'Is it better to be a leader or a helper? Why?',
]

const traitSum = (d) => (d?.traits?.traits ? d.traits.traits.reduce((a, t) => a + (t.level || 0), 0) : null)
function meaningfulDiff(prev, cur) {
  const pw = words(prev.content), cw = words(cur.content)
  const added = Math.max(0, cw.length - pw.length)
  const changed = Math.abs(cw.length - pw.length) / Math.max(1, pw.length)
  return added >= 15 || changed >= 0.2 || (cur.content.trim() !== prev.content.trim() && cw.length >= pw.length + 8)
}
function evaluateMilestones(sub, prev, frozen) {
  const spent = sub.milestones.reduce((a, m) => a + m.coins, 0)
  let budget = COIN_CAP - spent
  const out = []
  const add = (type, label, coins) => { if (budget <= 0) return; const c = Math.min(coins, budget); budget -= c; out.push({ id: uid('ms'), type, label, coins: c, ts: now() }) }
  const already = new Set(sub.milestones.map((m) => m.type))
  const diff = meaningfulDiff(prev, frozen)
  if (diff && !already.has('first_revision')) add('first_revision', 'Revised after conferring', 25)
  else if (diff) add('kept_revising', 'Kept revising', 10)
  const ps = traitSum(prev), fs2 = traitSum(frozen)
  if (ps != null && fs2 != null && fs2 > ps) add('trait_growth', `Traits grew +${fs2 - ps} across the rubric`, 15 * (fs2 - ps))
  const heldPen = frozen.conference.some((m) => m.redirect)
  if (diff && heldPen && !already.has('held_the_pen')) add('held_the_pen', 'Kept the pen when asked to be given the answer', 15)
  return out
}

export const localApi = {
  health: async () => ({ ok: true, hasKey: false, model: null }),
  state: async () => {
    const task = todaysTask()
    const stu = findStu(ME)
    const band = bandFor(stu?.gradeLevel ?? 6)
    const existing = state.submissions.find((x) => x.isPeerRevision && x.peerTaskId === task.id && x.peerDate === new Date().toISOString().slice(0, 10))
    return { ...clone(state), dailyChallenge: { author: task.author, genre: task.genre, band, done: !!existing?.completedAt, started: !!existing } }
  },
  reset: async () => { state = seedState(); forgetSaved(); return clone(state) },
  saveContent: async (draftId, content) => {
    const h = findDraft(draftId)
    if (h) { h.draft.content = content; h.draft.updatedAt = now() }
    return { ok: true }
  },
  renamePiece: async (subId, title) => {
    const sub = findSub(subId); if (!sub) return { error: 'no submission' }
    const asg = findAsg(sub.assignmentId)
    if (!asg || asg.genre !== 'free') return { error: 'only a free write can be renamed' }
    asg.title = String(title || '').trim().replace(/\s+/g, ' ').slice(0, 80)
    const wall = (state.shareWall || []).find((e) => e.submissionId === sub.id)
    if (wall) wall.title = asg.title || 'Untitled'
    return { title: asg.title }
  },
  traits: async (draftId) => { const h = findDraft(draftId); if (!h) return {}; const t = fallbackTraits({ draft: h.draft.content }); h.draft.traits = t; return t },
  confer: async (subId, message) => {
    const sub = findSub(subId); const draft = sub.drafts[sub.drafts.length - 1]
    const redirect = isBegging(message || '')
    const reply = { ...fallbackConference({ history: draft.conference, message, draft: draft.content }), redirect }
    if (message) draft.conference.push({ role: 'user', text: message, ts: now() })
    draft.conference.push({ role: 'assistant', text: reply.text, ts: now(), source: reply.source, redirect: reply.redirect })
    return reply
  },
  saveRevision: async (subId) => {
    const sub = findSub(subId); const frozen = sub.drafts[sub.drafts.length - 1]; const prev = sub.drafts[sub.drafts.length - 2]
    let newMilestones = []
    if (prev) {
      newMilestones = evaluateMilestones(sub, prev, frozen)
      sub.milestones.push(...newMilestones)
      for (const m of newMilestones) { state.coinEvents.push({ id: uid('ce'), studentId: sub.studentId, submissionId: sub.id, type: m.type, coins: m.coins, ts: m.ts }); const stu = findStu(sub.studentId); if (stu) stu.coins += m.coins }
    }
    const next = { id: uid('drf'), n: frozen.n + 1, content: frozen.content, createdAt: now(), conference: [], traits: null }
    sub.drafts.push(next)
    return { newDraft: next, newMilestones, coinsAwarded: newMilestones.reduce((a, m) => a + m.coins, 0) }
  },
  quickWrite: async (mode0, extra = {}) => {
    const mode = mode0 === 'free' ? 'free' : 'quick'
    const n = state.assignments.filter((a) => a.genre === mode).length + 1
    const prompt = extra.prompt || (mode === 'free'
      ? 'Free write! Write about anything on your mind — a story, an idea, a rant, a memory. Your coach is here whenever you want to talk it through.'
      : QUICK_PROMPTS[Math.floor((state.submissions.length + n) % QUICK_PROMPTS.length)])
    const asg = { id: uid('asg'), title: extra.title || (mode === 'free' ? '' : `Quick Write #${n}`), genre: mode, type: mode === 'free' ? 'Free Write' : 'Quick Write', gradeLevel: 6, teacher: { name: 'Self-started', initials: '✍️' }, dateAssigned: now().slice(0, 10), dueDate: null, scopeStage: 'sentence', prompt }
    const sub = { id: uid('sub'), studentId: ME, assignmentId: asg.id, completedAt: extra.complete ? now() : null, drafts: [{ id: uid('drf'), n: 1, content: extra.content || '', createdAt: now(), conference: [], traits: null }], milestones: [] }
    let coins = 0
    let streakDays = state.growthSummary?.streakDays ?? 0
    let streakExtended = false
    if (extra.complete) {
      coins = 10
      const m = { id: uid('ms'), type: 'quick_write', label: 'Finished a timed Quick Write', coins, ts: now() }
      sub.milestones.push(m)
      state.coinEvents.push({ id: uid('ce'), studentId: ME, submissionId: sub.id, type: m.type, coins, ts: m.ts })
      const stu = findStu(ME); if (stu) stu.coins += coins
      const today = now().slice(0, 10)
      const gsum = state.growthSummary
      if (gsum && gsum.lastStreakDate !== today) {
        gsum.streakDays += 1
        gsum.lastStreakDate = today
        streakExtended = true
      }
      streakDays = gsum?.streakDays ?? streakDays
    }
    state.assignments.push(asg); state.submissions.push(sub)
    return { submissionId: sub.id, coins, streakDays, streakExtended }
  },
  undoQuickWrite: async (submissionId, streakExtended) => {
    const sub = findSub(submissionId)
    if (!sub) return { ok: true, missing: true }
    const asg = findAsg(sub.assignmentId)
    if (!asg || asg.genre !== 'quick') return { error: 'not a quick write' }
    const coins = state.coinEvents.filter((e) => e.submissionId === sub.id).reduce((a, e) => a + (e.coins || 0), 0)
    const stu = findStu(sub.studentId)
    if (stu && coins) stu.coins = Math.max(0, stu.coins - coins)
    state.coinEvents = state.coinEvents.filter((e) => e.submissionId !== sub.id)
    if (streakExtended && state.growthSummary) {
      state.growthSummary.streakDays = Math.max(0, (state.growthSummary.streakDays || 0) - 1)
      state.growthSummary.lastStreakDate = null
    }
    state.submissions = state.submissions.filter((x) => x.id !== sub.id)
    state.assignments = state.assignments.filter((x) => x.id !== asg.id)
    state.shareWall = state.shareWall.filter((e) => e.submissionId !== sub.id)
    return { ok: true }
  },
  start: async (assignmentId) => {
    const asg = findAsg(assignmentId); if (!asg) return { error: 'no assignment' }
    let sub = state.submissions.find((s) => s.assignmentId === asg.id && s.studentId === ME)
    if (!sub) { sub = { id: uid('sub'), studentId: ME, assignmentId: asg.id, completedAt: null, drafts: [{ id: uid('drf'), n: 1, content: '', createdAt: now(), conference: [], traits: null }], milestones: [] }; state.submissions.push(sub) }
    return { submissionId: sub.id }
  },
  setGoal: async (payload) => {
    const stu = findStu(ME)
    stu.goal = { id: payload.id || uid('g'), trait: payload.trait || null, text: (payload.text || '').slice(0, 140), setOn: now(),
      source: payload.source || null, strength: (payload.strength || '').slice(0, 200) || null,
      teachingPoint: (payload.teachingPoint || '').slice(0, 200) || null, strategy: (payload.strategy || '').slice(0, 200) || null }
    return stu.goal
  },
  achieveGoal: async () => {
    const stu = findStu(ME); if (!stu.goal) return { coins: 0 }
    const coins = 30
    stu.goalHistory = [...(stu.goalHistory || []), { ...stu.goal, achievedOn: now() }]
    state.coinEvents.push({ id: uid('ce'), studentId: ME, submissionId: null, type: 'goal_achieved', coins, ts: now() })
    stu.coins += coins; stu.goal = null
    return { coins }
  },
  peerRevision: async () => {
    const task = todaysTask()
    const today = new Date().toISOString().slice(0, 10)
    let sub = state.submissions.find((x) => x.isPeerRevision && x.peerTaskId === task.id && x.peerDate === today)
    if (!sub) {
      const stu = findStu(ME)
      const band = bandFor(stu?.gradeLevel ?? 6)
      const t = task.bands[band]
      const asg = { id: uid('asg'), title: `Daily Revision Challenge: help ${task.author}`, genre: task.genre, type: 'Revision Challenge',
        format: null, isPeerRevision: true, gradeLevel: stu?.gradeLevel ?? 6, gradeBand: band, teacher: { name: task.author, initials: '🤖' },
        dateAssigned: today, dueDate: null, scopeStage: 'revision', prompt: t.prompt, originalText: t.weakText, checklist: checklistText(t) }
      sub = { id: uid('sub'), studentId: ME, assignmentId: asg.id, completedAt: null, isPeerRevision: true,
        peerTaskId: task.id, peerDate: today, phase: 'evaluate', evaluation: null,
        drafts: [
          { id: uid('drf'), n: 1, content: t.weakText, createdAt: now(), conference: [], traits: null, isOriginal: true },
          { id: uid('drf'), n: 2, content: t.weakText, createdAt: now(), conference: [], traits: null },
        ], milestones: [] }
      state.assignments.push(asg); state.submissions.push(sub)
    }
    return { submissionId: sub.id }
  },
  evaluate: async (subId, answers) => {
    const sub = findSub(subId); if (!sub) return { error: 'no submission' }
    sub.evaluation = answers
    const band = bandOf(sub)
    if (band) {
      const key = answerKey(band)
      sub.rubricKey = key
      sub.agreement = { matched: key.filter((k, i) => k === answers[i]).length, total: key.length }
    }
    sub.phase = 'rewrite'
    return { ok: true, phase: 'rewrite', key: sub.rubricKey || null, agreement: sub.agreement || null }
  },
  submitRevision: async (subId) => {
    const sub = findSub(subId); if (!sub) return { error: 'no submission' }
    const original = sub.drafts[0]
    const revision = sub.drafts[sub.drafts.length - 1]
    const traits = fallbackTraits({ draft: revision.content })
    revision.traits = traits
    const band = bandOf(sub)
    const before = band ? evaluateChecklist(band.checklist, original.content) : []
    const after = band ? evaluateChecklist(band.checklist, revision.content, original.content) : []
    const rubric = {
      items: after.map((r, i) => ({ text: r.text, met: r.met, wasMet: !!before[i]?.met })),
      met: after.filter((r) => r.met).length,
      total: after.length,
      fixed: after.filter((r, i) => r.met && !before[i]?.met).length,
    }
    sub.rubricResult = rubric
    const newMilestones = [{ id: uid('ms'), type: 'daily_challenge', label: 'Finished the Daily Revision Challenge', coins: 100, ts: now() },
      ...evaluateMilestones(sub, original, revision)]
    sub.milestones.push(...newMilestones)
    for (const m of newMilestones) {
      state.coinEvents.push({ id: uid('ce'), studentId: sub.studentId, submissionId: sub.id, type: m.type, coins: m.coins, ts: m.ts })
      const stu = findStu(sub.studentId); if (stu) stu.coins += m.coins
    }
    sub.completedAt = now(); sub.phase = 'done'
    return { traits, rubric, agreement: sub.agreement || null, newMilestones, coinsAwarded: newMilestones.reduce((a, m) => a + m.coins, 0) }
  },
  publish: async (subId) => {
    const sub = findSub(subId); if (!sub) return { error: 'no submission' }
    if (sub.published) return { coins: 0, already: true }
    sub.published = true
    sub.completedAt = sub.completedAt || now()
    const coins = 15
    const m = { id: uid('ms'), type: 'published_piece', label: 'Published a finished piece', coins, ts: now() }
    sub.milestones.push(m)
    state.coinEvents.push({ id: uid('ce'), studentId: sub.studentId, submissionId: sub.id, type: m.type, coins, ts: m.ts })
    const stu = findStu(sub.studentId); if (stu) stu.coins += coins
    return { coins }
  },
  discard: async (subId) => {
    const sub = findSub(subId); if (!sub) return { error: 'no submission' }
    const asg = findAsg(sub.assignmentId)
    if (!asg || !['free', 'quick'].includes(asg.genre)) return { error: 'only self-started writing can be discarded' }
    state.submissions = state.submissions.filter((x) => x.id !== sub.id)
    state.assignments = state.assignments.filter((x) => x.id !== asg.id)
    state.shareWall = state.shareWall.filter((e) => e.submissionId !== sub.id)
    return { ok: true }
  },
  share: async (submissionId) => {
    const sub = findSub(submissionId); if (!sub) return { error: 'no submission' }
    if (state.shareWall.some((e) => e.submissionId === sub.id)) return { already: true }
    const asg = findAsg(sub.assignmentId), stu = findStu(sub.studentId); const draft = sub.drafts[sub.drafts.length - 1]
    const entry = { id: uid('sw'), submissionId: sub.id, studentId: stu.id, studentName: stu.name, avatar: stu.avatar, title: (asg.title || '').trim() || 'Untitled', genre: asg.type || asg.genre, excerpt: (draft.content || '').slice(0, 180), sharedOn: now().slice(0, 10), reactions: { like: 0, heart: 0, celebrate: 0 }, myReactions: [] }
    state.shareWall.unshift(entry)
    return entry
  },
  proofContent: async () => {
    if (!state.proofTopics) state.proofTopics = rawTopics()
    return { topics: clone(state.proofTopics) }
  },
  saveTopic: async (topic) => {
    if (!state.proofTopics) state.proofTopics = rawTopics()
    const i = state.proofTopics.findIndex((x) => x.id === topic.id)
    if (i >= 0) state.proofTopics[i] = topic; else state.proofTopics.push(topic)
    return { ok: true, topics: clone(state.proofTopics) }
  },
  revertProof: async () => { state.proofTopics = rawTopics(); return { ok: true, topics: clone(state.proofTopics) } },
  drillFinish: async (payload) => {
    const accuracy = Number(payload?.accuracy) || 0
    if (accuracy < 75) return { coins: 0, passed: false }
    const today = now().slice(0, 10)
    const paidToday = state.coinEvents.filter((e) => e.type === 'proof_job' && e.ts.slice(0, 10) === today).length
    if (paidToday >= 5) return { coins: 0, passed: true, capped: true }
    const coins = 20
    state.coinEvents.push({ id: uid('ce'), studentId: ME, submissionId: null, type: 'proof_job', coins, ts: now() })
    const stu = findStu(ME); if (stu) stu.coins += coins
    return { coins, passed: true, jobsLeft: 5 - paidToday - 1 }
  },
  studentSettings: async (body) => {
    const stu = findStu(ME)
    if (!stu) return { error: 'no student' }
    if (body.lang !== undefined) stu.lang = body.lang === 'es' ? 'es' : 'en'
    if (body.supportLevel !== undefined) {
      const ok = ['beginning', 'intermediate', 'advanced']
      stu.supportLevel = ok.includes(body.supportLevel) ? body.supportLevel : null
    }
    return { lang: stu.lang, supportLevel: stu.supportLevel }
  },
  fluencyFinish: async (body) => {
    const grid = state.fluencyGrid || (state.fluencyGrid = { round: 1, cleared: {}, bonusPaid: false })
    const cat = (state.fluencyCategories || []).find((c) => c.id === body.category)
    if (!cat) return { error: 'unknown category' }
    if (grid.cleared[cat.id]) return { coins: grid.cleared[cat.id].coins, bonus: 0, already: true, grid: clone(grid) }
    const pct = fluencyScorePct(body.game, body)
    const coins = fluencyRoundCoins(pct)
    if (pct < FLUENCY_PASS) {
      grid.missed = grid.missed || {}
      grid.missed[cat.id] = { game: body.game, pct, ts: now() }
      return { coins: 0, passed: false, pct, bonus: 0, grid: clone(grid) }
    }
    const stu = findStu(ME)
    if (coins > 0) { state.coinEvents.push({ id: uid('ce'), studentId: ME, submissionId: null, type: 'fluency_round', coins, ts: now() }); if (stu) stu.coins += coins }
    if (grid.missed) delete grid.missed[cat.id]
    grid.cleared[cat.id] = { game: body.game, coins, pct, ts: now() }
    let bonus = 0
    const playable = fluencyPlayable(state.fluencyCategories || [], state.fluencyGames || [])
    if (!grid.bonusPaid && playable.every((id) => grid.cleared[id])) {
      bonus = FLUENCY_BONUS; grid.bonusPaid = true
      state.coinEvents.push({ id: uid('ce'), studentId: ME, submissionId: null, type: 'fluency_grid', coins: bonus, ts: now() }); if (stu) stu.coins += bonus
    }
    return { coins, passed: true, pct, bonus, grid: clone(grid) }
  },
  fluencyReset: async () => {
    const prev = state.fluencyGrid || { round: 0 }
    state.fluencyGrid = { round: (prev.round || 0) + 1, cleared: {}, missed: {}, bonusPaid: false }
    return clone(state.fluencyGrid)
  },
  typingFinish: async (payload) => {
    const accuracy = Number(payload?.accuracy) || 0
    if (accuracy < 85) return { coins: 0, passed: false }
    const today = now().slice(0, 10)
    const paidToday = state.coinEvents.filter((e) => e.type === 'typing_round' && e.ts.slice(0, 10) === today).length
    if (paidToday >= TYPING_DAILY_ROUNDS) return { coins: 0, passed: true, capped: true }
    const coins = 20 // 10, doubled for Fluency Practice
    state.coinEvents.push({ id: uid('ce'), studentId: ME, submissionId: null, type: 'typing_round', coins, ts: now() })
    const stu = findStu(ME); if (stu) stu.coins += coins
    return { coins, passed: true, doubled: true, roundsLeft: TYPING_DAILY_ROUNDS - paidToday - 1 }
  },
  react: async (id, type) => {
    if (!['like', 'heart', 'celebrate'].includes(type)) return { error: 'unknown reaction' }
    const e = state.shareWall.find((x) => x.id === id)
    if (!e) return { error: 'no entry' }
    e.reactions = { like: 0, heart: 0, celebrate: 0, ...(e.reactions || {}) }
    e.myReactions = e.myReactions || []
    const had = e.myReactions.includes(type)
    e.myReactions = had ? e.myReactions.filter((t) => t !== type) : [...e.myReactions, type]
    e.reactions[type] = Math.max(0, e.reactions[type] + (had ? -1 : 1))
    return { reactions: e.reactions, myReactions: e.myReactions }
  },
  shoutOut: async (payload) => { const stu = findStu(payload.studentId); if (!stu) return { error: 'no student' }; stu.shoutOut = { from: payload.from || 'Your teacher', initials: payload.initials || 'T', text: (payload.text || '').slice(0, 240), date: now().slice(0, 10) }; return stu.shoutOut },
}

// Save after any call that changed the studio. Reads compare equal and skip.
for (const key of Object.keys(localApi)) {
  const fn = localApi[key]
  localApi[key] = async (...args) => {
    try { return await fn(...args) }
    finally { persist() }
  }
}
