import TrackerCard from "./TrackerCard.jsx"
import { predefinedTrackers } from "./predefinedTracker"
export default function BuiltInTab({ selectedCard, onSelect }) {
  return (
    <div className="p-5 md:px-8 md:py-6 animate-slide-left">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {predefinedTrackers.map(tracker => (
          <TrackerCard
            key={tracker.id}
            tracker={tracker}
            selected={selectedCard === tracker.id}
            onSelect={onSelect}
          />
        ))}
      </div>
      <p className="text-center text-[10px] text-white/20 italic mt-3">
        hover to preview · click to select
      </p>
    </div>
  )
}