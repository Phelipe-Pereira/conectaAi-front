<template>
  <div class="layout" :class="{ 'sidebar-collapsed': !isSidebarOpen }">
    <Sidebar />
    <div class="content-wrapper">
      <Navbar />
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import Navbar from '../Navbar.vue'
import { useSidebarStore } from '@/stores/sidebarStore'

const { isOpen: isSidebarOpen } = useSidebarStore()
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
  background-color: var(--bg-primary);
}

.content-wrapper {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.sidebar-collapsed .content-wrapper {
  margin-left: 60px;
}

.main-content {
  padding: calc(64px + var(--spacing-lg)) var(--spacing-lg) var(--spacing-lg);
  min-height: calc(100vh - 64px);
  background-color: var(--bg-primary);
}

@media (max-width: 768px) {
  .content-wrapper {
    margin-left: 0;
  }
}
</style>
