export function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-center text-3xl font-bold">SoundMate</h1>

        <h2 className="mb-2 text-center text-xl font-semibold">
          Регистрация
        </h2>

        <p className="mb-6 text-center text-sm text-gray-600">
          Создай аккаунт, чтобы начать искать людей по музыкальному вкусу.
        </p>

        <form className="space-y-4">
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            type="text"
            placeholder="Имя"
          />

          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            type="email"
            placeholder="Email"
          />

          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            type="password"
            placeholder="Пароль"
          />

          <button
            className="w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white"
            type="button"
          >
            Зарегистрироваться
          </button>
        </form>
      </section>
    </main>
  )
}