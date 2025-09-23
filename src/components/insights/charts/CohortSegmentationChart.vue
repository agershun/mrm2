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
  loading: { type: Boolean, default: false }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return { labels: [], datasets: [] }
  }

  const labels = props.data.map(item => item.segment_name)
  const values = props.data.map(item => item.users_count)

  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
      ],
      borderWidth: 2
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: { display: true, text: 'Сегментация когорт' },
    legend: { display: true, position: 'right' }
  }
}))
</script>