import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell
} from 'recharts'

const CustomTooltip = ({ active, payload, label, unit, accentColor }) => {
  if (!active || !payload || !payload.length) return null

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
      </p>
    </div>
  )
}

const BarChart = ({
  data = [],
  accentColor,
  referenceValue = null,
  referenceLabel = '',
  unit = '',
  height = 180,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
        barCategoryGap="35%"
      >
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

        {/* Fix — spread recharts props then add custom ones */}
        <Tooltip
          content={(props) => (
            <CustomTooltip
              {...props}
              unit={unit}
              accentColor={accentColor}
            />
          )}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />

        {/* Optional reference line */}
        {referenceValue && (
          <ReferenceLine
            y={referenceValue}
            stroke={accentColor}
            strokeOpacity={0.4}
            strokeDasharray="4 4"
            label={{
              value: referenceLabel,
              position: 'right',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fill: accentColor,
              opacity: 0.6
            }}
          />
        )}

        <Bar
          dataKey="value"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={accentColor}
              fillOpacity={
                referenceValue && entry.value > referenceValue ? 1 : 0.75
              }
            />
          ))}
        </Bar>

      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export default BarChart