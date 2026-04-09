import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal } from '../../store/uiSlice'
import { entryService } from '../../supabase/entryServices'
import { addEntry } from '../../store/entriesSlice'
import Button from '../Button'

// ─── Constants ────────────────────────────────────────────────────────────────

const RESOURCE_TYPES = [
  { value: 'youtube',  label: 'YouTube',  icon: '▶' },
  { value: 'course',   label: 'Course',   icon: '📚' },
  { value: 'paper',    label: 'Paper',    icon: '📄' },
  { value: 'book',     label: 'Book',     icon: '📖' },
  { value: 'project',  label: 'Project',  icon: '🔨' },
  { value: 'blog',     label: 'Blog',     icon: '🗒' },
]

const SESSION_TYPES = [
  { value: 'theory',   label: 'Theory'   },
  { value: 'practice', label: 'Practice' },
  { value: 'project',  label: 'Project'  },
  { value: 'revision', label: 'Revision' },
]

const DURATION_PRESETS = [
  { label: '15m',   value: 15   },
  { label: '30m',   value: 30   },
  { label: '45m',   value: 45   },
  { label: '1h',    value: 60   },
  { label: '1.5h',  value: 90   },
  { label: '2h+',   value: null }, // null = triggers manual input
]

const UNDERSTANDING_LEVELS = [1, 2, 3, 4, 5]

const today = () => new Date().toISOString().split('T')[0]

// ─── Sub-components ───────────────────────────────────────────────────────────

// Shared label style
const FieldLabel = ({ children, optional = false }) => (
  <label className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1 mb-2">
    {children}
    {optional && (
      <span className="text-outline-variant/40 font-normal normal-case tracking-normal ml-1">
        (optional)
      </span>
    )}
  </label>
)

// Section divider with title
const ZoneLabel = ({ children }) => (
  <div className="flex items-center gap-3 my-1">
    <span className="text-[10px] font-bold tracking-[0.15em] text-outline-variant/50 uppercase whitespace-nowrap">
      {children}
    </span>
    <div className="flex-1 h-px bg-white/5" />
  </div>
)

// Combobox — builds user's personal vocabulary over time
// YOUR LOGIC: pastOptions should be fetched from distinct payload values in entries
const Combobox = ({ value, onChange, placeholder, pastOptions = [], error }) => {
  const [inputVal, setInputVal] = useState(value || '')
  const [open, setOpen] = useState(false)

  // TODO: fetch pastOptions from entries for this widget
  // e.g. SELECT DISTINCT payload->>'topic' FROM entries WHERE widget_id = mlWidgetId
  // Normalize to Title Case on save

  const filtered = pastOptions.filter(opt =>
    opt.toLowerCase().includes(inputVal.toLowerCase())
  )
  const showAdd = inputVal && !pastOptions.find(
    o => o.toLowerCase() === inputVal.toLowerCase()
  )

  const handleSelect = (val) => {
    // Normalize to Title Case
    const normalized = val.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    setInputVal(normalized)
    onChange(normalized)
    setOpen(false)
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={inputVal}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={e => { setInputVal(e.target.value); onChange(e.target.value); setOpen(true) }}
        className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 transition-all duration-200
          ${error
            ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50'
            : 'border-outline-variant/20 focus:ring-1 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6]/50'
          }`}
      />
      {open && (filtered.length > 0 || showAdd) && (
        <div className="absolute z-50 w-full mt-1 bg-[#12121a] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
          {filtered.map(opt => (
            <div
              key={opt}
              onMouseDown={() => handleSelect(opt)}
              className="px-4 py-2.5 text-sm text-on-surface hover:bg-white/[0.05] cursor-pointer transition-colors duration-150"
            >
              {opt}
            </div>
          ))}
          {showAdd && (
            <div
              onMouseDown={() => handleSelect(inputVal)}
              className="px-4 py-2.5 text-sm text-[#8b5cf6] hover:bg-[#8b5cf6]/10 cursor-pointer transition-colors duration-150 border-t border-white/[0.06] flex items-center gap-2"
            >
              <span className="text-xs">＋</span>
              Add &quot;{inputVal}&quot;
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="text-red-400 text-xs mt-1 ml-1">{error.message}</p>
      )}
    </div>
  )
}

// Icon chip selector for resource type
const ResourceTypeChips = ({ value, onChange, error }) => (
  <div>
    <div className="flex flex-wrap gap-2">
      {RESOURCE_TYPES.map(rt => (
        <button
          key={rt.value}
          type="button"
          onClick={() => onChange(rt.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border
            ${value === rt.value
              ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/60 text-[#8b5cf6]'
              : 'bg-white/[0.03] border-white/[0.08] text-outline-variant hover:bg-white/[0.06] hover:border-white/[0.15]'
            }`}
        >
          <span>{rt.icon}</span>
          <span>{rt.label}</span>
        </button>
      ))}
    </div>
    {error && <p className="text-red-400 text-xs mt-1 ml-1">{error.message}</p>}
  </div>
)

// Quick-select duration buttons
const DurationPicker = ({ value, onChange, error }) => {
  const [showManual, setShowManual] = useState(false)

  const handlePreset = (preset) => {
    if (preset.value === null) {
      setShowManual(true)
      onChange('')
    } else {
      setShowManual(false)
      onChange(preset.value)
    }
  }

  const isActive = (preset) => {
    if (preset.value === null) return showManual
    return !showManual && value === preset.value
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {DURATION_PRESETS.map(preset => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePreset(preset)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-200 border
              ${isActive(preset)
                ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/60 text-[#8b5cf6]'
                : 'bg-white/[0.03] border-white/[0.08] text-outline-variant hover:bg-white/[0.06] hover:border-white/[0.15]'
              }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {showManual && (
        <input
          type="number"
          placeholder="Enter minutes e.g. 135"
          min={1}
          value={value || ''}
          onChange={e => onChange(Number(e.target.value))}
          className="mt-2 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 focus:ring-1 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6]/50 transition-all duration-200 font-mono"
          autoFocus
        />
      )}
      {error && <p className="text-red-400 text-xs mt-1 ml-1">{error.message}</p>}
    </div>
  )
}

// Segmented control — used for both session type and understanding level
const SegmentedControl = ({ options, value, onChange, accentColor = '#8b5cf6', showExtremeLabels = false }) => (
  <div>
    <div className="flex rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
      {options.map((opt, idx) => (
        <button
          key={opt.value ?? opt}
          type="button"
          onClick={() => onChange(opt.value ?? opt)}
          className={`flex-1 py-2 text-xs font-medium transition-all duration-200 relative
            ${(opt.value ?? opt) === value
              ? 'text-white'
              : 'text-outline-variant hover:text-on-surface/70'
            }
            ${idx !== 0 ? 'border-l border-white/[0.08]' : ''}
          `}
          style={(opt.value ?? opt) === value
            ? { backgroundColor: `${accentColor}30`, color: accentColor }
            : {}
          }
        >
          {opt.label ?? opt}
        </button>
      ))}
    </div>
    {showExtremeLabels && (
      <div className="flex justify-between mt-1 px-1">
        <span className="text-[10px] text-outline-variant/40">Lost</span>
        <span className="text-[10px] text-outline-variant/40">Nailed it</span>
      </div>
    )}
  </div>
)

// ─── Main Form ────────────────────────────────────────────────────────────────

const MLQuickAddForm = ({ widgetId, accentColor = '#8b5cf6' }) => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.userData) // inside component — never outside

  // YOUR LOGIC: fetch these from distinct entry payloads for this widget
  // e.g. SELECT DISTINCT payload->>'topic' FROM entries WHERE widget_id = widgetId AND user_id = user.id
  const pastTopics  = [] // TODO: replace with real fetched distinct topics
  const pastSources = [] // TODO: replace with real fetched distinct sources

  const {
    control,
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      entry_date:          today(),
      topic:               '',
      subtopic:            '',
      resource_type:       '',
      source:              '',
      duration_mins:       '',
      session_type:        'theory', // defaults to theory
      understanding_level: '',
      notes:               '',
    }
  })

  const onSubmit = async (data) => {
    if (!user?.id) return // null guard — same pattern as todo insert
    const payload = {
      topic:               data.topic,
      subtopic:            data.subtopic || null,
      resource_type:       data.resource_type,
      source:              data.source,
      duration_mins:       Number(data.duration_mins),
      session_type:        data.session_type,
      understanding_level: Number(data.understanding_level),
      notes:               data.notes || null,
    }
    const entry = await entryService.addEntry(widgetId, user.id, payload, data.entry_date)
    dispatch(addEntry(entry))
    dispatch(closeModal())
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

      {/* ── Date ── */}
      <div>
        <FieldLabel>Date</FieldLabel>
        <input
          type="date"
          className={`w-full bg-surface-container-lowest border rounded-xl px-4 py-3 text-on-surface text-sm outline-none transition-all duration-200 font-mono
            ${errors.entry_date
              ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/50'
              : 'border-outline-variant/20 focus:ring-1 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6]/50'
            }`}
          {...register('entry_date', {
            required: { value: true, message: 'Date is required' },
            max: { value: today(), message: 'Cannot log future entries' },
          })}
        />
        {errors.entry_date && (
          <p className="text-red-400 text-xs mt-1 ml-1">{errors.entry_date.message}</p>
        )}
      </div>

      {/* ── Zone 1: WHAT did you study? ── */}
      <ZoneLabel>What did you study?</ZoneLabel>

      {/* Topic — combobox */}
      <div>
        <FieldLabel>Topic</FieldLabel>
        <Controller
          name="topic"
          control={control}
          rules={{ required: { value: true, message: 'Topic is required' } }}
          render={({ field }) => (
            <Combobox
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. Transformers, Backpropagation"
              pastOptions={pastTopics}
              error={errors.topic}
            />
          )}
        />
      </div>

      {/* Subtopic — optional free text */}
      <div>
        <FieldLabel optional>Subtopic</FieldLabel>
        <input
          type="text"
          placeholder="e.g. attention mechanism, k-means clustering"
          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 focus:ring-1 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6]/50 transition-all duration-200"
          {...register('subtopic')}
        />
      </div>

      {/* Source — combobox */}
      <div>
        <FieldLabel>Source</FieldLabel>
        <Controller
          name="source"
          control={control}
          rules={{ required: { value: true, message: 'Source is required' } }}
          render={({ field }) => (
            <Combobox
              value={field.value}
              onChange={field.onChange}
              placeholder="e.g. Andrej Karpathy, fast.ai, Arxiv"
              pastOptions={pastSources}
              error={errors.source}
            />
          )}
        />
      </div>

      {/* ── Zone 2: HOW did you study? ── */}
      <ZoneLabel>How did you study?</ZoneLabel>

      {/* Resource Type — icon chips */}
      <div>
        <FieldLabel>Resource Type</FieldLabel>
        <Controller
          name="resource_type"
          control={control}
          rules={{ required: { value: true, message: 'Resource type is required' } }}
          render={({ field }) => (
            <ResourceTypeChips
              value={field.value}
              onChange={field.onChange}
              error={errors.resource_type}
            />
          )}
        />
      </div>

      {/* Session Type — segmented control, defaults to theory */}
      <div>
        <FieldLabel>Session Type</FieldLabel>
        <Controller
          name="session_type"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              options={SESSION_TYPES}
              value={field.value}
              onChange={field.onChange}
              accentColor={accentColor}
            />
          )}
        />
      </div>

      {/* ── Zone 3: HOW LONG + HOW WELL? ── */}
      <ZoneLabel>How long &amp; how well?</ZoneLabel>

      {/* Duration — quick-select presets */}
      <div>
        <FieldLabel>Duration</FieldLabel>
        <Controller
          name="duration_mins"
          control={control}
          rules={{ required: { value: true, message: 'Duration is required' } }}
          render={({ field }) => (
            <DurationPicker
              value={field.value}
              onChange={field.onChange}
              error={errors.duration_mins}
            />
          )}
        />
      </div>

      {/* Understanding Level — 5-segment control */}
      <div>
        <FieldLabel>Understanding</FieldLabel>
        <Controller
          name="understanding_level"
          control={control}
          rules={{ required: { value: true, message: 'Understanding level is required' } }}
          render={({ field }) => (
            <SegmentedControl
              options={UNDERSTANDING_LEVELS}
              value={field.value}
              onChange={field.onChange}
              accentColor={accentColor}
              showExtremeLabels
            />
          )}
        />
        {errors.understanding_level && (
          <p className="text-red-400 text-xs mt-1 ml-1">{errors.understanding_level.message}</p>
        )}
      </div>

      {/* Notes — optional */}
      <div>
        <FieldLabel optional>Notes</FieldLabel>
        <textarea
          placeholder="Key takeaways or concepts learned..."
          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 focus:ring-1 focus:ring-[#8b5cf6]/50 focus:border-[#8b5cf6]/50 transition-all duration-200 min-h-20 resize-y"
          {...register('notes')}
        />
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 pt-3 mt-1 border-t border-white/[0.07]">
        <Button type="button" variant="outline" onClick={() => dispatch(closeModal())}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Logging...' : 'Log Session'}
        </Button>
      </div>

    </form>
  )
}

export default MLQuickAddForm