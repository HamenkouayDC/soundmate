import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router'

import { AppHeader } from '../components/layout/AppHeader'
import { DecorativeDisc } from '../components/ui/DecorativeDisc'
import { PageHeader } from '../components/ui/PageHeader'
import { ApiError } from '../shared/api/apiClient'
import { refreshAccessToken } from '../shared/api/authApi'
import {
  getChatMessages,
  sendChatMessage,
  type ChatMessage,
} from '../shared/api/chatApi'
import { getMatches, type MatchItem } from '../shared/api/matchesApi'
import { getCurrentUser, type CurrentUser } from '../shared/api/userApi'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from '../shared/api/tokenStorage'

export function ChatPage() {
  const navigate = useNavigate()
  const params = useParams()
  const matchId = params.matchId ?? params.id ?? ''

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [match, setMatch] = useState<MatchItem | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')

  const loadChatWithToken = useCallback(
    async (token: string) => {
      if (!matchId) {
        navigate('/matches')
        return
      }

      const [user, chatMessages] = await Promise.all([
        getCurrentUser(token),
        getChatMessages(token, matchId),
      ])

      setCurrentUser(user)
      setMessages(chatMessages)

      try {
        const matchesResponse = await getMatches(token)
        const currentMatch =
          matchesResponse.results.find((item) => item.match_id === matchId) ??
          null

        setMatch(currentMatch)
      } catch {
        setMatch(null)
      }
    },
    [matchId, navigate],
  )

  const loadChat = useCallback(async () => {
    const accessToken = getAccessToken()

    if (!accessToken) {
      navigate('/login')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      await loadChatWithToken(accessToken)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
          clearTokens()
          navigate('/login')
          return
        }

        try {
          const newTokens = await refreshAccessToken(refreshToken)

          saveAccessToken(newTokens.access)

          await loadChatWithToken(newTokens.access)
        } catch {
          clearTokens()
          navigate('/login')
        }

        return
      }

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось загрузить чат')
      }
    } finally {
      setIsLoading(false)
    }
  }, [loadChatWithToken, navigate])

  useEffect(() => {
    loadChat()
  }, [loadChat])

  async function sendMessageWithToken(token: string, text: string) {
    if (!matchId) {
      throw new Error('Match id не найден')
    }

    return sendChatMessage(token, matchId, text)
  }

  async function handleSendMessage() {
    const trimmedText = messageText.trim()

    if (!trimmedText || isSending) {
      return
    }

    const accessToken = getAccessToken()

    if (!accessToken) {
      clearTokens()
      navigate('/login')
      return
    }

    try {
      setIsSending(true)
      setError('')

      const createdMessage = await sendMessageWithToken(
        accessToken,
        trimmedText,
      )

      setMessages((currentMessages) => [...currentMessages, createdMessage])
      setMessageText('')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
          clearTokens()
          navigate('/login')
          return
        }

        try {
          const newTokens = await refreshAccessToken(refreshToken)

          saveAccessToken(newTokens.access)

          const createdMessage = await sendMessageWithToken(
            newTokens.access,
            trimmedText,
          )

          setMessages((currentMessages) => [...currentMessages, createdMessage])
          setMessageText('')
        } catch (refreshError) {
          if (refreshError instanceof Error) {
            setError(refreshError.message)
          } else {
            setError('Не удалось отправить сообщение')
          }
        }

        return
      }

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось отправить сообщение')
      }
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  function formatMessageTime(date: string) {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f0ff]">
        <AppHeader activePage="matches" />

        <section className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6">
          <div className="rounded-[34px] border border-white/60 bg-white/75 p-8 text-center shadow-[0_25px_80px_rgba(80,0,120,0.18)] backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#08050d] text-4xl text-[#f13bff]">
              ♪
            </div>

            <h2 className="text-2xl font-black text-[#100516]">
              Загружаем чат...
            </h2>
          </div>
        </section>
      </main>
    )
  }

  const partner = match?.user
  const chatTitle = partner ? `Диалог с ${partner.name}` : 'Чат'
  const partnerName = partner?.name ?? 'Пользователь'
  const partnerAge = partner?.age
  const partnerCity = partner?.city ?? 'Город не указан'
  const partnerBio =
    partner?.bio ?? 'Данные пользователя доступны через список матчей.'
  const partnerAvatarUrl = partner?.avatar_url ?? ''
  const partnerLetter = partnerName[0]?.toUpperCase() || 'S'
  const compatibility = match?.compatibility_percent

  return (
    <main className="min-h-screen bg-[#f8f0ff]">
      <AppHeader activePage="matches" />

      <section className="relative overflow-hidden px-6 py-8 md:py-10">
        <DecorativeDisc position="right" opacity="0.08" />

        <div className="pointer-events-none absolute left-0 top-52 h-44 w-full bg-[linear-gradient(90deg,transparent,rgba(217,35,255,0.14),transparent)] blur-2xl" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <PageHeader
            label="Чат"
            title={chatTitle}
            description="Сообщения загружаются и сохраняются через backend."
          />

          {error && (
            <p className="mb-6 inline-flex rounded-2xl border border-red-300 bg-red-100 px-5 py-3 text-sm font-semibold text-red-800">
              {error}
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-[340px_1fr] lg:items-start">
            <aside className="rounded-[34px] border border-white/60 bg-white/75 p-6 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
              <div className="relative mb-5 flex h-64 items-center justify-center overflow-hidden rounded-[30px] bg-[#08050d]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#18091f] via-[#381145] to-[#050208]" />
                <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d923ff]/30 blur-3xl" />

                {partnerAvatarUrl ? (
                  <img
                    className="relative z-10 h-full w-full object-cover"
                    src={partnerAvatarUrl}
                    alt={`Фото пользователя ${partnerName}`}
                  />
                ) : (
                  <div className="relative z-10 text-center">
                    <p className="text-8xl font-black text-[#f13bff]">
                      {partnerLetter}
                    </p>

                    <p className="mt-3 text-sm font-semibold text-[#e8c8f3]">
                      фото пользователя
                    </p>
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black text-[#100516]">
                {partnerAge ? `${partnerName}, ${partnerAge}` : partnerName}
              </h2>

              <p className="mt-1 text-sm font-semibold text-gray-600">
                {partnerCity}
              </p>

              <p className="mt-4 text-sm leading-6 text-gray-700">
                {partnerBio}
              </p>

              <div className="mt-5 rounded-3xl bg-[#f8f0ff]/90 p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#9c20c7]">
                  Совместимость
                </p>

                <p className="text-3xl font-black text-[#d923ff]">
                  {typeof compatibility === 'number'
                    ? `${Math.round(compatibility)}%`
                    : '—'}
                </p>
              </div>

              <button
                className="mt-5 w-full rounded-2xl bg-[#100516] px-6 py-4 font-bold text-white transition hover:scale-[1.02]"
                type="button"
                onClick={() => navigate('/matches')}
              >
                Назад к матчам
              </button>
            </aside>

            <section className="overflow-hidden rounded-[34px] border border-white/60 bg-white/75 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
              <div className="border-b border-[#d923ff]/15 bg-white/70 px-6 py-5">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#9c20c7]">
                  Backend chat
                </p>

                <h2 className="mt-1 text-2xl font-black text-[#100516]">
                  Сообщения
                </h2>
              </div>

              <div className="flex h-[520px] flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                  {messages.length > 0 ? (
                    messages.map((message) => {
                      const isMine = message.sender_id === currentUser?.id

                      return (
                        <div
                          className={`flex ${
                            isMine ? 'justify-end' : 'justify-start'
                          }`}
                          key={message.id}
                        >
                          <div
                            className={`max-w-[78%] rounded-3xl px-5 py-3 shadow-sm ${
                              isMine
                                ? 'bg-[#d923ff] text-white'
                                : 'bg-[#f8f0ff] text-[#100516]'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {message.text}
                            </p>

                            <p
                              className={`mt-2 text-xs ${
                                isMine ? 'text-white/65' : 'text-gray-500'
                              }`}
                            >
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex h-full items-center justify-center text-center">
                      <div>
                        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#08050d] text-4xl text-[#f13bff]">
                          ♪
                        </div>

                        <h3 className="mb-2 text-2xl font-black text-[#100516]">
                          Сообщений пока нет
                        </h3>

                        <p className="text-sm text-gray-600">
                          Напиши первое сообщение. Оно сохранится на backend.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#d923ff]/15 bg-white/80 p-4">
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <textarea
                      className="min-h-14 resize-none rounded-2xl border border-[#d923ff]/35 bg-white px-4 py-3 text-sm leading-6 text-[#100516] outline-none transition focus:border-[#d923ff] focus:ring-4 focus:ring-[#d923ff]/20"
                      placeholder="Напиши сообщение..."
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      onKeyDown={handleKeyDown}
                    />

                    <button
                      className="rounded-2xl bg-[#d923ff] px-7 py-4 font-bold text-white shadow-[0_0_25px_rgba(217,35,255,0.35)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                      type="button"
                      disabled={!messageText.trim() || isSending}
                      onClick={handleSendMessage}
                    >
                      {isSending ? 'Отправка...' : 'Отправить'}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Enter — отправить, Shift + Enter — новая строка.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}