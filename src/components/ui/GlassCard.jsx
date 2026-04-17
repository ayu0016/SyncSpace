// GlassCard — base glassmorphism wrapper used by every section across all deep dive pages
// Props:
// className    → additional Tailwind classes for padding, width, margin etc
// children     → any React nodes
// accentColor  → optional hex string, adds colored top border e.g. "#f59e0b" for Gym goals panel
// isDragOver   → optional boolean, brightens glass surface during drag-and-drop hover
//                defaults to false — zero effect on all existing usages in DSA/Gym/ML pages

const GlassCard = ({
  children,
  className = '',
  accentColor = null,
  isDragOver = false,
}) => {
  return (
    <div
      className={`rounded-[12px] ${className}`}
      style={{
        background:           isDragOver
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.025)',
        backdropFilter:       'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border:               `1px solid ${isDragOver
          ? 'rgba(255,255,255,0.10)'
          : 'rgba(255,255,255,0.06)'
        }`,
        transition:           'background 200ms ease, border-color 200ms ease',
        ...(accentColor && {
          borderTop: `2px solid ${accentColor}`,
        })
      }}
    >
      {children}
    </div>
  )
}

export default GlassCard