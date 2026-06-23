export function FeedPage() {
  return (
    <main className="min-h-screen p-10">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-bold">SoundMate</h1>

        <nav className="flex gap-6 text-sm">
          <span>Лента</span>
          <span>Профиль</span>
          <span>Выйти</span>
        </nav>
      </header>

      <section className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <div className="mb-6 flex h-64 items-center justify-center rounded-xl bg-gray-200 font-semibold">
          Фото пользователя
        </div>

        <h2 className="mb-1 text-2xl font-bold">Анна, 21</h2>
        <p className="mb-4 text-gray-600">Москва</p>

        <p className="mb-4 font-semibold">Совместимость: 87%</p>

        <div className="mb-4">
          <h3 className="mb-2 font-bold">Общие жанры:</h3>
          <div className="flex justify-center gap-2">
            <span className="rounded-full bg-gray-200 px-4 py-2">Indie</span>
            <span className="rounded-full bg-gray-200 px-4 py-2">Pop</span>
            <span className="rounded-full bg-gray-200 px-4 py-2">Rock</span>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-700">
          Люблю концерты и вечерние плейлисты.
        </p>

        <div className="flex gap-4">
          <button className="flex-1 rounded-xl bg-gray-200 px-4 py-3 font-semibold">
            Пропустить
          </button>
          <button className="flex-1 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white">
            Лайк
          </button>
        </div>
      </section>
    </main>
  )
}