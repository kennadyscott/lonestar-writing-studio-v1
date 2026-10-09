// The student workflow is separate from worksheet practice scores. Completing
// practice can never manufacture a pre-test, lesson, or post-test result.
export const PATHWAY_PASS_MARK = 85

const hasAttempt = (work) => !!work && (work.attempts > 0 || work.best > 0 || work.passed === true)
const passed = (work) => work?.passed === true
const titleOf = (sheet) => String(sheet?.title || 'Practice').replace(/^(?:SB|Skill Builder|Full Topic)\s*:\s*/i, '')
const hasLesson = (lesson) => Array.isArray(lesson?.steps) && lesson.steps.length > 0
const hasAssessment = (assessment) => Array.isArray(assessment?.items) && assessment.items.length > 0
const hasPractice = (sheet) => Array.isArray(sheet?.activities) && sheet.activities.length > 0

/**
 * Ordered, resumable steps. Only the first unfinished step can be current;
 * missing content makes that step unavailable without unlocking later work.
 * A failed core attempt is followed by its Skill Builder and a core retry.
 */
export function buildStudentPathway(topic, record = {}, content = null) {
  if (!topic) return []
  const works = record.worksheets || {}
  const candidates = []
  const test = (type) => candidates.push({
    id: type,
    type,
    title: type === 'pre' ? 'Pre-test' : 'Post-test',
    assessment: content?.[type] || null,
    score: record[type]?.score,
    done: record[type]?.complete === true,
    available: hasAssessment(content?.[type]),
  })
  const lesson = (sheet, extra = {}) => candidates.push({
    id: `lesson:${sheet.id}`,
    type: 'lesson',
    title: `${titleOf(sheet)} lesson`,
    worksheetId: sheet.id,
    lesson: content?.lessons?.[sheet.id] || null,
    done: record.lessons?.[sheet.id] === true,
    available: hasLesson(content?.lessons?.[sheet.id]),
    ...extra,
  })
  const practice = (sheet, done, extra = {}) => candidates.push({
    id: `practice:${sheet.id}`,
    type: 'practice',
    title: `${titleOf(sheet)} practice`,
    worksheetId: sheet.id,
    sheet,
    score: hasAttempt(works[sheet.id]) ? works[sheet.id].best : undefined,
    done,
    available: hasPractice(sheet),
    ...extra,
  })

  test('pre')
  for (const sheet of topic.core || []) {
    const work = works[sheet.id]
    const builder = topic.skillBuilders?.[sheet.id]
    const builderWork = builder && works[builder.id]
    // Keep a completed support branch in the history. An old core pass does
    // not create a new support requirement, even if a builder was left open.
    const support = !!builder && ((hasAttempt(work) && !passed(work)) || passed(builderWork))
    lesson(sheet)
    practice(sheet, passed(work) || (support && hasAttempt(work)), support ? { attempted: true } : {})
    if (support) {
      lesson(builder, { skillBuilder: true, forId: sheet.id })
      practice(builder, passed(builderWork), { skillBuilder: true, forId: sheet.id })
      practice(sheet, passed(work), {
        id: `practice:${sheet.id}:retry`,
        title: `Try ${titleOf(sheet)} again`,
        retry: true,
      })
    }
  }
  if (topic.full) {
    lesson(topic.full, { capstone: true })
    practice(topic.full, passed(works[topic.full.id]), { capstone: true })
  }
  test('post')

  let blocked = false
  return candidates.map(({ done, available, ...step }) => {
    if (done) return { ...step, state: 'complete' }
    const state = blocked ? 'locked' : available ? 'current' : 'unavailable'
    blocked = true
    return { ...step, state }
  })
}

/** Record an actual practice attempt without mutating the caller's record. */
export function recordWorksheet(record = {}, id, pct) {
  if (typeof id !== 'string' || !id || !Number.isFinite(pct) || pct < 0 || pct > 100) {
    throw new TypeError('A worksheet id and a score from 0 to 100 are required.')
  }
  const previous = record.worksheets?.[id] || {}
  const score = Math.round(pct)
  const work = {
    ...previous,
    best: Math.max(Number.isFinite(previous.best) ? previous.best : 0, score),
    passed: previous.passed === true || score >= PATHWAY_PASS_MARK,
    attempts: (Number.isInteger(previous.attempts) && previous.attempts >= 0 ? previous.attempts : hasAttempt(previous) ? 1 : 0) + 1,
  }
  return { ...record, worksheets: { ...record.worksheets, [id]: work } }
}

/** Answer option ids, not display positions, determine correctness. */
export function scoreAssessment(item, answer) {
  if (!item || !['single', 'multi', 'inline', 'order'].includes(item.kind)) return false
  const got = Array.isArray(answer) ? answer : answer == null ? [] : [answer]
  const correct = item.correct
  if (!Array.isArray(correct) || !correct.length || !Array.isArray(item.options)) return false
  const allowed = new Set(item.options.map((option) => option.id))
  if (new Set(got).size !== got.length || new Set(correct).size !== correct.length || got.length !== correct.length) return false
  if (got.some((id) => !allowed.has(id)) || correct.some((id) => !allowed.has(id))) return false
  return item.kind === 'order' ? got.every((id, i) => id === correct[i]) : correct.every((id) => got.includes(id))
}
