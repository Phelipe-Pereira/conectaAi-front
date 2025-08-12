<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebarStore'

const router = useRouter()
const activeRoute = ref(router.currentRoute.value.name)
const { isOpen, toggle } = useSidebarStore()
const isMobile = ref(window.innerWidth <= 768)

const menuItems = [
  { name: 'Dashboard', icon: '📊', route: 'dashboard' },
  { name: 'Produtos', icon: '📦', route: 'produtos' },
  { name: 'Pedidos', icon: '🛒', route: 'pedidos' },
  { name: 'Clientes', icon: '👥', route: 'clientes' },
  {
    name: 'Configurações',
    icon: '⚙️',
    route: 'configuracoes',
    subItems: [
      { name: 'Geral', route: 'configuracoes' },
      { name: 'Gateways', route: 'configuracoes-gateways' },
      { name: 'Webhooks', route: 'configuracoes-webhooks' },
    ],
  },
]

const navigateTo = (route) => {
  router.push({ name: route })
  activeRoute.value = route
  if (isMobile.value) {
    isOpen.value = false
  }
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    isOpen.value = true
  }
}

const logout = () => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userEmail')
  router.push({ name: 'login' })
  activeRoute.value = 'login'
  if (isMobile.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="sidebar-container" :class="{ 'sidebar-open': isOpen, 'sidebar-collapsed': !isOpen }">
    <aside class="sidebar" :class="{ 'sidebar-open': isOpen, 'sidebar-collapsed': !isOpen }">
      <div class="sidebar-header">
        <div class="brand">
          <img src="@/assets/logo.svg" alt="ConectaAI Logo" class="logo" />
          <span class="brand-name" v-if="isOpen">ConectaAI</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div v-for="item in menuItems" :key="item.route" class="nav-section">
          <button
            class="nav-item"
            :class="{ active: activeRoute === item.route }"
            @click="navigateTo(item.route)"
          >
            <span class="icon">{{ item.icon }}</span>
            <span class="text" v-if="isOpen">{{ item.name }}</span>
          </button>

          <!-- Subseções para Configurações -->
          <div
            v-if="item.subItems && isOpen && typeof activeRoute === 'string' && activeRoute.startsWith('configuracoes')"
            class="sub-nav"
          >
            <button
              v-for="subItem in item.subItems"
              :key="subItem.route"
              class="nav-item sub-item"
              :class="{ active: activeRoute === subItem.route }"
              @click="navigateTo(subItem.route)"
            >
              <span class="icon">•</span>
              <span class="text">{{ subItem.name }}</span>
            </button>
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item" @click="logout">
          <span class="icon">🚪</span>
          <span class="text" v-if="isOpen">Sair</span>
        </button>
      </div>
    </aside>

    <div class="sidebar-overlay" v-if="isOpen && isMobile" @click="toggle"></div>
  </div>
</template>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: var(--z-fixed);
}

.sidebar {
  width: 250px;
  height: 100vh;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: var(--z-fixed);
  transition: all 0.3s ease;
}

.sidebar-collapsed {
  width: 60px !important;
}

.sidebar-header {
  height: 64px;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: var(--bg-secondary);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 0 var(--spacing-sm);
  width: 100%;
}

.logo {
  height: 32px;
  width: 32px;
  flex-shrink: 0;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  color: var(--text-secondary);
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  transition: all 0.3s ease;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: var(--spacing-md);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary);
  color: white;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.sub-nav {
  margin-left: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.sub-item {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.75rem;
}

.sub-item .icon {
  font-size: 0.75rem;
  min-width: 16px;
}

.icon {
  font-size: 1.25rem;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text {
  font-size: 0.875rem;
  white-space: nowrap;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: calc(var(--z-fixed) - 1);
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar-open .sidebar {
    transform: translateX(0);
  }
}
</style>
