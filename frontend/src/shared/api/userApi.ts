import { apiClient } from './apiClient'

export type CurrentUser = {
  id: number
  email: string
  display_name?: string
}

export function getCurrentUser(token: string) {
  return apiClient<CurrentUser>('/users/me/', {
    token,
  })
}