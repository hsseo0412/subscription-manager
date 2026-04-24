import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import MyPage from './pages/MyPage'
import useAuthStore from './stores/authStore'
import useThemeStore from './stores/themeStore'
import api from './lib/axios'

function PrivateRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  const theme = useThemeStore((state) => state.theme)
  const { user, setUser, clearUser } = useAuthStore()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    if (!user) {
      setInitializing(false)
      return
    }
    api.get('/api/user')
      .then(({ data }) => setUser(data.data))
      .catch(() => clearUser())
      .finally(() => setInitializing(false))
  }, [])

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
