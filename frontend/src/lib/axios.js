import axios from 'axios'

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
    const url = error.config?.url

    if (status >= 400) {
      console.error(`[API Error] ${method} ${url} → ${status}`, error.response?.data ?? error.message)
    }

    return Promise.reject(error)
  },
)

export async function getCsrfCookie() {
  await api.get('/sanctum/csrf-cookie')
}

export default api
