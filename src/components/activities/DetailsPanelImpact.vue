<template>
  <div class="details-panel-impact">
    <v-container fluid class="pa-4">
      <!-- Ключевые метрики эффективности -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-chart-line</v-icon>
          Ключевые метрики эффективности
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col
              v-for="metric in keyMetrics"
              :key="metric.name"
              cols="12"
              sm="6"
              md="3"
            >
              <div class="metric-card pa-3 rounded border text-center">
                <v-icon :color="metric.color" size="32" class="mb-2">{{ metric.icon }}</v-icon>
                <div class="metric-value text-h5 font-weight-bold" :class="`text-${metric.color}`">
                  {{ metric.value }}{{ metric.unit }}
                </div>
                <div class="metric-label text-caption text-grey-darken-1">
                  {{ metric.name }}
                </div>
                <div class="metric-change mt-1">
                  <v-chip
                    :color="metric.change >= 0 ? 'success' : 'error'"
                    size="x-small"
                    variant="outlined"
                  >
                    <v-icon start size="12">
                      {{ metric.change >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                    </v-icon>
                    {{ Math.abs(metric.change) }}%
                  </v-chip>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- ROI и рентабельность -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-trending-up</v-icon>
          ROI и рентабельность
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col cols="12" md="6">
              <div class="roi-summary pa-3 rounded border">
                <div class="text-center mb-3">
                  <div class="text-h4 font-weight-bold text-success">{{ roiData.current }}%</div>
                  <div class="text-caption text-grey-darken-1">Текущий ROI</div>
                </div>
                <v-progress-linear
                  :model-value="Math.min(roiData.current, 100)"
                  color="success"
                  height="8"
                  rounded
                />
                <div class="d-flex justify-space-between text-caption text-grey-darken-1 mt-1">
                  <span>0%</span>
                  <span>Цель: {{ roiData.target }}%</span>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="roas-summary pa-3 rounded border">
                <div class="text-center mb-3">
                  <div class="text-h4 font-weight-bold text-primary">{{ roiData.roas }}</div>
                  <div class="text-caption text-grey-darken-1">ROAS (Return on Ad Spend)</div>
                </div>
                <v-progress-linear
                  :model-value="(roiData.roas / 10) * 100"
                  color="primary"
                  height="8"
                  rounded
                />
                <div class="text-caption text-grey-darken-1 mt-1 text-center">
                  {{ roiData.roas }} рублей дохода на 1 рубль затрат
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Воронка конверсии -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-filter-variant</v-icon>
          Воронка конверсии
        </v-card-title>
        <v-card-text class="pa-3">
          <div class="funnel-container">
            <div
              v-for="(stage, index) in conversionFunnel"
              :key="stage.name"
              class="funnel-stage mb-3"
            >
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="stage-info">
                  <v-icon :color="stage.color" class="me-2">{{ stage.icon }}</v-icon>
                  <span class="text-subtitle-2">{{ stage.name }}</span>
                </div>
                <div class="stage-metrics">
                  <span class="text-h6 font-weight-bold me-2">{{ formatNumber(stage.value) }}</span>
                  <v-chip size="x-small" :color="stage.color" variant="outlined">
                    {{ stage.rate }}%
                  </v-chip>
                </div>
              </div>
              <v-progress-linear
                :model-value="stage.rate"
                :color="stage.color"
                height="12"
                rounded
              />
              <div class="text-caption text-grey-darken-1 mt-1">
                Конверсия: {{ stage.conversionRate }}%
                {{ index > 0 ? ` (от предыдущего этапа)` : '' }}
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Анализ каналов -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-chart-donut</v-icon>
          Анализ эффективности каналов
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col
              v-for="channel in channelAnalysis"
              :key="channel.name"
              cols="12"
              md="6"
            >
              <div class="channel-card pa-3 rounded border">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="channel-info">
                    <v-icon :color="channel.color" class="me-2">{{ channel.icon }}</v-icon>
                    <span class="text-subtitle-2">{{ channel.name }}</span>
                  </div>
                  <v-chip :color="channel.performance" size="small" variant="outlined">
                    {{ getPerformanceText(channel.performance) }}
                  </v-chip>
                </div>

                <div class="channel-metrics">
                  <div class="metric-row d-flex justify-space-between">
                    <span class="text-body-2">Затраты:</span>
                    <span class="font-weight-medium">{{ formatCurrency(channel.cost) }}</span>
                  </div>
                  <div class="metric-row d-flex justify-space-between">
                    <span class="text-body-2">Конверсии:</span>
                    <span class="font-weight-medium">{{ formatNumber(channel.conversions) }}</span>
                  </div>
                  <div class="metric-row d-flex justify-space-between">
                    <span class="text-body-2">CPA:</span>
                    <span class="font-weight-medium">{{ formatCurrency(channel.cpa) }}</span>
                  </div>
                  <div class="metric-row d-flex justify-space-between">
                    <span class="text-body-2">ROI:</span>
                    <span class="font-weight-medium" :class="channel.roi >= 0 ? 'text-success' : 'text-error'">
                      {{ channel.roi }}%
                    </span>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Временная динамика -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-chart-timeline</v-icon>
          Динамика по времени
        </v-card-title>
        <v-card-text class="pa-3">
          <div class="timeline-chart-placeholder pa-4 rounded border text-center">
            <v-icon size="64" color="grey-lighten-1" class="mb-2">mdi-chart-line</v-icon>
            <div class="text-h6 mb-2">График эффективности</div>
            <div class="text-body-2 text-grey-darken-1">
              Здесь будет отображаться график динамики ключевых метрик по времени
            </div>
            <v-btn variant="outlined" size="small" class="mt-3">
              Открыть детальную аналитику
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  activity: {
    type: Object,
    default: () => ({})
  }
})

const keyMetrics = ref([
  {
    name: 'Показы',
    value: '2.5',
    unit: 'M',
    icon: 'mdi-eye',
    color: 'primary',
    change: 15.3
  },
  {
    name: 'Клики',
    value: '125',
    unit: 'K',
    icon: 'mdi-cursor-pointer',
    color: 'success',
    change: 8.7
  },
  {
    name: 'CTR',
    value: '5.2',
    unit: '%',
    icon: 'mdi-percent',
    color: 'warning',
    change: -2.1
  },
  {
    name: 'Конверсии',
    value: '3.8',
    unit: 'K',
    icon: 'mdi-target',
    color: 'error',
    change: 22.4
  }
])

const roiData = ref({
  current: 28.5,
  target: 25,
  roas: 4.2
})

const conversionFunnel = ref([
  {
    name: 'Показы рекламы',
    value: 2500000,
    rate: 100,
    conversionRate: 100,
    icon: 'mdi-eye',
    color: 'blue'
  },
  {
    name: 'Клики по рекламе',
    value: 125000,
    rate: 80,
    conversionRate: 5.0,
    icon: 'mdi-cursor-pointer',
    color: 'green'
  },
  {
    name: 'Посещения сайта',
    value: 98000,
    rate: 60,
    conversionRate: 78.4,
    icon: 'mdi-web',
    color: 'orange'
  },
  {
    name: 'Лиды',
    value: 12500,
    rate: 40,
    conversionRate: 12.8,
    icon: 'mdi-account-plus',
    color: 'purple'
  },
  {
    name: 'Продажи',
    value: 3800,
    rate: 20,
    conversionRate: 30.4,
    icon: 'mdi-cart-check',
    color: 'red'
  }
])

const channelAnalysis = ref([
  {
    name: 'Google Ads',
    cost: 1200000,
    conversions: 1580,
    cpa: 760,
    roi: 32.1,
    performance: 'success',
    icon: 'mdi-google',
    color: 'blue'
  },
  {
    name: 'Яндекс.Директ',
    cost: 850000,
    conversions: 980,
    cpa: 867,
    roi: 18.7,
    performance: 'warning',
    icon: 'mdi-search-web',
    color: 'red'
  },
  {
    name: 'Facebook Ads',
    cost: 650000,
    conversions: 720,
    cpa: 903,
    roi: 25.4,
    performance: 'success',
    icon: 'mdi-facebook',
    color: 'blue'
  },
  {
    name: 'VK Реклама',
    cost: 420000,
    conversions: 520,
    cpa: 808,
    roi: 22.1,
    performance: 'success',
    icon: 'mdi-web',
    color: 'blue'
  }
])

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K'
  }
  return num.toString()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const getPerformanceText = (performance) => {
  const texts = {
    'success': 'Отлично',
    'warning': 'Нормально',
    'error': 'Плохо'
  }
  return texts[performance] || performance
}
</script>

<style scoped>
.details-panel-impact {
  height: 100%;
  overflow-y: auto;
}

.metric-card {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  height: 100%;
}

.metric-card:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.metric-value {
  line-height: 1.2;
}

.roi-summary,
.roas-summary {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  height: 100%;
}

.funnel-container {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
}

.funnel-stage {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.stage-info {
  display: flex;
  align-items: center;
}

.stage-metrics {
  display: flex;
  align-items: center;
}

.channel-card {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  height: 100%;
}

.channel-card:hover {
  background: #f0f0f0;
}

.channel-info {
  display: flex;
  align-items: center;
}

.channel-metrics {
  margin-top: 12px;
}

.metric-row {
  margin-bottom: 4px;
}

.timeline-chart-placeholder {
  background: #fafafa;
  border: 2px dashed rgba(0, 0, 0, 0.12);
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

  .metric-card,
  .channel-card {
    margin-bottom: 16px;
  }

  .stage-metrics {
    flex-direction: column;
    align-items: flex-end;
  }
}
</style>