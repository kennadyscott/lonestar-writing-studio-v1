import { GLOSSARY } from './languageBridge.js'

/*
 * The platform scaffolding layer.
 *
 * Two things every surface needs, whatever it is:
 *
 *   1. A glossary that works on ANY string, so a student can tap any academic
 *      word anywhere in the product — not only words an author remembered to
 *      list on an assignment.
 *   2. A Beginning-level rewrite of the directions, keyed by the real English
 *      sentence. That reuses the i18n mechanism exactly: English is the key,
 *      a missing entry falls back to the original, and the simplified string
 *      is itself translatable, so a Beginning Spanish reader gets simple
 *      Spanish rather than simple English.
 */

/* ---- Platform vocabulary ------------------------------------------------ *
 * The words the product itself uses. A student meets these on every screen,
 * and none of them are taught anywhere. `kid` is the definition a sixth
 * grader reads; `es` is the Spanish gloss a Beginning student also gets.
 */
export const PLATFORM_GLOSSARY = {
  'draft': { kid: 'One version of your writing. You can write more than one.', es: 'un borrador' },
  'revise': { kid: 'To change your writing to make it better.', es: 'revisar' },
  'revision': { kid: 'The changes you make to improve your writing.', es: 'una revisión' },
  'publish': { kid: 'To finish a piece and mark it done.', es: 'publicar' },
  'evidence': { kid: 'Proof from the text that shows you are right.', es: 'la evidencia' },
  'trait': { kid: 'One part of writing we look at, like ideas or word choice.', es: 'un rasgo' },
  'conference': { kid: 'A talk with your teacher about your writing.', es: 'una conferencia' },
  'confer': { kid: 'To talk with your teacher about your writing.', es: 'conversar con tu maestro' },
  'rubric': { kid: 'The list of what a good answer needs.', es: 'una rúbrica' },
  'criteria': { kid: 'The things your writing is checked for.', es: 'los criterios' },
  'proofread': { kid: 'To read again and fix the mistakes.', es: 'corregir' },
  'fluency': { kid: 'How smoothly your sentences read out loud.', es: 'la fluidez' },
  'transition': { kid: 'A word that links one idea to the next, like "however".', es: 'una transición' },
  'conventions': { kid: 'The rules: capitals, commas, spelling.', es: 'las convenciones' },
  'elaboration': { kid: 'Adding more so your idea is clear.', es: 'la elaboración' },
  'prompt': { kid: 'The question or task you are asked to write about.', es: 'la instrucción' },
  'passage': { kid: 'The text you read before you answer.', es: 'el pasaje' },
  'claim': { kid: 'What you say is true.', es: 'una afirmación' },
  'reasoning': { kid: 'How you explain that your proof fits.', es: 'el razonamiento' },
  'strategy': { kid: 'A way of doing something that works.', es: 'una estrategia' },
  'genre': { kid: 'The kind of writing, like a story or an argument.', es: 'el género' },
  'feedback': { kid: 'What someone tells you about your writing.', es: 'los comentarios' },
  'voice': { kid: 'The way your writing sounds like you.', es: 'la voz' },
  'organization': { kid: 'The order you put your ideas in.', es: 'la organización' },
  'fragment': { kid: 'A piece of a sentence. It is not finished.', es: 'un fragmento' },
  'expand': { kid: 'To make a sentence longer by adding detail.', es: 'ampliar' },
  'accuracy': { kid: 'How often you get it right.', es: 'la precisión' },
  'submit': { kid: 'To turn your work in.', es: 'entregar' },
  'streak': { kid: 'Days in a row that you wrote.', es: 'una racha' },
  'module': { kid: 'A group of lessons that go together.', es: 'un módulo' },
  'constructed response': { kid: 'A written answer to a question about a text.', es: 'una respuesta construida' },
  'piece': { kid: 'One thing you wrote, like a story or an answer.', es: 'un escrito' },
}

/* One lookup for every term in the product, for callers that have a word in
 * hand and want its definition. */
export const ALL_TERMS = { ...GLOSSARY, ...PLATFORM_GLOSSARY }

/*
 * Only the PLATFORM words are auto-marked in running text. The assignment
 * glossary holds everyday words like "matter", "reason" and "support" that are
 * academic inside one prompt and noise everywhere else — the first pass
 * glossed "matter" in "Your ideas matter." Those words keep their own chip
 * row on the assignment, where they are in context.
 */
const AUTO_TERMS = PLATFORM_GLOSSARY
/* Longest first, so "constructed response" wins over "response". */
const TERM_KEYS = Object.keys(AUTO_TERMS).sort((a, b) => b.length - a.length)
const escape = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// The (?: ) matters: alternation binds looser than \w*, so without it only the
// LAST alternative would be allowed a plural or other suffix.
const TERM_RE = new RegExp(`\\b((?:${TERM_KEYS.map(escape).join('|')})\\w*)`, 'gi')
const TERM_TEST = new RegExp(`^(?:${TERM_KEYS.map(escape).join('|')})\\w*$`, 'i')

export function termFor(word) {
  const w = String(word).toLowerCase()
  if (AUTO_TERMS[w]) return { word: w, ...AUTO_TERMS[w] }
  // Match a suffixed form back to its base: "drafts" -> "draft".
  const base = TERM_KEYS.find((k) => w.startsWith(k))
  return base ? { word: base, ...AUTO_TERMS[base] } : null
}

/*
 * Split a string into plain runs and glossary terms. Only the FIRST time a
 * term appears in a block is marked — marking every "draft" in a paragraph
 * turns the page into noise and stops reading like prose.
 */
export function markTerms(text) {
  const parts = String(text || '').split(TERM_RE)
  const used = new Set()
  return parts.filter((p) => p !== '').map((p) => {
    if (!TERM_TEST.test(p)) return { text: p }
    const term = termFor(p)
    if (!term || used.has(term.word)) return { text: p }
    used.add(term.word)
    return { text: p, term }
  })
}

/* ---- Beginning-level directions ----------------------------------------- *
 * Keyed by the real English sentence, exactly like the i18n dictionary. A
 * string with no entry here falls through unchanged, so adopting this on a
 * new surface can never break its wording.
 */
export const SIMPLE = {
  // ---- dashboard ----
  "Find what's broken. Make it right.": 'Find the mistakes. Fix them.',
  'Your page, your rules — write anything': 'Write anything you want.',
  'Small games, big progress · double coins': 'Short games. Win coins.',
  'Revise, publish & share your pieces': 'Change, finish, and share your writing.',
  'Your averages at a glance — dig deeper in Data & Goals.': 'Your scores so far. Tap Data & Goals to see more.',
  'See what other students are writing — cheer them on with 👍 ❤️ 🎉': 'Read what other kids wrote. Tap a heart to cheer.',
  'Tap a tile and we pick the game. Score 90% for 20 coins, 70% for 10. Under 70% and you play that tile again.':
    'Tap a card. We pick a game. Do well and you win coins. Under 70% means play it again.',
  'Reset the board for a fresh round of surprise games.': 'Start again with new games.',
  'You have unfinished stories — pick one up where you left off, or start something brand new.':
    'You started some writing. Finish one, or start a new one.',
  "Judge it against the rubric, then rewrite it stronger. It's not yours, so revise boldly!":
    'Score it with the list. Then write it better. It is not your writing, so try big changes.',
  '{author} wrote something rough — can you fix it up?': '{author} wrote something with mistakes. Can you fix it?',
  "You'll name your next goal in a writing conference with your teacher.":
    'You will pick your next goal when you talk with your teacher.',
  'Your class focus shows up here when your teacher sets one.': 'Your teacher can put a class goal here.',
  'Nothing here — try the other tab or clear filters.': 'Nothing here. Try the other tab.',

  // ---- Proof Room ----
  'Bring writing in broken, take it out clean': 'Writing comes in with mistakes. You fix it.',
  'Pick a topic and start the path.': 'Pick a topic. Then start.',
  'Work the skills one at a time. Clear each one and the next opens — the last stop proves the whole topic.':
    'Do one skill at a time. Finish one and the next one opens. The last one shows you learned it all.',
  'Each box hides a choice. Pick the word that belongs, then press ✓.':
    'Each box has a choice. Pick the right word. Then press ✓.',
  'Click on each word that is wrong. Type the correct word, then press ✓. Clicking a word that is already correct counts against you.':
    'Click each wrong word. Type the right word. Then press ✓. Do not click words that are already right.',
  'Type the missing word in each blank. Use the word bank above — every word is used once. Check your answers when the last blank is filled.':
    'Type a word in each blank. Use the word list above. Use each word one time.',
  'Write the sentence yourself. The checklist ticks green as you land each move — get all of them and the sentence counts. How you word the rest is up to you.':
    'Write the sentence. The list turns green when you get each part right. Get them all.',
  'Click the word that belongs in each blank. Pick again any time before you check.':
    'Click the right word for each blank. You can change it before you check.',
  'Drag each word from the bank into the blank where it belongs — or tap a word, then tap its blank. Drop it back in the bank to change your mind.':
    'Move each word into the right blank. Tap a word, then tap its blank.',
  'Read the whole draft first. Each question names the sentence it is about — that sentence lights up when you open the question. For a "click the error" question, click the word inside the passage.':
    'Read all of it first. Each question tells you its sentence. That sentence lights up.',
  'Move with the arrow keys, or click a square next to you. Every verb blocking the path is written wrong — fix it to walk through. Get it right the first time to earn the point.':
    'Move with the arrow keys. Every verb in your way is wrong. Fix it to walk through.',

  // ---- Fluency Zone ----
  'Two choppy sentences walk in… pick the ONE smooth sentence that combines them best.':
    'Two short sentences. Pick the one sentence that puts them together best.',
  'Build the bridge! Pick the transition word that connects the two ideas best.':
    'Pick the word that joins the two ideas best.',
  'One of these is a COMPLETE sentence — the others are fragments in disguise. Find it!':
    'One of these is a whole sentence. The others are not finished. Find the whole one.',
  'Detective time! Use the other words in the sentence to work out what the CAPITAL word means.':
    'Use the other words to figure out what the BIG word means.',
  'Two words sound alike. Only one fits the blank. Weigh them up and pick the right one.':
    'Two words sound the same. Only one fits. Pick it.',
  'Prefixes, suffixes and roots are building blocks. Take the word apart and pick what the part means.':
    'Words have parts. Break the word apart. Pick what the part means.',
  'Three spellings, one is right. Trust your eyes, then check the tip.':
    'Three spellings. One is right. Pick it.',
  'Capitals, commas, apostrophes and end marks. Pick the sentence that gets the rule right.':
    'Look at the capitals, commas and end marks. Pick the sentence that is right.',
  'The bold word is BORING. Pick the upgrade that paints the clearest picture.':
    'The dark word is boring. Pick a better word.',

  // ---- Writing Bank ----
  "Every piece you've started — revise it, publish it, share it, or clear it out.":
    'All your writing. Change it, finish it, share it, or delete it.',
  'Nothing here yet — start a Free Write or Quick Write and it will land in your bank.':
    'Nothing here yet. Write something and it will show up here.',
  'No Quick Writes yet. Finish one and it shows up here.':
    'No Quick Writes yet. Finish one and it will be here.',
  'No Free Writes yet. Start one and it shows up here.':
    'No Free Writes yet. Start one and it will be here.',
  'Nothing matches these filters.':
    'Nothing matches.',
  'Nothing matches "{query}".':
    'No pieces match "{query}".',
  "This permanently removes it from your Writing Bank. You can't undo this.":
    'This deletes it forever. You cannot get it back.',
  'It never leaves your classroom, and you or your teacher can take it down anytime.':
    'Only your class can see it. You can take it down anytime.',

  // ---- Revision Studio ----
  "Score {name}'s draft the way a grader would.": "Give {name}'s writing a score, like a teacher would.",
  'You just did what real writers do — judge, then improve.': 'You did what real writers do. You judged it, then made it better.',
  'Your revision was scored on the same rubric you just used.': 'Your writing got a score from the same list you used.',

  // ---- Quick Write ----
  'Quick writes are about showing up — words over perfection.': 'Just write. It does not have to be perfect.',
  'What details and examples will make your idea clear to a reader?': 'What details will help your reader understand?',
  'There are no wrong answers — just your unique voice.': 'There are no wrong answers. Write like you.',
  'Explain the why behind your idea and how it helps others.': 'Say why your idea matters and who it helps.',
  'Your voice matters. Big ideas can spark real change!': 'Your ideas matter.',

  // ---- Inspiration Hub ----
  'Need an idea? Spin for inspiration — then write wherever it takes you.':
    'Need an idea? Press the button. Then write.',
  'No rules — twist it, break it, or ignore it. Your page, your story.': 'You can change the idea however you want.',
  'Steal this line as your opener — then take the story anywhere.': 'Start your story with this line. Then write anything.',

  // ---- coaching panels ----
  'Your coach asks questions — it never writes for you.': 'Your coach asks you questions. It does not write for you.',
  'Pull up a chair. Tap': 'Sit down. Tap',
  'Get specific, kind feedback on your writing across the 6 Traits.':
    'Get kind help about your writing in 6 parts.',
  "What's strong, and your next step.": 'What you did well, and what to do next.',

  // ---- Luna's Writing Nook ----
  'Build a strong foundation for clear, thoughtful answers.': 'Learn how to write clear answers.',
  'Stretch your answers into full, well-organized responses.': 'Make your answers longer and in order.',
  'Learn the moves great writers make in every piece.': 'Learn what good writers do.',
  'Plan, draft, and polish like a pro.': 'Plan it, write it, then make it better.',
  'Make good writing great by revising with purpose.': 'Change your writing on purpose to make it better.',
  'Catch every slip so your ideas shine through.': 'Find every small mistake so your ideas are clear.',
  'Use what you know about {title} to expand a sentence.': 'Use {title} to make a sentence longer.',
  'Answer the questions about the starter sentence. Use those answers to revise and write a more detailed sentence.':
    'Answer the questions about the first sentence. Then use your answers to write a longer sentence.',

  // ---- coins ----
  'You earn coins for how you write — showing up, conferring, and revising — never for your grade.':
    'You win coins for writing, talking about your writing, and changing it. Not for your grade.',
  'Coins reward the behaviors that make writers: drafting, conferring, revising.':
    'Coins are for the things writers do: writing, talking, and changing.',

  // ---- dashboard, second pass ----
  'Your teacher set this. The writing you are asked to do is the same as everyone else.':
    'Your teacher turned this on. Your writing work is the same as everyone else.',
  'Trait: {trait} · your coach keeps this in mind when you confer': 'Part of writing: {trait}. Your coach remembers this.',
  'A brand-new challenge lands tomorrow. You can still look back at your revision.':
    'A new challenge comes tomorrow. You can still look at what you changed.',
  "This round won't count. To clear the tile you'll need to start the game over and finish it.":
    'This game will not count. To clear the card you must start it again and finish.',

  // ---- coins, second pass ----
  'Spend them in the ClassCade arcade — you earned every one by growing as a writer.':
    'Spend them in the ClassCade arcade. You earned them by getting better at writing.',
  'Revise a draft to start earning!': 'Change your writing to start winning coins!',
  "You even earn for keeping the pen — doing your own thinking when it'd be easier to ask for the answer.":
    'You also win coins for doing your own thinking instead of asking for the answer.',
  'No coins for your grade. Effort and growth are what count.': 'No coins for your grade. Trying and growing is what counts.',
  "Big, meaningful revisions earn more than tiny edits — so it can't be gamed.": 'Big changes win more than tiny ones.',

  // ---- writing conference + Data & Goals ----
  'Say what you are working on as a writer today.': 'Say what you are working on today.',
  'Say which part is giving you trouble.': 'Say which part is hard.',
  'Your teacher will ask questions — think out loud, there is no wrong answer.': 'Your teacher will ask questions. Say what you think. There is no wrong answer.',
  'Hear one thing you did well, then pick one thing to learn.': 'Hear one thing you did well. Then pick one thing to learn.',
  'Your teacher names something you already did well — write it down so you remember it.': 'Your teacher says one thing you did well. Write it down.',
  'Just one. One thing you can actually use in your next piece.': 'Just one. One thing you can use next time you write.',
  'Watch how it works, then try it in your own writing.': 'Watch how it works. Then try it in your writing.',
  'Your teacher shows you the strategy using an example.': 'Your teacher shows you how, with an example.',
  'Say the strategy back in your own words.': 'Say it back in your own words.',
  'Try it right now in your own draft — you keep the pen.': 'Try it now in your own writing. You do the writing.',
  'Turn what you learned into your goal.': 'Make what you learned your goal.',
  'This is not just for today — you will use it every time you write.': 'This is not just for today. Use it every time you write.',
  'Say your goal out loud in your own words so it sticks.': 'Say your goal out loud in your own words.',
  'Step {n} of 4 · work through it together': 'Step {n} of 4. Do it together.',
  'Look at this together — it is the evidence for the conversation.': 'Look at this together. This is what you will talk about.',
  'Nothing written yet — this is a good place to start the conference.': 'Nothing written yet. Start your talk here.',
  'Nothing turned in yet — talk about what is in progress instead.': 'Nothing turned in yet. Talk about what you are working on.',
  'Their own choice of topic — no rubric on this one.': 'They picked the topic. No score list for this one.',
  'and work out your goal together. Or pick one to focus on now — you can change it anytime.': 'and pick your goal together. Or pick one now. You can change it later.',
  'your coach will keep this in mind when you confer': 'your coach will remember this when you talk',
  'Look what revising did — same writer, {n} drafts apart.': 'Look what changing it did. Same writer, {n} tries later.',
  'Your most recent finished assignments — open one to see the feedback again.': 'Your finished work. Open one to see the help again.',
  '🌵 Nothing turned in yet — finished assignments and their feedback land here.': '🌵 Nothing turned in yet. Finished work shows up here.',
  'Anchor adherence': 'How well you followed R-A-C-E',
  'See what other students are writing!': 'See what other kids wrote!',
  'Cheer for each other with a 👍, ❤️, or 🎉 — reactions only, no comments.': 'Cheer with a 👍, ❤️, or 🎉. No comments, just cheers.',
  'Proud of it? Share it with the class.': 'Proud of it? Share it with your class.',

  // ---- Revision Studio ----
  'Evaluate with the rubric': 'Score it with the list',
  'Revise with your checklist': 'Fix it with your checklist',
  'Get feedback': 'See how you did',
  'You fixed {n} criterion the draft was missing.': 'You fixed {n} thing the writing was missing.',
  'You fixed {n} criteria the draft was missing.': 'You fixed {n} things the writing was missing.',
  'None of the missing criteria are fixed yet — the ✗ items below are where to go next.': 'Nothing is fixed yet. Start with the ✗ items below.',
  'you matched the rubric on {a} of {b} criteria when you scored Pip’s draft.': 'you agreed with the list on {a} of {b} when you scored Pip.',
  'You matched the rubric on {a} of {b}.': 'You agreed with the list on {a} of {b}.',
  'You read this draft exactly like a grader would.': 'You scored this just like a teacher would.',
  'The ✗ marks below are the rubric’s own scoring — fix those as you revise.': 'The ✗ marks below are what is missing. Fix those.',
  'as you revise, and check them off as you go.': 'as you go, and check each one off.',

  // ---- Writing Bank modals + conference ----
  'as finished — it becomes': 'as done. It becomes',
  'just you and your teacher — publishing does': 'Only you and your teacher can see it. Publishing does',
  'put it on the Writing Wall. Sharing is a separate choice you make after.': 'put it on the Writing Wall. Sharing is a different choice you make later.',
  'and your coach will ask you a question about your draft.': 'and your coach will ask you a question about your writing.',

  // ---- Fluency Zone games, typing, Luna encouragement ----
  'Where? How? Add details to make us SEE it.': 'Where? How? Add details so we can see it.',
  'Show it instead of telling it — what did she do?': 'Show it. What did she do?',
  'Make us feel the cold. Add sights, sounds, or feelings.': 'Make us feel the cold. What did you see, hear, or feel?',
  'How did they win? What did it feel like?': 'How did they win? How did it feel?',
  'Stretch this sentence:': 'Make this sentence longer:',
  'Start with "{base}…" and keep going': 'Start with "{base}…" and add more',
  'Add at least a few vivid words': 'Add a few strong words',
  'You stretched {n} sentences — nice fluency workout! 💪': 'You made {n} sentences longer. Nice work! 💪',
  'Type each vocabulary word exactly.': 'Type each word exactly as you see it.',
  'Type the word, then say what kind of word it is.': 'Type the word. Then pick what kind of word it is.',
  'Add the capitals and punctuation as you type.': 'Add the big letters and the marks as you type.',
  'Type the whole sentence, exactly as written.': 'Type the whole sentence exactly as you see it.',
  'Goal: {wpm} words per minute at {target}% accuracy': 'Goal: {wpm} words a minute, {target}% right',
  'Type the sentence the way it should be written…': 'Type the sentence the right way…',
  'Press Enter to check, Enter again for the next one': 'Press Enter to check. Press Enter again for the next one.',
  'Nice round. Your coins are revealed on the Fluency Zone board.': 'Nice job. See your coins on the Fluency Zone board.',
  'Under 70% this time. Head back to the board and try the tile again.': 'Under 70% this time. Go back and try the card again.',
  'You\'ve earned all the typing coins for today — keep practicing for the speed.': 'You won all the typing coins for today. Keep practicing to get faster.',
  'Hit {n}% accuracy to earn coins. Slow down a little — accuracy first, speed follows.': 'Get {n}% right to win coins. Go slower. Getting it right comes first.',
  'Show what you\'ve learned!': 'Show what you learned!',
  'Keep going! You\'re making great progress!': 'Keep going! You are doing great!',
  'Great work! You\'re more than halfway there!': 'Great work! You are more than halfway done!',
  'You\'re doing amazing, writer!': 'You are doing great, writer!',
  'Keep up the great work and finish strong!': 'Keep going and finish strong!',
}

/* The one call every surface makes: give me this string at this level. */
export const simplerFor = (level, text) => (level === 'beginning' && SIMPLE[text]) || text
