import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

import { AppHeader } from '../components/layout/AppHeader'
import { ApiError } from '../shared/api/apiClient'
import { refreshAccessToken } from '../shared/api/authApi'
import { getCurrentUser, type CurrentUser } from '../shared/api/userApi'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from '../shared/api/tokenStorage'

const mockGenres = ['Indie', 'Rock', 'Hip-Hop', 'Pop']
const mockArtists = ['Arctic Monkeys', 'Nirvana', 'The Weeknd']

export function ProfilePage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const accessToken = getAccessToken()

      if (!accessToken) {
        navigate('/login')
        return
      }

      try {
        const currentUser = await getCurrentUser(accessToken)
        setUser(currentUser)
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

            const currentUser = await getCurrentUser(newTokens.access)
            setUser(currentUser)
          } catch {
            clearTokens()
            navigate('/login')
          }

          return
        }

        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Не удалось загрузить профиль')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [navigate])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f0ff]">
        <AppHeader activePage="profile" />

        <section className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6">
          <p className="rounded-3xl border border-white/30 bg-white/70 px-8 py-5 font-semibold text-[#100516] shadow-xl backdrop-blur">
            Загружаем профиль...
          </p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f8f0ff]">
        <AppHeader activePage="profile" />

        <section className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6">
          <p className="rounded-3xl bg-red-500/20 px-8 py-5 font-semibold text-red-700">
            {error}
          </p>
        </section>
      </main>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.profile.display_name || 'Пользователь'
  const avatarLetter = displayName[0]?.toUpperCase() || 'S'
  const birthDate = user.profile.birth_date || 'Не указана'

  const bio =
    user.profile.bio ||
    'Расскажи немного о себе, любимой музыке и концертах, на которые хочешь сходить.'

  return (
    <main className="min-h-screen bg-[#f8f0ff]">
      <AppHeader activePage="profile" />

      <section className="relative overflow-hidden px-6 py-10">
        <div
          className="pointer-events-none absolute -right-36 top-32 hidden h-[590px] w-[590px] rounded-full opacity-[0.10] blur-[0.5px] lg:block"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.92) 7%, rgba(185,80,190,0.55) 8%, rgba(185,80,190,0.55) 14%, transparent 15%, transparent 26%, rgba(255,255,255,0.32) 27%, rgba(255,255,255,0.32) 29%, transparent 30%, transparent 42%, rgba(255,255,255,0.18) 43%, rgba(255,255,255,0.18) 44%, transparent 45%), conic-gradient(from 30deg, #160014, #7c0b78, #e13cff, #5d0a68, #ff70d9, #26001f, #b912bf, #160014)',
            boxShadow: '0 0 140px rgba(217,35,255,0.28)',
          }}
        />

        <div className="pointer-events-none absolute -right-16 top-28 hidden h-[520px] w-[520px] rounded-full bg-[#d923ff]/10 blur-3xl lg:block" />

        <div className="pointer-events-none absolute left-0 top-52 h-44 w-full bg-[linear-gradient(90deg,transparent,rgba(217,35,255,0.14),transparent)] blur-2xl" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9c20c7]">
              Мой профиль
            </p>

            <h1 className="mt-2 max-w-3xl text-4xl font-black text-[#100516] md:text-5xl">
              Настрой, как тебя увидят другие
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              Здесь собрана основная информация о тебе и музыкальные интересы.
              Позже эти данные можно будет редактировать через backend.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <aside className="relative rounded-[34px] border border-white/60 bg-white/70 p-6 shadow-[0_25px_80px_rgba(80,0,120,0.16)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-bold text-[#100516]">
                  Фото профиля
                </p>

                <span className="rounded-full bg-[#f4d8ff] px-3 py-1 text-xs font-bold text-[#9c20c7]">
                  4 фото
                </span>
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-[#d923ff]/60 bg-gradient-to-br from-[#120617] via-[#3b0b4d] to-[#d923ff] p-4 shadow-[0_0_35px_rgba(217,35,255,0.18)]">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f13bff]/40 blur-2xl" />

                <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-[24px] bg-black/35">
                  {user.profile.avatar_url ? (
                    <img
                      className="h-full w-full object-cover"
                      src={user.profile.avatar_url}
                      alt="Аватар пользователя"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="block text-8xl font-black text-[#f13bff]">
                        {avatarLetter}
                      </span>

                      <span className="mt-3 block text-sm font-semibold text-[#e8c8f3]">
                        фото пока не добавлено
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative mt-4 flex justify-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span className="h-2 w-2 rounded-full bg-white/45" />
                  <span className="h-2 w-2 rounded-full bg-white/45" />
                  <span className="h-2 w-2 rounded-full bg-white/45" />
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-3xl font-black text-[#100516]">
                  {displayName}
                </h2>

                <p className="mt-1 text-sm text-gray-600">{user.email}</p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl bg-[#f8f0ff]/90 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9c20c7]">
                    Дата регистрации
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#100516]">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8f0ff]/90 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#9c20c7]">
                    Статус
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#100516]">
                    Профиль подключён к backend
                  </p>
                </div>
              </div>
            </aside>

            <div className="space-y-8">
              <section className="rounded-[34px] border border-white/60 bg-white/75 p-8 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
                <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <h2 className="text-2xl font-black text-[#100516]">
                      Основная информация
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                      Эти данные будут использоваться в анкете и рекомендациях.
                    </p>
                  </div>

                  <span className="rounded-full bg-[#100516] px-4 py-2 text-xs font-bold text-white">
                    Только просмотр
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#100516]">
                      Имя
                    </label>

                    <input
                      className="w-full rounded-2xl border border-[#d923ff]/45 bg-white/80 px-4 py-3 text-sm text-[#100516] outline-none"
                      value={displayName}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#100516]">
                      Город
                    </label>

                    <input
                      className="w-full rounded-2xl border border-[#d923ff]/45 bg-white/80 px-4 py-3 text-sm text-[#100516] outline-none"
                      value="Будет добавлено позже"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#100516]">
                      Возраст / дата рождения
                    </label>

                    <input
                      className="w-full rounded-2xl border border-[#d923ff]/45 bg-white/80 px-4 py-3 text-sm text-[#100516] outline-none"
                      value={birthDate}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#100516]">
                      Email
                    </label>

                    <input
                      className="w-full rounded-2xl border border-[#d923ff]/45 bg-white/80 px-4 py-3 text-sm text-[#100516] outline-none"
                      value={user.email}
                      readOnly
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-bold text-[#100516]">
                      О себе
                    </label>

                    <span className="text-xs font-semibold text-gray-500">
                      {bio.length}/500
                    </span>
                  </div>

                  <textarea
                    className="min-h-36 w-full resize-none rounded-2xl border border-[#d923ff]/45 bg-white/80 px-4 py-3 text-sm leading-6 text-[#100516] outline-none"
                    value={bio}
                    readOnly
                  />
                </div>
              </section>

              <section className="rounded-[34px] border border-white/60 bg-white/75 p-8 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
                <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <h2 className="text-2xl font-black text-[#100516]">
                      Мой музыкальный вкус
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                      Сейчас это mock-данные. Позже сюда можно подключить
                      Spotify или backend-поля.
                    </p>
                  </div>

                  <button
                    className="rounded-2xl bg-[#d923ff] px-6 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(217,35,255,0.35)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-80"
                    type="button"
                    disabled
                  >
                    Редактирование скоро
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#9c20c7]">
                      Любимые жанры
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {mockGenres.map((genre) => (
                        <span
                          className="rounded-full border border-[#d923ff] bg-[#fff8c7] px-5 py-2 text-sm font-bold text-[#100516]"
                          key={genre}
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#9c20c7]">
                      Любимые исполнители
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {mockArtists.map((artist) => (
                        <span
                          className="rounded-full border border-[#d923ff] bg-[#f8c7ff] px-5 py-2 text-sm font-bold text-[#100516]"
                          key={artist}
                        >
                          {artist}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-[34px] border border-[#d923ff]/40 bg-[#08050d] p-8 text-white shadow-[0_25px_80px_rgba(80,0,120,0.18)]">
                <div className="grid gap-6 md:grid-cols-[1fr_220px] md:items-center">
                  <div>
                    <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#f13bff]">
                      Preview
                    </p>

                    <h2 className="text-2xl font-black">
                      Так тебя увидят другие
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                      В ленте будет отображаться короткая карточка: имя, фото,
                      описание и музыкальные совпадения. Позже этот блок можно
                      связать с реальным backend.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/10 p-4">
                    <div className="mb-4 flex h-32 items-center justify-center rounded-2xl bg-black/40 text-5xl font-black text-[#f13bff]">
                      {avatarLetter}
                    </div>

                    <h3 className="text-xl font-black">{displayName}</h3>

                    <p className="mt-1 text-xs text-[#e8c8f3]">
                      {mockGenres.slice(0, 2).join(', ')}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-[#d923ff] px-3 py-1 text-xs font-bold">
                        87% совпадение
                      </span>

                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
                        Indie
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}