import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/sdk'
import { useSnackbar } from './useSnackbar'
import type { components } from '@/sdk/types'

type Subscription = components['schemas']['Subscription']
type CreateSubscriptionRequest = components['schemas']['CreateSubscriptionRequest']
type UpdateSubscriptionRequest = components['schemas']['UpdateSubscriptionRequest']

interface SubscriptionFilters {
  search?: string
  customer_id?: string
  status?: 'ACTIVE' | 'PAUSED' | 'CANCELED'
  limit?: number
  starting_after?: string
}

export const useSubscriptions = defineStore('subscriptions', () => {
  const subscriptions = ref<Subscription[]>([])
  const currentSubscription = ref<Subscription | null>(null)
  const loading = ref(false)
  const totalItems = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(20)
  const filters = ref<SubscriptionFilters>({})

  const snackbar = useSnackbar()

  const hasMore = computed(() => {
    return subscriptions.value.length < totalItems.value
  })

  const activeSubscriptions = computed(() => {
    return subscriptions.value.filter((sub) => sub.status === 'ACTIVE')
  })

  const pausedSubscriptions = computed(() => {
    return subscriptions.value.filter((sub) => sub.status === 'PAUSED')
  })

  const canceledSubscriptions = computed(() => {
    return subscriptions.value.filter((sub) => sub.status === 'CANCELED')
  })

  const totalRevenue = computed(() => {
    return subscriptions.value.reduce((sum, sub) => {
      return sum + (sub.amount || 0)
    }, 0)
  })

  const listSubscriptions = async (params?: SubscriptionFilters) => {
    loading.value = true
    try {
      const response = await apiClient.subscriptions.list(params)
      subscriptions.value = response.data.items || []
      totalItems.value = response.data.items?.length || 0
      return response.data
    } catch (error) {
      snackbar.error('Erro ao carregar assinaturas')
      throw error
    } finally {
      loading.value = false
    }
  }

  const getSubscription = async (id: string) => {
    loading.value = true
    try {
      const response = await apiClient.subscriptions.get(id)
      currentSubscription.value = response.data
      return response.data
    } catch (error) {
      snackbar.error('Erro ao carregar assinatura')
      throw error
    } finally {
      loading.value = false
    }
  }

  const createSubscription = async (data: CreateSubscriptionRequest) => {
    loading.value = true
    try {
      const response = await apiClient.subscriptions.create(data)
      subscriptions.value.unshift(response.data)
      totalItems.value += 1
      snackbar.success('Assinatura criada com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao criar assinatura')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateSubscription = async (id: string, data: UpdateSubscriptionRequest) => {
    loading.value = true
    try {
      const response = await apiClient.subscriptions.update(id, data)

      // Atualizar na lista
      const index = subscriptions.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = response.data
      }

      // Atualizar assinatura atual se for a mesma
      if (currentSubscription.value?.id === id) {
        currentSubscription.value = response.data
      }

      snackbar.success('Assinatura atualizada com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao atualizar assinatura')
      throw error
    } finally {
      loading.value = false
    }
  }

  const cancelSubscription = async (id: string) => {
    loading.value = true
    try {
      await apiClient.subscriptions.cancel(id)

      // Atualizar na lista
      const index = subscriptions.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        subscriptions.value[index].status = 'CANCELED'
      }

      // Atualizar assinatura atual se for a mesma
      if (currentSubscription.value?.id === id) {
        currentSubscription.value.status = 'CANCELED'
      }

      snackbar.success('Assinatura cancelada com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao cancelar assinatura')
      throw error
    } finally {
      loading.value = false
    }
  }

  const pauseSubscription = async (id: string) => {
    loading.value = true
    try {
      const response = await apiClient.subscriptions.pause(id)

      // Atualizar na lista
      const index = subscriptions.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = response.data
      }

      // Atualizar assinatura atual se for a mesma
      if (currentSubscription.value?.id === id) {
        currentSubscription.value = response.data
      }

      snackbar.success('Assinatura pausada com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao pausar assinatura')
      throw error
    } finally {
      loading.value = false
    }
  }

  const resumeSubscription = async (id: string) => {
    loading.value = true
    try {
      const response = await apiClient.subscriptions.resume(id)

      // Atualizar na lista
      const index = subscriptions.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        subscriptions.value[index] = response.data
      }

      // Atualizar assinatura atual se for a mesma
      if (currentSubscription.value?.id === id) {
        currentSubscription.value = response.data
      }

      snackbar.success('Assinatura retomada com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao retomar assinatura')
      throw error
    } finally {
      loading.value = false
    }
  }

  const searchSubscriptions = async (query: string) => {
    filters.value.search = query
    currentPage.value = 1
    await listSubscriptions(filters.value)
  }

  const filterByStatus = async (status: 'ACTIVE' | 'PAUSED' | 'CANCELED') => {
    filters.value.status = status
    currentPage.value = 1
    await listSubscriptions(filters.value)
  }

  const filterByCustomer = async (customerId: string) => {
    filters.value.customer_id = customerId
    currentPage.value = 1
    await listSubscriptions(filters.value)
  }

  const loadMoreSubscriptions = async () => {
    if (!hasMore.value || loading.value) return

    const lastSubscription = subscriptions.value[subscriptions.value.length - 1]
    if (lastSubscription) {
      filters.value.starting_after = lastSubscription.id
      const response = await apiClient.subscriptions.list(filters.value)
      subscriptions.value.push(...(response.data.items || []))
    }
  }

  const clearFilters = () => {
    filters.value = {}
    currentPage.value = 1
  }

  const resetStore = () => {
    subscriptions.value = []
    currentSubscription.value = null
    totalItems.value = 0
    currentPage.value = 1
    filters.value = {}
  }

  return {
    subscriptions,
    currentSubscription,
    loading,
    totalItems,
    currentPage,
    itemsPerPage,
    filters,
    hasMore,
    activeSubscriptions,
    pausedSubscriptions,
    canceledSubscriptions,
    totalRevenue,
    listSubscriptions,
    getSubscription,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    searchSubscriptions,
    filterByStatus,
    filterByCustomer,
    loadMoreSubscriptions,
    clearFilters,
    resetStore,
  }
})
