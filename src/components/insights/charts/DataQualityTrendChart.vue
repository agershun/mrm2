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
  loading: { type: Boolean, default: false },
  timeRange: { type: String, default: '30d' },
  metrics: { type: Array, default: () => ['overall', 'completeness', 'accuracy', 'consistency'] }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const labels = props.data.map(item => {
    const date = new Date(item.date)
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric'
    })
  })

  const colors = {
    overall: {
      border: 'rgb(75, 192, 192)',
      background: 'rgba(75, 192, 192, 0.1)'
    },
    completeness: {
      border: 'rgb(255, 99, 132)',
      background: 'rgba(255, 99, 132, 0.1)'
    },
    accuracy: {
      border: 'rgb(255, 159, 64)',
      background: 'rgba(255, 159, 64, 0.1)'
    },
    consistency: {
      border: 'rgb(153, 102, 255)',
      background: 'rgba(153, 102, 255, 0.1)'
    },
    timeliness: {
      border: 'rgb(54, 162, 235)',
      background: 'rgba(54, 162, 235, 0.1)'
    },
    validity: {
      border: 'rgb(255, 205, 86)',
      background: 'rgba(255, 205, 86, 0.1)'
    },
    uniqueness: {
      border: 'rgb(201, 203, 207)',
      background: 'rgba(201, 203, 207, 0.1)'
    }
  }

  const metricLabels = {
    overall: 'Общее качество',
    completeness: 'Полнота данных',
    accuracy: 'Точность',
    consistency: 'Согласованность',
    timeliness: 'Актуальность',
    validity: 'Валидность',
    uniqueness: 'Уникальность'
  }

  const datasets = props.metrics.map(metric => {
    const data = props.data.map(item => item.metrics?.[metric] || item[metric] || 0)
    const color = colors[metric] || colors.overall

    return {
      label: metricLabels[metric] || metric,
      data,
      borderColor: color.border,
      backgroundColor: color.background,
      borderWidth: metric === 'overall' ? 3 : 2,
      pointRadius: metric === 'overall' ? 5 : 3,
      pointHoverRadius: metric === 'overall' ? 7 : 5,
      tension: 0.4,
      fill: metric === 'overall' ? 'origin' : false
    }
  })

  return {
    labels,
    datasets
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
      text: 'Тренды качества данных',
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
          return `${label}: ${value}%`
        },
        afterBody: function(tooltipItems) {
          const dataIndex = tooltipItems[0].dataIndex
          const dataPoint = props.data[dataIndex]

          if (dataPoint.issues && dataPoint.issues.length > 0) {
            return [
              '',
              'Основные проблемы:',
              ...dataPoint.issues.slice(0, 3).map(issue => `• ${issue}`)
            ]
          }
          return []
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: getTimeRangeLabel(props.timeRange)
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
        text: 'Качество (%)'
      },
      min: 0,
      max: 100,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
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

const getTimeRangeLabel = (range) => {
  const labels = {
    '7d': 'Последние 7 дней',
    '30d': 'Последние 30 дней',
    '90d': 'Последние 3 месяца',
    '1y': 'Последний год'
  }
  return labels[range] || 'Период'
}
</script>