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
  loading: { type: Boolean, default: false },
  chartType: { type: String, default: 'by_source' }
})

const chartData = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      labels: [],
      datasets: []
    }
  }

  if (props.chartType === 'by_source') {
    return createBySourceChart()
  } else {
    return createByTypeChart()
  }
})

const createBySourceChart = () => {
  const sources = props.data.map(item => item.source_name)
  const unmappedCounts = props.data.map(item => item.unmapped_count)
  const totalCounts = props.data.map(item => item.total_count)
  const mappedCounts = props.data.map((item, index) => totalCounts[index] - unmappedCounts[index])

  return {
    labels: sources,
    datasets: [
      {
        label: 'Не сопоставлено',
        data: unmappedCounts,
        backgroundColor: 'rgba(244, 67, 54, 0.8)',
        borderColor: 'rgb(244, 67, 54)',
        borderWidth: 1
      },
      {
        label: 'Сопоставлено',
        data: mappedCounts,
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: 'rgb(76, 175, 80)',
        borderWidth: 1
      }
    ]
  }
}

const createByTypeChart = () => {
  const types = props.data.map(item => item.data_type)
  const counts = props.data.map(item => item.unmapped_count)

  return {
    labels: types,
    datasets: [
      {
        label: 'Не сопоставленные записи',
        data: counts,
        backgroundColor: [
          'rgba(244, 67, 54, 0.8)',
          'rgba(255, 152, 0, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(33, 150, 243, 0.8)',
          'rgba(156, 39, 176, 0.8)'
        ],
        borderColor: [
          'rgb(244, 67, 54)',
          'rgb(255, 152, 0)',
          'rgb(255, 193, 7)',
          'rgb(76, 175, 80)',
          'rgb(33, 150, 243)',
          'rgb(156, 39, 176)'
        ],
        borderWidth: 1
      }
    ]
  }
}

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: props.chartType === 'by_source' ? 'Не сопоставленные данные по источникам' : 'Не сопоставленные данные по типам'
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
          const total = props.data[context.dataIndex]?.total_count || 0
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0

          return `${label}: ${value.toLocaleString('ru-RU')} (${percentage}%)`
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: props.chartType === 'by_source' ? 'Источники данных' : 'Типы данных'
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Количество записей'
      },
      ticks: {
        callback: function(value) {
          return value.toLocaleString('ru-RU')
        }
      }
    }
  }
}))
</script>