import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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

// Dados iniciais (somente em memória)
const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: 'whk_prod_01',
    url: 'https://conectaai.meusistema.com/webhooks/asaas',
    enabled_events: [
      'charge.created',
      'charge.paid',
      'subscription.created',
      'subscription.canceled',
    ],
    created_at: '2025-11-18T18:30:00-03:00',
    updated_at: '2025-11-18T18:35:00-03:00',
    provider: 'ASAAS' as any,
  } as WebhookEndpoint,
  {
    id: 'whk_hml_01',
    url: 'https://hml.conectaai.meusistema.com/webhooks/asaas',
    enabled_events: ['charge.created', 'charge.updated', 'customer.created'],
    created_at: '2025-11-17T09:15:00-03:00',
    updated_at: '2025-11-17T09:20:00-03:00',
    provider: 'ASAAS' as any,
  } as WebhookEndpoint,
  {
    id: 'whk_dev_01',
    url: 'http://localhost:8080/webhooks/asaas',
    enabled_events: ['charge.created'],
    created_at: '2025-11-16T14:00:00-03:00',
    updated_at: '2025-11-16T14:05:00-03:00',
    provider: 'ASAAS' as any,
  } as WebhookEndpoint,
]

export const useWebhooks = defineStore('webhooks', () => {
  // fonte de verdade em memória
  const allWebhooks = ref<WebhookEndpoint[]>([...INITIAL_WEBHOOKS])

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
    return allWebhooks.value.filter((webhook) => (webhook.enabled_events?.length ?? 0) > 0)
  })

  const disabledWebhooks = computed(() => {
    return allWebhooks.value.filter((webhook) => !webhook.enabled_events?.length)
  })

  const totalEvents = computed(() => {
    return allWebhooks.value.reduce((sum, webhook) => {
      return sum + (webhook.enabled_events?.length ?? 0)
    }, 0)
  })

  const applyFilters = () => {
    let result = [...allWebhooks.value]

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter((w) => w.url?.toLowerCase().includes(search))
    }

    if (typeof filters.value.enabled === 'boolean') {
      if (filters.value.enabled) {
        result = result.filter((w) => (w.enabled_events?.length ?? 0) > 0)
      } else {
        result = result.filter((w) => !w.enabled_events?.length)
      }
    }

    webhooks.value = result
    totalItems.value = result.length
  }

  const fakeDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

  const listWebhooks = async () => {
    loading.value = true
    try {
      await fakeDelay()
      applyFilters()
      return { items: webhooks.value, total: totalItems.value }
    } finally {
      loading.value = false
    }
  }

  const getWebhook = async (id: string) => {
    loading.value = true
    try {
      await fakeDelay()
      const found = allWebhooks.value.find((w) => w.id === id) || null
      currentWebhook.value = found
      if (!found) {
        snackbar.error('Webhook não encontrado')
      }
      return found
    } finally {
      loading.value = false
    }
  }

  const createWebhook = async (data: CreateWebhookEndpointRequest) => {
    loading.value = true
    try {
      await fakeDelay()

      const now = new Date().toISOString()
      const newWebhook: WebhookEndpoint = {
        id: `whk_${Date.now()}`,
        url: data.url,
        enabled_events: (data.enabled_events as any) ?? [],
        created_at: now,
        updated_at: now,
        provider: 'ASAAS' as any,
      } as WebhookEndpoint

      allWebhooks.value.unshift(newWebhook)
      applyFilters()

      snackbar.success('Webhook criado com sucesso!')
      return newWebhook
    } finally {
      loading.value = false
    }
  }

  const updateWebhook = async (id: string, data: UpdateWebhookEndpointRequest) => {
    loading.value = true
    try {
      await fakeDelay()

      const index = allWebhooks.value.findIndex((w) => w.id === id)
      if (index === -1) {
        snackbar.error('Webhook não encontrado')
        return null
      }

      const updated: WebhookEndpoint = {
        ...allWebhooks.value[index],
        url: data.url ?? allWebhooks.value[index].url,
        enabled_events: (data.enabled_events as any) ?? allWebhooks.value[index].enabled_events,
        updated_at: new Date().toISOString(),
      } as WebhookEndpoint

      allWebhooks.value[index] = updated

      // atualiza lista filtrada
      applyFilters()

      if (currentWebhook.value?.id === id) {
        currentWebhook.value = updated
      }

      snackbar.success('Webhook atualizado com sucesso!')
      return updated
    } finally {
      loading.value = false
    }
  }

  const deleteWebhook = async (id: string) => {
    loading.value = true
    try {
      await fakeDelay()

      const index = allWebhooks.value.findIndex((w) => w.id === id)
      if (index === -1) {
        snackbar.error('Webhook não encontrado')
        return
      }

      allWebhooks.value.splice(index, 1)
      applyFilters()

      if (currentWebhook.value?.id === id) {
        currentWebhook.value = null
      }

      snackbar.success('Webhook removido com sucesso!')
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
    // pra demo não precisa de paginação; mantém apenas a assinatura
    return
  }

  const clearFilters = () => {
    filters.value = {}
    currentPage.value = 1
    applyFilters()
  }

  const resetStore = () => {
    allWebhooks.value = [...INITIAL_WEBHOOKS]
    filters.value = {}
    currentPage.value = 1
    applyFilters()
    currentWebhook.value = null
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

  // Inicializa lista com dados locais
  applyFilters()

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
