<script setup>
import { ref, computed } from 'vue'

const clientes = ref([
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    totalCompras: 15,
    valorTotal: 45000.0,
    ultimaCompra: '2024-03-15',
    status: 'Ativo',
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '(11) 88888-8888',
    cpf: '987.654.321-00',
    endereco: 'Av. Paulista, 456 - São Paulo, SP',
    totalCompras: 8,
    valorTotal: 28000.0,
    ultimaCompra: '2024-03-10',
    status: 'Ativo',
  },
  {
    id: 3,
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    telefone: '(11) 77777-7777',
    cpf: '456.789.123-00',
    endereco: 'Rua Augusta, 789 - São Paulo, SP',
    totalCompras: 3,
    valorTotal: 12000.0,
    ultimaCompra: '2024-02-28',
    status: 'Inativo',
  },
  {
    id: 4,
    nome: 'Ana Costa',
    email: 'ana.costa@email.com',
    telefone: '(11) 66666-6666',
    cpf: '789.123.456-00',
    endereco: 'Rua Oscar Freire, 321 - São Paulo, SP',
    totalCompras: 22,
    valorTotal: 67000.0,
    ultimaCompra: '2024-03-12',
    status: 'Ativo',
  },
  {
    id: 5,
    nome: 'Carlos Ferreira',
    email: 'carlos.ferreira@email.com',
    telefone: '(11) 55555-5555',
    cpf: '321.654.987-00',
    endereco: 'Av. Brigadeiro Faria Lima, 654 - São Paulo, SP',
    totalCompras: 5,
    valorTotal: 18000.0,
    ultimaCompra: '2024-03-08',
    status: 'Ativo',
  },
])

const showModal = ref(false)
const editingCliente = ref(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const sortBy = ref('nome')

const novoCliente = ref({
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  endereco: '',
  status: 'Ativo',
})

const statusOptions = ref(['Todos', 'Ativo', 'Inativo'])

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

  if (sortBy.value === 'nome') {
    filtered.sort((a, b) => a.nome.localeCompare(b.nome))
  } else if (sortBy.value === 'totalCompras') {
    filtered.sort((a, b) => b.totalCompras - a.totalCompras)
  } else if (sortBy.value === 'valorTotal') {
    filtered.sort((a, b) => b.valorTotal - a.valorTotal)
  }

  return filtered
})

const estatisticas = computed(() => {
  const total = clientes.value.length
  const ativos = clientes.value.filter((c) => c.status === 'Ativo').length
  const inativos = clientes.value.filter((c) => c.status === 'Inativo').length
  const totalCompras = clientes.value.reduce((sum, c) => sum + c.totalCompras, 0)
  const valorTotal = clientes.value.reduce((sum, c) => sum + c.valorTotal, 0)

  return {
    total,
    ativos,
    inativos,
    totalCompras,
    valorTotal: Math.round(valorTotal * 100) / 100,
  }
})

const openModal = (cliente) => {
  editingCliente.value = cliente
  if (cliente) {
    novoCliente.value = {
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      cpf: cliente.cpf,
      endereco: cliente.endereco,
      status: cliente.status,
    }
  } else {
    novoCliente.value = {
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      endereco: '',
      status: 'Ativo',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCliente.value = null
}

const saveCliente = () => {
  if (editingCliente.value) {
    const index = clientes.value.findIndex((c) => c.id === editingCliente.value.id)
    clientes.value[index] = {
      ...novoCliente.value,
      id: editingCliente.value.id,
      totalCompras: editingCliente.value.totalCompras,
      valorTotal: editingCliente.value.valorTotal,
      ultimaCompra: editingCliente.value.ultimaCompra,
    }
  } else {
    const newId = Math.max(...clientes.value.map((c) => c.id)) + 1
    clientes.value.push({
      ...novoCliente.value,
      id: newId,
      totalCompras: 0,
      valorTotal: 0.0,
      ultimaCompra: 'Nunca',
    })
  }
  closeModal()
}

const deleteCliente = (id) => {
  clientes.value = clientes.value.filter((c) => c.id !== id)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Ativo':
      return '#4CAF50'
    case 'Inativo':
      return '#F44336'
    default:
      return '#9E9E9E'
  }
}

const getStatusBgColor = (status) => {
  switch (status) {
    case 'Ativo':
      return 'rgba(76, 175, 80, 0.1)'
    case 'Inativo':
      return 'rgba(244, 67, 54, 0.1)'
    default:
      return 'rgba(158, 158, 158, 0.1)'
  }
}

const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const formatarData = (data) => {
  if (data === 'Nunca') return 'Nunca'
  return new Date(data).toLocaleDateString('pt-BR')
}
</script>

<template>
  <div class="clientes-container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>Total de Clientes</h3>
          <div class="stat-value">{{ estatisticas.total }}</div>
          <div class="stat-subtitle">Cadastrados</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Clientes Ativos</h3>
          <div class="stat-value">{{ estatisticas.ativos }}</div>
          <div class="stat-subtitle">Ativos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Total de Compras</h3>
          <div class="stat-value">{{ estatisticas.totalCompras.toLocaleString('pt-BR') }}</div>
          <div class="stat-subtitle">Realizadas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Valor Total</h3>
          <div class="stat-value">{{ formatarMoeda(estatisticas.valorTotal) }}</div>
          <div class="stat-subtitle">Em vendas</div>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar clientes..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>

      <div class="filters-row">
        <select v-model="selectedStatus" class="filter-select">
          <option v-for="status in statusOptions" :key="status" :value="status">
            {{ status }}
          </option>
        </select>

        <select v-model="sortBy" class="filter-select">
          <option value="nome">Ordenar por Nome</option>
          <option value="totalCompras">Ordenar por Compras</option>
          <option value="valorTotal">Ordenar por Valor</option>
        </select>

        <button @click="openModal()" class="btn-primary">
          <span>➕</span>
          Adicionar Cliente
        </button>
      </div>
    </div>

    <div class="clients-grid">
      <div v-for="cliente in clientesFiltrados" :key="cliente.id" class="client-card">
        <div class="client-header">
          <div class="client-info">
            <h3 class="client-name">{{ cliente.nome }}</h3>
            <span class="client-email">{{ cliente.email }}</span>
          </div>
          <div class="client-actions">
            <button @click="openModal(cliente)" class="btn-edit">✏️</button>
            <button @click="deleteCliente(cliente.id)" class="btn-delete">🗑️</button>
          </div>
        </div>

        <div class="client-status">
          <span
            class="status-badge"
            :style="{
              color: getStatusColor(cliente.status),
              backgroundColor: getStatusBgColor(cliente.status),
            }"
          >
            {{ cliente.status }}
          </span>
        </div>

        <div class="client-details">
          <div class="detail-row">
            <span class="detail-label">Telefone:</span>
            <span class="detail-value">{{ cliente.telefone }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">CPF:</span>
            <span class="detail-value">{{ cliente.cpf }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Endereço:</span>
            <span class="detail-value">{{ cliente.endereco }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Última Compra:</span>
            <span class="detail-value">{{ formatarData(cliente.ultimaCompra) }}</span>
          </div>
        </div>

        <div class="client-stats">
          <div class="stat-item">
            <span class="stat-label">Total de Compras:</span>
            <span class="stat-value">{{ cliente.totalCompras.toLocaleString('pt-BR') }}</span>
          </div>

          <div class="stat-item">
            <span class="stat-label">Valor Total:</span>
            <span class="stat-value">{{ formatarMoeda(cliente.valorTotal) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingCliente ? 'Editar Cliente' : 'Adicionar Cliente' }}</h2>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome Completo *</label>
              <input v-model="novoCliente.nome" type="text" required />
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input v-model="novoCliente.email" type="email" required />
            </div>

            <div class="form-group">
              <label>Telefone *</label>
              <input v-model="novoCliente.telefone" type="tel" required />
            </div>

            <div class="form-group">
              <label>CPF *</label>
              <input v-model="novoCliente.cpf" type="text" required />
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="novoCliente.status">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Endereço *</label>
              <input v-model="novoCliente.endereco" type="text" required />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Cancelar</button>
          <button @click="saveCliente" class="btn-primary">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clientes-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
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
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-content h3 {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.filters-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 16px 48px 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007aff;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
}

.filters-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  min-width: 150px;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #007aff;
  background: rgba(255, 255, 255, 0.15);
}

.filter-select option {
  background: #1a1a1a;
  color: white;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
}

.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.client-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.client-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 122, 255, 0.3);
}

.client-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.client-name {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.client-email {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.client-actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #007aff;
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover {
  transform: scale(1.1);
}

.client-status {
  margin-bottom: 20px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.client-details {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: white;
  text-align: right;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.client-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007aff;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-group select option {
  background: #1a1a1a;
  color: white;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary {
  padding: 12px 24px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .clientes-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    min-width: auto;
  }

  .clients-grid {
    grid-template-columns: 1fr;
  }

  .client-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .client-stats {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
