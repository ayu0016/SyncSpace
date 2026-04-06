import { useEffect, useState } from 'react'
import { X, Code, Dumbbell, Brain, Kanban } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { closeModal } from '../store/uiSlice'
import DSAQuickAddForm from './forms/DSAQuickAddForm'
import GymQuickAddForm from './forms/GymQuickAddForm'
import MLQuickAddForm from './forms/MLQuickAddForm'
import KanbanQuickAddForm from './forms/KanbanQuickAddForm'

const MODAL_CONFIG = {
  dsa: {
    title: 'Log DSA Problem',
    icon: Code,
    accent: '#4a9eed',
  },
  gym: {
    title: 'Log Gym Entry',
    icon: Dumbbell,
    accent: '#10b981',
  },
  ml: {
    title: 'Log ML Session',
    icon: Brain,
    accent: '#a855f7',
  },
  kanban: {
    title: 'Add Task',
    icon: Kanban,
    accent: '#f59e0b',
  },
}

const QuickAddModal = () => {
  const dispatch = useDispatch()
  const modalType = useSelector(state => state.ui.modalType)
  const activeWidgetId = useSelector(state => state.ui.activeWidgetId)

  const [isRendered, setIsRendered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const isOpen = !!modalType
  const config = MODAL_CONFIG[modalType] || {}
  /*
    for custom{
        title widget.name
        icon=widgt.icon
        accent=widget.color
    }
  */ 
  const IconComponent = config.icon

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true)
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true))
      })
    } else {
      setIsVisible(false)
      document.body.style.overflow = 'unset'
      const timer = setTimeout(() => setIsRendered(false), 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => dispatch(closeModal())

  if (!isRendered) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      <style>{`
        .modal-scroll::-webkit-scrollbar { width: 5px; }
        .modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .modal-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); }

        @keyframes modalFieldIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-form-fields > * {
          opacity: 0;
          animation: modalFieldIn 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .modal-form-fields.show > *:nth-child(1) { animation-delay: 0.04s; }
        .modal-form-fields.show > *:nth-child(2) { animation-delay: 0.09s; }
        .modal-form-fields.show > *:nth-child(3) { animation-delay: 0.14s; }
        .modal-form-fields.show > *:nth-child(4) { animation-delay: 0.19s; }
        .modal-form-fields.show > *:nth-child(5) { animation-delay: 0.24s; }
        .modal-form-fields.show > *:nth-child(6) { animation-delay: 0.29s; }
      `}</style>

      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-[6px] transition-opacity duration-300 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Ambient glow — desktop only */}
      <div
        className="absolute hidden sm:block w-125 h-150 rounded-3xl blur-[100px] pointer-events-none transition-opacity duration-700"
        style={{
          backgroundColor: config.accent,
          opacity: isVisible ? 0.07 : 0,
        }}
      />

      {/* Modal card */}
      <div
        className={`
          relative w-full sm:w-125 max-h-[95vh] sm:max-h-[85vh]
          flex flex-col
          bg-linear-to-b from-[#1c1c28]/95 to-[#0f0f16]/95
          backdrop-blur-[20px]
          border border-white/12 border-t-white/18
          rounded-t-3xl rounded-b-none sm:rounded-3xl
          shadow-[0_-10px_40px_rgba(0,0,0,0.5)] sm:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]
          overflow-hidden
          transition-all duration-500
          ${isVisible
            ? 'opacity-100 translate-y-0 sm:scale-100'
            : 'opacity-0 translate-y-full sm:translate-y-12 sm:scale-95'
          }
        `}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Mobile drag handle */}
        <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.07] shrink-0 bg-white/2">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border border-white/6"
              style={{ backgroundColor: `${config.accent}1A` }}
            >
              {IconComponent && <IconComponent size={18} color={config.accent} />}
            </div>
            <h2 className="text-[18px] font-bold text-white tracking-tight">
              {config.title}
            </h2>
          </div>

          // close button
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/8 active:scale-95 transition-all duration-200"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 modal-scroll pb-10 sm:pb-6">
          <div className={`modal-form-fields flex flex-col gap-4 ${isVisible ? 'show' : ''}`}>
            {modalType === 'dsa' && (
              <DSAQuickAddForm widgetId={activeWidgetId}   accentColor={config.accent} />
            )}
            {modalType === 'gym' && (
              <GymQuickAddForm widgetId={activeWidgetId}   accentColor={config.accent} />
            )}
            {modalType === 'ml' && (
              <MLQuickAddForm widgetId={activeWidgetId}   accentColor={config.accent} />
            )}
            {modalType === 'kanban' && (
              <KanbanQuickAddForm widgetId={activeWidgetId}   accentColor={config.accent} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickAddModal