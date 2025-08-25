import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/sdk'
import { useSnackbar } from './useSnackbar'
import type { components } from '@/sdk/types'

type WebhookEndpoint = components['schemas']['WebhookEndpoint']
type CreateWebhookEndpointRequest = components['schemas']['CreateWebhookEndpointRequest']
type UpdateWebhookEndpointRequest = components['schemas']['UpdateWebhookEndpointRequest']

interface WebhookFilters {
  search?: string
  enabled?: boolean
  limit?: number
  starting_after?: string
}

export const useWebhooks = defineStore('webhooks', () => {
  const webhooks = ref<WebhookEndpoint[]>([])
  const currentWebhook = ref<WebhookEndpoint | null>(null)
  const loading = ref(false)
  const totalItems = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(20)
  const filters = ref<WebhookFilters>({})

  const snackbar = useSnackbar()

  const hasMore = computed(() => {
    return webhooks.value.length < totalItems.value
  })

  const enabledWebhooks = computed(() => {
    return webhooks.value.filter((webhook) => (webhook.enabled_events?.length ?? 0) > 0)
  })

  const disabledWebhooks = computed(() => {
    return webhooks.value.filter((webhook) => !webhook.enabled_events?.length)
  })

  const totalEvents = computed(() => {
    return webhooks.value.reduce((sum, webhook) => {
      return sum + (webhook.enabled_events?.length ?? 0)
    }, 0)
  })

  const listWebhooks = async () => {
    loading.value = true
    try {
      const response = await apiClient.webhooks.list()
      webhooks.value = response.data.items || []
      totalItems.value = response.data.items?.length || 0
      return response.data
    } catch (error) {
      snackbar.error('Erro ao carregar webhooks')
      throw error
    } finally {
      loading.value = false
    }
  }

  const getWebhook = async (id: string) => {
    loading.value = true
    try {
      const response = await apiClient.webhooks.get(id)
      currentWebhook.value = response.data
      return response.data
    } catch (error) {
      snackbar.error('Erro ao carregar webhook')
      throw error
    } finally {
      loading.value = false
    }
  }

  const createWebhook = async (data: CreateWebhookEndpointRequest) => {
    loading.value = true
    try {
      const response = await apiClient.webhooks.create(data)
      webhooks.value.unshift(response.data)
      totalItems.value += 1
      snackbar.success('Webhook criado com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao criar webhook')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateWebhook = async (id: string, data: UpdateWebhookEndpointRequest) => {
    loading.value = true
    try {
      const response = await apiClient.webhooks.update(id, data)

      // Atualizar na lista
      const index = webhooks.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        webhooks.value[index] = response.data
      }

      // Atualizar webhook atual se for o mesmo
      if (currentWebhook.value?.id === id) {
        currentWebhook.value = response.data
      }

      snackbar.success('Webhook atualizado com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao atualizar webhook')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteWebhook = async (id: string) => {
    loading.value = true
    try {
      await apiClient.webhooks.delete(id)

      // Remover da lista
      const index = webhooks.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        webhooks.value.splice(index, 1)
        totalItems.value -= 1
      }

      // Limpar webhook atual se for o mesmo
      if (currentWebhook.value?.id === id) {
        currentWebhook.value = null
      }

      snackbar.success('Webhook removido com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao remover webhook')
      throw error
    } finally {
      loading.value = false
    }
  }

  const searchWebhooks = async (query: string) => {
    filters.value.search = query
    currentPage.value = 1
    await listWebhooks()
  }

  const filterByStatus = async (enabled: boolean) => {
    filters.value.enabled = enabled
    currentPage.value = 1
    await listWebhooks()
  }

  const loadMoreWebhooks = async () => {
    if (!hasMore.value || loading.value) return

    const lastWebhook = webhooks.value[webhooks.value.length - 1]
    if (lastWebhook) {
      filters.value.starting_after = lastWebhook.id
      const response = await apiClient.webhooks.list()
      webhooks.value.push(...(response.data.items || []))
    }
  }

  const clearFilters = () => {
    filters.value = {}
    currentPage.value = 1
  }

  const resetStore = () => {
    webhooks.value = []
    currentWebhook.value = null
    totalItems.value = 0
    currentPage.value = 1
    filters.value = {}
  }

  // Utilitários para eventos de webhook
  const getEventDisplayName = (event: string) => {
    const eventNames: Record<string, string> = {
      'charge.created': 'Cobrança Criada',
      'charge.updated': 'Cobrança Atualizada',
      'charge.paid': 'Cobrança Paga',
      'charge.refunded': 'Cobrança Reembolsada',
      'charge.canceled': 'Cobrança Cancelada',
      'subscription.created': 'Assinatura Criada',
      'subscription.updated': 'Assinatura Atualizada',
      'subscription.canceled': 'Assinatura Cancelada',
      'customer.created': 'Cliente Criado',
      'customer.updated': 'Cliente Atualizado',
    }
    return eventNames[event] || event
  }

  const getEventColor = (event: string) => {
    const eventColors: Record<string, string> = {
      'charge.created': 'info',
      'charge.updated': 'warning',
      'charge.paid': 'success',
      'charge.refunded': 'primary',
      'charge.canceled': 'error',
      'subscription.created': 'info',
      'subscription.updated': 'warning',
      'subscription.canceled': 'error',
      'customer.created': 'success',
      'customer.updated': 'warning',
    }
    return eventColors[event] || 'grey'
  }

  return {
    webhooks,
    currentWebhook,
    loading,
    totalItems,
    currentPage,
    itemsPerPage,
    filters,
    hasMore,
    enabledWebhooks,
    disabledWebhooks,
    totalEvents,
    listWebhooks,
    getWebhook,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    searchWebhooks,
    filterByStatus,
    loadMoreWebhooks,
    clearFilters,
    resetStore,
    getEventDisplayName,
    getEventColor,
  }
})
