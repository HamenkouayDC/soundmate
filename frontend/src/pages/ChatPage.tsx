import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'

import { AppHeader } from '../components/layout/AppHeader'

type ChatUser = {
  id: number
  name: string
  age: number
  city: string
  compatibility: number
  genres: string[]
  artists: string[]
}

type ChatMessage = {
  id: number
  author: 'me' | 'match'
  text: string
  time: string
}

const mockChats: ChatUser[] = [
  {
    id: 1,
    name: 'Анна',
    age: 26,
    city: 'Москва',
    compatibility: 87,
    genres: ['Indie', 'Rock'],
    artists: ['Arctic Monkeys', 'The Weeknd'],
  },
  {
    id: 2,
    name: 'Максим',
    age: 24,
    city: 'Санкт-Петербург',
    compatibility: 78,
    genres: ['Alternative', 'Electronic'],
    artists: ['Radiohead', 'Deftones'],
  },
  {
    id: 3,
    name: 'Екатерина',
    age: 23,
    city: 'Казань',
    compatibility: 72,
    genres: ['Jazz', 'Indie'],
    artists: ['Nirvana', 'Muse'],
  },
]

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    author: 'match',
    text: 'Привет! Кажется, у нас совпали любимые исполнители 🎧',
    time: '18:20',
  },
  {
    id: 2,
    author: 'me',
    text: 'Да, я тоже заметил. Arctic Monkeys — отличный матч для начала разговора.',
    time: '18:22',
  },
  {
    id: 3,
    author: 'match',
    text: 'Согласна. Какой альбом у них больше всего нравится?',
    time: '18:24',
  },
]

export function ChatPage() {
  const { matchId } = useParams()
  const [messages, setMessages] = useState(initialMessages)
  const [messageText, setMessageText] = useState('')

  const match = mockChats.find((chat) => String(chat.id) === matchId)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedMessage = messageText.trim()

    if (!trimmedMessage) {
      return
    }

    const newMessage: ChatMessage = {
      id: Date.now(),
      author: 'me',
      text: trimmedMessage,
      time: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages((prevMessages) => [...prevMessages, newMessage])
    setMessageText('')
  }

  if (!match) {
    return (
      <main className="min-h-screen bg-[#f8f0ff]">
        <AppHeader activePage="matches" />

        <section className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-[34px] border border-white/60 bg-white/75 p-8 text-center shadow-[0_25px_80px_rgba(80,0,120,0.18)] backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#08050d] text-4xl text-[#f13bff] shadow-[0_0_30px_rgba(217,35,255,0.25)]">
              ♪
            </div>

            <h1 className="text-3xl font-black text-[#100516]">
              Чат не найден
            </h1>

            <p className="mt-4 text-sm leading-6 text-gray-600">
              Такого mock-чата пока нет. Вернись к списку матчей.
            </p>

            <Link
              className="mt-8 inline-flex rounded-2xl bg-[#d923ff] px-8 py-3 font-bold text-white shadow-[0_0_25px_rgba(217,35,255,0.35)] transition hover:scale-[1.02]"
              to="/matches"
            >
              К матчам
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8f0ff]">
      <AppHeader activePage="matches" />

      <section className="relative overflow-hidden px-6 py-10">
        <div className="pointer-events-none absolute left-0 top-52 h-44 w-full bg-[linear-gradient(90deg,transparent,rgba(217,35,255,0.14),transparent)] blur-2xl" />

        <div
          className="pointer-events-none absolute -right-40 top-28 hidden h-[520px] w-[520px] rounded-full opacity-[0.08] blur-[0.5px] lg:block"
          style={{
            background:
              'radial-gradient(circle at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 7%, rgba(185,80,190,0.55) 8%, rgba(185,80,190,0.55) 14%, transparent 15%, transparent 28%, rgba(255,255,255,0.25) 29%, rgba(255,255,255,0.25) 31%, transparent 32%), conic-gradient(from 40deg, #160014, #7c0b78, #e13cff, #5d0a68, #ff70d9, #26001f, #b912bf, #160014)',
            boxShadow: '0 0 120px rgba(217,35,255,0.22)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mb-8">
            <Link
              className="text-sm font-bold text-[#9c20c7] hover:text-[#d923ff]"
              to="/matches"
            >
              ← Назад к матчам
            </Link>

            <h1 className="mt-4 max-w-3xl text-4xl font-black text-[#100516] md:text-5xl">
              Чат с {match.name}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
              Пока это mock-чат. Сообщения добавляются локально и исчезнут после
              перезагрузки страницы.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
            <aside className="rounded-[34px] border border-white/60 bg-white/75 p-6 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
              <div className="relative mb-5 flex h-48 items-center justify-center overflow-hidden rounded-[30px] border border-[#d923ff]/60 bg-gradient-to-br from-[#120617] via-[#3b0b4d] to-[#d923ff]">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#f13bff]/40 blur-2xl" />

                <span className="relative text-7xl font-black text-[#f13bff]">
                  {match.name[0]}
                </span>
              </div>

              <h2 className="text-3xl font-black text-[#100516]">
                {match.name}, {match.age}
              </h2>

              <p className="mt-1 text-sm font-semibold text-gray-600">
                {match.city}
              </p>

              <div className="mt-5 rounded-3xl bg-[#08050d] p-5 text-white">
                <p className="text-sm font-black">Совместимость</p>

                <p className="mt-2 text-3xl font-black text-[#f13bff]">
                  {match.compatibility}%
                </p>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  Совпадение рассчитано на mock-данных по жанрам и артистам.
                </p>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#9c20c7]">
                  Общие жанры
                </p>

                <div className="flex flex-wrap gap-2">
                  {match.genres.map((genre) => (
                    <span
                      className="rounded-full border border-[#d923ff] bg-[#fff8c7] px-4 py-1.5 text-xs font-bold text-[#100516]"
                      key={genre}
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#9c20c7]">
                  Общие исполнители
                </p>

                <div className="flex flex-wrap gap-2">
                  {match.artists.map((artist) => (
                    <span
                      className="rounded-full border border-[#d923ff] bg-[#f8c7ff] px-4 py-1.5 text-xs font-bold text-[#100516]"
                      key={artist}
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            <section className="flex min-h-[680px] flex-col overflow-hidden rounded-[34px] border border-white/60 bg-white/75 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl">
              <header className="border-b border-[#d923ff]/15 bg-white/70 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#08050d] text-2xl font-black text-[#f13bff]">
                    {match.name[0]}
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-[#100516]">
                      {match.name}
                    </h2>

                    <p className="text-sm text-gray-600">
                      mock-чат · ответит, когда backend будет готов
                    </p>
                  </div>
                </div>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {messages.map((message) => (
                  <div
                    className={`flex ${
                      message.author === 'me' ? 'justify-end' : 'justify-start'
                    }`}
                    key={message.id}
                  >
                    <div
                      className={`max-w-[80%] rounded-[24px] px-5 py-3 shadow ${
                        message.author === 'me'
                          ? 'bg-[#d923ff] text-white'
                          : 'bg-white text-[#100516]'
                      }`}
                    >
                      <p className="text-sm leading-6">{message.text}</p>

                      <p
                        className={`mt-2 text-right text-xs ${
                          message.author === 'me'
                            ? 'text-white/70'
                            : 'text-gray-400'
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form
                className="border-t border-[#d923ff]/15 bg-white/70 p-5"
                onSubmit={handleSubmit}
              >
                <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                  <input
                    className="w-full rounded-2xl border border-[#d923ff]/45 bg-white/90 px-4 py-3 text-sm text-[#100516] outline-none transition placeholder:text-gray-500 focus:border-[#d923ff] focus:ring-4 focus:ring-[#d923ff]/20"
                    type="text"
                    placeholder="Написать сообщение..."
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                  />

                  <button
                    className="rounded-2xl bg-[#d923ff] px-6 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(217,35,255,0.35)] transition hover:scale-[1.02]"
                    type="submit"
                  >
                    Отправить
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}