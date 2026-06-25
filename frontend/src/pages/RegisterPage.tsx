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
    <main className="flex min-h-screen items-center justify-center">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 className="mb-2 text-center text-3xl font-bold">SoundMate</h1>

        <h2 className="mb-2 text-center text-xl font-semibold">
          Регистрация
        </h2>

        <p className="mb-6 text-center text-sm text-gray-600">
          Создай аккаунт, чтобы начать искать людей по музыкальному вкусу.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            type="text"
            placeholder="Имя"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />

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

          {success && (
            <p className="rounded-xl bg-green-100 px-4 py-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            className="w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Уже есть аккаунт?{' '}
          <Link className="font-semibold text-gray-900" to="/login">
            Войти
          </Link>
        </p>
      </section>
    </main>
  )
}