<script setup>
import { ref, computed } from 'vue'

const produtos = ref([
  {
    id: 1,
    nome: 'iPhone 15 Pro',
    descricao: 'Smartphone Apple com chip A17 Pro, câmera tripla e design em titânio',
    categoria: 'Smartphones',
    preco: 8999.99,
    estoque: 45,
    vendas: 156,
    status: 'Ativo',
    imagem: '/src/assets/photos/s3.png',
  },
  {
    id: 2,
    nome: 'MacBook Air M2',
    descricao: 'Notebook Apple com chip M2, 13.6" Retina e até 18h de bateria',
    categoria: 'Notebooks',
    preco: 9999.99,
    estoque: 23,
    vendas: 89,
    status: 'Ativo',
    imagem: '/src/assets/photos/tenis.png',
  },
  {
    id: 3,
    nome: 'Samsung Galaxy S24',
    descricao: 'Smartphone Samsung com IA integrada, câmera de 200MP e S Pen',
    categoria: 'Smartphones',
    preco: 6999.99,
    estoque: 67,
    vendas: 134,
    status: 'Ativo',
    imagem: '/src/assets/photos/tv.png',
  },
  {
    id: 4,
    nome: 'iPad Pro 12.9"',
    descricao: 'Tablet Apple com chip M2, 12.9" Liquid Retina XDR e Apple Pencil',
    categoria: 'Tablets',
    preco: 8999.99,
    estoque: 12,
    vendas: 67,
    status: 'Ativo',
    imagem: '/src/assets/photos/fone.png',
  },
  {
    id: 5,
    nome: 'AirPods Pro',
    descricao: 'Fones de ouvido Apple com cancelamento de ruído ativo e áudio espacial',
    categoria: 'Acessórios',
    preco: 2499.99,
    estoque: 89,
    vendas: 234,
    status: 'Ativo',
    imagem: '/src/assets/photos/capa de celular.png',
  },
  {
    id: 6,
    nome: 'Dell XPS 13',
    descricao: 'Notebook Dell com Intel Core i7, 13.4" InfinityEdge e design premium',
    categoria: 'Notebooks',
    preco: 7999.99,
    estoque: 8,
    vendas: 45,
    status: 'Esgotado',
    imagem: '/src/assets/photos/s3.png',
  },
])

const showModal = ref(false)
const editingProduct = ref(null)
const searchTerm = ref('')
const selectedCategoria = ref('Todas')
const selectedStatus = ref('Todos')
const sortBy = ref('nome')

const novoProduto = ref({
  nome: '',
  descricao: '',
  categoria: 'Smartphones',
  preco: 0,
  estoque: 0,
  status: 'Ativo',
  imagem: '/src/assets/photos/s3.png',
})

const categoriaOptions = ref(['Todas', 'Smartphones', 'Notebooks', 'Tablets', 'Acessórios', 'Smart TVs'])
const statusOptions = ref(['Todos', 'Ativo', 'Esgotado'])

const produtosFiltrados = computed(() => {
  let filtered = produtos.value

  if (searchTerm.value) {
    filtered = filtered.filter(
      (produto) =>
        produto.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
  }

  if (selectedCategoria.value !== 'Todas') {
    filtered = filtered.filter((produto) => produto.categoria === selectedCategoria.value)
  }

  if (selectedStatus.value !== 'Todos') {
    filtered = filtered.filter((produto) => produto.status === selectedStatus.value)
  }

  if (sortBy.value === 'nome') {
    filtered.sort((a, b) => a.nome.localeCompare(b.nome))
  } else if (sortBy.value === 'preco') {
    filtered.sort((a, b) => a.preco - b.preco)
  } else if (sortBy.value === 'vendas') {
    filtered.sort((a, b) => b.vendas - a.vendas)
  }

  return filtered
})

const estatisticas = computed(() => {
  const total = produtos.value.length
  const ativos = produtos.value.filter((p) => p.status === 'Ativo').length
  const esgotados = produtos.value.filter((p) => p.status === 'Esgotado').length
  const totalVendas = produtos.value.reduce((sum, p) => sum + p.vendas, 0)
  const mediaPreco = produtos.value.reduce((sum, p) => sum + p.preco, 0) / total

  return {
    total,
    ativos,
    esgotados,
    totalVendas,
    mediaPreco: Math.round(mediaPreco * 100) / 100,
  }
})

const openModal = (produto = null) => {
  editingProduct.value = produto
  if (produto) {
    novoProduto.value = { ...produto }
  } else {
    novoProduto.value = {
      nome: '',
      descricao: '',
      categoria: 'Smartphones',
      preco: 0,
      estoque: 0,
      status: 'Ativo',
      imagem: '/src/assets/photos/s3.png',
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
}

const saveProduct = () => {
  if (editingProduct.value) {
    const index = produtos.value.findIndex((p) => p.id === editingProduct.value.id)
    produtos.value[index] = { ...novoProduto.value, id: editingProduct.value.id }
  } else {
    const newId = Math.max(...produtos.value.map((p) => p.id)) + 1
    produtos.value.push({
      ...novoProduto.value,
      id: newId,
      vendas: 0,
    })
  }
  closeModal()
}

const deleteProduct = (id) => {
  produtos.value = produtos.value.filter((p) => p.id !== id)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Ativo':
      return '#4CAF50'
    case 'Esgotado':
      return '#F44336'
    default:
      return '#9E9E9E'
  }
}

const getStatusBgColor = (status) => {
  switch (status) {
    case 'Ativo':
      return 'rgba(76, 175, 80, 0.1)'
    case 'Esgotado':
      return 'rgba(244, 67, 54, 0.1)'
    default:
      return 'rgba(158, 158, 158, 0.1)'
  }
}

const formatarMoeda = (valor) => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
</script>

<template>
  <div class="produtos-container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <h3>Total de Produtos</h3>
          <div class="stat-value">{{ estatisticas.total }}</div>
          <div class="stat-subtitle">Cadastrados</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>Produtos Ativos</h3>
          <div class="stat-value">{{ estatisticas.ativos }}</div>
          <div class="stat-subtitle">Disponíveis</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Total de Vendas</h3>
          <div class="stat-value">{{ estatisticas.totalVendas.toLocaleString('pt-BR') }}</div>
          <div class="stat-subtitle">Unidades vendidas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Preço Médio</h3>
          <div class="stat-value">{{ formatarMoeda(estatisticas.mediaPreco) }}</div>
          <div class="stat-subtitle">Por produto</div>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Buscar produtos..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>

      <div class="filters-row">
        <select v-model="selectedCategoria" class="filter-select">
          <option v-for="categoria in categoriaOptions" :key="categoria" :value="categoria">
            {{ categoria }}
          </option>
        </select>

        <select v-model="selectedStatus" class="filter-select">
          <option v-for="status in statusOptions" :key="status" :value="status">
            {{ status }}
          </option>
        </select>

        <select v-model="sortBy" class="filter-select">
          <option value="nome">Ordenar por Nome</option>
          <option value="preco">Ordenar por Preço</option>
          <option value="vendas">Ordenar por Vendas</option>
        </select>

        <button @click="openModal()" class="btn-primary">
          <span>➕</span>
          Adicionar Produto
        </button>
      </div>
    </div>

    <div class="products-grid">
      <div v-for="produto in produtosFiltrados" :key="produto.id" class="product-card">
        <div class="product-image">
          <img :src="produto.imagem" :alt="produto.nome" />
        </div>

        <div class="product-info">
          <h3 class="product-name">{{ produto.nome }}</h3>
          <p class="product-description">{{ produto.descricao }}</p>

          <div class="product-meta">
            <span class="product-category">{{ produto.categoria }}</span>
            <span
              class="product-status"
              :style="{
                color: getStatusColor(produto.status),
                backgroundColor: getStatusBgColor(produto.status),
              }"
            >
              {{ produto.status }}
            </span>
          </div>

          <div class="product-stats">
            <div class="stat-item">
              <span class="stat-label">Preço:</span>
              <span class="stat-value">{{ formatarMoeda(produto.preco) }}</span>
            </div>

            <div class="stat-item">
              <span class="stat-label">Estoque:</span>
              <span class="stat-value" :class="{ 'low-stock': produto.estoque < 10 }">
                {{ produto.estoque }} unidades
              </span>
            </div>

            <div class="stat-item">
              <span class="stat-label">Vendas:</span>
              <span class="stat-value">{{ produto.vendas.toLocaleString('pt-BR') }}</span>
            </div>
          </div>

          <div class="product-actions">
            <button @click="openModal(produto)" class="btn-edit">✏️</button>
            <button @click="deleteProduct(produto.id)" class="btn-delete">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Editar Produto' : 'Adicionar Produto' }}</h2>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Nome do Produto *</label>
              <input v-model="novoProduto.nome" type="text" required />
            </div>

            <div class="form-group">
              <label>Categoria *</label>
              <select v-model="novoProduto.categoria" required>
                <option value="Smartphones">Smartphones</option>
                <option value="Notebooks">Notebooks</option>
                <option value="Tablets">Tablets</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Smart TVs">Smart TVs</option>
              </select>
            </div>

            <div class="form-group">
              <label>Preço (R$) *</label>
              <input v-model="novoProduto.preco" type="number" step="0.01" min="0" required />
            </div>

            <div class="form-group">
              <label>Estoque *</label>
              <input v-model="novoProduto.estoque" type="number" min="0" required />
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="novoProduto.status">
                <option value="Ativo">Ativo</option>
                <option value="Esgotado">Esgotado</option>
              </select>
            </div>

            <div class="form-group">
              <label>URL da Imagem</label>
              <input v-model="novoProduto.imagem" type="url" />
            </div>

            <div class="form-group full-width">
              <label>Descrição *</label>
              <textarea v-model="novoProduto.descricao" rows="3" required></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Cancelar</button>
          <button @click="saveProduct" class="btn-primary">Salvar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.produtos-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-content h3 {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.filters-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 16px 48px 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007aff;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 20px rgba(0, 122, 255, 0.3);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
}

.filters-row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  min-width: 150px;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #007aff;
  background: rgba(255, 255, 255, 0.15);
}

.filter-select option {
  background: #1a1a1a;
  color: white;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #007aff, #0056cc);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056cc, #004499);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 122, 255, 0.4);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.product-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  border-color: rgba(0, 122, 255, 0.3);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.1);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 20px;
}

.product-name {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
}

.product-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.product-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.product-category {
  padding: 4px 12px;
  background: rgba(0, 122, 255, 0.2);
  color: #007aff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.product-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.product-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.low-stock {
  color: #ff9800;
}

.product-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-edit,
.btn-delete {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #007aff;
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.btn-edit:hover,
.btn-delete:hover {
  transform: scale(1.1);
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 24px;
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
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary {
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

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .produtos-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    min-width: auto;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .product-stats {
    grid-template-columns: 1fr;
  }
}
</style>
