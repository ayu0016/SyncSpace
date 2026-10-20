// Dashboard.jsx — how to use all of this together
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import WidgetCard from './widgets/WidgetCard'
import DSACardContent from './widgets/dsa/DsaCardContent'
import GymCardContent from './widgets/gym/GymCardContent'
import MLCardContent from './widgets/ml/MlCardContent'
import KanbanCardContent from './widgets/kanban/KanbanCardContent'
import CustomCardContent from './widgets/custom/CustomCardContent'
import Button from './Button'

const WIDGET_MAP = {
  dsa:    { Component: DSACardContent,    buttonLabel: '+ Log Problem'  },
  gym:    { Component: GymCardContent,    buttonLabel: '+ Log Workout'  },
  ml:     { Component: MLCardContent,     buttonLabel: '+ Log Session'  },
  kanban: { Component: KanbanCardContent, buttonLabel: '+ Add Task'     },
  custom: { Component: CustomCardContent, buttonLabel: '+ Log'          },
}

function AllWidget() {
  const navigate = useNavigate()
  const widgets = useSelector(state => state.widgets.widgets)
  const isDesktopTodoOpen = useSelector(state => state.ui.isDesktopTodoOpen ?? true)

  if (!widgets || widgets.length === 0) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-white/5 rounded-2xl bg-white/[0.01]">
        <div className="w-14 h-14 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-2xl mb-4 shadow-[0_0_20px_rgba(74,158,237,0.15)]">
          ⚡
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-1">No trackers active yet</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Track your algorithms, workouts, learning sessions, and tasks all in one unified dashboard.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/add-tracker')}
        >
          Add Your First Tracker
        </Button>
      </div>
    )
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 transition-all duration-300 ${
        isDesktopTodoOpen
          ? 'sm:grid-cols-2'
          : 'sm:grid-cols-2 lg:grid-cols-3'
      }`}
    >
      {widgets.map(widget => {
        const config = WIDGET_MAP[widget.type] || WIDGET_MAP.custom
        const { Component } = config

        return (
          <WidgetCard
            key={widget.id}
            widget={widget}
            buttonLabel={config.buttonLabel}
          >
            <Component
              widget={widget}
              accent={widget.color}
            />
          </WidgetCard>
        )
      })}
    </div>
  )
}

export default AllWidget
