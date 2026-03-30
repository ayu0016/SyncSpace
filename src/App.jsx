import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { login, logout } from './store/authSlice'
import { authService } from './supabase/auth'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {

    // Check existing session on load
    authService.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch(login(session.user))
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          dispatch(login(session.user))
        } else {
          dispatch(logout())
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [dispatch])

  return <Dashboard />
}