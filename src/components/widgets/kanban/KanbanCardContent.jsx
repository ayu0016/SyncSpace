// KanbanCardContent.jsx — stat content inside the Kanban widget card
// Props:
//   entries → array of ALL kanban task entries for this widget from supabase
//   accent  → widget.color

import { useAnalytics } from "../widgetUtils"

export default function KanbanCardContent({ widget }) {
  const { buckets, entries } = useAnalytics(widget)

  const todoTasks       = entries.filter(e => e.payload?.status === 'todo')
  const inProgressTasks = entries.filter(e => e.payload?.status === 'in_progress')
  const doneTasks       = entries.filter(e => e.payload?.status === 'done')

  const todoCount = todoTasks.length 
  const inProgressCount = inProgressTasks.length
  const doneCount = doneTasks.length
  const totalCount = entries.length

  const lastTaskTitle = buckets.latestEntry?.payload?.task_title || buckets.latestEntry?.payload?.title || '—'
  const lastTaskPriority = buckets.latestEntry?.payload?.priority ?? '—'

  // Priority badge colors
  const priorityColors = {
    high:   { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
    medium: { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b' },
    low:    { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
  }
  const priColor = priorityColors[lastTaskPriority] ?? priorityColors.medium

  return (
    <>
      {/* Stat grid — 2x2 */}
      <div className="grid grid-cols-2 gap-1.75 mb-3">

        <div className="bg-white/[0.04] rounded-[9px] p-[10px] border border-white/[0.04]">
          <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mb-1">To do</div>
          <div className="text-[19px] font-bold leading-none text-slate-300">{todoCount}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">pending</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px] border border-amber-500/10">
          <div className="text-[9px] text-amber-500/80 font-semibold uppercase tracking-widest mb-1">In progress</div>
          <div className="text-[19px] font-bold leading-none text-amber-400">{inProgressCount}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">active</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px] border border-emerald-500/10">
          <div className="text-[9px] text-emerald-500/80 font-semibold uppercase tracking-widest mb-1">Done</div>
          <div className="text-[19px] font-bold leading-none text-emerald-400">{doneCount}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">completed</div>
        </div>

        <div className="bg-white/[0.04] rounded-[9px] p-[10px] border border-white/[0.04]">
          <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mb-1">Total</div>
          <div className="text-[19px] font-bold leading-none text-slate-200">{totalCount}</div>
          <div className="text-[9px] text-slate-500 mt-[2px]">all tasks</div>
        </div>

      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.06] mb-3" />

      {/* Last updated task */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-slate-500">Last updated</span>
        <span className="text-[11px] text-slate-200 font-medium truncate max-w-[140px]">
          {lastTaskTitle}
        </span>
      </div>

      {/* Priority row */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-slate-500">Priority</span>
        <span
          className="text-[10px] font-semibold px-2 py-[1px] rounded-full capitalize"
          style={{ background: priColor.bg, color: priColor.text }}
        >
          {lastTaskPriority}
        </span>
      </div>
    </>
  )
}
