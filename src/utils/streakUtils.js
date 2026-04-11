import { parseISO, isToday, isYesterday, subDays, format, startOfWeek, endOfWeek, isWithinInterval,differenceInDays } from 'date-fns'

// Get unique dates from entries array as Set of "YYYY-MM-DD" strings
const getUniqueDates = (entries) => {
  return new Set(entries.map(e => e.date))
}

// Current streak — consecutive days from today going backward
export const calcStreak = (entries) => {
  if (!entries || entries.length === 0) return 0

  const uniqueDates = getUniqueDates(entries)
  let streak = 0
  let current = new Date()

  // if no entry today check if yesterday has entry
  // otherwise streak is already broken
  const todayStr = format(current, 'yyyy-MM-dd')
  const yesterdayStr = format(subDays(current, 1), 'yyyy-MM-dd')

  if (!uniqueDates.has(todayStr) && !uniqueDates.has(yesterdayStr)) return 0

  // start from today or yesterday whichever has an entry
  if (!uniqueDates.has(todayStr)) {
    current = subDays(current, 1)
  }

  while (true) {
    const dateStr = format(current, 'yyyy-MM-dd')
    if (uniqueDates.has(dateStr)) {
      streak++
      current = subDays(current, 1)
    } else {
      break
    }
  }

  return streak
}

// Best streak — longest consecutive day run in full history
export const calcBestStreak = (entries) => {
  if (!entries || entries.length === 0) return 0

  const uniqueDates = [...getUniqueDates(entries)]
    .map(d => parseISO(d))
    .sort((a, b) => a - b)

  if (uniqueDates.length === 0) return 0

  let best = 1
  let current = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = differenceInDays(uniqueDates[i], uniqueDates[i - 1])
    if (diff === 1) {
      current++
      best = Math.max(best, current)
    } else if (diff > 1) {
      current = 1
    }
  }

  return best
}

// Count entries in current ISO week Mon-Sun
export const calcThisWeek = (entries) => {
  if (!entries || entries.length === 0) return 0

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  return entries.filter(e => {
    const date = parseISO(e.date)
    return isWithinInterval(date, { start: weekStart, end: weekEnd })
  }).length
}

// Count distinct dates in current ISO week
export const calcThisWeekDays = (entries) => {
  if (!entries || entries.length === 0) return 0

  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const uniqueDates = new Set(
    entries
      .filter(e => {
        const date = parseISO(e.date)
        return isWithinInterval(date, { start: weekStart, end: weekEnd })
      })
      .map(e => e.date)
  )

  return uniqueDates.size
}