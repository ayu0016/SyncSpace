// GymCardContent.jsx — stat content inside the Gym & Diet widget card
// Props:
//   widget → full widget object from supabase
//   accent → widget.color

import { useAnalytics } from "../widgetUtils"

export default function GymCardContent({ widget, accent }) {

  const { buckets, todayStats } = useAnalytics(widget)
  const exercisesToday = buckets.entriesToday
    .filter(e => e.payload?.entry_type === 'workout').length

  const streakDays = buckets.streak

  const workoutTypesToday = [...new Set(
    buckets.entriesToday
      .filter(e => e.payload?.entry_type === 'workout')
      .map(e => e.payload?.workout_type)
      .filter(Boolean)
  )].join(' · ') || '—'

  // TODO: calories from today's diet entry via sumPayloadField
  const caloriesToday = todayStats.calories

  // TODO: protein from today's diet entry
  const proteinToday = todayStats.protein_g
  
  // TODO: last entry — already sorted newest first from supabase
  const lastEntry        = buckets.latestEntry
  const lastExerciseName = lastEntry?.payload?.exercise_name ?? '—'
  const lastSets         = lastEntry?.payload?.sets          ?? 0
  const lastReps         = lastEntry?.payload?.reps          ?? 0

  return (
    <>
      {/* Stat grid — 2x2 */}
      <div className="grid grid-cols-2 gap-1.75 mb-3">

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Exercises</div>
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>{exercisesToday}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">logged today</div>
        </div>

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Streak</div>
          {/* hide flame if streakDays is 0 */}
          <div className="text-[19px] font-bold leading-none text-amber-400">
            {streakDays > 0 ? `🔥 ${streakDays}` : '0'}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">days in a row</div>
        </div>

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Workout type</div>
          {/* shows "Push · Legs" if multiple, "Push" if one, "—" if none today */}
          <div
            className="text-[14px] font-bold leading-none truncate mt-1"
            style={{ color: accent }}
          >
            {workoutTypesToday}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">today</div>
        </div>

        <div className="bg-white/4 rounded-[9px] p-2.5">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Calories</div>
          {/* shows '—' if no diet entry logged today */}
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>
            {caloriesToday || '—'}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">kcal today</div>
        </div>

      </div>

      {/* Divider */}
      <div className="h-px bg-white/6 mb-3" />

      {/* Last exercise row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-slate-500">Last exercise</span>
        <span className="text-[11px] text-slate-200 font-medium truncate max-w-32.5">
          {/* shows "—" if no workout entries yet */}
          {lastExerciseName !== '—'
            ? `${lastExerciseName} · ${lastSets}x${lastReps}`
            : '—'
          }
        </span>
      </div>

      {/* Protein row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-slate-500">Protein</span>
        <span
          className="text-[10px] font-semibold px-2 py-px rounded-full"
          style={{ background: `${accent}25`, color: accent }}
        >
          {/* shows '—' if no diet entry today */}
          {proteinToday ? `${proteinToday}g` : '—'}
        </span>
      </div>
    </>
  )
}