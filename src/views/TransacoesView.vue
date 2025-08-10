<script setup>
import { ref } from 'vue'

const transacoes = ref([
  {
    id: 'PAY-001',
    cliente: 'João Silva',
    data: '2024-03-15 14:30',
    status: 'Aprovado',
    valor: 1299.99,
    gateway: 'Stripe',
    metodo: 'Cartão de Crédito',
    itens: [
      { produto: 'Smartphone', quantidade: 1, preco: 999.99 },
      { produto: 'Capa protetora', quantidade: 1, preco: 49.99 },
      { produto: 'Película de vidro', quantidade: 1, preco: 29.99 },
    ],
  },
  {
    id: 'PAY-002',
    cliente: 'Maria Santos',
    data: '2024-03-15 15:45',
    status: 'Pendente',
    valor: 2499.99,
    gateway: 'Asaas',
    metodo: 'PIX',
    itens: [{ produto: 'Smart TV', quantidade: 1, preco: 2499.99 }],
  },
  {
    id: 'PAY-003',
    cliente: 'Pedro Oliveira',
    data: '2024-03-15 16:20',
    status: 'Rejeitado',
    valor: 399.99,
    gateway: 'MercadoPago',
    metodo: 'Boleto',
    itens: [{ produto: 'Fones de ouvido', quantidade: 1, preco: 399.99 }],
  },
])

const statusColors = {
  Aprovado: 'success',
  Pendente: 'warning',
  Rejeitado: 'danger',
  Cancelado: 'secondary',
}

const selectedTransacao = ref(null)
const showTransacaoDetails = ref(false)

const formatarData = (data) => {
  return new Date(data).toLocaleDateString('pt-BR')
}

const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const abrirDetalhesTransacao = (transacao) => {
  selectedTransacao.value = transacao
  showTransacaoDetails.value = true
}

const fecharDetalhesTransacao = () => {
  showTransacaoDetails.value = false
  selectedTransacao.value = null
}

const reembolsarTransacao = (transacao) => {
  transacao.status = 'Reembolsado'
  console.log('Transação reembolsada:', transacao.id)
}

const cancelarTransacao = (transacao) => {
  transacao.status = 'Cancelado'
  console.log('Transação cancelada:', transacao.id)
}
</script>

<template>
  <div class="transacoes-container">
    <div class="page-header">
      <h1>Gerenciar Transações</h1>
    </div>

    <div class="transacoes-list card">
      <div class="transacoes-header">
        <div class="search-bar">
          <input type="text" class="input" placeholder="Buscar transação..." />
        </div>
        <div class="filtros">
          <select class="input">
            <option value="">Status</option>
            <option>Aprovado</option>
            <option>Pendente</option>
            <option>Rejeitado</option>
            <option>Cancelado</option>
          </select>
          <select class="input">
            <option value="">Gateway</option>
            <option>Stripe</option>
            <option>Asaas</option>
            <option>MercadoPago</option>
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

      <div class="transacoes-table">
        <div v-for="transacao in transacoes" :key="transacao.id" class="transacao-item">
          <div class="transacao-info">
            <div class="transacao-principal">
              <span class="transacao-id">{{ transacao.id }}</span>
              <span class="transacao-cliente">{{ transacao.cliente }}</span>
            </div>
            <div class="transacao-detalhes">
              <span class="transacao-data">{{ formatarData(transacao.data) }}</span>
              <span :class="['transacao-status', `status-${statusColors[transacao.status]}`]">
                {{ transacao.status }}
              </span>
              <span class="transacao-valor">{{ formatarMoeda(transacao.valor) }}</span>
              <span class="transacao-gateway">{{ transacao.gateway }}</span>
              <span class="transacao-metodo">{{ transacao.metodo }}</span>
            </div>
          </div>
          <div class="transacao-acoes">
            <button class="btn btn-secondary" @click="abrirDetalhesTransacao(transacao)">
              Ver
            </button>
            <button
              v-if="transacao.status === 'Aprovado'"
              class="btn btn-warning"
              @click="reembolsarTransacao(transacao)"
            >
              Reembolsar
            </button>
            <button
              v-if="transacao.status === 'Pendente'"
              class="btn btn-danger"
              @click="cancelarTransacao(transacao)"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes da Transação -->
    <div v-if="showTransacaoDetails" class="modal-overlay" @click="showTransacaoDetails = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Detalhes da Transação {{ selectedTransacao.id }}</h2>
          <button @click="fecharDetalhesTransacao" class="btn btn-secondary">×</button>
        </div>

        <div class="modal-body">
          <div class="detalhe-grupo">
            <h3>Informações do Cliente</h3>
            <p><strong>Nome:</strong> {{ selectedTransacao.cliente }}</p>
            <p><strong>Data da Transação:</strong> {{ formatarData(selectedTransacao.data) }}</p>
            <p>
              <strong>Status:</strong>
              <span
                :class="['transacao-status', `status-${statusColors[selectedTransacao.status]}`]"
              >
                {{ selectedTransacao.status }}
              </span>
            </p>
            <p><strong>Gateway:</strong> {{ selectedTransacao.gateway }}</p>
            <p><strong>Método de Pagamento:</strong> {{ selectedTransacao.metodo }}</p>
          </div>

          <div class="detalhe-grupo">
            <h3>Itens da Transação</h3>
            <div class="itens-table">
              <div class="item-header">
                <span>Produto</span>
                <span>Quantidade</span>
                <span>Preço</span>
                <span>Total</span>
              </div>
              <div v-for="item in selectedTransacao.itens" :key="item.produto" class="item-row">
                <span>{{ item.produto }}</span>
                <span>{{ item.quantidade }}</span>
                <span>{{ formatarMoeda(item.preco) }}</span>
                <span>{{ formatarMoeda(item.quantidade * item.preco) }}</span>
              </div>
            </div>
          </div>

          <div class="detalhe-grupo">
            <div class="transacao-total">
              <span>Total da Transação:</span>
              <span class="total-valor">{{ formatarMoeda(selectedTransacao.valor) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="fecharDetalhesTransacao">Fechar</button>
          <button
            v-if="selectedTransacao.status === 'Aprovado'"
            class="btn btn-warning"
            @click="reembolsarTransacao(selectedTransacao)"
          >
            Reembolsar
          </button>
          <button
            v-if="selectedTransacao.status === 'Pendente'"
            class="btn btn-danger"
            @click="cancelarTransacao(selectedTransacao)"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transacoes-container {
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

.transacoes-list {
  padding: var(--spacing-lg);
}

.transacoes-header {
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

.transacoes-table {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.transacao-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
}

.transacao-info {
  flex: 1;
}

.transacao-principal {
  margin-bottom: var(--spacing-xs);
}

.transacao-id {
  font-weight: 600;
  margin-right: var(--spacing-md);
}

.transacao-cliente {
  color: var(--text-secondary);
}

.transacao-detalhes {
  display: flex;
  gap: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.transacao-status {
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

.status-danger {
  background-color: rgba(239, 68, 68, 0.2);
  color: var(--error);
}

.status-secondary {
  background-color: rgba(107, 114, 128, 0.2);
  color: var(--text-secondary);
}

.transacao-acoes {
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

.modal-body {
  padding: var(--spacing-lg);
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

.transacao-total {
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

.btn-warning {
  background-color: var(--warning);
  color: white;
}

.btn-warning:hover {
  background-color: #d97706;
}

@media (max-width: 768px) {
  .transacoes-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filtros {
    flex-direction: column;
  }

  .transacao-item {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .transacao-detalhes {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
