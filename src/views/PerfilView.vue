<script setup>
import { ref, onMounted } from 'vue'

const userProfile = ref({
  nome: 'João Silva',
  email: 'joao@conectaai.com',
  empresa: 'Conecta Ai Ltda',
  telefone: '(11) 99999-9999',
  cargo: 'Administrador',
  dataCadastro: '15/03/2024',
  ultimoAcesso: 'Hoje às 14:30',
  avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=0D8ABC&color=fff',
})

const isEditing = ref(false)
const loading = ref(false)
const message = ref('')

const editProfile = () => {
  isEditing.value = true
}

const saveProfile = async () => {
  loading.value = true
  message.value = ''

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    message.value = 'Perfil atualizado com sucesso!'
    isEditing.value = false

    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (error) {
    message.value = 'Erro ao atualizar perfil. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  message.value = ''
}

onMounted(() => {
  const userData = localStorage.getItem('userData')
  if (userData) {
    const parsedData = JSON.parse(userData)
    userProfile.value = { ...userProfile.value, ...parsedData }
  }
})
</script>

<template>
  <div class="perfil-container">
    <div class="perfil-header">
      <h1>Meu Perfil</h1>
      <p>Gerencie suas informações pessoais e configurações da conta</p>
    </div>

    <div class="perfil-content">
      <div class="perfil-card">
        <div class="perfil-avatar-section">
          <div class="avatar-container">
            <img :src="userProfile.avatar" :alt="userProfile.nome" class="avatar" />
            <button class="avatar-edit-btn" v-if="!isEditing">
              <span>📷</span>
            </button>
          </div>
          <div class="avatar-info">
            <h2>{{ userProfile.nome }}</h2>
            <p class="user-role">{{ userProfile.cargo }}</p>
            <p class="user-company">{{ userProfile.empresa }}</p>
          </div>
        </div>

        <div class="perfil-actions" v-if="!isEditing">
          <button @click="editProfile" class="btn btn-primary">
            <span>✏️</span>
            Editar Perfil
          </button>
        </div>
      </div>

      <div class="perfil-details">
        <div class="details-section">
          <h3>Informações Pessoais</h3>

          <div class="form-grid">
            <div class="form-group">
              <label>Nome Completo</label>
              <input
                v-model="userProfile.nome"
                type="text"
                class="input"
                :disabled="!isEditing"
                placeholder="Digite seu nome completo"
              />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input
                v-model="userProfile.email"
                type="email"
                class="input"
                :disabled="!isEditing"
                placeholder="Digite seu email"
              />
            </div>

            <div class="form-group">
              <label>Telefone</label>
              <input
                v-model="userProfile.telefone"
                type="tel"
                class="input"
                :disabled="!isEditing"
                placeholder="Digite seu telefone"
              />
            </div>

            <div class="form-group">
              <label>Empresa</label>
              <input
                v-model="userProfile.empresa"
                type="text"
                class="input"
                :disabled="!isEditing"
                placeholder="Digite o nome da empresa"
              />
            </div>

            <div class="form-group">
              <label>Cargo</label>
              <input
                v-model="userProfile.cargo"
                type="text"
                class="input"
                :disabled="!isEditing"
                placeholder="Digite seu cargo"
              />
            </div>
          </div>
        </div>

        <div class="details-section">
          <h3>Informações da Conta</h3>

          <div class="account-info">
            <div class="info-item">
              <span class="info-label">Data de Cadastro:</span>
              <span class="info-value">{{ userProfile.dataCadastro }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Último Acesso:</span>
              <span class="info-value">{{ userProfile.ultimoAcesso }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status da Conta:</span>
              <span class="info-value status-active">Ativa</span>
            </div>
          </div>
        </div>

        <div class="details-section" v-if="isEditing">
          <h3>Segurança</h3>

          <div class="security-actions">
            <button class="btn btn-outline">
              <span>🔒</span>
              Alterar Senha
            </button>
            <button class="btn btn-outline">
              <span>🔐</span>
              Ativar 2FA
            </button>
          </div>
        </div>
      </div>

      <div class="perfil-actions-bottom" v-if="isEditing">
        <button @click="cancelEdit" class="btn btn-outline">Cancelar</button>
        <button @click="saveProfile" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
        </button>
      </div>

      <div
        v-if="message"
        class="message"
        :class="{
          'message-success': message.includes('sucesso'),
          'message-error': message.includes('Erro'),
        }"
      >
        {{ message }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.perfil-container {
  max-width: 800px;
  margin: 0 auto;
}

.perfil-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.perfil-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.perfil-header p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.perfil-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.perfil-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.perfil-avatar-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid var(--primary);
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--primary);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-edit-btn:hover {
  transform: scale(1.1);
}

.avatar-info h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.user-role {
  color: var(--primary);
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
}

.user-company {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.perfil-actions {
  display: flex;
  gap: var(--spacing-md);
}

.perfil-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.details-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
}

.details-section h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.input:disabled {
  background: var(--bg-primary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
}

.info-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  color: var(--text-primary);
  font-weight: 600;
}

.status-active {
  color: var(--success);
}

.security-actions {
  display: flex;
  gap: var(--spacing-md);
}

.perfil-actions-bottom {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
}

.btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  background: var(--bg-tertiary);
  border-color: var(--primary);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.message {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  text-align: center;
  font-weight: 500;
}

.message-success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.message-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

@media (max-width: 768px) {
  .perfil-card {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }

  .perfil-avatar-section {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .perfil-actions-bottom {
    flex-direction: column;
  }

  .security-actions {
    flex-direction: column;
  }
}
</style>
