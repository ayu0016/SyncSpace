import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { openModal, setActiveWidget } from '../../store/uiSlice'

// Shared components
import DeepDiveHeader   from '../../components/deepdive/DeepDiveHeader'
import ActivityHeatmap  from '../../components/deepdive/ActivityHeatmap'
import RecentLog        from '../../components/deepdive/RecentLog'
import BubbleChart      from '../../components/deepdive/BubbleChart'
import GlassCard        from '../../components/ui/GlassCard'
import SectionLabel     from '../../components/ui/SectionLabel'
import StatsBar         from '../../components/ui/StatsBar'
import DonutChart       from '../../components/ui/charts/DonutChart'

// Hooks
import useWidgetEntries   from '../../hooks/useWidgetEntries'
import useDeepDiveFilter  from '../../hooks/useDeepDiveFilter'

// Utils
import { entriesToHeatmapData }                    from '../../utils/heatmapUtils'
import { calcStreak, calcBestStreak }              from '../../utils/streakUtils'
import { formatRelativeDate, formatShortDate }     from '../../utils/dateUtils'

const ACCENT = '#4a9eed'

// ── DSA topic tiers ──────────────────────────────────────────────────────────
const ADVANCED_TOPICS     = ['Dynamic Programming', 'Graphs', 'Segment Tree', 'Tries']
const INTERMEDIATE_TOPICS = ['Binary Search', 'Trees', 'Sliding Window', 'Backtracking']
const FUNDAMENTAL_TOPICS  = ['Arrays', 'Strings', 'Hashing', 'Recursion']

// ── Helper: most frequent value in array ─────────────────────────────────────
const getMostFrequent = (arr) => {
  if (!arr.length) return '—'
  const freq = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1
    return acc
  }, {})
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
}

// ── DifficultyBadge ───────────────────────────────────────────────────────────
const DifficultyBadge = ({ difficulty }) => {
  const map = {
    easy:   { label: 'EASY', color: '#22c55e', bg: 'rgba(34,197,94,0.07)',   border: 'rgba(34,197,94,0.15)'   },
    medium: { label: 'MED',  color: '#f59e0b', bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.15)'  },
    hard:   { label: 'HARD', color: '#ef4444', bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.15)'   },
  }
  const d = map[difficulty?.toLowerCase()] || map.medium

  return (
    <div
      className="w-full text-center font-mono text-[9px] font-semibold tracking-[0.5px] rounded py-[3px]"
      style={{
        color: d.color,
        backgroundColor: d.bg,
        border: `0.5px solid ${d.border}`
      }}
    >
      {d.label}
    </div>
  )
}

// ── WeaknessRadar ─────────────────────────────────────────────────────────────
const RADAR_TOPICS = [
  { name: 'Arrays',         angle: 0   },
  { name: 'Dynamic Prog.',  angle: 45  },
  { name: 'Graphs',         angle: 90  },
  { name: 'Trees',          angle: 135 },
  { name: 'Binary Search',  angle: 180 },
  { name: 'Sliding Window', angle: 225 },
  { name: 'Backtracking',   angle: 270 },
  { name: 'Greedy',         angle: 315 },
]

const WeaknessRadar = ({ entries }) => {
  const [hoveredNode, setHoveredNode] = useState(null)

  const size   = 280
  const center = size / 2
  const radius = 95

  // Compute score per topic (0-100) based on entry count relative to max
  const topicCounts = useMemo(() => {
    const counts = {}
    entries.forEach(e => {
      const t = e.payload?.topic
      if (t) counts[t] = (counts[t] || 0) + 1
    })
    return counts
  }, [entries])

  const maxCount = Math.max(...Object.values(topicCounts), 1)

  const getScore = (topicName) => {
    // Find matching topic count (partial match)
    const key = Object.keys(topicCounts).find(
      k => k.toLowerCase().includes(topicName.toLowerCase().split(' ')[0].toLowerCase())
    )
    return key ? Math.round((topicCounts[key] / maxCount) * 100) : 10
  }

  const getPoint = (score, angle) => {
    const theta = (angle - 90) * (Math.PI / 180)
    const r     = (score / 100) * radius
    return {
      x: center + r * Math.cos(theta),
      y: center + r * Math.sin(theta)
    }
  }

  const scoredTopics = RADAR_TOPICS.map(t => ({
    ...t,
    score: getScore(t.name)
  }))

  const currentPoints = scoredTopics.map(t => getPoint(t.score, t.angle))
  const createPolygon = (points) => points.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <GlassCard className="p-5 w-full">
      <div className="flex flex-col md:flex-row gap-6">

        {/* SVG Radar */}
        <div className="flex justify-center md:w-[55%] relative">
          <svg
            width="100%"
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible"
          >
            {/* Reference rings */}
            {[25, 50, 75, 100].map(level => {
              const pts = RADAR_TOPICS.map(t => getPoint(level, t.angle))
              return (
                <polygon
                  key={level}
                  points={createPolygon(pts)}
                  fill="none"
                  stroke={level === 100
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.05)'
                  }
                  strokeWidth="1"
                />
              )
            })}

            {/* Axes + labels */}
            {scoredTopics.map((topic, i) => {
              const end      = getPoint(100, topic.angle)
              const labelPos = getPoint(122, topic.angle)
              return (
                <g key={i}>
                  <line
                    x1={center} y1={center}
                    x2={end.x}  y2={end.y}
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="1"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="rgba(71,85,105,0.9)"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {topic.name}
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
            {scoredTopics.map((topic, i) => {
              const p         = getPoint(topic.score, topic.angle)
              const isHovered = hoveredNode === i
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 7 : 4}
                  fill={ACCENT}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredNode(i)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              )
            })}
          </svg>

          {/* Tooltip */}
          {hoveredNode !== null && (
            <div
              className="absolute top-2 left-2 rounded-[8px] px-3 py-2 pointer-events-none"
              style={{
                background: 'rgba(10,10,15,0.95)',
                border: `1px solid ${ACCENT}4d`,
                backdropFilter: 'blur(12px)'
              }}
            >
              <p className="font-sans text-[12px] text-white font-medium mb-1">
                {scoredTopics[hoveredNode].name}
              </p>
              <p className="font-mono text-[10px]" style={{ color: ACCENT }}>
                Score: {scoredTopics[hoveredNode].score}
              </p>
            </div>
          )}
        </div>

        {/* Score list + insight */}
        <div className="flex flex-col justify-center md:w-[45%] gap-2">

          {/* Legend */}
          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-[2px]" style={{ backgroundColor: ACCENT }} />
              <span className="font-sans text-[12px]" style={{ color: 'rgba(148,163,184,0.9)' }}>
                Current (based on entry count)
              </span>
            </div>
          </div>

          {/* Score bars */}
          {scoredTopics.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="font-sans text-[11px] w-[100px] truncate"
                style={{ color: 'rgba(148,163,184,0.9)' }}
              >
                {t.name}
              </span>
              <div
                className="flex-1 h-[3px] rounded-[2px] overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-[2px]"
                  style={{
                    width: `${t.score}%`,
                    backgroundColor: `${ACCENT}66`
                  }}
                />
              </div>
              <span
                className="font-mono text-[11px] w-6 text-right"
                style={{ color: ACCENT }}
              >
                {t.score}
              </span>
            </div>
          ))}

          {/* Insight */}
          <div
            className="mt-4 p-3 rounded-r-[8px] text-[12px] italic"
            style={{
              borderLeft: `2px solid ${ACCENT}`,
              background: `${ACCENT}0d`,
              color: 'rgba(122,143,168,0.9)'
            }}
          >
            Focus on your lowest scoring topics — these are your biggest interview risks.
          </div>

        </div>
      </div>
    </GlassCard>
  )
}

// ── ReportCardStrip ───────────────────────────────────────────────────────────
const ReportCardStrip = ({ entries }) => {
  // Build last 4 weeks of report cards
  const weeks = useMemo(() => {
    const result = []
    const now    = new Date()

    for (let w = 0; w < 4; w++) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() + 1 - w * 7)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      const weekEntries = entries.filter(e => {
        const d = new Date(e.date)
        return d >= weekStart && d <= weekEnd
      })

      const flagged = weekEntries.filter(e => e.payload?.is_flagged).length
      const topics  = weekEntries.map(e => e.payload?.topic).filter(Boolean)
      const focus   = getMostFrequent(topics) || '—'

      // Simple quality score — based on problems solved and hard ratio
      const hardCount  = weekEntries.filter(e => e.payload?.difficulty === 'hard').length
      const score      = Math.min(
        100,
        Math.round(weekEntries.length * 5 + hardCount * 3)
      )

      const startLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endLabel   = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      result.push({
        label:    w === 0 ? 'THIS WEEK' : w === 1 ? 'LAST WEEK' : `${w} WEEKS AGO`,
        dateRange: `${startLabel} — ${endLabel}`,
        score,
        problems: weekEntries.length,
        flagged,
        focus,
        isCurrent: w === 0
      })
    }

    return result
  }, [entries])

  return (
    <div className="flex gap-[10px] overflow-x-auto no-scrollbar pb-2">
      {weeks.map((card, i) => (
        <div
          key={i}
          className="rounded-[12px] shrink-0 p-[18px] flex flex-col transition-all duration-200"
          style={{
            background:  card.isCurrent
              ? `${ACCENT}08`
              : 'rgba(255,255,255,0.025)',
            border:      card.isCurrent
              ? `1px solid ${ACCENT}33`
              : '1px solid rgba(255,255,255,0.07)',
            borderTop:   card.isCurrent ? `2px solid ${ACCENT}` : undefined,
            backdropFilter: 'blur(12px)',
            width: card.isCurrent ? '260px' : '210px',
          }}
        >
          {/* Week label */}
          <span
            className="font-mono text-[9px] tracking-[2px] mb-1"
            style={{ color: ACCENT }}
          >
            {card.label}
          </span>
          <span
            className="font-mono text-[9px] mb-4"
            style={{ color: 'rgba(100,116,139,0.9)' }}
          >
            {card.dateRange}
          </span>

          {/* Score */}
          <div className="flex items-end gap-3 mb-1">
            <span
              className="font-sans leading-none"
              style={{
                fontSize:   card.isCurrent ? '36px' : '24px',
                fontWeight: '800',
                color:      card.isCurrent ? '#f0f4ff' : '#c8d0e0'
              }}
            >
              {card.score}
            </span>
          </div>
          {card.isCurrent && (
            <span
              className="font-mono text-[8px] tracking-[1.5px] mb-4"
              style={{ color: 'rgba(148,163,184,0.9)' }}
            >
              QUALITY SCORE
            </span>
          )}

          {/* Divider */}
          <div
            className="h-[1px] w-full mb-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          />

          {/* Stats */}
          <div className="flex flex-col gap-2">
            {[
              { key: 'Problems',    val: `${card.problems} solved` },
              { key: 'Flagged',     val: `${card.flagged}`,        warn: card.flagged > 0 },
              { key: 'Focus Topic', val: card.focus },
            ].map(item => (
              <div key={item.key} className="flex justify-between items-center">
                <span
                  className="font-mono text-[9px]"
                  style={{ color: 'rgba(100,116,139,0.9)' }}
                >
                  {item.key}
                </span>
                <span
                  className="font-sans font-semibold text-[12px]"
                  style={{
                    color: item.warn
                      ? '#ef4444'
                      : '#e2e8f0'
                  }}
                >
                  {item.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── TopicBreakdown ────────────────────────────────────────────────────────────
const TopicBreakdown = ({ entries }) => {
  const topicCounts = useMemo(() => {
    const counts = {}
    entries.forEach(e => {
      const t = e.payload?.topic
      if (t) counts[t] = (counts[t] || 0) + 1
    })
    return counts
  }, [entries])

  const tiers = [
    {
      label:  'ADVANCED',
      topics: ADVANCED_TOPICS,
      color:  '#ef4444',
      bg:     'rgba(239,68,68,0.04)',
      border: 'rgba(239,68,68,0.15)',
      rule:   'rgba(239,68,68,0.2)'
    },
    {
      label:  'INTERMEDIATE',
      topics: INTERMEDIATE_TOPICS,
      color:  '#b4964a',
      bg:     'rgba(180,150,74,0.04)',
      border: 'rgba(180,150,74,0.15)',
      rule:   'rgba(180,150,74,0.2)'
    },
    {
      label:  'FUNDAMENTAL',
      topics: FUNDAMENTAL_TOPICS,
      color:  ACCENT,
      bg:     `${ACCENT}0a`,
      border: `${ACCENT}26`,
      rule:   `${ACCENT}33`
    },
  ]

  return (
    <GlassCard className="p-5 w-full overflow-y-auto" style={{ maxHeight: '340px' }}>
      <div className="flex flex-col gap-6">
        {tiers.map(tier => (
          <div key={tier.label}>
            {/* Tier header */}
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
                  background: `linear-gradient(to right, ${tier.rule}, transparent)`
                }}
              />
            </div>

            {/* Topic pills */}
            <div className="flex flex-wrap gap-[10px]">
              {tier.topics.map(topic => {
                const count = topicCounts[topic] || 0
                return (
                  <div
                    key={topic}
                    className="flex items-center gap-2 rounded-[8px] px-3 py-[6px] transition-all duration-200 cursor-default"
                    style={{
                      background: tier.bg,
                      border:     `0.5px solid ${tier.border}`,
                    }}
                  >
                    <span
                      className="font-sans text-[12px]"
                      style={{ color: 'rgba(200,208,224,0.9)' }}
                    >
                      {topic}
                    </span>
                    <span
                      className="font-mono text-[11px] font-bold"
                      style={{ color: tier.color }}
                    >
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}

// ── Graveyard node builder ────────────────────────────────────────────────────
// Pre-compute cx, cy, r, delay for BubbleChart
const FIXED_LAYOUT = [
  { cx: 380, cy: 170, delay: 0 },
  { cx: 560, cy: 130, delay: 1 },
  { cx: 220, cy: 190, delay: 2 },
  { cx: 650, cy: 230, delay: 3 },
  { cx: 310, cy: 260, delay: 4 },
  { cx: 130, cy: 120, delay: 5 },
  { cx: 710, cy: 110, delay: 6 },
]

const buildGraveyardNodes = (entries) => {
  // Group flagged entries by topic
  const flagged  = entries.filter(e => e.payload?.is_flagged)
  const byTopic  = {}

  flagged.forEach(e => {
    const topic = e.payload?.topic || 'Unknown'
    if (!byTopic[topic]) byTopic[topic] = []
    byTopic[topic].push(e)
  })

  const topics   = Object.entries(byTopic)
  const maxCount = Math.max(...topics.map(([, arr]) => arr.length), 1)

  return topics.slice(0, 7).map(([topic, topicEntries], i) => {
    // daysAgo = days since most recent flagged entry for this topic
    const dates  = topicEntries.map(e => new Date(e.date)).sort((a, b) => b - a)
    const latest = dates[0]
    const daysAgo = Math.floor((new Date() - latest) / (1000 * 60 * 60 * 24))

    const count = topicEntries.length
    const r     = 25 + (count / maxCount) * 40

    return {
      id:     topic,
      name:   topic,
      count,
      daysAgo,
      cx:     FIXED_LAYOUT[i]?.cx || 400,
      cy:     FIXED_LAYOUT[i]?.cy || 160,
      r,
      delay:  FIXED_LAYOUT[i]?.delay || 0,
    }
  })
}

// ── Main DSADeepDive Page ─────────────────────────────────────────────────────
const DSADeepDive = () => {
  const { widgetId }              = useParams()
  const dispatch                  = useDispatch()
  const [selectedTopic, setSelectedTopic] = useState(null)

  const { entries, loading }      = useWidgetEntries(widgetId)
  const {
    filteredEntries,
    dateFilter,
    setDateFilter,
    topicFilter,
    setTopicFilter,
  } = useDeepDiveFilter(entries)

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalSolved   = entries.length
  const currentStreak = useMemo(() => calcStreak(entries),       [entries])
  const bestStreak    = useMemo(() => calcBestStreak(entries),   [entries])
  const topPlatform   = useMemo(() =>
    getMostFrequent(entries.map(e => e.payload?.platform).filter(Boolean)),
    [entries]
  )
  const topTopic = useMemo(() =>
    getMostFrequent(entries.map(e => e.payload?.topic).filter(Boolean)),
    [entries]
  )

  // ── StatsBar data ─────────────────────────────────────────────────────────
  const stats = [
    { value: totalSolved,   label: 'TOTAL SOLVED',    color: ACCENT    },
    { value: `${currentStreak}d`, label: 'CURRENT STREAK', color: '#f59e0b' },
    { value: `${bestStreak}d`,   label: 'BEST STREAK',    color: '#f59e0b' },
    { value: topPlatform,   label: 'TOP PLATFORM',    color: '#22c55e' },
    { value: topTopic,      label: 'TOP TOPIC',       color: '#22c55e' },
  ]

  // ── Donut segments ────────────────────────────────────────────────────────
  const donutSegments = useMemo(() => {
    const easy   = entries.filter(e => e.payload?.difficulty === 'easy').length
    const medium = entries.filter(e => e.payload?.difficulty === 'medium').length
    const hard   = entries.filter(e => e.payload?.difficulty === 'hard').length
    return [
      { label: 'Easy',   count: easy   || 0, color: '#22c55e' },
      { label: 'Medium', count: medium || 0, color: ACCENT    },
      { label: 'Hard',   count: hard   || 0, color: '#ef4444' },
    ]
  }, [entries])

  // ── Heatmap data ──────────────────────────────────────────────────────────
  const heatmapData = useMemo(() =>
    entriesToHeatmapData(entries),
    [entries]
  )

  // ── Graveyard nodes ───────────────────────────────────────────────────────
  const graveyardNodes = useMemo(() =>
    buildGraveyardNodes(entries),
    [entries]
  )

  // ── RecentLog filtered rows ───────────────────────────────────────────────
  // If a graveyard topic is selected — show only flagged entries for that topic
  const logRows = useMemo(() => {
    if (selectedTopic) {
      return filteredEntries.filter(
        e => e.payload?.topic === selectedTopic && e.payload?.is_flagged
      )
    }
    return filteredEntries
  }, [filteredEntries, selectedTopic])

  // ── Open quick add modal ──────────────────────────────────────────────────
  const handleLogProblem = () => {
    dispatch(setActiveWidget(widgetId))
    dispatch(openModal('dsa'))
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

      {/* Page content */}
      <div className="relative z-10">

        {/* Header */}
        <DeepDiveHeader
          title="DSA Learning"
          subtitle="Track your progress, find your weak spots."
          accentColor={ACCENT}
          ctaLabel="Log Problem"
          onCta={handleLogProblem}
        />

        {/* Top accent line */}
        <div
          className="h-[2px] w-[40%]"
          style={{
            background: `linear-gradient(to right, ${ACCENT}, transparent)`
          }}
        />

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-6 pb-24 pt-6 flex flex-col gap-[14px]">

          {/* Stats Bar */}
          <StatsBar stats={stats} />

          {/* Fingerprint — Radar */}
          <div>
            <SectionLabel label="FINGERPRINT" />
            <WeaknessRadar entries={entries} />
          </div>

          {/* Report */}
          <div>
            <SectionLabel label="REPORT" />
            <ReportCardStrip entries={entries} />
          </div>

          {/* Activity Heatmap */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] items-stretch">

              {/* Donut */}
              <GlassCard className="p-5 flex flex-col items-center justify-center h-[340px]">
                {entries.length === 0 ? (
                  <p
                    className="font-sans text-[13px] italic text-center"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    No entries yet
                  </p>
                ) : (
                  <DonutChart
                    segments={donutSegments}
                    centerLabel="SOLVED"
                  />
                )}
              </GlassCard>

              {/* Topic breakdown */}
              <TopicBreakdown entries={entries} />

            </div>
          </div>

          {/* Graveyard — Bubble Chart */}
          <div>
            <SectionLabel label="GRAVEYARD" />
            {graveyardNodes.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p
                  className="font-sans text-[13px] italic"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  No flagged problems yet. Flag problems you want to revisit.
                </p>
              </GlassCard>
            ) : (
              <GlassCard className="p-5">
                <BubbleChart
                  nodes={graveyardNodes}
                  accentColor={ACCENT}
                  selectedId={selectedTopic}
                  onSelect={(id) => {
                    setSelectedTopic(id)
                    setTopicFilter(id)
                  }}
                />
              </GlassCard>
            )}
          </div>

          {/* Recent Log */}
          <RecentLog
            label="RECENT LOG"
            rows={logRows}
            accentColor={ACCENT}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            emptyMessage={
              selectedTopic
                ? `No flagged problems for "${selectedTopic}"`
                : 'No problems found for this date.'
            }
            recordCount={logRows.length}
            renderLeft={(row) => (
              <DifficultyBadge difficulty={row.payload?.difficulty} />
            )}
            renderMiddle={(row) => (
              <div className="flex flex-col overflow-hidden">
                <span
                  className="font-sans text-[12px] truncate"
                  style={{ color: 'rgba(154,160,176,0.9)' }}
                >
                  {row.payload?.problem_title || '—'}
                </span>
                {(row.payload?.is_bookmarked || row.payload?.is_flagged) && (
                  <div className="flex items-center gap-2 mt-1">
                    {row.payload?.is_bookmarked && (
                      <span
                        className="font-mono text-[9px]"
                        style={{ color: 'rgba(74,158,237,0.6)' }}
                      >
                        bookmarked
                      </span>
                    )}
                    {row.payload?.is_flagged && (
                      <span
                        className="font-mono text-[9px]"
                        style={{ color: 'rgba(239,68,68,0.6)' }}
                      >
                        in graveyard
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            renderRight={(row) => (
              <div className="flex flex-col items-end gap-[3px]">
                <span
                  className="font-mono text-[10px] rounded-[4px] px-[7px] py-[2px] leading-none"
                  style={{
                    color: `${ACCENT}b3`,
                    backgroundColor: `${ACCENT}14`
                  }}
                >
                  {row.payload?.platform || '—'}
                </span>
                <span
                  className="hidden sm:block font-mono text-[9px]"
                  style={{ color: 'rgba(45,55,72,0.9)' }}
                >
                  {row.payload?.topic || '—'}
                </span>
                <span
                  className="font-mono text-[9px]"
                  style={{ color: 'rgba(26,32,48,0.9)' }}
                >
                  {formatRelativeDate(row.date)}
                </span>
              </div>
            )}
          />

        </div>
      </div>
    </div>
  )
}

export default DSADeepDive