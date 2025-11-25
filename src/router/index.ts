import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import { useAuth } from '@/stores/useAuth'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/views/ResetPasswordView.vue'),
    },
    {
      path: '/dashboard',
      component: DefaultLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'clientes',
          name: 'clientes',
          component: () => import('@/views/ClientesView.vue'),
        },
        {
          path: 'cobrancas',
          name: 'cobrancas',
          component: () => import('@/views/CobrancasView.vue'),
        },
        {
          path: 'assinaturas',
          name: 'assinaturas',
          component: () => import('@/views/AssinaturasView.vue'),
        },
        {
          path: 'webhooks',
          name: 'webhooks',
          component: () => import('@/views/WebhooksView.vue'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/views/NotificationsView.vue'),
        },
        {
          path: 'gateways',
          name: 'gateways',
          component: () => import('@/views/GatewaysView.vue'),
        },
        {
          path: 'configuracoes',
          name: 'configuracoes',
          component: () => import('@/views/ConfiguracoesView.vue'),
        },
        {
          path: 'perfil',
          name: 'perfil',
          component: () => import('@/views/PerfilView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuth()

  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      next('/login')
      return
    }

    if (!authStore.user) {
      await authStore.checkAuth()
    }

    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
  }

  // Se já está autenticado e tenta acessar login/register, redirecionar para dashboard
  if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

export default router
