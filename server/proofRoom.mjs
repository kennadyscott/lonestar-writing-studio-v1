// The Proof Room — the worksheet bank, playable.
//
// Each job is a short piece of writing with errors planted in it, exactly the
// way a printed "circle the four incorrect verbs" exercise works. The student
// hunts the errors in flowing text and types the fix; false alarms cost them.
//
// Authoring format: mark an error inline as [[wrong|right]]. Everything else is
// plain prose, so a job takes a minute to write and reads like real writing.
//
// Job 1 comes verbatim from "Irregular Verbs.pptx" (Edit Drafts: Parts of
// Speech, Grade 5) — same paragraph, same four planted verbs.

export const PROOF_JOBS = [
  {
    id: 'pj_irregular',
    title: 'Irregular Verbs',
    skill: 'Past-tense verbs that break the rules',
    grade: 5,
    strand: 'Edit Drafts · Parts of Speech',
    brief: 'Four verbs in this story are wrong. Tyler would not want to turn this in.',
    text: `After dinner, Tyler looked for his math homework but could not find it anywhere. He [[runned|ran]] upstairs to check his room and searched under his bed. His sister [[catched|caught]] him tossing papers across the floor and offered to help. Tyler suddenly remembered that he had [[writed|written]] part of the assignment in the car after soccer practice. A few minutes later, they [[finded|found]] the homework inside his backpack, and Tyler happily brought it to the kitchen table to finish.`,
    hint: 'Every one of them is a verb that does not just add -ed.',
  },
  {
    id: 'pj_agreement',
    title: 'Subject–Verb Agreement',
    skill: 'Making the verb match who is doing it',
    grade: 5,
    strand: 'Edit Drafts · Parts of Speech',
    brief: 'The subjects and verbs stopped agreeing in four places.',
    text: `The students in Ms. Garza's class [[was|were]] getting ready for the science fair. Each project [[need|needs]] a poster, a model, and a short talk. Marcus and Dev [[has|have]] been building a volcano out of newspaper and paste for two weeks. Their teacher [[say|says]] the eruption will work if they measure the vinegar carefully. By Friday, every group will be ready to present.`,
    hint: 'Read each sentence out loud — your ear will catch three of these.',
  },
  {
    id: 'pj_commas',
    title: 'Commas in a Series',
    skill: 'Separating three or more things',
    grade: 5,
    strand: 'Edit Drafts · Conventions',
    brief: 'Four lists in this paragraph are missing a comma. Put them back.',
    text: `For the campout we packed a tent, a lantern[[ and|, and]] four sleeping bags. My dad brought hot dogs, buns[[ and|, and]] a bag of marshmallows for later. We hiked past the creek, the old barn[[ and|, and]] a field full of bluebonnets. That night we told stories, watched for shooting stars[[ and|, and]] fell asleep before the fire went out.`,
    hint: 'A list of three needs a comma before the last item, not just the word "and".',
  },
]

/* Parse the [[wrong|right]] markup into tokens the client can render and tap. */
export function parseJob(job) {
  const parts = (job.text || '').split(/(\[\[[^\]]+\]\])/g)
  const tokens = []
  let errors = 0
  for (const part of parts) {
    const m = part.match(/^\[\[([^|]+)\|([^\]]+)\]\]$/)
    if (m) {
      tokens.push({ t: m[1], bad: true, fix: m[2], i: errors })
      errors++
    } else if (part) {
      tokens.push({ t: part })
    }
  }
  return { ...job, text: undefined, tokens, errorCount: errors }
}

export const jobsFor = (grade) => PROOF_JOBS.map(parseJob)
export const jobById = (id) => {
  const j = PROOF_JOBS.find((x) => x.id === id)
  return j ? parseJob(j) : null
}
