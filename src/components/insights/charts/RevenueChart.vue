<template>
  <div ref="chartContainer" class="revenue-chart" />
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

const emit = defineEmits(['point-click'])

const chartContainer = ref(null)
let chartInstance = null

// Sample data structure expected:
// [
//   { date: '2024-01-01', revenue: 150000, target: 140000 },
//   { date: '2024-01-02', revenue: 165000, target: 145000 },
//   ...
// ]

const initChart = () => {
  if (!chartContainer.value) return

  chartInstance = echarts.init(chartContainer.value)

  chartInstance.on('click', (params) => {
    emit('point-click', {
      dataIndex: params.dataIndex,
      label: params.name,
      value: params.value,
      seriesName: params.seriesName
    })
  })

  updateChart()
}

const updateChart = () => {
  if (!chartInstance || !props.data || props.data.length === 0) return

  const dates = props.data.map(item => item.date || item.label)
  const revenueData = props.data.map(item => item.revenue || item.value)
  const targetData = props.data.map(item => item.target || null).filter(Boolean)

  const option = {
    title: {
      text: 'Динамика выручки',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      },
      formatter: (params) => {
        let result = `<div style="margin-bottom: 8px; font-weight: bold;">${params[0].axisValue}</div>`

        params.forEach(param => {
          const marker = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`
          const value = new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
          }).format(param.value)
          result += `<div>${marker}${param.seriesName}: ${value}</div>`
        })

        return result
      }
    },
    legend: {
      data: targetData.length > 0 ? ['Выручка', 'Цель'] : ['Выручка'],
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
      data: dates,
      axisLabel: {
        rotate: dates.length > 10 ? 45 : 0,
        fontSize: 11
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      name: 'Выручка (₽)',
      axisLabel: {
        formatter: (value) => {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M ₽'
          } else if (value >= 1000) {
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
        name: 'Выручка',
        type: 'line',
        data: revenueData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: '#1976d2'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(25, 118, 210, 0.3)'
              },
              {
                offset: 1,
                color: 'rgba(25, 118, 210, 0.05)'
              }
            ]
          }
        },
        emphasis: {
          focus: 'series'
        }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        show: dates.length > 15,
        start: Math.max(0, 100 - (15 / dates.length) * 100),
        end: 100,
        height: 20,
        bottom: 0
      }
    ],
    animation: true,
    animationDuration: 1000
  }

  // Add target line if data available
  if (targetData.length > 0) {
    option.series.push({
      name: 'Цель',
      type: 'line',
      data: targetData,
      lineStyle: {
        type: 'dashed',
        width: 2,
        color: '#ff9800'
      },
      itemStyle: {
        color: '#ff9800'
      },
      symbol: 'diamond',
      symbolSize: 5
    })
  }

  // Merge with custom options
  const finalOption = mergeOptions(option, props.options)
  chartInstance.setOption(finalOption, true)
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
.revenue-chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>