const GlassCard = ({ children, className = '', accentColor = null }) => {
  return (
    <div
      className={`rounded-[12px] ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.025)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        ...(accentColor && {
          borderTop: `2px solid ${accentColor}`,
        })
      }}
    >
      {children}
    </div>
  )
}

export default GlassCard