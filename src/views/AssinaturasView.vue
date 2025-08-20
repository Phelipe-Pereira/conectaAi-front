<template>
  <div class="assinaturas-view">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <v-icon size="32" color="primary" class="mr-3">mdi-refresh</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">Assinaturas</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Gerencie cobranças recorrentes e planos
            </p>
          </div>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
          Nova Assinatura
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-grid mb-6">
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-primary">{{ stats.total }}</div>
          <div class="text-subtitle-2">Total de Assinaturas</div>
        </v-card-text>
      </v-card>
      
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-success">{{ stats.active }}</div>
          <div class="text-subtitle-2">Ativas</div>
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
          <div class="text-h4 font-weight-bold text-error">{{ stats.canceled }}</div>
          <div class="text-subtitle-2">Canceladas</div>
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
            placeholder="Buscar assinaturas..."
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
            v-model="selectedPlan"
            :items="planOptions"
            label="Plano"
            variant="outlined"
            density="comfortable"
            hide-details
            class="max-width-200"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabela de assinaturas -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="assinaturasFiltradas"
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
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template #item.plan_type="{ item }">
          <v-chip
            :color="getPlanColor(item.plan_type)"
            size="small"
            variant="tonal"
          >
            {{ getPlanText(item.plan_type) }}
          </v-chip>
        </template>

        <template #item.next_billing="{ item }">
          {{ formatDate(item.next_billing) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            size="small"
            color="info"
            variant="text"
            @click="viewAssinatura(item)"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            color="primary"
            variant="text"
            @click="editAssinatura(item)"
          />
          <v-btn
            icon="mdi-pause"
            size="small"
            color="warning"
            variant="text"
            @click="pauseAssinatura(item)"
            v-if="item.status === 'ACTIVE'"
          />
          <v-btn
            icon="mdi-play"
            size="small"
            color="success"
            variant="text"
            @click="resumeAssinatura(item)"
            v-if="item.status === 'PAUSED'"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            color="error"
            variant="text"
            @click="deleteAssinatura(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="700px">
      <v-card>
        <v-card-title>
          {{ editingAssinatura ? 'Editar Assinatura' : 'Nova Assinatura' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveAssinatura">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaAssinatura.amount"
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
                  v-model="novaAssinatura.plan_type"
                  :items="planOptions"
                  label="Tipo de Plano"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="novaAssinatura.description"
                  label="Descrição"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaAssinatura.customer_id"
                  label="ID do Cliente"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novaAssinatura.currency"
                  :items="['BRL', 'USD', 'EUR']"
                  label="Moeda"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaAssinatura.billing_cycle"
                  label="Ciclo de Cobrança (dias)"
                  type="number"
                  variant="outlined"
                  required
                  min="1"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaAssinatura.trial_days"
                  label="Dias de Teste"
                  type="number"
                  variant="outlined"
                  min="0"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="novaAssinatura.metadata"
                  label="Metadados (JSON)"
                  variant="outlined"
                  rows="3"
                  placeholder='{"plan_name": "Premium", "features": ["feature1", "feature2"]}'
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showCreateDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="saveAssinatura" :loading="loading">
            {{ editingAssinatura ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de visualização -->
    <v-dialog v-model="showViewDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Detalhes da Assinatura</span>
          <v-btn icon="mdi-close" variant="text" @click="showViewDialog = false" />
        </v-card-title>
        <v-card-text v-if="selectedAssinatura">
          <v-row>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">ID</div>
              <div class="text-body-1">{{ selectedAssinatura.id }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Valor</div>
              <div class="text-body-1 font-weight-bold">{{ formatCurrency(selectedAssinatura.amount) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Status</div>
              <v-chip :color="getStatusColor(selectedAssinatura.status)" size="small">
                {{ getStatusText(selectedAssinatura.status) }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Plano</div>
              <v-chip :color="getPlanColor(selectedAssinatura.plan_type)" size="small">
                {{ getPlanText(selectedAssinatura.plan_type) }}
              </v-chip>
            </v-col>
            <v-col cols="12">
              <div class="text-caption text-medium-emphasis">Descrição</div>
              <div class="text-body-1">{{ selectedAssinatura.description }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Próxima Cobrança</div>
              <div class="text-body-1">{{ formatDate(selectedAssinatura.next_billing) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Ciclo de Cobrança</div>
              <div class="text-body-1">{{ selectedAssinatura.billing_cycle }} dias</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Criada em</div>
              <div class="text-body-1">{{ formatDate(selectedAssinatura.created_at) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-caption text-medium-emphasis">Atualizada em</div>
              <div class="text-body-1">{{ formatDate(selectedAssinatura.updated_at) }}</div>
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
const editingAssinatura = ref<any>(null)
const selectedAssinatura = ref<any>(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const selectedPlan = ref('Todos')
const loading = ref(false)

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

// Lifecycle
onMounted(() => {
  // Carregar dados iniciais se necessário
})
</script>

<style scoped>
.assinaturas-view {
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
