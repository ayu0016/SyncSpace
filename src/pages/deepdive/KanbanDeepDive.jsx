import { useState, useMemo } from 'react'
import { useDispatch ,useSelector} from 'react-redux'
import { format } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import { openModal, setActiveWidget } from '../../store/uiSlice'
import { updateEntry } from '../../store/entriesSlice'
import useWidgetEntries from '../../hooks/useWidgetEntries'
import { entryService } from '../../supabase/entryServices'
import { formatShortDate } from '../../utils/dateUtils'
import DeepDiveHeader from '../../components/ui/deepdive/DeepDiveHeader'
import SectionLabel from '../../components/ui/SectionLabel'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ACCENT = '#22c55e'

const COLUMNS = [
  { id: 'todo',        label: 'TO DO',       accent: '#f59e0b' },
  { id: 'in_progress', label: 'IN PROGRESS', accent: '#4a9eed' },
  { id: 'done',        label: 'DONE',        accent: '#22c55e' },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const isOverdue = (dueDateStr) => {
  if (!dueDateStr) return false
  return new Date(dueDateStr) < new Date()
}

// ─── PAGE-SPECIFIC COMPONENTS ────────────────────────────────────────────────

// Custom SVG bars icon for In Progress insight card
const ProgressIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="3" width="4" height="10" rx="1" fill="#4a9eed" />
    <rect x="9" y="6" width="4" height="7" rx="1" fill="#4a9eed" fillOpacity="0.4" />
  </svg>
)

// Animated SVG completion ring for Completion Rate insight card
const CompletionRingIcon = ({ percentage }) => {
  const radius       = 6
  const circumference = 2 * Math.PI * radius
  const offset       = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background ring */}
        <circle
          cx="8" cy="8" r="6"
          stroke="#22c55e"
          strokeWidth="2"
          fill="none"
          strokeOpacity="0.2"
        />
        {/* Progress ring */}
        <circle
          cx="8" cy="8" r="6"
          stroke="#22c55e"
          strokeWidth="2"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span
        className="absolute font-mono font-bold"
        style={{ fontSize: '5px', color: '#22c55e' }}
      >
        {percentage}
      </span>
    </div>
  )
}

// Priority badge — right side of task card title row
const PriorityBadge = ({ priority, isDone }) => {
  const styles = isDone
    ? {
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.25)',
        label: priority === 'medium' ? 'Med' : priority?.charAt(0).toUpperCase() + priority?.slice(1)
      }
    : {
        high:   { background: 'rgba(239,68,68,0.12)',   color: '#f87171',              label: 'High' },
        medium: { background: 'rgba(245,158,11,0.12)',  color: '#f59e0b',              label: 'Med'  },
        low:    { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', label: 'Low' },
      }[priority?.toLowerCase()] || { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', label: priority }

  return (
    <span
      className="shrink-0 font-mono font-semibold"
      style={{
        background:   styles.background,
        color:        styles.color,
        fontSize:     '9px',
        borderRadius: '4px',
        padding:      '2px 6px',
      }}
    >
      {styles.label}
    </span>
  )
}

// Individual task card — draggable
const TaskCard = ({ entry, onDragStart, onDragEnd }) => {
  const { payload } = entry
  const isDone       = payload.status === 'done'
  const isTaskOverdue = !isDone && isOverdue(payload.due_date)

  // Base card style
  let borderColor = 'rgba(255,255,255,0.06)'
  let background  = 'rgba(255,255,255,0.025)'
  let boxShadow   = 'none'
  let opacity     = 1

  if (isDone) {
    borderColor = 'rgba(34,197,94,0.15)'
    background  = 'rgba(34,197,94,0.02)'
    opacity     = 0.75
  } else if (isTaskOverdue) {
    borderColor = 'rgba(239,68,68,0.4)'
    background  = 'rgba(239,68,68,0.03)'
    boxShadow   = '0 0 0 1px rgba(239,68,68,0.15)'
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', entry.id)
        e.dataTransfer.effectAllowed = 'move'
        // Delay so drag image snapshots normal state
        setTimeout(() => {
          e.target.style.opacity = '0.4'
          e.target.style.borderStyle = 'dashed'
        }, 0)
        onDragStart(entry)
      }}
      onDragEnd={(e) => {
        e.target.style.opacity = ''
        e.target.style.borderStyle = ''
        onDragEnd()
      }}
      className="rounded-[10px] mb-[8px] transition-all duration-150 cursor-grab active:cursor-grabbing"
      style={{
        background,
        border:    `1px solid ${borderColor}`,
        boxShadow,
        opacity,
        padding:   '12px',
      }}
      onMouseEnter={(e) => {
        if (!isDone && !isTaskOverdue) {
          e.currentTarget.style.background   = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.borderColor  = 'rgba(255,255,255,0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDone && !isTaskOverdue) {
          e.currentTarget.style.background  = background
          e.currentTarget.style.borderColor = borderColor
        }
      }}
    >
      {/* Row 1 — Title + Priority Badge */}
      <div className="flex justify-between items-start gap-2 mb-1">
        <h3
          className="font-sans font-medium text-[13px] leading-snug"
          style={{
            color:          isDone ? 'rgba(255,255,255,0.3)' : '#f1f5f9',
            textDecoration: isDone ? 'line-through' : 'none',
            display:        '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow:        'hidden',
            margin:          0,
          }}
        >
          {payload.task_title || 'Untitled Task'}
        </h3>
        <PriorityBadge priority={payload.priority} isDone={isDone} />
      </div>

      {/* Row 2 — Optional description */}
      {payload.description && (
        <p
          className="font-sans text-[11px] mt-1 mb-0"
          style={{
            color:        isDone ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
            whiteSpace:   'nowrap',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {payload.description}
        </p>
      )}

      {/* Row 3 — Tags */}
      {payload.tags && payload.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {payload.tags.map((tag, i) => (
            <span
              key={i}
              className="font-mono"
              style={{
                fontSize:     '9px',
                background:   isDone ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
                color:        isDone ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                borderRadius: '4px',
                padding:      '2px 6px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Row 4 — Due date / status */}
      <div className="flex items-center mt-2">
        {isDone ? (
          <span
            className="font-mono text-[10px]"
            style={{ color: '#22c55e' }}
          >
            Done{payload.completed_date ? ` · ${formatShortDate(payload.completed_date)}` : ''}
          </span>
        ) : isTaskOverdue ? (
          <span
            className="font-mono text-[10px] flex items-center gap-[5px]"
            style={{ color: '#ef4444' }}
          >
            <span
              className="rounded-full shrink-0"
              style={{
                width:      '5px',
                height:     '5px',
                background: '#ef4444',
                display:    'inline-block',
              }}
            />
            Overdue · {payload.due_date ? formatShortDate(payload.due_date) : '—'}
          </span>
        ) : (
          <span
            className="font-mono text-[10px]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {payload.due_date ? `Due ${formatShortDate(payload.due_date)}` : 'No due date'}
          </span>
        )}
      </div>
    </div>
  )
}

// Kanban column — drop zone + task list
const KanbanColumn = ({ column, tasks, onDrop, onDragStart, onDragEnd }) => {
  const [isDragOver, setIsDragOver] = useState(false)

  // Unique scrollbar class per column
  const scrollClass = `kanban-scroll-${column.id}`

  return (
    <div
      className="rounded-[12px] overflow-hidden flex flex-col"
      style={{
        background:      isDragOver ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        backdropFilter:  'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border:          `1px solid ${isDragOver ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
        minHeight:       '400px',
        transition:      'background 200ms ease, border-color 200ms ease',
      }}
    >
      {/* Custom scrollbar style per column */}
      <style>{`
        .${scrollClass}::-webkit-scrollbar { width: 3px; }
        .${scrollClass}::-webkit-scrollbar-track { background: transparent; }
        .${scrollClass}::-webkit-scrollbar-thumb {
          background: ${column.accent}4d;
          border-radius: 2px;
        }
        .${scrollClass}::-webkit-scrollbar-thumb:hover {
          background: ${column.accent}80;
        }
      `}</style>

      {/* Column Header */}
      <div
        style={{
          borderTop:    `2px solid ${column.accent}`,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background:   'rgba(255,255,255,0.01)',
          padding:      '12px 14px',
          display:      'flex',
          justifyContent: 'space-between',
          alignItems:   'center',
        }}
      >
        <h2
          className="font-sans font-semibold"
          style={{
            fontSize:      '12px',
            letterSpacing: '0.04em',
            color:         'rgba(255,255,255,0.9)',
            margin:        0,
          }}
        >
          {column.label}
        </h2>
        <span
          className="font-mono font-semibold"
          style={{
            fontSize:     '11px',
            background:   `${column.accent}26`,
            color:        column.accent,
            borderRadius: '20px',
            padding:      '2px 8px',
          }}
        >
          {tasks.length}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        className={`flex-1 overflow-y-auto ${scrollClass}`}
        style={{ padding: '10px' }}
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          const entryId = e.dataTransfer.getData('text/plain')
          onDrop(entryId, column.id)
        }}
      >
        {tasks.length === 0 ? (
          // Empty state
          <div
            className="flex flex-col items-center justify-center gap-2"
            style={{ minHeight: '120px', height: '100%' }}
          >
            <div
              style={{
                width:        '16px',
                height:       '16px',
                border:       '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '3px',
              }}
            />
            <span
              className="font-mono text-[11px]"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              No tasks
            </span>
          </div>
        ) : (
          tasks.map(entry => (
            <TaskCard
              key={entry.id}
              entry={entry}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Insight card — generic reusable within this page
const InsightCard = ({ label, value, accentColor, bgColor, borderColor, Icon }) => (
  <div
    className="rounded-[12px] flex items-center gap-[14px]"
    style={{
      background:  'rgba(255,255,255,0.025)',
      border:      `1px solid ${borderColor}`,
      padding:     '16px 20px',
      backdropFilter: 'blur(12px)',
    }}
  >
    <div
      className="shrink-0 flex items-center justify-center rounded-[8px]"
      style={{
        width:     '36px',
        height:    '36px',
        background: bgColor,
      }}
    >
      <Icon />
    </div>
    <div>
      <p
        className="font-sans uppercase"
        style={{
          fontSize:      '11px',
          letterSpacing: '0.06em',
          color:         'rgba(255,255,255,0.4)',
          margin:        '0 0 2px 0',
        }}
      >
        {label}
      </p>
      <p
        className="font-mono font-bold leading-none"
        style={{
          fontSize:   '28px',
          color:      accentColor,
          margin:     0,
          textShadow: `0 0 16px ${accentColor}80`,
        }}
      >
        {value}
      </p>
    </div>
  </div>
)

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const KanbanDeepDive = () => {
  const widgetId= useSelector(state => state.ui.activeWidgetId)
  const dispatch     = useDispatch()

  const { entries, loading } = useWidgetEntries(widgetId)
  const [filter, setFilter]  = useState('All')
  const [draggingEntry, setDraggingEntry] = useState(null)

  // ── Filtering ──
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (filter === 'Overdue') {
        return entry.payload.status !== 'done' &&
          entry.payload.due_date &&
          new Date(entry.payload.due_date) < new Date()
      }
      if (filter === 'High Priority') {
        return entry.payload.priority === 'high'
      }
      return true
    })
  }, [entries, filter])

  const todoEntries       = filteredEntries.filter(e => e.payload.status === 'todo')
  const inProgressEntries = filteredEntries.filter(e => e.payload.status === 'in_progress')
  const doneEntries       = filteredEntries.filter(e => e.payload.status === 'done')

  // ── Insight stats (always from full unfiltered entries) ──
  const totalTasks       = entries.length
  const doneTasks        = entries.filter(e => e.payload.status === 'done').length
  const inProgressTasks  = entries.filter(e => e.payload.status === 'in_progress').length
  const overdueTasks     = entries.filter(e =>
    e.payload.status !== 'done' &&
    e.payload.due_date &&
    new Date(e.payload.due_date) < new Date()
  ).length
  const completionRate   = totalTasks > 0
    ? Math.round((doneTasks / totalTasks) * 100)
    : 0

  // ── Drag and drop handler ──
  const handleDrop = async (entryId, targetStatus) => {
    const entry = entries.find(e => e.id === entryId)
    if (!entry) return
    if (entry.payload.status === targetStatus) return

    const newPayload = { ...entry.payload, status: targetStatus }

    // Moving TO done — record completed date
    if (targetStatus === 'done') {
      newPayload.completed_date = format(new Date(), 'yyyy-MM-dd')
    }

    // Moving OUT OF done — clear completed date
    if (entry.payload.status === 'done' && targetStatus !== 'done') {
      newPayload.completed_date = null
    }

    // Optimistic update in Redux
    dispatch(updateEntry({
      widget_id: widgetId,
      entry: { ...entry, payload: newPayload }
    }))

    // Persist to Supabase
    try {
      await entryService.updateEntry(entry.id, newPayload)
    } catch (err) {
      // Revert on failure
      dispatch(updateEntry({
        widget_id: widgetId,
        entry
      }))
    }
  }

  const handleCta = () => {
    dispatch(setActiveWidget(widgetId))
    dispatch(openModal('kanban'))
  }

  // ── Loading state ──
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
      {/* ── Ambient background effects ── */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[800px] h-[800px] z-0"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(34,197,94,0.04) 0%, transparent 65%)'
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

      {/* ── Page content ── */}
      <div className="relative z-10">

        {/* Header */}
        <DeepDiveHeader
          title="Kanban"
          subtitle="Your tasks. Your board. Your pace."
          accentColor={ACCENT}
          ctaLabel="Add Task"
          onCta={handleCta}
        />

        <div className="max-w-5xl mx-auto px-6 pb-24 pt-4 flex flex-col gap-[14px]">

          {/* ── Filter Bar ── */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Overdue', 'High Priority'].map(f => {
              const isActive = filter === f
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="font-sans font-medium transition-all duration-200 cursor-pointer"
                  style={{
                    fontSize:     '12px',
                    padding:      '5px 14px',
                    borderRadius: '20px',
                    border:       `1px solid ${isActive ? ACCENT : 'rgba(255,255,255,0.08)'}`,
                    background:   isActive ? 'rgba(34,197,94,0.12)' : 'transparent',
                    color:        isActive ? '#4ade80' : 'rgba(255,255,255,0.35)',
                    boxShadow:    isActive ? '0 0 12px rgba(34,197,94,0.15)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
                    }
                  }}
                >
                  {f}
                </button>
              )
            })}
          </div>

          {/* ── Board ── */}
          {entries.length === 0 ? (
            // Empty state — no tasks at all
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-[12px]"
              style={{
                minHeight:  '400px',
                background: 'rgba(255,255,255,0.02)',
                border:     '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                style={{
                  width:        '32px',
                  height:       '32px',
                  border:       '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                }}
              />
              <p
                className="font-sans text-[16px]"
                style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}
              >
                No tasks yet
              </p>
              <p
                className="font-sans text-[13px]"
                style={{ color: 'rgba(255,255,255,0.2)', margin: 0 }}
              >
                Add your first task to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-[14px] items-start">
              <KanbanColumn
                column={COLUMNS[0]}
                tasks={todoEntries}
                onDrop={handleDrop}
                onDragStart={setDraggingEntry}
                onDragEnd={() => setDraggingEntry(null)}
              />
              <KanbanColumn
                column={COLUMNS[1]}
                tasks={inProgressEntries}
                onDrop={handleDrop}
                onDragStart={setDraggingEntry}
                onDragEnd={() => setDraggingEntry(null)}
              />
              <KanbanColumn
                column={COLUMNS[2]}
                tasks={doneEntries}
                onDrop={handleDrop}
                onDragStart={setDraggingEntry}
                onDragEnd={() => setDraggingEntry(null)}
              />
            </div>
          )}

          {/* ── Insights Strip ── */}
          <div>
            <SectionLabel label="INSIGHTS" />
            <div className="grid grid-cols-3 gap-[14px]">

              {/* Overdue */}
              <InsightCard
                label="Overdue"
                value={overdueTasks}
                accentColor="#ef4444"
                bgColor="rgba(239,68,68,0.1)"
                borderColor="rgba(239,68,68,0.2)"
                Icon={() => <AlertCircle size={16} color="#ef4444" />}
              />

              {/* In Progress */}
              <InsightCard
                label="In Progress"
                value={inProgressTasks}
                accentColor="#4a9eed"
                bgColor="rgba(74,158,237,0.1)"
                borderColor="rgba(74,158,237,0.2)"
                Icon={ProgressIcon}
              />

              {/* Completion Rate */}
              <div
                className="rounded-[12px] flex items-center gap-[14px] relative overflow-hidden"
                style={{
                  background:  'linear-gradient(135deg, rgba(255,255,255,0.025), rgba(34,197,94,0.04))',
                  border:      '1px solid rgba(34,197,94,0.2)',
                  padding:     '16px 20px',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Background flare */}
                <div
                  className="pointer-events-none absolute"
                  style={{
                    top:          '-50%',
                    right:        '-10%',
                    width:        '100px',
                    height:       '100px',
                    background:   '#22c55e',
                    borderRadius: '50%',
                    filter:       'blur(50px)',
                    opacity:      0.08,
                  }}
                />

                {/* Icon */}
                <div
                  className="shrink-0 flex items-center justify-center rounded-[8px]"
                  style={{
                    width:     '36px',
                    height:    '36px',
                    background: 'rgba(34,197,94,0.1)',
                    boxShadow:  '0 0 10px rgba(34,197,94,0.2)',
                  }}
                >
                  <CompletionRingIcon percentage={completionRate} />
                </div>

                {/* Text */}
                <div className="relative z-10">
                  <p
                    className="font-sans uppercase"
                    style={{
                      fontSize:      '11px',
                      letterSpacing: '0.06em',
                      color:         'rgba(34,197,94,0.8)',
                      margin:        '0 0 2px 0',
                    }}
                  >
                    Completion
                  </p>
                  <p
                    className="font-mono font-semibold leading-none"
                    style={{
                      fontSize:   '28px',
                      color:      '#4ade80',
                      margin:     0,
                      filter:     'drop-shadow(0 0 8px rgba(34,197,94,0.4))',
                    }}
                  >
                    {completionRate}%
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default KanbanDeepDive