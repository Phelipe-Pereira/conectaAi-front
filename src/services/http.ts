import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import { v4 as uuidv4 } from 'uuid'

// Configuração base do Axios
const http: AxiosInstance = axios.create({
  baseURL: 'https://sandbox.api.conectaai.com/v1',
  timeout: 30000,
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
    const token = localStorage.getItem('auth_token')
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
    const originalRequest = error.config as any

    // Retry para erros 429 (rate limit) e 5xx (server errors)
    if (
      (error.response?.status === 429 ||
        (error.response?.status && error.response.status >= 500)) &&
      !originalRequest._retry &&
      originalRequest._retryCount < 2
    ) {
      originalRequest._retry = true
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

      // Delay exponencial: 1s, 2s
      const delay = Math.pow(2, originalRequest._retryCount - 1) * 1000

      await new Promise((resolve) => setTimeout(resolve, delay))

      return http(originalRequest)
    }

    return Promise.reject(error)
  },
)

export default http
