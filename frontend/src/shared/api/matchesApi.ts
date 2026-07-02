import { apiClient } from './apiClient'

export type LastMessage = {
  id: string
  text: string
  created_at: string
  sender_id: string
}

export type MatchUser = {
  id: string
  name: string
  age: number
  birth_date: string | null
  city: string
  bio: string
  avatar_url: string
}

export type MatchItem = {
  match_id: string
  compatibility_percent: number
  shared_genres: string[]
  shared_artists: string[]
  last_message: LastMessage | null
  user: MatchUser
}

export type MatchesResponse = {
  results: MatchItem[]
}

export async function getMatches(accessToken: string): Promise<MatchesResponse> {
  return apiClient<MatchesResponse>('/matches/', {
    token: accessToken,
  })
}
