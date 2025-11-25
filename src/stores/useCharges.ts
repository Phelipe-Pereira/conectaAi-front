import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/sdk'
import { useSnackbar } from './useSnackbar'
import type { components } from '@/sdk/types'

type Charge = components['schemas']['Charge']
type CreateChargeRequest = components['schemas']['CreateChargeRequest']

interface ChargeFilters {
  search?: string
  status?:
    | 'PENDING'
    | 'REQUIRES_ACTION'
    | 'AUTHORIZED'
    | 'PAID'
    | 'FAILED'
    | 'CANCELED'
    | 'REFUNDED'
  method?: 'CARD' | 'BOLETO' | 'PIX' | 'CHECKOUT_LINK'
  limit?: number
  starting_after?: string
}

export const useCharges = defineStore('charges', () => {
  const charges = ref<Charge[]>([])
  const currentCharge = ref<Charge | null>(null)
  const loading = ref(false)
  const totalItems = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(20)
  const filters = ref<ChargeFilters>({})

  const snackbar = useSnackbar()

  const hasMore = computed(() => {
    return charges.value.length < totalItems.value
  })

  const pendingCharges = computed(() => {
    return charges.value.filter((charge) => charge.status === 'PENDING')
  })

  const paidCharges = computed(() => {
    return charges.value.filter((charge) => charge.status === 'PAID')
  })

  const failedCharges = computed(() => {
    return charges.value.filter((charge) => charge.status === 'FAILED')
  })

  const totalAmount = computed(() => {
    return charges.value.reduce((sum, charge) => {
      return sum + (charge.amount || 0)
    }, 0)
  })

  const listCharges = async (params?: ChargeFilters) => {
    loading.value = true
    try {
      const response = await apiClient.charges.list(params)
      const pageData = response.data as any
      const items = pageData.content || pageData.items || []

      charges.value = items
      totalItems.value = pageData.totalElements || pageData.total || items.length
      return pageData
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar cobranças'
      snackbar.error(errorMessage)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getCharge = async (id: string) => {
    loading.value = true
    try {
      const response = await apiClient.charges.get(id)
      currentCharge.value = response.data
      return response.data
    } catch (error) {
      snackbar.error('Erro ao carregar cobrança')
      throw error
    } finally {
      loading.value = false
    }
  }

  const createCharge = async (data: CreateChargeRequest) => {
    loading.value = true
    try {
      const response = await apiClient.charges.create(data)
      charges.value.unshift(response.data)
      totalItems.value += 1
      snackbar.success('Cobrança criada com sucesso!')
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          (Array.isArray(error.response?.data?.errors)
                            ? error.response.data.errors.map((e: any) => e.message || e).join(', ')
                            : 'Erro ao criar cobrança')
      snackbar.error(errorMessage)
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateCharge = async (
    id: string,
    data: { description?: string; metadata?: Record<string, unknown> },
  ) => {
    loading.value = true
    try {
      const response = await apiClient.charges.update(id, data)

      const index = charges.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        charges.value[index] = response.data
      }

      if (currentCharge.value?.id === id) {
        currentCharge.value = response.data
      }

      snackbar.success('Cobrança atualizada com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao atualizar cobrança')
      throw error
    } finally {
      loading.value = false
    }
  }

  const cancelCharge = async (id: string) => {
    loading.value = true
    try {
      const response = await apiClient.charges.cancel(id)

      const index = charges.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        charges.value[index] = response.data
      }

      if (currentCharge.value?.id === id) {
        currentCharge.value = response.data
      }

      snackbar.success('Cobrança cancelada com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao cancelar cobrança')
      throw error
    } finally {
      loading.value = false
    }
  }

  const captureCharge = async (id: string, amount?: number) => {
    loading.value = true
    try {
      const data = amount ? { amount_to_capture: amount } : undefined
      const response = await apiClient.charges.capture(id, data)

      const index = charges.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        charges.value[index] = response.data
      }

      if (currentCharge.value?.id === id) {
        currentCharge.value = response.data
      }

      snackbar.success('Cobrança capturada com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao capturar cobrança')
      throw error
    } finally {
      loading.value = false
    }
  }

  const refundCharge = async (id: string, amount?: number, reason?: string) => {
    loading.value = true
    try {
      const data = {
        amount,
        reason,
        metadata: { refunded_at: new Date().toISOString() },
      }

      const response = await apiClient.charges.refund(id, data)

      snackbar.success('Reembolso processado com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao processar reembolso')
      throw error
    } finally {
      loading.value = false
    }
  }

  const searchCharges = async (query: string) => {
    filters.value.search = query
    currentPage.value = 1
    await listCharges(filters.value)
  }

  const filterByStatus = async (
    status:
      | 'PENDING'
      | 'REQUIRES_ACTION'
      | 'AUTHORIZED'
      | 'PAID'
      | 'FAILED'
      | 'CANCELED'
      | 'REFUNDED',
  ) => {
    filters.value.status = status
    currentPage.value = 1
    await listCharges(filters.value)
  }

  const filterByPaymentMethod = async (
    paymentMethod: 'CARD' | 'BOLETO' | 'PIX' | 'CHECKOUT_LINK',
  ) => {
    filters.value.method = paymentMethod
    currentPage.value = 1
    await listCharges(filters.value)
  }

  const loadMoreCharges = async () => {
    if (!hasMore.value || loading.value) {
      return
    }

    const lastCharge = charges.value[charges.value.length - 1]
    if (lastCharge) {
      filters.value.starting_after = lastCharge.id
      const response = await apiClient.charges.list(filters.value)
      charges.value.push(...(response.data.items || []))
    }
  }

  const clearFilters = () => {
    filters.value = {}
    currentPage.value = 1
  }

  const resetStore = () => {
    charges.value = []
    currentCharge.value = null
    totalItems.value = 0
    currentPage.value = 1
    filters.value = {}
  }

  return {
    charges,
    currentCharge,
    loading,
    totalItems,
    currentPage,
    itemsPerPage,
    filters,
    hasMore,
    pendingCharges,
    paidCharges,
    failedCharges,
    totalAmount,
    listCharges,
    getCharge,
    createCharge,
    updateCharge,
    cancelCharge,
    captureCharge,
    refundCharge,
    searchCharges,
    filterByStatus,
    filterByPaymentMethod,
    loadMoreCharges,
    clearFilters,
    resetStore,
  }
})
