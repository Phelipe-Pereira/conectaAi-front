import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { STORAGE_KEYS } from '@/constants'
import { useSnackbar } from './useSnackbar'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
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

export const useAuth = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const snackbar = useSnackbar()

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      // Simulação de login - será substituído pela API real
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: '1',
        name: 'João Silva',
        email: credentials.email,
        avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=0D8ABC&color=fff',
        role: 'admin',
      }

      const mockToken = 'mock-jwt-token-' + Date.now()

      user.value = mockUser
      token.value = mockToken

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken)
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true')

      snackbar.success('Login realizado com sucesso!')
      return true
    } catch (error) {
      snackbar.error('Erro ao fazer login. Verifique suas credenciais.')
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterData) => {
    loading.value = true
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('Senhas não coincidem')
      }

      // Simulação de registro - será substituído pela API real
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: '1',
        name: data.name,
        email: data.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0D8ABC&color=fff`,
        role: 'user',
      }

      const mockToken = 'mock-jwt-token-' + Date.now()

      user.value = mockUser
      token.value = mockToken

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, mockToken)
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true')

      snackbar.success('Conta criada com sucesso!')
      return true
    } catch (error) {
      snackbar.error('Erro ao criar conta. Tente novamente.')
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null

    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED)

    snackbar.success('Logout realizado com sucesso!')
  }

  const checkAuth = () => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    const isAuth = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED)

    if (storedToken && isAuth === 'true') {
      token.value = storedToken
      // Em uma implementação real, validaria o token com a API
      // Por enquanto, simula um usuário
      user.value = {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=0D8ABC&color=fff',
        role: 'admin',
      }
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    loading.value = true
    try {
      // Simulação de atualização - será substituído pela API real
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (user.value) {
        user.value = { ...user.value, ...profileData }
      }

      snackbar.success('Perfil atualizado com sucesso!')
      return true
    } catch (error) {
      snackbar.error('Erro ao atualizar perfil.')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    updateProfile,
  }
})
