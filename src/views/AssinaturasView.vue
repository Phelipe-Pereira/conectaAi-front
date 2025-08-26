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
        :loading="loading"
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

        <template #item.plan_type="{ item }">
          <v-chip
            :color="getPlanColor(item.plan_type)"
            size="small"
            variant="tonal"
            class="plan-chip"
          >
            <v-icon size="14" class="mr-1">
              {{ getPlanIcon(item.plan_type) }}
            </v-icon>
            {{ getPlanText(item.plan_type) }}
          </v-chip>
        </template>

        <template #item.customer_id="{ item }">
          <div class="customer-cell">
            <v-icon size="16" color="info" class="mr-2">mdi-account</v-icon>
            <span>{{ item.customer_id }}</span>
          </div>
        </template>

        <template #item.next_billing="{ item }">
          <div class="date-cell">
            <v-icon size="16" color="warning" class="mr-2">mdi-calendar</v-icon>
            {{ formatDate(item.next_billing) }}
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
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editAssinatura(item)"
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
          <v-icon size="24" class="mr-2">{{
            editingAssinatura ? 'mdi-pencil' : 'mdi-plus'
          }}</v-icon>
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
                  v-model="novaAssinatura.plan_type"
                  :items="planOptions.filter((p) => p !== 'Todos')"
                  label="Tipo de Plano"
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
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaAssinatura.customer_id"
                  label="ID do Cliente"
                  placeholder="cus_001"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novaAssinatura.currency"
                  :items="['BRL', 'USD', 'EUR']"
                  label="Moeda"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaAssinatura.billing_cycle"
                  label="Ciclo de Cobrança (dias)"
                  type="number"
                  placeholder="30"
                  variant="outlined"
                  :rules="[rules.required, rules.positive]"
                  required
                  min="1"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaAssinatura.trial_days"
                  label="Dias de Teste"
                  type="number"
                  placeholder="0"
                  variant="outlined"
                  min="0"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="novaAssinatura.metadata"
                  label="Metadados (JSON)"
                  placeholder='{"plan_name": "Premium", "features": ["feature1", "feature2"]}'
                  variant="outlined"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="outlined" @click="cancelForm" class="cancel-btn"> Cancelar </v-btn>
          <v-btn
            color="primary"
            @click="saveAssinatura"
            :loading="loading"
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
              <div class="detail-value font-mono">{{ selectedAssinatura.id }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Valor</div>
              <div class="detail-value font-weight-bold text-success">
                {{ formatCurrency(selectedAssinatura.amount) }}
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
              <div class="detail-label">Plano</div>
              <div class="detail-value">
                <v-chip :color="getPlanColor(selectedAssinatura.plan_type)" size="small">
                  {{ getPlanText(selectedAssinatura.plan_type) }}
                </v-chip>
              </div>
            </div>
            <div class="detail-item full-width">
              <div class="detail-label">Descrição</div>
              <div class="detail-value">{{ selectedAssinatura.description }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Cliente</div>
              <div class="detail-value">{{ selectedAssinatura.customer_id }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Moeda</div>
              <div class="detail-value">{{ selectedAssinatura.currency }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Próxima Cobrança</div>
              <div class="detail-value">{{ formatDate(selectedAssinatura.next_billing) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Ciclo de Cobrança</div>
              <div class="detail-value">{{ selectedAssinatura.billing_cycle }} dias</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Dias de Teste</div>
              <div class="detail-value">{{ selectedAssinatura.trial_days }} dias</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Criada em</div>
              <div class="detail-value">{{ formatDate(selectedAssinatura.created_at) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Atualizada em</div>
              <div class="detail-value">{{ formatDate(selectedAssinatura.updated_at) }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSnackbar } from '@/stores/useSnackbar'

const snackbar = useSnackbar()

// Estado
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const editingAssinatura = ref<any>(null)
const selectedAssinatura = ref<any>(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const selectedPlan = ref('Todos')
const loading = ref(false)
const formValid = ref(false)

const novaAssinatura = ref({
  amount: '',
  description: '',
  plan_type: 'MONTHLY',
  currency: 'BRL',
  customer_id: '',
  billing_cycle: '30',
  trial_days: '0',
  metadata: '',
})

const statusOptions = ['Todos', 'ACTIVE', 'PAUSED', 'CANCELED', 'EXPIRED']
const planOptions = ['Todos', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM']

const rules = {
  required: (v: any) => !!v || 'Campo obrigatório',
  positive: (v: any) => parseFloat(v) > 0 || 'O valor deve ser positivo',
}

// Headers da tabela
const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Valor', key: 'amount', sortable: true },
  { title: 'Descrição', key: 'description' },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Plano', key: 'plan_type', sortable: true },
  { title: 'Cliente', key: 'customer_id' },
  { title: 'Próxima Cobrança', key: 'next_billing', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false },
]

// Dados mockados para teste
const assinaturas = ref([
  {
    id: 'sub_001',
    amount: 9900,
    description: 'Plano Premium Mensal',
    status: 'ACTIVE',
    plan_type: 'MONTHLY',
    customer_id: 'cus_001',
    currency: 'BRL',
    billing_cycle: 30,
    trial_days: 7,
    next_billing: '2024-02-15T10:30:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:35:00Z',
  },
  {
    id: 'sub_002',
    amount: 25000,
    description: 'Plano Empresarial Trimestral',
    status: 'PAUSED',
    plan_type: 'QUARTERLY',
    customer_id: 'cus_002',
    currency: 'BRL',
    billing_cycle: 90,
    trial_days: 0,
    next_billing: '2024-04-14T14:20:00Z',
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-20T09:15:00Z',
  },
  {
    id: 'sub_003',
    amount: 50000,
    description: 'Plano Anual Básico',
    status: 'CANCELED',
    plan_type: 'YEARLY',
    customer_id: 'cus_003',
    currency: 'BRL',
    billing_cycle: 365,
    trial_days: 14,
    next_billing: '2025-01-13T09:15:00Z',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-25T16:45:00Z',
  },
])

// Computed
const assinaturasFiltradas = computed(() => {
  let filtered = assinaturas.value

  if (searchTerm.value) {
    filtered = filtered.filter(
      (assinatura) =>
        assinatura.id.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        assinatura.description.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        assinatura.customer_id.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((assinatura) => assinatura.status === selectedStatus.value)
  }

  if (selectedPlan.value !== 'Todos') {
    filtered = filtered.filter((assinatura) => assinatura.plan_type === selectedPlan.value)
  }

  return filtered
})

const stats = computed(() => {
  const total = assinaturas.value.length
  const active = assinaturas.value.filter((a) => a.status === 'ACTIVE').length
  const pending = assinaturas.value.filter((a) => a.status === 'PAUSED').length
  const canceled = assinaturas.value.filter((a) => a.status === 'CANCELED').length

  return { total, active, pending, canceled }
})

// Métodos
const viewAssinatura = (assinatura: any) => {
  selectedAssinatura.value = assinatura
  showViewDialog.value = true
}

const editAssinatura = (assinatura: any) => {
  editingAssinatura.value = assinatura
  novaAssinatura.value = {
    amount: assinatura.amount.toString(),
    description: assinatura.description,
    plan_type: assinatura.plan_type,
    currency: assinatura.currency,
    customer_id: assinatura.customer_id,
    billing_cycle: assinatura.billing_cycle.toString(),
    trial_days: assinatura.trial_days.toString(),
    metadata: JSON.stringify(assinatura.metadata || {}, null, 2),
  }
  showCreateDialog.value = true
}

const pauseAssinatura = async (assinatura: any) => {
  if (confirm('Tem certeza que deseja pausar esta assinatura?')) {
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const index = assinaturas.value.findIndex((a) => a.id === assinatura.id)
      if (index !== -1) {
        assinaturas.value[index].status = 'PAUSED'
        assinaturas.value[index].updated_at = new Date().toISOString()
      }
      snackbar.success('Assinatura pausada com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao pausar assinatura')
    } finally {
      loading.value = false
    }
  }
}

const resumeAssinatura = async (assinatura: any) => {
  if (confirm('Tem certeza que deseja retomar esta assinatura?')) {
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const index = assinaturas.value.findIndex((a) => a.id === assinatura.id)
      if (index !== -1) {
        assinaturas.value[index].status = 'ACTIVE'
        assinaturas.value[index].updated_at = new Date().toISOString()
      }
      snackbar.success('Assinatura retomada com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao retomar assinatura')
    } finally {
      loading.value = false
    }
  }
}

const deleteAssinatura = async (assinatura: any) => {
  if (confirm('Tem certeza que deseja excluir esta assinatura?')) {
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const index = assinaturas.value.findIndex((a) => a.id === assinatura.id)
      if (index !== -1) {
        assinaturas.value.splice(index, 1)
      }
      snackbar.success('Assinatura excluída com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao excluir assinatura')
    } finally {
      loading.value = false
    }
  }
}

const saveAssinatura = async () => {
  if (!formValid.value) {
    snackbar.error('Por favor, preencha todos os campos obrigatórios corretamente.')
    return
  }

  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingAssinatura.value) {
      // Editar
      const index = assinaturas.value.findIndex((a) => a.id === editingAssinatura.value.id)
      if (index !== -1) {
        assinaturas.value[index] = {
          ...editingAssinatura.value,
          amount: parseFloat(novaAssinatura.value.amount),
          description: novaAssinatura.value.description,
          plan_type: novaAssinatura.value.plan_type,
          currency: novaAssinatura.value.currency,
          customer_id: novaAssinatura.value.customer_id,
          billing_cycle: parseInt(novaAssinatura.value.billing_cycle),
          trial_days: parseInt(novaAssinatura.value.trial_days),
          updated_at: new Date().toISOString(),
        }
      }
      snackbar.success('Assinatura atualizada com sucesso!')
    } else {
      // Criar
      const nextBilling = new Date()
      nextBilling.setDate(nextBilling.getDate() + parseInt(novaAssinatura.value.billing_cycle))

      const newAssinatura = {
        id: `sub_${Date.now()}`,
        amount: parseFloat(novaAssinatura.value.amount),
        description: novaAssinatura.value.description,
        status: 'ACTIVE',
        plan_type: novaAssinatura.value.plan_type,
        currency: novaAssinatura.value.currency,
        customer_id: novaAssinatura.value.customer_id,
        billing_cycle: parseInt(novaAssinatura.value.billing_cycle),
        trial_days: parseInt(novaAssinatura.value.trial_days),
        next_billing: nextBilling.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      assinaturas.value.unshift(newAssinatura)
      snackbar.success('Assinatura criada com sucesso!')
    }

    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    snackbar.error('Erro ao salvar assinatura')
  } finally {
    loading.value = false
  }
}

const cancelForm = () => {
  showCreateDialog.value = false
  resetForm()
}

const resetForm = () => {
  editingAssinatura.value = null
  novaAssinatura.value = {
    amount: '',
    description: '',
    plan_type: 'MONTHLY',
    currency: 'BRL',
    customer_id: '',
    billing_cycle: '30',
    trial_days: '0',
    metadata: '',
  }
  formValid.value = false
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedStatus.value = 'Todos'
  selectedPlan.value = 'Todos'
}

// Utilitários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'success',
    PAUSED: 'warning',
    CANCELED: 'error',
    EXPIRED: 'grey',
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    ACTIVE: 'Ativa',
    PAUSED: 'Pausada',
    CANCELED: 'Cancelada',
    EXPIRED: 'Expirada',
  }
  return texts[status] || status
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    ACTIVE: 'mdi-check-circle',
    PAUSED: 'mdi-pause-circle',
    CANCELED: 'mdi-close-circle',
    EXPIRED: 'mdi-alert-circle',
  }
  return icons[status] || 'mdi-help-circle'
}

const getPlanColor = (plan: string) => {
  const colors: Record<string, string> = {
    MONTHLY: 'primary',
    QUARTERLY: 'success',
    YEARLY: 'info',
    CUSTOM: 'warning',
  }
  return colors[plan] || 'grey'
}

const getPlanText = (plan: string) => {
  const texts: Record<string, string> = {
    MONTHLY: 'Mensal',
    QUARTERLY: 'Trimestral',
    YEARLY: 'Anual',
    CUSTOM: 'Personalizado',
  }
  return texts[plan] || plan
}

const getPlanIcon = (plan: string) => {
  const icons: Record<string, string> = {
    MONTHLY: 'mdi-calendar-month',
    QUARTERLY: 'mdi-calendar-outline',
    YEARLY: 'mdi-calendar-star',
    CUSTOM: 'mdi-tune',
  }
  return icons[plan] || 'mdi-help-circle'
}

// Lifecycle
onMounted(() => {
  // Carregar dados iniciais se necessário
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
  display: flex;
  align-items: center;
}

.page-title {
  display: flex;
  align-items: center;
  color: #ffffff;
}

.page-subtitle {
  margin-top: 4px;
  color: #b0b0b0;
  font-size: 0.9em;
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
  background-color: #2d2d2d;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  border: 1px solid #404040;
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

.assinatura-dialog {
  border-radius: 10px;
  overflow: hidden;
  background-color: #2d2d2d;
  color: #ffffff;
}

.dialog-title {
  display: flex;
  align-items: center;
  background-color: #1e1e1e;
  padding: 15px 20px;
  font-size: 1.1em;
  font-weight: bold;
  color: #ffffff;
}

.dialog-content {
  padding: 20px;
}

.dialog-actions {
  padding: 15px 20px;
  background-color: #1e1e1e;
  border-top: 1px solid #404040;
}

.cancel-btn,
.save-btn {
  min-width: 120px;
}

.view-dialog {
  border-radius: 10px;
  overflow: hidden;
  background-color: #2d2d2d;
  color: #ffffff;
}

.view-dialog .dialog-title {
  background-color: #1e1e1e;
  padding: 15px 20px;
  font-size: 1.1em;
  font-weight: bold;
  color: #ffffff;
}

.view-dialog .dialog-content {
  padding: 20px;
}

.view-dialog .dialog-actions {
  padding: 15px 20px;
  background-color: #1e1e1e;
  border-top: 1px solid #404040;
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
  min-width: 100px;
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
