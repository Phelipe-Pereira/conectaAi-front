<template>
  <div class="cobrancas-view">
    <AppPageHeader
      title="Cobranças"
      subtitle="Gerencie todas as cobranças e transações"
      icon="mdi-credit-card"
      icon-color="primary"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showCreateDialog = true"
        >
          Nova Cobrança
        </v-btn>
      </template>
    </AppPageHeader>

    <v-card>
      <v-card-text>
        <p class="text-body-1 text-medium-emphasis">
          View de Cobranças - Em desenvolvimento
        </p>
        <p class="text-caption">
          Esta view será implementada com o CRUD completo de cobranças usando os componentes do Design System.
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
.cobrancas-view {
  width: 100%;
}
</style>
