<template>
  <BaseChart
    :chart-data="chartData"
    :chart-options="chartOptions"
    :loading="loading"
    chart-type="scatter"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const colors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 205, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)'
  ]

  const datasets = props.data.map((channel, index) => ({
    label: getChannelName(channel.channel),
    data: [{
      x: channel.budget || 0,
      y: channel.romi || 0,
      r: Math.sqrt((channel.conversions || 0) / 10) + 5 // Размер пузырька зависит от конверсий
    }],
    backgroundColor: colors[index % colors.length],
    borderColor: colors[index % colors.length].replace('0.7', '1'),
    borderWidth: 2,
    pointHoverRadius: 15
  }))

  return {
    datasets
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: 'ROMI vs Бюджет по каналам'
    },
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const channelData = props.data[context.datasetIndex]
          return [
            `Канал: ${getChannelName(channelData.channel)}`,
            `Бюджет: ${formatCurrency(context.parsed.x)}`,
            `ROMI: ${context.parsed.y}%`,
            `Конверсии: ${channelData.conversions?.toLocaleString('ru-RU') || 0}`,
            `Доходы: ${formatCurrency(channelData.revenue)}`,
            `CPC: ${formatCurrency(channelData.cpc)}`,
            `CTR: ${channelData.ctr}%`
          ]
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Бюджет (₽)'
      },
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        callback: function(value) {
          return formatCurrency(value)
        }
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
      radius: function(context) {
        const channelData = props.data[context.datasetIndex]
        return Math.sqrt((channelData.conversions || 0) / 10) + 5
      },
      hoverRadius: function(context) {
        const channelData = props.data[context.datasetIndex]
        return Math.sqrt((channelData.conversions || 0) / 10) + 10
      }
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
    'direct': 'Прямой трафик',
    'google_ads': 'Google Ads',
    'yandex_direct': 'Яндекс.Директ',
    'facebook_ads': 'Facebook Ads',
    'vk_ads': 'VK Реклама'
  }
  return names[channel] || channel
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