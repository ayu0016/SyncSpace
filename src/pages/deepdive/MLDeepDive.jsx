import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { openModal, setActiveWidget } from '../../store/uiSlice'
import { ArrowUp } from 'lucide-react'

// Shared components
import DeepDiveHeader  from '../../components/deepdive/DeepDiveHeader'
import ActivityHeatmap from '../../components/deepdive/ActivityHeatmap'
import RecentLog       from '../../components/deepdive/RecentLog'
import BubbleChart     from '../../components/deepdive/BubbleChart'
import GlassCard       from '../../components/ui/GlassCard'
import SectionLabel    from '../../components/ui/SectionLabel'
import StatsBar        from '../../components/ui/StatsBar'
import Sparkline       from '../../components/ui/charts/Sparkline'
import BarChart        from '../../components/ui/charts/BarChart'

// Hooks
import useWidgetEntries  from '../../hooks/useWidgetEntries'
import useDeepDiveFilter from '../../hooks/useDeepDiveFilter'

// Utils
import { entriesToHeatmapData }                from '../../utils/heatmapUtils'
import { calcStreak }                          from '../../utils/streakUtils'
import { formatRelativeDate, getDaysAgo }      from '../../utils/dateUtils'
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns'

const ACCENT = '#8b5cf6'

// ── Session type config ───────────────────────────────────────────────────────
const SESSION_TYPE_CONFIG = {
  Theory:   { color: ACCENT,     bg: `${ACCENT}26`        },
  Practice: { color: '#4a9eed',  bg: 'rgba(74,158,237,0.15)' },
  Project:  { color: '#22c55e',  bg: 'rgba(34,197,94,0.15)'  },
  Revision: { color: '#f59e0b',  bg: 'rgba(245,158,11,0.15)' },
}

// ── TypeBadge ─────────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const cfg = SESSION_TYPE_CONFIG[type] || { color: 'rgba(255,255,255,0.7)', bg: 'rgba(255,255,255,0.1)' }
  return (
    <span
      className="inline-block font-sans text-[10px] font-semibold px-2 py-[2px] rounded-[4px]"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {type}
    </span>
  )
}

// ── UnderstandingDots ─────────────────────────────────────────────────────────
const UnderstandingDots = ({ level }) => (
  <div className="flex gap-[3px] items-center">
    {[1, 2, 3, 4, 5].map(dot => (
      <div
        key={dot}
        className="w-[6px] h-[6px] rounded-full"
        style={{
          backgroundColor: dot <= level
            ? ACCENT
            : 'rgba(255,255,255,0.1)'
        }}
      />
    ))}
  </div>
)

// ── UnderstandingBars ─────────────────────────────────────────────────────────
const UnderstandingBars = ({ entries }) => {
  const topicUnderstanding = useMemo(() => {
    const byTopic = {}
    entries.forEach(e => {
      const topic = e.payload?.topic
      const level = e.payload?.understanding_level
      if (!topic || !level) return
      if (!byTopic[topic]) byTopic[topic] = []
      byTopic[topic].push(level)
    })

    return Object.entries(byTopic)
      .map(([topic, levels]) => ({
        topic,
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

  return (
    <div className="flex flex-col gap-[14px]">
      {topicUnderstanding.map((item, i) => (
        <div key={item.topic} className="flex items-center gap-3">
          <div
            className="font-sans text-[12px] text-white truncate shrink-0"
            style={{ width: '90px' }}
            title={item.topic}
          >
            {item.topic}
          </div>
          <div
            className="flex-1 h-[6px] rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:           `${(item.avg / 5) * 100}%`,
                backgroundColor: getBarColor(item.avg),
                animationDelay:  `${i * 60}ms`
              }}
            />
          </div>
          <div
            className="font-mono text-[11px] shrink-0 w-[24px] text-right"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {item.avg.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── SessionMixCard ────────────────────────────────────────────────────────────
const SessionMixCard = ({ entries }) => {
  const mix = useMemo(() => {
    const total  = entries.length || 1
    const counts = { Theory: 0, Practice: 0, Project: 0, Revision: 0 }
    entries.forEach(e => {
      const t = e.payload?.session_type
      if (t && counts[t] !== undefined) counts[t]++
    })
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      pct: Math.round((count / total) * 100)
    }))
  }, [entries])

  const goodBalance = mix[0]?.pct < 60

  return (
    <GlassCard className="p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-sans font-medium text-[14px] text-white mb-4">
          Session Mix
        </h3>

        {/* Segmented bar */}
        <div className="flex w-full h-[8px] rounded-full overflow-hidden mb-4">
          {mix.map(item => (
            <div
              key={item.type}
              style={{
                width:           `${item.pct}%`,
                backgroundColor: SESSION_TYPE_CONFIG[item.type]?.color || '#fff'
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          {mix.map(item => (
            <div key={item.type} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: SESSION_TYPE_CONFIG[item.type]?.color }}
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
        className="pt-3 mt-3 font-sans text-[12px]"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color:     goodBalance ? '#22c55e' : ACCENT
        }}
      >
        {goodBalance
          ? '✓ Good balance of active learning.'
          : 'Consider adding more practice sessions.'
        }
      </div>
    </GlassCard>
  )
}

// ── MomentumCard ──────────────────────────────────────────────────────────────
const MomentumCard = ({ entries }) => {
  const sparklineData = useMemo(() => {
    const sorted = [...entries]
      .filter(e => e.payload?.understanding_level)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-8)
      .map(e => e.payload.understanding_level)
    return sorted.length > 1 ? sorted : [0]
  }, [entries])

  const first = sparklineData[0]
  const last  = sparklineData[sparklineData.length - 1]
  const trend = last > first

  return (
    <GlassCard className="p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-sans font-medium text-[14px] text-white mb-3">
          Learning Momentum
        </h3>
        <Sparkline
          data={sparklineData}
          accentColor={ACCENT}
          height={48}
        />
      </div>

      <div>
        <div className="flex items-center gap-3 mb-1 mt-4">
          <span
            className="font-mono text-[18px]"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {first.toFixed(1)}
          </span>
          <ArrowUp
            size={16}
            className={trend ? 'text-[#22c55e]' : 'text-[#ef4444]'}
            style={{ transform: trend ? 'none' : 'rotate(180deg)' }}
          />
          <span className="font-mono text-[18px] text-white">
            {last.toFixed(1)}
          </span>
        </div>
        <p
          className="font-sans text-[11px]"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Understanding {trend ? 'trending up' : 'trending down'}
        </p>
      </div>
    </GlassCard>
  )
}

// ── ThisWeekCard ──────────────────────────────────────────────────────────────
const ThisWeekCard = ({ entries }) => {
  const weekData = useMemo(() => {
    const now       = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd   = endOfWeek(now, { weekStartsOn: 1 })

    const weekEntries = entries.filter(e =>
      isWithinInterval(parseISO(e.date), { start: weekStart, end: weekEnd })
    )

    const sessions   = weekEntries.length
    const totalMins  = weekEntries.reduce((s, e) => s + (e.payload?.duration_mins || 0), 0)
    const hours      = (totalMins / 60).toFixed(1)
    const topics     = [...new Set(weekEntries.map(e => e.payload?.topic).filter(Boolean))]
    const topTopic   = topics[0] || '—'

    return { sessions, hours, topTopic, topicCount: topics.length }
  }, [entries])

  return (
    <GlassCard className="p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="font-sans font-medium text-[14px] text-white mb-4">
          This Week
        </h3>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[20px] text-white">
              {weekData.sessions}
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
              {weekData.hours}
            </span>
            <span
              className="font-sans text-[11px]"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              hours
            </span>
          </div>
          <div className="font-sans text-[14px] text-white mt-1">
            {weekData.topTopic}
          </div>
        </div>
      </div>

      <div
        className="pt-3 border-t font-sans text-[12px] leading-relaxed"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          color:       'rgba(255,255,255,0.8)'
        }}
      >
        {weekData.topicCount > 2
          ? `Topic hopping detected — consider going deeper into ${weekData.topTopic}.`
          : `Staying focused. Keep going.`
        }
      </div>
    </GlassCard>
  )
}

// ── Depth map node builder ────────────────────────────────────────────────────
const ML_FIXED_LAYOUT = [
  { cx: 380, cy: 170, delay: 0 },
  { cx: 560, cy: 130, delay: 1 },
  { cx: 220, cy: 190, delay: 2 },
  { cx: 650, cy: 230, delay: 3 },
  { cx: 310, cy: 260, delay: 4 },
  { cx: 130, cy: 120, delay: 5 },
  { cx: 710, cy: 110, delay: 6 },
  { cx: 480, cy: 260, delay: 7 },
  { cx: 270, cy: 80,  delay: 8 },
]

const buildDepthMapNodes = (entries) => {
  const byTopic = {}

  entries.forEach(e => {
    const topic = e.payload?.topic
    if (!topic) return
    if (!byTopic[topic]) byTopic[topic] = []
    byTopic[topic].push(e)
  })

  const topics   = Object.entries(byTopic)
  const maxHours = Math.max(
    ...topics.map(([, arr]) =>
      arr.reduce((s, e) => s + (e.payload?.duration_mins || 0), 0) / 60
    ),
    1
  )

  return topics.slice(0, 9).map(([topic, topicEntries], i) => {
    const hours = topicEntries.reduce(
      (s, e) => s + (e.payload?.duration_mins || 0), 0
    ) / 60

    // daysAgo = days since most recent entry for this topic
    const sorted  = [...topicEntries].sort((a, b) => new Date(b.date) - new Date(a.date))
    const daysAgo = getDaysAgo(sorted[0].date)

    const r = 25 + (hours / maxHours) * 40

    return {
      id:     topic,
      name:   topic,
      count:  Math.round(hours * 10) / 10,
      daysAgo,
      cx:     ML_FIXED_LAYOUT[i]?.cx || 400,
      cy:     ML_FIXED_LAYOUT[i]?.cy || 160,
      r,
      delay:  ML_FIXED_LAYOUT[i]?.delay || 0,
    }
  })
}

// ── Weekly hours bar data ─────────────────────────────────────────────────────
const buildWeeklyHours = (entries) => {
  return Array.from({ length: 8 }, (_, i) => {
    const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 })
    const weekEnd   = endOfWeek(weekStart, { weekStartsOn: 1 })
    const label     = format(weekStart, 'MMM d')

    const mins = entries
      .filter(e => isWithinInterval(parseISO(e.date), { start: weekStart, end: weekEnd }))
      .reduce((s, e) => s + (e.payload?.duration_mins || 0), 0)

    return { label, value: Math.round((mins / 60) * 10) / 10 }
  }).reverse()
}

// ── Main MLDeepDive Page ──────────────────────────────────────────────────────
const MLDeepDive = () => {
  const { widgetId }  = useParams()
  const dispatch      = useDispatch()
  const [selectedTopic, setSelectedTopic] = useState(null)

  const { entries, loading } = useWidgetEntries(widgetId)
  const {
    filteredEntries,
    dateFilter,
    setDateFilter,
    setTopicFilter,
  } = useDeepDiveFilter(entries)

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalSessions = entries.length

  const totalHours = useMemo(() =>
    (entries.reduce((s, e) => s + (e.payload?.duration_mins || 0), 0) / 60).toFixed(1),
    [entries]
  )

  const currentStreak = useMemo(() => calcStreak(entries), [entries])

  const topTopic = useMemo(() => {
    const counts = {}
    entries.forEach(e => {
      const t = e.payload?.topic
      if (t) counts[t] = (counts[t] || 0) + 1
    })
    if (!Object.keys(counts).length) return '—'
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  }, [entries])

  const topTopicHours = useMemo(() => {
    return (
      entries
        .filter(e => e.payload?.topic === topTopic)
        .reduce((s, e) => s + (e.payload?.duration_mins || 0), 0) / 60
    ).toFixed(1)
  }, [entries, topTopic])

  const avgUnderstanding = useMemo(() => {
    const levels = entries.map(e => e.payload?.understanding_level).filter(Boolean)
    if (!levels.length) return 0
    return (levels.reduce((s, l) => s + l, 0) / levels.length).toFixed(1)
  }, [entries])

  const prevAvgUnderstanding = useMemo(() => {
    const old = entries.slice(Math.floor(entries.length / 2))
    const levels = old.map(e => e.payload?.understanding_level).filter(Boolean)
    if (!levels.length) return 0
    return (levels.reduce((s, l) => s + l, 0) / levels.length).toFixed(1)
  }, [entries])

  // ── Stats bar ─────────────────────────────────────────────────────────────
  const stats = [
    { value: totalSessions,    label: 'TOTAL SESSIONS',    color: ACCENT,     subtext: '+8 this week'                    },
    { value: `${totalHours}h`, label: 'TOTAL HOURS',       color: ACCENT,     subtext: '+3.5h this week'                 },
    { value: `${currentStreak}🔥`, label: 'CURRENT STREAK', color: ACCENT,   subtext: ''                                },
    { value: topTopic,         label: 'TOP TOPIC',         color: ACCENT,     subtext: `${topTopicHours}h logged`        },
    { value: avgUnderstanding, label: 'AVG UNDERSTANDING', color: ACCENT,     subtext: `↑ from ${prevAvgUnderstanding}` },
  ]

  // ── Heatmap data ──────────────────────────────────────────────────────────
  const heatmapData = useMemo(() =>
    entriesToHeatmapData(entries),
    [entries]
  )

  // ── Depth map nodes ───────────────────────────────────────────────────────
  const depthMapNodes = useMemo(() =>
    buildDepthMapNodes(entries),
    [entries]
  )

  // ── Weekly hours chart ────────────────────────────────────────────────────
  const weeklyHours = useMemo(() =>
    buildWeeklyHours(entries),
    [entries]
  )

  // ── Log rows — filter by selected topic from depth map ───────────────────
  const logRows = useMemo(() => {
    if (selectedTopic) {
      return filteredEntries.filter(e => e.payload?.topic === selectedTopic)
    }
    return filteredEntries
  }, [filteredEntries, selectedTopic])

  // ── Open quick add modal ──────────────────────────────────────────────────
  const handleLogSession = () => {
    dispatch(setActiveWidget(widgetId))
    dispatch(openModal('ml'))
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0a0a0f' }}
      >
        <p className="font-mono text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Loading...
        </p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: '#0a0a0f', color: '#c8d0e0' }}
    >
      {/* Ambient effects */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[800px] h-[800px] z-0"
        style={{
          background: `radial-gradient(ellipse at top right, ${ACCENT}0a 0%, transparent 65%)`
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

        {/* Header */}
        <DeepDiveHeader
          title="ML Learning"
          subtitle="Track your learning, not just your hours."
          accentColor={ACCENT}
          ctaLabel="Log Session"
          onCta={handleLogSession}
        />

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 pb-24 pt-6 flex flex-col gap-[14px]">

          {/* Stats Bar */}
          <StatsBar stats={stats} />

          {/* Consistency Heatmap */}
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

          {/* Learning Intelligence strip */}
          <div>
            <SectionLabel label="LEARNING INTELLIGENCE" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SessionMixCard entries={entries} />
              <MomentumCard   entries={entries} />
              <ThisWeekCard   entries={entries} />
            </div>
          </div>

          {/* Topic Intelligence — Depth Map + Understanding Bars */}
          <div>
            <SectionLabel label="TOPIC INTELLIGENCE" />
            <GlassCard className="p-5">
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Left — Depth Map bubble chart */}
                <div className="flex-[3] min-w-0">
                  <h3
                    className="font-sans font-medium text-[13px] mb-2"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Depth Map
                  </h3>
                  {depthMapNodes.length === 0 ? (
                    <p
                      className="font-sans text-[13px] italic py-8 text-center"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      Log sessions to see your topic depth map.
                    </p>
                  ) : (
                    <BubbleChart
                      nodes={depthMapNodes}
                      accentColor={ACCENT}
                      selectedId={selectedTopic}
                      onSelect={(id) => {
                        setSelectedTopic(id)
                        setTopicFilter(id)
                      }}
                    />
                  )}
                </div>

                {/* Divider */}
                <div
                  className="hidden lg:block w-[1px] self-stretch"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
                />

                {/* Right — Understanding Bars */}
                <div className="flex-[2] min-w-[200px]">
                  <h3
                    className="font-sans font-medium text-[13px] mb-4"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    Understanding
                  </h3>
                  {entries.length === 0 ? (
                    <p
                      className="font-sans text-[13px] italic"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      No entries yet
                    </p>
                  ) : (
                    <UnderstandingBars entries={entries} />
                  )}
                </div>

              </div>
            </GlassCard>
          </div>

          {/* Weekly Hours Chart */}
          <div>
            <SectionLabel label="WEEKLY HOURS" />
            <GlassCard className="p-5">
              <BarChart
                data={weeklyHours}
                accentColor={ACCENT}
                unit="h"
                height={180}
              />
            </GlassCard>
          </div>

          {/* Recent Sessions */}
          <RecentLog
            label="RECENT SESSIONS"
            rows={logRows}
            accentColor={ACCENT}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            emptyMessage={
              selectedTopic
                ? `No sessions found for "${selectedTopic}"`
                : 'No sessions found for this date.'
            }
            recordCount={logRows.length}
            renderLeft={(row) => (
              <span
                className="font-mono text-[12px]"
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
              <div className="flex flex-col items-end gap-[3px]">
                <TypeBadge type={row.payload?.session_type || 'Theory'} />
                <span
                  className="font-mono text-[11px]"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {row.payload?.duration_mins
                    ? `${Math.floor(row.payload.duration_mins / 60)}h ${row.payload.duration_mins % 60}m`
                    : '—'
                  }
                </span>
                <UnderstandingDots level={row.payload?.understanding_level || 0} />
              </div>
            )}
          />

        </div>
      </div>
    </div>
  )
}

export default MLDeepDive
