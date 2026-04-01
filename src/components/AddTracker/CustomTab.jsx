import { EMOJIS, ACCENT_COLORS } from './predefinedTracker'

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
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-extrabold tracking-[0.15em] uppercase text-outline">
            Tracker Name
          </label>
          <input
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            placeholder="Enter tracker name..."
            className="w-full bg-[#1a1a2e] border border-white/10 rounded-[10px] px-3.5 py-2.5 text-[13px] text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-primary-container/50 focus:shadow-[0_0_0_2px_rgba(74,158,237,0.1)]"
          />
        </div>

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