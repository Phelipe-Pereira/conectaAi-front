<script setup>
import { ref } from 'vue'

const configuracoes = ref({
  empresa: {
    nome: 'Conecta Ai',
    cnpj: '12.345.678/0001-90',
    email: 'contato@conectaai.com',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Tecnologias, 123 - São Paulo, SP',
    site: 'www.conectaai.com',
  },
  sistema: {
    timezone: 'America/Sao_Paulo',
    idioma: 'pt-BR',
    moeda: 'BRL',
    formatoData: 'DD/MM/YYYY',
    formatoHora: '24h',
  },
  notificacoes: {
    email: true,
    push: true,
    sms: false,
    webhook: true,
  },
  seguranca: {
    autenticacao2fa: true,
    sessaoTimeout: 30,
    tentativasLogin: 3,
    complexidadeSenha: 'Alta',
  },
})

const activeTab = ref('empresa')

const tabs = [
  { id: 'empresa', label: 'Empresa', icon: '🏢' },
  { id: 'sistema', label: 'Sistema', icon: '⚙️' },
  { id: 'notificacoes', label: 'Notificações', icon: '🔔' },
  { id: 'seguranca', label: 'Segurança', icon: '🔒' },
]

const saveConfig = () => {
  console.log('Configurações salvas:', configuracoes.value)
}
</script>

<template>
  <div class="configuracoes-container">
    <div class="config-header">
      <h1>Configurações</h1>
      <p>Gerencie as configurações do sistema</p>
      <button @click="saveConfig" class="btn-save">
        <span>💾</span>
        Salvar Alterações
      </button>
    </div>

    <div class="config-content">
      <div class="tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'empresa'" class="tab-panel">
          <div class="config-section">
            <h2>Informações da Empresa</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>Nome da Empresa</label>
                <input v-model="configuracoes.empresa.nome" type="text" />
              </div>

              <div class="form-group">
                <label>CNPJ</label>
                <input v-model="configuracoes.empresa.cnpj" type="text" />
              </div>

              <div class="form-group">
                <label>Email</label>
                <input v-model="configuracoes.empresa.email" type="email" />
              </div>

              <div class="form-group">
                <label>Telefone</label>
                <input v-model="configuracoes.empresa.telefone" type="tel" />
              </div>

              <div class="form-group">
                <label>Site</label>
                <input v-model="configuracoes.empresa.site" type="url" />
              </div>

              <div class="form-group full-width">
                <label>Endereço</label>
                <input v-model="configuracoes.empresa.endereco" type="text" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'sistema'" class="tab-panel">
          <div class="config-section">
            <h2>Configurações do Sistema</h2>
            <div class="form-grid">
              <div class="form-group">
                <label>Fuso Horário</label>
                <select v-model="configuracoes.sistema.timezone">
                  <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </div>

              <div class="form-group">
                <label>Idioma</label>
                <select v-model="configuracoes.sistema.idioma">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              <div class="form-group">
                <label>Moeda</label>
                <select v-model="configuracoes.sistema.moeda">
                  <option value="BRL">Real (R$)</option>
                  <option value="USD">Dólar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Formato de Data</label>
                <select v-model="configuracoes.sistema.formatoData">
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div class="form-group">
                <label>Formato de Hora</label>
                <select v-model="configuracoes.sistema.formatoHora">
                  <option value="24h">24 horas</option>
                  <option value="12h">12 horas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'notificacoes'" class="tab-panel">
          <div class="config-section">
            <h2>Configurações de Notificações</h2>
            <div class="notifications-grid">
              <div class="notification-item">
                <div class="notification-info">
                  <h3>Notificações por Email</h3>
                  <p>Receba notificações importantes por email</p>
                </div>
                <label class="toggle-switch">
                  <input v-model="configuracoes.notificacoes.email" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <h3>Notificações Push</h3>
                  <p>Receba notificações em tempo real no navegador</p>
                </div>
                <label class="toggle-switch">
                  <input v-model="configuracoes.notificacoes.push" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <h3>Notificações SMS</h3>
                  <p>Receba notificações por SMS (cobrança adicional)</p>
                </div>
                <label class="toggle-switch">
                  <input v-model="configuracoes.notificacoes.sms" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="notification-item">
                <div class="notification-info">
                  <h3>Webhooks</h3>
                  <p>Envie notificações para sistemas externos</p>
                </div>
                <label class="toggle-switch">
                  <input v-model="configuracoes.notificacoes.webhook" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'seguranca'" class="tab-panel">
          <div class="config-section">
            <h2>Configurações de Segurança</h2>
            <div class="security-grid">
              <div class="security-item">
                <div class="security-info">
                  <h3>Autenticação 2FA</h3>
                  <p>Requer autenticação de dois fatores para login</p>
                </div>
                <label class="toggle-switch">
                  <input v-model="configuracoes.seguranca.autenticacao2fa" type="checkbox" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="security-item">
                <div class="security-info">
                  <h3>Tempo de Sessão</h3>
                  <p>Tempo limite para sessão inativa (minutos)</p>
                </div>
                <select v-model="configuracoes.seguranca.sessaoTimeout">
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                </select>
              </div>

              <div class="security-item">
                <div class="security-info">
                  <h3>Tentativas de Login</h3>
                  <p>Número máximo de tentativas antes do bloqueio</p>
                </div>
                <select v-model="configuracoes.seguranca.tentativasLogin">
                  <option value="3">3 tentativas</option>
                  <option value="5">5 tentativas</option>
                  <option value="10">10 tentativas</option>
                </select>
              </div>

              <div class="security-item">
                <div class="security-info">
                  <h3>Complexidade de Senha</h3>
                  <p>Nível de complexidade exigida para senhas</p>
                </div>
                <select v-model="configuracoes.seguranca.complexidadeSenha">
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.configuracoes-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.config-header {
  text-align: center;
  margin-bottom: 32px;
}

.config-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.config-header p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 24px 0;
}

.btn-save {
  padding: 12px 24px;
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-save:hover {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
}

.config-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.tabs-nav {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-button {
  flex: 1;
  padding: 16px 24px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.tab-button.active {
  background: rgba(0, 122, 255, 0.2);
  color: #007aff;
  border-bottom: 2px solid #007aff;
}

.tab-icon {
  font-size: 18px;
}

.tab-label {
  font-weight: 600;
}

.tab-content {
  padding: 32px;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 24px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007aff;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-group select option {
  background: #1a1a1a;
  color: white;
}

.notifications-grid,
.security-grid {
  display: grid;
  gap: 20px;
}

.notification-item,
.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.notification-item:hover,
.security-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 122, 255, 0.3);
}

.notification-info h3,
.security-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
}

.notification-info p,
.security-info p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #007aff;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

@media (max-width: 768px) {
  .configuracoes-container {
    padding: 16px;
  }

  .config-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .tabs-nav {
    flex-direction: column;
  }

  .tab-button {
    justify-content: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .notification-item,
  .security-item {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .notification-info,
  .security-info {
    text-align: center;
  }
}
</style>
