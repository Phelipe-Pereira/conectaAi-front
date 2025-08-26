import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/sdk'
import { useSnackbar } from './useSnackbar'
import type { components } from '@/sdk/types'

type Notification = components['schemas']['Notification']
type CreateNotificationRequest = components['schemas']['CreateNotificationRequest']
type UpdateNotificationRequest = components['schemas']['UpdateNotificationRequest']

interface NotificationFilters {
  search?: string
  customer_id?: string
  status?: 'QUEUED' | 'SENT' | 'FAILED'
  channel?: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH'
  limit?: number
  starting_after?: string
}

export const useNotifications = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const currentNotification = ref<Notification | null>(null)
  const loading = ref(false)
  const totalItems = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(20)
  const filters = ref<NotificationFilters>({})

  const snackbar = useSnackbar()

  const hasMore = computed(() => {
    return notifications.value.length < totalItems.value
  })

  const queuedNotifications = computed(() => {
    return notifications.value.filter((notif) => notif.status === 'QUEUED')
  })

  const sentNotifications = computed(() => {
    return notifications.value.filter((notif) => notif.status === 'SENT')
  })

  const failedNotifications = computed(() => {
    return notifications.value.filter((notif) => notif.status === 'FAILED')
  })

  const canceledNotifications = computed(() => {
    return notifications.value.filter((notif) => notif.status === 'CANCELED')
  })

  const listNotifications = async (params?: NotificationFilters) => {
    loading.value = true
    try {
      const response = await apiClient.notifications.list(params)
      notifications.value = response.data.items || []
      totalItems.value = response.data.items?.length || 0
      return response.data
    } catch (error) {
      snackbar.error('Erro ao carregar notificações')
      throw error
    } finally {
      loading.value = false
    }
  }

  const getNotification = async (id: string) => {
    loading.value = true
    try {
      const response = await apiClient.notifications.get(id)
      currentNotification.value = response.data
      return response.data
    } catch (error) {
      snackbar.error('Erro ao carregar notificação')
      throw error
    } finally {
      loading.value = false
    }
  }

  const createNotification = async (data: CreateNotificationRequest) => {
    loading.value = true
    try {
      const response = await apiClient.notifications.create(data)
      notifications.value.unshift(response.data)
      totalItems.value += 1
      snackbar.success('Notificação criada com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao criar notificação')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateNotification = async (id: string, data: UpdateNotificationRequest) => {
    loading.value = true
    try {
      const response = await apiClient.notifications.update(id, data)

      // Atualizar na lista
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notifications.value[index] = response.data
      }

      // Atualizar notificação atual se for a mesma
      if (currentNotification.value?.id === id) {
        currentNotification.value = response.data
      }

      snackbar.success('Notificação atualizada com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao atualizar notificação')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteNotification = async (id: string) => {
    loading.value = true
    try {
      await apiClient.notifications.delete(id)

      // Remover da lista
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1)
        totalItems.value -= 1
      }

      // Limpar notificação atual se for a mesma
      if (currentNotification.value?.id === id) {
        currentNotification.value = null
      }

      snackbar.success('Notificação removida com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao remover notificação')
      throw error
    } finally {
      loading.value = false
    }
  }

  const searchNotifications = async (query: string) => {
    filters.value.search = query
    currentPage.value = 1
    await listNotifications(filters.value)
  }

  const filterByStatus = async (status: 'QUEUED' | 'SENT' | 'FAILED') => {
    filters.value.status = status
    currentPage.value = 1
    await listNotifications(filters.value)
  }

  const filterByChannel = async (channel: 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH') => {
    filters.value.channel = channel
    currentPage.value = 1
    await listNotifications(filters.value)
  }

  const filterByCustomer = async (customerId: string) => {
    filters.value.customer_id = customerId
    currentPage.value = 1
    await listNotifications(filters.value)
  }

  const loadMoreNotifications = async () => {
    if (!hasMore.value || loading.value) {return}

    const lastNotification = notifications.value[notifications.value.length - 1]
    if (lastNotification) {
      filters.value.starting_after = lastNotification.id
      const response = await apiClient.notifications.list(filters.value)
      notifications.value.push(...(response.data.items || []))
    }
  }

  const clearFilters = () => {
    filters.value = {}
    currentPage.value = 1
  }

  const resetStore = () => {
    notifications.value = []
    currentNotification.value = null
    totalItems.value = 0
    currentPage.value = 1
    filters.value = {}
  }

  // Utilitários para canais de notificação
  const getChannelDisplayName = (channel: string) => {
    const channelNames: Record<string, string> = {
      EMAIL: 'E-mail',
      SMS: 'SMS',
      WHATSAPP: 'WhatsApp',
      PUSH: 'Push Notification',
    }
    return channelNames[channel] || channel
  }

  const getChannelColor = (channel: string) => {
    const channelColors: Record<string, string> = {
      EMAIL: 'primary',
      SMS: 'success',
      WHATSAPP: 'success',
      PUSH: 'warning',
    }
    return channelColors[channel] || 'grey'
  }

  const getChannelIcon = (channel: string) => {
    const channelIcons: Record<string, string> = {
      EMAIL: 'mdi-email',
      SMS: 'mdi-message-text',
      WHATSAPP: 'mdi-whatsapp',
      PUSH: 'mdi-bell',
    }
    return channelIcons[channel] || 'mdi-bell'
  }

  const getStatusDisplayName = (status: string) => {
    const statusNames: Record<string, string> = {
      QUEUED: 'Na Fila',
      SENT: 'Enviada',
      FAILED: 'Falhou',
      CANCELED: 'Cancelada',
    }
    return statusNames[status] || status
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      QUEUED: 'warning',
      SENT: 'success',
      FAILED: 'error',
      CANCELED: 'grey',
    }
    return statusColors[status] || 'grey'
  }

  return {
    notifications,
    currentNotification,
    loading,
    totalItems,
    currentPage,
    itemsPerPage,
    filters,
    hasMore,
    queuedNotifications,
    sentNotifications,
    failedNotifications,
    canceledNotifications,
    listNotifications,
    getNotification,
    createNotification,
    updateNotification,
    deleteNotification,
    searchNotifications,
    filterByStatus,
    filterByChannel,
    filterByCustomer,
    loadMoreNotifications,
    clearFilters,
    resetStore,
    getChannelDisplayName,
    getChannelColor,
    getChannelIcon,
    getStatusDisplayName,
    getStatusColor,
  }
})
