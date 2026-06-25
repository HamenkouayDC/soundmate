import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { clearTokens } from '../shared/api/tokenStorage'

type FeedUser = {
  id: number
  name: string
  age: number
  city: string
  compatibility: number
  bio: string
  genres: string[]
  artists: string[]
}

const mockUsers: FeedUser[] = [
  {
    id: 1,
    name: 'Анна',
    age: 21,
    city: 'Москва',
    compatibility: 87,
    bio: 'Люблю концерты, инди-плейлисты и вечерние прогулки под музыку.',
    genres: ['Indie', 'Pop', 'Rock'],
    artists: ['Arctic Monkeys', 'Lana Del Rey', 'The Weeknd'],
  },
  {
    id: 2,
    name: 'Максим',
    age: 24,
    city: 'Санкт-Петербург',
    compatibility: 78,
    bio: 'Слушаю альтернативу, электронику и иногда старый русский рок.',
    genres: ['Alternative', 'Electronic', 'Rock'],
    artists: ['Radiohead', 'Deftones', 'Molchat Doma'],
  },
  {
    id: 3,
    name: 'Екатерина',
    age: 23,
    city: 'Казань',
    compatibility: 72,
    bio: 'Ищу человека, с которым можно обсуждать альбомы и ходить на концерты.',
    genres: ['Jazz', 'Indie', 'Post-rock'],
    artists: ['Nirvana', 'The Smile', 'Muse'],
  },
]

export function FeedPage() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastAction, setLastAction] = useState('')

  const currentUser = mockUsers[currentIndex]

  function handleNext(action: 'like' | 'skip') {
    if (!currentUser) {
      return
    }

    if (action === 'like') {
      setLastAction(`Вы поставили лайк пользователю ${currentUser.name}`)
    } else {
      setLastAction(`Вы пропустили пользователя ${currentUser.name}`)
    }

    setCurrentIndex((prevIndex) => prevIndex + 1)
  }

  function handleRestart() {
    setCurrentIndex(0)
    setLastAction('')
  }

  function handleLogout() {
    clearTokens()
    navigate('/login')
  }

  return (
    <main className="min-h-screen p-10">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold">SoundMate</h1>

        <nav className="flex items-center gap-6 text-sm">
          <span className="font-semibold">Лента</span>

          <Link className="text-gray-600 hover:text-gray-900" to="/profile">
            Профиль
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

      <section className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <h2 className="mb-6 text-3xl font-bold">Лента анкет</h2>

        {lastAction && (
          <p className="mb-4 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700">
            {lastAction}
          </p>
        )}

        {currentUser ? (
          <>
            <div className="mb-6 flex h-64 items-center justify-center rounded-xl bg-gray-200 font-semibold">
              Фото пользователя
            </div>

            <h3 className="mb-1 text-2xl font-bold">
              {currentUser.name}, {currentUser.age}
            </h3>

            <p className="mb-4 text-gray-600">{currentUser.city}</p>

            <p className="mb-6 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white">
              Совместимость: {currentUser.compatibility}%
            </p>

            <div className="mb-5">
              <h4 className="mb-3 font-bold">Общие жанры:</h4>

              <div className="flex flex-wrap justify-center gap-2">
                {currentUser.genres.map((genre) => (
                  <span
                    className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold"
                    key={genre}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h4 className="mb-3 font-bold">Общие исполнители:</h4>

              <div className="flex flex-wrap justify-center gap-2">
                {currentUser.artists.map((artist) => (
                  <span
                    className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold"
                    key={artist}
                  >
                    {artist}
                  </span>
                ))}
              </div>
            </div>

            <p className="mb-6 text-sm text-gray-700">{currentUser.bio}</p>

            <div className="flex gap-4">
              <button
                className="flex-1 rounded-xl bg-gray-200 px-4 py-3 font-semibold hover:bg-gray-300"
                type="button"
                onClick={() => handleNext('skip')}
              >
                Пропустить
              </button>

              <button
                className="flex-1 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-700"
                type="button"
                onClick={() => handleNext('like')}
              >
                Лайк
              </button>
            </div>
          </>
        ) : (
          <div>
            <p className="mb-6 text-gray-700">
              Анкеты закончились. Позже здесь будут реальные рекомендации с
              backend.
            </p>

            <button
              className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-gray-700"
              type="button"
              onClick={handleRestart}
            >
              Посмотреть заново
            </button>
          </div>
        )}
      </section>
    </main>
  )
}