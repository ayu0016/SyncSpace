import { useState, useMemo, useEffect } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { Settings } from 'lucide-react'
import { format, subDays, startOfWeek } from 'date-fns'
import { openModal, setActiveWidget } from '../../store/uiSlice'

// Hooks
import useWidgetEntries from '../../hooks/useWidgetEntries'
import useWidgetConfig from '../../hooks/useWidgetConfig'

// Utils
import { calcStreak, calcThisWeekDays } from '../../utils/streakUtils'
import { entriesToHeatmapData } from '../../utils/heatmapUtils'
import { formatRelativeDate, getDaysAgo } from '../../utils/dateUtils'

// Shared components
import DeepDiveHeader from '../../components/ui/deepdive/DeepDiveHeader'
import SectionLabel from '../../components/ui/SectionLabel'
import StatsBar from '../../components/ui/StatsBar'
import GlassCard from '../../components/ui/GlassCard'
import TabSwitcher from '../../components/ui/TabSwitcher'
import ActivityHeatmap from '../../components/ui/deepdive/ActivityHeatmap'
import BarChart from '../../components/ui/charts/BarChart'
import LineChart from '../../components/ui/charts/LineChart'
import RecentLog from '../../components/ui/deepdive/RecentLog'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ACCENT        = '#f59e0b'
const MUSCLE_GROUPS = ['Shoulder', 'Biceps', 'Triceps', 'Chest', 'Back', 'Abs', 'Legs']

// ─── PAGE-SPECIFIC COMPONENTS ────────────────────────────────────────────────

const RingProgress = ({ percent, color, label, centerValue, subValue }) => {
  const radius           = 46
  const strokeWidth      = 8
  const normalizedRadius = radius - strokeWidth / 2
  const circumference    = normalizedRadius * 2 * Math.PI
  const clampedPercent   = Math.min(percent, 100)
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center w-[120px] h-[120px]">
        <svg
          height="120"
          width="120"
          className="absolute"
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            stroke="rgba(255,255,255,0.06)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx="60"
            cy="60"
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: clampedPercent >= 100
                ? `drop-shadow(0 0 6px ${color}80)`
                : 'none'
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="60"
            cy="60"
          />
        </svg>
        <div className="flex flex-col items-center justify-center absolute text-center">
          <span className="font-mono font-bold text-[20px] text-white leading-tight">
            {centerValue}
          </span>
          <span
            className="font-mono text-[10px] leading-tight"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {subValue}
          </span>
        </div>
      </div>
      <span
        className="font-sans font-medium text-[12px] mt-2"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        {label}
      </span>
    </div>
  )
}

// Fixed: added useEffect to sync form when config loads from Supabase
const GoalsPanel = ({ show, onClose, config, onSave }) => {
  const [form, setForm] = useState({
    calorie_target:      config.calorie_target,
    protein_target:      config.protein_target,
    water_target:        config.water_target,
    weekly_workout_goal: config.weekly_workout_goal,
  })

  useEffect(() => {
    setForm({
      calorie_target:      config.calorie_target,
      protein_target:      config.protein_target,
      water_target:        config.water_target,
      weekly_workout_goal: config.weekly_workout_goal,
    })
  }, [config])

  const handleSave = () => {
    onSave(form)
    onClose()
  }

  return (
    <>
      {show && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      <div
        className="fixed top-0 right-0 h-full w-[300px] z-50 flex flex-col"
        style={{
          background: 'rgba(10,10,15,0.97)',
          backdropFilter: 'blur(12px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          borderTop: `2px solid ${ACCENT}`,
          transform: show ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        <div className="p-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-sans font-bold text-[16px] text-white">
              Goals
            </h2>
            <button
              onClick={onClose}
              className="font-mono text-[12px] transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              ✕
            </button>
          </div>
          <div
            className="h-[1px] w-full mb-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          />
          <div
            className="rounded-r-[6px] p-2 mb-5"
            style={{
              background: 'rgba(245,158,11,0.08)',
              borderLeft: `3px solid ${ACCENT}`
            }}
          >
            <p
              className="font-sans text-[12px]"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Using default targets. Set your own goals for accurate tracking.
            </p>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {[
              { key: 'calorie_target',      label: 'Daily Calorie Target (kcal)' },
              { key: 'protein_target',      label: 'Daily Protein Target (g)'    },
              { key: 'water_target',        label: 'Daily Water Target (ml)'     },
              { key: 'weekly_workout_goal', label: 'Weekly Workout Goal (days)'  },
            ].map(field => (
              <div key={field.key}>
                <label
                  className="block font-sans text-[10px] uppercase tracking-widest mb-1.5"
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
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => e.target.style.boxShadow = `0 0 0 2px ${ACCENT}4d`}
                  onBlur={e => e.target.style.boxShadow = 'none'}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-[8px] font-sans font-bold text-[13px] transition-colors duration-200"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-[8px] font-sans font-bold text-[13px]"
              style={{
                background: ACCENT,
                color: '#0a0a0f',
                boxShadow: `0 0 12px ${ACCENT}33`
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

// Fixed: uses date-fns subDays and format
const ProteinConsistency = ({ dietEntries, proteinTarget }) => {
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date    = subDays(new Date(), 6 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayLabel = format(date, 'EEE')

      const dayEntries   = dietEntries.filter(e => e.date === dateStr)
      const totalProtein = dayEntries.reduce(
        (sum, e) => sum + (e.payload?.protein_g || 0), 0
      )

      return {
        day:      dayLabel,
        hit:      dayEntries.length > 0 && totalProtein >= proteinTarget,
        hasEntry: dayEntries.length > 0,
        isToday:  i === 6,
      }
    })
  }, [dietEntries, proteinTarget])

  return (
    <div className="flex justify-between items-center">
      {last7.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div
            className="w-[34px] h-[34px] rounded-[8px] flex items-center justify-center font-mono text-[14px]"
            style={{
              background: d.hit
                ? 'rgba(245,158,11,0.9)'
                : d.hasEntry
                  ? 'rgba(239,68,68,0.15)'
                  : 'rgba(255,255,255,0.04)',
              border: d.isToday
                ? `1px solid ${ACCENT}`
                : '1px solid transparent',
              color: d.hit
                ? '#0a0a0f'
                : d.hasEntry
                  ? '#ef4444'
                  : 'rgba(255,255,255,0.2)'
            }}
          >
            {d.hit ? '✓' : d.hasEntry ? '✗' : '–'}
          </div>
          <span
            className="font-mono text-[10px]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {d.day}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const GymDeepDive = () => {
  const widgetId= useSelector(state => state.ui.activeWidgetId)
  const dispatch                  = useDispatch()
  const [activeTab, setActiveTab] = useState('Workout')
  const [showGoals, setShowGoals] = useState(false)

  const { entries, loading }       = useWidgetEntries(widgetId)
  const { config, updateConfig }   = useWidgetConfig(widgetId)

  const workoutEntries = useMemo(() =>
    entries.filter(e => e.payload?.entry_type === 'workout'),
    [entries]
  )

  const dietEntries = useMemo(() =>
    entries.filter(e => e.payload?.entry_type === 'diet'),
    [entries]
  )

  // Workout stats
  const currentStreak = useMemo(() =>
    calcStreak(workoutEntries), [workoutEntries]
  )

  const thisWeekWorkouts = useMemo(() =>
    calcThisWeekDays(workoutEntries), [workoutEntries]
  )

  const lastWorkout = useMemo(() => {
    if (workoutEntries.length === 0) return null
    return [...workoutEntries].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0]
  }, [workoutEntries])

  // Fixed: use date-fns startOfWeek
  const totalVolumeThisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    return workoutEntries
      .filter(e => new Date(e.date) >= weekStart)
      .reduce((sum, e) => {
        const { sets = 0, reps = 0, weight_kg = 0 } = e.payload || {}
        return sum + sets * reps * weight_kg
      }, 0)
  }, [workoutEntries])

  const heatmapData = useMemo(() =>
    entriesToHeatmapData(workoutEntries), [workoutEntries]
  )

  const muscleData = useMemo(() => {
    const daysByMuscle = {}
    MUSCLE_GROUPS.forEach(m => { daysByMuscle[m] = new Set() })

    workoutEntries.forEach(e => {
      const muscle = e.payload?.muscle_group
      if (!muscle) return
      const key = muscle.charAt(0).toUpperCase() + muscle.slice(1)
      if (daysByMuscle[key]) daysByMuscle[key].add(e.date)
    })

    const max = Math.max(
      ...Object.values(daysByMuscle).map(s => s.size), 1
    )

    return MUSCLE_GROUPS.map(name => ({
      name,
      days:  daysByMuscle[name]?.size || 0,
      width: ((daysByMuscle[name]?.size || 0) / max) * 100
    }))
  }, [workoutEntries])

  const bestLifts = useMemo(() => {
    const liftMap = {}
    workoutEntries.forEach(e => {
      const { exercise_name, weight_kg, muscle_group } = e.payload || {}
      if (!exercise_name || !weight_kg) return
      if (!liftMap[exercise_name] || weight_kg > liftMap[exercise_name].weight) {
        liftMap[exercise_name] = {
          exercise: exercise_name,
          muscle:   muscle_group || '—',
          weight:   weight_kg,
          date:     formatRelativeDate(e.date)
        }
      }
    })
    return Object.values(liftMap)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6)
  }, [workoutEntries])

  const [selectedExercise, setSelectedExercise] = useState('')

  const exerciseList = useMemo(() => {
    const names = new Set(
      workoutEntries.map(e => e.payload?.exercise_name).filter(Boolean)
    )
    return [...names]
  }, [workoutEntries])

  // Fixed: use useEffect instead of useMemo for side effect
  useEffect(() => {
    if (exerciseList.length > 0 && !selectedExercise) {
      setSelectedExercise(exerciseList[0])
    }
  }, [exerciseList])

const strengthData = useMemo(() => {
  if (!selectedExercise) return []
  const filtered = workoutEntries
    .filter(e => e.payload?.exercise_name === selectedExercise)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  if (filtered.length === 0) return []  // ← add this guard

  const maxWeight = Math.max(...filtered.map(e => e.payload?.weight_kg || 0))
  return filtered.map(e => ({
    label: formatRelativeDate(e.date),
    value: e.payload?.weight_kg || 0,
    reps:  e.payload?.reps || 0,
    isPr:  e.payload?.weight_kg === maxWeight
  }))
}, [workoutEntries, selectedExercise])

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const todayDiet = useMemo(() => {
    const todayEntries = dietEntries.filter(e => e.date === todayStr)
    return {
      calories:  todayEntries.reduce((s, e) => s + (e.payload?.calories  || 0), 0),
      protein_g: todayEntries.reduce((s, e) => s + (e.payload?.protein_g || 0), 0),
      water_ml:  todayEntries.reduce((s, e) => s + (e.payload?.water_ml  || 0), 0),
    }
  }, [dietEntries, todayStr])

  // Fixed: use date-fns subDays and format
  const calorieTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date    = subDays(new Date(), 6 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayLabel = format(date, 'EEE')
      const dayEntries = dietEntries.filter(e => e.date === dateStr)
      const total = dayEntries.reduce(
        (s, e) => s + (e.payload?.calories || 0), 0
      )
      return { label: dayLabel, value: total }
    })
  }, [dietEntries])

  // Fixed: use date-fns subDays and format
  const dietSummary = useMemo(() => {
    const last7 = Array.from({ length: 7 }, (_, i) =>
      format(subDays(new Date(), i), 'yyyy-MM-dd')
    )

    const daysWithEntries = last7.filter(d =>
      dietEntries.some(e => e.date === d)
    ).length

    const avgCalories = Math.round(
      last7.reduce((sum, d) => {
        const dayTotal = dietEntries
          .filter(e => e.date === d)
          .reduce((s, e) => s + (e.payload?.calories || 0), 0)
        return sum + dayTotal
      }, 0) / 7
    )

    const proteinHitDays = last7.filter(d => {
      const total = dietEntries
        .filter(e => e.date === d)
        .reduce((s, e) => s + (e.payload?.protein_g || 0), 0)
      return dietEntries.some(e => e.date === d) && total >= config.protein_target
    }).length

    return { daysWithEntries, avgCalories, proteinHitDays }
  }, [dietEntries, config])

  const workoutStats = [
    {
      value:   `${currentStreak}`,
      label:   'DAY STREAK',
      color:   ACCENT,
      subtext: currentStreak > 0 ? '🔥' : ''
    },
    {
      value: `${thisWeekWorkouts} / ${config.weekly_workout_goal}`,
      label: 'THIS WEEK',
      color: ACCENT
    },
    {
      value:   lastWorkout?.payload?.muscle_group
                 ? lastWorkout.payload.muscle_group.charAt(0).toUpperCase()
                   + lastWorkout.payload.muscle_group.slice(1)
                 : '—',
      label:   'LAST WORKOUT',
      color:   ACCENT,
      subtext: lastWorkout ? `${getDaysAgo(lastWorkout.date)}d ago` : ''
    },
    {
      value: `${totalVolumeThisWeek.toLocaleString()} kg`,
      label: 'WEEKLY VOLUME',
      color: ACCENT
    },
  ]

  const handleCta = () => {
    dispatch(setActiveWidget(widgetId))
    dispatch(openModal('gym'))
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0a0f' }}
      >
        <p
          className="font-mono text-[13px]"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Loading...
        </p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ background: '#0a0a0f' }}
    >
      {/* Ambient effects */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[800px] h-[800px] z-0"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.04) 0%, transparent 65%)'
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-[800px] h-[800px] z-0"
        style={{
          background: 'radial-gradient(ellipse at bottom left, rgba(180,150,90,0.025) 0%, transparent 65%)'
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 79px, rgba(255,255,255,0.018) 79px, rgba(255,255,255,0.018) 80px)'
        }}
      />

      <GoalsPanel
        show={showGoals}
        onClose={() => setShowGoals(false)}
        config={config}
        onSave={updateConfig}
      />

      <div className="relative z-10">

        <DeepDiveHeader
          title="Gym"
          subtitle="Track every rep. Fuel every session."
          accentColor={ACCENT}
          ctaLabel="Log Session"
          onCta={handleCta}
          rightExtra={
            <button
              onClick={() => setShowGoals(true)}
              className="flex items-center justify-center transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >
              <Settings size={16} />
            </button>
          }
        />

        <div className="max-w-5xl mx-auto px-6 pb-24 pt-6 flex flex-col gap-[14px]">

          {/* Today card — Fixed: removed divide-x, use inline border instead */}
          <div
            style={{
              background: 'rgba(245,158,11,0.04)',
              borderLeft: `3px solid ${ACCENT}`,
              borderRadius: '0 12px 12px 0',
              border: '1px solid rgba(255,255,255,0.06)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            className="rounded-[12px] p-4"
          >
            <div className="flex">
              {/* Workout side */}
              <div
                className="flex-1 pr-4"
                style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p
                  className="font-sans text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Today's Workout
                </p>
                {(() => {
                  const todayWorkouts = workoutEntries.filter(
                    e => e.date === todayStr
                  )
                  if (todayWorkouts.length === 0) {
                    return (
                      <p
                        className="font-sans text-[14px] italic"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      >
                        No workout logged yet
                      </p>
                    )
                  }
                  const muscles = [
                    ...new Set(
                      todayWorkouts
                        .map(e => e.payload?.muscle_group)
                        .filter(Boolean)
                    )
                  ]
                  return (
                    <>
                      <p className="font-sans font-bold text-[16px] text-white mb-1">
                        {muscles
                          .map(m => m.charAt(0).toUpperCase() + m.slice(1))
                          .join(' & ')
                        }
                      </p>
                      <p
                        className="font-mono text-[13px]"
                        style={{ color: ACCENT }}
                      >
                        {todayWorkouts.length} exercise{todayWorkouts.length !== 1 ? 's' : ''}
                      </p>
                    </>
                  )
                })()}
              </div>

              {/* Diet side */}
              <div className="flex-1 pl-4">
                <p
                  className="font-sans text-[10px] uppercase tracking-widest mb-2"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Today's Diet
                </p>
                <p className="font-mono text-[15px] mb-1">
                  <span className="font-bold text-white">
                    {todayDiet.calories.toLocaleString()}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {' '}/ {config.calorie_target.toLocaleString()} kcal
                  </span>
                </p>
                <p
                  className="font-mono text-[12px] mb-1"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  <span className="text-white">{todayDiet.protein_g}</span>
                  {' '}/ {config.protein_target}g protein
                </p>
                <p
                  className="font-mono text-[12px]"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  <span className="text-white">
                    {todayDiet.water_ml.toLocaleString()}
                  </span>
                  {' '}ml · {Math.floor(todayDiet.water_ml / 250)} glasses
                </p>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <TabSwitcher
            tabs={['Workout', 'Diet']}
            activeTab={activeTab}
            onChange={setActiveTab}
            accentColor={ACCENT}
          />

          {/* ══ WORKOUT TAB ══ */}
          {activeTab === 'Workout' && (
            <div className="flex flex-col gap-[14px]">

              <StatsBar stats={workoutStats} />

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

              <div>
                <SectionLabel label="PERFORMANCE" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  {/* Muscle Breakdown */}
                  <GlassCard className="p-5">
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
                      {muscleData.map(muscle => (
                        <div key={muscle.name} className="flex items-center">
                          <span className="w-16 font-sans text-[13px] text-white shrink-0">
                            {muscle.name}
                          </span>
                          <div
                            className="flex-1 h-[8px] rounded-[4px] mx-3 overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                          >
                            <div
                              className="h-full rounded-[4px] transition-all duration-300"
                              style={{
                                width: `${muscle.width}%`,
                                background: muscle.days === 0
                                  ? 'rgba(239,68,68,0.4)'
                                  : ACCENT
                              }}
                            />
                          </div>
                          <span
                            className="w-6 text-right font-mono text-[12px] shrink-0"
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

                  {/* Best Lifts */}
                  <GlassCard className="p-5">
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
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                      >
                        No lifts logged yet.
                      </p>
                    ) : (
                      <div className="flex flex-col">
                        {bestLifts.map((lift, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-2.5 transition-colors duration-150"
                            style={{
                              borderBottom: idx !== bestLifts.length - 1
                                ? '1px solid rgba(255,255,255,0.04)'
                                : 'none'
                            }}
                            onMouseEnter={e =>
                              e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                            }
                            onMouseLeave={e =>
                              e.currentTarget.style.background = 'transparent'
                            }
                          >
                            <div>
                              <p className="font-sans text-[13px] text-white mb-1">
                                {lift.exercise}
                              </p>
                              <span
                                className="font-sans text-[10px] px-1.5 py-0.5 rounded-[4px]"
                                style={{
                                  background: 'rgba(245,158,11,0.15)',
                                  color: ACCENT
                                }}
                              >
                                {lift.muscle}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold text-[20px] leading-none mb-1 text-white">
                                {lift.weight}
                                <span
                                  className="text-[12px] font-normal ml-1"
                                  style={{ color: 'rgba(255,255,255,0.35)' }}
                                >
                                  kg
                                </span>
                              </p>
                              <p
                                className="font-mono text-[10px]"
                                style={{ color: 'rgba(255,255,255,0.35)' }}
                              >
                                {lift.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>

                </div>
              </div>

              {/* Strength Progress */}
              <div>
                <SectionLabel label="STRENGTH PROGRESS" />
                <GlassCard className="p-5">
                  <div className="flex justify-between items-center mb-5">
                    <select
                      value={selectedExercise}
                      onChange={e => setSelectedExercise(e.target.value)}
                      className="rounded-[8px] px-3 py-1.5 font-sans text-[13px] text-white outline-none cursor-pointer appearance-none transition-colors duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                      onFocus={e => e.target.style.borderColor = ACCENT}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                    >
                      {exerciseList.map(ex => (
                        <option
                          key={ex}
                          value={ex}
                          style={{ background: '#0a0a0f' }}
                        >
                          {ex}
                        </option>
                      ))}
                    </select>

                    {strengthData.length > 0 && (
                      <div
                        className="rounded-[8px] px-3 py-1"
                        style={{
                          background: 'rgba(245,158,11,0.08)',
                          border: '1px solid rgba(245,158,11,0.2)'
                        }}
                      >
                        <p
                          className="font-mono text-[12px]"
                          style={{ color: ACCENT }}
                        >
                          Last: {strengthData[strengthData.length - 1]?.value}kg
                          {' '}× {strengthData[strengthData.length - 1]?.reps} reps
                        </p>
                      </div>
                    )}
                  </div>

                  {strengthData.length === 0 ? (
                    <p
                      className="font-sans text-[13px] italic text-center py-8"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      No data for this exercise yet.
                    </p>
                  ) : (
                    <LineChart
                      data={strengthData}
                      accentColor={ACCENT}
                      unit="kg"
                      height={200}
                      showReps={true}
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
                    className="font-mono text-[11px] shrink-0"
                    style={{ color: ACCENT }}
                  >
                    {formatRelativeDate(row.date)}
                  </span>
                )}
                renderMiddle={(row) => (
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans text-[13px] text-white truncate">
                      {row.payload?.exercise_name || '—'}
                    </span>
                    <span
                      className="font-mono text-[11px] mt-0.5"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      {row.payload?.sets} × {row.payload?.reps}
                      {' '}@ {row.payload?.weight_kg}kg
                    </span>
                  </div>
                )}
                renderRight={(row) => (
                  <span
                    className="font-sans text-[10px] px-1.5 py-0.5 rounded-[4px] shrink-0"
                    style={{
                      background: 'rgba(245,158,11,0.12)',
                      color: ACCENT
                    }}
                  >
                    {row.payload?.muscle_group
                      ? row.payload.muscle_group.charAt(0).toUpperCase()
                        + row.payload.muscle_group.slice(1)
                      : '—'
                    }
                  </span>
                )}
              />

            </div>
          )}

          {/* ══ DIET TAB ══ */}
          {activeTab === 'Diet' && (
            <div className="flex flex-col gap-[14px]">

              {/* Nutrition Rings */}
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
                      onClick={() => setShowGoals(true)}
                      className="font-sans text-[12px] transition-colors duration-200"
                      style={{ color: ACCENT }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
                      onMouseLeave={e => e.currentTarget.style.color = ACCENT}
                    >
                      Set Goals →
                    </button>
                  </div>
                  <div className="flex justify-evenly items-center flex-wrap gap-4">
                    <RingProgress
                      percent={(todayDiet.calories / config.calorie_target) * 100}
                      color={ACCENT}
                      label="Calories"
                      centerValue={todayDiet.calories.toLocaleString()}
                      subValue={`/ ${config.calorie_target.toLocaleString()}`}
                    />
                    <RingProgress
                      percent={(todayDiet.protein_g / config.protein_target) * 100}
                      color="#fbbf24"
                      label="Protein"
                      centerValue={todayDiet.protein_g}
                      subValue={`/ ${config.protein_target}g`}
                    />
                    <RingProgress
                      percent={(todayDiet.water_ml / config.water_target) * 100}
                      color="#d97706"
                      label="Water"
                      centerValue={todayDiet.water_ml.toLocaleString()}
                      subValue={`${Math.floor(todayDiet.water_ml / 250)} glasses`}
                    />
                  </div>
                </GlassCard>
              </div>

              {/* Calorie trend + Protein consistency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

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

                <GlassCard className="p-5">
                  <h3 className="font-sans font-medium text-[14px] text-white mb-1">
                    Protein Consistency
                  </h3>
                  <p
                    className="font-sans text-[11px] mb-5"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    Target hit this week
                  </p>
                  <ProteinConsistency
                    dietEntries={dietEntries}
                    proteinTarget={config.protein_target}
                  />
                  <p className="font-sans text-[13px] text-white mt-5">
                    Protein target met{' '}
                    <span
                      className="font-mono"
                      style={{ color: ACCENT }}
                    >
                      {dietSummary.proteinHitDays} / 7
                    </span>
                    {' '}days this week.
                  </p>
                </GlassCard>

              </div>

              {/* Neutral Summaries */}
              <div>
                <SectionLabel label="THIS WEEK AT A GLANCE" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      value: `${dietSummary.proteinHitDays} / 7 days`,
                      label: 'Protein target met'
                    },
                    {
                      value: `${dietSummary.avgCalories.toLocaleString()} kcal`,
                      label: 'Avg daily calories'
                    },
                    {
                      value: `${dietSummary.daysWithEntries} days`,
                      label: 'Days with diet entries'
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-[12px]"
                      style={{
                        background: 'rgba(255,255,255,0.025)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderLeft: `2px solid ${ACCENT}`,
                        borderRadius: '0 12px 12px 0',
                      }}
                    >
                      <p className="font-mono font-bold text-[24px] text-white mb-1">
                        {item.value}
                      </p>
                      <p
                        className="font-sans text-[11px]"
                        style={{ color: 'rgba(255,255,255,0.35)' }}
                      >
                        {item.label}
                      </p>
                    </div>
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
                    className="font-mono text-[11px] shrink-0"
                    style={{ color: ACCENT }}
                  >
                    {formatRelativeDate(row.date)}
                  </span>
                )}
                renderMiddle={(row) => (
                  <div className="flex flex-col gap-0.5">
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
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                  >
                    {(row.payload?.water_ml || 0).toLocaleString()} ml
                  </span>
                )}
              />

            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default GymDeepDive