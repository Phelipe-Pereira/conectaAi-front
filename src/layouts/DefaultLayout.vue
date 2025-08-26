<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar app color="primary" dark elevation="0" class="px-0">
      <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none" />

      <v-toolbar-title class="d-flex align-center">
        <v-icon size="32" class="mr-3">mdi-credit-card-multiple</v-icon>
        <span class="text-h6 font-weight-bold">ConectaAI</span>
      </v-toolbar-title>

      <v-spacer />

      <!-- User Menu -->
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="mr-2">
            <v-avatar size="32">
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
      :permanent="$vuetify.display.mdAndUp"
      :temporary="$vuetify.display.smAndDown"
      color="grey-darken-4"
      elevation="1"
    >
      <v-list class="pa-0">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="$route.path.startsWith(item.to)"
          class="mb-1"
        />
      </v-list>
    </v-navigation-drawer>

         <!-- Main Content -->
     <v-main class="bg-grey-darken-4">
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/stores/useAuth'
import { useSnackbar } from '@/stores/useSnackbar'
import AppSnackbar from '@/components/common/AppSnackbar.vue'

const router = useRouter()
const authStore = useAuth()
const snackbarStore = useSnackbar()

// Estado
const drawer = ref(true)

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
const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.v-navigation-drawer {
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.v-list-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.3s ease;
}

.v-list-item:hover {
  background-color: rgba(0, 122, 255, 0.2);
}

.v-list-item--active {
  background-color: #007aff;
  color: white;
}

.v-list-item--active:hover {
  background-color: #0055b3;
}

.v-main {
  min-height: 100vh;
  background-color: #111827;
}

.v-container {
  max-width: 1400px;
}

.v-app-bar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
