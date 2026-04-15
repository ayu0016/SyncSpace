import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal } from '../../store/uiSlice'
import Input from '../Input'
import Button from '../Button'

//logical import
import { entryService } from '../../supabase/entryServices'
import { addEntry } from '../../store/entriesSlice'
import { widgetService } from '../../supabase/widgetServices'
import { updateWidget } from '../../store/widgetSlice'

const TABS = ['Workout', 'Diet', 'Goals']

const MUSCLE_GROUPS = [
  'Shoulder',
  'Biceps',
  'Triceps',
  'Chest',
  'Back',
  'Abs',
  'Legs',
]

const DEFAULT_TARGETS = {
  calorie_target: 2000,
  protein_target: 120,
  water_target: 2500,
  weekly_workout_goal: 5,
}

const today = () => {
  const d = new Date();
  return d.toLocaleDateString('en-CA');
}



// ─── Combobox ───────────────────────────────────────────────────────────────
const ExerciseCombobox = ({ value, onChange, suggestions, error, accentColor }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const ref = useRef(null)

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (name) => {
    setQuery(name)
    onChange(name)
    setOpen(false)
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    onChange(e.target.value)
    setOpen(true)
  }

  return (
    <div className="space-y-2 w-full relative" ref={ref}>
      <label className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1">
        Exercise Name
      </label>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Bench Press, Pull-ups"
        autoComplete="off"
        className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 transition-all duration-200 ${
          error
            ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50'
            : 'border-outline-variant/20 focus:ring-1 focus:ring-primary-container focus:border-primary-container'
        }`}
      />

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-surface-container border border-outline-variant/20 rounded-xl overflow-hidden shadow-xl">
          {filtered.map((name) => (
            <button
              key={name}
              type="button"
              onMouseDown={() => handleSelect(name)}
              className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-white/5 transition-colors duration-150"
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs ml-1">{error.message}</p>
      )}
    </div>
  )
}

// ─── Main Form ───────────────────────────────────────────────────────────────
const GymQuickAddForm = ({ widgetId, accentColor }) => {
  const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.userData)


  // Pull entries from Redux to derive past exercise names
  const allEntries = useSelector(state => state.entries.byWidgetId?.[widgetId] || [])
  const pastExercises = [...new Set(
    allEntries
      .filter(e => e.payload?.entry_type === 'workout')
      .map(e => e.payload?.exercise_name)
      .filter(Boolean)
  )]

  // Pull current widget config for Goals tab defaults
  const widget = useSelector(state => state.widgets.items?.find(w => w.id === widgetId))
  const config = widget?.config || {}

  const [activeTab, setActiveTab] = useState('Workout')

  // ── Workout form ──
  const workoutForm = useForm({
    defaultValues: {
      entry_date:    today(),
      exercise_name: '',
      muscle_group:  '',
      sets:          '',
      reps:          '',
      weight_kg:     '',
      notes:         '',
    }
  })

  // ── Diet form ──
  const dietForm = useForm({
    defaultValues: {
      entry_date: today(),
      calories:   '',
      protein_g:  '',
      water_ml:   '',
    }
  })

  // ── Goals form ──
  const goalsForm = useForm({
    defaultValues: {
      calorie_target:      config.calorie_target      ?? DEFAULT_TARGETS.calorie_target,
      protein_target:      config.protein_target      ?? DEFAULT_TARGETS.protein_target,
      water_target:        config.water_target        ?? DEFAULT_TARGETS.water_target,
      weekly_workout_goal: config.weekly_workout_goal ?? DEFAULT_TARGETS.weekly_workout_goal,
    }
  })

  // ── Handlers ──
  const onSubmitWorkout = async (data) => {
    try{
        // Safety check for the user
        if (!user?.id) return;

        const payload = {
      entry_type:    'workout',
      exercise_name: data.exercise_name,
      muscle_group:  data.muscle_group,
      sets:          Number(data.sets),
      reps:          Number(data.reps),
      weight_kg:     Number(data.weight_kg),
      notes:         data.notes || null,
    }
    const entry = await entryService.addEntry(widgetId, user.id, payload, data.entry_date)

    if(entry){
        dispatch(addEntry({entry,widget_id:widgetId}))
        dispatch(closeModal())

    }

    }
    catch (error) {
      console.error("Error creating entry:", error)
    }
    // YOUR LOGIC:
    
  }

  const onSubmitDiet = async (data) => {
    // YOUR LOGIC:
    const payload = {
      entry_type: 'diet',
      calories:   Number(data.calories),
      protein_g:  Number(data.protein_g),
      water_ml:   Number(data.water_ml),
    }
    const entry = await entryService.addEntry(widgetId, payload, data.entry_date)
    if(entry){
            dispatch(addEntry(entry))
            dispatch(closeModal())
    }
  }

  const onSubmitGoals = async (data) => {
    // YOUR LOGIC:
    const updatedConfig = {
      ...config,
      calorie_target:      Number(data.calorie_target),
      protein_target:      Number(data.protein_target),
      water_target:        Number(data.water_target),
      weekly_workout_goal: Number(data.weekly_workout_goal),
    }
    const updated = await widgetService.updateWidget(widgetId, { config: updatedConfig })
    if (updated){
        dispatch(updateWidget(updated))
        dispatch(closeModal())
  }}

  return (
    <div className="flex flex-col gap-4">

      {/* Tab toggle */}
      <div className="flex w-full border-b border-white/[0.07] relative">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 pb-3 text-sm font-bold transition-all duration-300 relative ${
              activeTab === tab ? 'text-white' : 'text-white/30 hover:text-white/60'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div
                className="absolute -bottom-px left-0 w-full h-0.5 rounded-t-full"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 -2px 10px ${accentColor}, 0 0 4px ${accentColor}`,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Workout tab ── */}
      {activeTab === 'Workout' && (
        <form
          key="workout"
          onSubmit={workoutForm.handleSubmit(onSubmitWorkout)}
          className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Input
            label="Date"
            type="date"
            error={workoutForm.formState.errors.entry_date}
            {...workoutForm.register('entry_date', {
              required: { value: true, message: 'Date is required' },
              max: { value: today(), message: 'Cannot log future entries' },
            })}
          />

          {/* Exercise combobox — populated from past entries */}
          <ExerciseCombobox
            value={workoutForm.watch('exercise_name')}
            onChange={(val) => workoutForm.setValue('exercise_name', val, { shouldValidate: true })}
            suggestions={pastExercises}
            error={workoutForm.formState.errors.exercise_name}
            accentColor={accentColor}
          />
          {/* Hidden field so RHF validation works */}
          <input
            type="hidden"
            {...workoutForm.register('exercise_name', {
              required: { value: true, message: 'Exercise name is required' }
            })}
          />

          {/* Muscle group dropdown */}
          <div className="space-y-2 w-full">
            <label className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1">
              Muscle Group
            </label>
            <select
              className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-on-surface text-sm outline-none transition-all duration-200 ${
                workoutForm.formState.errors.muscle_group
                  ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50'
                  : 'border-outline-variant/20 focus:ring-1 focus:ring-primary-container focus:border-primary-container'
              }`}
              {...workoutForm.register('muscle_group', {
                required: { value: true, message: 'Muscle group is required' }
              })}
            >
              <option value="">Select muscle group</option>
              {MUSCLE_GROUPS.map(mg => (
                <option key={mg} value={mg.toLowerCase()}>{mg}</option>
              ))}
            </select>
            {workoutForm.formState.errors.muscle_group && (
              <p className="text-red-400 text-xs ml-1">
                {workoutForm.formState.errors.muscle_group.message}
              </p>
            )}
          </div>

          {/* Sets + Reps */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sets"
              type="number"
              placeholder="0"
              error={workoutForm.formState.errors.sets}
              {...workoutForm.register('sets', {
                required: { value: true, message: 'Required' },
                min: { value: 1, message: 'Min 1' }
              })}
            />
            <Input
              label="Reps"
              type="number"
              placeholder="0"
              error={workoutForm.formState.errors.reps}
              {...workoutForm.register('reps', {
                required: { value: true, message: 'Required' },
                min: { value: 1, message: 'Min 1' }
              })}
            />
          </div>

          <Input
            label="Weight (kg)"
            type="number"
            placeholder="0"
            error={workoutForm.formState.errors.weight_kg}
            {...workoutForm.register('weight_kg', {
              required: { value: true, message: 'Weight is required' },
              min: { value: 0, message: 'Must be positive' }
            })}
          />

          <div className="space-y-2 w-full">
            <label className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1">
              Notes <span className="text-outline-variant/40 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Optional notes..."
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 focus:ring-1 focus:ring-primary-container focus:border-primary-container transition-all duration-200 min-h-20 resize-y"
              {...workoutForm.register('notes')}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 mt-1 border-t border-white/[0.07]">
            <Button type="button" variant="outline" onClick={() => dispatch(closeModal())}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={workoutForm.formState.isSubmitting}>
              {workoutForm.formState.isSubmitting ? 'Logging...' : 'Log Workout'}
            </Button>
          </div>
        </form>
      )}

      {/* ── Diet tab ── */}
      {activeTab === 'Diet' && (
        <form
          key="diet"
          onSubmit={dietForm.handleSubmit(onSubmitDiet)}
          className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <Input
            label="Date"
            type="date"
            error={dietForm.formState.errors.entry_date}
            {...dietForm.register('entry_date', {
              required: { value: true, message: 'Date is required' },
              max: { value: today(), message: 'Cannot log future entries' },
            })}
          />

          <Input
            label="Calories"
            type="number"
            placeholder="0 kcal"
            error={dietForm.formState.errors.calories}
            {...dietForm.register('calories', {
              required: { value: true, message: 'Calories is required' },
              min: { value: 0, message: 'Must be positive' }
            })}
          />

          <Input
            label="Protein (g)"
            type="number"
            placeholder="0 g"
            error={dietForm.formState.errors.protein_g}
            {...dietForm.register('protein_g', {
              required: { value: true, message: 'Protein is required' },
              min: { value: 0, message: 'Must be positive' }
            })}
          />

          <Input
            label="Water (ml)"
            type="number"
            placeholder="0 ml"
            error={dietForm.formState.errors.water_ml}
            {...dietForm.register('water_ml', {
              required: { value: true, message: 'Water intake is required' },
              min: { value: 0, message: 'Must be positive' }
            })}
          />

          <div className="flex items-center justify-end gap-3 pt-3 mt-1 border-t border-white/[0.07]">
            <Button type="button" variant="outline" onClick={() => dispatch(closeModal())}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={dietForm.formState.isSubmitting}>
              {dietForm.formState.isSubmitting ? 'Logging...' : 'Log Diet'}
            </Button>
          </div>
        </form>
      )}

      {/* ── Goals tab ── */}
      {activeTab === 'Goals' && (
        <form
          key="goals"
          onSubmit={goalsForm.handleSubmit(onSubmitGoals)}
          className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {/* Nudge banner if goals not yet customised */}
          {!config.calorie_target && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-white/4 border border-white/[0.07] text-xs text-white/50">
              <span>⚙️</span>
              <span>Using default targets. Set your own goals for accurate tracking.</span>
            </div>
          )}

          <Input
            label="Daily Calorie Target (kcal)"
            type="number"
            placeholder="2000"
            error={goalsForm.formState.errors.calorie_target}
            {...goalsForm.register('calorie_target', {
              required: { value: true, message: 'Required' },
              min: { value: 500, message: 'Min 500 kcal' }
            })}
          />

          <Input
            label="Daily Protein Target (g)"
            type="number"
            placeholder="120"
            error={goalsForm.formState.errors.protein_target}
            {...goalsForm.register('protein_target', {
              required: { value: true, message: 'Required' },
              min: { value: 10, message: 'Min 10g' }
            })}
          />

          <Input
            label="Daily Water Target (ml)"
            type="number"
            placeholder="2500"
            error={goalsForm.formState.errors.water_target}
            {...goalsForm.register('water_target', {
              required: { value: true, message: 'Required' },
              min: { value: 500, message: 'Min 500ml' }
            })}
          />

          <Input
            label="Weekly Workout Goal (days)"
            type="number"
            placeholder="5"
            error={goalsForm.formState.errors.weekly_workout_goal}
            {...goalsForm.register('weekly_workout_goal', {
              required: { value: true, message: 'Required' },
              min: { value: 1, message: 'Min 1 day' },
              max: { value: 7, message: 'Max 7 days' }
            })}
          />

          <div className="flex items-center justify-end gap-3 pt-3 mt-1 border-t border-white/[0.07]">
            <Button type="button" variant="outline" onClick={() => dispatch(closeModal())}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={goalsForm.formState.isSubmitting}>
              {goalsForm.formState.isSubmitting ? 'Saving...' : 'Save Goals'}
            </Button>
          </div>
        </form>
      )}

    </div>
  )
}

export default GymQuickAddForm