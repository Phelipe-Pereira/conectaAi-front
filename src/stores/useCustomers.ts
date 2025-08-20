import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/sdk'
import { useSnackbar } from './useSnackbar'
import type { components } from '@/sdk/types'

type Customer = components['schemas']['Customer']
type CreateCustomerRequest = components['schemas']['CreateCustomerRequest']
type UpdateCustomerRequest = components['schemas']['UpdateCustomerRequest']

interface CustomerFilters {
  search?: string
  limit?: number
  starting_after?: string
}

export const useCustomers = defineStore('customers', () => {
  const customers = ref<Customer[]>([])
  const currentCustomer = ref<Customer | null>(null)
  const loading = ref(false)
  const totalItems = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref(20)
  const filters = ref<CustomerFilters>({})
  
  const snackbar = useSnackbar()

  const hasMore = computed(() => {
    return customers.value.length < totalItems.value
  })

  const listCustomers = async (params?: CustomerFilters) => {
    loading.value = true
    try {
      const response = await apiClient.customers.list(params)
      customers.value = response.data.items || []
      totalItems.value = response.data.items?.length || 0
      return response.data
    } catch (error) {
      snackbar.error('Erro ao carregar clientes')
      throw error
    } finally {
      loading.value = false
    }
  }

  const getCustomer = async (id: string) => {
    loading.value = true
    try {
      const response = await apiClient.customers.get(id)
      currentCustomer.value = response.data
      return response.data
    } catch (error) {
      snackbar.error('Erro ao carregar cliente')
      throw error
    } finally {
      loading.value = false
    }
  }

  const createCustomer = async (data: CreateCustomerRequest) => {
    loading.value = true
    try {
      const response = await apiClient.customers.create(data)
      customers.value.unshift(response.data)
      totalItems.value += 1
      snackbar.success('Cliente criado com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao criar cliente')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateCustomer = async (id: string, data: UpdateCustomerRequest) => {
    loading.value = true
    try {
      const response = await apiClient.customers.update(id, data)
      
      // Atualizar na lista
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value[index] = response.data
      }
      
      // Atualizar cliente atual se for o mesmo
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = response.data
      }
      
      snackbar.success('Cliente atualizado com sucesso!')
      return response.data
    } catch (error) {
      snackbar.error('Erro ao atualizar cliente')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteCustomer = async (id: string) => {
    loading.value = true
    try {
      await apiClient.customers.delete(id)
      
      // Remover da lista
      const index = customers.value.findIndex(c => c.id === id)
      if (index !== -1) {
        customers.value.splice(index, 1)
        totalItems.value -= 1
      }
      
      // Limpar cliente atual se for o mesmo
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = null
      }
      
      snackbar.success('Cliente removido com sucesso!')
    } catch (error) {
      snackbar.error('Erro ao remover cliente')
      throw error
    } finally {
      loading.value = false
    }
  }

  const searchCustomers = async (query: string) => {
    filters.value.search = query
    currentPage.value = 1
    await listCustomers(filters.value)
  }

  const loadMoreCustomers = async () => {
    if (!hasMore.value || loading.value) return
    
    const lastCustomer = customers.value[customers.value.length - 1]
    if (lastCustomer) {
      filters.value.starting_after = lastCustomer.id
      const response = await apiClient.customers.list(filters.value)
      customers.value.push(...(response.data.items || []))
    }
  }

  const clearFilters = () => {
    filters.value = {}
    currentPage.value = 1
  }

  const resetStore = () => {
    customers.value = []
    currentCustomer.value = null
    totalItems.value = 0
    currentPage.value = 1
    filters.value = {}
  }

  return {
    customers,
    currentCustomer,
    loading,
    totalItems,
    currentPage,
    itemsPerPage,
    filters,
    hasMore,
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    loadMoreCustomers,
    clearFilters,
    resetStore
  }
})
