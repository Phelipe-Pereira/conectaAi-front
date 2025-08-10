<script setup>
import { ref } from 'vue'

const webhooks = ref([
  {
    id: 'WH-001',
    gateway: 'Stripe',
    evento: 'payment_intent.succeeded',
    status: 'Processado',
    data: '2024-03-15 14:30:25',
    payload: {
      id: 'pi_3OqXYZ123456',
      amount: 129999,
      currency: 'brl',
      status: 'succeeded',
    },
    response: {
      status: 200,
      message: 'Webhook processado com sucesso',
    },
  },
  {
    id: 'WH-002',
    gateway: 'Asaas',
    evento: 'PAYMENT_RECEIVED',
    status: 'Processado',
    data: '2024-03-15 15:45:12',
    payload: {
      id: 'pay_123456789',
      value: 249999,
      status: 'RECEIVED',
      paymentDate: '2024-03-15',
    },
    response: {
      status: 200,
      message: 'Webhook processado com sucesso',
    },
  },
  {
    id: 'WH-003',
    gateway: 'MercadoPago',
    evento: 'payment.created',
    status: 'Erro',
    data: '2024-03-15 16:20:33',
    payload: {
      id: 123456789,
      status: 'pending',
      amount: 39999,
    },
    response: {
      status: 500,
      message: 'Erro ao processar webhook: Timeout',
    },
  },
  {
    id: 'WH-004',
    gateway: 'Stripe',
    evento: 'payment_intent.payment_failed',
    status: 'Pendente',
    data: '2024-03-15 17:15:08',
    payload: {
      id: 'pi_3OqXYZ789012',
      amount: 89999,
      status: 'requires_payment_method',
    },
    response: {
      status: null,
      message: 'Aguardando processamento',
    },
  },
])

const statusColors = {
  Processado: 'success',
  Pendente: 'warning',
  Erro: 'danger',
  Cancelado: 'secondary',
}

const selectedWebhook = ref(null)
const showWebhookDetails = ref(false)
const showPayloadModal = ref(false)

const formatarData = (data) => {
  return new Date(data).toLocaleString('pt-BR')
}

const abrirDetalhesWebhook = (webhook) => {
  selectedWebhook.value = webhook
  showWebhookDetails.value = true
}

const fecharDetalhesWebhook = () => {
  showWebhookDetails.value = false
  selectedWebhook.value = null
}

const visualizarPayload = (webhook) => {
  selectedWebhook.value = webhook
  showPayloadModal.value = true
}

const reprocessarWebhook = (webhook) => {
  webhook.status = 'Processando...'
  setTimeout(() => {
    webhook.status = 'Processado'
    webhook.response = {
      status: 200,
      message: 'Webhook reprocessado com sucesso',
    }
  }, 2000)
}

const filtrarPorStatus = (status) => {
  // Implementar filtro por status
  console.log('Filtrar por status:', status)
}

const filtrarPorGateway = (gateway) => {
  // Implementar filtro por gateway
  console.log('Filtrar por gateway:', gateway)
}
</script>

<template>
  <div class="webhooks-container">
    <div class="page-header">
      <h1>Configurações - Webhooks</h1>
      <p class="subtitle">Monitore os webhooks recebidos dos gateways de pagamento</p>
      <div class="header-actions">
        <button class="btn btn-secondary">
          <span>🔄</span>
          Atualizar
        </button>
        <button class="btn btn-primary">
          <span>📊</span>
          Relatórios
        </button>
      </div>
    </div>

    <div class="webhooks-content card">
      <div class="webhooks-header">
        <div class="search-bar">
          <input type="text" class="input" placeholder="Buscar webhook..." />
        </div>
        <div class="filtros">
          <select class="input" @change="filtrarPorStatus">
            <option value="">Status</option>
            <option>Processado</option>
            <option>Pendente</option>
            <option>Erro</option>
            <option>Cancelado</option>
          </select>
          <select class="input" @change="filtrarPorGateway">
            <option value="">Gateway</option>
            <option>Stripe</option>
            <option>Asaas</option>
            <option>MercadoPago</option>
          </select>
          <select class="input">
            <option value="">Ordenar por</option>
            <option>Data - Mais recente</option>
            <option>Data - Mais antigo</option>
            <option>Status</option>
            <option>Gateway</option>
          </select>
        </div>
      </div>

      <div class="webhooks-table">
        <div v-for="webhook in webhooks" :key="webhook.id" class="webhook-item">
          <div class="webhook-info">
            <div class="webhook-principal">
              <span class="webhook-id">{{ webhook.id }}</span>
              <span class="webhook-gateway">{{ webhook.gateway }}</span>
              <span class="webhook-evento">{{ webhook.evento }}</span>
            </div>
            <div class="webhook-detalhes">
              <span class="webhook-data">{{ formatarData(webhook.data) }}</span>
              <span :class="['webhook-status', `status-${statusColors[webhook.status]}`]">
                {{ webhook.status }}
              </span>
              <span class="webhook-response">
                {{ webhook.response?.status || 'N/A' }}
              </span>
            </div>
          </div>
          <div class="webhook-acoes">
            <button class="btn btn-secondary" @click="abrirDetalhesWebhook(webhook)">Ver</button>
            <button class="btn btn-secondary" @click="visualizarPayload(webhook)">Payload</button>
            <button
              v-if="webhook.status === 'Erro'"
              class="btn btn-warning"
              @click="reprocessarWebhook(webhook)"
            >
              Reprocessar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes do Webhook -->
    <div v-if="showWebhookDetails" class="modal-overlay" @click="showWebhookDetails = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Detalhes do Webhook {{ selectedWebhook.id }}</h2>
          <button @click="fecharDetalhesWebhook" class="btn btn-secondary">×</button>
        </div>

        <div class="modal-body">
          <div class="detalhe-grupo">
            <h3>Informações Gerais</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">ID:</span>
                <span class="value">{{ selectedWebhook.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">Gateway:</span>
                <span class="value">{{ selectedWebhook.gateway }}</span>
              </div>
              <div class="info-item">
                <span class="label">Evento:</span>
                <span class="value">{{ selectedWebhook.evento }}</span>
              </div>
              <div class="info-item">
                <span class="label">Data/Hora:</span>
                <span class="value">{{ formatarData(selectedWebhook.data) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Status:</span>
                <span :class="['webhook-status', `status-${statusColors[selectedWebhook.status]}`]">
                  {{ selectedWebhook.status }}
                </span>
              </div>
            </div>
          </div>

          <div class="detalhe-grupo">
            <h3>Resposta do Sistema</h3>
            <div class="response-info">
              <div class="info-item">
                <span class="label">Status HTTP:</span>
                <span class="value">{{ selectedWebhook.response?.status || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Mensagem:</span>
                <span class="value">{{ selectedWebhook.response?.message || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="detalhe-grupo">
            <h3>Payload Recebido</h3>
            <div class="payload-preview">
              <pre class="payload-json">{{ JSON.stringify(selectedWebhook.payload, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="fecharDetalhesWebhook">Fechar</button>
          <button
            v-if="selectedWebhook.status === 'Erro'"
            class="btn btn-warning"
            @click="reprocessarWebhook(selectedWebhook)"
          >
            Reprocessar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Visualizar Payload -->
    <div v-if="showPayloadModal" class="modal-overlay" @click="showPayloadModal = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Payload do Webhook {{ selectedWebhook.id }}</h2>
          <button @click="showPayloadModal = false" class="btn btn-secondary">×</button>
        </div>

        <div class="modal-body">
          <div class="payload-container">
            <div class="payload-header">
              <h3>Payload Completo</h3>
              <button
                class="btn btn-secondary"
                @click="
                  navigator.clipboard.writeText(JSON.stringify(selectedWebhook.payload, null, 2))
                "
              >
                Copiar
              </button>
            </div>
            <div class="payload-content">
              <pre class="payload-json">{{ JSON.stringify(selectedWebhook.payload, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showPayloadModal = false">Fechar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.webhooks-container {
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.page-header h1 {
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.page-header .subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-bottom: var(--spacing-lg);
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
}

.webhooks-content {
  padding: var(--spacing-lg);
}

.webhooks-header {
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

.webhooks-table {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.webhook-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
}

.webhook-info {
  flex: 1;
}

.webhook-principal {
  margin-bottom: var(--spacing-xs);
}

.webhook-id {
  font-weight: 600;
  margin-right: var(--spacing-md);
}

.webhook-gateway {
  color: var(--primary);
  margin-right: var(--spacing-md);
}

.webhook-evento {
  color: var(--text-secondary);
  font-family: monospace;
  font-size: 0.875rem;
}

.webhook-detalhes {
  display: flex;
  gap: var(--spacing-lg);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.webhook-status {
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

.webhook-acoes {
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

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
}

.info-item .label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.info-item .value {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 600;
}

.response-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
}

.payload-preview {
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
}

.payload-json {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--text-primary);
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.4;
}

.payload-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.payload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.payload-header h3 {
  color: var(--text-primary);
  font-size: 1rem;
  margin: 0;
}

.payload-content {
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
}

.btn-warning {
  background-color: var(--warning);
  color: white;
}

.btn-warning:hover {
  background-color: #d97706;
}

@media (max-width: 768px) {
  .webhooks-header {
    flex-direction: column;
    align-items: stretch;
  }

  .filtros {
    flex-direction: column;
  }

  .webhook-item {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .webhook-detalhes {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
