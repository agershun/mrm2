<template>
  <BaseChart
    :chart-data="chartData"
    :chart-options="chartOptions"
    :loading="loading"
    chart-type="radar"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  competitors: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  metrics: { type: Array, default: () => ['market_share', 'brand_awareness', 'customer_satisfaction', 'price_competitiveness', 'innovation', 'digital_presence'] }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const metricLabels = {
    market_share: 'Доля рынка',
    brand_awareness: 'Узнаваемость бренда',
    customer_satisfaction: 'Удовлетворенность клиентов',
    price_competitiveness: 'Ценовая конкурентоспособность',
    innovation: 'Инновации',
    digital_presence: 'Цифровое присутствие',
    ad_spend: 'Рекламные расходы',
    conversion_rate: 'Конверсия',
    customer_retention: 'Удержание клиентов',
    social_engagement: 'Социальная активность'
  }

  const labels = props.metrics.map(metric => metricLabels[metric] || metric)

  // Цвета для компаний
  const colors = [
    'rgba(75, 192, 192, 0.6)',   // Наша компания (основной)
    'rgba(255, 99, 132, 0.6)',   // Конкурент 1
    'rgba(255, 159, 64, 0.6)',   // Конкурент 2
    'rgba(153, 102, 255, 0.6)',  // Конкурент 3
    'rgba(54, 162, 235, 0.6)',   // Конкурент 4
    'rgba(255, 205, 86, 0.6)'    // Конкурент 5
  ]

  const borderColors = [
    'rgb(75, 192, 192)',
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(153, 102, 255)',
    'rgb(54, 162, 235)',
    'rgb(255, 205, 86)'
  ]

  const datasets = props.data.map((company, index) => {
    const isOurCompany = company.is_our_company || index === 0

    return {
      label: company.company_name,
      data: props.metrics.map(metric => company.metrics[metric] || 0),
      backgroundColor: colors[index % colors.length],
      borderColor: borderColors[index % borderColors.length],
      borderWidth: isOurCompany ? 3 : 2,
      pointBackgroundColor: borderColors[index % borderColors.length],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: borderColors[index % borderColors.length],
      pointRadius: isOurCompany ? 6 : 4,
      pointHoverRadius: isOurCompany ? 8 : 6
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
  plugins: {
    title: {
      display: true,
      text: 'Конкурентный анализ',
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
          const companyName = context.dataset.label
          const metricName = context.label
          const value = context.parsed.r

          return `${companyName}: ${metricName} - ${value}%`
        }
      }
    }
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      min: 0,
      stepSize: 20,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      angleLines: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      pointLabels: {
        font: {
          size: 12
        },
        color: 'rgba(0, 0, 0, 0.7)'
      },
      ticks: {
        display: true,
        stepSize: 20,
        callback: function(value) {
          return value + '%'
        },
        backdropColor: 'rgba(255, 255, 255, 0.8)',
        color: 'rgba(0, 0, 0, 0.5)'
      }
    }
  },
  elements: {
    line: {
      borderWidth: 2,
      tension: 0.1
    },
    point: {
      borderWidth: 2,
      hoverBorderWidth: 3
    }
  },
  interaction: {
    intersect: false,
    mode: 'point'
  }
}))
</script>