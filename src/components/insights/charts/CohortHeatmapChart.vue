<template>
  <BaseChart
    :chart-data="chartData"
    :chart-options="chartOptions"
    :loading="loading"
    chart-type="bar"
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

  const labels = props.data.map(item => item.cohort_name || item.period)
  const retentionData = props.data.map(item => item.retention_rate || 0)

  return {
    labels,
    datasets: [{
      label: 'Удержание (%)',
      data: retentionData,
      backgroundColor: retentionData.map(rate => getRetentionColor(rate)),
      borderColor: 'rgba(0,0,0,0.1)',
      borderWidth: 1
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: { display: true, text: 'Когортный анализ удержания' },
    legend: { display: true, position: 'top' }
  },
  scales: {
    y: {
      title: { display: true, text: 'Удержание (%)' },
      ticks: { callback: value => value + '%' }
    }
  }
}))

const getRetentionColor = (rate) => {
  if (rate >= 80) return 'rgba(76, 175, 80, 0.8)'
  if (rate >= 60) return 'rgba(255, 193, 7, 0.8)'
  if (rate >= 40) return 'rgba(255, 152, 0, 0.8)'
  return 'rgba(244, 67, 54, 0.8)'
}
</script>