<template>
  <div ref="chartContainer" class="attribution-waterfall-chart" />
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

const emit = defineEmits(['touchpoint-click'])

const chartContainer = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartContainer.value) return

  chartInstance = echarts.init(chartContainer.value)

  chartInstance.on('click', (params) => {
    emit('touchpoint-click', {
      dataIndex: params.dataIndex,
      label: params.name,
      value: params.value,
      touchpoint: params.name
    })
  })

  updateChart()
}

const updateChart = () => {
  if (!chartInstance || !props.data || props.data.length === 0) return

  // Prepare waterfall data
  const waterfallData = prepareWaterfallData()
  const categories = waterfallData.map(item => item.name)

  const option = {
    title: {
      text: 'Атрибуционная модель (Waterfall)',
      left: 'center',
      top: '2%',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const param = params[0]
        if (!param) return ''

        const value = Math.abs(param.value)
        const formattedValue = new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(value)

        const contribution = param.data.contribution
        const type = param.data.type

        return `
          <div style="margin-bottom: 4px; font-weight: bold;">${param.name}</div>
          <div>Вклад: ${formattedValue}</div>
          <div>Доля: ${contribution}%</div>
          <div>Тип: ${type === 'positive' ? 'Положительный' : type === 'negative' ? 'Отрицательный' : 'Итоговый'}</div>
        `
      }
    },
    legend: {
      data: ['Положительный вклад', 'Отрицательный вклад', 'Итоговое значение'],
      top: '10%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: categories.length > 8 ? 45 : 0,
        fontSize: 11
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: 'Вклад в конверсию (₽)',
      axisLabel: {
        formatter: (value) => {
          if (Math.abs(value) >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M ₽'
          } else if (Math.abs(value) >= 1000) {
            return (value / 1000).toFixed(1) + 'K ₽'
          }
          return value + ' ₽'
        }
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Waterfall',
        type: 'bar',
        stack: 'waterfall',
        data: waterfallData.map(item => ({
          value: item.value,
          itemStyle: {
            color: getWaterfallColor(item.type),
            borderRadius: item.type === 'total' ? [4, 4, 4, 4] : [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          label: {
            show: true,
            position: item.value >= 0 ? 'top' : 'bottom',
            formatter: (params) => {
              const value = Math.abs(params.value)
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M'
              } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K'
              }
              return value.toString()
            },
            fontSize: 11,
            fontWeight: 'bold'
          },
          ...item
        })),
        emphasis: {
          focus: 'series'
        }
      }
    ],
    // Add connecting lines between bars
    graphic: waterfallData.slice(0, -1).map((item, index) => {
      if (index === waterfallData.length - 2) return null // Skip last connection

      const nextIndex = index + 1
      return {
        type: 'line',
        shape: {
          x1: 0, // Will be calculated dynamically
          y1: 0,
          x2: 0,
          y2: 0
        },
        style: {
          stroke: '#999',
          lineWidth: 1,
          lineDash: [3, 3]
        },
        z: 1
      }
    }).filter(Boolean),
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut'
  }

  // Merge with custom options
  const finalOption = mergeOptions(option, props.options)
  chartInstance.setOption(finalOption, true)
}

const prepareWaterfallData = () => {
  if (!props.data || props.data.length === 0) {
    return []
  }

  let cumulativeValue = 0
  const waterfallData = []

  // Starting point
  waterfallData.push({
    name: 'Базовая конверсия',
    value: props.data[0]?.baseValue || 0,
    type: 'total',
    contribution: 0
  })

  cumulativeValue = props.data[0]?.baseValue || 0

  // Attribution touchpoints
  props.data.forEach((item, index) => {
    if (index === 0) return // Skip first item (base value)

    const value = item.attribution || item.value || 0
    const type = value >= 0 ? 'positive' : 'negative'
    const contribution = ((Math.abs(value) / Math.abs(cumulativeValue + value)) * 100).toFixed(1)

    waterfallData.push({
      name: item.touchpoint || item.name || `Точка ${index}`,
      value: value,
      type: type,
      contribution: contribution
    })

    cumulativeValue += value
  })

  // Final total
  waterfallData.push({
    name: 'Итоговая конверсия',
    value: cumulativeValue,
    type: 'total',
    contribution: 100
  })

  // Calculate cumulative positions for proper waterfall display
  let runningTotal = waterfallData[0].value

  for (let i = 1; i < waterfallData.length - 1; i++) {
    const item = waterfallData[i]

    if (item.value >= 0) {
      // Positive contribution - bar starts from running total
      item.base = runningTotal
      runningTotal += item.value
    } else {
      // Negative contribution - bar goes down from running total
      runningTotal += item.value
      item.base = runningTotal
      item.value = Math.abs(item.value) // Make positive for display
    }
  }

  return waterfallData
}

const getWaterfallColor = (type) => {
  switch (type) {
    case 'positive':
      return '#4caf50' // Green for positive attribution
    case 'negative':
      return '#f44336' // Red for negative attribution
    case 'total':
      return '#1976d2' // Blue for totals
    default:
      return '#9e9e9e' // Gray for unknown
  }
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
.attribution-waterfall-chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>