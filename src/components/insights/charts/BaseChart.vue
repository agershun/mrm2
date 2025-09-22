<template>
  <div ref="chartContainer" class="base-chart" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  type: {
    type: String,
    default: 'line',
    validator: (value) => ['line', 'bar', 'pie', 'scatter', 'radar'].includes(value)
  },
  data: {
    type: Array,
    default: () => []
  },
  options: {
    type: Object,
    default: () => ({})
  },
  height: {
    type: [String, Number],
    default: '400px'
  }
})

const emit = defineEmits(['chart-click', 'legend-click', 'data-zoom'])

const chartContainer = ref(null)
let chartInstance = null

// Methods
const initChart = () => {
  if (!chartContainer.value) return

  chartInstance = echarts.init(chartContainer.value)

  // Set up event listeners
  chartInstance.on('click', (params) => {
    emit('chart-click', params)
  })

  chartInstance.on('legendselectchanged', (params) => {
    emit('legend-click', params)
  })

  chartInstance.on('datazoom', (params) => {
    emit('data-zoom', params)
  })

  updateChart()
}

const updateChart = () => {
  if (!chartInstance || !props.data) return

  const option = generateChartOption()
  chartInstance.setOption(option, true)
}

const generateChartOption = () => {
  const baseOption = {
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
          result += `<div>${marker}${param.seriesName}: ${formatValue(param.value, param.seriesName)}</div>`
        })

        return result
      }
    },
    legend: {
      type: 'scroll',
      orient: 'horizontal',
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: generateXAxis(),
    yAxis: generateYAxis(),
    series: generateSeries(),
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        show: props.data.length > 10,
        start: 0,
        end: 100,
        height: 20,
        bottom: 0
      }
    ],
    animation: true,
    animationDuration: 1000,
    color: ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0097a7']
  }

  // Merge with custom options
  return mergeOptions(baseOption, props.options)
}

const generateXAxis = () => {
  if (props.type === 'pie') return undefined

  return {
    type: 'category',
    data: props.data.map(item => item.label || item.name),
    axisLabel: {
      rotate: props.data.length > 6 ? 45 : 0,
      fontSize: 11
    },
    axisTick: {
      alignWithLabel: true
    }
  }
}

const generateYAxis = () => {
  if (props.type === 'pie') return undefined

  return {
    type: 'value',
    axisLabel: {
      formatter: (value) => {
        if (value >= 1000000) {
          return (value / 1000000).toFixed(1) + 'M'
        } else if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'K'
        }
        return value
      }
    },
    splitLine: {
      lineStyle: {
        type: 'dashed'
      }
    }
  }
}

const generateSeries = () => {
  if (props.type === 'pie') {
    return [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: props.data.map(item => ({
        name: item.label || item.name,
        value: item.value
      }))
    }]
  }

  // For other chart types, assume data structure with series
  if (props.data.length > 0 && props.data[0].series) {
    return props.data[0].series.map((series, index) => ({
      name: series.name,
      type: props.type,
      data: series.data,
      smooth: props.type === 'line',
      itemStyle: {
        borderRadius: props.type === 'bar' ? [4, 4, 0, 0] : 0
      },
      emphasis: {
        focus: 'series'
      }
    }))
  }

  // Simple data structure
  return [{
    name: 'Значение',
    type: props.type,
    data: props.data.map(item => item.value),
    smooth: props.type === 'line',
    itemStyle: {
      borderRadius: props.type === 'bar' ? [4, 4, 0, 0] : 0
    }
  }]
}

const formatValue = (value, seriesName) => {
  if (seriesName && seriesName.toLowerCase().includes('roi')) {
    return `${value}%`
  }

  if (typeof value === 'number' && value >= 1000) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(value)
  }

  return value
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

    // Handle window resize
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
.base-chart {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>