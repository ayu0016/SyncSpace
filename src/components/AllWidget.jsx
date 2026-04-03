// Dashboard.jsx — how to use all of this together
import WidgetCard from './components/widgets/WidgetCard'
import DSACardContent from './components/widgets/dsa/DSACardContent'
import GymCardContent from './components/widgets/gym/GymCardContent'
import MLCardContent from './components/widgets/ml/MLCardContent'
import KanbanCardContent from './components/widgets/kanban/KanbanCardContent'

const WIDGET_MAP = {
  dsa:    { Component: DSACardContent,    buttonLabel: '+ Log Problem'  },
  gym:    { Component: GymCardContent,    buttonLabel: '+ Log Workout'  },
  ml:     { Component: MLCardContent,     buttonLabel: '+ Log Session'  },
  kanban: { Component: KanbanCardContent, buttonLabel: '+ Add Task'     },
}

export default function Dashboard() {
  // TODO: get widgets and entries from Redux store
  // const widgets = useSelector(state => state.widgets.items)
  // const entries = useSelector(state => state.entries.byWidgetId)

  return (
    <div className="grid grid-cols-3 gap-3">
      {widgets.map(widget => {
        const config = WIDGET_MAP[widget.type]
        const { Component } = config

        return (
          <WidgetCard
            key={widget.id}
            widget={widget}
            buttonLabel={config.buttonLabel}
            onLogClick={() => {/* TODO: dispatch openModal(widget) */}}
          >
            <Component
              entries={entries[widget.id] ?? []}
              accent={widget.color}
            />
          </WidgetCard>
        )
      })}
    </div>
  )
}