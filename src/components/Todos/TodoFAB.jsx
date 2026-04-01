import { useDispatch } from "react-redux"
import { openTodo,CloseTodo } from "../../store/uiSlice"


export default function TodoFAB({ count }) {
    const dispatch=useDispatch()
  return (
    <button
      onClick={() => dispatch(openTodo())}
      className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30
        flex items-center gap-3 px-6 py-3 rounded-full
        border border-primary-container/20 shadow-2xl
        active:scale-95 transition-transform duration-150"
      style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Icon */}
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary-container">
        <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 7h8M5 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>

      {/* Label */}
      <span className="text-sm font-bold tracking-tight text-white">My Todos</span>

      {/* Active count badge */}
      {count > 0 && (
        <span className="w-5 h-5 rounded-full bg-primary-container text-background
          text-[10px] font-black flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}