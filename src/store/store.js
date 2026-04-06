import { configureStore, combineReducers } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import todosReducer from './todoSlice'
import widgetsReducer from './widgetSlice'
import entriesReducer from './entriesSlice'
import uiReducer from './uiSlice'

const appReducer = combineReducers({
    auth: authReducer,
    todos: todosReducer,
    widgets: widgetsReducer,
    entries: entriesReducer,
    ui: uiReducer,
})

const rootReducer = (state, action) => {
    if (action.type === 'RESET_ALL') {
        state = undefined
    }
    return appReducer(state, action)
}

const store = configureStore({ reducer: rootReducer })

export default store