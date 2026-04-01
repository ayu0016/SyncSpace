import { Code2, Dumbbell, BrainCircuit, KanbanSquare } from 'lucide-react'

const iconMap = {
  dsa: Code2,
  gym: Dumbbell,
  ml: BrainCircuit,
  kanban: KanbanSquare
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function TrackerCard({ tracker, selected, onSelect }) {
  const Icon = iconMap[tracker.id]

  return (
    <div
      className="relative w-full h-27.5 md:h-32.5 group cursor-pointer"
      style={{ perspective: '900px' }}
      onClick={() => onSelect(tracker.id)}
    >

      {/* Selected overlay — outside flipper so it stays visible on hover */}
      {selected && (
        <div
          className="absolute inset-0 z-20 pointer-events-none rounded-xl transition-all duration-300"
          style={{
            border: `1px solid ${tracker.color}`,
            boxShadow: `0 0 0 1px ${tracker.color}, 0 0 20px ${hexToRgba(tracker.color, 0.3)}`
          }}
        >
          <div
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: tracker.color }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>
      )}

      {/* Flipper */}
      <div
        className="w-full h-full relative transition-transform duration-450 ease-in-out group-hover:transform-[rotateY(180deg)]"
        style={{ transformStyle: 'preserve-3d' }}
      >

        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl p-3 md:p-4 flex items-center gap-3 bg-surface-container-lowest border border-white/6"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div
            className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: hexToRgba(tracker.color, 0.15),
              color: tracker.color
            }}
          >
            <Icon size={20} strokeWidth={2.5} />
          </div>
          <div className="overflow-hidden">
            <span className="block text-[14px] font-bold text-on-surface truncate leading-tight">
              {tracker.name}
            </span>
            <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-widest uppercase bg-white/8 text-on-surface-variant">
              {tracker.category}
            </span>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl p-3 md:p-3.5 flex flex-col justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: '#13131e',
            border: `1px solid ${hexToRgba(tracker.color, 0.2)}`
          }}
        >
          <span
            className="text-[10px] font-bold tracking-widest uppercase mb-2 block"
            style={{ color: tracker.color }}
          >
            Features
          </span>
          <ul className="flex flex-col gap-1">
            {tracker.features.map((feature, idx) => (
              <li key={idx} className="text-[11px] text-on-surface-variant leading-normal flex items-start gap-1.5">
                <span className="mt-1 text-[8px] shrink-0" style={{ color: tracker.color }}>●</span>
                <span className="truncate flex-1">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  )
}