import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  {
    files: ['**/*.{js,mjs,jsx,ts,tsx,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    ...js.configs.recommended,
    ...pluginVue.configs['flat/essential'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
]
