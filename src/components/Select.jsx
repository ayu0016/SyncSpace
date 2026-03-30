import React, { useId } from 'react'

const Select = React.forwardRef(({
  label,
  options = [],
  className = "",
  error,
  placeholder = "Select an option",
  ...props
}, ref) => {
  const id = useId()

  return (
    <div className="space-y-2 w-full">

      {label && (
        <label
          htmlFor={id}
          className="block text-[10px] font-bold tracking-[0.15em] text-outline-variant uppercase ml-1"
        >
          {label}
        </label>
      )}

      <select
        id={id}
        ref={ref}
        className={`
          w-full bg-surface-container-lowest border rounded-xl
          px-4 py-3 text-on-surface text-sm outline-none
          appearance-none cursor-pointer
          focus:ring-1 focus:ring-primary-container focus:border-primary-container
          transition-all duration-200 disabled:opacity-50
          ${error ? "border-red-500" : "border-outline-variant/20"}
          ${className}
        `}
        {...props}
      >
        <option value="" disabled hidden className="bg-[#0e0e13]">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0e0e13]">
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <span className="text-xs text-red-400 ml-1">{error.message}</span>
      )}

    </div>
  )
})

export default Select