import React, { useMemo } from 'react'
import { ActivityCalendar } from 'react-activity-calendar'
import { Tooltip } from 'react-tooltip'
import GlassCard from '../GlassCard'

const getHeatmapTheme = (accentColor = '#4a9eed') => {
  // convert hex to rgb for opacity manipulation
  const hex = accentColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) || 74
  const g = parseInt(hex.substring(2, 4), 16) || 158
  const b = parseInt(hex.substring(4, 6), 16) || 237

  return {
    dark: [
      'rgba(255,255,255,0.035)',
      `rgba(${r},${g},${b},0.22)`,
      `rgba(${r},${g},${b},0.45)`,
      `rgba(${r},${g},${b},0.72)`,
      `rgba(${r},${g},${b},1.00)`,
    ],
    light: [
      'rgba(255,255,255,0.035)',
      `rgba(${r},${g},${b},0.22)`,
      `rgba(${r},${g},${b},0.45)`,
      `rgba(${r},${g},${b},0.72)`,
      `rgba(${r},${g},${b},1.00)`,
    ]
  }
}

const getLevelColor = (accentColor, level) => {
  const hex = (accentColor || '#4a9eed').replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16) || 74
  const g = parseInt(hex.substring(2, 4), 16) || 158
  const b = parseInt(hex.substring(4, 6), 16) || 237

  const opacities = [0.035, 0.22, 0.45, 0.72, 1.0]
  if (level === 0) return 'rgba(255,255,255,0.035)'
  return `rgba(${r},${g},${b},${opacities[level]})`
}

const ActivityHeatmap = ({ data = [], accentColor = '#4a9eed', renderTooltip }) => {
  const theme = useMemo(() => getHeatmapTheme(accentColor), [accentColor])

  // Compute informative metrics from data
  const stats = useMemo(() => {
    let total = 0
    let active = 0
    let max = 0
    let currentStreak = 0
    let tempStreak = 0

    // Reverse iterate to find current streak
    for (let i = data.length - 1; i >= 0; i--) {
      const item = data[i]
      const count = item.count || 0
      total += count
      if (count > 0) {
        active++
        if (count > max) max = count
        tempStreak++
      } else {
        if (currentStreak === 0 && tempStreak > 0) {
          currentStreak = tempStreak
        }
      }
    }
    if (currentStreak === 0) currentStreak = tempStreak

    const consistency = data.length > 0 ? ((active / data.length) * 100).toFixed(0) : 0
    const startDate = data[0]?.date || ''
    const endDate = data[data.length - 1]?.date || ''

    return { total, active, max, currentStreak, consistency, startDate, endDate }
  }, [data])

  return (
    <GlassCard className="p-5 w-full overflow-hidden">
      {/* Scoped CSS to make calendar 100% full width and completely eliminate browser scrollbars */}
      <style>{`
        .activity-calendar-wrapper,
        .activity-calendar-wrapper > div,
        .activity-calendar-wrapper .react-activity-calendar {
          width: 100% !important;
          max-width: 100% !important;
        }

        .activity-calendar-wrapper .react-activity-calendar__scroll-container {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
          overflow-y: hidden !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }

        .activity-calendar-wrapper .react-activity-calendar__scroll-container::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }

        .activity-calendar-wrapper svg.react-activity-calendar__calendar {
          width: 100% !important;
          height: auto !important;
          display: block !important;
          margin-left: 0 !important;
        }
      `}</style>

      {/* Informative Stats Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[1.2px] text-slate-500">
              Total Activities
            </div>
            <div
              className="font-mono text-[20px] font-bold mt-0.5 leading-none"
              style={{ color: accentColor }}
            >
              {stats.total}
            </div>
          </div>

          <div className="h-6 w-px bg-white/[0.06] hidden sm:block" />

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[1.2px] text-slate-500">
              Active Days
            </div>
            <div className="font-mono text-[20px] font-bold mt-0.5 leading-none text-slate-200">
              {stats.active} <span className="text-[11px] font-normal text-slate-500">/ {data.length}</span>
            </div>
          </div>

          <div className="h-6 w-px bg-white/[0.06] hidden sm:block" />

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[1.2px] text-slate-500">
              Consistency
            </div>
            <div className="font-mono text-[20px] font-bold mt-0.5 leading-none text-slate-200">
              {stats.consistency}%
            </div>
          </div>

          <div className="h-6 w-px bg-white/[0.06] hidden sm:block" />

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[1.2px] text-slate-500">
              Max in a Day
            </div>
            <div className="font-mono text-[20px] font-bold mt-0.5 leading-none text-slate-200">
              {stats.max}
            </div>
          </div>
        </div>

        <div className="font-mono text-[10px] text-slate-500 tracking-wider">
          {stats.startDate && stats.endDate ? `${stats.startDate} — ${stats.endDate}` : 'PAST 365 DAYS'}
        </div>
      </div>

      {/* Full-width Responsive Heatmap SVG Container */}
      <div className="activity-calendar-wrapper w-full overflow-hidden">
        <ActivityCalendar
          data={data}
          theme={theme}
          blockSize={12}
          blockMargin={3}
          blockRadius={2.5}
          fontSize={11}
          showWeekdayLabels={true}
          showColorLegend={false}
          showTotalCount={false}
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
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          }}
        />
      </div>

      {/* Tooltip */}
      <Tooltip
        id="heatmap-tooltip"
        render={({ content }) => (
          <div
            className="font-mono text-[11px] px-2.5 py-1.5 rounded-[6px] shadow-lg backdrop-blur-md"
            style={{
              background: 'rgba(15,20,30,0.96)',
              border: `1px solid ${accentColor}66`,
              color: 'rgba(255,255,255,0.92)'
            }}
          >
            {content}
          </div>
        )}
      />

      {/* Single Clean Footer with Legend */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.04]">
        <span className="font-mono text-[10px] text-slate-500">
          Daily Activity Distribution
        </span>

        <div className="flex items-center gap-[4px]">
          <span className="font-mono text-[9px] mr-1 text-slate-500 uppercase tracking-wider">
            Less
          </span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-[11px] h-[11px] rounded-[2.5px] transition-transform hover:scale-125"
              style={{ backgroundColor: getLevelColor(accentColor, level) }}
              title={`Level ${level}`}
            />
          ))}
          <span className="font-mono text-[9px] ml-1 text-slate-500 uppercase tracking-wider">
            More
          </span>
        </div>
      </div>
    </GlassCard>
  )
}

export default ActivityHeatmap
