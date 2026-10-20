import { useEffect, Suspense } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { login, logout, setAuthInitialized } from './store/authSlice'
import { authService } from './supabase/auth'
import FullScreenSpinner from './components/FullScreenSpinner'
import Tooltip from './components/ui/Tooltip'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    authService.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          dispatch(login(session.user))
        } else {
          dispatch(setAuthInitialized())
        }
      })
      .catch(() => {
        dispatch(setAuthInitialized())
      })

    const { data: { subscription } } = authService.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          dispatch(login(session.user))
        } else if (event === 'SIGNED_OUT') {
          dispatch(logout())
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [dispatch])

  return (
    <>
      <Suspense fallback={<FullScreenSpinner />}>
        <Outlet />
      </Suspense>
      <Tooltip id="syncspace-tooltip" />
    </>
  )
}