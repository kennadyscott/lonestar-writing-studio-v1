// Kid words for every rubric line in the Daily Revision Challenge (server/peerTasks.mjs), for the guided flow (Kennady,
// 2026-10-14: "I received feedback that this is really confusing process to follow and kids would not know what to do here").
//   ask:     a yes / no question about Pip's draft, in a student's words
//   tip:     what to do to fix it
//   starter: words they can drop in to get going (null when the fix is to cut or change words)
// Keyed by the rubric line's exact text; anything missing falls back to the line itself.

export const COACH = {
  // argument, grades 3-5
  'States an opinion clearly': { ask: 'Does Pip clearly say what they think?', tip: 'Start with a sentence that says exactly what Pip believes.', starter: 'I believe that ' },
  'Gives a real reason — not just "it is fun"': { ask: 'Does Pip give a real reason?', tip: 'Add a reason that explains why, using the word "because."', starter: 'This matters because ' },
  'Uses different words instead of repeating': { ask: 'Does Pip use different words instead of the same ones again and again?', tip: 'Find the word Pip keeps repeating and swap it for a stronger, more exact word.', starter: null },
  'Has a closing sentence': { ask: 'Does Pip end with a closing sentence?', tip: 'Add one last sentence that wraps up Pip\'s opinion.', starter: 'That is why ' },
  // argument, grades 6-8
  'Has a clear claim': { ask: 'Does Pip clearly state the claim?', tip: 'Make the first sentence say exactly what Pip is arguing for.', starter: 'I believe that ' },
  'Each reason is backed by evidence or an example': { ask: 'Does each reason have an example or a fact to back it up?', tip: 'After a reason, add an example or a fact that proves it.', starter: 'For example, ' },
  'Answers what the other side would say': { ask: 'Does Pip answer what people who disagree would say?', tip: 'Add what someone on the other side might say, then explain why Pip still has a point.', starter: 'Some people say ' },
  'Each body paragraph does one job, linked with transitions': { ask: 'Does each paragraph have one job, with linking words between them?', tip: 'Keep three paragraphs and start them with linking words like "First," "Also," and "Finally."', starter: 'First, ' },
  'Word choice is precise — no vague "good" or "fun"': { ask: 'Does Pip use exact words instead of "good," "fun," or "stuff"?', tip: 'Swap each vague word for one that says exactly what Pip means.', starter: null },
  'Conclusion does more than repeat the claim': { ask: 'Does the ending do more than say the claim again?', tip: 'End by telling the reader why it matters or what should happen next.', starter: 'This matters because ' },
  // informational, grades 3-5
  'Has a topic sentence': { ask: 'Does the first sentence tell what the whole piece is about?', tip: 'Write a first sentence that names the topic, using the topic\'s real words.', starter: null },
  'Gives at least two facts': { ask: 'Does Pip give at least two facts?', tip: 'Add another true fact about the topic.', starter: 'Another fact is that ' },
  'Explains the facts with details': { ask: 'Does Pip explain the facts with details?', tip: 'After a fact, add a detail or an example that explains it.', starter: 'For example, ' },
  'Has an ending sentence': { ask: 'Does Pip end with a real ending sentence?', tip: 'Cut the filler at the end and add a sentence that wraps up the facts.', starter: 'Now you know ' },
  // informational, grades 6-8
  'Has a clear central idea': { ask: 'Is it clear what the main idea is?', tip: 'Add a sentence that says the main idea and explains how or why it works.', starter: 'The main idea is ' },
  'Facts are grouped logically, not scattered': { ask: 'Are the facts in a sensible order, with linking words?', tip: 'Put the facts in order, in three paragraphs, and start them with words like "First," "Next," and "Finally."', starter: 'First, ' },
  'Each fact is explained or has an example': { ask: 'Does each fact have an explanation or an example?', tip: 'After a fact, add "for example" or "this means" and explain it.', starter: 'For example, ' },
  'Uses precise vocabulary for the topic': { ask: 'Does Pip use the real science or topic words?', tip: 'Add the exact words an expert would use for this topic.', starter: null },
  'No contradictions or filler sentences': { ask: 'Is every sentence doing a job (no filler)?', tip: 'Find the sentence that just fills space and delete it.', starter: null },
  'Conclusion ties the information together': { ask: 'Does the ending pull all the facts together?', tip: 'End with a sentence that sums up what all the facts show.', starter: 'Overall, ' },
  // narrative, grades 3-5
  'Tells who and where': { ask: 'Can you tell who is in the story and where it happens?', tip: 'Add who is there and where they are, like "at the park" or "in my kitchen."', starter: null },
  'Shows feelings instead of just naming them': { ask: 'Does Pip show feelings through actions, instead of just saying "I was happy"?', tip: 'Replace "I was happy" or "I was scared" with what the person did, like "my heart pounded."', starter: null },
  'Uses at least one vivid describing word': { ask: 'Is there at least one describing word you can almost see, hear, or feel?', tip: 'Add a describing word that helps the reader picture it.', starter: null },
  'Has a real ending': { ask: 'Does the story have a real ending?', tip: 'Add an ending that tells how things turned out.', starter: 'In the end, ' },
  // narrative, grades 6-8
  'Opens in a way that pulls the reader in': { ask: 'Does the first sentence grab the reader?', tip: 'Cut openings like "One day" and start in the middle of the action.', starter: null },
  'Uses sensory details (see, hear, feel)': { ask: 'Can you see, hear, or feel what is happening?', tip: 'Add a detail about a sound, a sight, or how something felt.', starter: null },
  'Shows emotion through actions, not labels': { ask: 'Does Pip show feelings through actions, not labels like "I was sad"?', tip: 'Replace the feeling word with what the body did, like "my hands shook."', starter: null },
  'Varies sentence length and beginnings': { ask: 'Do the sentences start in different ways?', tip: 'Change how some sentences begin, so they don\'t all start the same way.', starter: null },
  'Events connect — one leads to the next': { ask: 'Does each event lead to the next one?', tip: 'Link the events with words like "after that," "until," or "as soon as."', starter: 'After that, ' },
  'Ending resolves the story, not just stops it': { ask: 'Does the ending wrap up the story instead of just stopping?', tip: 'Add an ending that shows how things changed.', starter: 'From then on, ' },
}

export const coachFor = (text) => COACH[text] || { ask: text + '?', tip: 'Revise Pip\'s draft so it does this.', starter: null }

/** Words that would meet a "use one of these" rule, when the line has no sentence starter (topic words, sensory words). */
export function wordsThatWork(rule, max = 5) {
  if (!rule || rule.type !== 'contains') return []
  return rule.any.map((w) => w.trim()).filter((w) => w.length > 2).slice(0, max)
}

/** The words a "must not say" rule finds in the text right now, so the coach can point at them. */
export function offending(rule, text) {
  if (!rule) return []
  const t = (text || '').toLowerCase().replace(/[’]/g, "'")
  if (rule.type === 'notContains' || rule.type === 'phraseRemoved') return rule.any.filter((p) => t.includes(p.toLowerCase())).map((p) => p.trim())
  if (rule.type === 'all' || rule.type === 'any') return rule.of.flatMap((r) => offending(r, text))
  return []
}
