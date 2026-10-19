import { createSlice } from "@reduxjs/toolkit"

const widgetsSlice = createSlice({
  name: "widgets",
  initialState: {
    widgets: []
  },
  reducers: {
    setWidgets: (state, action) => {
        state.widgets = action.payload
    },
    addWidget: (state, action) => {
        state.widgets.push(action.payload)
    },
    updateWidget: (state, action) => {
        const id = action.payload.id || action.payload.updatedWidget?.id
        const updatedWidget = action.payload.updatedWidget || action.payload
        state.widgets = state.widgets.map((widget) => (widget.id === id) ? { ...widget, ...updatedWidget } : widget)
    },
    removeWidget: (state, action) => {
        state.widgets = state.widgets.filter(widget => widget.id !== action.payload)
    }
  }
})

export const { setWidgets, addWidget, updateWidget, removeWidget } = widgetsSlice.actions
export default widgetsSlice.reducer