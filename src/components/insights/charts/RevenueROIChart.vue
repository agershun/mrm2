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
  dateRange: { type: Array, default: () => [] }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  const labels = props.data.map(item => item.date)

  return {
    labels,
    datasets: [
      {
        label: 'Доходы (₽)',
        data: props.data.map(item => item.revenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y'
      },
      {
        label: 'ROI (%)',
        data: props.data.map(item => item.roi),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1'
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    title: {
      display: true,
      text: 'Доходы и ROI'
    },
    legend: {
      display: true,
      position: 'top'
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Дата'
      }
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Доходы (₽)'
      },
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
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
  }
}))
</script>