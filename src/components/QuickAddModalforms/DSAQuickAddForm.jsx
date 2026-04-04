import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { closeModal } from '../../store/uiSlice'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'

// YOUR LOGIC: import entries service + redux action
// import { entriesService } from '../../services/entriesService'
// import { addEntry } from '../../store/entriesSlice'

const DIFFICULTY_OPTIONS = [
  { label: 'Easy',   value: 'easy',   dot: '#10b981' },
  { label: 'Medium', value: 'medium', dot: '#eab308' },
  { label: 'Hard',   value: 'hard',   dot: '#ef4444' },
]

const PLATFORM_OPTIONS = [
  { label: 'LeetCode',      value: 'leetcode'      },
  { label: 'Codeforces',    value: 'codeforces'    },
  { label: 'GeeksforGeeks', value: 'geeksforgeeks' },
  { label: 'HackerRank',    value: 'hackerrank'    },
  { label: 'AtCoder',       value: 'atcoder'       },
  { label: 'InterviewBit',  value: 'interviewbit'  },
  { label: 'Other',         value: 'other'         },
]

const DSAQuickAddForm = ({ widgetId, onSuccess, accentColor }) => {
  const dispatch = useDispatch()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      problem_title: '',
      difficulty: '',
      topic: '',
      platform: '',
      notes: '',
    }
  })

  const onSubmit = async (data) => {
    // YOUR LOGIC:
    // const payload = {
    //   problem_title: data.problem_title || null,
    //   difficulty: data.difficulty,
    //   topic: data.topic,
    //   platform: data.platform,
    //   notes: data.notes || null,
    // }
    // const entry = await entriesService.createEntry(widgetId, payload)
    // dispatch(addEntry(entry))
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      <Input
        label="Problem Title"
        placeholder="e.g. Two Sum"
        error={errors.problem_title}
        {...register('problem_title')}
      />

      <Controller
        name="difficulty"
        control={control}
        rules={{ required: { value: true, message: 'Difficulty is required' } }}
        render={({ field }) => (
          <Select
            label="Difficulty"
            placeholder="Select Difficulty"
            options={DIFFICULTY_OPTIONS}
            error={errors.difficulty}
            {...field}
          />
        )}
      />

      <Input
        label="Topic"
        placeholder="e.g. Arrays, Dynamic Programming"
        error={errors.topic}
        {...register('topic', {
          required: { value: true, message: 'Topic is required' }
        })}
      />

      <Controller
        name="platform"
        control={control}
        rules={{ required: { value: true, message: 'Platform is required' } }}
        render={({ field }) => (
          <Select
            label="Platform"
            placeholder="Select Platform"
            options={PLATFORM_OPTIONS}
            error={errors.platform}
            {...field}
          />
        )}
      />

      <div className="space-y-2 w-full">
        <label className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1">
          Notes <span className="text-outline-variant/40 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          placeholder="Any observations or approach notes..."
          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 focus:ring-1 focus:ring-primary-container focus:border-primary-container transition-all duration-200 min-h-20 resize-y"
          {...register('notes')}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 mt-1 border-t border-white/[0.07]">
        <Button type="button" variant="outline" onClick={() => dispatch(closeModal())}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Logging...' : 'Log Problem'}
        </Button>
      </div>

    </form>
  )
}

export default DSAQuickAddForm