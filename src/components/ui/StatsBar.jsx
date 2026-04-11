import GlassCard from './GlassCard'

const StatsBar = ({ stats = [] }) => {
  return (
    <GlassCard className="w-full overflow-x-auto no-scrollbar">
      <div className="flex divide-x divide-white/[0.06]">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex-1 min-w-[130px] py-5 px-4 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors duration-200 cursor-default"
          >
            <span
              className="font-mono font-bold text-[28px] leading-none mb-2"
              style={{
                color: stat.color,
                textShadow: `0 0 16px ${stat.color}60`
              }}
            >
              {stat.value}
            </span>
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
        ))}
      </div>
    </GlassCard>
  )
}

export default StatsBar