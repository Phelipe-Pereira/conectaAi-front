import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import vuetify from './plugins/vuetify'

import App from './App.vue'
import router from './router'
import { useAuth } from './stores/useAuth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// Inicializar autenticação ao iniciar o app
const authStore = useAuth()
authStore.checkAuth()

app.mount('#app')
