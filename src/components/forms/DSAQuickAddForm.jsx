import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Bookmark, Flag } from 'lucide-react'
import { closeModal } from '../../store/uiSlice'
import Input from '../Input'
import Select from '../Select'
import Button from '../Button'
import { entryService } from '../../supabase/entryServices'
import { addEntry } from '../../store/entriesSlice'

// Helper constants (outside to prevent re-creation on render)
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

const DSAQuickAddForm = ({ widgetId, accentColor }) => {
  const dispatch = useDispatch()
  
  // FIX 1: Moved inside the component
  const user = useSelector((state) => state.auth.userData)

  // Keeping your familiar useState logic
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isFlagged, setIsFlagged] = useState(false)

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
    try {
      // Safety check for the user
      if (!user?.id) return;

      // Manually merging form data with your local state
      const payload = {
        problem_title: data.problem_title || null,
        difficulty:    data.difficulty,
        topic:         data.topic,
        platform:      data.platform,
        notes:         data.notes || null,
        is_bookmarked: isBookmarked, // from useState
        is_flagged:    isFlagged,    // from useState
      }

      const entry = await entryService.createEntry(widgetId, user.id, payload, data.entry_date)
      
      if (entry) {
        dispatch(addEntry(entry))
        dispatch(closeModal())
      }
    } catch (error) {
      console.error("Error creating entry:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Date */}
      <Input
        label="Date"
        type="date"
        error={errors.entry_date}
        {...register('entry_date', {
          required: 'Date is required',
          max: { value: today(), message: 'Cannot log future entries' },
        })}
      />

      {/* Problem Title */}
      <Input
        label="Problem Title"
        placeholder="e.g. Two Sum"
        error={errors.problem_title}
        {...register('problem_title')}
      />

      {/* Difficulty */}
      <Controller
        name="difficulty"
        control={control}
        rules={{ required: 'Difficulty is required' }}
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

      {/* Topic */}
      <Input
        label="Topic"
        placeholder="e.g. Arrays, Dynamic Programming"
        error={errors.topic}
        {...register('topic', { required: 'Topic is required' })}
      />

      {/* Platform */}
      <Controller
        name="platform"
        control={control}
        rules={{ required: 'Platform is required' }}
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

      {/* Notes */}
      <div className="space-y-2 w-full">
        <label className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1">
          Notes <span className="text-outline-variant/40 font-normal (optional)"></span>
        </label>
        <textarea
          placeholder="Any observations..."
          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:ring-1 focus:ring-primary-container min-h-20"
          {...register('notes')}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.07]">
        <div className="flex items-center gap-2">
          
          <button
            type="button"
            onClick={() => setIsBookmarked(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isBookmarked ? 'bg-[#4a9eed]/10 border-[#4a9eed]/30 text-[#4a9eed]' : 'bg-transparent border-white/[0.08] text-white/30'
            }`}
          >
            <Bookmark size={13} fill={isBookmarked ? '#4a9eed' : 'none'} stroke={isBookmarked ? '#4a9eed' : 'currentColor'} />
            <span>Bookmark</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFlagged(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isFlagged ? 'bg-[#ef4444]/10 border-[#ef4444]/30 text-[#ef4444]' : 'bg-transparent border-white/[0.08] text-white/30'
            }`}
          >
            <Flag size={13} fill={isFlagged ? '#ef4444' : 'none'} stroke={isFlagged ? '#ef4444' : 'currentColor'} />
            <span>Flag</span>
          </button>
        </div>

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