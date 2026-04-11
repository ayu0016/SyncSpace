import { useState } from 'react'

// data        → array of numbers e.g. [3.1, 3.3, 3.5, 3.7, 3.8]
// accentColor → hex string e.g. "#8b5cf6"
// height      → optional number default 48
// width       → optional number default 200

const Sparkline = ({ data = [], accentColor, height = 48, width = 200 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  if (data.length === 0) return null

  const min = Math.min(...data) - 0.5
  const max = Math.max(...data) + 0.5

  const getX = (i) => (i / (data.length - 1)) * width
  const getY = (val) => height - ((val - min) / (max - min)) * height

  // Build SVG path string
  const points = data.map((d, i) => `${getX(i)},${getY(d)}`)
  const pathD  = `M ${points.join(' L ')}`
  const areaD  = `${pathD} L ${width},${height} L 0,${height} Z`

  // hex to rgb for area fill
  const hex = accentColor.replace('#', '')
  const r   = parseInt(hex.substring(0, 2), 16)
  const g   = parseInt(hex.substring(2, 4), 16)
  const b   = parseInt(hex.substring(4, 6), 16)

  return (
    <div className="relative w-full group" style={{ height }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Area fill */}
        <path
          d={areaD}
          fill={`rgba(${r},${g},${b},0.15)`}
          stroke="none"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Hover dots — visible on group hover */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(d)}
            r={4}
            fill={accentColor}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </svg>

      {/* Hover value tooltip */}
      {hoveredIndex !== null && (
        <div
          className="absolute pointer-events-none font-mono text-[11px] px-2 py-1 rounded-[6px] -translate-x-1/2"
          style={{
            left: `${(hoveredIndex / (data.length - 1)) * 100}%`,
            bottom: height + 6,
            background: 'rgba(22,27,34,0.97)',
            border: `1px solid ${accentColor}66`,
            color: accentColor,
            whiteSpace: 'nowrap'
          }}
        >
          {data[hoveredIndex].toFixed(1)}
        </div>
      )}
    </div>
  )
}

export default Sparkline