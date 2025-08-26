<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useAuth } from '@/stores/useAuth'
import './assets/main.css'

const router = useRouter()
const auth = useAuth()

onMounted(() => {
  // Verificar autenticação na inicialização
  auth.checkAuth()

  // Se não estiver autenticado e não estiver em uma rota pública, redirecionar para login
  const publicRoutes = ['/', '/login', '/register', '/reset-password']
  const currentRoute = router.currentRoute.value.path

  if (!auth.isAuthenticated && !publicRoutes.includes(currentRoute)) {
    router.push('/login')
  }
})
</script>

<template>
  <RouterView />
</template>

<style>
#app {
  min-height: 100vh;
  width: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
}
</style>
