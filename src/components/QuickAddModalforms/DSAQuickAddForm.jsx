import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Bookmark, Flag } from 'lucide-react'
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

const today = () => new Date().toISOString().split('T')[0]

const DSAQuickAddForm = ({ widgetId, onSuccess, accentColor }) => {
  const dispatch = useDispatch()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isFlagged, setIsFlagged]       = useState(false)

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
      entry_date: today(),
    }
  })

  const onSubmit = async (data) => {
    // YOUR LOGIC:
    // const payload = {
    //   problem_title:  data.problem_title || null,
    //   difficulty:     data.difficulty,
    //   topic:          data.topic,
    //   platform:       data.platform,
    //   notes:          data.notes || null,
    //   is_bookmarked:  isBookmarked,
    //   is_flagged:     isFlagged,
    // }
    // const entry = await entriesService.createEntry(widgetId, payload, data.entry_date)
    // dispatch(addEntry(entry))
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      {/* Date — allows backdating missed entries */}
      <Input
        label="Date"
        type="date"
        error={errors.entry_date}
        {...register('entry_date', {
          required: { value: true, message: 'Date is required' },
          max: { value: today(), message: 'Cannot log future entries' },
        })}
      />

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

      {/* Footer: bookmark + flag toggles on left, cancel + submit on right */}
      <div className="flex items-center justify-between gap-3 pt-3 mt-1 border-t border-white/[0.07]">

        {/* Signal toggles */}
        <div className="flex items-center gap-2">

          {/* Bookmark toggle */}
          <button
            type="button"
            onClick={() => setIsBookmarked(prev => !prev)}
            title={isBookmarked ? 'Bookmarked — great pattern' : 'Bookmark this problem'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
              isBookmarked
                ? 'bg-[#4a9eed]/10 border-[#4a9eed]/30 text-[#4a9eed]'
                : 'bg-transparent border-white/[0.08] text-white/30 hover:text-white/60 hover:border-white/20'
            }`}
          >
            <Bookmark
              size={13}
              fill={isBookmarked ? '#4a9eed' : 'none'}
              stroke={isBookmarked ? '#4a9eed' : 'currentColor'}
            />
            <span>Bookmark</span>
          </button>

          {/* Flag toggle */}
          <button
            type="button"
            onClick={() => setIsFlagged(prev => !prev)}
            title={isFlagged ? 'Flagged — will appear in graveyard' : 'Flag — I struggled here'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
              isFlagged
                ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]'
                : 'bg-transparent border-white/[0.08] text-white/30 hover:text-white/60 hover:border-white/20'
            }`}
          >
            <Flag
              size={13}
              fill={isFlagged ? '#ef4444' : 'none'}
              stroke={isFlagged ? '#ef4444' : 'currentColor'}
            />
            <span>Flag</span>
          </button>

        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => dispatch(closeModal())}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Logging...' : 'Log Problem'}
          </Button>
        </div>

      </div>

    </form>
  )
}

export default DSAQuickAddForm