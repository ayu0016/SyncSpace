import React, { useState, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { X } from 'lucide-react'
import { closeModal } from '../../store/uiSlice'
import Input from '../Input'
import Select from '../Select'
import Button from '../Button'

// YOUR LOGIC: import entries service + redux action
// import { entriesService } from '../../services/entriesService'
// import { addEntry } from '../../store/entriesSlice'

const STATUS_OPTIONS = [
  { label: 'Todo',        value: 'todo'        },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done',        value: 'done'        },
]

const PRIORITY_OPTIONS = [
  { label: 'Low',    value: 'low',    dot: '#3b82f6' },
  { label: 'Medium', value: 'medium', dot: '#f59e0b' },
  { label: 'High',   value: 'high',   dot: '#ef4444' },
]

const today = () => new Date().toISOString().split('T')[0]

const TagChipInput = ({ tags, setTags }) => {
  const [input, setInput]               = useState('')
  const [duplicateIndex, setDuplicateIndex] = useState(null)
  const inputRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      const newTag = input.trim()
      const existingIdx = tags.findIndex(t => t.toLowerCase() === newTag.toLowerCase())
      if (existingIdx !== -1) {
        setDuplicateIndex(existingIdx)
        setTimeout(() => setDuplicateIndex(null), 400)
      } else {
        setTags([...tags, newTag])
        setInput('')
      }
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  return (
    <>
      <style>{`
        @keyframes chipShake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-4px); }
          50%       { transform: translateX(4px); }
          75%       { transform: translateX(-4px); }
        }
        .chip-shake { animation: chipShake 0.35s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      <div
        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2.5 flex flex-wrap gap-2 cursor-text min-h-13 focus-within:ring-1 focus-within:ring-primary-container focus-within:border-primary-container transition-all duration-200"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 bg-white/8 border border-white/5 text-white px-2.5 py-1.5 rounded-lg text-[13px] ${duplicateIndex === i ? 'chip-shake' : ''}`}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setTags(tags.filter((_, idx) => idx !== i)) }}
              className="text-white/40 hover:text-white transition-colors rounded-full p-0.5"
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Type and press Enter...' : ''}
          className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-outline-variant/40 focus:outline-none min-w-30 py-1"
        />
      </div>
    </>
  )
}

const KanbanQuickAddForm = ({ widgetId, onSuccess, accentColor }) => {
  const dispatch = useDispatch()
  const [tags, setTags] = useState([])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      entry_date: today(),
      title:      '',
      status:     '',
      priority:   '',
      due_date:   '',
    }
  })

  const onSubmit = async (data) => {
    // YOUR LOGIC:
    // const payload = {
    //   task_id:  crypto.randomUUID(),
    //   title:    data.title,
    //   status:   data.status,
    //   priority: data.priority,
    //   due_date: data.due_date || null,
    //   tags:     tags,
    // }
    // const entry = await entriesService.upsertEntry(widgetId, payload, data.entry_date)
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
        label="Task Title"
        placeholder="e.g. Build authentication flow"
        error={errors.title}
        {...register('title', {
          required: { value: true, message: 'Task title is required' }
        })}
      />

      <Controller
        name="status"
        control={control}
        rules={{ required: { value: true, message: 'Status is required' } }}
        render={({ field }) => (
          <Select
            label="Status"
            placeholder="Select Status"
            options={STATUS_OPTIONS}
            error={errors.status}
            {...field}
          />
        )}
      />

      <Controller
        name="priority"
        control={control}
        rules={{ required: { value: true, message: 'Priority is required' } }}
        render={({ field }) => (
          <Select
            label="Priority"
            placeholder="Select Priority"
            options={PRIORITY_OPTIONS}
            error={errors.priority}
            {...field}
          />
        )}
      />

      <Input
        label="Due Date"
        type="date"
        error={errors.due_date}
        {...register('due_date')}
      />

      <div className="space-y-2 w-full">
        <label className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1">
          Tags <span className="text-outline-variant/40 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <TagChipInput tags={tags} setTags={setTags} />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 mt-1 border-t border-white/[0.07]">
        <Button type="button" variant="outline" onClick={() => dispatch(closeModal())}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </Button>
      </div>

    </form>
  )
}

export default KanbanQuickAddForm