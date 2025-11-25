import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { API_CONFIG, HTTP_STATUS, STORAGE_KEYS } from '@/constants'

interface AuthResponse {
  user: any
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

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

// Interceptor de resposta com retry e tratamento de erros
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
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

      if (refreshTokenValue && originalRequest && !originalRequest._retry && !isRefreshEndpoint && !isLoginEndpoint && !isRegisterEndpoint) {
        originalRequest._retry = true

        try {
          const refreshResponse = await axios.post<AuthResponse>(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refreshToken: refreshTokenValue },
            { headers: { 'Content-Type': 'application/json' } }
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

    // Se for erro de rede (backend não disponível), retornar dados mock apenas em desenvolvimento
    if ((error.code === 'ERR_NETWORK' || error.message === 'Network Error') && import.meta.env.DEV) {
      console.warn('Backend não disponível, usando dados mock')

      // Simular resposta baseada na URL
      const url = originalRequest?.url || ''

      if (url.includes('/webhooks')) {
        return Promise.resolve({
          data: {
            items: [
              {
                id: 'wh_001',
                url: 'https://meusite.com/webhooks/pagamentos',
                secret: 'whsec_123456789abcdef',
                enabled_events: ['charge.created', 'charge.paid', 'charge.canceled'],
                created_at: '2024-01-15T10:30:00Z',
              },
              {
                id: 'wh_002',
                url: 'https://api.meuapp.com/webhook',
                secret: 'whsec_987654321fedcba',
                enabled_events: [
                  'customer.created',
                  'subscription.created',
                  'subscription.canceled',
                ],
                created_at: '2024-01-10T14:20:00Z',
              },
              {
                id: 'wh_003',
                url: 'https://webhook.site/12345678',
                secret: 'whsec_abcdef123456789',
                enabled_events: [
                  'charge.created',
                  'charge.updated',
                  'charge.paid',
                  'charge.refunded',
                ],
                created_at: '2024-01-05T09:15:00Z',
              },
            ],
            has_more: false,
            next_cursor: null,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: originalRequest,
        })
      }

      if (url.includes('/customers')) {
        return Promise.resolve({
          data: {
            items: [],
            has_more: false,
            next_cursor: null,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: originalRequest,
        })
      }

      if (url.includes('/charges')) {
        return Promise.resolve({
          data: {
            items: [],
            has_more: false,
            next_cursor: null,
            total: 0,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: originalRequest,
        })
      }

      if (url.includes('/subscriptions')) {
        return Promise.resolve({
          data: {
            items: [],
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: originalRequest,
        })
      }

      if (url.includes('/notifications')) {
        return Promise.resolve({
          data: {
            items: [
              {
                id: 'not_001',
                customer_id: 'cus_001',
                channel: 'EMAIL',
                subject: 'Pagamento confirmado',
                message: 'Seu pagamento de R$ 150,00 foi confirmado com sucesso!',
                status: 'SENT',
                send_at: '2024-01-15T10:30:00Z',
                delivered_at: '2024-01-15T10:31:00Z',
                created_at: '2024-01-15T10:29:00Z',
                updated_at: '2024-01-15T10:31:00Z',
              },
              {
                id: 'not_002',
                customer_id: 'cus_002',
                channel: 'SMS',
                subject: null,
                message: 'Cobrança vencida: R$ 89,90. Pague até 25/01 para evitar juros.',
                status: 'QUEUED',
                send_at: '2024-01-20T08:00:00Z',
                delivered_at: null,
                created_at: '2024-01-15T14:20:00Z',
                updated_at: '2024-01-15T14:20:00Z',
              },
              {
                id: 'not_003',
                customer_id: 'cus_003',
                channel: 'WHATSAPP',
                subject: null,
                message: 'Olá! Sua assinatura foi renovada automaticamente. Valor: R$ 29,90',
                status: 'SENT',
                send_at: '2024-01-15T09:15:00Z',
                delivered_at: '2024-01-15T09:16:00Z',
                created_at: '2024-01-15T09:14:00Z',
                updated_at: '2024-01-15T09:16:00Z',
              },
              {
                id: 'not_004',
                customer_id: 'cus_004',
                channel: 'PUSH',
                subject: 'Novo produto disponível',
                message: 'Confira nossa nova coleção com 20% de desconto!',
                status: 'FAILED',
                send_at: '2024-01-15T11:00:00Z',
                delivered_at: null,
                created_at: '2024-01-15T10:45:00Z',
                updated_at: '2024-01-15T11:01:00Z',
              },
            ],
            has_more: false,
            next_cursor: null,
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: originalRequest,
        })
      }
    }

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
