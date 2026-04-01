import { useNavigate } from 'react-router-dom'

export default function ModalFooter({ isEnabled, onConfirm }) {
  const navigate = useNavigate()

  return (
    <div className="p-4 px-6 md:px-8 bg-white/2 border-t border-white/6 flex gap-3 shrink-0">
      <button
        onClick={() => navigate(-1)}
        className="flex-1 bg-transparent border border-white/12 text-on-surface-variant text-[13px] font-bold py-3 rounded-[10px] hover:bg-white/5 active:scale-[0.98] transition-all duration-200"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={!isEnabled}
        className={`flex-2 py-3 rounded-[10px] transition-all duration-200 text-[12px] font-extrabold tracking-[0.08em] uppercase ${
          isEnabled
            ? 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(74,158,237,0.4)] hover:brightness-110 active:scale-[0.98]'
            : 'bg-surface-container text-outline-variant cursor-not-allowed border border-white/2'
        }`}
      >
        Confirm Selection
      </button>
    </div>
  )
}