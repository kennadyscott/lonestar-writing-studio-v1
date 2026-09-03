import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedState } from './seed.mjs'
import { conferenceSystemPrompt, traitsSystemPrompt } from './prompts.mjs'
import { fallbackConference, fallbackTraits, isBegging } from './fallback.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, 'data.json')
const ENV_FILE = path.join(__dirname, '..', '.env')

// --- tiny .env loader (no deps) ---
function loadEnv() {
  try {
    const txt = fs.readFileSync(ENV_FILE, 'utf8')
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {}
}
loadEnv()

const API_KEY = process.env.ANTHROPIC_API_KEY || ''
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5'
const PORT = Number(process.env.PORT || 8788)
const HAS_KEY = API_KEY.trim().length > 0
const COIN_CAP = 150

// --- state ---
let state
function load() {
  try { state = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) }
  catch { state = seedState(); save() }
}
function save() { fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2)) }
load()

const QUICK_PROMPTS = [
  'If you could add one new rule to your school, what would it be and why?',
  'Should kids be allowed to have phones at school? Take a side.',
  'Convince a friend to read your favorite book.',
  'What is the best season of the year? Make your case.',
  'Should homework be optional? Argue your opinion.',
  'Is it better to be a leader or a helper? Why?',
]
import { PEER_TASKS, bandFor, todaysTask, evaluateChecklist, answerKey, checklistText } from './peerTasks.mjs'
import { rawTopics } from './proofRoom.mjs'
import { libraryRoute } from '../lib/server/library.mjs'
import { authorized } from '../lib/server/auth.mjs'

const ME = 'stu_kscott'
const REACTIONS = ['like', 'heart', 'celebrate'] // positive only, by design
const TYPING_PASS = 85      // accuracy needed to earn coins
const TYPING_COINS = 10     // doubled in Fluency Practice
const DRILL_PASS = 75       // clean-copy percentage a Proof Room job must reach
const DRILL_COINS = 20      // a job is longer than a typing round, so it pays like one
const DRILL_DAILY_JOBS = 5  // paid jobs per day
const TYPING_DAILY_ROUNDS = 5 // paid rounds per day — generous, because the practice itself is the point
const now = () => new Date().toISOString()

const uid = (p) => p + '_' + Math.random().toString(36).slice(2, 9)
// the rubric rules behind a peer-revision submission (kept server-side)
function bandOf(sub) {
  const task = PEER_TASKS.find((t) => t.id === sub.peerTaskId)
  const asg = state.assignments.find((a) => a.id === sub.assignmentId)
  return task ? task.bands[asg?.gradeBand || 'mid'] : null
}
const findSub = (id) => state.submissions.find((s) => s.id === id)
const findAsg = (id) => state.assignments.find((a) => a.id === id)
const findStu = (id) => state.students.find((s) => s.id === id)
const findDraft = (id) => {
  for (const sub of state.submissions) { const d = sub.drafts.find((x) => x.id === id); if (d) return { sub, draft: d } }
  return null
}
const words = (t) => (t || '').trim().split(/\s+/).filter(Boolean)

// --- Claude call ---
async function callClaude({ system, messages, maxTokens = 500 }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
}

// --- conference ---
async function runConference(sub, draft, message) {
  const asg = findAsg(sub.assignmentId)
  const redirect = isBegging(message || '')
  if (!HAS_KEY) return { ...fallbackConference({ history: draft.conference, message, draft: draft.content }), redirect }
  const system = conferenceSystemPrompt({ gradeLevel: asg.gradeLevel, genre: asg.genre, prompt: asg.prompt })
    + `\n\nCURRENT DRAFT (do NOT rewrite it):\n"""\n${draft.content || '(empty so far)'}\n"""`
  const messages = [{ role: 'user', content: "Here's my draft so far. Can we talk about it?" }]
  for (const m of draft.conference) messages.push({ role: m.role, content: m.text })
  if (message) messages.push({ role: 'user', content: message })
  const text = await callClaude({ system, messages, maxTokens: 350 })
  return { text, source: 'claude', redirect }
}

async function runTraits(sub, draft) {
  const asg = findAsg(sub.assignmentId)
  if (!HAS_KEY) return fallbackTraits({ draft: draft.content })
  const system = traitsSystemPrompt({ gradeLevel: asg.gradeLevel, genre: asg.genre, prompt: asg.prompt })
  const messages = [{ role: 'user', content: `My draft:\n"""\n${draft.content}\n"""` }]
  const raw = await callClaude({ system, messages, maxTokens: 900 })
  try { return { ...JSON.parse(raw.replace(/```json?|```/g, '').trim()), source: 'claude' } }
  catch { return { ...fallbackTraits({ draft: draft.content }), source: 'claude_parse_fallback' } }
}

// --- coin / milestone logic (reward the behavior, not the score) ---
function traitSum(d) { return d?.traits?.traits ? d.traits.traits.reduce((a, t) => a + (t.level || 0), 0) : null }
function meaningfulDiff(prev, cur) {
  const pw = words(prev.content), cw = words(cur.content)
  const added = Math.max(0, cw.length - pw.length)
  const changed = Math.abs(cw.length - pw.length) / Math.max(1, pw.length)
  return added >= 15 || changed >= 0.2 || cur.content.trim() !== prev.content.trim() && cw.length >= pw.length + 8
}
function evaluateMilestones(sub, prev, frozen) {
  const spent = sub.milestones.reduce((a, m) => a + m.coins, 0)
  let budget = COIN_CAP - spent
  const out = []
  const add = (type, label, coins) => {
    if (budget <= 0) return
    const c = Math.min(coins, budget); budget -= c
    out.push({ id: uid('ms'), type, label, coins: c, ts: now() })
  }
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

// --- HTTP ---
function send(res, code, body) {
  res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS', 'access-control-allow-headers': 'content-type' })
  res.end(JSON.stringify(body))
}
function readBody(req) {
  return new Promise((resolve) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => { try { resolve(d ? JSON.parse(d) : {}) } catch { resolve({}) } }) })
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {})
  const url = new URL(req.url, 'http://x')
  const parts = url.pathname.split('/').filter(Boolean) // e.g. ['api','state']
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true, hasKey: HAS_KEY, model: HAS_KEY ? MODEL : null })
    if (req.method === 'GET' && url.pathname === '/api/state') {
      const task = todaysTask()
      const stu = findStu(ME)
      const band = bandFor(stu?.gradeLevel ?? 6)
      const existing = state.submissions.find((x) => x.isPeerRevision && x.peerTaskId === task.id && x.peerDate === new Date().toISOString().slice(0, 10))
      return send(res, 200, { ...state, dailyChallenge: { author: task.author, genre: task.genre, band, done: !!existing?.completedAt, started: !!existing } })
    }

    if (req.method === 'POST' && url.pathname === '/api/reset') { state = seedState(); save(); return send(res, 200, state) }

    // PATCH /api/drafts/:id  { content }
    if (req.method === 'PATCH' && parts[0] === 'api' && parts[1] === 'drafts' && parts[2]) {
      const hit = findDraft(parts[2]); if (!hit) return send(res, 404, { error: 'no draft' })
      const body = await readBody(req); hit.draft.content = body.content ?? hit.draft.content; save()
      return send(res, 200, { ok: true })
    }

    // POST /api/drafts/:id/traits
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'drafts' && parts[2] && parts[3] === 'traits') {
      const hit = findDraft(parts[2]); if (!hit) return send(res, 404, { error: 'no draft' })
      const traits = await runTraits(hit.sub, hit.draft); hit.draft.traits = traits; save()
      return send(res, 200, traits)
    }

    // POST /api/submissions/:id/conference  { message }
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'submissions' && parts[2] && parts[3] === 'conference') {
      const sub = findSub(parts[2]); if (!sub) return send(res, 404, { error: 'no submission' })
      const draft = sub.drafts[sub.drafts.length - 1]
      const body = await readBody(req)
      const reply = await runConference(sub, draft, body.message || '')
      if (body.message) draft.conference.push({ role: 'user', text: body.message, ts: now() })
      draft.conference.push({ role: 'assistant', text: reply.text, ts: now(), source: reply.source, redirect: reply.redirect })
      save()
      return send(res, 200, reply)
    }

    // POST /api/submissions/:id/save-revision  -> freeze current draft, open next, award coins
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'submissions' && parts[2] && parts[3] === 'save-revision') {
      const sub = findSub(parts[2]); if (!sub) return send(res, 404, { error: 'no submission' })
      const frozen = sub.drafts[sub.drafts.length - 1]
      const prev = sub.drafts[sub.drafts.length - 2]
      let newMilestones = []
      if (prev) {
        newMilestones = evaluateMilestones(sub, prev, frozen)
        sub.milestones.push(...newMilestones)
        for (const m of newMilestones) {
          state.coinEvents.push({ id: uid('ce'), studentId: sub.studentId, submissionId: sub.id, type: m.type, coins: m.coins, ts: m.ts })
          const stu = findStu(sub.studentId); if (stu) stu.coins += m.coins
        }
      }
      const next = { id: uid('drf'), n: frozen.n + 1, content: frozen.content, createdAt: now(), conference: [], traits: null }
      sub.drafts.push(next); save()
      return send(res, 200, { newDraft: next, newMilestones, coinsAwarded: newMilestones.reduce((a, m) => a + m.coins, 0) })
    }

    // POST /api/peerrevision -> open today's revision challenge (grade-banded, two-phase)
    if (req.method === 'POST' && url.pathname === '/api/peerrevision') {
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
        state.assignments.push(asg); state.submissions.push(sub); save()
      }
      return send(res, 200, { submissionId: sub.id })
    }

    // POST /api/submissions/:id/evaluate { answers: [bool,...] } -> rubric judgment done, unlock rewrite
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'submissions' && parts[2] && parts[3] === 'evaluate') {
      const sub = findSub(parts[2]); if (!sub) return send(res, 404, { error: 'no submission' })
      const body = await readBody(req)
      sub.evaluation = Array.isArray(body.answers) ? body.answers : []
      const band = bandOf(sub)
      if (band) {
        // score the student's judging against the rubric's own read of the draft
        const key = answerKey(band)
        sub.rubricKey = key
        sub.agreement = { matched: key.filter((k, i) => k === sub.evaluation[i]).length, total: key.length }
      }
      sub.phase = 'rewrite'; save()
      return send(res, 200, { ok: true, phase: sub.phase, key: sub.rubricKey || null, agreement: sub.agreement || null })
    }

    // POST /api/submissions/:id/submit-revision -> finish challenge: feedback + coins
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'submissions' && parts[2] && parts[3] === 'submit-revision') {
      const sub = findSub(parts[2]); if (!sub) return send(res, 404, { error: 'no submission' })
      const original = sub.drafts[0]
      const revision = sub.drafts[sub.drafts.length - 1]
      const traits = await runTraits(sub, revision)
      revision.traits = traits
      // the grade comes from the same rubric the student was handed
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
      sub.completedAt = now(); sub.phase = 'done'; save()
      return send(res, 200, { traits, rubric, agreement: sub.agreement || null, newMilestones, coinsAwarded: newMilestones.reduce((a, m) => a + m.coins, 0) })
    }

    // POST /api/share { submissionId } -> publish a finished piece to the Share Wall
    if (req.method === 'POST' && url.pathname === '/api/share') {
      const body = await readBody(req)
      const sub = findSub(body.submissionId)
      if (!sub) return send(res, 404, { error: 'no submission' })
      if (state.shareWall.some((e) => e.submissionId === sub.id)) return send(res, 200, { already: true })
      const asg = findAsg(sub.assignmentId), stu = findStu(sub.studentId)
      const draft = sub.drafts[sub.drafts.length - 1]
      const entry = { id: uid('sw'), submissionId: sub.id, studentId: stu.id, studentName: stu.name, avatar: stu.avatar,
        title: asg.title, genre: asg.type || asg.genre, excerpt: (draft.content || '').slice(0, 180), sharedOn: now().slice(0, 10), reactions: { like: 0, heart: 0, celebrate: 0 }, myReactions: [] }
      state.shareWall.unshift(entry); save()
      return send(res, 200, entry)
    }

    // POST /api/share/:id/react { type } — positive reactions only, one of each per reader
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'share' && parts[2] && parts[3] === 'react') {
      const body = await readBody(req)
      const type = REACTIONS.includes(body.type) ? body.type : null
      if (!type) return send(res, 400, { error: 'unknown reaction' })
      const e = state.shareWall.find((x) => x.id === parts[2])
      if (!e) return send(res, 404, { error: 'no entry' })
      e.reactions = { like: 0, heart: 0, celebrate: 0, ...(e.reactions || {}) }
      e.myReactions = e.myReactions || []
      const had = e.myReactions.includes(type)
      e.myReactions = had ? e.myReactions.filter((t) => t !== type) : [...e.myReactions, type]
      e.reactions[type] = Math.max(0, e.reactions[type] + (had ? -1 : 1))
      save()
      return send(res, 200, { reactions: e.reactions, myReactions: e.myReactions })
    }

    // POST /api/share/:id/kudos (legacy)
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'share' && parts[2] && parts[3] === 'kudos') {
      const e = state.shareWall.find((x) => x.id === parts[2])
      if (!e) return send(res, 404, { error: 'no entry' })
      e.kudos = (e.kudos || 0) + 1; save()
      return send(res, 200, { kudos: e.kudos })
    }

    // POST /api/shoutout { studentId, text, from } -> teacher pins encouragement
    if (req.method === 'POST' && url.pathname === '/api/shoutout') {
      const body = await readBody(req)
      const stu = findStu(body.studentId)
      if (!stu) return send(res, 404, { error: 'no student' })
      stu.shoutOut = { from: body.from || 'Your teacher', initials: body.initials || 'T', text: (body.text || '').slice(0, 240), date: now().slice(0, 10) }
      save()
      return send(res, 200, stu.shoutOut)
    }

    // POST /api/goal { id, trait, text } -> set the student's focus goal
    if (req.method === 'POST' && url.pathname === '/api/goal') {
      const body = await readBody(req)
      const stu = findStu(ME)
      stu.goal = { id: body.id || uid('g'), trait: body.trait || null, text: (body.text || '').slice(0, 140), setOn: now(),
        source: body.source || null, strength: (body.strength || '').slice(0, 200) || null,
        teachingPoint: (body.teachingPoint || '').slice(0, 200) || null, strategy: (body.strategy || '').slice(0, 200) || null }
      save()
      return send(res, 200, stu.goal)
    }

    // POST /api/goal/achieve -> archive current goal, award coins
    if (req.method === 'POST' && url.pathname === '/api/goal/achieve') {
      const stu = findStu(ME)
      if (!stu.goal) return send(res, 400, { error: 'no goal set' })
      const coins = 30
      stu.goalHistory = [...(stu.goalHistory || []), { ...stu.goal, achievedOn: now() }]
      state.coinEvents.push({ id: uid('ce'), studentId: ME, submissionId: null, type: 'goal_achieved', coins, ts: now() })
      stu.coins += coins
      stu.goal = null
      save()
      return send(res, 200, { coins })
    }

    // POST /api/submissions/start { assignmentId } -> create a submission if none exists
    if (req.method === 'POST' && url.pathname === '/api/submissions/start') {
      const body = await readBody(req)
      const asg = findAsg(body.assignmentId)
      if (!asg) return send(res, 404, { error: 'no assignment' })
      let sub = state.submissions.find((s) => s.assignmentId === asg.id && s.studentId === ME)
      if (!sub) {
        sub = { id: uid('sub'), studentId: ME, assignmentId: asg.id, completedAt: null,
          drafts: [{ id: uid('drf'), n: 1, content: '', createdAt: now(), conference: [], traits: null }], milestones: [] }
        state.submissions.push(sub); save()
      }
      return send(res, 200, { submissionId: sub.id })
    }

    // POST /api/submissions/:id/publish -> finalize a self-started piece
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'submissions' && parts[2] && parts[3] === 'publish') {
      const sub = findSub(parts[2]); if (!sub) return send(res, 404, { error: 'no submission' })
      if (sub.published) return send(res, 200, { coins: 0, already: true })
      sub.published = true
      sub.completedAt = sub.completedAt || now()
      const coins = 15
      const m = { id: uid('ms'), type: 'published_piece', label: 'Published a finished piece', coins, ts: now() }
      sub.milestones.push(m)
      state.coinEvents.push({ id: uid('ce'), studentId: sub.studentId, submissionId: sub.id, type: m.type, coins, ts: m.ts })
      const stu = findStu(sub.studentId); if (stu) stu.coins += coins
      save()
      return send(res, 200, { coins })
    }

    // POST /api/submissions/:id/discard -> delete a self-started piece
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'submissions' && parts[2] && parts[3] === 'discard') {
      const sub = findSub(parts[2]); if (!sub) return send(res, 404, { error: 'no submission' })
      const asg = findAsg(sub.assignmentId)
      if (!asg || !['free', 'quick'].includes(asg.genre)) return send(res, 400, { error: 'only self-started writing can be discarded' })
      state.submissions = state.submissions.filter((x) => x.id !== sub.id)
      state.assignments = state.assignments.filter((x) => x.id !== asg.id)
      state.shareWall = state.shareWall.filter((e) => e.submissionId !== sub.id)
      save()
      return send(res, 200, { ok: true })
    }

    // POST /api/quickwrite { mode, title?, prompt?, content?, complete? }
    if (req.method === 'POST' && url.pathname === '/api/quickwrite') {
      const body = await readBody(req)
      const mode = body.mode === 'free' ? 'free' : 'quick'
      const n = state.assignments.filter((a) => a.genre === mode).length + 1
      const prompt = body.prompt || (mode === 'free'
        ? 'Free write! Write about anything on your mind — a story, an idea, a rant, a memory. Your coach is here whenever you want to talk it through.'
        : QUICK_PROMPTS[Math.floor((state.submissions.length + n) % QUICK_PROMPTS.length)])
      const asg = {
        id: uid('asg'), title: body.title || (mode === 'free' ? `Free Write #${n}` : `Quick Write #${n}`),
        genre: mode, type: mode === 'free' ? 'Free Write' : 'Quick Write', gradeLevel: 6,
        teacher: { name: 'Self-started', initials: '✍️' }, dateAssigned: now().slice(0, 10), dueDate: null,
        scopeStage: 'sentence', prompt,
      }
      const sub = { id: uid('sub'), studentId: ME, assignmentId: asg.id, completedAt: body.complete ? now() : null,
        drafts: [{ id: uid('drf'), n: 1, content: body.content || '', createdAt: now(), conference: [], traits: null }], milestones: [] }
      let coins = 0
      let streakDays = state.growthSummary?.streakDays ?? 0
      let streakExtended = false
      if (body.complete) {
        coins = 10
        const m = { id: uid('ms'), type: 'quick_write', label: 'Finished a timed Quick Write', coins, ts: now() }
        sub.milestones.push(m)
        state.coinEvents.push({ id: uid('ce'), studentId: ME, submissionId: sub.id, type: m.type, coins, ts: m.ts })
        const stu = findStu(ME); if (stu) stu.coins += coins
        // feed the writing streak — at most once per day
        const today = now().slice(0, 10)
        const gsum = state.growthSummary
        if (gsum && gsum.lastStreakDate !== today) {
          gsum.streakDays += 1
          gsum.lastStreakDate = today
          streakExtended = true
        }
        streakDays = gsum?.streakDays ?? streakDays
      }
      state.assignments.push(asg)
      state.submissions.push(sub)
      save()
      return send(res, 200, { submissionId: sub.id, coins, streakDays, streakExtended })
    }

    // POST /api/submissions/start { assignmentId } -> create a submission if none exists
    if (req.method === 'POST' && url.pathname === '/api/submissions/start') {
      const body = await readBody(req)
      const asg = findAsg(body.assignmentId)
      if (!asg) return send(res, 404, { error: 'no assignment' })
      let sub = state.submissions.find((s) => s.assignmentId === asg.id && s.studentId === ME)
      if (!sub) {
        sub = { id: uid('sub'), studentId: ME, assignmentId: asg.id, completedAt: null,
          drafts: [{ id: uid('drf'), n: 1, content: '', createdAt: now(), conference: [], traits: null }], milestones: [] }
        state.submissions.push(sub); save()
      }
      return send(res, 200, { submissionId: sub.id })
    }

    // POST /api/submissions/:id/publish -> finalize a self-started piece
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'submissions' && parts[2] && parts[3] === 'publish') {
      const sub = findSub(parts[2]); if (!sub) return send(res, 404, { error: 'no submission' })
      if (sub.published) return send(res, 200, { coins: 0, already: true })
      sub.published = true
      sub.completedAt = sub.completedAt || now()
      const coins = 15
      const m = { id: uid('ms'), type: 'published_piece', label: 'Published a finished piece', coins, ts: now() }
      sub.milestones.push(m)
      state.coinEvents.push({ id: uid('ce'), studentId: sub.studentId, submissionId: sub.id, type: m.type, coins, ts: m.ts })
      const stu = findStu(sub.studentId); if (stu) stu.coins += coins
      save()
      return send(res, 200, { coins })
    }

    // POST /api/submissions/:id/discard -> delete a self-started piece
    if (req.method === 'POST' && parts[0] === 'api' && parts[1] === 'submissions' && parts[2] && parts[3] === 'discard') {
      const sub = findSub(parts[2]); if (!sub) return send(res, 404, { error: 'no submission' })
      const asg = findAsg(sub.assignmentId)
      if (!asg || !['free', 'quick'].includes(asg.genre)) return send(res, 400, { error: 'only self-started writing can be discarded' })
      state.submissions = state.submissions.filter((x) => x.id !== sub.id)
      state.assignments = state.assignments.filter((x) => x.id !== asg.id)
      state.shareWall = state.shareWall.filter((e) => e.submissionId !== sub.id)
      save()
      return send(res, 200, { ok: true })
    }

    // POST /api/typing/finish { accuracy, wpm, ... } -> coins for a clean round.
    // Accuracy is the only gate; nothing about the round is stored as writing data.
    if (req.method === 'POST' && url.pathname === '/api/typing/finish') {
      const body = await readBody(req)
      const accuracy = Number(body.accuracy) || 0
      if (accuracy < TYPING_PASS) return send(res, 200, { coins: 0, passed: false })
      const today = now().slice(0, 10)
      const paidToday = state.coinEvents.filter((e) => e.type === 'typing_round' && e.ts.slice(0, 10) === today).length
      if (paidToday >= TYPING_DAILY_ROUNDS) return send(res, 200, { coins: 0, passed: true, capped: true })
      const coins = TYPING_COINS * 2 // Fluency Practice pays double
      state.coinEvents.push({ id: uid('ce'), studentId: ME, submissionId: null, type: 'typing_round', coins, ts: now() })
      const stu = findStu(ME); if (stu) stu.coins += coins
      save()
      return send(res, 200, { coins, passed: true, doubled: true, roundsLeft: TYPING_DAILY_ROUNDS - paidToday - 1 })
    }

    // ---- Proof Room content, editable by a publisher ----
    if (req.method === 'GET' && url.pathname === '/api/proof/content') {
      if (!state.proofTopics) { state.proofTopics = rawTopics(); save() }
      return send(res, 200, { topics: state.proofTopics })
    }
    // PUT /api/proof/topic { topic } -> replace one topic wholesale
    if (req.method === 'PUT' && url.pathname === '/api/proof/topic') {
      const body = await readBody(req)
      const t = body.topic
      if (!t || !t.id) return send(res, 400, { error: 'topic required' })
      if (!state.proofTopics) state.proofTopics = rawTopics()
      const i = state.proofTopics.findIndex((x) => x.id === t.id)
      if (i >= 0) state.proofTopics[i] = t
      else state.proofTopics.push(t)
      save()
      return send(res, 200, { ok: true, topics: state.proofTopics })
    }
    // POST /api/proof/revert -> back to the content shipped with the app
    if (req.method === 'POST' && url.pathname === '/api/proof/revert') {
      state.proofTopics = rawTopics(); save()
      return send(res, 200, { ok: true, topics: state.proofTopics })
    }

    // POST /api/drill/finish -> coins for a clean Proof Room job. Same deal as
    // typing: accuracy gates it, nothing about the job is stored as writing data.
    if (req.method === 'POST' && url.pathname === '/api/drill/finish') {
      const body = await readBody(req)
      const accuracy = Number(body.accuracy) || 0
      if (accuracy < DRILL_PASS) return send(res, 200, { coins: 0, passed: false })
      const today = now().slice(0, 10)
      const paidToday = state.coinEvents.filter((e) => e.type === 'proof_job' && e.ts.slice(0, 10) === today).length
      if (paidToday >= DRILL_DAILY_JOBS) return send(res, 200, { coins: 0, passed: true, capped: true })
      const coins = DRILL_COINS
      state.coinEvents.push({ id: uid('ce'), studentId: ME, submissionId: null, type: 'proof_job', coins, ts: now() })
      const stu = findStu(ME); if (stu) stu.coins += coins
      save()
      return send(res, 200, { coins, passed: true, jobsLeft: DRILL_DAILY_JOBS - paidToday - 1 })
    }

    // POST /api/quickwrite { mode: 'quick' | 'free' } -> spin up a fresh writing space
    if (req.method === 'POST' && url.pathname === '/api/quickwrite') {
      const body = await readBody(req)
      const mode = body.mode === 'free' ? 'free' : 'quick'
      const n = state.assignments.filter((a) => a.genre === mode).length + 1
      const prompt = mode === 'free'
        ? 'Free write! Write about anything on your mind — a story, an idea, a rant, a memory. Your coach is here whenever you want to talk it through.'
        : QUICK_PROMPTS[Math.floor((state.submissions.length + n) % QUICK_PROMPTS.length)]
      const asg = {
        id: uid('asg'), title: mode === 'free' ? `Free Write #${n}` : `Quick Write #${n}`,
        genre: mode, type: mode === 'free' ? 'Free Write' : 'Quick Write', gradeLevel: 6,
        teacher: { name: 'Self-started', initials: '✍️' }, dateAssigned: now().slice(0, 10), dueDate: null,
        scopeStage: 'sentence', prompt,
      }
      const sub = { id: uid('sub'), studentId: ME, assignmentId: asg.id, completedAt: null,
        drafts: [{ id: uid('drf'), n: 1, content: '', createdAt: now(), conference: [], traits: null }], milestones: [] }
      state.assignments.push(asg)
      state.submissions.push(sub)
      save()
      return send(res, 200, { submissionId: sub.id })
    }

    // ---- the publisher library: same handlers Vercel runs ----
    if (url.pathname.startsWith('/api/library')) {
      const out = await libraryRoute({
        method: req.method, pathname: url.pathname,
        body: req.method === 'GET' ? {} : await readBody(req),
        query: Object.fromEntries(url.searchParams.entries()),
        authorized: authorized(req.headers),
      })
      return send(res, out.status, out.json)
    }

    // ---- static file serving (the built SPA) for any non-/api GET ----
    if (req.method === 'GET' && !url.pathname.startsWith('/api')) {
      const DIST = path.join(__dirname, '..', 'dist')
      const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' }
      let rel = decodeURIComponent(url.pathname)
      if (rel === '/' || !path.extname(rel)) rel = '/index.html' // SPA fallback
      const file = path.join(DIST, rel)
      if (file.startsWith(DIST) && fs.existsSync(file)) {
        res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' })
        return res.end(fs.readFileSync(file))
      }
    }

    return send(res, 404, { error: 'not found' })
  } catch (e) {
    console.error(e)
    return send(res, 500, { error: String(e.message || e) })
  }
})

server.listen(PORT, () => {
  console.log(`LoneStar Studio API on :${PORT} — Claude ${HAS_KEY ? `LIVE (${MODEL})` : 'FALLBACK (no key; scripted conference)'}`)
})
