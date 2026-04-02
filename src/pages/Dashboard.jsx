import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import AllWidget from '../components/AllWidget'
import TodoPanel from '../components/Todos/TodoPannel'
import TodoFAB from '../components/Todos/TodoFAB'
import { useSelector,useDispatch } from 'react-redux'
import { CloseTodo } from '../store/uiSlice'
import { todosService } from '../supabase/todoServices'
import { setTodos } from '../store/todoSlice'

export default function Dashboard() {
  const isTodoOpen= useSelector((state)=>state.ui.isTodoOpen)
    const dispatch=useDispatch()
  // 🔴 Replace with Redux selector later
  const activeTodoCount = 3
  const userData= useSelector((state)=>state.auth.user)
  useEffect(() => {
    if(!userData) return;
    async function loadTodos() {
        try{
             const TodoData= await todosService.fetchTodos(userData.id)
             if(TodoData) dispatch(setTodos(TodoData))
        }
        catch(error){
            console.error('Failed to load todos:', error)
        }
    }

  }, [userData,dispatch])

  

  return (
    <div className="h-screen flex flex-col">

      {/* Navbar */}
      <Navbar />

      {/* Main Layout */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">

        {/* Left Section — Widget Grid */}
        <div className="w-full lg:w-14/20 p-4 overflow-y-auto">
          <AllWidget />
        </div>

        {/* Right Section — Desktop only */}
        <div className="hidden lg:flex lg:w-6/20 p-4 border-l border-white/5 overflow-y-auto">
          <TodoPanel />
        </div>

      </div>

      {/* Mobile FAB — hidden on desktop */}
      <TodoFAB
        count={activeTodoCount}/>

      {/* Mobile Todo Overlay */}
      {isTodoOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => dispatch(CloseTodo())}
          />

          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden
            animate-slide-up"
            style={{ height: '85vh' }}
          >
            <TodoPanel
              isMobile={true}
            />
          </div>
        </>
      )}

    </div>
  )
}