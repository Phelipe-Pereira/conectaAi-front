import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { API_CONFIG, HTTP_STATUS, STORAGE_KEYS } from '@/constants'

interface AuthResponse {
  user: unknown
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _retryCount?: number
}

const http: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use(
  (config) => {
    config.headers['x-request-id'] = uuidv4()

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig

    const clearAuthAndRedirect = () => {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED)

      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }

    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      const refreshTokenValue = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh')
      const isLoginEndpoint = originalRequest?.url?.includes('/auth/login')
      const isRegisterEndpoint = originalRequest?.url?.includes('/auth/register')

      if (
        refreshTokenValue &&
        originalRequest &&
        !originalRequest._retry &&
        !isRefreshEndpoint &&
        !isLoginEndpoint &&
        !isRegisterEndpoint
      ) {
        originalRequest._retry = true

        try {
          const refreshResponse = await axios.post<AuthResponse>(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refreshToken: refreshTokenValue },
            { headers: { 'Content-Type': 'application/json' } },
          )

          const { access_token, refresh_token: newRefreshToken } = refreshResponse.data

          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token)
          if (newRefreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`
            return http(originalRequest)
          }
        } catch (refreshError) {
          console.warn('Erro ao renovar token:', refreshError)
          clearAuthAndRedirect()
        }
      } else {
        clearAuthAndRedirect()
      }

      return Promise.reject(error)
    }

    if (
      originalRequest &&
      (error.response?.status === HTTP_STATUS.RATE_LIMIT ||
        (error.response?.status && error.response.status >= HTTP_STATUS.SERVER_ERROR_MIN)) &&
      !originalRequest._retry &&
      (originalRequest._retryCount ?? 0) < API_CONFIG.RETRY_ATTEMPTS
    ) {
      originalRequest._retry = true
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1

      const delay =
        Math.pow(2, (originalRequest._retryCount ?? 1) - 1) * API_CONFIG.RETRY_DELAY_BASE

      await new Promise((resolve) => setTimeout(resolve, delay))

      return http(originalRequest)
    }

    return Promise.reject(error)
  },
)

export default http
