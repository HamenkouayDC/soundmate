import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { getAccessToken } from '../../shared/api/tokenStorage'

type PublicRouteProps = {
  children: ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const token = getAccessToken()

  if (token) {
    return <Navigate to="/feed" replace />
  }

  return children
}
