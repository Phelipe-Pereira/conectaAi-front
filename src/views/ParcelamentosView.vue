<template>
  <div class="parcelamentos-view">
    <AppPageHeader
      title="Parcelamentos"
      subtitle="Gerencie cobranças parceladas e financiamentos"
      icon="mdi-calendar-clock"
      icon-color="orange"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showCreateDialog = true"
        >
          Novo Parcelamento
        </v-btn>
      </template>
    </AppPageHeader>

    <v-card>
      <v-card-text>
        <p class="text-body-1 text-medium-emphasis">
          View de Parcelamentos - Em desenvolvimento
        </p>
        <p class="text-caption">
          Esta view será implementada com o CRUD completo de parcelamentos usando os componentes do Design System.
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppPageHeader from '@/components/common/AppPageHeader.vue'

const showCreateDialog = ref(false)
</script>

<style scoped>
.parcelamentos-view {
  width: 100%;
}
</style>
