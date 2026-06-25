import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { loginUser } from '../shared/api/authApi'
import { saveTokens } from '../shared/api/tokenStorage'

export function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Заполни email и пароль')
      return
    }

    try {
      setIsLoading(true)

      const tokens = await loginUser({
        email,
        password,
      })

      saveTokens(tokens.access, tokens.refresh)

      navigate('/profile')
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Не удалось войти')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-center text-3xl font-bold">SoundMate</h1>

        <h2 className="mb-6 text-center text-xl font-semibold">
          С возвращением!
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && (
            <p className="rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Нет аккаунта?{' '}
          <Link className="font-semibold text-gray-900" to="/register">
            Зарегистрироваться
          </Link>
        </p>
      </section>
    </main>
  )
}