<script setup>
import { ref } from 'vue'

const clientes = ref([
  {
    id: 1,
    nome: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    telefone: '123-456-7890',
  },
  {
    id: 2,
    nome: 'Bob Smith',
    email: 'bob.smith@example.com',
    telefone: '987-654-3210',
  },
  {
    id: 3,
    nome: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    telefone: '555-123-4567',
  },
])

const showNewClientForm = ref(false)
const showEditForm = ref(false)
const selectedCliente = ref(null)

const novoCliente = ref({
  id: 0,
  nome: '',
  email: '',
  telefone: '',
})

const formatarData = (data) => {
  return new Date(data).toLocaleDateString('pt-BR')
}

const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const cadastrarCliente = () => {
  const cliente = {
    ...novoCliente.value,
    id: Date.now(),
  }
  clientes.value.push(cliente)
  showNewClientForm.value = false
  novoCliente.value = {
    id: 0,
    nome: '',
    email: '',
    telefone: '',
  }
}

const editarCliente = (cliente) => {
  selectedCliente.value = { ...cliente }
  showEditForm.value = true
}

const excluirCliente = (id) => {
  clientes.value = clientes.value.filter((c) => c.id !== id)
}

const salvarEdicao = () => {
  if (selectedCliente.value) {
    const index = clientes.value.findIndex((c) => c.id === selectedCliente.value.id)
    if (index !== -1) {
      clientes.value[index] = { ...selectedCliente.value }
    }
    showEditForm.value = false
    selectedCliente.value = null
  }
}
</script>

<template>
  <div class="clientes-container">
    <div class="page-header">
      <h1>Informações dos Clientes</h1>
      <button class="btn btn-primary" @click="showNewClientForm = true">
        Adicionar novo usuário
      </button>
    </div>

    <div class="clientes-content card">
      <div class="clientes-header">
        <div class="search-bar">
          <input type="text" class="input" placeholder="Buscar cliente..." />
        </div>
        <div class="filtros">
          <select class="input">
            <option value="">Ordenar por</option>
            <option>Nome (A-Z)</option>
            <option>Nome (Z-A)</option>
            <option>Maior valor em compras</option>
            <option>Menor valor em compras</option>
          </select>
        </div>
      </div>

      <table class="clientes-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientes" :key="cliente.id">
            <td>{{ cliente.nome }}</td>
            <td>{{ cliente.email }}</td>
            <td>{{ cliente.telefone }}</td>
            <td class="acoes">
              <button class="btn btn-secondary" @click="editarCliente(cliente)">Editar</button>
              <button class="btn btn-danger" @click="excluirCliente(cliente.id)">Deletar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showNewClientForm" class="modal-overlay" @click="showNewClientForm = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Novo Cliente</h2>
          <button @click="showNewClientForm = false" class="btn-close">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome *</label>
              <input v-model="novoCliente.nome" type="text" class="input" required />
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input v-model="novoCliente.email" type="email" class="input" required />
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input v-model="novoCliente.telefone" type="tel" class="input" />
            </div>
            <div class="form-group">
              <label>Endereço</label>
              <input v-model="novoCliente.endereco" type="text" class="input" />
            </div>
            <div class="form-group">
              <label>Cidade</label>
              <input v-model="novoCliente.cidade" type="text" class="input" />
            </div>
            <div class="form-group">
              <label>Estado</label>
              <input v-model="novoCliente.estado" type="text" class="input" />
            </div>
            <div class="form-group">
              <label>CEP</label>
              <input v-model="novoCliente.cep" type="text" class="input" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" @click="showNewClientForm = false" class="btn btn-secondary">
              Cancelar
            </button>
            <button @click="cadastrarCliente" class="btn btn-primary">Cadastrar</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEditForm" class="modal-overlay">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Editar Cliente</h2>
          <button class="btn-close" @click="showEditForm = false">×</button>
        </div>

        <form @submit.prevent="salvarEdicao" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome *</label>
              <input v-model="selectedCliente.nome" type="text" class="input" required />
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input v-model="selectedCliente.email" type="email" class="input" required />
            </div>

            <div class="form-group">
              <label>Telefone</label>
              <input v-model="selectedCliente.telefone" type="tel" class="input" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showEditForm = false">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clientes-container {
  padding: var(--spacing-lg);
}

.clientes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-lg);
}

.clientes-header h1 {
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 600;
}

.search-bar {
  flex: 1;
  max-width: 400px;
}

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--spacing-lg);
}

.clientes-table th,
.clientes-table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.clientes-table th {
  font-weight: 600;
  color: var(--text-secondary);
  background-color: var(--bg-tertiary);
}

.clientes-table td {
  color: var(--text-primary);
}

.clientes-table tr:hover {
  background-color: var(--bg-tertiary);
}

.acoes {
  display: flex;
  gap: var(--spacing-sm);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
}

.btn-close:hover {
  background-color: var(--bg-tertiary);
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
}

.form-group .input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-group .input:focus {
  outline: none;
  border-color: var(--primary);
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .clientes-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
