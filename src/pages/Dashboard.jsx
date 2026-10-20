import { useEffect, useCallback, Suspense } from 'react'
import Navbar from '../components/Navbar'
import TodoPanel from '../components/Todos/TodoPannel'
import TodoFAB from '../components/Todos/TodoFAB'
import { useSelector, useDispatch } from 'react-redux'
import { CloseTodo } from '../store/uiSlice'
import { todosService } from '../supabase/todoServices'
import { setTodos } from '../store/todoSlice'
import { widgetService } from '../supabase/widgetServices'
import { entryService } from '../supabase/entryServices'
import { setWidgets } from '../store/widgetSlice'
import { setEntries } from '../store/entriesSlice'
import QuickAddModal from '../components/QuickAddModal'
import FullScreenSpinner from '../components/FullScreenSpinner'
import ErrorBoundary from '../components/ui/ErrorBoundary'

import { Outlet } from 'react-router-dom'

export default function Dashboard() {
    const isTodoOpen = useSelector((state) => state.ui.isTodoOpen)
    const isDesktopTodoOpen = useSelector((state) => state.ui.isDesktopTodoOpen ?? true)
    const dispatch = useDispatch()
    const activeTodoCount = useSelector((state) => state.todos.todos.filter(todo => !todo.completed).length)
    const userData = useSelector((state) => state.auth.userData)

    const fetchAll = useCallback(async () => {
        if (!userData) return
        try {
            const [todoData, widgetData, entryData] = await Promise.all([
                todosService.fetchTodos(userData.id),
                widgetService.getWidgets(userData.id),
                entryService.getAllEntries(userData.id),
            ])
            if (todoData)   dispatch(setTodos(todoData))
            if (widgetData) dispatch(setWidgets(widgetData))
            if (entryData)  dispatch(setEntries(entryData))
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
        }
    }, [userData, dispatch])

    useEffect(() => {
        fetchAll()
    }, [fetchAll])

    return (
        <div className="h-screen flex flex-col font-sans">

        {/* Navbar — Contains the unified Tasks toggle */}
        <Navbar />
        <QuickAddModal />

        {/* Main Layout */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden relative">

            {/* Left Section — Widget Grid / Deep Dive Outlet */}
            <div className={`w-full ${isDesktopTodoOpen ? 'lg:w-14/20' : 'lg:w-full'} p-4 sm:p-6 overflow-y-auto custom-scrollbar transition-all duration-300`}>
                <ErrorBoundary title="View error">
                    <Suspense fallback={<FullScreenSpinner />}>
                        <Outlet />
                    </Suspense>
                </ErrorBoundary>
            </div>

            {/* Right Section — Desktop only */}
            {isDesktopTodoOpen && (
                <div className="hidden lg:flex lg:w-6/20 p-4 border-l border-white/5 overflow-hidden transition-all duration-300">
                    <TodoPanel />
                </div>
            )}

        </div>

        {/* Mobile FAB — hidden on desktop */}
        <TodoFAB count={activeTodoCount} />

        {/* Mobile Todo Overlay */}
        {isTodoOpen && (
            <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                onClick={() => dispatch(CloseTodo())}
            />

            {/* Bottom Sheet */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden animate-slide-up"
                style={{ height: '85vh' }}
            >
                <TodoPanel isMobile={true} />
            </div>
            </>
        )}

        </div>
    )
}
