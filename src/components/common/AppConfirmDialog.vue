<template>
  <v-dialog
    v-model="dialog"
    :max-width="maxWidth"
    :persistent="persistent"
    @click:outside="onCancel"
  >
    <v-card>
      <v-card-title class="headline">
        <v-icon left :color="iconColor" class="mr-2">
          {{ icon }}
        </v-icon>
        {{ title }}
      </v-card-title>

      <v-card-text class="pt-4">
        <p class="text-body-1">{{ message }}</p>
        <slot name="content" />
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />

        <v-btn text @click="onCancel" :disabled="loading">
          {{ cancelText }}
        </v-btn>

        <v-btn :color="confirmColor" :loading="loading" @click="onConfirm">
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  icon?: string
  iconColor?: string
  maxWidth?: string | number
  persistent?: boolean
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirmar',
  message: 'Tem certeza que deseja continuar?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  confirmColor: 'error',
  icon: 'mdi-alert-circle',
  iconColor: 'warning',
  maxWidth: 400,
  persistent: false,
  loading: false,
})

const emit = defineEmits<Emits>()

// Estado interno
const dialog = ref(props.modelValue)

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    dialog.value = newValue
  },
)

watch(dialog, (newValue) => {
  emit('update:modelValue', newValue)
})

// Métodos
const onConfirm = () => {
  emit('confirm')
}

const onCancel = () => {
  dialog.value = false
  emit('cancel')
}

// Expor métodos
defineExpose({
  open: () => {
    dialog.value = true
  },
  close: () => {
    dialog.value = false
  },
})
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-card-title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding-bottom: 16px;
}

.v-card-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 16px;
}
</style>
