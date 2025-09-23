<template>
  <BaseChart
    :chart-data="chartData"
    :chart-options="chartOptions"
    :loading="loading"
    chart-type="bar"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  chartType: { type: String, default: 'horizontal' }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const labels = props.data.map(item => item.category_name || item.category)
  const romiData = props.data.map(item => item.romi || 0)
  const budgetData = props.data.map(item => item.budget || 0)

  const maxBudget = Math.max(...budgetData)

  return {
    labels,
    datasets: [
      {
        label: 'ROMI (%)',
        data: romiData,
        backgroundColor: romiData.map(value => getROMIColor(value)),
        borderColor: romiData.map(value => getROMIColor(value, false)),
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Бюджет',
        data: budgetData,
        backgroundColor: 'rgba(54, 162, 235, 0.3)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
        yAxisID: 'y1',
        type: 'line',
        fill: false,
        tension: 0.1
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: props.chartType === 'horizontal' ? 'y' : 'x',
  plugins: {
    title: {
      display: true,
      text: 'ROMI по категориям'
    },
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const dataIndex = context.dataIndex
          const category = props.data[dataIndex]

          if (context.dataset.label === 'ROMI (%)') {
            return [
              `ROMI: ${context.parsed.x || context.parsed.y}%`,
              `Доходы: ${formatCurrency(category.revenue)}`,
              `Затраты: ${formatCurrency(category.costs)}`
            ]
          } else {
            return `Бюджет: ${formatCurrency(context.parsed.x || context.parsed.y)}`
          }
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: props.chartType === 'horizontal' ? 'ROMI (%)' : 'Категории'
      },
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: props.chartType === 'horizontal' ? 'Категории' : 'ROMI (%)'
      },
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        callback: function(value) {
          return props.chartType === 'horizontal' ? value : value + '%'
        }
      }
    },
    y1: {
      type: 'linear',
      display: false,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      }
    }
  }
}))

const getROMIColor = (romi, withAlpha = true) => {
  const alpha = withAlpha ? '0.7' : '1'

  if (romi >= 300) return `rgba(76, 175, 80, ${alpha})`    // Зеленый
  if (romi >= 200) return `rgba(139, 195, 74, ${alpha})`   // Светло-зеленый
  if (romi >= 100) return `rgba(255, 193, 7, ${alpha})`    // Желтый
  if (romi >= 50) return `rgba(255, 152, 0, ${alpha})`     // Оранжевый
  return `rgba(244, 67, 54, ${alpha})`                     // Красный
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(value)
}
</script>