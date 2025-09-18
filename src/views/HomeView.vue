<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useAuth } from '@/stores/useAuth'

const router = useRouter()
const auth = useAuth()

onMounted(() => {
  // Se já estiver autenticado, redirecionar para dashboard
  if (auth.isAuthenticated) {
    router.push('/dashboard')
  }
})

const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true'
}

const goToDashboard = () => {
  if (isAuthenticated()) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const goToAuthOrDashboard = () => {
  if (isAuthenticated()) {
    router.push('/dashboard')
  } else {
    router.push('/register')
  }
}
</script>

<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <img src="@/assets/logo.svg" alt="Conecta Ai Logo" class="logo-icon" />
            <span>Conecta Ai</span>
          </div>
          <div class="header-actions">
            <button class="btn btn-outline" @click="goToLogin">Login</button>
            <button class="btn btn-outline" @click="goToRegister">Registrar-se</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Descubra a forma mais fácil de gerenciar seu e-commerce</h1>
          <div class="hero-form">
            <input type="email" placeholder="Seu e-mail" class="email-input" />
            <button class="btn btn-primary" @click="goToAuthOrDashboard">Inscrever-se</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2>Tudo em um lugar só.</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <img
                src="/src/assets/photos/aperto-de-mao.png"
                alt="Gerencie suas finanças"
                class="feature-image"
              />
            </div>
            <h3>Gerencie suas finanças</h3>
            <p>
              Obtenha todos seus dados financeiros em um único lugar e com gráficos interativos.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <img
                src="/src/assets/photos/numero-de-rastreio.png"
                alt="Rastreie suas vendas"
                class="feature-image"
              />
            </div>
            <h3>Rastreie suas vendas</h3>
            <p>Obtenha informações completas e centralizadas sobre suas vendas.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <img
                src="/src/assets/photos/cliente.png"
                alt="Entenda seus clientes"
                class="feature-image"
              />
            </div>
            <h3>Entenda seus clientes</h3>
            <p>Tenha relatórios sobre seus clientes e dados a partir das compra dos mesmos.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Partnership Section -->
    <section class="partnership">
      <div class="container">
        <h2>Seja parceiro da Conecta Ai e transforme a gestão de dados do seu e-commerce.</h2>
        <div class="partnership-grid">
          <div class="partnership-card">
            <div class="partnership-icon">
              <img src="/src/assets/photos/vendedor.png" alt="Vendedor" class="partnership-image" />
            </div>
            <h3>Vendedor</h3>
            <p>Conecte seu negócio conosco e tenha uma plataforma para alavancar suas vendas</p>
            <button class="btn btn-primary" @click="goToAuthOrDashboard">Gerencie conosco</button>
          </div>
          <div class="partnership-card">
            <div class="partnership-icon">
              <img
                src="/src/assets/photos/aperto-de-mao-de-parceria.png"
                alt="Seja um parceiro"
                class="partnership-image"
              />
            </div>
            <h3>Seja um parceiro</h3>
            <p>Conecte conosco e traga seu serviço ou produto para utilização junto ao IntegraAI</p>
            <button class="btn btn-primary" @click="goToAuthOrDashboard">Conecte-se conosco</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Sections -->
    <section class="bottom-sections">
      <div class="container">
        <div class="bottom-grid">
          <div class="bottom-card">
            <h3>Comece Agora</h3>
            <h4>Gratuito por 14 dias!</h4>
            <p>
              Crie sua conta gratuita e comece a gerenciar seu e-commerce hoje mesmo. Sem
              compromisso, sem cartão de crédito.
            </p>
            <div class="bottom-icon">
              <img src="/src/assets/photos/raio.png" alt="Comece Agora" class="bottom-image" />
            </div>
            <button class="btn btn-primary" @click="goToAuthOrDashboard">Criar Conta Grátis</button>
          </div>
          <div class="bottom-card">
            <h3>Trabalhe conosco</h3>
            <p>Se identificou conosco? Veja as vagas em aberto no nosso time!</p>
            <div class="bottom-icon">
              <img
                src="/src/assets/photos/carteira-de-identidade.png"
                alt="Trabalhe conosco"
                class="bottom-image"
              />
            </div>
            <button class="btn btn-primary" @click="goToAuthOrDashboard">Se junte a nós</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">Conecta Ai</div>
          <div class="footer-links">
            <div class="footer-column">
              <h4>Segurança</h4>
              <a href="#" @click="goToDashboard">Dashboard</a>
              <a href="#">Redes sociais</a>
            </div>
            <div class="footer-column">
              <h4>Registre-se</h4>
              <a href="#">Integração API</a>
              <a href="#">Se junte a nós</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  padding: 20px 0;
  border-bottom: 1px solid rgba(0, 122, 255, 0.2);
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0, 122, 255, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 28px;
  font-weight: 800;
  color: white;
  text-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
  transition: all 0.3s ease;
}

.logo-icon {
  width: 32px;
  height: 32px;
  transition: all 0.3s ease;
}

.logo:hover {
  text-shadow: 0 0 30px rgba(0, 122, 255, 0.5);
  transform: scale(1.05);
}

.logo:hover .logo-icon {
  transform: scale(1.1);
}

.header-actions {
  display: flex;
  gap: 16px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
}

.hero {
  padding: 100px 0;
  text-align: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
  position: relative;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(0, 122, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero h1 {
  font-size: 56px;
  font-weight: 800;
  margin-bottom: 40px;
  color: white;
  line-height: 1.2;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  background: linear-gradient(135deg, #ffffff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-form {
  display: flex;
  gap: 16px;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
}

.email-input {
  flex: 1;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.email-input:focus {
  outline: none;
  border-color: #007aff;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
}

.email-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.features {
  padding: 100px 0;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
}

.features h2 {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 80px;
  color: white;
  text-align: center;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.feature-card {
  text-align: center;
  padding: 40px 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #007aff, #00d4ff);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

.feature-icon {
  margin-bottom: 30px;
  position: relative;
}

.feature-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 20px;
  margin: 0 auto;
  display: block;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.feature-card:hover .feature-image {
  transform: scale(1.1);
  box-shadow: 0 15px 35px rgba(0, 122, 255, 0.3);
}

.feature-card h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.feature-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  font-size: 16px;
}

.partnership {
  padding: 100px 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
}

.partnership h2 {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 80px;
  color: white;
  text-align: center;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  line-height: 1.3;
}

.partnership-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
}

.partnership-card {
  text-align: center;
  padding: 50px 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.partnership-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #007aff, #ff6b35);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.partnership-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.partnership-card:hover::before {
  transform: scaleX(1);
}

.partnership-icon {
  margin-bottom: 30px;
}

.partnership-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 20px;
  margin: 0 auto;
  display: block;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.partnership-card:hover .partnership-image {
  transform: scale(1.1);
  box-shadow: 0 20px 40px rgba(0, 122, 255, 0.3);
}

.partnership-card h3 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.partnership-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin-bottom: 30px;
  font-size: 16px;
}

.bottom-sections {
  padding: 100px 0;
  background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
}

.bottom-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.bottom-card {
  padding: 50px 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.bottom-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #007aff, #4caf50);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.bottom-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.3);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.bottom-card:hover::before {
  transform: scaleX(1);
}

.bottom-card h3 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.bottom-card h4 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #007aff;
  text-shadow: 0 2px 10px rgba(0, 122, 255, 0.3);
}

.bottom-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  margin-bottom: 30px;
  font-size: 16px;
}

.bottom-icon {
  margin-bottom: 30px;
  text-align: center;
}

.bottom-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 20px;
  margin: 0 auto;
  display: block;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.bottom-card:hover .bottom-image {
  transform: scale(1.1);
  box-shadow: 0 20px 40px rgba(0, 122, 255, 0.3);
}

.icon-placeholder {
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.bottom-card:hover .icon-placeholder {
  transform: scale(1.1);
  box-shadow: 0 20px 40px rgba(0, 122, 255, 0.3);
}

.start-icon {
  background: linear-gradient(135deg, #007aff, #4caf50);
}

.footer {
  padding: 60px 0;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.footer-logo {
  font-size: 24px;
  font-weight: 800;
  color: white;
  text-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
}

.footer-links {
  display: flex;
  gap: 80px;
}

.footer-column h4 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.footer-column a {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  font-size: 16px;
}

.footer-column a:hover {
  color: white;
  transform: translateX(5px);
  text-shadow: 0 0 10px rgba(0, 122, 255, 0.5);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 36px;
  }

  .hero-form {
    flex-direction: column;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .partnership-grid {
    grid-template-columns: 1fr;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .footer-content {
    flex-direction: column;
    gap: 30px;
  }

  .footer-links {
    flex-direction: column;
    gap: 30px;
  }

  .features h2,
  .partnership h2 {
    font-size: 32px;
  }

  .feature-card,
  .partnership-card,
  .bottom-card {
    padding: 30px 20px;
  }
}
</style>
