import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
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
            найди человека по музыкальному вкусу
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur">
          <h2 className="mb-2 text-2xl font-bold text-white">
            С возвращением
          </h2>

          <p className="mb-6 text-sm text-[#e8c8f3]">
            Войди, чтобы продолжить искать людей с похожим вкусом.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              className="border-[#d923ff]/40 bg-white"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <Input
              className="border-[#d923ff]/40 bg-white"
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

            <Button fullWidth type="submit" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-xs text-[#e8c8f3]">или</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>

          <div className="space-y-3">
            <Button fullWidth variant="light" disabled>
              Войти с Google — скоро
            </Button>

            <Button fullWidth variant="light" disabled>
              Войти с Telegram — скоро
            </Button>
          </div>

          <p className="mt-6 text-sm text-[#e8c8f3]">
            Нет аккаунта?{' '}
            <Link className="font-bold text-white underline" to="/register">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}