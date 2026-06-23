import { Link, Navigate, Route, Routes } from 'react-router'

import { RegisterPage } from './pages/RegisterPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { FeedPage } from './pages/FeedPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/feed" element={<FeedPage />} />
      </Routes>

      <div className="fixed bottom-4 left-4 rounded-xl bg-white px-4 py-3 text-sm shadow">
        <p className="mb-2 font-semibold">Навигация для проверки:</p>
        <div className="flex gap-3">
          <Link className="text-blue-600" to="/register">
            Register
          </Link>
          <Link className="text-blue-600" to="/login">
            Login
          </Link>
          <Link className="text-blue-600" to="/profile">
            Profile
          </Link>
          <Link className="text-blue-600" to="/feed">
            Feed
          </Link>
        </div>
      </div>
    </div>
  )
}

export default App