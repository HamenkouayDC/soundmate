import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { AppHeader } from '../components/layout/AppHeader'
import { DecorativeDisc } from '../components/ui/DecorativeDisc'
import { PageHeader } from '../components/ui/PageHeader'
import { ApiError } from '../shared/api/apiClient'
import { refreshAccessToken } from '../shared/api/authApi'
import { getMatches, type MatchItem } from '../shared/api/matchesApi'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from '../shared/api/tokenStorage'

export function MatchesPage() {
  const navigate = useNavigate()

  const [matches, setMatches] = useState<MatchItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMatchesWithToken = useCallback(async (token: string) => {
    const response = await getMatches(token)

    setMatches(response.results)
  }, [])

  const loadMatches = useCallback(async () => {
    const accessToken = getAccessToken()

    if (!accessToken) {
      navigate('/login')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      await loadMatchesWithToken(accessToken)
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

          await loadMatchesWithToken(newTokens.access)
        } catch {
          clearTokens()
          navigate('/login')
        }

        return
      }

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось загрузить матчи')
      }
    } finally {
      setIsLoading(false)
    }
  }, [loadMatchesWithToken, navigate])

  useEffect(() => {
    loadMatches()
  }, [loadMatches])

  function openChat(matchId: string) {
    navigate(`/chat/${matchId}`)
  }

  function formatCompatibility(value: number) {
    return Math.round(value)
  }

  function formatLastMessageDate(date: string) {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="min-h-screen bg-[#f8f0ff]">
      <AppHeader activePage="matches" />

      <section className="relative overflow-hidden px-6 py-8 md:py-10">
        <DecorativeDisc position="right" opacity="0.08" />

        <div className="pointer-events-none absolute left-0 top-52 h-44 w-full bg-[linear-gradient(90deg,transparent,rgba(217,35,255,0.14),transparent)] blur-2xl" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <PageHeader
            label="Матчи"
            title="Взаимные музыкальные совпадения"
            description="Матчи теперь приходят с backend через GET /matches/. Здесь отображаются пользователи, с которыми получился взаимный лайк."
          />

          {error && (
            <p className="mb-6 inline-flex rounded-2xl border border-red-300 bg-red-100 px-5 py-3 text-sm font-semibold text-red-800">
              {error}
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
            <aside className="rounded-[34px] border border-white/60 bg-white/70 p-8 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#9c20c7]">
                Backend connected
              </p>

              <h2 className="text-3xl font-black text-[#100516]">
                Здесь только взаимные лайки
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                Когда пользователь ставит лайк в ленте, backend проверяет,
                есть ли ответный лайк. Если есть, создаётся match, и он
                появляется на этой странице.
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                  <p className="text-sm font-black text-[#100516]">
                    Всего матчей
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#d923ff]">
                    {matches.length}
                  </p>
                </div>

                <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                  <p className="text-sm font-black text-[#100516]">
                    Совместимость
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Процент, общие жанры и исполнители приходят с backend.
                  </p>
                </div>

                <div className="rounded-3xl bg-[#08050d] p-5 text-white">
                  <p className="text-sm font-black">Чат</p>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Кнопка “Открыть чат” ведёт на страницу /chat/:matchId.
                  </p>
                </div>
              </div>
            </aside>

            <div>
              {isLoading ? (
                <div className="rounded-[34px] border border-white/60 bg-white/75 p-8 text-center shadow-[0_25px_80px_rgba(80,0,120,0.18)] backdrop-blur-xl">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#08050d] text-4xl text-[#f13bff] shadow-[0_0_30px_rgba(217,35,255,0.25)]">
                    ♥
                  </div>

                  <h2 className="mb-3 text-2xl font-black text-[#100516]">
                    Загружаем матчи...
                  </h2>

                  <p className="text-gray-600">
                    Получаем взаимные лайки с backend.
                  </p>
                </div>
              ) : matches.length > 0 ? (
                <div className="grid gap-5">
                  {matches.map((match) => {
                    const sharedGenres = match.shared_genres ?? []
                    const sharedArtists = match.shared_artists ?? []
                    const hasLastMessage = Boolean(match.last_message)

                    return (
                      <article
                        className="overflow-hidden rounded-[34px] border border-white/60 bg-white/75 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl"
                        key={match.match_id}
                      >
                        <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                          <div className="relative flex min-h-64 items-center justify-center overflow-hidden bg-[#08050d]">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#18091f] via-[#381145] to-[#050208]" />
                            <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d923ff]/30 blur-3xl" />

                            {match.user.avatar_url ? (
                              <img
                                className="relative z-10 h-full min-h-64 w-full object-cover"
                                src={match.user.avatar_url}
                                alt={`Фото пользователя ${match.user.name}`}
                              />
                            ) : (
                              <div className="relative z-10 text-center">
                                <p className="text-8xl font-black text-[#f13bff]">
                                  {match.user.name[0]}
                                </p>

                                <p className="mt-3 text-sm font-semibold text-[#e8c8f3]">
                                  фото пользователя
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="p-6 md:p-7">
                            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                              <div>
                                <h2 className="text-3xl font-black text-[#100516]">
                                  {match.user.name}, {match.user.age}
                                </h2>

                                <p className="mt-1 text-sm font-semibold text-gray-600">
                                  {match.user.city || 'Город не указан'}
                                </p>
                              </div>

                              <span className="w-fit rounded-full bg-[#d923ff] px-4 py-2 text-sm font-bold text-white shadow-[0_0_20px_rgba(217,35,255,0.35)]">
                                {formatCompatibility(
                                  match.compatibility_percent,
                                )}
                                % совпадение
                              </span>
                            </div>

                            <p className="mb-5 text-sm leading-6 text-gray-700">
                              {match.user.bio ||
                                'Пользователь пока не добавил описание.'}
                            </p>

                            <div className="mb-5 grid gap-4 md:grid-cols-2">
                              <div className="rounded-3xl bg-[#f8f0ff]/90 p-4">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#9c20c7]">
                                  Общие жанры
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {sharedGenres.length > 0 ? (
                                    sharedGenres.map((genre) => (
                                      <span
                                        className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#100516]"
                                        key={genre}
                                      >
                                        {genre}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                                      Нет данных
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="rounded-3xl bg-[#f8f0ff]/90 p-4">
                                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#9c20c7]">
                                  Общие исполнители
                                </p>

                                <div className="flex flex-wrap gap-2">
                                  {sharedArtists.length > 0 ? (
                                    sharedArtists.map((artist) => (
                                      <span
                                        className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#100516]"
                                        key={artist}
                                      >
                                        {artist}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                                      Нет данных
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mb-5 rounded-3xl bg-[#08050d] p-4 text-white">
                              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#f13bff]">
                                Последнее сообщение
                              </p>

                              {hasLastMessage && match.last_message ? (
                                <>
                                  <p className="text-sm leading-6 text-white/85">
                                    {match.last_message.text}
                                  </p>

                                  <p className="mt-2 text-xs text-white/45">
                                    {formatLastMessageDate(
                                      match.last_message.created_at,
                                    )}
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm leading-6 text-white/65">
                                  Сообщений пока нет. Можно начать диалог.
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                              <button
                                className="rounded-2xl bg-[#d923ff] px-6 py-4 font-bold text-white shadow-[0_0_25px_rgba(217,35,255,0.35)] transition hover:scale-[1.02]"
                                type="button"
                                onClick={() => openChat(match.match_id)}
                              >
                                Открыть чат
                              </button>

                              <button
                                className="rounded-2xl bg-[#100516] px-6 py-4 font-bold text-white transition hover:scale-[1.02]"
                                type="button"
                                onClick={() => openChat(match.match_id)}
                              >
                                Написать сообщение
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-[34px] border border-white/60 bg-white/75 p-8 text-center shadow-[0_25px_80px_rgba(80,0,120,0.18)] backdrop-blur-xl">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#08050d] text-4xl text-[#f13bff] shadow-[0_0_30px_rgba(217,35,255,0.25)]">
                    ♥
                  </div>

                  <h2 className="mb-3 text-2xl font-black text-[#100516]">
                    Матчей пока нет
                  </h2>

                  <p className="mb-6 text-gray-600">
                    Поставь лайки в ленте. Если backend найдёт взаимный лайк,
                    match появится здесь.
                  </p>

                  <button
                    className="rounded-2xl bg-[#d923ff] px-8 py-3 font-bold text-white shadow-[0_0_25px_rgba(217,35,255,0.35)] transition hover:scale-[1.02]"
                    type="button"
                    onClick={() => navigate('/feed')}
                  >
                    Перейти в ленту
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}