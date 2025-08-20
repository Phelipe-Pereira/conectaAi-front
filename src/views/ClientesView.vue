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

const novoCliente = ref({
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  endereco: '',
  status: 'Ativo',
})

const statusOptions = ['Todos', 'Ativo', 'Inativo']

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
</script>

<template>
  <div class="clientes-view">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <v-icon size="32" color="primary" class="mr-3">mdi-account-group</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">Clientes</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Gerencie todos os clientes da plataforma
            </p>
          </div>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
          Novo Cliente
        </v-btn>
      </div>
    </div>

    <!-- Filtros -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <v-text-field
            v-model="searchTerm"
            prepend-inner-icon="mdi-magnify"
            placeholder="Buscar clientes..."
            variant="outlined"
            density="comfortable"
            hide-details
            class="max-width-300"
          />

          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            variant="outlined"
            density="comfortable"
            hide-details
            class="max-width-200"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabela de clientes -->
    <v-card>
      <v-data-table
        :headers="headers"
        :items="clientesFiltrados"
        :loading="loading"
        :search="searchTerm"
        class="elevation-1"
      >
        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'Ativo' ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            color="primary"
            variant="text"
            @click="editCliente(item)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            color="error"
            variant="text"
            @click="deleteCliente(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingCliente ? 'Editar Cliente' : 'Novo Cliente' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" @submit.prevent="saveCliente">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoCliente.nome" label="Nome" variant="outlined" required />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novoCliente.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoCliente.telefone" label="Telefone" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="novoCliente.cpf" label="CPF" variant="outlined" />
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="novoCliente.endereco" label="Endereço" variant="outlined" />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novoCliente.status"
                  :items="['Ativo', 'Inativo']"
                  label="Status"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showCreateDialog = false"> Cancelar </v-btn>
          <v-btn color="primary" @click="saveCliente" :loading="loading">
            {{ editingCliente ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.clientes-view {
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

.max-width-300 {
  max-width: 300px;
}

.max-width-200 {
  max-width: 200px;
}
</style>
