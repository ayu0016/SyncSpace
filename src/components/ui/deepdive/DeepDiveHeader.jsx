import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

const DeepDiveHeader = ({
  title,
  subtitle,
  accentColor,
  ctaLabel,
  onCta,
  rightExtra = null,
}) => {
  const navigate = useNavigate()

  return (
    <div
      className="sticky top-0 z-20 pt-5 px-6 pb-4"
      style={{
        background: 'rgba(10, 10, 15, 0.90)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between">

        {/* Left — back nav + identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="transition-colors duration-200 cursor-pointer"
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
          <div>
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

        {/* Right — optional extra + CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCta}
            className="font-sans font-bold text-[13px] px-4 py-1.5 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: accentColor,
              color: '#0a0a0f',
              boxShadow: `0 0 12px ${accentColor}33`
            }}
          >
            {ctaLabel}
          </button>

          {rightExtra && (
            <>
              <div
                className="w-[1px] h-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              />
              {rightExtra}
            </>
          )}
        </div>

      </div>

      {/* Bottom border */}
      <div
        className="h-[1px] w-full mt-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      />
    </div>
  )
}

export default DeepDiveHeader