// GymCardContent.jsx — stat content inside the Gym & Diet widget card
// Props:
//   entries → array of ALL gym entries for this widget from supabase
//   accent  → widget.color

export default function GymCardContent({ entries, accent }) {

  // TODO: filter entries by entry_type
  // const workoutEntries = entries.filter(e => e.payload.entry_type === 'workout')
  // const dietEntries    = entries.filter(e => e.payload.entry_type === 'diet')

  // TODO: compute these from workoutEntries
  const exercisesToday = 0       // count of workout entries logged today
  const streakDays = 0           // consecutive days with at least 1 workout entry
  const setsToday = 0            // sum of payload.sets across today's workout entries
  const workoutsThisWeek = 0     // count of unique days with workout entries this week

  // TODO: compute from dietEntries (find today's diet entry if exists)
  const caloriesToday = 0        // today's diet entry payload.calories ?? 0
  const proteinToday = 0         // today's diet entry payload.protein_g ?? 0

  // TODO: get last workout entry
  const lastExerciseName = '—'   // last workout entry's payload.exercise_name
  const lastSets = 0             // last workout entry's payload.sets
  const lastReps = 0             // last workout entry's payload.reps
  const lastWorkoutType = '—'    // last workout entry's payload.workout_type

  return (
    <>
      {/* Stat grid — 2x2 */}
      <div className="grid grid-cols-2 gap-[7px] mb-3">

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Exercises</div>
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>{exercisesToday}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">logged today</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Streak</div>
          <div className="text-[19px] font-bold leading-none text-amber-400">🔥 {streakDays}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">days in a row</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Sets today</div>
          <div className="text-[19px] font-bold leading-none text-slate-200">{setsToday}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">total sets</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Calories</div>
          {/* TODO: show '—' if no diet entry today */}
          <div className="text-[19px] font-bold leading-none" style={{ color: accent }}>{caloriesToday || '—'}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">kcal today</div>
        </div>

      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06] mb-3" />

      {/* Last exercise row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-slate-500">Last exercise</span>
        <span className="text-[11px] text-slate-200 font-medium truncate max-w-[130px]">
          {/* TODO: show "—" if no entries yet */}
          {lastExerciseName} · {lastSets}x{lastReps}
        </span>
      </div>

      {/* Workout type + protein row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] text-slate-500">Protein</span>
        <span
          className="text-[10px] font-semibold px-2 py-[1px] rounded-full"
          style={{ background: `${accent}25`, color: accent }}
        >
          {/* TODO: show '—' if no diet entry today */}
          {proteinToday ? `${proteinToday}g` : '—'}
        </span>
      </div>
    </>
  )
}