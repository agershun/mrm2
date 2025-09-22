<template>
  <div ref="chartContainer" class="channel-revenue-chart" />
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

const emit = defineEmits(['bar-click'])

const chartContainer = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartContainer.value) return

  chartInstance = echarts.init(chartContainer.value)

  chartInstance.on('click', (params) => {
    emit('bar-click', {
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

  const channels = props.data.map(item => item.channel || item.name)
  const revenueData = props.data.map(item => item.revenue || item.value)
  const investmentData = props.data.map(item => item.investment || 0)
  const roiData = props.data.map(item => item.roi || 0)

  const option = {
    title: {
      text: 'Выручка по каналам',
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

          let value = param.value
          if (param.seriesName === 'ROI') {
            value = `${value}%`
          } else {
            value = new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: 'RUB',
              minimumFractionDigits: 0
            }).format(value)
          }

          result += `<div>${marker}${param.seriesName}: ${value}</div>`
        })

        return result
      }
    },
    legend: {
      data: ['Выручка', 'Инвестиции', 'ROI'],
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
      data: channels,
      axisLabel: {
        rotate: channels.length > 6 ? 45 : 0,
        fontSize: 11
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Сумма (₽)',
        position: 'left',
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
      {
        type: 'value',
        name: 'ROI (%)',
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: 'Выручка',
        type: 'bar',
        yAxisIndex: 0,
        data: revenueData,
        itemStyle: {
          color: '#1976d2',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#1565c0'
          }
        },
        label: {
          show: false,
          position: 'top',
          formatter: (params) => {
            if (params.value >= 1000000) {
              return (params.value / 1000000).toFixed(1) + 'M'
            } else if (params.value >= 1000) {
              return (params.value / 1000).toFixed(1) + 'K'
            }
            return params.value
          }
        }
      },
      {
        name: 'Инвестиции',
        type: 'bar',
        yAxisIndex: 0,
        data: investmentData,
        itemStyle: {
          color: '#ff9800',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#f57c00'
          }
        }
      },
      {
        name: 'ROI',
        type: 'line',
        yAxisIndex: 1,
        data: roiData,
        lineStyle: {
          width: 3,
          color: '#4caf50'
        },
        itemStyle: {
          color: '#4caf50'
        },
        symbol: 'circle',
        symbolSize: 8,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: '#4caf50',
          fontSize: 12,
          fontWeight: 'bold'
        },
        emphasis: {
          focus: 'series'
        }
      }
    ],
    // Add gradient background for better visual appeal
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }

  // Add data sorting functionality
  if (channels.length > 1) {
    const sortedData = channels.map((channel, index) => ({
      channel,
      revenue: revenueData[index],
      investment: investmentData[index],
      roi: roiData[index]
    })).sort((a, b) => b.revenue - a.revenue)

    option.xAxis.data = sortedData.map(item => item.channel)
    option.series[0].data = sortedData.map(item => item.revenue)
    option.series[1].data = sortedData.map(item => item.investment)
    option.series[2].data = sortedData.map(item => item.roi)
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
.channel-revenue-chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>