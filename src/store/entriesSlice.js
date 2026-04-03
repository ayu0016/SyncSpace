import { createSlice } from "@reduxjs/toolkit"

const entriesSlice = createSlice({
  name: "entries",
  initialState: {
    entries: {}
  },
  reducers: {
    setEntries: (state, action) => {
        state.entries= action.payload.reduce((acc,entry)=>{
            if(!acc[entry.widget_id]){
                acc[entry.widget_id]=[]
            }
            acc[entry.widget_id].push(entry)
            return acc
        },{})
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

export const { setEntries, addEntry,removeEntry,updateEntry } = entriesSlice.actions
export default entriesSlice.reducer