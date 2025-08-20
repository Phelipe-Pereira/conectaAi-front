<template>
  <div class="parcelamentos-view">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <v-icon size="32" color="primary" class="mr-3">mdi-credit-card-clock</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">Parcelamentos</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Gerencie cobranças parceladas e financiamentos
            </p>
          </div>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
          Novo Parcelamento
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-grid mb-6">
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-primary">{{ stats.total }}</div>
          <div class="text-subtitle-2">Total de Parcelamentos</div>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-success">{{ stats.active }}</div>
          <div class="text-subtitle-2">Ativos</div>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-warning">{{ stats.pending }}</div>
          <div class="text-subtitle-2">Pendentes</div>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-error">{{ stats.overdue }}</div>
          <div class="text-subtitle-2">Em Atraso</div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Filtros -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <v-text-field
            v-model="searchTerm"
            prepend-inner-icon="mdi-magnify"
            placeholder="Buscar parcelamentos..."
            variant="outlined"
            density="comfortable"
            hide-details
            class="max-width-300"
          />

          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            label="Status"
            variant="outlined"
            density="comfortable"
            hide-details
            class="max-width-200"
          />

          <v-select
            v-model="selectedInstallments"
            :items="installmentOptions"
            label="Parcelas"
            variant="outlined"
            density="comfortable"
            hide-details
            class="max-width-200"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabela de parcelamentos -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="parcelamentosFiltrados"
        :loading="loading"
        :search="searchTerm"
        class="elevation-1"
      >
        <template #item.total_amount="{ item }">
          <span class="font-weight-bold">
            {{ formatCurrency(item.total_amount) }}
          </span>
        </template>

        <template #item.installment_amount="{ item }">
          <span class="font-weight-medium">
            {{ formatCurrency(item.installment_amount) }}
          </span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal">
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template #item.installments="{ item }">
          <v-chip :color="getInstallmentColor(item.installments)" size="small" variant="tonal">
            {{ item.installments }}x
          </v-chip>
        </template>

        <template #item.next_due_date="{ item }">
          {{ formatDate(item.next_due_date) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            color="info"
            variant="text"
            @click="viewParcelamento(item)"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            color="primary"
            variant="text"
            @click="editParcelamento(item)"
          />
          <v-btn
            icon="mdi-pause"
            size="small"
            color="warning"
            variant="text"
            @click="pauseParcelamento(item)"
            v-if="item.status === 'ACTIVE'"
          />
          <v-btn
            icon="mdi-play"
            size="small"
            color="success"
            variant="text"
            @click="resumeParcelamento(item)"
            v-if="item.status === 'PAUSED'"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            color="error"
            variant="text"
            @click="deleteParcelamento(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="700px">
      <v-card>
        <v-card-title>
          {{ editingParcelamento ? 'Editar Parcelamento' : 'Novo Parcelamento' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveParcelamento">
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

// Lifecycle
onMounted(() => {
  // Carregar dados iniciais se necessário
})
</script>

<style scoped>
.parcelamentos-view {
  width: 100%;
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

.max-width-300 {
  max-width: 300px;
}

.max-width-200 {
  max-width: 200px;
}
</style>
