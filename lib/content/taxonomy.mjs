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
  TX: /^[K\d]{1,2}\.\d{1,2}[A-Z]?(\([ivxIVX]+\))?$/,
}
export function standardLooksRight(code, state = 'TX') {
  const re = SHAPES[state]
  if (!re) return true
  return re.test(String(code || '').trim())
}

/* Standards are stored as an array but typed as a comma-separated line. */
export const parseStandards = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean)
export const joinStandards = (a) => (Array.isArray(a) ? a : parseStandards(a)).join(', ')
