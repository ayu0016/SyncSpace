// WidgetCard.jsx — reusable shell for all widget cards
// Props:
//   widget      → the widget object from supabase (has .name, .color, .type, .icon)
//   children    → the content component (DSACardContent, GymCardContent etc.)
//   buttonLabel → string e.g. "+ Log Problem"
//   onLogClick  → function to open the quick add modal

export default function WidgetCard({ widget, children, buttonLabel, onLogClick }) {
  // widget.color drives ALL accent styling on this card
  const accent = widget.color

  return (
    <div
      className="
        relative overflow-hidden
        rounded-[14px] bg-white/4 border border-white/8
        p-4 cursor-pointer
        transition-all duration-200
        hover:bg-white/6 hover:border-white/[0.14]
        font-['Plus_Jakarta_Sans']
        flex flex-col
      "
    >
      {/* Accent bar — top of card */}
      <div
        className="absolute top-0 left-0 right-0 h-0.75 rounded-t-[14px]"
        style={{ background: accent }}
      />

      {/* Card header */}
      <div className="flex items-center justify-between mb-4 mt-1">
        <div className="flex items-center gap-2">

          {/* Custom widgets get icon box, predefined get accent dot */}
          {widget.type === 'custom' ? (
            <div
              className="w-6 h-6 rounded-[7px] flex items-center justify-center text-[13px] shrink-0"
              style={{ background: `${accent}25` }}
            >
              {widget.icon}
            </div>
          ) : (
            <div
              className="w-1.75 h-1.75 rounded-full shrink-0"
              style={{ background: accent }}
            />
          )}

          {/* Widget name from supabase */}
          <span className="text-[13px] font-bold text-slate-200">
            {widget.name}
          </span>
        </div>

        {/* Badge — "Custom" for custom widgets, "Today" for predefined */}
        {widget.type === 'custom' ? (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
            style={{ background: `${accent}20`, color: accent }}
          >
            Custom
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-full text-slate-400 bg-white/6">
            Today
          </span>
        )}
      </div>

      {/* Widget specific content — flex-1 pushes button to bottom */}
      <div className="flex-1">
        {children}
      </div>

      {/* Quick add button — always pinned to bottom */}
      <button
        onClick={onLogClick}
        className="w-full py-2 rounded-[9px] text-[12px] font-bold transition-opacity hover:opacity-85 active:scale-[0.98]"
        style={{
          background: accent,
          // TODO: for light accent colors like amber use '#0a0a0f', for dark use '#ffffff'
          // hint: you can check luminance of accent color to decide text color dynamically
          color: ['#f59e0b', '#22c55e', '#06b6d4', '#84cc16'].includes(accent)
            ? '#0a0a0f'
            : '#ffffff'
        }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}