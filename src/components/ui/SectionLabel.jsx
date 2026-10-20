import React from 'react'

const SectionLabel = ({ label, color }) => {
  // Use provided color or a clean, modern neutral slate
  const textColor = color || 'rgba(255, 255, 255, 0.55)'
  const lineColor = color
    ? `linear-gradient(to right, ${color}33, transparent)`
    : 'linear-gradient(to right, rgba(255, 255, 255, 0.08), transparent)'

  return (
    <div className="flex items-center w-full mb-3">
      <span
        className="font-mono text-[10px] font-medium uppercase shrink-0 mr-3"
        style={{
          color: textColor,
          letterSpacing: '2px'
        }}
      >
        {label}
      </span>
      <div
        className="h-px flex-1"
        style={{
          background: lineColor
        }}
      />
    </div>
  )
}

export default SectionLabel
