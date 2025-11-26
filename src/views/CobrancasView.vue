<template>
  <div class="cobrancas-container">
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

    <div class="table-section">
      <v-data-table
        :headers="headers"
        :items="cobrancasFiltradas"
        :loading="chargesStore.loading"
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

        <!-- aqui usamos o customer interno da sua base -->
        <template #item.customer_id="{ item }">
          <div class="customer-cell">
            <v-icon size="16" color="info" class="mr-2">mdi-account</v-icon>
            <span>
              {{ item.customer?.full_name || item.customer?.name || 'Cliente sem nome' }}
              <span v-if="item.customer?.id"> (ID: {{ item.customer.id }})</span>
            </span>
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
              :disabled="item.status === 'CANCELLED'"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteCobranca(item)"
              class="action-btn"
              :disabled="item.status === 'CANCELLED'"
            />
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- diálogo de criação/edição -->
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
                <v-select
                  v-model="novaCobranca.customer_id"
                  :items="
                    customersStore.customers.map(c => ({
                      title: `${c.full_name || c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim()} (${c.id})`,
                      value: c.id,
                    }))
                  "
                  label="Cliente"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  :loading="customersStore.loading"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaCobranca.due_date"
                  label="Data de Vencimento"
                  type="date"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  :min="new Date().toISOString().split('T')[0]"
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
          <v-btn variant="outlined" @click="cancelForm" class="cancel-btn">Cancelar</v-btn>
          <v-btn
            color="primary"
            @click="saveCobranca"
            :loading="chargesStore.loading"
            :disabled="!formValid"
            class="save-btn"
          >
            {{ editingCobranca ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- diálogo de detalhes -->
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
              <div class="detail-label">ID Interno</div>
              <div class="detail-value font-mono">{{ selectedCobranca.id }}</div>
            </div>

            <div class="detail-item">
              <div class="detail-label">ID Externo</div>
              <div class="detail-value font-mono">
                {{ selectedCobranca.external_id || '-' }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">ID no Gateway</div>
              <div class="detail-value font-mono">
                {{ selectedCobranca.provider_payment_id || '-' }}
              </div>
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
              <div class="detail-value">
                {{ selectedCobranca.description || '-' }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Cliente</div>
              <div class="detail-value">
                {{ selectedCobranca.customer?.full_name || selectedCobranca.customer?.name || 'Cliente sem nome' }}
                <span v-if="selectedCobranca.customer?.id">
                  (ID interno: {{ selectedCobranca.customer.id }})
                </span>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Moeda</div>
              <div class="detail-value">{{ selectedCobranca.currency }}</div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Vencimento</div>
              <div class="detail-value">
                {{ formatDate(selectedCobranca.due_date) }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Pago em</div>
              <div class="detail-value">
                {{ formatDate(selectedCobranca.paid_at) }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Criada em</div>
              <div class="detail-value">
                {{ formatDate(selectedCobranca.created_at) }}
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-label">Atualizada em</div>
              <div class="detail-value">
                {{ formatDate(selectedCobranca.updated_at) }}
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
import { useCharges } from '@/stores/useCharges'
import { useCustomers } from '@/stores/useCustomers'
import http from '@/services/http'

const chargesStore = useCharges()
const customersStore = useCustomers()

const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const editingCobranca = ref<any>(null)
const selectedCobranca = ref<any>(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const selectedMethod = ref('Todos')
const formValid = ref(false)

const novaCobranca = ref({
  provider: 'ASAAS' as const,
  amount: '',
  description: '',
  payment_method: 'BOLETO',
  currency: 'BRL',
  customer_id: '',
  due_date: '',
  metadata: '',
})

const statusOptions = ['Todos', 'PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED']
const methodOptions = ['Todos', 'CARD', 'BOLETO', 'PIX', 'CHECKOUT_LINK']

const rules = {
  required: (value: any) => !!value || 'Campo obrigatório',
  positive: (value: any) => parseFloat(value) > 0 || 'Valor deve ser maior que zero',
}

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Valor', key: 'amount', sortable: true },
  { title: 'Descrição', key: 'description' },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Método', key: 'payment_method', sortable: true },
  // continuamos usando key customer_id apenas para o slot e label,
  // mas buscamos os dados de item.customer.* no template
  { title: 'Cliente', key: 'customer_id' },
  { title: 'Criada em', key: 'created_at', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false },
]

const cobrancasFiltradas = computed(() => {
  let filtered = chargesStore.charges

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((cobranca: any) => cobranca.status === selectedStatus.value)
  }

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter((cobranca: any) => {
      const id = cobranca.id?.toString().toLowerCase() || ''
      const desc = cobranca.description?.toLowerCase() || ''
      const customerId = cobranca.customer?.id?.toString().toLowerCase() || ''
      const customerName =
        (cobranca.customer?.full_name ||
          cobranca.customer?.name ||
          '')?.toString().toLowerCase() || ''

      return (
        id.includes(search) ||
        desc.includes(search) ||
        customerId.includes(search) ||
        customerName.includes(search)
      )
    })
  }

  if (selectedMethod.value !== 'Todos') {
    filtered = filtered.filter(
      (cobranca: any) => cobranca.payment_method === selectedMethod.value,
    )
  }

  return filtered
})

const stats = computed(() => {
  const total = chargesStore.charges.length
  const paid = chargesStore.paidCharges.length
  const pending = chargesStore.pendingCharges.length
  const failed = chargesStore.failedCharges.length

  return { total, paid, pending, failed }
})

const viewCobranca = async (cobranca: any) => {
  try {
    const { data } = await http.get(`/payments/${cobranca.id}`)
    // aqui vem o PaymentResponseDto completo, com external_id, provider_payment_id e customer.*
    selectedCobranca.value = data
    showViewDialog.value = true
  } catch (error) {
    console.error('Erro ao carregar detalhes da cobrança', error)
  }
}

const editCobranca = (cobranca: any) => {
  editingCobranca.value = cobranca
  novaCobranca.value = {
    provider: 'ASAAS' as const,
    amount: cobranca.amount.toString(),
    description: cobranca.description,
    payment_method: cobranca.payment_method,
    currency: cobranca.currency,
    customer_id: cobranca.customer?.id ?? '',
    due_date: cobranca.due_date ?? '',
    metadata: JSON.stringify(cobranca.metadata || {}, null, 2),
  }
  showCreateDialog.value = true
}

const deleteCobranca = async (cobranca: any) => {
  if (confirm('Tem certeza que deseja cancelar esta cobrança?')) {
    try {
      await chargesStore.cancelCharge(cobranca.id)
      await chargesStore.listCharges()
    } catch (error) {
      console.error('Erro ao cancelar cobrança', error)
    }
  }
}

const saveCobranca = async () => {
  if (!formValid.value) {
    return
  }

  try {
    if (editingCobranca.value) {
      await chargesStore.updateCharge(editingCobranca.value.id, {
        description: novaCobranca.value.description,
      })
    } else {
      const dueDate = novaCobranca.value.due_date
        ? new Date(novaCobranca.value.due_date)
        : new Date()
      dueDate.setDate(dueDate.getDate() + 7)

      await http.post('/payments', {
        provider: novaCobranca.value.provider,
        customer_id: parseInt(novaCobranca.value.customer_id, 10),
        amount: parseFloat(novaCobranca.value.amount),
        currency: novaCobranca.value.currency,
        payment_method: novaCobranca.value.payment_method,
        description: novaCobranca.value.description || null,
        due_date: dueDate.toISOString().split('T')[0],
      })

      await chargesStore.listCharges()
    }

    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Erro ao salvar cobrança', error)
  }
}

const resetForm = () => {
  editingCobranca.value = null
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 7)

  novaCobranca.value = {
    provider: 'ASAAS' as const,
    amount: '',
    description: '',
    payment_method: 'BOLETO',
    currency: 'BRL',
    customer_id: '',
    due_date: defaultDueDate.toISOString().split('T')[0],
    metadata: '',
  }
  formValid.value = false
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
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
    CANCELLED: 'grey',
    REFUNDED: 'info',
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    PENDING: 'Pendente',
    PAID: 'Paga',
    FAILED: 'Falhou',
    CANCELLED: 'Cancelada (removida)',
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
    CANCELLED: 'mdi-cancel',
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
  chargesStore.clearFilters?.()
  chargesStore.listCharges()
}

const cancelForm = () => {
  showCreateDialog.value = false
  resetForm()
}

watch(searchTerm, (newValue) => {
  if (newValue) {
    chargesStore.searchCharges(newValue)
  } else {
    chargesStore.listCharges()
  }
})

watch(showCreateDialog, async (isOpen) => {
  if (isOpen && customersStore.customers.length === 0) {
    await customersStore.listCustomers()
  }
})

onMounted(async () => {
  await chargesStore.listCharges()
  await customersStore.listCustomers()
})
</script>

<style scoped>
/* (styles exatamente como você já tinha) */
.cobrancas-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* ... resto do CSS igual ao seu ... */

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
