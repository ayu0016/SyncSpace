// CustomCardContent.jsx — stat content inside a custom widget card
// Props:
//   widget → full widget object from supabase (has .config, .color, .icon)
//   accent → widget.color

import { useSelector } from 'react-redux'
import { getTotalHours, getThisWeekHours, getAvgRating, calcStreak } from '../../../utils/customStats'

export default function CustomCardContent({ widget, accent }) {
  const entries = useSelector(state => state.entries.entries[widget.id] || [])

  const totalHours     = getTotalHours(entries)
  const thisWeekHours  = getThisWeekHours(entries)
  const streak         = calcStreak(entries)
  const avgRating      = getAvgRating(entries, 10)

  const hoursDisplay         = totalHours === '0' ? '0h' : `${totalHours}h`
  const thisWeekHoursDisplay = thisWeekHours === '0' ? '0h' : `${thisWeekHours}h`
  const streakDisplay        = `${streak}d`
  const ratingDisplay        = avgRating === '-' ? '-' : `${avgRating}/5`

  return (
    <>
      {/* 2x2 stat layout matching DSA/Gym/ML pattern */}
      <div className="grid grid-cols-2 gap-1.75 mb-3">

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">
            Total Hours
          </div>
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>
            {hoursDisplay}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">logged</div>
        </div>

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">
            This Week
          </div>
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>
            {thisWeekHoursDisplay}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">hours</div>
        </div>

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">
            Streak
          </div>
          <div className="text-[19px] font-bold leading-none text-amber-400">
            {streak > 0 ? `🔥 ${streakDisplay}` : streakDisplay}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">current</div>
        </div>

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">
            Avg Rating
          </div>
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>
            {ratingDisplay}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">last 10</div>
        </div>

      </div>

      {/* Divider */}
      <div className="h-px bg-white/6 mb-3" />

      {/* Field labels row — shows the 3 custom field names as badges */}
      {widget.config?.fields && (
        <div className="flex items-center gap-1.5 mb-3.5 flex-wrap">
          {widget.config.fields.map(f => (
            <span
              key={f.key}
              className="text-[10px] font-semibold px-2 py-px rounded-full"
              style={{ background: `${accent}20`, color: accent }}
            >
              {f.label}
            </span>
          ))}
        </div>
      )}

      {/* Entry count with comfortable gap before the + Log button */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[11px] text-slate-500">Total entries</span>
        <span className="text-[11px] text-slate-200 font-medium">{entries.length}</span>
      </div>
    </>
  )
}
