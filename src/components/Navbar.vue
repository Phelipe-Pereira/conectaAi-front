<template>
  <nav class="navbar" :class="{ 'navbar-collapsed': !isSidebarOpen }">
    <div class="navbar-left">
      <button @click="toggleSidebar" class="menu-btn">
        <span>☰</span>
      </button>
      <h1 class="page-title">{{ currentPageTitle }}</h1>
    </div>

    <div class="navbar-actions">
      <div class="notifications" ref="notificationsRef">
        <button @click="toggleNotifications" class="notification-btn">
          🔔
          <span v-if="unreadNotifications > 0" class="notification-badge">
            {{ unreadNotifications }}
          </span>
        </button>

        <div v-if="showNotifications" class="notifications-panel">
          <div class="notifications-header">
            <h3>Notificações</h3>
            <button class="mark-all-btn" @click="markAllAsRead">Marcar todas como lidas</button>
          </div>
          <div class="notifications-list">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.read }"
            >
              <p class="notification-text">{{ notification.message }}</p>
              <span class="notification-time">{{ notification.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="profile" ref="profileRef">
        <button @click="toggleProfile" class="profile-btn">
          <img :src="userProfile.avatar" :alt="userProfile.name" class="profile-avatar" />
        </button>

        <div v-if="showProfile" class="profile-menu">
          <div class="profile-header">
            <img :src="userProfile.avatar" :alt="userProfile.name" class="profile-avatar-large" />
            <div class="profile-info">
              <h3>{{ userProfile.name }}</h3>
              <p>{{ userProfile.email }}</p>
            </div>
          </div>
          <div class="profile-actions">
            <button class="profile-action-btn" @click="goToProfile">
              <span>👤</span>
              <span>Meu Perfil</span>
            </button>
            <button class="profile-action-btn" @click="goToSettings">
              <span>⚙️</span>
              <span>Configurações</span>
            </button>
            <button class="profile-action-btn logout" @click="logout">
              <span>🚪</span>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebarStore'

const router = useRouter()
const route = useRoute()
const { isOpen: isSidebarOpen, toggle: toggleSidebar } = useSidebarStore()

const showNotifications = ref(false)
const showProfile = ref(false)
const notificationsRef = ref(null)
const profileRef = ref(null)

const userProfile = ref({
  name: 'João Silva',
  email: 'joao@conectaai.com',
  avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=0D8ABC&color=fff',
})

const notifications = ref([
  {
    id: 1,
    message: 'Pedido #12345 foi enviado.',
    time: '2 horas atrás',
    read: false,
  },
  {
    id: 2,
    message: 'Novo cadastro de cliente: Sarah Connor',
    time: '5 horas atrás',
    read: false,
  },
  {
    id: 3,
    message: 'Produto #67890 com baixo estoque.',
    time: '1 dia atrás',
    read: true,
  },
])

const unreadNotifications = computed(() => {
  return notifications.value.filter((n) => !n.read).length
})

const currentPageTitle = computed(() => {
  const routeName = route.name
  const pageTitles = {
    dashboard: 'Dashboard',
    produtos: 'Produtos',
    pedidos: 'Pedidos',
    clientes: 'Clientes',
    configuracoes: 'Configurações',
    'configuracoes-gateways': 'Configurações - Gateways',
    'configuracoes-webhooks': 'Configurações - Webhooks',
    perfil: 'Meu Perfil',
  }
  return pageTitles[routeName] || 'Dashboard'
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) showProfile.value = false
}

const toggleProfile = () => {
  showProfile.value = !showProfile.value
  if (showProfile.value) showNotifications.value = false
}

const markAllAsRead = () => {
  notifications.value = notifications.value.map((n) => ({ ...n, read: true }))
}

const goToProfile = () => {
  router.push({ name: 'perfil' })
  showProfile.value = false
}

const goToSettings = () => {
  router.push({ name: 'configuracoes' })
  showProfile.value = false
}

const logout = () => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userEmail')
  router.push('/login')
  showProfile.value = false
}

const handleClickOutside = (event) => {
  if (notificationsRef.value && !notificationsRef.value.contains(event.target)) {
    showNotifications.value = false
  }
  if (profileRef.value && !profileRef.value.contains(event.target)) {
    showProfile.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  height: 64px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  position: fixed;
  top: 0;
  right: 0;
  left: 250px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar.sidebar-collapsed {
  left: 60px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.notifications {
  position: relative;
}

.notification-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: var(--border-radius-sm);
  position: relative;
}

.notification-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--error);
  color: white;
  font-size: 0.75rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  min-width: 18px;
  text-align: center;
}

.notifications-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
  margin-top: var(--spacing-sm);
}

.notifications-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notifications-header h3 {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0;
}

.mark-all-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.notification-item:hover {
  background-color: var(--bg-tertiary);
}

.notification-item.unread {
  background-color: var(--bg-tertiary);
}

.notification-text {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: 0.875rem;
}

.notification-time {
  color: var(--text-secondary);
  font-size: 0.75rem;
}

.profile {
  position: relative;
}

.profile-btn {
  background: none;
  border: none;
  padding: var(--spacing-xs);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  transition: background-color 0.3s ease;
}

.profile-btn:hover {
  background-color: var(--bg-tertiary);
}

.profile-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--primary);
  transition: transform 0.3s ease;
}

.profile-btn:hover .profile-avatar {
  transform: scale(1.05);
}

.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  margin-top: var(--spacing-sm);
}

.profile-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.profile-avatar-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.profile-info h3 {
  color: var(--text-primary);
  font-size: 1rem;
  margin: 0 0 4px 0;
}

.profile-info p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.profile-actions {
  padding: var(--spacing-sm);
}

.profile-action-btn {
  width: 100%;
  padding: var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
  border-radius: var(--border-radius-md);
  transition: background-color 0.3s ease;
}

.profile-action-btn:hover {
  background-color: var(--bg-tertiary);
}

.profile-action-btn i {
  width: 20px;
  color: var(--text-secondary);
}

.profile-action-btn.logout {
  color: var(--error);
}

.profile-action-btn.logout i {
  color: var(--error);
}

.menu-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: color 0.3s ease;
  border-radius: var(--border-radius-sm);
}

.menu-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

@media (max-width: 768px) {
  .navbar {
    left: 0;
    width: 100%;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .navbar-left {
    gap: var(--spacing-sm);
  }

  .navbar-actions {
    gap: var(--spacing-sm);
  }
}
</style>
