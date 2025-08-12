<script setup>
import { ref, computed } from 'vue'

const transacoes = ref([
  {
    id: 1,
    codigo: 'TXN-2024-001',
    cliente: 'João Silva',
    valor: 1250.0,
    gateway: 'Asaas',
    status: 'Aprovada',
    data: '2024-03-15 14:30:25',
    metodo: 'Cartão de Crédito',
    parcelas: 3,
  },
  {
    id: 2,
    codigo: 'TXN-2024-002',
    cliente: 'Maria Santos',
    valor: 890.0,
    gateway: 'Stripe',
    status: 'Pendente',
    data: '2024-03-15 15:45:12',
    metodo: 'PIX',
    parcelas: 1,
  },
  {
    id: 3,
    codigo: 'TXN-2024-003',
    cliente: 'Pedro Oliveira',
    valor: 299.99,
    gateway: 'MercadoPago',
    status: 'Recusada',
    data: '2024-03-15 16:20:30',
    metodo: 'Cartão de Débito',
    parcelas: 1,
  },
  {
    id: 4,
    codigo: 'TXN-2024-004',
    cliente: 'Ana Costa',
    valor: 2100.0,
    gateway: 'Asaas',
    status: 'Aprovada',
    data: '2024-03-15 17:10:45',
    metodo: 'Cartão de Crédito',
    parcelas: 6,
  },
  {
    id: 5,
    codigo: 'TXN-2024-005',
    cliente: 'Carlos Ferreira',
    valor: 450.0,
    gateway: 'Stripe',
    status: 'Cancelada',
    data: '2024-03-15 18:05:15',
    metodo: 'PayPal',
    parcelas: 1,
  },
])

const showModal = ref(false)
const selectedTransacao = ref(null)
const searchTerm = ref('')
const selectedStatus = ref('Todas')
const selectedGateway = ref('Todos')

const statusOptions = ref(['Todas', 'Aprovada', 'Pendente', 'Recusada', 'Cancelada'])
const gatewayOptions = ref(['Todos', 'Asaas', 'Stripe', 'MercadoPago', 'PayPal'])

const transacoesFiltradas = computed(() => {
  let filtered = transacoes.value

  if (searchTerm.value) {
    filtered = filtered.filter(
      (transacao) =>
        transacao.codigo.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        transacao.cliente.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  if (selectedStatus.value !== 'Todas') {
    filtered = filtered.filter((transacao) => transacao.status === selectedStatus.value)
  }

  if (selectedGateway.value !== 'Todos') {
    filtered = filtered.filter((transacao) => transacao.gateway === selectedGateway.value)
  }

  return filtered.sort((a, b) => new Date(b.data) - new Date(a.data))
})

const estatisticas = computed(() => {
  const total = transacoes.value.length
  const aprovadas = transacoes.value.filter((t) => t.status === 'Aprovada').length
  const pendentes = transacoes.value.filter((t) => t.status === 'Pendente').length
  const recusadas = transacoes.value.filter((t) => t.status === 'Recusada').length
  const valorTotal = transacoes.value.reduce((sum, t) => sum + t.valor, 0)
  const valorAprovado = transacoes.value
    .filter((t) => t.status === 'Aprovada')
    .reduce((sum, t) => sum + t.valor, 0)

  return {
    total,
    aprovadas,
    pendentes,
    recusadas,
    valorTotal: Math.round(valorTotal * 100) / 100,
    valorAprovado: Math.round(valorAprovado * 100) / 100,
  }
})

const openModal = (transacao) => {
  selectedTransacao.value = transacao
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedTransacao.value = null
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Aprovada':
      return '#4CAF50'
    case 'Pendente':
      return '#FF9800'
    case 'Recusada':
      return '#F44336'
    case 'Cancelada':
      return '#9E9E9E'
    default:
      return '#9E9E9E'
  }
}

const getStatusBgColor = (status) => {
  switch (status) {
    case 'Aprovada':
      return 'rgba(76, 175, 80, 0.1)'
    case 'Pendente':
      return 'rgba(255, 152, 0, 0.1)'
    case 'Recusada':
      return 'rgba(244, 67, 54, 0.1)'
    case 'Cancelada':
      return 'rgba(158, 158, 158, 0.1)'
    default:
      return 'rgba(158, 158, 158, 0.1)'
  }
}

const formatarData = (data) => {
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
  <div class="transacoes-container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💳</div>
        <div class="stat-content">
          <h3>Total de Transações</h3>
          <div class="stat-value">{{ estatisticas.total }}</div>
          <div class="stat-subtitle">Realizadas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Transações Aprovadas</h3>
          <div class="stat-value">{{ estatisticas.aprovadas }}</div>
          <div class="stat-subtitle">Aprovadas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Valor Total</h3>
          <div class="stat-value">{{ formatarMoeda(estatisticas.valorTotal) }}</div>
          <div class="stat-subtitle">Em transações</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Valor Aprovado</h3>
          <div class="stat-value">{{ formatarMoeda(estatisticas.valorAprovado) }}</div>
          <div class="stat-subtitle">Em vendas</div>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar transações..."
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

        <select v-model="selectedGateway" class="filter-select">
          <option v-for="gateway in gatewayOptions" :key="gateway" :value="gateway">
            {{ gateway }}
          </option>
        </select>
      </div>
    </div>

    <div class="transactions-grid">
      <div v-for="transacao in transacoesFiltradas" :key="transacao.id" class="transaction-card">
        <div class="transaction-header">
          <div class="transaction-info">
            <h3 class="transaction-code">{{ transacao.codigo }}</h3>
            <span class="transaction-date">{{ formatarData(transacao.data) }}</span>
          </div>
          <span
            class="transaction-status"
            :style="{
              color: getStatusColor(transacao.status),
              backgroundColor: getStatusBgColor(transacao.status),
            }"
          >
            {{ transacao.status }}
          </span>
        </div>

        <div class="transaction-summary">
          <div class="summary-item">
            <span class="summary-label">Cliente:</span>
            <span class="summary-value">{{ transacao.cliente }}</span>
          </div>

          <div class="summary-item">
            <span class="summary-label">Valor:</span>
            <span class="summary-value">{{ formatarMoeda(transacao.valor) }}</span>
          </div>

          <div class="summary-item">
            <span class="summary-label">Gateway:</span>
            <span class="summary-value">{{ transacao.gateway }}</span>
          </div>

          <div class="summary-item">
            <span class="summary-label">Método:</span>
            <span class="summary-value">{{ transacao.metodo }}</span>
          </div>
        </div>

        <div class="transaction-actions">
          <button @click="openModal(transacao)" class="btn-view">Ver Detalhes</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detalhes da Transação {{ selectedTransacao?.codigo }}</h2>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-group">
              <h3>Informações da Transação</h3>
              <div class="detail-item">
                <span class="detail-label">Código:</span>
                <span class="detail-value">{{ selectedTransacao?.codigo }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Data:</span>
                <span class="detail-value">{{ formatarData(selectedTransacao?.data) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span
                  class="detail-value status-badge"
                  :style="{
                    color: getStatusColor(selectedTransacao?.status),
                    backgroundColor: getStatusBgColor(selectedTransacao?.status),
                  }"
                >
                  {{ selectedTransacao?.status }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Valor:</span>
                <span class="detail-value">{{ formatarMoeda(selectedTransacao?.valor) }}</span>
              </div>
            </div>

            <div class="detail-group">
              <h3>Informações do Cliente</h3>
              <div class="detail-item">
                <span class="detail-label">Nome:</span>
                <span class="detail-value">{{ selectedTransacao?.cliente }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Gateway:</span>
                <span class="detail-value">{{ selectedTransacao?.gateway }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Método:</span>
                <span class="detail-value">{{ selectedTransacao?.metodo }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Parcelas:</span>
                <span class="detail-value">{{ selectedTransacao?.parcelas }}x</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transacoes-container {
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

.transactions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.transaction-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.transaction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 122, 255, 0.3);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.transaction-code {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.transaction-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.transaction-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.transaction-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.transaction-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-view {
  padding: 8px 16px;
  background: rgba(0, 122, 255, 0.2);
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 6px;
  color: #007aff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view:hover {
  background: rgba(0, 122, 255, 0.3);
  border-color: rgba(0, 122, 255, 0.5);
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
  max-width: 800px;
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

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.detail-group h3 {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
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
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
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
  .transacoes-container {
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

  .transactions-grid {
    grid-template-columns: 1fr;
  }

  .transaction-summary {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
