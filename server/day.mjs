/*
 * The student's day, starting at LOCAL midnight.
 *
 * Every "once a day" rule in the studio (the Daily Revision Challenge, Quick
 * Write, the writing streak, the daily coin caps) used to key off
 * toISOString().slice(0, 10), which is the UTC date. In Texas that rolls over
 * at 7pm, so a student who finished at 6pm got a fresh day an hour later.
 *
 * Shared by the Node server and the in-browser Pages backend. In the browser
 * "local" is the student's clock. On the server it is the server's clock, so a
 * real deployment should run in the district's time zone (TZ=America/Chicago).
 */
const pad = (n) => String(n).padStart(2, '0')
const asDate = (d) => (d instanceof Date ? d : new Date(d ?? Date.now()))

/* 'YYYY-MM-DD' for the local calendar day of a moment (default: now). */
export function localDay(d) {
  const x = asDate(d)
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`
}

/* A whole-number count of local days, for anything that rotates daily. */
export function dayNumber(d) {
  const x = asDate(d)
  return Math.floor(Date.UTC(x.getFullYear(), x.getMonth(), x.getDate()) / 86400000)
}
