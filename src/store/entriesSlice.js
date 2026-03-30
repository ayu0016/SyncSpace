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
        state.entries[widget_id].push(entry)
    },
   
    removeEntry: (state, action) => {
        const {id,widget_id}= action.payload
        state.entries[widget_id]=state.entries[widget_id].filter( entry => entry.id!==id)
    }
  }
})

export const { setEntries, addEntry,removeEntry } = entriesSlice.actions
export default entriesSlice.reducer