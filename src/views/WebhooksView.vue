<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useWebhooks } from '@/stores/useWebhooks'
import { formatDate } from '@/utils/formatters'
import { validateURL } from '@/utils/validators'
import AppDataTable from '@/components/common/AppDataTable.vue'
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'

type WebhookEvent = 'charge.created' | 'charge.updated' | 'charge.paid' | 'charge.refunded' | 'charge.canceled' | 'subscription.created' | 'subscription.updated' | 'subscription.canceled' | 'customer.created' | 'customer.updated'

const webhooksStore = useWebhooks()

// Estados
const searchQuery = ref('')
const statusFilter = ref('')
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const formValid = ref(false)
const editingWebhook = ref<any>(null)
const selectedWebhook = ref<any>(null)
const webhookToDelete = ref<any>(null)

// Formulário
const formData = reactive({
  url: '',
  enabled_events: [] as WebhookEvent[]
})

// Headers da tabela
const headers = [
  { title: 'URL', key: 'url', sortable: false, text: 'URL', value: 'url' },
  { title: 'Eventos', key: 'enabled_events', sortable: false, text: 'Eventos', value: 'enabled_events' },
  { title: 'Criado em', key: 'created_at', sortable: true, text: 'Criado em', value: 'created_at' },
  { title: 'Ações', key: 'actions', sortable: false, text: 'Ações', value: 'actions', width: '120px' }
]

// Opções de filtro
const statusOptions = [
  { title: 'Ativos', value: 'enabled' },
  { title: 'Inativos', value: 'disabled' }
]

// Opções de eventos
const eventOptions = [
  { title: 'Cobrança Criada', value: 'charge.created' as WebhookEvent },
  { title: 'Cobrança Atualizada', value: 'charge.updated' as WebhookEvent },
  { title: 'Cobrança Paga', value: 'charge.paid' as WebhookEvent },
  { title: 'Cobrança Reembolsada', value: 'charge.refunded' as WebhookEvent },
  { title: 'Cobrança Cancelada', value: 'charge.canceled' as WebhookEvent },
  { title: 'Assinatura Criada', value: 'subscription.created' as WebhookEvent },
  { title: 'Assinatura Atualizada', value: 'subscription.updated' as WebhookEvent },
  { title: 'Assinatura Cancelada', value: 'subscription.canceled' as WebhookEvent },
  { title: 'Cliente Criado', value: 'customer.created' as WebhookEvent },
  { title: 'Cliente Atualizado', value: 'customer.updated' as WebhookEvent }
]

// Métodos
const handleSearch = () => {
  webhooksStore.searchWebhooks(searchQuery.value || '')
}

const handleStatusFilter = (value: string) => {
  if (value === 'enabled') {
    webhooksStore.filterByStatus(true)
  } else if (value === 'disabled') {
    webhooksStore.filterByStatus(false)
  } else {
    webhooksStore.listWebhooks()
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  webhooksStore.clearFilters()
  webhooksStore.listWebhooks()
}

const viewWebhook = (webhook: any) => {
  selectedWebhook.value = webhook
  showViewDialog.value = true
}

const editWebhook = (webhook: any) => {
  editingWebhook.value = webhook
  formData.url = webhook.url
  formData.enabled_events = [...webhook.enabled_events]
  showCreateDialog.value = true
}

const deleteWebhook = (webhook: any) => {
  webhookToDelete.value = webhook
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (webhookToDelete.value) {
    await webhooksStore.deleteWebhook(webhookToDelete.value.id)
    webhookToDelete.value = null
  }
}

const saveWebhook = async () => {
  if (editingWebhook.value) {
    await webhooksStore.updateWebhook(editingWebhook.value.id, formData)
  } else {
    await webhooksStore.createWebhook(formData)
  }
  
  showCreateDialog.value = false
  resetForm()
}

const resetForm = () => {
  editingWebhook.value = null
  formData.url = ''
  formData.enabled_events = []
}

// Carregar dados iniciais
onMounted(() => {
  webhooksStore.listWebhooks()
})
</script>

<template>
  <div class="webhooks-view">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <v-icon size="32" color="primary" class="mr-3">mdi-webhook</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">Webhooks</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Gerencie endpoints de webhook para receber notificações
            </p>
          </div>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
          Novo Webhook
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-grid mb-6">
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-primary">{{ webhooksStore.totalItems }}</div>
          <div class="text-subtitle-2 text-medium-emphasis">Total de Webhooks</div>
        </v-card-text>
      </v-card>
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-success">{{ webhooksStore.enabledWebhooks.length }}</div>
          <div class="text-subtitle-2 text-medium-emphasis">Ativos</div>
        </v-card-text>
      </v-card>
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-warning">{{ webhooksStore.disabledWebhooks.length }}</div>
          <div class="text-subtitle-2 text-medium-emphasis">Inativos</div>
        </v-card-text>
      </v-card>
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-info">{{ webhooksStore.totalEvents }}</div>
          <div class="text-subtitle-2 text-medium-emphasis">Total de Eventos</div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Filtros -->
    <v-card class="mb-6">
      <v-card-text>
        <div class="d-flex flex-wrap gap-4 align-center">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="Buscar webhooks..."
            variant="outlined"
            density="comfortable"
            style="min-width: 300px"
            @input="handleSearch"
            clearable
          />
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            label="Status"
            variant="outlined"
            density="comfortable"
            style="min-width: 200px"
            @update:model-value="handleStatusFilter"
            clearable
          />
          <v-btn
            variant="outlined"
            prepend-icon="mdi-filter-remove"
            @click="clearFilters"
          >
            Limpar Filtros
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabela de webhooks -->
    <v-card>
      <v-card-text>
        <AppDataTable
          :items="webhooksStore.webhooks"
          :loading="webhooksStore.loading"
          :headers="headers"
          :search="searchQuery"
          :items-per-page="20"
          @load-more="webhooksStore.loadMoreWebhooks"
          :has-more="webhooksStore.hasMore"
        >
          <template #item.url="{ item }">
            <div class="d-flex align-center">
              <v-icon size="small" color="primary" class="mr-2">mdi-link</v-icon>
              <span class="text-truncate" style="max-width: 300px">{{ item.url }}</span>
            </div>
          </template>

          <template #item.enabled_events="{ item }">
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="event in item.enabled_events"
                :key="event"
                :color="webhooksStore.getEventColor(event)"
                size="small"
                variant="tonal"
              >
                {{ webhooksStore.getEventDisplayName(event) }}
              </v-chip>
            </div>
          </template>

          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at as string) }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                color="primary"
                @click="viewWebhook(item)"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="warning"
                @click="editWebhook(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteWebhook(item)"
              />
            </div>
          </template>
        </AppDataTable>
      </v-card-text>
    </v-card>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingWebhook ? 'Editar Webhook' : 'Novo Webhook' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-text-field
              v-model="formData.url"
              label="URL do Webhook"
              variant="outlined"
              :rules="[v => !!v || 'URL é obrigatória', v => validateURL(v) || 'URL inválida']"
              required
            />
            <v-select
              v-model="formData.enabled_events"
              :items="eventOptions"
              label="Eventos"
              variant="outlined"
              multiple
              chips
              :rules="[v => v.length > 0 || 'Selecione pelo menos um evento']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="webhooksStore.loading"
            :disabled="!formValid"
            @click="saveWebhook"
          >
            {{ editingWebhook ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de visualização -->
    <v-dialog v-model="showViewDialog" max-width="800px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon size="24" color="primary" class="mr-2">mdi-webhook</v-icon>
          Detalhes do Webhook
        </v-card-title>
        <v-card-text v-if="selectedWebhook">
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title>ID</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedWebhook.id }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-link</v-icon>
                  </template>
                  <v-list-item-title>URL</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedWebhook.url }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>Criado em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedWebhook.created_at, true) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-h6">Eventos Configurados</v-card-title>
                <v-card-text>
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-for="event in selectedWebhook.enabled_events"
                      :key="event"
                      :color="webhooksStore.getEventColor(event)"
                      variant="tonal"
                    >
                      {{ webhooksStore.getEventDisplayName(event) }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showViewDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmação de exclusão -->
    <AppConfirmDialog
      v-model="showDeleteDialog"
      title="Excluir Webhook"
      message="Tem certeza que deseja excluir este webhook? Esta ação não pode ser desfeita."
      confirm-text="Excluir"
      confirm-color="error"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.webhooks-view {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.gap-4 {
  gap: 16px;
}

.gap-2 {
  gap: 8px;
}

.gap-1 {
  gap: 4px;
}
</style>
