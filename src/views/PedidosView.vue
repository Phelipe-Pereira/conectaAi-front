<script setup>
import { ref, computed } from 'vue'

const pedidos = ref([
  {
    id: 1,
    cliente: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(11) 99999-9999',
    data: '2024-03-15',
    status: 'Aprovado',
    valor: 1250.0,
    formaPagamento: 'Cartão de Crédito',
    itens: [
      { produto: 'Smartphone Galaxy S23', quantidade: 1, preco: 2999.99, subtotal: 2999.99 },
      { produto: 'Fones de Ouvido Wireless', quantidade: 2, preco: 299.99, subtotal: 599.98 },
    ],
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    observacoes: 'Entregar após 18h',
  },
  {
    id: 2,
    cliente: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '(11) 88888-8888',
    data: '2024-03-14',
    status: 'Pendente',
    valor: 890.0,
    formaPagamento: 'PIX',
    itens: [{ produto: 'Smart TV 55" 4K', quantidade: 1, preco: 2499.99, subtotal: 2499.99 }],
    endereco: 'Av. Paulista, 456 - São Paulo, SP',
    observacoes: '',
  },
  {
    id: 3,
    cliente: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    telefone: '(11) 77777-7777',
    data: '2024-03-13',
    status: 'Cancelado',
    valor: 299.99,
    formaPagamento: 'Boleto',
    itens: [{ produto: 'Tênis Esportivo', quantidade: 1, preco: 199.99, subtotal: 199.99 }],
    endereco: 'Rua Augusta, 789 - São Paulo, SP',
    observacoes: 'Cliente solicitou cancelamento',
  },
  {
    id: 4,
    cliente: 'Ana Costa',
    email: 'ana.costa@email.com',
    telefone: '(11) 66666-6666',
    data: '2024-03-12',
    status: 'Aprovado',
    valor: 2100.0,
    formaPagamento: 'Cartão de Débito',
    itens: [
      { produto: 'Capa Protetora Premium', quantidade: 3, preco: 89.99, subtotal: 269.97 },
      { produto: 'Smartphone Galaxy S23', quantidade: 1, preco: 2999.99, subtotal: 2999.99 },
    ],
    endereco: 'Rua Oscar Freire, 321 - São Paulo, SP',
    observacoes: 'Presente para aniversário',
  },
  {
    id: 5,
    cliente: 'Carlos Ferreira',
    email: 'carlos.ferreira@email.com',
    telefone: '(11) 55555-5555',
    data: '2024-03-11',
    status: 'Em Processamento',
    valor: 450.0,
    formaPagamento: 'Cartão de Crédito',
    itens: [
      { produto: 'Fones de Ouvido Wireless', quantidade: 1, preco: 299.99, subtotal: 299.99 },
      { produto: 'Capa Protetora Premium', quantidade: 1, preco: 89.99, subtotal: 89.99 },
    ],
    endereco: 'Av. Brigadeiro Faria Lima, 654 - São Paulo, SP',
    observacoes: '',
  },
])

const statusOptions = ref(['Todos', 'Aprovado', 'Pendente', 'Em Processamento', 'Cancelado'])
const showModal = ref(false)
const selectedPedido = ref(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const sortBy = ref('data')

const pedidosFiltrados = computed(() => {
  let filtered = pedidos.value

  if (searchTerm.value) {
    filtered = filtered.filter(
      (pedido) =>
        pedido.cliente.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        pedido.email.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        pedido.id.toString().includes(searchTerm.value),
    )
  }

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((pedido) => pedido.status === selectedStatus.value)
  }

  if (sortBy.value === 'data') {
    filtered.sort((a, b) => new Date(b.data) - new Date(a.data))
  } else if (sortBy.value === 'valor') {
    filtered.sort((a, b) => b.valor - a.valor)
  } else if (sortBy.value === 'cliente') {
    filtered.sort((a, b) => a.cliente.localeCompare(b.cliente))
  }

  return filtered
})

const estatisticas = computed(() => {
  const total = pedidos.value.length
  const aprovados = pedidos.value.filter((p) => p.status === 'Aprovado').length
  const pendentes = pedidos.value.filter((p) => p.status === 'Pendente').length
  const cancelados = pedidos.value.filter((p) => p.status === 'Cancelado').length
  const valorTotal = pedidos.value.reduce((sum, p) => sum + p.valor, 0)
  const valorAprovado = pedidos.value
    .filter((p) => p.status === 'Aprovado')
    .reduce((sum, p) => sum + p.valor, 0)

  return {
    total,
    aprovados,
    pendentes,
    cancelados,
    valorTotal: Math.round(valorTotal * 100) / 100,
    valorAprovado: Math.round(valorAprovado * 100) / 100,
  }
})

const openModal = (pedido) => {
  selectedPedido.value = pedido
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedPedido.value = null
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Aprovado':
      return '#4CAF50'
    case 'Pendente':
      return '#FF9800'
    case 'Em Processamento':
      return '#2196F3'
    case 'Cancelado':
      return '#F44336'
    default:
      return '#9E9E9E'
  }
}

const getStatusBgColor = (status) => {
  switch (status) {
    case 'Aprovado':
      return 'rgba(76, 175, 80, 0.1)'
    case 'Pendente':
      return 'rgba(255, 152, 0, 0.1)'
    case 'Em Processamento':
      return 'rgba(33, 150, 243, 0.1)'
    case 'Cancelado':
      return 'rgba(244, 67, 54, 0.1)'
    default:
      return 'rgba(158, 158, 158, 0.1)'
  }
}

const formatarData = (data) => {
  return new Date(data).toLocaleDateString('pt-BR')
}

const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
</script>

<template>
  <div class="pedidos-container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <h3>Total de Pedidos</h3>
          <div class="stat-value">{{ estatisticas.total }}</div>
          <div class="stat-subtitle">Realizados</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Pedidos Aprovados</h3>
          <div class="stat-value">{{ estatisticas.aprovados }}</div>
          <div class="stat-subtitle">Aprovados</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Valor Total</h3>
          <div class="stat-value">{{ formatarMoeda(estatisticas.valorTotal) }}</div>
          <div class="stat-subtitle">Em pedidos</div>
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
          placeholder="Buscar pedidos..."
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
          <option value="data">Ordenar por Data</option>
          <option value="valor">Ordenar por Valor</option>
          <option value="cliente">Ordenar por Cliente</option>
        </select>
      </div>
    </div>

    <div class="orders-grid">
      <div v-for="pedido in pedidosFiltrados" :key="pedido.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h3 class="order-id">Pedido #{{ pedido.id }}</h3>
            <span class="order-date">{{ formatarData(pedido.data) }}</span>
          </div>
          <span
            class="order-status"
            :style="{
              color: getStatusColor(pedido.status),
              backgroundColor: getStatusBgColor(pedido.status),
            }"
          >
            {{ pedido.status }}
          </span>
        </div>

        <div class="order-summary">
          <div class="summary-item">
            <span class="summary-label">Cliente:</span>
            <span class="summary-value">{{ pedido.cliente }}</span>
          </div>

          <div class="summary-item">
            <span class="summary-label">Valor:</span>
            <span class="summary-value">{{ formatarMoeda(pedido.valor) }}</span>
          </div>

          <div class="summary-item">
            <span class="summary-label">Forma de Pagamento:</span>
            <span class="summary-value">{{ pedido.formaPagamento }}</span>
          </div>

          <div class="summary-item">
            <span class="summary-label">Itens:</span>
            <span class="summary-value">{{ pedido.itens.length }} produtos</span>
          </div>
        </div>

        <div class="order-items-preview">
          <div v-for="(item, index) in pedido.itens.slice(0, 2)" :key="index" class="item-preview">
            <span class="item-name">{{ item.produto }}</span>
            <span class="item-quantity">x{{ item.quantidade }}</span>
          </div>
          <div v-if="pedido.itens.length > 2" class="more-items">
            +{{ pedido.itens.length - 2 }} mais
          </div>
        </div>

        <div class="order-address">
          <span class="address-label">Endereço:</span>
          <span class="address-value">{{ pedido.endereco }}</span>
        </div>

        <div v-if="pedido.observacoes" class="order-notes">
          <span class="notes-label">Observações:</span>
          <span class="notes-value">{{ pedido.observacoes }}</span>
        </div>

        <div class="order-actions">
          <button @click="openModal(pedido)" class="btn-view">Ver Detalhes</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detalhes do Pedido #{{ selectedPedido?.id }}</h2>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-group">
              <h3>Informações do Cliente</h3>
              <div class="detail-item">
                <span class="detail-label">Nome:</span>
                <span class="detail-value">{{ selectedPedido?.cliente }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ selectedPedido?.email }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Telefone:</span>
                <span class="detail-value">{{ selectedPedido?.telefone }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Endereço:</span>
                <span class="detail-value">{{ selectedPedido?.endereco }}</span>
              </div>
            </div>

            <div class="detail-group">
              <h3>Informações do Pedido</h3>
              <div class="detail-item">
                <span class="detail-label">Data:</span>
                <span class="detail-value">{{ formatarData(selectedPedido?.data) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span
                  class="detail-value status-badge"
                  :style="{
                    color: getStatusColor(selectedPedido?.status),
                    backgroundColor: getStatusBgColor(selectedPedido?.status),
                  }"
                >
                  {{ selectedPedido?.status }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Forma de Pagamento:</span>
                <span class="detail-value">{{ selectedPedido?.formaPagamento }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Observações:</span>
                <span class="detail-value">{{ selectedPedido?.observacoes || 'Nenhuma' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-group">
            <h3>Itens do Pedido</h3>
            <div class="itens-table">
              <div class="table-header">
                <span class="header-product">Produto</span>
                <span class="header-quantity">Qtd</span>
                <span class="header-price">Preço Unit.</span>
                <span class="header-subtotal">Subtotal</span>
              </div>
              <div v-for="(item, index) in selectedPedido?.itens" :key="index" class="table-row">
                <span class="cell-product">{{ item.produto }}</span>
                <span class="cell-quantity">{{ item.quantidade }}</span>
                <span class="cell-price">{{ formatarMoeda(item.preco) }}</span>
                <span class="cell-subtotal">{{ formatarMoeda(item.subtotal) }}</span>
              </div>
            </div>

            <div class="transaction-total">
              <span class="total-label">Total do Pedido:</span>
              <span class="total-value">{{ formatarMoeda(selectedPedido?.valor) }}</span>
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
.pedidos-container {
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

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.order-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 122, 255, 0.3);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-id {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.order-date {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.order-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.order-summary {
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

.order-items-preview {
  margin-bottom: 16px;
}

.item-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.item-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.item-quantity {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.more-items {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin-top: 8px;
}

.order-address {
  margin-bottom: 12px;
}

.address-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 4px;
}

.address-value {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.order-notes {
  margin-bottom: 16px;
}

.notes-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  display: block;
  margin-bottom: 4px;
}

.notes-value {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

.order-actions {
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
  margin-bottom: 24px;
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

.itens-table {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  color: white;
}

.table-row:last-child {
  border-bottom: none;
}

.transaction-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.total-value {
  font-size: 18px;
  font-weight: 700;
  color: #4caf50;
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
  .pedidos-container {
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

  .orders-grid {
    grid-template-columns: 1fr;
  }

  .order-summary {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .header-product,
  .cell-product {
    grid-row: 1;
  }

  .header-quantity,
  .cell-quantity {
    grid-row: 2;
  }

  .header-price,
  .cell-price {
    grid-row: 3;
  }

  .header-subtotal,
  .cell-subtotal {
    grid-row: 4;
  }
}
</style>
