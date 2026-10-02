/** @jsxImportSource react */
// Grades 9-12: the Writer's Studio (her brief, 2026-10-02: "a completely
// different theme throughout the entire platform. No characters, more just
// like plain laptop vibe"). Option A: a clean document workspace with a
// sidebar, a dark mode toggle, rubric/TEKS progress instead of stars.
// MOCKUP: Home and the Writing Course are built; the sidebar's other links
// still open the 2-8 pages. The assignment titles and excerpts below are
// prototype display copy over the demo's grade-6 seed data.
import React, { useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { MODULE_LESSONS } from './LunaPage.jsx'

const TODAY = new Date('2026-07-02T00:00:00')
const daysTo = (d) => (d ? Math.round((new Date(d + 'T00:00:00') - TODAY) / 86400000) : Infinity)
const dueLabel = (d) => {
  const n = daysTo(d)
  if (n === Infinity) return 'No due date'
  if (n < 0) return `${-n} day${n === -1 ? '' : 's'} late`
  if (n === 0) return 'Due today'
  if (n === 1) return 'Due tomorrow'
  return 'Due ' + new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
const words = (txt) => String(txt || '').trim().split(/\s+/).filter(Boolean).length

// prototype display copy: high-school versions of the seed assignments
const HS_COPY = {
  asg_recess: { title: 'Should High Schools Start Later?', kind: 'Argument', excerpt: 'Teenagers are not lazy; they are running on a clock that school ignores. Research from the American Academy of Pediatrics shows that adolescents naturally fall asleep later, which means a 7:15 a.m. first bell asks students to learn during what is, biologically, the middle of their night. Districts that moved start times past 8:30 saw attendance rise and' },
  asg_fridge: { title: 'Technology and the Way We Eat', kind: 'Argument from sources' },
  asg_robot: { title: 'A Turning Point', kind: 'Personal narrative' },
  asg_desert: { title: 'Water in the American West', kind: 'Explanatory essay' },
  asg_1776: { title: 'Voices of 1776', kind: 'Historical narrative' },
  asg_kindness: { title: 'The Rhetoric of Empathy', kind: 'Rhetorical analysis', headline: 'Your claim is precise and your second body paragraph uses evidence well. Push the analysis further: name the rhetorical move, then explain its effect on the audience.' },
}
const hsTitle = (a) => HS_COPY[a.id]?.title || a.title
const hsKind = (a) => HS_COPY[a.id]?.kind || a.type

const UNIT_PURPOSE = {
  m1: 'Answer a question directly and back it up in a single, tight paragraph.',
  m2: 'Build a multi-paragraph response around a defensible claim.',
  m3: 'Sentence craft: variety, precision, and control.',
  m4: 'Move from prompt to plan to finished draft.',
  m5: 'Revise for meaning, not just correctness.',
  m6: 'Edit for the conventions readers notice.',
}
const LESSON_PURPOSE = {
  'Restate the Question': 'Turn the prompt into the first clause of your answer.',
  'Answer the Question': 'State a direct, arguable answer in one sentence.',
  'Cite the Evidence': 'Choose and embed the line that proves your point.',
  'Explain Your Thinking': 'Connect evidence to claim so the reasoning is visible.',
  RACE: 'Put all four moves together in one paragraph.',
  'Identify a Central Idea or Claim': 'Write a claim a reasonable reader could dispute.',
  'Effective Organization': 'Order paragraphs so each one earns the next.',
  'Selecting Evidence': 'Pick evidence for relevance and strength, not length.',
  'Expression of Ideas': 'Choose words and structures that fit the purpose.',
  Conventions: 'Control grammar and punctuation under time pressure.',
  'Write an Extended Constructed Response': 'Draft a full timed response from prompt to conclusion.',
  'Writing Sentences': 'Fix run-ons and fragments; vary sentence openings.',
  'Connecting Ideas': 'Use transitions that show logic, not just order.',
  'Details and Evidence': 'Replace general statements with specific support.',
  'Vocabulary and Language': 'Choose precise, academic language.',
  'Topic, Audience, Purpose': 'Read a prompt for what it is really asking.',
  'Annotating and Gathering Information': 'Annotate sources so evidence is ready to use.',
  'Writing an Outline': 'Plan claim, reasons and evidence before drafting.',
  'From Outline to Draft': 'Turn a plan into paragraphs without losing the thread.',
  'Revise and Edit': 'Separate big revisions from line edits.',
  'Expanding Sentences': 'Add the detail that makes a sentence do more work.',
  'Adding and Removing Sentences': 'Cut what drifts; add what is missing.',
  'Elaborate, Combine, and Rearrange': 'Restructure sentences for flow and emphasis.',
  'Vocabulary and Language Skills': 'Tighten word choice and tone.',
  Capitalization: 'Titles, proper nouns, and quotations.',
  Usage: 'Agreement, tense, and commonly confused words.',
  Punctuation: 'Commas, semicolons, and punctuating quotations.',
  Spelling: 'Catch the errors spellcheck misses.',
}

// grade 8 wears the studio look but is still a middle-school class (6-8 content)
const courseName = (grade) => (grade === 8 ? 'English 8' : 'English I')

/* ---------------- icons (inline, stroke) ---------------- */
const I = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  course: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7M8 11h5',
  practice: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9',
  prompt: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  portfolio: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  review: 'M4 4h16v12H5.2L4 17.2zM8 8h8M8 12h5',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  sun: 'M12 4V2M12 22v-2M4.9 4.9 3.5 3.5M20.5 20.5l-1.4-1.4M4 12H2M22 12h-2M4.9 19.1l-1.4 1.4M20.5 3.5l-1.4 1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
}
function Icon({ d, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

/* ---------------- layout ---------------- */
const NAV = [
  ['home', 'Home', I.home],
  ['luna', 'Writing Course', I.course],
  ['proof', 'Skill Practice', I.practice],
  ['quickwrite', 'Daily Prompt', I.prompt],
  ['bank', 'Portfolio', I.portfolio],
  ['wall', 'The Review', I.review],
]

export function useHsTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('lscr.hsTheme') || 'light' } catch { return 'light' }
  })
  const set = (v) => { setTheme(v); try { localStorage.setItem('lscr.hsTheme', v) } catch { /* fine */ } }
  // on <html> so the top bar (outside the layout) follows it too; the colors
  // only apply while data-band is 9-12
  React.useEffect(() => { document.documentElement.dataset.hsTheme = theme }, [theme])
  return [theme, set]
}

// Her note on the first mockup (2026-10-02): "a little bland ... we are going
// to have to get some level of color in there". Then: "give them LoneStar and
// Sunrise as a setting and Dark Mode/Light Mode" - a student setting in the
// sidebar (Evergreen was dropped). The color rides on the same structure: a
// hero band, a colored sidebar, genre and unit colors.
export const HS_PALETTES = [['brand', 'LoneStar', '#06AADE'], ['sunrise', 'Sunrise', '#ff6b4a']]
export function useHsPalette() {
  const [p, setP] = useState(() => {
    try {
      const v = localStorage.getItem('lscr.hsPalette')
      return HS_PALETTES.some(([k]) => k === v) ? v : 'brand'
    } catch { return 'brand' }
  })
  const set = (v) => { setP(v); try { localStorage.setItem('lscr.hsPalette', v) } catch { /* fine */ } }
  React.useEffect(() => { document.documentElement.dataset.hsPalette = p }, [p])
  return [p, set]
}

export function HSLayout({ view, onNav, me, grade = 10, theme, setTheme, palette, setPalette, children }) {
  return (
    <div className="hs">
      <aside className="hs-side">
        <div className="hs-class">
          <div className="hs-class-name">{courseName(grade)}</div>
          <div className="hs-class-sub">Period 3 · Writer’s Studio</div>
        </div>
        <nav className="hs-nav" aria-label="Main">
          {NAV.map(([k, label, icon]) => (
            <button key={k} className={'hs-nav-item' + (view === k ? ' on' : '')} aria-current={view === k ? 'page' : undefined} onClick={() => onNav(k)}>
              <Icon d={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="hs-side-foot">
          <div className="hs-set" role="group" aria-label="Theme">
            <span className="hs-pal-lbl">Theme</span>
            <div className="hs-seg">
              {HS_PALETTES.map(([k, label, sw]) => (
                <button key={k} className={palette === k ? 'on' : ''} aria-pressed={palette === k} onClick={() => setPalette(k)}>
                  <span className="hs-sw" style={{ background: sw }} />{label}
                </button>
              ))}
            </div>
          </div>
          <div className="hs-set" role="group" aria-label="Appearance">
            <span className="hs-pal-lbl">Appearance</span>
            <div className="hs-seg">
              {[['light', 'Light', I.sun], ['dark', 'Dark', I.moon]].map(([k, label, icon]) => (
                <button key={k} className={theme === k ? 'on' : ''} aria-pressed={theme === k} onClick={() => setTheme(k)}>
                  <Icon d={icon} size={14} />{label}
                </button>
              ))}
            </div>
          </div>
          <div className="hs-me">{me.name} · Grade {grade}</div>
        </div>
      </aside>
      <main className="hs-main">{children}</main>
    </div>
  )
}

/* ---------------- home ---------------- */
export function HSHome({ state, me, onOpen, onReview, onNav }) {
  const [busy, setBusy] = useState(false)
  const rows = useMemo(() => state.assignments
    .filter((a) => !a.isPeerRevision && !['free', 'quick'].includes(a.genre))
    .map((a) => {
      const sub = state.submissions.find((s) => s.assignmentId === a.id && s.studentId === me.id)
      return { a, sub, status: sub?.completedAt ? 'completed' : sub ? 'in_progress' : 'not_started' }
    }), [state, me.id])
  const open = rows.filter((r) => r.status !== 'completed').sort((x, y) => daysTo(x.a.dueDate) - daysTo(y.a.dueDate))
  const current = open.find((r) => r.status === 'in_progress') || open[0]
  const feedback = rows.filter((r) => r.status === 'completed')
  const dueThisWeek = open.filter((r) => daysTo(r.a.dueDate) <= 7).length
  const gs = state.growthSummary || {}
  const lessons = MODULE_LESSONS.m1 || []
  const doneL = lessons.filter((l) => l.status === 'passed').length
  const nextL = lessons.find((l) => l.status === 'in_progress') || lessons.find((l) => l.status === 'todo')

  async function begin(row) {
    if (row.sub?.completedAt) return onReview(row.sub.id)
    if (row.sub) return onOpen(row.sub.id)
    setBusy(true)
    try { const r = await api.start(row.a.id); onOpen(r.submissionId) } finally { setBusy(false) }
  }

  const draft = current?.sub?.drafts?.[current.sub.drafts.length - 1]
  const excerpt = (current && HS_COPY[current.a.id]?.excerpt) || draft?.content || ''
  const wc = words(excerpt)

  return (
    <div className="hs-page">
      <header className="hs-hero">
        <div className="hs-hero-words">
          <div className="hs-date">Thursday, July 2</div>
          <h1 className="hs-h1">Good morning, {me.name.split(' ')[0]}.</h1>
          <p className="hs-lede">Pick up where you left off, or start something new.</p>
        </div>
        <div className="hs-hero-chips">
          <span className="hs-chip c1"><b>{dueThisWeek}</b> due this week</span>
          <span className="hs-chip c2"><b>{feedback.length}</b> feedback to read</span>
          <span className="hs-chip c3"><b>{gs.streakDays ?? 0}</b> day writing streak</span>
        </div>
      </header>

      <div className="hs-grid">
        {current && (
          <section className="hs-card hs-draft" aria-label="Continue writing">
            <div className="hs-eyebrow">Continue writing</div>
            <div className={'hs-doc g-' + current.a.genre}>
              <div className="hs-doc-cover"><span>{hsKind(current.a)}</span><span>{current.a.format}</span></div>
              <div className="hs-doc-title">{hsTitle(current.a)}</div>
              <div className="hs-doc-meta">{hsKind(current.a)} · {current.a.format} · Draft {current.sub?.drafts?.length || 1} · {wc} words · {dueLabel(current.a.dueDate)}</div>
              <p className="hs-doc-body">{excerpt || 'No words yet. Open the draft to start.'}</p>
            </div>
            <div className="hs-actions">
              <button className="hs-btn" disabled={busy} onClick={() => begin(current)}>Open draft <Icon d={I.arrow} size={16} /></button>
              <button className="hs-btn ghost" onClick={() => onNav('luna')}>Review the lesson</button>
            </div>
          </section>
        )}

        <section className="hs-card" aria-label="Feedback">
          <div className="hs-eyebrow">Feedback</div>
          {feedback.length === 0 && <p className="hs-muted">Nothing new. Feedback on submitted work shows up here.</p>}
          {feedback.map((r) => {
            const d = r.sub.drafts[r.sub.drafts.length - 1]
            const head = HS_COPY[r.a.id]?.headline || d?.traits?.headline
            return (
              <div key={r.a.id} className="hs-fb">
                <div className="hs-fb-title">{hsTitle(r.a)}</div>
                <div className="hs-fb-from">{r.a.teacher.display || r.a.teacher.name} · returned</div>
                {head && <blockquote className="hs-fb-quote">{head}</blockquote>}
                <button className="hs-link" onClick={() => onReview(r.sub.id)}>Read feedback <Icon d={I.arrow} size={14} /></button>
              </div>
            )
          })}
          <div className="hs-stat">
            <div>
              <div className="hs-stat-n">{gs.currentAverage ?? '—'}%</div>
              <div className="hs-stat-l">Rubric average</div>
            </div>
            <div>
              <div className="hs-stat-n">{gs.goalPercent ?? '—'}%</div>
              <div className="hs-stat-l">Your goal</div>
            </div>
            <div>
              <div className="hs-stat-n hs-up">+{gs.weeklyDelta ?? 0}</div>
              <div className="hs-stat-l">This month</div>
            </div>
          </div>
        </section>

        <section className="hs-card hs-span" aria-label="Due soon">
          <div className="hs-card-head">
            <div className="hs-eyebrow">Assignments</div>
            <span className="hs-muted">{open.length} open</span>
          </div>
          <table className="hs-table">
            <thead>
              <tr><th>Title</th><th>Type</th><th>Format</th><th>Due</th><th>Status</th><th aria-label="Action" /></tr>
            </thead>
            <tbody>
              {[...open, ...feedback].map((r) => (
                <tr key={r.a.id}>
                  <td className="hs-td-title">{hsTitle(r.a)}</td>
                  <td><span className={'hs-kind g-' + r.a.genre}><i aria-hidden />{hsKind(r.a)}</span></td>
                  <td><span className="hs-tag">{r.a.format}</span></td>
                  <td className={daysTo(r.a.dueDate) <= 2 && r.status !== 'completed' ? 'hs-soon' : ''}>{r.status === 'completed' ? 'Submitted' : dueLabel(r.a.dueDate)}</td>
                  <td><span className={'hs-status ' + r.status}>{r.status === 'completed' ? 'Returned' : r.status === 'in_progress' ? 'In progress' : 'Not started'}</span></td>
                  <td className="hs-td-act"><button className="hs-link" disabled={busy} onClick={() => begin(r)}>{r.status === 'completed' ? 'Feedback' : r.status === 'in_progress' ? 'Continue' : 'Start'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="hs-card" aria-label="Writing Course">
          <div className="hs-eyebrow">Writing Course</div>
          <div className="hs-unit">Unit 1 · Short Constructed Response</div>
          <div className="hs-bar" role="progressbar" aria-valuemin={0} aria-valuemax={lessons.length} aria-valuenow={doneL}><span style={{ width: `${(doneL / Math.max(1, lessons.length)) * 100}%` }} /></div>
          <div className="hs-muted">{doneL} of {lessons.length} lessons complete</div>
          {nextL && (
            <button className="hs-next" onClick={() => onNav('luna')}>
              <span>
                <span className="hs-next-k">Next lesson</span>
                <span className="hs-next-t">{nextL.title}</span>
                <span className="hs-next-p">{LESSON_PURPOSE[nextL.title]}</span>
              </span>
              <Icon d={I.arrow} />
            </button>
          )}
        </section>

        <section className="hs-card" aria-label="Daily prompt">
          <div className="hs-eyebrow">Daily prompt</div>
          <div className="hs-prompt">Is it ever right to break a rule you think is unfair? Explain with one example.</div>
          <div className="hs-muted">10 minutes · counts toward your writing streak ({gs.streakDays ?? 0} days)</div>
          <div className="hs-actions"><button className="hs-btn ghost" onClick={() => onNav('quickwrite')}>Start writing</button></div>
        </section>
      </div>
    </div>
  )
}

/* ---------------- course ---------------- */
export function HSCourse({ state, grade = 10, onOpenLesson }) {
  const modules = state.modules
  const [unit, setUnit] = useState(modules.find((m) => m.status === 'in_progress')?.id || modules[0].id)
  const mi = modules.findIndex((m) => m.id === unit)
  const m = modules[mi]
  const lessons = MODULE_LESSONS[unit] || []
  const done = lessons.filter((l) => l.status === 'passed').length
  const lessonCount = (id) => (MODULE_LESSONS[id] || []).length
  const doneCount = (id) => (MODULE_LESSONS[id] || []).filter((l) => l.status === 'passed').length

  return (
    <div className="hs-page">
      <header className="hs-hero">
        <div className="hs-hero-words">
          <div className="hs-date">{courseName(grade)} · {state.assignments[0]?.teacher?.display || 'Your teacher'}</div>
          <h1 className="hs-h1">Writing Course</h1>
          <p className="hs-lede">Six units, in any order. Each lesson is a short model, practice, and one paragraph of your own.</p>
        </div>
      </header>
      <div className="hs-course">
        <nav className="hs-units" aria-label="Units">
          {modules.map((u, i) => (
            <button key={u.id} className={'hs-unit-row' + (u.id === unit ? ' on' : '')} style={{ '--u': `var(--hs-u${i + 1})` }} aria-pressed={u.id === unit} onClick={() => setUnit(u.id)}>
              <span className="hs-unit-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="hs-unit-words">
                <span className="hs-unit-t">{u.label}</span>
                <span className="hs-unit-s">{doneCount(u.id)} / {lessonCount(u.id)} lessons</span>
              </span>
            </button>
          ))}
        </nav>
        <section className="hs-card hs-lessons" style={{ '--u': `var(--hs-u${mi + 1})` }} aria-label={m.label}>
          <div className="hs-lessons-cover" aria-hidden />
          <div className="hs-eyebrow">Unit {mi + 1}</div>
          <h2 className="hs-h2">{m.label}</h2>
          <p className="hs-muted" style={{ marginTop: 2 }}>{UNIT_PURPOSE[unit]}</p>
          <div className="hs-bar" style={{ margin: '14px 0 6px' }}><span style={{ width: `${(done / Math.max(1, lessons.length)) * 100}%` }} /></div>
          <div className="hs-muted" style={{ marginBottom: 10 }}>{done} of {lessons.length} complete</div>
          <ol className="hs-lesson-list">
            {lessons.map((l) => {
              const st = l.status === 'passed' ? 'completed' : l.status === 'in_progress' ? 'in_progress' : 'not_started'
              return (
                <li key={l.n} className={'hs-lesson ' + st}>
                  <span className="hs-lesson-n">{st === 'completed' ? <Icon d={I.check} size={15} /> : l.n}</span>
                  <span className="hs-lesson-words">
                    <span className="hs-lesson-t">{l.final ? `Unit ${mi + 1} Assessment` : l.title}</span>
                    <span className="hs-lesson-p">{l.final ? '16 questions · shows what you can do on your own' : (LESSON_PURPOSE[l.title] || LESSON_PURPOSE[l.title.replace(/^Editing: /, '')] || '')}</span>
                  </span>
                  <span className="hs-lesson-len">{l.final ? '30 min' : '15 min'}</span>
                  <span className={'hs-status ' + st}>{st === 'completed' ? 'Mastered' : st === 'in_progress' ? 'In progress' : 'Not started'}</span>
                  <button className="hs-btn sm ghost" onClick={() => onOpenLesson(l, `Module ${mi + 1}: ${m.label}`)}>{st === 'completed' ? 'Review' : st === 'in_progress' ? 'Continue' : 'Start'}</button>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </div>
  )
}
