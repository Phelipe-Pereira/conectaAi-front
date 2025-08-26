import { config } from '@vue/test-utils'
import { vi } from 'vitest'

// Mock do Vuetify
vi.mock('vuetify', () => ({
  createVuetify: () => ({
    install: vi.fn(),
  }),
}))

// Mock do Pinia
vi.mock('pinia', () => ({
  createPinia: () => ({
    install: vi.fn(),
  }),
}))

// Mock do Vue Router
vi.mock('vue-router', () => ({
  createRouter: () => ({
    install: vi.fn(),
  }),
  createWebHistory: vi.fn(),
}))

// Configuração global para testes
config.global.mocks = {
  $t: (key: string) => key,
  $route: {
    params: {},
    query: {},
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
  },
}
