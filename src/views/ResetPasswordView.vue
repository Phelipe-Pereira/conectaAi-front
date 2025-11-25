<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/services/http'
import { useSnackbar } from '@/stores/useSnackbar'

const router = useRouter()
const snackbar = useSnackbar()
const email = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const handleResetPassword = async () => {
  if (!email.value) {
    error.value = 'Por favor, insira seu email.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await http.post('/auth/forgot-password', {
      email: email.value,
    })
    success.value = true
    snackbar.success('Email de redefinição enviado com sucesso!')
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Erro ao enviar email de redefinição. Tente novamente.'
    error.value = errorMessage
    snackbar.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const goBackToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="reset-container">
    <div class="reset-content">
      <div class="reset-header">
        <img src="@/assets/logo.svg" alt="Conecta Ai Logo" class="logo" />
        <h1>Redefinir Senha</h1>
        <p class="reset-subtitle">
          Digite seu email e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <form v-if="!success" @submit.prevent="handleResetPassword" class="reset-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="input"
            placeholder="Insira seu e-mail"
            autocomplete="email"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary reset-button" :disabled="loading">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Enviando...' : 'Enviar Email' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <div v-else class="success-message">
        <div class="success-icon">✅</div>
        <h2>Email Enviado!</h2>
        <p>Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
        <button @click="goBackToLogin" class="btn btn-secondary">Voltar ao Login</button>
      </div>

      <div class="reset-footer">
        <button @click="goBackToLogin" class="back-link">← Voltar ao Login</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: var(--spacing-lg);
}

.reset-content {
  width: 100%;
  max-width: 420px;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.reset-header {
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

.reset-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
}

.reset-form {
  display: flex;
  flex-direction: column;
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

.reset-button {
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

.success-message {
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.success-message h2 {
  color: var(--text-primary);
  font-size: 1.25rem;
  margin-bottom: var(--spacing-md);
}

.success-message p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: var(--spacing-lg);
}

.reset-footer {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.back-link {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
  padding: 0;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .reset-content {
    padding: var(--spacing-lg);
  }
}
</style>
