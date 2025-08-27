<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar app color="primary" dark elevation="0" class="px-0">
      <v-app-bar-nav-icon @click="toggleDrawer" class="d-md-none" />

      <!-- Toggle button para desktop -->
      <v-btn icon @click="toggleDrawer" class="d-none d-md-flex mr-2" variant="text">
        <v-icon>{{ drawer ? 'mdi-menu-open' : 'mdi-menu' }}</v-icon>
      </v-btn>

      <v-toolbar-title class="d-flex align-center">
        <v-icon size="32" class="mr-3">mdi-credit-card-multiple</v-icon>
        <span class="text-h6 font-weight-bold">ConectaAI</span>
      </v-toolbar-title>

      <v-spacer />

      <!-- Breadcrumb -->
      <v-breadcrumbs
        v-if="$route.meta.breadcrumb && Array.isArray($route.meta.breadcrumb)"
        :items="$route.meta.breadcrumb"
        class="d-none d-lg-flex"
        color="white"
      />

      <v-spacer />

      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="mr-2">
            <v-avatar size="32" color="primary">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="$router.push('/dashboard/perfil')" prepend-icon="mdi-account">
            <v-list-item-title>Perfil</v-list-item-title>
          </v-list-item>

          <v-divider />

          <v-list-item @click="logout" prepend-icon="mdi-logout">
            <v-list-item-title>Sair</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :permanent="$vuetify.display.lgAndUp && !collapsed"
      :temporary="$vuetify.display.mdAndDown"
      :rail="$vuetify.display.lgAndUp && collapsed"
      color="grey-darken-4"
      elevation="1"
      class="sidebar-drawer"
      width="280"
      rail-width="64"
    >
      <v-list class="pa-0">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="collapsed ? undefined : item.title"
          :active="$route.path.startsWith(item.to)"
          class="menu-item mb-1"
          :class="{ 'menu-item--active': $route.path.startsWith(item.to) }"
        />
      </v-list>

      <!-- Footer do sidebar -->
      <template v-slot:append>
        <div v-if="!collapsed" class="pa-4">
          <v-divider class="mb-3" />
          <div class="text-caption text-grey-lighten-1">
            <div class="d-flex align-center mb-1">
              <v-icon size="16" class="mr-2">mdi-information</v-icon>
              Versão 1.0.0
            </div>
            <div class="text-caption">© 2024 ConectaAI</div>
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <router-view />
      </v-container>
    </v-main>

    <!-- Global Snackbar -->
    <AppSnackbar
      v-model="snackbar.show"
      :text="snackbar.text"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      :icon="snackbar.icon"
    />
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/stores/useAuth'
import { useSnackbar } from '@/stores/useSnackbar'
import AppSnackbar from '@/components/common/AppSnackbar.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuth()
const snackbarStore = useSnackbar()

// Estado
const drawer = ref(true)
const collapsed = ref(false)

// Menu items
const menuItems = [
  {
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    to: '/dashboard',
  },
  {
    title: 'Clientes',
    icon: 'mdi-account-group',
    to: '/dashboard/clientes',
  },
  {
    title: 'Cobranças',
    icon: 'mdi-credit-card',
    to: '/dashboard/cobrancas',
  },
  {
    title: 'Parcelamentos',
    icon: 'mdi-calendar-clock',
    to: '/dashboard/parcelamentos',
  },
  {
    title: 'Assinaturas',
    icon: 'mdi-refresh',
    to: '/dashboard/assinaturas',
  },
  {
    title: 'Webhooks',
    icon: 'mdi-webhook',
    to: '/dashboard/webhooks',
  },
  {
    title: 'Notificações',
    icon: 'mdi-bell',
    to: '/dashboard/notifications',
  },
  {
    title: 'Configurações',
    icon: 'mdi-cog',
    to: '/dashboard/configuracoes',
  },
]

// Computed para snackbar
const snackbar = computed(() => ({
  show: snackbarStore.show,
  text: snackbarStore.text,
  color: snackbarStore.color,
  timeout: snackbarStore.timeout,
  icon: snackbarStore.icon,
}))

// Métodos
const toggleDrawer = () => {
  if (window.innerWidth >= 1280) {
    // lg breakpoint
    collapsed.value = !collapsed.value
    drawer.value = !collapsed.value
  } else {
    drawer.value = !drawer.value
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Watch para fechar drawer em mobile quando navegar
watch(route, () => {
  if (window.innerWidth < 960) {
    // md breakpoint
    drawer.value = false
  }
})
</script>

<style scoped>
.sidebar-drawer {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-item {
  border-radius: 12px;
  margin: 4px 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.menu-item:hover {
  background-color: rgba(0, 122, 255, 0.15);
  transform: translateX(4px);
}

.menu-item--active {
  background: linear-gradient(135deg, #007aff 0%, #0055b3 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.menu-item--active:hover {
  background: linear-gradient(135deg, #0055b3 0%, #003d82 100%);
  transform: translateX(4px);
}

.menu-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #00d4ff 0%, #007aff 100%);
  border-radius: 0 2px 2px 0;
}

.main-content {
  min-height: 100vh;
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-container {
  max-width: 1400px;
  margin: 0 auto;
}

.v-app-bar {
  background: linear-gradient(135deg, #007aff 0%, #0055b3 100%);
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.2);
  backdrop-filter: blur(10px);
}

.v-toolbar-title {
  background: linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Responsividade */
@media (max-width: 959px) {
  .v-container {
    padding: 16px;
  }
}

@media (max-width: 599px) {
  .v-container {
    padding: 12px;
  }
}

/* Animações */
.v-list-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Scrollbar personalizada */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 122, 255, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 122, 255, 0.5);
}
</style>
