// Students see only their own grade in the Proof Room. The demo student is
// Grade 6 but every playable path is Grade 5, so the Proof Room demo runs at
// Grade 5 (her call, 2026-09-24). Used by the page and the Practice feature card.
export const PROOF_DEMO_GRADE = 5

// The prototype band switch (2-3 / 4-5 / 6-8 / 9-12) picks the demo grade: the grade
// in that band with the most paths, or the band's middle when it has none yet.
const BAND_GRADES = { '2-3': [2, 3], '4-5': [4, 5], '6-8': [6, 7, 8], '9-12': [9, 10, 11, 12] }
const BAND_EMPTY = { '2-3': 3, '4-5': 5, '6-8': 7, '9-12': 10 }
export function bandGrade(band, topics) {
  const grades = BAND_GRADES[band]
  if (!grades) return PROOF_DEMO_GRADE
  let best = null, most = 0
  for (const g of grades) {
    const n = (topics || []).filter((tp) => Number(tp.grade) === g).length
    if (n > most) { best = g; most = n }
  }
  return best ?? BAND_EMPTY[band]
}

// The grade whose paths the page shows. A band with no paths of its own yet
// borrows the Grade 5 paths so its look can still be judged (labelled on screen).
export function pathsGrade(band, topics) {
  const g = bandGrade(band, topics)
  return (topics || []).some((tp) => Number(tp.grade) === g) ? g : PROOF_DEMO_GRADE
}
