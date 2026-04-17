import { useState } from 'react'

const DonutChart = ({ segments = [], centerLabel = 'TOTAL' }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const radius        = 72
  const strokeWidth   = 16
  const circumference = 2 * Math.PI * radius
  const total         = segments.reduce((sum, s) => sum + s.count, 0)

  // Build arc data
  let cumulativeArc = 0
  const arcs = segments.map((segment) => {
    const arc = total > 0 ? (segment.count / total) * circumference : 0
    
    // FIX: The gap must be exactly the remaining circumference, not the full circumference.
    // Otherwise, the offset math pushes subsequent segments into the invisible gap.
    const gap = Math.max(circumference - arc, 0)
    const offset = circumference - cumulativeArc
    
    cumulativeArc += arc
    return { ...segment, arc, gap, offset }
  })

  // Center display
  const centerNum   = hoveredIndex !== null ? segments[hoveredIndex].count   : total
  const centerText  = hoveredIndex !== null ? segments[hoveredIndex].label.toUpperCase() : centerLabel
  const centerColor = hoveredIndex !== null ? segments[hoveredIndex].color   : '#f0f4ff'

  return (
    <div className="flex flex-col items-center w-full">

      {/* Donut SVG */}
      <div className="relative w-[188px] h-[188px]">
        <svg
          width="188"
          height="188"
          viewBox="0 0 188 188"
          className="overflow-visible"
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background track */}
          <circle
            cx="94"
            cy="94"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {arcs.map((arc, i) => {
            // Do not render if count is 0 to prevent the dot artifact
            if (arc.count === 0) return null

            const isHovered = hoveredIndex === i
            const isDimmed  = hoveredIndex !== null && !isHovered
            const sw        = isHovered ? strokeWidth + 2 : strokeWidth

            return (
              <circle
                key={arc.label}
                cx="94"
                cy="94"
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={sw}
                strokeLinecap="round"
                // FIX: Apply the properly calculated arc and gap lengths here
                strokeDasharray={`${arc.arc} ${arc.gap}`}
                strokeDashoffset={arc.offset}
                className="cursor-pointer"
                style={{
                  opacity: isDimmed ? 0.25 : 1,
                  transition: 'opacity 200ms ease, stroke-width 200ms ease'
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            )
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className="font-sans font-bold text-[36px] leading-[1.1]"
            style={{
              color: centerColor,
              transition: 'color 200ms ease'
            }}
          >
            {centerNum}
          </span>
          <span
            className="font-mono text-[9px] tracking-[2px] uppercase mt-1"
            style={{ color: 'rgba(100,116,139,0.9)' }}
          >
            {centerText}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-8 w-full">
        {segments.map((segment, i) => {
          const isHovered = hoveredIndex === i
          return (
            <div
              key={segment.label}
              className="flex flex-col items-center gap-1 cursor-default"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="font-sans font-bold text-[20px] leading-none"
                style={{ color: segment.color }}
              >
                {segment.count}
              </span>
              <span
                className="font-mono text-[9px] uppercase tracking-[1.5px]"
                style={{ color: 'rgba(148,163,184,0.9)' }}
              >
                {segment.label}
              </span>
              <div
                className="w-[24px] h-[2px] rounded-full mt-0.5"
                style={{
                  backgroundColor: segment.color,
                  opacity: isHovered ? 1 : 0.4,
                  transition: 'opacity 200ms ease'
                }}
              />
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default DonutChart