import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { todosService } from '../../supabase/todoServices'
import { updateTodo, removeTodo } from '../../store/todoSlice'

export default function TodoItem({ todo }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.text)
  const [isDeleting, setIsDeleting] = useState(false)
  const inputRef = useRef(null)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const handleDoubleClick = () => {
    if (todo.completed) return   // ✅ use completed not is_complete
    setIsEditing(true)
  }

  const onDelete = async (id) => {
    try {
      await todosService.deleteTodo(id)       // ✅ no del variable needed
      dispatch(removeTodo(id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const handleToggle = async (id, currentCompleted) => {
    try {
      const updated = await todosService.updateTodo(id, !currentCompleted)
      dispatch(updateTodo({ id, updatedTodo: updated }))  // ✅ correct dispatch shape
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  const handleEditSave = async () => {
    try {
      const trimmed = editValue.trim()
      if (trimmed && trimmed !== todo.text) {
        const updated = await todosService.updateTodoText(todo.id, trimmed)
        dispatch(updateTodo({ id: todo.id, updatedTodo: updated }))  // ✅ correct dispatch shape
      }
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave()
    if (e.key === 'Escape') {
      setEditValue(todo.text)
      setIsEditing(false)
    }
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => onDelete(todo.id), 300)
  }

  return (
    <div
      className={`
        group flex items-center gap-2.5 px-2.5 py-2.25
        rounded-lg border mb-1.25 last:mb-0 cursor-pointer
        transition-all duration-180 ease-in-out
        ${todo.completed                          
          ? 'bg-white/1 border-white/5 border-l-2 border-l-green-500/35 hover:bg-green-500/4 hover:border-green-500/15 hover:border-l-green-500/50'
          : 'bg-white/2.5 border-white/5 border-l-2 border-l-primary-container hover:bg-primary-container/[0.07] hover:border-primary-container/25 hover:border-l-primary-container'
        }
        ${isDeleting ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'}
        hover:translate-x-0.5
      `}
    >
      {/* Checkbox */}
      <button
        onClick={() => handleToggle(todo.id, todo.completed)}  
        data-tooltip-id="syncspace-tooltip"
        data-tooltip-content={todo.completed ? "Mark incomplete" : "Mark completed"}
        className={`
          shrink-0 w-4 h-4 rounded-full border-[1.5px]
          flex items-center justify-center
          transition-all duration-150
          ${todo.completed                        
            ? 'border-green-500 bg-green-500/15'
            : 'border-white/20 group-hover:border-primary-container/60'
          }
        `}
      >
        {todo.completed && (                      
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3.2 6L8 1" stroke="#22c55e" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Text / Edit Input */}
      <div className="flex-1 min-w-0" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleEditKeyDown}
            className="w-full bg-transparent text-[13px] text-white leading-snug
              border-b border-primary-container/60 outline-none pb-0.5"
          />
        ) : (
          <span
            className={`
              text-[13px] leading-snug block select-none
              transition-colors duration-150
              ${todo.completed                    
                ? 'line-through text-white/25'
                : 'text-white/82 cursor-text'
              }
            `}
          >
            {todo.text}
          </span>
        )}
      </div>

      {/* Trash icon */}
      <button
        onClick={handleDelete}
        data-tooltip-id="syncspace-tooltip"
        data-tooltip-content="Delete task"
        className="
          shrink-0 w-3.5 h-3.5
          text-white/0 group-hover:text-white/20
          hover:text-red-500!
          transition-colors duration-150
        "
      >
        <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
          <path d="M1.75 3.5H12.25M5.25 3.5V2.333A.583.583 0 015.833 1.75h2.334a.583.583 0 01.583.583V3.5M5.833 6.417v3.5M8.167 6.417v3.5M2.333 3.5l.584 7.583a.583.583 0 00.583.584h7a.583.583 0 00.583-.584L11.667 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  )
}