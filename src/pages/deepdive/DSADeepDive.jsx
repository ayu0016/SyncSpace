import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { openModal, setActiveWidget } from '../../store/uiSlice'

// Hooks
import useWidgetEntries from '../../hooks/useWidgetEntries'
import useDeepDiveFilter from '../../hooks/useDeepDiveFilter'

// Utils
import { calcStreak, calcBestStreak, calcThisWeek } from '../../utils/streakUtils'
import { entriesToHeatmapData } from '../../utils/heatmapUtils'
import { formatRelativeDate, getDaysAgo } from '../../utils/dateUtils'

// Shared components
import DeepDiveHeader from '../../components/deepdive/DeepDiveHeader'
import SectionLabel from '../../components/ui/SectionLabel'
import StatsBar from '../../components/ui/StatsBar'
import GlassCard from '../../components/ui/GlassCard'
import ActivityHeatmap from '../../components/deepdive/ActivityHeatmap'
import DonutChart from '../../components/ui/charts/DonutChart'
import BubbleChart from '../../components/deepdive/BubbleChart'
import RecentLog from '../../components/deepdive/RecentLog'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const ACCENT = '#4a9eed'

const BUBBLE_LAYOUT = [
  { cx: 220, cy: 160, r: 60, delay: 0 },
  { cx: 380, cy: 140, r: 65, delay: 1 },
  { cx: 520, cy: 110, r: 45, delay: 2 },
  { cx: 320, cy: 260, r: 35, delay: 3 },
  { cx: 480, cy: 220, r: 28, delay: 4 },
  { cx: 620, cy: 200, r: 35, delay: 5 },
]

// ─── PAGE-SPECIFIC COMPONENTS ────────────────────────────────────────────────

const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    easy: {
      color: '#22c55e',
      background: 'rgba(34,197,94,0.07)',
      border: '0.5px solid rgba(34,197,94,0.15)',
      label: 'EASY'
    },
    medium: {
      color: '#f59e0b',
      background: 'rgba(245,158,11,0.07)',
      border: '0.5px solid rgba(245,158,11,0.15)',
      label: 'MED'
    },
    hard: {
      color: '#ef4444',
      background: 'rgba(239,68,68,0.07)',
      border: '0.5px solid rgba(239,68,68,0.15)',
      label: 'HARD'
    }
  }

  const s = styles[difficulty?.toLowerCase()] || styles.medium

  return (
    <div
      className="w-full text-center font-mono text-[9px] font-semibold tracking-[0.5px] rounded py-[3px]"
      style={{
        color: s.color,
        background: s.background,
        border: s.border
      }}
    >
      {s.label}
    </div>
  )
}

const ProblemName = ({ title, isBookmarked, isFlagged }) => (
  <div className="flex flex-col overflow-hidden">
    <span
      className="font-sans text-[12px] truncate"
      style={{ color: '#9aa0b0' }}
    >
      {title}
    </span>
    {(isBookmarked || isFlagged) && (
      <div className="flex items-center gap-2 mt-1">
        {isBookmarked && (
          <span
            className="font-mono text-[9px]"
            style={{ color: 'rgba(74,158,237,0.5)' }}
          >
            bookmarked
          </span>
        )}
        {isFlagged && (
          <span
            className="font-mono text-[9px]"
            style={{ color: 'rgba(239,68,68,0.5)' }}
          >
            flagged
          </span>
        )}
      </div>
    )}
  </div>
)

const ProblemMeta = ({ platform, topic, time }) => (
  <div className="flex flex-col items-end gap-[3px]">
    <span
      className="font-mono text-[10px] rounded-[4px] px-[7px] py-[2px] leading-none"
      style={{
        color: 'rgba(74,158,237,0.7)',
        background: 'rgba(74,158,237,0.08)'
      }}
    >
      {platform}
    </span>
    <span
      className="font-mono text-[9px]"
      style={{ color: '#2d3748' }}
    >
      {topic}
    </span>
    <span
      className="font-mono text-[9px]"
      style={{ color: '#1a2030' }}
    >
      {time}
    </span>
  </div>
)

const WeaknessRadar = ({ entries }) => {
  const [hoveredNode, setHoveredNode] = useState(null)

  const topics = useMemo(() => {
    const topicMap = {}
    entries.forEach(e => {
      const t = e.payload?.topic
      if (!t) return
      topicMap[t] = (topicMap[t] || 0) + 1
    })

    const topTopics = Object.entries(topicMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    const maxCount = Math.max(...topTopics.map(([, c]) => c), 1)

    return topTopics.map(([name, count], i) => ({
      name,
      current: Math.round((count / maxCount) * 100),
      angle: i * (360 / topTopics.length)
    }))
  }, [entries])

  const size   = 280
  const center = size / 2
  const radius = 90

  const getPoint = (value, angle) => {
    const theta = (angle - 90) * (Math.PI / 180)
    const r     = (value / 100) * radius
    return {
      x: center + r * Math.cos(theta),
      y: center + r * Math.sin(theta)
    }
  }

  const currentPoints  = topics.map(t => getPoint(t.current, t.angle))
  const createPolygon  = (points) => points.map(p => `${p.x},${p.y}`).join(' ')

  if (topics.length < 3) {
    return (
      <GlassCard className="p-5 w-full">
        <div
          className="flex items-center justify-center h-[200px] font-sans text-[13px] italic"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Log problems across at least 3 different topics to see your radar.
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-5 w-full">
      <div className="flex flex-col md:flex-row gap-6 items-center">

        {/* SVG Radar */}
        <div className="relative shrink-0">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible"
          >
            {/* Reference rings */}
            {[25, 50, 75, 100].map(level => {
              const pts = topics.map(t => getPoint(level, t.angle))
              return (
                <polygon
                  key={level}
                  points={createPolygon(pts)}
                  fill="none"
                  stroke={
                    level === 100
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(255,255,255,0.05)'
                  }
                  strokeWidth="1"
                />
              )
            })}

            {/* Axes and labels */}
            {topics.map((topic, i) => {
              const end      = getPoint(100, topic.angle)
              const labelPos = getPoint(120, topic.angle)
              return (
                <g key={i}>
                  <line
                    x1={center} y1={center}
                    x2={end.x}  y2={end.y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="#475569"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {topic.name.length > 10
                      ? topic.name.substring(0, 9) + '..'
                      : topic.name
                    }
                  </text>
                </g>
              )
            })}

            {/* Current shape */}
            <polygon
              points={createPolygon(currentPoints)}
              fill="rgba(74,158,237,0.12)"
              stroke={ACCENT}
              strokeOpacity="0.8"
              strokeWidth="1.5"
            />

            {/* Nodes */}
            {topics.map((topic, i) => {
              const p = getPoint(topic.current, topic.angle)
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredNode === i ? 7 : 4}
                  fill={ACCENT}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredNode(i)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              )
            })}
          </svg>

          {/* Hover tooltip */}
          {hoveredNode !== null && (
            <div
              className="absolute top-2 left-2 rounded-[8px] px-3 py-2 pointer-events-none"
              style={{
                background: 'rgba(10,10,15,0.95)',
                border: `1px solid ${ACCENT}4d`,
              }}
            >
              <p
                className="font-sans text-[12px] font-medium mb-1"
                style={{ color: '#c8d0e0' }}
              >
                {topics[hoveredNode].name}
              </p>
              <p
                className="font-mono text-[10px]"
                style={{ color: ACCENT }}
              >
                Score: {topics[hoveredNode].current}
              </p>
            </div>
          )}
        </div>

        {/* Score list */}
        <div className="flex flex-col gap-2 w-full">
          {topics.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="font-sans text-[12px] w-24 truncate shrink-0"
                style={{ color: '#94a3b8' }}
              >
                {t.name}
              </span>
              <div
                className="flex-1 h-[3px] rounded-[2px] overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-[2px]"
                  style={{
                    width: `${t.current}%`,
                    background: ACCENT,
                    opacity: 0.6
                  }}
                />
              </div>
              <span
                className="font-mono text-[11px] w-6 text-right shrink-0"
                style={{ color: ACCENT }}
              >
                {t.current}
              </span>
            </div>
          ))}
        </div>

      </div>
    </GlassCard>
  )
}

const TopicBreakdown = ({ entries }) => {
  const topicCounts = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      const t = e.payload?.topic
      if (!t) return
      map[t] = (map[t] || 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [entries])

  const total = topicCounts.length

  // Fixed: guard for small arrays
  const advanced     = topicCounts.slice(0, Math.max(1, Math.ceil(total * 0.3)))
  const intermediate = topicCounts.slice(
    Math.max(1, Math.ceil(total * 0.3)),
    Math.max(2, Math.ceil(total * 0.65))
  )
  const fundamental  = topicCounts.slice(Math.max(2, Math.ceil(total * 0.65)))

  const tiers = [
    {
      label: 'ADVANCED',
      topics: advanced,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.04)',
      border: 'rgba(239,68,68,0.15)',
      gradientFrom: 'rgba(239,68,68,0.2)'
    },
    {
      label: 'INTERMEDIATE',
      topics: intermediate,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.04)',
      border: 'rgba(245,158,11,0.15)',
      gradientFrom: 'rgba(245,158,11,0.2)'
    },
    {
      label: 'FUNDAMENTAL',
      topics: fundamental,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.04)',
      border: 'rgba(34,197,94,0.15)',
      gradientFrom: 'rgba(34,197,94,0.2)'
    }
  ]

  if (topicCounts.length === 0) {
    return (
      <GlassCard className="p-5 w-full">
        <p
          className="font-sans text-[13px] italic text-center py-8"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          No topics logged yet.
        </p>
      </GlassCard>
    )
  }

  return (
    // Fixed: removed style prop from GlassCard, wrapped in div
    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
      <GlassCard className="p-5 w-full">
        <div className="flex flex-col gap-6">
          {tiers.map(tier => (
            <div key={tier.label}>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="font-mono text-[10px] uppercase tracking-[1.5px] shrink-0"
                  style={{ color: tier.color }}
                >
                  {tier.label}
                </span>
                <div
                  className="h-[1px] flex-1"
                  style={{
                    background: `linear-gradient(to right, ${tier.gradientFrom}, transparent)`
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {tier.topics.length === 0 ? (
                  <span
                    className="font-mono text-[10px] italic"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  >
                    No topics yet
                  </span>
                ) : (
                  tier.topics.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center rounded-[8px] px-3 py-1.5 cursor-default"
                      style={{
                        background: tier.bg,
                        border: `0.5px solid ${tier.border}`
                      }}
                    >
                      <span
                        className="font-sans text-[13px] mr-2"
                        style={{ color: '#c8d0e0' }}
                      >
                        {t.name}
                      </span>
                      <span
                        className="font-mono text-[11px] font-bold"
                        style={{ color: tier.color }}
                      >
                        {t.count}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const DSADeepDive = () => {
  const { widgetId } = useParams()
  const dispatch     = useDispatch()

  const { entries, loading }   = useWidgetEntries(widgetId)
  const {
    filteredEntries,
    dateFilter,
    setDateFilter,
    topicFilter,
    setTopicFilter,
  } = useDeepDiveFilter(entries)

  // Fixed: use entries.length directly
  const totalSolved = useMemo(() => entries.length, [entries])

  const currentStreak = useMemo(() => calcStreak(entries),     [entries])
  const bestStreak    = useMemo(() => calcBestStreak(entries), [entries])
  const thisWeek      = useMemo(() => calcThisWeek(entries),   [entries])

  const topPlatform = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      const p = e.payload?.platform
      if (!p) return
      map[p] = (map[p] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  }, [entries])

  const topTopic = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      const t = e.payload?.topic
      if (!t) return
      map[t] = (map[t] || 0) + 1
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'
  }, [entries])

  const heatmapData = useMemo(() => entriesToHeatmapData(entries), [entries])

  const donutSegments = useMemo(() => {
    const easy   = entries.filter(e => e.payload?.difficulty === 'easy').length
    const medium = entries.filter(e => e.payload?.difficulty === 'medium').length
    const hard   = entries.filter(e => e.payload?.difficulty === 'hard').length
    return [
      { label: 'Easy',   count: easy,   color: '#22c55e' },
      { label: 'Medium', count: medium, color: '#4a9eed' },
      { label: 'Hard',   count: hard,   color: '#ef4444' },
    ]
  }, [entries])

  const graveyardNodes = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      if (!e.payload?.is_flagged) return
      const topic = e.payload?.topic || 'Unknown'
      if (!map[topic]) map[topic] = { count: 0, lastDate: e.date }
      map[topic].count++
      if (e.date > map[topic].lastDate) map[topic].lastDate = e.date
    })

    return Object.entries(map)
      .slice(0, 6)
      .map(([name, data], i) => ({
        id: name,
        name,
        count: data.count,
        // Fixed: use getDaysAgo from dateUtils
        daysAgo: getDaysAgo(data.lastDate),
        cx: BUBBLE_LAYOUT[i]?.cx || 400,
        cy: BUBBLE_LAYOUT[i]?.cy || 160,
        r:  BUBBLE_LAYOUT[i]?.r  || 40,
        delay: i,
      }))
  }, [entries])

  const stats = [
    { value: totalSolved.toString(), label: 'TOTAL SOLVED',   color: ACCENT     },
    { value: `${currentStreak}d`,   label: 'CURRENT STREAK', color: '#f59e0b'  },
    { value: `${bestStreak}d`,      label: 'BEST STREAK',    color: '#f59e0b'  },
    { value: topPlatform,           label: 'TOP PLATFORM',   color: '#22c55e'  },
    { value: topTopic,              label: 'TOP TOPIC',      color: '#22c55e'  },
  ]

  const handleCta = () => {
    dispatch(setActiveWidget(widgetId))
    dispatch(openModal('dsa'))
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
          background: 'radial-gradient(ellipse at top right, rgba(74,158,237,0.04) 0%, transparent 65%)'
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
          title="DSA Learning"
          subtitle="Track your grind, not just your hours."
          accentColor={ACCENT}
          ctaLabel="Log Problem"
          onCta={handleCta}
        />

        {/* Top accent line */}
        <div
          className="h-[2px] w-[40%]"
          style={{
            background: `linear-gradient(to right, ${ACCENT}, transparent)`
          }}
        />

        <div className="max-w-5xl mx-auto px-6 pb-24 pt-6 flex flex-col gap-[14px]">

          {/* Stats Bar */}
          <StatsBar stats={stats} />

          {/* Weakness Radar */}
          <div>
            <SectionLabel label="FINGERPRINT" />
            <WeaknessRadar entries={entries} />
          </div>

          {/* Heatmap */}
          <div>
            <SectionLabel label="ACTIVITY" />
            <ActivityHeatmap
              data={heatmapData}
              accentColor={ACCENT}
              renderTooltip={(day) =>
                `${day.date} — ${day.count} problem${day.count !== 1 ? 's' : ''} solved`
              }
            />
          </div>

          {/* Analytics — Donut + Topic Breakdown */}
          <div>
            <SectionLabel label="ANALYTICS" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">

              <GlassCard className="p-5 flex flex-col items-center justify-center">
                {entries.length === 0 ? (
                  <p
                    className="font-sans text-[13px] italic py-10 text-center"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    No problems logged yet.
                  </p>
                ) : (
                  <DonutChart
                    segments={donutSegments}
                    centerLabel="SOLVED"
                  />
                )}
              </GlassCard>

              <TopicBreakdown entries={entries} />

            </div>
          </div>

          {/* Graveyard */}
          {graveyardNodes.length > 0 && (
            <div>
              <SectionLabel label="GRAVEYARD" />
              <GlassCard className="p-5">
                <BubbleChart
                  nodes={graveyardNodes}
                  accentColor={ACCENT}
                  selectedId={topicFilter}
                  onSelect={setTopicFilter}
                />
              </GlassCard>
            </div>
          )}

          {/* Recent Log */}
          <RecentLog
            label="RECENT LOG"
            rows={filteredEntries}
            accentColor={ACCENT}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            emptyMessage="No problems found for this filter."
            recordCount={filteredEntries.length}
            renderLeft={(row) => (
              <DifficultyBadge difficulty={row.payload?.difficulty} />
            )}
            renderMiddle={(row) => (
              <ProblemName
                title={row.payload?.problem_title || '—'}
                isBookmarked={row.payload?.is_bookmarked}
                isFlagged={row.payload?.is_flagged}
              />
            )}
            renderRight={(row) => (
              <ProblemMeta
                platform={row.payload?.platform || '—'}
                topic={row.payload?.topic || '—'}
                time={formatRelativeDate(row.date)}
              />
            )}
          />

        </div>
      </div>
    </div>
  )
}

export default DSADeepDive