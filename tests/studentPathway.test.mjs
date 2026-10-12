import test from 'node:test'
import assert from 'node:assert/strict'
import { buildStudentPathway, recordWorksheet, scoreAssessment } from '../src/lib/studentPathway.mjs'
import { pathwayDemoFor } from '../src/lib/studentPathwayDemo.mjs'
import { rawTopics } from '../server/proofRoom.mjs'

const sheet = (id) => ({ id, title: id, activities: [{ kind: 'quiz' }] })
const topic = { id: 'example', core: [sheet('one'), sheet('two')], skillBuilders: { one: sheet('help-one') }, full: sheet('full') }
const content = {
  pre: { items: [{ id: 'before' }] }, post: { items: [{ id: 'after' }] },
  lessons: Object.fromEntries(['one', 'two', 'help-one', 'full'].map((id) => [id, { steps: [{ title: 'Learn' }] }])),
}
const current = (record, data = content) => buildStudentPathway(topic, record, data).find((s) => s.state === 'current' || s.state === 'unavailable')
const afterPre = { pre: { score: 0, complete: true } }

test('the pre-test is first and completes at any score without skipping the lesson', () => {
  const steps = buildStudentPathway(topic, {}, content)
  assert.equal(steps[0].id, 'pre')
  assert.equal(steps[0].state, 'current')
  assert.ok(steps.slice(1).every((s) => s.state === 'locked'))
  assert.equal(current(afterPre).id, 'lesson:one')
  assert.equal(current({ ...afterPre, lessons: { one: true } }).id, 'practice:one')
})

test('missing prerequisite content blocks later practice rather than pretending it is done', () => {
  assert.equal(current({}, null).state, 'unavailable')
  const steps = buildStudentPathway(topic, afterPre, { ...content, lessons: {} })
  assert.equal(steps.find((s) => s.id === 'lesson:one').state, 'unavailable')
  assert.equal(steps.find((s) => s.id === 'practice:one').state, 'locked')
})

test('a zero-point core attempt opens its Skill Builder lesson, then practice, then core retry', () => {
  let record = recordWorksheet({ ...afterPre, lessons: { one: true } }, 'one', 0)
  const steps = buildStudentPathway(topic, record, content)
  assert.equal(steps.find((s) => s.id === 'practice:one').state, 'complete')
  assert.equal(steps.find((s) => s.id === 'practice:one').score, 0)
  assert.equal(current(record).id, 'lesson:help-one')
  record = { ...record, lessons: { ...record.lessons, 'help-one': true } }
  assert.equal(current(record).id, 'practice:help-one')
  record = recordWorksheet(record, 'help-one', 0)
  assert.equal(current(record).id, 'practice:help-one')
  record = recordWorksheet(record, 'help-one', 85)
  assert.equal(current(record).id, 'practice:one:retry')
  record = recordWorksheet(record, 'one', 90)
  assert.equal(current(record).id, 'lesson:two')
  assert.ok(buildStudentPathway(topic, record, content).filter((s) => s.skillBuilder).every((s) => s.state === 'complete'))
})

test('core and Full Topic lesson/practice must all finish before the post-test', () => {
  let record = { ...afterPre, lessons: { one: true, two: true } }
  record = recordWorksheet(record, 'one', 85)
  assert.equal(current(record).id, 'practice:two')
  record = recordWorksheet(record, 'two', 100)
  assert.equal(current(record).id, 'lesson:full')
  record = { ...record, lessons: { ...record.lessons, full: true } }
  assert.equal(current(record).id, 'practice:full')
  record = recordWorksheet(record, 'full', 100)
  assert.equal(current(record).id, 'post')
  assert.equal(buildStudentPathway(topic, record, content).at(-1).state, 'current')
  record = { ...record, post: { score: 60, complete: true } }
  assert.ok(buildStudentPathway(topic, record, content).every((s) => s.state === 'complete'))
})

test('a topic without a Full Topic sheet proceeds from core work to post-test', () => {
  const simple = { ...topic, full: null }
  const record = { ...afterPre, lessons: { one: true, two: true }, worksheets: { one: { passed: true }, two: { passed: true } } }
  const steps = buildStudentPathway(simple, record, content)
  assert.equal(steps.find((s) => s.state === 'current').id, 'post')
  assert.equal(steps.some((s) => s.capstone), false)
})

test('practice scores never fabricate assessment or lesson completion; historical passes survive', () => {
  const record = { worksheets: { one: { best: 100, passed: true, attempts: 1 }, two: { best: 100, passed: true, attempts: 1 }, full: { best: 100, passed: true, attempts: 1 } } }
  const steps = buildStudentPathway(topic, record, content)
  assert.equal(steps.find((s) => s.id === 'pre').state, 'current')
  assert.equal(steps.find((s) => s.id === 'lesson:one').state, 'locked')
  assert.equal(steps.find((s) => s.id === 'post').state, 'locked')
  assert.equal(steps.find((s) => s.id === 'practice:one').state, 'complete')
})

test('recordWorksheet is immutable, counts zero-score attempts, and keeps a historical pass', () => {
  const original = Object.freeze({ pre: Object.freeze({ score: 20, complete: true }), worksheets: Object.freeze({}) })
  const first = recordWorksheet(original, 'one', 0)
  assert.deepEqual(original.worksheets, {})
  assert.deepEqual(first.worksheets.one, { best: 0, passed: false, attempts: 1 })
  const passed = recordWorksheet(first, 'one', 90)
  const later = recordWorksheet(passed, 'one', 10)
  assert.deepEqual(later.worksheets.one, { best: 90, passed: true, attempts: 3 })
  assert.deepEqual(first.worksheets.one, { best: 0, passed: false, attempts: 1 })
  assert.equal(later.pre, original.pre)
  assert.throws(() => recordWorksheet(later, 'one', NaN), TypeError)
})

test('answers score by stable option ids; multi is unordered and order requires the exact sequence', () => {
  const options = ['a', 'b', 'c'].map((id) => ({ id, text: id }))
  assert.equal(scoreAssessment({ kind: 'single', options, correct: ['b'] }, 'b'), true)
  assert.equal(scoreAssessment({ kind: 'inline', options, correct: ['b'] }, ['a']), false)
  assert.equal(scoreAssessment({ kind: 'multi', options, correct: ['a', 'c'] }, ['c', 'a']), true)
  assert.equal(scoreAssessment({ kind: 'multi', options, correct: ['a', 'c'] }, ['a', 'a']), false)
  assert.equal(scoreAssessment({ kind: 'order', options, correct: ['b', 'a', 'c'] }, ['b', 'a', 'c']), true)
  assert.equal(scoreAssessment({ kind: 'order', options, correct: ['b', 'a', 'c'] }, ['a', 'b', 'c']), false)
  assert.equal(scoreAssessment({ kind: 'single', options, correct: ['missing'] }, ['missing']), false)
})

test('the explicit sample covers every Parts of Speech lesson and both forms without leaking to other paths', () => {
  const parts = rawTopics().find((t) => t.id === 'topic_pos')
  const demo = pathwayDemoFor(parts)
  assert.equal(demo.preview, true)
  assert.equal(pathwayDemoFor({ id: 'topic_authors_purpose' }), null)
  for (const ws of [...parts.core, ...Object.values(parts.skillBuilders), parts.full]) {
    assert.ok(demo.lessons[ws.id].steps.length >= 2)
    assert.ok(demo.lessons[ws.id].steps.length <= 3)
  }
  for (const form of [demo.pre, demo.post]) {
    // The pre-test opens with two picture samples (layout demos, October 12, 2026); the skill questions are the rest.
    const skill = form.items.filter((i) => !i.sample)
    assert.equal(skill.length, 5)
    assert.deepEqual(new Set(skill.map((i) => i.kind)), new Set(['single', 'multi', 'inline', 'order']))
    for (const item of form.items) assert.equal(scoreAssessment(item, item.correct), true)
  }
  demo.lessons.ws_verbs.steps[0].title = 'Changed locally'
  assert.notEqual(pathwayDemoFor(parts).lessons.ws_verbs.steps[0].title, 'Changed locally')
})

test('a full sample journey resumes through pre-test, every lesson and practice, Full Topic, and post-test', () => {
  const parts = rawTopics().find((t) => t.id === 'topic_pos')
  const demo = pathwayDemoFor(parts)
  let record = {}
  const next = () => buildStudentPathway(parts, record, demo).find((s) => s.state === 'current')
  const resume = () => { record = JSON.parse(JSON.stringify(record)) }
  assert.equal(next().id, 'pre')
  const preAnswers = Object.fromEntries(demo.pre.items.map((item, i) => [item.id, i === 0 ? ['b'] : item.correct]))
  const preScore = demo.pre.items.filter((item) => scoreAssessment(item, preAnswers[item.id])).length / demo.pre.items.length * 100
  assert.equal(preScore, 600 / 7) // 6 of 7: one wrong; the pre-test holds 2 picture samples and 5 skill questions
  record = { ...record, pre: { score: preScore, complete: true, answers: preAnswers } }
  resume()
  for (const sheet of [...parts.core, parts.full]) {
    assert.equal(next().id, `lesson:${sheet.id}`)
    record = { ...record, lessons: { ...record.lessons, [sheet.id]: true } }
    resume()
    assert.equal(next().id, `practice:${sheet.id}`)
    record = recordWorksheet(record, sheet.id, 90)
    resume()
  }
  assert.equal(next().id, 'post')
  const postAnswers = Object.fromEntries(demo.post.items.map((item) => [item.id, item.correct]))
  const postScore = demo.post.items.filter((item) => scoreAssessment(item, postAnswers[item.id])).length / demo.post.items.length * 100
  record = { ...record, post: { score: postScore, complete: true, answers: postAnswers } }
  resume()
  const completed = buildStudentPathway(parts, record, demo)
  assert.equal(completed.length, 14)
  assert.ok(completed.every((step) => step.state === 'complete'))
  assert.equal(next(), undefined)
  assert.equal(record.pre.score, 600 / 7)
  assert.equal(record.post.score, 100)
})

test('sort questions score when every word is in its own group; the pre-test opens with two picture samples', () => {
  const item = { kind: 'sort', groups: ['A to M', 'N to Z'], options: [{ id: 'a', text: 'ant' }, { id: 'b', text: 'zoo' }], correct: ['a:0', 'b:1'] }
  assert.equal(scoreAssessment(item, ['b:1', 'a:0']), true)
  assert.equal(scoreAssessment(item, ['a:1', 'b:0']), false)
  assert.equal(scoreAssessment(item, ['a:0']), false)
  assert.equal(scoreAssessment(item, ['a:0', 'a:0']), false)
  const demo = pathwayDemoFor({ id: 'topic_pos' })
  const [tall, wide] = demo.pre.items
  assert.deepEqual([tall.id, tall.kind, wide.id, wide.kind], ['pre-sample-opposite', 'single', 'pre-sample-abc', 'sort'])
  assert.match(tall.picture.src, /^scenes\/.*satellite.*\.webp$/)
  assert.match(wide.picture.src, /^scenes\/.*astronaut.*\.webp$/)
  assert.equal(scoreAssessment(tall, ['d']), true)
  assert.equal(scoreAssessment(wide, ['a:0', 'b:0', 'c:1', 'd:1']), true)
})
