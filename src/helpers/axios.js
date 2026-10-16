import axios from 'axios'
import { clearSession, getToken } from './session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// The API sets no cookies: the token is kept client-side and sent on every request.
api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

// Auth calls answer 401 as part of their normal flow (a wrong password, no
// session yet), so their callers handle it themselves.
const AUTH_PATHS = ['/auth/signin', '/auth/signout', '/auth/profile']

// Drops the stored token, then reloads like logout so nothing the ended
// session had cached survives.
export const endSession = () => {
  clearSession()
  window.location.replace('/login?ended=1')
}

// A 401 anywhere else means the session is over -- expired, or ended by an
// admin -- so the user is sent to sign in again instead of seeing errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = error.config?.url || ''
    const isAuthCall = AUTH_PATHS.some((authPath) => path.startsWith(authPath))

    if (error.response?.status === 401 && !isAuthCall && window.location.pathname !== '/login') {
      endSession()

      // The page is navigating away; settle nothing, so no error toast flashes first.
      return new Promise(() => {})
    }

    return Promise.reject(error)
  }
)

export default api
