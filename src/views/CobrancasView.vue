<template>
  <div class="cobrancas-container">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">
            <v-icon size="32" class="mr-3">mdi-credit-card</v-icon>
            Cobranças
          </h1>
          <p class="page-subtitle">Gerencie todas as cobranças e transações da plataforma</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showCreateDialog = true"
          class="create-btn"
        >
          Nova Cobrança
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="primary">mdi-credit-card-multiple</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total de Cobranças</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="success">mdi-check-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.paid }}</div>
          <div class="stat-label">Pagas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="warning">mdi-clock</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pending }}</div>
          <div class="stat-label">Pendentes</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="error">mdi-close-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.failed }}</div>
          <div class="stat-label">Falhadas</div>
        </div>
      </div>
    </div>

    <!-- Filtros e busca -->
    <div class="filters-section">
      <div class="filters-content">
        <v-text-field
          v-model="searchTerm"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar cobranças por ID, descrição ou cliente..."
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
          v-model="selectedMethod"
          :items="methodOptions"
          placeholder="Método"
          variant="outlined"
          density="compact"
          hide-details
          class="method-filter"
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

    <!-- Tabela de cobranças -->
    <div class="table-section">
      <v-data-table
        :headers="headers"
        :items="cobrancasFiltradas"
        :loading="loading"
        class="cobrancas-table"
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

        <template #item.payment_method="{ item }">
          <v-chip
            :color="getMethodColor(item.payment_method)"
            size="small"
            variant="tonal"
            class="method-chip"
          >
            <v-icon size="14" class="mr-1">
              {{ getMethodIcon(item.payment_method) }}
            </v-icon>
            {{ getMethodText(item.payment_method) }}
          </v-chip>
        </template>

        <template #item.customer_id="{ item }">
          <div class="customer-cell">
            <v-icon size="16" color="info" class="mr-2">mdi-account</v-icon>
            <span>{{ item.customer_id }}</span>
          </div>
        </template>

        <template #item.created_at="{ item }">
          <div class="date-cell">
            {{ formatDate(item.created_at) }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="actions-cell">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="primary"
              @click="viewCobranca(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editCobranca(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteCobranca(item)"
              class="action-btn"
            />
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="800px" persistent>
      <v-card class="cobranca-dialog">
        <v-card-title class="dialog-title">
          <v-icon size="24" class="mr-2">{{ editingCobranca ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingCobranca ? 'Editar Cobrança' : 'Nova Cobrança' }}
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaCobranca.amount"
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
                  v-model="novaCobranca.payment_method"
                  :items="methodOptions.filter((m) => m !== 'Todos')"
                  label="Método de Pagamento"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="novaCobranca.description"
                  label="Descrição"
                  placeholder="Descrição da cobrança"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaCobranca.customer_id"
                  label="ID do Cliente"
                  placeholder="cus_001"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novaCobranca.currency"
                  :items="['BRL', 'USD', 'EUR']"
                  label="Moeda"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="novaCobranca.metadata"
                  label="Metadados (JSON)"
                  placeholder='{"order_id": "123", "product": "item"}'
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
            @click="saveCobranca"
            :loading="loading"
            :disabled="!formValid"
            class="save-btn"
          >
            {{ editingCobranca ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de visualização -->
    <v-dialog v-model="showViewDialog" max-width="700px">
      <v-card class="view-dialog">
        <v-card-title class="dialog-title">
          <v-icon size="24" class="mr-2">mdi-eye</v-icon>
          Detalhes da Cobrança
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showViewDialog = false"
            class="close-btn"
          />
        </v-card-title>

        <v-card-text v-if="selectedCobranca" class="dialog-content">
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">ID</div>
              <div class="detail-value font-mono">{{ selectedCobranca.id }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Valor</div>
              <div class="detail-value font-weight-bold text-success">
                {{ formatCurrency(selectedCobranca.amount) }}
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">
                <v-chip :color="getStatusColor(selectedCobranca.status)" size="small">
                  {{ getStatusText(selectedCobranca.status) }}
                </v-chip>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Método</div>
              <div class="detail-value">
                <v-chip :color="getMethodColor(selectedCobranca.payment_method)" size="small">
                  {{ getMethodText(selectedCobranca.payment_method) }}
                </v-chip>
              </div>
            </div>
            <div class="detail-item full-width">
              <div class="detail-label">Descrição</div>
              <div class="detail-value">{{ selectedCobranca.description }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Cliente</div>
              <div class="detail-value">{{ selectedCobranca.customer_id }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Moeda</div>
              <div class="detail-value">{{ selectedCobranca.currency }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Criada em</div>
              <div class="detail-value">{{ formatDate(selectedCobranca.created_at) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Atualizada em</div>
              <div class="detail-value">{{ formatDate(selectedCobranca.updated_at) }}</div>
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
const editingCobranca = ref<any>(null)
const selectedCobranca = ref<any>(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const selectedMethod = ref('Todos')
const loading = ref(false)
const formValid = ref(false)

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

const rules = {
  required: (value: any) => !!value || 'Campo obrigatório',
  positive: (value: any) => parseFloat(value) > 0 || 'Valor deve ser maior que zero',
}

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
  if (!formValid.value) {
    snackbar.error('Por favor, preencha todos os campos obrigatórios corretamente.')
    return
  }

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
  formValid.value = false
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

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    PENDING: 'mdi-clock',
    PAID: 'mdi-check-circle',
    FAILED: 'mdi-close-circle',
    CANCELED: 'mdi-cancel',
    REFUNDED: 'mdi-refresh',
  }
  return icons[status] || 'mdi-help'
}

const getMethodIcon = (method: string) => {
  const icons: Record<string, string> = {
    CARD: 'mdi-credit-card',
    BOLETO: 'mdi-receipt',
    PIX: 'mdi-qrcode',
    CHECKOUT_LINK: 'mdi-link',
  }
  return icons[method] || 'mdi-help'
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedStatus.value = 'Todos'
  selectedMethod.value = 'Todos'
}

const cancelForm = () => {
  showCreateDialog.value = false
  resetForm()
}

// Lifecycle
onMounted(() => {
  // Carregar dados iniciais se necessário
})
</script>

<style scoped>
.cobrancas-container {
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
  margin-left: 16px;
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
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
}

.stat-label {
  font-size: 14px;
  color: #b0b0b0;
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
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-field,
.status-filter,
.method-filter {
  flex: 1;
  min-width: 200px;
}

.clear-filters-btn {
  margin-left: 12px;
}

.table-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  overflow-x: auto;
}

.cobrancas-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.cobrancas-table th,
.cobrancas-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #404040;
}

.cobrancas-table {
  background: transparent;
}

.cobrancas-table th {
  background: rgba(255, 255, 255, 0.05);
  font-weight: bold;
  color: #ffffff;
}

.cobrancas-table tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.id-cell {
  display: flex;
  align-items: center;
}

.amount-cell {
  text-align: right;
}

.description-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-chip,
.method-chip {
  display: flex;
  align-items: center;
}

.status-chip .v-icon,
.method-chip .v-icon {
  margin-right: 4px;
}

.customer-cell {
  display: flex;
  align-items: center;
}

.date-cell {
  text-align: right;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px;
}

.cobranca-dialog,
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
  padding: 24px;
}

.dialog-actions {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
}

.cancel-btn {
  margin-right: 12px;
}

.save-btn {
  margin-left: 12px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
}

.detail-label {
  font-size: 14px;
  color: #b0b0b0;
  font-weight: bold;
  min-width: 100px;
}

.detail-value {
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.full-width {
  grid-column: 1 / -1;
}

.close-btn {
  margin-left: 12px;
}
</style>
