import { useId } from 'react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Line,
  ComposedChart,
  ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label, unit, accentColor, showReps }) => {
  if (!active || !payload || !payload.length) return null

  const d = payload[0].payload

  return (
    <div
      className="rounded-[8px] px-3 py-2 font-mono text-[12px]"
      style={{
        background: 'rgba(22,27,34,0.97)',
        border: `1px solid ${accentColor}66`,
        color: 'rgba(255,255,255,0.85)'
      }}
    >
      <p
        className="text-[10px] mb-1"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        {label}
      </p>
      <p style={{ color: accentColor }}>
        {payload[0].value.toLocaleString()}{unit ? ` ${unit}` : ''}
        {showReps && d.reps ? ` × ${d.reps} reps` : ''}
      </p>
      {d.isPr && (
        <p
          className="text-[10px] mt-1"
          style={{ color: '#f59e0b' }}
        >
          🏆 Personal Record
        </p>
      )}
    </div>
  )
}

const CustomDot = ({ cx, cy, payload, accentColor }) => {
  if (!cx || !cy) return null

  if (!payload.isPr) {
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3}
        fill={accentColor}
        stroke="transparent"
      />
    )
  }

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={accentColor}
        stroke="#ffffff"
        strokeWidth={2}
        style={{ filter: `drop-shadow(0 0 8px ${accentColor}cc)` }}
      />
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fontSize="11"
        fontFamily="JetBrains Mono, monospace"
        fill={accentColor}
        fontWeight="bold"
      >
        PR 🏆
      </text>
    </g>
  )
}

const LineChart = ({
  data = [],
  accentColor,
  unit = '',
  height = 200,
  showReps = false,
}) => {
  const reactId = useId()
  const hex = (accentColor || '#4a9eed').replace('#', '')
  const r   = parseInt(hex.substring(0, 2), 16) || 74
  const g   = parseInt(hex.substring(2, 4), 16) || 158
  const b   = parseInt(hex.substring(4, 6), 16) || 237

  // Unique gradient id per chart instance using React useId
  const gradientId = `lineGradient-${reactId.replace(/:/g, '')}-${hex}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 8, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={`rgba(${r},${g},${b},0.15)`}
            />
            <stop
              offset="100%"
              stopColor={`rgba(${r},${g},${b},0)`}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          vertical={false}
          stroke="rgba(255,255,255,0.04)"
        />
        <XAxis
          dataKey="label"
          tick={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            fill: 'rgba(255,255,255,0.35)'
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            fill: 'rgba(255,255,255,0.35)'
          }}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          content={(props) => (
            <CustomTooltip
              {...props}
              unit={unit}
              accentColor={accentColor}
              showReps={showReps}
            />
          )}
          cursor={{ stroke: 'rgba(255,255,255,0.06)', strokeWidth: 1 }}
        />

        <Area
          type="monotone"
          dataKey="value"
          fill={`url(#${gradientId})`}
          stroke="none"
        />

        <Line
          type="monotone"
          dataKey="value"
          stroke={accentColor}
          strokeWidth={2.5}
          dot={(props) => (
            <CustomDot
              {...props}
              accentColor={accentColor}
            />
          )}
          activeDot={{
            r: 5,
            fill: accentColor,
            stroke: '#ffffff',
            strokeWidth: 2
          }}
        />

      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default LineChart
