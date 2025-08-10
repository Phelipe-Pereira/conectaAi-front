<template>
  <div class="logo" :class="{ 'logo-small': small }">
    <img src="@/assets/logo.svg" alt="Middleware Multi-Gateways Logo" class="logo-icon" />
    <span class="logo-text" v-if="!small">Middleware Multi-Gateways</span>
  </div>
</template>

<script setup>
defineProps({
  small: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.logo-icon {
  width: 32px;
  height: 32px;
  transition: all 0.3s ease;
}

.logo-small .logo-icon {
  width: 24px;
  height: 24px;
}

.logo-text {
  font-weight: bold;
  font-size: 1.5rem;
  background: linear-gradient(45deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.logo-small .logo-text {
  font-size: 1.2rem;
}
</style>
