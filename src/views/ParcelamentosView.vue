<template>
  <div class="parcelamentos-container">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">
            <v-icon size="32" class="mr-3">mdi-credit-card-clock</v-icon>
            Parcelamentos
          </h1>
          <p class="page-subtitle">Gerencie cobranças parceladas e financiamentos da plataforma</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showCreateDialog = true"
          class="create-btn"
        >
          Novo Parcelamento
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="primary">mdi-credit-card-clock</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total de Parcelamentos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="success">mdi-check-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.active }}</div>
          <div class="stat-label">Ativos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="warning">mdi-pause-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">Pendentes</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="error">mdi-alert-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.overdue }}</div>
          <div class="stat-label">Em Atraso</div>
        </div>
      </div>
    </div>

    <!-- Filtros e busca -->
    <div class="filters-section">
      <div class="filters-content">
        <v-text-field
          v-model="searchTerm"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar parcelamentos por ID, descrição ou cliente..."
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
          v-model="selectedInstallments"
          :items="installmentOptions"
          placeholder="Parcelas"
          variant="outlined"
          density="compact"
          hide-details
          class="installments-filter"
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

    <!-- Tabela de parcelamentos -->
    <div class="table-section">
      <v-data-table
        :headers="headers"
        :items="parcelamentosFiltrados"
        :loading="loading"
        class="parcelamentos-table"
        hover
      >
        <template #item.id="{ item }">
          <div class="id-cell">
            <v-icon size="16" color="primary" class="mr-2">mdi-identifier</v-icon>
            <span class="font-mono">{{ item.id }}</span>
          </div>
        </template>

        <template #item.total_amount="{ item }">
          <div class="amount-cell">
            <span class="font-weight-bold text-success">
              {{ formatCurrency(item.total_amount) }}
            </span>
          </div>
        </template>

        <template #item.installments="{ item }">
          <v-chip
            :color="getInstallmentColor(item.installments)"
            size="small"
            variant="tonal"
            class="installment-chip"
          >
            <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
            {{ item.installments }}x
          </v-chip>
        </template>

        <template #item.installment_amount="{ item }">
          <div class="amount-cell">
            <span class="font-weight-medium">
              {{ formatCurrency(item.installment_amount) }}
            </span>
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

        <template #item.customer_id="{ item }">
          <div class="customer-cell">
            <v-icon size="16" color="info" class="mr-2">mdi-account</v-icon>
            <span>{{ item.customer_id }}</span>
          </div>
        </template>

        <template #item.next_due_date="{ item }">
          <div class="date-cell">
            <v-icon size="16" color="warning" class="mr-2">mdi-calendar</v-icon>
            {{ formatDate(item.next_due_date) }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="actions-cell">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="primary"
              @click="viewParcelamento(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editParcelamento(item)"
              class="action-btn"
            />
            <v-btn
              v-if="item.status === 'ACTIVE'"
              icon="mdi-pause"
              size="small"
              variant="text"
              color="info"
              @click="pauseParcelamento(item)"
              class="action-btn"
            />
            <v-btn
              v-if="item.status === 'PAUSED'"
              icon="mdi-play"
              size="small"
              variant="text"
              color="success"
              @click="resumeParcelamento(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteParcelamento(item)"
              class="action-btn"
            />
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="700px">
      <v-card>
        <v-card-title>
          {{ editingParcelamento ? 'Editar Parcelamento' : 'Novo Parcelamento' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoParcelamento.total_amount"
                  label="Valor Total (R$)"
                  type="number"
                  variant="outlined"
                  required
                  min="0"
                  step="0.01"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoParcelamento.installments"
                  label="Número de Parcelas"
                  type="number"
                  variant="outlined"
                  required
                  min="2"
                  max="24"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="novoParcelamento.description"
                  label="Descrição"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoParcelamento.customer_id"
                  label="ID do Cliente"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novoParcelamento.currency"
                  :items="['BRL', 'USD', 'EUR']"
                  label="Moeda"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoParcelamento.interest_rate"
                  label="Taxa de Juros (%)"
                  type="number"
                  variant="outlined"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoParcelamento.due_day"
                  label="Dia do Vencimento"
                  type="number"
                  variant="outlined"
                  min="1"
                  max="31"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="novoParcelamento.metadata"
                  label="Metadados (JSON)"
                  variant="outlined"
                  rows="3"
                  placeholder='{"product": "Financiamento", "collateral": "Veículo"}'
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showCreateDialog = false"> Cancelar </v-btn>
          <v-btn color="primary" @click="saveParcelamento" :loading="loading">
            {{ editingParcelamento ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de visualização -->
    <v-dialog v-model="showViewDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Detalhes do Parcelamento</span>
          <v-btn icon="mdi-close" variant="text" @click="showViewDialog = false" />
        </v-card-title>
        <v-card-text v-if="selectedParcelamento">
          <v-row>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">ID</div>
              <div class="text-body-1">{{ selectedParcelamento.id }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Valor Total</div>
              <div class="text-body-1 font-weight-bold">
                {{ formatCurrency(selectedParcelamento.total_amount) }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Status</div>
              <v-chip :color="getStatusColor(selectedParcelamento.status)" size="small">
                {{ getStatusText(selectedParcelamento.status) }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Parcelas</div>
              <v-chip :color="getInstallmentColor(selectedParcelamento.installments)" size="small">
                {{ selectedParcelamento.installments }}x
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Valor da Parcela</div>
              <div class="text-body-1">
                {{ formatCurrency(selectedParcelamento.installment_amount) }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Próximo Vencimento</div>
              <div class="text-body-1">{{ formatDate(selectedParcelamento.next_due_date) }}</div>
            </v-col>
            <v-col cols="12">
              <div class="text-caption text-medium-emphasis">Descrição</div>
              <div class="text-body-1">{{ selectedParcelamento.description }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Taxa de Juros</div>
              <div class="text-body-1">{{ selectedParcelamento.interest_rate }}%</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Dia do Vencimento</div>
              <div class="text-body-1">{{ selectedParcelamento.due_day }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Criado em</div>
              <div class="text-body-1">{{ formatDate(selectedParcelamento.created_at) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Atualizado em</div>
              <div class="text-body-1">{{ formatDate(selectedParcelamento.updated_at) }}</div>
            </v-col>
          </v-row>
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
const editingParcelamento = ref<any>(null)
const selectedParcelamento = ref<any>(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const selectedInstallments = ref('Todos')
const loading = ref(false)

const novoParcelamento = ref({
  total_amount: '',
  installments: '12',
  description: '',
  currency: 'BRL',
  customer_id: '',
  interest_rate: '0',
  due_day: '10',
  metadata: '',
})

const statusOptions = ['Todos', 'ACTIVE', 'PAUSED', 'COMPLETED', 'OVERDUE', 'CANCELED']
const installmentOptions = ['Todos', '2', '3', '6', '12', '24']

// Headers da tabela
const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Valor Total', key: 'total_amount', sortable: true },
  { title: 'Parcelas', key: 'installments', sortable: true },
  { title: 'Valor Parcela', key: 'installment_amount', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Cliente', key: 'customer_id' },
  { title: 'Próximo Vencimento', key: 'next_due_date', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false },
]

// Dados mockados para teste
const parcelamentos = ref([
  {
    id: 'inst_001',
    total_amount: 1200000,
    installments: 12,
    installment_amount: 100000,
    description: 'Financiamento de veículo',
    status: 'ACTIVE',
    customer_id: 'cus_001',
    currency: 'BRL',
    interest_rate: 1.99,
    due_day: 15,
    next_due_date: '2024-02-15T00:00:00Z',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:35:00Z',
  },
  {
    id: 'inst_002',
    total_amount: 500000,
    installments: 6,
    installment_amount: 83333,
    description: 'Compra de eletrodomésticos',
    status: 'PAUSED',
    customer_id: 'cus_002',
    currency: 'BRL',
    interest_rate: 0,
    due_day: 10,
    next_due_date: '2024-02-10T00:00:00Z',
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-20T09:15:00Z',
  },
  {
    id: 'inst_003',
    total_amount: 250000,
    installments: 3,
    installment_amount: 83333,
    description: 'Parcelamento de consulta médica',
    status: 'OVERDUE',
    customer_id: 'cus_003',
    currency: 'BRL',
    interest_rate: 2.5,
    due_day: 5,
    next_due_date: '2024-01-05T00:00:00Z',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-25T16:45:00Z',
  },
])

// Computed
const parcelamentosFiltrados = computed(() => {
  let filtered = parcelamentos.value

  if (searchTerm.value) {
    filtered = filtered.filter(
      (parcelamento) =>
        parcelamento.id.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        parcelamento.description.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        parcelamento.customer_id.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((parcelamento) => parcelamento.status === selectedStatus.value)
  }

  if (selectedInstallments.value !== 'Todos') {
    filtered = filtered.filter(
      (parcelamento) => parcelamento.installments.toString() === selectedInstallments.value,
    )
  }

  return filtered
})

const stats = computed(() => {
  const total = parcelamentos.value.length
  const active = parcelamentos.value.filter((p) => p.status === 'ACTIVE').length
  const pending = parcelamentos.value.filter((p) => p.status === 'PAUSED').length
  const overdue = parcelamentos.value.filter((p) => p.status === 'OVERDUE').length

  return { total, active, pending, overdue }
})

// Métodos
const viewParcelamento = (parcelamento: any) => {
  selectedParcelamento.value = parcelamento
  showViewDialog.value = true
}

const editParcelamento = (parcelamento: any) => {
  editingParcelamento.value = parcelamento
  novoParcelamento.value = {
    total_amount: parcelamento.total_amount.toString(),
    installments: parcelamento.installments.toString(),
    description: parcelamento.description,
    currency: parcelamento.currency,
    customer_id: parcelamento.customer_id,
    interest_rate: parcelamento.interest_rate.toString(),
    due_day: parcelamento.due_day.toString(),
    metadata: JSON.stringify(parcelamento.metadata || {}, null, 2),
  }
  showCreateDialog.value = true
}

const pauseParcelamento = async (parcelamento: any) => {
  if (confirm('Tem certeza que deseja pausar este parcelamento?')) {
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const index = parcelamentos.value.findIndex((p) => p.id === parcelamento.id)
      if (index !== -1) {
        parcelamentos.value[index].status = 'PAUSED'
        parcelamentos.value[index].updated_at = new Date().toISOString()
      }
      snackbar.success('Parcelamento pausado com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao pausar parcelamento')
    } finally {
      loading.value = false
    }
  }
}

const resumeParcelamento = async (parcelamento: any) => {
  if (confirm('Tem certeza que deseja retomar este parcelamento?')) {
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const index = parcelamentos.value.findIndex((p) => p.id === parcelamento.id)
      if (index !== -1) {
        parcelamentos.value[index].status = 'ACTIVE'
        parcelamentos.value[index].updated_at = new Date().toISOString()
      }
      snackbar.success('Parcelamento retomado com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao retomar parcelamento')
    } finally {
      loading.value = false
    }
  }
}

const deleteParcelamento = async (parcelamento: any) => {
  if (confirm('Tem certeza que deseja excluir este parcelamento?')) {
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const index = parcelamentos.value.findIndex((p) => p.id === parcelamento.id)
      if (index !== -1) {
        parcelamentos.value.splice(index, 1)
      }
      snackbar.success('Parcelamento excluído com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao excluir parcelamento')
    } finally {
      loading.value = false
    }
  }
}

const saveParcelamento = async () => {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const totalAmount = parseFloat(novoParcelamento.value.total_amount)
    const installments = parseInt(novoParcelamento.value.installments)
    const installmentAmount = Math.round(totalAmount / installments)

    if (editingParcelamento.value) {
      // Editar
      const index = parcelamentos.value.findIndex((p) => p.id === editingParcelamento.value.id)
      if (index !== -1) {
        parcelamentos.value[index] = {
          ...editingParcelamento.value,
          total_amount: totalAmount,
          installments: installments,
          installment_amount: installmentAmount,
          description: novoParcelamento.value.description,
          currency: novoParcelamento.value.currency,
          customer_id: novoParcelamento.value.customer_id,
          interest_rate: parseFloat(novoParcelamento.value.interest_rate),
          due_day: parseInt(novoParcelamento.value.due_day),
          updated_at: new Date().toISOString(),
        }
      }
      snackbar.success('Parcelamento atualizado com sucesso!')
    } else {
      // Criar
      const nextDueDate = new Date()
      nextDueDate.setDate(parseInt(novoParcelamento.value.due_day))
      if (nextDueDate < new Date()) {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1)
      }

      const newParcelamento = {
        id: `inst_${Date.now()}`,
        total_amount: totalAmount,
        installments: installments,
        installment_amount: installmentAmount,
        description: novoParcelamento.value.description,
        status: 'ACTIVE',
        currency: novoParcelamento.value.currency,
        customer_id: novoParcelamento.value.customer_id,
        interest_rate: parseFloat(novoParcelamento.value.interest_rate),
        due_day: parseInt(novoParcelamento.value.due_day),
        next_due_date: nextDueDate.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      parcelamentos.value.unshift(newParcelamento)
      snackbar.success('Parcelamento criado com sucesso!')
    }

    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    snackbar.error('Erro ao salvar parcelamento')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingParcelamento.value = null
  novoParcelamento.value = {
    total_amount: '',
    installments: '12',
    description: '',
    currency: 'BRL',
    customer_id: '',
    interest_rate: '0',
    due_day: '10',
    metadata: '',
  }
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
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'success',
    PAUSED: 'warning',
    COMPLETED: 'info',
    OVERDUE: 'error',
    CANCELED: 'grey',
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    ACTIVE: 'Ativo',
    PAUSED: 'Pausado',
    COMPLETED: 'Concluído',
    OVERDUE: 'Em Atraso',
    CANCELED: 'Cancelado',
  }
  return texts[status] || status
}

const getInstallmentColor = (installments: number) => {
  if (installments <= 3) return 'success'
  if (installments <= 6) return 'info'
  if (installments <= 12) return 'warning'
  return 'error'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    ACTIVE: 'mdi-check-circle',
    PAUSED: 'mdi-pause-circle',
    COMPLETED: 'mdi-check-circle',
    OVERDUE: 'mdi-alert-circle',
    CANCELED: 'mdi-close-circle',
  }
  return icons[status] || 'mdi-help-circle'
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedStatus.value = 'Todos'
  selectedInstallments.value = 'Todos'
}

// Lifecycle
onMounted(() => {
  // Carregar dados iniciais se necessário
})
</script>

<style scoped>
.parcelamentos-container {
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
.installments-filter {
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

.parcelamentos-table {
  border-radius: 8px;
  overflow: hidden;
}

.id-cell,
.amount-cell,
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

.status-chip,
.installment-chip {
  display: flex;
  align-items: center;
}

.status-chip .v-icon,
.installment-chip .v-icon {
  margin-right: 5px;
}

.actions-cell {
  display: flex;
  gap: 5px;
}

.action-btn {
  padding: 5px;
}

.parcelamento-dialog,
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
