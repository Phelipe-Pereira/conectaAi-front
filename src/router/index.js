import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || '/'),
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
          path: 'produtos',
          name: 'produtos',
          component: () => import('@/views/ProdutosView.vue'),
        },
        {
          path: 'pedidos',
          name: 'pedidos',
          component: () => import('@/views/PedidosView.vue'),
        },
        {
          path: 'clientes',
          name: 'clientes',
          component: () => import('@/views/ClientesView.vue'),
        },
        {
          path: 'configuracoes',
          name: 'configuracoes',
          component: () => import('@/views/ConfiguracoesView.vue'),
        },
        {
          path: 'configuracoes/gateways',
          name: 'configuracoes-gateways',
          component: () => import('@/views/GatewaysView.vue'),
        },
        {
          path: 'configuracoes/webhooks',
          name: 'configuracoes-webhooks',
          component: () => import('@/views/WebhooksView.vue'),
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

router.beforeEach((to, from, next) => {
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
