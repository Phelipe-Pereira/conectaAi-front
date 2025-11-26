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

// ---------- EVENTO EXEMPLO RECEBIDO DO ASAAS ----------
const ASAAS_SAMPLE_EVENT = {
  id: 'evt_05b708f961d739ea7eba7e4db318f621&12705503',
  event: 'PAYMENT_CREATED',
  dateCreated: '2025-11-18 21:04:37',
  payment: {
    object: 'payment',
    id: 'pay_abrs3e235gpadazx',
    dateCreated: '2025-11-18',
    customer: 'cus_000007233702',
    checkoutSession: null,
    paymentLink: null,
    value: 100.5,
    netValue: 98.51,
    originalValue: null,
    interestValue: null,
    description: null,
    billingType: 'PIX',
    pixTransaction: null,
    status: 'PENDING',
    dueDate: '2025-12-31',
    originalDueDate: '2025-12-31',
    paymentDate: null,
    clientPaymentDate: null,
    installmentNumber: null,
    invoiceUrl: 'https://sandbox.asaas.com/i/abrs3e235gpadazx',
    invoiceNumber: '12001856',
    externalReference: 'pay_75edd2a64ae341e287b6cf39ae2d9bd1',
    deleted: false,
    anticipated: false,
    anticipable: false,
    creditDate: null,
    estimatedCreditDate: null,
    transactionReceiptUrl: null,
    nossoNumero: null,
    bankSlipUrl: null,
    lastInvoiceViewedDate: null,
    lastBankSlipViewedDate: null,
    discount: {
      value: 0,
      limitDate: null,
      dueDateLimitDays: 0,
      type: 'FIXED',
    },
    fine: {
      value: 0,
      type: 'FIXED',
    },
    interest: {
      value: 0,
      type: 'PERCENTAGE',
    },
    postalService: false,
    escrow: null,
    refunds: null,
  },
}

// ---------- ESTADO ----------
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const isEditing = ref(false)
const formValid = ref(false)
const selectedWebhook = ref<WebhookEndpoint | null>(null)

// Dialog de visualização do evento
const showEventDialog = ref(false)
const showJsonSection = ref(true)

// Filtros locais (UI)
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

// Eventos disponíveis (para cadastro/edição)
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

// ---------- COMPUTED ----------
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

const formattedJson = computed(() =>
  JSON.stringify(ASAAS_SAMPLE_EVENT, null, 2),
)

// ---------- HELPERS VISUAIS ----------
const formatDateTimeBr = (value?: string | null) => {
  if (!value) return '-'
  const iso = value.replace(' ', 'T')
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateOnlyBr = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatCurrencyBr = (value?: number | null) => {
  if (!value && value !== 0) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// ---------- MÉTODOS TABELA / FILTROS ----------
const handleSearch = () => {
  webhooksStore.searchWebhooks(filters.value.search)
}

const handleFilter = () => {
  if (!filters.value.status) {
    webhooksStore.clearFilters()
    webhooksStore.listWebhooks()
    return
  }

  const enabled = filters.value.status === 'active'
  webhooksStore.filterByStatus(enabled)
}

const clearFilters = () => {
  filters.value.search = ''
  filters.value.status = ''
  webhooksStore.clearFilters()
  webhooksStore.listWebhooks()
}

// Ao visualizar um webhook, mostramos o exemplo de evento
const viewWebhook = (webhook: WebhookEndpoint) => {
  selectedWebhook.value = webhook
  showEventDialog.value = true
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
    } catch {
      // erro já tratado no store
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
  } catch {
    // erro já tratado no store
  }
}

const cancelForm = () => {
  showCreateDialog.value = false
  isEditing.value = false
  selectedWebhook.value = null
  form.value.url = ''
  form.value.enabled_events = []
}

// ---------- LIFECYCLE ----------
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
          <div class="stat-label">Eventos Processados</div>
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
              :color="webhooksStore.getEventColor(event)"
              variant="tonal"
              class="mr-1 mb-1"
            >
              {{ webhooksStore.getEventDisplayName(event) }}
            </v-chip>
            <v-chip
              v-if="(Array.isArray(item.enabled_events) ? item.enabled_events : []).length > 2"
              size="small"
              color="grey"
              variant="tonal"
            >
              +
              {{
                (Array.isArray(item.enabled_events) ? item.enabled_events : []).length - 2
              }}
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
        <v-btn variant="outlined" @click="cancelForm" class="cancel-btn">
          Cancelar
        </v-btn>
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

    <!-- Dialog de visualização do evento recebido -->
    <v-dialog v-model="showEventDialog" max-width="1100px">
      <v-card class="event-dialog">
        <v-card-title class="event-header">
          <div class="event-header-left">
            <v-icon size="24" class="mr-2">mdi-bell-ring</v-icon>
            <div>
              <div class="event-title">Exemplo de evento recebido do Asaas</div>
              <div class="event-subtitle">
                Endpoint: {{ selectedWebhook?.url || '—' }}
              </div>
            </div>
          </div>

          <div class="event-header-right">
            <v-chip size="small" color="primary" class="mr-2" variant="elevated">
              {{ ASAAS_SAMPLE_EVENT.event }}
            </v-chip>
            <v-chip size="small" color="success" variant="elevated">
              {{ ASAAS_SAMPLE_EVENT.payment.object.toUpperCase() }}
            </v-chip>
          </div>
        </v-card-title>

        <v-card-text class="event-body">
          <!-- Linha 1 -->
          <v-row class="mb-2">
            <v-col cols="12" md="4">
              <div class="field-label">ID do Evento</div>
              <div class="field-value font-mono">
                {{ ASAAS_SAMPLE_EVENT.id }}
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="field-label">Data de Criação</div>
              <div class="field-value">
                {{ formatDateTimeBr(ASAAS_SAMPLE_EVENT.dateCreated) }}
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="field-label">Status do Pagamento</div>
              <div class="field-value">
                <v-chip size="small" color="warning" variant="tonal">
                  {{ ASAAS_SAMPLE_EVENT.payment.status }}
                </v-chip>
              </div>
            </v-col>
          </v-row>

          <!-- Linha 2 -->
          <v-row class="mb-2">
            <v-col cols="12" md="4">
              <div class="field-label">Pagamento</div>
              <div class="field-value font-mono">
                {{ ASAAS_SAMPLE_EVENT.payment.id }}
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="field-label">Cliente</div>
              <div class="field-value font-mono">
                {{ ASAAS_SAMPLE_EVENT.payment.customer }}
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="field-label">Tipo de Cobrança</div>
              <div class="field-value">
                <v-chip size="small" color="info" variant="tonal">
                  {{ ASAAS_SAMPLE_EVENT.payment.billingType }}
                </v-chip>
              </div>
            </v-col>
          </v-row>

          <!-- Linha 3 -->
          <v-row class="mb-2">
            <v-col cols="12" md="3">
              <div class="field-label">Valor</div>
              <div class="field-value field-amount">
                {{ formatCurrencyBr(ASAAS_SAMPLE_EVENT.payment.value) }}
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="field-label">Valor Líquido</div>
              <div class="field-value">
                {{ formatCurrencyBr(ASAAS_SAMPLE_EVENT.payment.netValue) }}
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="field-label">Vencimento</div>
              <div class="field-value">
                {{ formatDateOnlyBr(ASAAS_SAMPLE_EVENT.payment.dueDate) }}
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="field-label">Invoice</div>
              <div class="field-value">
                <a
                  :href="ASAAS_SAMPLE_EVENT.payment.invoiceUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="invoice-link"
                >
                  {{ ASAAS_SAMPLE_EVENT.payment.invoiceNumber }}
                </a>
              </div>
            </v-col>
          </v-row>

          <!-- Seção JSON -->
          <div class="json-section">
            <div class="json-header" @click="showJsonSection = !showJsonSection">
              <div class="json-header-left">
                <v-icon class="mr-2">
                  {{ showJsonSection ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
                </v-icon>
                <span>Ver JSON completo do evento</span>
              </div>
              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-code-braces"
              >
                {{ showJsonSection ? 'Ocultar' : 'Visualizar' }}
              </v-btn>
            </div>

            <v-expand-transition>
              <div v-if="showJsonSection" class="json-content">
                <pre>{{ formattedJson }}</pre>
              </div>
            </v-expand-transition>
          </div>
        </v-card-text>
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

/* HEADER */
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

/* STATS */
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

/* FILTROS */
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

/* TABELA */
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

/* DIALOG CADASTRO */
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

/* DIALOG EVENTO */
.event-dialog {
  background: linear-gradient(135deg, #111827 0%, #020617 100%);
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  background: radial-gradient(circle at top left, #0f172a 0%, #020617 60%, #000 100%);
  color: #e5e7eb;
}

.event-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.event-header-right {
  display: flex;
  align-items: center;
}

.event-title {
  font-size: 18px;
  font-weight: 600;
}

.event-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

.event-body {
  padding: 20px 24px 24px;
}

.field-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9ca3af;
  margin-bottom: 4px;
}

.field-value {
  font-size: 14px;
  color: #f9fafb;
}

.field-amount {
  font-weight: 700;
  color: #22c55e;
}

.font-mono {
  font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
}

.invoice-link {
  color: #38bdf8;
  text-decoration: none;
}

.invoice-link:hover {
  text-decoration: underline;
}

/* JSON SECTION */
.json-section {
  margin-top: 24px;
  border-radius: 12px;
  background: #020617;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid rgba(148, 163, 184, 0.4);
}

.json-header-left {
  display: flex;
  align-items: center;
  color: #e5e7eb;
  font-size: 14px;
}

.json-content {
  max-height: 340px;
  overflow: auto;
  padding: 16px;
}

.json-content pre {
  margin: 0;
  font-size: 13px;
  color: #e5e7eb;
  font-family: 'SF Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
}

/* RESPONSIVO */
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

  .event-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
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
