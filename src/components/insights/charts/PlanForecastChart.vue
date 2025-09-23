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
  forecastPeriod: { type: String, default: '12m' }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const historicalLabels = props.data.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      year: 'numeric'
    })
  })

  const forecastLabels = props.forecast.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      year: 'numeric'
    })
  })

  const allLabels = [...historicalLabels, ...forecastLabels]

  // Исторические данные
  const historicalBudget = props.data.map(item => item.budget)
  const historicalRevenue = props.data.map(item => item.revenue)
  const historicalROI = props.data.map(item => item.roi)

  // Прогнозные данные
  const forecastBudget = Array(historicalLabels.length).fill(null).concat(
    props.forecast.map(item => item.predicted_budget)
  )
  const forecastRevenue = Array(historicalLabels.length).fill(null).concat(
    props.forecast.map(item => item.predicted_revenue)
  )
  const forecastROI = Array(historicalLabels.length).fill(null).concat(
    props.forecast.map(item => item.predicted_roi)
  )

  // Доверительные интервалы
  const upperBudget = Array(historicalLabels.length).fill(null).concat(
    props.forecast.map(item => item.budget_upper_bound)
  )
  const lowerBudget = Array(historicalLabels.length).fill(null).concat(
    props.forecast.map(item => item.budget_lower_bound)
  )

  return {
    labels: allLabels,
    datasets: [
      {
        label: 'Исторический бюджет',
        data: [...historicalBudget, ...Array(forecastLabels.length).fill(null)],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Прогноз бюджета',
        data: forecastBudget,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Исторические доходы',
        data: [...historicalRevenue, ...Array(forecastLabels.length).fill(null)],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Прогноз доходов',
        data: forecastRevenue,
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 4,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Исторический ROI',
        data: [...historicalROI, ...Array(forecastLabels.length).fill(null)],
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4,
        yAxisID: 'y1'
      },
      {
        label: 'Прогноз ROI',
        data: forecastROI,
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgba(255, 205, 86, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 3,
        tension: 0.4,
        yAxisID: 'y1'
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
      text: 'Прогноз планирования инвестиций',
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    legend: {
      display: true,
      position: 'top',
      labels: {
        padding: 20,
        usePointStyle: true
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || ''
          const value = context.parsed.y

          if (value === null) return null

          if (label.includes('ROI')) {
            return `${label}: ${value}%`
          } else {
            const formattedValue = new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
              minimumFractionDigits: 0,
              notation: 'compact'
            }).format(value)
            return `${label}: ${formattedValue}`
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
        text: 'Период'
      },
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
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
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'ROI (%)'
      },
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        callback: function(value) {
          return value + '%'
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