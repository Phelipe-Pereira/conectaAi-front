import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSnackbar = defineStore('snackbar', () => {
  // Estado
  const show = ref(false)
  const text = ref('')
  const color = ref('success')
  const timeout = ref(3000)
  const icon = ref('')

  // Ações
  const showSnackbar = (message: string, options: {
    color?: string
    timeout?: number
    icon?: string
  } = {}) => {
    text.value = message
    color.value = options.color || 'success'
    timeout.value = options.timeout || 3000
    icon.value = options.icon || ''
    show.value = true
  }

  const hideSnackbar = () => {
    show.value = false
  }

  const success = (message: string, timeout?: number) => {
    showSnackbar(message, {
      color: 'success',
      icon: 'mdi-check-circle',
      timeout
    })
  }

  const error = (message: string, timeout?: number) => {
    showSnackbar(message, {
      color: 'error',
      icon: 'mdi-alert-circle',
      timeout
    })
  }

  const warning = (message: string, timeout?: number) => {
    showSnackbar(message, {
      color: 'warning',
      icon: 'mdi-alert',
      timeout
    })
  }

  const info = (message: string, timeout?: number) => {
    showSnackbar(message, {
      color: 'info',
      icon: 'mdi-information',
      timeout
    })
  }

  return {
    // Estado
    show,
    text,
    color,
    timeout,
    icon,
    
    // Ações
    showSnackbar,
    hideSnackbar,
    success,
    error,
    warning,
    info
  }
})
