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
    imagem: 'https://via.placeholder.com/80x80/00CC66/FFFFFF?text=��',
    quantidade: 2,
  },
  {
    id: 3,
    nome: 'Capa Protetora Premium',
    preco: 89.99,
    imagem: 'https://via.placeholder.com/80x80/FF6600/FFFFFF?text=📱',
    quantidade: 1,
  },
])

const cliente = ref({
  nome: '',
  email: '',
  telefone: '',
  cpf: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
})

const pagamento = ref({
  forma: 'Cartão de Crédito',
  numero: '',
  titular: '',
  validade: '',
  cvv: '',
  parcelas: 1,
})

const showProcessingModal = ref(false)
const processingStatus = ref('')
const processingResult = ref(null)

const formasPagamento = ref(['Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto', 'PayPal'])

const parcelasOptions = ref([1, 2, 3, 6, 12])

const subtotal = computed(() => {
  return produtos.value.reduce((total, produto) => {
    return total + produto.preco * produto.quantidade
  }, 0)
})

const frete = computed(() => {
  return subtotal.value > 500 ? 0 : 29.99
})

const total = computed(() => {
  return subtotal.value + frete.value
})

const valorParcela = computed(() => {
  return total.value / pagamento.value.parcelas
})

const updateQuantidade = (produto, delta) => {
  const novaQuantidade = produto.quantidade + delta
  if (novaQuantidade > 0) {
    produto.quantidade = novaQuantidade
  } else {
    removeProduto(produto.id)
  }
}

const removeProduto = (id) => {
  const index = produtos.value.findIndex((p) => p.id === id)
  if (index > -1) {
    produtos.value.splice(index, 1)
  }
}

const processarPagamento = async () => {
  showProcessingModal.value = true
  processingStatus.value = 'Processando pagamento...'

  await new Promise((resolve) => setTimeout(resolve, 2000))

  processingStatus.value = 'Validando dados...'

  await new Promise((resolve) => setTimeout(resolve, 1500))

  processingStatus.value = 'Conectando com gateway...'

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const sucesso = Math.random() > 0.3

  if (sucesso) {
    processingStatus.value = 'Pagamento aprovado!'
    processingResult.value = {
      sucesso: true,
      codigo: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      mensagem: 'Seu pagamento foi processado com sucesso!',
    }
  } else {
    processingStatus.value = 'Pagamento recusado'
    processingResult.value = {
      sucesso: false,
      codigo: 'ERR' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      mensagem: 'Não foi possível processar seu pagamento. Verifique os dados e tente novamente.',
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 2000))
}

const fecharModal = () => {
  showProcessingModal.value = false
  processingStatus.value = ''
  processingResult.value = null
}

const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
</script>

<template>
  <div class="checkout-container">
    <div class="checkout-header">
      <h1>Finalizar Compra</h1>
      <p>Complete suas informações para finalizar o pedido</p>
    </div>

    <div class="checkout-content">
      <div class="checkout-main">
        <div class="section">
          <h2>Dados do Cliente</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Nome Completo *</label>
              <input v-model="cliente.nome" type="text" required />
            </div>

            <div class="form-group">
              <label>Email *</label>
              <input v-model="cliente.email" type="email" required />
            </div>

            <div class="form-group">
              <label>Telefone *</label>
              <input v-model="cliente.telefone" type="tel" required />
            </div>

            <div class="form-group">
              <label>CPF *</label>
              <input v-model="cliente.cpf" type="text" required />
            </div>

            <div class="form-group full-width">
              <label>Endereço *</label>
              <input v-model="cliente.endereco" type="text" required />
            </div>

            <div class="form-group">
              <label>Cidade *</label>
              <input v-model="cliente.cidade" type="text" required />
            </div>

            <div class="form-group">
              <label>Estado *</label>
              <input v-model="cliente.estado" type="text" required />
            </div>

            <div class="form-group">
              <label>CEP *</label>
              <input v-model="cliente.cep" type="text" required />
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Forma de Pagamento</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Forma de Pagamento *</label>
              <select v-model="pagamento.forma" required>
                <option v-for="forma in formasPagamento" :key="forma" :value="forma">
                  {{ forma }}
                </option>
              </select>
            </div>

            <div v-if="pagamento.forma.includes('Cartão')" class="form-group">
              <label>Número do Cartão *</label>
              <input v-model="pagamento.numero" type="text" required />
            </div>

            <div v-if="pagamento.forma.includes('Cartão')" class="form-group">
              <label>Nome do Titular *</label>
              <input v-model="pagamento.titular" type="text" required />
            </div>

            <div v-if="pagamento.forma.includes('Cartão')" class="form-group">
              <label>Validade *</label>
              <input v-model="pagamento.validade" type="text" placeholder="MM/AA" required />
            </div>

            <div v-if="pagamento.forma.includes('Cartão')" class="form-group">
              <label>CVV *</label>
              <input v-model="pagamento.cvv" type="text" required />
            </div>

            <div v-if="pagamento.forma === 'Cartão de Crédito'" class="form-group">
              <label>Parcelas</label>
              <select v-model="pagamento.parcelas">
                <option v-for="parcela in parcelasOptions" :key="parcela" :value="parcela">
                  {{ parcela }}x de {{ formatarMoeda(valorParcela) }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="checkout-sidebar">
        <div class="cart-summary">
          <h2>Resumo do Pedido</h2>

          <div class="cart-items">
            <div v-for="produto in produtos" :key="produto.id" class="cart-item">
              <img :src="produto.imagem" :alt="produto.nome" class="item-image" />
              <div class="item-info">
                <h3 class="item-name">{{ produto.nome }}</h3>
                <div class="item-price">{{ formatarMoeda(produto.preco) }}</div>
              </div>
              <div class="item-quantity">
                <button @click="updateQuantidade(produto, -1)" class="btn-quantity">-</button>
                <span class="quantity">{{ produto.quantidade }}</span>
                <button @click="updateQuantidade(produto, 1)" class="btn-quantity">+</button>
              </div>
              <button @click="removeProduto(produto.id)" class="btn-remove">🗑️</button>
            </div>
          </div>

          <div class="cart-totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>{{ formatarMoeda(subtotal) }}</span>
            </div>
            <div class="total-row">
              <span>Frete:</span>
              <span>{{ formatarMoeda(frete) }}</span>
            </div>
            <div class="total-row total-final">
              <span>Total:</span>
              <span>{{ formatarMoeda(total) }}</span>
            </div>
          </div>

          <button @click="processarPagamento" class="btn-checkout">Finalizar Compra</button>
        </div>
      </div>
    </div>

    <div v-if="showProcessingModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Processando Pagamento</h2>
        </div>

        <div class="modal-body">
          <div v-if="!processingResult" class="processing-state">
            <div class="loading-spinner"></div>
            <p class="processing-status">{{ processingStatus }}</p>
          </div>

          <div v-else class="result-state">
            <div
              class="result-icon"
              :class="{ success: processingResult.sucesso, error: !processingResult.sucesso }"
            >
              {{ processingResult.sucesso ? '✅' : '❌' }}
            </div>
            <h3 class="result-title">
              {{ processingResult.sucesso ? 'Pagamento Aprovado!' : 'Pagamento Recusado' }}
            </h3>
            <p class="result-message">{{ processingResult.mensagem }}</p>
            <div class="result-code">Código: {{ processingResult.codigo }}</div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="fecharModal" class="btn-close">
            {{ processingResult ? 'Fechar' : 'Cancelar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.checkout-header {
  text-align: center;
  margin-bottom: 32px;
}

.checkout-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.checkout-header p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
}

.checkout-main {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.section h2 {
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

.checkout-sidebar {
  position: sticky;
  top: 24px;
  height: fit-content;
}

.cart-summary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.cart-summary h2 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 24px 0;
}

.cart-items {
  margin-bottom: 24px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
}

.item-price {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-quantity {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-quantity:hover {
  background: rgba(255, 255, 255, 0.2);
}

.quantity {
  font-size: 14px;
  color: white;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.btn-remove {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.cart-totals {
  margin-bottom: 24px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.total-final {
  font-size: 18px;
  font-weight: 700;
  color: white;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
  margin-top: 8px;
}

.btn-checkout {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-checkout:hover {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  backdrop-filter: blur(20px);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.modal-body {
  padding: 32px 24px;
  text-align: center;
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #007aff;
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

.processing-status {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.result-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.result-icon {
  font-size: 48px;
}

.result-icon.success {
  color: #4caf50;
}

.result-icon.error {
  color: #f44336;
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.result-message {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.5;
}

.result-code {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 8px;
  font-family: monospace;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.btn-close {
  padding: 12px 24px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .checkout-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .item-quantity {
    align-self: flex-end;
  }
}
</style>
