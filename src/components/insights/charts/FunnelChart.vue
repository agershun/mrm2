<template>
  <div ref="chartContainer" class="funnel-chart" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['stage-click'])

const chartContainer = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartContainer.value) return

  chartInstance = echarts.init(chartContainer.value)

  chartInstance.on('click', (params) => {
    emit('stage-click', {
      dataIndex: params.dataIndex,
      label: params.name,
      value: params.value,
      stage: params.name
    })
  })

  updateChart()
}

const updateChart = () => {
  if (!chartInstance || !props.data || props.data.length === 0) return

  // Prepare funnel data
  const funnelData = props.data.map((item, index) => ({
    name: item.stage || item.name,
    value: item.value || item.count || 0,
    itemStyle: {
      color: getFunnelColor(index)
    }
  })).sort((a, b) => b.value - a.value) // Sort descending for funnel

  // Calculate conversion rates
  const conversionRates = funnelData.map((item, index) => {
    if (index === 0) return 100
    return ((item.value / funnelData[0].value) * 100).toFixed(1)
  })

  const option = {
    title: {
      text: 'Воронка конверсии',
      left: 'center',
      top: '2%',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const rate = conversionRates[params.dataIndex]
        const value = new Intl.NumberFormat('ru-RU').format(params.value)

        return `
          <div style="margin-bottom: 4px; font-weight: bold;">${params.name}</div>
          <div>Количество: ${value}</div>
          <div>Конверсия: ${rate}%</div>
        `
      }
    },
    series: [
      {
        name: 'Воронка',
        type: 'funnel',
        left: '10%',
        top: '15%',
        width: '80%',
        height: '65%',
        min: 0,
        max: Math.max(...funnelData.map(d => d.value)),
        minSize: '10%',
        maxSize: '80%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: (params) => {
            const rate = conversionRates[params.dataIndex]
            return `${params.name}\n${new Intl.NumberFormat('ru-RU').format(params.value)}\n${rate}%`
          },
          fontSize: 12,
          fontWeight: 'bold',
          color: '#fff'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: funnelData
      }
    ],
    graphic: [
      // Add conversion arrows
      ...funnelData.slice(1).map((item, index) => ({
        type: 'text',
        left: '50%',
        top: `${25 + (index + 1) * (60 / funnelData.length)}%`,
        style: {
          text: `${conversionRates[index + 1]}%`,
          fill: '#666',
          fontSize: 14,
          fontWeight: 'bold'
        },
        z: 100
      }))
    ],
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut'
  }

  // Add detailed breakdown if available
  if (props.data.length > 0 && props.data[0].breakdown) {
    const breakdownData = props.data[0].breakdown.map(item => ({
      name: item.source || item.name,
      value: item.value || item.count || 0
    }))

    option.series.push({
      name: 'Источники',
      type: 'pie',
      radius: ['15%', '25%'],
      center: ['85%', '25%'],
      data: breakdownData,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    })

    option.legend = {
      orient: 'vertical',
      left: '70%',
      top: '40%',
      data: breakdownData.map(item => item.name),
      textStyle: {
        fontSize: 10
      }
    }
  }

  // Merge with custom options
  const finalOption = mergeOptions(option, props.options)
  chartInstance.setOption(finalOption, true)
}

const getFunnelColor = (index) => {
  const colors = [
    '#4caf50', // Green for top stage
    '#8bc34a', // Light green
    '#ffc107', // Yellow
    '#ff9800', // Orange
    '#f44336'  // Red for bottom stage
  ]
  return colors[index % colors.length]
}

const mergeOptions = (base, custom) => {
  const result = { ...base }

  Object.keys(custom).forEach(key => {
    if (typeof custom[key] === 'object' && custom[key] !== null && !Array.isArray(custom[key])) {
      result[key] = { ...result[key], ...custom[key] }
    } else {
      result[key] = custom[key]
    }
  })

  return result
}

const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}

// Watchers
watch(() => props.data, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

watch(() => props.options, () => {
  nextTick(() => {
    updateChart()
  })
}, { deep: true })

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initChart()
    window.addEventListener('resize', resizeChart)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  destroyChart()
})

// Expose methods
defineExpose({
  resizeChart,
  updateChart,
  getChartInstance: () => chartInstance
})
</script>

<style scoped>
.funnel-chart {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>