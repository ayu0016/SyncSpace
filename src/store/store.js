import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import widgetReducer from "./widgetSlice"
import todoReducer from "./todoSlice"
import entriesReducer from "./entriesSlice"
import uiReducer from "./uiSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    widgets: widgetReducer,
    todos: todoReducer,
    entries: entriesReducer,
    ui: uiReducer
  }
})