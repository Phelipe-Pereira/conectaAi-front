<script setup>
import { ref, computed } from 'vue'

const webhooks = ref([
  {
    id: 1,
    nome: 'Asaas - Pagamento Aprovado',
    url: 'https://api.conectaai.com/webhooks/asaas/payment-approved',
    gateway: 'Asaas',
    evento: 'payment.approved',
    status: 'Ativo',
    ultimaExecucao: '2024-03-15 14:30:25',
    sucessos: 1250,
    falhas: 3,
    tempoMedio: 245,
    ultimoPayload: {
      id: 'pay_123456789',
      status: 'APPROVED',
      value: 150.0,
      customer: 'João Silva',
      date: '2024-03-15T14:30:25Z',
    },
  },
  {
    id: 2,
    nome: 'Stripe - Transação Concluída',
    url: 'https://api.conectaai.com/webhooks/stripe/payment-success',
    gateway: 'Stripe',
    evento: 'payment_intent.succeeded',
    status: 'Ativo',
    ultimaExecucao: '2024-03-15 15:45:12',
    sucessos: 890,
    falhas: 1,
    tempoMedio: 189,
    ultimoPayload: {
      id: 'pi_987654321',
      status: 'succeeded',
      amount: 29900,
      currency: 'brl',
      customer: 'Maria Santos',
      created: 1647354312,
    },
  },
  {
    id: 3,
    nome: 'MercadoPago - Pagamento Processado',
    url: 'https://api.conectaai.com/webhooks/mercadopago/payment-processed',
    gateway: 'MercadoPago',
    evento: 'payment.created',
    status: 'Inativo',
    ultimaExecucao: '2024-03-10 09:15:30',
    sucessos: 0,
    falhas: 0,
    tempoMedio: 0,
    ultimoPayload: null,
  },
  {
    id: 4,
    nome: 'PayPal - Reembolso Processado',
    url: 'https://api.conectaai.com/webhooks/paypal/refund-processed',
    gateway: 'PayPal',
    evento: 'PAYMENT.CAPTURE.REFUNDED',
    status: 'Configurando',
    ultimaExecucao: 'Nunca',
    sucessos: 0,
    falhas: 0,
    tempoMedio: 0,
    ultimoPayload: null,
  },
])

const showModal = ref(false)
const showPayloadModal = ref(false)
const editingWebhook = ref(null)
const selectedPayload = ref(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const selectedGateway = ref('Todos')

const novoWebhook = ref({
  nome: '',
  url: '',
  gateway: 'Asaas',
  evento: '',
  status: 'Inativo',
})

const statusOptions = ref(['Todos', 'Ativo', 'Inativo', 'Configurando'])
const gatewayOptions = ref(['Todos', 'Asaas', 'Stripe', 'MercadoPago', 'PayPal'])

const webhooksFiltrados = computed(() => {
  let filtered = webhooks.value

  if (searchTerm.value) {
    filtered = filtered.filter(
      (webhook) =>
        webhook.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        webhook.gateway.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        webhook.evento.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((webhook) => webhook.status === selectedStatus.value)
  }

  if (selectedGateway.value !== 'Todos') {
    filtered = filtered.filter((webhook) => webhook.gateway === selectedGateway.value)
  }

  return filtered
})

const estatisticas = computed(() => {
  const total = webhooks.value.length
  const ativos = webhooks.value.filter((w) => w.status === 'Ativo').length
  const inativos = webhooks.value.filter((w) => w.status === 'Inativo').length
  const totalSucessos = webhooks.value.reduce((sum, w) => sum + w.sucessos, 0)
  const totalFalhas = webhooks.value.reduce((sum, w) => sum + w.falhas, 0)
  const tempoMedio =
    webhooks.value.filter((w) => w.tempoMedio > 0).reduce((sum, w) => sum + w.tempoMedio, 0) /
    webhooks.value.filter((w) => w.tempoMedio > 0).length

  return {
    total,
    ativos,
    inativos,
    totalSucessos,
    totalFalhas,
    tempoMedio: Math.round(tempoMedio) || 0,
  }
})

const openModal = (webhook) => {
  editingWebhook.value = webhook
  if (webhook) {
    novoWebhook.value = {
      nome: webhook.nome,
      url: webhook.url,
      gateway: webhook.gateway,
      evento: webhook.evento,
      status: webhook.status,
    }
  } else {
    novoWebhook.value = {
      nome: '',
      url: '',
      gateway: 'Asaas',
      evento: '',
      status: 'Inativo',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingWebhook.value = null
}

const openPayloadModal = (payload) => {
  selectedPayload.value = payload
  showPayloadModal.value = true
}

const closePayloadModal = () => {
  showPayloadModal.value = false
  selectedPayload.value = null
}

const saveWebhook = () => {
  if (editingWebhook.value) {
    const index = webhooks.value.findIndex((w) => w.id === editingWebhook.value.id)
    webhooks.value[index] = {
      ...novoWebhook.value,
      id: editingWebhook.value.id,
      ultimaExecucao: editingWebhook.value.ultimaExecucao,
      sucessos: editingWebhook.value.sucessos,
      falhas: editingWebhook.value.falhas,
      tempoMedio: editingWebhook.value.tempoMedio,
      ultimoPayload: editingWebhook.value.ultimoPayload,
    }
  } else {
    const newId = Math.max(...webhooks.value.map((w) => w.id)) + 1
    webhooks.value.push({
      ...novoWebhook.value,
      id: newId,
      ultimaExecucao: 'Nunca',
      sucessos: 0,
      falhas: 0,
      tempoMedio: 0,
      ultimoPayload: null,
    })
  }
  closeModal()
}

const deleteWebhook = (id) => {
  webhooks.value = webhooks.value.filter((w) => w.id !== id)
}

const toggleStatus = (webhook) => {
  if (webhook.status === 'Ativo') {
    webhook.status = 'Inativo'
  } else if (webhook.status === 'Inativo') {
    webhook.status = 'Ativo'
  }
}

const testWebhook = (webhook) => {
  webhook.ultimaExecucao = new Date().toLocaleString('pt-BR')
  webhook.sucessos += 1
  webhook.tempoMedio = Math.floor(Math.random() * 500) + 100
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

const formatarTempo = (ms) => {
  if (ms === 0) return 'N/A'
  return `${ms}ms`
}

const getTaxaSucesso = (sucessos, falhas) => {
  const total = sucessos + falhas
  if (total === 0) return '0%'
  return `${Math.round((sucessos / total) * 100)}%`
}
</script>

<template>
  <div class="webhooks-container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔗</div>
        <div class="stat-content">
          <h3>Total de Webhooks</h3>
          <div class="stat-value">{{ estatisticas.total }}</div>
          <div class="stat-subtitle">Configurados</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Webhooks Ativos</h3>
          <div class="stat-value">{{ estatisticas.ativos }}</div>
          <div class="stat-subtitle">Operacionais</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Execuções Bem-sucedidas</h3>
          <div class="stat-value">{{ estatisticas.totalSucessos.toLocaleString('pt-BR') }}</div>
          <div class="stat-subtitle">Total de sucessos</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <h3>Tempo Médio de Resposta</h3>
          <div class="stat-value">{{ formatarTempo(estatisticas.tempoMedio) }}</div>
          <div class="stat-subtitle">Performance</div>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar webhooks..."
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

        <button @click="openModal()" class="btn-primary">
          <span>➕</span>
          Adicionar Webhook
        </button>
      </div>
    </div>

    <div class="webhooks-grid">
      <div v-for="webhook in webhooksFiltrados" :key="webhook.id" class="webhook-card">
        <div class="webhook-header">
          <div class="webhook-info">
            <h3 class="webhook-name">{{ webhook.nome }}</h3>
            <span class="webhook-gateway">{{ webhook.gateway }}</span>
          </div>
          <div class="webhook-actions">
            <button @click="testWebhook(webhook)" class="btn-test">🧪</button>
            <button @click="openModal(webhook)" class="btn-edit">✏️</button>
            <button @click="deleteWebhook(webhook.id)" class="btn-delete">🗑️</button>
          </div>
        </div>

        <div class="webhook-status">
          <span
            class="status-badge"
            :style="{
              color: getStatusColor(webhook.status),
              backgroundColor: getStatusBgColor(webhook.status),
            }"
          >
            {{ webhook.status }}
          </span>
          <button @click="toggleStatus(webhook)" class="btn-toggle">
            {{ webhook.status === 'Ativo' ? 'Desativar' : 'Ativar' }}
          </button>
        </div>

        <div class="webhook-details">
          <div class="detail-row">
            <span class="detail-label">URL:</span>
            <span class="detail-value">{{ webhook.url }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Evento:</span>
            <span class="detail-value">{{ webhook.evento }}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Última Execução:</span>
            <span class="detail-value">{{ formatarData(webhook.ultimaExecucao) }}</span>
          </div>
        </div>

        <div class="webhook-stats">
          <div class="stat-item">
            <span class="stat-label">Sucessos:</span>
            <span class="stat-value success">{{ webhook.sucessos.toLocaleString('pt-BR') }}</span>
          </div>

          <div class="stat-item">
            <span class="stat-label">Falhas:</span>
            <span class="stat-value error">{{ webhook.falhas.toLocaleString('pt-BR') }}</span>
          </div>

          <div class="stat-item">
            <span class="stat-label">Taxa de Sucesso:</span>
            <span class="stat-value">{{ getTaxaSucesso(webhook.sucessos, webhook.falhas) }}</span>
          </div>

          <div class="stat-item">
            <span class="stat-label">Tempo Médio:</span>
            <span class="stat-value">{{ formatarTempo(webhook.tempoMedio) }}</span>
          </div>
        </div>

        <div class="webhook-payload" v-if="webhook.ultimoPayload">
          <div class="payload-header">
            <span class="payload-label">Último Payload:</span>
            <button @click="openPayloadModal(webhook.ultimoPayload)" class="btn-view-payload">
              Ver Detalhes
            </button>
          </div>
          <div class="payload-preview">
            <pre>{{ JSON.stringify(webhook.ultimoPayload, null, 2).substring(0, 100) }}...</pre>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingWebhook ? 'Editar Webhook' : 'Adicionar Webhook' }}</h2>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome do Webhook *</label>
              <input v-model="novoWebhook.nome" type="text" required />
            </div>

            <div class="form-group">
              <label>Gateway *</label>
              <select v-model="novoWebhook.gateway" required>
                <option value="Asaas">Asaas</option>
                <option value="Stripe">Stripe</option>
                <option value="MercadoPago">MercadoPago</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>

            <div class="form-group">
              <label>Evento *</label>
              <input
                v-model="novoWebhook.evento"
                type="text"
                required
                placeholder="Ex: payment.approved"
              />
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="novoWebhook.status">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Configurando">Configurando</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>URL do Webhook *</label>
              <input
                v-model="novoWebhook.url"
                type="url"
                required
                placeholder="https://api.conectaai.com/webhooks/..."
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Cancelar</button>
          <button @click="saveWebhook" class="btn-primary">Salvar</button>
        </div>
      </div>
    </div>

    <div v-if="showPayloadModal" class="modal-overlay" @click="closePayloadModal">
      <div class="modal-content payload-modal" @click.stop>
        <div class="modal-header">
          <h2>Detalhes do Payload</h2>
          <button @click="closePayloadModal" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="payload-content">
            <pre class="payload-json">{{ JSON.stringify(selectedPayload, null, 2) }}</pre>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closePayloadModal" class="btn-secondary">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.webhooks-container {
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

.webhooks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 24px;
}

.webhook-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.webhook-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 122, 255, 0.3);
}

.webhook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.webhook-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.webhook-name {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.webhook-gateway {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  width: fit-content;
}

.webhook-actions {
  display: flex;
  gap: 8px;
}

.btn-test,
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

.btn-test {
  background: #ff9800;
  color: white;
}

.btn-edit {
  background: #007aff;
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-test:hover,
.btn-edit:hover,
.btn-delete:hover {
  transform: scale(1.1);
}

.webhook-status {
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

.webhook-details {
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

.webhook-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
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

.stat-value.success {
  color: #4caf50;
}

.stat-value.error {
  color: #f44336;
}

.webhook-payload {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
}

.payload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.payload-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}

.btn-view-payload {
  padding: 4px 12px;
  background: rgba(0, 122, 255, 0.2);
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: 6px;
  color: #007aff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view-payload:hover {
  background: rgba(0, 122, 255, 0.3);
  border-color: rgba(0, 122, 255, 0.5);
}

.payload-preview {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 12px;
  max-height: 80px;
  overflow: hidden;
}

.payload-preview pre {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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

.payload-modal {
  max-width: 800px;
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

.payload-content {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.payload-json {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.5;
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
  .webhooks-container {
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

  .webhooks-grid {
    grid-template-columns: 1fr;
  }

  .webhook-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .webhook-status {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .webhook-stats {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
