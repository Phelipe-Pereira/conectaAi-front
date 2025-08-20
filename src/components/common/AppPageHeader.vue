<template>
  <div class="app-page-header">
    <v-card flat class="pa-6 mb-6">
      <div class="d-flex align-center justify-space-between">
        <div class="header-content">
          <div class="d-flex align-center mb-2">
            <v-icon 
              v-if="icon" 
              :color="iconColor" 
              size="32" 
              class="mr-3"
            >
              {{ icon }}
            </v-icon>
            <div>
              <h1 class="text-h4 font-weight-bold mb-1">
                {{ title }}
              </h1>
              <p v-if="subtitle" class="text-subtitle-1 text-medium-emphasis">
                {{ subtitle }}
              </p>
            </div>
          </div>
          
          <div v-if="$slots.breadcrumbs" class="breadcrumbs">
            <slot name="breadcrumbs" />
          </div>
        </div>

        <div class="header-actions">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="$slots.tabs" class="header-tabs mt-4">
        <slot name="tabs" />
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  icon?: string
  iconColor?: string
}

defineProps<Props>()
</script>

<style scoped>
.app-page-header {
  width: 100%;
}

.header-content {
  flex: 1;
}

.header-actions {
  flex-shrink: 0;
}

.breadcrumbs {
  margin-top: 8px;
}

.header-tabs {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 16px;
}

.text-h4 {
  color: var(--v-primary-base);
}

.text-medium-emphasis {
  opacity: 0.7;
}
</style>
