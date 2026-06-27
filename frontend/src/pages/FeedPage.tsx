import { useState } from 'react'

import { AppHeader } from '../components/layout/AppHeader'

type FeedUser = {
  id: number
  name: string
  age: number
  city: string
  compatibility: number
  bio: string
  genres: string[]
  artists: string[]
  mood: string
}

const mockUsers: FeedUser[] = [
  {
    id: 1,
    name: 'Анна',
    age: 26,
    city: 'Москва',
    compatibility: 87,
    bio: 'Люблю концерты, инди-плейлисты и вечерние прогулки под музыку.',
    genres: ['Indie', 'Rock'],
    artists: ['Arctic Monkeys', 'The Weeknd'],
    mood: 'ночной инди',
  },
  {
    id: 2,
    name: 'Максим',
    age: 24,
    city: 'Санкт-Петербург',
    compatibility: 78,
    bio: 'Слушаю альтернативу, электронику и иногда старый русский рок.',
    genres: ['Alternative', 'Electronic'],
    artists: ['Radiohead', 'Deftones'],
    mood: 'альтернатива',
  },
  {
    id: 3,
    name: 'Екатерина',
    age: 23,
    city: 'Казань',
    compatibility: 72,
    bio: 'Ищу человека, с которым можно обсуждать альбомы и ходить на концерты.',
    genres: ['Jazz', 'Indie'],
    artists: ['Nirvana', 'Muse'],
    mood: 'концертный вайб',
  },
]

export function FeedPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lastAction, setLastAction] = useState('')

  const currentUser = mockUsers[currentIndex]

  function handleNext(action: 'like' | 'skip') {
    if (!currentUser) {
      return
    }

    if (action === 'like') {
      setLastAction(`Лайк отправлен пользователю ${currentUser.name}`)
    } else {
      setLastAction(`Пользователь ${currentUser.name} пропущен`)
    }

    setCurrentIndex((prevIndex) => prevIndex + 1)
  }

  function handleRestart() {
    setCurrentIndex(0)
    setLastAction('')
  }

  return (
    <main className="min-h-screen bg-[#f8f0ff]">
      <AppHeader activePage="feed" />

      <section className="relative overflow-hidden px-6 py-10">
        <div className="pointer-events-none absolute left-0 top-52 h-44 w-full bg-[linear-gradient(90deg,transparent,rgba(217,35,255,0.14),transparent)] blur-2xl" />

        <div
          className="pointer-events-none absolute -left-40 top-28 hidden h-[420px] w-[420px] rounded-full opacity-[0.08] blur-[0.5px] lg:block"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 7%, rgba(185,80,190,0.55) 8%, rgba(185,80,190,0.55) 14%, transparent 15%, transparent 28%, rgba(255,255,255,0.25) 29%, rgba(255,255,255,0.25) 31%, transparent 32%), conic-gradient(from 40deg, #160014, #7c0b78, #e13cff, #5d0a68, #ff70d9, #26001f, #b912bf, #160014)',
            boxShadow: '0 0 120px rgba(217,35,255,0.22)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9c20c7]">
              Лента анкет
            </p>

            <h1 className="mt-2 max-w-3xl text-4xl font-black text-[#100516] md:text-5xl">
              Люди с похожим музыкальным вкусом
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              Пока здесь mock-данные. Позже карточки будут приходить с backend:
              рекомендации, совпадения, лайки и матчи.
            </p>
          </div>

          {lastAction && (
            <p className="mb-6 inline-flex rounded-2xl border border-white/60 bg-white/75 px-5 py-3 text-sm font-semibold text-[#100516] shadow-xl backdrop-blur-xl">
              {lastAction}
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
                жанры, исполнители и музыкальное настроение. Сейчас это
                временная mock-логика для демонстрации интерфейса.
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                  <p className="text-sm font-black text-[#100516]">
                    Совместимость
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Процент показывает условное совпадение музыкального вкуса.
                  </p>
                </div>

                <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                  <p className="text-sm font-black text-[#100516]">
                    Лайк / следующий
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Действия пока работают локально и просто переключают
                    карточки.
                  </p>
                </div>

                <div className="rounded-3xl bg-[#08050d] p-5 text-white">
                  <p className="text-sm font-black">Backend позже</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    После появления endpoint’ов лента будет получать реальные
                    рекомендации.
                  </p>
                </div>
              </div>
            </aside>

            <div className="flex justify-center lg:justify-end">
              {currentUser ? (
                <article className="relative h-[650px] w-full max-w-[440px] overflow-hidden rounded-[36px] border border-[#d923ff]/70 bg-[#050208] shadow-[0_30px_90px_rgba(80,0,120,0.28)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#18091f] via-[#381145] to-[#050208]" />

                  <div className="absolute inset-0 opacity-80">
                    <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-[#d923ff]/25 blur-3xl" />
                    <div className="absolute -bottom-10 right-0 h-52 w-52 rounded-full bg-[#8b00d6]/40 blur-3xl" />
                  </div>

                  <div className="absolute left-1/2 top-5 z-10 flex -translate-x-1/2 gap-1.5">
                    {mockUsers.map((user) => (
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

                  <div className="absolute inset-x-7 top-20 z-10 flex h-72 items-center justify-center overflow-hidden rounded-[30px] border border-white/10 bg-black/35 text-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,35,255,0.25),transparent_65%)]" />

                    <div className="relative">
                      <p className="text-8xl font-black text-[#f13bff]">
                        {currentUser.name[0]}
                      </p>

                      <p className="mt-3 text-sm font-semibold text-[#e8c8f3]">
                        фото пользователя
                      </p>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/95 to-transparent p-7 pt-32 text-white">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-3xl font-black">
                          {currentUser.name}, {currentUser.age}
                        </h2>

                        <p className="mt-1 text-sm text-[#e8c8f3]">
                          {currentUser.city} · {currentUser.mood}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#d923ff] px-4 py-2 text-sm font-bold shadow-[0_0_20px_rgba(217,35,255,0.45)]">
                        {currentUser.compatibility}%
                      </span>
                    </div>

                    <p className="mb-5 text-sm leading-6 text-white/85">
                      {currentUser.bio}
                    </p>

                    <div className="mb-5 grid gap-3">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#e8c8f3]">
                          Общие жанры
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {currentUser.genres.map((genre) => (
                            <span
                              className="rounded-full border border-white/10 bg-white/15 px-3 py-1 text-xs font-semibold"
                              key={genre}
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#e8c8f3]">
                          Общие исполнители
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {currentUser.artists.map((artist) => (
                            <span
                              className="rounded-full border border-white/10 bg-white/15 px-3 py-1 text-xs font-semibold"
                              key={artist}
                            >
                              {artist}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-[1fr_64px] gap-3">
                      <button
                        className="rounded-2xl bg-white px-4 py-4 font-bold text-[#100516] transition hover:scale-[1.02]"
                        type="button"
                        onClick={() => handleNext('skip')}
                      >
                        Следующий
                      </button>

                      <button
                        className="rounded-2xl bg-[#d923ff] px-4 py-4 text-2xl font-black text-white shadow-[0_0_25px_rgba(217,35,255,0.45)] transition hover:scale-[1.05]"
                        type="button"
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
                    Позже здесь будут реальные рекомендации с backend. Сейчас
                    можно посмотреть mock-ленту заново.
                  </p>

                  <button
                    className="rounded-2xl bg-[#d923ff] px-8 py-3 font-bold text-white shadow-[0_0_25px_rgba(217,35,255,0.35)] transition hover:scale-[1.02]"
                    type="button"
                    onClick={handleRestart}
                  >
                    Посмотреть заново
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