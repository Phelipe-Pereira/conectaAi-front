import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SNACKBAR_CONFIG } from '@/constants'

interface SnackbarOptions {
  color?: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
  icon?: string
}

export const useSnackbar = defineStore('snackbar', () => {
  const show = ref(false)
  const text = ref('')
  const color = ref<'success' | 'error' | 'warning' | 'info'>('success')
  const timeout = ref<number>(SNACKBAR_CONFIG.DEFAULT_TIMEOUT)
  const icon = ref('')

  const showSnackbar = (message: string, options: SnackbarOptions = {}) => {
    text.value = message
    color.value = options.color || SNACKBAR_CONFIG.COLORS.SUCCESS
    timeout.value = options.timeout || SNACKBAR_CONFIG.DEFAULT_TIMEOUT
    icon.value = options.icon || ''
    show.value = true
  }

  const hideSnackbar = () => {
    show.value = false
  }

  const success = (message: string, timeout?: number) => {
    showSnackbar(message, {
      color: SNACKBAR_CONFIG.COLORS.SUCCESS,
      icon: SNACKBAR_CONFIG.ICONS.SUCCESS,
      timeout,
    })
  }

  const error = (message: string, timeout?: number) => {
    showSnackbar(message, {
      color: SNACKBAR_CONFIG.COLORS.ERROR,
      icon: SNACKBAR_CONFIG.ICONS.ERROR,
      timeout,
    })
  }

  const warning = (message: string, timeout?: number) => {
    showSnackbar(message, {
      color: SNACKBAR_CONFIG.COLORS.WARNING,
      icon: SNACKBAR_CONFIG.ICONS.WARNING,
      timeout,
    })
  }

  const info = (message: string, timeout?: number) => {
    showSnackbar(message, {
      color: SNACKBAR_CONFIG.COLORS.INFO,
      icon: SNACKBAR_CONFIG.ICONS.INFO,
      timeout,
    })
  }

  return {
    show,
    text,
    color,
    timeout,
    icon,
    showSnackbar,
    hideSnackbar,
    success,
    error,
    warning,
    info,
  }
})
