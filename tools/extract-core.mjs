// Pull the shared reference data out of the ClearLessons Press database.
//
// ClearK12 Studio does not need building from nothing: standards, breakouts,
// topics, vocabulary and the cost log already exist as tables in press.db. What
// they are not is reachable by anything except ClearLessons, and what they are
// not yet is complete. This lifts them into a portable shape and, just as
// importantly, reports what is thin or placeholder rather than moving it over
// quietly.
//
// Two things are deliberately left behind. Lead4Ward field guides are licensed
// and stay inside ClearLessons; STAAR released items are handled the same way
// until someone decides otherwise. Sharing is a decision per dataset, not a
// property of being in the database.
//
//   node tools/extract-core.mjs [path/to/press.db] > core-import.json

import { execFileSync } from 'node:child_process'

const DB = process.argv[2] || `${process.env.HOME}/.claude-apps/clearlessons-press/data/press.db`
const q = (sql) => JSON.parse(execFileSync('sqlite3', ['-json', DB, sql], { encoding: 'utf8' }) || '[]')

const GRADE = (g) => (g === 0 ? 'K' : String(g))
const blank = (s) => !String(s || '').trim()
// Text a person typed to see whether saving worked, and then never replaced.
const PLACEHOLDER = /^(updated text|todo|tbd|test|xxx+|placeholder)$/i

const standards = q(`select code, subject, grade, category, kind, text, parent_code, source_url from standards`)
  .map((r) => ({
    state: 'TX',
    subject: r.subject,
    grade: GRADE(r.grade),
    code: r.code,
    parent_code: r.parent_code || null,
    category: r.category || null,
    kind: r.kind || null,
    statement: r.text || '',
    source_url: r.source_url || null,
    // Verified means: it has real wording and it says where it came from.
    verified: !blank(r.text) && !PLACEHOLDER.test(String(r.text).trim()) && !blank(r.source_url),
  }))

const topics = q(`select subject, grade, round, name, domain, codes_raw, lesson_count, sort,
                         name_verified, codes_verified, active from topics where active = 1`)
  .map((r) => ({
    state: 'TX', subject: r.subject, grade: GRADE(r.grade), round: r.round ?? null,
    name: r.name, domain: r.domain, codes_raw: r.codes_raw || '',
    lesson_count: r.lesson_count ?? null, sort: r.sort ?? 0,
    verified: !!r.name_verified && !!r.codes_verified,
  }))

const vocab = q(`select v.id, v.term, v.subject, v.grade, v.student_definition, v.example,
                        v.grades_json, v.codes_json, v.needs_review, v.source
                 from vocab_terms v`)
  .map((r) => ({
    term: r.term, subject: r.subject || null, grade: r.grade == null ? null : GRADE(r.grade),
    definition: r.student_definition || '', example: r.example || null,
    grades: safe(r.grades_json), codes: safe(r.codes_json),
    source: r.source || null,
    verified: !r.needs_review && !blank(r.student_definition),
    _id: r.id,
  }))

const gradeDefs = q(`select vocab_id, grade, student_definition, example, status from vocab_grade_defs`)
  .map((r) => ({ vocab_id: r.vocab_id, grade: GRADE(r.grade), definition: r.student_definition || '', example: r.example || null, status: r.status }))

const cost = q(`select step, provider, model, input_tokens, output_tokens,
                       cache_read_tokens, cache_write_tokens, usd, ms, ok, note, created_at from cost_log`)
  .map((r) => ({ product: 'clearlessons', step: r.step, provider: r.provider, model: r.model,
    input_tokens: r.input_tokens, output_tokens: r.output_tokens,
    cache_read_tokens: r.cache_read_tokens, cache_write_tokens: r.cache_write_tokens,
    usd: r.usd, ms: r.ms, ok: !!r.ok, note: r.note || null, created_at: r.created_at }))

function safe(j) { try { return j ? JSON.parse(j) : null } catch { return null } }

const bySubject = {}
for (const s of standards) {
  const k = `${s.subject} G${s.grade}`
  bySubject[k] = (bySubject[k] || 0) + 1
}

const report = {
  source: DB,
  extractedAt: new Date().toISOString(),
  counts: {
    standards: standards.length,
    standardsVerified: standards.filter((s) => s.verified).length,
    topics: topics.length,
    vocab: vocab.length,
    vocabGradeDefs: gradeDefs.length,
    costLog: cost.length,
  },
  standardsBySubjectGrade: bySubject,
  problems: [
    ...standards.filter((s) => PLACEHOLDER.test(String(s.statement).trim()))
      .map((s) => `${s.code} (${s.subject} G${s.grade}) has placeholder wording: "${s.statement}"`),
    ...standards.filter((s) => blank(s.statement)).map((s) => `${s.code} has no wording`),
    ...standards.filter((s) => blank(s.source_url)).map((s) => `${s.code} does not say where it came from`),
  ],
  excluded: {
    field_guides: 'Lead4Ward, licensed — stays inside ClearLessons',
    released_items: 'STAAR items — internal until someone decides otherwise',
  },
}

process.stdout.write(JSON.stringify({ report, standards, topics, vocab, gradeDefs, cost }, null, 2))
