// The Proof Room — worksheets as learning paths.
//
// Shape mirrors how the worksheets are actually built: a TOPIC holds several
// core worksheets, each with a Skill Builder shadow, all ending at one Full
// Topic capstone. A worksheet is never broken apart — its activities run in
// order and score as one piece of work, because they were written for cohesion.
//
//   Edit Drafts: Parts of Speech
//     core   Irregular Verbs → Adjectives → Conjunctive Adverbs → Prepositions → Pronouns
//     SB     one per core worksheet, unlocked only when that worksheet scores under 85%
//     full   Full Topic: Edit Drafts: Parts of Speech
//
// Activity types
//   hunt  a paragraph with errors planted inline as [[wrong|right]]
//   fix   sentences to complete or correct, with a word bank
//   maze  a grid you walk, with a wrong verb blocking every gate
//
// Solution videos: the source folders ship one recording per numbered item
// ("5th CS SV # 3 Irregular Verbs.mp4"), so items carry the video id that was
// recorded for them and a student can watch the explanation exactly where they
// got it wrong.
//
// Job 1's hunt paragraph is verbatim from "Irregular Verbs.pptx" (Grade 5).

import { checkRule } from './peerTasks.mjs'

export const PASS_MARK = 85

/* A compose item: the student writes the sentence themselves, and the item only
 * ever judges the moves it is teaching — never style. Each check is a named,
 * machine-evaluable rule, so "open-ended" still has one solid answer. */
const compose = (brief, items, hint) => ({ kind: 'compose', brief, items, hint })
const need = (label, rule) => ({ label, rule })
const RX = (re) => ({ type: 'regex', re })
const HAS = (...any) => ({ type: 'contains', any })
const ALL = (...of) => ({ type: 'all', of })
const ANY = (...of) => ({ type: 'any', of })

/* Run one compose item's checks over what the student wrote. */
export function checkCompose(item, text) {
  return (item.checks || []).map((c) => ({ label: c.label, ok: checkRule(c.rule, text || '') }))
}

/* Split a numbered sentence into clickable tokens, keeping punctuation attached
 * so a student clicks the word they actually see. */
export const tokenize = (sentence) => (sentence || '').split(/(\s+)/).filter((x) => x !== '')

const hunt = (brief, text, hint, videos) => ({ kind: 'hunt', brief, text, hint, videos })
const fix = (brief, bank, items, hint, mode = 'type') => ({ kind: 'fix', brief, bank, items, hint, mode })
// maze: S start, X finish, # wall, . open, A–J gates. Every gate sits on the only
// route through, so the verbs get corrected in the order the path meets them.
const maze = (brief, grid, gates, hint, video) => ({ kind: 'maze', brief, grid, gates, hint, video })
// passage: one numbered paragraph, several questions hanging off it. The
// questions can say "sentence 3" because the sentences carry numbers, which is
// how the printed capstone asks everything.
//   pick   click the error inside a named sentence, then correct it
//   blank  a single answer, typed or clicked
//   write  compose against named moves
const passage = (brief, sentences, questions, hint) => ({ kind: 'passage', brief, sentences, questions, hint })

export const TOPICS = [
  {
    id: 'topic_pos',
    title: 'Edit Drafts: Parts of Speech',
    short: 'Parts of Speech',
    grade: 5,
    state: 'TX',
    domain: 'Composition',
    standards: ['5.11D(ii)', '5.11D(iv)', '5.11D(v)', '5.11D(vi)', '5.11D(vii)'],
    blurb: 'Five skills, then one full-topic proof to finish the path.',
    icon: '✍️',
    core: [
      {
        id: 'ws_verbs', title: 'Irregular Verbs', standards: ['5.11D(ii)'], skill: 'Past-tense verbs that break the rules',
        activities: [
          hunt('Four verbs in this story are wrong. Tyler would not want to turn this in.',
            `After dinner, Tyler looked for his math homework but could not find it anywhere. He [[runned|ran]] upstairs to check his room and searched under his bed. His sister [[catched|caught]] him tossing papers across the floor and offered to help. Tyler suddenly remembered that he had [[writed|written]] part of the assignment in the car after soccer practice. A few minutes later, they [[finded|found]] the homework inside his backpack, and Tyler happily brought it to the kitchen table to finish.`,
            'Every one of them is a verb that does not just add -ed.',
            ['iv-6', 'iv-7', 'iv-8', 'iv-9']),
          maze('Walk from START to FINISH. Every verb in your way is written wrong.',
            [
              'S.A.####',
              '#.#.####',
              '###B####',
              '#C..####',
              '#.###.##',
              '#...D..#',
              '###.##E#',
              '###.##.X',
            ],
            {
              A: { wrong: 'BLOWED', right: 'blew' },
              B: { wrong: 'CHOOSED', right: 'chose' },
              C: { wrong: 'RINGED', right: 'rang' },
              D: { wrong: 'DRINKED', right: 'drank' },
              E: { wrong: 'SPEAKED', right: 'spoke' },
            },
            'Dead ends are dead ends — back up and try another way.', 'iv-maze'),
          fix('Put each verb in the past tense.', ['choose', 'win', 'know', 'think', 'draw'], [
            { given: 'The scientist ____ carefully about the experiment.', answer: 'thought', video: 'iv-1' },
            { given: 'Maria ____ a topic for her research project.', answer: 'chose', video: 'iv-2' },
            { given: 'She ____ a detailed map of the trail.', answer: 'drew', video: 'iv-3' },
            { given: 'The team had ____ every game that season.', answer: 'won', video: 'iv-4' },
            { given: 'We ____ the answer as soon as the teacher asked the question.', answer: 'knew', video: 'iv-5' },
          ], 'Say the sentence out loud with "yesterday" in front of it.'),
        ],
      },
      {
        id: 'ws_adj', title: 'Adjectives', standards: ['5.11D(iv)'], skill: 'Words that describe, and how they compare',
        activities: [
          fix('Write the comparative form of each adjective \u2014 the form that compares two things.',
            ['more', 'most'], [
              { given: 'curious  \u2192  ____ curious', answer: 'more' },
              { given: 'creative  \u2192  ____ creative', answer: 'more' },
              { given: 'impressive  \u2192  ____ impressive', answer: 'more' },
              { given: 'busy  \u2192  ____', answer: 'busier' },
              { given: 'brave  \u2192  ____', answer: 'braver' },
              { given: 'dangerous  \u2192  ____ dangerous', answer: 'more' },
              { given: 'compassionate  \u2192  ____ compassionate', answer: 'more' },
            ], 'One or two syllables take -er. Three or more take "more".'),
          fix('Now the superlative form \u2014 the one that compares many.',
            ['more', 'most'], [
              { given: 'curious  \u2192  ____ curious', answer: 'most' },
              { given: 'creative  \u2192  ____ creative', answer: 'most' },
              { given: 'impressive  \u2192  ____ impressive', answer: 'most' },
              { given: 'busy  \u2192  ____', answer: 'busiest' },
              { given: 'brave  \u2192  ____', answer: 'bravest' },
              { given: 'dangerous  \u2192  ____ dangerous', answer: 'most' },
              { given: 'compassionate  \u2192  ____ compassionate', answer: 'most' },
            ], 'One or two syllables take -est. Three or more take "most".'),
          fix('Use the correct form of each word to complete the sentence.',
            ['creative', 'impressive', 'busy', 'curious'], [
              { given: 'Jalen built a model bridge, and his design was the ____ in class.', answer: 'most creative' },
              { given: 'Noah painted a mural that was ____ than anyone expected.', answer: 'more impressive' },
              { given: 'The town square was the ____ place during the holiday parade.', answer: 'busiest' },
              { given: 'Zara asked many questions because she was the ____ student.', answer: 'most curious' },
              { given: 'Ethan\u2019s schedule became ____ after he joined two new clubs.', answer: 'busier' },
              { given: 'After finding the old map, Miguel became ____ about its history.', answer: 'more curious' },
              { given: 'Priya\u2019s science fair project was ____ than the others this year.', answer: 'more creative' },
            ], '"than" wants the comparative. "the ___ in class" wants the superlative.'),
          hunt('Four describing words are in the wrong form. Find them.',
            `The annual invention showcase attracted students from schools across the region. Brit's display was [[creative|more creative]] than many of the others because it included a working model powered by solar energy. Her presentation was also one of the [[impressive|most impressive]] exhibits at the event. Nearby, Carl demonstrated a machine that sorted recyclable materials. His explanation was the [[clear|clearest]] of all the presentations because he provided detailed examples. During the judging period, the exhibition hall became [[busy|busier]] than it had been earlier in the morning. By the end of the day, visitors agreed that the showcase was one of the most successful events the school had ever hosted.`,
            'Look for "than" and for "one of the" \u2014 each one needs a form the word does not have yet.'),
          hunt('Four more, on a different trail.',
            `During a hiking trip, Karli and her cousins explored a new trail. The path near the entrance was [[wide|wider]] than the trails deeper in the forest. As they continued, they reached a lookout point with one of the [[spectacular|most spectacular]] views in the park. Karli noticed that her cousin was becoming curious about the unusual rock formations along the trail. At the visitor center, they heard facts about local wildlife. By afternoon, the parking area was [[crowded|more crowded]] than it had been that morning. Karli decided that the hike was [[the memorable|one of the most memorable]] experiences of her summer.`,
            'The last sentence is comparing the hike against every other experience of the summer.'),
        ],
      },
      {
        id: 'ws_conj', title: 'Conjunctive Adverbs', standards: ['5.11D(v)'], skill: 'Joining two complete ideas, and punctuating the join',
        activities: [
          passage('Read the draft, then answer the questions. The sentences are numbered.',
            [
              'Professor Chen arrived at the marine research station before dawn to study unusual ocean samples.',
              'Several scientists assembled in the laboratory to observe the testing process.',
              'The team examined each sample carefully; meanwhile, observations were entered into a digital database.',
              'One sample contained traces of a rarely documented microorganism.',
              'At first, Professor Chen assumed the organism was already well known.',
              'However, further analysis revealed characteristics that differed from previously recorded species.',
              'Additional tests confirmed the unusual results.',
              'Consequently, the scientists determined that the organism might represent a new classification.',
              'The discovery provided important information about marine ecosystems.',
              'Furthermore, the findings created opportunities for future research.',
            ],
            [
              {
                kind: 'write', sentence: '1 and 2',
                ask: 'Combine sentences 1 and 2 into one sentence using a conjunctive adverb.',
                checks: [
                  need('Uses a conjunctive adverb', ANY(HAS('however'), HAS('therefore'), HAS('meanwhile'), HAS('consequently'), HAS('furthermore'), HAS('moreover'), HAS('in addition'), HAS('similarly'))),
                  need('Semicolon or period before it', RX('[;.]\\s*(however|therefore|meanwhile|consequently|furthermore|moreover|in addition|similarly)')),
                  need('Comma right after it', RX('(however|therefore|meanwhile|consequently|furthermore|moreover|in addition|similarly)\\s*,')),
                  need('Keeps both ideas', ALL(HAS('chen'), HAS('scientists'))),
                  need('Still one sentence', { type: 'maxSentences', n: 1 }),
                ],
                model: 'Professor Chen arrived at the marine research station before dawn to study unusual ocean samples; meanwhile, several scientists assembled in the laboratory to observe the testing process.',
              },
              {
                kind: 'write', sentence: '5 and 6',
                ask: 'Rewrite sentences 5 and 6 as one sentence using the conjunctive adverb "however".',
                checks: [
                  need('Uses however', HAS('however')),
                  need('Semicolon or period before it', RX('[;.]\\s*however')),
                  need('Comma right after it', RX('however\\s*,')),
                  need('Keeps both ideas', ALL(HAS('assumed'), HAS('analysis'))),
                  need('Still one sentence', { type: 'maxSentences', n: 1 }),
                ],
                model: 'At first, Professor Chen assumed the organism was already well known; however, further analysis revealed characteristics that differed from previously recorded species.',
              },
            ],
            'A conjunctive adverb joins two complete ideas: idea ; joining word , idea.'),
          compose('These two sentences are missing their punctuation. Rewrite each one correctly.', [
            {
              prompt: 'Rewrite this sentence correctly.',
              pieces: ['The volcano erupted unexpectedly therefore nearby residents evacuated the area.'],
              checks: [
                need('Keeps therefore', HAS('therefore')),
                need('Semicolon or period before therefore', RX('[;.]\\s*therefore')),
                need('Comma right after therefore', RX('therefore\\s*,')),
                need('Keeps both ideas', ALL(HAS('erupted'), HAS('evacuat'))),
                need('Still one sentence', { type: 'maxSentences', n: 1 }),
              ],
              model: 'The volcano erupted unexpectedly; therefore, nearby residents evacuated the area.',
            },
            {
              prompt: 'Rewrite this sentence correctly.',
              pieces: ['The library extended its hours consequently more students visited after school.'],
              checks: [
                need('Keeps consequently', HAS('consequently')),
                need('Semicolon or period before consequently', RX('[;.]\\s*consequently')),
                need('Comma right after consequently', RX('consequently\\s*,')),
                need('Keeps both ideas', ALL(HAS('hours'), HAS('students'))),
                need('Still one sentence', { type: 'maxSentences', n: 1 }),
              ],
              model: 'The library extended its hours; consequently, more students visited after school.',
            },
          ], 'Nothing is missing from the words. What is missing is the semicolon and the comma.'),
          passage('A second draft. Same job, numbered sentences.',
            [
              'Marcus organized a community science showcase at the local library.',
              'He spent several weeks coordinating volunteers, gathering materials, and preparing demonstrations.',
              'On the day of the event, dozens of families arrived to explore the exhibits.',
              'Consequently, the library became much busier than usual.',
              'One display featured a water filtration model that Marcus had designed.',
              'Visitors asked thoughtful questions about how the system removed impurities.',
              'He carefully explained the process to each group.',
              'Meanwhile, other volunteers guided guests through additional experiments.',
              'By the end of the afternoon, attendance had exceeded everyone’s expectations.',
              'Marcus felt encouraged because the event sparked interest in science throughout the community.',
            ],
            [
              {
                kind: 'blank', sentence: 7,
                ask: 'Which conjunctive adverb could be added to the beginning of sentence 7 to connect it logically with sentence 6?',
                answer: 'therefore', options: ['nevertheless', 'similarly', 'therefore'],
              },
              {
                kind: 'write', sentence: '7 and 8',
                ask: 'Rewrite sentences 7 and 8 as one sentence, joined by a conjunctive adverb.',
                checks: [
                  need('Uses a conjunctive adverb', ANY(HAS('meanwhile'), HAS('therefore'), HAS('however'), HAS('consequently'), HAS('furthermore'), HAS('moreover'), HAS('in addition'), HAS('similarly'))),
                  need('Semicolon or period before it', RX('[;.]\\s*(meanwhile|therefore|however|consequently|furthermore|moreover|in addition|similarly)')),
                  need('Comma right after it', RX('(meanwhile|therefore|however|consequently|furthermore|moreover|in addition|similarly)\\s*,')),
                  need('Keeps both ideas', ALL(HAS('explained'), HAS('volunteers'))),
                  need('Still one sentence', { type: 'maxSentences', n: 1 }),
                ],
                model: 'He carefully explained the process to each group; meanwhile, other volunteers guided guests through additional experiments.',
              },
              {
                kind: 'blank', sentence: '3 and 4',
                ask: 'Which is the correct way to combine sentences 3 and 4 into one sentence?',
                answer: 'consequently',
                options: ['however', 'consequently', 'similarly', 'meanwhile'],
              },
            ],
            'Read the sentence before and the sentence after. The joining word has to match what actually happens between them.'),
        ],
      },
      {
        id: 'ws_prep', title: 'Prepositions', standards: ['5.11D(vi)'], skill: 'The small words that place things, and the wrong ones that do not',
        activities: [
          passage('Read the draft. Each question names the sentence it is about.',
            [
              'Last month, Sofia joined a student team participating in a regional engineering competition.',
              'Throughout the preparation period, the team collaborated on designs, tested prototypes, and revised their plans after each trial.',
              'Sofia carried a notebook with detailed measurements, sketches, and observations.',
              'During the final week, the students worked beneath strict deadlines while refining the efficiency of their device.',
              'Before the competition began, Sofia carefully reviewed the data along the presentation materials to ensure everything was organized.',
            ],
            [
              { kind: 'pick', sentence: 4, ask: 'In sentence 4, click the preposition that does not fit, then write the one that does.', target: 'beneath', answer: 'under' },
              { kind: 'pick', sentence: 5, ask: 'In sentence 5, click the preposition that does not fit, then write the one that does.', target: 'along', answer: 'with' },
            ],
            'Read the sentence with the word in it and ask whether it really places anything.'),
          passage('A second draft, five sentences.',
            [
              'During a field study, researchers visited a coastal wetland to document changes in local wildlife populations.',
              'Throughout the morning, the team moved through observation areas filled with native plants and migratory birds.',
              'Each researcher recorded findings among a digital database while collecting samples from designated locations.',
              'Later that afternoon, the group met above a conference table to compare their results and discuss emerging patterns.',
              'Before departing, the researchers gathered between the visitor center to review safety procedures for future studies.',
            ],
            [
              { kind: 'pick', sentence: 4, ask: 'Click the prepositional error in sentence 4, then write the correction.', target: 'above', answer: 'around' },
              {
                kind: 'write', sentence: 4,
                ask: 'Now rewrite the whole of sentence 4 with the preposition fixed.',
                checks: [
                  need('Keeps the conference table', HAS('conference table')),
                  need('The wrong preposition is gone', { type: 'notContains', any: ['above'] }),
                  need('Places the group somewhere sensible', ANY(HAS('around'), HAS('at'), HAS('near'))),
                  need('Still one sentence', { type: 'maxSentences', n: 1 }),
                ],
                model: 'Later that afternoon, the group met around a conference table to compare their results and discuss emerging patterns.',
              },
            ],
            'Nobody meets above a table.'),
          passage('Xavier’s field journal. Ten sentences this time.',
            [
              'Last month, my environmental science class participated in a watershed research project along the Cedar River.',
              'Throughout the morning, our team collected water samples from several monitoring stations and recorded observations in detailed field journals.',
              'While examining the shoreline, I carefully walked among clusters of native vegetation to identify signs of erosion.',
              'A measuring device was suspended beneath a sturdy bridge with its sensors extending toward the riverbank.',
              'Nearby, my classmate Jordan placed equipment between a storage container while organizing samples for analysis.',
              'During the investigation, our instructor explained how scientists compare current conditions against historical data to evaluate environmental changes.',
              'I studied a series of charts and looked closely at the trends across multiple decades.',
              'Later that afternoon, the group gathered around a digital map that displayed locations where researchers had documented significant habitat restoration efforts.',
              'Before returning to school, we stored the equipment beside the transport vehicle and reviewed our findings.',
              'By the end of the project, I had gained a deeper understanding of how scientific data can influence conservation decisions.',
            ],
            [
              { kind: 'blank', sentence: 1, ask: 'Which word in sentence 1 is a preposition?', answer: 'along', options: ['participated', 'along', 'research', 'project'] },
              { kind: 'blank', sentence: 2, ask: 'Which word in sentence 2 is a preposition?', answer: 'from', options: ['collected', 'from', 'recorded', 'detailed'] },
              { kind: 'blank', sentence: 3, ask: 'Which word in sentence 3 is a preposition?', answer: 'among', options: ['examining', 'carefully', 'among', 'identify'] },
              { kind: 'pick', sentence: 5, ask: 'Click the preposition in sentence 5 that is wrong, then write the correction.', target: 'between', answer: 'inside' },
              {
                kind: 'write', sentence: 5,
                ask: 'Rewrite the whole of sentence 5 with the error corrected.',
                checks: [
                  need('Keeps Jordan and the container', ALL(HAS('jordan'), HAS('storage container'))),
                  need('The wrong preposition is gone', { type: 'notContains', any: ['between'] }),
                  need('Puts the equipment in the container', ANY(HAS('inside'), HAS('in a storage'), HAS('into'))),
                  need('Still one sentence', { type: 'maxSentences', n: 1 }),
                ],
                model: 'Nearby, my classmate Jordan placed equipment inside a storage container while organizing samples for analysis.',
              },
              {
                kind: 'blank', sentence: 9,
                ask: 'One other preposition in the journal should change. Which?',
                answer: 'In sentence 9, change beside to inside.',
                options: [
                  'In sentence 3, change among to beneath.',
                  'In sentence 4, change toward to between.',
                  'In sentence 6, change against to with.',
                  'In sentence 9, change beside to inside.',
                ],
              },
            ],
            'A preposition tells you where, when or how — so read what it claims and ask whether that could happen.'),
        ],
      },
      {
        id: 'ws_pron', title: 'Pronouns', standards: ['5.11D(vii)'], skill: 'Indefinite pronouns, and whether they are one or many',
        activities: [
          fix('Click the indefinite pronoun that replaces the words in capitals.', [], [
            { given: 'THE WHOLE ROOM stopped and stared at the zebra.  \u2192  ____ stopped and stared at the zebra.', answer: 'Everyone', options: ['Everyone', 'Anyone', 'Someone'] },
            { given: 'NO PEOPLE IN SIGHT were willing to feed the tigers.  \u2192  ____ was willing to feed the tigers.', answer: 'Nobody', options: ['Everybody', 'Several', 'Nobody'] },
            { given: '10 OUT OF 12 people on my tour were children.  \u2192  ____ of the people on my tour were children.', answer: 'Many', options: ['Many', 'No', 'Some'] },
            { given: 'THE WHOLE BUS of visitors were amazed by the exhibit.  \u2192  ____ of the visitors were amazed by the exhibit.', answer: 'All', options: ['All', 'Some', 'Most'] },
          ], 'Ask how many the capitals are talking about: one, none, some, or every one of them.', 'select'),
          fix('The paper asks you to colour the plural ones blue. Say which each answer is.', [], [
            { given: 'Everyone  \u2192  ____', answer: 'singular', options: ['singular', 'plural'] },
            { given: 'Nobody  \u2192  ____', answer: 'singular', options: ['singular', 'plural'] },
            { given: 'Many  \u2192  ____', answer: 'plural', options: ['singular', 'plural'] },
            { given: 'All  \u2192  ____', answer: 'plural', options: ['singular', 'plural'] },
          ], 'Try each one with "is" and then with "are". Only one of them sounds right.', 'select'),
          hunt('Three indefinite pronouns are the wrong ones. Find them.',
            `Last Thursday, the fifth-grade classes visited a regional environmental research center. Students examined exhibits about renewable energy, water conservation, and ecosystem restoration. [[Anything|Everyone]] listened attentively as a scientist explained how local habitats are protected. During a group investigation, [[nobody|everyone]] contributed observations about the data displays. Before leaving, [[everything|everyone]] completed the reflection activity in their notebooks.`,
            'Anything and everything are for things. These sentences are about people.'),
        ],
      },
    ],

    // Skill Builders: shorter, more scaffolded, and only ever seen after a miss.
    skillBuilders: {
      ws_verbs: {
        id: 'sb_verbs', title: 'SB: Irregular Verbs', standards: ['5.11D(ii)'], skill: 'Build it back up, one verb at a time',
        activities: [
          fix('Use the past tense of the verb that fits each sentence.', ['choose', 'win', 'know', 'think', 'draw'], [
            { given: 'Do you have the notes? Suzan and Jack ____ they had put them in their backpacks, but we can’t find them.', answer: 'thought' },
            { given: 'Did you see which shirt Zayne ____ to wear to the funny t-shirt competition?', answer: 'chose' },
            { given: 'After last season, everyone was surprised when the Tigers ____ this season’s finale.', answer: 'won' },
            { given: 'Have you seen Marc’s artwork? He ____ the most beautiful picture of the elm tree near the library.', answer: 'drew' },
            { given: 'I ____ you were going to Spain next month. Did you decide to stay home instead?', answer: 'knew' },
          ], 'Say the sentence out loud with "yesterday" in front of it.'),
          fix('Click the correct past tense of each word.', [], [
            { given: 'freeze  →  ____', answer: 'froze', options: ['freezed', 'frozed', 'froze'] },
            { given: 'fly  →  ____', answer: 'flew', options: ['flied', 'flew', 'flewed'] },
            { given: 'blow  →  ____', answer: 'blew', options: ['blowed', 'blewed', 'blew'] },
            { given: 'ring  →  ____', answer: 'rang', options: ['ranged', 'ringed', 'rang'] },
            { given: 'tell  →  ____', answer: 'told', options: ['told', 'telled', 'tolded'] },
            { given: 'speak  →  ____', answer: 'spoke', options: ['speaked', 'spoke', 'spoked'] },
          ], 'None of these just add -ed. If it looks like it does, it is the wrong one.', 'select'),
          hunt('Four verbs in this story are wrong. Find them.',
            `Yesterday, Liam and his friends played soccer at the park after school. The teams practiced for an hour before the game began. Liam [[goed|went]] to the goal to help his team defend the net. During the second half, his friend [[thinked|thought]] they would lose because the other team scored twice. However, Liam [[drawed|drew]] a clever play on the ground and helped his teammates work together. In the final minutes, their team [[winned|won]] the game with one last kick. Everyone cheered loudly and celebrated with cold orange popsicles before heading home.`,
            'Played, practiced and scored are all fine. Look for the ones that only sound like they add -ed.'),
        ],
      },
      ws_adj: {
        id: 'sb_adj', title: 'SB: Adjectives', standards: ['5.11D(iv)'], skill: 'Describing and comparing, step by step',
        activities: [
          fix('Use the correct form of each word to complete the sentence.', ['scary', 'beautiful', 'gigantic', 'busy'], [
            { given: 'Xavier’s haunted house drawing was the ____ project in the show.', answer: 'scariest' },
            { given: 'Norah’s mural was even ____ after she added the extra details.', answer: 'more beautiful' },
            { given: 'The supermarket became the ____ place during holiday sales.', answer: 'busiest' },
            { given: 'Jasmine’s photograph is the ____ one she has ever taken.', answer: 'most beautiful' },
            { given: 'Ezra’s schedule was ____ after he joined a new club.', answer: 'busier' },
            { given: 'The dinosaur model was the ____ display in the museum.', answer: 'most gigantic' },
          ], 'Comparing two things takes -er or "more". Comparing many takes -est or "most".'),
          hunt('Two describing words are in the wrong form.',
            `That was the [[funnest|most fun]] field trip of the year, and the bus ride home felt [[more short|shorter]] than the ride there.`,
            'One is a long word and one is short. They do not take the same ending.'),
        ],
      },
      ws_conj: {
        id: 'sb_conj', title: 'SB: Conjunctive Adverbs', standards: ['5.11D(v)'], skill: 'One join at a time, with the punctuation that goes with it',
        activities: [
          passage('Read the draft. The sentences are numbered.',
            [
              'Freya spotted a silver swan near the garden gate.',
              'The swan didn’t move away when she moved closer.',
              'Although Freya felt nervous, she followed the swan across the quiet yard.',
              'The swan stopped beside an old stone well and tapped one paw on the ground.',
              'Freya thought the surface was normal.',
              'She realized there was a tiny map shimmering across its surface.',
              'Strange symbols slowly appeared around the edge of the map.',
              'The symbols sparkled like stars in the night sky.',
              'The map showed a path to the hidden moon meadow; therefore, Freya knew the swan needed her help.',
            ],
            [
              { kind: 'blank', sentence: 9, ask: 'Which word in sentence 9 is the conjunctive adverb?', answer: 'therefore', options: ['her', 'showed', 'therefore', 'knew'] },
              {
                kind: 'write', sentence: '1 and 2',
                ask: 'Combine sentences 1 and 2 into one sentence using a conjunctive adverb.',
                checks: [
                  need('Uses a conjunctive adverb', ANY(HAS('however'), HAS('therefore'), HAS('meanwhile'), HAS('nevertheless'), HAS('furthermore'), HAS('in addition'), HAS('instead'))),
                  need('Semicolon or period before it', RX('[;.]\\s*(however|therefore|meanwhile|nevertheless|furthermore|in addition|instead)')),
                  need('Comma right after it', RX('(however|therefore|meanwhile|nevertheless|furthermore|in addition|instead)\\s*,')),
                  need('Keeps both ideas', ALL(HAS('swan'), HAS('closer'))),
                  need('Still one sentence', { type: 'maxSentences', n: 1 }),
                ],
                model: 'Freya spotted a silver swan near the garden gate; however, the swan didn’t move away when she moved closer.',
              },
              {
                kind: 'write', sentence: '5 and 6',
                ask: 'Rewrite sentences 5 and 6 as one sentence using the conjunctive adverb "however".',
                checks: [
                  need('Uses however', HAS('however')),
                  need('Semicolon or period before it', RX('[;.]\\s*however')),
                  need('Comma right after it', RX('however\\s*,')),
                  need('Keeps both ideas', ALL(HAS('normal'), HAS('map'))),
                  need('Still one sentence', { type: 'maxSentences', n: 1 }),
                ],
                model: 'Freya thought the surface was normal; however, she realized there was a tiny map shimmering across its surface.',
              },
            ],
            'The pattern never changes: idea ; joining word , idea.'),
          passage('A second draft, ten sentences.',
            [
              'Lena built a human-sized robot for the school fair.',
              'Many students gathered to see it move.',
              'She used recycled parts; consequently, the project cost very little.',
              'One feature let the robot sort colorful blocks.',
              'Classmates cheered and asked questions about its design.',
              'The battery started running low; nevertheless, Lena kept demonstrating it.',
              'She explained the final feature to visitors.',
              'The robot successfully completed one last task.',
              'Soon, the fair ended and everyone packed up.',
              'Lena felt proud because her invention inspired others.',
            ],
            [
              { kind: 'blank', sentence: 7, ask: 'Which conjunctive adverb could join sentence 7 to sentence 8?', answer: 'meanwhile', options: ['meanwhile', 'however', 'therefore'] },
              {
                kind: 'write', sentence: '7 and 8',
                ask: 'Rewrite sentences 7 and 8 as one sentence using the word you chose.',
                checks: [
                  need('Uses a conjunctive adverb', ANY(HAS('meanwhile'), HAS('however'), HAS('therefore'))),
                  need('Semicolon or period before it', RX('[;.]\\s*(meanwhile|however|therefore)')),
                  need('Comma right after it', RX('(meanwhile|however|therefore)\\s*,')),
                  need('Keeps both ideas', ALL(HAS('explained'), HAS('task'))),
                  need('Still one sentence', { type: 'maxSentences', n: 1 }),
                ],
                model: 'She explained the final feature to visitors; meanwhile, the robot successfully completed one last task.',
              },
              {
                kind: 'blank', sentence: '1 and 2',
                ask: 'Which is the correct way to join sentences 1 and 2?',
                answer: 'as a result',
                options: ['however', 'as a result', 'nevertheless'],
              },
            ],
            'Ask what the second idea is doing to the first: arguing with it, following from it, or happening alongside it.'),
        ],
      },
      ws_prep: {
        id: 'sb_prep', title: 'SB: Prepositions', standards: ['5.11D(vi)'], skill: 'In, on, at — and the rest',
        activities: [
          fix('Drag in, on, or at into each sentence.', ['in', 'on', 'at', 'in'], [
            { given: 'We meet ____ 3:00 every Tuesday.', answer: 'at' },
            { given: 'My birthday is ____ July.', answer: 'in' },
            { given: 'The test is ____ Friday.', answer: 'on' },
            { given: 'She sat ____ the front row.', answer: 'in' },
          ], 'At = a clock time. On = a day. In = a month or a space you are inside.', 'drag'),
        ],
      },
      ws_pron: {
        id: 'sb_pron', title: 'SB: Pronouns', standards: ['5.11D(vii)'], skill: 'Indefinite pronouns, one step at a time',
        activities: [
          fix('Click the indefinite pronoun that replaces the words in capitals.', [], [
            { given: 'THE WHOLE CLASS wanted to have a pizza party last week.  →  ____ wanted to have a pizza party last week.', answer: 'Everyone', options: ['Everyone', 'Anyone', 'Someone'] },
            { given: 'NO STUDENTS raised their hand to answer the question.  →  ____ raised a hand to answer the question.', answer: 'Nobody', options: ['Everybody', 'Several', 'Nobody'] },
            { given: '10 OUT OF 12 books on the shelf were about space.  →  ____ of the books on the shelf were about space.', answer: 'Many', options: ['Many', 'No', 'Some'] },
            { given: 'THE WHOLE BOX of the cookies disappeared by lunchtime.  →  ____ of the cookies disappeared by lunchtime.', answer: 'All', options: ['All', 'Some', 'Most'] },
          ], 'Someone is one person. Everyone is every person. Nobody is none of them.', 'select'),
          fix('The paper asks you to colour the plural ones blue. Say which each answer is.', [], [
            { given: 'Everyone  →  ____', answer: 'singular', options: ['singular', 'plural'] },
            { given: 'Nobody  →  ____', answer: 'singular', options: ['singular', 'plural'] },
            { given: 'Many  →  ____', answer: 'plural', options: ['singular', 'plural'] },
            { given: 'All  →  ____', answer: 'plural', options: ['singular', 'plural'] },
          ], 'Try each one with "is" and then with "are". Only one of them sounds right.', 'select'),
          fix('Follow the path by choosing the correct indefinite pronoun each time. The right path names the winner.', [], [
            { given: 'START: Amy and Jake were at the park with their class. ____ was excited to celebrate the last day of school.', answer: 'Everyone', options: ['Everyone', 'All', 'They'] },
            { given: '____ suggested the class hold a water fight.', answer: 'Someone', options: ['It', 'Someone', 'no one'] },
            { given: 'To win, Amy grabbed a bucket and poured it on ____ head.', answer: 'his', options: ['his', 'their', 'them'] },
            { given: 'Everyone agreed that ____ won the game.', answer: 'Amy', options: ['Amy', 'Jake', 'Sammy', 'Tyler'] },
          ], 'The verb tells you. "Everyone was" is right; "Everyone were" is not.', 'select'),
          hunt('Four indefinite pronouns are used incorrectly. Find them.',
            `Last Friday, the fifth-grade classes went on a field trip. The students explored exhibits about weather, space, and animals. [[Anyone|Everyone]] was excited when the guide showed them a robot that could solve math problems. Later, the classes visited the planetarium to watch a movie about the solar system. [[None|Everyone]] were taking notes because the information was important for their next science project. During lunch, [[each|everyone]] was sharing snacks and talking about their favorite exhibits. Before leaving, [[all|everyone]] was helping the teacher collect backpacks near the front doors.`,
            'Read each one with the verb that follows it and listen for the mismatch.'),
        ],
      },
    },

    full: {
      id: 'ws_full', title: 'Full Topic: Edit Drafts: Parts of Speech', standards: ['5.11D(ii)', '5.11D(iv)', '5.11D(v)', '5.11D(vi)', '5.11D(vii)'],
      skill: 'All five skills in one piece of writing',
      activities: [
        passage('Read the draft, then answer the questions about it. The sentences are numbered.',
          [
            'Our class goed to the state capitol last Friday.',
            'It was the bigger building I had ever walked into.',
            'Marcus and me stayed near the front of the group.',
            'Our guide met us in the top of the marble stairs.',
            'She talked for almost an hour.',
            'We understood the whole history by the end.',
            'On the bus home, I writed two pages about it in my notebook.',
          ],
          [
            { kind: 'pick', sentence: 1, ask: 'Click the irregular verb error in sentence 1, then write the correction.', target: 'goed', answer: 'went' },
            { kind: 'pick', sentence: 2, ask: 'Click the adjective error in sentence 2, then write the correction.', target: 'bigger', answer: 'biggest' },
            { kind: 'pick', sentence: 3, ask: 'Click the pronoun error in sentence 3, then write the correction.', target: 'me', answer: 'I' },
            { kind: 'blank', sentence: 4, ask: 'The word "in" in sentence 4 should be changed to which preposition?', answer: 'at', options: ['on', 'at', 'to'] },
            {
              kind: 'write', sentence: '5 and 6',
              ask: 'Combine sentences 5 and 6 into one sentence using a conjunctive adverb that shows RESULT.',
              checks: [
                need('Uses therefore or consequently', ANY(HAS('therefore'), HAS('consequently'))),
                need('Semicolon or period before it', RX('[;.]\\s*(therefore|consequently)')),
                need('Comma right after it', RX('(therefore|consequently)\\s*,')),
                need('Keeps both ideas', ALL(HAS('hour'), HAS('histor'))),
                need('Still one sentence', { type: 'maxSentences', n: 1 }),
              ],
              model: 'She talked for almost an hour; therefore, we understood the whole history by the end.',
            },
            { kind: 'pick', sentence: 7, ask: 'Click the irregular verb error in sentence 7, then write the correction.', target: 'writed', answer: 'wrote' },
          ],
          'Every question points at one numbered sentence — read that sentence again before you answer.'),
        fix('Finish each sentence with the right word.', ['knew', 'more careful', 'whom', 'during', 'meanwhile'], [
          { given: 'I ____ the answer before she finished asking.', answer: 'knew' },
          { given: 'This draft is ____ than my first one.', answer: 'more careful' },
          { given: 'To ____ did you give the permission slip?', answer: 'whom' },
          { given: 'Please stay seated ____ the assembly.', answer: 'during' },
          { given: 'I revised my ending. ____, my partner fixed the opening.', answer: 'meanwhile' },
        ], 'Each one comes from a different skill on this path.'),
      ],
    },
  },
]

/* Parse [[wrong|right]] into tokens the client renders and taps. */
export function parseHunt(text) {
  const parts = (text || '').split(/(\[\[[^\]]+\]\])/g)
  const tokens = []
  let errors = 0
  for (const part of parts) {
    const m = part.match(/^\[\[([^|]+)\|([^\]]+)\]\]$/)
    if (m) { tokens.push({ t: m[1], bad: true, fix: m[2], i: errors }); errors++ }
    else if (part) tokens.push({ t: part })
  }
  return { tokens, errorCount: errors }
}

/* A worksheet with its activities ready to play, and its point total. */
export function prepare(ws) {
  const activities = ws.activities.map((a) =>
    a.kind === 'hunt' ? { ...a, ...parseHunt(a.text), text: undefined } : { ...a })
  const points = activities.reduce((n, a) =>
    n + (a.kind === 'hunt' ? a.errorCount
      : a.kind === 'maze' ? Object.keys(a.gates).length
      : a.kind === 'passage' ? a.questions.length
      : a.items.length), 0)
  return { ...ws, activities, points }
}

/* Turn an authored topic — seeded here or edited by a publisher — into the
 * playable shape. Pure, so the client can run it on whatever the API returns. */
export function prepareTopic(t) {
  if (!t) return null
  return {
    ...t,
    core: (t.core || []).map(prepare),
    skillBuilders: Object.fromEntries(Object.entries(t.skillBuilders || {}).map(([k, v]) => [k, prepare(v)])),
    full: t.full ? prepare(t.full) : null,
  }
}

export function topicFor(id) {
  return prepareTopic(TOPICS.find((x) => x.id === id) || TOPICS[0])
}

/* The publisher's view: what a topic looks like before it is prepared. */
export const rawTopics = () => JSON.parse(JSON.stringify(TOPICS))

export const topicList = () => TOPICS.map((t) => ({
  id: t.id, title: t.title, short: t.short, grade: t.grade, standards: t.standards,
  state: t.state, domain: t.domain,
  blurb: t.blurb, icon: t.icon, stops: t.core.length + 1,
}))
