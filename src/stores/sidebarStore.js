import { ref } from 'vue'

const isOpen = ref(window.innerWidth > 768)

export const useSidebarStore = () => {
  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen,
    toggle,
  }
}
