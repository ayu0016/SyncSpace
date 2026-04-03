// this is basically a combination of object based utility functions (AnalyticsEngine) and a custom React hook (useAnalytics) that uses those functions to compute various stats and insights from a user's entries. The idea is to keep all the core logic in one place (AnalyticsEngine) and then have the hook use that logic to provide easy-to-use data for the components.
// it will make my each component file cleaner and focused only on presentation, while all the data crunching happens in this utility file. Plus, if I ever want to add more analytics or change the logic, I can do it here without touching the components.
// best thing ever learned 

import {
  parseISO,
  isToday,
  isYesterday,
  subDays,
  isWithinInterval,
  differenceInDays,
  startOfDay
} from "date-fns"

import { useMemo } from "react"

/* =========================
   🔹 ANALYTICS ENGINE (PURE LOGIC)
   ========================= */

const AnalyticsEngine = {

  getBuckets(entries = []) {
    if (!entries.length) {
      return {
        streak: 0,
        totalEntries: 0,
        entriesToday: [],
        entriesYesterday: [],
        entriesThisWeek: [],
        allEntries: [],
        latestEntry: null
      }
    }

    const now = new Date()
    const sevenDaysAgo = subDays(now, 7)

    const entriesToday = entries.filter(e => isToday(parseISO(e.date)))
    const entriesYesterday = entries.filter(e => isYesterday(parseISO(e.date)))
    const entriesThisWeek = entries.filter(e =>
      isWithinInterval(parseISO(e.date), { start: sevenDaysAgo, end: now })
    )

    // 🔥 Streak Logic
    const uniqueDates = [...new Set(entries.map(e => e.date))]
      .sort((a, b) => b.localeCompare(a))

    let streak = 0
    let currentDateToCheck = startOfDay(now)

    for (const dateStr of uniqueDates) {
      const entryDate = startOfDay(parseISO(dateStr))
      const diff = differenceInDays(currentDateToCheck, entryDate)

      if (diff === 0 || diff === 1) {
        streak++
        currentDateToCheck = entryDate
      } else break
    }

    return {
      streak,
      totalEntries: entries.length,
      entriesToday,
      entriesYesterday,
      entriesThisWeek,
      allEntries: entries,
      latestEntry: entries[0]
    }
  },

  sum(entries, field) {
    return entries.reduce((sum, entry) => {
      return sum + (entry.payload?.[field] || 0)
    }, 0)
  },

  getTop(entries, field) {
    if (!entries.length) return "—"

    const freq = entries.reduce((acc, entry) => {
      const val = entry.payload?.[field]
      if (!val) return acc
      acc[val] = (acc[val] || 0) + 1
      return acc
    }, {})

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"
  },

  vsYesterday(today, yesterday) {
    const diff = today - yesterday
    if (diff > 0) return `+${diff} vs yesterday`
    if (diff < 0) return `${diff} vs yesterday`
    return "same as yesterday"
  }
}

/* =========================
   🔹 CUSTOM HOOK
   ========================= */

export const useAnalytics = (entries = []) => {

  // 🔹 Buckets (core)
  const buckets = useMemo(() => {
    return AnalyticsEngine.getBuckets(entries)
  }, [entries])

  // 🔹 Today stats
  const todayStats = useMemo(() => ({
    total: buckets.entriesToday.length,
    duration: AnalyticsEngine.sum(
      buckets.entriesToday,
      "duration_mins"
    )
  }), [buckets])

  // 🔹 Yesterday stats
  const yesterdayStats = useMemo(() => ({
    total: buckets.entriesYesterday.length,
    duration: AnalyticsEngine.sum(
      buckets.entriesYesterday,
      "duration_mins"
    )
  }), [buckets])

  // 🔹 Weekly stats
  const weekStats = useMemo(() => ({
    total: buckets.entriesThisWeek.length,
    duration: AnalyticsEngine.sum(
      buckets.entriesThisWeek,
      "duration_mins"
    )
  }), [buckets])

  // 🔹 Comparisons
  const comparisons = useMemo(() => ({
    todayVsYesterday: AnalyticsEngine.vsYesterday(
      todayStats.total,
      yesterdayStats.total
    ),
    durationVsYesterday: AnalyticsEngine.vsYesterday(
      todayStats.duration,
      yesterdayStats.duration
    )
  }), [todayStats, yesterdayStats])

  // 🔹 Insights
  const insights = useMemo(() => ({
    topTopic: AnalyticsEngine.getTop(entries, "topic"),
    topPlatform: AnalyticsEngine.getTop(entries, "platform")
  }), [entries])

  return {
    buckets,
    todayStats,
    yesterdayStats,
    weekStats,
    comparisons,
    insights
  }
}

/* =========================
   🔹 EXPORT (OPTIONAL)
   ========================= */

export { AnalyticsEngine }