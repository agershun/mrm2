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
  metric: { type: String, default: 'revenue' },
  years: { type: Array, default: () => [] }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  const years = [...new Set(props.data.map(item => item.year))].sort()
  const colors = [
    'rgb(75, 192, 192)',
    'rgb(255, 99, 132)',
    'rgb(255, 159, 64)',
    'rgb(153, 102, 255)',
    'rgb(54, 162, 235)',
    'rgb(255, 205, 86)'
  ]

  const datasets = years.map((year, index) => {
    const yearData = props.data.filter(item => item.year === year)
    const monthlyData = months.map((month, monthIndex) => {
      const monthData = yearData.find(item => item.month === monthIndex + 1)
      return monthData ? monthData[props.metric] : 0
    })

    return {
      label: `${year} год`,
      data: monthlyData,
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length].replace('rgb', 'rgba').replace(')', ', 0.1)'),
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 8,
      tension: 0.4,
      fill: false
    }
  })

  // Добавляем среднее значение
  if (years.length > 1) {
    const averageData = months.map((month, monthIndex) => {
      const monthValues = years.map(year => {
        const yearData = props.data.filter(item => item.year === year)
        const monthData = yearData.find(item => item.month === monthIndex + 1)
        return monthData ? monthData[props.metric] : 0
      })
      return monthValues.reduce((sum, val) => sum + val, 0) / monthValues.length
    })

    datasets.push({
      label: 'Среднее значение',
      data: averageData,
      borderColor: 'rgb(128, 128, 128)',
      backgroundColor: 'rgba(128, 128, 128, 0.1)',
      borderWidth: 2,
      borderDash: [10, 5],
      pointRadius: 3,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: false
    })
  }

  return {
    labels: months,
    datasets
  }
})

const chartOptions = computed(() => {
  const metricLabels = {
    revenue: 'Доходы (₽)',
    conversions: 'Конверсии',
    clicks: 'Клики',
    impressions: 'Показы',
    ctr: 'CTR (%)',
    cpc: 'CPC (₽)',
    cpm: 'CPM (₽)',
    roi: 'ROI (%)'
  }

  const isPercentage = ['ctr', 'roi'].includes(props.metric)
  const isCurrency = ['revenue', 'cpc', 'cpm'].includes(props.metric)

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: `Сезонные тренды: ${metricLabels[props.metric] || props.metric}`
      },
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || ''
            const value = context.parsed.y

            let formattedValue
            if (isCurrency) {
              formattedValue = new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0
              }).format(value)
            } else if (isPercentage) {
              formattedValue = value.toFixed(2) + '%'
            } else {
              formattedValue = new Intl.NumberFormat('ru-RU').format(value)
            }

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
          text: 'Месяц'
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
          text: metricLabels[props.metric] || props.metric
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            if (isCurrency) {
              return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
                notation: 'compact'
              }).format(value)
            } else if (isPercentage) {
              return value + '%'
            } else {
              return new Intl.NumberFormat('ru-RU', {
                notation: 'compact'
              }).format(value)
            }
          }
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  }
})
</script>