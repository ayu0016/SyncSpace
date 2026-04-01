export default function TabBar({ activeTab, onTabSwitch }) {
  return (
    <div className="pt-4 px-6 md:px-8 shrink-0">
      <div className="w-full bg-white/3 rounded-[10px] p-1 flex relative">

        {/* Sliding pill */}
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary-container rounded-[8px] shadow-[0_0_12px_rgba(74,158,237,0.3)] pointer-events-none transition-transform duration-300 ease-in-out"
          style={{
            transform: activeTab === 'built-in' ? 'translateX(0)' : 'translateX(100%)'
          }}
        />

        <button
          onClick={() => onTabSwitch('built-in')}
          className={`flex-1 py-2 text-[13px] relative z-10 transition-colors duration-300 rounded-[8px] ${
            activeTab === 'built-in'
              ? 'text-on-primary-container font-extrabold'
              : 'text-outline font-semibold hover:text-on-surface-variant'
          }`}
        >
          Built-in
        </button>

        <button
          onClick={() => onTabSwitch('custom')}
          className={`flex-1 py-2 text-[13px] relative z-10 transition-colors duration-300 rounded-[8px] ${
            activeTab === 'custom'
              ? 'text-on-primary-container font-extrabold'
              : 'text-outline font-semibold hover:text-on-surface-variant'
          }`}
        >
          Custom
        </button>

      </div>
    </div>
  )
}