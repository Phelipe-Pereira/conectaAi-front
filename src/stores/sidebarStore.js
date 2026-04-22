import { ref } from 'vue'

const isOpen = ref<boolean>(typeof window !== 'undefined' ? window.innerWidth > 768 : true)

export const useSidebarStore = () => {
  const toggle = (): void => {
    isOpen.value = !isOpen.value
  }

  const open = (): void => {
    isOpen.value = true
  }

  const close = (): void => {
    isOpen.value = false
  }

  return {
    isOpen,
    toggle,
    open,
    close,
  }
}
