import React, { useId } from 'react'

const Input = React.forwardRef(({
  label,
  type = "text",
  className = "",
  error,
  children,
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

      <div className="relative">
        <input
          type={type}
          id={id}
          ref={ref}
          className={`
            w-full bg-surface-container-lowest border rounded-xl
            px-4 py-3 text-on-surface text-sm outline-none
            placeholder:text-outline-variant/40
            focus:ring-1 focus:ring-primary-container focus:border-primary-container
            transition-all duration-200 disabled:opacity-50
            ${error ? "border-red-500" : "border-outline-variant/20"}
            ${className}
          `}
          {...props}
        />
        {/* password toggle or icons go here */}
        {children}
      </div>

      {error && (
        <span className="text-xs text-red-400 ml-1">{error.message}</span>
      )}

    </div>
  )
})

export default Input