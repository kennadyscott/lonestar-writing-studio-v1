// Original sample instruction and questions for reviewing the student flow.
// These are not published CMS lessons or assessments, and only accompany the
// shipped Parts of Speech path. Preview progress must remain separate.
const lesson = (title, steps) => ({ title, steps })
const step = (title, body, example) => ({ title, body, ...(example ? { example } : {}) })
const options = (...labels) => labels.map((text, i) => ({ id: String.fromCharCode(97 + i), text }))

const lessons = {
  ws_verbs: lesson('Irregular verbs', [
    step('Find the action and its time', 'A verb tells what happens. Words such as yesterday or last week tell you the action happened in the past.', 'Today I run. Yesterday I ran.'),
    step('Some past forms change the word', 'An irregular verb does not follow the usual add-ed rule. Learn its past form, then check that it fits the sentence.', 'bring → brought · catch → caught · write → wrote'),
    step('Notice helping verbs', 'A helping verb can change the form you need. After has, have, or had, use the past participle.', 'I wrote a note. I have written a note.'),
  ]),
  ws_adj: lesson('Adjectives and comparisons', [
    step('Describe a noun', 'An adjective gives information about a person, place, thing, or idea.', 'The narrow bridge crossed a quiet stream.'),
    step('Compare two', 'Use a comparative adjective when comparing two. Many short adjectives take -er. Many longer adjectives use more. Do not use both together.', 'The oak is taller than the pine. This route is more peaceful than that one.'),
    step('Compare three or more', 'A superlative identifies an extreme in a group. Many short adjectives take -est; longer ones often use most.', 'Of the four trails, this is the steepest. It also has the most beautiful view.'),
  ]),
  ws_conj: lesson('Conjunctive adverbs', [
    step('Start with two complete thoughts', 'A complete thought can stand as its own sentence. A conjunctive adverb shows how two complete thoughts connect.', 'The sun was bright. The air was cold.'),
    step('Choose the relationship', 'However shows contrast. Therefore shows a result. Meanwhile shows something happening at the same time.', 'The air was cold; therefore, we wore jackets.'),
    step('Give the join its punctuation', 'To join two complete thoughts in one sentence, place a semicolon before the conjunctive adverb and a comma after it.', 'The sun was bright; however, the air was cold.'),
  ]),
  ws_prep: lesson('Prepositions', [
    step('Show a relationship', 'A preposition relates a noun or pronoun to another part of a sentence. It can show place, time, or direction.', 'The backpack is under the bench. We will leave after lunch.'),
    step('Read the whole phrase', 'A preposition begins a phrase that includes its object. Think about what that whole phrase tells the reader.', 'Across the field tells where the runners traveled.'),
    step('Check the intended meaning', 'Choose the preposition that matches the scene. Changing one small word can change where or when something happens.', 'A bird flew over the bridge. A boat floated under the bridge.'),
  ]),
  ws_pron: lesson('Indefinite pronouns', [
    step('Refer without naming', 'An indefinite pronoun refers to a person or thing without naming exactly which one.', 'Someone left a notebook. Several were missing.'),
    step('Match one or many', 'Everyone, someone, and each take singular verbs. Both, few, and several take plural verbs.', 'Everyone is ready. Several are ready.'),
    step('Find the subject first', 'Words between the subject and verb do not change the subject. Find the pronoun, decide whether it is singular or plural, then choose the verb.', 'Each of the players has a water bottle.'),
  ]),
  sb_verbs: lesson('Skill Builder: irregular verbs', [
    step('Move one action into the past', 'Read the present-tense sentence. Then add yesterday and choose the form that tells about the past.', 'I see a deer. Yesterday I saw a deer.'),
    step('Keep a small verb collection', 'Say each pair aloud. Use the past form in a new sentence before trying the practice again.', 'go → went · take → took · find → found'),
  ]),
  sb_adj: lesson('Skill Builder: adjectives', [
    step('Count what you compare', 'Two things need a comparative form. A group of three or more can use a superlative.', 'Two boxes: the heavier box. Five boxes: the heaviest box.'),
    step('Use one comparison marker', 'Choose -er or more for a comparison of two, not both. Choose -est or most for a superlative, not both.', 'more helpful, not more helpfuler · fastest, not most fastest'),
  ]),
  sb_conj: lesson('Skill Builder: conjunctive adverbs', [
    step('Decide how the ideas connect', 'Ask whether the second idea contrasts with the first or happens because of it. Choose however for contrast and therefore for a result.', 'It was raining; therefore, we carried umbrellas.'),
    step('Build the punctuation frame', 'Check that each side is a complete thought. Put a semicolon before the connector and a comma after it.', 'The hike was long; however, we enjoyed every step.'),
  ]),
  sb_prep: lesson('Skill Builder: prepositions', [
    step('Picture the position', 'Imagine the object in the sentence. Decide where it is in relation to the other object.', 'A marble inside a cup is different from a marble beside a cup.'),
    step('Read the sentence with your choice', 'A preposition should make the intended relationship clear. Check the words after it as well.', 'The path runs between two ponds. The hikers walk along the path.'),
  ]),
  sb_pron: lesson('Skill Builder: pronouns', [
    step('Find the pronoun doing the action', 'Ignore extra phrases for a moment. Each and everyone are singular, even when the phrase after them mentions several people.', 'Each of the students is here. Think: Each is here.'),
    step('Match the verb', 'Use is or has with a singular subject. Use are or have with plural subjects such as both or several.', 'Everyone has a pencil. Both have notebooks.'),
  ]),
  ws_full: lesson('Bring the skills together', [
    step('Read once for meaning', 'Read the whole draft before editing. Understand who is acting, when events happen, and how the ideas connect.'),
    step('Make focused editing passes', 'Check verb forms and pronoun agreement. Then check comparisons, prepositions, and the punctuation around conjunctive adverbs.', 'Each of the hikers has a map. The trail was steep; however, the view was beautiful.'),
    step('Read your revised draft', 'After an edit, read the whole sentence again. Make sure the grammar is correct and the intended meaning stays clear.'),
  ]),
}

const pre = {
  title: 'Before you begin: Parts of Speech',
  items: [
    { id: 'pre-verbs', kind: 'inline', prompt: 'Yesterday, Lena ____ a bright feather beside the pond.', options: options('found', 'finded', 'finds'), correct: ['a'] },
    { id: 'pre-adjectives', kind: 'multi', prompt: 'Select both sentences that correctly compare exactly two things.', options: options('Mira’s kite is higher than Ben’s.', 'This puzzle is more difficult than the last one.', 'This is the most colorful of all five kites.', 'The blue kite is high than the red kite.'), correct: ['a', 'b'] },
    { id: 'pre-conjunctions', kind: 'order', prompt: 'Build a sentence that starts with the picnic being ready and then shows a contrast.', options: options('The picnic was ready;', 'however,', 'rain kept us indoors.'), correct: ['a', 'b', 'c'] },
    { id: 'pre-prepositions', kind: 'single', prompt: 'The ball rolled ____ the bed. We had to reach beneath the bed to get it. Which word fits?', options: options('under', 'above', 'onto'), correct: ['a'] },
    { id: 'pre-pronouns', kind: 'single', prompt: 'Which sentence has the correct verb?', options: options('Everyone is ready for the trip.', 'Everyone are ready for the trip.', 'Everyone be ready for the trip.'), correct: ['a'] },
  ],
}

const post = {
  title: 'Show what you learned: Parts of Speech',
  items: [
    { id: 'post-verbs', kind: 'inline', prompt: 'Last night, Omar ____ a letter to his cousin.', options: options('wrote', 'writed', 'write'), correct: ['a'] },
    { id: 'post-adjectives', kind: 'multi', prompt: 'Select both sentences that correctly compare exactly two things.', options: options('The river is wider than the creek.', 'My new bag is more comfortable than my old one.', 'That is the tallest of the three towers.', 'This route is more shorter than that route.'), correct: ['a', 'b'] },
    { id: 'post-conjunctions', kind: 'order', prompt: 'Build a sentence that starts with the muddy trail and then explains the result.', options: options('The trail was muddy;', 'therefore,', 'we wore our boots.'), correct: ['a', 'b', 'c'] },
    { id: 'post-prepositions', kind: 'single', prompt: 'Which word is the preposition in this sentence? “The turtle rested beneath the log.”', options: options('beneath', 'rested', 'turtle'), correct: ['a'] },
    { id: 'post-pronouns', kind: 'single', prompt: 'Which sentence has the correct verb?', options: options('Each of the campers has a flashlight.', 'Each of the campers have a flashlight.', 'Each of the campers having a flashlight.'), correct: ['a'] },
  ],
}

/** A fresh sample document prevents one preview from changing another. */
export function pathwayDemoFor(topic) {
  return topic?.id === 'topic_pos' ? JSON.parse(JSON.stringify({ preview: true, pre, post, lessons })) : null
}
