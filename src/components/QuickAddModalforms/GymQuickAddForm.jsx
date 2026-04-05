import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { closeModal } from '../../store/uiSlice'
import Input from '../ui/Input'
import Button from '../ui/Button'

// YOUR LOGIC: import entries service + redux action
// import { entriesService } from '../../services/entriesService'
// import { addEntry } from '../../store/entriesSlice'

const TABS = ['Workout', 'Diet']

const today = () => new Date().toISOString().split('T')[0]

const GymQuickAddForm = ({ widgetId, onSuccess, accentColor }) => {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('Workout')

  const workoutForm = useForm({
    defaultValues: {
      entry_date:    today(),
      exercise_name: '',
      workout_type:  '',
      sets:          '',
      reps:          '',
      weight_kg:     '',
      notes:         '',
    }
  })

  const dietForm = useForm({
    defaultValues: {
      entry_date: today(),
      calories:   '',
      protein_g:  '',
      water_ml:   '',
    }
  })

  const onSubmitWorkout = async (data) => {
    // YOUR LOGIC:
    // const payload = {
    //   entry_type:    'workout',
    //   exercise_name: data.exercise_name,
    //   workout_type:  data.workout_type,
    //   sets:          Number(data.sets),
    //   reps:          Number(data.reps),
    //   weight_kg:     data.weight_kg ? Number(data.weight_kg) : null,
    //   notes:         data.notes || null,
    // }
    // const entry = await entriesService.createEntry(widgetId, payload, data.entry_date)
    // dispatch(addEntry(entry))
    onSuccess()
  }

  const onSubmitDiet = async (data) => {
    // YOUR LOGIC:
    // const payload = {
    //   entry_type: 'diet',
    //   calories:   Number(data.calories),
    //   protein_g:  Number(data.protein_g),
    //   water_ml:   Number(data.water_ml),
    // }
    // const entry = await entriesService.createEntry(widgetId, payload, data.entry_date)
    // dispatch(addEntry(entry))
    onSuccess()
  }

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

      {/* Workout tab */}
      {activeTab === 'Workout' && (
        <form
          key="workout"
          onSubmit={workoutForm.handleSubmit(onSubmitWorkout)}
          className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {/* Date — allows backdating missed entries */}
          <Input
            label="Date"
            type="date"
            error={workoutForm.formState.errors.entry_date}
            {...workoutForm.register('entry_date', {
              required: { value: true, message: 'Date is required' },
              max: { value: today(), message: 'Cannot log future entries' },
            })}
          />

          <Input
            label="Exercise Name"
            placeholder="e.g. Bench Press, Pull-ups"
            error={workoutForm.formState.errors.exercise_name}
            {...workoutForm.register('exercise_name', {
              required: { value: true, message: 'Exercise name is required' }
            })}
          />

          <Input
            label="Workout Type"
            placeholder="e.g. Push, Pull, Legs, Cardio"
            error={workoutForm.formState.errors.workout_type}
            {...workoutForm.register('workout_type', {
              required: { value: true, message: 'Workout type is required' }
            })}
          />

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
            {...workoutForm.register('weight_kg')}
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
              {workoutForm.formState.isSubmitting ? 'Logging...' : 'Log Entry'}
            </Button>
          </div>
        </form>
      )}

      {/* Diet tab */}
      {activeTab === 'Diet' && (
        <form
          key="diet"
          onSubmit={dietForm.handleSubmit(onSubmitDiet)}
          className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {/* Date — allows backdating missed entries */}
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
              {dietForm.formState.isSubmitting ? 'Logging...' : 'Log Entry'}
            </Button>
          </div>
        </form>
      )}

    </div>
  )
}

export default GymQuickAddForm