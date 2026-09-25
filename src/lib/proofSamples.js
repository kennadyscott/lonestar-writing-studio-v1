// SAMPLE Proof Room topics — placeholders only (2026-09-24: "put some mockup ones in
// there so we can talk about what this looks like when there are 20 topics").
// They carry no worksheets and no standards codes (none are invented); the page
// pads the shelf with them up to SAMPLE_TARGET and tags each card "Sample".
// Delete this file and its one import in ProofRoom.jsx to take them out.
export const SAMPLE_TARGET = 20

const s = (id, title, grade, domain, icon, skills, cleared = 0) => ({
  id: 'sample_' + id, title, short: title, grade, domain, icon, sample: true, sampleCleared: cleared,
  core: skills.map((t, i) => ({ id: `sample_${id}_${i}`, title: t, activities: [] })),
})

export const SAMPLE_TOPICS = [
  s('caps', 'Capitalization', 3, 'Composition', '🔠', ['Names and Places', 'Titles', 'Days, Months, Holidays']),
  s('homophones', 'Homophones', 3, 'Foundational Language', '👂', ['There, Their, They’re', 'To, Too, Two', 'Your and You’re'], 3),
  s('mainidea', 'Main Idea and Details', 3, 'Comprehension', '🧭', ['Finding the Main Idea', 'Supporting Details']),
  s('commas', 'Commas in a Series', 4, 'Composition', '📝', ['Lists of Three', 'Lists of Phrases'], 1),
  s('affixes', 'Prefixes and Suffixes', 4, 'Foundational Language', '🧩', ['Common Prefixes', 'Common Suffixes', 'Changing Word Meaning']),
  s('sva', 'Subject–Verb Agreement', 4, 'Composition', '🤝', ['Singular and Plural Subjects', 'Compound Subjects', 'Tricky Subjects']),
  s('poetry', 'Elements of Poetry', 4, 'Multiple Genres', '🎵', ['Rhyme and Rhythm', 'Stanzas and Line Breaks']),
  s('evidence', 'Using Text Evidence', 4, 'Response Skills', '🔎', ['Choosing Evidence', 'Quoting Correctly', 'Explaining Evidence'], 2),
  s('dialogue', 'Punctuating Dialogue', 5, 'Composition', '💬', ['Quotation Marks', 'Commas in Dialogue', 'New Speaker, New Line']),
  s('runons', 'Run-ons and Fragments', 5, 'Composition', '✂️', ['Spotting Fragments', 'Fixing Run-ons', 'Comma Splices'], 3),
  s('figurative', 'Figurative Language', 5, "Author's Purpose", '🌈', ['Similes and Metaphors', 'Personification', 'Idioms']),
  s('drama', 'Drama Structure', 5, 'Multiple Genres', '🎭', ['Scenes and Acts', 'Stage Directions']),
  s('roots', 'Greek and Latin Roots', 6, 'Foundational Language', '🏛️', ['Greek Roots', 'Latin Roots', 'Building Words'], 1),
  s('pronoun', 'Pronoun–Antecedent Agreement', 6, 'Composition', '🔗', ['Matching Number', 'Clear References']),
  s('tense', 'Verb Tense Consistency', 6, 'Composition', '⏳', ['Staying in One Tense', 'Shifting on Purpose'], 2),
  s('inference', 'Making Inferences', 6, 'Comprehension', '💡', ['Clues in the Text', 'What the Author Leaves Out']),
  s('voice', 'Active and Passive Voice', 7, 'Composition', '🎙️', ['Spotting Passive Voice', 'Making It Active']),
  s('pov', 'Point of View', 7, "Author's Purpose", '👁️', ['First and Third Person', 'How POV Shapes a Story']),
  s('citing', 'Citing Sources', 7, 'Inquiry and Research', '📚', ['Quoting vs. Paraphrasing', 'Giving Credit'], 2),
  s('semicolons', 'Semicolons and Colons', 8, 'Composition', '⁏', ['Joining Ideas', 'Introducing Lists']),
]

// Students only ever see their own grade (her rule, 2026-09-24), so the shelf is
// padded up to SAMPLE_TARGET with samples stamped with that grade.
export function withSamples(real, grade) {
  const room = Math.max(0, SAMPLE_TARGET - real.length)
  return [...real, ...SAMPLE_TOPICS.slice(0, room).map((tp) => ({ ...tp, grade }))]
}
