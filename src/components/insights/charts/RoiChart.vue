<template>
  <div ref="chartContainer" class="roi-chart" />
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
  const roiData = props.data.map(item => item.roi || item.value)
  const benchmarkData = props.data.map(item => item.benchmark || 100)

  const option = {
    title: {
      text: 'ROI Динамика',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params) => {
        let result = `<div style="margin-bottom: 8px; font-weight: bold;">${params[0].axisValue}</div>`

        params.forEach(param => {
          const marker = `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>`
          result += `<div>${marker}${param.seriesName}: ${param.value}%</div>`
        })

        return result
      }
    },
    legend: {
      data: ['ROI', 'Бенчмарк'],
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
      name: 'ROI (%)',
      axisLabel: {
        formatter: '{value}%'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
      // Add reference line at 100%
      markLine: {
        data: [
          {
            yAxis: 100,
            label: {
              position: 'end',
              formatter: 'Точка безубыточности'
            },
            lineStyle: {
              color: '#ff5722',
              type: 'solid',
              width: 2
            }
          }
        ]
      }
    },
    series: [
      {
        name: 'ROI',
        type: 'line',
        data: roiData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          color: (params) => {
            return params.value >= 100 ? '#4caf50' : '#f44336'
          }
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
                color: 'rgba(76, 175, 80, 0.3)'
              },
              {
                offset: 0.5,
                color: 'rgba(76, 175, 80, 0.15)'
              },
              {
                offset: 1,
                color: 'rgba(76, 175, 80, 0.05)'
              }
            ]
          }
        },
        emphasis: {
          focus: 'series'
        },
        markPoint: {
          data: [
            {
              type: 'max',
              name: 'Максимум',
              itemStyle: {
                color: '#4caf50'
              }
            },
            {
              type: 'min',
              name: 'Минимум',
              itemStyle: {
                color: '#f44336'
              }
            }
          ]
        }
      },
      {
        name: 'Бенчмарк',
        type: 'line',
        data: benchmarkData,
        lineStyle: {
          type: 'dashed',
          width: 2,
          color: '#9e9e9e'
        },
        itemStyle: {
          color: '#9e9e9e'
        },
        symbol: 'none',
        silent: true
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
    // Visual map for ROI performance
    visualMap: {
      show: false,
      pieces: [
        {
          gt: 150,
          color: '#4caf50',
          label: 'Отличный ROI'
        },
        {
          gte: 100,
          lte: 150,
          color: '#ff9800',
          label: 'Хороший ROI'
        },
        {
          lt: 100,
          color: '#f44336',
          label: 'Низкий ROI'
        }
      ],
      outOfRange: {
        color: '#999'
      }
    },
    animation: true,
    animationDuration: 1000
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
.roi-chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}
</style>