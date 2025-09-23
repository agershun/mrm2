<template>
  <div class="investment-treemap">
    <v-card>
      <v-card-title>
        <div class="d-flex justify-space-between align-center w-100">
          <span>Карта инвестиций</span>
          <div class="d-flex align-center">
            <v-btn-toggle v-model="metric" mandatory size="small">
              <v-btn value="amount" size="small">По сумме</v-btn>
              <v-btn value="roi" size="small">По ROI</v-btn>
              <v-btn value="performance" size="small">По результату</v-btn>
            </v-btn-toggle>
          </div>
        </div>
      </v-card-title>

      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-2">Загрузка данных...</p>
        </div>

        <div v-else-if="!data || data.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">mdi-chart-box-outline</v-icon>
          <p class="text-grey mt-2">Нет данных для отображения</p>
        </div>

        <div v-else class="treemap-container">
          <!-- Имитация treemap через CSS Grid -->
          <div class="treemap-grid" :style="gridStyle">
            <div
              v-for="(item, index) in treemapData"
              :key="item.id"
              class="treemap-item"
              :style="getItemStyle(item, index)"
              @click="selectItem(item)"
              @mouseenter="hoverItem = item"
              @mouseleave="hoverItem = null"
            >
              <div class="treemap-content">
                <div class="treemap-title">{{ item.name }}</div>
                <div class="treemap-value">{{ formatValue(item.value) }}</div>
                <div class="treemap-subtitle">{{ item.category }}</div>

                <!-- Дополнительные метрики -->
                <div v-if="item.roi" class="treemap-metric">
                  ROI: {{ item.roi }}%
                </div>
                <div v-if="item.performance_score" class="treemap-metric">
                  Результат: {{ item.performance_score }}
                </div>
              </div>

              <!-- Индикатор производительности -->
              <div class="treemap-indicator" :style="getIndicatorStyle(item)"></div>
            </div>
          </div>

          <!-- Легенда -->
          <div class="treemap-legend mt-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-2">Размер блока</v-card-title>
                  <v-card-text class="pa-3">
                    <div class="text-caption">
                      Размер блока соответствует {{ getMetricLabel(metric) }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-2">Цвет блока</v-card-title>
                  <v-card-text class="pa-3">
                    <div class="d-flex align-center mb-2">
                      <div class="color-sample success me-2"></div>
                      <span class="text-caption">Высокая производительность</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <div class="color-sample warning me-2"></div>
                      <span class="text-caption">Средняя производительность</span>
                    </div>
                    <div class="d-flex align-center">
                      <div class="color-sample error me-2"></div>
                      <span class="text-caption">Низкая производительность</span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Детали выбранного элемента -->
          <v-card v-if="selectedItem" variant="outlined" class="mt-4">
            <v-card-title>{{ selectedItem.name }}</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="3">
                  <div class="text-caption text-grey">Категория</div>
                  <div class="font-weight-medium">{{ selectedItem.category }}</div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-caption text-grey">Сумма инвестиций</div>
                  <div class="font-weight-medium">{{ formatCurrency(selectedItem.amount) }}</div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-caption text-grey">ROI</div>
                  <div class="font-weight-medium">{{ selectedItem.roi }}%</div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="text-caption text-grey">Результат</div>
                  <div class="font-weight-medium">{{ selectedItem.performance_score }}/100</div>
                </v-col>
              </v-row>
              <div v-if="selectedItem.description" class="mt-3">
                <div class="text-caption text-grey">Описание</div>
                <div>{{ selectedItem.description }}</div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['item-selected'])

const metric = ref('amount')
const selectedItem = ref(null)
const hoverItem = ref(null)

const treemapData = computed(() => {
  if (!props.data || props.data.length === 0) return []

  const maxValue = Math.max(...props.data.map(item => getItemValue(item)))

  return props.data.map(item => ({
    ...item,
    value: getItemValue(item),
    normalizedSize: (getItemValue(item) / maxValue) * 100
  })).sort((a, b) => b.value - a.value)
})

const gridStyle = computed(() => {
  const itemCount = treemapData.value.length
  const columns = Math.ceil(Math.sqrt(itemCount))

  return {
    'grid-template-columns': `repeat(${columns}, 1fr)`,
    'grid-template-rows': `repeat(${Math.ceil(itemCount / columns)}, 1fr)`
  }
})

const getItemValue = (item) => {
  switch (metric.value) {
    case 'roi':
      return item.roi || 0
    case 'performance':
      return item.performance_score || 0
    default:
      return item.amount || item.allocated_amount || 0
  }
}

const getItemStyle = (item, index) => {
  const colors = {
    high: 'rgba(76, 175, 80, 0.8)',    // Зеленый
    medium: 'rgba(255, 193, 7, 0.8)',  // Желтый
    low: 'rgba(244, 67, 54, 0.8)'      // Красный
  }

  let performanceLevel = 'low'
  if (item.performance_score >= 70) performanceLevel = 'high'
  else if (item.performance_score >= 40) performanceLevel = 'medium'

  const minSize = 80
  const maxSize = 200
  const size = Math.max(minSize, Math.min(maxSize, minSize + (item.normalizedSize * 1.2)))

  return {
    backgroundColor: colors[performanceLevel],
    minHeight: `${size}px`,
    border: selectedItem.value?.id === item.id ? '3px solid #1976d2' : '1px solid rgba(0,0,0,0.1)',
    transform: hoverItem.value?.id === item.id ? 'scale(1.05)' : 'scale(1)'
  }
}

const getIndicatorStyle = (item) => {
  const width = Math.min(100, Math.max(10, item.normalizedSize))

  return {
    width: `${width}%`,
    backgroundColor: getPerformanceColor(item.performance_score)
  }
}

const getPerformanceColor = (score) => {
  if (score >= 70) return '#4caf50'
  if (score >= 40) return '#ff9800'
  return '#f44336'
}

const getMetricLabel = (metricValue) => {
  const labels = {
    amount: 'сумме инвестиций',
    roi: 'показателю ROI',
    performance: 'результату'
  }
  return labels[metricValue] || metricValue
}

const formatValue = (value) => {
  switch (metric.value) {
    case 'roi':
      return `${value}%`
    case 'performance':
      return `${value}/100`
    default:
      return formatCurrency(value)
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(value)
}

const selectItem = (item) => {
  selectedItem.value = selectedItem.value?.id === item.id ? null : item
  emit('item-selected', selectedItem.value)
}
</script>

<style scoped>
.treemap-container {
  min-height: 400px;
}

.treemap-grid {
  display: grid;
  gap: 8px;
  min-height: 400px;
  padding: 16px;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
}

.treemap-item {
  position: relative;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.treemap-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.treemap-content {
  text-align: center;
  color: white;
  z-index: 2;
  padding: 8px;
}

.treemap-title {
  font-weight: bold;
  font-size: 0.9rem;
  margin-bottom: 4px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.treemap-value {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 4px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.treemap-subtitle {
  font-size: 0.75rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.treemap-metric {
  font-size: 0.7rem;
  margin-top: 2px;
  opacity: 0.8;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.treemap-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  transition: width 0.3s ease;
}

.color-sample {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.color-sample.success {
  background-color: rgba(76, 175, 80, 0.8);
}

.color-sample.warning {
  background-color: rgba(255, 193, 7, 0.8);
}

.color-sample.error {
  background-color: rgba(244, 67, 54, 0.8);
}
</style>