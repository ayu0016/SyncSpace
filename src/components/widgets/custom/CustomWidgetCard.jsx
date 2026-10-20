import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import GlassCard from '../../ui/GlassCard'
import CustomCardContent from './CustomCardContent'
import { openModal, setActiveWidget } from '../../../store/uiSlice'

export default function CustomWidgetCard({ widget }) {
  const accent = widget?.color || '#4a9eed'
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleCardClick = () => {
    dispatch(setActiveWidget(widget.id))
    navigate(`/widget/custom/${widget.id}`)
  }

  const handleLogClick = (e) => {
    e.stopPropagation()
    dispatch(openModal('custom'))
    dispatch(setActiveWidget(widget.id))
  }

  return (
    <div onClick={handleCardClick} className="cursor-pointer">
      <GlassCard
        accentColor={accent}
        className="p-4 relative flex flex-col font-sans hover:bg-white/6 transition-all duration-200"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4 mt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-[7px] flex items-center justify-center text-[13px] shrink-0"
              style={{ background: `${accent}25` }}
            >
              {widget.icon}
            </div>
            <span className="text-[13px] font-bold text-slate-200 truncate">
              {widget.name}
            </span>
          </div>

          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono"
            style={{ background: `${accent}20`, color: accent }}
          >
            Custom
          </span>
        </div>

        {/* Card Content */}
        <div className="flex-1">
          <CustomCardContent widget={widget} accent={accent} />
        </div>

        {/* Quick add button */}
        <button
          onClick={handleLogClick}
          className="w-full mt-3 py-2 rounded-[9px] text-[12px] font-bold transition-opacity hover:opacity-85 active:scale-[0.98]"
          style={{
            background: accent,
            color: ['#f59e0b', '#22c55e', '#06b6d4', '#84cc16'].includes(accent)
              ? '#0a0a0f'
              : '#ffffff',
          }}
        >
          + Log
        </button>
      </GlassCard>
    </div>
  )
}
