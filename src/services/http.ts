import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { API_CONFIG, HTTP_STATUS, STORAGE_KEYS } from '@/constants'

// Interface para configuração de retry
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _retryCount?: number
}

// Configuração base do Axios
const http: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de requisição
http.interceptors.request.use(
  (config) => {
    // Adicionar x-request-id único
    config.headers['x-request-id'] = uuidv4()

    // Adicionar token de autenticação se disponível
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor de resposta com retry
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig

    // Retry para erros 429 (rate limit) e 5xx (server errors)
    if (
      originalRequest &&
      (error.response?.status === HTTP_STATUS.RATE_LIMIT ||
        (error.response?.status && error.response.status >= HTTP_STATUS.SERVER_ERROR_MIN)) &&
      !originalRequest._retry &&
      (originalRequest._retryCount ?? 0) < API_CONFIG.RETRY_ATTEMPTS
    ) {
      originalRequest._retry = true
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1

      // Delay exponencial: 1s, 2s
      const delay =
        Math.pow(2, (originalRequest._retryCount ?? 1) - 1) * API_CONFIG.RETRY_DELAY_BASE

      await new Promise((resolve) => setTimeout(resolve, delay))

      return http(originalRequest)
    }

    return Promise.reject(error)
  },
)

export default http
