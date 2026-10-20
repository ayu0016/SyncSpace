import { useState, useMemo, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal } from '../../store/uiSlice'
import { entryService } from '../../supabase/entryServices'
import { addEntry, updateEntry } from '../../store/entriesSlice'
import Input from '../Input'
import Button from '../Button'
import { hexToRgba } from '../../utils/colorUtils'

// ─── Constants ─────────────────────────────────────────────────────────────────

const DURATION_PRESETS = [
  { label: '15m',  value: 15  },
  { label: '30m',  value: 30  },
  { label: '45m',  value: 45  },
  { label: '1h',   value: 60  },
  { label: '1.5h', value: 90  },
  { label: '2h+',  value: null },
]

const RATING_LEVELS = [1, 2, 3, 4, 5]

const today = () => {
  const d = new Date()
  return d.toLocaleDateString('en-CA')
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const FieldLabel = ({ children, optional = false }) => (
  <label className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1 mb-2 font-mono">
    {children}
    {optional && (
      <span className="text-outline-variant/40 font-normal normal-case tracking-normal ml-1">
        (optional)
      </span>
    )}
  </label>
)

// Duration picker with quick-select chips
const DurationPicker = ({ value, onChange, error, accentColor }) => {
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
            className="px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all duration-200 border"
            style={isActive(preset) ? {
              background: hexToRgba(accentColor, 0.2),
              borderColor: hexToRgba(accentColor, 0.6),
              color: accentColor,
            } : {
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.08)',
              color: 'rgb(148,163,184)',
            }}
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
          className="mt-2 w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 transition-all duration-200 font-mono"
          onFocus={e => {
            e.target.style.borderColor = accentColor
            e.target.style.boxShadow = `0 0 0 1px ${accentColor}`
          }}
          onBlur={e => {
            e.target.style.borderColor = ''
            e.target.style.boxShadow = ''
          }}
          autoFocus
        />
      )}
      {error && <p className="text-red-400 text-xs mt-1 ml-1">{error.message}</p>}
    </div>
  )
}

// Rating dots — 1 through 5
const RatingDots = ({ value, onChange, accentColor }) => (
  <div>
    <div className="flex rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
      {RATING_LEVELS.map((level, idx) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`flex-1 py-2.5 text-xs font-bold transition-all duration-200 relative font-mono
            ${level === value
              ? 'text-white'
              : 'text-outline-variant hover:text-on-surface/70'
            }
            ${idx !== 0 ? 'border-l border-white/[0.08]' : ''}
          `}
          style={level === value ? {
            backgroundColor: hexToRgba(accentColor, 0.25),
            color: accentColor,
            boxShadow: `0 0 12px ${hexToRgba(accentColor, 0.2)}`,
          } : {}}
        >
          {level}
        </button>
      ))}
    </div>
    <div className="flex justify-between mt-1 px-1">
      <span className="text-[10px] text-outline-variant/40 font-mono">1 (min)</span>
      <span className="text-[10px] text-outline-variant/40 font-mono">5 (max)</span>
    </div>
  </div>
)

// Choice chip selector for choice-type fields (single-select radio behavior)
const ChoiceChips = ({ options, value, onChange, accentColor }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(value === opt ? '' : opt)}
        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border"
        style={value === opt ? {
          background: hexToRgba(accentColor, 0.2),
          borderColor: hexToRgba(accentColor, 0.6),
          color: accentColor,
          boxShadow: `0 0 10px ${hexToRgba(accentColor, 0.15)}`,
        } : {
          background: 'rgba(255,255,255,0.03)',
          borderColor: 'rgba(255,255,255,0.08)',
          color: 'rgb(148,163,184)',
        }}
      >
        {opt}
      </button>
    ))}
  </div>
)

// ─── Main Form ─────────────────────────────────────────────────────────────────

const CustomQuickAddForm = ({ widgetId, accentColor }) => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth.userData)
  const widget = useSelector(state =>
    state.widgets.widgets.find(w => w.id === widgetId)
  )

  // Edit mode support
  const editingEntryId = useSelector(state => state.ui.editingEntryId)
  const entries = useSelector(state => state.entries.entries[widgetId] || [])
  const editingEntry = editingEntryId
    ? entries.find(e => e.id === editingEntryId)
    : null

  const fields = useMemo(() => widget?.config?.fields || [], [widget?.config?.fields])
  const color = accentColor || widget?.color || '#4a9eed'

  // Build default values from scratch or from the entry being edited
  const initialValues = useMemo(() => {
    if (editingEntry) {
      const vals = {
        entry_date: editingEntry.date || editingEntry.entry_date || today(),
        duration_mins: editingEntry.payload?.duration_mins ?? '',
        rating: editingEntry.payload?.rating ?? '',
        notes: editingEntry.payload?.notes ?? '',
      }
      fields.forEach(f => {
        vals[f.key] = editingEntry.payload?.[f.key] ?? ''
      })
      return vals
    }

    const vals = {
      entry_date: today(),
      duration_mins: '',
      rating: '',
      notes: '',
    }
    fields.forEach(f => {
      vals[f.key] = ''
    })
    return vals
  }, [editingEntry, fields])

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: initialValues,
  })

  // Sync form values when editingEntry changes
  useEffect(() => {
    reset(initialValues)
  }, [initialValues, reset])

  const onSubmit = async (data) => {
    if (!user?.id) return

    const payload = {
      duration_mins: Number(data.duration_mins),
      rating: Number(data.rating),
      notes: data.notes?.trim() || '',
    }

    // Add the 3 custom fields
    fields.forEach(f => {
      const val = data[f.key]
      if (f.type === 'number') {
        payload[f.key] = val === '' || val === undefined ? '' : Number(val)
      } else {
        payload[f.key] = typeof val === 'string' ? val.trim() : (val || '')
      }
    })

    try {
      if (editingEntry) {
        // YOUR LOGIC:
        const updated = await entryService.updateEntry(
          editingEntry.id,
          user.id,
          payload,
          data.entry_date
        )
        if (updated) {
          dispatch(updateEntry({ widget_id: widgetId, entry: updated }))
          dispatch(closeModal())
        }
      } else {
        // YOUR LOGIC:
        const entry = await entryService.addEntry(
          widgetId,
          user.id,
          payload,
          data.entry_date
        )
        if (entry) {
          dispatch(addEntry({ entry, widget_id: widgetId }))
          dispatch(closeModal())
        }
      }
    } catch (error) {
      console.error('Error saving custom entry:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 font-sans">

      {/* ─── Date ─── */}
      <Input
        label="Date"
        type="date"
        error={errors.entry_date}
        {...register('entry_date', {
          required: { value: true, message: 'Date is required' },
          max: { value: today(), message: 'Cannot log future entries' },
        })}
      />

      {/* ─── Duration (time spent) ─── */}
      <div>
        <FieldLabel>Time Spent</FieldLabel>
        <Controller
          name="duration_mins"
          control={control}
          rules={{
            required: { value: true, message: 'Time spent is required' },
            min: { value: 1, message: 'Must be at least 1 minute' },
          }}
          render={({ field }) => (
            <DurationPicker
              value={field.value}
              onChange={field.onChange}
              error={errors.duration_mins}
              accentColor={color}
            />
          )}
        />
      </div>

      {/* ─── Rating (1-5) ─── */}
      <div>
        <FieldLabel>Rating</FieldLabel>
        <Controller
          name="rating"
          control={control}
          rules={{ required: { value: true, message: 'Rating is required' } }}
          render={({ field }) => (
            <RatingDots
              value={field.value}
              onChange={field.onChange}
              accentColor={color}
            />
          )}
        />
        {errors.rating && (
          <p className="text-red-400 text-xs mt-1 ml-1">{errors.rating.message}</p>
        )}
      </div>

      {/* ─── Custom Fields (from widget.config.fields) ─── */}
      {fields.map(fieldDef => {
        const { key, label, type: fieldType, options, unit } = fieldDef
        return (
          <div key={key}>
            <FieldLabel optional>
              {label}{unit ? ` (${unit})` : ''}
            </FieldLabel>

            {fieldType === 'text' && (
              <Input
                placeholder={`Enter ${label.toLowerCase()}...`}
                error={errors[key]}
                {...register(key)}
              />
            )}

            {fieldType === 'number' && (
              <Input
                type="number"
                placeholder={unit ? `e.g. 120 ${unit}` : `Enter ${label.toLowerCase()}`}
                error={errors[key]}
                {...register(key)}
              />
            )}

            {fieldType === 'choice' && options && (
              <Controller
                name={key}
                control={control}
                render={({ field }) => (
                  <ChoiceChips
                    options={options}
                    value={field.value}
                    onChange={field.onChange}
                    accentColor={color}
                  />
                )}
              />
            )}
          </div>
        )
      })}

      {/* ─── Notes (optional) ─── */}
      <div>
        <FieldLabel optional>Notes</FieldLabel>
        <textarea
          placeholder="Any observations..."
          className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 transition-all duration-200 min-h-20 resize-y font-sans"
          onFocus={e => {
            e.target.style.borderColor = color
            e.target.style.boxShadow = `0 0 0 1px ${color}`
          }}
          onBlur={e => {
            e.target.style.borderColor = ''
            e.target.style.boxShadow = ''
          }}
          {...register('notes')}
        />
      </div>

      {/* ─── Footer ─── */}
      <div className="flex items-center justify-end gap-3 pt-3 mt-1 border-t border-white/[0.07]">
        <Button type="button" variant="outline" onClick={() => dispatch(closeModal())}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          style={{
            backgroundColor: color,
            boxShadow: `0 0 20px ${hexToRgba(color, 0.4)}`,
            color: ['#f59e0b', '#22c55e', '#06b6d4', '#84cc16'].includes(color)
              ? '#0a0a0f'
              : '#ffffff',
          }}
        >
          {isSubmitting
            ? 'Saving...'
            : editingEntry
              ? 'Save Changes'
              : '+ Log Entry'}
        </Button>
      </div>

    </form>
  )
}

export default CustomQuickAddForm
