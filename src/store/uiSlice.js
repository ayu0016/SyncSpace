import { createSlice } from "@reduxjs/toolkit"

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    modalType: null,
    activeWidgetId: null,
    isTodoOpen: false 
  },
  reducers: {
    openModal: (state, action) => {
        state.modalType=action.payload
    },
    closeModal: (state) => {
        state.modalType=null
        state.activeWidgetId=null
    },
    setActiveWidget: (state, action) => {
        state.activeWidgetId=action.payload
    },
    openTodo: (state)=>{
         state.isTodoOpen=true
        },
    CloseTodo: (state)=>{
        state.isTodoOpen=false
    }
  }
})

export const { openModal, closeModal, setActiveWidget,CloseTodo,openTodo } = uiSlice.actions
export default uiSlice.reducer