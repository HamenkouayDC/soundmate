import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050208] via-[#250033] to-[#8b00d6] px-6">
      <section className="w-full max-w-lg rounded-[36px] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#f13bff] bg-black/30 text-4xl text-[#f13bff] shadow-[0_0_35px_rgba(217,35,255,0.55)]">
          ♪
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#f13bff]">
          Ошибка 404
        </p>

        <h1 className="text-4xl font-black text-white">
          Страница не найдена
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#e8c8f3]">
          Похоже, такого раздела в SoundMate пока нет. Можно вернуться на вход
          или перейти к ленте анкет.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            className="rounded-2xl bg-white px-5 py-3 font-bold text-[#100516] transition hover:scale-[1.02]"
            to="/login"
          >
            На вход
          </Link>

          <Link
            className="rounded-2xl bg-[#d923ff] px-5 py-3 font-bold text-white shadow-[0_0_25px_rgba(217,35,255,0.45)] transition hover:scale-[1.02]"
            to="/feed"
          >
            В ленту
          </Link>
        </div>
      </section>
    </main>
  )
}
