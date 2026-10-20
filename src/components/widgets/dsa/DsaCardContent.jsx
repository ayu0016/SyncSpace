// DSACardContent.jsx — stat content inside the DSA widget card
// Props:
//   widget → full widget object from supabase
//   accent → widget.color

import { useAnalytics } from '../widgetUtils'

export default function DSACardContent({ widget, accent }) {

  const { buckets, totalEntries, todayStats, weekStats, comparisons, insights } = useAnalytics(widget)

  // TODO: one entry = one problem solved
  const solvedToday     = todayStats.total
  const vsYesterday     = comparisons.totalVsYesterday
  const totalSolved     = totalEntries
  const thisWeek        = weekStats.total
  const streakDays      = buckets.streak

  // TODO: last entry already sorted newest first from supabase
  const lastEntry        = buckets.latestEntry
  const lastProblemTitle = lastEntry?.payload?.problem_title ?? '—'
  const lastDifficulty   = lastEntry?.payload?.difficulty    ?? '—'

  // top topic from insights — powered by getTop in analytics engine
  const topTopic = insights.topTopic ?? insights.topic ?? '—'

  // difficulty badge color — easy → green, medium → amber, hard → red
  const difficultyColor = {
    easy:   { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e' },
    medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    hard:   { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444' },
  }
  const diff = difficultyColor[lastDifficulty] ?? { bg: 'rgba(100,116,139,0.15)', text: '#64748b' }

  return (
    <>
      {/* Stat grid — 2x2 */}
      <div className="grid grid-cols-2 gap-1.75 mb-3">

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Solved today</div>
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>{solvedToday}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">
            {vsYesterday}
          </div>
        </div>

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Streak</div>
          {/* flame only shows if streak > 0 */}
          <div className="text-[19px] font-bold leading-none text-amber-400">
            {streakDays > 0 ? `🔥 ${streakDays}` : '0'}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">days in a row</div>
        </div>

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Total solved</div>
          <div className="text-[19px] font-bold leading-none text-green-400">{totalSolved}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">all time</div>
        </div>

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">This week</div>
          <div className="text-[19px] font-bold leading-none text-slate-200">{thisWeek}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">problems</div>
        </div>

      </div>

      {/* Divider */}
      <div className="h-px bg-white/6 mb-3" />

      {/* Last solved row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-slate-500">Last solved</span>
        <div className="flex items-center gap-1.25">
          <span className="text-[11px] text-slate-200 font-medium max-w-25 truncate">
            {lastProblemTitle}
          </span>
          {/* difficulty badge — only shows if lastDifficulty is known */}
          {lastDifficulty !== '—' && (
            <span
              className="text-[10px] font-semibold px-2 py-px rounded-full capitalize"
              style={{ background: diff.bg, color: diff.text }}
            >
              {lastDifficulty}
            </span>
          )}
        </div>
      </div>

      {/* Top topic row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-slate-500">Top topic</span>
        <span
          className="text-[10px] font-semibold px-2 py-px rounded-full"
          style={{ background: `${accent}25`, color: accent }}
        >
          {topTopic}
        </span>
      </div>
    </>
  )
}