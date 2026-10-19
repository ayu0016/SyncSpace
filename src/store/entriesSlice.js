import { createSlice } from "@reduxjs/toolkit"

const entriesSlice = createSlice({
  name: "entries",
  initialState: {
    entries: {}
  },
  reducers: {
    setEntries: (state, action) => {
        if (!action.payload) return
        if (Array.isArray(action.payload)) {
            action.payload.forEach((entry) => {
                if (!state.entries[entry.widget_id]) {
                    state.entries[entry.widget_id] = []
                }
                const exists = state.entries[entry.widget_id].some(e => e.id === entry.id)
                if (!exists) {
                    state.entries[entry.widget_id].push(entry)
                }
            })
        }
    },
    setWidgetEntries: (state, action) => {
        const { widget_id, entries } = action.payload
        state.entries[widget_id] = entries
    },
    addEntry: (state, action) => {
        const {widget_id,entry}=action.payload
        if(!state.entries[widget_id]) state.entries[widget_id]=[]
        state.entries[widget_id].push(entry)
    },
   
    removeEntry: (state, action) => {
        const {id,widget_id}= action.payload
        state.entries[widget_id]=state.entries[widget_id].filter( entry => entry.id!==id)
    },
    updateEntry: (state, action) => {
        const { widget_id, entry } = action.payload
        const index = state.entries[widget_id].findIndex(e => e.id === entry.id)
        if (index !== -1) {
            state.entries[widget_id][index] = entry  // ← replace old with updated
        }
    }
  }
})

export const { setEntries, setWidgetEntries, addEntry, removeEntry, updateEntry } = entriesSlice.actions
export default entriesSlice.reducer