<script setup>
import { ref } from 'vue'

const gateways = ref([
  {
    id: 1,
    name: 'Asaas',
    status: 'Conectado',
    lastSync: '2024-03-15 14:30',
    active: true,
    apiKey: 'asaas_******',
    webhookUrl: 'https://api.middleware.com/webhooks/asaas',
  },
  {
    id: 2,
    name: 'Stripe',
    status: 'Conectado',
    lastSync: '2024-03-15 15:45',
    active: true,
    apiKey: 'sk_test_******',
    webhookUrl: 'https://api.middleware.com/webhooks/stripe',
  },
  {
    id: 3,
    name: 'MercadoPago',
    status: 'Desconectado',
    lastSync: '-',
    active: false,
    apiKey: 'TEST-******',
    webhookUrl: 'https://api.middleware.com/webhooks/mercadopago',
  },
])

const showNewGatewayForm = ref(false)
const selectedGateway = ref(null)
const showEditForm = ref(false)

const novoGateway = ref({
  name: '',
  apiKey: '',
  webhookUrl: '',
  active: true,
})

const cadastrarGateway = () => {
  const gateway = {
    ...novoGateway.value,
    id: Date.now(),
    status: 'Desconectado',
    lastSync: '-',
  }
  gateways.value.push(gateway)
  showNewGatewayForm.value = false
  novoGateway.value = {
    name: '',
    apiKey: '',
    webhookUrl: '',
    active: true,
  }
}

const editarGateway = (gateway) => {
  selectedGateway.value = { ...gateway }
  showEditForm.value = true
}

const excluirGateway = (id) => {
  gateways.value = gateways.value.filter((g) => g.id !== id)
}

const salvarEdicao = () => {
  if (selectedGateway.value) {
    const index = gateways.value.findIndex((g) => g.id === selectedGateway.value.id)
    if (index !== -1) {
      gateways.value[index] = { ...selectedGateway.value }
    }
    showEditForm.value = false
    selectedGateway.value = null
  }
}

const testarConexao = (gateway) => {
  // Simular teste de conexão
  gateway.status = 'Testando...'
  setTimeout(() => {
    gateway.status = 'Conectado'
    gateway.lastSync = new Date().toLocaleString('pt-BR')
  }, 2000)
}
</script>

<template>
  <div class="gateways-container">
    <div class="page-header">
      <h1>Configurações - Gateways</h1>
      <p class="subtitle">Gerencie os gateways de pagamento integrados ao ConectaAI</p>
      <button class="btn btn-primary" @click="showNewGatewayForm = true">Adicionar Gateway</button>
    </div>

    <div class="gateways-content card">
      <div class="gateways-header">
        <div class="search-bar">
          <input type="text" class="input" placeholder="Buscar gateway..." />
        </div>
        <div class="filtros">
          <select class="input">
            <option value="">Status</option>
            <option>Conectado</option>
            <option>Desconectado</option>
            <option>Testando</option>
          </select>
        </div>
      </div>

      <div class="gateways-grid">
        <div v-for="gateway in gateways" :key="gateway.id" class="gateway-card card">
          <div class="gateway-header">
            <h3>{{ gateway.name }}</h3>
            <span
              class="status-badge"
              :class="['status-badge', gateway.active ? 'connected' : 'disconnected']"
            >
              {{ gateway.status }}
            </span>
          </div>

          <div class="gateway-info">
            <div class="info-item">
              <span class="label">API Key:</span>
              <span class="value">{{ gateway.apiKey }}</span>
            </div>
            <div class="info-item">
              <span class="label">Webhook URL:</span>
              <span class="value">{{ gateway.webhookUrl }}</span>
            </div>
            <div class="info-item">
              <span class="label">Última Sincronização:</span>
              <span class="value">{{ gateway.lastSync }}</span>
            </div>
          </div>

          <div class="gateway-actions">
            <button class="btn btn-secondary" @click="testarConexao(gateway)">
              Testar Conexão
            </button>
            <button class="btn btn-secondary" @click="editarGateway(gateway)">Editar</button>
            <button class="btn btn-danger" @click="excluirGateway(gateway.id)">Excluir</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Novo Gateway -->
    <div v-if="showNewGatewayForm" class="modal-overlay" @click="showNewGatewayForm = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>Novo Gateway</h2>
          <button @click="showNewGatewayForm = false" class="btn btn-secondary">×</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome do Gateway</label>
              <input v-model="novoGateway.name" type="text" class="input" />
            </div>
            <div class="form-group">
              <label>API Key</label>
              <input v-model="novoGateway.apiKey" type="password" class="input" />
            </div>
            <div class="form-group">
              <label>Webhook URL</label>
              <input v-model="novoGateway.webhookUrl" type="url" class="input" />
            </div>
          </div>
          <div class="form-actions">
            <button @click="cadastrarGateway" class="btn btn-primary">Cadastrar</button>
            <button @click="showNewGatewayForm = false" class="btn btn-secondary">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar Gateway -->
    <div v-if="showEditForm" class="modal-overlay">
      <div class="modal-content card">
        <div class="modal-header">
          <h2>Editar Gateway</h2>
          <button class="close-btn" @click="showEditForm = false">&times;</button>
        </div>

        <form @submit.prevent="salvarEdicao" class="gateway-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome do Gateway</label>
              <input v-model="selectedGateway.name" type="text" class="input" required />
            </div>

            <div class="form-group">
              <label>API Key</label>
              <input v-model="selectedGateway.apiKey" type="password" class="input" required />
            </div>

            <div class="form-group">
              <label>Webhook URL</label>
              <input v-model="selectedGateway.webhookUrl" type="url" class="input" required />
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
.gateways-container {
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

.gateways-content {
  padding: var(--spacing-lg);
}

.gateways-header {
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

.gateways-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-lg);
}

.gateway-card {
  padding: var(--spacing-lg);
}

.gateway-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.gateway-header h3 {
  color: var(--text-primary);
  font-size: 1.25rem;
  margin: 0;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.connected {
  background-color: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.status-badge.disconnected {
  background-color: rgba(239, 68, 68, 0.2);
  color: var(--error);
}

.gateway-info {
  margin-bottom: var(--spacing-lg);
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.info-item .label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.info-item .value {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-family: monospace;
}

.gateway-actions {
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

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: var(--bg-tertiary);
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
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

@media (max-width: 768px) {
  .gateways-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .gateways-header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
