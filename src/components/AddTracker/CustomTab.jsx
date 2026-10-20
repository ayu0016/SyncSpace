import { useState, useRef } from 'react'
import { EMOJIS, ACCENT_COLORS } from './predefinedTracker'
import Input from '../Input'
import Select from '../Select'
import { X } from 'lucide-react'
import { hexToRgba } from '../../utils/colorUtils'
import { getFieldError } from '../../utils/customWidgetValidation'

// ─── Field type options for Select ─────────────────────────────────────────────
const FIELD_TYPE_OPTIONS = [
  { label: 'Text',   value: 'text'   },
  { label: 'Number', value: 'number' },
  { label: 'Choice', value: 'choice' },
]

// ─── Presets ───────────────────────────────────────────────────────────────────
const PRESETS = [
  {
    label: '🎸 Guitar Log',
    name: 'Guitar Practice',
    icon: '🎨',
    color: '#ef4444',
    fields: [
      { label: 'Song',  type: 'text',   options: [], unit: '' },
      { label: 'Focus', type: 'choice', options: ['Chords', 'Scales', 'Songs', 'Theory'], unit: '' },
      { label: 'BPM',   type: 'number', options: [], unit: 'bpm' },
    ],
  },
  {
    label: '📖 Reading Log',
    name: 'Reading Tracker',
    icon: '📚',
    color: '#8b5cf6',
    fields: [
      { label: 'Book Title', type: 'text',   options: [], unit: '' },
      { label: 'Genre',      type: 'choice', options: ['Fiction', 'Non-fiction', 'Tech', 'Self-help'], unit: '' },
      { label: 'Pages Read', type: 'number', options: [], unit: 'pages' },
    ],
  },
  {
    label: '✨ Blank',
    name: '',
    icon: '🔥',
    color: '#4a9eed',
    fields: [
      { label: '', type: 'text',   options: [], unit: '' },
      { label: '', type: 'text',   options: [], unit: '' },
      { label: '', type: 'text',   options: [], unit: '' },
    ],
  },
]

// ─── TagChipInput (inline, reused from Kanban pattern) ─────────────────────────
const TagChipInput = ({ tags, setTags, maxTags = 6, maxLength = 20, accentColor }) => {
  const [input, setInput]                 = useState('')
  const [duplicateIndex, setDuplicateIndex] = useState(null)
  const inputRef = useRef(null)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      const newTag = input.trim()
      if (newTag.length > maxLength) return
      const existingIdx = tags.findIndex(t => t.toLowerCase() === newTag.toLowerCase())
      if (existingIdx !== -1) {
        setDuplicateIndex(existingIdx)
        setTimeout(() => setDuplicateIndex(null), 400)
      } else if (tags.length < maxTags) {
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
        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2 flex flex-wrap gap-1.5 cursor-text min-h-11 focus-within:ring-1 transition-all duration-200"
        style={{
          '--tw-ring-color': accentColor,
        }}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 text-white px-2 py-1 rounded-lg text-[12px] font-medium font-sans ${duplicateIndex === i ? 'chip-shake' : ''}`}
            style={{ background: hexToRgba(accentColor, 0.2), border: `1px solid ${hexToRgba(accentColor, 0.3)}` }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setTags(tags.filter((_, idx) => idx !== i)) }}
              className="text-white/40 hover:text-white transition-colors rounded-full p-0.5"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          placeholder={tags.length === 0 ? 'Type + Enter (2-6 options)' : tags.length >= maxTags ? '' : ''}
          disabled={tags.length >= maxTags}
          className="flex-1 bg-transparent text-xs text-on-surface placeholder:text-outline-variant/40 focus:outline-none min-w-24 py-1 font-sans"
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-outline-variant/40 font-mono">{tags.length}/6 options</span>
      </div>
    </>
  )
}

// ─── Main CustomTab Component ──────────────────────────────────────────────────

export default function CustomTab({
  customName,
  setCustomName,
  customIcon,
  setCustomIcon,
  customColor,
  setCustomColor,
  customFields,
  setCustomFields,
  fieldsTouched,
  setFieldsTouched,
}) {
  // Touch tracking for field error display
  const markTouched = (idx) => {
    if (!fieldsTouched[idx]) {
      const next = [...fieldsTouched]
      next[idx] = true
      setFieldsTouched(next)
    }
  }

  const updateField = (idx, key, value) => {
    const next = customFields.map((f, i) => {
      if (i !== idx) return f
      const updated = { ...f, [key]: value }
      // Reset options/unit when type changes
      if (key === 'type') {
        if (value !== 'choice') updated.options = []
        if (value !== 'number') updated.unit = ''
      }
      return updated
    })
    setCustomFields(next)
  }

  const applyPreset = (preset) => {
    setCustomName(preset.name)
    setCustomIcon(preset.icon)
    setCustomColor(preset.color)
    setCustomFields(preset.fields.map(f => ({ ...f })))
    setFieldsTouched([false, false, false])
  }

  const readyCount = customFields.filter((f, i) => {
    const label = (f.label || '').trim()
    if (!label || !f.type) return false
    if (f.type === 'choice' && (!f.options || f.options.length < 2)) return false
    if (getFieldError(f, i, customFields, [true, true, true])) return false
    return true
  }).length

  return (
    <div className="p-5 md:px-8 md:py-6 animate-slide-right overflow-y-auto max-h-[60vh] font-sans">
      <div className="flex flex-col gap-5">

        {/* ─── Preset chips ─── */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 border bg-white/[0.03] border-white/[0.08] text-outline-variant hover:bg-white/[0.06] hover:border-white/[0.15] font-sans"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* ─── Tracker Name ─── */}
        <Input
          label="Tracker Name"
          value={customName}
          onChange={e => setCustomName(e.target.value)}
          placeholder="Enter tracker name..."
          maxLength={24}
        />

        {/* ─── Icon Picker ─── */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-outline font-mono">
            Icon
          </label>
          <div className="flex flex-wrap gap-2.5">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setCustomIcon(emoji)}
                className={`w-10.5 h-10.5 rounded-[10px] flex items-center justify-center text-[20px] transition-all duration-200 border ${
                  customIcon === emoji
                    ? 'border-white/60'
                    : 'bg-surface-container border-white/6 hover:bg-surface-container-high'
                }`}
                style={customIcon === emoji ? {
                  background: hexToRgba(customColor, 0.15),
                  borderColor: hexToRgba(customColor, 0.6),
                  boxShadow: `0 0 10px ${hexToRgba(customColor, 0.2)}`,
                } : {}}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Accent Color ─── */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-outline font-mono">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-4 items-center pt-2 pb-1">
            {ACCENT_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setCustomColor(color)}
                className={`w-7 h-7 rounded-full transition-all duration-200 border-2 ${
                  customColor === color
                    ? 'border-white scale-[1.15] shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                    : 'border-transparent hover:scale-[1.2]'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* ─── YOUR 3 FIELDS ─── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-outline font-mono">
              Your 3 Fields
            </label>
            <span
              className="text-[10px] font-bold tracking-[0.1em] uppercase font-mono"
              style={{ color: readyCount === 3 ? customColor : 'rgb(100,116,139)' }}
            >
              {readyCount}/3 ready
            </span>
          </div>

          {/* 3 field rows — always visible */}
          {customFields.map((field, idx) => {
            const error = getFieldError(field, idx, customFields, fieldsTouched)
            return (
              <div
                key={idx}
                className="rounded-[10px] p-3 flex flex-col gap-2.5 font-sans"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid rgba(255,255,255,0.06)`,
                }}
              >
                {/* Row header: number badge + label input + type select */}
                <div className="flex items-start gap-2.5">
                  {/* Number badge */}
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 mt-1.5 font-mono"
                    style={{
                      background: hexToRgba(customColor, 0.15),
                      color: customColor,
                    }}
                  >
                    {idx + 1}
                  </div>

                  {/* Label input */}
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={field.label}
                      onChange={e => updateField(idx, 'label', e.target.value)}
                      onBlur={() => markTouched(idx)}
                      placeholder="Field name"
                      maxLength={20}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-sm outline-none placeholder:text-outline-variant/40 transition-all duration-200 font-sans"
                      onFocus={e => {
                        e.target.style.borderColor = customColor
                        e.target.style.boxShadow = `0 0 0 1px ${customColor}`
                      }}
                      onBlurCapture={e => {
                        e.target.style.borderColor = ''
                        e.target.style.boxShadow = ''
                        markTouched(idx)
                      }}
                    />
                  </div>

                  {/* Type select */}
                  <div className="w-28 shrink-0">
                    <Select
                      options={FIELD_TYPE_OPTIONS}
                      value={field.type}
                      onChange={(val) => updateField(idx, 'type', val)}
                      placeholder="Type"
                    />
                  </div>
                </div>

                {/* Error text */}
                {error && (
                  <p className="text-red-400 text-[11px] ml-8.5 font-sans">{error}</p>
                )}

                {/* Conditional extras */}
                {field.type === 'number' && (
                  <div className="ml-8.5">
                    <input
                      type="text"
                      value={field.unit || ''}
                      onChange={e => updateField(idx, 'unit', e.target.value)}
                      placeholder="Unit (optional, e.g. bpm, pages)"
                      maxLength={8}
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-3 py-2 text-on-surface text-xs outline-none placeholder:text-outline-variant/40 transition-all duration-200 focus:ring-1 focus:ring-primary-container focus:border-primary-container font-mono"
                    />
                  </div>
                )}

                {field.type === 'choice' && (
                  <div className="ml-8.5">
                    <TagChipInput
                      tags={field.options || []}
                      setTags={(newTags) => updateField(idx, 'options', newTags)}
                      accentColor={customColor}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ─── Live Preview Strip ─── */}
        {customName.trim() && (
          <div
            className="rounded-[10px] p-3 flex items-center gap-3 font-sans"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: `1px solid rgba(255,255,255,0.06)`,
              borderTop: `2px solid ${customColor}`,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[16px] shrink-0"
              style={{ background: hexToRgba(customColor, 0.15) }}
            >
              {customIcon}
            </div>
            <span className="text-[13px] font-bold text-slate-200 truncate font-sans">
              {customName.trim()}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              {customFields.map((f, i) => {
                const label = (f.label || '').trim()
                if (!label) return null
                return (
                  <span
                    key={i}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono"
                    style={{
                      background: hexToRgba(customColor, 0.15),
                      color: customColor,
                    }}
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
