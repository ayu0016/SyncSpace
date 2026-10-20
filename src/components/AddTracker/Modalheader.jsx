import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ModalHeader() {
  const navigate = useNavigate()

  return (
    <div className="pt-8 px-6 md:px-8 pb-6 border-b border-white/6 flex justify-between items-start shrink-0">
      <div>
        <h1 className="text-[22px] font-extrabold text-white tracking-tight leading-tight mb-1">
          What do you want to track?
        </h1>
        <p className="text-[13px] text-on-surface-variant font-normal">
          Select a template or build a custom workflow.
        </p>
      </div>
      <button
        onClick={() => navigate(-1)}
        data-tooltip-id="syncspace-tooltip"
        data-tooltip-content="Close (Esc)"
        className="text-outline hover:text-white transition-colors active:scale-95 p-1 rounded-md cursor-pointer"
      >
        <X size={20} strokeWidth={2.5} />
      </button>
    </div>
  )
}