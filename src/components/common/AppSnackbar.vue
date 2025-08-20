<template>
  <v-snackbar
    v-model="snackbar"
    :color="color"
    :timeout="timeout"
    :top="top"
    :bottom="bottom"
    :left="left"
    :right="right"
    :centered="centered"
    :multi-line="multiLine"
    :vertical="vertical"
    @input="onInput"
  >
    <div class="d-flex align-center">
      <v-icon left v-if="icon" class="mr-2">
        {{ icon }}
      </v-icon>
      <span>{{ text }}</span>
    </div>

    <template v-slot:actions>
      <v-btn v-if="showAction" variant="text" @click="onAction">
        {{ actionText }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  text: string
  color?: string
  timeout?: number
  icon?: string
  actionText?: string
  showAction?: boolean
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
  centered?: boolean
  multiLine?: boolean
  vertical?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'action'): void
}

const props = withDefaults(defineProps<Props>(), {
  color: 'success',
  timeout: 3000,
  icon: '',
  actionText: 'Fechar',
  showAction: true,
  top: false,
  bottom: true,
  left: false,
  right: false,
  centered: false,
  multiLine: false,
  vertical: false,
})

const emit = defineEmits<Emits>()

// Estado interno
const snackbar = ref(props.modelValue)

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    snackbar.value = newValue
  },
)

watch(snackbar, (newValue) => {
  emit('update:modelValue', newValue)
})

// Métodos
const onInput = (value: boolean) => {
  snackbar.value = value
}

const onAction = () => {
  emit('action')
  snackbar.value = false
}

// Estado interno para métodos
const internalText = ref(props.text)
const internalColor = ref(props.color)
const internalIcon = ref(props.icon)

// Expor métodos
defineExpose({
  show: (message?: string, messageColor?: string) => {
    if (message) internalText.value = message
    if (messageColor) internalColor.value = messageColor
    snackbar.value = true
  },
  hide: () => {
    snackbar.value = false
  },
  success: (message: string) => {
    internalText.value = message
    internalColor.value = 'success'
    internalIcon.value = 'mdi-check-circle'
    snackbar.value = true
  },
  error: (message: string) => {
    internalText.value = message
    internalColor.value = 'error'
    internalIcon.value = 'mdi-alert-circle'
    snackbar.value = true
  },
  warning: (message: string) => {
    internalText.value = message
    internalColor.value = 'warning'
    internalIcon.value = 'mdi-alert'
    snackbar.value = true
  },
  info: (message: string) => {
    internalText.value = message
    internalColor.value = 'info'
    internalIcon.value = 'mdi-information'
    snackbar.value = true
  },
})
</script>

<style scoped>
.v-snackbar {
  z-index: 9999;
}
</style>
