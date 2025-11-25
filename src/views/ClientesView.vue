<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useCustomers } from '@/stores/useCustomers'
import { formatCPF, formatPhone, formatDate } from '@/utils/formatters'
import { validateCPF, validateEmail, validatePhone } from '@/utils/validators'

const customersStore = useCustomers()

const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const editingCliente = ref<any>(null)
const selectedCliente = ref<any>(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const formValid = ref(false)

const novoCliente = ref({
  provider: 'ASAAS' as const,
  first_name: '',
  last_name: '',
  email: '',
  cpf: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'BR',
})

const statusOptions = ['Todos', 'Ativo', 'Inativo']

const rules = {
  required: (value: any) => !!value || 'Campo obrigatório',
  email: (value: string) => validateEmail(value) || 'E-mail inválido',
  cpf: (value: string) => validateCPF(value) || 'CPF inválido',
  phone: (value: string) => validatePhone(value) || 'Telefone inválido',
}

const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Cliente', key: 'name', sortable: true },
  { title: 'CPF', key: 'document' },
  { title: 'Telefone', key: 'phone' },
  { title: 'Provedor', key: 'provider', sortable: true },
  { title: 'ID no Provedor', key: 'provider_customer_id' },
  { title: 'Criado em', key: 'created_at', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false },
]

const filteredClientes = computed(() => {
  let filtered = customersStore.customers

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (cliente: any) => {
        const fullName = cliente.full_name || cliente.name || `${cliente.first_name || ''} ${cliente.last_name || ''}`.trim()
        return fullName?.toLowerCase().includes(search) ||
          cliente.email?.toLowerCase().includes(search) ||
          cliente.cpf?.includes(search) ||
          cliente.document?.includes(search)
      },
    )
  }

  return filtered
})

const activeClients = computed(() => customersStore.customers.length)
const newThisMonth = computed(() => {
  const thisMonth = new Date().getMonth()
  return customersStore.customers.filter((cliente: any) => {
    if (!cliente.created_at) return false
    const clientMonth = new Date(cliente.created_at).getMonth()
    return clientMonth === thisMonth
  }).length
})
const withPaymentMethod = computed(() => customersStore.customers.length)

const clearFilters = () => {
  searchTerm.value = ''
  selectedStatus.value = 'Todos'
  customersStore.clearFilters()
}

const formatZipCode = () => {
  const value = novoCliente.value.zip_code.replace(/\D/g, '')
  if (value.length <= 8) {
    novoCliente.value.zip_code = value.replace(/(\d{5})(\d{3})/, '$1-$2')
  }
}

const viewCliente = (cliente: any) => {
  selectedCliente.value = cliente
  showViewDialog.value = true
}

const editCliente = (cliente: any) => {
  editingCliente.value = cliente
  const nameParts = (cliente.full_name || cliente.name || '').split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  novoCliente.value = {
    provider: 'ASAAS' as const,
    first_name: firstName,
    last_name: lastName,
    email: cliente.email || '',
    cpf: cliente.cpf || '',
    phone: cliente.phone || '',
    address: cliente.address || '',
    city: cliente.city || '',
    state: cliente.state || '',
    zip_code: cliente.zip_code || '',
    country: cliente.country || 'BR',
  }
  showCreateDialog.value = true
}

const deleteCliente = async (cliente: any) => {
  if (confirm('Tem certeza que deseja excluir este cliente?')) {
    try {
      await customersStore.deleteCustomer(cliente.id)
    } catch (error) {
    }
  }
}

const saveCliente = async () => {
  if (!formValid.value) {
    return
  }

  try {
    const normalizedZipCode = novoCliente.value.zip_code ? novoCliente.value.zip_code.replace(/\D/g, '') : ''
    const normalizedCpf = novoCliente.value.cpf ? novoCliente.value.cpf.replace(/\D/g, '') : ''
    const normalizedPhone = novoCliente.value.phone ? novoCliente.value.phone.replace(/\D/g, '') : ''
    const normalizedState = novoCliente.value.state ? novoCliente.value.state.toUpperCase().trim() : ''

    if (editingCliente.value) {
      await customersStore.updateCustomer(editingCliente.value.id, {
        first_name: novoCliente.value.first_name,
        last_name: novoCliente.value.last_name,
        email: novoCliente.value.email,
        cpf: normalizedCpf || undefined,
        phone: normalizedPhone || undefined,
        address: novoCliente.value.address,
        city: novoCliente.value.city,
        state: normalizedState || undefined,
        zip_code: normalizedZipCode || undefined,
        country: novoCliente.value.country,
      })
    } else {
      await customersStore.createCustomer({
        provider: novoCliente.value.provider,
        first_name: novoCliente.value.first_name,
        last_name: novoCliente.value.last_name,
        email: novoCliente.value.email,
        cpf: normalizedCpf || undefined,
        phone: normalizedPhone || undefined,
        address: novoCliente.value.address,
        city: novoCliente.value.city,
        state: normalizedState || undefined,
        zip_code: normalizedZipCode || undefined,
        country: novoCliente.value.country,
      })
    }

    showCreateDialog.value = false
    resetForm()
    await customersStore.listCustomers()
  } catch (error) {
  }
}

const resetForm = () => {
  editingCliente.value = null
  novoCliente.value = {
    provider: 'ASAAS' as const,
    first_name: '',
    last_name: '',
    email: '',
    cpf: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'BR',
  }
  formValid.value = false
}

const cancelForm = () => {
  showCreateDialog.value = false
  resetForm()
}

watch(searchTerm, (newValue) => {
  if (newValue) {
    customersStore.searchCustomers(newValue)
  } else {
    customersStore.listCustomers()
  }
})

onMounted(async () => {
  await customersStore.listCustomers()
})
</script>

<template>
  <div class="clientes-container">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">
            <v-icon size="32" class="mr-3">mdi-account-group</v-icon>
            Clientes
          </h1>
          <p class="page-subtitle">Gerencie seus clientes e informações de pagamento</p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showCreateDialog = true"
          class="create-btn"
        >
          Novo Cliente
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="primary">mdi-account-group</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ customersStore.customers.length }}</div>
          <div class="stat-label">Total de Clientes</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="success">mdi-check-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ activeClients }}</div>
          <div class="stat-label">Ativos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="warning">mdi-clock</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ newThisMonth }}</div>
          <div class="stat-label">Novos este Mês</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="info">mdi-credit-card</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ withPaymentMethod }}</div>
          <div class="stat-label">Com Método de Pagamento</div>
        </div>
      </div>
    </div>

    <!-- Filtros e busca -->
    <div class="filters-section">
      <div class="filters-content">
        <v-text-field
          v-model="searchTerm"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar clientes..."
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

    <!-- Tabela de clientes -->
    <div class="table-section">
      <v-data-table
        :headers="headers"
        :items="filteredClientes"
        :loading="customersStore.loading"
        :items-per-page="20"
        class="clientes-table"
        hover
      >
        <template #item.id="{ item }">
          <div class="id-cell">
            <span class="font-mono">{{ item.id }}</span>
          </div>
        </template>

        <template #item.name="{ item }">
          <div class="name-cell">
            <v-avatar size="32" class="mr-3">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
            <div>
              <div class="customer-name">{{ item.full_name || item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() }}</div>
              <div class="customer-email">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <template #item.document="{ item }">
          <div class="document-cell">
            <v-icon size="16" color="primary" class="mr-2">mdi-card-account-details</v-icon>
            <span>{{ formatCPF(item.cpf || item.document || '') }}</span>
          </div>
        </template>

        <template #item.phone="{ item }">
          <div class="phone-cell">
            <v-icon size="16" color="info" class="mr-2">mdi-phone</v-icon>
            <span>{{ formatPhone(item.phone) }}</span>
          </div>
        </template>

        <template #item.provider="{ item }">
          <div class="provider-cell">
            <v-chip
              :color="item.provider === 'ASAAS' ? 'primary' : 'secondary'"
              size="small"
              variant="tonal"
            >
              <v-icon size="14" class="mr-1">mdi-cloud</v-icon>
              {{ item.provider || 'N/A' }}
            </v-chip>
          </div>
        </template>

        <template #item.provider_customer_id="{ item }">
          <div class="provider-id-cell">
            <v-icon size="16" color="success" class="mr-2">mdi-identifier</v-icon>
            <span class="font-mono">{{ item.provider_customer_id || 'N/A' }}</span>
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
              @click="viewCliente(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editCliente(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteCliente(item)"
              class="action-btn"
            />
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="700px">
      <v-card class="cliente-dialog">
        <v-card-title class="dialog-title">
          <v-icon size="24" class="mr-2">mdi-account-plus</v-icon>
          {{ editingCliente ? 'Editar Cliente' : 'Novo Cliente' }}
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.first_name"
                  label="Primeiro Nome"
                  placeholder="João"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.last_name"
                  label="Sobrenome"
                  placeholder="Silva"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.email"
                  label="E-mail"
                  placeholder="joao@exemplo.com"
                  type="email"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.cpf"
                  label="CPF"
                  placeholder="00000000000"
                  variant="outlined"
                  :rules="[rules.required, rules.cpf]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.phone"
                  label="Telefone"
                  placeholder="11999999999"
                  variant="outlined"
                  :rules="[rules.required, rules.phone]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.zip_code"
                  label="CEP"
                  placeholder="00000-000"
                  variant="outlined"
                  @input="formatZipCode"
                  maxlength="9"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="novoCliente.address"
                  label="Endereço"
                  placeholder="Rua, número"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.city"
                  label="Cidade"
                  placeholder="São Paulo"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.state"
                  label="Estado (UF)"
                  placeholder="SP"
                  variant="outlined"
                  maxlength="2"
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
            @click="saveCliente"
            :loading="customersStore.loading"
            :disabled="!formValid"
            class="save-btn"
          >
            {{ editingCliente ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de visualização -->
    <v-dialog v-model="showViewDialog" max-width="700px">
      <v-card class="view-dialog">
        <v-card-title class="dialog-title">
          <v-icon size="24" class="mr-2">mdi-eye</v-icon>
          Detalhes do Cliente
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showViewDialog = false"
            class="close-btn"
          />
        </v-card-title>

        <v-card-text class="dialog-content">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">ID</div>
              <div class="detail-value font-mono">{{ selectedCliente?.id }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Nome</div>
              <div class="detail-value">{{ selectedCliente?.full_name || selectedCliente?.name || `${selectedCliente?.first_name || ''} ${selectedCliente?.last_name || ''}`.trim() }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">E-mail</div>
              <div class="detail-value">{{ selectedCliente?.email }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">CPF</div>
              <div class="detail-value">{{ formatCPF(selectedCliente?.cpf || selectedCliente?.document || '') }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Telefone</div>
              <div class="detail-value">{{ formatPhone(selectedCliente?.phone) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Provedor</div>
              <div class="detail-value">
                <v-chip
                  :color="selectedCliente?.provider === 'ASAAS' ? 'primary' : 'secondary'"
                  size="small"
                  variant="tonal"
                >
                  {{ selectedCliente?.provider || 'N/A' }}
                </v-chip>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-label">ID no Provedor</div>
              <div class="detail-value font-mono">{{ selectedCliente?.provider_customer_id || 'N/A' }}</div>
            </div>
            <div class="detail-item full-width">
              <div class="detail-label">Endereço</div>
              <div class="detail-value">{{ selectedCliente?.address || 'Não informado' }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Criado em</div>
              <div class="detail-value">{{ formatDate(selectedCliente?.created_at) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Atualizado em</div>
              <div class="detail-value">{{ formatDate(selectedCliente?.updated_at) }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.clientes-container {
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

.table-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.clientes-table {
  background: transparent;
}

.id-cell {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.name-cell {
  display: flex;
  align-items: center;
}

.customer-name {
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.customer-email {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.document-cell,
.phone-cell {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
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

.cliente-dialog,
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
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.save-btn {
  background: linear-gradient(135deg, #007aff 0%, #0055b3 100%);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.detail-value {
  font-size: 16px;
  color: white;
  font-weight: 600;
}

/* Responsividade */
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
