<template>
  <div class="assinaturas-view">
    <AppPageHeader
      title="Assinaturas"
      subtitle="Gerencie cobranças recorrentes e planos"
      icon="mdi-refresh"
      icon-color="green"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showCreateDialog = true"
        >
          Nova Assinatura
        </v-btn>
      </template>
    </AppPageHeader>

    <v-card>
      <v-card-text>
        <p class="text-body-1 text-medium-emphasis">
          View de Assinaturas - Em desenvolvimento
        </p>
        <p class="text-caption">
          Esta view será implementada com o CRUD completo de assinaturas usando os componentes do Design System.
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
.assinaturas-view {
  width: 100%;
}
</style>
