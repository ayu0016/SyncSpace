import React, { useMemo } from 'react'
import GlassCard from '../GlassCard'
import SectionLabel from '../SectionLabel'

const RecentLog = ({
  label,
  rows = [],
  accentColor = '#4a9eed',
  dateFilter,
  onDateChange,
  renderLeft,
  renderMiddle,
  renderRight,
  emptyMessage = 'No entries found.',
  recordCount,
  headerExtra = null,
  maxDisplay = 50,
}) => {
  // Cap displayed rows at maxDisplay (default 50)
  const displayedRows = useMemo(() => {
    return rows.slice(0, maxDisplay)
  }, [rows, maxDisplay])

  const totalCount = recordCount ?? rows.length

  return (
    <div className="w-full">
      <SectionLabel label={label} />

      <GlassCard className="w-full overflow-hidden">
        {/* Card Header */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-[22px] py-[14px]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Left — label + count */}
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-[10px] tracking-[1px] uppercase"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              log · {rows.length > maxDisplay ? `showing ${displayedRows.length} of ${totalCount} entries` : `${totalCount} entries`}
            </span>
          </div>

          {/* Right — custom filters, search & date filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {headerExtra}

            {onDateChange && (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={dateFilter || ''}
                  onChange={e => onDateChange(e.target.value)}
                  className="bg-transparent font-mono text-[11px] outline-none border rounded-[6px] px-2 py-1 cursor-pointer transition-colors duration-200"
                  style={{
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.65)',
                    colorScheme: 'dark',
                  }}
                  onFocus={e => (e.target.style.borderColor = accentColor)}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                {dateFilter && (
                  <button
                    onClick={() => onDateChange('')}
                    data-tooltip-id="syncspace-tooltip"
                    data-tooltip-content="Clear date filter"
                    className="font-mono text-[10px] transition-colors duration-200 cursor-pointer"
                    style={{ color: 'rgba(239,68,68,0.7)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
                  >
                    clear
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {displayedRows.length === 0 && (
          <div className="py-12 text-center">
            <p
              className="font-sans text-[13px] italic"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              {emptyMessage}
            </p>
          </div>
        )}

        {/* Rows */}
        {displayedRows.length > 0 && (
          <div className="flex flex-col divide-y divide-white/[0.03]">
            {displayedRows.map((row) => (
              <div
                key={row.id}
                className="grid items-center gap-[14px] px-[22px] py-[11px] transition-colors duration-150"
                style={{
                  gridTemplateColumns: '76px 1fr auto',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,158,237,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Left Column */}
                <div className="flex items-center min-w-0">
                  {renderLeft(row)}
                </div>

                {/* Middle Column */}
                <div className="flex flex-col min-w-0 pr-2">
                  {renderMiddle(row)}
                </div>

                {/* Right Column */}
                <div className="flex flex-col items-end gap-[3px] shrink-0">
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
