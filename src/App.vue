<script setup lang="ts">
import { RouterView } from 'vue-router'
import './assets/main.css'
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
