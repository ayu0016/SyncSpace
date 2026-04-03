// DSACardContent.jsx — stat content inside the DSA widget card
// Props:
//   entries → array of today's DSA entries from supabase for this widget
//   accent  → widget.color passed down from parent for pill/tag coloring

export default function DSACardContent({ entries, accent }) {

  // TODO: compute these from entries array
  const solvedToday = 0          // count of entries logged today
  const vsYesterday = 0          // solvedToday minus count from yesterday (can be negative)
  const streakDays = 0           // consecutive days with at least 1 entry — compute from all entries
  const totalSolved = 0          // total entry count all time
  const thisWeek = 0             // count of entries in current week (Mon–today)

  // TODO: get last entry from entries array (entries[entries.length - 1])
  const lastProblemTitle = '—'   // last entry's payload.problem_title
  const lastDifficulty = '—'     // last entry's payload.difficulty → 'easy' | 'medium' | 'hard'
  const topTopic = '—'           // most frequent payload.topic across all entries

  // TODO: difficulty badge color helper
  // easy → green, medium → amber, hard → red
  const difficultyColor = {
    easy:   { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e' },
    medium: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    hard:   { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444' },
  }
  const diff = difficultyColor[lastDifficulty] ?? difficultyColor.easy

  return (
    <>
      {/* Stat grid — 2x2 */}
      <div className="grid grid-cols-2 gap-[7px] mb-3">

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Solved today</div>
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>{solvedToday}</div>
          {/* show +N vs yesterday, or -N, or "same as yesterday" */}
          <div className="text-[9px] text-slate-500 mt-[2px]">
            {vsYesterday > 0 ? `+${vsYesterday} vs yesterday` : vsYesterday < 0 ? `${vsYesterday} vs yesterday` : 'same as yesterday'}
          </div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Streak</div>
          {/* TODO: show flame emoji only if streakDays > 0 */}
          <div className="text-[19px] font-bold leading-none text-amber-400">🔥 {streakDays}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">days in a row</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Total solved</div>
          <div className="text-[19px] font-bold leading-none text-green-400">{totalSolved}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">all time</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">This week</div>
          <div className="text-[19px] font-bold leading-none text-slate-200">{thisWeek}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">problems</div>
        </div>

      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06] mb-3" />

      {/* Last solved row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-slate-500">Last solved</span>
        <div className="flex items-center gap-[5px]">
          <span className="text-[11px] text-slate-200 font-medium max-w-[100px] truncate">
            {lastProblemTitle}
          </span>
          {/* Difficulty badge */}
          <span
            className="text-[10px] font-semibold px-2 py-[1px] rounded-full"
            style={{ background: diff.bg, color: diff.text }}
          >
            {lastDifficulty}
          </span>
        </div>
      </div>

      {/* Top topic row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-slate-500">Top topic</span>
        <span
          className="text-[10px] font-semibold px-2 py-[1px] rounded-full"
          style={{ background: `${accent}25`, color: accent }}
        >
          {topTopic}
        </span>
      </div>
    </>
  )
}