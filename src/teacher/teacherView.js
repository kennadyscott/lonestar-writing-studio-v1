// The LoneStar CR teacher side (Kennady, October 21, 2026: "build what the teacher side of this experience is going to
// look like ... keep the side rail and the login/account info at the top"). A prototype on sample class data: Grade 2,
// Author's Purpose (2.10A), following the student path in src/lib/studentPathway.mjs (pre-test, lessons, checkpoints with
// a Skill Builder detour under 85%, post-test). It draws into a shadow root so its styles and the student app's never mix.
/* eslint-disable */
let R = null
let BASE = '/', CLASSCADE = ''
const SHELL = `<div class="app" id="app">
  <nav class="rail" aria-label="Teacher">
    <img class="logo" src="__LOGO__" alt="LoneStar CR">
    <div id="nav"></div>
    <p class="note">Prototype · sample class data</p>
  </nav>
  <div class="main">
    <header class="top">
      <button class="icon-btn" id="menu" aria-label="Show or hide the menu"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0b4a5e" stroke-width="2" stroke-linecap="round"><path d="M3 5h14M3 10h14M3 15h14"/></svg></button>
      <div class="grow"></div>
      <button class="icon-btn" aria-label="Notifications" data-act="toast" data-msg="3 new: L Houser missed Checkpoint 1 again, 2 ECRs submitted"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1b2a35" stroke-width="1.8"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg></button>
      <div class="acct">
        <button class="row acct-btn" id="acct-btn" data-acct="toggle" aria-haspopup="menu" aria-expanded="false" aria-controls="acct-menu">
          <div class="av">S</div>
          <div class="who-txt"><div class="nm">Kennady Scott</div><div class="rl">Teacher</div></div>
          <span style="flex:1"></span>
          <span class="swap" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h15l-4-4M20 14H5l4 4"/></svg></span>
        </button>
        <div class="acct-menu" id="acct-menu" role="menu" hidden>
          <div class="acct-k">Switch account</div>
          <button role="menuitem" class="acct-it on" data-acct="teacher" aria-current="true"><span class="av sm">S</span><span><b>Kennady Scott</b><small>Teacher · Dallas Mavs Elementary</small></span><span class="tick">✓</span></button>
          <button role="menuitem" class="acct-it" data-acct="student"><span class="av sm stu">KS</span><span><b>__STUDENT__</b><small>Student view</small></span></button>
        </div>
        <div class="school"><span>Dallas Mavs Elementary</span><svg width="22" height="18" viewBox="0 0 24 20" fill="none" stroke="#1b2a35" stroke-width="2" stroke-linecap="round"><path d="M4 6h15l-4-4M20 14H5l4 4"/></svg></div>
      </div>
    </header>
    <main class="page" id="page"></main>
  </div>
</div>
<div id="layer"></div>`
/* ---------- sample data: Grade 2, Author's Purpose (2.10A) ---------- */
const PASS = 85
const STEPS = [
  { id:'pre',  kind:'test',   label:'Pre-test',     ty:'Test' },
  { id:'l1',   kind:'lesson', label:'Lesson 1',     ty:'Lesson', sub:"Author's purpose" },
  { id:'c1',   kind:'check',  label:'Checkpoint 1', ty:'Practice', sb:'Skill Builder 1' },
  { id:'l2',   kind:'lesson', label:'Lesson 2',     ty:'Lesson', sub:"Explain author's purpose" },
  { id:'c2',   kind:'check',  label:'Checkpoint 2', ty:'Practice', sb:'Skill Builder 2' },
  { id:'full', kind:'check',  label:'Full Topic',   ty:'Practice' },
  { id:'post', kind:'test',   label:'Post-test',    ty:'Test' },
]
const COLORS = ['#0f6e8c','#7b2366','#45399c','#a8650f','#22804f','#bf3a26','#1d3fa3','#5b6f7d','#0b4a5e','#8a3fb5','#2a7f86','#b0477b','#3f6b20']
const STUDENTS = [
  { id:'ahayes', name:'A Hayes',  last:0, mins:62, lang:'Level 2', coins:340, pre:40, l1:true, c1:{tries:[55,60], sb:{lesson:true, tries:[90]}}, miss:{c1:'p3'} },
  { id:'ebenton', name:'E Benton', last:0, mins:48, coins:510, pre:60, l1:true, c1:{tries:[90]}, l2:true, c2:{tries:[88]}, full:{tries:[92]}, post:95 },
  { id:'emontagne', name:'E Montagne', last:1, mins:41, lang:'Level 3', coins:220, pre:50, l1:true, c1:{tries:[70], sb:{lesson:true, tries:[]}}, miss:{c1:'p3'} },
  { id:'hscott', name:'H Scott', last:0, mins:39, coins:415, pre:80, l1:true, c1:{tries:[100]}, l2:true, c2:{tries:[80], sb:{lesson:false, tries:[]}}, miss:{c2:'q2'} },
  { id:'hscott2', name:'H Scott2', last:6, mins:6, coins:90, pre:30, l1:false },
  { id:'kscott', name:'K Scott', last:0, mins:55, coins:600, pre:70, l1:true, c1:{tries:[95]}, l2:true, c2:{tries:[90]}, full:{tries:[85]} },
  { id:'kscott2', name:'K Scott2', last:2, mins:24, coins:260, pre:75, l1:true, c1:{tries:[95]}, l2:false },
  { id:'kmcknight', name:'K McKnight', last:1, mins:37, coins:720, pre:90, l1:true, c1:{tries:[100]}, l2:true, c2:{tries:[95]}, full:{tries:[100]}, post:100 },
  { id:'lhouser', name:'L Houser', last:0, mins:71, lang:'Level 1', coins:180, pre:45, l1:true, c1:{tries:[65,70], sb:{lesson:true, tries:[60,70]}}, miss:{c1:'p3'} },
  { id:'mwood', name:'M Wood', last:1, mins:30, coins:300, pre:55, l1:true, c1:{tries:[85]}, l2:false },
  { id:'rgardner', name:'R Gardner', last:0, mins:58, coins:455, pre:65, l1:true, c1:{tries:[90]}, l2:true, c2:{tries:[75,90], sb:{lesson:true, tries:[88]}} },
  { id:'scaffey', name:'S Caffey', last:null, mins:0, coins:0 },
  { id:'vhinton', name:'V Hinton', last:1, mins:52, lang:'Level 2', coins:275, pre:35, l1:true, c1:{tries:[80,95], sb:{lesson:true, tries:[85]}}, l2:true },
].map((s, i) => ({ ...s, color: COLORS[i % COLORS.length], init: s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() }))

// Checkpoint 1 is the Benny drag-and-drop: match each paragraph to its purpose. First tries only.
const ITEMS = {
  pre: { title:'Pre-test', n:13, insight:"Most of the class could spot a story. Telling <b>inform</b> from <b>persuade</b> was the gap going in.", qs:[
    { q:'"Ten Facts About Frogs" — why did the author write it?', right:'Inform', pct:75, wrongs:[['Entertain',2],['Persuade',1]] },
    { q:'"Max and the Missing Mitten" — why did the author write it?', right:'Entertain', pct:92, wrongs:[['Inform',1]] },
    { q:'"Every class should get a pet fish" — why did the author write it?', right:'Persuade', pct:50, wrongs:[['Inform',5],['Entertain',1]] },
    { q:'"Brush your teeth twice a day! Your smile will thank you." — why did the author write it?', right:'Persuade', pct:42, wrongs:[['Inform',6],['Entertain',1]] },
    { q:'Which words tell you an author wants you to do something?', right:'"You should…"', pct:58, wrongs:[['"Once upon a time"',3],['"Did you know"',2]] },
  ]},
  c1: { title:'Checkpoint 1', n:12, insight:'Six students called paragraph 3 <b>persuade</b>. "A dog <b>needs to</b> play to stay healthy" sounds like an order, but it gives facts. All three students in the Skill Builder made this mistake.', qs:[
    { q:'Paragraph 1: "You must adopt Benny the dog. He is a good dog…"', right:'Persuade', pct:83, wrongs:[['Inform',2]], hint:'Look at the first words. "You must…" is the author asking you to do something.' },
    { q:'Paragraph 2: "Benny barked as he played with his toy…"', right:'Entertain', pct:92, wrongs:[['Inform',1]], hint:'Is something happening to a character? A little story is written to entertain.' },
    { q:'Paragraph 3: "A dog needs to play to stay healthy. Dogs like Benny like to run…"', right:'Inform', pct:50, wrongs:[['Persuade',5],['Entertain',1]], hint:'Is the author telling YOU to do something, or telling facts about dogs?' },
  ]},
  c2: { title:'Checkpoint 2', n:7, insight:'Choosing the purpose went well. Two students named the purpose but gave a reason that does not come from the text.', qs:[
    { q:'Pick the author\'s purpose for "The Hamster Race".', right:'Entertain', pct:100, wrongs:[] },
    { q:'Finish: "I know this because ___."', right:'A reason from the text', pct:71, wrongs:[['A reason not in the text',2]], hint:'Point to the words in the story that made you laugh or wonder.' },
    { q:'Pick the author\'s purpose for "Why Shelters Need Volunteers".', right:'Persuade', pct:86, wrongs:[['Inform',1]] },
  ]},
  full: { title:'Full Topic', n:4, insight:'Everyone who reached the Full Topic passed it.', qs:[
    { q:'Sort five short texts by purpose.', right:'All five', pct:100, wrongs:[] },
    { q:'Explain one purpose in a complete sentence.', right:'Purpose + reason', pct:100, wrongs:[] },
  ]},
  post: { title:'Post-test', n:2, insight:'Both finishers scored 95 or higher. Their biggest jump was on persuade questions.', qs:[
    { q:'"Every class should get a pet fish" — why did the author write it?', right:'Persuade', pct:100, wrongs:[] },
    { q:'"Brush your teeth twice a day!" — why did the author write it?', right:'Persuade', pct:100, wrongs:[] },
  ]},
}
const MISSES = {
  p3:{ q:'Checkpoint 1, paragraph 3: "A dog needs to play to stay healthy."', said:'Persuade', right:'Inform', hint:'Is the author telling YOU to do something, or telling facts about dogs?' },
  q2:{ q:'Checkpoint 2: "I know this because ___."', said:'"because hamsters are cute"', right:'a reason from the text', hint:'Point to the words in the story that made you laugh or wonder.' },
}

// Lit Lab assignments are Lit Lab paths only (Kennady, 2026-10-22: "they wouldn't have ECR or Quick Writes"); writing lives in CR Studio.
let ASSIGNMENTS = [
  { id:'a1', type:'path', title:"Author's Purpose", teks:'2.10A', cls:'2nd Grade · Room 104', assigned:'Oct 14', due:'Oct 24', status:'active' },
  { id:'a4', type:'path', title:'Print and Graphic Features', teks:'2.10C', cls:'2nd Grade · Room 104', assigned:'Oct 27', due:'Nov 7', status:'scheduled', done:0 },
  { id:'a5', type:'path', title:'Text Structure', teks:'2.10B', cls:'2nd Grade · Room 104', assigned:'Sep 29', due:'Oct 10', status:'past', done:12, avg:84 },
  { id:'a6', type:'path', title:'Vowel Teams', teks:'2.2B(ii)', cls:'2nd Grade · Room 104', assigned:'Sep 15', due:'Sep 26', status:'past', done:13, avg:88 },
]
const TOPICS = [
  { id:'ap', title:"Author's Purpose", teks:'2.10A', grade:2, parts:'Pre-test · 2 lessons · 3 checkpoints · Skill Builders · Post-test' },
  { id:'ts', title:'Text Structure', teks:'2.10B', grade:2, parts:'Pre-test · 2 lessons · 3 checkpoints · Skill Builders · Post-test' },
  { id:'pg', title:'Print and Graphic Features', teks:'2.10C', grade:2, parts:'Pre-test · 2 lessons · 3 checkpoints · Skill Builders · Post-test' },
  { id:'dl', title:'Descriptive and Figurative Language', teks:'2.10D', grade:2, parts:'Pre-test · 2 lessons · 3 checkpoints · Skill Builders · Post-test' },
  { id:'vt', title:'Vowel Teams', teks:'2.2B(ii)', grade:2, parts:'Pre-test · 2 lessons · 3 checkpoints · Skill Builders · Post-test' },
]
const FEED = [
  ['lhouser','missed Skill Builder 1 practice again (70%)','12 min ago'],
  ['kscott','passed the Full Topic practice (85%)','25 min ago'],
  ['rgardner','passed Checkpoint 2 on the second try (90%)','40 min ago'],
  ['ebenton','finished the Post-test (95%) and earned the Author\'s Purpose badge','1 hr ago'],
  ['ahayes','passed the Skill Builder 1 practice (90%)','2 hr ago'],
  ['vhinton','submitted an ECR for The Brave Little Lantern','Yesterday'],
]

/* ---------- derived state ---------- */
const best = (t) => t && t.length ? Math.max(...t) : null
const passed = (c) => !!c && best(c.tries) >= PASS
function stepState(s, step) {
  if (step.kind === 'test') return s[step.id] != null ? 'done' : null
  if (step.kind === 'lesson') return s[step.id] ? 'done' : null
  return passed(s[step.id]) ? 'done' : null
}
function current(s) {
  if (s.last === null && s.pre == null) return { step:STEPS[0], sub:'Not started' }
  for (const st of STEPS) if (!stepState(s, st)) {
    const c = s[st.id]
    if (st.kind === 'check' && c && c.tries.length && c.sb) {
      if (!c.sb.lesson) return { step:st, sub:'Skill Builder lesson', sb:true }
      if (best(c.sb.tries) == null || best(c.sb.tries) < PASS) return { step:st, sub:'Skill Builder practice', sb:true }
      return { step:st, sub:'Trying again' }
    }
    return { step:st }
  }
  return { step:null, sub:'Finished' }
}
function status(s) {
  const cur = current(s)
  if (!cur.step) return 'done'
  if (s.last === null || s.last >= 5) return 'idle'
  const misses = STEPS.reduce((n, st) => { const c = s[st.id]; return n + (c && c.tries ? c.tries.filter(x => x < PASS).length + (c.sb ? c.sb.tries.filter(x => x < PASS).length : 0) : 0) }, 0)
  return misses >= 2 ? 'help' : 'working'
}
const band = (v) => v >= PASS ? 'pass' : v >= 70 ? 'near' : 'miss'
const byId = Object.fromEntries(STUDENTS.map(s => [s.id, s]))
const avg = (xs) => xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null
const lastText = (s) => s.last === null ? 'Never signed in' : s.last === 0 ? 'Active today' : s.last === 1 ? 'Yesterday' : `${s.last} days ago`
// Mastery (Kennady, 2026-10-22: "less assignment based ... switch from one domain to the next and see all the standards
// associated with that domain. If they see a student is scoring low in a standard, they can click on it and assign that
// learning path to that student"). Standards are the 2nd-grade ELAR TEKS from the ClearK12 Studio catalog (TEA ch110a).
// Writing first (Kennady, 2026-10-22: "focus on the writing standards/domains and then those that support our crystal writing
// platform like author's purpose, language, sentences"). Four groups, TEA wording from the ClearK12 Studio catalog (ch110a).
const DOMAINS = [
  ['Composition', [
    ['2.11A', 'Plan a first draft by generating ideas for writing such as drawing and brainstorming'],
    ['2.11B (i)', 'Develop drafts into a focused piece of writing by organizing with structure'],
    ['2.11B (ii)', 'Develop drafts into a focused piece of writing by developing an idea with specific and relevant details'],
    ['2.11C', 'Revise drafts by adding, deleting, or rearranging words, phrases, or sentences'],
    ['2.11E', 'Publish and share writing'],
    ['2.12A', 'Compose literary texts, including personal narratives and poetry'],
    ['2.12B', 'Compose informational texts, including procedural texts and reports'],
    ['2.12C', 'Compose correspondence such as thank you notes or letters'],
  ]],
  ['Language and Conventions', [
    ['2.11D (i)', 'Edit drafts for complete sentences with subject-verb agreement'],
    ['2.11D (ii)', 'Edit drafts for past, present, and future verb tense'],
    ['2.11D (iii)', 'Edit drafts for singular, plural, common, and proper nouns'],
    ['2.11D (iv)', 'Edit drafts for adjectives, including articles'],
    ['2.11D (v)', 'Edit drafts for adverbs that convey time and adverbs that convey place'],
    ['2.11D (vi)', 'Edit drafts for prepositions and prepositional phrases'],
    ['2.11D (vii)', 'Edit drafts for pronouns, including subjective, objective, and possessive cases'],
    ['2.11D (viii)', 'Edit drafts for coordinating conjunctions to form compound subjects and predicates'],
    ['2.11D (ix)', 'Edit drafts for capitalization of months, days of the week, and the salutation and conclusion of a letter'],
    ['2.11D (x)', 'Edit drafts for end punctuation, apostrophes in contractions, and commas with items in a series and in dates'],
    ['2.11D (xi)', 'Edit drafts for correct spelling of words with grade-appropriate orthographic patterns and rules and high-frequency words'],
    ['2.3C', 'Identify the meaning of and use words with affixes un-, re-, -ly, -er, and -est (comparative and superlative), and -ion/tion/sion'],
    ['2.3D', 'Identify, use, and explain the meaning of antonyms, synonyms, idioms, and homographs in context'],
  ]],
  ["Author's Purpose and Craft", [
    ['2.10A', "Discuss the author's purpose for writing text"],
    ['2.10B', "Discuss how the use of text structure contributes to the author's purpose"],
    ['2.10C', "Discuss the author's use of print and graphic features to achieve specific purposes"],
    ['2.10D', 'Discuss the use of descriptive, literal, and figurative language'],
    ['2.10E', 'Identify the use of first or third person in a text'],
    ['2.10F', 'Identify and explain the use of repetition'],
  ]],
  ['Response Skills', [
    ['2.7A', 'Describe personal connections to a variety of sources'],
    ['2.7B', 'Write brief comments on literary or informational texts that demonstrate an understanding of the text'],
    ['2.7C', 'Use text evidence to support an appropriate response'],
    ['2.7D', 'Retell and paraphrase texts in ways that maintain meaning and logical order'],
    ['2.7E', 'Interact with sources in meaningful ways such as illustrating or writing'],
    ['2.7F', 'Respond using newly acquired vocabulary as appropriate'],
  ]],
]
// The Lit Lab path that teaches each standard the class has been taught so far (sample).
const PATHS = {
  '2.11A':'Planning a Draft', '2.11B (i)':'Organizing My Writing', '2.11B (ii)':'Details That Matter', '2.11C':'Revising', '2.12A':'Personal Narratives', '2.12B':'Informational Writing',
  '2.11D (i)':'Complete Sentences', '2.11D (ii)':'Verb Tense', '2.11D (iii)':'Nouns', '2.11D (iv)':'Adjectives', '2.11D (viii)':'Joining Words', '2.11D (x)':'Punctuation', '2.11D (xi)':'Spelling Patterns',
  '2.3C':'Prefixes and Suffixes', '2.3D':'Synonyms and Antonyms',
  '2.10A':"Author's Purpose", '2.10B':'Text Structure', '2.10C':'Print and Graphic Features',
  '2.7B':'Writing About Reading', '2.7C':'Text Evidence', '2.7D':'Retelling',
}
const TAUGHT = new Set(Object.keys(PATHS))
const LEVEL = { ahayes:62, ebenton:88, emontagne:66, hscott:84, hscott2:55, kscott:82, kscott2:80, kmcknight:95, lhouser:58, mwood:74, rgardner:80, scaffey:60, vhinton:70 }
const hash = (t) => [...t].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)
function scoreOf(s, code) {
  if (!TAUGHT.has(code)) return undefined
  if (code === '2.10A') return s.post ?? best(s.full?.tries) ?? best(s.c2?.tries) ?? best(s.c1?.tries) ?? s.pre ?? null
  if (s.id === 'scaffey') return null // hasn't signed in
  return Math.max(40, Math.min(100, LEVEL[s.id] + 6 + (hash(code + s.id) % 23) - 9))
}

/* ---------- ui state ---------- */
const ui = { domain:0, assigned:new Set(), feed:'all', view:'home', filter:'all', tab:'active', small:new Set(), drawer:null, collapsed:false, pview:'path', litOpen:true }
const VIEWS = ['home','assignments','progress','skills','students','studio','reports','classes','bridge']

const ICON = {
  home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  assignments:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v3h6V3M8.5 11h7M8.5 15h7"/>',
  progress:'<path d="M4 19c3-7 6 2 9-5s5-6 7-8"/><circle cx="4" cy="19" r="1.5"/><circle cx="20" cy="6" r="1.5"/>',
  skills:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  students:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c2.6.2 4.5 2 5 5"/>',
  classes:'<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M2.5 19c.5-3 2.8-4.5 5.5-4.5S13 16 13.5 19M10.5 19c.5-3 2.8-4.5 5.5-4.5S21 16 21.5 19"/>',
  bridge:'<path d="M4 5h9M8.5 3v2M6 5c.5 3 3 6 6 7M11 5c-.5 3-3 6-6 7"/><path d="M13 21l4-9 4 9M14.5 18h5"/>',
  studio:'<path d="M14 4l6 6-11 11H3v-6z"/><path d="M12.5 5.5l6 6"/>',
  reports:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  luna:'<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/><path d="M16 3.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z"/>',
  litlab:'<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z"/><path d="M12 6.5v13"/>',
}
const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`
const chev = '<svg class="chev" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5l4 4 4-4"/></svg>'
// The menu (Kennady, 2026-10-22: "Lit Lab with assignments, progress, and Mastery underneath ... Then CR Studio, then Crystal
// Reports, then Class Manager, then Language Bridge"; later "Move Lit Lab under CR Studio"). Students is a view inside Progress.
const LIT = [['assignments','Assignments'],['progress','Progress'],['skills','Mastery']]
const NAV = [
  ['home','Home'],
  ['studio','CR Studio',null,true],
  ['litlab','Lit Lab',LIT],
  ['reports','Crystal Reports'],
  ['classes','Class Manager',null,true],
  ['bridge','Language Bridge',null,true],
]
function renderNav() {
  const item = (k, l, dd, sub) => `<button class="nav${sub ? ' sub' : ''}${ui.view === k ? ' on' : ''}" data-go="${k}" ${ui.view === k ? 'aria-current="page"' : ''} title="${l}">${sub ? '' : svg(k)}<span class="lbl">${l}</span>${dd ? chev : ''}</button>`
  R.getElementById('nav').innerHTML = NAV.map(([k, l, kids, dd]) => {
    if (!kids) return item(k, l, dd)
    const inside = kids.some(([c]) => c === ui.view)
    return `<button class="nav group${inside ? ' within' : ''}" data-act="litlab" aria-expanded="${ui.litOpen}" title="${l}">${svg(k)}<span class="lbl">${l}</span>${chev}</button>`
      + (ui.litOpen ? `<div class="subnav">${kids.map(([c, cl]) => item(c, cl, false, true)).join('')}</div>` : '')
  }).join('')
}

const fa = (s, size) => `<span class="fa" style="background:${s.color}${size ? `;width:${size}px;height:${size}px` : ''}" title="${s.name}">${s.init}</span>`
const pill = (v, sup) => `<span class="pill ${band(v)}">${v}%${sup ? `<sup>×${sup}</sup>` : ''}</span>`
const check = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5l2.6 2.6L11 4.5"/></svg>'
function ring(done, total, size = 44) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r, f = total ? done / total : 0
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${done} of ${total} done"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#e4eef3" stroke-width="6"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#22804f" stroke-width="6" stroke-linecap="round" stroke-dasharray="${c * f} ${c}" transform="rotate(-90 ${size/2} ${size/2})"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" fill="#1b2a35" font-family="Roboto, sans-serif">${done}/${total}</text></svg>`
}
const counts = () => STUDENTS.reduce((m, s) => (m[status(s)]++, m), { help:0, working:0, done:0, idle:0 })

/* ---------- views ---------- */
function head(title, sub, tools = '', eyebrow = '') {
  return `<div class="head"><div>${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h1>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}</div><div class="tools">${tools}</div></div>`
}
const classPick = `<select class="pick" id="cls" aria-label="Class"><option>2nd Grade · Room 104</option><option>All classes</option></select>`
const newBtn = `<button class="btn primary" data-act="new"><svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M7 2v10M2 7h10"/></svg>New assignment</button>`

// Home (Kennady, 2026-10-22: "The homescreen still needs to have the ClassCade quick rewards. And then I think just quick
// overview of each zone: Lit Lab, Luna, Recent Writer's Activity"). One card per zone, Quick Rewards down the right.
const LUNA = [['m1','SCR',9],['m2','ECR',5],['m3','Stellar',3],['m4','Process',2],['m5','Revision',1],['m6','Editing',0]]
const WRITING = [
  ['ecr','vhinton','submitted an ECR for The Brave Little Lantern','20 min ago'],
  ['qw','kscott',"wrote today's Quick Write (142 words)",'35 min ago'],
  ['luna','emontagne','earned the SCR badge in Luna','1 hr ago'],
  ['scr','mwood','finished the SCR "Why Do Owls Hunt at Night?"','2 hr ago'],
  ['ecr','ahayes','submitted an ECR for The Brave Little Lantern','3 hr ago'],
  ['qw','lhouser',"wrote today's Quick Write (64 words)",'Yesterday'],
  ['luna','kmcknight','earned the Stellar badge in Luna','Yesterday'],
]
const KINDS = { scr:'SCR', ecr:'ECR', qw:'Quick Write', luna:'Luna badge' }
const gifts = {}
function viewHome() {
  const c = counts()
  const help = STUDENTS.filter(s => status(s) === 'help')
  const parts = [['done','Finished',c.done,'var(--pass)'],['working','Working',c.working,'var(--sky)'],['help','Need help',c.help,'#e09a2a'],['idle','Not active',c.idle,'var(--lock)']]
  const feed = WRITING.filter(([k]) => ui.feed === 'all' || ui.feed === k).slice(0, 5)
  return head('Good morning, Kennady', 'Wednesday, October 22 · 2nd Grade · Room 104', `${classPick}${newBtn}`) + `
  <div class="home">
    <div class="stack">
      <div class="zones">
        <section class="card zone" aria-labelledby="zl">
          <div class="hd"><h2 id="zl">${svg('litlab')}Lit Lab</h2><button class="btn small ghost" data-go="progress" style="margin-left:auto">Open</button></div>
          <div class="bd">
            <div class="zk">Author's Purpose · due Fri, Oct 24</div>
            <div class="prog big"><span class="track">${parts.map(([, , n, col]) => `<i style="width:${n / 13 * 100}%;background:${col}"></i>`).join('')}</span></div>
            <div class="zlegend">${parts.map(([k, l, n, col]) => `<button data-act="filter" data-f="${k}"><i style="background:${col}"></i><b>${n}</b> ${l}</button>`).join('')}</div>
            ${help.length ? `<button class="zalert" data-act="filter" data-f="help"><span class="faces">${help.map(s => fa(s)).join('')}</span>${help.map(s => s.name).join(' and ')} need${help.length > 1 ? '' : 's'} help</button>` : ''}
          </div>
        </section>
        <section class="card zone" aria-labelledby="zn">
          <div class="hd"><h2 id="zn">${svg('luna')}Luna</h2><span class="meta">Writing Adventure</span></div>
          <div class="bd">
            <div class="zk">Badges the class has earned</div>
            <div class="badges">${LUNA.map(([m, l, n]) => `<div class="badge${n ? '' : ' none'}"><img src="${BASE}badges/${m}.webp" alt=""><span class="bt"><span class="bl">${l}</span><b>${n}<small> of 13</small></b></span></div>`).join('')}</div>
            <div class="zfoot">4 badges earned this week</div>
          </div>
        </section>
      </div>
      <section class="card" aria-labelledby="zw">
        <div class="hd"><h2 id="zw">Recent Writer's Activity</h2><button class="btn small ghost" data-go="studio" style="margin-left:auto">6 ECRs to score</button></div>
        <div class="bd" style="padding-bottom:6px"><div class="chips" role="group" aria-label="Show">${[['all','All'], ...Object.entries(KINDS)].map(([k, l]) => `<button class="chip${ui.feed === k ? ' on' : ''}" aria-pressed="${ui.feed === k}" data-act="feed" data-k="${k}">${l}</button>`).join('')}</div></div>
        <div class="feed">${feed.map(([k, id, what, when]) => `<div class="it">${fa(byId[id])}<div><span class="typ ${k === 'luna' ? 'luna' : k}">${KINDS[k]}</span><b>${byId[id].name}</b> ${what}</div><span class="when">${when}</span></div>`).join('') || '<div class="empty"><b>Nothing yet</b>Try All.</div>'}</div>
      </section>
    </div>
    <section class="card rewards-card" aria-label="ClassCade Quick Rewards">
      <div class="cc-hd"><div><img src="${CLASSCADE}" alt="ClassCade"><b>Quick Rewards</b></div><select class="pick" aria-label="Class"><option>All Classes</option><option>2nd Grade · Room 104</option></select></div>
      <div class="rewards">${STUDENTS.map(s => `<div class="rw"><span class="coin"></span><div><b>${s.name}</b>Gifted coins: ${gifts[s.id] || 0}</div><button class="plus" data-act="coin" data-id="${s.id}" aria-label="Gift ${s.name} 5 coins">+5</button></div>`).join('')}</div>
    </section>
  </div>`
}

function viewProgress() {
  const c = counts()
  const F = { all:['All', STUDENTS.length], help:['Needs help', c.help], working:['Working', c.working], idle:['Not active', c.idle], done:['Finished', c.done] }
  const rows = STUDENTS.filter(s => ui.filter === 'all' || status(s) === ui.filter || (ui.filter.startsWith('at:') && current(s).step?.id === ui.filter.slice(3)))
  const colAvg = (st) => {
    const xs = STUDENTS.map(s => st.kind === 'test' ? s[st.id] : st.kind === 'check' ? best(s[st.id]?.tries) : null).filter(v => v != null)
    const n = STUDENTS.filter(s => stepState(s, st)).length
    return st.kind === 'lesson' ? `${n} done` : xs.length ? `avg ${avg(xs)}% · ${n} ${st.kind === 'test' ? 'took it' : 'passed'}` : 'no scores yet'
  }
  const cell = (s, st) => {
    const cur = current(s), here = cur.step === st
    if (st.kind === 'lesson') return s[st.id] ? `<span class="cell"><span class="done" title="Lesson done">${check}</span></span>` : here ? `<span class="cell"><span class="now">${cur.sub === 'Not started' ? 'Not started' : 'Here now'}</span></span>` : `<span class="cell"><span class="lock" title="Not yet"></span></span>`
    if (st.kind === 'test') return s[st.id] != null ? `<button class="cell" data-act="items" data-step="${st.id}">${pill(s[st.id])}</button>` : here ? `<span class="cell"><span class="now">${cur.sub === 'Not started' ? 'Not started' : 'Here now'}</span></span>` : `<span class="cell"><span class="lock"></span></span>`
    const w = s[st.id]
    if (!w || !w.tries.length) return here ? `<span class="cell"><span class="now">Here now</span></span>` : `<span class="cell"><span class="lock"></span></span>`
    const sb = w.sb ? (here && cur.sb ? `<span class="sb now">${cur.sub === 'Skill Builder lesson' ? 'SB lesson' : 'SB practice'}${w.sb.tries.length ? ' ' + best(w.sb.tries) + '%' : ''}</span>` : `<span class="sb">SB ${w.sb.tries.length ? best(w.sb.tries) + '%' : '✓'}</span>`) : ''
    const retry = here && cur.sub === 'Trying again' ? '<span class="now">Retry next</span>' : ''
    return `<button class="cell" data-act="items" data-step="${st.id}" title="${w.tries.length} ${w.tries.length > 1 ? 'tries' : 'try'}: ${w.tries.join('%, ')}%">${pill(best(w.tries), w.tries.length > 1 ? w.tries.length : 0)}${sb}${retry}</button>`
  }
  const pres = STUDENTS.map(s => s.pre).filter(v => v != null), posts = STUDENTS.filter(s => s.post != null)
  const tools = `<div class="seg" role="group" aria-label="Show as">${[['path','Path'],['students','Students']].map(([k, l]) => `<button class="${ui.pview === k ? 'on' : ''}" aria-pressed="${ui.pview === k}" data-act="pview" data-v="${k}">${l}</button>`).join('')}</div><select class="pick" aria-label="Topic"><option>Author's Purpose · 2.10A</option><option>Text Structure · 2.10B</option></select>${classPick}`
  if (ui.pview === 'students') return head('Progress', "Author's Purpose · tap a student for their full picture", tools, 'Lit Lab') + roster()
  return head('Progress', "Author's Purpose · every student's spot on the path", tools, 'Lit Lab') + `
  <div class="summary">
    <div class="sum"><div class="k">Pre-test average</div><div class="v">${avg(pres)}% <small>${pres.length} took it</small></div></div>
    <div class="sum"><div class="k">Post-test average</div><div class="v">${avg(posts.map(s => s.post))}% <small>${posts.length} finished</small></div></div>
    <div class="sum"><div class="k">Sent to a Skill Builder</div><div class="v">${STUDENTS.filter(s => s.c1?.sb || s.c2?.sb).length} <small>of 13</small></div></div>
    <div class="sum"><div class="k">Time on the path</div><div class="v">${Math.round(avg(STUDENTS.filter(s => s.mins).map(s => s.mins)))} <small>min each, on average</small></div></div>
  </div>
  <div class="chips" role="group" aria-label="Show">${Object.entries(F).map(([k, [l, n]]) => `<button class="chip${ui.filter === k ? ' on' : ''}" data-act="filter" data-f="${k}" aria-pressed="${ui.filter === k}">${l} <b>${n}</b></button>`).join('')}${ui.filter.startsWith('at:') ? `<button class="chip on" data-act="filter" data-f="all">At ${STEPS.find(x => x.id === ui.filter.slice(3)).label} ✕</button>` : ''}</div>
  <section class="card">
    <div class="gridwrap"><table class="grid">
      <thead><tr><th class="stu" scope="col">Student</th>${STEPS.map(st => `<th scope="col">${st.kind === 'lesson' ? `<span style="display:inline-block;padding:4px 6px">${st.label}<span class="ty">${st.ty}</span></span>` : `<button data-act="items" data-step="${st.id}" title="See how the class did on each question">${st.label}<span class="ty">${st.ty}</span></button>`}<span class="avg">${colAvg(st)}</span></th>`).join('')}<th scope="col">Growth</th></tr></thead>
      <tbody>${rows.length ? rows.map(s => {
        const st = status(s), g = s.post != null && s.pre != null ? s.post - s.pre : null
        return `<tr><td class="stu"><button data-act="student" data-id="${s.id}">${fa(s, 32)}<span><span class="n">${s.name}</span>${ui.small.has(s.id) ? ' <span class="sb">Small group</span>' : ''}<span class="l${st === 'idle' ? ' stale' : ''}" style="display:block">${st === 'help' ? '⚑ Needs help · ' : ''}${lastText(s)}</span></span></button></td>${STEPS.map(stp => `<td>${cell(s, stp)}</td>`).join('')}<td>${g != null ? `<span class="pill pass">+${g}</span>` : '<span style="color:var(--faint)">—</span>'}</td></tr>`
      }).join('') : `<tr><td colspan="9"><div class="empty"><b>No one here right now</b>Try another filter.</div></td></tr>`}</tbody>
    </table></div>
  </section>
  <div class="legend"><span>${pill(92)} passed (85% or more)</span><span>${pill(78)} close</span><span>${pill(60)} not yet</span><span><span class="pill near">70%<sup>×2</sup></span> number of tries</span><span><span class="sb">SB 90%</span> Skill Builder detour</span><span><span class="now">Here now</span> current step</span><span><span class="lock"></span> not reached</span></div>`
}

function viewSkills() {
  const dom = DOMAINS[ui.domain] || DOMAINS[0]
  const low = (code) => STUDENTS.filter(s => { const v = scoreOf(s, code); return v != null && v < 70 })
  const taught = dom[1].filter(([c]) => TAUGHT.has(c))
  const cell = (s, code) => {
    const v = scoreOf(s, code), sent = ui.assigned.has(s.id + '|' + code)
    if (v == null) return `<td class="c"><span class="dash" title="${s.name} hasn't done this yet">—</span></td>`
    const b = v >= 90 ? 'b4' : v >= PASS ? 'b3' : v >= 70 ? 'b2' : 'b1'
    return `<td class="c"><button class="score ${b}${sent ? ' sent' : ''}" data-act="std" data-id="${s.id}" data-code="${code}" title="${s.name}: ${v}%${v < 70 ? ' · click to assign the path' : ''}">${v}${sent ? '<i>Assigned</i>' : ''}</button></td>`
  }
  const row = ([code, text]) => {
    const path = PATHS[code]
    if (!TAUGHT.has(code)) return `<tr class="untaught"><th scope="row" class="stu std"><span class="code">${code}</span><span class="txt">${text}</span></th><td colspan="${STUDENTS.length + 1}" class="nt">Not taught yet${path ? ` · Lit Lab path: ${path}` : ''}</td></tr>`
    const xs = STUDENTS.map(s => scoreOf(s, code)).filter(v => v != null), pct = Math.round(100 * xs.filter(v => v >= PASS).length / xs.length)
    return `<tr><th scope="row" class="stu std"><span class="code">${code}</span><span class="txt">${text}</span><span class="path">Lit Lab path: ${path}</span></th>${STUDENTS.map(s => cell(s, code)).join('')}<td class="cls"><b>${pct}%</b><span class="mbar"><i style="width:${pct}%"></i></span></td></tr>`
  }
  return head('Mastery', 'The writing standards behind Crystal Writing. Click a low score to assign that student the path.', classPick, 'Lit Lab') + `
  <div class="domains" role="tablist" aria-label="Domain">${DOMAINS.map(([name], k) => `<button role="tab" aria-selected="${ui.domain === k}" class="dom${ui.domain === k ? ' on' : ''}" data-act="domain" data-k="${k}">${name}</button>`).join('')}</div>
  <section class="card">
    <div class="hd"><h2>${dom[0]}</h2><span class="meta">${taught.length} of ${dom[1].length} standards taught so far</span></div>
    ${taught.length ? '' : `<div class="empty"><b>Nothing taught in ${dom[0]} yet</b>Its standards show up here once the class starts a path that teaches them.</div>`}
    <div class="gridwrap"${taught.length ? '' : ' hidden'}><table class="grid heat mastery">
      <thead><tr><th class="stu" scope="col">Standard</th>${STUDENTS.map(s => `<th scope="col" title="${s.name}"><button data-act="student" data-id="${s.id}">${fa(s, 28)}</button></th>`).join('')}<th scope="col">At mastery</th></tr></thead>
      <tbody>${taught.map(row).join('')}</tbody>
    </table></div>
  </section>
  <div class="legend"><span><span class="score b4">90</span> mastered</span><span><span class="score b3">85</span> passed</span><span><span class="score b2">75</span> close</span><span><span class="score b1">60</span> under 70: click to assign the path</span><span>Scores are each student's latest checkpoint or post-test on that standard.</span></div>`
}

function drawerStd(id, code) {
  const s = byId[id], v = scoreOf(s, code), path = PATHS[code]
  const text = DOMAINS.flatMap(d => d[1]).find(([c]) => c === code)?.[1] || ''
  const others = STUDENTS.filter(x => x.id !== id && scoreOf(x, code) != null && scoreOf(x, code) < 70 && !ui.assigned.has(x.id + '|' + code))
  const sent = ui.assigned.has(id + '|' + code)
  // the class is already on this path: show where the student is instead of assigning it again
  const onIt = ASSIGNMENTS.some(a => a.status === 'active' && a.teks === code && !a.n)
  const cur = current(s)
  if (onIt) return `<div class="dh">${fa(s, 44)}<div><h2>${s.name}</h2><div style="color:var(--muted);font-size:13.5px">${lastText(s)}</div></div><button class="icon-btn x" data-act="close" aria-label="Close">✕</button></div>
  <div class="db">
    <div><h3>Standard</h3><div class="stdcard"><span class="code">${code}</span><p>${text}</p><div class="pct">${s.name.split(' ')[0]}'s latest score ${pill(v)}</div></div></div>
    <div class="insight"><b>Already on this path.</b> The class is working through ${path} now. ${s.name} is at ${cur.step ? cur.step.label + (cur.sub && cur.sub !== 'Not started' ? ' (' + cur.sub + ')' : '') : 'the finish'}.</div>
  </div>
  <div class="dfoot"><button class="btn" data-act="close">Close</button><button class="btn primary" data-act="student" data-id="${id}">See ${s.name.split(' ')[0]}'s progress</button></div>`
  return `<div class="dh">${fa(s, 44)}<div><h2>${s.name}</h2><div style="color:var(--muted);font-size:13.5px">${lastText(s)}</div></div><button class="icon-btn x" data-act="close" aria-label="Close">✕</button></div>
  <div class="db">
    <div><h3>Standard</h3><div class="stdcard"><span class="code">${code}</span><p>${text}</p><div class="pct">${s.name.split(' ')[0]}'s latest score ${pill(v)}</div></div></div>
    <div><h3>Lit Lab path</h3><div class="pathcard"><b>${path}</b><span>Pre-test · lessons · checkpoints · Skill Builders · post-test</span><span>A pre-test score of 85% or more lets ${s.name.split(' ')[0]} skip lessons they already know.</span></div></div>
    ${sent ? `<div class="insight"><b>Assigned.</b> ${path} is on ${s.name}'s path, due Oct 31.</div>` : `<div class="field"><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px"><div class="field"><label for="sstart">Start</label><input id="sstart" type="date" value="2026-10-23"></div><div class="field"><label for="sdue">Due</label><input id="sdue" type="date" value="2026-10-31"></div></div></div>`}
    ${others.length && !sent ? `<label class="check"><input type="checkbox" id="also" checked> Also assign it to ${others.length} other student${others.length > 1 ? 's' : ''} under 70%: ${others.map(x => x.name).join(', ')}</label>` : ''}
  </div>
  <div class="dfoot"><button class="btn" data-act="close">${sent ? 'Close' : 'Cancel'}</button>${sent ? '' : `<button class="btn primary" data-act="assign-std" data-id="${id}" data-code="${code}">Assign ${path} to ${s.name}</button>`}</div>`
}

function roster() {
  return `
  <div class="roster">${STUDENTS.map(s => { const cur = current(s), st = status(s); return `<button class="rcard" data-act="student" data-id="${s.id}">
    <div class="top2">${fa(s, 40)}<div><div class="n">${s.name}</div><div class="s">${lastText(s)}${s.lang ? ' · Language Bridge ' + s.lang : ''}</div></div></div>
    <div class="kv"><span>Author's Purpose</span><b>${cur.step ? cur.step.label + (cur.sub && cur.sub !== 'Not started' ? ' · ' + cur.sub : '') : 'Finished ✓'}</b></div>
    <div class="kv"><span>Pre → Post</span><b>${s.pre ?? '—'}${s.post != null ? ` → ${s.post}` : ''}</b></div>
    <div class="kv"><span>Status</span><b style="color:${st === 'help' ? 'var(--miss)' : st === 'idle' ? 'var(--near)' : st === 'done' ? 'var(--pass)' : 'var(--teal-2)'}">${{ help:'Needs help', idle:'Not active', done:'Finished', working:'Working' }[st]}</b></div>
  </button>` }).join('')}</div>`
}

function viewAssignments() {
  const c = counts()
  const list = ASSIGNMENTS.filter(a => a.status === ui.tab)
  const progressOf = (a) => {
    if (a.type === 'path' && a.status === 'active') {
      const parts = [[c.done, 'var(--pass)'], [c.working, 'var(--sky)'], [c.help, '#e09a2a'], [c.idle, 'var(--lock)']]
      return `<div class="prog"><span class="track">${parts.map(([n, col]) => `<i style="width:${n / 13 * 100}%;background:${col}"></i>`).join('')}</span><small>${c.done} done · ${c.working + c.help} working</small></div>`
    }
    const d = a.done ?? 0
    const n = a.n || 13
    return `<div class="prog"><span class="track"><i style="width:${d / n * 100}%;background:var(--pass)"></i></span><small>${d}/${n}</small></div>`
  }
  return head('Assignments', 'The Lit Lab paths your class is working through', `${classPick}${newBtn}`, 'Lit Lab') + `
  <section class="card">
    <div class="tabs" role="tablist">${[['active','Active'],['scheduled','Scheduled'],['past','Past']].map(([k, l]) => `<button class="tab${ui.tab === k ? ' on' : ''}" role="tab" aria-selected="${ui.tab === k}" data-act="tab" data-t="${k}">${l} <span style="color:var(--faint)">${ASSIGNMENTS.filter(a => a.status === k).length}</span></button>`).join('')}</div>
    <div class="gridwrap"><table class="list">
      <thead><tr><th>Assignment</th><th>Class</th><th>Assigned</th><th>Due</th><th>Progress</th><th>${ui.tab === 'past' ? 'Class average' : ''}</th><th></th></tr></thead>
      <tbody>${list.length ? list.map(a => `<tr>
        <td><span class="t">${a.title}</span><div style="font:500 12px var(--mono);color:var(--teal-2);margin-top:3px">${a.teks}</div></td>
        <td>${a.cls}</td><td>${a.assigned}</td><td>${a.due}</td><td>${progressOf(a)}</td>
        <td>${a.avg != null ? `${a.avg}%` : ''}</td>
        <td style="text-align:right">${a.status === 'scheduled' ? `<button class="btn small" data-act="toast" data-msg="Editing a scheduled path opens the same form as New assignment">Edit</button>` : `<button class="btn small" data-go="progress">View progress</button>`}</td>
      </tr>`).join('') : `<tr><td colspan="7"><div class="empty"><b>Nothing here yet</b>Use New assignment to add one.</div></td></tr>`}</tbody>
    </table></div>
  </section>`
}

function viewExisting(k) {
  const name = { studio:'CR Studio', reports:'Crystal Reports', classes:'Class Manager', bridge:'Language Bridge' }[k]
  return head(name) + `<section class="card"><div class="empty"><b>${name} stays as it is today</b>This prototype only adds the new teacher pages. ${k === 'studio' ? 'Scoring the 6 waiting ECRs would happen here, unchanged.' : 'Nothing on this page changes.'}<div style="margin-top:14px"><button class="btn" data-go="home">Back to Home</button></div></div></section>`
}

/* ---------- drawers ---------- */
function drawerStudent(id) {
  const s = byId[id], cur = current(s), st = status(s)
  const mk = (cls, txt) => `<span class="mk ${cls}">${txt}</span>`
  const tl = STEPS.map((stp, i) => {
    const w = s[stp.id], here = cur.step === stp
    let row
    if (stp.kind === 'lesson') row = `<div class="st">${mk(s[stp.id] ? 'ok' : here ? 'cur' : '', s[stp.id] ? '✓' : i + 1)}<div class="lab">${stp.label}<small>${stp.sub}</small></div><span>${s[stp.id] ? 'Done' : here ? '<span class="now">Here now</span>' : ''}</span></div>`
    else if (stp.kind === 'test') row = `<div class="st">${mk(s[stp.id] != null ? 'ok' : here ? 'cur' : '', s[stp.id] != null ? '✓' : i + 1)}<div class="lab">${stp.label}</div><span>${s[stp.id] != null ? pill(s[stp.id]) : here ? '<span class="now">Here now</span>' : ''}</span></div>`
    else {
      row = `<div class="st">${mk(passed(w) ? 'ok' : here ? 'cur' : '', passed(w) ? '✓' : i + 1)}<div class="lab">${stp.label}${w?.tries?.length ? `<small>Tries: ${w.tries.map(t => t + '%').join(' → ')}</small>` : ''}</div><span>${w?.tries?.length ? pill(best(w.tries)) : here ? '<span class="now">Here now</span>' : ''}</span></div>`
      if (w?.sb) row += `<div class="st branch">${mk('sbm', 'SB')}<div class="lab">${stp.sb}<small>Lesson ${w.sb.lesson ? 'done' : 'not started'}${w.sb.tries.length ? ' · practice ' + w.sb.tries.map(t => t + '%').join(' → ') : ''}</small></div><span>${here && cur.sb ? '<span class="sb now">Here now</span>' : w.sb.tries.length ? pill(best(w.sb.tries)) : ''}</span></div>`
    }
    return row
  }).join('')
  const misses = Object.values(s.miss || {}).map(k => MISSES[k])
  return `<div class="dh">${fa(s, 44)}<div><h2>${s.name}</h2><div style="color:var(--muted);font-size:13.5px">${lastText(s)} · ${s.mins} min on this path${s.lang ? ' · Language Bridge ' + s.lang : ''}</div></div><button class="icon-btn x" data-act="close" aria-label="Close">✕</button></div>
  <div class="db">
    ${st === 'help' ? `<div class="insight"><b>Why this is flagged:</b> ${s.id === 'lhouser' ? '4 misses on the same idea, including the Skill Builder. Practice alone isn\'t working, so this one is for you.' : 'More than one miss on this path. Check the question below before the next try.'}</div>` : ''}
    <div><h3>Author's Purpose path</h3><div class="tl">${tl}</div></div>
    ${misses.length ? `<div><h3>What tripped them up</h3>${misses.map(m => `<div class="miss-q"><div class="q">${m.q}</div><div class="a">Answered <b>${m.said}</b>; the answer is ${m.right}.</div><div class="h">Hint they saw: “${m.hint}”</div></div>`).join('')}</div>` : ''}
    <div><h3>Pre-test to now</h3>${growth(s)}</div>
    <div class="field"><label for="shout">Send ${s.name.split(' ')[0]} a shout-out</label><textarea id="shout" rows="2" placeholder="You kept going on Checkpoint 1. That's what readers do!"></textarea><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn small primary" data-act="shout" data-id="${s.id}">Send shout-out</button><button class="btn small" data-act="small" data-id="${s.id}">${ui.small.has(s.id) ? 'Remove from small group' : 'Add to small group'}</button>${cur.step && cur.step.kind === 'check' && s[cur.step.id]?.sb ? `<button class="btn small" data-act="toast" data-msg="${s.name} can retake ${cur.step.label} now">Let them retake ${cur.step.label}</button>` : ''}</div></div>
  </div>`
}
function growth(s) {
  const now = s.post ?? best(s.full?.tries) ?? best(s.c2?.tries) ?? best(s.c1?.tries) ?? null
  if (s.pre == null) return `<p style="margin:0;color:var(--muted)">No pre-test yet.</p>`
  const W = 480, x = (v) => 20 + v / 100 * (W - 40)
  return `<svg viewBox="0 0 ${W} 70" width="100%" role="img" aria-label="Pre-test ${s.pre}%, now ${now ?? s.pre}%">
    ${[0, 50, PASS, 100].map(v => `<line x1="${x(v)}" x2="${x(v)}" y1="14" y2="46" stroke="${v === PASS ? '#22804f' : '#dfe9ef'}" stroke-dasharray="${v === PASS ? '3 3' : ''}"/><text x="${x(v)}" y="62" font-size="11" text-anchor="middle" fill="#5b6f7d" font-family="Roboto">${v === PASS ? 'pass 85' : v}</text>`).join('')}
    ${now != null ? `<line x1="${x(s.pre)}" x2="${x(now)}" y1="30" y2="30" stroke="#0f6e8c" stroke-width="4" stroke-linecap="round"/>` : ''}
    <circle cx="${x(s.pre)}" cy="30" r="7" fill="#fff" stroke="#5b6f7d" stroke-width="3"/><text x="${x(s.pre)}" y="12" font-size="11" text-anchor="middle" fill="#5b6f7d" font-family="Roboto">Pre ${s.pre}</text>
    ${now != null ? `<circle cx="${x(now)}" cy="30" r="8" fill="#0f6e8c"/><text x="${x(now)}" y="12" font-size="11" font-weight="700" text-anchor="middle" fill="#0b4a5e" font-family="Roboto">${s.post != null ? 'Post' : 'Now'} ${now}</text>` : ''}
  </svg>`
}
function drawerItems(stepId) {
  const it = ITEMS[stepId], step = STEPS.find(s => s.id === stepId)
  const missed = STUDENTS.filter(s => s.miss?.[stepId])
  return `<div class="dh"><div><h2>${it.title}: question by question</h2><div style="color:var(--muted);font-size:13.5px">Author's Purpose · first tries from ${it.n} students</div></div><button class="icon-btn x" data-act="close" aria-label="Close">✕</button></div>
  <div class="db">
    <div class="insight"><b>What stands out:</b> ${it.insight}</div>
    <div class="qa">${it.qs.map(q => `<div class="qrow"><div class="q">${q.q}</div><div class="pct"><span class="track"><i style="width:${q.pct}%"></i></span><b style="font-variant-numeric:tabular-nums">${q.pct}%</b> right</div><div style="font-size:13px">Answer: <b>${q.right}</b></div>${q.wrongs.length ? `<div class="wrongs">${q.wrongs.map(([w, n]) => `<span>${n} chose ${w}</span>`).join('')}</div>` : ''}${q.hint ? `<div class="h" style="font-size:13px;background:#f6fbfd;border-radius:8px;padding:8px 10px">Hint students saw after a wrong answer: “${q.hint}”</div>` : ''}</div>`).join('')}</div>
    ${missed.length && step.kind === 'check' ? `<div><h3>Missed the hardest question</h3><div style="display:flex;flex-wrap:wrap;gap:8px">${missed.map(s => `<button class="chip" data-act="student" data-id="${s.id}">${fa(s, 20)} ${s.name}</button>`).join('')}</div><div style="margin-top:12px"><button class="btn small primary" data-act="group">Pull them as a small group</button></div></div>` : ''}
  </div>`
}
let draft = null
function drawerNew() {
  const d = draft
  return `<div class="dh"><div><h2>New Lit Lab path</h2><div style="color:var(--muted);font-size:13.5px">${d.for === 'finishers' ? 'For E Benton and K McKnight, who finished Author\'s Purpose' : '2nd Grade · Room 104'}</div></div><button class="icon-btn x" data-act="close" aria-label="Close">✕</button></div>
  <div class="db">
    ${d.type === 'path' ? `<div class="field"><span class="lab">Topic</span><div class="topiclist">${TOPICS.map(t => `<button class="topic${d.topic === t.id ? ' on' : ''}" data-act="dtopic" data-t="${t.id}" aria-pressed="${d.topic === t.id}"><span class="teks">${t.teks}</span><span><b>${t.title}</b><small>${t.parts}</small></span>${t.id === 'ap' ? '<small style="margin-left:auto;color:var(--near)">Assigned now</small>' : t.id === 'ts' ? '<small style="margin-left:auto;color:var(--muted)">Done Oct 10</small>' : ''}</button>`).join('')}</div></div>` : `<div class="field"><label for="ptitle">Prompt title</label><input id="ptitle" placeholder="e.g. The Brave Little Lantern"></div>`}
    <div class="field"><span class="lab">Who</span><div class="chips">${['Whole class (13)','Finished Author\'s Purpose (2)','Small group'+(ui.small.size ? ` (${ui.small.size})` : ''),'Pick students'].map((l, i) => `<button class="chip${d.who === i ? ' on' : ''}" data-act="dwho" data-w="${i}">${l}</button>`).join('')}</div></div>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px"><div class="field"><label for="start">Start</label><input id="start" type="date" value="2026-10-22"></div><div class="field"><label for="due">Due</label><input id="due" type="date" value="2026-10-31"></div></div>
    ${d.type === 'path' ? `<div class="field"><span class="lab">Path settings</span>
      <label class="check"><input type="checkbox" checked> Send a student to the Skill Builder when they score under 85% on a checkpoint</label>
      <label class="check"><input type="checkbox" checked> Let students skip lessons they already know (pre-test 85% or more)</label>
      <label class="check"><input type="checkbox" checked> Read aloud on for 2nd grade</label>
      <label class="check"><input type="checkbox"> Tell me when a student misses the same checkpoint 3 times</label></div>` : ''}
  </div>
  <div class="dfoot"><button class="btn" data-act="close">Cancel</button><button class="btn primary" data-act="assign">Assign</button></div>`
}

/* ---------- render + events ---------- */
function render() {
  renderNav()
  const v = ui.view
  R.getElementById('page').innerHTML = v === 'home' ? viewHome() : v === 'progress' ? viewProgress() : v === 'skills' ? viewSkills() : v === 'assignments' ? viewAssignments() : viewExisting(v)
  const L = R.getElementById('layer')
  if (!ui.drawer) { L.innerHTML = ''; return }
  const body = ui.drawer.kind === 'student' ? drawerStudent(ui.drawer.id) : ui.drawer.kind === 'items' ? drawerItems(ui.drawer.id) : ui.drawer.kind === 'std' ? drawerStd(ui.drawer.id, ui.drawer.code) : drawerNew()
  L.innerHTML = `<div class="scrim" data-act="close"></div><aside class="drawer" role="dialog" aria-modal="true">${body}</aside>`
}
function go(k) {
  if (k === 'students') { ui.pview = 'students'; k = 'progress' }
  if (LIT.some(([c]) => c === k)) ui.litOpen = true
  ui.view = VIEWS.includes(k) ? k : 'home'
  ui.drawer = null
  R.getElementById('app').classList.remove('open')
  try { history.replaceState(null, '', '#teacher/' + ui.view) } catch {}
  render()
  window.scrollTo(0, 0)
}
let toastT
function toast(msg) {
  let t = R.querySelector('.toast')
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); R.querySelector('.tv-root').appendChild(t) }
  t.textContent = msg
  clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2800)
}
function onClick(e) {
  if (e.target.closest('[data-acct]')) return switchAccount(e)
  const g = e.target.closest('[data-go]')
  if (g) return go(g.dataset.go)
  const a = e.target.closest('[data-act]')
  if (!a) return
  const act = a.dataset.act
  if (act === 'close') { ui.drawer = null; return render() }
  if (act === 'student') { ui.drawer = { kind:'student', id:a.dataset.id }; return render() }
  if (act === 'items') { ui.drawer = { kind:'items', id:a.dataset.step }; return render() }
  if (act === 'filter') { ui.filter = a.dataset.f; if (ui.view !== 'progress') return go('progress'); return render() }
  if (act === 'progress-step') { ui.filter = 'at:' + a.dataset.step; return go('progress') }
  if (act === 'tab') { ui.tab = a.dataset.t; return render() }
  if (act === 'domain') { ui.domain = Number(a.dataset.k); return render() }
  if (act === 'std') { ui.drawer = { kind:'std', id:a.dataset.id, code:a.dataset.code }; return render() }
  if (act === 'assign-std') {
    const { id, code } = a.dataset, path = PATHS[code]
    const also = R.getElementById('also')?.checked ? STUDENTS.filter(x => x.id !== id && scoreOf(x, code) != null && scoreOf(x, code) < 70 && !ui.assigned.has(x.id + '|' + code)) : []
    const who = [byId[id], ...also]
    who.forEach(x => ui.assigned.add(x.id + '|' + code))
    ASSIGNMENTS.unshift({ id:'n' + Date.now(), type:'path', title:path, teks:code, cls:who.map(x => x.name).join(', '), n:who.length, assigned:'Oct 23', due:'Oct 31', status:'scheduled', done:0 })
    ui.drawer = null; render()
    return toast(`${path} assigned to ${who.length === 1 ? who[0].name : who.length + ' students'}`)
  }
  if (act === 'pview') { ui.pview = a.dataset.v; return render() }
  if (act === 'litlab') { if (R.getElementById('app').classList.contains('collapsed')) return go('progress'); ui.litOpen = !ui.litOpen; return renderNav() }
  if (act === 'new') { draft = { type:'path', topic:a.dataset.for === 'finishers' ? 'pg' : 'pg', who:a.dataset.for === 'finishers' ? 1 : 0, for:a.dataset.for }; ui.drawer = { kind:'new' }; return render() }
  if (act === 'dtype') { draft.type = a.dataset.t; return render() }
  if (act === 'dtopic') { draft.topic = a.dataset.t; return render() }
  if (act === 'dwho') { draft.who = Number(a.dataset.w); return render() }
  if (act === 'assign') {
    const t = TOPICS.find(x => x.id === draft.topic)
    const title = t.title
    const who = [13, 2, ui.small.size || 3, 13][draft.who]
    ASSIGNMENTS.unshift({ id:'n' + Date.now(), type:'path', title, teks:t.teks, cls:'2nd Grade · Room 104', assigned:'Oct 22', due:'Oct 31', status:'scheduled', done:0 })
    ui.drawer = null; ui.tab = 'scheduled'; go('assignments'); return toast(`${title} assigned to ${who} students, starting Oct 22`)
  }
  if (act === 'group') { ['ahayes','emontagne','lhouser'].forEach(id => ui.small.add(id)); ui.drawer = null; render(); return toast('Small group made: A Hayes, E Montagne, L Houser. They\'re tagged on Lit Lab Progress.') }
  if (act === 'small') { const id = a.dataset.id; ui.small.has(id) ? ui.small.delete(id) : ui.small.add(id); render(); return toast(ui.small.has(id) ? `${byId[id].name} added to your small group` : `${byId[id].name} removed from your small group`) }
  if (act === 'shout') { const v = R.getElementById('shout')?.value.trim(); return toast(v ? `Shout-out sent to ${byId[a.dataset.id].name}` : 'Write a shout-out first') }
  if (act === 'nudge') return toast('Nudge sent to H Scott2 and S Caffey: "Your Author\'s Purpose trail is waiting!"')
  if (act === 'coin') { const s = byId[a.dataset.id]; gifts[s.id] = (gifts[s.id] || 0) + 5; render(); return toast(`Gifted 5 coins to ${s.name}`) }
  if (act === 'feed') { ui.feed = a.dataset.k; return render() }
  if (act === 'toast') return toast(a.dataset.msg)
}
function onKey(e) { if (e.key === 'Escape') { if (acctOpen) { acctOpen = false; return paintAcct() } if (ui.drawer) { ui.drawer = null; render() } } }
function onChange(e) { if (e.target.id === 'cls' && e.target.value === 'All classes') { toast('All classes would combine every section; this sample has one class'); e.target.value = '2nd Grade · Room 104' } }
function onMenu() {
  const app = R.getElementById('app')
  if (matchMedia('(max-width:860px)').matches) app.classList.toggle('open')
  else app.classList.toggle('collapsed')
}
const viewFromHash = () => { const k = location.hash.replace(/^#teacher\/?/, ''); return VIEWS.includes(k) ? k : 'home' }
function onHash() { if (!/^#teacher/.test(location.hash)) return; const k = viewFromHash(); if (k !== ui.view) go(k) }

/* ---------- account switcher ---------- */
let acctOpen = false, studentLabel = 'Student', onStudent = () => {}
function paintAcct() {
  const m = R.getElementById('acct-menu'), b = R.getElementById('acct-btn')
  m.hidden = !acctOpen
  b.setAttribute('aria-expanded', String(acctOpen))
}
function switchAccount(e) {
  const k = e.target.closest('[data-acct]').dataset.acct
  if (k === 'toggle') { acctOpen = !acctOpen; return paintAcct() }
  acctOpen = false; paintAcct()
  if (k === 'student') onStudent()
}

/** Draws the teacher side into a shadow root. Returns a function that takes it down. */
export function mountTeacher(root, opts = {}) {
  R = root
  BASE = opts.base || '/'
  CLASSCADE = opts.classcade || ''
  studentLabel = opts.studentLabel || studentLabel
  onStudent = opts.onStudent || onStudent
  R.innerHTML = `<style>${opts.css || ''}</style><div class="tv-root">${SHELL.replace('__LOGO__', opts.logo || '').replace('__STUDENT__', studentLabel)}</div>`
  R.addEventListener('click', onClick)
  R.addEventListener('change', onChange)
  R.getElementById('menu').addEventListener('click', onMenu)
  document.addEventListener('keydown', onKey)
  window.addEventListener('hashchange', onHash)
  ui.view = viewFromHash()
  render()
  return () => {
    R.removeEventListener('click', onClick)
    R.removeEventListener('change', onChange)
    document.removeEventListener('keydown', onKey)
    window.removeEventListener('hashchange', onHash)
    R.innerHTML = ''
  }
}
