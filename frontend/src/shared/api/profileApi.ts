import { ApiError, apiClient } from './apiClient'

const API_URL = import.meta.env.VITE_API_URL

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

export async function uploadMyAvatar(
  accessToken: string,
  file: File,
): Promise<MyProfile> {
  const formData = new FormData()

  formData.append('avatar', file)

  const response = await fetch(`${API_URL}/profiles/me/avatar/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')

    throw new ApiError(
      `HTTP ${response.status}: ${
        errorText || 'Не удалось загрузить аватар'
      }`,
      response.status,
    )
  }

  return response.json()
}