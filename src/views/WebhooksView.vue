<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useWebhooks } from '@/stores/useWebhooks'
import { formatDate } from '@/utils/formatters'
import { validateURL } from '@/utils/validators'
import AppDataTable from '@/components/common/AppDataTable.vue'
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'
import type { components } from '@/sdk/types'

type WebhookEndpoint = components['schemas']['WebhookEndpoint']

const webhooksStore = useWebhooks()

// Estado
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const formValid = ref(false)
const selectedWebhook = ref<WebhookEndpoint | null>(null)

// Filtros
const filters = ref({
  search: '',
  status: '',
})

// Formulário
const form = ref({
  url: '',
  enabled_events: [] as string[],
})

// Regras de validação
const rules = {
  required: (value: any) => !!value || 'Campo obrigatório',
  url: (value: string) => validateURL(value) || 'URL inválida',
}

// Headers da tabela
const headers = [
  { title: 'URL', key: 'url', sortable: true, text: 'URL', value: 'url' },
  {
    title: 'Eventos',
    key: 'enabled_events',
    sortable: false,
    text: 'Eventos',
    value: 'enabled_events',
  },
  { title: 'Criado em', key: 'created_at', sortable: true, text: 'Criado em', value: 'created_at' },
  {
    title: 'Ações',
    key: 'actions',
    sortable: false,
    text: 'Ações',
    value: 'actions',
    width: '120px',
  },
]

// Opções de status
const statusOptions = [
  { title: 'Todos', value: '' },
  { title: 'Ativos', value: 'active' },
  { title: 'Inativos', value: 'inactive' },
]

// Eventos disponíveis
const availableEvents = [
  { title: 'Cobrança Criada', value: 'charge.created' },
  { title: 'Cobrança Atualizada', value: 'charge.updated' },
  { title: 'Cobrança Paga', value: 'charge.paid' },
  { title: 'Cobrança Reembolsada', value: 'charge.refunded' },
  { title: 'Cobrança Cancelada', value: 'charge.canceled' },
  { title: 'Assinatura Criada', value: 'subscription.created' },
  { title: 'Assinatura Atualizada', value: 'subscription.updated' },
  { title: 'Assinatura Cancelada', value: 'subscription.canceled' },
  { title: 'Cliente Criado', value: 'customer.created' },
  { title: 'Cliente Atualizado', value: 'customer.updated' },
]

// Computed
const filteredWebhooks = computed(() => {
  let filtered = webhooksStore.webhooks

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter((webhook) => webhook.url?.toLowerCase().includes(search))
  }

  if (filters.value.status) {
    if (filters.value.status === 'active') {
      filtered = filtered.filter((webhook) => (webhook.enabled_events?.length || 0) > 0)
    } else if (filters.value.status === 'inactive') {
      filtered = filtered.filter((webhook) => !webhook.enabled_events?.length)
    }
  }

  return filtered
})

// Métodos
const getEventColor = (event: string) => {
  const colors: Record<string, string> = {
    'charge.created': 'primary',
    'charge.updated': 'info',
    'charge.paid': 'success',
    'charge.refunded': 'warning',
    'charge.canceled': 'error',
    'subscription.created': 'primary',
    'subscription.updated': 'info',
    'subscription.canceled': 'error',
    'customer.created': 'success',
    'customer.updated': 'info',
  }
  return colors[event] || 'grey'
}

const getEventDisplayName = (event: string) => {
  const names: Record<string, string> = {
    'charge.created': 'Cobrança Criada',
    'charge.updated': 'Cobrança Atualizada',
    'charge.paid': 'Cobrança Paga',
    'charge.refunded': 'Cobrança Reembolsada',
    'charge.canceled': 'Cobrança Cancelada',
    'subscription.created': 'Assinatura Criada',
    'subscription.updated': 'Assinatura Atualizada',
    'subscription.canceled': 'Assinatura Cancelada',
    'customer.created': 'Cliente Criado',
    'customer.updated': 'Cliente Atualizado',
  }
  return names[event] || event
}

const handleSearch = () => {
  // Implementar busca se necessário
}

const handleFilter = () => {
  // Implementar filtro se necessário
}

const clearFilters = () => {
  filters.value.search = ''
  filters.value.status = ''
}

const viewWebhook = (webhook: WebhookEndpoint) => {
  selectedWebhook.value = webhook
  // Implementar visualização detalhada
}

const editWebhook = (webhook: WebhookEndpoint) => {
  selectedWebhook.value = webhook
  isEditing.value = true
  form.value.url = webhook.url || ''
  form.value.enabled_events = (webhook.enabled_events as any) || []
  showCreateDialog.value = true
}

const deleteWebhook = (webhook: WebhookEndpoint) => {
  selectedWebhook.value = webhook
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (selectedWebhook.value?.id) {
    try {
      await webhooksStore.deleteWebhook(selectedWebhook.value.id)
      showDeleteDialog.value = false
      selectedWebhook.value = null
    } catch (error) {
      // Erro já tratado na store
    }
  }
}

const saveWebhook = async () => {
  try {
    if (isEditing.value && selectedWebhook.value?.id) {
      await webhooksStore.updateWebhook(selectedWebhook.value.id, {
        url: form.value.url,
        enabled_events: form.value.enabled_events as any,
      })
    } else {
      await webhooksStore.createWebhook({
        url: form.value.url,
        enabled_events: form.value.enabled_events as any,
      })
    }
    cancelForm()
  } catch (error) {
    // Erro já tratado na store
  }
}

const cancelForm = () => {
  showCreateDialog.value = false
  isEditing.value = false
  selectedWebhook.value = null
  form.value.url = ''
  form.value.enabled_events = []
}

// Lifecycle
onMounted(() => {
  webhooksStore.listWebhooks()
})
</script>

<template>
  <div class="webhooks-container">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">
            <v-icon size="32" class="mr-3">mdi-webhook</v-icon>
            Webhooks
          </h1>
          <p class="page-subtitle">
            Gerencie endpoints de webhook para receber notificações em tempo real
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showCreateDialog = true"
          class="create-btn"
        >
          Novo Webhook
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="primary">mdi-webhook</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ webhooksStore.totalItems }}</div>
          <div class="stat-label">Total de Webhooks</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="success">mdi-check-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ webhooksStore.enabledWebhooks.length }}</div>
          <div class="stat-label">Ativos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="warning">mdi-pause-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ webhooksStore.disabledWebhooks.length }}</div>
          <div class="stat-label">Inativos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="info">mdi-bell</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ webhooksStore.totalEvents }}</div>
          <div class="stat-label">Total de Eventos</div>
        </div>
      </div>
    </div>

    <!-- Filtros e busca -->
    <div class="filters-section">
      <div class="filters-content">
        <v-text-field
          v-model="filters.search"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar webhooks..."
          variant="outlined"
          density="compact"
          hide-details
          class="search-field"
          @update:model-value="handleSearch"
        />

        <v-select
          v-model="filters.status"
          :items="statusOptions"
          placeholder="Status"
          variant="outlined"
          density="compact"
          hide-details
          class="status-filter"
          @update:model-value="handleFilter"
        />

        <v-btn
          variant="outlined"
          prepend-icon="mdi-filter-remove"
          @click="clearFilters"
          class="clear-filters-btn"
        >
          Limpar Filtros
        </v-btn>
      </div>
    </div>

    <!-- Tabela de webhooks -->
    <div class="table-section">
      <AppDataTable
        :items="filteredWebhooks"
        :loading="webhooksStore.loading"
        :headers="headers"
        :items-per-page="20"
        class="webhooks-table"
      >
        <template #item.url="{ item }">
          <div class="url-cell">
            <v-icon size="16" color="primary" class="mr-2">mdi-link</v-icon>
            <span class="url-text">{{ item.url }}</span>
          </div>
        </template>

        <template #item.enabled_events="{ item }">
          <div class="events-cell">
            <v-chip
              v-for="event in (Array.isArray(item.enabled_events) ? item.enabled_events : []).slice(
                0,
                2,
              )"
              :key="event"
              size="small"
              :color="getEventColor(event)"
              variant="tonal"
              class="mr-1 mb-1"
            >
              {{ getEventDisplayName(event) }}
            </v-chip>
            <v-chip
              v-if="(Array.isArray(item.enabled_events) ? item.enabled_events : []).length > 2"
              size="small"
              color="grey"
              variant="tonal"
            >
              +{{ (Array.isArray(item.enabled_events) ? item.enabled_events : []).length - 2 }}
            </v-chip>
          </div>
        </template>

        <template #item.created_at="{ item }">
          <div class="date-cell">
            {{ formatDate(item.created_at as string) }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="actions-cell">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="primary"
              @click="viewWebhook(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editWebhook(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteWebhook(item)"
              class="action-btn"
            />
          </div>
        </template>
      </AppDataTable>
    </div>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="600px" persistent>
      <v-card class="webhook-dialog">
        <v-card-title class="dialog-title">
          <v-icon size="24" class="mr-2">{{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ isEditing ? 'Editar Webhook' : 'Novo Webhook' }}
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="form" v-model="formValid">
            <v-text-field
              v-model="form.url"
              label="URL do Webhook"
              placeholder="https://seu-site.com/webhook"
              variant="outlined"
              :rules="[rules.required, rules.url]"
              required
            />

            <v-select
              v-model="form.enabled_events"
              :items="availableEvents"
              label="Eventos Habilitados"
              variant="outlined"
              multiple
              chips
              :rules="[rules.required]"
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="outlined" @click="cancelForm" class="cancel-btn"> Cancelar </v-btn>
          <v-btn
            color="primary"
            @click="saveWebhook"
            :loading="webhooksStore.loading"
            :disabled="!formValid"
            class="save-btn"
          >
            {{ isEditing ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmação de exclusão -->
    <AppConfirmDialog
      v-model="showDeleteDialog"
      title="Excluir Webhook"
      message="Tem certeza que deseja excluir este webhook? Esta ação não pode ser desfeita."
      confirm-text="Excluir"
      cancel-text="Cancelar"
      color="error"
      icon="mdi-delete"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.webhooks-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-info {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.create-btn {
  background: linear-gradient(135deg, #007aff 0%, #0055b3 100%);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.filters-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.filters-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-field {
  flex: 1;
  max-width: 300px;
}

.status-filter {
  max-width: 200px;
}

.clear-filters-btn {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.table-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.webhooks-table {
  background: transparent;
}

.url-cell {
  display: flex;
  align-items: center;
  max-width: 300px;
}

.url-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.events-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.date-cell {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.webhook-dialog {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-title {
  background: linear-gradient(135deg, #007aff 0%, #0055b3 100%);
  color: white;
  display: flex;
  align-items: center;
}

.dialog-content {
  padding: 24px;
}

.dialog-actions {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
}

.cancel-btn {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.save-btn {
  background: linear-gradient(135deg, #007aff 0%, #0055b3 100%);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* Responsividade */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field,
  .status-filter {
    max-width: none;
  }

  .url-cell {
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .page-header {
    padding: 16px;
  }

  .table-section {
    padding: 12px;
  }
}
</style>
