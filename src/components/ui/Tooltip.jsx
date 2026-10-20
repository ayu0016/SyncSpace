import { Tooltip as ReactTooltip } from 'react-tooltip'

/**
 * Reusable SyncSpace Tooltip component matching the dark-glass aesthetic.
 * Use data-tooltip-id="syncspace-tooltip" and data-tooltip-content="Your text" on elements.
 */
export default function Tooltip({
  id = 'syncspace-tooltip',
  place = 'top',
  className = '',
  style = {},
  children,
  ...props
}) {
  return (
    <ReactTooltip
      id={id}
      place={place}
      className={`!bg-[#0e131f]/95 !text-[#e2e8f0] !border !border-white/10 !rounded-lg !px-2.5 !py-1.5 !text-[11px] !font-mono !shadow-[0_8px_30px_rgba(0,0,0,0.6)] !backdrop-blur-md !z-[9999] ${className}`}
      style={{
        ...style
      }}
      {...props}
    >
      {children}
    </ReactTooltip>
  )
}
