import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import MyPage from './pages/MyPage'
import Stats from './pages/Stats'
import useAuthStore from './stores/authStore'

function PrivateRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
      <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
