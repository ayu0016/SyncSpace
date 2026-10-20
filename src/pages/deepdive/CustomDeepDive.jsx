import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Pencil, Trash2 } from 'lucide-react'
import { openModal, setActiveWidget, setEditingEntryId } from '../../store/uiSlice'
import { removeEntry } from '../../store/entriesSlice'
import { entryService } from '../../supabase/entryServices'

// Hooks
import useWidgetEntries from '../../hooks/useWidgetEntries'
import useDeepDiveFilter from '../../hooks/useDeepDiveFilter'

// Utils
import {
  getTotalHours,
  getAvgRating,
  calcStreak,
  calcBestStreak,
  calcThisWeek,
  getTotalMinutesByDate,
  getWeeklyHours,
  getRatingTrend,
  getChoiceBreakdown,
  getNumberSeries,
  matchesKeyword,
  formatDuration,
} from '../../utils/customStats'
import { entriesToHeatmapData } from '../../utils/heatmapUtils'
import { formatRelativeDate } from '../../utils/dateUtils'
import { hexToRgba } from '../../utils/colorUtils'

// Shared UI components
import DeepDiveHeader from '../../components/ui/deepdive/DeepDiveHeader'
import SectionLabel from '../../components/ui/SectionLabel'
import StatsBar from '../../components/ui/StatsBar'
import GlassCard from '../../components/ui/GlassCard'
import ActivityHeatmap from '../../components/ui/deepdive/ActivityHeatmap'
import RecentLog from '../../components/ui/deepdive/RecentLog'
import TabSwitcher from '../../components/ui/TabSwitcher'
import BarChart from '../../components/ui/charts/BarChart'
import LineChart from '../../components/ui/charts/LineChart'
import DonutChart from '../../components/ui/charts/DonutChart'
import Button from '../../components/Button'

// ─── LOCAL SUB-COMPONENTS ──────────────────────────────────────────────────────

// Read-only 5-dot rating readout themed to accent color
const UnderstandingDots = ({ level = 0, color = '#4a9eed' }) => (
  <div className="flex gap-[3px] items-center">
    {[1, 2, 3, 4, 5].map(dot => (
      <div
        key={dot}
        className="w-[6px] h-[6px] rounded-full transition-colors duration-150"
        style={{
          background: dot <= level ? color : 'rgba(255,255,255,0.1)',
        }}
      />
    ))}
  </div>
)

// ─── MAIN DEEP DIVE PAGE ───────────────────────────────────────────────────────

export default function CustomDeepDive() {
  const { widgetId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const user = useSelector(state => state.auth.userData)
  const widgets = useSelector(state => state.widgets.widgets)
  const widget = widgets?.find(w => w.id === widgetId)

  // Fetch entries for this widget
  const { entries = [], loading, error } = useWidgetEntries(widgetId)

  // Filtering & search states
  const { filteredEntries: dateFilteredEntries, dateFilter, setDateFilter } = useDeepDiveFilter(entries)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingRowId, setDeletingRowId] = useState(null)

  // Active tab index for multiple choice or number fields
  const [activeChoiceIdx, setActiveChoiceIdx] = useState(0)
  const [activeNumberIdx, setActiveNumberIdx] = useState(0)

  // Page guard: redirect if widgets are loaded but widget is invalid or not custom
  useEffect(() => {
    if (widgets && widgets.length > 0 && (!widget || widget.type !== 'custom')) {
      navigate('/dashboard', { replace: true })
    }
  }, [widgets, widget, navigate])

  const accentColor = widget?.color || '#4a9eed'
  const customFields = useMemo(() => widget?.config?.fields || [], [widget?.config?.fields])

  // Subtitle: three field labels joined with middle dot
  const subtitle = useMemo(() => {
    if (!customFields.length) return 'Custom Tracker'
    return customFields.map(f => f.label).filter(Boolean).join(' · ')
  }, [customFields])

  // ─── STATS STRIP ─────────────────────────────────────────────────────────────
  const totalSessions = entries.length
  const thisWeekCount = useMemo(() => calcThisWeek(entries), [entries])
  const totalHours = useMemo(() => getTotalHours(entries), [entries])
  const currentStreak = useMemo(() => calcStreak(entries), [entries])
  const bestStreak = useMemo(() => calcBestStreak(entries), [entries])
  const avgRating = useMemo(() => getAvgRating(entries, entries.length), [entries])

  const stats = useMemo(() => [
    {
      value: totalSessions.toString(),
      label: 'TOTAL SESSIONS',
      color: accentColor,
      subtext: thisWeekCount > 0 ? `+${thisWeekCount} this week` : null,
    },
    {
      value: totalHours === '0' ? '0h' : `${totalHours}h`,
      label: 'TOTAL HOURS',
      color: accentColor,
    },
    {
      value: `${currentStreak}d`,
      label: 'CURRENT STREAK',
      color: accentColor,
    },
    {
      value: `${bestStreak}d`,
      label: 'BEST STREAK',
      color: accentColor,
    },
    {
      value: avgRating === '-' ? '-' : `${avgRating}/5`,
      label: 'AVG RATING',
      color: accentColor,
    },
  ], [totalSessions, thisWeekCount, totalHours, currentStreak, bestStreak, avgRating, accentColor])

  // ─── HEATMAP DATA ────────────────────────────────────────────────────────────
  const heatmapData = useMemo(() => entriesToHeatmapData(entries), [entries])
  const minutesByDate = useMemo(() => getTotalMinutesByDate(entries), [entries])

  // ─── PERFORMANCE CHARTS ──────────────────────────────────────────────────────
  const weeklyHours = useMemo(() => getWeeklyHours(entries, 8), [entries])
  const ratingTrend = useMemo(() => getRatingTrend(entries, 12), [entries])

  // ─── FIELD INSIGHTS CHARTS ───────────────────────────────────────────────────
  const choiceFields = useMemo(() => customFields.filter(f => f.type === 'choice'), [customFields])
  const numberFields = useMemo(() => customFields.filter(f => f.type === 'number'), [customFields])

  const activeChoiceField = choiceFields[activeChoiceIdx] || choiceFields[0]
  const activeNumberField = numberFields[activeNumberIdx] || numberFields[0]

  const choiceBreakdown = useMemo(() => {
    if (!activeChoiceField) return []
    return getChoiceBreakdown(entries, activeChoiceField.key, activeChoiceField.options)
  }, [entries, activeChoiceField])

  const donutSegments = useMemo(() => {
    const opacities = [1, 0.7, 0.5, 0.35, 0.22, 0.14]
    return choiceBreakdown.map((item, idx) => ({
      label: item.label,
      count: item.count,
      color: hexToRgba(accentColor, opacities[idx % opacities.length]),
    }))
  }, [choiceBreakdown, accentColor])

  const numberSeries = useMemo(() => {
    if (!activeNumberField) return []
    return getNumberSeries(entries, activeNumberField.key, 20)
  }, [entries, activeNumberField])

  // ─── RECENT LOG DATA ─────────────────────────────────────────────────────────
  const finalFilteredEntries = useMemo(() => {
    return dateFilteredEntries.filter(entry =>
      matchesKeyword(entry, customFields, searchQuery)
    )
  }, [dateFilteredEntries, customFields, searchQuery])

  // ─── HANDLERS ────────────────────────────────────────────────────────────────
  const handleCta = () => {
    dispatch(setActiveWidget(widgetId))
    dispatch(setEditingEntryId(null))
    dispatch(openModal('custom'))
  }

  const handleEdit = (row) => {
    dispatch(setActiveWidget(widgetId))
    dispatch(setEditingEntryId(row.id))
    dispatch(openModal('custom'))
  }

  const handleDelete = async (entryId) => {
    if (!user?.id) return
    try {
      // YOUR LOGIC:
      await entryService.deleteEntry(entryId, user.id)
      dispatch(removeEntry({ id: entryId, widget_id: widgetId }))
      setDeletingRowId(null)
    } catch (err) {
      console.error('Failed to delete entry:', err)
    }
  }

  // ─── LOADING STATE ───────────────────────────────────────────────────────────
  if (loading || !widgets) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-sans"
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

  // ─── ERROR STATE ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 font-sans"
        style={{ background: '#0a0a0f' }}
      >
        <GlassCard className="p-6 max-w-md w-full text-center">
          <p className="font-sans text-[14px] text-white/70 mb-4">
            Failed to load tracker entries.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </GlassCard>
      </div>
    )
  }

  if (!widget) return null

  // First text field (or first custom field) used as primary log line
  const firstTextField = customFields.find(f => f.type === 'text')
  const primaryFieldKey = firstTextField?.key || customFields[0]?.key

  return (
    <div
      className="min-h-screen relative font-sans"
      style={{ background: '#0a0a0f' }}
    >
      {/* Ambient background effects */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[800px] h-[800px] z-0"
        style={{
          background: `radial-gradient(ellipse at top right, ${hexToRgba(accentColor, 0.04)} 0%, transparent 65%)`
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
          backgroundImage:
            'repeating-linear-gradient(transparent, transparent 79px, rgba(255,255,255,0.018) 79px, rgba(255,255,255,0.018) 80px)',
        }}
      />

      <div className="relative z-10">

        {/* 4.1 Header */}
        <DeepDiveHeader
          title={widget.name}
          subtitle={subtitle}
          accentColor={accentColor}
          ctaLabel="Log Entry"
          onCta={handleCta}
        />

        {/* Top accent line */}
        <div
          className="h-[2px] w-[40%]"
          style={{
            background: `linear-gradient(to right, ${accentColor}, transparent)`,
          }}
        />

        <div className="max-w-5xl mx-auto px-6 pb-24 pt-6 flex flex-col gap-[14px]">

          {/* 4.2 Stats Bar */}
          <StatsBar stats={stats} />

          {/* 4.3 Activity Heatmap */}
          <div>
            <SectionLabel label="ACTIVITY" />
            <ActivityHeatmap
              data={heatmapData}
              accentColor={accentColor}
              renderTooltip={(day) => {
                const totalMinutes = minutesByDate[day.date] || 0
                const count = day.count || 0
                const sessionWord = count === 1 ? 'session' : 'sessions'
                return `${day.date} · ${count} ${sessionWord} · ${totalMinutes} min`
              }}
            />
          </div>

          {/* 4.4 Performance Charts */}
          <div>
            <SectionLabel label="PERFORMANCE" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              {/* Left: Hours Per Week */}
              <GlassCard className="p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-sans font-medium text-[14px] text-white">
                    Hours Per Week
                  </h3>
                </div>
                {entries.length === 0 ? (
                  <div className="h-44 flex items-center justify-center font-sans text-[12px] italic text-white/30">
                    No data yet
                  </div>
                ) : (
                  <BarChart
                    data={weeklyHours}
                    accentColor={accentColor}
                    unit="h"
                    height={180}
                  />
                )}
              </GlassCard>

              {/* Right: Rating Trend */}
              <GlassCard className="p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-sans font-medium text-[14px] text-white">
                    Rating Trend
                  </h3>
                </div>
                {ratingTrend.length < 2 ? (
                  <div className="h-44 flex items-center justify-center font-sans text-[12px] italic text-white/30">
                    No data yet
                  </div>
                ) : (
                  <LineChart
                    data={ratingTrend}
                    accentColor={accentColor}
                    height={180}
                  />
                )}
              </GlassCard>

            </div>
          </div>

          {/* 4.5 Field Insights (Omitted if no choice or number fields) */}
          {(choiceFields.length > 0 || numberFields.length > 0) && (
            <div>
              <SectionLabel label="FIELD INSIGHTS" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">

                {/* Choice Field Breakdown */}
                {choiceFields.length > 0 && (
                  <GlassCard
                    className={`p-5 flex flex-col justify-between ${
                      numberFields.length === 0 ? 'col-span-1 md:col-span-2' : ''
                    }`}
                  >
                    <div>
                      {/* Card Title or TabSwitcher */}
                      {choiceFields.length > 1 ? (
                        <div className="mb-4">
                          <TabSwitcher
                            tabs={choiceFields.map(f => f.label)}
                            activeTab={activeChoiceField.label}
                            onChange={(lbl) => {
                              const idx = choiceFields.findIndex(f => f.label === lbl)
                              if (idx !== -1) setActiveChoiceIdx(idx)
                            }}
                            accentColor={accentColor}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-sans font-medium text-[14px] text-white">
                            {activeChoiceField.label}
                          </h3>
                        </div>
                      )}

                      {entries.length === 0 || donutSegments.every(s => s.count === 0) ? (
                        <div className="h-44 flex items-center justify-center font-sans text-[12px] italic text-white/30">
                          No data yet
                        </div>
                      ) : (
                        <DonutChart
                          segments={donutSegments}
                          centerLabel="SESSIONS"
                        />
                      )}
                    </div>
                  </GlassCard>
                )}

                {/* Number Field Trend */}
                {numberFields.length > 0 && (
                  <GlassCard
                    className={`p-5 flex flex-col justify-between ${
                      choiceFields.length === 0 ? 'col-span-1 md:col-span-2' : ''
                    }`}
                  >
                    <div>
                      {/* Card Title or TabSwitcher */}
                      {numberFields.length > 1 ? (
                        <div className="mb-4">
                          <TabSwitcher
                            tabs={numberFields.map(f => f.label)}
                            activeTab={activeNumberField.label}
                            onChange={(lbl) => {
                              const idx = numberFields.findIndex(f => f.label === lbl)
                              if (idx !== -1) setActiveNumberIdx(idx)
                            }}
                            accentColor={accentColor}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-sans font-medium text-[14px] text-white">
                            {activeNumberField.label}
                            {activeNumberField.unit ? ` (${activeNumberField.unit})` : ''}
                          </h3>
                        </div>
                      )}

                      {numberSeries.length < 2 ? (
                        <div className="h-44 flex items-center justify-center font-sans text-[12px] italic text-white/30">
                          No data yet
                        </div>
                      ) : (
                        <LineChart
                          data={numberSeries}
                          accentColor={accentColor}
                          unit={activeNumberField.unit || ''}
                          height={180}
                        />
                      )}
                    </div>
                  </GlassCard>
                )}

              </div>
            </div>
          )}

          {/* 4.6 Recent Log */}
          <RecentLog
            label="RECENT LOG"
            rows={finalFilteredEntries}
            accentColor={accentColor}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
            emptyMessage="No entries match the current filter."
            recordCount={finalFilteredEntries.length}
            headerExtra={
              <div className="relative w-36 sm:w-44">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search log..."
                  className="w-full bg-transparent font-sans text-[11px] outline-none border rounded-[6px] pl-2 pr-6 py-1 transition-colors duration-200"
                  style={{
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.85)',
                  }}
                  onFocus={e => (e.target.style.borderColor = accentColor)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-white/40 hover:text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            }
            renderLeft={(row) => (
              <span
                className="font-mono text-[11px] shrink-0"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {formatRelativeDate(row.date)}
              </span>
            )}
            renderMiddle={(row) => {
              const primaryVal = row.payload?.[primaryFieldKey] || '—'
              const otherFields = customFields.filter(f => f.key !== primaryFieldKey)

              return (
                <div className="flex flex-col min-w-0">
                  {/* Primary text / first custom field value */}
                  <span className="font-sans text-[13px] text-white truncate">
                    {primaryVal}
                  </span>

                  {/* Secondary custom field chips */}
                  {otherFields.length > 0 && (
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {otherFields.map(f => {
                        const val = row.payload?.[f.key]
                        if (val === undefined || val === null || val === '') return null
                        return (
                          <span
                            key={f.key}
                            className="font-mono text-[10px] text-[#94a3b8]"
                          >
                            {f.label}: {val}{f.unit ? ` ${f.unit}` : ''}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Notes line */}
                  {row.payload?.notes && (
                    <span className="font-sans text-[11px] italic mt-[2px] truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {row.payload.notes}
                    </span>
                  )}
                </div>
              )
            }}
            renderRight={(row) => {
              // Delete confirmation mode
              if (deletingRowId === row.id) {
                return (
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-white/60">Delete?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      className="text-[#ef4444] hover:underline font-bold px-1"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingRowId(null)}
                      className="text-white/40 hover:text-white px-1"
                    >
                      No
                    </button>
                  </div>
                )
              }

              return (
                <div className="flex items-center gap-3">
                  {/* Duration */}
                  <span className="font-mono text-[11px] text-white/50">
                    {formatDuration(row.payload?.duration_mins)}
                  </span>

                  {/* Rating dots */}
                  <UnderstandingDots
                    level={Number(row.payload?.rating) || 0}
                    color={accentColor}
                  />

                  {/* Row Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(row)}
                      className="p-1 text-[#475569] hover:text-white transition-colors duration-150 rounded"
                      title="Edit entry"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingRowId(row.id)}
                      className="p-1 text-[#475569] hover:text-[#ef4444] transition-colors duration-150 rounded"
                      title="Delete entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            }}
          />

        </div>
      </div>
    </div>
  )
}
