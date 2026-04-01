import { useState, useRef, useEffect } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { CloseTodo } from '../../store/uiSlice'

export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.text)
  const [isDeleting, setIsDeleting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const handleDoubleClick = () => {
    if (todo.is_complete) return
    setIsEditing(true)
  }

  const handleEditSave = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== todo.text) onEdit(todo.id, trimmed)
    setIsEditing(false)
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
        group flex items-center gap-[10px] px-[10px] py-[9px]
        rounded-lg border mb-[5px] last:mb-0 cursor-pointer
        transition-all duration-[180ms] ease-in-out
        ${todo.is_complete
          ? 'bg-white/[0.01] border-white/5 border-l-2 border-l-green-500/35 hover:bg-green-500/[0.04] hover:border-green-500/15 hover:border-l-green-500/50'
          : 'bg-white/[0.025] border-white/5 border-l-2 border-l-[#4a9eed] hover:bg-[#4a9eed]/[0.07] hover:border-[#4a9eed]/25 hover:border-l-[#4a9eed]'
        }
        ${isDeleting ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'}
        hover:translate-x-[2px]
      `}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id, todo.is_complete)}
        className={`
          flex-shrink-0 w-[16px] h-[16px] rounded-full border-[1.5px]
          flex items-center justify-center
          transition-all duration-150
          ${todo.is_complete
            ? 'border-green-500 bg-green-500/15'
            : 'border-white/20 group-hover:border-[#4a9eed]/60'
          }
        `}
      >
        {todo.is_complete && (
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
              border-b border-[#4a9eed]/60 outline-none pb-0.5"
          />
        ) : (
          <span
            className={`
              text-[13px] leading-snug block select-none
              transition-colors duration-150
              ${todo.is_complete
                ? 'line-through text-white/25'
                : 'text-white/82 cursor-text'
              }
            `}
          >
            {todo.text}
          </span>
        )}
      </div>

      {/* Trash icon — invisible by default, fades in on row hover */}
      <button
        onClick={handleDelete}
        className="
          flex-shrink-0 w-[14px] h-[14px]
          text-white/0 group-hover:text-white/20
          hover:!text-red-500
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