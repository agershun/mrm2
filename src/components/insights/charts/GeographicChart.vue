<template>
  <div ref="chartContainer" class="geographic-chart" />
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

const emit = defineEmits(['region-click'])

const chartContainer = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartContainer.value) return

  chartInstance = echarts.init(chartContainer.value)

  chartInstance.on('click', (params) => {
    emit('region-click', {
      dataIndex: params.dataIndex,
      label: params.name,
      value: params.value,
      region: params.name
    })
  })

  updateChart()
}

const updateChart = () => {
  if (!chartInstance || !props.data || props.data.length === 0) return

  // Prepare data for geographic visualization
  const geoData = props.data.map(item => ({
    name: item.region || item.name,
    value: item.value || item.revenue || 0,
    itemStyle: {
      color: getColorByValue(item.value || item.revenue || 0)
    }
  }))

  const option = {
    title: {
      text: 'Географическое распределение',
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
        const value = new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(params.value || 0)

        return `
          <div style="margin-bottom: 4px; font-weight: bold;">${params.name}</div>
          <div>Выручка: ${value}</div>
        `
      }
    },
    visualMap: {
      min: Math.min(...geoData.map(d => d.value)),
      max: Math.max(...geoData.map(d => d.value)),
      left: 'left',
      top: 'bottom',
      text: ['Высокая', 'Низкая'],
      calculable: true,
      inRange: {
        color: ['#e3f2fd', '#1976d2']
      },
      formatter: (value) => {
        if (value >= 1000000) {
          return (value / 1000000).toFixed(1) + 'M ₽'
        } else if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'K ₽'
        }
        return value + ' ₽'
      }
    },
    series: [
      {
        name: 'Регионы',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: geoData,
        symbolSize: (val) => {
          const maxVal = Math.max(...geoData.map(d => d.value))
          const minSize = 20
          const maxSize = 80
          const ratio = (val[2] || val) / maxVal
          return minSize + (maxSize - minSize) * ratio
        },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(25, 118, 210, 0.5)'
        },
        emphasis: {
          scale: true,
          focus: 'self'
        }
      }
    ],
    geo: {
      map: 'russia',
      roam: true,
      scaleLimit: {
        min: 1,
        max: 3
      },
      zoom: 1.2,
      center: [105, 64],
      itemStyle: {
        areaColor: '#f5f5f5',
        borderColor: '#999',
        borderWidth: 0.5
      },
      emphasis: {
        itemStyle: {
          areaColor: '#e0e0e0'
        }
      },
      regions: [
        {
          name: 'Москва',
          itemStyle: {
            areaColor: '#bbdefb'
          }
        },
        {
          name: 'Санкт-Петербург',
          itemStyle: {
            areaColor: '#bbdefb'
          }
        }
      ]
    },
    animation: true,
    animationDuration: 1000
  }

  // Fallback to bar chart if geographic data is not suitable
  if (!hasValidGeoData()) {
    option.series = [
      {
        name: 'Выручка по регионам',
        type: 'bar',
        data: props.data.map(item => ({
          name: item.region || item.name,
          value: item.value || item.revenue || 0
        })),
        itemStyle: {
          color: (params) => {
            const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0097a7']
            return colors[params.dataIndex % colors.length]
          },
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          focus: 'series'
        }
      }
    ]

    option.xAxis = {
      type: 'category',
      data: props.data.map(item => item.region || item.name),
      axisLabel: {
        rotate: props.data.length > 6 ? 45 : 0,
        fontSize: 11
      }
    }

    option.yAxis = {
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
      }
    }

    option.grid = {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    }

    // Remove geo-specific configurations
    delete option.geo
    delete option.visualMap
  }

  // Merge with custom options
  const finalOption = mergeOptions(option, props.options)
  chartInstance.setOption(finalOption, true)
}

const getColorByValue = (value) => {
  const maxValue = Math.max(...props.data.map(item => item.value || item.revenue || 0))
  const ratio = value / maxValue

  if (ratio > 0.8) return '#1976d2'
  if (ratio > 0.6) return '#42a5f5'
  if (ratio > 0.4) return '#90caf9'
  if (ratio > 0.2) return '#bbdefb'
  return '#e3f2fd'
}

const hasValidGeoData = () => {
  // Check if we have geographic data that can be mapped
  const regions = props.data.map(item => item.region || item.name)
  const russianRegions = [
    'Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск',
    'Казань', 'Нижний Новгород', 'Челябинск', 'Омск', 'Самара',
    'Ростов-на-Дону', 'Уфа', 'Красноярск', 'Воронеж', 'Пермь'
  ]

  return regions.some(region => russianRegions.includes(region))
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
.geographic-chart {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>