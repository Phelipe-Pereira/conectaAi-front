<script setup>
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler,
)

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

const estatisticas = ref({
  vendasTotal: 4200,
  receitaTotal: 0,
  crescimentoVendas: 0,
  crescimentoReceita: 0,
  mediaVendas: 350,
  mediaReceita: 0,
})

const calcularEstatisticas = () => {
  const vendas = vendasMensais.value.datasets[0].data
  const receitas = receitaMensal.value.datasets[0].data

  estatisticas.value.vendasTotal = vendas.reduce((a, b) => a + b, 0)
  estatisticas.value.receitaTotal = receitas.reduce((a, b) => a + b, 0)
  estatisticas.value.mediaVendas = Math.round(estatisticas.value.vendasTotal / 12)
  estatisticas.value.mediaReceita = Math.round(estatisticas.value.receitaTotal / 12)

  const crescimentoVendas = ((vendas[11] - vendas[10]) / vendas[10]) * 100
  const crescimentoReceita = ((receitas[11] - receitas[10]) / receitas[10]) * 100

  estatisticas.value.crescimentoVendas = Math.round(crescimentoVendas * 10) / 10
  estatisticas.value.crescimentoReceita = Math.round(crescimentoReceita * 10) / 10
}

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
        callback: function (value) {
          return value.toLocaleString('pt-BR')
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
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: function (context) {
          return context.dataset.label + ': R$ ' + context.parsed.y.toLocaleString('pt-BR')
        },
      },
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
        callback: function (value) {
          return value + '%'
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
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: function (context) {
          return context.dataset.label + ': ' + context.parsed.y + '%'
        },
      },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: 'rgba(255, 255, 255, 0.7)',
        font: {
          size: 12,
        },
        padding: 20,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      titleColor: 'rgba(255, 255, 255, 0.9)',
      bodyColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: function (context) {
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((context.parsed / total) * 100).toFixed(1)
          return context.label + ': ' + percentage + '%'
        },
      },
    },
  },
}

onMounted(() => {
  calcularEstatisticas()
})
</script>

<template>
  <div class="dashboard-container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <h3>Vendas Totais</h3>
          <div class="stat-value">{{ estatisticas.vendasTotal.toLocaleString('pt-BR') }}</div>
          <div class="stat-change" :class="{ positive: estatisticas.crescimentoVendas > 0 }">
            {{ estatisticas.crescimentoVendas > 0 ? '+' : '' }}{{ estatisticas.crescimentoVendas }}%
          </div>
          <div class="stat-subtitle">vs mês anterior</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Receita Total</h3>
          <div class="stat-value">R$ {{ estatisticas.receitaTotal.toLocaleString('pt-BR') }}</div>
          <div class="stat-change" :class="{ positive: estatisticas.crescimentoReceita > 0 }">
            {{ estatisticas.crescimentoReceita > 0 ? '+' : ''
            }}{{ estatisticas.crescimentoReceita }}%
          </div>
          <div class="stat-subtitle">vs mês anterior</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>Média de Vendas</h3>
          <div class="stat-value">{{ estatisticas.mediaVendas.toLocaleString('pt-BR') }}</div>
          <div class="stat-subtitle">por mês</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <h3>Média de Receita</h3>
          <div class="stat-value">R$ {{ estatisticas.mediaReceita.toLocaleString('pt-BR') }}</div>
          <div class="stat-subtitle">por mês</div>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <h3>Vendas Mensais</h3>
        <div class="chart-container">
          <Line :data="vendasMensais" :options="chartOptions" />
        </div>
      </div>

      <div class="chart-card">
        <h3>Receita Mensal</h3>
        <div class="chart-container">
          <Line :data="receitaMensal" :options="chartOptions" />
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
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
  color: #f44336;
  margin-bottom: 4px;
}

.stat-change.positive {
  color: #4caf50;
}

.stat-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.chart-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0 0 20px 0;
}

.chart-container {
  height: 300px;
  position: relative;
}

.products-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.products-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 24px 0;
}

.products-grid {
  display: grid;
  gap: 16px;
}

.product-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.product-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(0, 122, 255, 0.3);
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
}

.product-stats {
  display: flex;
  gap: 24px;
}

.product-sales,
.product-revenue {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.product-bar-container {
  width: 120px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.product-bar {
  height: 100%;
  background: linear-gradient(90deg, #007aff, #0056cc);
  border-radius: 4px;
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    height: 250px;
  }

  .product-stats {
    flex-direction: column;
    gap: 8px;
  }

  .product-bar-container {
    width: 80px;
  }
}
</style>
