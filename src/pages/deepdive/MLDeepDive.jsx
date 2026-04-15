import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { startOfWeek } from 'date-fns'
import { openModal, setActiveWidget } from '../../store/uiSlice'

// Hooks
import useWidgetEntries from '../../hooks/useWidgetEntries'
import useDeepDiveFilter from '../../hooks/useDeepDiveFilter'

// Utils
import { calcStreak, calcBestStreak } from '../../utils/streakUtils'
import { entriesToHeatmapData } from '../../utils/heatmapUtils'
import { formatRelativeDate, getDaysAgo } from '../../utils/dateUtils'

// Shared components
import DeepDiveHeader from '../../components/ui/deepdive/DeepDiveHeader'
import SectionLabel from '../../components/ui/SectionLabel'
import StatsBar from '../../components/ui/StatsBar'
import GlassCard from '../../components/ui/GlassCard'
import ActivityHeatmap from '../../components/ui/deepdive/ActivityHeatmap'
import BubbleChart from '../../components/ui/deepdive/BubbleChart'
import RecentLog from '../../components/ui/deepdive/RecentLog'
import Sparkline from '../../components/ui/charts/Sparkline'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ACCENT = '#8b5cf6'

const BUBBLE_LAYOUT = [
  { cx: 380, cy: 170, r: 65, delay: 0 },
  { cx: 560, cy: 130, r: 55, delay: 1 },
  { cx: 220, cy: 190, r: 45, delay: 2 },
  { cx: 650, cy: 230, r: 40, delay: 3 },
  { cx: 310, cy: 260, r: 35, delay: 4 },
  { cx: 130, cy: 120, r: 30, delay: 5 },
  { cx: 710, cy: 110, r: 28, delay: 6 },
  { cx: 270, cy: 80,  r: 25, delay: 7 },
  { cx: 480, cy: 260, r: 30, delay: 8 },
]

// ─── PAGE-SPECIFIC COMPONENTS ────────────────────────────────────────────────

const TypeBadge = ({ type }) => {
  const styles = {
    Theory:   { bg: 'rgba(139,92,246,0.15)',  color: '#8b5cf6' },
    Practice: { bg: 'rgba(74,158,237,0.15)',  color: '#4a9eed' },
    Project:  { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
    Revision: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  }
  const s = styles[type] || { bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }
  return (
    <span
      className="inline-block px-2 py-[2px] rounded text-[10px] font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {type}
    </span>
  )
}

const UnderstandingDots = ({ level = 0 }) => (
  <div className="flex gap-[3px] items-center">
    {[1, 2, 3, 4, 5].map(dot => (
      <div
        key={dot}
        className="w-[6px] h-[6px] rounded-full"
        style={{
          background: dot <= level
            ? ACCENT
            : 'rgba(255,255,255,0.1)'
        }}
      />
    ))}
  </div>
)

const UnderstandingBars = ({ entries }) => {
  const topicUnderstanding = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      const topic = e.payload?.topic
      const level = e.payload?.understanding_level
      if (!topic || !level) return
      if (!map[topic]) map[topic] = []
      map[topic].push(level)
    })
    return Object.entries(map)
      .map(([name, levels]) => ({
        name,
        avg: levels.reduce((s, l) => s + l, 0) / levels.length
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8)
  }, [entries])

  const getBarColor = (avg) => {
    if (avg >= 4.1) return ACCENT
    if (avg >= 3.1) return '#4a9eed'
    if (avg >= 2.1) return '#f59e0b'
    return '#ef4444'
  }

  if (topicUnderstanding.length === 0) {
    return (
      <p
        className="font-sans text-[13px] italic"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        No sessions logged yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {topicUnderstanding.map((t, i) => (
        <div key={i} className="flex items-center gap-3">
          <span
            className="font-sans text-[12px] text-white w-[100px] truncate shrink-0"
            title={t.name}
          >
            {t.name}
          </span>
          <div
            className="flex-1 h-[6px] rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(t.avg / 5) * 100}%`,
                background: getBarColor(t.avg)
              }}
            />
          </div>
          <span
            className="font-mono text-[11px] w-[28px] text-right shrink-0"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {t.avg.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  )
}

const SessionMixCard = ({ entries }) => {
  const mix = useMemo(() => {
    const total  = entries.length
    const counts = { Theory: 0, Practice: 0, Project: 0, Revision: 0 }
    entries.forEach(e => {
      const t = e.payload?.session_type
      if (t && counts[t] !== undefined) counts[t]++
    })
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0
    }))
  }, [entries])

  const colors = {
    Theory:   ACCENT,
    Practice: '#4a9eed',
    Project:  '#22c55e',
    Revision: '#f59e0b',
  }

  const practicePercent = mix.find(m => m.type === 'Practice')?.pct || 0

  return (
    <GlassCard className="p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-sans font-medium text-[14px] text-white mb-4">
          Session Mix
        </h3>
        <div className="flex w-full h-[8px] rounded-full overflow-hidden mb-4">
          {mix.map(item => (
            <div
              key={item.type}
              style={{
                width: `${item.pct}%`,
                background: colors[item.type]
              }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          {mix.map(item => (
            <div key={item.type} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: colors[item.type] }}
              />
              <span
                className="font-sans text-[12px]"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {item.type}
              </span>
              <span
                className="font-mono text-[12px] ml-auto"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {item.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        className="mt-4 pt-3 text-[12px]"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: practicePercent >= 30 ? '#22c55e' : ACCENT
        }}
      >
        {practicePercent >= 30
          ? '✓ Good balance of active learning.'
          : '↑ Try adding more practice sessions.'
        }
      </div>
    </GlassCard>
  )
}

const MomentumCard = ({ entries }) => {
  const sparkData = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-8)
      .map(e => e.payload?.understanding_level || 0)
      .filter(v => v > 0)
  }, [entries])

  const first = sparkData[0] || 0
  const last  = sparkData[sparkData.length - 1] || 0
  const trend = last - first

  return (
    <GlassCard className="p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-sans font-medium text-[14px] text-white mb-3">
          Learning Momentum
        </h3>
        {sparkData.length < 2 ? (
          <p
            className="font-sans text-[12px] italic"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            Log more sessions to see your momentum.
          </p>
        ) : (
          <Sparkline
            data={sparkData}
            accentColor={ACCENT}
            height={48}
          />
        )}
      </div>
      {sparkData.length >= 2 && (
        <div className="mt-3">
          <div className="flex items-center gap-3 mb-1">
            <span
              className="font-mono text-[18px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {first.toFixed(1)}
            </span>
            <span style={{ color: trend >= 0 ? '#22c55e' : '#ef4444' }}>
              {trend >= 0 ? '↑' : '↓'}
            </span>
            <span className="font-mono text-[18px] text-white">
              {last.toFixed(1)}
            </span>
          </div>
          <p
            className="font-sans text-[11px]"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {trend >= 0
              ? 'Understanding trending up'
              : 'Understanding trending down'
            }
          </p>
        </div>
      )}
    </GlassCard>
  )
}

// Fixed: use date-fns startOfWeek
const ThisWeekCard = ({ entries }) => {
  const thisWeekEntries = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    return entries.filter(e => new Date(e.date) >= weekStart)
  }, [entries])

  const totalMins  = thisWeekEntries.reduce(
    (s, e) => s + (e.payload?.duration_mins || 0), 0
  )
  const totalHours = (totalMins / 60).toFixed(1)

  const topTopic = useMemo(() => {
    const map = {}
    thisWeekEntries.forEach(e => {
      const t = e.payload?.topic
      if (!t) return
      map[t] = (map[t] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  }, [thisWeekEntries])

  return (
    <GlassCard className="p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-sans font-medium text-[14px] text-white mb-4">
          This Week
        </h3>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[20px] text-white">
              {thisWeekEntries.length}
            </span>
            <span
              className="font-sans text-[11px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              sessions
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[20px] text-white">
              {totalHours}
            </span>
            <span
              className="font-sans text-[11px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              hours
            </span>
          </div>
          {topTopic !== '—' && (
            <div className="font-sans text-[14px] text-white mt-1">
              {topTopic}
            </div>
          )}
        </div>
      </div>
      <div
        className="pt-3 text-[12px] leading-relaxed"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.6)'
        }}
      >
        {thisWeekEntries.length === 0
          ? 'No sessions logged this week yet.'
          : thisWeekEntries.length >= 5
            ? 'Great consistency this week!'
            : 'Keep the momentum going.'
        }
      </div>
    </GlassCard>
  )
}

const ResourceIcon = ({ type }) => {
  const icons = {
    YouTube:  '▶',
    Course:   '🎓',
    Paper:    '📄',
    Book:     '📚',
    Project:  '🔧',
    Blog:     '✍',
  }
  return (
    <span
      className="font-sans text-[13px]"
      style={{ color: 'rgba(255,255,255,0.5)' }}
    >
      {icons[type] || '📄'}
    </span>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const MLDeepDive = () => {
  const { widgetId } = useParams()
  const dispatch     = useDispatch()

  const { entries, loading } = useWidgetEntries(widgetId)
  const {
    filteredEntries,
    dateFilter,
    setDateFilter,
    topicFilter,
    setTopicFilter,
  } = useDeepDiveFilter(entries)

  const totalSessions = entries.length

  const totalHours = useMemo(() => {
    const mins = entries.reduce(
      (s, e) => s + (e.payload?.duration_mins || 0), 0
    )
    return (mins / 60).toFixed(1)
  }, [entries])

  const currentStreak = useMemo(() => calcStreak(entries),     [entries])
  const bestStreak    = useMemo(() => calcBestStreak(entries), [entries])

  const topTopic = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      const t = e.payload?.topic
      if (!t) return
      map[t] = (map[t] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  }, [entries])

  const avgUnderstanding = useMemo(() => {
    const leveled = entries.filter(e => e.payload?.understanding_level)
    if (leveled.length === 0) return '0.0'
    const sum = leveled.reduce(
      (s, e) => s + e.payload.understanding_level, 0
    )
    return (sum / leveled.length).toFixed(1)
  }, [entries])

  const heatmapData = useMemo(() =>
    entriesToHeatmapData(entries), [entries]
  )

  // Fixed: use getDaysAgo from dateUtils
  const depthMapNodes = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      const topic = e.payload?.topic
      if (!topic) return
      if (!map[topic]) map[topic] = { mins: 0, lastDate: e.date }
      map[topic].mins += e.payload?.duration_mins || 0
      if (e.date > map[topic].lastDate) map[topic].lastDate = e.date
    })

    const allHours = Object.values(map).map(d => d.mins / 60)
    const maxHours = Math.max(...allHours, 1)
    const minHours = Math.min(...allHours, 0)

    return Object.entries(map)
      .sort((a, b) => b[1].mins - a[1].mins)
      .slice(0, 9)
      .map(([name, data], i) => {
        const hours = data.mins / 60
        const r     = Math.round(
          25 + ((hours - minHours) / (maxHours - minHours || 1)) * 40
        )
        return {
          id:      name,
          name,
          count:   parseFloat(hours.toFixed(1)),
          daysAgo: getDaysAgo(data.lastDate),
          cx:      BUBBLE_LAYOUT[i]?.cx || 400,
          cy:      BUBBLE_LAYOUT[i]?.cy || 160,
          r,
          delay:   i,
        }
      })
  }, [entries])

  const stats = [
    { value: totalSessions.toString(), label: 'TOTAL SESSIONS',      color: ACCENT    },
    { value: `${totalHours}h`,         label: 'TOTAL HOURS',         color: ACCENT    },
    {
      value:   `${currentStreak}d`,
      label:   'CURRENT STREAK',
      color:   '#f59e0b',
      subtext: currentStreak > 0 ? '🔥' : ''
    },
    { value: topTopic,              label: 'TOP TOPIC',           color: '#22c55e' },
    { value: avgUnderstanding,      label: 'AVG UNDERSTANDING',   color: ACCENT    },
  ]

  const handleCta = () => {
    dispatch(setActiveWidget(widgetId))
    dispatch(openModal('ml'))
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0a0f' }}
      >
        <p
          className="font-mono text-[13px]"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Loading...
        </p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ background: '#0a0a0f' }}
    >
      {/* Ambient background effects */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[800px] h-[800px] z-0"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(139,92,246,0.04) 0%, transparent 65%)'
        }}
      />
      <div
        className="pointer-events-none fixed bottom-0 left-0 w-[800px] h-[800px] z-0"
        style={{
          background: 'radial-gradient(ellipse at bottom left, rgba(180,150,90,0.025) 0%, transparent 65%)'
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 79px, rgba(255,255,255,0.018) 79px, rgba(255,255,255,0.018) 80px)'
        }}
      />

      <div className="relative z-10">

        <DeepDiveHeader
          title="ML Learning"
          subtitle="Track your learning, not just your hours."
          accentColor={ACCENT}
          ctaLabel="Log Session"
          onCta={handleCta}
        />

        <div className="max-w-5xl mx-auto px-6 pb-24 pt-6 flex flex-col gap-[14px]">

          {/* Stats Bar */}
          <StatsBar stats={stats} />

          {/* Heatmap */}
          <div>
            <SectionLabel label="CONSISTENCY" />
            <ActivityHeatmap
              data={heatmapData}
              accentColor={ACCENT}
              renderTooltip={(day) =>
                `${day.date} — ${day.count} session${day.count !== 1 ? 's' : ''}`
              }
            />
          </div>

          {/* Learning Intelligence */}
          <div>
            <SectionLabel label="LEARNING INTELLIGENCE" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SessionMixCard entries={entries} />
              <MomentumCard   entries={entries} />
              <ThisWeekCard   entries={entries} />
            </div>
          </div>

          {/* Topic Intelligence */}
          <div>
            <SectionLabel label="TOPIC INTELLIGENCE" />
            <GlassCard className="p-5">
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Depth Map */}
                <div className="flex-[3] min-w-0">
                  <h3
                    className="font-sans text-[13px] font-medium mb-2"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Depth Map
                  </h3>
                  {depthMapNodes.length === 0 ? (
                    <p
                      className="font-sans text-[13px] italic py-10 text-center"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      Log sessions across topics to see your depth map.
                    </p>
                  ) : (
                    <BubbleChart
                      nodes={depthMapNodes}
                      accentColor={ACCENT}
                      selectedId={topicFilter}
                      onSelect={setTopicFilter}
                    />
                  )}
                </div>

                {/* Divider */}
                <div
                  className="hidden lg:block w-[1px] self-stretch"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                />

                {/* Understanding Bars */}
                <div className="flex-[2] min-w-[200px]">
                  <h3
                    className="font-sans text-[13px] font-medium mb-4"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Understanding
                  </h3>
                  <UnderstandingBars entries={entries} />
                </div>

              </div>
            </GlassCard>
          </div>

          {/* Recent Sessions */}
          <RecentLog
            label="RECENT SESSIONS"
            rows={filteredEntries}
            accentColor={ACCENT}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            emptyMessage="No sessions match the current filter."
            recordCount={filteredEntries.length}
            renderLeft={(row) => (
              <span
                className="font-mono text-[11px] shrink-0"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {formatRelativeDate(row.date)}
              </span>
            )}
            renderMiddle={(row) => (
              <div className="flex flex-col min-w-0">
                <span className="font-sans text-[13px] text-white truncate">
                  {row.payload?.topic || '—'}
                </span>
                {row.payload?.subtopic && (
                  <span
                    className="font-sans text-[11px] italic mt-[2px] truncate"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    {row.payload.subtopic}
                  </span>
                )}
              </div>
            )}
            renderRight={(row) => (
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2">
                  <ResourceIcon type={row.payload?.resource_type} />
                  <span
                    className="font-mono text-[11px]"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    {row.payload?.duration_mins
                      ? `${Math.floor(row.payload.duration_mins / 60)}h ${row.payload.duration_mins % 60}m`
                      : '—'
                    }
                  </span>
                </div>
                <TypeBadge type={row.payload?.session_type || 'Theory'} />
                <UnderstandingDots
                  level={row.payload?.understanding_level || 0}
                />
              </div>
            )}
          />

        </div>
      </div>
    </div>
  )
}

export default MLDeepDive