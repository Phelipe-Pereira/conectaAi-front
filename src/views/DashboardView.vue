<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

// Dados de vendas mensais
const vendasMensais = ref({
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Vendas (R$)',
      data: [12500, 15800, 14200, 18900, 22100, 25600, 23400, 28700, 31200, 28900, 34500, 42100],
      borderColor: '#007AFF',
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#007AFF',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    },
  ],
})

// Dados de receita mensal
const receitaMensal = ref({
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Receita (R$)',
      data: [9800, 12400, 11800, 15200, 17800, 20100, 18900, 22500, 24800, 23100, 27600, 33400],
      borderColor: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#4CAF50',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    },
  ],
})

// Dados de vendas por categoria
const vendasPorCategoria = ref({
  labels: ['Smartphones', 'Notebooks', 'Tablets', 'Acessórios', 'Smart TVs'],
  datasets: [
    {
      data: [35, 25, 20, 15, 5],
      backgroundColor: ['#007AFF', '#4CAF50', '#FF9800', '#9C27B0', '#F44336'],
      borderColor: '#ffffff',
      borderWidth: 2,
    },
  ],
})

// Dados de crescimento mensal
const crescimentoMensal = ref({
  labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    {
      label: 'Crescimento (%)',
      data: [0, 26.4, -10.1, 33.1, 16.9, 15.8, -8.6, 22.6, 8.7, -7.4, 19.4, 21.7],
      backgroundColor: [
        '#4CAF50',
        '#4CAF50',
        '#F44336',
        '#4CAF50',
        '#4CAF50',
        '#4CAF50',
        '#F44336',
        '#4CAF50',
        '#4CAF50',
        '#F44336',
        '#4CAF50',
        '#4CAF50',
      ],
      borderColor: '#ffffff',
      borderWidth: 1,
      borderRadius: 4,
    },
  ],
})

// Produtos mais vendidos
const produtosMaisVendidos = [
  { nome: 'iPhone 15 Pro', vendas: 156, receita: 234000 },
  { nome: 'MacBook Air M2', vendas: 89, receita: 178000 },
  { nome: 'Samsung Galaxy S24', vendas: 134, receita: 201000 },
  { nome: 'iPad Pro 12.9"', vendas: 67, receita: 134000 },
  { nome: 'AirPods Pro', vendas: 234, receita: 117000 },
]

// Estatísticas gerais
const estatisticas = ref({
  vendasTotal: 0,
  receitaTotal: 0,
  crescimentoVendas: 0,
  crescimentoReceita: 0,
  mediaVendas: 0,
  mediaReceita: 0,
})

// Calcular estatísticas
const calcularEstatisticas = () => {
  const vendas = vendasMensais.value.datasets[0].data
  const receitas = receitaMensal.value.datasets[0].data

  estatisticas.value.vendasTotal = vendas.reduce((a, b) => a + b, 0)
  estatisticas.value.receitaTotal = receitas.reduce((a, b) => a + b, 0)
  estatisticas.value.mediaVendas = Math.round(estatisticas.value.vendasTotal / 12)
  estatisticas.value.mediaReceita = Math.round(estatisticas.value.receitaTotal / 12)

  // Calcular crescimento (último mês vs penúltimo mês)
  const crescimentoVendas = ((vendas[11] - vendas[10]) / vendas[10]) * 100
  const crescimentoReceita = ((receitas[11] - receitas[10]) / receitas[10]) * 100

  estatisticas.value.crescimentoVendas = Math.round(crescimentoVendas * 10) / 10
  estatisticas.value.crescimentoReceita = Math.round(crescimentoReceita * 10) / 10
}

// Máximo de vendas para calcular barras
const maxVendas = computed(() => {
  return Math.max(...produtosMaisVendidos.map((p) => p.vendas))
})

// Configurações dos gráficos
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12,
        },
      },
      border: {
        display: false,
      },
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12,
        },
      },
      border: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.9)',
      padding: 12,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
    },
  },
}

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12,
        },
      },
      border: {
        display: false,
      },
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12,
        },
      },
      border: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.9)',
      padding: 12,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.9)',
      padding: 12,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
    },
  },
}

onMounted(() => {
  calcularEstatisticas()
})
</script>

<template>
  <div class="dashboard-container">
    <!-- Cards de estatísticas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>Vendas Totais</h3>
          <div class="stat-value">R$ {{ estatisticas.vendasTotal.toLocaleString('pt-BR') }}</div>
          <div
            class="stat-change"
            :class="estatisticas.crescimentoVendas >= 0 ? 'positive' : 'negative'"
          >
            {{ estatisticas.crescimentoVendas >= 0 ? '+' : ''
            }}{{ estatisticas.crescimentoVendas }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Receita Total</h3>
          <div class="stat-value">R$ {{ estatisticas.receitaTotal.toLocaleString('pt-BR') }}</div>
          <div
            class="stat-change"
            :class="estatisticas.crescimentoReceita >= 0 ? 'positive' : 'negative'"
          >
            {{ estatisticas.crescimentoReceita >= 0 ? '+' : ''
            }}{{ estatisticas.crescimentoReceita }}%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Média Mensal</h3>
          <div class="stat-value">R$ {{ estatisticas.mediaVendas.toLocaleString('pt-BR') }}</div>
          <div class="stat-subtitle">Vendas</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <h3>Meta Atingida</h3>
          <div class="stat-value">87%</div>
          <div class="stat-subtitle">Do objetivo anual</div>
        </div>
      </div>
    </div>

    <!-- Gráficos principais -->
    <div class="charts-grid">
      <div class="chart-card">
        <h2>Vendas Mensais</h2>
        <div class="chart-container">
          <Line :data="vendasMensais" :options="chartOptions" />
        </div>
      </div>

      <div class="chart-card">
        <h2>Receita Mensal</h2>
        <div class="chart-container">
          <Line :data="receitaMensal" :options="chartOptions" />
        </div>
      </div>

      <div class="chart-card">
        <h2>Crescimento Mensal</h2>
        <div class="chart-container">
          <Bar :data="crescimentoMensal" :options="barChartOptions" />
        </div>
      </div>

      <div class="chart-card">
        <h2>Vendas por Categoria</h2>
        <div class="chart-container">
          <Doughnut :data="vendasPorCategoria" :options="doughnutOptions" />
        </div>
      </div>
    </div>

    <!-- Produtos mais vendidos -->
    <div class="products-section">
      <h2>Produtos Mais Vendidos</h2>
      <div class="products-grid">
        <div v-for="produto in produtosMaisVendidos" :key="produto.nome" class="product-card">
          <div class="product-info">
            <h3>{{ produto.nome }}</h3>
            <div class="product-stats">
              <span class="product-sales">{{ produto.vendas }} vendas</span>
              <span class="product-revenue">R$ {{ produto.receita.toLocaleString('pt-BR') }}</span>
            </div>
          </div>
          <div class="product-bar-container">
            <div
              class="product-bar"
              :style="{ width: (produto.vendas / maxVendas) * 100 + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Cards de estatísticas */
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

.stat-change {
  font-size: 14px;
  font-weight: 600;
}

.stat-change.positive {
  color: #4caf50;
}

.stat-change.negative {
  color: #f44336;
}

.stat-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

/* Grid de gráficos */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.chart-card h2 {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 20px 0;
}

.chart-container {
  height: 300px;
  position: relative;
}

/* Seção de produtos */
.products-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.products-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 20px 0;
}

.products-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.product-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.product-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.product-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.product-sales {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.product-revenue {
  font-size: 14px;
  color: #4caf50;
  font-weight: 600;
}

.product-bar-container {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.product-bar {
  height: 100%;
  background: linear-gradient(90deg, #007aff, #4caf50);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Responsividade */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
  }

  .product-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .product-stats {
    align-items: flex-start;
  }
}
</style>
