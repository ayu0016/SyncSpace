import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { closeModal } from '../../store/uiSlice'
import Input from '../Input'
import Select from '../Select'
import Button from '../Button'

// YOUR LOGIC: import entries service + redux action
// import { entriesService } from '../../services/entriesService'
// import { addEntry } from '../../store/entriesSlice'

const RESOURCE_TYPE_OPTIONS = [
  { label: 'Course',  value: 'course'  },
  { label: 'Video',   value: 'video'   },
  { label: 'Paper',   value: 'paper'   },
  { label: 'Book',    value: 'book'    },
  { label: 'Article', value: 'article' },
]

const today = () => new Date().toISOString().split('T')[0]

const MLQuickAddForm = ({ widgetId, onSuccess, accentColor }) => {
  const dispatch = useDispatch()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      entry_date:    today(),
      topic:         '',
      source:        '',
      resource_type: '',
      duration_mins: '',
      notes:         '',
    }
  })

  const onSubmit = async (data) => {
    // YOUR LOGIC:
    // const payload = {
    //   topic:         data.topic,
    //   source:        data.source,
    //   resource_type: data.resource_type,
    //   duration_mins: Number(data.duration_mins),
    //   notes:         data.notes || null,
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
        label="Topic"
        placeholder="e.g. Transformers, Backpropagation"
        error={errors.topic}
        {...register('topic', {
          required: { value: true, message: 'Topic is required' }
        })}
      />

      <Input
        label="Source"
        placeholder="e.g. fast.ai, Andrej Karpathy, Papers with Code"
        error={errors.source}
        {...register('source', {
          required: { value: true, message: 'Source is required' }
        })}
      />

      <Controller
        name="resource_type"
        control={control}
        rules={{ required: { value: true, message: 'Resource type is required' } }}
        render={({ field }) => (
          <Select
            label="Resource Type"
            placeholder="Select Resource Type"
            options={RESOURCE_TYPE_OPTIONS}
            error={errors.resource_type}
            {...field}
          />
        )}
      />

      <Input
        label="Duration (mins)"
        type="number"
        placeholder="e.g. 45"
        error={errors.duration_mins}
        {...register('duration_mins', {
          required: { value: true, message: 'Duration is required' },
          min: { value: 1, message: 'Must be at least 1 min' }
        })}
      />

      <div className="space-y-2 w-full">
        <label className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1">
          Notes <span className="text-outline-variant/40 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          placeholder="Key takeaways or concepts learned..."
          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 focus:ring-1 focus:ring-primary-container focus:border-primary-container transition-all duration-200 min-h-20 resize-y"
          {...register('notes')}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 mt-1 border-t border-white/[0.07]">
        <Button type="button" variant="outline" onClick={() => dispatch(closeModal())}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Logging...' : 'Log Session'}
        </Button>
      </div>

    </form>
  )
}

export default MLQuickAddForm