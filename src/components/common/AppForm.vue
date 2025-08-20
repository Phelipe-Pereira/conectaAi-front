<template>
  <v-form ref="form" v-model="isValid" @submit.prevent="onSubmit">
    <v-card class="pa-6">
      <v-card-title v-if="title" class="pb-4">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <slot />
      </v-card-text>

      <v-card-actions class="pt-4">
        <v-spacer />

        <slot name="actions">
          <v-btn v-if="showCancel" text @click="$emit('cancel')" :disabled="loading">
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            type="submit"
            :loading="loading"
            :disabled="!isValid || loading"
            @click="onSubmit"
          >
            <v-icon left v-if="submitIcon">{{ submitIcon }}</v-icon>
            {{ submitText }}
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  title?: string
  loading?: boolean
  submitText?: string
  submitIcon?: string
  showCancel?: boolean
  validationRules?: Record<string, any>
}

interface Emits {
  (e: 'submit', formData: any): void
  (e: 'cancel'): void
  (e: 'validation-change', isValid: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  loading: false,
  submitText: 'Salvar',
  submitIcon: 'mdi-content-save',
  showCancel: true,
  validationRules: () => ({}),
})

const emit = defineEmits<Emits>()

// Refs
const form = ref<any>(null)
const isValid = ref(false)

// Computed
const formData = computed(() => {
  if (!form.value) return {}

  // Extrair dados do formulário
  const data: Record<string, any> = {}
  const inputs = form.value.$el.querySelectorAll('input, select, textarea')

  inputs.forEach((input: HTMLInputElement) => {
    if (input.name) {
      data[input.name] = input.value
    }
  })

  return data
})

// Métodos
const onSubmit = async () => {
  if (!isValid.value || props.loading) return

  try {
    await emit('submit', formData.value)
  } catch (error) {
    console.error('Erro no formulário:', error)
  }
}

const validate = () => {
  return form.value?.validate()
}

const reset = () => {
  form.value?.reset()
}

const resetValidation = () => {
  form.value?.resetValidation()
}

// Expor métodos
defineExpose({
  validate,
  reset,
  resetValidation,
  formData,
})

// Watcher para emitir mudanças de validação
watch(isValid, (newValue) => {
  emit('validation-change', newValue)
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.v-card-title {
  font-weight: 600;
  color: var(--v-primary-base);
}

.v-card-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  margin-top: 16px;
  padding-top: 16px;
}
</style>
