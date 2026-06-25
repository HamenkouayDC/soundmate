import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { getCurrentUser, type CurrentUser } from '../shared/api/userApi'
import { clearTokens, getAccessToken } from '../shared/api/tokenStorage'

export function ProfilePage() {
  const navigate = useNavigate()

  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUser() {
      const token = getAccessToken()

      if (!token) {
        navigate('/login')
        return
      }

      try {
        const currentUser = await getCurrentUser(token)
        setUser(currentUser)
      } catch (err) {
        clearTokens()

        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Не удалось загрузить профиль')
        }

        setTimeout(() => {
          navigate('/login')
        }, 1000)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [navigate])

  function handleLogout() {
    clearTokens()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Загрузка профиля...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <section className="rounded-2xl bg-white p-8 shadow">
          <p className="text-red-600">{error}</p>
          <p className="mt-2 text-sm text-gray-600">
            Сейчас вернём тебя на страницу входа.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-10">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold">SoundMate</h1>

        <nav className="flex items-center gap-6 text-sm">
          <span className="font-semibold">Профиль</span>

          <Link className="text-gray-600 hover:text-gray-900" to="/feed">
            Лента
          </Link>

          <button
            className="text-gray-600 hover:text-gray-900"
            type="button"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </nav>
      </header>

      <section className="max-w-3xl rounded-2xl bg-white p-8 shadow">
        <h2 className="mb-6 text-3xl font-bold">Мой профиль</h2>

        <div className="mb-6 flex gap-6">
          <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-gray-200 text-sm font-semibold">
            {user?.profile.avatar_url ? (
              <img
                className="h-full w-full rounded-xl object-cover"
                src={user.profile.avatar_url}
                alt="Аватар пользователя"
              />
            ) : (
              'Фото пользователя'
            )}
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-xl bg-gray-200 px-4 py-3 font-semibold">
              Имя: {user?.profile.display_name || 'Не указано'}
            </div>

            <div className="rounded-xl bg-gray-200 px-4 py-3 font-semibold">
              Email: {user?.email}
            </div>

            <div className="rounded-xl bg-gray-200 px-4 py-3 font-semibold">
              Дата рождения: {user?.profile.birth_date || 'Не указана'}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-gray-200 px-4 py-8 font-semibold">
          О себе: {user?.profile.bio || 'Пока пусто'}
        </div>

        <h3 className="mb-3 text-lg font-bold">Любимые жанры:</h3>

        <div className="mb-6 flex gap-3">
          <span className="rounded-full bg-gray-200 px-5 py-2 font-semibold">
            Пока нет данных
          </span>
        </div>

        <h3 className="mb-3 text-lg font-bold">Любимые исполнители:</h3>

        <div className="mb-8 flex gap-3">
          <span className="rounded-full bg-gray-200 px-5 py-2 font-semibold">
            Пока нет данных
          </span>
        </div>

        <button
          className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white disabled:bg-gray-400"
          type="button"
          disabled
        >
          Редактирование профиля пока недоступно
        </button>
      </section>
    </main>
  )
}