// Proofing a learning path.
//
// A publisher can save anything; a publisher should not be able to PUBLISH
// anything. These checks are what stands between an authoring mistake and a
// classroom full of students hitting it at the same time — so they are written
// to catch the faults that are invisible on the page and only show up when a
// kid is halfway through:
//
//   a maze whose gates can be walked around, so the verbs never get corrected
//   a fill-in whose sentence already contains the answer
//   a compose item whose own model answer fails the checks it grades with
//   a "click the error in sentence 3" whose target word is not in sentence 3
//
// Severity is the whole point of the split. An ERROR blocks publish, because a
// student would hit a dead end. A WARN is a judgement call left to the person —
// a missing video, a short passage — and never blocks.

import { checkRule } from '../../server/peerTasks.mjs'
import { stateOf, domainsFor, standardLooksRight } from '../content/taxonomy.mjs'

const E = (where, msg, fix) => ({ level: 'error', where, msg, fix })
const W = (where, msg, fix) => ({ level: 'warn', where, msg, fix })

/* ---------- markup ---------- */

/* Parse [[wrong|right]] and report what is malformed rather than silently
 * dropping it, which is what the student-side parser does. */
export function auditHunt(text) {
  const out = []
  const raw = text || ''
  const opens = (raw.match(/\[\[/g) || []).length
  const closes = (raw.match(/\]\]/g) || []).length
  if (opens !== closes) out.push({ msg: `${opens} "[[" but ${closes} "]]" — one error is unclosed`, fix: 'Every planted error is [[wrong|right]].' })
  const errs = []
  for (const m of raw.matchAll(/\[\[([^\]]*)\]\]/g)) {
    const body = m[1]
    if (!body.includes('|')) { out.push({ msg: `[[${body}]] has no "|"`, fix: 'Write it as [[wrong|right]].' }); continue }
    const [wrong, right] = body.split('|')
    if (!wrong.trim() || !right.trim()) out.push({ msg: `[[${body}]] has an empty side`, fix: 'Both the mistake and the correction are required.' })
    else if (wrong.trim() === right.trim()) out.push({ msg: `[[${body}]] corrects to itself`, fix: 'The right answer has to differ from the planted mistake.' })
    else errs.push({ wrong: wrong.trim(), right: right.trim() })
  }
  return { errors: errs, problems: out }
}

/* ---------- maze ---------- */

/* Every gate has to sit on the only way through. Walk the grid with the gate
 * sealed: if START can still reach FINISH, the student can skip that verb. */
export function auditMaze(grid, gates) {
  const out = []
  const rows = Array.isArray(grid) ? grid : []
  if (!rows.length) return [{ msg: 'The maze has no grid.', fix: 'Add rows of S . # X and gate letters.' }]
  const w = rows[0].length
  if (rows.some((r) => r.length !== w)) out.push({ msg: 'Rows are not all the same length.', fix: 'Pad every row to the same width.' })

  const find = (ch) => { const hits = []; rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === ch) hits.push([y, x]) })); return hits }
  const S = find('S'); const X = find('X')
  if (S.length !== 1) out.push({ msg: `${S.length} START squares.`, fix: 'Exactly one S.' })
  if (X.length !== 1) out.push({ msg: `${X.length} FINISH squares.`, fix: 'Exactly one X.' })

  const letters = [...new Set(rows.join('').match(/[A-J]/g) || [])]
  const named = Object.keys(gates || {})
  for (const g of letters) if (!named.includes(g)) out.push({ msg: `Gate ${g} is on the grid but has no verb.`, fix: `Add ${g} to the gate list, or take it off the grid.` })
  for (const g of named) if (!letters.includes(g)) out.push({ msg: `Gate ${g} has a verb but is not on the grid.`, fix: `Put ${g} on the path, or remove it.` })
  for (const [g, v] of Object.entries(gates || {})) {
    if (!v || !v.wrong || !v.right) out.push({ msg: `Gate ${g} is missing its wrong or right form.`, fix: 'Both are required.' })
    else if (String(v.wrong).toLowerCase() === String(v.right).toLowerCase()) out.push({ msg: `Gate ${g} corrects to itself.`, fix: 'The blocked verb must be wrong.' })
  }
  if (out.length || !S.length || !X.length) return out

  const walk = (sealed) => {
    const seen = new Set([S[0].join()])
    const q = [S[0]]
    while (q.length) {
      const [y, x] = q.shift()
      if (y === X[0][0] && x === X[0][1]) return true
      for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ny = y + dy; const nx = x + dx
        if (ny < 0 || nx < 0 || ny >= rows.length || nx >= w) continue
        const c = rows[ny][nx]
        if (c === '#' || c === sealed) continue
        const k = ny + ',' + nx
        if (seen.has(k)) continue
        seen.add(k); q.push([ny, nx])
      }
    }
    return false
  }

  if (!walk(null)) out.push({ msg: 'There is no route from START to FINISH.', fix: 'Open a path through the walls.' })
  else for (const g of letters) {
    if (walk(g)) out.push({ msg: `Gate ${g} can be walked around.`, fix: `Wall off the detour so every route to FINISH passes ${g}.` })
  }
  return out
}

/* ---------- activities ---------- */

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

function auditActivity(a, at, videoIds) {
  const out = []
  const where = at
  const vid = (id, what) => {
    if (!id) return
    if (videoIds && videoIds.length && !videoIds.includes(id)) out.push(W(where, `${what} points at video "${id}", which is not in the library.`, 'Upload it, or clear the video field.'))
  }
  if (!a || !a.kind) return [E(where, 'Activity has no type.', 'Pick Hunt, Fix, Maze, Compose or Passage.')]
  if (!String(a.brief || '').trim()) out.push(E(where, 'No directions.', 'Every activity tells the student what to do.'))

  if (a.kind === 'hunt') {
    const { errors, problems } = auditHunt(a.text)
    for (const p of problems) out.push(E(where, p.msg, p.fix))
    if (!errors.length && !problems.length) out.push(E(where, 'The paragraph has no planted errors.', 'Mark at least one as [[wrong|right]].'))
    const vs = a.videos || []
    if (vs.length && vs.length !== errors.length) out.push(W(where, `${errors.length} errors but ${vs.length} videos.`, 'One video per planted error, in order.'))
    vs.forEach((v, i) => vid(v, `Error ${i + 1}`))
  }

  else if (a.kind === 'fix') {
    const items = a.items || []
    if (!items.length) out.push(E(where, 'No items.', 'Add at least one sentence.'))
    const mode = a.mode || 'type'
    if (!['type', 'select', 'drag'].includes(mode)) out.push(E(where, `Unknown answer mode "${mode}".`, 'Use type, select or drag.'))
    items.forEach((it, i) => {
      const n = `Item ${i + 1}`
      if (!String(it.given || '').trim()) out.push(E(where, `${n} has no sentence.`))
      else if (!it.given.includes('____')) out.push(E(where, `${n} has no blank.`, 'Mark the gap with ____ (four underscores).'))
      if (!String(it.answer || '').trim()) out.push(E(where, `${n} has no answer.`, 'Every item needs one right answer.'))
      else if (norm(it.given).split(' ').includes(norm(it.answer))) out.push(E(where, `${n} already contains its own answer.`, 'The sentence gives it away — reword it.'))
      if (mode !== 'type') {
        const opts = it.options && it.options.length ? it.options : a.bank || []
        if (!opts.length) out.push(E(where, `${n} has nothing to ${mode === 'drag' ? 'drag' : 'click'}.`, 'Add options, or fill the word bank.'))
        else if (!opts.some((o) => norm(o) === norm(it.answer))) out.push(E(where, `${n}: the answer is not among the choices.`, `Add "${it.answer}" to the options.`))
      }
      vid(it.video, n)
    })
  }

  else if (a.kind === 'maze') {
    for (const p of auditMaze(a.grid, a.gates)) out.push(E(where, p.msg, p.fix))
    vid(a.video, 'The maze')
  }

  else if (a.kind === 'compose') {
    const items = a.items || []
    if (!items.length) out.push(E(where, 'No prompts.', 'Add at least one thing to write.'))
    items.forEach((it, i) => {
      const n = `Prompt ${i + 1}`
      if (!String(it.prompt || it.brief || '').trim()) out.push(E(where, `${n} has no prompt.`))
      const checks = it.checks || []
      if (!checks.length) out.push(E(where, `${n} has no checks.`, 'Without checks there is nothing to score.'))
      checks.forEach((c, j) => {
        if (!String(c.label || '').trim()) out.push(E(where, `${n}, check ${j + 1} has no label.`, 'The label is what the student sees.'))
        if (!c.rule || !c.rule.type) out.push(E(where, `${n}, check ${j + 1} has no rule.`))
      })
      // The strongest check we have: a model answer that fails its own item.
      if (!String(it.model || '').trim()) out.push(W(where, `${n} has no model answer.`, 'A model proves the checks can be passed.'))
      else {
        const failed = checks.filter((c) => c.rule && !checkRule(c.rule, it.model))
        if (failed.length) out.push(E(where, `${n}: the model answer fails its own ${failed.length === 1 ? 'check' : 'checks'} — ${failed.map((f) => `"${f.label}"`).join(', ')}.`, 'Either the model or the rule is wrong. No student can beat a check the model cannot.'))
      }
    })
  }

  else if (a.kind === 'passage') {
    const sents = a.sentences || []
    const qs = a.questions || []
    if (!sents.length) out.push(E(where, 'The passage has no sentences.'))
    if (!qs.length) out.push(E(where, 'The passage has no questions.'))
    qs.forEach((q, i) => {
      const n = `Question ${i + 1}`
      if (!String(q.ask || '').trim()) out.push(E(where, `${n} has no wording.`))
      const refs = String(q.sentence == null ? '' : q.sentence).match(/\d+/g) || []
      for (const r of refs) {
        const idx = Number(r)
        if (idx < 1 || idx > sents.length) out.push(E(where, `${n} refers to sentence ${idx}, but the passage has ${sents.length}.`, 'Renumber the question or add the sentence.'))
      }
      if (q.kind === 'pick') {
        if (!String(q.target || '').trim()) out.push(E(where, `${n} has no word to click.`))
        else {
          const idx = Number(refs[0] || 0)
          const s = sents[idx - 1] || ''
          if (s && !norm(s).split(' ').includes(norm(q.target))) out.push(E(where, `${n}: "${q.target}" is not in sentence ${idx}.`, 'The student clicks inside the passage — the word has to be there.'))
        }
        if (!String(q.answer || '').trim()) out.push(E(where, `${n} has no correction.`))
      } else if (q.kind === 'blank') {
        if (!String(q.answer || '').trim()) out.push(E(where, `${n} has no answer.`))
        else if (q.options && q.options.length && !q.options.some((o) => norm(o) === norm(q.answer))) out.push(E(where, `${n}: the answer is not one of the choices.`, `Add "${q.answer}" to the options.`))
      } else if (q.kind === 'write') {
        const checks = q.checks || []
        if (!checks.length) out.push(E(where, `${n} has no checks.`, 'Without checks there is nothing to score.'))
        if (!String(q.model || '').trim()) out.push(W(where, `${n} has no model answer.`))
        else {
          const failed = checks.filter((c) => c.rule && !checkRule(c.rule, q.model))
          if (failed.length) out.push(E(where, `${n}: the model answer fails ${failed.map((f) => `"${f.label}"`).join(', ')}.`, 'The model has to pass the checks it grades with.'))
        }
      } else out.push(E(where, `${n} has an unknown type "${q.kind}".`, 'Use pick, blank or write.'))
    })
  }

  else out.push(E(where, `Unknown activity type "${a.kind}".`))
  return out
}

/* ---------- worksheets and paths ---------- */

export function pointsOf(ws) {
  return (ws.activities || []).reduce((n, a) =>
    n + (a.kind === 'hunt' ? auditHunt(a.text).errors.length
      : a.kind === 'maze' ? Object.keys(a.gates || {}).length
      : a.kind === 'passage' ? (a.questions || []).length
      : (a.items || []).length), 0)
}

function auditWorksheet(ws, label, videoIds, state) {
  const out = []
  if (!ws) return [E(label, 'Missing.', 'This slot is part of the path.')]
  if (!String(ws.title || '').trim()) out.push(E(label, 'No title.'))

  // Every worksheet carries the standard it teaches. This is what makes the
  // library searchable by standard rather than by whoever remembers the title.
  const std = ws.standards || []
  if (!std.length) out.push(E(label, 'Not tagged with a standard.', 'Every worksheet names the standard it teaches.'))
  else for (const code of std) {
    if (!standardLooksRight(code, state)) out.push(W(label, `"${code}" does not look like a ${state || 'state'} standard code.`, 'Texas codes look like 5.11D(ii).'))
  }
  const acts = ws.activities || []
  if (!acts.length) out.push(E(label, 'No activities.', 'A worksheet is one or more activities scored together.'))
  acts.forEach((a, i) => { for (const p of auditActivity(a, `${label} · activity ${i + 1}`, videoIds)) out.push(p) })
  const pts = pointsOf(ws)
  if (acts.length && !pts) out.push(E(label, 'Worth zero points.', 'Nothing here can be scored.'))
  return out
}

/* Proof a whole learning path. Returns every problem found, plus the counts
 * a publisher decides on. */
export function proofPath(topic, opts = {}) {
  const videoIds = opts.videoIds || []
  const out = []
  if (!topic) return { problems: [E('Path', 'Empty.')], errors: 1, warnings: 0, points: 0, ok: false }

  if (!String(topic.title || '').trim()) out.push(E('Path', 'No title.'))
  const st = stateOf(topic.state)
  if (!topic.state) out.push(E('Path', 'No state.', 'The state decides which program this path is built for.'))
  else if (!st) out.push(E('Path', `"${topic.state}" is not a state the library knows.`))
  if (!topic.grade) out.push(E('Path', 'No grade level.', 'The library is browsed by state, grade and domain.'))
  if (!topic.domain) out.push(E('Path', 'No domain.', 'Pick the strand this path sits in.'))
  else if (st && domainsFor(topic.state).length && !domainsFor(topic.state).includes(topic.domain)) {
    out.push(E('Path', `"${topic.domain}" is not one of the ${st.name} domains.`, domainsFor(topic.state).join(' · ')))
  }
  const listed = Array.isArray(topic.standards) ? topic.standards : String(topic.standards || '').split(',').map((x) => x.trim()).filter(Boolean)
  if (!listed.length) out.push(W('Path', 'No standards listed on the path.', 'Tag the path with what it covers so it can be found by standard.'))

  const core = topic.core || []
  if (!core.length) out.push(E('Path', 'No worksheets on the core path.', 'A path needs at least one stop.'))

  const ids = new Set()
  core.forEach((ws, i) => {
    const label = `${i + 1}. ${ws.title || 'Untitled'}`
    if (!ws.id) out.push(E(label, 'No id.'))
    else if (ids.has(ws.id)) out.push(E(label, `Two worksheets share the id "${ws.id}".`, 'Ids have to be unique — progress is saved against them.'))
    else ids.add(ws.id)
    for (const p of auditWorksheet(ws, label, videoIds, topic.state)) out.push(p)
    const sb = (topic.skillBuilders || {})[ws.id]
    if (!sb) out.push(E(label, 'No Skill Builder.', 'A student who scores under 85% has nowhere to go.'))
    else for (const p of auditWorksheet(sb, `${label} → Skill Builder`, videoIds, topic.state)) out.push(p)
  })

  if (!topic.full) out.push(E('Full Topic', 'No capstone.', 'The path has no finish line.'))
  else for (const p of auditWorksheet(topic.full, 'Full Topic', videoIds, topic.state)) out.push(p)

  const points = core.reduce((n, ws) => n + pointsOf(ws), 0) + (topic.full ? pointsOf(topic.full) : 0)
  const errors = out.filter((p) => p.level === 'error').length
  const warnings = out.length - errors
  return { problems: out, errors, warnings, points, stops: core.length + (topic.full ? 1 : 0), ok: errors === 0 }
}
