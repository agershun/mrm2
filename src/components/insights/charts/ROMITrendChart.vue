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
  channels: { type: Array, default: () => [] }
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

  const colors = [
    'rgb(75, 192, 192)',   // Общий ROMI
    'rgb(255, 99, 132)',   // Поисковая реклама
    'rgb(255, 159, 64)',   // Социальные сети
    'rgb(153, 102, 255)',  // Дисплейная реклама
    'rgb(54, 162, 235)',   // Email маркетинг
    'rgb(255, 205, 86)'    // Другие каналы
  ]

  // Общий ROMI
  const datasets = [{
    label: 'Общий ROMI',
    data: props.data.map(item => item.overall_romi || 0),
    borderColor: colors[0],
    backgroundColor: colors[0].replace('rgb', 'rgba').replace(')', ', 0.1)'),
    borderWidth: 3,
    pointRadius: 5,
    pointHoverRadius: 7,
    tension: 0.4,
    fill: 'origin'
  }]

  // ROMI по каналам
  if (props.channels && props.channels.length > 0) {
    props.channels.forEach((channel, index) => {
      const channelData = props.data.map(item => {
        const channelRomi = item.channels?.find(c => c.channel === channel)
        return channelRomi ? channelRomi.romi : 0
      })

      datasets.push({
        label: getChannelName(channel),
        data: channelData,
        borderColor: colors[(index + 1) % colors.length],
        backgroundColor: colors[(index + 1) % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.4,
        fill: false
      })
    })
  }

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
      text: 'Тренд ROMI',
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
          return `${label}: ${value.toFixed(2)}%`
        },
        afterBody: function(tooltipItems) {
          const dataIndex = tooltipItems[0].dataIndex
          const dataPoint = props.data[dataIndex]

          if (dataPoint.budget && dataPoint.revenue) {
            return [
              '',
              `Бюджет: ${formatCurrency(dataPoint.budget)}`,
              `Доходы: ${formatCurrency(dataPoint.revenue)}`,
              `ROI: ${((dataPoint.revenue / dataPoint.budget - 1) * 100).toFixed(1)}%`
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
        text: 'ROMI (%)'
      },
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

const getChannelName = (channel) => {
  const names = {
    'search': 'Поисковая реклама',
    'social': 'Социальные сети',
    'display': 'Дисплейная реклама',
    'email': 'Email маркетинг',
    'video': 'Видеореклама',
    'affiliate': 'Партнерский маркетинг',
    'direct': 'Прямой трафик'
  }
  return names[channel] || channel
}

const getTimeRangeLabel = (range) => {
  const labels = {
    '7d': 'Последние 7 дней',
    '30d': 'Последние 30 дней',
    '90d': 'Последние 3 месяца',
    '1y': 'Последний год'
  }
  return labels[range] || 'Период'
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