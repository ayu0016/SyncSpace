import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { format, subDays, parseISO, isToday } from 'date-fns'
import { Settings } from 'lucide-react'
import { openModal, setActiveWidget } from '../../store/uiSlice'

// Shared components
import DeepDiveHeader  from '../../components/deepdive/DeepDiveHeader'
import ActivityHeatmap from '../../components/deepdive/ActivityHeatmap'
import RecentLog       from '../../components/deepdive/RecentLog'
import GlassCard       from '../../components/ui/GlassCard'
import SectionLabel    from '../../components/ui/SectionLabel'
import StatsBar        from '../../components/ui/StatsBar'
import TabSwitcher     from '../../components/ui/TabSwitcher'
import LineChart       from '../../components/ui/charts/LineChart'
import BarChart        from '../../components/ui/charts/BarChart'

// Hooks
import useWidgetEntries  from '../../hooks/useWidgetEntries'
import useWidgetConfig   from '../../hooks/useWidgetConfig'

// Utils
import { entriesToHeatmapData }               from '../../utils/heatmapUtils'
import { calcStreak, calcThisWeekDays }       from '../../utils/streakUtils'
import { formatRelativeDate, formatShortDate, getDaysAgo } from '../../utils/dateUtils'

const ACCENT        = '#f59e0b'
const MUSCLE_GROUPS = ['Shoulder','Biceps','Triceps','Chest','Back','Abs','Legs']

// ── RingProgress ──────────────────────────────────────────────────────────────
const RingProgress = ({ percent, color, label, centerValue, subValue }) => {
  const radius          = 50
  const strokeWidth     = 8
  const normalizedRadius = radius - strokeWidth * 2
  const circumference   = normalizedRadius * 2 * Math.PI
  const clampedPercent  = Math.min(percent, 100)
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center w-[120px] h-[120px]">

        {/* SVG ring */}
        <svg
          height="120"
          width="120"
          className="absolute"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            stroke="rgba(255,255,255,0.06)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx="60"
            cy="60"
          />
          {/* Progress arc */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="60"
            cy="60"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: percent >= 100 ? `drop-shadow(0 0 6px ${color}80)` : 'none'
            }}
          />
        </svg>

        {/* Center text */}
        <div className="flex flex-col items-center justify-center absolute text-center">
          <span
            className="font-mono font-bold text-[22px] text-white leading-tight"
          >
            {centerValue}
          </span>
          <span
            className="font-mono text-[11px] leading-tight"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {subValue}
          </span>
        </div>
      </div>

      {/* Label */}
      <span
        className="font-sans font-medium text-[12px] mt-2"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        {label}
      </span>
    </div>
  )
}

// ── GoalsPanel ────────────────────────────────────────────────────────────────
const GoalsPanel = ({ isOpen, onClose, config, onSave }) => {
  const [form, setForm] = useState({
    calorie_target:      config.calorie_target,
    protein_target:      config.protein_target,
    water_target:        config.water_target,
    weekly_workout_goal: config.weekly_workout_goal,
  })

  const fields = [
    { key: 'calorie_target',      label: 'Daily Calorie Target (kcal)' },
    { key: 'protein_target',      label: 'Daily Protein Target (g)'    },
    { key: 'water_target',        label: 'Daily Water Target (ml)'     },
    { key: 'weekly_workout_goal', label: 'Weekly Workout Goal (days)'  },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          style={{ backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-[300px] z-50 transition-transform duration-300"
        style={{
          background:     'rgba(10,10,15,0.97)',
          backdropFilter: 'blur(20px)',
          borderLeft:     '1px solid rgba(255,255,255,0.08)',
          borderTop:      `2px solid ${ACCENT}`,
          transform:      isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div className="p-5">

          {/* Panel header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-sans font-bold text-[16px] text-white">
              Goals
            </h2>
            <button
              onClick={onClose}
              className="font-mono text-[18px] transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >
              ✕
            </button>
          </div>

          <div
            className="h-[1px] w-full mb-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          />

          {/* Default nudge banner */}
          <div
            className="p-2 mb-5 rounded-r-[6px]"
            style={{
              borderLeft: `3px solid ${ACCENT}`,
              background: `${ACCENT}1A`
            }}
          >
            <p
              className="font-sans text-[12px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Using default targets. Personalise them below.
            </p>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-4 mb-6">
            {fields.map(field => (
              <div key={field.key}>
                <label
                  className="block font-mono text-[10px] uppercase tracking-widest mb-1.5"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {field.label}
                </label>
                <input
                  type="number"
                  value={form[field.key]}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    [field.key]: Number(e.target.value)
                  }))}
                  className="w-full rounded-[10px] px-3 py-2 font-mono text-[14px] text-white outline-none transition-all duration-200"
                  style={{
                    background:  'rgba(255,255,255,0.03)',
                    border:      '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${ACCENT}4d`}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 font-sans font-bold text-[13px] py-2 rounded-[8px] transition-colors duration-200"
              style={{
                background: 'transparent',
                border:     '1px solid rgba(255,255,255,0.35)',
                color:      'rgba(255,255,255,0.85)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => { onSave(form); onClose() }}
              className="flex-1 font-sans font-bold text-[13px] py-2 rounded-[8px] transition-all duration-200"
              style={{
                backgroundColor: ACCENT,
                color:           '#0a0a0f',
                boxShadow:       `0 0 12px ${ACCENT}33`
              }}
            >
              Save Goals
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

// ── MuscleBreakdown ───────────────────────────────────────────────────────────
const MuscleBreakdown = ({ workoutEntries }) => {
  const breakdown = useMemo(() => {
    return MUSCLE_GROUPS.map(muscle => {
      // Count distinct dates for this muscle group
      const dates = new Set(
        workoutEntries
          .filter(e => e.payload?.muscle_group?.toLowerCase() === muscle.toLowerCase())
          .map(e => e.date)
      )
      return { name: muscle, days: dates.size }
    })
  }, [workoutEntries])

  const maxDays = Math.max(...breakdown.map(m => m.days), 1)

  return (
    <GlassCard className="p-5 h-full">
      <h3 className="font-sans font-medium text-[14px] text-white mb-1">
        Muscle Groups
      </h3>
      <p
        className="font-sans text-[11px] mb-4"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Unique training days per muscle
      </p>

      <div className="flex flex-col gap-2.5">
        {breakdown.map(muscle => (
          <div
            key={muscle.name}
            className="flex items-center group rounded-[6px] p-1 -mx-1 transition-colors duration-200"
          >
            <span
              className="w-16 font-sans text-[13px] text-white shrink-0"
            >
              {muscle.name}
            </span>
            <div
              className="flex-1 h-[8px] rounded-[4px] mx-3 overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="h-full rounded-[4px] transition-colors duration-200"
                style={{
                  width:           `${(muscle.days / maxDays) * 100}%`,
                  backgroundColor: muscle.days === 0 ? 'rgba(239,68,68,0.4)' : ACCENT
                }}
              />
            </div>
            <span
              className="w-6 text-right font-mono text-[12px]"
              style={{
                color: muscle.days === 0
                  ? 'rgba(239,68,68,0.6)'
                  : 'rgba(255,255,255,0.35)'
              }}
            >
              {muscle.days}d
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// ── BestLiftsBoard ────────────────────────────────────────────────────────────
const BestLiftsBoard = ({ workoutEntries }) => {
  const bestLifts = useMemo(() => {
    const byExercise = {}

    workoutEntries.forEach(e => {
      const name   = e.payload?.exercise_name
      const weight = e.payload?.weight_kg
      const muscle = e.payload?.muscle_group
      if (!name || !weight) return

      if (!byExercise[name] || weight > byExercise[name].weight) {
        byExercise[name] = { weight, muscle, date: e.date, name }
      }
    })

    return Object.values(byExercise)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
  }, [workoutEntries])

  return (
    <GlassCard className="p-5 h-full">
      <h3 className="font-sans font-medium text-[14px] text-white mb-1">
        Best Lifts
      </h3>
      <p
        className="font-sans text-[11px] mb-4"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Personal records by exercise
      </p>

      {bestLifts.length === 0 ? (
        <p
          className="font-sans text-[13px] italic"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          No workout entries yet
        </p>
      ) : (
        <div className="flex flex-col">
          {bestLifts.map((lift, i) => (
            <div
              key={lift.name}
              className="flex justify-between items-center py-2.5 rounded-[6px] -mx-2 px-2 transition-colors duration-200"
              style={{
                borderBottom: i !== bestLifts.length - 1
                  ? '1px solid rgba(255,255,255,0.04)'
                  : 'none'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <p className="font-sans text-[13px] text-white mb-1">
                  {lift.name}
                </p>
                <span
                  className="inline-block font-sans text-[10px] px-1.5 py-0.5 rounded-[4px]"
                  style={{
                    backgroundColor: `${ACCENT}26`,
                    color:           ACCENT
                  }}
                >
                  {lift.muscle}
                </span>
              </div>

              <div className="text-right">
                <p className="font-mono font-bold text-[20px] text-white leading-none mb-1">
                  {lift.weight}
                  <span
                    className="text-[12px] font-normal ml-1"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    kg
                  </span>
                </p>
                <p
                  className="font-mono text-[10px] leading-none"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {formatShortDate(lift.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}

// ── ProteinConsistency ────────────────────────────────────────────────────────
const ProteinConsistency = ({ dietEntries, proteinTarget }) => {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date    = subDays(new Date(), 6 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const label   = format(date, 'EEE').substring(0, 3)

      const dayEntries = dietEntries.filter(e => e.date === dateStr)
      const totalProtein = dayEntries.reduce(
        (sum, e) => sum + (e.payload?.protein_g || 0), 0
      )

      const hasEntries = dayEntries.length > 0
      const hit        = hasEntries && totalProtein >= proteinTarget

      return { dateStr, label, hit, hasEntries, isToday: isToday(date) }
    })
  }, [dietEntries, proteinTarget])

  const hitCount = days.filter(d => d.hit).length

  return (
    <GlassCard className="p-5 h-full">
      <h3 className="font-sans font-medium text-[14px] text-white mb-1">
        Protein Consistency
      </h3>
      <p
        className="font-sans text-[11px] mb-5"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Target hit this week
      </p>

      <div className="flex justify-between items-center mb-5">
        {days.map((day) => (
          <div key={day.dateStr} className="flex flex-col items-center gap-2">
            <div
              className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center"
              style={{
                backgroundColor: day.hit
                  ? `${ACCENT}e6`
                  : day.hasEntries
                    ? 'rgba(239,68,68,0.15)'
                    : 'rgba(255,255,255,0.04)',
                border: day.isToday ? `1px solid ${ACCENT}` : 'none'
              }}
            >
              {day.hit && (
                <span className="text-[#0a0a0f] text-[12px] font-bold">✓</span>
              )}
              {!day.hit && day.hasEntries && (
                <span className="text-[12px]" style={{ color: 'rgba(239,68,68,0.7)' }}>✕</span>
              )}
              {!day.hasEntries && (
                <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>–</span>
              )}
            </div>
            <span
              className="font-mono text-[10px]"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>

      <p className="font-sans text-[13px] text-white">
        Protein target met{' '}
        <span className="font-mono" style={{ color: ACCENT }}>
          {hitCount} / 7
        </span>{' '}
        days this week.
      </p>
    </GlassCard>
  )
}

// ── Main GymDeepDive Page ─────────────────────────────────────────────────────
const GymDeepDive = () => {
  const { widgetId }               = useParams()
  const dispatch                   = useDispatch()
  const [activeTab, setActiveTab]  = useState('Workout')
  const [goalsOpen, setGoalsOpen]  = useState(false)
  const [selectedExercise, setSelectedExercise] = useState('')

  const { entries, loading }       = useWidgetEntries(widgetId)
  const { config, updateConfig }   = useWidgetConfig(widgetId)

  // Split entries by type
  const workoutEntries = useMemo(
    () => entries.filter(e => e.payload?.entry_type === 'workout'),
    [entries]
  )
  const dietEntries = useMemo(
    () => entries.filter(e => e.payload?.entry_type === 'diet'),
    [entries]
  )

  // ── Workout stats ─────────────────────────────────────────────────────────
  const currentStreak = useMemo(() => calcStreak(workoutEntries),        [workoutEntries])
  const thisWeekCount = useMemo(() => calcThisWeekDays(workoutEntries),  [workoutEntries])

  const lastWorkout = useMemo(() => {
    if (!workoutEntries.length) return null
    const sorted = [...workoutEntries].sort((a, b) => new Date(b.date) - new Date(a.date))
    return sorted[0]
  }, [workoutEntries])

  const weeklyVolume = useMemo(() => {
    const now       = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    return workoutEntries
      .filter(e => new Date(e.date) >= weekStart)
      .reduce((sum, e) => {
        const { sets = 0, reps = 0, weight_kg = 0 } = e.payload || {}
        return sum + sets * reps * weight_kg
      }, 0)
  }, [workoutEntries])

  // ── Today's diet ──────────────────────────────────────────────────────────
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const todayDiet = useMemo(() => {
    const todayDietEntries = dietEntries.filter(e => e.date === todayStr)
    return {
      calories: todayDietEntries.reduce((s, e) => s + (e.payload?.calories   || 0), 0),
      protein:  todayDietEntries.reduce((s, e) => s + (e.payload?.protein_g  || 0), 0),
      water:    todayDietEntries.reduce((s, e) => s + (e.payload?.water_ml   || 0), 0),
    }
  }, [dietEntries, todayStr])

  // ── Today's workout ───────────────────────────────────────────────────────
  const todayWorkout = useMemo(() => {
    const todayWorkouts = workoutEntries.filter(e => e.date === todayStr)
    const muscles = [...new Set(todayWorkouts.map(e => e.payload?.muscle_group).filter(Boolean))]
    return { count: todayWorkouts.length, muscles }
  }, [workoutEntries, todayStr])

  // ── Workout stats bar ─────────────────────────────────────────────────────
  const workoutStats = [
    {
      value: `${currentStreak}`,
      label: 'DAY STREAK',
      color: ACCENT,
      subtext: currentStreak >= 7 ? '🔥' : ''
    },
    {
      value: `${thisWeekCount} / ${config.weekly_workout_goal}`,
      label: 'THIS WEEK',
      color: ACCENT
    },
    {
      value: lastWorkout ? lastWorkout.payload?.muscle_group || '—' : '—',
      label: 'LAST WORKOUT',
      color: ACCENT,
      subtext: lastWorkout ? `${getDaysAgo(lastWorkout.date)}d ago` : ''
    },
    {
      value: weeklyVolume.toLocaleString(),
      label: 'WEEKLY VOLUME',
      color: ACCENT,
      subtext: 'kg'
    },
  ]

  // ── Diet stats bar ────────────────────────────────────────────────────────
  const dietStats = [
    {
      value: todayDiet.calories.toLocaleString(),
      label: 'CALORIES TODAY',
      color: ACCENT,
      subtext: `/ ${config.calorie_target.toLocaleString()} kcal`
    },
    {
      value: `${todayDiet.protein}g`,
      label: 'PROTEIN TODAY',
      color: ACCENT,
      subtext: `/ ${config.protein_target}g`
    },
    {
      value: `${todayDiet.water.toLocaleString()}ml`,
      label: 'WATER TODAY',
      color: ACCENT,
      subtext: `${Math.floor(todayDiet.water / 250)} glasses`
    },
  ]

  // ── Heatmap data (workout only) ───────────────────────────────────────────
  const heatmapData = useMemo(
    () => entriesToHeatmapData(workoutEntries),
    [workoutEntries]
  )

  // ── Calorie trend (last 7 days) ───────────────────────────────────────────
  const calorieTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date    = subDays(new Date(), 6 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const label   = format(date, 'EEE').substring(0, 3)

      const total = dietEntries
        .filter(e => e.date === dateStr)
        .reduce((s, e) => s + (e.payload?.calories || 0), 0)

      return { label, value: total }
    })
  }, [dietEntries])

  // ── Strength progress chart data ──────────────────────────────────────────
  const exerciseOptions = useMemo(() => {
    const names = [...new Set(workoutEntries.map(e => e.payload?.exercise_name).filter(Boolean))]
    return names
  }, [workoutEntries])

  const strengthData = useMemo(() => {
    const exercise = selectedExercise || exerciseOptions[0]
    if (!exercise) return []

    const relevant = workoutEntries
      .filter(e => e.payload?.exercise_name === exercise)
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    const maxWeight = Math.max(...relevant.map(e => e.payload?.weight_kg || 0))

    return relevant.map(e => ({
      label: formatShortDate(e.date),
      value: e.payload?.weight_kg || 0,
      reps:  e.payload?.reps || 0,
      isPr:  e.payload?.weight_kg === maxWeight,
    }))
  }, [workoutEntries, selectedExercise, exerciseOptions])

  // ── Open quick add modal ──────────────────────────────────────────────────
  const handleLogSession = () => {
    dispatch(setActiveWidget(widgetId))
    dispatch(openModal('gym'))
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0a0a0f' }}
      >
        <p className="font-mono text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Loading...
        </p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: '#0a0a0f', color: '#c8d0e0' }}
    >
      {/* Ambient effects */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[800px] h-[800px] z-0"
        style={{
          background: `radial-gradient(ellipse at top right, ${ACCENT}0a 0%, transparent 65%)`
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-[800px] h-[800px] z-0"
        style={{
          background: 'radial-gradient(ellipse at bottom left, rgba(180,150,90,0.025) 0%, transparent 65%)'
        }}
      />

      <div className="relative z-10">

        {/* Header */}
        <DeepDiveHeader
          title="Gym"
          subtitle="Track every rep. Fuel every session."
          accentColor={ACCENT}
          ctaLabel="Log Session"
          onCta={handleLogSession}
          rightExtra={
            <button
              onClick={() => setGoalsOpen(true)}
              className="transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >
              <Settings size={16} />
            </button>
          }
        />

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 pb-24 pt-6 flex flex-col gap-[14px]">

          {/* Today Card */}
          <GlassCard className="overflow-hidden">
            <div
              className="flex divide-x p-4"
              style={{
                borderLeft:      `3px solid ${ACCENT}`,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                backgroundColor: `${ACCENT}0a`,
                borderLeftColor: ACCENT,
                '--tw-divide-opacity': 1,
                '--divide-x-border-color': 'rgba(255,255,255,0.06)'
              }}
            >
              {/* Today workout */}
              <div className="flex-1 pr-4">
                <p
                  className="font-mono text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Today's Workout
                </p>
                {todayWorkout.count > 0 ? (
                  <>
                    <p className="font-sans font-bold text-[18px] text-white mb-1">
                      {todayWorkout.muscles.join(' & ') || 'Logged'}
                    </p>
                    <p
                      className="font-mono text-[13px]"
                      style={{ color: ACCENT }}
                    >
                      {todayWorkout.count} exercises
                    </p>
                  </>
                ) : (
                  <p
                    className="font-sans text-[14px] italic"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    No workout logged yet
                  </p>
                )}
              </div>

              {/* Today diet */}
              <div className="flex-1 pl-4">
                <p
                  className="font-mono text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Today's Diet
                </p>
                <p className="font-mono text-[16px] mb-1">
                  <span className="font-bold text-white">
                    {todayDiet.calories.toLocaleString()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {' / '}{config.calorie_target.toLocaleString()} kcal
                  </span>
                </p>
                <p
                  className="font-mono text-[13px] mb-1"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  <span className="text-white">{todayDiet.protein}</span>
                  {' / '}{config.protein_target}g protein
                </p>
                <p
                  className="font-mono text-[13px]"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  <span className="text-white">
                    {todayDiet.water.toLocaleString()}
                  </span>
                  {' ml · '}{Math.floor(todayDiet.water / 250)} glasses 🥤
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Tab Switcher */}
          <TabSwitcher
            tabs={['Workout', 'Diet']}
            activeTab={activeTab}
            onChange={setActiveTab}
            accentColor={ACCENT}
          />

          {/* ── WORKOUT TAB ── */}
          {activeTab === 'Workout' && (
            <div className="flex flex-col gap-[14px]">

              {/* Stats Bar */}
              <StatsBar stats={workoutStats} />

              {/* Heatmap */}
              <div>
                <SectionLabel label="CONSISTENCY" />
                <ActivityHeatmap
                  data={heatmapData}
                  accentColor={ACCENT}
                  renderTooltip={(day) =>
                    `${day.date} — ${day.count} exercise${day.count !== 1 ? 's' : ''} logged`
                  }
                />
              </div>

              {/* Muscle Breakdown + Best Lifts */}
              <div>
                <SectionLabel label="PERFORMANCE" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <MuscleBreakdown workoutEntries={workoutEntries} />
                  <BestLiftsBoard  workoutEntries={workoutEntries} />
                </div>
              </div>

              {/* Strength Progress */}
              <div>
                <SectionLabel label="STRENGTH PROGRESS" />
                <GlassCard className="p-5">

                  {/* Exercise selector */}
                  <div className="flex justify-between items-center mb-5">
                    <select
                      value={selectedExercise || exerciseOptions[0] || ''}
                      onChange={e => setSelectedExercise(e.target.value)}
                      className="rounded-[8px] px-3 py-1.5 font-sans text-[13px] text-white outline-none cursor-pointer appearance-none transition-colors duration-200"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border:          '1px solid rgba(255,255,255,0.06)',
                      }}
                      onFocus={e => e.target.style.borderColor = ACCENT}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                    >
                      {exerciseOptions.map(ex => (
                        <option key={ex} value={ex} className="bg-[#0a0a0f]">
                          {ex}
                        </option>
                      ))}
                    </select>

                    {strengthData.length > 0 && (
                      <div
                        className="rounded-[8px] px-3 py-1"
                        style={{
                          backgroundColor: `${ACCENT}1F`,
                          border:          `1px solid ${ACCENT}4d`
                        }}
                      >
                        <p className="font-mono text-[12px]" style={{ color: ACCENT }}>
                          Last:{' '}
                          {strengthData[strengthData.length - 1]?.value} kg
                          {' × '}
                          {strengthData[strengthData.length - 1]?.reps} reps
                        </p>
                      </div>
                    )}
                  </div>

                  {strengthData.length === 0 ? (
                    <p
                      className="font-sans text-[13px] italic text-center py-8"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      No data for this exercise yet
                    </p>
                  ) : (
                    <LineChart
                      data={strengthData}
                      accentColor={ACCENT}
                      unit="kg"
                      showReps={true}
                      height={200}
                    />
                  )}
                </GlassCard>
              </div>

              {/* Session History */}
              <RecentLog
                label="SESSION HISTORY"
                rows={workoutEntries.slice(0, 30)}
                accentColor={ACCENT}
                dateFilter=""
                onDateChange={() => {}}
                emptyMessage="No workout sessions logged yet."
                recordCount={workoutEntries.length}
                renderLeft={(row) => (
                  <span
                    className="font-mono text-[12px]"
                    style={{ color: ACCENT }}
                  >
                    {formatShortDate(row.date)}
                  </span>
                )}
                renderMiddle={(row) => (
                  <div className="flex flex-col">
                    <span className="font-sans text-[13px] text-white truncate">
                      {row.payload?.exercise_name || '—'}
                    </span>
                    <span
                      className="inline-block w-fit font-sans text-[10px] px-1.5 py-0.5 rounded-[4px] mt-1"
                      style={{
                        backgroundColor: `${ACCENT}26`,
                        color:           ACCENT
                      }}
                    >
                      {row.payload?.muscle_group || '—'}
                    </span>
                  </div>
                )}
                renderRight={(row) => (
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="font-mono text-[12px]"
                      style={{ color: 'rgba(255,255,255,0.85)' }}
                    >
                      {row.payload?.sets} × {row.payload?.reps}
                    </span>
                    <span
                      className="font-mono text-[12px]"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      @ {row.payload?.weight_kg} kg
                    </span>
                  </div>
                )}
              />

            </div>
          )}

          {/* ── DIET TAB ── */}
          {activeTab === 'Diet' && (
            <div className="flex flex-col gap-[14px]">

              {/* Diet Stats Bar */}
              <StatsBar stats={dietStats} />

              {/* Ring Progress — Today's Nutrition */}
              <div>
                <SectionLabel label="TODAY'S NUTRITION" />
                <GlassCard className="p-5">
                  <div className="flex justify-between items-center mb-5">
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      {format(new Date(), 'MMMM d')}
                    </span>
                    <button
                      onClick={() => setGoalsOpen(true)}
                      className="font-sans text-[12px] transition-colors duration-200"
                      style={{ color: ACCENT }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
                      onMouseLeave={e => e.currentTarget.style.color = ACCENT}
                    >
                      Set Goals →
                    </button>
                  </div>

                  <div className="flex justify-evenly items-center">
                    <RingProgress
                      percent={(todayDiet.calories / config.calorie_target) * 100}
                      color={ACCENT}
                      label="Calories"
                      centerValue={todayDiet.calories}
                      subValue={`/ ${config.calorie_target}`}
                    />
                    <RingProgress
                      percent={(todayDiet.protein / config.protein_target) * 100}
                      color="#fbbf24"
                      label="Protein"
                      centerValue={`${todayDiet.protein}g`}
                      subValue={`/ ${config.protein_target}g`}
                    />
                    <RingProgress
                      percent={(todayDiet.water / config.water_target) * 100}
                      color="#d97706"
                      label="Water"
                      centerValue={`${todayDiet.water}`}
                      subValue={`· ${Math.floor(todayDiet.water / 250)} 🥤`}
                    />
                  </div>
                </GlassCard>
              </div>

              {/* Calorie Trend + Protein Consistency */}
              <div>
                <SectionLabel label="WEEKLY TRENDS" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {/* Calorie Trend */}
                  <GlassCard className="p-5">
                    <h3 className="font-sans font-medium text-[14px] text-white mb-1">
                      Calorie Trend
                    </h3>
                    <p
                      className="font-sans text-[11px] mb-4"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      Last 7 days
                    </p>
                    <BarChart
                      data={calorieTrend}
                      accentColor={ACCENT}
                      referenceValue={config.calorie_target}
                      referenceLabel="Goal"
                      unit="kcal"
                      height={140}
                    />
                  </GlassCard>

                  {/* Protein Consistency */}
                  <ProteinConsistency
                    dietEntries={dietEntries}
                    proteinTarget={config.protein_target}
                  />

                </div>
              </div>

              {/* Neutral Summaries */}
              <div>
                <SectionLabel label="THIS WEEK AT A GLANCE" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      value:   `${calorieTrend.filter(d => d.value > 0).length}`,
                      unit:    '/ 7 days',
                      label:   'Diet entries logged'
                    },
                    {
                      value:   Math.round(
                        calorieTrend.reduce((s, d) => s + d.value, 0) /
                        Math.max(calorieTrend.filter(d => d.value > 0).length, 1)
                      ).toLocaleString(),
                      unit:    'kcal',
                      label:   'Avg daily calories'
                    },
                    {
                      value:   `${calorieTrend.filter(d => d.value >= config.calorie_target).length}`,
                      unit:    '/ 7 days',
                      label:   'Calorie target hit'
                    },
                  ].map((item, i) => (
                    <GlassCard
                      key={i}
                      className="p-4 rounded-l-none"
                      style={{ borderLeft: `2px solid ${ACCENT}` }}
                    >
                      <p className="font-mono font-bold text-[28px] text-white mb-1">
                        {item.value}{' '}
                        <span
                          className="text-[16px] font-normal"
                          style={{ color: 'rgba(255,255,255,0.35)' }}
                        >
                          {item.unit}
                        </span>
                      </p>
                      <p
                        className="font-sans text-[11px]"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                      >
                        {item.label}
                      </p>
                    </GlassCard>
                  ))}
                </div>
              </div>

              {/* Diet History */}
              <RecentLog
                label="DIET HISTORY"
                rows={dietEntries.slice(0, 30)}
                accentColor={ACCENT}
                dateFilter=""
                onDateChange={() => {}}
                emptyMessage="No diet entries logged yet."
                recordCount={dietEntries.length}
                renderLeft={(row) => (
                  <span
                    className="font-mono text-[12px]"
                    style={{ color: ACCENT }}
                  >
                    {formatShortDate(row.date)}
                  </span>
                )}
                renderMiddle={(row) => (
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[13px] text-white">
                      {(row.payload?.calories || 0).toLocaleString()}
                      <span
                        className="text-[11px] ml-1"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                      >
                        kcal
                      </span>
                    </span>
                    <span
                      className="font-mono text-[11px]"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      {row.payload?.protein_g || 0}g protein
                    </span>
                  </div>
                )}
                renderRight={(row) => (
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className="font-mono text-[12px] text-white"
                    >
                      {(row.payload?.water_ml || 0).toLocaleString()}
                      <span
                        className="text-[11px] ml-1"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                      >
                        ml
                      </span>
                    </span>
                    <span
                      className="font-mono text-[10px]"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      {formatRelativeDate(row.date)}
                    </span>
                  </div>
                )}
              />

            </div>
          )}

        </div>
      </div>

      {/* Goals Panel */}
      <GoalsPanel
        isOpen={goalsOpen}
        onClose={() => setGoalsOpen(false)}
        config={config}
        onSave={updateConfig}
      />

    </div>
  )
}

export default GymDeepDive