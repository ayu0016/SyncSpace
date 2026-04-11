const TabSwitcher = ({ tabs = [], activeTab, onChange, accentColor }) => {
  return (
    <div
      className="flex w-full"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className="flex-1 pb-3 text-center relative transition-all duration-200 font-sans text-[14px]"
            style={{
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)',
              fontWeight: isActive ? '700' : '500',
            }}
          >
            {tab}
            {isActive && (
              <div
                className="absolute bottom-0 left-0 w-full h-[2px]"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 2px 8px ${accentColor}66`
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default TabSwitcher