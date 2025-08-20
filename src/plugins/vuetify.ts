import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#007aff',
          secondary: '#5856d6',
          accent: '#409cff',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          success: '#22c55e',
          background: '#ffffff',
          surface: '#f8f8f8',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-surface': '#181818',
        },
      },
      dark: {
        colors: {
          primary: '#007aff',
          secondary: '#5856d6',
          accent: '#409cff',
          error: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
          success: '#22c55e',
          background: '#111827',
          surface: '#1f2937',
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-surface': '#f9fafb',
        },
      },
    },
  },
  defaults: {
    VApp: {
      style: 'background-color: #f5f5f5;',
    },
    VCard: {
      style: 'background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);',
    },
    VBtn: {
      style: 'text-transform: none; font-weight: 500;',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})
