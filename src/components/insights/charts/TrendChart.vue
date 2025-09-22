<template>
  <div class="trend-chart">
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
        mdi-chart-line-variant
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
  LineChart,
  BarChart,
  ScatterChart,
  EffectScatterChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// Регистрируем необходимые компоненты
echarts.use([
  LineChart,
  BarChart,
  ScatterChart,
  EffectScatterChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer
])

export default {
  name: 'TrendChart',
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
      default: 'line', // line, bar, area, scatter
      validator: (value) => ['line', 'bar', 'area', 'scatter'].includes(value)
    },
    period: {
      type: String,
      default: 'month'
    },
    metric: {
      type: String,
      default: null
    },
    multiSeries: {
      type: Boolean,
      default: false
    },
    showDataZoom: {
      type: Boolean,
      default: false
    },
    smooth: {
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
      const baseOption = {
        grid: {
          left: '3%',
          right: '4%',
          bottom: props.showDataZoom ? '15%' : '8%',
          top: '8%',
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          formatter: (params) => {
            let tooltip = `<div style="font-weight: bold; margin-bottom: 4px;">${params[0].axisValue}</div>`

            params.forEach(param => {
              const value = formatTooltipValue(param.value, param.seriesName)
              tooltip += `
                <div style="display: flex; align-items: center; margin: 2px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
                  <span style="flex: 1;">${param.seriesName}</span>
                  <strong style="margin-left: 16px;">${value}</strong>
                </div>
              `
            })

            return tooltip
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: props.type === 'bar',
          data: getXAxisData(),
          axisLine: {
            lineStyle: {
              color: '#e0e0e0'
            }
          },
          axisLabel: {
            color: '#666'
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#666',
            formatter: (value) => formatAxisValue(value)
          },
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        series: generateSeries(),
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

      // Добавляем легенду для мультисерий
      if (props.multiSeries) {
        baseOption.legend = {
          top: 0,
          textStyle: {
            color: '#666'
          }
        }
        baseOption.grid.top = '12%'
      }

      // Добавляем зум для больших наборов данных
      if (props.showDataZoom) {
        baseOption.dataZoom = [
          {
            type: 'inside',
            start: 70,
            end: 100
          },
          {
            start: 70,
            end: 100,
            height: 20,
            bottom: '2%'
          }
        ]
      }

      return baseOption
    }

    const getXAxisData = () => {
      if (Array.isArray(props.data)) {
        return props.data.map(item => item.period || item.date || item.label)
      }

      if (props.data.categories) {
        return props.data.categories
      }

      return Object.keys(props.data)
    }

    const generateSeries = () => {
      if (props.multiSeries) {
        return generateMultiSeries()
      }

      return [{
        name: getSeriesName(),
        type: props.type === 'area' ? 'line' : props.type,
        smooth: props.smooth && props.type === 'line',
        areaStyle: props.type === 'area' ? {} : undefined,
        data: getSeriesData(),
        emphasis: {
          focus: 'series'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 6,
        ...(props.type === 'bar' && {
          barWidth: '60%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0]
          }
        })
      }]
    }

    const generateMultiSeries = () => {
      if (!props.data.series) return []

      return props.data.series.map((series, index) => ({
        name: series.name,
        type: props.type === 'area' ? 'line' : props.type,
        smooth: props.smooth && props.type === 'line',
        areaStyle: props.type === 'area' ? { opacity: 0.3 } : undefined,
        data: series.data,
        emphasis: {
          focus: 'series'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 6,
        ...(props.type === 'bar' && {
          barWidth: '60%',
          itemStyle: {
            borderRadius: [4, 4, 0, 0]
          }
        })
      }))
    }

    const getSeriesData = () => {
      if (Array.isArray(props.data)) {
        return props.data.map(item => item.value || item.count || 0)
      }

      if (props.data.values) {
        return props.data.values
      }

      return Object.values(props.data)
    }

    const getSeriesName = () => {
      if (props.metric) {
        const metricNames = {
          conversions: 'Конверсии',
          revenue: 'Доход',
          roi: 'ROI',
          cost: 'Затраты',
          clicks: 'Клики',
          impressions: 'Показы'
        }
        return metricNames[props.metric] || props.metric
      }

      return props.data.name || 'Значение'
    }

    const formatTooltipValue = (value, seriesName) => {
      if (seriesName.includes('ROI') || seriesName.includes('%')) {
        return `${value.toFixed(1)}%`
      }

      if (seriesName.includes('Доход') || seriesName.includes('Затрат')) {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(value)
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

    watch(() => [props.type, props.metric, props.multiSeries], () => {
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

      // Обработка изменения размера окна
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
.trend-chart {
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