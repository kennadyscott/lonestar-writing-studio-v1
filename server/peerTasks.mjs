// Daily Revision Challenge bank — the robot drafts students judge and rewrite.
//
// 25 tasks × 2 grade bands (elem = gr 3–5, mid = gr 6–8) = 50 hand-written weak
// drafts, so a class goes 25 school days without repeating.
//
// Every rubric item carries a CHECK — a machine-evaluable rule. That gives us
// two things the old bank could not do:
//   1. an answer key for step 1: run the checks against the ORIGINAL draft and
//      you know which criteria a grader would mark ✗, so a student's judgments
//      can be scored instead of just recorded;
//   2. a real grade for step 3: run the same checks against the REVISION and
//      the score comes from the very rubric the student was handed.
// The checks are heuristics — proxies for criteria like "grouped logically" —
// so they reward the moves that criterion asks for, not prose quality itself.

/* ---------- rule vocabulary ---------- */
const w = (n) => ({ type: 'minWords', n })
const sent = (n) => ({ type: 'minSentences', n })
const para = (n) => ({ type: 'minParagraphs', n })
const has = (...any) => ({ type: 'contains', any })
const no = (...any) => ({ type: 'notContains', any })
const openers = (n) => ({ type: 'distinctOpeners', n })
const added = (n) => ({ type: 'addedWords', n })
const gone = (...any) => ({ type: 'phraseRemoved', any })
const all = (...of) => ({ type: 'all', of })

const item = (text, check) => ({ text, check })

/* ---------- rule engine ---------- */
const norm = (t) => (t || '').toLowerCase().replace(/[“”]/g, '"').replace(/[’]/g, "'")
const wordList = (t) => norm(t).match(/[a-z']+/g) || []
const sentences = (t) => (t || '').split(/[.!?]+/).map((x) => x.trim()).filter(Boolean)
const paragraphs = (t) => (t || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)

export function checkRule(rule, text, original = '') {
  const t = norm(text)
  switch (rule.type) {
    case 'minWords': return wordList(text).length >= rule.n
    case 'minSentences': return sentences(text).length >= rule.n
    case 'minParagraphs': return paragraphs(text).length >= rule.n
    case 'contains': return rule.any.some((p) => t.includes(norm(p)))
    case 'notContains': return !rule.any.some((p) => t.includes(norm(p)))
    case 'phraseRemoved': return !rule.any.some((p) => t.includes(norm(p)))
    case 'distinctOpeners': {
      const firsts = sentences(text).map((s) => (wordList(s)[0] || ''))
      return new Set(firsts.filter(Boolean)).size >= rule.n
    }
    case 'addedWords': return wordList(text).length - wordList(original).length >= rule.n
    case 'maxSentences': return sentences(text).length <= rule.n && sentences(text).length > 0
    case 'regex': return new RegExp(rule.re, rule.flags || 'i').test(t)
    case 'any': return rule.of.some((r) => checkRule(r, text, original))
    case 'all': return rule.of.every((r) => checkRule(r, text, original))
    default: return false
  }
}

/* Score a whole checklist against a piece of text. */
export function evaluateChecklist(checklist, text, original = '') {
  return (checklist || []).map((c, i) => ({
    i,
    text: typeof c === 'string' ? c : c.text,
    met: typeof c === 'string' ? false : checkRule(c.check, text, original),
  }))
}

/* The grader's own read of the robot's draft — the step-1 answer key. */
export function answerKey(band) {
  return evaluateChecklist(band.checklist, band.weakText).map((r) => r.met)
}

/* Plain checklist text, for anything that just needs the words. */
export const checklistText = (band) => (band.checklist || []).map((c) => (typeof c === 'string' ? c : c.text))

/* ---------- shared rubric shapes ---------- */
// Argument
const argMid = (topicWords, closers) => [
  item('Has a clear claim', has('i believe', 'i think', 'should', 'must', 'the best')),
  item('Each reason is backed by evidence or an example', has('for example', 'for instance', 'according to', 'in fact', 'studies', 'research', 'one study', 'data')),
  item('Answers what the other side would say', has('some people', 'others say', 'critics', 'opponents', 'on the other hand', 'even though', 'although', 'it is true that')),
  item('Each body paragraph does one job, linked with transitions', all(para(3), has('first', 'second', 'also', 'in addition', 'most importantly', 'finally'))),
  item('Word choice is precise — no vague "good" or "fun"', no(' good', ' fun', ' stuff', ' things', ' nice', 'a lot of')),
  item('Conclusion does more than repeat the claim', has(...closers)),
]
const argElem = (vague) => [
  item('States an opinion clearly', has('i think', 'i believe', 'should', 'the best')),
  item('Gives a real reason — not just "it is fun"', has('because', 'since', 'so that')),
  item('Uses different words instead of repeating', no(...vague)),
  item('Has a closing sentence', has('that is why', 'so please', 'next time', 'this is why', 'in the end')),
]

// Informational
const infoMid = (topicWords, filler) => [
  item('Has a clear central idea', all(w(70), has('one reason', 'the main', 'this is because', 'why', 'how'))),
  item('Facts are grouped logically, not scattered', all(para(3), has('first', 'next', 'another', 'also', 'in addition', 'finally'))),
  item('Each fact is explained or has an example', has('for example', 'for instance', 'such as', 'this means', 'which means', 'because')),
  item('Uses precise vocabulary for the topic', has(...topicWords)),
  item('No contradictions or filler sentences', gone(...filler)),
  item('Conclusion ties the information together', has('overall', 'all of these', 'together', 'that is how', 'this shows that', 'in short')),
]
const infoElem = (topicWords, filler) => [
  item('Has a topic sentence', has(...topicWords)),
  item('Gives at least two facts', sent(4)),
  item('Explains the facts with details', has('because', 'for example', 'such as', 'this means')),
  item('Has an ending sentence', all(has('so', 'that is why', 'now you know', 'overall'), gone(...filler))),
]

// Narrative
const narMid = (sensory) => [
  item('Opens in a way that pulls the reader in', no('one day', 'this is a story about', 'my story is about', 'hi my name is')),
  item('Uses sensory details (see, hear, feel)', has(...sensory)),
  item('Shows emotion through actions, not labels', all(
    no('i was happy', 'i was sad', 'i was scared', 'i was mad', 'i felt happy', 'i felt sad', 'i felt scared'),
    has('heart', 'hands', 'breath', 'shook', 'froze', 'grinned', 'swallowed', 'stared', 'gripped'))),
  item('Varies sentence length and beginnings', openers(6)),
  item('Events connect — one leads to the next', has('because of that', 'after that', 'so that', 'which meant', 'until', 'by the time', 'as soon as')),
  item('Ending resolves the story, not just stops it', has('finally', 'in the end', 'from then on', 'ever since', 'never again', 'after that day')),
]
const narElem = (sensory) => [
  item('Tells who and where', all(w(24), has('at the', 'in the', 'on the', 'in my', 'at my'))),
  item('Shows feelings instead of just naming them', all(
    no('i was happy', 'i was sad', 'i was scared', 'i was mad'),
    has('heart', 'smiled', 'yelled', 'hugged', 'shook', 'jumped', 'grabbed'))),
  item('Uses at least one vivid describing word', has(...sensory)),
  item('Has a real ending', has('finally', 'at last', 'from then on', 'after that', 'in the end')),
]

/* ---------- the bank ---------- */
export const PEER_TASKS = [
  /* ===== ARGUMENT ===== */
  { id: 'pr_recess', author: 'Rex the Robot 🤖', genre: 'argument', bands: {
    elem: {
      prompt: 'Rex thinks recess should be longer, but he only says it is fun. Help him give a real reason and finish with a strong ending.',
      weakText: 'Recess should be longer. Recess is fun. It is really fun to play outside. Everyone likes recess because it is fun. That is all.',
      checklist: argElem([' fun', ' cool', ' nice', 'that is all']) },
    mid: {
      prompt: 'Rex wrote three paragraphs arguing for longer recess, but his reasons have no evidence and he never answers the other side. Evaluate it against the rubric, then revise it.',
      weakText: 'I think recess should be longer. Recess is good for kids and it is fun. Everybody I know likes recess a lot.\n\nKids need a break. Sitting all day is boring. When we get a break we feel better and we can do good work after.\n\nSo recess should be longer. That is my opinion about recess.',
      checklist: argMid([], ['that is why', 'this matters', 'if we', 'imagine', 'it is time', 'so the next time']) } } },

  { id: 'pr_uniform', author: 'Nova the Robot 🤖', genre: 'argument', bands: {
    elem: {
      prompt: 'Nova wrote about school uniforms but repeated the same word over and over. Give her a real reason and a closing sentence.',
      weakText: 'I think uniforms are not good. They are not fun to wear. Kids do not think they are fun. Uniforms are just not fun at all.',
      checklist: argElem([' fun', ' cool', ' nice']) },
    mid: {
      prompt: 'Nova argues against school uniforms, but every reason is an opinion with nothing behind it and she ignores what the other side thinks.',
      weakText: 'I believe uniforms are a bad idea for our school. They are not fun and kids do not like them. That should be enough.\n\nClothes are how you show who you are. If everyone wears the same thing then everyone is the same. That is a lot of boring.\n\nUniforms are bad. Our school should not make us wear them.',
      checklist: argMid([], ['that is why', 'this matters', 'if we', 'imagine', 'it is time', 'so the next time']) } } },

  { id: 'pr_homework', author: 'Byte the Robot 🤖', genre: 'argument', bands: {
    elem: {
      prompt: 'Byte says homework should be optional but never says why. Add a real because-reason and a closing sentence.',
      weakText: 'Homework should be optional. Homework is not fun. I do not like homework. Homework is bad and not fun.',
      checklist: argElem([' fun', ' bad', ' stuff']) },
    mid: {
      prompt: 'Byte argues homework should be optional. He has a claim, but no evidence, no counter-argument, and a conclusion that just repeats himself.',
      weakText: 'Homework should be optional at our school. Kids already work hard all day and then they have to work more at home. That is a lot.\n\nSome kids have practice or they watch their little brother. They do not have time. It is not fair to them.\n\nThat is why homework should be optional. Homework should be a choice.',
      checklist: argMid([], ['this matters', 'if we', 'imagine', 'it is time', 'so the next time', 'picture a']) } } },

  { id: 'pr_phones', author: 'Pixel the Robot 🤖', genre: 'argument', bands: {
    elem: {
      prompt: 'Pixel wrote about phones at school. Help him say his opinion clearly, give a real reason, and end it well.',
      weakText: 'I think phones should be allowed at school. Some kids have them. It is a thing people talk about. Phones are cool I guess.',
      checklist: argElem([' cool', ' stuff', ' things', ' fun']) },
    mid: {
      prompt: 'Pixel wants phones allowed at lunch. His reasons are vague, he never names what teachers would say back, and his paragraphs run together.',
      weakText: 'Phones should be allowed at lunch. Lunch is our free time and phones are good to have then. It would be nice.\n\nPeople say phones are bad but they are wrong. We would only use them at lunch and not in class. That is a big difference and it is fine.\n\nSo phones should be allowed at lunch. Phones are good.',
      checklist: argMid([], ['that is why', 'this matters', 'if we', 'imagine', 'it is time', 'picture a']) } } },

  { id: 'pr_yearround', author: 'Chip the Robot 🤖', genre: 'argument', bands: {
    elem: {
      prompt: 'Chip does not want year-round school but only says it is boring. Give her a real reason and a strong ending.',
      weakText: 'I think school all year is boring. Summer is fun. School in summer is not fun. It would be boring.',
      checklist: argElem([' fun', ' boring', ' stuff']) },
    mid: {
      prompt: 'Chip argues against year-round school. The claim is there, but nothing backs it up and the other side never gets a hearing.',
      weakText: 'Year-round school is a bad plan. Summer is when kids get a real break and that break is good for them.\n\nKids go to camp and see their family in summer. If school never stops then none of that happens. That would be sad for a lot of kids.\n\nYear-round school is a bad plan. We should keep summer the way it is.',
      checklist: argMid([], ['that is why', 'this matters', 'if we', 'imagine', 'it is time', 'picture a']) } } },

  { id: 'pr_classpet', author: 'Volt the Robot 🤖', genre: 'argument', bands: {
    elem: {
      prompt: 'Volt wants a class pet. Help him give a real reason instead of just saying it would be fun.',
      weakText: 'We should get a class pet. A pet would be fun. Pets are fun to have. It would be so fun.',
      checklist: argElem([' fun', ' cool', ' nice']) },
    mid: {
      prompt: 'Volt argues for a class pet. He never explains who would care for it, gives no examples, and skips the obvious objection.',
      weakText: 'Our class should get a class pet. A pet would make our room better and everyone would like it a lot.\n\nPets teach you things. You have to feed them and clean up. Kids would learn from that and it would be good for us.\n\nWe should get a class pet. It would be good.',
      checklist: argMid([], ['that is why', 'this matters', 'if we', 'imagine', 'it is time', 'picture a']) } } },

  { id: 'pr_recycle', author: 'Gizmo the Robot 🤖', genre: 'argument', bands: {
    elem: {
      prompt: 'Gizmo wants recycling bins in every classroom. Help her give a real reason and end with a request.',
      weakText: 'I think we should get recycling bins. Recycling is good. It is a good thing to do. Bins would be good.',
      checklist: argElem([' good', ' stuff', ' things']) },
    mid: {
      prompt: 'Gizmo argues for classroom recycling bins. Her reasons are general, there are no numbers or examples, and nobody answers the cost question.',
      weakText: 'Our school should put recycling bins in every classroom. Right now we throw away paper that could be recycled and that is bad.\n\nRecycling helps the earth. If we recycle more then there is less trash. Less trash is better for everyone.\n\nOur school should get recycling bins. Recycling is good for the earth.',
      checklist: argMid([], ['that is why', 'this matters', 'if we', 'imagine', 'it is time', 'picture a']) } } },

  { id: 'pr_starttime', author: 'Sprocket the Robot 🤖', genre: 'argument', bands: {
    elem: {
      prompt: 'Sprocket wants school to start later. Help him say why with a real because-reason.',
      weakText: 'School should start later. I am tired. Mornings are hard. Later would be better.',
      checklist: argElem([' good', ' bad', ' stuff']) },
    mid: {
      prompt: 'Sprocket argues for a later start time. There is real science on this, but his draft has none of it — and no answer for parents who work early.',
      weakText: 'School should start later in the morning. Kids are tired when it starts at 7:40 and being tired is not good for learning.\n\nWhen I am tired I do not do my best work. Other kids say the same thing. Everyone is tired in first period.\n\nSchool should start later. Kids need more sleep.',
      checklist: argMid([], ['that is why', 'this matters', 'if we', 'imagine', 'it is time', 'picture a']) } } },

  /* ===== INFORMATIONAL ===== */
  { id: 'pr_desert', author: 'Bolt the Robot 🤖', genre: 'informational', bands: {
    elem: {
      prompt: 'Bolt wrote about deserts but only says they are dry. Add two real facts, explain them, and finish with an ending sentence.',
      weakText: 'Deserts are dry. It does not rain there. Deserts are hot. That is what I know about deserts.',
      checklist: infoElem(['desert'], ['that is what i know', 'that is what i learned']) },
    mid: {
      prompt: "Byte wrote a three-paragraph explanation of deserts, but it's bare. Evaluate it against the rubric, then revise with organized facts, real examples, and precise vocabulary.",
      weakText: 'Deserts are very dry places. They do not get much rain. Deserts are hot. Some deserts are actually cold but mostly they are hot. This paper is about deserts and what lives there.\n\nPeople and animals live in deserts. They have ways to live there. Camels can go a long time without water. People wear clothes to stay cool. Plants live there too. A cactus holds water inside it. That is how they live in the desert.\n\nDeserts are interesting places. They are dry and hot. Many things live there. That is what I learned about deserts.',
      checklist: infoMid(['arid', 'adapt', 'adaptation', 'nocturnal', 'burrow', 'evaporate', 'sparse', 'dune'],
        ['this paper is about', 'that is what i learned', 'many things live there', 'they have ways to live there']) } } },

  { id: 'pr_volcano', author: 'Widget the Robot 🤖', genre: 'informational', bands: {
    elem: {
      prompt: 'Widget wrote about volcanoes but forgot to explain anything. Add facts and details that tell how a volcano works.',
      weakText: 'Volcanoes are mountains. They blow up. Hot stuff comes out. That is what I know about volcanoes.',
      checklist: infoElem(['volcano'], ['that is what i know', 'hot stuff']) },
    mid: {
      prompt: 'Widget explains volcanoes, but the facts are scattered, nothing is explained, and the vocabulary is fuzzy.',
      weakText: 'Volcanoes are mountains that blow up. Hot stuff comes out of the top. This paper is about volcanoes.\n\nThere is hot rock under the ground. It comes up. Some volcanoes are in the ocean and some are on land. Hawaii has volcanoes. People live near them anyway.\n\nVolcanoes are cool and also dangerous. That is what I learned about volcanoes.',
      checklist: infoMid(['magma', 'lava', 'erupt', 'eruption', 'pressure', 'crust', 'vent', 'plate'],
        ['this paper is about', 'that is what i learned', 'hot stuff', 'blow up']) } } },

  { id: 'pr_bees', author: 'Circuit the Robot 🤖', genre: 'informational', bands: {
    elem: {
      prompt: 'Circuit wrote about honeybees. Help him add two facts and explain why bees matter.',
      weakText: 'Bees make honey. Bees fly around. They are yellow and black. That is what I know about bees.',
      checklist: infoElem(['bee'], ['that is what i know']) },
    mid: {
      prompt: 'Circuit explains why honeybees matter, but the draft lists facts without connecting them and never uses the words a science teacher would expect.',
      weakText: 'Honeybees are important bugs. They make honey and they fly to flowers. This paper is about bees.\n\nBees go to flowers and get stuff from them. Then plants can grow more. Farmers like bees for that. Bees live in a hive with a queen. There are a lot of bees in there.\n\nBees are important. We should take care of them. That is what I learned about bees.',
      checklist: infoMid(['pollen', 'pollinate', 'pollination', 'nectar', 'colony', 'hive', 'crops', 'species'],
        ['this paper is about', 'that is what i learned', 'get stuff from them', 'a lot of bees']) } } },

  { id: 'pr_watercycle', author: 'Ember the Robot 🤖', genre: 'informational', bands: {
    elem: {
      prompt: 'Ember wrote about the water cycle but skipped the steps. Add the steps and explain them.',
      weakText: 'Water goes up. Then it comes down. It is called the water cycle. That is what I know.',
      checklist: infoElem(['water'], ['that is what i know']) },
    mid: {
      prompt: 'Ember explains the water cycle, but the steps are out of order, nothing is explained, and the science words are missing.',
      weakText: 'The water cycle is how water moves around the earth. Water goes up into the sky and then it comes back down again. This paper is about the water cycle and how it works.\n\nRain falls into rivers. The sun makes water go up. Clouds get heavy and then it rains again. Water goes into the ocean too and then it goes up again. It keeps going around and around forever.\n\nThe water cycle is important. Water is important. That is what I learned about the water cycle.',
      checklist: infoMid(['evaporation', 'evaporate', 'condensation', 'condense', 'precipitation', 'vapor', 'collection', 'runoff'],
        ['this paper is about', 'that is what i learned', 'around and around forever']) } } },

  { id: 'pr_sharks', author: 'Dot the Robot 🤖', genre: 'informational', bands: {
    elem: {
      prompt: 'Dot wrote about sharks but only said they are scary. Add real facts and explain them.',
      weakText: 'Sharks are scary. They have teeth. They swim fast. That is what I know about sharks.',
      checklist: infoElem(['shark'], ['that is what i know', 'scary']) },
    mid: {
      prompt: 'Dot explains sharks, but the draft repeats itself, contradicts itself, and never explains a single fact.',
      weakText: 'Sharks are fish that live in the ocean. People think they are scary. This paper is about sharks.\n\nSharks have a lot of teeth. They lose teeth and get new ones. Sharks eat fish and seals. Some sharks are big and some are small. The whale shark is the biggest but it eats tiny things.\n\nSharks are interesting animals. They are scary but also not scary. That is what I learned about sharks.',
      checklist: infoMid(['predator', 'species', 'cartilage', 'ecosystem', 'prey', 'gills', 'habitat'],
        ['this paper is about', 'that is what i learned', 'scary but also not scary']) } } },

  { id: 'pr_egypt', author: 'Cosmo the Robot 🤖', genre: 'informational', bands: {
    elem: {
      prompt: 'Cosmo wrote about ancient Egypt but forgot the details. Add two facts and explain them.',
      weakText: 'Egypt had pyramids. They are big. People lived there long ago. That is what I know about Egypt.',
      checklist: infoElem(['egypt', 'pyramid'], ['that is what i know']) },
    mid: {
      prompt: 'Cosmo explains ancient Egypt, but the facts jump around and nothing gets explained or exemplified.',
      weakText: 'Ancient Egypt was a place long ago. They built pyramids. This paper is about ancient Egypt.\n\nThe Nile River was there. People farmed. Pyramids were for kings when they died. They wrote in pictures. There were a lot of pharaohs and some were famous.\n\nAncient Egypt was interesting. They did a lot of things. That is what I learned about ancient Egypt.',
      checklist: infoMid(['pharaoh', 'hieroglyph', 'hieroglyphics', 'irrigation', 'flooded', 'tomb', 'dynasty', 'papyrus'],
        ['this paper is about', 'that is what i learned', 'did a lot of things']) } } },

  { id: 'pr_hurricane', author: 'Zip the Robot 🤖', genre: 'informational', bands: {
    elem: {
      prompt: 'Zip wrote about hurricanes but only said they are windy. Add facts and explain how people stay safe.',
      weakText: 'Hurricanes are windy. They have rain. They are big storms. That is what I know about hurricanes.',
      checklist: infoElem(['hurricane', 'storm'], ['that is what i know']) },
    mid: {
      prompt: 'Zip explains hurricanes. The paragraphs are unsorted, the vocabulary is everyday instead of scientific, and filler sentences pad it out.',
      weakText: 'Hurricanes are really big storms. They have wind and rain. This paper is about how hurricanes work.\n\nHurricanes start over the ocean. Warm water makes them and they get bigger. They spin around as they move. When they hit land there is damage to houses and trees. People board up windows. Sometimes they have to leave their houses and drive away.\n\nHurricanes are dangerous storms. People should be careful. That is what I learned about hurricanes.',
      checklist: infoMid(['eye', 'evacuate', 'storm surge', 'category', 'meteorologist', 'pressure', 'landfall'],
        ['this paper is about', 'that is what i learned', 'really big storms']) } } },

  { id: 'pr_solar', author: 'Patch the Robot 🤖', genre: 'informational', bands: {
    elem: {
      prompt: 'Patch wrote about solar power but did not explain how it works. Add facts and details.',
      weakText: 'Solar panels use the sun. They make power. They are on roofs. That is what I know about solar.',
      checklist: infoElem(['solar', 'sun'], ['that is what i know']) },
    mid: {
      prompt: 'Patch explains solar power, but the facts sit in one lump, nothing is explained with an example, and the technical words are missing.',
      weakText: 'Solar power comes from the sun. People put panels on their roof. This paper is about how solar power works.\n\nThe panels take in sun and make power for the house. It works better when it is sunny. At night it does not work. Some places have a lot of sun so it is good there.\n\nSolar power is a good thing. More people should use it. That is what I learned about solar power.',
      checklist: infoMid(['renewable', 'photovoltaic', 'electricity', 'energy', 'battery', 'grid', 'emissions', 'fossil fuels'],
        ['this paper is about', 'that is what i learned', 'a good thing']) } } },

  /* ===== NARRATIVE ===== */
  { id: 'pr_lostdog', author: 'Echo the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: 'Echo wrote about losing her dog but just tells you how she felt. Show the feelings and give it a real ending.',
      weakText: 'My dog got lost in my yard. I was sad about it. We looked for him at the park for a long time. Then we found him. I was happy.',
      checklist: narElem(['muddy', 'freezing', 'soaked', 'sticky', 'crooked', 'rusty', 'shaggy']) },
    mid: {
      prompt: 'Echo tells about losing her dog, but the story opens flat, names every feeling instead of showing it, and just stops at the end.',
      weakText: 'One day my dog got lost. I was really sad about it. My mom said we would look for him.\n\nWe walked around the neighborhood. I was scared we would not find him. We asked people and they said no. It took a long time and I was sad the whole time.\n\nThen we found him by the park. I was happy. We went home.',
      checklist: narMid(['barked', 'cold', 'rain', 'wet', 'mud', 'smelled', 'loud', 'dark', 'quiet']) } } },

  { id: 'pr_newschool', author: 'Rusty the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: 'Rusty wrote about his first day at a new school. Help him show his feelings and give a real ending.',
      weakText: 'I went to a new school in the fall. I was scared. Nobody at the school knew me. Then a kid talked to me at lunch. I was happy.',
      checklist: narElem(['crowded', 'echoing', 'shiny', 'squeaky', 'freezing', 'giant']) },
    mid: {
      prompt: 'Rusty writes about his first day at a new school. The opening is a stock line, feelings are labeled, and every sentence starts the same way.',
      weakText: 'This is a story about my first day at a new school. I was scared. I did not know anyone there.\n\nI walked in. The hallway was loud. I found my class. I sat down. I did not talk to anyone. I was scared the whole morning. I ate lunch by myself.\n\nThen a kid named Marcus sat by me. I was happy. Now we are friends.',
      checklist: narMid(['loud', 'hallway', 'smelled', 'cold', 'echo', 'bright', 'quiet', 'buzzed']) } } },

  { id: 'pr_storm', author: 'Blip the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: 'Blip wrote about a storm at a campsite. Add describing words and show how it felt.',
      weakText: 'We went camping at the lake. It rained on the tent. I was scared. We went in the tent and waited. Then it stopped.',
      checklist: narElem(['freezing', 'soaked', 'howling', 'muddy', 'crackling', 'pounding']) },
    mid: {
      prompt: 'Blip tells about a storm on a camping trip. There is no sound or feeling in it, and the ending simply stops.',
      weakText: 'One day we went camping and there was a big storm. I was scared of it.\n\nThe rain came. We got in the tent. The wind was strong. My dad held the tent. It was a long time. I was scared and I wanted to go home.\n\nThen the storm was over. We went to sleep.',
      checklist: narMid(['thunder', 'rain', 'cold', 'wet', 'loud', 'flash', 'smelled', 'dark', 'shook']) } } },

  { id: 'pr_game', author: 'Tinker the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: 'Tinker wrote about the last play of a game. Show the feelings instead of naming them, and give it a real ending.',
      weakText: 'We played a game at the park. It was close the whole time. I was nervous. We lost in the last inning. I was sad.',
      checklist: narElem(['sweaty', 'freezing', 'roaring', 'sticky', 'muddy', 'blaring']) },
    mid: {
      prompt: 'Tinker writes about the last play of a game. The feelings are labeled, sentences all start alike, and nothing connects one event to the next.',
      weakText: 'One day we had a big game. I was nervous about it. It was the last game of the season.\n\nI was up. I swung. I missed. I swung again. I hit it. I ran. They caught it. I was sad. My team was sad too.\n\nWe lost the game. That is what happened.',
      checklist: narMid(['crowd', 'dust', 'sweat', 'loud', 'cold', 'roar', 'smelled', 'dirt', 'quiet']) } } },

  { id: 'pr_attic', author: 'Scout the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: 'Scout found a locked door in the attic. Add describing words and finish the story.',
      weakText: 'There was a door in the attic at my house. It was locked. I was curious about it. I opened it with a key. It was cool in there.',
      checklist: narElem(['dusty', 'creaky', 'rusty', 'crooked', 'moldy', 'shiny']) },
    mid: {
      prompt: 'Scout tells about a locked attic door, but the opening is flat, nothing is described, and the story ends without resolving.',
      weakText: 'One day I found a door in the attic. It was locked. I wanted to know what was in there.\n\nI looked for a key. It was dark up there. I found one in a box. I put it in the lock. It worked. I opened the door.\n\nThere was a room with old stuff in it. It was cool. Then I went downstairs.',
      checklist: narMid(['dust', 'creaked', 'cold', 'smelled', 'dark', 'quiet', 'cobweb', 'light']) } } },

  { id: 'pr_fair', author: 'Vega the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: 'Vega got lost at the fair. Show how it felt and give the story a real ending.',
      weakText: 'I went to the fair in my town. I got lost by the rides. I was scared. Then my mom found me at the gate. I was happy.',
      checklist: narElem(['blaring', 'sticky', 'crowded', 'flashing', 'greasy', 'spinning']) },
    mid: {
      prompt: 'Vega writes about getting lost at the fair. The scene has no sights or sounds, feelings are labeled, and the ending just stops.',
      weakText: 'One day I went to the fair with my family. I got lost there. I was scared.\n\nI looked around. The music was loud. I did not see them. I walked to the rides. I walked to the food. I still did not see them. I was scared for a long time.\n\nThen my mom found me. I was happy. We went home.',
      checklist: narMid(['music', 'lights', 'smelled', 'loud', 'sticky', 'crowd', 'cold', 'shouted']) } } },

  { id: 'pr_robotgarden', author: 'Quill the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: 'Quill wrote about a robot waking up in a garden. Add describing words and finish the story.',
      weakText: 'A robot woke up in the garden behind the school. It was new there. It looked around at the flowers and the trees. It liked it. The end.',
      checklist: narElem(['rusty', 'shiny', 'buzzing', 'tangled', 'bright', 'dewy']) },
    mid: {
      prompt: 'Quill writes about a robot waking up in a garden. Good idea, but nothing is described, and every sentence starts the same way.',
      weakText: 'This is a story about a robot in a garden. The robot woke up there. It did not know how it got there.\n\nThe robot stood up. The garden was warm. The robot looked at the flowers. The robot walked around. The robot saw a bird. The robot did not know what it was.\n\nThe robot stayed in the garden. That is the end of my story.',
      checklist: narMid(['hummed', 'green', 'warm', 'buzzed', 'smelled', 'bright', 'cold', 'petals', 'whirred']) } } },

  { id: 'pr_snowday', author: 'Nimbus the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: 'Nimbus wrote about a snow day. Add describing words and show how it felt.',
      weakText: 'It snowed at my house all night long. School was closed for the day. I was happy. We played outside in the yard for a while. Then we went in.',
      checklist: narElem(['freezing', 'crunchy', 'soaked', 'icy', 'blinding', 'steaming']) },
    mid: {
      prompt: 'Nimbus writes about a snow day. Every feeling is named instead of shown and the events never build on each other.',
      weakText: 'One day it snowed a lot and school was closed. I was happy about that.\n\nI got dressed. I went outside. It was cold. I made a snowman. My hands got cold. I went in. I had cocoa. I was happy.\n\nIt was a good day. Then I went to bed.',
      checklist: narMid(['cold', 'crunched', 'wind', 'burned', 'steam', 'quiet', 'white', 'numb']) } } },

  { id: 'pr_bird', author: 'Jolt the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: 'Jolt found a hurt bird. Show the feelings and give the story a real ending.',
      weakText: 'I found a bird in my yard. It was hurt. I was sad about it. We helped it at the animal place. Then it flew away.',
      checklist: narElem(['tiny', 'fluttering', 'soft', 'crooked', 'warm', 'trembling']) },
    mid: {
      prompt: 'Jolt writes about rescuing a hurt bird. The opening is generic, feelings are told not shown, and the ending stops instead of landing.',
      weakText: 'One day I found a bird in my yard. It was hurt. I was sad about it.\n\nI got a box. I put a towel in it. I put the bird in. We took it to a place that helps animals. The lady said it would be okay. I was happy.\n\nLater the bird was better. It flew away. That is my story.',
      checklist: narMid(['soft', 'warm', 'chirp', 'trembled', 'quiet', 'feathers', 'cold', 'breath']) } } },
]

export const bandFor = (grade) => (grade <= 5 ? 'elem' : 'mid')
export const todaysTask = () => PEER_TASKS[Math.floor(Date.now() / 86400000) % PEER_TASKS.length]
