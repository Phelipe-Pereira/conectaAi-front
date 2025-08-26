<template>
  <div class="notifications-view">
    <!-- Header da página -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <v-icon size="32" color="primary" class="mr-3">mdi-bell</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">Notificações</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Gerencie notificações enviadas aos clientes
            </p>
          </div>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateDialog = true">
          Nova Notificação
        </v-btn>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-grid mb-6">
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-primary">{{ notificationsStore.totalItems }}</div>
          <div class="text-subtitle-2 text-medium-emphasis">Total de Notificações</div>
        </v-card-text>
      </v-card>
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-success">{{ notificationsStore.sentNotifications.length }}</div>
          <div class="text-subtitle-2 text-medium-emphasis">Enviadas</div>
        </v-card-text>
      </v-card>
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-warning">{{ notificationsStore.queuedNotifications.length }}</div>
          <div class="text-subtitle-2 text-medium-emphasis">Na Fila</div>
        </v-card-text>
      </v-card>
      <v-card>
        <v-card-text class="text-center">
          <div class="text-h4 font-weight-bold text-error">{{ notificationsStore.failedNotifications.length }}</div>
          <div class="text-subtitle-2 text-medium-emphasis">Falharam</div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Filtros -->
    <v-card class="mb-6">
      <v-card-text>
        <div class="d-flex flex-wrap gap-4 align-center">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="Buscar notificações..."
            variant="outlined"
            density="comfortable"
            style="min-width: 300px"
            @input="handleSearch"
            clearable
          />
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            label="Status"
            variant="outlined"
            density="comfortable"
            style="min-width: 200px"
            @update:model-value="handleStatusFilter"
            clearable
          />
          <v-select
            v-model="channelFilter"
            :items="channelOptions"
            label="Canal"
            variant="outlined"
            density="comfortable"
            style="min-width: 200px"
            @update:model-value="handleChannelFilter"
            clearable
          />
          <v-btn
            variant="outlined"
            prepend-icon="mdi-filter-remove"
            @click="clearFilters"
          >
            Limpar Filtros
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabela de notificações -->
    <v-card>
      <v-card-text>
        <AppDataTable
          :items="notificationsStore.notifications"
          :loading="notificationsStore.loading"
          :headers="headers"
          :search="searchQuery"
          :items-per-page="20"
          @load-more="notificationsStore.loadMoreNotifications"
          :has-more="notificationsStore.hasMore"
        >
          <template #item.channel="{ item }">
            <div class="d-flex align-center">
              <v-icon 
                size="small" 
                :color="notificationsStore.getChannelColor(item.channel as string)" 
                class="mr-2"
              >
                {{ notificationsStore.getChannelIcon(item.channel as string) }}
              </v-icon>
              <v-chip
                :color="notificationsStore.getChannelColor(item.channel as string)"
                size="small"
                variant="tonal"
              >
                {{ notificationsStore.getChannelDisplayName(item.channel as string) }}
              </v-chip>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              :color="notificationsStore.getStatusColor(item.status as string)"
              size="small"
              variant="tonal"
            >
              {{ notificationsStore.getStatusDisplayName(item.status as string) }}
            </v-chip>
          </template>

          <template #item.created_at="{ item }">
            {{ formatDate(item.created_at as string) }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-2">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                color="primary"
                @click="viewNotification(item)"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="warning"
                @click="editNotification(item)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteNotification(item)"
              />
            </div>
          </template>
        </AppDataTable>
      </v-card-text>
    </v-card>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="showCreateDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingNotification ? 'Editar Notificação' : 'Nova Notificação' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-select
              v-model="formData.customer_id"
              :items="customerOptions"
              label="Cliente"
              variant="outlined"
              :rules="[v => !!v || 'Cliente é obrigatório']"
              required
            />
            <v-select
              v-model="formData.channel"
              :items="channelOptions"
              label="Canal"
              variant="outlined"
              :rules="[v => !!v || 'Canal é obrigatório']"
              required
            />
            <v-text-field
              v-model="formData.subject"
              label="Assunto"
              variant="outlined"
              :rules="[v => !!v || 'Assunto é obrigatório']"
              required
            />
            <v-textarea
              v-model="formData.message"
              label="Mensagem"
              variant="outlined"
              :rules="[v => !!v || 'Mensagem é obrigatória']"
              required
              rows="4"
            />
            <v-text-field
              v-model="formData.send_at"
              label="Data de Envio (opcional)"
              variant="outlined"
              type="datetime-local"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancelar</v-btn>
          <v-btn
            color="primary"
            :loading="notificationsStore.loading"
            :disabled="!formValid"
            @click="saveNotification"
          >
            {{ editingNotification ? 'Atualizar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de visualização -->
    <v-dialog v-model="showViewDialog" max-width="800px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon size="24" color="primary" class="mr-2">mdi-bell</v-icon>
          Detalhes da Notificação
        </v-card-title>
        <v-card-text v-if="selectedNotification">
          <v-row>
            <v-col cols="12" md="6">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-identifier</v-icon>
                  </template>
                  <v-list-item-title>ID</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedNotification.id }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title>Cliente ID</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedNotification.customer_id }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon :color="notificationsStore.getChannelColor(selectedNotification.channel)">
                      {{ notificationsStore.getChannelIcon(selectedNotification.channel) }}
                    </v-icon>
                  </template>
                  <v-list-item-title>Canal</v-list-item-title>
                  <v-list-item-subtitle>{{ notificationsStore.getChannelDisplayName(selectedNotification.channel) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon :color="notificationsStore.getStatusColor(selectedNotification.status)">
                      mdi-circle
                    </v-icon>
                  </template>
                  <v-list-item-title>Status</v-list-item-title>
                  <v-list-item-subtitle>{{ notificationsStore.getStatusDisplayName(selectedNotification.status) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>Criado em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedNotification.created_at as string, true) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="selectedNotification.send_at">
                  <template #prepend>
                    <v-icon color="primary">mdi-clock</v-icon>
                  </template>
                  <v-list-item-title>Enviar em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedNotification.send_at as string, true) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="selectedNotification.delivered_at">
                  <template #prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Entregue em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(selectedNotification.delivered_at as string, true) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-h6">Conteúdo da Notificação</v-card-title>
                <v-card-text>
                  <div class="mb-4">
                    <strong>Assunto:</strong>
                    <p class="mt-1">{{ selectedNotification.subject || 'Sem assunto' }}</p>
                  </div>
                  <div>
                    <strong>Mensagem:</strong>
                    <p class="mt-1">{{ selectedNotification.message }}</p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showViewDialog = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmação de exclusão -->
    <AppConfirmDialog
      v-model="showDeleteDialog"
      title="Excluir Notificação"
      message="Tem certeza que deseja excluir esta notificação? Esta ação não pode ser desfeita."
      confirm-text="Excluir"
      confirm-color="error"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useNotifications } from '@/stores/useNotifications'
import { useCustomers } from '@/stores/useCustomers'
import { formatDate } from '@/utils/formatters'
import AppDataTable from '@/components/common/AppDataTable.vue'
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'

type NotificationChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH'

const notificationsStore = useNotifications()
const customersStore = useCustomers()

// Estados
const searchQuery = ref('')
const statusFilter = ref('')
const channelFilter = ref('')
const showCreateDialog = ref(false)
const showViewDialog = ref(false)
const showDeleteDialog = ref(false)
const formValid = ref(false)
const editingNotification = ref<any>(null)
const selectedNotification = ref<any>(null)
const notificationToDelete = ref<any>(null)

// Formulário
const formData = reactive({
  customer_id: '',
  channel: '' as NotificationChannel,
  subject: '',
  message: '',
  send_at: ''
})

// Headers da tabela
const headers = [
  { title: 'Canal', key: 'channel', sortable: false, text: 'Canal', value: 'channel' },
  { title: 'Assunto', key: 'subject', sortable: false, text: 'Assunto', value: 'subject' },
  { title: 'Status', key: 'status', sortable: true, text: 'Status', value: 'status' },
  { title: 'Criado em', key: 'created_at', sortable: true, text: 'Criado em', value: 'created_at' },
  { title: 'Ações', key: 'actions', sortable: false, text: 'Ações', value: 'actions', width: '120px' }
]

// Opções de filtro
const statusOptions = [
  { title: 'Na Fila', value: 'QUEUED' },
  { title: 'Enviada', value: 'SENT' },
  { title: 'Falhou', value: 'FAILED' },
  { title: 'Cancelada', value: 'CANCELED' }
]

const channelOptions = [
  { title: 'E-mail', value: 'EMAIL' },
  { title: 'SMS', value: 'SMS' },
  { title: 'WhatsApp', value: 'WHATSAPP' },
  { title: 'Push Notification', value: 'PUSH' }
]

const customerOptions = ref<Array<{ title: string; value: string }>>([])

// Métodos
const handleSearch = () => {
  notificationsStore.searchNotifications(searchQuery.value || '')
}

const handleStatusFilter = (value: string) => {
  if (value && value !== 'CANCELED') {
    notificationsStore.filterByStatus(value as 'QUEUED' | 'SENT' | 'FAILED')
  } else {
    notificationsStore.listNotifications()
  }
}

const handleChannelFilter = (value: string) => {
  if (value) {
    notificationsStore.filterByChannel(value as NotificationChannel)
  } else {
    notificationsStore.listNotifications()
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  channelFilter.value = ''
  notificationsStore.clearFilters()
  notificationsStore.listNotifications()
}

const viewNotification = (notification: any) => {
  selectedNotification.value = notification
  showViewDialog.value = true
}

const editNotification = (notification: any) => {
  editingNotification.value = notification
  formData.customer_id = notification.customer_id
  formData.channel = notification.channel
  formData.subject = notification.subject || ''
  formData.message = notification.message
  formData.send_at = notification.send_at ? new Date(notification.send_at).toISOString().slice(0, 16) : ''
  showCreateDialog.value = true
}

const deleteNotification = (notification: any) => {
  notificationToDelete.value = notification
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (notificationToDelete.value) {
    await notificationsStore.deleteNotification(notificationToDelete.value.id)
    notificationToDelete.value = null
  }
}

const saveNotification = async () => {
  const data = {
    ...formData,
    send_at: formData.send_at ? new Date(formData.send_at).toISOString() : undefined
  }

  if (editingNotification.value) {
    await notificationsStore.updateNotification(editingNotification.value.id, data)
  } else {
    await notificationsStore.createNotification(data)
  }
  
  showCreateDialog.value = false
  resetForm()
}

const resetForm = () => {
  editingNotification.value = null
  formData.customer_id = ''
  formData.channel = '' as NotificationChannel
  formData.subject = ''
  formData.message = ''
  formData.send_at = ''
}

const loadCustomers = async () => {
  await customersStore.listCustomers()
  customerOptions.value = customersStore.customers.map(customer => ({
    title: `${customer.name} (${customer.email})`,
    value: customer.id
  }))
}

// Carregar dados iniciais
onMounted(async () => {
  await Promise.all([
    notificationsStore.listNotifications(),
    loadCustomers()
  ])
})
</script>

<style scoped>
.notifications-view {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.gap-4 {
  gap: 16px;
}

.gap-2 {
  gap: 8px;
}
</style>
