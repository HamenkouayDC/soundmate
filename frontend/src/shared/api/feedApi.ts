import { apiClient } from './apiClient'

export type FeedUser = {
  id: string
  name: string
  age: number
  birth_date: string | null
  city: string
  bio: string
  avatar_url: string
  compatibility_percent: number
  shared_genres: string[]
  shared_artists: string[]
  top_genres: string[]
  mood: string
}

export type FeedResponse = {
  results: FeedUser[]
}

export type FeedAction = 'like' | 'skip'

export type FeedActionResponse = {
  action: FeedAction
  is_match: boolean
  match_id: string | null
}

export async function getFeed(accessToken: string): Promise<FeedResponse> {
  return apiClient<FeedResponse>('/feed/', {
    token: accessToken,
  })
}

export async function sendFeedAction(
  accessToken: string,
  targetUserId: string,
  action: FeedAction,
): Promise<FeedActionResponse> {
  return apiClient<FeedActionResponse>('/feed/actions/', {
    method: 'POST',
    token: accessToken,
    body: {
      target_user_id: targetUserId,
      action,
    },
  })
}

