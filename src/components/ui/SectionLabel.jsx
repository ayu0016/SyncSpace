const SectionLabel = ({ label }) => {
  return (
    <div className="flex items-center w-full mb-3">
      <span
        className="font-mono text-[9px] uppercase shrink-0 mr-3"
        style={{
          color: 'rgba(74, 158, 237, 0.65)',
          letterSpacing: '2px'
        }}
      >
        {label}
      </span>
      <div
        className="h-px flex-1"
        style={{
          background: 'linear-gradient(to right, rgba(74,158,237,0.25), transparent)'
        }}
      />
    </div>
  )
}

export default SectionLabel