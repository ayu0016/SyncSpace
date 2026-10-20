import { useState } from 'react'
import TodoItem from './TodoItem'
import { useDispatch,useSelector } from 'react-redux'
import {CloseTodo } from '../../store/uiSlice'
import { todosService } from '../../supabase/todoServices'
import { addTodo,removeTodo } from '../../store/todoSlice'

const sortTodos = (todos) =>
  [...todos].sort((a, b) => Number(a.completed) - Number(b.completed))

export default function TodoPanel({ isMobile = false }) {
  const dispatch = useDispatch()
  const todos = useSelector((state) => state.todos.todos)
  const user = useSelector((state) => state.auth.userData)


  
  const [inputValue, setInputValue] = useState('')

  const activeTodos = todos.filter(t => !t.completed)
  const sortedTodos = sortTodos(todos)

  const handleAdd = async () => {
    if (!user?.id) {
        return
    }
    try {
        const text = inputValue.trim()
        if (!text) return
        const newData = await todosService.addTodo(user?.id, text)
        if (newData) {
            dispatch(addTodo(newData))
            setInputValue('')
        }
    } catch (error) {
        console.log("error:", error)
    }
}

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd()
  }


  const handleDelete = async(id) => {
    try{
        await todosService.deleteTodo(id)
        dispatch(removeTodo(id))
    }
    catch(error){
        console.error('Failed to delete todo:', error)
    }
  }

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(t => t.completed)
    for (const todo of completedTodos) {
        await handleDelete(todo.id)
    }
    }

  

  return (
    <div
      className={`flex flex-col w-full h-full ${isMobile ? 'rounded-t-2xl' : 'rounded-xl'}`}
      style={{
        background: 'rgba(14, 14, 19, 0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >

      {/* Header */}
      <div className="px-5 pt-5 pb-4 shrink-0 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">My Todos</h2>
          <p className="text-xs text-white/40 mt-1">Fix what the dashboard reveals</p>
        </div>

        {/* Close / Hide button */}
        <button
          onClick={() => dispatch(CloseTodo())}
          className="text-white/30 hover:text-white/70 transition-colors duration-150 mt-1 cursor-pointer"
          title={isMobile ? "Close" : "Hide Tasks Panel"}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Drag handle — mobile only */}
      {isMobile && (
        <div className="flex justify-center pb-1 -mt-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>
      )}

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto px-4 min-h-0
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-white/2
        [&::-webkit-scrollbar-thumb]:bg-white/10
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-primary-container/30
      ">
        {sortedTodos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center py-10">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-white/10">
              <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 12h12M10 17h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-xs text-white/20 font-medium">No tasks yet.<br/>Add one below.</p>
          </div>
        ) : (
          <>
            {sortedTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
              />
            ))}

            {/* Clear Completed */}
            {todos.some(t => t.completed) && (
              <button
                onClick={handleClearCompleted}
                className="w-full mt-3 mb-2 text-[11px] font-medium text-white/20
                  hover:text-red-400/70 transition-colors duration-150 text-center py-1"
              >
                Clear completed
              </button>
            )}
          </>
        )}
      </div>

      {/* Input — pinned at bottom */}
      <div className="px-4 pb-4 pt-3 shrink-0 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="+ Add a todo..."
            className="w-full bg-white/4 border border-white/10 rounded-lg
              px-4 py-2.5 pr-10 text-sm text-white
              placeholder-white/25 outline-none
              focus:border-primary-container/50 focus:ring-1 focus:ring-primary-container/20
              transition-all duration-200"
          />
          <button
            onClick={handleAdd}
            className="absolute right-3 top-1/2 -translate-y-1/2
              text-white/20 hover:text-primary-container transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 3v4a2 2 0 01-2 2H3M3 9l3-3M3 9l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {activeTodos.length > 0 && (
          <p className="text-[10px] text-white/20 mt-2 text-center">
            {activeTodos.length} task{activeTodos.length !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

    </div>
  )
}