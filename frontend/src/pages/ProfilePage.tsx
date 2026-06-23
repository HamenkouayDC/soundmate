export function ProfilePage() {
  return (
    <main className="min-h-screen p-10">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold">SoundMate</h1>

        <nav className="flex gap-6 text-sm">
          <span>Профиль</span>
          <span>Лента</span>
          <span>Выйти</span>
        </nav>
      </header>

      <section className="max-w-3xl rounded-2xl bg-white p-8 shadow">
        <h2 className="mb-6 text-3xl font-bold">Мой профиль</h2>

        <div className="mb-6 flex gap-6">
          <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-gray-200 text-sm font-semibold">
            Фото пользователя
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-xl bg-gray-200 px-4 py-3 text-center font-semibold">
              Имя
            </div>
            <div className="rounded-xl bg-gray-200 px-4 py-3 text-center font-semibold">
              Возраст
            </div>
            <div className="rounded-xl bg-gray-200 px-4 py-3 text-center font-semibold">
              Город
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-gray-200 px-4 py-8 text-center font-semibold">
          О себе
        </div>

        <h3 className="mb-3 text-lg font-bold">Любимые жанры:</h3>

        <div className="mb-6 flex gap-3">
          <span className="rounded-full bg-gray-200 px-5 py-2 font-semibold">
            Rock
          </span>
          <span className="rounded-full bg-gray-200 px-5 py-2 font-semibold">
            Pop
          </span>
          <span className="rounded-full bg-gray-200 px-5 py-2 font-semibold">
            Indie
          </span>
          <span className="rounded-full bg-gray-200 px-5 py-2 font-semibold">
            Hip-Hop
          </span>
        </div>

        <h3 className="mb-3 text-lg font-bold">Любимые исполнители:</h3>

        <div className="mb-8 flex gap-3">
          <span className="rounded-full bg-gray-200 px-5 py-2 font-semibold">
            The Weeknd
          </span>
          <span className="rounded-full bg-gray-200 px-5 py-2 font-semibold">
            Nirvana
          </span>
          <span className="rounded-full bg-gray-200 px-5 py-2 font-semibold">
            Arctic Monkeys
          </span>
        </div>

        <button className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white">
          Сохранить профиль
        </button>
      </section>
    </main>
  )
}