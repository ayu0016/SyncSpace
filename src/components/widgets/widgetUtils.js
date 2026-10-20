import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  parseISO,
  isToday,
  isYesterday,
  subDays,
  isWithinInterval,
  differenceInDays,
  startOfDay
} from "date-fns";

/* =========================
   🔹 1. BUILT-IN CONFIGURATION
   ========================= 
   Rules for your official, hardcoded widgets.
*/
const WIDGET_CONFIG = {
  dsa: { sums: [], tops: ["topic", "platform"] },
  gym: { sums: ["calories", "protein_g"], tops: ["exercise"] },
  ml:  { sums: ["duration_mins"], tops: ["topic", "resource_type"] },
  kanban: { sums: [], tops: ["priority"] } 
};

/* =========================
   🔹 2. ANALYTICS ENGINE
   ========================= 
   The raw math functions (Time buckets, Streaks, Sums)
*/
const AnalyticsEngine = {
  getBuckets(entries = []) {
    if (!entries.length) {
      return {
        streak: 0, totalEntries: 0, entriesToday: [], entriesYesterday: [], entriesThisWeek: [], allEntries: [], latestEntry: null
      };
    }

    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    const entriesToday = entries.filter(entry => isToday(parseISO(entry.date)));
    const entriesYesterday = entries.filter(entry => isYesterday(parseISO(entry.date)));
    const entriesThisWeek = entries.filter(entry => isWithinInterval(parseISO(entry.date), { start: sevenDaysAgo, end: now }));

    // 🔥 STREAK CALCULATOR
    const uniqueDates = [...new Set(entries.map(entry => entry.date))];
    let streak = 0;
    let currentDateToCheck = startOfDay(now);

    for (const dateStr of uniqueDates) {
      const entryDate = startOfDay(parseISO(dateStr));
      const diff = differenceInDays(currentDateToCheck, entryDate);

      if (diff === 0 || diff === 1) {
        streak++;
        currentDateToCheck = entryDate;
      } else break;
    }

    return {
      streak,
        totalEntries: entries.length, 
        entriesToday, 
        entriesYesterday, 
        entriesThisWeek, 
        allEntries: entries, 
        latestEntry: entries[0]
    };
  },

  sum(entries = [], field) {
    return entries.reduce((sum, entry) => sum + (entry.payload?.[field] || 0), 0);
  },

  getTop(entries = [], field) {
    if (!entries.length) return "—";
    const freq = entries.reduce((acc, entry) => {
      const val = entry.payload?.[field];
      if (!val) return acc;
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  },

  vsYesterday(today, yesterday) {
    const diff = today - yesterday;
    if (diff > 0) return `+${diff} vs yesterday`;
    if (diff < 0) return `${diff} vs yesterday`;
    return "same as yesterday";
  }
};

/* =========================
   🔹 3. THE SMART HOOK
   ========================= 
   Takes the full widget object, fetches from Redux, and runs the Engine.
*/
export const useAnalytics = (widget) => {
  
  // 1. Determine the Rules (Hybrid Logic)
  const sumsKey = (widget?.type === 'custom' ? widget?.config?.sums : WIDGET_CONFIG[widget?.type]?.sums)?.join(',') || '';
  const topsKey = (widget?.type === 'custom' ? widget?.config?.tops : WIDGET_CONFIG[widget?.type]?.tops)?.join(',') || '';

  const fieldsToSum = useMemo(() => (sumsKey ? sumsKey.split(',') : []), [sumsKey]);
  const topFields = useMemo(() => (topsKey ? topsKey.split(',') : []), [topsKey]);

  // 2. Fetch data from Redux safely
  const entries = useSelector(
    state => state.entries.entries[widget?.id] || []
  );

  // 3. Generate Time Buckets
  const buckets = useMemo(() => AnalyticsEngine.getBuckets(entries), [entries]);

  // --- DYNAMIC STAT GENERATOR HELPER ---
  const generateStatsForBucket = useCallback((bucket) => {
    const stats = { total: bucket.length };
    fieldsToSum.forEach(field => {
      stats[field] = AnalyticsEngine.sum(bucket, field);
    });
    return stats;
  }, [fieldsToSum]);

  // 4. Generate the Period Stats
  const todayStats = useMemo(() => generateStatsForBucket(buckets.entriesToday), [buckets.entriesToday, generateStatsForBucket]);
  const yesterdayStats = useMemo(() => generateStatsForBucket(buckets.entriesYesterday), [buckets.entriesYesterday, generateStatsForBucket]);
  const weekStats = useMemo(() => generateStatsForBucket(buckets.entriesThisWeek), [buckets.entriesThisWeek, generateStatsForBucket]);

  // 5. Generate Comparisons (+/- vs yesterday)
  const comparisons = useMemo(() => ({ 
    totalVsYesterday: AnalyticsEngine.vsYesterday(todayStats.total, yesterdayStats.total) 
  }), [todayStats.total, yesterdayStats.total]);

  // 6. Generate Insights (Top Values)
  const insights = useMemo(() => {
    const result = {};
    topFields.forEach(field => {
      // Capitalize first letter for a clean object key (e.g. 'topic' -> 'topTopic')
      const keyName = `top${field.charAt(0).toUpperCase() + field.slice(1)}`;
      result[keyName] = AnalyticsEngine.getTop(entries, field);
    });
    return result;
  }, [entries, topFields]);

  // 7. Return everything to the UI component
  return {
    entries,
    totalEntries: entries.length,
    buckets,
    todayStats,
    yesterdayStats,
    weekStats,
    comparisons,
    insights
  };
};