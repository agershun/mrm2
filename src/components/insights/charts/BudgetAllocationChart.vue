<template>
  <BaseChart
    :chart-data="chartData"
    :chart-options="chartOptions"
    :loading="loading"
    chart-type="doughnut"
  />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  showLegend: { type: Boolean, default: true },
  showLabels: { type: Boolean, default: true }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const colors = [
    '#FF6384', // Красный
    '#36A2EB', // Синий
    '#FFCE56', // Желтый
    '#4BC0C0', // Бирюзовый
    '#9966FF', // Фиолетовый
    '#FF9F40', // Оранжевый
    '#FF6384', // Красный (повтор для дополнительных категорий)
    '#C9CBCF', // Серый
    '#4BC0C0', // Бирюзовый (повтор)
    '#FFCE56'  // Желтый (повтор)
  ]

  const hoverColors = colors.map(color => {
    // Увеличиваем яркость для hover эффекта
    return color.replace(/[\d\.]+\)$/g, '0.8)')
  })

  const labels = props.data.map(item => item.category || item.name)
  const values = props.data.map(item => item.allocated_budget || item.budget || item.value)

  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: colors.slice(0, props.data.length),
      hoverBackgroundColor: hoverColors.slice(0, props.data.length),
      borderWidth: 2,
      borderColor: '#fff',
      hoverBorderWidth: 3,
      hoverBorderColor: '#fff'
    }]
  }
})

const chartOptions = computed(() => {
  const total = props.data.reduce((sum, item) => sum + (item.allocated_budget || item.budget || item.value || 0), 0)

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Распределение бюджета',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      legend: {
        display: props.showLegend,
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          generateLabels: function(chart) {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i]
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                const formattedValue = new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB',
                  minimumFractionDigits: 0,
                  notation: 'compact'
                }).format(value)

                return {
                  text: `${label}: ${formattedValue} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor,
                  lineWidth: data.datasets[0].borderWidth,
                  hidden: false,
                  index: i
                }
              })
            }
            return []
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0

            const formattedValue = new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
              minimumFractionDigits: 0
            }).format(value)

            return `${label}: ${formattedValue} (${percentage}%)`
          },
          afterLabel: function(context) {
            const item = props.data[context.dataIndex]
            if (item.description) {
              return `${item.description}`
            }
            return null
          }
        }
      },
      datalabels: {
        display: props.showLabels,
        color: '#fff',
        font: {
          weight: 'bold'
        },
        formatter: function(value, context) {
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
          return percentage > 5 ? `${percentage}%` : '' // Показываем только если больше 5%
        }
      }
    },
    cutout: '50%', // Размер внутреннего отверстия (делает из pie chart -> doughnut chart)
    elements: {
      arc: {
        borderWidth: 2
      }
    },
    interaction: {
      intersect: false
    },
    animation: {
      animateRotate: true,
      animateScale: false
    }
  }
})
</script>