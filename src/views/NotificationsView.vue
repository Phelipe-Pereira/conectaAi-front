<template>
  <div class="notifications-container">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">
            <v-icon size="32" class="mr-3">mdi-bell</v-icon>
            Notificações
          </h1>
          <p class="page-subtitle">
            Gerencie notificações manuais e histórico de envios
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="showCreateDialog = true"
          class="create-btn"
        >
          Nova Notificação
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="primary">mdi-bell</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ notifications.length }}</div>
          <div class="stat-label">Total de Notificações</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="success">mdi-check-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ sentNotifications }}</div>
          <div class="stat-label">Enviadas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="warning">mdi-clock</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ pendingNotifications }}</div>
          <div class="stat-label">Pendentes</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          <v-icon size="24" color="error">mdi-close-circle</v-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ failedNotifications }}</div>
          <div class="stat-label">Falharam</div>
        </div>
      </div>
    </div>

    <!-- Filtros e busca -->
    <div class="filters-section">
      <div class="filters-content">
        <v-text-field
          v-model="searchTerm"
          prepend-inner-icon="mdi-magnify"
          placeholder="Buscar notificações..."
          variant="outlined"
          density="compact"
          hide-details
          class="search-field"
        />

        <v-select
          v-model="selectedStatus"
          :items="statusOptions"
          placeholder="Status"
          variant="outlined"
          density="compact"
          hide-details
          class="status-filter"
        />

        <v-select
          v-model="selectedType"
          :items="typeOptions"
          placeholder="Tipo"
          variant="outlined"
          density="compact"
          hide-details
          class="type-filter"
        />

        <v-btn
          variant="outlined"
          prepend-icon="mdi-filter-remove"
          @click="clearFilters"
          class="clear-filters-btn"
        >
          Limpar Filtros
        </v-btn>
      </div>
    </div>

    <!-- Tabela de notificações -->
    <div class="table-section">
      <v-data-table
        :headers="headers"
        :items="filteredNotifications"
        :loading="loading"
        :items-per-page="20"
        class="notifications-table"
        hover
      >
        <template #item.id="{ item }">
          <div class="id-cell">
            <span class="font-mono">{{ item.id }}</span>
          </div>
        </template>

        <template #item.type="{ item }">
          <div class="type-cell">
            <v-chip
              :color="getTypeColor(item.type)"
              size="small"
              variant="tonal"
            >
              <v-icon size="14" class="mr-1">
                {{ getTypeIcon(item.type) }}
              </v-icon>
              {{ getTypeText(item.type) }}
            </v-chip>
          </div>
        </template>

        <template #item.subject="{ item }">
          <div class="subject-cell">
            <div class="notification-subject">{{ item.subject }}</div>
            <div class="notification-preview">{{ item.message }}</div>
          </div>
        </template>

        <template #item.recipient="{ item }">
          <div class="recipient-cell">
            <v-icon size="16" color="primary" class="mr-2">mdi-account</v-icon>
            <span>{{ item.recipient }}</span>
          </div>
        </template>

        <template #item.status="{ item }">
          <div class="status-cell">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              <v-icon size="14" class="mr-1">
                {{ getStatusIcon(item.status) }}
              </v-icon>
              {{ getStatusText(item.status) }}
            </v-chip>
          </div>
        </template>

        <template #item.created_at="{ item }">
          <div class="date-cell">
            {{ formatDate(item.created_at) }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="actions-cell">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="primary"
              @click="viewNotification(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="warning"
              @click="editNotification(item)"
              class="action-btn"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteNotification(item)"
              class="action-btn"
            />
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="700px">
      <v-card class="notification-dialog">
        <v-card-title class="dialog-title">
          <v-icon size="24" class="mr-2">mdi-bell-plus</v-icon>
          {{ editingNotification ? 'Editar Notificação' : 'Nova Notificação' }}
        </v-card-title>

        <v-card-text class="dialog-content">
          <v-form ref="form" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novaNotificacao.type"
                  :items="typeOptions.filter(t => t !== 'Todos')"
                  label="Tipo"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaNotificacao.recipient"
                  label="Destinatário"
                  placeholder="email@exemplo.com"
                  variant="outlined"
                  :rules="[rules.required, rules.email]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="novaNotificacao.subject"
                  label="Assunto"
                  placeholder="Assunto da notificação"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="novaNotificacao.message"
                  label="Mensagem"
                  placeholder="Conteúdo da notificação"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                  rows="4"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="novaNotificacao.priority"
                  :items="['LOW', 'NORMAL', 'HIGH', 'URGENT']"
                  label="Prioridade"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="novaNotificacao.scheduled_at"
                  label="Agendar para"
                  type="datetime-local"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="outlined" @click="cancelForm" class="cancel-btn">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            @click="saveNotification"
            :loading="loading"
            :disabled="!formValid"
            class="save-btn"
          >
            {{ editingNotification ? 'Atualizar' : 'Enviar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de visualização -->
    <v-dialog v-model="showViewDialog" max-width="700px">
      <v-card class="view-dialog">
        <v-card-title class="dialog-title">
          <v-icon size="24" class="mr-2">mdi-eye</v-icon>
          Detalhes da Notificação
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showViewDialog = false"
            class="close-btn"
          />
        </v-card-title>

        <v-card-text class="dialog-content">
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-label">ID</div>
              <div class="detail-value font-mono">{{ selectedNotification?.id }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Tipo</div>
              <div class="detail-value">{{ getTypeText(selectedNotification?.type) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Destinatário</div>
              <div class="detail-value">{{ selectedNotification?.recipient }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Prioridade</div>
              <div class="detail-value">{{ getPriorityText(selectedNotification?.priority) }}</div>
            </div>
            <div class="detail-item full-width">
              <div class="detail-label">Assunto</div>
              <div class="detail-value">{{ selectedNotification?.subject }}</div>
            </div>
            <div class="detail-item full-width">
              <div class="detail-label">Mensagem</div>
              <div class="detail-value">{{ selectedNotification?.message }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">{{ getStatusText(selectedNotification?.status) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Criada em</div>
              <div class="detail-value">{{ formatDate(selectedNotification?.created_at) }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Enviada em</div>
              <div class="detail-value">{{ selectedNotification?.sent_at ? formatDate(selectedNotification.sent_at) : 'Não enviada' }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSnackbar } from '@/stores/useSnackbar'
import { formatDate } from '@/utils/formatters'
import { validateEmail } from '@/utils/validators'

const snackbar = useSnackbar()

// Estado
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const editingNotification = ref<any>(null)
const selectedNotification = ref<any>(null)
const searchTerm = ref('')
const selectedStatus = ref('Todos')
const selectedType = ref('Todos')
const loading = ref(false)
const formValid = ref(false)

const novaNotificacao = ref({
  type: 'EMAIL',
  recipient: '',
  subject: '',
  message: '',
  priority: 'NORMAL',
  scheduled_at: '',
})

const statusOptions = ['Todos', 'PENDING', 'SENT', 'FAILED', 'CANCELED']
const typeOptions = ['Todos', 'EMAIL', 'SMS', 'PUSH', 'WEBHOOK']

const rules = {
  required: (value: any) => !!value || 'Campo obrigatório',
  email: (value: string) => validateEmail(value) || 'E-mail inválido',
}

// Headers da tabela
const headers = [
  { title: 'ID', key: 'id', sortable: true },
  { title: 'Tipo', key: 'type', sortable: true },
  { title: 'Notificação', key: 'subject', sortable: true },
  { title: 'Destinatário', key: 'recipient', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Criada em', key: 'created_at', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false },
]

// Dados mockados para teste
const notifications = ref([
  {
    id: 'notif_001',
    type: 'EMAIL',
    recipient: 'cliente@exemplo.com',
    subject: 'Cobrança confirmada',
    message: 'Sua cobrança foi processada com sucesso. Obrigado!',
    priority: 'NORMAL',
    status: 'SENT',
    created_at: '2024-01-15T10:30:00Z',
    sent_at: '2024-01-15T10:31:00Z',
  },
  {
    id: 'notif_002',
    type: 'SMS',
    recipient: '+5511999999999',
    subject: 'Lembrete de pagamento',
    message: 'Lembrete: sua fatura vence em 3 dias.',
    priority: 'HIGH',
    status: 'PENDING',
    created_at: '2024-01-14T14:20:00Z',
    sent_at: null,
  },
  {
    id: 'notif_003',
    type: 'PUSH',
    recipient: 'user_device_token',
    subject: 'Nova assinatura',
    message: 'Sua assinatura foi ativada com sucesso!',
    priority: 'NORMAL',
    status: 'FAILED',
    created_at: '2024-01-13T09:15:00Z',
    sent_at: null,
  },
])

// Computed
const filteredNotifications = computed(() => {
  let filtered = notifications.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    filtered = filtered.filter(
      (notification) =>
        notification.subject.toLowerCase().includes(search) ||
        notification.message.toLowerCase().includes(search) ||
        notification.recipient.toLowerCase().includes(search)
    )
  }

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((notification) => notification.status === selectedStatus.value)
  }

  if (selectedType.value !== 'Todos') {
    filtered = filtered.filter((notification) => notification.type === selectedType.value)
  }

  return filtered
})

const sentNotifications = computed(() => notifications.value.filter(n => n.status === 'SENT').length)
const pendingNotifications = computed(() => notifications.value.filter(n => n.status === 'PENDING').length)
const failedNotifications = computed(() => notifications.value.filter(n => n.status === 'FAILED').length)

// Métodos
const clearFilters = () => {
  searchTerm.value = ''
  selectedStatus.value = 'Todos'
  selectedType.value = 'Todos'
}

const viewNotification = (notification: any) => {
  selectedNotification.value = notification
  showViewDialog.value = true
}

const editNotification = (notification: any) => {
  editingNotification.value = notification
  novaNotificacao.value = { ...notification }
  showCreateDialog.value = true
}

const deleteNotification = async (notification: any) => {
  if (confirm('Tem certeza que deseja excluir esta notificação?')) {
    loading.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const index = notifications.value.findIndex((n) => n.id === notification.id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
        snackbar.success('Notificação excluída com sucesso!')
      }
    } catch (error) {
      snackbar.error('Erro ao excluir notificação')
    } finally {
      loading.value = false
    }
  }
}

const saveNotification = async () => {
  if (!formValid.value) {
    snackbar.error('Por favor, preencha todos os campos obrigatórios corretamente.')
    return
  }

  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (editingNotification.value) {
      // Editar
      const index = notifications.value.findIndex((n) => n.id === editingNotification.value.id)
      if (index !== -1) {
        notifications.value[index] = {
          ...editingNotification.value,
          ...novaNotificacao.value,
        }
      }
      snackbar.success('Notificação atualizada com sucesso!')
    } else {
      // Criar
      const newNotification = {
        id: `notif_${Date.now()}`,
        ...novaNotificacao.value,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        sent_at: null,
      }
      notifications.value.unshift(newNotification)
      snackbar.success('Notificação criada com sucesso!')
    }

    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    snackbar.error('Erro ao salvar notificação')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingNotification.value = null
  novaNotificacao.value = {
    type: 'EMAIL',
    recipient: '',
    subject: '',
    message: '',
    priority: 'NORMAL',
    scheduled_at: '',
  }
  formValid.value = false
}

const cancelForm = () => {
  showCreateDialog.value = false
  resetForm()
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    SENT: 'success',
    FAILED: 'error',
    CANCELED: 'grey',
  }
  return colors[status] || 'grey'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    PENDING: 'Pendente',
    SENT: 'Enviada',
    FAILED: 'Falhou',
    CANCELED: 'Cancelada',
  }
  return texts[status] || status
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    PENDING: 'mdi-clock',
    SENT: 'mdi-check-circle',
    FAILED: 'mdi-close-circle',
    CANCELED: 'mdi-cancel',
  }
  return icons[status] || 'mdi-help-circle'
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    EMAIL: 'primary',
    SMS: 'success',
    PUSH: 'warning',
    WEBHOOK: 'info',
  }
  return colors[type] || 'grey'
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    EMAIL: 'E-mail',
    SMS: 'SMS',
    PUSH: 'Push',
    WEBHOOK: 'Webhook',
  }
  return texts[type] || type
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    EMAIL: 'mdi-email',
    SMS: 'mdi-message-text',
    PUSH: 'mdi-bell',
    WEBHOOK: 'mdi-webhook',
  }
  return icons[type] || 'mdi-help-circle'
}

const getPriorityText = (priority: string) => {
  const texts: Record<string, string> = {
    LOW: 'Baixa',
    NORMAL: 'Normal',
    HIGH: 'Alta',
    URGENT: 'Urgente',
  }
  return texts[priority] || priority
}

// Lifecycle
onMounted(() => {
  // Carregar dados se necessário
})
</script>

<style scoped>
.notifications-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-info {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.create-btn {
  background: linear-gradient(135deg, #007aff 0%, #0055b3 100%);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
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
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.filters-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
}

.filters-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-field {
  flex: 1;
  max-width: 300px;
}

.status-filter,
.type-filter {
  max-width: 200px;
}

.clear-filters-btn {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.table-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.notifications-table {
  background: transparent;
}

.id-cell {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.type-cell,
.status-cell {
  display: flex;
  align-items: center;
}

.subject-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-subject {
  font-weight: 600;
  color: white;
}

.notification-preview {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.recipient-cell {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.date-cell {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.notification-dialog,
.view-dialog {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-title {
  background: linear-gradient(135deg, #007aff 0%, #0055b3 100%);
  color: white;
  display: flex;
  align-items: center;
}

.dialog-content {
  padding: 24px;
}

.dialog-actions {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.05);
}

.cancel-btn {
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.8);
}

.save-btn {
  background: linear-gradient(135deg, #007aff 0%, #0055b3 100%);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.detail-value {
  font-size: 16px;
  color: white;
  font-weight: 600;
}

/* Responsividade */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-content {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field,
  .status-filter,
  .type-filter {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .page-header {
    padding: 16px;
  }

  .table-section {
    padding: 12px;
  }
}
</style>
