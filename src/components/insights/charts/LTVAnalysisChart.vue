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
  loading: { type: Boolean, default: false }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return { labels: [], datasets: [] }
  }

  const labels = props.data.map(item => `${item.month} мес.`)
  const ltvData = props.data.map(item => item.ltv || 0)
  const cacData = props.data.map(item => item.cac || 0)

  return {
    labels,
    datasets: [
      {
        label: 'LTV (₽)',
        data: ltvData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        yAxisID: 'y'
      },
      {
        label: 'CAC (₽)',
        data: cacData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        yAxisID: 'y'
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: { display: true, text: 'Анализ LTV/CAC' },
    legend: { display: true, position: 'top' }
  },
  scales: {
    y: {
      title: { display: true, text: 'Сумма (₽)' },
      ticks: {
        callback: value => new Intl.NumberFormat('ru-RU', {
          style: 'currency', currency: 'RUB', minimumFractionDigits: 0
        }).format(value)
      }
    }
  }
}))
</script>