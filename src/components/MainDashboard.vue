<template>
  <div class="main-dashboard">
    <!-- Заголовок дашборда -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold mb-1">Главный дашборд</h2>
        <p class="text-body-2 text-medium-emphasis">
          Обзор ключевых метрик эффективности маркетинга Kreola
        </p>
      </div>

      <!-- Фильтры дашборда -->
      <div class="d-flex align-center">
        <v-select
          v-model="selectedDateRange"
          :items="dateRangeOptions"
          label="Период"
          variant="outlined"
          density="compact"
          style="width: 180px"
          class="me-2"
          @update:modelValue="onDateRangeChange"
        />

        <v-btn
          variant="outlined"
          @click="compareWithPrevious"
          :loading="isLoadingComparison"
          class="me-2"
        >
          <v-icon>mdi-compare</v-icon>
          Сравнить
        </v-btn>

        <v-btn
          color="primary"
          @click="refreshDashboard"
          :loading="isLoading"
        >
          <v-icon>mdi-refresh</v-icon>
          Обновить
        </v-btn>
      </div>
    </div>

    <!-- Основные KPI карточки -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="kpi-card">
          <v-card-text>
            <div class="d-flex align-center">
              <div class="flex-grow-1">
                <p class="text-caption text-medium-emphasis mb-1">Общая выручка</p>
                <h3 class="text-h5 font-weight-bold mb-1">
                  {{ formatCurrency(totalRevenue) }}
                </h3>
                <div class="d-flex align-center">
                  <v-icon
                    :color="totalRevenue > 12000000 ? 'success' : 'warning'"
                    size="small"
                    class="me-1"
                  >
                    {{ totalRevenue > 12000000 ? 'mdi-trending-up' : 'mdi-trending-neutral' }}
                  </v-icon>
                  <span class="text-caption">
                    {{ calculateGrowth(totalRevenue, 11200000) }}% к прошлому периоду
                  </span>
                </div>
              </div>
              <v-icon color="primary" size="40">mdi-wallet</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="kpi-card">
          <v-card-text>
            <div class="d-flex align-center">
              <div class="flex-grow-1">
                <p class="text-caption text-medium-emphasis mb-1">Средний ROI</p>
                <h3 class="text-h5 font-weight-bold mb-1">
                  {{ averageROI.toFixed(1) }}%
                </h3>
                <div class="d-flex align-center">
                  <v-icon
                    :color="averageROI > 250 ? 'success' : 'warning'"
                    size="small"
                    class="me-1"
                  >
                    {{ averageROI > 250 ? 'mdi-trending-up' : 'mdi-trending-neutral' }}
                  </v-icon>
                  <span class="text-caption">
                    {{ calculateGrowth(averageROI, 267.3) }}% к прошлому периоду
                  </span>
                </div>
              </div>
              <v-icon color="success" size="40">mdi-chart-line</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="kpi-card">
          <v-card-text>
            <div class="d-flex align-center">
              <div class="flex-grow-1">
                <p class="text-caption text-medium-emphasis mb-1">Конверсии</p>
                <h3 class="text-h5 font-weight-bold mb-1">
                  {{ totalConversions.toLocaleString() }}
                </h3>
                <div class="d-flex align-center">
                  <v-icon
                    :color="totalConversions > 2400 ? 'success' : 'warning'"
                    size="small"
                    class="me-1"
                  >
                    {{ totalConversions > 2400 ? 'mdi-trending-up' : 'mdi-trending-neutral' }}
                  </v-icon>
                  <span class="text-caption">
                    {{ calculateGrowth(totalConversions, 2180) }}% к прошлому периоду
                  </span>
                </div>
              </div>
              <v-icon color="info" size="40">mdi-target</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="kpi-card">
          <v-card-text>
            <div class="d-flex align-center">
              <div class="flex-grow-1">
                <p class="text-caption text-medium-emphasis mb-1">Конверсия</p>
                <h3 class="text-h5 font-weight-bold mb-1">
                  {{ conversionRate.toFixed(2) }}%
                </h3>
                <div class="d-flex align-center">
                  <v-icon
                    :color="conversionRate > 5.5 ? 'success' : 'warning'"
                    size="small"
                    class="me-1"
                  >
                    {{ conversionRate > 5.5 ? 'mdi-trending-up' : 'mdi-trending-neutral' }}
                  </v-icon>
                  <span class="text-caption">
                    {{ calculateGrowth(conversionRate, 5.23) }}% к прошлому периоду
                  </span>
                </div>
              </div>
              <v-icon color="warning" size="40">mdi-percent</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Графики и аналитика -->
    <v-row class="mb-6">
      <!-- График трендов -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-line</v-icon>
            Тренды производительности

            <v-spacer />

            <v-btn-toggle v-model="selectedMetric" mandatory variant="outlined" size="small">
              <v-btn value="revenue">Выручка</v-btn>
              <v-btn value="conversions">Конверсии</v-btn>
              <v-btn value="avgROI">ROI</v-btn>
            </v-btn-toggle>
          </v-card-title>

          <v-divider />

          <v-card-text style="height: 300px;">
            <div v-if="performanceTrends.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-chart-line</v-icon>
              <p class="text-body-1 mt-4">Нет данных для отображения</p>
            </div>

            <div v-else class="chart-container">
              <!-- Здесь будет интеграция с ECharts -->
              <div class="simple-chart">
                <div
                  v-for="(trend, index) in performanceTrends.slice(0, 10)"
                  :key="trend.date"
                  class="chart-bar"
                  :style="{
                    height: `${(trend[selectedMetric] / getMaxValue(selectedMetric)) * 100}%`,
                    left: `${(index / 9) * 90}%`
                  }"
                >
                  <v-tooltip activator="parent" location="top">
                    <span>{{ trend.date }}: {{ formatValue(trend[selectedMetric], selectedMetric) }}</span>
                  </v-tooltip>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Топ активности -->
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-title>
            <v-icon class="me-2">mdi-trophy</v-icon>
            Топ активности
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-0">
            <v-list>
              <v-list-item
                v-for="(activity, index) in topPerformingActivities.slice(0, 5)"
                :key="activity.performance_id"
                :prepend-icon="index === 0 ? 'mdi-crown' : 'mdi-circle-small'"
                :class="{ 'bg-primary-lighten-5': index === 0 }"
              >
                <v-list-item-title class="text-body-2">
                  {{ activity.activity_name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ activity.channel }} • {{ formatCurrency(activity.revenue) }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-chip
                    :color="getRankColor(index)"
                    size="small"
                    variant="tonal"
                  >
                    #{{ index + 1 }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Воронка и каналы -->
    <v-row class="mb-6">
      <!-- Воронка конверсии -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-filter-variant</v-icon>
            Воронка конверсии
          </v-card-title>

          <v-divider />

          <v-card-text>
            <div v-if="!funnelSummary" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-filter-variant</v-icon>
              <p class="text-body-1 mt-4">Нет данных воронки</p>
            </div>

            <div v-else>
              <div
                v-for="(stage, index) in funnelSummary"
                :key="stage.stage"
                class="funnel-stage mb-3"
              >
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="text-body-2 font-weight-medium">{{ stage.stage }}</span>
                  <span class="text-caption">{{ stage.conversionRate }}%</span>
                </div>
                <v-progress-linear
                  :model-value="stage.conversionRate"
                  height="8"
                  :color="getFunnelColor(index)"
                  rounded
                />
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ stage.totalUsers.toLocaleString() }} пользователей
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Производительность по каналам -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-chart-donut</v-icon>
            Производительность каналов
          </v-card-title>

          <v-divider />

          <v-card-text>
            <div v-if="channelPerformance.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-chart-donut</v-icon>
              <p class="text-body-1 mt-4">Нет данных по каналам</p>
            </div>

            <div v-else>
              <div
                v-for="channel in channelPerformance.slice(0, 6)"
                :key="channel.channel"
                class="channel-item mb-3"
              >
                <div class="d-flex align-center justify-space-between mb-1">
                  <div class="d-flex align-center">
                    <v-icon
                      :color="getChannelColor(channel.channel)"
                      size="small"
                      class="me-2"
                    >
                      {{ getChannelIcon(channel.channel) }}
                    </v-icon>
                    <span class="text-body-2 font-weight-medium">{{ channel.channel }}</span>
                  </div>
                  <span class="text-caption">{{ formatCurrency(channel.revenue) }}</span>
                </div>
                <v-progress-linear
                  :model-value="(channel.revenue / totalRevenue) * 100"
                  height="6"
                  :color="getChannelColor(channel.channel)"
                  rounded
                />
                <div class="text-caption text-medium-emphasis mt-1">
                  ROI: {{ channel.roi.toFixed(1) }}% • {{ channel.conversions }} конверсий
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Последние отчеты и быстрые действия -->
    <v-row>
      <!-- Быстрые действия -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-lightning-bolt</v-icon>
            Быстрые действия
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-2">
            <v-list density="compact">
              <v-list-item @click="generateReport" :disabled="isLoading">
                <template v-slot:prepend>
                  <v-icon>mdi-file-chart</v-icon>
                </template>
                <v-list-item-title>Создать отчет</v-list-item-title>
              </v-list-item>

              <v-list-item @click="exportData" :disabled="isLoading">
                <template v-slot:prepend>
                  <v-icon>mdi-download</v-icon>
                </template>
                <v-list-item-title>Экспорт данных</v-list-item-title>
              </v-list-item>

              <v-list-item @click="showAttributionAnalysis" :disabled="isLoading">
                <template v-slot:prepend>
                  <v-icon>mdi-share-variant</v-icon>
                </template>
                <v-list-item-title>Анализ атрибуции</v-list-item-title>
              </v-list-item>

              <v-list-item @click="showCohortAnalysis" :disabled="isLoading">
                <template v-slot:prepend>
                  <v-icon>mdi-account-group</v-icon>
                </template>
                <v-list-item-title>Когортный анализ</v-list-item-title>
              </v-list-item>

              <v-list-item @click="generateForecast" :disabled="isLoading">
                <template v-slot:prepend>
                  <v-icon>mdi-crystal-ball</v-icon>
                </template>
                <v-list-item-title>Прогноз</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Ключевые инсайты -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-lightbulb</v-icon>
            Ключевые инсайты
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-alert
              v-for="(insight, index) in keyInsights"
              :key="index"
              :type="insight.type"
              variant="tonal"
              class="mb-3"
            >
              <div class="d-flex align-center">
                <v-icon class="me-2">{{ insight.icon }}</v-icon>
                <div>
                  <div class="font-weight-medium">{{ insight.title }}</div>
                  <div class="text-body-2">{{ insight.description }}</div>
                </div>
              </div>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useInsightsStore } from '@/stores/insightsStore'

export default {
  name: 'MainDashboard',
  setup() {
    const insightsStore = useInsightsStore()

    // Reactive state
    const selectedDateRange = ref('last_30_days')
    const selectedMetric = ref('revenue')
    const isLoadingComparison = ref(false)

    // Computed properties
    const isLoading = computed(() => insightsStore.isLoading)
    const totalRevenue = computed(() => insightsStore.totalRevenue)
    const averageROI = computed(() => insightsStore.averageROI)
    const totalConversions = computed(() => insightsStore.totalConversions)
    const totalImpressions = computed(() => insightsStore.totalImpressions)
    const conversionRate = computed(() => insightsStore.conversionRate)
    const performanceTrends = computed(() => insightsStore.performanceTrends)
    const topPerformingActivities = computed(() => insightsStore.topPerformingActivities)
    const funnelSummary = computed(() => insightsStore.funnelSummary)

    const dateRangeOptions = computed(() => [
      { title: 'Последние 7 дней', value: 'last_7_days' },
      { title: 'Последние 30 дней', value: 'last_30_days' },
      { title: 'Последние 90 дней', value: 'last_90_days' },
      { title: 'Этот месяц', value: 'current_month' },
      { title: 'Прошлый месяц', value: 'previous_month' },
      { title: 'Этот квартал', value: 'current_quarter' }
    ])

    const channelPerformance = computed(() => {
      const channels = {}
      insightsStore.performanceData.forEach(item => {
        if (!channels[item.channel]) {
          channels[item.channel] = {
            channel: item.channel,
            revenue: 0,
            conversions: 0,
            cost: 0,
            roi: 0
          }
        }
        channels[item.channel].revenue += item.revenue || 0
        channels[item.channel].conversions += item.conversions || 0
        channels[item.channel].cost += item.cost || 0
      })

      return Object.values(channels)
        .map(channel => ({
          ...channel,
          roi: channel.cost > 0 ? (channel.revenue / channel.cost) * 100 : 0
        }))
        .sort((a, b) => b.revenue - a.revenue)
    })

    const keyInsights = computed(() => [
      {
        type: 'success',
        icon: 'mdi-trending-up',
        title: 'Рост выручки',
        description: `Выручка выросла на ${calculateGrowth(totalRevenue.value, 11200000)}% по сравнению с прошлым периодом`
      },
      {
        type: 'info',
        icon: 'mdi-chart-line',
        title: 'Эффективность каналов',
        description: 'Email кампании показывают наивысший ROI (1580%), рекомендуется увеличить инвестиции'
      },
      {
        type: 'warning',
        icon: 'mdi-target',
        title: 'Конверсия',
        description: `Средняя конверсия составляет ${conversionRate.value.toFixed(2)}%, есть потенциал для оптимизации воронки`
      }
    ])

    // Methods
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0)
    }

    const formatValue = (value, metric) => {
      switch (metric) {
        case 'revenue':
          return formatCurrency(value)
        case 'conversions':
          return value?.toLocaleString() || '0'
        case 'avgROI':
          return `${value?.toFixed(1) || '0'}%`
        default:
          return value?.toString() || '0'
      }
    }

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const getMaxValue = (metric) => {
      if (performanceTrends.value.length === 0) return 1
      return Math.max(...performanceTrends.value.map(trend => trend[metric] || 0))
    }

    const getRankColor = (index) => {
      const colors = ['primary', 'secondary', 'success', 'info', 'warning']
      return colors[index] || 'grey'
    }

    const getFunnelColor = (index) => {
      const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']
      return colors[index] || 'grey'
    }

    const getChannelIcon = (channel) => {
      const icons = {
        'Google Ads': 'mdi-google',
        'Yandex Direct': 'mdi-yandex',
        'Instagram': 'mdi-instagram',
        'YouTube': 'mdi-youtube',
        'Email': 'mdi-email',
        'VK': 'mdi-vk',
        'TV': 'mdi-television',
        'Radio': 'mdi-radio',
        'Website': 'mdi-web',
        'Organic Search': 'mdi-magnify'
      }
      return icons[channel] || 'mdi-web'
    }

    const getChannelColor = (channel) => {
      const colors = {
        'Google Ads': 'blue',
        'Yandex Direct': 'orange',
        'Instagram': 'purple',
        'YouTube': 'red',
        'Email': 'green',
        'VK': 'indigo',
        'TV': 'teal',
        'Radio': 'brown',
        'Website': 'primary',
        'Organic Search': 'success'
      }
      return colors[channel] || 'grey'
    }

    const refreshDashboard = async () => {
      await insightsStore.initialize()
    }

    const onDateRangeChange = (range) => {
      const dateRanges = {
        'last_7_days': {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        'last_30_days': {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        'last_90_days': {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      }

      const dateRange = dateRanges[range] || dateRanges['last_30_days']
      insightsStore.setDateRange(dateRange.start, dateRange.end)
    }

    const compareWithPrevious = async () => {
      try {
        isLoadingComparison.value = true
        await insightsStore.compareWithPreviousPeriod()
      } catch (error) {
        console.error('Error comparing with previous period:', error)
      } finally {
        isLoadingComparison.value = false
      }
    }

    const generateReport = async () => {
      try {
        await insightsStore.generateReport({
          title: 'Отчет по производительности',
          type: 'performance',
          metrics: ['revenue', 'roi', 'conversions'],
          format: 'json'
        })
      } catch (error) {
        console.error('Error generating report:', error)
      }
    }

    const exportData = async () => {
      try {
        await insightsStore.exportData({
          data_type: 'performance',
          format: 'xlsx'
        })
      } catch (error) {
        console.error('Error exporting data:', error)
      }
    }

    const showAttributionAnalysis = async () => {
      try {
        const analysis = await insightsStore.performAttributionAnalysis({
          model_type: 'last_click',
          attribution_window: 30
        })
        console.log('Attribution analysis:', analysis)
      } catch (error) {
        console.error('Error performing attribution analysis:', error)
      }
    }

    const showCohortAnalysis = async () => {
      try {
        const analysis = await insightsStore.runCohortAnalysis({
          cohort_type: 'monthly',
          time_period: 12
        })
        console.log('Cohort analysis:', analysis)
      } catch (error) {
        console.error('Error running cohort analysis:', error)
      }
    }

    const generateForecast = async () => {
      try {
        const forecast = await insightsStore.generatePredictiveModel({
          model_type: 'revenue_forecast',
          target_metric: 'revenue',
          time_horizon: 90
        })
        console.log('Forecast generated:', forecast)
      } catch (error) {
        console.error('Error generating forecast:', error)
      }
    }

    // Lifecycle
    onMounted(() => {
      insightsStore.initialize()
    })

    return {
      // Store state
      isLoading,
      totalRevenue,
      averageROI,
      totalConversions,
      conversionRate,
      performanceTrends,
      topPerformingActivities,
      funnelSummary,
      channelPerformance,

      // Local state
      selectedDateRange,
      selectedMetric,
      isLoadingComparison,
      dateRangeOptions,
      keyInsights,

      // Methods
      formatCurrency,
      formatValue,
      calculateGrowth,
      getMaxValue,
      getRankColor,
      getFunnelColor,
      getChannelIcon,
      getChannelColor,
      refreshDashboard,
      onDateRangeChange,
      compareWithPrevious,
      generateReport,
      exportData,
      showAttributionAnalysis,
      showCohortAnalysis,
      generateForecast
    }
  }
}
</script>

<style scoped>
.main-dashboard {
  padding: 24px;
  height: 100vh;
  overflow: auto;
}

.kpi-card {
  height: 100%;
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.chart-container {
  position: relative;
  height: 100%;
}

.simple-chart {
  position: relative;
  height: 200px;
  padding: 20px 0;
}

.chart-bar {
  position: absolute;
  bottom: 20px;
  width: 8px;
  background: linear-gradient(to top, var(--v-theme-primary), var(--v-theme-primary-lighten-2));
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
}

.chart-bar:hover {
  background: linear-gradient(to top, var(--v-theme-secondary), var(--v-theme-secondary-lighten-2));
}

.funnel-stage {
  padding: 8px 0;
}

.channel-item {
  padding: 8px 0;
}

:deep(.v-progress-linear) {
  border-radius: 4px;
}
</style>