// Dashboard.jsx — how to use all of this together
import WidgetCard from './widgets/WidgetCard'
import DSACardContent from './widgets/dsa/DsaCardContent'
import GymCardContent from './widgets/gym/GymCardContent'
import MLCardContent from './widgets/ml/MLCardContent'
import KanbanCardContent from './widgets/kanban/KanbanCardContent'
import { useSelector } from 'react-redux'
import customCardContent from './widgets/custom/CustomCardContent'

const WIDGET_MAP = {
  dsa:    { Component: DSACardContent,    buttonLabel: '+ Log Problem'  },
  gym:    { Component: GymCardContent,    buttonLabel: '+ Log Workout'  },
  ml:     { Component: MLCardContent,     buttonLabel: '+ Log Session'  },
  kanban: { Component: KanbanCardContent, buttonLabel: '+ Add Task'     },
  custom: { Component: customCardContent, buttonLabel: '+ Log Entry'     },
}

export default function AllWidget() {
  // TODO: get widgets and entries from Redux store
  const widgets = useSelector(state => state.widgets.widgets)
  const entries = useSelector(state => state.entries.entries)

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