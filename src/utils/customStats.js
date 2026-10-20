import {
  startOfWeek,
  endOfWeek,
  subWeeks,
  format,
  parseISO,
  isWithinInterval,
} from 'date-fns'
import { calcStreak, calcBestStreak, calcThisWeek } from './streakUtils'
import { formatShortDate } from './dateUtils'

/**
 * Sum duration_mins across all entries and convert to hours.
 * @param {Array} entries - array of entry objects with payload.duration_mins
 * @returns {string} e.g. "12.5"
 */
export function getTotalHours(entries) {
  if (!entries || entries.length === 0) return '0'
  const totalMins = entries.reduce((sum, e) => {
    const mins = Number(e.payload?.duration_mins) || 0
    return sum + mins
  }, 0)
  const hours = totalMins / 60
  return hours === 0 ? '0' : hours.toFixed(1)
}

/**
 * Sum duration_mins in current ISO week (Mon–Sun) and convert to hours.
 * @param {Array} entries - array of entry objects
 * @returns {string} e.g. "3.5" or "0"
 */
export function getThisWeekHours(entries) {
  if (!entries || entries.length === 0) return '0'
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

  const weekEntries = entries.filter(e => {
    const dStr = e.date || e.entry_date
    if (!dStr) return false
    try {
      const d = parseISO(dStr)
      return isWithinInterval(d, { start: weekStart, end: weekEnd })
    } catch {
      return false
    }
  })

  const totalMins = weekEntries.reduce((sum, e) => {
    return sum + (Number(e.payload?.duration_mins) || 0)
  }, 0)
  const hours = totalMins / 60
  return hours === 0 ? '0' : hours.toFixed(1)
}

/**
 * Average of payload.rating over the last `n` entries by date (newest first).
 * @param {Array} entries - array of entry objects with payload.rating and .date
 * @param {number} n - how many recent entries to average (default all)
 * @returns {string} e.g. "4.2" or "-" if no entries with a rating
 */
export function getAvgRating(entries, n = null) {
  if (!entries || entries.length === 0) return '-'

  // Sort newest first by date
  const sorted = [...entries].sort((a, b) => {
    const dateA = a.date || a.entry_date || ''
    const dateB = b.date || b.entry_date || ''
    if (dateA > dateB) return -1
    if (dateA < dateB) return 1
    return 0
  })

  const target = n ? sorted.slice(0, n) : sorted
  const ratings = target
    .map(e => Number(e.payload?.rating))
    .filter(r => r > 0 && !Number.isNaN(r))

  if (ratings.length === 0) return '-'

  const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
  return avg.toFixed(1)
}

/**
 * Map total minutes per date: { [date]: minutes }
 * Used by ActivityHeatmap renderTooltip.
 *
 * @param {Array} entries
 * @returns {Record<string, number>}
 */
export function getTotalMinutesByDate(entries) {
  if (!entries || entries.length === 0) return {}
  const map = {}
  entries.forEach(e => {
    const d = e.date || e.entry_date
    if (!d) return
    const mins = Number(e.payload?.duration_mins) || 0
    map[d] = (map[d] || 0) + mins
  })
  return map
}

/**
 * Last `weeks` ISO weeks (Mon–Sun), including weeks with zero hours.
 *
 * @param {Array} entries
 * @param {number} weeks - default 8
 * @returns {Array<{ weekStart: string, label: string, hours: number, value: number }>}
 */
export function getWeeklyHours(entries = [], weeks = 8) {
  const result = []
  const now = new Date()
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })

  // Build weeks chronological: oldest first to newest
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = subWeeks(currentWeekStart, i)
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

    const weekEntries = entries.filter(e => {
      const dStr = e.date || e.entry_date
      if (!dStr) return false
      try {
        const d = parseISO(dStr)
        return isWithinInterval(d, { start: weekStart, end: weekEnd })
      } catch {
        return false
      }
    })

    const totalMins = weekEntries.reduce((sum, e) => {
      return sum + (Number(e.payload?.duration_mins) || 0)
    }, 0)

    const hours = Number((totalMins / 60).toFixed(1))

    result.push({
      weekStart: format(weekStart, 'yyyy-MM-dd'),
      label: format(weekStart, 'MMM d'),
      hours,
      value: hours,
    })
  }

  return result
}

/**
 * Last `n` entries by date ascending with valid rating (1-5).
 *
 * @param {Array} entries
 * @param {number} n - default 12
 * @returns {Array<{ date: string, label: string, value: number, rating: number }>}
 */
export function getRatingTrend(entries = [], n = 12) {
  if (!entries || entries.length === 0) return []

  const withRating = entries
    .filter(e => {
      const r = Number(e.payload?.rating)
      return !Number.isNaN(r) && r >= 1 && r <= 5
    })
    .sort((a, b) => {
      const dateA = a.date || a.entry_date || ''
      const dateB = b.date || b.entry_date || ''
      if (dateA < dateB) return -1
      if (dateA > dateB) return 1
      return 0
    })

  const slice = withRating.slice(-n)

  return slice.map(e => {
    const dStr = e.date || e.entry_date
    const r = Number(e.payload?.rating)
    return {
      date: dStr,
      label: dStr ? formatShortDate(dStr) : '—',
      value: r,
      rating: r,
    }
  })
}

/**
 * Breakdown of choice field options sorted descending by count.
 * Counts by the stored value in payload so legacy or custom-typed options
 * are preserved even if options in config are later renamed or removed.
 *
 * @param {Array} entries
 * @param {string} fieldKey - e.g. "f2"
 * @param {Array<string>} [options=[]] - predefined options from config
 * @returns {Array<{ label: string, count: number }>}
 */
export function getChoiceBreakdown(entries = [], fieldKey, options = []) {
  if (!fieldKey) return []
  const countMap = {}

  // Initialize with predefined options so they appear in legend even if 0
  if (Array.isArray(options)) {
    options.forEach(opt => {
      if (opt) countMap[opt] = 0
    })
  }

  // Count actual stored entries
  entries.forEach(e => {
    const val = e.payload?.[fieldKey]
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      const label = String(val).trim()
      countMap[label] = (countMap[label] || 0) + 1
    }
  })

  return Object.entries(countMap)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Time series of a number field's values, last `n` entries date ascending.
 * Skips entries where the value is not a finite number.
 *
 * @param {Array} entries
 * @param {string} fieldKey - e.g. "f3"
 * @param {number} n - default 20
 * @returns {Array<{ date: string, label: string, value: number }>}
 */
export function getNumberSeries(entries = [], fieldKey, n = 20) {
  if (!fieldKey || !entries || entries.length === 0) return []

  const valid = entries
    .filter(e => {
      const val = e.payload?.[fieldKey]
      if (val === undefined || val === null || val === '') return false
      const num = Number(val)
      return Number.isFinite(num)
    })
    .sort((a, b) => {
      const dateA = a.date || a.entry_date || ''
      const dateB = b.date || b.entry_date || ''
      if (dateA < dateB) return -1
      if (dateA > dateB) return 1
      return 0
    })

  const slice = valid.slice(-n)

  return slice.map(e => {
    const dStr = e.date || e.entry_date
    const val = Number(e.payload[fieldKey])
    return {
      date: dStr,
      label: dStr ? formatShortDate(dStr) : '—',
      value: val,
    }
  })
}

/**
 * Case-insensitive search across notes and the values of all custom fields.
 *
 * @param {Object} entry
 * @param {Array} fields - config.fields
 * @param {string} query
 * @returns {boolean}
 */
export function matchesKeyword(entry, fields = [], query = '') {
  if (!query || !query.trim()) return true
  const q = query.trim().toLowerCase()

  // Match notes
  if (entry.payload?.notes && String(entry.payload.notes).toLowerCase().includes(q)) {
    return true
  }

  // Match custom field values
  if (Array.isArray(fields)) {
    for (const f of fields) {
      const val = entry.payload?.[f.key]
      if (val !== undefined && val !== null && String(val).toLowerCase().includes(q)) {
        return true
      }
    }
  }

  return false
}

/**
 * Format minutes into "45m" or "1h 15m" or "2h"
 *
 * @param {number} mins
 * @returns {string}
 */
export function formatDuration(mins) {
  const n = Number(mins)
  if (!n || n <= 0) return '0m'
  if (n < 60) return `${n}m`
  const h = Math.floor(n / 60)
  const rem = n % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

export { calcStreak, calcBestStreak, calcThisWeek }
