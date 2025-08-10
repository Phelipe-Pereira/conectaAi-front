<script setup>
import { ref } from 'vue'

const perfilForm = ref({
  nome: 'João Silva',
  email: 'joao.silva@example.com',
  empresa: 'Minha Empresa LTDA',
  telefone: '(11) 98765-4321',
  cargo: 'Administrador',
})

const notificacoesConfig = ref({
  emailPedidos: true,
  emailMarketing: false,
  pushNotifications: true,
  atualizacoesSistema: true,
})

const integracoesAtivas = ref([
  {
    nome: 'Asaas',
    status: 'Conectado',
    ultimaSinc: '2024-03-15 14:30',
    ativo: true,
  },
  {
    nome: 'Shopee',
    status: 'Desconectado',
    ultimaSinc: '-',
    ativo: false,
  },
  {
    nome: 'Amazon',
    status: 'Conectado',
    ultimaSinc: '2024-03-15 15:45',
    ativo: true,
  },
])

const temaEscuro = ref(true)
const idiomaAtual = ref('pt-BR')

const idiomas = [
  { codigo: 'pt-BR', nome: 'Português (Brasil)' },
  { codigo: 'en-US', nome: 'English (US)' },
  { codigo: 'es', nome: 'Español' },
]

const salvarPerfil = () => {
  console.log('Perfil salvo:', perfilForm.value)
}

const salvarNotificacoes = () => {
  console.log('Notificações salvas:', notificacoesConfig.value)
}

const toggleIntegracao = (integracao) => {
  integracao.ativo = !integracao.ativo
}

const alterarTema = () => {
  temaEscuro.value = !temaEscuro.value
}

const mudarIdioma = (novoIdioma) => {
  idiomaAtual.value = novoIdioma
}
</script>

<template>
  <div class="configuracoes-container">
    <h1>Configurações</h1>

    <div class="configuracoes-grid">
      <div class="config-card card">
        <h2>Perfil</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="perfilForm.nome" type="text" class="input" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="perfilForm.email" type="email" class="input" />
          </div>
          <div class="form-group">
            <label>Telefone</label>
            <input v-model="perfilForm.telefone" type="tel" class="input" />
          </div>
          <div class="form-group">
            <label>Empresa</label>
            <input v-model="perfilForm.empresa" type="text" class="input" />
          </div>
        </div>
        <div class="form-actions">
          <button @click="salvarPerfil" class="btn btn-primary">Salvar Perfil</button>
        </div>
      </div>

      <div class="config-card card">
        <h2>Notificações</h2>
        <div class="switch-container">
          <span>Notificações de pedidos por email</span>
          <label class="switch">
            <input v-model="notificacoesConfig.emailPedidos" type="checkbox" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="switch-container">
          <span>Emails de marketing</span>
          <label class="switch">
            <input v-model="notificacoesConfig.emailMarketing" type="checkbox" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="switch-container">
          <span>Notificações push</span>
          <label class="switch">
            <input v-model="notificacoesConfig.pushNotifications" type="checkbox" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="switch-container">
          <span>Atualizações do sistema</span>
          <label class="switch">
            <input v-model="notificacoesConfig.atualizacoesSistema" type="checkbox" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="form-actions">
          <button @click="salvarNotificacoes" class="btn btn-primary">Salvar preferências</button>
        </div>
      </div>

      <div class="config-card card">
        <h2>Integrações</h2>
        <div class="integracoes-list">
          <div
            v-for="integracao in integracoesAtivas"
            :key="integracao.nome"
            class="integracao-item"
          >
            <div class="integracao-info">
              <h3>{{ integracao.nome }}</h3>
              <span
                class="status-badge"
                :class="['status-badge', integracao.ativo ? 'connected' : 'disconnected']"
              >
                {{ integracao.ativo ? 'Conectado' : 'Desconectado' }}
              </span>
              <p v-if="integracao.ultimaSinc !== '-'" class="ultima-sinc">
                Última sincronização: {{ integracao.ultimaSinc }}
              </p>
            </div>
            <label class="switch">
              <input
                :checked="integracao.ativo"
                @change="toggleIntegracao(integracao)"
                type="checkbox"
              />
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="config-card card">
        <h2>Aparência</h2>
        <div class="aparencia-config">
          <div class="switch-container">
            <span>Tema escuro</span>
            <label class="switch">
              <input v-model="temaEscuro" type="checkbox" @change="alterarTema" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="idioma-selector">
            <label>Idioma</label>
            <select v-model="idiomaAtual" class="input" @change="mudarIdioma">
              <option v-for="idioma in idiomas" :key="idioma.codigo" :value="idioma.codigo">
                {{ idioma.nome }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.configuracoes-container {
  padding: var(--spacing-lg);
}

.configuracoes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.config-card {
  padding: var(--spacing-lg);
}

.config-card h2 {
  color: var(--text-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-actions {
  grid-column: 1 / -1;
  margin-top: var(--spacing-md);
}

.switch-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  transition: 0.4s;
  border-radius: 30px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: var(--text-secondary);
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(30px);
  background-color: white;
}

.integracoes-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.integracao-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
}

.integracao-info h3 {
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.status-badge {
  font-size: 0.75rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-xs);
  display: inline-block;
}

.status-badge.connected {
  background-color: rgba(34, 197, 94, 0.2);
  color: var(--success);
}

.status-badge.disconnected {
  background-color: rgba(239, 68, 68, 0.2);
  color: var(--error);
}

.ultima-sinc {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.aparencia-config {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.idioma-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

@media (max-width: 768px) {
  .configuracoes-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .integracao-item {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .switch {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .config-card {
    padding: var(--spacing-md);
  }

  .switch-container {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>
