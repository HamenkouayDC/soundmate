import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { getAccessToken } from '../../shared/api/tokenStorage'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getAccessToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}