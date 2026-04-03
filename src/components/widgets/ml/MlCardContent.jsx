// MLCardContent.jsx — stat content inside the ML Learning widget card
// Props:
//   entries → array of ALL ml entries for this widget from supabase
//   accent  → widget.color

export default function MLCardContent({ entries, accent }) {

  // TODO: compute these from entries array
  const minsToday = 0            // sum of payload.duration_mins for today's entries
  const hoursToday = 0           // minsToday / 60 — display as e.g. "1.5h"
  const streakDays = 0           // consecutive days with at least 1 entry
  const topicsAllTime = 0        // total unique payload.topic values across all entries
  const hoursThisWeek = 0        // sum of duration_mins this week / 60

  // TODO: get last entry
  const lastTopic = '—'          // last entry's payload.topic
  const lastResourceType = '—'   // last entry's payload.resource_type → 'video' | 'article' | 'course' | 'book' | 'paper' | 'podcast'

  // TODO: resource type badge color
  const resourceColors = {
    video:   { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6' },
    article: { bg: 'rgba(74,158,237,0.15)', text: '#4a9eed' },
    course:  { bg: 'rgba(34,197,94,0.15)',  text: '#22c55e' },
    book:    { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    paper:   { bg: 'rgba(236,72,153,0.15)', text: '#ec4899' },
    podcast: { bg: 'rgba(6,182,212,0.15)',  text: '#06b6d4' },
  }
  const resColor = resourceColors[lastResourceType] ?? resourceColors.video

  return (
    <>
      {/* Stat grid — 2x2 */}
      <div className="grid grid-cols-2 gap-[7px] mb-3">

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Time today</div>
          {/* TODO: format as "1.5h" or "45m" depending on duration */}
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>
            {hoursToday > 0 ? `${hoursToday.toFixed(1)}h` : `${minsToday}m`}
          </div>
          <div className="text-[9px] text-slate-500 mt-[2px]">studied</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Streak</div>
          <div className="text-[19px] font-bold leading-none text-amber-400">🔥 {streakDays}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">days in a row</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Topics done</div>
          <div className="text-[19px] font-bold leading-none text-slate-200">{topicsAllTime}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">all time</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">This week</div>
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>
            {hoursThisWeek.toFixed(1)}h
          </div>
          <div className="text-[9px] text-slate-500 mt-[2px]">total time</div>
        </div>

      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06] mb-3" />

      {/* Last topic row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-slate-500">Last topic</span>
        <span className="text-[11px] text-slate-200 font-medium truncate max-w-[140px]">
          {lastTopic}
        </span>
      </div>

      {/* Resource type row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-slate-500">Resource</span>
        <span
          className="text-[10px] font-semibold px-2 py-[1px] rounded-full capitalize"
          style={{ background: resColor.bg, color: resColor.text }}
        >
          {lastResourceType}
        </span>
      </div>
    </>
  )
}