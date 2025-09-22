<template>
  <div class="investment-insight-cards">
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6">Аналитика инвестиций</h3>
      <div class="d-flex align-center gap-2">
        <v-select
          v-model="selectedPeriod"
          :items="periodOptions"
          variant="outlined"
          density="compact"
          style="min-width: 150px;"
          @update:model-value="refreshData"
        />
        <v-btn
          icon="mdi-refresh"
          size="small"
          variant="text"
          @click="refreshData"
          :loading="isLoading"
        />
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              size="small"
              variant="text"
              v-bind="props"
            />
          </template>
          <v-list density="compact">
            <v-list-item @click="customizeCards">
              <v-list-item-title>Настроить карточки</v-list-item-title>
            </v-list-item>
            <v-list-item @click="exportInsights">
              <v-list-item-title>Экспорт отчета</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <v-row>
      <!-- ROI Performance Card -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="insight-card" variant="outlined" height="280">
          <v-card-title class="pa-3 pb-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-trending-up" color="success" class="me-2"/>
                <span class="text-subtitle-1">ROI Performance</span>
              </div>
              <v-chip
                :color="getRoiTrendColor(roiData.trend)"
                size="small"
                variant="flat"
              >
                {{ formatPercentage(roiData.trend) }}
              </v-chip>
            </div>
          </v-card-title>

          <v-card-text class="pa-3 pt-0">
            <div class="mb-3">
              <div class="text-h4 font-weight-bold" :class="getRoiTrendColor(roiData.current) + '--text'">
                {{ formatPercentage(roiData.current) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Текущий ROI
              </div>
            </div>

            <div class="roi-comparison mb-3">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-caption">Ожидаемый:</span>
                <span class="text-caption font-weight-medium">{{ formatPercentage(roiData.expected) }}</span>
              </div>
              <v-progress-linear
                :model-value="(roiData.current / roiData.expected) * 100"
                height="6"
                rounded
                :color="getRoiTrendColor(roiData.current)"
              />
            </div>

            <div class="roi-breakdown">
              <div class="text-caption text-medium-emphasis mb-2">По категориям:</div>
              <div class="d-flex flex-column gap-1">
                <div
                  v-for="category in roiData.byCategory"
                  :key="category.name"
                  class="d-flex justify-space-between align-center"
                >
                  <span class="text-caption">{{ category.name }}:</span>
                  <v-chip size="x-small" :color="getRoiTrendColor(category.roi)">
                    {{ formatPercentage(category.roi) }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Budget Allocation Card -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="insight-card" variant="outlined" height="280">
          <v-card-title class="pa-3 pb-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-chart-pie" color="info" class="me-2"/>
                <span class="text-subtitle-1">Распределение бюджета</span>
              </div>
              <v-chip size="small" color="info" variant="flat">
                {{ formatCurrency(budgetData.total) }}
              </v-chip>
            </div>
          </v-card-title>

          <v-card-text class="pa-3 pt-0">
            <div class="budget-summary mb-3">
              <div class="d-flex justify-space-between mb-2">
                <div class="text-center">
                  <div class="text-subtitle-2 font-weight-bold text-success">
                    {{ formatCurrency(budgetData.allocated) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Распределено</div>
                </div>
                <div class="text-center">
                  <div class="text-subtitle-2 font-weight-bold text-warning">
                    {{ formatCurrency(budgetData.pending) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">В работе</div>
                </div>
                <div class="text-center">
                  <div class="text-subtitle-2 font-weight-bold text-error">
                    {{ formatCurrency(budgetData.remaining) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Остаток</div>
                </div>
              </div>

              <v-progress-linear
                :model-value="(budgetData.allocated / budgetData.total) * 100"
                height="8"
                rounded
                color="success"
                bg-color="grey-lighten-3"
              />
            </div>

            <div class="allocation-breakdown">
              <div class="text-caption text-medium-emphasis mb-2">Топ категории:</div>
              <div class="d-flex flex-column gap-1">
                <div
                  v-for="allocation in budgetData.topAllocations"
                  :key="allocation.name"
                  class="d-flex justify-space-between align-center"
                >
                  <span class="text-caption">{{ allocation.name }}:</span>
                  <div class="d-flex align-center gap-1">
                    <span class="text-caption font-weight-medium">{{ formatPercentage(allocation.percentage) }}</span>
                    <div
                      class="allocation-bar"
                      :style="{
                        width: `${allocation.percentage}%`,
                        backgroundColor: `rgb(var(--v-theme-${allocation.color}))`
                      }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Forecast Accuracy Card -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="insight-card" variant="outlined" height="280">
          <v-card-title class="pa-3 pb-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-crystal-ball" color="warning" class="me-2"/>
                <span class="text-subtitle-1">Точность прогноза</span>
              </div>
              <v-chip
                :color="getForecastAccuracyColor(forecastData.accuracy)"
                size="small"
                variant="flat"
              >
                {{ formatPercentage(forecastData.accuracy) }}
              </v-chip>
            </div>
          </v-card-title>

          <v-card-text class="pa-3 pt-0">
            <div class="forecast-score mb-3">
              <div class="text-h4 font-weight-bold text-warning">
                {{ formatPercentage(forecastData.accuracy) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                Средняя точность за {{ selectedPeriod.toLowerCase() }}
              </div>
            </div>

            <div class="confidence-levels mb-3">
              <div class="text-caption text-medium-emphasis mb-2">Уровни уверенности:</div>
              <div class="confidence-grid">
                <div
                  v-for="level in forecastData.confidenceLevels"
                  :key="level.name"
                  class="confidence-item"
                >
                  <v-chip
                    size="x-small"
                    :color="level.color"
                    class="mb-1"
                  >
                    {{ level.name }}
                  </v-chip>
                  <div class="text-caption">{{ level.count }} элементов</div>
                </div>
              </div>
            </div>

            <div class="forecast-trends">
              <div class="text-caption text-medium-emphasis mb-2">Тренды:</div>
              <div class="trend-indicators">
                <div
                  v-for="trend in forecastData.trends"
                  :key="trend.name"
                  class="d-flex justify-space-between align-center mb-1"
                >
                  <span class="text-caption">{{ trend.name }}:</span>
                  <div class="d-flex align-center gap-1">
                    <v-icon
                      :icon="trend.direction === 'up' ? 'mdi-trending-up' : trend.direction === 'down' ? 'mdi-trending-down' : 'mdi-trending-neutral'"
                      :color="trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'error' : 'warning'"
                      size="12"
                    />
                    <span class="text-caption">{{ formatPercentage(trend.value) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Activity Connections Card -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="insight-card" variant="outlined" height="280">
          <v-card-title class="pa-3 pb-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-link" color="primary" class="me-2"/>
                <span class="text-subtitle-1">Связи с активностями</span>
              </div>
              <v-chip size="small" color="primary" variant="flat">
                {{ activityData.connectionRate }}%
              </v-chip>
            </div>
          </v-card-title>

          <v-card-text class="pa-3 pt-0">
            <div class="connection-stats mb-3">
              <div class="d-flex justify-space-between mb-2">
                <div class="text-center">
                  <div class="text-subtitle-2 font-weight-bold text-success">
                    {{ activityData.connected }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Связано</div>
                </div>
                <div class="text-center">
                  <div class="text-subtitle-2 font-weight-bold text-error">
                    {{ activityData.unconnected }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Не связано</div>
                </div>
                <div class="text-center">
                  <div class="text-subtitle-2 font-weight-bold text-info">
                    {{ activityData.total }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Всего</div>
                </div>
              </div>

              <v-progress-linear
                :model-value="activityData.connectionRate"
                height="8"
                rounded
                color="primary"
              />
            </div>

            <div class="activity-breakdown">
              <div class="text-caption text-medium-emphasis mb-2">По типам активностей:</div>
              <div class="d-flex flex-column gap-1">
                <div
                  v-for="type in activityData.byType"
                  :key="type.name"
                  class="d-flex justify-space-between align-center"
                >
                  <span class="text-caption">{{ type.name }}:</span>
                  <div class="d-flex align-center gap-1">
                    <span class="text-caption font-weight-medium">{{ type.connected }}/{{ type.total }}</span>
                    <v-progress-circular
                      :model-value="(type.connected / type.total) * 100"
                      size="16"
                      width="2"
                      :color="type.connected === type.total ? 'success' : 'warning'"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="connection-quality mt-2">
              <div class="text-caption text-medium-emphasis mb-1">Качество связей:</div>
              <div class="d-flex justify-space-between">
                <v-chip size="x-small" color="success">
                  Сильные: {{ activityData.quality.strong }}
                </v-chip>
                <v-chip size="x-small" color="warning">
                  Слабые: {{ activityData.quality.weak }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Performance Trends Card -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="insight-card" variant="outlined" height="280">
          <v-card-title class="pa-3 pb-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-chart-line" color="info" class="me-2"/>
                <span class="text-subtitle-1">Тренды эффективности</span>
              </div>
              <v-chip
                :color="getPerformanceTrendColor(performanceData.overallTrend)"
                size="small"
                variant="flat"
              >
                {{ performanceData.overallTrend > 0 ? '+' : '' }}{{ formatPercentage(performanceData.overallTrend) }}
              </v-chip>
            </div>
          </v-card-title>

          <v-card-text class="pa-3 pt-0">
            <div class="performance-overview mb-3">
              <div class="d-flex justify-space-between mb-2">
                <div class="text-center">
                  <div class="text-subtitle-2 font-weight-bold text-success">
                    {{ performanceData.improving }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Растет</div>
                </div>
                <div class="text-center">
                  <div class="text-subtitle-2 font-weight-bold text-warning">
                    {{ performanceData.stable }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Стабильно</div>
                </div>
                <div class="text-center">
                  <div class="text-subtitle-2 font-weight-bold text-error">
                    {{ performanceData.declining }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Падает</div>
                </div>
              </div>
            </div>

            <div class="key-metrics">
              <div class="text-caption text-medium-emphasis mb-2">Ключевые метрики:</div>
              <div class="metrics-grid">
                <div
                  v-for="metric in performanceData.keyMetrics"
                  :key="metric.name"
                  class="metric-item"
                >
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-caption">{{ metric.name }}:</span>
                    <div class="d-flex align-center gap-1">
                      <v-icon
                        :icon="metric.trend === 'up' ? 'mdi-trending-up' : metric.trend === 'down' ? 'mdi-trending-down' : 'mdi-trending-neutral'"
                        :color="metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'error' : 'warning'"
                        size="12"
                      />
                      <span class="text-caption font-weight-medium">{{ metric.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="performance-alerts mt-2">
              <div class="text-caption text-medium-emphasis mb-1">Предупреждения:</div>
              <div class="d-flex flex-column gap-1">
                <v-chip
                  v-for="alert in performanceData.alerts"
                  :key="alert.id"
                  size="x-small"
                  :color="alert.severity"
                  variant="flat"
                >
                  {{ alert.message }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Risk Assessment Card -->
      <v-col cols="12" md="6" lg="4">
        <v-card class="insight-card" variant="outlined" height="280">
          <v-card-title class="pa-3 pb-2">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon icon="mdi-shield-alert" color="error" class="me-2"/>
                <span class="text-subtitle-1">Оценка рисков</span>
              </div>
              <v-chip
                :color="getRiskLevelColor(riskData.overallRisk)"
                size="small"
                variant="flat"
              >
                {{ getRiskLevelText(riskData.overallRisk) }}
              </v-chip>
            </div>
          </v-card-title>

          <v-card-text class="pa-3 pt-0">
            <div class="risk-score mb-3">
              <div class="text-h4 font-weight-bold" :class="getRiskLevelColor(riskData.overallRisk) + '--text'">
                {{ riskData.riskScore }}/10
              </div>
              <div class="text-caption text-medium-emphasis">
                Общий уровень риска
              </div>
            </div>

            <div class="risk-distribution mb-3">
              <div class="text-caption text-medium-emphasis mb-2">Распределение рисков:</div>
              <div class="risk-categories">
                <div
                  v-for="category in riskData.categories"
                  :key="category.name"
                  class="d-flex justify-space-between align-center mb-1"
                >
                  <span class="text-caption">{{ category.name }}:</span>
                  <v-chip
                    size="x-small"
                    :color="getRiskLevelColor(category.level)"
                  >
                    {{ category.count }}
                  </v-chip>
                </div>
              </div>
            </div>

            <div class="risk-factors">
              <div class="text-caption text-medium-emphasis mb-2">Основные факторы:</div>
              <div class="d-flex flex-column gap-1">
                <v-chip
                  v-for="factor in riskData.topFactors"
                  :key="factor.id"
                  size="x-small"
                  :color="getRiskLevelColor(factor.impact)"
                  variant="outlined"
                >
                  {{ factor.name }}
                </v-chip>
              </div>
            </div>

            <div class="risk-recommendations mt-2">
              <div class="text-caption text-medium-emphasis mb-1">Рекомендации:</div>
              <div class="text-caption">
                {{ riskData.recommendation }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  selectedPlanId: {
    type: String,
    default: null
  }
})

// Reactive data
const isLoading = ref(false)
const selectedPeriod = ref('Текущий квартал')

const periodOptions = [
  'Текущий месяц',
  'Текущий квартал',
  'Текущий год',
  'Последние 3 месяца',
  'Последние 6 месяцев',
  'Последний год'
]

// Mock данные для карточек
const roiData = ref({
  current: 28.5,
  expected: 25.0,
  trend: 3.5,
  byCategory: [
    { name: 'Digital Marketing', roi: 32.1 },
    { name: 'Social Media', roi: 28.7 },
    { name: 'Traditional', roi: 18.3 }
  ]
})

const budgetData = ref({
  total: 5000000,
  allocated: 3200000,
  pending: 800000,
  remaining: 1000000,
  topAllocations: [
    { name: 'Digital Marketing', percentage: 45, color: 'primary' },
    { name: 'Traditional', percentage: 30, color: 'info' },
    { name: 'Innovation', percentage: 25, color: 'warning' }
  ]
})

const forecastData = ref({
  accuracy: 87.3,
  confidenceLevels: [
    { name: 'Уверенный', count: 12, color: 'success' },
    { name: 'Вероятный', count: 8, color: 'info' },
    { name: 'Гипотетический', count: 5, color: 'warning' },
    { name: 'Маловероятный', count: 2, color: 'error' }
  ],
  trends: [
    { name: 'Точность', value: 5.2, direction: 'up' },
    { name: 'Надежность', value: -1.8, direction: 'down' },
    { name: 'Стабильность', value: 0.3, direction: 'neutral' }
  ]
})

const activityData = ref({
  connected: 18,
  unconnected: 9,
  total: 27,
  connectionRate: 66.7,
  byType: [
    { name: 'Реклама', connected: 8, total: 10 },
    { name: 'Контент', connected: 6, total: 8 },
    { name: 'События', connected: 4, total: 9 }
  ],
  quality: {
    strong: 12,
    weak: 6
  }
})

const performanceData = ref({
  overallTrend: 4.2,
  improving: 15,
  stable: 8,
  declining: 4,
  keyMetrics: [
    { name: 'CTR', value: '3.2%', trend: 'up' },
    { name: 'CPC', value: '₽45', trend: 'down' },
    { name: 'Conversion', value: '2.8%', trend: 'up' },
    { name: 'ROAS', value: '4.1x', trend: 'neutral' }
  ],
  alerts: [
    { id: 1, message: 'CPC выше плана на 15%', severity: 'warning' },
    { id: 2, message: 'Низкий CTR в TikTok', severity: 'error' }
  ]
})

const riskData = ref({
  overallRisk: 'medium',
  riskScore: 6.2,
  categories: [
    { name: 'Бюджетные', level: 'low', count: 3 },
    { name: 'Временные', level: 'medium', count: 5 },
    { name: 'Качественные', level: 'high', count: 2 }
  ],
  topFactors: [
    { id: 1, name: 'Превышение бюджета', impact: 'high' },
    { id: 2, name: 'Задержки запуска', impact: 'medium' },
    { id: 3, name: 'Низкое качество креативов', impact: 'medium' }
  ],
  recommendation: 'Рекомендуется усилить контроль бюджета и пересмотреть креативную стратегию.'
})

// Methods
const refreshData = () => {
  isLoading.value = true
  setTimeout(() => {
    // Симуляция загрузки данных
    isLoading.value = false
  }, 1000)
}

const customizeCards = () => {
  console.log('Customize cards')
}

const exportInsights = () => {
  console.log('Export insights')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`
}

const getRoiTrendColor = (value) => {
  if (value >= 30) return 'success'
  if (value >= 20) return 'info'
  if (value >= 10) return 'warning'
  return 'error'
}

const getForecastAccuracyColor = (value) => {
  if (value >= 90) return 'success'
  if (value >= 75) return 'info'
  if (value >= 60) return 'warning'
  return 'error'
}

const getPerformanceTrendColor = (value) => {
  if (value > 0) return 'success'
  if (value === 0) return 'warning'
  return 'error'
}

const getRiskLevelColor = (level) => {
  const colors = {
    low: 'success',
    medium: 'warning',
    high: 'error'
  }
  return colors[level] || 'grey'
}

const getRiskLevelText = (level) => {
  const texts = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий'
  }
  return texts[level] || level
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.investment-insight-cards {
  /* Контейнер карточек */
}

.insight-card {
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 12px;
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.allocation-bar {
  height: 4px;
  border-radius: 2px;
  min-width: 20px;
  max-width: 40px;
}

.confidence-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.confidence-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.metrics-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.risk-categories {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Анимации */
.v-progress-linear,
.v-progress-circular {
  transition: all 0.3s ease;
}

/* Цветовая схема для карточек */
.insight-card .v-card-title {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface-variant), 0.3), transparent);
}
</style>