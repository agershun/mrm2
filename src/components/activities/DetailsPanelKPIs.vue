<template>
  <div class="details-panel-kpis">
    <v-container fluid class="pa-4">
      <!-- Общий обзор KPI -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-target</v-icon>
          Обзор ключевых показателей
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col cols="12" md="3">
              <div class="kpi-summary-card text-center pa-3">
                <div class="text-h4 font-weight-bold text-success">{{ achievedKPIs }}</div>
                <div class="text-caption text-grey-darken-1">Достигнуто целей</div>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="kpi-summary-card text-center pa-3">
                <div class="text-h4 font-weight-bold text-warning">{{ inProgressKPIs }}</div>
                <div class="text-caption text-grey-darken-1">В процессе</div>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="kpi-summary-card text-center pa-3">
                <div class="text-h4 font-weight-bold text-error">{{ missedKPIs }}</div>
                <div class="text-caption text-grey-darken-1">Не достигнуто</div>
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="kpi-summary-card text-center pa-3">
                <div class="text-h4 font-weight-bold text-primary">{{ overallProgress }}%</div>
                <div class="text-caption text-grey-darken-1">Общий прогресс</div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Список KPI -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-format-list-bulleted</v-icon>
          Ключевые показатели эффективности
        </v-card-title>
        <v-card-text class="pa-3">
          <div
            v-for="kpi in kpiList"
            :key="kpi.id"
            class="kpi-item pa-3 mb-3 rounded border"
          >
            <div class="d-flex justify-space-between align-center mb-3">
              <div class="kpi-header">
                <div class="d-flex align-center">
                  <v-icon :color="getKPIStatusColor(kpi.status)" class="me-2">
                    {{ getKPIStatusIcon(kpi.status) }}
                  </v-icon>
                  <span class="text-subtitle-1 font-weight-medium">{{ kpi.name }}</span>
                </div>
                <div class="text-caption text-grey-darken-1 mt-1">{{ kpi.description }}</div>
              </div>
              <div class="kpi-status">
                <v-chip :color="getKPIStatusColor(kpi.status)" size="small" variant="outlined">
                  {{ getKPIStatusText(kpi.status) }}
                </v-chip>
              </div>
            </div>

            <div class="kpi-metrics mb-3">
              <v-row>
                <v-col cols="12" md="3">
                  <div class="metric-info">
                    <div class="text-caption text-grey-darken-1">Целевое значение</div>
                    <div class="text-h6 font-weight-bold">{{ formatKPIValue(kpi.target, kpi.unit) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="metric-info">
                    <div class="text-caption text-grey-darken-1">Текущее значение</div>
                    <div class="text-h6 font-weight-bold" :class="getValueColor(kpi.current, kpi.target, kpi.type)">
                      {{ formatKPIValue(kpi.current, kpi.unit) }}
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="metric-info">
                    <div class="text-caption text-grey-darken-1">Прогресс</div>
                    <div class="text-h6 font-weight-bold">{{ kpi.progress }}%</div>
                  </div>
                </v-col>
                <v-col cols="12" md="3">
                  <div class="metric-info">
                    <div class="text-caption text-grey-darken-1">Срок достижения</div>
                    <div class="text-body-2">{{ formatDate(kpi.deadline) }}</div>
                  </div>
                </v-col>
              </v-row>
            </div>

            <div class="kpi-progress mb-2">
              <v-progress-linear
                :model-value="kpi.progress"
                :color="getProgressColor(kpi.progress, kpi.status)"
                height="8"
                rounded
              />
            </div>

            <div class="kpi-trend d-flex align-center justify-space-between">
              <div class="trend-info">
                <v-icon
                  :color="kpi.trend >= 0 ? 'success' : 'error'"
                  size="16"
                  class="me-1"
                >
                  {{ kpi.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                </v-icon>
                <span class="text-caption" :class="kpi.trend >= 0 ? 'text-success' : 'text-error'">
                  {{ kpi.trend >= 0 ? '+' : '' }}{{ kpi.trend }}% за последний период
                </span>
              </div>
              <div class="kpi-actions">
                <v-btn variant="text" size="small" @click="viewKPIDetails(kpi)">
                  Подробнее
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Аналитика трендов -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-chart-timeline-variant</v-icon>
          Анализ трендов
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col
              v-for="trend in trendAnalysis"
              :key="trend.period"
              cols="12"
              md="4"
            >
              <div class="trend-card pa-3 rounded border text-center">
                <div class="text-subtitle-2 text-grey-darken-1 mb-2">{{ trend.period }}</div>
                <div class="text-h5 font-weight-bold mb-2" :class="getTrendColor(trend.performance)">
                  {{ trend.performance >= 0 ? '+' : '' }}{{ trend.performance }}%
                </div>
                <div class="text-caption">по сравнению с предыдущим периодом</div>
                <v-progress-linear
                  :model-value="Math.abs(trend.performance)"
                  :color="trend.performance >= 0 ? 'success' : 'error'"
                  height="4"
                  rounded
                  class="mt-2"
                />
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Прогноз достижения целей -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-crystal-ball</v-icon>
          Прогноз достижения целей
        </v-card-title>
        <v-card-text class="pa-3">
          <div class="forecast-container pa-3 rounded border">
            <v-row>
              <v-col cols="12" md="4">
                <div class="forecast-metric text-center">
                  <div class="text-h6 font-weight-bold text-success">{{ forecast.likelihood }}%</div>
                  <div class="text-caption text-grey-darken-1">Вероятность достижения всех целей</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="forecast-metric text-center">
                  <div class="text-h6 font-weight-bold text-info">{{ forecast.estimatedDate }}</div>
                  <div class="text-caption text-grey-darken-1">Ожидаемая дата достижения</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="forecast-metric text-center">
                  <div class="text-h6 font-weight-bold text-warning">{{ forecast.riskLevel }}</div>
                  <div class="text-caption text-grey-darken-1">Уровень риска</div>
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-3" />

            <div class="recommendations">
              <div class="text-subtitle-2 mb-2">Рекомендации для улучшения показателей:</div>
              <v-list density="compact">
                <v-list-item
                  v-for="(recommendation, index) in recommendations"
                  :key="index"
                  class="px-0"
                >
                  <template v-slot:prepend>
                    <v-icon color="primary" size="16">mdi-lightbulb</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">{{ recommendation }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/appStore'

const props = defineProps({
  activity: {
    type: Object,
    default: () => ({})
  }
})

const appStore = useAppStore()

const kpiList = ref([
  {
    id: 1,
    name: 'Количество лидов',
    description: 'Общее количество квалифицированных лидов',
    target: 5000,
    current: 3800,
    progress: 76,
    unit: 'шт',
    type: 'higher_better',
    status: 'in_progress',
    deadline: '2025-12-31',
    trend: 15.2
  },
  {
    id: 2,
    name: 'Конверсия в продажи',
    description: 'Процент лидов, конвертированных в продажи',
    target: 15,
    current: 18.5,
    progress: 123,
    unit: '%',
    type: 'higher_better',
    status: 'achieved',
    deadline: '2025-12-31',
    trend: 8.7
  },
  {
    id: 3,
    name: 'Стоимость привлечения клиента',
    description: 'Средняя стоимость привлечения одного клиента',
    target: 1200,
    current: 950,
    progress: 126,
    unit: '₽',
    type: 'lower_better',
    status: 'achieved',
    deadline: '2025-12-31',
    trend: -12.3
  },
  {
    id: 4,
    name: 'Узнаваемость бренда',
    description: 'Процент целевой аудитории, знающей о бренде',
    target: 45,
    current: 32,
    progress: 71,
    unit: '%',
    type: 'higher_better',
    status: 'at_risk',
    deadline: '2025-12-31',
    trend: 3.1
  },
  {
    id: 5,
    name: 'NPS (Net Promoter Score)',
    description: 'Индекс потребительской лояльности',
    target: 50,
    current: 12,
    progress: 24,
    unit: '',
    type: 'higher_better',
    status: 'not_achieved',
    deadline: '2025-12-31',
    trend: -5.8
  }
])

const trendAnalysis = ref([
  {
    period: 'Последний месяц',
    performance: 12.5
  },
  {
    period: 'Последний квартал',
    performance: 8.2
  },
  {
    period: 'Последний год',
    performance: -3.1
  }
])

const forecast = ref({
  likelihood: 78,
  estimatedDate: '15 дек 2025',
  riskLevel: 'Средний'
})

const recommendations = ref([
  'Увеличить бюджет на каналы с высокой конверсией',
  'Оптимизировать воронку продаж для повышения NPS',
  'Запустить программу повышения узнаваемости бренда',
  'Внедрить автоматизацию для ускорения обработки лидов'
])

// Computed
const achievedKPIs = computed(() => kpiList.value.filter(kpi => kpi.status === 'achieved').length)
const inProgressKPIs = computed(() => kpiList.value.filter(kpi => kpi.status === 'in_progress').length)
const missedKPIs = computed(() => kpiList.value.filter(kpi => kpi.status === 'not_achieved').length)
const overallProgress = computed(() => {
  const totalProgress = kpiList.value.reduce((sum, kpi) => sum + Math.min(kpi.progress, 100), 0)
  return Math.round(totalProgress / kpiList.value.length)
})

// Methods
const getKPIStatusColor = (status) => {
  const colors = {
    'achieved': 'success',
    'in_progress': 'warning',
    'at_risk': 'orange',
    'not_achieved': 'error'
  }
  return colors[status] || 'grey'
}

const getKPIStatusIcon = (status) => {
  const icons = {
    'achieved': 'mdi-check-circle',
    'in_progress': 'mdi-clock',
    'at_risk': 'mdi-alert',
    'not_achieved': 'mdi-close-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const getKPIStatusText = (status) => {
  const texts = {
    'achieved': 'Достигнуто',
    'in_progress': 'В процессе',
    'at_risk': 'Риск',
    'not_achieved': 'Не достигнуто'
  }
  return texts[status] || status
}

const getProgressColor = (progress, status) => {
  if (status === 'achieved') return 'success'
  if (status === 'not_achieved') return 'error'
  if (progress >= 80) return 'success'
  if (progress >= 60) return 'warning'
  return 'error'
}

const getValueColor = (current, target, type) => {
  const isGood = type === 'higher_better' ? current >= target : current <= target
  return isGood ? 'text-success' : 'text-error'
}

const getTrendColor = (performance) => {
  return performance >= 0 ? 'text-success' : 'text-error'
}

const formatKPIValue = (value, unit) => {
  if (!value && value !== 0) return 'Н/Д'

  if (typeof value === 'number') {
    const formatted = value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value.toString()
    return unit ? `${formatted} ${unit}` : formatted
  }

  return value
}

const formatDate = (date) => {
  if (!date) return 'Не указан'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const viewKPIDetails = (kpi) => {
  appStore.showInfo(`Детальная информация по KPI "${kpi.name}" будет реализована в следующих версиях`)
}
</script>

<style scoped>
.details-panel-kpis {
  height: 100%;
  overflow-y: auto;
}

.kpi-summary-card {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  height: 100%;
}

.kpi-item {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.kpi-item:hover {
  background: #f0f0f0;
}

.kpi-header {
  flex: 1;
}

.metric-info {
  text-align: center;
}

.trend-card {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.trend-card:hover {
  background: #f0f0f0;
}

.forecast-container {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.forecast-metric {
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: white;
}

.recommendations {
  margin-top: 16px;
}

.v-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.v-card-title {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-container {
    padding: 12px;
  }

  .kpi-summary-card,
  .trend-card,
  .forecast-metric {
    margin-bottom: 16px;
  }

  .kpi-metrics .v-row {
    text-align: left;
  }

  .metric-info {
    text-align: left;
    margin-bottom: 8px;
  }
}
</style>