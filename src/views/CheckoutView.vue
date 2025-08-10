<script setup>
import { ref, computed } from 'vue'

const produtos = ref([
  {
    id: 1,
    nome: 'Smartphone Galaxy S23',
    preco: 2999.99,
    imagem: 'https://via.placeholder.com/80x80/0066CC/FFFFFF?text=📱',
    quantidade: 1,
  },
  {
    id: 2,
    nome: 'Fones de Ouvido Wireless',
    preco: 299.99,
    imagem: 'https://via.placeholder.com/80x80/00CC66/FFFFFF?text=🎧',
    quantidade: 1,
  },
  {
    id: 3,
    nome: 'Capa Protetora Premium',
    preco: 89.99,
    imagem: 'https://via.placeholder.com/80x80/FF6600/FFFFFF?text=📱',
    quantidade: 1,
  },
])

const gateways = ref([
  { id: 'stripe', nome: 'Stripe', ativo: true },
  { id: 'asaas', nome: 'Asaas', ativo: true },
  { id: 'mercadopago', nome: 'MercadoPago', ativo: false },
])

const dadosCliente = ref({
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
})

const dadosPagamento = ref({
  gateway: 'stripe',
  metodo: 'cartao',
  numeroCartao: '',
  nomeCartao: '',
  validade: '',
  cvv: '',
  parcelas: 1,
})

const showPaymentModal = ref(false)
const paymentStatus = ref('')
const paymentResult = ref(null)

const total = computed(() => {
  return produtos.value.reduce((acc, produto) => {
    return acc + produto.preco * produto.quantidade
  }, 0)
})

const alterarQuantidade = (produto, delta) => {
  const novaQuantidade = produto.quantidade + delta
  if (novaQuantidade > 0) {
    produto.quantidade = novaQuantidade
  }
}

const removerProduto = (id) => {
  produtos.value = produtos.value.filter((p) => p.id !== id)
}

const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const processarPagamento = () => {
  if (!dadosCliente.value.nome || !dadosCliente.value.email) {
    alert('Por favor, preencha os dados do cliente')
    return
  }

  if (dadosPagamento.value.metodo === 'cartao' && !dadosPagamento.value.numeroCartao) {
    alert('Por favor, preencha os dados do cartão')
    return
  }

  showPaymentModal.value = true
  paymentStatus.value = 'Processando...'

  // Simular processamento de pagamento
  setTimeout(() => {
    const sucesso = Math.random() > 0.3 // 70% de chance de sucesso
    if (sucesso) {
      paymentStatus.value = 'Aprovado'
      paymentResult.value = {
        id: 'PAY-' + Date.now(),
        status: 'Aprovado',
        gateway: dadosPagamento.value.gateway,
        valor: total.value,
        data: new Date().toLocaleString('pt-BR'),
      }
    } else {
      paymentStatus.value = 'Rejeitado'
      paymentResult.value = {
        status: 'Rejeitado',
        motivo: 'Cartão recusado ou dados inválidos',
      }
    }
  }, 3000)
}

const fecharModal = () => {
  showPaymentModal.value = false
  paymentStatus.value = ''
  paymentResult.value = null
}

const limparCarrinho = () => {
  produtos.value = []
}
</script>

<template>
  <div class="checkout-container">
    <div class="page-header">
      <h1>Checkout Simulado</h1>
      <p class="subtitle">Teste as integrações com os gateways de pagamento</p>
    </div>

    <div class="checkout-content">
      <div class="checkout-grid">
        <!-- Carrinho de Compras -->
        <div class="carrinho-section card">
          <div class="section-header">
            <h2>🛒 Carrinho de Compras</h2>
            <button v-if="produtos.length > 0" class="btn btn-danger" @click="limparCarrinho">
              Limpar
            </button>
          </div>

          <div v-if="produtos.length === 0" class="carrinho-vazio">
            <p>Seu carrinho está vazio</p>
            <button class="btn btn-primary">Adicionar Produtos</button>
          </div>

          <div v-else class="produtos-lista">
            <div v-for="produto in produtos" :key="produto.id" class="produto-item">
              <img :src="produto.imagem" :alt="produto.nome" class="produto-imagem" />
              <div class="produto-info">
                <h3>{{ produto.nome }}</h3>
                <p class="produto-preco">{{ formatarMoeda(produto.preco) }}</p>
              </div>
              <div class="produto-quantidade">
                <button @click="alterarQuantidade(produto, -1)" class="btn-quantidade">-</button>
                <span>{{ produto.quantidade }}</span>
                <button @click="alterarQuantidade(produto, 1)" class="btn-quantidade">+</button>
              </div>
              <div class="produto-total">
                <p>{{ formatarMoeda(produto.preco * produto.quantidade) }}</p>
                <button @click="removerProduto(produto.id)" class="btn-remover">×</button>
              </div>
            </div>
          </div>

          <div v-if="produtos.length > 0" class="carrinho-total">
            <div class="total-item">
              <span>Subtotal:</span>
              <span>{{ formatarMoeda(total) }}</span>
            </div>
            <div class="total-item">
              <span>Frete:</span>
              <span>Grátis</span>
            </div>
            <div class="total-item total-final">
              <span>Total:</span>
              <span>{{ formatarMoeda(total) }}</span>
            </div>
          </div>
        </div>

        <!-- Dados do Cliente -->
        <div class="dados-section card">
          <h2>👤 Dados do Cliente</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Nome Completo</label>
              <input
                v-model="dadosCliente.nome"
                type="text"
                class="input"
                placeholder="Digite seu nome"
              />
            </div>
            <div class="form-group">
              <label>E-mail</label>
              <input
                v-model="dadosCliente.email"
                type="email"
                class="input"
                placeholder="seu@email.com"
              />
            </div>
            <div class="form-group">
              <label>Telefone</label>
              <input
                v-model="dadosCliente.telefone"
                type="tel"
                class="input"
                placeholder="(11) 99999-9999"
              />
            </div>
            <div class="form-group">
              <label>CPF</label>
              <input
                v-model="dadosCliente.cpf"
                type="text"
                class="input"
                placeholder="000.000.000-00"
              />
            </div>
          </div>
        </div>

        <!-- Dados de Pagamento -->
        <div class="pagamento-section card">
          <h2>💳 Dados de Pagamento</h2>

          <div class="gateway-selection">
            <label>Gateway de Pagamento:</label>
            <div class="gateway-options">
              <label v-for="gateway in gateways" :key="gateway.id" class="gateway-option">
                <input
                  type="radio"
                  :value="gateway.id"
                  v-model="dadosPagamento.gateway"
                  :disabled="!gateway.ativo"
                />
                <span :class="{ disabled: !gateway.ativo }">{{ gateway.nome }}</span>
              </label>
            </div>
          </div>

          <div class="metodo-selection">
            <label>Método de Pagamento:</label>
            <div class="metodo-options">
              <label class="metodo-option">
                <input type="radio" value="cartao" v-model="dadosPagamento.metodo" />
                <span>Cartão de Crédito</span>
              </label>
              <label class="metodo-option">
                <input type="radio" value="pix" v-model="dadosPagamento.metodo" />
                <span>PIX</span>
              </label>
              <label class="metodo-option">
                <input type="radio" value="boleto" v-model="dadosPagamento.metodo" />
                <span>Boleto</span>
              </label>
            </div>
          </div>

          <div v-if="dadosPagamento.metodo === 'cartao'" class="cartao-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Número do Cartão</label>
                <input
                  v-model="dadosPagamento.numeroCartao"
                  type="text"
                  class="input"
                  placeholder="0000 0000 0000 0000"
                />
              </div>
              <div class="form-group">
                <label>Nome no Cartão</label>
                <input
                  v-model="dadosPagamento.nomeCartao"
                  type="text"
                  class="input"
                  placeholder="NOME COMO ESTÁ NO CARTÃO"
                />
              </div>
              <div class="form-group">
                <label>Validade</label>
                <input
                  v-model="dadosPagamento.validade"
                  type="text"
                  class="input"
                  placeholder="MM/AA"
                />
              </div>
              <div class="form-group">
                <label>CVV</label>
                <input v-model="dadosPagamento.cvv" type="text" class="input" placeholder="123" />
              </div>
              <div class="form-group">
                <label>Parcelas</label>
                <select v-model="dadosPagamento.parcelas" class="input">
                  <option value="1">1x sem juros</option>
                  <option value="2">2x sem juros</option>
                  <option value="3">3x sem juros</option>
                  <option value="6">6x com juros</option>
                  <option value="12">12x com juros</option>
                </select>
              </div>
            </div>
          </div>

          <div class="pagamento-actions">
            <button @click="processarPagamento" class="btn btn-primary btn-large">
              Finalizar Compra - {{ formatarMoeda(total) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Processamento de Pagamento -->
    <div v-if="showPaymentModal" class="modal-overlay">
      <div class="modal-content card">
        <div class="modal-header">
          <h2>Processando Pagamento</h2>
        </div>

        <div class="modal-body">
          <div v-if="paymentStatus === 'Processando...'" class="processing">
            <div class="spinner"></div>
            <p>{{ paymentStatus }}</p>
            <p class="processing-details">
              Gateway: {{ dadosPagamento.gateway }}<br />
              Valor: {{ formatarMoeda(total) }}
            </p>
          </div>

          <div v-else-if="paymentResult" class="payment-result">
            <div v-if="paymentResult.status === 'Aprovado'" class="success-result">
              <div class="result-icon">✅</div>
              <h3>Pagamento Aprovado!</h3>
              <div class="result-details">
                <p><strong>ID da Transação:</strong> {{ paymentResult.id }}</p>
                <p><strong>Gateway:</strong> {{ paymentResult.gateway }}</p>
                <p><strong>Valor:</strong> {{ formatarMoeda(paymentResult.valor) }}</p>
                <p><strong>Data:</strong> {{ paymentResult.data }}</p>
              </div>
            </div>

            <div v-else class="error-result">
              <div class="result-icon">❌</div>
              <h3>Pagamento Rejeitado</h3>
              <div class="result-details">
                <p><strong>Motivo:</strong> {{ paymentResult.motivo }}</p>
                <p>Tente novamente com outros dados de pagamento.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="fecharModal" class="btn btn-secondary">Fechar</button>
          <button v-if="paymentResult?.status === 'Aprovado'" class="btn btn-primary">
            Ver Detalhes da Transação
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-container {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.page-header h1 {
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.checkout-content {
  margin-top: var(--spacing-lg);
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.carrinho-section {
  grid-column: 1 / -1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h2 {
  color: var(--text-primary);
  font-size: 1.25rem;
  margin: 0;
}

.carrinho-vazio {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.produtos-lista {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.produto-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
}

.produto-imagem {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-sm);
  object-fit: cover;
}

.produto-info {
  flex: 1;
}

.produto-info h3 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.produto-preco {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.produto-quantidade {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-quantidade {
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.produto-total {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.produto-total p {
  margin: 0;
  font-weight: 600;
  color: var(--text-primary);
}

.btn-remover {
  background: none;
  border: none;
  color: var(--error);
  font-size: 1.25rem;
  cursor: pointer;
  padding: var(--spacing-xs);
}

.carrinho-total {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.total-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.total-final {
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--text-primary);
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.dados-section,
.pagamento-section {
  padding: var(--spacing-lg);
}

.dados-section h2,
.pagamento-section h2 {
  color: var(--text-primary);
  font-size: 1.25rem;
  margin-bottom: var(--spacing-lg);
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

.form-group label {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
}

.gateway-selection,
.metodo-selection {
  margin-bottom: var(--spacing-lg);
}

.gateway-options,
.metodo-options {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.gateway-option,
.metodo-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}

.gateway-option.disabled {
  color: var(--text-secondary);
  cursor: not-allowed;
}

.cartao-form {
  margin-top: var(--spacing-lg);
}

.pagamento-actions {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.btn-large {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: 1.125rem;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
}

.modal-header {
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 0;
  text-align: center;
}

.modal-body {
  padding: var(--spacing-lg);
}

.processing {
  text-align: center;
  padding: var(--spacing-xl);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-lg);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.processing-details {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: var(--spacing-md);
  line-height: 1.5;
}

.payment-result {
  text-align: center;
  padding: var(--spacing-xl);
}

.result-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
}

.success-result h3 {
  color: var(--success);
  margin-bottom: var(--spacing-lg);
  font-size: 1.5rem;
  font-weight: 600;
}

.error-result h3 {
  color: var(--error);
  margin-bottom: var(--spacing-lg);
  font-size: 1.5rem;
  font-weight: 600;
}

.result-details {
  text-align: left;
  background-color: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  margin-top: var(--spacing-lg);
  border: 1px solid var(--border-color);
}

.result-details p {
  margin: var(--spacing-sm) 0;
  color: var(--text-primary);
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .gateway-options,
  .metodo-options {
    flex-direction: column;
  }

  .produto-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>
