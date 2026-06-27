import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { DecorativeDisc } from '../components/ui/DecorativeDisc'
import { PageHeader } from '../components/ui/PageHeader'
import { Tag } from '../components/ui/Tag'
import { ApiError } from '../shared/api/apiClient'
import { refreshAccessToken } from '../shared/api/authApi'
import {
  createMusicConnection,
  deleteMusicConnection,
  getMusicConnections,
  type MusicConnection,
  type MusicProvider,
} from '../shared/api/musicApi'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from '../shared/api/tokenStorage'

type ProviderCard = {
  provider: MusicProvider
  name: string
  description: string
  note: string
}

const providerCards: ProviderCard[] = [
  {
    provider: 'spotify',
    name: 'Spotify',
    description: 'Подключение музыкального профиля Spotify.',
    note: 'OAuth будет позже, сейчас используется backend stub.',
  },
  {
    provider: 'lastfm',
    name: 'Last.fm',
    description: 'История прослушиваний и музыкальные предпочтения.',
    note: 'Можно показать подключение без настоящей авторизации.',
  },
  {
    provider: 'soundcloud',
    name: 'SoundCloud',
    description: 'Музыка, плейлисты и любимые исполнители.',
    note: 'Пока работает как демонстрационный Music Passport.',
  },
  {
    provider: 'yandex',
    name: 'Yandex Music',
    description: 'Будущая интеграция с Яндекс Музыкой.',
    note: 'Полный OAuth будет подключён на следующих этапах.',
  },
]

function getProviderIcon(provider: MusicProvider) {
  const icons: Record<MusicProvider, string> = {
    spotify: 'S',
    lastfm: 'L',
    soundcloud: 'C',
    yandex: 'Y',
  }

  return icons[provider]
}

function getProviderMockExternalId(provider: MusicProvider) {
  return `${provider}_demo_${Date.now()}`
}

export function MusicPage() {
  const navigate = useNavigate()

  const [connections, setConnections] = useState<MusicConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingProvider, setProcessingProvider] =
    useState<MusicProvider | null>(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const activeConnections = useMemo(
    () => connections.filter((connection) => connection.is_active !== false),
    [connections],
  )

  async function executeWithAuth<T>(request: (token: string) => Promise<T>) {
    const accessToken = getAccessToken()

    if (!accessToken) {
      clearTokens()
      navigate('/login')
      throw new Error('Пользователь не авторизован')
    }

    try {
      return await request(accessToken)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const refreshToken = getRefreshToken()

        if (!refreshToken) {
          clearTokens()
          navigate('/login')
          throw err
        }

        const newTokens = await refreshAccessToken(refreshToken)

        saveAccessToken(newTokens.access)

        return request(newTokens.access)
      }

      throw err
    }
  }

  async function loadConnections() {
    try {
      setIsLoading(true)
      setError('')

      const loadedConnections = await executeWithAuth((token) =>
        getMusicConnections(token),
      )

      setConnections(loadedConnections)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось загрузить музыкальные подключения')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadConnections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function getActiveConnection(provider: MusicProvider) {
    return activeConnections.find(
      (connection) => connection.provider === provider,
    )
  }

  async function handleConnect(provider: MusicProvider) {
    if (getActiveConnection(provider)) {
      return
    }

    try {
      setProcessingProvider(provider)
      setError('')
      setSuccessMessage('')

      await executeWithAuth((token) =>
        createMusicConnection(token, {
          provider,
          external_user_id: getProviderMockExternalId(provider),
        }),
      )

      await loadConnections()

      setSuccessMessage('Музыкальный сервис подключён через backend stub.')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось подключить музыкальный сервис')
      }
    } finally {
      setProcessingProvider(null)
    }
  }

  async function handleDisconnect(provider: MusicProvider) {
    const activeConnection = getActiveConnection(provider)

    if (!activeConnection) {
      return
    }

    try {
      setProcessingProvider(provider)
      setError('')
      setSuccessMessage('')

      await executeWithAuth((token) =>
        deleteMusicConnection(token, activeConnection.id),
      )

      setConnections((currentConnections) =>
        currentConnections.map((connection) =>
          connection.id === activeConnection.id
            ? {
                ...connection,
                is_active: false,
              }
            : connection,
        ),
      )

      setSuccessMessage('Музыкальный сервис отключён.')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось отключить музыкальный сервис')
      }
    } finally {
      setProcessingProvider(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f0ff]">
      <AppHeader activePage="music" />

      <section className="relative overflow-hidden px-6 py-10">
        <DecorativeDisc position="right" opacity="0.08" />

        <div className="pointer-events-none absolute left-0 top-52 h-44 w-full bg-[linear-gradient(90deg,transparent,rgba(217,35,255,0.14),transparent)] blur-2xl" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <PageHeader
            label="Music Passport"
            title="Подключи музыкальные сервисы"
            description="Здесь пользователь сможет связать свои музыкальные профили с SoundMate. Сейчас backend даёт stub-подключения без настоящего OAuth."
          />

          {successMessage && (
            <p className="mb-6 inline-flex rounded-2xl border border-green-300 bg-green-100 px-5 py-3 text-sm font-semibold text-green-800">
              {successMessage}
            </p>
          )}

          {error && (
            <p className="mb-6 inline-flex rounded-2xl border border-red-300 bg-red-100 px-5 py-3 text-sm font-semibold text-red-800">
              {error}
            </p>
          )}

          <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
            <aside className="rounded-[34px] border border-white/60 bg-white/75 p-8 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#9c20c7]">
                Статус
              </p>

              <h2 className="text-3xl font-black text-[#100516]">
                {activeConnections.length} из {providerCards.length} подключено
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                Эти подключения уже сохраняются через backend. Но настоящая
                авторизация через Spotify, Last.fm, SoundCloud или Яндекс
                Музыку будет добавлена позже.
              </p>

              <div className="mt-8 rounded-3xl bg-[#08050d] p-5 text-white">
                <p className="text-sm font-black">Что уже работает</p>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  Frontend получает список подключений, создаёт новое
                  подключение и отключает его через API.
                </p>
              </div>

              <div className="mt-5 rounded-3xl bg-[#f8f0ff]/90 p-5">
                <p className="text-sm font-black text-[#100516]">
                  Что будет позже
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  OAuth, импорт треков, анализ жанров, музыкальный профиль и
                  рекомендации.
                </p>
              </div>
            </aside>

            <div className="space-y-5">
              {isLoading ? (
                <div className="rounded-[34px] border border-white/60 bg-white/75 p-8 text-center shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
                  <p className="font-semibold text-[#100516]">
                    Загружаем музыкальные подключения...
                  </p>
                </div>
              ) : (
                providerCards.map((card) => {
                  const activeConnection = getActiveConnection(card.provider)
                  const isConnected = Boolean(activeConnection)
                  const isProcessing = processingProvider === card.provider

                  return (
                    <article
                      className="overflow-hidden rounded-[34px] border border-white/60 bg-white/75 p-5 shadow-[0_25px_80px_rgba(80,0,120,0.12)] backdrop-blur-xl transition md:hover:-translate-y-1 md:hover:shadow-[0_30px_90px_rgba(80,0,120,0.18)]"
                      key={card.provider}
                    >
                      <div className="flex flex-col gap-5 md:grid md:grid-cols-[110px_1fr_auto] md:items-center">
                        <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-[28px] border border-[#d923ff]/60 bg-gradient-to-br from-[#120617] via-[#3b0b4d] to-[#d923ff]">
                          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#f13bff]/40 blur-2xl" />

                          <span className="relative text-5xl font-black text-[#f13bff]">
                            {getProviderIcon(card.provider)}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-black text-[#100516]">
                              {card.name}
                            </h2>

                            {isConnected ? (
                              <Tag variant="genre">Подключено</Tag>
                            ) : (
                              <Tag variant="neutral">Не подключено</Tag>
                            )}
                          </div>

                          <p className="text-sm leading-6 text-gray-600">
                            {card.description}
                          </p>

                          <p className="mt-2 text-xs font-semibold text-gray-500">
                            {card.note}
                          </p>

                          {activeConnection && (
                            <p className="mt-3 rounded-2xl bg-[#f8f0ff] px-4 py-3 text-xs font-semibold text-[#100516]">
                              external_user_id:{' '}
                              {activeConnection.external_user_id}
                            </p>
                          )}
                        </div>

                        <div className="flex md:justify-end">
                          {isConnected ? (
                            <Button
                              type="button"
                              variant="light"
                              disabled={isProcessing}
                              onClick={() => handleDisconnect(card.provider)}
                            >
                              {isProcessing ? 'Отключение...' : 'Отключить'}
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleConnect(card.provider)}
                            >
                              {isProcessing ? 'Подключение...' : 'Подключить'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}