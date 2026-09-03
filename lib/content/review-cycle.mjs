// When Texas reviews its standards, and what that means for content built now.
//
// Every milestone below is a dated entry from the SBOE-approved "TEKS Review and
// Revision and IMRA Review Timeline" (approved 22 November 2024), not a summary
// of it. The distinction that matters most is buried in that document: the
// Reading Language Arts work beginning this school year is the VOCABULARY AND
// BOOK LIST, not a rewrite of the ELAR content standards. Reading "RLA review
// begins 2026-27" as "the standards we build against are about to change" would
// be the wrong conclusion and an expensive one.
//
// Source: https://tea.texas.gov/about-tea/newsroom/media/sboe-teks-imra-timelines-approved-112224-1.pdf

export const TIMELINE_SOURCE = {
  title: 'SBOE TEKS Review and Revision and IMRA Review Timeline',
  approved: 'Approved 22 November 2024',
  url: 'https://tea.texas.gov/about-tea/newsroom/media/sboe-teks-imra-timelines-approved-112224-1.pdf',
}

export const SUBJECT_STATUS = [
  {
    subject: 'ELAR',
    adopted: '2017',
    docVintage: 'August 2019 update',
    inEffect: true,
    headline: 'Stable. The standards you are building against are not being rewritten in this cycle.',
    detail:
      'The Reading Language Arts work that begins this school year covers the vocabulary and book list, not the content standards. The next time the ELAR standards themselves could change for classrooms is the 2029 review, implementing August 2030 at the earliest.',
    milestones: [
      { when: 'Apr 2026', what: 'TEKS adoption / proclamation — vocabulary and book list, RLA K-12', past: true },
      { when: 'Apr 2027', what: 'IMRA rubric approval, RLA K-12' },
      { when: 'May-Aug 2029', what: 'IMRA reviews, RLA' },
      { when: 'Nov 2029', what: 'Instructional materials approval, RLA' },
      { when: 'Aug 2030', what: 'Implementation — possibly staggered to 2031 and 2032', key: true },
    ],
  },
  {
    subject: 'Math',
    adopted: '2012 (grade level) · 2025 (advanced 6-8)',
    docVintage: 'December 2014 update (elementary) · July 2025 update (middle school)',
    inEffect: true,
    headline: 'Grade-level standards are old but current. A new advanced course arrived in 2025.',
    detail:
      'The K-8 grade-level mathematics standards have been in effect since 2012. Middle School Advanced Mathematics was adopted April 2025 and is a separate course sharing the same codes — the catalog keeps them apart. A full mathematics TEKS review sits later in the plan, after the 2029 IMRA cycle.',
    milestones: [
      { when: 'Aug 2025', what: 'IMRA implementation, math K-12', past: true },
      { when: 'May-Aug 2026', what: 'IMRA reviews, math 6-7 advanced', past: true },
      { when: 'Nov 2026', what: 'Instructional materials approval, math 6-7 advanced' },
      { when: 'Aug 2027', what: 'IMRA implementation, math 6-7 advanced', key: true },
    ],
  },
  {
    subject: 'Science',
    adopted: '2021',
    docVintage: 'August 2024 update',
    inEffect: true,
    headline: 'Recently refreshed. Implemented August 2024, nothing changing soon.',
    detail: 'The next review cycle produces materials for August 2030.',
    milestones: [
      { when: 'Aug 2024', what: 'TEKS and instructional materials implementation, science K-12', past: true },
      { when: 'Apr 2027', what: 'IMRA rubric approval, science K-12' },
      { when: 'May-Aug 2029', what: 'IMRA reviews, science K-12' },
      { when: 'Aug 2030', what: 'IMRA implementation', key: true },
    ],
  },
  {
    subject: 'Social Studies',
    adopted: '2022',
    docVintage: 'August 2024 update',
    inEffect: true,
    warn: true,
    headline: 'Confirm before building. A revision was scheduled for adoption in April/June 2026.',
    detail:
      'The SBOE began revising social studies in April 2025 with adoption planned for April or June 2026, which has now passed. The chapter document currently published as in effect is still the 2022 version, and TEA pages do not state plainly whether the new standards were adopted or when they take effect. Anything built against the 2022 standards should be checked with TEA first — teks@tea.texas.gov or (512) 463-9581.',
    milestones: [
      { when: 'Apr 2025', what: 'SBOE begins revision process, social studies K-12', past: true },
      { when: 'Apr/Jun 2026', what: 'TEKS adoption / proclamation issued — status unconfirmed', past: true, warn: true },
      { when: 'Apr 2027', what: 'IMRA rubric approval, social studies K-12' },
      { when: 'May-Aug 2029', what: 'IMRA reviews, social studies' },
      { when: 'Nov 2029', what: 'Instructional materials approval' },
    ],
  },
]
