import { Link } from 'react-router'

import { AppHeader } from '../components/layout/AppHeader'
import { DecorativeDisc } from '../components/ui/DecorativeDisc'
import { PageHeader } from '../components/ui/PageHeader'

type MatchUser = {
  id: number
  name: string
  age: number
  city: string
  compatibility: number
  lastActive: string
  genres: string[]
  artists: string[]
  messagePreview: string
}

const mockMatches: MatchUser[] = [
  {
    id: 1,
    name: 'Анна',
    age: 26,
    city: 'Москва',
    compatibility: 87,
    lastActive: 'была онлайн сегодня',
    genres: ['Indie', 'Rock'],
    artists: ['Arctic Monkeys', 'The Weeknd'],
    messagePreview: 'У вас совпали любимые исполнители и ночной инди-вайб.',
  },
  {
    id: 2,
    name: 'Максим',
    age: 24,
    city: 'Санкт-Петербург',
    compatibility: 78,
    lastActive: 'был онлайн вчера',
    genres: ['Alternative', 'Electronic'],
    artists: ['Radiohead', 'Deftones'],
    messagePreview: 'Похоже, вы оба любите альтернативу и живые концерты.',
  },
  {
    id: 3,
    name: 'Екатерина',
    age: 23,
    city: 'Казань',
    compatibility: 72,
    lastActive: 'была онлайн недавно',
    genres: ['Jazz', 'Indie'],
    artists: ['Nirvana', 'Muse'],
    messagePreview: 'У вас есть общие жанры и похожее музыкальное настроение.',
  },
]

export function MatchesPage() {
  return (
    <main className="min-h-screen bg-[#f8f0ff] [overflow-anchor:none]">
      <AppHeader activePage="matches" />

      <section className="relative overflow-hidden px-6 py-8 md:py-10">
        <div className="pointer-events-none absolute left-0 top-52 h-44 w-full bg-[linear-gradient(90deg,transparent,rgba(217,35,255,0.14),transparent)] blur-2xl" />

        <DecorativeDisc position="right" opacity="0.08" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <PageHeader
            label="Мои матчи"
            title="Люди, которым ты тоже интересен"
            description="Пока здесь mock-данные. Позже сюда будут попадать реальные совпадения после взаимных лайков."
          />

          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <aside className="hidden rounded-[34px] border border-white/60 bg-white/70 p-8 shadow-[0_25px_80px_rgba(80,0,120,0.14)] backdrop-blur-xl lg:block">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#9c20c7]">
                Статистика
              </p>

              <h2 className="text-3xl font-black text-[#100516]">
                {mockMatches.length} новых матча
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-600">
                Эти карточки показывают, как будет выглядеть раздел совпадений.
                Чаты пока работают на mock-данных.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-3xl bg-[#f8f0ff]/90 p-5">
                  <p className="text-sm font-black text-[#100516]">
                    Лучшее совпадение
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Анна · 87% музыкальной совместимости
                  </p>
                </div>

                <div className="rounded-3xl bg-[#08050d] p-5 text-white">
                  <p className="text-sm font-black">Mock-чаты</p>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Можно открыть чат с каждым матчем. Сообщения пока
                    сохраняются только локально на странице.
                  </p>
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              {mockMatches.map((match) => (
                <article
                  className="isolate overflow-hidden rounded-[34px] border border-white/60 bg-white/75 p-5 shadow-[0_25px_80px_rgba(80,0,120,0.12)] backdrop-blur-xl transition md:hover:-translate-y-1 md:hover:shadow-[0_30px_90px_rgba(80,0,120,0.18)]"
                  key={match.id}
                >
                  <div className="flex flex-col gap-5 md:grid md:grid-cols-[140px_1fr_auto] md:items-center">
                    <div className="relative flex h-40 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border border-[#d923ff]/60 bg-gradient-to-br from-[#120617] via-[#3b0b4d] to-[#d923ff] md:h-36">
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#f13bff]/40 blur-2xl" />

                      <span className="relative text-6xl font-black text-[#f13bff]">
                        {match.name[0]}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-black text-[#100516]">
                          {match.name}, {match.age}
                        </h2>

                        <span className="rounded-full bg-[#d923ff] px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(217,35,255,0.35)]">
                          {match.compatibility}% совпадение
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-gray-600">
                        {match.city} · {match.lastActive}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {match.messagePreview}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {match.genres.map((genre) => (
                          <span
                            className="rounded-full border border-[#d923ff] bg-[#fff8c7] px-4 py-1.5 text-xs font-bold text-[#100516]"
                            key={genre}
                          >
                            {genre}
                          </span>
                        ))}

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

                    <div className="flex md:justify-end">
                      <Link
                        className="w-full rounded-2xl bg-[#100516] px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-[#d923ff] md:w-auto"
                        to={`/chat/${match.id}`}
                      >
                        Открыть чат
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}