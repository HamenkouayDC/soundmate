import { apiClient } from './apiClient'

export type UserProfile = {
  id: string
  display_name: string
  birth_date: string | null
  bio: string
  avatar_url: string
  preview_track_url: string
  updated_at: string
}

export type CurrentUser = {
  id: string
  email: string
  created_at: string
  profile: UserProfile
}

export function getCurrentUser(token: string) {
  return apiClient<CurrentUser>('/users/me/', {
    token,
  })
}