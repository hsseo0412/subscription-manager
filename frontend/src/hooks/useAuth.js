import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getCsrfCookie } from '../lib/axios'
import useAuthStore from '../stores/authStore'

/**
 * 인증 관련 액션(로그인·회원가입·로그아웃)과 현재 유저 정보를 제공하는 훅.
 * Sanctum SPA 인증 방식으로 CSRF 쿠키 취득 후 요청.
 */
export function useAuth() {
  const navigate = useNavigate()
  const { user, setUser, clearUser } = useAuthStore()

  /** POST /api/auth/login — 로그인 후 대시보드로 이동 */
  const login = useCallback(
    async (credentials) => {
      await getCsrfCookie()
      const { data } = await api.post('/api/auth/login', credentials)
      setUser(data.data)
      navigate('/dashboard')
    },
    [setUser, navigate],
  )

  /** POST /api/auth/register — 회원가입 후 대시보드로 이동 */
  const register = useCallback(
    async (userData) => {
      await getCsrfCookie()
      const { data } = await api.post('/api/auth/register', userData)
      setUser(data.data)
      navigate('/dashboard')
    },
    [setUser, navigate],
  )

  /** POST /api/auth/logout — 로그아웃 후 로그인 페이지로 이동 (세션 만료 시에도 로컬 로그아웃 처리) */
  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // 세션 만료(401) 등 서버 오류와 무관하게 로컬 상태는 항상 초기화
    } finally {
      clearUser()
      navigate('/login')
    }
  }, [clearUser, navigate])

  return { user, login, register, logout }
}
