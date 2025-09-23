<template>
  <BaseChart
    :chart-data="chartData"
    :chart-options="chartOptions"
    :loading="loading"
    chart-type="line"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  forecast: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  dateRange: { type: Array, default: () => [] }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const historicalLabels = props.data.map(item => item.date)
  const forecastLabels = props.forecast.map(item => item.date)
  const allLabels = [...historicalLabels, ...forecastLabels]

  // Исторические данные
  const historicalRevenue = props.data.map(item => item.revenue)
  const historicalCosts = props.data.map(item => item.costs)

  // Прогнозные данные
  const forecastRevenue = Array(historicalLabels.length).fill(null).concat(
    props.forecast.map(item => item.predicted_revenue)
  )
  const forecastCosts = Array(historicalLabels.length).fill(null).concat(
    props.forecast.map(item => item.predicted_costs)
  )

  // Доверительные интервалы
  const upperBound = Array(historicalLabels.length).fill(null).concat(
    props.forecast.map(item => item.upper_bound)
  )
  const lowerBound = Array(historicalLabels.length).fill(null).concat(
    props.forecast.map(item => item.lower_bound)
  )

  return {
    labels: allLabels,
    datasets: [
      {
        label: 'Исторические доходы',
        data: [...historicalRevenue, ...Array(forecastLabels.length).fill(null)],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.4
      },
      {
        label: 'Прогноз доходов',
        data: forecastRevenue,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4,
        tension: 0.4
      },
      {
        label: 'Исторические затраты',
        data: [...historicalCosts, ...Array(forecastLabels.length).fill(null)],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4
      },
      {
        label: 'Прогноз затрат',
        data: forecastCosts,
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgba(255, 205, 86, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 3,
        tension: 0.4
      },
      {
        label: 'Верхняя граница',
        data: upperBound,
        borderColor: 'rgba(255, 99, 132, 0.3)',
        backgroundColor: 'rgba(255, 99, 132, 0.05)',
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Нижняя граница',
        data: lowerBound,
        borderColor: 'rgba(255, 99, 132, 0.3)',
        backgroundColor: 'rgba(255, 99, 132, 0.05)',
        borderWidth: 1,
        pointRadius: 0,
        fill: '-1',
        tension: 0.4
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    title: {
      display: true,
      text: 'Прогноз производительности'
    },
    legend: {
      display: true,
      position: 'top',
      labels: {
        filter: function(legendItem) {
          return !legendItem.text.includes('граница')
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || ''
          const value = context.parsed.y

          if (value === null) return null

          const formattedValue = new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
          }).format(value)

          return `${label}: ${formattedValue}`
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Период'
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
        text: 'Сумма (₽)'
      },
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            notation: 'compact'
          }).format(value)
        }
      }
    }
  },
  elements: {
    point: {
      hoverRadius: 8
    }
  }
}))
</script>