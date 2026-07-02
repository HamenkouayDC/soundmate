import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { AppHeader } from '../components/layout/AppHeader'
import { DecorativeDisc } from '../components/ui/DecorativeDisc'
import { PageHeader } from '../components/ui/PageHeader'
import { ApiError } from '../shared/api/apiClient'
import { refreshAccessToken } from '../shared/api/authApi'
import {
  getFeed,
  sendFeedAction,
  type FeedAction,
  type FeedUser,
} from '../shared/api/feedApi'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from '../shared/api/tokenStorage'

export function FeedPage() {
  const navigate = useNavigate()

  const [feedUsers, setFeedUsers] = useState<FeedUser[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastAction, setLastAction] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [error, setError] = useState('')

  const currentUser = feedUsers[currentIndex]

  const loadFeedWithToken = useCallback(async (token: string) => {
    const feed = await getFeed(token)

    setFeedUsers(feed.results)
    setCurrentIndex(0)
  }, [])

  const loadFeed = useCallback(async () => {
    const accessToken = getAccessToken()

    if (!accessToken) {
      navigate('/login')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setLastAction('')

      await loadFeedWithToken(accessToken)
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

          await loadFeedWithToken(newTokens.access)
        } catch {
          clearTokens()
          navigate('/login')
        }

        return
      }

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось загрузить ленту')
      }
    } finally {
      setIsLoading(false)
    }
  }, [loadFeedWithToken, navigate])

  useEffect(() => {
    loadFeed()
  }, [loadFeed])

  async function sendActionWithToken(
    token: string,
    targetUserId: string,
    action: FeedAction,
  ) {
    return sendFeedAction(token, targetUserId, action)
  }

  async function handleNext(action: FeedAction) {
    if (!currentUser || isActionLoading) {
      return
    }

    const accessToken = getAccessToken()

    if (!accessToken) {
      clearTokens()
      navigate('/login')
      return
    }

    try {
      setIsActionLoading(true)
      setError('')
      setLastAction('')

      const result = await sendActionWithToken(
        accessToken,
        currentUser.id,
        action,
      )

      if (action === 'like') {
        if (result.is_match) {
          setLastAction(`Это match с пользователем ${currentUser.name}!`)
        } else {
          setLastAction(`Лайк отправлен пользователю ${currentUser.name}`)
        }
      } else {
        setLastAction(`Пользователь ${currentUser.name} пропущен`)
      }

      setCurrentIndex((prevIndex) => prevIndex + 1)
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

          const result = await sendActionWithToken(
            newTokens.access,
            currentUser.id,
            action,
          )

          if (action === 'like') {
            if (result.is_match) {
              setLastAction(`Это match с пользователем ${currentUser.name}!`)
            } else {
              setLastAction(`Лайк отправлен пользователю ${currentUser.name}`)
            }
          } else {
            setLastAction(`Пользователь ${currentUser.name} пропущен`)
          }

          setCurrentIndex((prevIndex) => prevIndex + 1)
        } catch (refreshError) {
          if (refreshError instanceof Error) {
            setError(refreshError.message)
          } else {
            setError('Не удалось выполнить действие')
          }
        }

        return
      }

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось выполнить действие')
      }
    } finally {
      setIsActionLoading(false)
    }
  }

  function formatCompatibility(value: number) {
    return Math.round(value)
  }

  return (
    <main className="min-h-screen bg-[#f8f0ff]">
      <AppHeader activePage="feed" />

      <section className="relative overflow-hidden px-6 py-8 md:py-10">
        <div className="pointer-events-none absolute left-0 top-52 h-44 w-full bg-[linear-gradient(90deg,transparent,rgba(217,35,255,0.14),transparent)] blur-2xl" />

        <DecorativeDisc position="left" opacity="0.08" />

        {lastAction && (
          <div className="pointer-events-none fixed left-1/2 top-4 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-2xl border border-white/60 bg-white/90 px-5 py-3 text-center text-sm font-semibold text-[#100516] shadow-xl backdrop-blur-xl">
            {lastAction}
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-6xl">
          <PageHeader
            label="Лента анкет"
            title="Люди с похожим музыкальным вкусом"
            description="Карточки теперь приходят с backend через GET /feed/. Лайки и пропуски отправляются через POST /feed/actions/."
          />

          {error && (
            <p className="mb-6 inline-flex rounded-2xl border border-red-300 bg-red-100 px-5 py-3 text-sm font-semibold text-red-800">
              {error}
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-start">
            <aside className="hidden rounded-[34px] border border-white/60 bg-white/70 p-8 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl lg:block">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#9c20c7]">
                Как работает лента
              </p>

              <h2 className="text-3xl font-black text-[#100516]">
                Сначала музыка, потом знакомство
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                SoundMate показывает людей, с которыми у тебя могут совпадать
                жанры, исполнители и музыкальное настроение. Теперь данные
                берутся из backend, а уже пролайканные и пропущенные анкеты
                исключаются из ленты.
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                  <p className="text-sm font-black text-[#100516]">
                    Совместимость
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Процент приходит с backend в поле compatibility_percent.
                  </p>
                </div>

                <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                  <p className="text-sm font-black text-[#100516]">
                    Лайк / следующий
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Действия сохраняются на backend через endpoint
                    /feed/actions/.
                  </p>
                </div>

                <div className="rounded-3xl bg-[#08050d] p-5 text-white">
                  <p className="text-sm font-black">Backend connected</p>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Лента, лайки и пропуски уже подключены к реальному API.
                  </p>
                </div>
              </div>
            </aside>

            <div className="flex justify-center lg:justify-end">
              {isLoading ? (
                <div className="w-full max-w-md rounded-[34px] border border-white/60 bg-white/75 p-8 text-center shadow-[0_25px_80px_rgba(80,0,120,0.18)] backdrop-blur-xl">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#08050d] text-4xl text-[#f13bff] shadow-[0_0_30px_rgba(217,35,255,0.25)]">
                    ♪
                  </div>

                  <h2 className="mb-3 text-2xl font-black text-[#100516]">
                    Загружаем ленту...
                  </h2>

                  <p className="text-gray-600">
                    Получаем рекомендации с backend.
                  </p>
                </div>
              ) : currentUser ? (
                <article className="relative h-[620px] w-full max-w-[440px] overflow-hidden rounded-[36px] border border-[#d923ff]/70 bg-[#050208] shadow-[0_30px_90px_rgba(80,0,120,0.28)] md:h-[650px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#18091f] via-[#381145] to-[#050208]" />

                  <div className="absolute inset-0 opacity-80">
                    <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-[#d923ff]/25 blur-3xl" />
                    <div className="absolute -bottom-10 right-0 h-52 w-52 rounded-full bg-[#8b00d6]/40 blur-3xl" />
                  </div>

                  <div className="absolute left-1/2 top-5 z-10 flex -translate-x-1/2 gap-1.5">
                    {feedUsers.map((user) => (
                      <span
                        className={`h-2 w-2 rounded-full ${
                          user.id === currentUser.id
                            ? 'bg-white'
                            : 'bg-white/35'
                        }`}
                        key={user.id}
                      />
                    ))}
                  </div>

                  <div className="absolute inset-x-6 top-20 z-10 flex h-64 items-center justify-center overflow-hidden rounded-[30px] border border-white/10 bg-black/35 text-center md:inset-x-7 md:h-72">
                    {currentUser.avatar_url ? (
                      <img
                        className="h-full w-full object-cover"
                        src={currentUser.avatar_url}
                        alt={`Фото пользователя ${currentUser.name}`}
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,35,255,0.25),transparent_65%)]" />

                        <div className="relative">
                          <p className="text-8xl font-black text-[#f13bff]">
                            {currentUser.name[0]}
                          </p>

                          <p className="mt-3 text-sm font-semibold text-[#e8c8f3]">
                            фото пользователя
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/95 to-transparent p-6 pt-28 text-white md:p-7 md:pt-32">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-3xl font-black">
                          {currentUser.name}, {currentUser.age}
                        </h2>

                        <p className="mt-1 text-sm text-[#e8c8f3]">
                          {currentUser.city || 'Город не указан'} ·{' '}
                          {currentUser.mood || 'музыкальный вайб'}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#d923ff] px-4 py-2 text-sm font-bold shadow-[0_0_20px_rgba(217,35,255,0.45)]">
                        {formatCompatibility(
                          currentUser.compatibility_percent,
                        )}
                        %
                      </span>
                    </div>

                    <p className="mb-5 text-sm leading-6 text-white/85">
                      {currentUser.bio || 'Пользователь пока не добавил bio.'}
                    </p>

                    <div className="mb-5 grid gap-3">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#e8c8f3]">
                          Общие жанры
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {(currentUser.shared_genres.length > 0
                            ? currentUser.shared_genres
                            : currentUser.top_genres
                          ).map((genre) => (
                            <span
                              className="rounded-full border border-white/10 bg-white/15 px-3 py-1 text-xs font-semibold"
                              key={genre}
                            >
                              {genre}
                            </span>
                          ))}

                          {currentUser.shared_genres.length === 0 &&
                            currentUser.top_genres.length === 0 && (
                              <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1 text-xs font-semibold">
                                Жанры пока не указаны
                              </span>
                            )}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#e8c8f3]">
                          Общие исполнители
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {currentUser.shared_artists.map((artist) => (
                            <span
                              className="rounded-full border border-white/10 bg-white/15 px-3 py-1 text-xs font-semibold"
                              key={artist}
                            >
                              {artist}
                            </span>
                          ))}

                          {currentUser.shared_artists.length === 0 && (
                            <span className="rounded-full border border-white/10 bg-white/15 px-3 py-1 text-xs font-semibold">
                              Исполнители пока не указаны
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_64px] gap-3">
                      <button
                        className="rounded-2xl bg-white px-4 py-4 font-bold text-[#100516] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleNext('skip')}
                      >
                        {isActionLoading ? '...' : 'Следующий'}
                      </button>

                      <button
                        className="rounded-2xl bg-[#d923ff] px-4 py-4 text-2xl font-black text-white shadow-[0_0_25px_rgba(217,35,255,0.45)] transition hover:scale-[1.05] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => handleNext('like')}
                      >
                        ♥
                      </button>
                    </div>
                  </div>
                </article>
              ) : (
                <div className="w-full max-w-md rounded-[34px] border border-white/60 bg-white/75 p-8 text-center shadow-[0_25px_80px_rgba(80,0,120,0.18)] backdrop-blur-xl">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#08050d] text-4xl text-[#f13bff] shadow-[0_0_30px_rgba(217,35,255,0.25)]">
                    ♪
                  </div>

                  <h2 className="mb-3 text-2xl font-black text-[#100516]">
                    Анкеты закончились
                  </h2>

                  <p className="mb-6 text-gray-600">
                    Backend больше не отдаёт пользователей, которых ты уже
                    лайкнул или пропустил. Можно обновить ленту или попросить
                    backend заново выполнить seed_demo_profiles.
                  </p>

                  <button
                    className="rounded-2xl bg-[#d923ff] px-8 py-3 font-bold text-white shadow-[0_0_25px_rgba(217,35,255,0.35)] transition hover:scale-[1.02]"
                    type="button"
                    onClick={loadFeed}
                  >
                    Обновить ленту
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