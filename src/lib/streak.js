// One writing streak for the whole studio. Quick Write, the Inspiration Hub,
// and Luna all read this so a day that was just counted cannot show up as
// two different numbers.
export function writingStreak(summary) {
  const days = Number(summary?.streakDays) || 0
  const today = new Date().toISOString().slice(0, 10)
  return { days, extendedToday: !!summary?.lastStreakDate && summary.lastStreakDate === today }
}
