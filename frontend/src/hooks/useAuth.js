import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getCsrfCookie } from '../lib/axios'
import useAuthStore from '../stores/authStore'

export function useAuth() {
  const navigate = useNavigate()
  const { user, setUser, clearUser } = useAuthStore()

  const login = useCallback(
    async (credentials) => {
      await getCsrfCookie()
      const { data } = await api.post('/api/auth/login', credentials)
      setUser(data.data)
      navigate('/dashboard')
    },
    [setUser, navigate],
  )

  const register = useCallback(
    async (userData) => {
      await getCsrfCookie()
      const { data } = await api.post('/api/auth/register', userData)
      setUser(data.data)
      navigate('/dashboard')
    },
    [setUser, navigate],
  )

  const logout = useCallback(async () => {
    await api.post('/api/auth/logout')
    clearUser()
    navigate('/login')
  }, [clearUser, navigate])

  return { user, login, register, logout }
}
