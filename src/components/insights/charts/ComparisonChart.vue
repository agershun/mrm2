<template>
  <div class="comparison-chart">
    <div
      v-if="loading"
      class="chart-loading"
    >
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      />
      <div class="mt-4 text-body-2 text-medium-emphasis">
        Загрузка данных...
      </div>
    </div>

    <div
      v-else-if="!hasData"
      class="chart-empty"
    >
      <v-icon
        size="64"
        color="grey-lighten-2"
      >
        mdi-chart-donut
      </v-icon>
      <div class="mt-4 text-body-2 text-medium-emphasis">
        Нет данных для отображения
      </div>
    </div>

    <div
      v-else
      ref="chartContainer"
      class="chart-container"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts/core'
import {
  PieChart,
  BarChart,
  RadarChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// Регистрируем необходимые компоненты
echarts.use([
  PieChart,
  BarChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer
])

export default {
  name: 'ComparisonChart',
  props: {
    data: {
      type: [Array, Object],
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'pie', // pie, donut, bar, radar
      validator: (value) => ['pie', 'donut', 'bar', 'radar'].includes(value)
    },
    horizontal: {
      type: Boolean,
      default: false
    },
    showLegend: {
      type: Boolean,
      default: true
    },
    showLabels: {
      type: Boolean,
      default: true
    },
    height: {
      type: [Number, String],
      default: '100%'
    }
  },
  setup(props) {
    const chartContainer = ref(null)
    const chartInstance = ref(null)

    // Computed properties
    const hasData = computed(() => {
      if (Array.isArray(props.data)) {
        return props.data.length > 0
      }
      return props.data && Object.keys(props.data).length > 0
    })

    // Methods
    const initChart = () => {
      if (!chartContainer.value || !hasData.value) return

      chartInstance.value = echarts.init(chartContainer.value)
      updateChart()
    }

    const updateChart = () => {
      if (!chartInstance.value || !hasData.value) return

      const option = generateChartOption()
      chartInstance.value.setOption(option, true)
    }

    const generateChartOption = () => {
      switch (props.type) {
        case 'pie':
        case 'donut':
          return generatePieOption()
        case 'bar':
          return generateBarOption()
        case 'radar':
          return generateRadarOption()
        default:
          return generatePieOption()
      }
    }

    const generatePieOption = () => {
      const seriesData = getSeriesData()

      return {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: props.showLegend ? {
          orient: 'vertical',
          left: 'left',
          textStyle: {
            color: '#666'
          }
        } : undefined,
        series: [{
          name: 'Распределение',
          type: 'pie',
          radius: props.type === 'donut' ? ['40%', '70%'] : '70%',
          center: ['60%', '50%'],
          data: seriesData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            show: props.showLabels,
            formatter: '{b}: {d}%'
          },
          labelLine: {
            show: props.showLabels
          }
        }],
        color: [
          '#1976D2',
          '#388E3C',
          '#F57C00',
          '#7B1FA2',
          '#C2185B',
          '#00796B',
          '#5D4037',
          '#455A64'
        ]
      }
    }

    const generateBarOption = () => {
      const chartData = getChartData()

      return {
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '8%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params) => {
            const param = params[0]
            const value = formatTooltipValue(param.value)
            return `${param.name}<br/>${param.seriesName}: <strong>${value}</strong>`
          }
        },
        xAxis: props.horizontal ? {
          type: 'value',
          axisLabel: {
            color: '#666',
            formatter: (value) => formatAxisValue(value)
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        } : {
          type: 'category',
          data: chartData.categories,
          axisLabel: {
            color: '#666',
            rotate: chartData.categories.length > 5 ? 45 : 0
          },
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          }
        },
        yAxis: props.horizontal ? {
          type: 'category',
          data: chartData.categories,
          axisLabel: {
            color: '#666'
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          }
        } : {
          type: 'value',
          axisLabel: {
            color: '#666',
            formatter: (value) => formatAxisValue(value)
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: [{
          name: 'Значение',
          type: 'bar',
          data: chartData.values,
          itemStyle: {
            borderRadius: props.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }],
        color: ['#1976D2']
      }
    }

    const generateRadarOption = () => {
      const radarData = getRadarData()

      return {
        tooltip: {
          trigger: 'item'
        },
        legend: props.showLegend ? {
          bottom: 0,
          textStyle: {
            color: '#666'
          }
        } : undefined,
        radar: {
          indicator: radarData.indicators,
          center: ['50%', '50%'],
          radius: '70%',
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          },
          axisLabel: {
            color: '#666'
          }
        },
        series: [{
          name: 'Показатели',
          type: 'radar',
          data: radarData.series,
          itemStyle: {
            color: '#1976D2'
          },
          areaStyle: {
            opacity: 0.3
          }
        }]
      }
    }

    const getSeriesData = () => {
      if (Array.isArray(props.data)) {
        return props.data.map(item => ({
          name: item.name || item.label,
          value: item.value || item.count || 0
        }))
      }

      return Object.entries(props.data).map(([key, value]) => ({
        name: key,
        value: value
      }))
    }

    const getChartData = () => {
      if (Array.isArray(props.data)) {
        return {
          categories: props.data.map(item => item.name || item.label),
          values: props.data.map(item => item.value || item.count || 0)
        }
      }

      return {
        categories: Object.keys(props.data),
        values: Object.values(props.data)
      }
    }

    const getRadarData = () => {
      if (props.data.indicators && props.data.series) {
        return props.data
      }

      // Преобразуем простые данные в формат радара
      const indicators = []
      const values = []

      if (Array.isArray(props.data)) {
        props.data.forEach(item => {
          indicators.push({ name: item.name || item.label, max: 100 })
          values.push(item.value || item.count || 0)
        })
      } else {
        Object.entries(props.data).forEach(([key, value]) => {
          indicators.push({ name: key, max: 100 })
          values.push(value)
        })
      }

      return {
        indicators,
        series: [{
          value: values,
          name: 'Показатели'
        }]
      }
    }

    const formatTooltipValue = (value) => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}М`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}К`
      }
      return new Intl.NumberFormat('ru-RU').format(value)
    }

    const formatAxisValue = (value) => {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}М`
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}К`
      }
      return value
    }

    const resizeChart = () => {
      if (chartInstance.value) {
        chartInstance.value.resize()
      }
    }

    const destroyChart = () => {
      if (chartInstance.value) {
        chartInstance.value.dispose()
        chartInstance.value = null
      }
    }

    // Watchers
    watch(() => props.data, () => {
      nextTick(() => {
        if (hasData.value && chartInstance.value) {
          updateChart()
        } else if (hasData.value && !chartInstance.value) {
          initChart()
        }
      })
    }, { deep: true })

    watch(() => [props.type, props.horizontal, props.showLegend, props.showLabels], () => {
      nextTick(() => {
        updateChart()
      })
    })

    watch(() => props.loading, (isLoading) => {
      if (!isLoading && hasData.value) {
        nextTick(() => {
          initChart()
        })
      }
    })

    // Lifecycle
    onMounted(() => {
      nextTick(() => {
        if (hasData.value && !props.loading) {
          initChart()
        }
      })

      window.addEventListener('resize', resizeChart)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', resizeChart)
      destroyChart()
    })

    return {
      chartContainer,
      hasData
    }
  }
}
</script>

<style scoped>
.comparison-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
  position: relative;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-loading,
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.chart-loading {
  background: rgba(255, 255, 255, 0.8);
}
</style>