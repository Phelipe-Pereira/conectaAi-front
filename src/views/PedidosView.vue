<script setup>
import { ref } from 'vue'

const pedidos = ref([
  {
    id: '12345',
    cliente: 'João Silva',
    data: '2024-03-15',
    status: 'Enviado',
    valor: 1299.99,
    itens: [
      { produto: 'Smartphone', quantidade: 1, preco: 999.99 },
      { produto: 'Capa protetora', quantidade: 1, preco: 49.99 },
      { produto: 'Película de vidro', quantidade: 1, preco: 29.99 },
    ],
  },
  {
    id: '12346',
    cliente: 'Maria Santos',
    data: '2024-03-14',
    status: 'Em processamento',
    valor: 2499.99,
    itens: [{ produto: 'Smart TV', quantidade: 1, preco: 2499.99 }],
  },
  {
    id: '12347',
    cliente: 'Pedro Oliveira',
    data: '2024-03-14',
    status: 'Aguardando pagamento',
    valor: 399.99,
    itens: [{ produto: 'Fones de ouvido', quantidade: 1, preco: 399.99 }],
  },
])

const statusColors = {
  Enviado: 'success',
  'Em processamento': 'warning',
  'Aguardando pagamento': 'info',
  Cancelado: 'danger',
}

const selectedPedido = ref(null)
const showPedidoDetails = ref(false)

const formatarData = (data) => {
  return new Date(data).toLocaleDateString('pt-BR')
}

const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const abrirDetalhesPedido = (pedido) => {
  selectedPedido.value = pedido
  showPedidoDetails.value = true
}

const fecharDetalhesPedido = () => {
  showPedidoDetails.value = false
  selectedPedido.value = null
}
</script>

<template>
  <div class="pedidos-container">
    <div class="page-header">
      <h1>Gerenciador de pedidos</h1>
    </div>

    <div class="pedidos-list card">
      <div class="pedidos-header">
        <div class="search-bar">
          <input type="text" class="input" placeholder="Buscar pedido..." />
        </div>
        <div class="filtros">
          <select class="input">
            <option value="">Status</option>
            <option>Enviado</option>
            <option>Em processamento</option>
            <option>Aguardando pagamento</option>
            <option>Cancelado</option>
          </select>
          <select class="input">
            <option value="">Ordenar por</option>
            <option>Data - Mais recente</option>
            <option>Data - Mais antigo</option>
            <option>Valor - Maior</option>
            <option>Valor - Menor</option>
          </select>
        </div>
      </div>

      <div class="pedidos-table">
        <div v-for="pedido in pedidos" :key="pedido.id" class="pedido-item">
          <div class="pedido-info">
            <div class="pedido-principal">
              <span class="pedido-id">Pedido #{{ pedido.id }}</span>
              <span class="pedido-cliente">{{ pedido.cliente }}</span>
            </div>
            <div class="pedido-detalhes">
              <span class="pedido-data">{{ formatarData(pedido.data) }}</span>
              <span :class="['pedido-status', `status-${statusColors[pedido.status]}`]">
                {{ pedido.status }}
              </span>
              <span class="pedido-valor">{{ formatarMoeda(pedido.valor) }}</span>
            </div>
          </div>
          <div class="pedido-acoes">
            <button class="btn btn-secondary" @click="abrirDetalhesPedido(pedido)">Ver</button>
            <button class="btn btn-primary">Editar</button>
            <button class="btn btn-danger">Excluir</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showPedidoDetails" class="modal-overlay" @click="showPedidoDetails = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Detalhes do Pedido #{{ selectedPedido.id }}</h2>
          <button @click="fecharDetalhesPedido" class="btn-close">×</button>
        </div>

        <div class="modal-body">
          <div class="detalhe-grupo">
            <h3>Informações do Cliente</h3>
            <p><strong>Nome:</strong> {{ selectedPedido.cliente }}</p>
            <p><strong>Data do Pedido:</strong> {{ formatarData(selectedPedido.data) }}</p>
            <p>
              <strong>Status:</strong>
              <span :class="['pedido-status', `status-${statusColors[selectedPedido.status]}`]">
                {{ selectedPedido.status }}
              </span>
            </p>
          </div>

          <div class="detalhe-grupo">
            <h3>Itens do Pedido</h3>
            <div class="itens-table">
              <div class="item-header">
                <span>Produto</span>
                <span>Quantidade</span>
                <span>Preço</span>
                <span>Total</span>
              </div>
              <div v-for="item in selectedPedido.itens" :key="item.produto" class="item-row">
                <span>{{ item.produto }}</span>
                <span>{{ item.quantidade }}</span>
                <span>{{ formatarMoeda(item.preco) }}</span>
                <span>{{ formatarMoeda(item.quantidade * item.preco) }}</span>
              </div>
            </div>
          </div>

          <div class="detalhe-grupo">
            <div class="pedido-total">
              <span>Total do Pedido:</span>
              <span class="total-valor">{{ formatarMoeda(selectedPedido.valor) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="fecharDetalhesPedido">Fechar</button>
          <button class="btn btn-primary">Atualizar Status</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pedidos-container {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.page-header h1 {
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 600;
}

.pedidos-list {
  padding: var(--spacing-lg);
}

.pedidos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-lg);
}

.search-bar {
  flex: 1;
  max-width: 400px;
}

.filtros {
  display: flex;
  gap: var(--spacing-md);
}

.filtros select {
  min-width: 150px;
}

.pedidos-table {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.pedido-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
}

.pedido-info {
  flex: 1;
}

.pedido-principal {
  margin-bottom: var(--spacing-xs);
}

.pedido-id {
  font-weight: 600;
  margin-right: var(--spacing-md);
}

.pedido-cliente {
  color: var(--text-secondary);
}

.pedido-detalhes {
  display: flex;
  gap: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.pedido-status {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-success {
  background-color: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.status-warning {
  background-color: rgba(234, 179, 8, 0.2);
  color: var(--warning);
}

.status-info {
  background-color: rgba(14, 165, 233, 0.2);
  color: var(--info);
}

.status-danger {
  background-color: rgba(239, 68, 68, 0.2);
  color: var(--error);
}

.pedido-acoes {
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
  max-width: 800px;
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

.detalhe-grupo {
  margin-bottom: var(--spacing-xl);
}

.detalhe-grupo h3 {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
}

.detalhe-grupo p {
  margin: var(--spacing-sm) 0;
  color: var(--text-primary);
  line-height: 1.5;
}

.itens-table {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
}

.item-header,
.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  align-items: center;
}

.item-header {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--spacing-sm);
}

.item-row {
  color: var(--text-primary);
  font-size: 0.875rem;
}

.pedido-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-md);
}

.total-valor {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary);
}
</style>
