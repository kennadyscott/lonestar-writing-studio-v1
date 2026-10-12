// One test question as a student answers it: the rules the student test card plays by, shared word for word with the CMS (copied to
// ck12-CMS-V2 src/components/student-test-card/), so a question approved in the CMS plays the same for a student (Kennady, October 12,
// 2026: "I want the preview box to be the same as what it would look like on the student screen").
//
// An item: { id, kind, prompt, text?, options: [{ id, text }], correct, groups?, left?, right?, picture?: { src, alt, focus?: { x, y } },
//            passage?: { title, paragraphs }, layout?: 'side' | 'stack', pictureAt?: 'question' | 'passage', hint? }
// A passage question's picture sits above the question unless pictureAt is 'passage'. A trimmed picture is centred on focus
// (percentages across and down; default the middle).
// Answers are arrays of strings:
//   single / inline   one option id                multi / hotspot   option ids
//   order             option ids in order          sort              "optionId:groupIndex" for every option
//   match             "leftId:rightId" for every left card

export const STUDENT_KINDS = ['single', 'multi', 'inline', 'hotspot', 'order', 'sort', 'match']

const sameSet = (a, b) => a.length === b.length && new Set(a).size === a.length && b.every((x) => a.includes(x))

/** Whether the student has answered enough to check. */
export function readyToCheck(item, answer) {
  const got = Array.isArray(answer) ? answer : []
  if (!item) return false
  if (item.kind === 'single' || item.kind === 'inline') return got.length === 1
  if (item.kind === 'order' || item.kind === 'sort') return got.length === (item.options || []).length
  if (item.kind === 'match') return got.length === (item.left || []).length
  return got.length > 0
}

/** Right or wrong: the whole question, as one point. */
export function scoreStudentItem(item, answer) {
  const got = Array.isArray(answer) ? answer : answer == null ? [] : [answer]
  const want = Array.isArray(item?.correct) ? item.correct : []
  if (!item || !STUDENT_KINDS.includes(item.kind) || !want.length) return false
  // Every id must be one the question shows: a key naming a missing option is never right.
  const ids = new Set((item.options || []).map((o) => o.id)), lefts = new Set((item.left || []).map((o) => o.id)), rights = new Set((item.right || []).map((o) => o.id))
  const known = (x) => {
    if (item.kind === 'sort') { const [id, g] = String(x).split(':'); return ids.has(id) && Number.isInteger(Number(g)) && Number(g) >= 0 && Number(g) < (item.groups || []).length }
    if (item.kind === 'match') { const [l, r] = String(x).split(':'); return lefts.has(l) && rights.has(r) }
    return ids.has(x)
  }
  if (![...got, ...want].every(known)) return false
  if (item.kind === 'order') return got.length === want.length && got.every((id, i) => id === want[i])
  if (item.kind === 'single' || item.kind === 'inline') return got.length === 1 && want.length === 1 && got[0] === want[0]
  return sameSet(got, want)
}

/** A passage paragraph without the number typed at its start: the screen numbers paragraphs, so "1. Mia woke up" would show the 1
 *  twice (Kennady, October 12, 2026: "There is also double numbering coming through"). Only the paragraph's own number goes. */
export function unnumbered(text, index) {
  return String(text ?? '').replace(/^\s*\(?(\d{1,3})[.)]\s+/, (all, n) => (Number(n) === index + 1 ? '' : all))
}

/** A stable shuffle: the same seed gives the same order (a student's draft keeps its seed; the CMS uses the question id). */
export function seededOrder(list, seed) {
  const h = (t) => { let n = 2166136261; for (const c of String(t)) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0 }
  const out = [...(list || [])].sort((a, b) => h(seed + ':' + (a.id ?? a)) - h(seed + ':' + (b.id ?? b)))
  // Never show an order exactly as written (an ordering question would arrive solved).
  if (out.length > 1 && out.every((x, i) => x === list[i])) out.push(out.shift())
  return out
}
