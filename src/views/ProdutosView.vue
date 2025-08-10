<script setup>
import { ref, computed } from 'vue'

const produtos = ref([
  {
    id: 1,
    nome: 'Smartphone Galaxy S23',
    preco: 2999.99,
    precoOriginal: 3499.99,
    descricao: 'Smartphone Samsung Galaxy S23 com 128GB, 8GB RAM, câmera tripla e tela 6.1"',
    categoria: 'Eletrônicos',
    estoque: 15,
    status: 'Ativo',
    imagem: '/src/assets/photos/s3.png',
    vendas: 45,
    avaliacao: 4.8,
  },
  {
    id: 2,
    nome: 'Fones de Ouvido Wireless',
    preco: 299.99,
    precoOriginal: 399.99,
    descricao: 'Fones de ouvido bluetooth com cancelamento de ruído e bateria de 30h',
    categoria: 'Eletrônicos',
    estoque: 8,
    status: 'Ativo',
    imagem: '/src/assets/photos/fone.png',
    vendas: 32,
    avaliacao: 4.6,
  },
  {
    id: 3,
    nome: 'Smart TV 55" 4K',
    preco: 2499.99,
    precoOriginal: 2999.99,
    descricao: 'Smart TV Samsung 55" 4K Ultra HD com HDR e Android TV',
    categoria: 'Eletrônicos',
    estoque: 3,
    status: 'Ativo',
    imagem: '/src/assets/photos/tv.png',
    vendas: 18,
    avaliacao: 4.9,
  },
  {
    id: 4,
    nome: 'Tênis Esportivo',
    preco: 199.99,
    precoOriginal: 249.99,
    descricao: 'Tênis esportivo para corrida com amortecimento e respirabilidade',
    categoria: 'Esportes',
    estoque: 0,
    status: 'Esgotado',
    imagem: '/src/assets/photos/tenis.png',
    vendas: 67,
    avaliacao: 4.7,
  },
  {
    id: 5,
    nome: 'Capa Protetora Premium',
    preco: 89.99,
    precoOriginal: 89.99,
    descricao: 'Capa protetora premium para smartphone com proteção militar',
    categoria: 'Acessórios',
    estoque: 25,
    status: 'Ativo',
    imagem: '/src/assets/photos/capa de celular.png',
    vendas: 89,
    avaliacao: 4.5,
  },
])

const categorias = ref(['Todos', 'Eletrônicos', 'Esportes', 'Acessórios', 'Casa', 'Vestuário'])
const statusOptions = ref(['Todos', 'Ativo', 'Inativo', 'Esgotado'])

const showModal = ref(false)
const editingProduct = ref(null)
const searchTerm = ref('')
const selectedCategory = ref('Todos')
const selectedStatus = ref('Todos')
const sortBy = ref('nome')

const novoProduto = ref({
  nome: '',
  preco: '',
  precoOriginal: '',
  descricao: '',
  categoria: 'Eletrônicos',
  estoque: 0,
  status: 'Ativo',
  imagem: 'https://via.placeholder.com/300x300/0066CC/FFFFFF?text=📦',
})

const produtosFiltrados = computed(() => {
  let filtered = produtos.value

  // Filtro por busca
  if (searchTerm.value) {
    filtered = filtered.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  // Filtro por categoria
  if (selectedCategory.value !== 'Todos') {
    filtered = filtered.filter((produto) => produto.categoria === selectedCategory.value)
  }

  // Filtro por status
  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((produto) => produto.status === selectedStatus.value)
  }

  // Ordenação
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'nome':
        return a.nome.localeCompare(b.nome)
      case 'preco':
        return a.preco - b.preco
      case 'vendas':
        return b.vendas - a.vendas
      case 'estoque':
        return b.estoque - a.estoque
      default:
        return 0
    }
  })

  return filtered
})

const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

const abrirModal = (produto = null) => {
  if (produto) {
    editingProduct.value = produto
    novoProduto.value = { ...produto }
  } else {
    editingProduct.value = null
    novoProduto.value = {
      nome: '',
      preco: '',
      precoOriginal: '',
      descricao: '',
      categoria: 'Eletrônicos',
      estoque: 0,
      status: 'Ativo',
      imagem: 'https://via.placeholder.com/300x300/0066CC/FFFFFF?text=📦',
    }
  }
  showModal.value = true
}

const fecharModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const salvarProduto = () => {
  if (!novoProduto.value.nome || !novoProduto.value.preco) {
    alert('Por favor, preencha os campos obrigatórios')
    return
  }

  if (editingProduct.value) {
    // Editar produto existente
    const index = produtos.value.findIndex((p) => p.id === editingProduct.value.id)
    if (index !== -1) {
      produtos.value[index] = { ...novoProduto.value, id: editingProduct.value.id }
    }
  } else {
    // Adicionar novo produto
    const novoId = Math.max(...produtos.value.map((p) => p.id)) + 1
    produtos.value.push({
      ...novoProduto.value,
      id: novoId,
      vendas: 0,
      avaliacao: 0,
    })
  }

  fecharModal()
}

const excluirProduto = (id) => {
  if (confirm('Tem certeza que deseja excluir este produto?')) {
    produtos.value = produtos.value.filter((p) => p.id !== id)
  }
}

const toggleStatus = (produto) => {
  produto.status = produto.status === 'Ativo' ? 'Inativo' : 'Ativo'
}
</script>

<template>
  <div class="produtos-container">
    <div class="page-header">
      <div class="header-content">
        <h1>Gerenciar Produtos</h1>
        <p class="subtitle">Gerencie o catálogo de produtos do ConectaAI</p>
      </div>
      <button @click="abrirModal()" class="btn btn-primary">
        <span>+</span>
        Novo Produto
      </button>
    </div>

    <!-- Filtros e Busca -->
    <div class="filtros-section card">
      <div class="filtros-header">
        <h3>Filtros e Busca</h3>
        <span class="resultados">{{ produtosFiltrados.length }} produtos encontrados</span>
      </div>

      <div class="filtros-grid">
        <div class="filtro-item">
          <label>Buscar</label>
          <input
            v-model="searchTerm"
            type="text"
            class="input"
            placeholder="Buscar por nome ou descrição..."
          />
        </div>

        <div class="filtro-item">
          <label>Categoria</label>
          <select v-model="selectedCategory" class="input">
            <option v-for="categoria in categorias" :key="categoria" :value="categoria">
              {{ categoria }}
            </option>
          </select>
        </div>

        <div class="filtro-item">
          <label>Status</label>
          <select v-model="selectedStatus" class="input">
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>

        <div class="filtro-item">
          <label>Ordenar por</label>
          <select v-model="sortBy" class="input">
            <option value="nome">Nome</option>
            <option value="preco">Preço</option>
            <option value="vendas">Vendas</option>
            <option value="estoque">Estoque</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista de Produtos -->
    <div class="produtos-grid">
      <div v-for="produto in produtosFiltrados" :key="produto.id" class="produto-card card">
        <div class="produto-imagem">
          <img :src="produto.imagem" :alt="produto.nome" />
          <div class="produto-status" :class="produto.status.toLowerCase()">
            {{ produto.status }}
          </div>
          <div class="produto-acoes">
            <button @click="abrirModal(produto)" class="btn-acao" title="Editar">✏️</button>
            <button @click="excluirProduto(produto.id)" class="btn-acao" title="Excluir">🗑️</button>
          </div>
        </div>

        <div class="produto-info">
          <h3 class="produto-nome">{{ produto.nome }}</h3>
          <p class="produto-descricao">{{ produto.descricao }}</p>

          <div class="produto-categoria">
            <span class="categoria-tag">{{ produto.categoria }}</span>
          </div>

          <div class="produto-precos">
            <span class="preco-atual">{{ formatarMoeda(produto.preco) }}</span>
            <span v-if="produto.precoOriginal > produto.preco" class="preco-original">
              {{ formatarMoeda(produto.precoOriginal) }}
            </span>
          </div>

          <div class="produto-stats">
            <div class="stat-item">
              <span class="stat-label">Estoque:</span>
              <span class="stat-value" :class="{ 'estoque-baixo': produto.estoque < 5 }">
                {{ produto.estoque }}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Vendas:</span>
              <span class="stat-value">{{ produto.vendas }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Avaliação:</span>
              <span class="stat-value">⭐ {{ produto.avaliacao }}</span>
            </div>
          </div>

          <div class="produto-actions">
            <button @click="toggleStatus(produto)" class="btn btn-secondary">
              {{ produto.status === 'Ativo' ? 'Desativar' : 'Ativar' }}
            </button>
            <button class="btn btn-primary">Ver Detalhes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Produto -->
    <div v-if="showModal" class="modal-overlay" @click="fecharModal">
      <div class="modal-content card" @click.stop>
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Editar Produto' : 'Novo Produto' }}</h2>
          <button @click="fecharModal" class="btn-close">×</button>
        </div>

        <form @submit.prevent="salvarProduto" class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome do Produto *</label>
              <input v-model="novoProduto.nome" type="text" class="input" required />
            </div>

            <div class="form-group">
              <label>Categoria</label>
              <select v-model="novoProduto.categoria" class="input">
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Esportes">Esportes</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Casa">Casa</option>
                <option value="Vestuário">Vestuário</option>
              </select>
            </div>

            <div class="form-group">
              <label>Preço Atual *</label>
              <input v-model="novoProduto.preco" type="number" step="0.01" class="input" required />
            </div>

            <div class="form-group">
              <label>Preço Original</label>
              <input v-model="novoProduto.precoOriginal" type="number" step="0.01" class="input" />
            </div>

            <div class="form-group">
              <label>Estoque</label>
              <input v-model="novoProduto.estoque" type="number" class="input" />
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="novoProduto.status" class="input">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Esgotado">Esgotado</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Descrição</label>
              <textarea v-model="novoProduto.descricao" class="input" rows="4"></textarea>
            </div>

            <div class="form-group full-width">
              <label>URL da Imagem</label>
              <input v-model="novoProduto.imagem" type="url" class="input" />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="fecharModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">
              {{ editingProduct ? 'Atualizar' : 'Cadastrar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.produtos-container {
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.header-content h1 {
  color: var(--text-primary);
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.filtros-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.filtros-header h3 {
  color: var(--text-primary);
  font-size: 1.25rem;
  margin: 0;
}

.resultados {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.filtro-item label {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
}

.produtos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-lg);
}

.produto-card {
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.produto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.produto-imagem {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.produto-imagem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.produto-status {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.produto-status.ativo {
  background-color: var(--success);
}

.produto-status.inativo {
  background-color: var(--text-secondary);
}

.produto-status.esgotado {
  background-color: var(--error);
}

.produto-acoes {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  display: flex;
  gap: var(--spacing-xs);
}

.btn-acao {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--border-radius-sm);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: background 0.2s ease;
}

.btn-acao:hover {
  background: rgba(0, 0, 0, 0.9);
}

.produto-info {
  padding: var(--spacing-lg);
}

.produto-nome {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
}

.produto-descricao {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.4;
}

.produto-categoria {
  margin-bottom: var(--spacing-md);
}

.categoria-tag {
  background: var(--primary);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  font-size: 0.75rem;
  font-weight: 500;
}

.produto-precos {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.preco-atual {
  color: var(--success);
  font-size: 1.25rem;
  font-weight: 600;
}

.preco-original {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-decoration: line-through;
}

.produto-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-sm);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.75rem;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.875rem;
}

.estoque-baixo {
  color: var(--error);
}

.produto-actions {
  display: flex;
  gap: var(--spacing-sm);
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  transition: background-color 0.2s ease;
}

.btn-close:hover {
  background-color: var(--bg-tertiary);
}

.modal-body {
  padding: var(--spacing-lg);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
}

.form-group .input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-group .input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group textarea.input {
  resize: vertical;
  min-height: 100px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .filtros-grid {
    grid-template-columns: 1fr;
  }

  .produtos-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .produto-stats {
    grid-template-columns: 1fr;
  }

  .produto-actions {
    flex-direction: column;
  }
}
</style>
