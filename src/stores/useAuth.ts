import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/constants'
import { useSnackbar } from './useSnackbar'
import http from '@/services/http'

interface User {
  id: string
  username: string
  email: string
  active: boolean
  roles: string[]
  created_at?: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

const refreshToken = ref<string | null>(null)

export const useAuth = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const snackbar = useSnackbar()

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      const response = await http.post<AuthResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      const { user: userData, access_token, refresh_token } = response.data

      user.value = userData
      token.value = access_token
      refreshToken.value = refresh_token

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true')

      snackbar.success('Login realizado com sucesso!')
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.'
      snackbar.error(errorMessage)
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterData) => {
    loading.value = true
    try {
      if (data.password !== data.confirmPassword) {
        snackbar.error('Senhas não coincidem')
        return false
      }

      const response = await http.post<AuthResponse>('/auth/register', {
        username: data.name,
        email: data.email,
        password: data.password,
      })

      const { user: userData, access_token, refresh_token } = response.data

      user.value = userData
      token.value = access_token
      refreshToken.value = refresh_token

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token)
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true')

      snackbar.success('Conta criada com sucesso!')
      return true
    } catch (error: any) {
      // Extrair mensagem de erro mais detalhada
      let errorMessage = 'Erro ao criar conta. Verifique os dados e tente novamente.'

      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.errors) {
          // Se houver múltiplos erros de validação
          const errors = Object.values(errorData.errors).flat()
          errorMessage = errors.join(', ')
        }
      }

      snackbar.error(errorMessage)
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      if (storedRefreshToken && token.value) {
        try {
          await http.post('/auth/logout', {}, {
            headers: {
              Authorization: `Bearer ${token.value}`
            }
          })
        } catch (error) {
          console.warn('Erro ao fazer logout no servidor:', error)
        }
      }
    } catch (error) {
      console.warn('Erro ao fazer logout:', error)
    } finally {
      user.value = null
      token.value = null
      refreshToken.value = null

      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED)

      snackbar.success('Logout realizado com sucesso!')
    }
  }

  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    if (!storedRefreshToken) {
      return false
    }

    try {
      const response = await http.post<AuthResponse>('/auth/refresh', {
        refreshToken: storedRefreshToken,
      })

      const { user: userData, access_token, refresh_token: newRefreshToken } = response.data

      user.value = userData
      token.value = access_token
      refreshToken.value = newRefreshToken

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken)

      return true
    } catch (error) {
      return false
    }
  }

  const checkAuth = async () => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    const isAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED)

    if (storedToken && isAuth === 'true') {
      token.value = storedToken
      if (storedRefreshToken) {
        refreshToken.value = storedRefreshToken
      }

      try {
        const response = await http.get<User>('/auth/me')
        user.value = response.data
      } catch (error: any) {
        if (error.response?.status === 401 && storedRefreshToken) {
          const refreshed = await refreshAccessToken()
          if (!refreshed) {
            clearAuth()
          }
        } else {
          clearAuth()
        }
      }
    } else {
      clearAuth()
    }
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED)
  }

  const updateProfile = async (profileData: Partial<User>) => {
    loading.value = true
    try {
      // TODO: Implementar endpoint de atualização de perfil quando disponível
      // Por enquanto, apenas atualiza localmente
      if (user.value) {
        user.value = { ...user.value, ...profileData }
      }

      snackbar.success('Perfil atualizado com sucesso!')
      return true
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar perfil.'
      snackbar.error(errorMessage)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    refreshToken,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    refreshAccessToken,
    updateProfile,
  }
})
