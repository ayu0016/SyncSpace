import { Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

import FullScreenSpinner from './FullScreenSpinner'

function ProtectedRoutes() {
  const user = useSelector((state) => state.auth.userData)
  const isInitialized = useSelector((state) => state.auth.isInitialized)

  if (!isInitialized) {
    return <FullScreenSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Outlet />
    </Suspense>
  )
}

export default ProtectedRoutes