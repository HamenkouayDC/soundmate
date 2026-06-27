import { Link, useNavigate } from 'react-router'

import { clearTokens } from '../../shared/api/tokenStorage'

type AppHeaderProps = {
  activePage: 'feed' | 'profile'
}

export function AppHeader({ activePage }: AppHeaderProps) {
  const navigate = useNavigate()

  function handleLogout() {
    clearTokens()
    navigate('/login')
  }

  function getLinkClass(page: 'feed' | 'profile') {
    const baseClass =
      'rounded-xl px-5 py-2 text-sm font-semibold transition hover:scale-105'

    if (activePage === page) {
      return `${baseClass} bg-[#d923ff] text-white shadow-[0_0_20px_rgba(217,35,255,0.45)]`
    }

    return `${baseClass} bg-white/10 text-white hover:bg-white/20`
  }

  return (
    <header className="border-b border-white/10 bg-[#050208]/95 backdrop-blur">
      <div className="mx-auto flex min-h-24 max-w-6xl flex-col items-center justify-between gap-4 px-6 py-4 md:flex-row">
        <Link className="flex items-center gap-3" to="/feed">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d923ff] bg-[#16051f] text-2xl text-[#f13bff] shadow-[0_0_25px_rgba(217,35,255,0.35)]">
            ♪
          </div>

          <div>
            <p className="text-xl font-black tracking-wide text-white">
              SoundMate
            </p>

            <p className="text-xs text-[#d8b8e8]">
              знакомства по музыкальному вкусу
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link className={getLinkClass('feed')} to="/feed">
            Лента
          </Link>

          <Link className={getLinkClass('profile')} to="/profile">
            Профиль
          </Link>

          <button
            className="rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            type="button"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </nav>
      </div>
    </header>
  )
}