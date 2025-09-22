<template>
  <div class="heatmap-widget">
    <div
      v-if="loading"
      class="heatmap-loading"
    >
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      />
      <div class="mt-4 text-body-2 text-medium-emphasis">
        Загрузка тепловой карты...
      </div>
    </div>

    <div
      v-else-if="!hasData"
      class="heatmap-empty"
    >
      <v-icon
        size="64"
        color="grey-lighten-2"
      >
        mdi-grid
      </v-icon>
      <div class="mt-4 text-body-2 text-medium-emphasis">
        Нет данных для тепловой карты
      </div>
    </div>

    <div
      v-else
      class="heatmap-content"
    >
      <!-- Заголовки столбцов -->
      <div class="heatmap-header">
        <div class="header-corner" />
        <div
          v-for="column in columns"
          :key="column"
          class="header-cell"
          :title="column"
        >
          {{ truncateText(column, 12) }}
        </div>
      </div>

      <!-- Строки с данными -->
      <div class="heatmap-body">
        <div
          v-for="row in rows"
          :key="row"
          class="heatmap-row"
        >
          <!-- Заголовок строки -->
          <div
            class="row-header"
            :title="row"
          >
            {{ truncateText(row, 15) }}
          </div>

          <!-- Ячейки данных -->
          <div
            v-for="column in columns"
            :key="`${row}-${column}`"
            class="heatmap-cell"
            :class="{ 'cell-clickable': isCellClickable(row, column) }"
            :style="getCellStyle(row, column)"
            @click="onCellClick(row, column)"
            @mouseover="onCellHover(row, column, $event)"
            @mouseleave="onCellLeave"
          >
            <span class="cell-value">
              {{ formatCellValue(getCellValue(row, column)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Легенда -->
      <div class="heatmap-legend">
        <div class="legend-title">{{ metricLabel }}</div>
        <div class="legend-gradient">
          <div
            class="gradient-bar"
            :style="{ background: gradientStyle }"
          />
          <div class="gradient-labels">
            <span class="gradient-min">{{ formatCellValue(minValue) }}</span>
            <span class="gradient-max">{{ formatCellValue(maxValue) }}</span>
          </div>
        </div>
      </div>

      <!-- Тултип -->
      <div
        v-if="tooltip.show"
        class="heatmap-tooltip"
        :style="tooltip.style"
      >
        <div class="tooltip-header">
          {{ tooltip.row }} × {{ tooltip.column }}
        </div>
        <div class="tooltip-value">
          {{ metricLabel }}: <strong>{{ formatCellValue(tooltip.value) }}</strong>
        </div>
        <div
          v-if="tooltip.additionalData"
          class="tooltip-additional"
        >
          <div
            v-for="(value, key) in tooltip.additionalData"
            :key="key"
            class="tooltip-item"
          >
            {{ key }}: {{ value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  name: 'HeatmapWidget',
  emits: ['cell-click', 'cell-hover'],
  props: {
    data: {
      type: [Array, Object],
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    metric: {
      type: String,
      default: 'value'
    },
    colorScheme: {
      type: String,
      default: 'blue', // blue, green, red, purple
      validator: (value) => ['blue', 'green', 'red', 'purple'].includes(value)
    },
    minCellSize: {
      type: Number,
      default: 40
    },
    maxCellSize: {
      type: Number,
      default: 60
    }
  },
  setup(props, { emit }) {
    const tooltip = ref({
      show: false,
      row: '',
      column: '',
      value: 0,
      additionalData: null,
      style: {}
    })

    // Computed properties
    const hasData = computed(() => {
      if (Array.isArray(props.data)) {
        return props.data.length > 0
      }
      return props.data && Object.keys(props.data).length > 0
    })

    const processedData = computed(() => {
      if (Array.isArray(props.data)) {
        // Массив объектов с полями row, column, value
        return props.data
      }

      // Объект с вложенной структурой
      const result = []
      Object.entries(props.data).forEach(([row, columns]) => {
        Object.entries(columns).forEach(([column, value]) => {
          result.push({ row, column, value })
        })
      })
      return result
    })

    const rows = computed(() => {
      const uniqueRows = [...new Set(processedData.value.map(item => item.row))]
      return uniqueRows.sort()
    })

    const columns = computed(() => {
      const uniqueColumns = [...new Set(processedData.value.map(item => item.column))]
      return uniqueColumns.sort()
    })

    const allValues = computed(() => {
      return processedData.value.map(item => item.value || 0).filter(v => v !== null && v !== undefined)
    })

    const minValue = computed(() => {
      return allValues.value.length > 0 ? Math.min(...allValues.value) : 0
    })

    const maxValue = computed(() => {
      return allValues.value.length > 0 ? Math.max(...allValues.value) : 0
    })

    const metricLabel = computed(() => {
      const labels = {
        roi: 'ROI',
        conversions: 'Конверсии',
        ctr: 'CTR',
        cpa: 'CPA',
        revenue: 'Доход',
        value: 'Значение'
      }
      return labels[props.metric] || props.metric
    })

    const colorSchemes = computed(() => ({
      blue: {
        low: '#E3F2FD',
        high: '#1976D2'
      },
      green: {
        low: '#E8F5E8',
        high: '#388E3C'
      },
      red: {
        low: '#FFEBEE',
        high: '#D32F2F'
      },
      purple: {
        low: '#F3E5F5',
        high: '#7B1FA2'
      }
    }))

    const gradientStyle = computed(() => {
      const scheme = colorSchemes.value[props.colorScheme]
      return `linear-gradient(to right, ${scheme.low}, ${scheme.high})`
    })

    // Methods
    const getCellValue = (row, column) => {
      const cell = processedData.value.find(item => item.row === row && item.column === column)
      return cell ? (cell.value || 0) : 0
    }

    const getCellStyle = (row, column) => {
      const value = getCellValue(row, column)
      const intensity = maxValue.value > minValue.value
        ? (value - minValue.value) / (maxValue.value - minValue.value)
        : 0

      const scheme = colorSchemes.value[props.colorScheme]
      const backgroundColor = interpolateColor(scheme.low, scheme.high, intensity)

      // Размер ячейки на основе интенсивности
      const size = props.minCellSize + (props.maxCellSize - props.minCellSize) * intensity

      return {
        backgroundColor,
        width: `${size}px`,
        height: `${size}px`,
        color: intensity > 0.6 ? '#fff' : '#333'
      }
    }

    const interpolateColor = (color1, color2, factor) => {
      const c1 = hexToRgb(color1)
      const c2 = hexToRgb(color2)

      const r = Math.round(c1.r + (c2.r - c1.r) * factor)
      const g = Math.round(c1.g + (c2.g - c1.g) * factor)
      const b = Math.round(c1.b + (c2.b - c1.b) * factor)

      return `rgb(${r}, ${g}, ${b})`
    }

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }
    }

    const formatCellValue = (value) => {
      if (value === null || value === undefined || value === 0) return '—'

      switch (props.metric) {
        case 'roi':
        case 'ctr':
          return `${value.toFixed(1)}%`
        case 'cpa':
        case 'revenue':
          return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
          }).format(value)
        default:
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}М`
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}К`
          }
          return new Intl.NumberFormat('ru-RU').format(value)
      }
    }

    const truncateText = (text, maxLength) => {
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    const isCellClickable = (row, column) => {
      return getCellValue(row, column) > 0
    }

    const onCellClick = (row, column) => {
      const value = getCellValue(row, column)
      if (value > 0) {
        emit('cell-click', { row, column, value, metric: props.metric })
      }
    }

    const onCellHover = (row, column, event) => {
      const value = getCellValue(row, column)
      const cell = processedData.value.find(item => item.row === row && item.column === column)

      tooltip.value = {
        show: true,
        row,
        column,
        value,
        additionalData: cell?.additionalData || null,
        style: {
          position: 'fixed',
          left: `${event.clientX + 10}px`,
          top: `${event.clientY - 10}px`,
          zIndex: 1000
        }
      }

      emit('cell-hover', { row, column, value, cell })
    }

    const onCellLeave = () => {
      tooltip.value.show = false
    }

    return {
      tooltip,
      hasData,
      rows,
      columns,
      minValue,
      maxValue,
      metricLabel,
      gradientStyle,
      getCellValue,
      getCellStyle,
      formatCellValue,
      truncateText,
      isCellClickable,
      onCellClick,
      onCellHover,
      onCellLeave
    }
  }
}
</script>

<style scoped>
.heatmap-widget {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.heatmap-loading,
.heatmap-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.heatmap-content {
  padding: 16px;
}

.heatmap-header {
  display: flex;
  margin-bottom: 4px;
}

.header-corner {
  width: 120px;
  min-width: 120px;
}

.header-cell {
  flex: 1;
  min-width: 60px;
  padding: 8px 4px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  border-bottom: 2px solid #e0e0e0;
}

.heatmap-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.heatmap-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-header {
  width: 120px;
  min-width: 120px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-align: right;
  border-right: 2px solid #e0e0e0;
}

.heatmap-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin: 2px;
  position: relative;
}

.cell-clickable {
  cursor: pointer;
}

.cell-clickable:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.cell-value {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
}

.heatmap-legend {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.legend-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  text-align: center;
}

.legend-gradient {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.gradient-bar {
  width: 200px;
  height: 8px;
  border-radius: 4px;
}

.gradient-labels {
  display: flex;
  justify-content: space-between;
  width: 200px;
  font-size: 11px;
  color: #666;
}

.heatmap-tooltip {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  pointer-events: none;
  max-width: 250px;
}

.tooltip-header {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-value {
  margin-bottom: 4px;
}

.tooltip-additional {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 4px;
  margin-top: 4px;
}

.tooltip-item {
  font-size: 11px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .header-corner,
  .row-header {
    width: 80px;
    min-width: 80px;
  }

  .header-cell {
    min-width: 40px;
    padding: 4px 2px;
    font-size: 10px;
  }

  .row-header {
    padding: 4px 8px;
    font-size: 10px;
  }

  .cell-value {
    font-size: 9px;
  }

  .gradient-bar,
  .gradient-labels {
    width: 150px;
  }
}
</style>