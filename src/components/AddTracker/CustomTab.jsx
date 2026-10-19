import { EMOJIS, ACCENT_COLORS } from './predefinedTracker'
import Input from '../Input'

export default function CustomTab({
  customName,
  setCustomName,
  customIcon,
  setCustomIcon,
  customColor,
  setCustomColor
}) {
  return (
    <div className="p-5 md:px-8 md:py-6 animate-slide-right">
      <div className="flex flex-col gap-5">

        {/* Tracker Name */}
        <Input
          label="Tracker Name"
          value={customName}
          onChange={e => setCustomName(e.target.value)}
          placeholder="Enter tracker name..."
        />

        {/* Icon Picker */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-outline">
            Icon
          </label>
          <div className="flex flex-wrap gap-2.5">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setCustomIcon(emoji)}
                className={`w-10.5 h-10.5 rounded-[10px] flex items-center justify-center text-[20px] transition-all duration-200 border ${
                  customIcon === emoji
                    ? 'bg-primary-container/10 border-primary-container/60 shadow-[0_0_10px_rgba(74,158,237,0.2)]'
                    : 'bg-surface-container border-white/6 hover:bg-surface-container-high'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-outline">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-4 items-center pt-2 pb-1">
            {ACCENT_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setCustomColor(color)}
                className={`w-7 h-7 rounded-full transition-all duration-200 border-2 ${
                  customColor === color
                    ? 'border-white scale-[1.15] shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                    : 'border-transparent hover:scale-[1.2]'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}