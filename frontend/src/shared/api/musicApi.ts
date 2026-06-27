import { apiClient } from './apiClient'

export type MusicProvider = 'spotify' | 'lastfm' | 'soundcloud' | 'yandex'

export type MusicConnection = {
  id: string
  provider: MusicProvider
  external_user_id: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type CreateMusicConnectionData = {
  provider: MusicProvider
  external_user_id: string
}

export function getMusicConnections(token: string) {
  return apiClient<MusicConnection[]>('/music/connections/', {
    token,
  })
}

export function createMusicConnection(
  token: string,
  data: CreateMusicConnectionData,
) {
  return apiClient<MusicConnection>('/music/connections/', {
    method: 'POST',
    token,
    body: data,
  })
}

export function deleteMusicConnection(token: string, connectionId: string) {
  return apiClient<null>(`/music/connections/${connectionId}/`, {
    method: 'DELETE',
    token,
  })
}