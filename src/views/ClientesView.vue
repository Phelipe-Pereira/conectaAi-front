<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSnackbar } from '@/stores/useSnackbar'

const snackbar = useSnackbar()

// Estado
const showCreateDialog = ref(false)
const editingCliente = ref<any>(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const loading = ref(false)
const formValid = ref(false)

const novoCliente = ref({
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  endereco: '',
  status: 'Ativo',
})

const statusOptions = ['Todos', 'Ativo', 'Inativo']

// Regras de validação
const rules = {
  required: (value: any) => !!value || 'Campo obrigatório',
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) || 'Email inválido'
  },
  phone: (value: string) => {
    if (!value) return true
    const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/
    return phoneRegex.test(value) || 'Telefone inválido'
  },
  cpf: (value: string) => {
    if (!value) return true
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    return cpfRegex.test(value) || 'CPF inválido'
  },
}

// Headers da tabela
const headers = [
  { title: 'Nome', key: 'nome', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Telefone', key: 'telefone' },
  { title: 'CPF', key: 'cpf' },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false },
]

// Dados mockados para teste
const clientes = ref([
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    status: 'Ativo',
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '(11) 88888-8888',
    cpf: '987.654.321-00',
    endereco: 'Av. Paulista, 456 - São Paulo, SP',
    status: 'Ativo',
  },
  {
    id: 3,
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    telefone: '(11) 77777-7777',
    cpf: '456.789.123-00',
    endereco: 'Rua Augusta, 789 - São Paulo, SP',
    status: 'Inativo',
  },
])

// Computed
const clientesFiltrados = computed(() => {
  let filtered = clientes.value

  if (searchTerm.value) {
    filtered = filtered.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        cliente.cpf.includes(searchTerm.value),
    )
  }

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((cliente) => cliente.status === selectedStatus.value)
  }

  return filtered
})

// Métodos
const editCliente = (cliente: any) => {
  editingCliente.value = cliente
  novoCliente.value = { ...cliente }
  showCreateDialog.value = true
}

const deleteCliente = async (cliente: any) => {
  if (confirm('Tem certeza que deseja excluir este cliente?')) {
    loading.value = true
    try {
      // Simular exclusão
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const index = clientes.value.findIndex((c) => c.id === cliente.id)
      if (index !== -1) {
        clientes.value.splice(index, 1)
      }
      snackbar.success('Cliente excluído com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao excluir cliente')
    } finally {
      loading.value = false
    }
  }
}

const saveCliente = async () => {
  loading.value = true
  try {
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingCliente.value) {
      // Editar
      const index = clientes.value.findIndex((c) => c.id === editingCliente.value.id)
      if (index !== -1) {
        clientes.value[index] = { ...editingCliente.value, ...novoCliente.value }
      }
      snackbar.success('Cliente atualizado com sucesso!')
    } else {
      // Criar
      const newCliente = {
        id: Date.now(),
        ...novoCliente.value,
      }
      clientes.value.unshift(newCliente)
      snackbar.success('Cliente criado com sucesso!')
    }

    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    snackbar.error('Erro ao salvar cliente')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingCliente.value = null
  novoCliente.value = {
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: '',
    status: 'Ativo',
  }
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedStatus.value = 'Todos'
}

const viewCliente = (cliente: any) => {
  // Implementar visualização detalhada do cliente
  console.log('Visualizar cliente:', cliente)
}

const cancelForm = () => {
  showCreateDialog.value = false
  resetForm()
}
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
          <p class="page-subtitle">
            Gerencie todos os clientes da plataforma de forma eficiente
          </p>
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
          <div class="stat-value">{{ clientes.length }}</div>
          <div class="stat-label">Total de Clientes</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="success">mdi-account-check</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ clientes.filter(c => c.status === 'Ativo').length }}</div>
          <div class="stat-label">Ativos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="warning">mdi-account-off</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ clientes.filter(c => c.status === 'Inativo').length }}</div>
          <div class="stat-label">Inativos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="info">mdi-account-plus</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ clientes.filter(c => new Date().getTime() - c.id < 86400000).length }}</div>
          <div class="stat-label">Novos Hoje</div>
        </div>
      </div>
    </div>

    <!-- Filtros e busca -->
    <div class="filters-section">
      <div class="filters-content">
        <v-text-field
          v-model="searchTerm"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar clientes por nome, email ou CPF..."
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
        :items="clientesFiltrados"
        :loading="loading"
        class="clientes-table"
        hover
      >
        <template #item.nome="{ item }">
          <div class="name-cell">
            <v-avatar size="32" color="primary" class="mr-3">
              <span class="text-caption font-weight-bold">{{ item.nome.charAt(0) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.nome }}</div>
              <div class="text-caption text-grey">{{ item.cpf }}</div>
            </div>
          </div>
        </template>

        <template #item.email="{ item }">
          <div class="email-cell">
            <v-icon size="16" color="primary" class="mr-2">mdi-email</v-icon>
            <span>{{ item.email }}</span>
          </div>
        </template>

        <template #item.telefone="{ item }">
          <div class="phone-cell">
            <v-icon size="16" color="info" class="mr-2">mdi-phone</v-icon>
            <span>{{ item.telefone }}</span>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'Ativo' ? 'success' : 'error'"
            size="small"
            variant="tonal"
            class="status-chip"
          >
            <v-icon size="14" class="mr-1">
              {{ item.status === 'Ativo' ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
            {{ item.status }}
          </v-chip>
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
    <v-dialog v-model="showCreateDialog" max-width="700px" persistent>
      <v-card class="cliente-dialog">
        <v-card-title class="dialog-title">
          <v-icon size="24" class="mr-2">{{ editingCliente ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingCliente ? 'Editar Cliente' : 'Novo Cliente' }}
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.nome"
                  label="Nome Completo"
                  placeholder="Digite o nome completo"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.email"
                  label="Email"
                  type="email"
                  placeholder="exemplo@email.com"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.telefone"
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  variant="outlined"
                  :rules="[rules.phone]"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.cpf"
                  label="CPF"
                  placeholder="123.456.789-00"
                  variant="outlined"
                  :rules="[rules.cpf]"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="novoCliente.endereco"
                  label="Endereço Completo"
                  placeholder="Rua, número, bairro, cidade - UF, CEP"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novoCliente.status"
                  :items="['Ativo', 'Inativo']"
                  label="Status"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="cancelForm"
            class="cancel-btn"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveCliente"
            :loading="loading"
            :disabled="!formValid"
            class="save-btn"
          >
            {{ editingCliente ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
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
  max-width: 400px;
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

.name-cell {
  display: flex;
  align-items: center;
}

.email-cell {
  display: flex;
  align-items: center;
}

.phone-cell {
  display: flex;
  align-items: center;
}

.status-chip {
  font-weight: 500;
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

.cliente-dialog {
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
