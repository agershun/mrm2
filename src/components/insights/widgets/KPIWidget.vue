<template>
  <v-card
    class="kpi-widget"
    :class="{ 'widget-loading': loading }"
    elevation="2"
    @click="$emit('click')"
  >
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="text-body-2 text-medium-emphasis">
          {{ title }}
        </div>
        <v-icon
          :color="color"
          size="20"
        >
          {{ icon }}
        </v-icon>
      </div>

      <div class="d-flex align-center justify-space-between">
        <div>
          <div
            v-if="!loading"
            class="text-h4 font-weight-bold"
            :class="`text-${color}`"
          >
            {{ formattedValue }}
          </div>
          <v-skeleton-loader
            v-else
            type="heading"
            width="80"
          />
        </div>

        <div
          v-if="trend && !loading"
          class="text-end"
        >
          <div
            class="d-flex align-center text-caption font-weight-medium"
            :class="trendColor"
          >
            <v-icon
              :icon="trendIcon"
              size="16"
              class="me-1"
            />
            {{ Math.abs(trend.value).toFixed(1) }}%
          </div>
          <div class="text-caption text-medium-emphasis">
            vs пред. период
          </div>
        </div>
      </div>

      <!-- Мини-график (опционально) -->
      <div
        v-if="sparklineData && sparklineData.length > 0"
        class="mt-3"
      >
        <div style="height: 40px;">
          <canvas
            ref="sparklineCanvas"
            class="sparkline-canvas"
          />
        </div>
      </div>

      <!-- Дополнительные метрики -->
      <div
        v-if="additionalMetrics && additionalMetrics.length > 0"
        class="mt-3 pt-3"
        style="border-top: 1px solid rgba(0,0,0,0.1)"
      >
        <div
          v-for="metric in additionalMetrics"
          :key="metric.key"
          class="d-flex justify-space-between text-caption mb-1"
        >
          <span class="text-medium-emphasis">{{ metric.label }}</span>
          <span :class="`text-${metric.color || 'primary'}`">
            {{ formatValue(metric.value, metric.format) }}
          </span>
        </div>
      </div>
    </v-card-text>

    <!-- Индикатор загрузки -->
    <v-overlay
      v-if="loading"
      contained
      class="align-center justify-center"
    >
      <v-progress-circular
        indeterminate
        size="32"
        :color="color"
      />
    </v-overlay>
  </v-card>
</template>

<script>
import { computed, ref, onMounted, watch, nextTick } from 'vue'

export default {
  name: 'KPIWidget',
  emits: ['click'],
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [Number, String],
      default: 0
    },
    format: {
      type: String,
      default: 'number', // number, currency, percent
      validator: (value) => ['number', 'currency', 'percent'].includes(value)
    },
    trend: {
      type: Object,
      default: null
      // { value: number, direction: 'up' | 'down' }
    },
    icon: {
      type: String,
      default: 'mdi-chart-line'
    },
    color: {
      type: String,
      default: 'primary'
    },
    loading: {
      type: Boolean,
      default: false
    },
    sparklineData: {
      type: Array,
      default: () => []
    },
    additionalMetrics: {
      type: Array,
      default: () => []
      // [{ key, label, value, format, color }]
    }
  },
  setup(props) {
    const sparklineCanvas = ref(null)

    // Computed properties
    const formattedValue = computed(() => {
      return formatValue(props.value, props.format)
    })

    const trendColor = computed(() => {
      if (!props.trend) return ''

      const direction = props.trend.direction || (props.trend.value >= 0 ? 'up' : 'down')
      return direction === 'up' ? 'text-success' : 'text-error'
    })

    const trendIcon = computed(() => {
      if (!props.trend) return ''

      const direction = props.trend.direction || (props.trend.value >= 0 ? 'up' : 'down')
      return direction === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'
    })

    // Methods
    const formatValue = (value, format) => {
      if (value === null || value === undefined) return '—'

      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(value)

        case 'percent':
          return `${value.toFixed(1)}%`

        case 'number':
        default:
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}М`
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}К`
          }
          return new Intl.NumberFormat('ru-RU').format(value)
      }
    }

    const drawSparkline = () => {
      if (!sparklineCanvas.value || !props.sparklineData || props.sparklineData.length === 0) {
        return
      }

      const canvas = sparklineCanvas.value
      const ctx = canvas.getContext('2d')
      const rect = canvas.getBoundingClientRect()

      // Устанавливаем размеры canvas
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      // Очищаем canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      const data = props.sparklineData
      const maxValue = Math.max(...data)
      const minValue = Math.min(...data)
      const range = maxValue - minValue || 1

      const padding = 4
      const width = rect.width - padding * 2
      const height = rect.height - padding * 2

      // Вычисляем точки
      const points = data.map((value, index) => ({
        x: padding + (index / (data.length - 1)) * width,
        y: padding + height - ((value - minValue) / range) * height
      }))

      // Рисуем линию
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue(`--v-theme-${props.color}`) || '#1976D2'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })
      ctx.stroke()

      // Заливка под линией
      ctx.globalAlpha = 0.1
      ctx.fillStyle = ctx.strokeStyle
      ctx.lineTo(points[points.length - 1].x, padding + height)
      ctx.lineTo(points[0].x, padding + height)
      ctx.closePath()
      ctx.fill()
    }

    // Watchers
    watch(() => props.sparklineData, () => {
      nextTick(() => {
        drawSparkline()
      })
    }, { deep: true })

    // Lifecycle
    onMounted(() => {
      nextTick(() => {
        drawSparkline()
      })

      // Перерисовываем при изменении размера
      const resizeObserver = new ResizeObserver(() => {
        nextTick(() => {
          drawSparkline()
        })
      })

      if (sparklineCanvas.value) {
        resizeObserver.observe(sparklineCanvas.value)
      }

      return () => {
        resizeObserver.disconnect()
      }
    })

    return {
      sparklineCanvas,
      formattedValue,
      trendColor,
      trendIcon,
      formatValue
    }
  }
}
</script>

<style scoped>
.kpi-widget {
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.kpi-widget:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.widget-loading {
  pointer-events: none;
}

.sparkline-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.v-skeleton-loader {
  background: transparent;
}
</style>