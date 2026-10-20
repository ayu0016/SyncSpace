import GlassCard from './GlassCard'

const StatsBar = ({ stats = [] }) => {
  return (
    <GlassCard className="w-full overflow-x-auto no-scrollbar">
      <div className="flex">
        {stats.map((stat, index) => {
          const str = stat.value != null ? String(stat.value) : ''
          const isLong = str.length > 6

          return (
            <div
              key={index}
              className="flex-1 min-w-0 px-4 py-4 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors duration-200 cursor-default"
              style={{
                borderLeft: index !== 0
                  ? '1px solid rgba(255,255,255,0.06)'
                  : 'none'
              }}
            >
              <div
                title={str}
                className={`w-full truncate text-center font-mono font-semibold mb-2 leading-none ${
                  isLong ? "text-[18px]" : "text-[28px]"
                }`}
                style={{
                  color: stat.color,
                  textShadow: `0 0 12px ${stat.color}99`,
                }}
              >
                {str}
              </div>
              <span
                className="font-mono text-[10px] uppercase tracking-widest mb-1.5"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {stat.label}
              </span>
              {stat.subtext && (
                <span className="text-[12px] text-[#22c55e]">
                  {stat.subtext}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}

export default StatsBar
