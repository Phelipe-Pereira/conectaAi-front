<template>
  <div class="cobrancas-view">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <v-icon size="32" color="primary" class="mr-3">mdi-credit-card</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">Cobranças</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Gerencie todas as cobranças e transações
            </p>
          </div>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
          Nova Cobrança
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-grid mb-6">
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-primary">{{ stats.total }}</div>
          <div class="text-subtitle-2">Total de Cobranças</div>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-success">{{ stats.paid }}</div>
          <div class="text-subtitle-2">Pagas</div>
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
          <div class="text-h4 font-weight-bold text-error">{{ stats.failed }}</div>
          <div class="text-subtitle-2">Falhadas</div>
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
            placeholder="Buscar cobranças..."
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
            v-model="selectedMethod"
            :items="methodOptions"
            label="Método"
            variant="outlined"
            density="comfortable"
            hide-details
            class="max-width-200"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabela de cobranças -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="cobrancasFiltradas"
        :loading="loading"
        :search="searchTerm"
        class="elevation-1"
      >
        <template #item.amount="{ item }">
          <span class="font-weight-bold">
            {{ formatCurrency(item.amount) }}
          </span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal">
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template #item.payment_method="{ item }">
          <v-chip :color="getMethodColor(item.payment_method)" size="small" variant="tonal">
            {{ getMethodText(item.payment_method) }}
          </v-chip>
        </template>

        <template #item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            color="info"
            variant="text"
            @click="viewCobranca(item)"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            color="primary"
            variant="text"
            @click="editCobranca(item)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            color="error"
            variant="text"
            @click="deleteCobranca(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="700px">
      <v-card>
        <v-card-title>
          {{ editingCobranca ? 'Editar Cobrança' : 'Nova Cobrança' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveCobranca">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaCobranca.amount"
                  label="Valor (R$)"
                  type="number"
                  variant="outlined"
                  required
                  min="0"
                  step="0.01"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novaCobranca.payment_method"
                  :items="methodOptions"
                  label="Método de Pagamento"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="novaCobranca.description"
                  label="Descrição"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaCobranca.customer_id"
                  label="ID do Cliente"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novaCobranca.currency"
                  :items="['BRL', 'USD', 'EUR']"
                  label="Moeda"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="novaCobranca.metadata"
                  label="Metadados (JSON)"
                  variant="outlined"
                  rows="3"
                  placeholder='{"order_id": "123", "product": "item"}'
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showCreateDialog = false"> Cancelar </v-btn>
          <v-btn color="primary" @click="saveCobranca" :loading="loading">
            {{ editingCobranca ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de visualização -->
    <v-dialog v-model="showViewDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Detalhes da Cobrança</span>
          <v-btn icon="mdi-close" variant="text" @click="showViewDialog = false" />
        </v-card-title>
        <v-card-text v-if="selectedCobranca">
          <v-row>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">ID</div>
              <div class="text-body-1">{{ selectedCobranca.id }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Valor</div>
              <div class="text-body-1 font-weight-bold">
                {{ formatCurrency(selectedCobranca.amount) }}
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Status</div>
              <v-chip :color="getStatusColor(selectedCobranca.status)" size="small">
                {{ getStatusText(selectedCobranca.status) }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Método</div>
              <v-chip :color="getMethodColor(selectedCobranca.payment_method)" size="small">
                {{ getMethodText(selectedCobranca.payment_method) }}
              </v-chip>
            </v-col>
            <v-col cols="12">
              <div class="text-caption text-medium-emphasis">Descrição</div>
              <div class="text-body-1">{{ selectedCobranca.description }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Criada em</div>
              <div class="text-body-1">{{ formatDate(selectedCobranca.created_at) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Atualizada em</div>
              <div class="text-body-1">{{ formatDate(selectedCobranca.updated_at) }}</div>
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
const editingCobranca = ref<any>(null)
const selectedCobranca = ref<any>(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const selectedMethod = ref('Todos')
const loading = ref(false)

const novaCobranca = ref({
  amount: '',
  description: '',
  payment_method: 'CARD',
  currency: 'BRL',
  customer_id: '',
  metadata: '',
})

const statusOptions = ['Todos', 'PENDING', 'PAID', 'FAILED', 'CANCELED', 'REFUNDED']
const methodOptions = ['Todos', 'CARD', 'BOLETO', 'PIX', 'CHECKOUT_LINK']

// Headers da tabela
const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Valor', key: 'amount', sortable: true },
  { title: 'Descrição', key: 'description' },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Método', key: 'payment_method', sortable: true },
  { title: 'Cliente', key: 'customer_id' },
  { title: 'Criada em', key: 'created_at', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false },
]

// Dados mockados para teste
const cobrancas = ref([
  {
    id: 'ch_001',
    amount: 15000,
    description: 'Compra de produtos eletrônicos',
    status: 'PAID',
    payment_method: 'CARD',
    customer_id: 'cus_001',
    currency: 'BRL',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:35:00Z',
  },
  {
    id: 'ch_002',
    amount: 25000,
    description: 'Serviço de consultoria',
    status: 'PENDING',
    payment_method: 'BOLETO',
    customer_id: 'cus_002',
    currency: 'BRL',
    created_at: '2024-01-14T14:20:00Z',
    updated_at: '2024-01-14T14:20:00Z',
  },
  {
    id: 'ch_003',
    amount: 5000,
    description: 'Assinatura mensal',
    status: 'FAILED',
    payment_method: 'PIX',
    customer_id: 'cus_003',
    currency: 'BRL',
    created_at: '2024-01-13T09:15:00Z',
    updated_at: '2024-01-13T09:20:00Z',
  },
])

// Computed
const cobrancasFiltradas = computed(() => {
  let filtered = cobrancas.value

  if (searchTerm.value) {
    filtered = filtered.filter(
      (cobranca) =>
        cobranca.id.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        cobranca.description.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        cobranca.customer_id.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((cobranca) => cobranca.status === selectedStatus.value)
  }

  if (selectedMethod.value !== 'Todos') {
    filtered = filtered.filter((cobranca) => cobranca.payment_method === selectedMethod.value)
  }

  return filtered
})

const stats = computed(() => {
  const total = cobrancas.value.length
  const paid = cobrancas.value.filter((c) => c.status === 'PAID').length
  const pending = cobrancas.value.filter((c) => c.status === 'PENDING').length
  const failed = cobrancas.value.filter((c) => c.status === 'FAILED').length

  return { total, paid, pending, failed }
})

// Métodos
const viewCobranca = (cobranca: any) => {
  selectedCobranca.value = cobranca
  showViewDialog.value = true
}

const editCobranca = (cobranca: any) => {
  editingCobranca.value = cobranca
  novaCobranca.value = {
    amount: cobranca.amount.toString(),
    description: cobranca.description,
    payment_method: cobranca.payment_method,
    currency: cobranca.currency,
    customer_id: cobranca.customer_id,
    metadata: JSON.stringify(cobranca.metadata || {}, null, 2),
  }
  showCreateDialog.value = true
}

const deleteCobranca = async (cobranca: any) => {
  if (confirm('Tem certeza que deseja excluir esta cobrança?')) {
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const index = cobrancas.value.findIndex((c) => c.id === cobranca.id)
      if (index !== -1) {
        cobrancas.value.splice(index, 1)
      }
      snackbar.success('Cobrança excluída com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao excluir cobrança')
    } finally {
      loading.value = false
    }
  }
}

const saveCobranca = async () => {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingCobranca.value) {
      // Editar
      const index = cobrancas.value.findIndex((c) => c.id === editingCobranca.value.id)
      if (index !== -1) {
        cobrancas.value[index] = {
          ...editingCobranca.value,
          amount: parseFloat(novaCobranca.value.amount),
          description: novaCobranca.value.description,
          payment_method: novaCobranca.value.payment_method,
          currency: novaCobranca.value.currency,
          customer_id: novaCobranca.value.customer_id,
          updated_at: new Date().toISOString(),
        }
      }
      snackbar.success('Cobrança atualizada com sucesso!')
    } else {
      // Criar
      const newCobranca = {
        id: `ch_${Date.now()}`,
        amount: parseFloat(novaCobranca.value.amount),
        description: novaCobranca.value.description,
        status: 'PENDING',
        payment_method: novaCobranca.value.payment_method,
        currency: novaCobranca.value.currency,
        customer_id: novaCobranca.value.customer_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      cobrancas.value.unshift(newCobranca)
      snackbar.success('Cobrança criada com sucesso!')
    }

    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    snackbar.error('Erro ao salvar cobrança')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingCobranca.value = null
  novaCobranca.value = {
    amount: '',
    description: '',
    payment_method: 'CARD',
    currency: 'BRL',
    customer_id: '',
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    PAID: 'success',
    FAILED: 'error',
    CANCELED: 'grey',
    REFUNDED: 'info',
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    PENDING: 'Pendente',
    PAID: 'Paga',
    FAILED: 'Falhou',
    CANCELED: 'Cancelada',
    REFUNDED: 'Reembolsada',
  }
  return texts[status] || status
}

const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    CARD: 'primary',
    BOLETO: 'success',
    PIX: 'info',
    CHECKOUT_LINK: 'warning',
  }
  return colors[method] || 'grey'
}

const getMethodText = (method: string) => {
  const texts: Record<string, string> = {
    CARD: 'Cartão',
    BOLETO: 'Boleto',
    PIX: 'PIX',
    CHECKOUT_LINK: 'Link',
  }
  return texts[method] || method
}

// Lifecycle
onMounted(() => {
  // Carregar dados iniciais se necessário
})
</script>

<style scoped>
.cobrancas-view {
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
