<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const formData = ref({
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  empresa: '',
  telefone: '',
  termos: false,
})

const handleRegister = async () => {
  if (!formData.value.termos) {
    error.value = 'Você precisa aceitar os termos de serviço.'
    return
  }

  if (formData.value.senha !== formData.value.confirmarSenha) {
    error.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push({ name: 'login' })
  } catch (err) {
    error.value = 'Erro ao criar conta. Tente novamente.'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="register-container">
    <div class="register-content">
      <div class="register-header">
        <img src="@/assets/logo.svg" alt="Middleware Multi-Gateways Logo" class="logo" />
        <h1>Crie sua conta no Middleware Multi-Gateways</h1>
        <p class="register-subtitle">
          Comece sua jornada de sucesso no gerenciamento de pagamentos
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="nome">Nome completo</label>
            <input
              id="nome"
              v-model="formData.nome"
              type="text"
              class="input"
              required
              placeholder="Digite seu nome"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="input"
              required
              placeholder="Digite seu email"
            />
          </div>

          <div class="form-group">
            <label for="empresa">Nome da empresa</label>
            <input
              id="empresa"
              v-model="formData.empresa"
              type="text"
              class="input"
              required
              placeholder="Digite o nome da sua empresa"
            />
          </div>

          <div class="form-group">
            <label for="telefone">Telefone</label>
            <input
              id="telefone"
              v-model="formData.telefone"
              type="tel"
              class="input"
              required
              placeholder="(00) 00000-0000"
            />
          </div>

          <div class="form-group">
            <label for="senha">Senha</label>
            <input
              id="senha"
              v-model="formData.senha"
              type="password"
              class="input"
              required
              placeholder="Digite sua senha"
            />
          </div>

          <div class="form-group">
            <label for="confirmarSenha">Confirmar senha</label>
            <input
              id="confirmarSenha"
              v-model="formData.confirmarSenha"
              type="password"
              class="input"
              required
              placeholder="Confirme sua senha"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="formData.termos" type="checkbox" required />
            <span
              >Eu aceito os <a href="#" class="terms-link">Termos de Serviço</a> e
              <a href="#" class="terms-link">Política de Privacidade</a></span
            >
          </label>
        </div>

        <button type="submit" class="btn btn-primary register-button" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <div class="register-footer">
        <p>
          Já tem uma conta?
          <button @click="goToLogin" class="login-link">Faça login</button>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: var(--spacing-lg);
}

.register-content {
  width: 100%;
  max-width: 600px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.register-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.logo {
  width: 120px;
  height: auto;
  margin-bottom: var(--spacing-lg);
}

h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.register-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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

label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

.input {
  background-color: var(--bg-tertiary);
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

.input::placeholder {
  color: var(--text-tertiary);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox-label input[type='checkbox'] {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
  margin-top: var(--spacing-xs);
}

.terms-link {
  color: var(--primary);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-button {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
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

.error-message {
  color: var(--error);
  font-size: 0.875rem;
  text-align: center;
  padding: var(--spacing-sm);
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: var(--border-radius-sm);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.register-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.login-link {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
  padding: 0;
  font-weight: 500;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-content {
    max-width: 100%;
    margin: var(--spacing-md);
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .register-content {
    padding: var(--spacing-lg);
  }
}
</style>
