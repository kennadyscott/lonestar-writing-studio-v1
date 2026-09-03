// How the content library is organised.
//
// Crystal Writing is the factory; a state's program is what it supplies. Texas
// content feeds LoneStar CR, so "the Texas section" and "LoneStar CR" are the
// same shelf seen from two sides — the platform says state, the classroom says
// product. Keeping state as the organiser rather than the product name is what
// lets a second state arrive without renaming anything.
//
// The domains are the TEKS ELAR strands, in the state's own words. They are not
// derived from the standard code: a publisher picks the domain, because the
// mapping is a curriculum judgement and not ours to infer.

export const STATES = [
  { code: 'TX', name: 'Texas', product: 'LoneStar CR', live: true },
]

export const DOMAINS = {
  TX: [
    'Foundational Language',
    'Comprehension',
    'Response Skills',
    'Multiple Genres',
    "Author's Purpose",
    'Composition',
    'Inquiry and Research',
  ],
}

export const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

export const stateOf = (code) => STATES.find((s) => s.code === code) || null
export const domainsFor = (code) => DOMAINS[code] || []
export const productFor = (code) => stateOf(code)?.product || ''

/* A TEKS code looks like 5.11D(ii) — grade.strand + student expectation, with an
 * optional roman-numeral breakout. Shape only: whether the code exists in the
 * state's standards is a question this app cannot answer, so a code that does
 * not look right is a warning, never a block. */
const SHAPES = {
  // 3.11D (xi) — grade.strand + student expectation, then the breakout, which
  // is the grain content is tagged at. The space is how Texas writes it.
  TX: /^[K\d]{1,2}\.\d{1,2}(?:[A-Z]|\([A-Z]\))?(?:\s?\([ivxl]+\))?$/,
}
export function standardLooksRight(code, state = 'TX') {
  const re = SHAPES[state]
  if (!re) return true
  return re.test(String(code || '').trim())
}

/* One house style for a code, so "5.11D(ii)" and "5.11d (II)" do not become two
 * different tags on two different worksheets. Written the way Texas writes it:
 * 3.11D (xi) — the student expectation letter attached, the breakout in parens.
 *
 * The parenthesised part is ambiguous by itself: in 5.6(F) it is the expectation
 * letter, in 3.9D (i) it is the breakout. Case settles it, which is the same
 * rule the state's own documents follow — expectations are capital letters,
 * breakouts are lowercase roman numerals. Anything this cannot read is returned
 * untouched, so a code is never silently rewritten into something else.
 */
export function normalizeStandard(raw, state = 'TX') {
  const t = String(raw || '').trim().replace(/\s+/g, ' ')
  if (state !== 'TX') return t
  const head = t.match(/^([K\d]{1,2})\.(\d{1,2})/i)
  if (!head) return t

  let rest = t.slice(head[0].length).trim()
  let letter = ''
  let roman = ''

  const bare = rest.match(/^([A-Za-z])(?![A-Za-z])/)
  if (bare) { letter = bare[1].toUpperCase(); rest = rest.slice(1).trim() }

  const paren = rest.match(/^\(\s*([A-Za-z]+)\s*\)$/)
  if (paren) {
    const inner = paren[1]
    if (!letter && inner.length === 1 && inner === inner.toUpperCase()) letter = inner
    else if (/^[ivxl]+$/i.test(inner)) roman = inner.toLowerCase()
    else return t
    rest = ''
  }
  if (rest) return t // not a shape we recognise — leave the publisher's text alone

  return `${head[1].toUpperCase()}.${head[2]}${letter}${roman ? ` (${roman})` : ''}`
}

/* Standards are stored as an array but typed as a comma-separated line. */
export const parseStandards = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean)
export const joinStandards = (a) => (Array.isArray(a) ? a : parseStandards(a)).join(', ')
