import React from 'react'
import {ActivityCalendar} from 'react-activity-calendar'
import { Tooltip } from 'react-tooltip'
import GlassCard from '../GlassCard'

const getHeatmapTheme = (accentColor) => {
  // convert hex to rgb for opacity manipulation
  const hex = accentColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return {
    light: [
      'rgba(255,255,255,0.04)',
      `rgba(${r},${g},${b},0.20)`,
      `rgba(${r},${g},${b},0.40)`,
      `rgba(${r},${g},${b},0.65)`,
      `rgba(${r},${g},${b},0.90)`,
    ],
    dark: [
      'rgba(255,255,255,0.04)',
      `rgba(${r},${g},${b},0.20)`,
      `rgba(${r},${g},${b},0.40)`,
      `rgba(${r},${g},${b},0.65)`,
      `rgba(${r},${g},${b},0.90)`,
    ]
  }
}

const getLevelColor = (accentColor, level) => {
  const hex = accentColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const opacities = [0.04, 0.20, 0.40, 0.65, 0.90]
  if (level === 0) return 'rgba(255,255,255,0.04)'
  return `rgba(${r},${g},${b},${opacities[level]})`
}

const ActivityHeatmap = ({ data = [], accentColor, renderTooltip }) => {
  const theme = getHeatmapTheme(accentColor)

  return (
    <GlassCard className="p-5 w-full">
      <div className="overflow-x-auto no-scrollbar pb-2">
        <ActivityCalendar
          data={data}
          theme={theme}
          blockSize={11}
          blockMargin={3}
          fontSize={12}
          showWeekdayLabels={true}
          colorScheme="dark"
          renderBlock={(block, activity) =>
            React.cloneElement(block, {
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-content': renderTooltip
                ? renderTooltip(activity)
                : `${activity.date} — ${activity.count} activities`
            })
          }
          labels={{
            months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            weekdays: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            totalCount: '{{count}} activities in {{year}}',
          }}
        />
      </div>

      {/* Tooltip */}
      <Tooltip
        id="heatmap-tooltip"
        render={({ content }) => (
          <div
            className="font-mono text-[11px] px-2 py-1 rounded-[6px]"
            style={{
              background: 'rgba(22,27,34,0.95)',
              border: `1px solid ${accentColor}66`,
              color: 'rgba(255,255,255,0.85)'
            }}
          >
            {content}
          </div>
        )}
      />

      {/* Legend */}
      <div className="flex items-center justify-end mt-3 gap-[3px]">
        <span
          className="font-mono text-[8px] mr-2"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          less
        </span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className="w-[10px] h-[10px] rounded-[2px]"
            style={{ backgroundColor: getLevelColor(accentColor, level) }}
          />
        ))}
        <span
          className="font-mono text-[8px] ml-2"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          more
        </span>
      </div>
    </GlassCard>
  )
}

export default ActivityHeatmap