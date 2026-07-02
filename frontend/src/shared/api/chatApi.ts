import { apiClient } from './apiClient'

export type ChatMessage = {
  id: string
  text: string
  created_at: string
  sender_id: string
}

type ChatMessagesRawResponse = ChatMessage[] | {
  results: ChatMessage[]
}

function normalizeMessages(response: ChatMessagesRawResponse): ChatMessage[] {
  if (Array.isArray(response)) {
    return response
  }

  return response.results
}

export async function getChatMessages(
  accessToken: string,
  matchId: string,
): Promise<ChatMessage[]> {
  const response = await apiClient<ChatMessagesRawResponse>(
    `/matches/${matchId}/messages/`,
    {
      token: accessToken,
    },
  )

  return normalizeMessages(response)
}

export async function sendChatMessage(
  accessToken: string,
  matchId: string,
  text: string,
): Promise<ChatMessage> {
  return apiClient<ChatMessage>(`/matches/${matchId}/messages/`, {
    method: 'POST',
    token: accessToken,
    body: {
      text,
    },
  })
}
