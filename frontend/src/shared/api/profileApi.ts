import { apiClient } from './apiClient'

export type MyProfile = {
  id: string
  display_name: string
  birth_date: string | null
  bio: string
  avatar_url: string
  preview_track_url: string
  updated_at: string
}

export type UpdateProfileData = {
  display_name?: string
  birth_date?: string | null
  bio?: string
  avatar_url?: string
  preview_track_url?: string
}

export function getMyProfile(token: string) {
  return apiClient<MyProfile>('/profiles/me/', {
    token,
  })
}

export function updateMyProfile(token: string, data: UpdateProfileData) {
  return apiClient<MyProfile>('/profiles/me/', {
    method: 'PATCH',
    token,
    body: data,
  })
}