import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '@/stores/useAuth'

vi.mock('@/services/http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('@/stores/useSnackbar', () => ({
  useSnackbar: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

import http from '@/services/http'

const mockUser = {
  id: 'user_1',
  username: 'João Silva',
  email: 'joao@example.com',
  active: true,
  roles: ['USER'],
}

const mockAuthResponse = {
  data: {
    user: mockUser,
    access_token: 'access_token_123',
    refresh_token: 'refresh_token_456',
    token_type: 'Bearer',
    expires_in: 900,
  },
}

describe('useAuth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('estado inicial', () => {
    it('começa sem usuário autenticado', () => {
      const auth = useAuth()
      expect(auth.user).toBeNull()
      expect(auth.token).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('quando credenciais válidas, autentica e armazena tokens', async () => {
      vi.mocked(http.post).mockResolvedValueOnce(mockAuthResponse)

      const auth = useAuth()
      const result = await auth.login({ email: 'joao@example.com', password: 'senha123' })

      expect(result).toBe(true)
      expect(auth.user).toEqual(mockUser)
      expect(auth.token).toBe('access_token_123')
      expect(auth.isAuthenticated).toBe(true)
      expect(localStorage.getItem('auth_token')).toBe('access_token_123')
      expect(localStorage.getItem('refresh_token')).toBe('refresh_token_456')
    })

    it('quando credenciais inválidas, retorna false e não autentica', async () => {
      vi.mocked(http.post).mockRejectedValueOnce({
        response: { data: { message: 'Email ou senha inválidos' } },
      })

      const auth = useAuth()
      const result = await auth.login({ email: 'errado@example.com', password: 'errado' })

      expect(result).toBe(false)
      expect(auth.user).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
    })
  })

  describe('logout', () => {
    it('limpa usuário, token e localStorage', async () => {
      vi.mocked(http.post).mockResolvedValueOnce(mockAuthResponse)
      const auth = useAuth()
      await auth.login({ email: 'joao@example.com', password: 'senha123' })

      vi.mocked(http.post).mockResolvedValueOnce({})
      await auth.logout()

      expect(auth.user).toBeNull()
      expect(auth.token).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('refresh_token')).toBeNull()
    })

    it('limpa estado local mesmo quando chamada ao servidor falha', async () => {
      vi.mocked(http.post).mockResolvedValueOnce(mockAuthResponse)
      const auth = useAuth()
      await auth.login({ email: 'joao@example.com', password: 'senha123' })

      vi.mocked(http.post).mockRejectedValueOnce(new Error('Network error'))
      await auth.logout()

      expect(auth.user).toBeNull()
      expect(auth.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('quando senhas não coincidem, retorna false sem chamar API', async () => {
      const auth = useAuth()
      const result = await auth.register({
        name: 'João',
        email: 'joao@example.com',
        password: 'senha123',
        confirmPassword: 'diferente',
        cpfCnpj: '12345678901',
      })

      expect(result).toBe(false)
      expect(http.post).not.toHaveBeenCalled()
    })

    it('quando dados válidos, registra e autentica', async () => {
      vi.mocked(http.post).mockResolvedValueOnce(mockAuthResponse)

      const auth = useAuth()
      const result = await auth.register({
        name: 'João',
        email: 'joao@example.com',
        password: 'senha123',
        confirmPassword: 'senha123',
        cpfCnpj: '12345678901',
      })

      expect(result).toBe(true)
      expect(auth.isAuthenticated).toBe(true)
    })
  })

  describe('checkAuth', () => {
    it('quando token válido no localStorage, recupera usuário', async () => {
      localStorage.setItem('auth_token', 'token_existente')
      localStorage.setItem('isAuthenticated', 'true')
      vi.mocked(http.get).mockResolvedValueOnce({ data: mockUser })

      const auth = useAuth()
      await auth.checkAuth()

      expect(auth.user).toEqual(mockUser)
    })

    it('quando não há token no localStorage, não autentica', async () => {
      const auth = useAuth()
      await auth.checkAuth()

      expect(auth.user).toBeNull()
      expect(http.get).not.toHaveBeenCalled()
    })
  })
})
