import React from 'react'
import { Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
function ProtectedRoutes() {
  const { isAuthenticated } = useSelector((state) => state.auth)
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Outlet />
    </Suspense>
  )
}

export default ProtectedRoutes