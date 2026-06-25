import { Link, Navigate, Route, Routes } from 'react-router'

import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { FeedPage } from './pages/FeedPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
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