<script setup>
import { ref, computed } from 'vue'

const gateways = ref([
  {
    id: 1,
    nome: 'Asaas',
    tipo: 'Cartão de Crédito',
    status: 'Ativo',
    taxa: 2.99,
    ambiente: 'Produção',
    ultimaSincronizacao: '2024-03-15 14:30:25',
    transacoes: 1250,
    valorTotal: 450000.0,
    webhookUrl: 'https://api.conectaai.com/webhooks/asaas',
  },
  {
    id: 2,
    nome: 'Stripe',
    tipo: 'Cartão de Crédito',
    status: 'Ativo',
    taxa: 2.9,
    ambiente: 'Produção',
    ultimaSincronizacao: '2024-03-15 15:45:12',
    transacoes: 890,
    valorTotal: 320000.0,
    webhookUrl: 'https://api.conectaai.com/webhooks/stripe',
  },
  {
    id: 3,
    nome: 'MercadoPago',
    tipo: 'PIX',
    status: 'Inativo',
    taxa: 1.99,
    ambiente: 'Sandbox',
    ultimaSincronizacao: '2024-03-10 09:15:30',
    transacoes: 0,
    valorTotal: 0.0,
    webhookUrl: 'https://api.conectaai.com/webhooks/mercadopago',
  },
  {
    id: 4,
    nome: 'PayPal',
    tipo: 'PayPal',
    status: 'Configurando',
    taxa: 3.49,
    ambiente: 'Sandbox',
    ultimaSincronizacao: 'Nunca',
    transacoes: 0,
    valorTotal: 0.0,
    webhookUrl: 'https://api.conectaai.com/webhooks/paypal',
  },
])

const showModal = ref(false)
const editingGateway = ref(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const selectedTipo = ref('Todos')

const novoGateway = ref({
  nome: '',
  tipo: 'Cartão de Crédito',
  status: 'Inativo',
  taxa: 0,
  ambiente: 'Sandbox',
  webhookUrl: '',
})

const statusOptions = ref(['Todos', 'Ativo', 'Inativo', 'Configurando'])
const tipoOptions = ref(['Todos', 'Cartão de Crédito', 'PIX', 'PayPal', 'Boleto'])

const gatewaysFiltrados = computed(() => {
  let filtered = gateways.value

  if (searchTerm.value) {
    filtered = filtered.filter(
      (gateway) =>
        gateway.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        gateway.tipo.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((gateway) => gateway.status === selectedStatus.value)
  }

  if (selectedTipo.value !== 'Todos') {
    filtered = filtered.filter((gateway) => gateway.tipo === selectedTipo.value)
  }

  return filtered
})

const estatisticas = computed(() => {
  const total = gateways.value.length
  const ativos = gateways.value.filter((g) => g.status === 'Ativo').length
  const inativos = gateways.value.filter((g) => g.status === 'Inativo').length
  const totalTransacoes = gateways.value.reduce((sum, g) => sum + g.transacoes, 0)
  const valorTotal = gateways.value.reduce((sum, g) => sum + g.valorTotal, 0)

  return {
    total,
    ativos,
    inativos,
    totalTransacoes,
    valorTotal: Math.round(valorTotal * 100) / 100,
  }
})

const openModal = (gateway = null) => {
  editingGateway.value = gateway
  if (gateway) {
    novoGateway.value = { ...gateway }
  } else {
    novoGateway.value = {
      nome: '',
      tipo: 'Cartão de Crédito',
      status: 'Inativo',
      taxa: 0,
      ambiente: 'Sandbox',
      webhookUrl: '',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingGateway.value = null
}

const saveGateway = () => {
  if (editingGateway.value) {
    const index = gateways.value.findIndex((g) => g.id === editingGateway.value.id)
    gateways.value[index] = { ...novoGateway.value, id: editingGateway.value.id }
  } else {
    const newId = Math.max(...gateways.value.map((g) => g.id)) + 1
    gateways.value.push({
      ...novoGateway.value,
      id: newId,
      ultimaSincronizacao: 'Nunca',
      transacoes: 0,
      valorTotal: 0.0,
    })
  }
  closeModal()
}

const deleteGateway = (id) => {
  gateways.value = gateways.value.filter((g) => g.id !== id)
}

const toggleStatus = (gateway) => {
  if (gateway.status === 'Ativo') {
    gateway.status = 'Inativo'
  } else if (gateway.status === 'Inativo') {
    gateway.status = 'Ativo'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Ativo':
      return '#4CAF50'
    case 'Inativo':
      return '#F44336'
    case 'Configurando':
      return '#FF9800'
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
    case 'Configurando':
      return 'rgba(255, 152, 0, 0.1)'
    default:
      return 'rgba(158, 158, 158, 0.1)'
  }
}

const formatarData = (data) => {
  if (data === 'Nunca') return 'Nunca'
  return (
    new Date(data).toLocaleDateString('pt-BR') +
    ' ' +
    new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  )
}

const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
</script>

<template>
  <div class="gateways-container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💳</div>
        <div class="stat-content">
          <h3>Total de Gateways</h3>
          <div class="stat-value">{{ estatisticas.total }}</div>
          <div class="stat-subtitle">Configurados</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Gateways Ativos</h3>
          <div class="stat-value">{{ estatisticas.ativos }}</div>
          <div class="stat-subtitle">Operacionais</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Total de Transações</h3>
          <div class="stat-value">{{ estatisticas.totalTransacoes.toLocaleString('pt-BR') }}</div>
          <div class="stat-subtitle">Processadas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Valor Total</h3>
          <div class="stat-value">{{ formatarMoeda(estatisticas.valorTotal) }}</div>
          <div class="stat-subtitle">Processado</div>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar gateways..."
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

        <select v-model="selectedTipo" class="filter-select">
          <option v-for="tipo in tipoOptions" :key="tipo" :value="tipo">
            {{ tipo }}
          </option>
        </select>

        <button @click="openModal()" class="btn-primary">
          <span>➕</span>
          Adicionar Gateway
        </button>
      </div>
    </div>

    <div class="gateways-grid">
      <div v-for="gateway in gatewaysFiltrados" :key="gateway.id" class="gateway-card">
        <div class="gateway-header">
          <div class="gateway-info">
            <h3 class="gateway-name">{{ gateway.nome }}</h3>
            <span class="gateway-tipo">{{ gateway.tipo }}</span>
          </div>
          <div class="gateway-actions">
            <button @click="openModal(gateway)" class="btn-edit">✏️</button>
            <button @click="deleteGateway(gateway.id)" class="btn-delete">🗑️</button>
          </div>
        </div>

        <div class="gateway-status">
          <span
            class="status-badge"
            :style="{
              color: getStatusColor(gateway.status),
              backgroundColor: getStatusBgColor(gateway.status),
            }"
          >
            {{ gateway.status }}
          </span>
          <button @click="toggleStatus(gateway)" class="btn-toggle">
            {{ gateway.status === 'Ativo' ? 'Desativar' : 'Ativar' }}
          </button>
        </div>

        <div class="gateway-details">
          <div class="detail-row">
            <span class="detail-label">Taxa:</span>
            <span class="detail-value">{{ gateway.taxa }}%</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Ambiente:</span>
            <span class="detail-value">{{ gateway.ambiente }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Última Sincronização:</span>
            <span class="detail-value">{{ formatarData(gateway.ultimaSincronizacao) }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Webhook URL:</span>
            <span class="detail-value">{{ gateway.webhookUrl }}</span>
          </div>
        </div>

        <div class="gateway-stats">
          <div class="stat-item">
            <span class="stat-label">Transações:</span>
            <span class="stat-value">{{ gateway.transacoes.toLocaleString('pt-BR') }}</span>
          </div>

          <div class="stat-item">
            <span class="stat-label">Valor Total:</span>
            <span class="stat-value">{{ formatarMoeda(gateway.valorTotal) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingGateway ? 'Editar Gateway' : 'Adicionar Gateway' }}</h2>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome do Gateway *</label>
              <input v-model="novoGateway.nome" type="text" required />
            </div>

            <div class="form-group">
              <label>Tipo *</label>
              <select v-model="novoGateway.tipo" required>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="PIX">PIX</option>
                <option value="PayPal">PayPal</option>
                <option value="Boleto">Boleto</option>
              </select>
            </div>

            <div class="form-group">
              <label>Taxa (%) *</label>
              <input v-model="novoGateway.taxa" type="number" step="0.01" min="0" required />
            </div>

            <div class="form-group">
              <label>Ambiente</label>
              <select v-model="novoGateway.ambiente">
                <option value="Sandbox">Sandbox</option>
                <option value="Produção">Produção</option>
              </select>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="novoGateway.status">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Configurando">Configurando</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Webhook URL</label>
              <input
                v-model="novoGateway.webhookUrl"
                type="url"
                placeholder="https://api.conectaai.com/webhooks/..."
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Cancelar</button>
          <button @click="saveGateway" class="btn-primary">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gateways-container {
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

.gateways-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.gateway-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.gateway-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 122, 255, 0.3);
}

.gateway-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.gateway-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gateway-name {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.gateway-tipo {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  width: fit-content;
}

.gateway-actions {
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

.gateway-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.btn-toggle {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

.gateway-details {
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

.gateway-stats {
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
  .gateways-container {
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

  .gateways-grid {
    grid-template-columns: 1fr;
  }

  .gateway-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .gateway-status {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .gateway-stats {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
