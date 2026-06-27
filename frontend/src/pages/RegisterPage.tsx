import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { registerUser } from '../shared/api/authApi'

export function RegisterPage() {
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setError('Заполни все поля')
      return
    }

    if (password.length < 8) {
      setError('Пароль должен быть минимум 8 символов')
      return
    }

    try {
      setIsLoading(true)

      await registerUser({
        email,
        password,
        display_name: displayName,
      })

      setSuccess('Аккаунт создан. Сейчас перейдём на страницу входа.')

      setTimeout(() => {
        navigate('/login')
      }, 1000)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось зарегистрироваться')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#050208] via-[#250033] to-[#8b00d6] px-6">
      <section className="w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#f13bff] bg-black/30 text-4xl text-[#f13bff] shadow-[0_0_35px_rgba(217,35,255,0.55)]">
            ♪
          </div>

          <h1 className="text-3xl font-black tracking-wide text-white">
            SoundMate
          </h1>

          <p className="mt-2 text-sm text-[#dab7e8]">
            знакомства по музыкальному вкусу
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <h2 className="mb-2 text-2xl font-bold text-white">
            Создай аккаунт
          </h2>

          <p className="mb-6 text-sm text-[#e8c8f3]">
            Заполни данные, чтобы начать искать людей с похожими треками.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-2xl border border-[#d923ff]/40 bg-white px-4 py-3 text-sm text-[#100516] outline-none transition placeholder:text-gray-500 focus:border-[#d923ff] focus:ring-4 focus:ring-[#d923ff]/20"
              type="text"
              placeholder="Имя"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-[#d923ff]/40 bg-white px-4 py-3 text-sm text-[#100516] outline-none transition placeholder:text-gray-500 focus:border-[#d923ff] focus:ring-4 focus:ring-[#d923ff]/20"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-[#d923ff]/40 bg-white px-4 py-3 text-sm text-[#100516] outline-none transition placeholder:text-gray-500 focus:border-[#d923ff] focus:ring-4 focus:ring-[#d923ff]/20"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error && (
              <p className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-2xl bg-green-500/20 px-4 py-3 text-sm text-green-100">
                {success}
              </p>
            )}

            <button
              className="w-full rounded-2xl bg-[#d923ff] px-4 py-3 font-bold text-white shadow-[0_0_25px_rgba(217,35,255,0.45)] transition hover:scale-[1.02] hover:bg-[#c316ef] disabled:cursor-not-allowed disabled:bg-gray-500"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#e8c8f3]">
            Уже есть аккаунт?{' '}
            <Link className="font-bold text-white underline" to="/login">
              Войти
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}