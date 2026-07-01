import { apiClient } from './apiClient'

export type MyProfile = {
  id?: string
  display_name: string
  birth_date: string | null
  city: string
  bio: string
  avatar_url: string
  preview_track_url?: string
  updated_at?: string
}

export type UpdateMyProfilePayload = {
  display_name?: string
  birth_date?: string | null
  city?: string
  bio?: string
}

export async function getMyProfile(accessToken: string): Promise<MyProfile> {
  return apiClient<MyProfile>('/profiles/me/', {
    token: accessToken,
  })
}

export async function updateMyProfile(
  accessToken: string,
  payload: UpdateMyProfilePayload,
): Promise<MyProfile> {
  return apiClient<MyProfile>('/profiles/me/', {
    method: 'PATCH',
    token: accessToken,
    body: payload,
  })
}
