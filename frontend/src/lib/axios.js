import axios from 'axios'
import useAuthStore from '../stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const method = error.config?.method?.toUpperCase()
    const url = error.config?.url ?? ''

    if (status >= 400) {
      console.error(`[API Error] ${method} ${url} → ${status}`, error.response?.data ?? error.message)
    }

    // 세션 만료(401) 시 자동 로그아웃 — 인증 엔드포인트 제외(루프 방지)
    if (status === 401 && !url.startsWith('/api/auth/')) {
      useAuthStore.getState().clearUser()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export async function getCsrfCookie() {
  await api.get('/sanctum/csrf-cookie')
}

export default api
