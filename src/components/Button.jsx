import React from 'react'

const Button = React.forwardRef(({
  children,
  type = "button",
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}, ref) => {

  const base =
    "inline-flex items-center justify-center font-bold text-xs tracking-wide uppercase transition-all duration-200 rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed py-3.5 px-6"

  const variants = {
    primary:
      "bg-primary-container text-on-primary-container hover:shadow-[0_0_20px_rgba(74,158,237,0.4)]",
    outline:
      "border border-outline-variant/30 text-white hover:bg-white/5",
    ghost:
      "text-white/60 hover:text-white hover:bg-white/10",
  }

  return (
    <button
      type={type}
      ref={ref}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button