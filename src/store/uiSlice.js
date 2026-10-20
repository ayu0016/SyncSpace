import { createSlice } from "@reduxjs/toolkit"

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    modalType: null,
    activeWidgetId: null,
    editingEntryId: null,
    isTodoOpen: false,
    isDesktopTodoOpen: true,
  },
  reducers: {
    openModal: (state, action) => {
      state.modalType = action.payload
    },
    closeModal: (state) => {
      state.modalType = null
      state.activeWidgetId = null
      state.editingEntryId = null
    },
    setActiveWidget: (state, action) => {
      state.activeWidgetId = action.payload
    },
    setEditingEntryId: (state, action) => {
      state.editingEntryId = action.payload
    },
    openTodo: (state) => {
      state.isTodoOpen = true
      state.isDesktopTodoOpen = true
    },
    CloseTodo: (state) => {
      state.isTodoOpen = false
      state.isDesktopTodoOpen = false
    },
    toggleTodo: (state) => {
      state.isDesktopTodoOpen = !state.isDesktopTodoOpen
      state.isTodoOpen = !state.isTodoOpen
    },
    toggleDesktopTodo: (state) => {
      state.isDesktopTodoOpen = !state.isDesktopTodoOpen
    },
    toggleMobileTodo: (state) => {
      state.isTodoOpen = !state.isTodoOpen
    },
  },
})

export const {
  openModal,
  closeModal,
  setActiveWidget,
  setEditingEntryId,
  CloseTodo,
  openTodo,
  toggleTodo,
  toggleDesktopTodo,
  toggleMobileTodo,
} = uiSlice.actions

export default uiSlice.reducer
