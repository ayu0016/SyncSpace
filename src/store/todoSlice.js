import { createSlice } from "@reduxjs/toolkit"

const todosSlice = createSlice({
  name: "todos",
  initialState: {
    todos: []
  },
  reducers: {
    setTodos: (state, action) => {
        state.todos = action.payload
    },
    addTodo: (state, action) => {
        state.todos.push(action.payload)
    },
    updateTodo: (state, action) => {
        const { id, updatedTodo } = action.payload
        state.todos = state.todos.map((todo) => (todo.id === id)?{...todo,...updatedTodo}:todo)
    },
    removeTodo: (state, action) => {
        state.todos = state.todos.filter(todo => todo.id !== action.payload)
    }
  }
})

export const { setTodos, addTodo, updateTodo, removeTodo } = todosSlice.actions
export default todosSlice.reducer