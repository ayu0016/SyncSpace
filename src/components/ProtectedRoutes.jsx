import React from 'react'
import { Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

import FullScreenSpinner from './FullScreenSpinner'

function ProtectedRoutes() {
    const User = useSelector((state) => state.auth.userData)
  if (!User) {
    return <Navigate to="/login" />
  }
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Outlet />
    </Suspense>
  )
}

export default ProtectedRoutes