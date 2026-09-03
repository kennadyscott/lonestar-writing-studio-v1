// How a learning path moves from a source deck to a classroom.
//
// The stage says where a path is in someone's process. It is deliberately not
// the same thing as whether the path is sound: proofing decides that, and it
// blocks publishing on its own. A path can sit in QA with three problems, or in
// Imported with none. Conflating the two would mean a clean path looks finished
// when nobody has read it, which is the failure this ladder exists to prevent.
//
// Only Published is visible to students. Everything else is internal.

export const STAGES = [
  { id: 'imported',  label: 'Imported',  blurb: 'Came in from a source deck. Nobody has been through it yet.', fg: '#5b6b7c', bg: '#eef3f7' },
  { id: 'draft',     label: 'Draft',     blurb: 'Being built or rewritten.',                                    fg: '#0f97c2', bg: '#e7f4fa' },
  { id: 'reviewed',  label: 'Reviewed',  blurb: 'Somebody has read it end to end.',                             fg: '#7b4bc4', bg: '#f3eefb' },
  { id: 'approved',  label: 'Approved',  blurb: 'Signed off on the content and the standards it claims.',       fg: '#b47b13', bg: '#fdf7e8' },
  { id: 'qa',        label: 'QA',        blurb: 'Being played through the way a student would.',                fg: '#c2570f', bg: '#fdf0e6' },
  { id: 'published', label: 'Published', blurb: 'Live. Students are working on it.',                            fg: '#1e7a4a', bg: '#dcf0e4' },
]

export const STAGE_IDS = STAGES.map((s) => s.id)
export const stage = (id) => STAGES.find((s) => s.id === id) || STAGES[0]
export const stageIndex = (id) => Math.max(0, STAGE_IDS.indexOf(id))

/* Old rows said in_review; the ladder now has a named place for that. */
export const normalizeStage = (id) => (id === 'in_review' ? 'reviewed' : STAGE_IDS.includes(id) ? id : 'imported')
