// Initial demo data. Mirrors the live LoneStar roster style (Dallas Mavs Elementary).
// Kayla (the "me" student) has a spread of assignments in different states so the
// sort/filter controls on My Writing are demonstrable.

const T = {
  dirk: { name: 'Dirk Nowitski', initials: 'DN' },
  jeremy: { name: 'Jeremy Verret', initials: 'JV' },
  dak: { name: 'Dak Prescott', initials: 'DP' },
}

export function seedState() {
  const assignments = [
    { id: 'asg_recess', title: 'Should recess be longer?', genre: 'argument', type: 'Argument', format: 'ECR', questions: 1, gradeLevel: 6,
      teacher: T.dirk, dateAssigned: '2026-06-26', dueDate: '2026-07-04', scopeStage: 'multi-paragraph',
      prompt: 'Some people think the school day should include more recess time. Write an argument telling your principal whether recess should be longer. Support your opinion with clear reasons.' },
    { id: 'asg_fridge', title: 'How Refrigerators Changed Our Food', genre: 'argument', type: 'Argument', format: 'ECR', questions: 1, gradeLevel: 6,
      teacher: T.jeremy, dateAssigned: '2026-06-28', dueDate: '2026-07-03', scopeStage: 'multi-paragraph',
      prompt: 'Was the refrigerator one of the most important inventions ever? Write an argument that takes a side and backs it up with reasons.' },
    { id: 'asg_robot', title: 'The Robot in the Garden', genre: 'narrative', type: 'Narrative', format: 'SCR', questions: 3, gradeLevel: 6,
      teacher: T.jeremy, dateAssigned: '2026-06-29', dueDate: '2026-07-09', scopeStage: 'paragraph',
      prompt: 'A robot wakes up in a garden for the first time. Write a story about what happens next.' },
    { id: 'asg_desert', title: 'How People Live in the Desert', genre: 'informational', type: 'Informational', format: 'ECR', questions: 1, gradeLevel: 6,
      teacher: T.dirk, dateAssigned: '2026-06-30', dueDate: '2026-07-14', scopeStage: 'multi-paragraph',
      prompt: 'Explain how people adapt to live in a desert. Use clear reasons and details to inform your reader.' },
    { id: 'asg_1776', title: 'The Brave Little Girl of 1776', genre: 'narrative', type: 'Narrative', format: 'SCR', questions: 2, gradeLevel: 6,
      teacher: T.dak, dateAssigned: '2026-06-27', dueDate: '2026-07-06', scopeStage: 'paragraph',
      prompt: 'Imagine you lived during the American Revolution. Write a story about one brave day.' },
    { id: 'asg_kindness', title: 'The Power of Kindness', genre: 'informational', type: 'Informational', format: 'SCR', questions: 1, gradeLevel: 6,
      teacher: T.jeremy, dateAssigned: '2026-06-15', dueDate: '2026-06-25', scopeStage: 'paragraph',
      prompt: 'Explain why kindness matters in a classroom. Support your explanation with examples.' },
  ]

  const students = [
    { id: 'stu_kscott', name: 'Kayla Scott', initials: 'KS', avatar: '🦊', coins: 1050, gradeLevel: 6,
      goal: { id: 'g_ideas', trait: 'ideas', text: 'Back up my opinion with strong, specific reasons', setOn: '2026-06-20' },
      goalHistory: [
        { trait: 'organization', text: 'Write a real conclusion instead of just stopping', achievedOn: '2026-05-28' },
        { trait: 'conventions', text: 'Start every sentence with a capital letter', achievedOn: '2026-04-15' },
      ],
      shoutOut: { from: 'Mr. Nowitski', initials: 'DN', date: '2026-06-30',
        text: 'Kayla — your recess argument blew me away. Taking on the other side is exactly what strong writers do. So proud of your growth!' } },
    { id: 'stu_anicole', name: 'Ava Nicole', gradeLevel: 6, initials: 'AN', avatar: '🌻', coins: 2700, goal: null, goalHistory: [] },
    { id: 'stu_knelson', name: 'Kai Nelson', gradeLevel: 6, initials: 'KN', avatar: '🐯', coins: 2275, goal: null, goalHistory: [] },
    { id: 'stu_jdennis', name: 'Jordan Dennis', gradeLevel: 6, initials: 'JD', avatar: '🐲', coins: 2275, goal: null, goalHistory: [] },
    { id: 'stu_kle', name: 'Kim Le', gradeLevel: 6, initials: 'KL', avatar: '🦔', coins: 1250, goal: null, goalHistory: [] },
  ]

  const teacher = { id: 'tch_dirk', name: 'Dirk Nowitski', school: 'Dallas Mavs Elementary' }

  // ---- recess submission: in progress, two drafts + real conference ----
  const draft1 = {
    id: 'drf_1', n: 1, createdAt: '2026-06-28T14:02:00.000Z',
    content: 'I think recess should be longer. Recess is good. We get to play and it is fun. Kids like recess a lot. So recess should be longer.',
    conference: [],
    traits: { source: 'seed', headline: 'Your biggest next step is turning "recess is good" into real reasons that prove it.',
      traits: [
        { key: 'ideas', level: 1, strength: 'You clearly state your opinion.', next_step: 'Give a real reason WHY longer recess helps — not just that it is fun.' },
        { key: 'organization', level: 2, strength: 'You start and end with your opinion.', next_step: 'Put each reason in its own sentence so they stand out.' },
        { key: 'voice', level: 2, strength: 'Your opinion is easy to hear.', next_step: 'Talk straight to your principal — you are writing to a real reader.' },
        { key: 'word_choice', level: 1, strength: 'Your words are simple and clear.', next_step: 'Replace "good" and "fun" with more exact words.' },
        { key: 'sentence_fluency', level: 2, strength: 'Your sentences are complete.', next_step: 'Combine two short sentences so it reads more smoothly.' },
        { key: 'conventions', level: 3, strength: 'Capitals and periods are correct.', next_step: 'Keep it up — check any new sentences you add.' },
      ] },
  }
  const draft2 = {
    id: 'drf_2', n: 2, createdAt: '2026-06-30T15:20:00.000Z',
    content: 'Dear Principal Ramirez, I believe recess should be longer, and here is why. First, kids concentrate better after they move their bodies. When my class comes back from recess, we are calmer and we finish our math faster. Second, recess is where we learn to solve problems with each other without a teacher stepping in. Some people say a longer recess wastes learning time. But if students learn more when they return, then recess IS learning time. For these reasons, I hope you will make recess longer.',
    conference: [
      { role: 'assistant', text: "You clearly told your principal what you want — that's a strong start! Right now your biggest reason is that recess is \"fun.\" What is something that gets BETTER for students when they've had recess? Think about what you're like when you come back inside.", ts: '2026-06-29T14:05:00.000Z', source: 'seed', redirect: false },
      { role: 'user', text: 'we are more calm and we do better on our work after', ts: '2026-06-29T14:07:00.000Z' },
      { role: 'assistant', text: "Yes! That's a real reason a principal cares about — learning. Can you picture one specific moment that proves it? Like what your class is like right after coming in from recess?", ts: '2026-06-29T14:08:00.000Z', source: 'seed', redirect: false },
      { role: 'user', text: 'can you just write the sentence for me', ts: '2026-06-29T14:09:00.000Z' },
      { role: 'assistant', text: "I could, but then it'd be my sentence, not yours — and your principal wants to hear YOU. You already said it out loud: calmer, better work. Say that again but add what class it happens in. What do you and your classmates actually do better?", ts: '2026-06-29T14:10:00.000Z', source: 'seed', redirect: true },
      { role: 'user', text: 'we finish our math faster and we are not so wiggly', ts: '2026-06-29T14:11:00.000Z' },
      { role: 'assistant', text: "That's your evidence right there — put it in your draft! One more thing to make it powerful: what might someone who DISagrees say, and how would you answer them? Arguments get strong when they take on the other side.", ts: '2026-06-29T14:12:00.000Z', source: 'seed', redirect: false },
    ],
    traits: { source: 'seed', headline: 'Huge growth — you now have reasons AND a counter-argument. Next: sharpen your evidence with a number or detail.',
      traits: [
        { key: 'ideas', level: 3, strength: 'You give two real reasons and answer a counter-argument.', next_step: 'Add one specific detail or number to make your evidence even stronger.' },
        { key: 'organization', level: 3, strength: 'You use First and Second, and you have a real conclusion.', next_step: 'Give your counter-argument its own spot so it stands out.' },
        { key: 'voice', level: 4, strength: 'You speak directly to Principal Ramirez — confident and real.', next_step: 'Keep that voice; it is working.' },
        { key: 'word_choice', level: 3, strength: 'Words like "concentrate" and "solve problems" are precise.', next_step: 'Find one more spot to swap a plain word for an exact one.' },
        { key: 'sentence_fluency', level: 3, strength: 'Your sentences vary in length and flow well.', next_step: 'Read aloud to catch any that run on.' },
        { key: 'conventions', level: 4, strength: 'Punctuation and capitals are strong throughout.', next_step: 'Proofread new additions.' },
      ] },
  }

  // ---- kindness submission: completed ----
  const kDraft1 = { id: 'drf_k1', n: 1, createdAt: '2026-06-18T13:00:00.000Z',
    content: 'Kindness is important in a classroom. It makes people happy. When you are kind everyone feels good.', conference: [], traits: null }
  const kDraft2 = { id: 'drf_k2', n: 2, createdAt: '2026-06-24T13:00:00.000Z',
    content: 'Kindness matters in a classroom because it helps everyone learn. First, when students are kind, no one is afraid to ask questions or make mistakes. For example, when my friend got an answer wrong, no one laughed, so she kept trying. Second, kindness saves time because we help each other instead of arguing. A kind classroom is a place where everyone can do their best work.',
    conference: [
      { role: 'assistant', text: "Nice — you named that kindness helps people feel good. Can you think of a time in class when kindness actually changed what happened? A real example makes your point strong.", ts: '2026-06-20T13:02:00.000Z', source: 'seed', redirect: false },
      { role: 'user', text: 'when my friend got an answer wrong nobody laughed and she kept trying', ts: '2026-06-20T13:04:00.000Z' },
      { role: 'assistant', text: "That's a perfect example — it shows kindness helping someone learn. How could you connect that to why kindness matters for the WHOLE class?", ts: '2026-06-20T13:05:00.000Z', source: 'seed', redirect: false },
    ],
    traits: { source: 'seed', headline: 'Strong finish — a clear point with a real example. Try one more concrete detail next time.',
      traits: [
        { key: 'ideas', level: 3, strength: 'Clear reasons with a real example.', next_step: 'Add one more example to go even deeper.' },
        { key: 'organization', level: 3, strength: 'First/Second structure with a conclusion.', next_step: 'Add a transition into your example.' },
        { key: 'voice', level: 3, strength: 'Sounds like you care about the topic.', next_step: 'Keep that warmth.' },
        { key: 'word_choice', level: 3, strength: 'Clear, purposeful words.', next_step: 'Try one vivid word to paint the scene.' },
        { key: 'sentence_fluency', level: 3, strength: 'Sentences flow well.', next_step: 'Vary a couple of sentence beginnings.' },
        { key: 'conventions', level: 4, strength: 'Clean conventions.', next_step: 'Great proofreading.' },
      ] },
  }

  // ---- seeded free write: drafted, revised, published (Writing Bank demo) ----
  const fwAsg = { id: 'asg_fw1', title: 'The Door in the Fog', genre: 'free', type: 'Free Write', format: null, questions: 1, gradeLevel: 6,
    teacher: { name: 'Self-started', initials: '✍️' }, dateAssigned: '2026-07-06', dueDate: null, scopeStage: 'sentence',
    prompt: 'Free write! Write about anything on your mind — a story, an idea, a rant, a memory.' }
  assignments.push(fwAsg)
  const fwSub = { id: 'sub_kscott_fw1', studentId: 'stu_kscott', assignmentId: 'asg_fw1', completedAt: '2026-07-07T16:00:00.000Z', published: true,
    drafts: [
      { id: 'drf_fw1', n: 1, createdAt: '2026-07-06T15:00:00.000Z', conference: [], traits: null,
        content: 'There was a door in the fog. I went in it. It was weird inside. There was a garden.' },
      { id: 'drf_fw2', n: 2, createdAt: '2026-07-07T15:40:00.000Z', conference: [], traits: null,
        content: 'The fog rolled in at exactly noon, and with it came the door. It stood alone in the middle of the soccer field, tall and green, with a brass handle shaped like a fox. I knew I should get a teacher. Instead, I turned the handle. On the other side was a garden where the flowers hummed — actually hummed — and a path of white stones led toward a light I could not explain. I stepped through, and the door clicked shut behind me.' },
    ],
    milestones: [{ id: 'ms_fw1', type: 'published_piece', label: 'Published a finished piece', coins: 15, ts: '2026-07-07T16:00:00.000Z' }] }

  const submissions = [
    { id: 'sub_kscott_recess', studentId: 'stu_kscott', assignmentId: 'asg_recess', drafts: [draft1, draft2], completedAt: null,
      milestones: [
        { id: 'ms_1', type: 'first_revision', label: 'Revised after conferring', coins: 25, ts: '2026-06-30T15:21:00.000Z' },
        { id: 'ms_2', type: 'trait_growth', label: 'Ideas grew Emerging → Proficient', coins: 40, ts: '2026-06-30T15:21:30.000Z' },
        { id: 'ms_3', type: 'held_the_pen', label: 'Kept the pen when asked to be given the answer', coins: 15, ts: '2026-06-30T15:22:00.000Z' },
      ] },
    { id: 'sub_kscott_kindness', studentId: 'stu_kscott', assignmentId: 'asg_kindness', drafts: [kDraft1, kDraft2], completedAt: '2026-06-24T13:30:00.000Z',
      milestones: [ { id: 'ms_k1', type: 'first_revision', label: 'Revised after conferring', coins: 25, ts: '2026-06-24T13:20:00.000Z' } ] },
    fwSub,
  ]

  return {
    teacher, students, assignments, submissions,
    // Share Wall — finished pieces students chose to publish (classmates' to start).
    shareWall: [
      { id: 'sw_ava', submissionId: null, studentId: 'stu_anicole', studentName: 'Ava Nicole', avatar: '🌻', title: 'Why Dogs Are the Best Pets', genre: 'Argument',
        excerpt: 'Dogs are the best pets because they are loyal, active, and they help you feel less lonely. When I come home sad, my dog Biscuit always knows.', sharedOn: '2026-06-22', kudos: 19 },
      { id: 'sw_kai', submissionId: null, studentId: 'stu_knelson', studentName: 'Kai Nelson', avatar: '🐯', title: 'The Cave Adventure', genre: 'Narrative',
        excerpt: 'The flashlight flickered as we stepped into the cave. My heart pounded like a drum. Then, in the dark, something moved.', sharedOn: '2026-06-19', kudos: 24 },
      { id: 'sw_jordan', submissionId: null, studentId: 'stu_jdennis', studentName: 'Jordan Dennis', avatar: '🐲', title: 'How Volcanoes Erupt', genre: 'Informational',
        excerpt: 'A volcano erupts when hot melted rock called magma pushes up through cracks in the earth. The pressure builds until it finally bursts out.', sharedOn: '2026-06-17', kudos: 15 },
    ],
    // Monthly averages across the 2025–26 school year, split by format (out of 4).
    monthlyProgress: {
      year: '2025–26',
      months: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      scr: [2.2, 2.4, 2.3, 2.6, 2.7, 2.9, 3.0, 3.1, 3.3, 3.4],
      ecr: [1.8, 2.0, 2.1, 2.2, 2.4, 2.5, 2.6, 2.8, 2.9, 3.0],
    },
    // Fluency game registry — mirrors a games.json manifest in the games repo,
    // so new games published by grade level appear here automatically.
    fluencyGames: [
      { id: 'fg_stretch', title: 'Sentence Stretch', icon: '✨', skill: 'Sentence Fluency', grades: '2–8', kind: 'builtin', game: 'stretch' },
      { id: 'fg_combine', title: 'Combine It!', icon: '🔗', skill: 'Sentence Combining', grades: '3–8', kind: 'builtin', game: 'combine' },
      { id: 'fg_transitions', title: 'Transition Bridge', icon: '🌉', skill: 'Transitions', grades: '3–8', kind: 'builtin', game: 'transitions' },
      { id: 'fg_fragments', title: 'Fragment Fixer', icon: '🧩', skill: 'Complete Sentences', grades: '2–6', kind: 'builtin', game: 'fragments' },
      { id: 'fg_wordswap', title: 'Word Upgrade', icon: '💎', skill: 'Word Choice', grades: '3–8', kind: 'builtin', game: 'wordswap' },
      { id: 'fg_punct', title: 'Punctuation Quest', icon: '🐉', skill: 'Conventions', grades: '3–5', kind: 'external', url: 'https://kennadyscott.github.io/punctuation-quest/' },
    ],
    // Teacher-configured settings (from the teacher's system).
    settings: { quickWriteSeconds: 180, quickWriteSetBy: 'Mr. Nowitski' },
    // Quick Write — static prompt bank (title + prompt, like the live product).
    quickPrompts: [
      { title: 'Robot at School', prompt: 'A robot joins your class. What happens during the day?', hint: 'What could go wonderfully right — or hilariously wrong?' },
      { title: 'The New Rule', prompt: 'If you could add one new rule to your school, what would it be and why?', hint: 'How your rule would help students, teachers, or the whole school.' },
      { title: 'Best Season', prompt: 'What is the best season of the year? Make your case.', hint: 'Pick two or three reasons and back each one with a detail.' },
      { title: 'Phones in Class', prompt: 'Should kids be allowed to have phones at school? Take a side.', hint: 'What would the other side say — and how would you answer them?' },
      { title: 'The Secret Door', prompt: 'You find a door in the library that was never there before. What happens next?', hint: 'Use your five senses to pull the reader through the door with you.' },
      { title: 'Homework Debate', prompt: 'Should homework be optional? Argue your opinion.', hint: 'Think about who homework helps, who it stresses, and what evidence you have.' },
    ],
    // ClearSheets — assigned worksheets (companion product).
    clearSheets: [
      { id: 'cs1', title: 'Context Clues Practice', subject: 'ELA', due: '2026-07-08', status: 'todo' },
      { id: 'cs2', title: 'Central Idea Check-In', subject: 'ELA', due: '2026-07-11', status: 'todo' },
      { id: 'cs3', title: 'Water Cycle Vocabulary', subject: 'Science', due: null, status: 'done' },
    ],
    // Crystal Quest — independent learning paths (crystals = milestones).
    crystalQuests: [
      { id: 'cq1', title: 'Master the Counter-Argument', area: 'Argument Writing', progress: 0.5, crystals: '3 of 6 crystals' },
      { id: 'cq2', title: 'Vivid Verbs Adventure', area: 'Word Choice', progress: 0.2, crystals: '1 of 5 crystals' },
    ],
    // Home-page growth summary (percent scores, goal, streak, badges).
    growthSummary: {
      currentAverage: 82,
      weeklyDelta: 6,
      goalPercent: 85,
      streakDays: 7,
      lastStreakDate: null, // set when an activity feeds the streak (once/day)
      badges: 12,
      scoreOverTime: [
        { label: 'Apr 14', pct: 68 },
        { label: 'Apr 28', pct: 72 },
        { label: 'May 12', pct: 76 },
        { label: 'May 26', pct: 79 },
        { label: 'Jun 9', pct: 82 },
      ],
    },
    // Luna's Writing Nook — the six real modules from the live product.
    // What the whole class is working on right now — set by the teacher, shown
    // beside each student's own goal.
    classFocus: {
      text: 'Back every answer with evidence from the text',
      note: 'RACE · Cite the Evidence',
      setBy: 'Mr. Nowitski',
    },
    modules: [
      { id: 'm1', label: 'Short Constructed Response', status: 'in_progress', progress: 0.67 },
      { id: 'm2', label: 'Extended Constructed Response', status: 'not_started', progress: 0 },
      { id: 'm3', label: 'Stellar Writers', status: 'not_started', progress: 0 },
      { id: 'm4', label: 'The Writing Process', status: 'not_started', progress: 0 },
      { id: 'm5', label: 'Revision', status: 'not_started', progress: 0 },
      { id: 'm6', label: 'Editing', status: 'not_started', progress: 0 },
    ],
    // Rubric-level writing data per subject (mirrors the live product's student
    // data view). SCR strategy differs by subject: ELA/Social Studies = RACE,
    // Science = CER (Claim/Evidence/Reasoning). ECR = STAAR-style domains.
    writingData: {
      subjects: ['ELA', 'Science', 'Social Studies'],
      ELA: {
        scr: [
          { k: 'R', label: 'Restate', pct: 100, n: 2 },
          { k: 'A', label: 'Answer', pct: 100, n: 2 },
          { k: 'C', label: 'Cite', pct: 50, n: 1 },
          { k: 'E', label: 'Explain', pct: 50, n: 1 },
        ],
        ecrOrg: [
          { label: 'Central Idea/Claim', pct: 75 },
          { label: 'Organization', pct: 60 },
          { label: 'Evidence', pct: 50 },
          { label: 'Expression of Ideas', pct: 65 },
        ],
        ecrConv: [
          { label: 'Sentence Structure', pct: 80 },
          { label: 'Punctuation', pct: 70 },
          { label: 'Capitalization', pct: 90 },
          { label: 'Grammar', pct: 75 },
          { label: 'Spelling', pct: 85 },
        ],
      },
      Science: {
        scr: [
          { k: 'C', label: 'Claim', pct: 75, n: 2 },
          { k: 'E', label: 'Evidence', pct: 25, n: 1 },
          { k: 'R', label: 'Reasoning', pct: 50, n: 1 },
        ],
        ecrOrg: [
          { label: 'Central Idea/Claim', pct: 0 },
          { label: 'Organization', pct: 0 },
          { label: 'Evidence', pct: 0 },
          { label: 'Expression of Ideas', pct: 0 },
        ],
        ecrConv: [
          { label: 'Sentence Structure', pct: 0 },
          { label: 'Punctuation', pct: 0 },
          { label: 'Capitalization', pct: 0 },
          { label: 'Grammar', pct: 0 },
          { label: 'Spelling', pct: 0 },
        ],
      },
      'Social Studies': {
        scr: [
          { k: 'R', label: 'Restate', pct: 0, n: 0 },
          { k: 'A', label: 'Answer', pct: 0, n: 0 },
          { k: 'C', label: 'Cite', pct: 0, n: 0 },
          { k: 'E', label: 'Explain', pct: 0, n: 0 },
        ],
        ecrOrg: [
          { label: 'Central Idea/Claim', pct: 0 },
          { label: 'Organization', pct: 0 },
          { label: 'Evidence', pct: 0 },
          { label: 'Expression of Ideas', pct: 0 },
        ],
        ecrConv: [
          { label: 'Sentence Structure', pct: 0 },
          { label: 'Punctuation', pct: 0 },
          { label: 'Capitalization', pct: 0 },
          { label: 'Grammar', pct: 0 },
          { label: 'Spelling', pct: 0 },
        ],
      },
    },
    coinEvents: submissions.flatMap((sub) => sub.milestones.map((m) => ({
      id: 'ce_' + m.id, studentId: sub.studentId, submissionId: sub.id, type: m.type, coins: m.coins, ts: m.ts,
    }))),
  }
}
