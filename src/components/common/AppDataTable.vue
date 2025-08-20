<template>
  <div class="app-data-table">
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      :search="search"
      :sort-by="sortBy as any"
      :sort-desc="sortDesc"
      :items-per-page="itemsPerPage"
      :page="page"
      :server-items-length="totalItems"
      :options.sync="tableOptions"
      @update:options="onOptionsUpdate"
      class="elevation-1"
    >
      <!-- Slot para ações personalizadas -->
      <template v-slot:item.actions="{ item }">
        <slot name="actions" :item="item">
          <v-btn icon small color="primary" @click="$emit('edit', item)" title="Editar">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small color="error" @click="$emit('delete', item)" title="Excluir">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </slot>
      </template>

      <!-- Slot para conteúdo personalizado em colunas -->
      <template v-slot:item="{ item, index }">
        <tr>
          <td v-for="header in headers" :key="header.value">
            <slot :name="`item.${header.value}`" :item="item" :index="index">
              {{ item[header.value] }}
            </slot>
          </td>
        </tr>
      </template>

      <!-- Slot para quando não há dados -->
      <template v-slot:no-data>
        <slot name="no-data">
          <v-alert type="info" variant="text"> Nenhum dado encontrado </v-alert>
        </slot>
      </template>

      <!-- Slot para quando está carregando -->
      <template v-slot:loading>
        <slot name="loading">
          <v-skeleton-loader type="table-row@10" />
        </slot>
      </template>
    </v-data-table>

    <!-- Paginação personalizada -->
    <div v-if="showPagination" class="d-flex justify-space-between align-center pa-4">
      <div class="text-caption">
        Mostrando {{ startIndex + 1 }} a {{ endIndex }} de {{ totalItems }} itens
      </div>
      <v-pagination
        v-model="page"
        :length="totalPages"
        :total-visible="7"
        @input="$emit('page-change', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Header {
  text: string
  value: string
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
  width?: string
}

interface Props {
  headers: Header[]
  items: any[]
  loading?: boolean
  search?: string
  sortBy?: string[]
  sortDesc?: boolean[]
  itemsPerPage?: number
  page?: number
  totalItems?: number
  showPagination?: boolean
}

interface Emits {
  (e: 'edit', item: any): void
  (e: 'delete', item: any): void
  (e: 'page-change', page: number): void
  (e: 'options-update', options: any): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  search: '',
  sortBy: () => [],
  sortDesc: () => [],
  itemsPerPage: 10,
  page: 1,
  totalItems: 0,
  showPagination: true,
})

const emit = defineEmits<Emits>()

// Estado interno
const tableOptions = ref({
  page: props.page,
  itemsPerPage: props.itemsPerPage,
  sortBy: props.sortBy,
  sortDesc: props.sortDesc,
})

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

const startIndex = computed(() => {
  return (props.page - 1) * props.itemsPerPage
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + props.itemsPerPage, props.totalItems)
})

// Métodos
const onOptionsUpdate = (options: any) => {
  tableOptions.value = options
  emit('options-update', options)
}

// Watchers
watch(
  () => props.page,
  (newPage) => {
    tableOptions.value.page = newPage
  },
)

watch(
  () => props.itemsPerPage,
  (newItemsPerPage) => {
    tableOptions.value.itemsPerPage = newItemsPerPage
  },
)
</script>

<style scoped>
.app-data-table {
  width: 100%;
}

.v-data-table {
  border-radius: 8px;
  overflow: hidden;
}

.v-data-table ::v-deep .v-data-table__wrapper {
  border-radius: 8px;
}

.v-data-table ::v-deep .v-data-table__mobile-table {
  border-radius: 8px;
}
</style>
