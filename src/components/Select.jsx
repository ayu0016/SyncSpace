import React, { useId, useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

const Select = React.forwardRef(({
  label,
  options = [],
  placeholder = "Select an option",
  error,
  value,
  onChange,
  onBlur,
  className = "",
  icon: Icon,
}, ref) => {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)

  const selectedOption = options.find(opt => opt.value === value) || null

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onBlur])

  useEffect(() => {
    if (open && focusedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('[data-option]')
      items[focusedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex, open])

  const handleToggle = () => {
    const nextOpen = !open
    setOpen(nextOpen)
    if (nextOpen) {
      const currentIndex = options.findIndex(opt => opt.value === value)
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0)
    }
  }

  const handleSelect = (opt) => {
    onChange?.(opt.value)
    setOpen(false)
    onBlur?.()
    setFocusedIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!open) {
        handleToggle()
      } else if (focusedIndex >= 0) {
        handleSelect(options[focusedIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      onBlur?.()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setFocusedIndex(0)
      } else {
        setFocusedIndex(prev => Math.min(prev + 1, options.length - 1))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => Math.max(prev - 1, 0))
    }
  }

  return (
    <div className={`space-y-2 w-full ${className}`} ref={containerRef}>

      {label && (
        <label
          htmlFor={id}
          className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <div
          id={id}
          ref={ref}
          tabIndex={0}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          onKeyDown={handleKeyDown}
          onClick={handleToggle}
          className={`
            w-full bg-surface-container-lowest border rounded-xl
            ${Icon ? 'pl-11' : 'px-4'} pr-10 py-3
            flex items-center cursor-pointer select-none
            text-sm outline-none transition-all duration-200
            ${open
              ? 'border-primary-container ring-1 ring-primary-container'
              : error
                ? 'border-red-500'
                : 'border-outline-variant/20 hover:border-outline-variant/40'
            }
          `}
        >
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
              <Icon size={16} />
            </div>
          )}

          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {selectedOption?.dot && (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedOption.dot }}
              />
            )}
            <span className={`truncate ${selectedOption ? 'text-on-surface' : 'text-outline-variant/40'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <ChevronDown
            size={15}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant transition-transform duration-300 pointer-events-none ${open ? 'rotate-180' : ''}`}
          />
        </div>

        {open && (
          <div
            ref={dropdownRef}
            role="listbox"
            className="absolute top-[calc(100%+6px)] left-0 w-full z-50 bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl"
            style={{ animation: 'selectDropdownIn 0.18s cubic-bezier(0.16,1,0.3,1) forwards' }}
          >
            <style>{`
              @keyframes selectDropdownIn {
                from { opacity: 0; transform: translateY(-6px) scale(0.98); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>

            <div className="p-1.5 flex flex-col gap-0.5 max-h-55 overflow-y-auto">
              {options.map((opt, i) => {
                const isSelected = opt.value === value
                const isFocused = focusedIndex === i
                return (
                  <div
                    key={opt.value}
                    data-option
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setFocusedIndex(i)}
                    className={`
                      px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-2.5
                      text-sm transition-colors duration-100
                      ${isFocused || isSelected
                        ? 'bg-white/[0.07] text-on-surface'
                        : 'text-on-surface/70 hover:text-on-surface hover:bg-white/4'
                      }
                    `}
                  >
                    {opt.dot && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: opt.dot }}
                      />
                    )}
                    <span className="flex-1">{opt.label}</span>
                    {isSelected && (
                      <span className="text-primary-container text-xs">✓</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-400 ml-1">{error.message}</span>
      )}

    </div>
  )
})

Select.displayName = 'Select'
export default Select