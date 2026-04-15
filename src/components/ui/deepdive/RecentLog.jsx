import GlassCard from '../GlassCard'
import SectionLabel from '../SectionLabel'

const RecentLog = ({
  label,
  rows = [],
  accentColor,
  dateFilter,
  onDateChange,
  renderLeft,
  renderMiddle,
  renderRight,
  emptyMessage = 'No entries found.',
  recordCount,
}) => {
  return (
    <div className="w-full">

      <SectionLabel label={label} />

      <GlassCard className="w-full overflow-hidden">

        {/* Card Header */}
        <div
          className="flex items-center justify-between px-[22px] py-[14px]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Left — label + count */}
          <span
            className="font-mono text-[10px] tracking-[1px]"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            log · {recordCount ?? rows.length} entries
          </span>

          {/* Right — date filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={e => onDateChange(e.target.value)}
              className="bg-transparent font-mono text-[11px] outline-none border rounded-[6px] px-2 py-1 cursor-pointer transition-colors duration-200"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)',
                colorScheme: 'dark',
              }}
              onFocus={e => e.target.style.borderColor = accentColor}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            {dateFilter && (
              <button
                onClick={() => onDateChange('')}
                className="font-mono text-[10px] transition-colors duration-200"
                style={{ color: 'rgba(239,68,68,0.7)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(239,68,68,0.7)'}
              >
                clear
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {rows.length === 0 && (
          <div className="py-10 text-center">
            <p
              className="font-sans text-[13px] italic"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              {emptyMessage}
            </p>
          </div>
        )}

        {/* Rows */}
        {rows.length > 0 && (
          <div className="flex flex-col">
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid items-center gap-[14px] px-[22px] py-[10px] transition-colors duration-150"
                style={{
                  gridTemplateColumns: '64px 1fr auto',
                  borderBottom: index !== rows.length - 1
                    ? '0.5px solid rgba(255,255,255,0.03)'
                    : 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,158,237,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Left Column */}
                <div className="flex items-center">
                  {renderLeft(row)}
                </div>

                {/* Middle Column */}
                <div className="flex flex-col min-w-0">
                  {renderMiddle(row)}
                </div>

                {/* Right Column */}
                <div className="flex flex-col items-end gap-[3px]">
                  {renderRight(row)}
                </div>
              </div>
            ))}
          </div>
        )}

      </GlassCard>
    </div>
  )
}

export default RecentLog