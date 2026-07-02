import { Link, useNavigate } from 'react-router'

import logoImage from '../../assets/soundmate-logo-transparent.png'
import { clearTokens } from '../../shared/api/tokenStorage'

type ActivePage = 'feed' | 'matches' | 'music' | 'profile'

type AppHeaderProps = {
  activePage: ActivePage
}

const navItems: Array<{
  label: string
  path: string
  page: ActivePage
}> = [
  {
    label: 'Лента',
    path: '/feed',
    page: 'feed',
  },
  {
    label: 'Мэтчи',
    path: '/matches',
    page: 'matches',
  },
  {
    label: 'Музыка',
    path: '/music',
    page: 'music',
  },
  {
    label: 'Профиль',
    path: '/profile',
    page: 'profile',
  },
]

export function AppHeader({ activePage }: AppHeaderProps) {
  const navigate = useNavigate()

  function handleLogout() {
    clearTokens()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08050d]/95 px-6 py-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Link className="flex w-fit items-center gap-3" to="/feed">
          <img
            className="h-12 w-12 object-contain"
            src={logoImage}
            alt="SoundMate"
          />

          <div>
            <p className="text-lg font-black leading-none">SoundMate</p>
            <p className="mt-1 text-xs font-semibold text-[#e8c8f3]">
              music dating
            </p>
          </div>
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive = activePage === item.page

              return (
                <Link
                  className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? 'bg-[#d923ff] text-white shadow-[0_0_22px_rgba(217,35,255,0.35)]'
                      : 'bg-white/10 text-[#e8c8f3] hover:bg-white/20 hover:text-white'
                  }`}
                  key={item.path}
                  to={item.path}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button
            className="rounded-2xl border border-white/15 bg-white px-4 py-2 text-sm font-bold text-[#100516] transition hover:bg-[#f8f0ff]"
            type="button"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  )
}