// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://sandbox.api.conectaai.com/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY_BASE: 1000,
} as const

// HTTP Status Codes
export const HTTP_STATUS = {
  RATE_LIMIT: 429,
  SERVER_ERROR_MIN: 500,
} as const

// Snackbar Configuration
export const SNACKBAR_CONFIG = {
  DEFAULT_TIMEOUT: 3000,
  COLORS: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  ICONS: {
    SUCCESS: 'mdi-check-circle',
    ERROR: 'mdi-alert-circle',
    WARNING: 'mdi-alert',
    INFO: 'mdi-information',
  },
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_ITEMS_PER_PAGE: 10,
  DEFAULT_PAGE: 1,
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  IS_AUTHENTICATED: 'isAuthenticated',
} as const
