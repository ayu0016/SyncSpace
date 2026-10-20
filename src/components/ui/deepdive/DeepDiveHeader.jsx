import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { setActiveWidget } from '../../../store/uiSlice'

// title        → string e.g. "Gym", "DSA Learning", "ML Learning"
// subtitle     → string e.g. "Track every rep. Fuel every session."
// accentColor  → hex string e.g. "#f59e0b" / "#4a9eed" / "#8b5cf6"
// ctaLabel     → string e.g. "Log Session", "Log Problem"
// onCta        → function called when CTA button is clicked
// rightExtra   → optional ReactNode shown to LEFT of CTA
//                used by Gym for the settings gear icon

const DeepDiveHeader = ({
  title,
  subtitle,
  accentColor,
  ctaLabel,
  onCta,
  rightExtra = null,
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  return (
    <div
      className="sticky top-0 z-20 pt-5 px-6 pb-4"
      style={{
        background: 'rgba(10, 10, 15, 0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Main row */}
      <div className="flex items-center justify-between">

        {/* ── Left side — back nav + accent square + title ── */}
        <div className="flex items-center gap-3">

          {/* Back button */}
          <button
            onClick={() => {
              navigate('/dashboard')
              dispatch(setActiveWidget(null))
            }}
            data-tooltip-id="syncspace-tooltip"
            data-tooltip-content="Back to all trackers"
            className="flex items-center justify-center transition-colors duration-200 cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>

          {/* Accent square */}
          <div
            className="w-4 h-4 rounded-[4px] shrink-0"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 12px ${accentColor}66`
            }}
          />

          {/* Title + subtitle */}
          <div className="flex flex-col">
            <h1 className="font-sans font-bold text-[24px] text-white leading-none mb-1">
              {title}
            </h1>
            <p
              className="font-sans text-[13px] leading-none"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* ── Right side — rightExtra (gear icon etc) + CTA ── */}
        <div className="flex items-center gap-3">

          {/* Optional extra element e.g. gear icon for Gym goals panel */}
          {rightExtra && (
            <>
              {rightExtra}
              <div
                className="w-[1px] h-4 shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              />
            </>
          )}

          {/* CTA Button */}
          <button
            onClick={onCta}
            className="font-sans font-bold text-[13px] px-4 py-1.5 rounded-full transition-all duration-200 shrink-0 cursor-pointer"
            style={{
              backgroundColor: accentColor,
              color: '#0a0a0f',
              boxShadow: `0 0 12px ${accentColor}33`
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 0 20px ${accentColor}66`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = `0 0 12px ${accentColor}33`
            }}
          >
            {ctaLabel}
          </button>

        </div>
      </div>

      {/* Bottom divider */}
      <div
        className="h-[1px] w-full mt-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      />
    </div>
  )
}

export default DeepDiveHeader
