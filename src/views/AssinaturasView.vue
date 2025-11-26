<template>
  <div class="assinaturas-container">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">
            <v-icon size="32" class="mr-3">mdi-refresh</v-icon>
            Assinaturas
          </h1>
          <p class="page-subtitle">Gerencie cobranças recorrentes e planos da plataforma</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showCreateDialog = true"
          class="create-btn"
        >
          Nova Assinatura
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="primary">mdi-refresh</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total de Assinaturas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="success">mdi-check-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.active }}</div>
          <div class="stat-label">Ativas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="warning">mdi-pause-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">Pausadas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="error">mdi-close-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.canceled }}</div>
          <div class="stat-label">Canceladas</div>
        </div>
      </div>
    </div>

    <!-- Filtros e busca -->
    <div class="filters-section">
      <div class="filters-content">
        <v-text-field
          v-model="searchTerm"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar assinaturas por ID, descrição ou cliente..."
          variant="outlined"
          density="compact"
          hide-details
          class="search-field"
        />

        <v-select
          v-model="selectedStatus"
          :items="statusOptions"
          placeholder="Status"
          variant="outlined"
          density="compact"
          hide-details
          class="status-filter"
        />

        <v-select
          v-model="selectedPlan"
          :items="planOptions"
          placeholder="Plano"
          variant="outlined"
          density="compact"
          hide-details
          class="plan-filter"
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

    <!-- Tabela de assinaturas -->
    <div class="table-section">
      <v-data-table
        :headers="headers"
        :items="assinaturasFiltradas"
        :loading="subscriptionsStore.loading"
        class="assinaturas-table"
        hover
      >
        <template #item.id="{ item }">
          <div class="id-cell">
            <v-icon size="16" color="primary" class="mr-2">mdi-identifier</v-icon>
            <span class="font-mono">{{ item.id }}</span>
          </div>
        </template>

        <template #item.amount="{ item }">
          <div class="amount-cell">
            <span class="font-weight-bold text-success">
              {{ formatCurrency(item.amount) }}
            </span>
          </div>
        </template>

        <template #item.description="{ item }">
          <div class="description-cell">
            <span class="text-truncate">{{ item.description }}</span>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
            class="status-chip"
          >
            <v-icon size="14" class="mr-1">
              {{ getStatusIcon(item.status) }}
            </v-icon>
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template #item.interval="{ item }">
          <v-chip
            :color="getPlanColor(item.interval)"
            size="small"
            variant="tonal"
            class="plan-chip"
          >
            <v-icon size="14" class="mr-1">
              {{ getPlanIcon(item.interval) }}
            </v-icon>
            {{ getPlanText(item.interval) }}
          </v-chip>
        </template>

        <template #item.customer_id="{ item }">
          <div class="customer-cell">
            <v-icon size="16" color="info" class="mr-2">mdi-account</v-icon>
            <span>
              {{ item.customer?.full_name || item.customer?.email || item.customer_id }}
            </span>
          </div>
        </template>

        <template #item.next_billing="{ item }">
          <div class="date-cell">
            <v-icon size="16" color="warning" class="mr-2">mdi-calendar</v-icon>
            {{ formatDate(item.next_billing || item.start_at) }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="actions-cell">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="primary"
              @click="viewAssinatura(item)"
              class="action-btn"
            />
            <v-btn
              v-if="item.status === 'ACTIVE'"
              icon="mdi-pause"
              size="small"
              variant="text"
              color="info"
              @click="pauseAssinatura(item)"
              class="action-btn"
            />
            <v-btn
              v-if="item.status === 'PAUSED'"
              icon="mdi-play"
              size="small"
              variant="text"
              color="success"
              @click="resumeAssinatura(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteAssinatura(item)"
              class="action-btn"
            />
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="800px" persistent>
      <v-card class="assinatura-dialog">
        <v-card-title class="dialog-title">
          <v-icon size="24" class="mr-2">
            {{ editingAssinatura ? 'mdi-pencil' : 'mdi-plus' }}
          </v-icon>
          {{ editingAssinatura ? 'Editar Assinatura' : 'Nova Assinatura' }}
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaAssinatura.amount"
                  label="Valor (R$)"
                  type="number"
                  placeholder="0,00"
                  variant="outlined"
                  :rules="[rules.required, rules.positive]"
                  required
                  min="0"
                  step="0.01"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novaAssinatura.interval"
                  :items="[
                    { title: 'Mensal', value: 'MONTHLY' },
                    { title: 'Trimestral', value: 'QUARTERLY' },
                    { title: 'Semestral', value: 'SEMIANNUAL' },
                    { title: 'Anual', value: 'YEARLY' },
                  ]"
                  label="Intervalo"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novaAssinatura.payment_method"
                  :items="['PIX', 'BOLETO', 'CREDIT_CARD']"
                  label="Método de Pagamento"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="novaAssinatura.description"
                  label="Descrição"
                  placeholder="Descrição da assinatura"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novaAssinatura.customer_id"
                  :items="
                    customersStore.customers.map((c) => ({
                      title:
                        c.full_name ||
                        c.name ||
                        `${c.first_name || ''} ${c.last_name || ''}`.trim(),
                      value: c.id,
                    }))
                  "
                  label="Cliente"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaAssinatura.start_at"
                  label="Data de Início"
                  type="date"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  :min="new Date().toISOString().split('T')[0]"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="outlined" @click="cancelForm" class="cancel-btn">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveAssinatura"
            :loading="subscriptionsStore.loading"
            :disabled="!formValid"
            class="save-btn"
          >
            {{ editingAssinatura ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de visualização -->
    <v-dialog v-model="showViewDialog" max-width="700px">
      <v-card class="view-dialog">
        <v-card-title class="dialog-title">
          <v-icon size="24" class="mr-2">mdi-eye</v-icon>
          Detalhes da Assinatura
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showViewDialog = false"
            class="close-btn"
          />
        </v-card-title>

        <v-card-text v-if="selectedAssinatura" class="dialog-content">
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">ID</div>
              <div class="detail-value font-mono">
                {{ selectedAssinatura.id }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">External ID</div>
              <div class="detail-value font-mono">
                {{ selectedAssinatura.external_id || '—' }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">ID no Provedor</div>
              <div class="detail-value font-mono">
                {{ selectedAssinatura.provider_subscription_id || '—' }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Provedor</div>
              <div class="detail-value">
                {{ selectedAssinatura.provider }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Cliente</div>
              <div class="detail-value">
                {{
                  selectedAssinatura.customer?.full_name ||
                  selectedAssinatura.customer?.email ||
                  selectedAssinatura.customer?.id ||
                  '—'
                }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Valor</div>
              <div class="detail-value font-weight-bold text-success">
                {{ formatCurrency(selectedAssinatura.amount) }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Moeda</div>
              <div class="detail-value">
                {{ selectedAssinatura.currency || 'BRL' }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">
                <v-chip :color="getStatusColor(selectedAssinatura.status)" size="small">
                  {{ getStatusText(selectedAssinatura.status) }}
                </v-chip>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Intervalo</div>
              <div class="detail-value">
                <v-chip :color="getPlanColor(selectedAssinatura.interval)" size="small">
                  {{ getPlanText(selectedAssinatura.interval) }}
                </v-chip>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Método de Pagamento</div>
              <div class="detail-value">
                {{ selectedAssinatura.payment_method || '—' }}
              </div>
            </div>

            <div class="detail-item full-width">
              <div class="detail-label">Descrição</div>
              <div class="detail-value">
                {{ selectedAssinatura.description || '—' }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Início</div>
              <div class="detail-value">
                {{ formatDate(selectedAssinatura.start_at) }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Fim</div>
              <div class="detail-value">
                {{ formatDate(selectedAssinatura.end_at) }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Criada em</div>
              <div class="detail-value">
                {{ formatDate(selectedAssinatura.created_at) }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Atualizada em</div>
              <div class="detail-value">
                {{ formatDate(selectedAssinatura.updated_at || selectedAssinatura.created_at) }}
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSubscriptions } from '@/stores/useSubscriptions'
import { useCustomers } from '@/stores/useCustomers'

const subscriptionsStore = useSubscriptions()
const customersStore = useCustomers()

const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const editingAssinatura = ref<any>(null)
const selectedAssinatura = ref<any>(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const selectedPlan = ref('Todos')
const formValid = ref(false)

const novaAssinatura = ref({
  provider: 'ASAAS' as const,
  customer_id: '',
  amount: '',
  currency: 'BRL' as const,
  interval: 'MONTHLY' as const,
  payment_method: 'PIX',
  description: '',
  start_at: '',
})

const statusOptions = ['Todos', 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED']
const planOptions = ['Todos', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM']

const rules = {
  required: (v: any) => !!v || 'Campo obrigatório',
  positive: (v: any) => parseFloat(v) > 0 || 'O valor deve ser positivo',
}

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Valor', key: 'amount', sortable: true },
  { title: 'Descrição', key: 'description' },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Intervalo', key: 'interval', sortable: true },
  { title: 'Cliente', key: 'customer_id' },
  { title: 'Próxima Cobrança', key: 'next_billing', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false },
]

const assinaturasFiltradas = computed(() => {
  let filtered = subscriptionsStore.subscriptions

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (assinatura: any) =>
        assinatura.id?.toLowerCase?.().includes(search) ||
        assinatura.description?.toLowerCase?.().includes(search) ||
        assinatura.customer_id?.toLowerCase?.().includes(search) ||
        assinatura.customer?.full_name?.toLowerCase?.().includes(search) ||
        assinatura.customer?.email?.toLowerCase?.().includes(search),
    )
  }

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((assinatura: any) => assinatura.status === selectedStatus.value)
  }

  if (selectedPlan.value !== 'Todos') {
    filtered = filtered.filter((assinatura: any) => assinatura.interval === selectedPlan.value)
  }

  return filtered
})

const stats = computed(() => {
  const total = subscriptionsStore.subscriptions.length
  const active = subscriptionsStore.activeSubscriptions.length
  const pending = subscriptionsStore.pausedSubscriptions.length
  const canceled = subscriptionsStore.canceledSubscriptions.length

  return { total, active, pending, canceled }
})

const viewAssinatura = (assinatura: any) => {
  // Aqui assumimos que o objeto já veio no formato do backend (ResponseDto ou Summary + extras)
  selectedAssinatura.value = assinatura
  showViewDialog.value = true
}

const editAssinatura = (assinatura: any) => {
  editingAssinatura.value = assinatura
  const amountNumber =
    typeof assinatura.amount === 'number'
      ? assinatura.amount
      : parseFloat(String(assinatura.amount || '0'))

  novaAssinatura.value = {
    provider: (assinatura.provider as any) || 'ASAAS',
    customer_id: assinatura.customer?.id || assinatura.customer_id || '',
    amount: amountNumber.toString(),
    currency: (assinatura.currency as any) || 'BRL',
    interval: (assinatura.interval as any) || 'MONTHLY',
    payment_method: assinatura.payment_method || 'PIX',
    description: assinatura.description || '',
    start_at: assinatura.start_at
      ? String(assinatura.start_at).split('T')[0]
      : '',
  }
  showCreateDialog.value = true
}

const pauseAssinatura = async (assinatura: any) => {
  if (confirm('Tem certeza que deseja pausar esta assinatura?')) {
    try {
      await subscriptionsStore.pauseSubscription(assinatura.id)
    } catch (error) {}
  }
}

const resumeAssinatura = async (assinatura: any) => {
  if (confirm('Tem certeza que deseja retomar esta assinatura?')) {
    try {
      await subscriptionsStore.resumeSubscription(assinatura.id)
    } catch (error) {}
  }
}

const deleteAssinatura = async (assinatura: any) => {
  if (confirm('Tem certeza que deseja cancelar esta assinatura?')) {
    try {
      await subscriptionsStore.cancelSubscription(assinatura.id)
    } catch (error) {}
  }
}

const saveAssinatura = async () => {
  if (!formValid.value) {
    return
  }

  const amountNumber = parseFloat(novaAssinatura.value.amount || '0')

  if (!amountNumber || amountNumber <= 0) {
    alert('Informe um valor válido para a assinatura.')
    return
  }

  const payload = {
    provider: novaAssinatura.value.provider,
    customer_id: Number(novaAssinatura.value.customer_id),
    amount: amountNumber,
    currency: novaAssinatura.value.currency,
    interval: novaAssinatura.value.interval,
    payment_method: novaAssinatura.value.payment_method,
    description: novaAssinatura.value.description || undefined,
    start_at: novaAssinatura.value.start_at,
  }

  try {
    if (editingAssinatura.value) {
      await subscriptionsStore.updateSubscription(editingAssinatura.value.id, payload as any)
    } else {
      await subscriptionsStore.createSubscription(payload as any)
    }

    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Erro ao salvar assinatura', error)
  }
}

const cancelForm = () => {
  showCreateDialog.value = false
  resetForm()
}

const resetForm = () => {
  editingAssinatura.value = null
  novaAssinatura.value = {
    provider: 'ASAAS' as const,
    customer_id: '',
    amount: '',
    currency: 'BRL' as const,
    interval: 'MONTHLY' as const,
    payment_method: 'PIX',
    description: '',
    start_at: '',
  }
  formValid.value = false
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedStatus.value = 'Todos'
  selectedPlan.value = 'Todos'
  subscriptionsStore.clearFilters()
  subscriptionsStore.listSubscriptions()
}

const formatCurrency = (value: number | string) => {
  const num =
    typeof value === 'number'
      ? value
      : parseFloat(String(value || '0'))

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

const formatDate = (raw: string | null | undefined) => {
  if (!raw) return '—'

  const native = new Date(raw)
  if (!Number.isNaN(native.getTime())) {
    return native.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return String(raw)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'success',
    PAUSED: 'warning',
    CANCELLED: 'error',
    EXPIRED: 'grey',
    PENDING: 'warning',
    PAST_DUE: 'error',
    INCOMPLETE: 'warning',
    INCOMPLETE_EXPIRED: 'grey',
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    ACTIVE: 'Ativa',
    PAUSED: 'Pausada',
    CANCELLED: 'Cancelada',
    EXPIRED: 'Expirada',
    PENDING: 'Pendente',
    PAST_DUE: 'Em atraso',
    INCOMPLETE: 'Incompleta',
    INCOMPLETE_EXPIRED: 'Incompleta expirada',
    TRIALING: 'Em teste',
  }
  return texts[status] || status
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    ACTIVE: 'mdi-check-circle',
    PAUSED: 'mdi-pause-circle',
    CANCELLED: 'mdi-close-circle',
    EXPIRED: 'mdi-alert-circle',
    PENDING: 'mdi-timer-sand',
    PAST_DUE: 'mdi-alert',
    INCOMPLETE: 'mdi-alert-circle',
    INCOMPLETE_EXPIRED: 'mdi-alert-octagon',
    TRIALING: 'mdi-flask',
  }
  return icons[status] || 'mdi-help-circle'
}

const getPlanColor = (plan: string) => {
  const colors: Record<string, string> = {
    MONTHLY: 'primary',
    QUARTERLY: 'success',
    YEARLY: 'info',
    SEMIANNUAL: 'info',
    CUSTOM: 'warning',
  }
  return colors[plan] || 'grey'
}

const getPlanText = (plan: string) => {
  const texts: Record<string, string> = {
    MONTHLY: 'Mensal',
    QUARTERLY: 'Trimestral',
    SEMIANNUAL: 'Semestral',
    YEARLY: 'Anual',
    CUSTOM: 'Personalizado',
  }
  return texts[plan] || plan
}

const getPlanIcon = (plan: string) => {
  const icons: Record<string, string> = {
    MONTHLY: 'mdi-calendar-month',
    QUARTERLY: 'mdi-calendar-outline',
    SEMIANNUAL: 'mdi-calendar-range',
    YEARLY: 'mdi-calendar-star',
    CUSTOM: 'mdi-tune',
  }
  return icons[plan] || 'mdi-help-circle'
}

watch(searchTerm, (newValue) => {
  if (newValue) {
    subscriptionsStore.searchSubscriptions(newValue)
  } else {
    subscriptionsStore.listSubscriptions()
  }
})

watch(selectedStatus, (newValue) => {
  if (newValue !== 'Todos') {
    subscriptionsStore.filterByStatus(newValue as any)
  } else {
    subscriptionsStore.clearFilters()
    subscriptionsStore.listSubscriptions()
  }
})

onMounted(async () => {
  await subscriptionsStore.listSubscriptions()
  await customersStore.listCustomers()
})
</script>

<style scoped>
.assinaturas-container {
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
  margin-left: 15px;
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

.stat-content {
  text-align: left;
}

.stat-value {
  font-size: 1.8em;
  font-weight: bold;
  color: #ffffff;
}

.stat-label {
  font-size: 0.8em;
  color: #b0b0b0;
  margin-top: 5px;
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
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}

.search-field,
.status-filter,
.plan-filter {
  flex: 1;
  min-width: 200px;
}

.clear-filters-btn {
  margin-left: 15px;
}

.table-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.assinaturas-table {
  border-radius: 8px;
  overflow: hidden;
}

.id-cell,
.amount-cell,
.description-cell,
.customer-cell,
.date-cell {
  display: flex;
  align-items: center;
}

.id-cell .font-mono {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  color: #b0b0b0;
}

.amount-cell .font-weight-bold {
  font-size: 1.2em;
}

.description-cell .text-truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-chip,
.plan-chip {
  display: flex;
  align-items: center;
}

.status-chip .v-icon {
  margin-right: 5px;
}

.plan-chip .v-icon {
  margin-right: 5px;
}

.actions-cell {
  display: flex;
  gap: 5px;
}

.action-btn {
  padding: 5px;
}

.assinatura-dialog,
.view-dialog {
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
  padding: 20px;
}

.dialog-actions {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
}

.cancel-btn,
.save-btn {
  min-width: 120px;
}

.view-dialog .close-btn {
  margin-left: 10px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-label {
  font-size: 0.8em;
  color: #b0b0b0;
  font-weight: bold;
  min-width: 120px;
}

.detail-value {
  font-size: 1em;
  color: #ffffff;
  font-weight: normal;
}

.detail-value.font-weight-bold {
  font-weight: bold;
}

.detail-value.font-mono {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  color: #b0b0b0;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}
</style>
