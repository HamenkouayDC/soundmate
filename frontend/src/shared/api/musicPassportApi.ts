import { apiClient } from './apiClient'

export type MusicPassportArtist = {
  name: string
  weight: number
  source: string
}

export type MusicPassportTrack = {
  title: string
  artist: string
  url: string
}

export type MusicPassport = {
  genres: string[]
  artists: MusicPassportArtist[]
  top_tracks: MusicPassportTrack[]
}

export async function getMusicPassport(
  accessToken: string,
): Promise<MusicPassport> {
  return apiClient<MusicPassport>('/music/passport/', {
    token: accessToken,
  })
}
