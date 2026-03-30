import { createSlice } from "@reduxjs/toolkit"

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    modalType: null,
    activeWidgetId: null
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
    }
  }
})

export const { openModal, closeModal, setActiveWidget } = uiSlice.actions
export default uiSlice.reducer