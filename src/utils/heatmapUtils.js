import { format, subDays } from 'date-fns'

// Maps count to intensity level 0-4 with improved gradations
export const getIntensityLevel = (count) => {
  if (!count || count === 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

// Converts Redux entries array to react-activity-calendar format
// Returns 365 days — missing dates filled with count 0
export const entriesToHeatmapData = (entries = []) => {
  // Count entries per date
  const countByDate = {}
  entries.forEach(entry => {
    const dateStr = entry.date
    if (dateStr) {
      countByDate[dateStr] = (countByDate[dateStr] || 0) + 1
    }
  })

  // Build 365 day array ending today
  const today = new Date()
  const result = []

  for (let i = 364; i >= 0; i--) {
    const date = subDays(today, i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const count = countByDate[dateStr] || 0

    result.push({
      date: dateStr,
      count,
      level: getIntensityLevel(count)
    })
  }

  return result
}
