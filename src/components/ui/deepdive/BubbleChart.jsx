import { useState } from 'react'

const getOpacity = (daysAgo) => {
  if (daysAgo < 7)  return 1.0
  if (daysAgo <= 21) return 0.5
  if (daysAgo <= 45) return 0.2
  return 0.05
}

const getStalenessLabel = (daysAgo) => {
  if (daysAgo < 7)  return 'fresh'
  if (daysAgo <= 21) return 'fading'
  if (daysAgo <= 45) return 'stale'
  return 'ghost'
}

const BubbleChart = ({ nodes = [], accentColor, selectedId, onSelect }) => {
  const [hoveredId, setHoveredId]   = useState(null)
  const [mousePos, setMousePos]     = useState({ x: 0, y: 0 })

  const hoveredNode = nodes.find(n => n.id === hoveredId) || null

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    let x = e.clientX - rect.left + 15
    let y = e.clientY - rect.top + 15
    // prevent tooltip going off right edge
    if (x + 180 > rect.width) x = e.clientX - rect.left - 195
    setMousePos({ x, y })
  }

  return (
    <div
      className="relative w-full"
      onMouseMove={handleMouseMove}
    >

      {/* ── Desktop SVG Bubble Chart ── */}
      <div className="hidden sm:block w-full">
        <svg
          viewBox="0 0 800 320"
          width="100%"
          height="auto"
          className="overflow-visible"
        >
          <style>{`
            @keyframes bubblePopIn {
              0%   { transform: scale(0); opacity: 0; }
              70%  { transform: scale(1.12); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes idleFloat {
              0%, 100% { transform: translateY(-3px); }
              50%       { transform: translateY(3px); }
            }
            @keyframes ghostPulse {
              0%, 100% { transform: scale(0.97); }
              50%       { transform: scale(1.03); }
            }
          `}</style>

          {nodes.map(node => {
            const isHovered  = hoveredId === node.id
            const isSelected = selectedId === node.id
            const isMuted    = hoveredId !== null && !isHovered
            const opacity    = getOpacity(node.daysAgo)
            const staleness  = getStalenessLabel(node.daysAgo)

            return (
              <g
                key={node.id}
                style={{
                  transformOrigin: `${node.cx}px ${node.cy}px`,
                  animation: `bubblePopIn 0.8s cubic-bezier(0.175,0.885,0.32,1.275) ${node.delay * 80}ms backwards`
                }}
              >
                <g
                  style={{
                    transformOrigin: `${node.cx}px ${node.cy}px`,
                    animation: staleness === 'ghost'
                      ? `ghostPulse 3s infinite ease-in-out, idleFloat ${3 + node.delay * 0.5}s infinite ease-in-out alternate`
                      : `idleFloat ${3 + node.delay * 0.5}s infinite ease-in-out alternate`
                  }}
                >
                  <g
                    className="cursor-pointer"
                    style={{
                      transformOrigin: `${node.cx}px ${node.cy}px`,
                      transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                      opacity: isMuted ? 0.4 : 1,
                      transition: 'opacity 0.3s, transform 0.3s',
                      filter: (isHovered || isSelected)
                        ? `drop-shadow(0 0 12px ${accentColor}cc)`
                        : 'none'
                    }}
                    onClick={() => onSelect(isSelected ? null : node.id)}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >

                    {/* Main Bubble */}
                    <circle
                      cx={node.cx}
                      cy={node.cy}
                      r={node.r}
                      fill={accentColor}
                      fillOpacity={opacity}
                      stroke={accentColor}
                      strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
                    />

                    {/* Label */}
                    {node.r >= 35 ? (
                      <text
                        x={node.cx}
                        y={node.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize="10"
                        fontFamily="JetBrains Mono, monospace"
                        className="pointer-events-none"
                        style={{ opacity }}
                      >
                        {node.name.length > 12
                          ? node.name.substring(0, 10) + '..'
                          : node.name
                        }
                      </text>
                    ) : (
                      <g className="pointer-events-none" style={{ opacity }}>
                        <line
                          x1={node.cx}
                          y1={node.cy - node.r}
                          x2={node.cx + 15}
                          y2={node.cy - node.r - 15}
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="1"
                        />
                        <text
                          x={node.cx + 18}
                          y={node.cy - node.r - 15}
                          dominantBaseline="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {node.name}
                        </text>
                      </g>
                    )}

                    {/* Count Badge */}
                    <circle
                      cx={node.cx + node.r * 0.65}
                      cy={node.cy - node.r * 0.65}
                      r={11}
                      fill="#0a0a0f"
                      stroke={accentColor}
                      strokeOpacity={Math.max(0.2, opacity)}
                      strokeWidth="1"
                    />
                    <text
                      x={node.cx + node.r * 0.65}
                      y={node.cy - node.r * 0.65 + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={accentColor}
                      fillOpacity={Math.max(0.4, opacity)}
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {node.count}
                    </text>

                  </g>
                </g>
              </g>
            )
          })}
        </svg>

        {/* Staleness Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
          {[
            { label: 'Fresh (< 7 days)',   opacity: 1.0  },
            { label: 'Fading (< 21 days)', opacity: 0.5  },
            { label: 'Stale (< 45 days)',  opacity: 0.2  },
            { label: 'Ghost (> 45 days)',  opacity: 0.05 },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: accentColor, opacity: item.opacity }}
              />
              <span
                className="font-mono text-[10px]"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile Fallback ── */}
      <div className="sm:hidden grid grid-cols-2 gap-3">
        {nodes.map(node => {
          const isSelected = selectedId === node.id
          const opacity    = getOpacity(node.daysAgo)
          const staleness  = getStalenessLabel(node.daysAgo)

          return (
            <div
              key={node.id}
              onClick={() => onSelect(isSelected ? null : node.id)}
              className="rounded-[10px] p-3 flex flex-col gap-2 cursor-pointer transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(12px)',
                border: isSelected
                  ? `1px solid ${accentColor}`
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: isSelected
                  ? `0 0 12px ${accentColor}4d`
                  : 'none'
              }}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-sans text-[12px] font-medium text-white truncate">
                  {node.name}
                </span>
                <span
                  className="font-mono text-[10px] px-1.5 py-[1px] rounded-full shrink-0"
                  style={{
                    background: `${accentColor}1A`,
                    border: `1px solid ${accentColor}`,
                    color: accentColor
                  }}
                >
                  {node.count}
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 font-mono text-[10px]"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: accentColor,
                    opacity
                  }}
                />
                <span>{staleness} · {node.daysAgo}d ago</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Floating Tooltip ── */}
      {hoveredNode && (
        <div
          className="hidden sm:block absolute pointer-events-none z-50 rounded-[10px] p-3 min-w-[160px]"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            background: 'rgba(22,27,34,0.97)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${accentColor}66`,
          }}
        >
          <p className="font-sans font-semibold text-[13px] text-white mb-2">
            {hoveredNode.name}
          </p>
          <p
            className="font-mono text-[11px] mb-1"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            {hoveredNode.count} problems flagged
          </p>
          <div
            className="flex items-center gap-1.5 mt-2 pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: accentColor,
                opacity: getOpacity(hoveredNode.daysAgo)
              }}
            />
            <span
              className="font-mono text-[10px] capitalize"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {getStalenessLabel(hoveredNode.daysAgo)} · last visited {hoveredNode.daysAgo}d ago
            </span>
          </div>
        </div>
      )}

    </div>
  )
}

export default BubbleChart