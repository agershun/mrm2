<template>
  <div class="correlation-matrix">
    <div
      v-if="loading"
      class="matrix-loading"
    >
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      />
      <div class="mt-4 text-body-2 text-medium-emphasis">
        Анализ корреляций...
      </div>
    </div>

    <div
      v-else-if="!hasData"
      class="matrix-empty"
    >
      <v-icon
        size="64"
        color="grey-lighten-2"
      >
        mdi-matrix
      </v-icon>
      <div class="mt-4 text-body-2 text-medium-emphasis">
        Недостаточно данных для анализа корреляций
      </div>
    </div>

    <div
      v-else
      class="matrix-content"
    >
      <!-- Заголовки -->
      <div class="matrix-header">
        <div class="header-corner" />
        <div
          v-for="metric in metrics"
          :key="metric.key"
          class="header-cell"
          :title="metric.name"
        >
          {{ metric.short || metric.name }}
        </div>
      </div>

      <!-- Матрица корреляций -->
      <div class="matrix-body">
        <div
          v-for="(rowMetric, rowIndex) in metrics"
          :key="rowMetric.key"
          class="matrix-row"
        >
          <!-- Заголовок строки -->
          <div
            class="row-header"
            :title="rowMetric.name"
          >
            {{ rowMetric.short || rowMetric.name }}
          </div>

          <!-- Ячейки корреляций -->
          <div
            v-for="(colMetric, colIndex) in metrics"
            :key="`${rowMetric.key}-${colMetric.key}`"
            class="correlation-cell"
            :class="{
              'cell-diagonal': rowIndex === colIndex,
              'cell-clickable': rowIndex !== colIndex
            }"
            :style="getCellStyle(rowMetric.key, colMetric.key)"
            @click="onCellClick(rowMetric, colMetric)"
          >
            <span class="cell-value">
              {{ formatCorrelation(getCorrelation(rowMetric.key, colMetric.key)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Легенда корреляций -->
      <div class="correlation-legend">
        <div class="legend-title">Сила корреляции</div>
        <div class="legend-items">
          <div class="legend-item">
            <div
              class="legend-color"
              style="background: #D32F2F"
            />
            <span>Сильная отрицательная (-1.0 до -0.7)</span>
          </div>
          <div class="legend-item">
            <div
              class="legend-color"
              style="background: #FF7043"
            />
            <span>Умеренная отрицательная (-0.7 до -0.3)</span>
          </div>
          <div class="legend-item">
            <div
              class="legend-color"
              style="background: #F5F5F5"
            />
            <span>Слабая (-0.3 до 0.3)</span>
          </div>
          <div class="legend-item">
            <div
              class="legend-color"
              style="background: #66BB6A"
            />
            <span>Умеренная положительная (0.3 до 0.7)</span>
          </div>
          <div class="legend-item">
            <div
              class="legend-color"
              style="background: #388E3C"
            />
            <span>Сильная положительная (0.7 до 1.0)</span>
          </div>
        </div>
      </div>

      <!-- Интересные находки -->
      <div
        v-if="insights.length > 0"
        class="correlation-insights"
      >
        <div class="insights-title">Ключевые находки</div>
        <div class="insights-list">
          <div
            v-for="insight in insights"
            :key="insight.id"
            class="insight-item"
            :class="`insight-${insight.type}`"
          >
            <v-icon
              :icon="getInsightIcon(insight.type)"
              size="16"
              class="insight-icon"
            />
            <span class="insight-text">{{ insight.text }}</span>
            <span class="insight-value">{{ formatCorrelation(insight.value) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'CorrelationMatrix',
  emits: ['metric-click', 'insight-click'],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    metrics: {
      type: Array,
      default: () => [
        { key: 'roi', name: 'ROI', short: 'ROI' },
        { key: 'conversions', name: 'Конверсии', short: 'Conv' },
        { key: 'ctr', name: 'CTR', short: 'CTR' },
        { key: 'cpa', name: 'CPA', short: 'CPA' },
        { key: 'impressions', name: 'Показы', short: 'Imp' }
      ]
    }
  },
  setup(props, { emit }) {
    // Computed properties
    const hasData = computed(() => {
      return props.data && Object.keys(props.data).length > 0
    })

    const insights = computed(() => {
      if (!hasData.value) return []

      const findings = []

      // Находим сильные корреляции
      props.metrics.forEach((metric1) => {
        props.metrics.forEach((metric2) => {
          if (metric1.key !== metric2.key) {
            const correlation = getCorrelation(metric1.key, metric2.key)

            if (Math.abs(correlation) >= 0.7) {
              findings.push({
                id: `${metric1.key}-${metric2.key}`,
                type: correlation > 0 ? 'positive' : 'negative',
                text: `${metric1.name} и ${metric2.name}`,
                value: correlation,
                metric1: metric1.key,
                metric2: metric2.key
              })
            }
          }
        })
      })

      // Сортируем по силе корреляции
      return findings
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .slice(0, 5) // Показываем только топ-5
    })

    // Methods
    const getCorrelation = (metric1, metric2) => {
      if (metric1 === metric2) return 1.0

      const key = `${metric1}-${metric2}`
      const reverseKey = `${metric2}-${metric1}`

      return props.data[key] || props.data[reverseKey] || 0
    }

    const formatCorrelation = (value) => {
      if (value === 1.0) return '1.00'
      if (value === -1.0) return '-1.00'
      return value.toFixed(2)
    }

    const getCellStyle = (metric1, metric2) => {
      const correlation = getCorrelation(metric1, metric2)

      // Цвета для корреляций
      let backgroundColor = '#F5F5F5'
      let color = '#333'

      if (Math.abs(correlation) >= 0.7) {
        backgroundColor = correlation > 0 ? '#388E3C' : '#D32F2F'
        color = '#fff'
      } else if (Math.abs(correlation) >= 0.3) {
        backgroundColor = correlation > 0 ? '#66BB6A' : '#FF7043'
        color = '#fff'
      }

      // Диагональные ячейки (корреляция с самим собой)
      if (metric1 === metric2) {
        backgroundColor = '#1976D2'
        color = '#fff'
      }

      return {
        backgroundColor,
        color
      }
    }

    const getInsightIcon = (type) => {
      switch (type) {
        case 'positive':
          return 'mdi-trending-up'
        case 'negative':
          return 'mdi-trending-down'
        default:
          return 'mdi-information'
      }
    }

    const onCellClick = (metric1, metric2) => {
      if (metric1.key !== metric2.key) {
        const correlation = getCorrelation(metric1.key, metric2.key)
        emit('metric-click', {
          metric1: metric1.key,
          metric2: metric2.key,
          correlation,
          metrics: [metric1, metric2]
        })
      }
    }

    return {
      hasData,
      insights,
      getCorrelation,
      formatCorrelation,
      getCellStyle,
      getInsightIcon,
      onCellClick
    }
  }
}
</script>

<style scoped>
.correlation-matrix {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.matrix-loading,
.matrix-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.matrix-content {
  padding: 16px;
}

.matrix-header {
  display: flex;
  margin-bottom: 2px;
}

.header-corner {
  width: 60px;
  min-width: 60px;
}

.header-cell {
  flex: 1;
  min-width: 50px;
  max-width: 60px;
  padding: 8px 4px;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #666;
  transform: rotate(-45deg);
  transform-origin: center;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.matrix-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.matrix-row {
  display: flex;
  gap: 2px;
}

.row-header {
  width: 60px;
  min-width: 60px;
  padding: 8px 4px;
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.correlation-cell {
  flex: 1;
  min-width: 50px;
  max-width: 60px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
}

.cell-clickable {
  cursor: pointer;
}

.cell-clickable:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.cell-diagonal {
  border: 2px solid #fff;
}

.cell-value {
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.correlation-legend {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.legend-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid #ddd;
}

.correlation-insights {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.insights-title {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 12px;
}

.insight-positive {
  border-left: 3px solid #388E3C;
}

.insight-negative {
  border-left: 3px solid #D32F2F;
}

.insight-icon {
  color: inherit;
}

.insight-text {
  flex: 1;
  color: #333;
}

.insight-value {
  font-weight: 600;
  font-size: 13px;
}

.insight-positive .insight-value {
  color: #388E3C;
}

.insight-negative .insight-value {
  color: #D32F2F;
}

@media (max-width: 768px) {
  .header-corner,
  .row-header {
    width: 40px;
    min-width: 40px;
  }

  .header-cell {
    min-width: 35px;
    max-width: 40px;
    font-size: 9px;
    height: 35px;
  }

  .correlation-cell {
    min-width: 35px;
    max-width: 40px;
    height: 35px;
  }

  .cell-value {
    font-size: 9px;
  }

  .row-header {
    font-size: 9px;
    padding: 4px 2px;
  }

  .legend-items {
    flex-direction: column;
    gap: 6px;
  }

  .legend-item {
    font-size: 10px;
  }

  .insight-item {
    font-size: 11px;
    padding: 6px 8px;
  }
}
</style>