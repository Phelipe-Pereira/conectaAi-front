import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'

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
          path: 'parcelamentos',
          name: 'parcelamentos',
          component: () => import('@/views/ParcelamentosView.vue'),
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

router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
