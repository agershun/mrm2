<template>
  <div class="romi-dashboard">
    <!-- Вкладка: Обзор ROMI -->
    <div v-if="tabId === 'romi_overview'" class="tab-content">
      <v-row>
        <!-- Основные KPI ROMI -->
        <v-col cols="12" md="2">
          <KPIWidget
            title="Общий ROMI"
            :value="roiKPIs.overall_roi"
            format="percent"
            :trend="roiKPIs.overall_trend"
            :target="roiKPIs.overall_target"
            icon="mdi-trending-up"
            color="success"
          />
        </v-col>

        <v-col cols="12" md="2">
          <KPIWidget
            title="Digital ROMI"
            :value="roiKPIs.digital_roi"
            format="percent"
            :trend="roiKPIs.digital_trend"
            :target="roiKPIs.digital_target"
            icon="mdi-monitor-cellphone"
            color="primary"
          />
        </v-col>

        <v-col cols="12" md="2">
          <KPIWidget
            title="Traditional ROMI"
            :value="roiKPIs.traditional_roi"
            format="percent"
            :trend="roiKPIs.traditional_trend"
            :target="roiKPIs.traditional_target"
            icon="mdi-television"
            color="orange"
          />
        </v-col>

        <v-col cols="12" md="3">
          <KPIWidget
            title="Customer ROMI"
            :value="roiKPIs.customer_roi"
            format="percent"
            :trend="roiKPIs.customer_trend"
            :target="roiKPIs.customer_target"
            icon="mdi-account-multiple"
            color="purple"
          />
        </v-col>

        <v-col cols="12" md="3">
          <KPIWidget
            title="Campaign ROMI"
            :value="roiKPIs.campaign_roi"
            format="percent"
            :trend="roiKPIs.campaign_trend"
            :target="roiKPIs.campaign_target"
            icon="mdi-bullhorn"
            color="teal"
          />
        </v-col>

        <!-- График ROMI по времени -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-line</v-icon>
              Динамика ROMI
            </v-card-title>
            <v-card-text>
              <ROMITrendChart
                :data="roiTrendData"
                height="350px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Распределение ROMI по категориям -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-donut-variant</v-icon>
              ROMI по категориям
            </v-card-title>
            <v-card-text>
              <ROMICategoryChart
                :data="roiCategoryData"
                height="350px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Топ кампании по ROMI -->
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-trophy</v-icon>
              Топ кампании по ROMI
            </v-card-title>
            <v-card-text>
              <TopROMICampaignsTable
                :data="topROMICampaigns"
                :is-editing="isEditing"
                @row-click="handleCampaignClick"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Вкладка: Эффективность каналов -->
    <div v-else-if="tabId === 'channel_performance'" class="tab-content">
      <v-row>
        <!-- Сравнение каналов -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-bar</v-icon>
              Сравнение каналов по ROMI
            </v-card-title>
            <v-card-text>
              <ChannelROMIChart
                :data="channelROMIData"
                height="400px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Матрица эффективности -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-grid</v-icon>
              Матрица эффективности
            </v-card-title>
            <v-card-text>
              <ChannelEfficiencyMatrix
                :data="channelEfficiencyData"
                @cell-click="handleMatrixClick"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Детальная таблица по каналам -->
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-table</v-icon>
              Детальная аналитика каналов
            </v-card-title>
            <v-card-text>
              <ChannelPerformanceTable
                :data="channelDetailData"
                :is-editing="isEditing"
                @channel-click="handleChannelClick"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Вкладка: Анализ атрибуции -->
    <div v-else-if="tabId === 'attribution_analysis'" class="tab-content">
      <v-row>
        <!-- Модель атрибуции -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-settings</v-icon>
              Модель атрибуции
            </v-card-title>
            <v-card-text>
              <AttributionModelSelector
                v-model="selectedAttributionModel"
                :models="attributionModels"
                @model-changed="handleAttributionModelChange"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Водопад атрибуции -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-waterfall</v-icon>
              Водопад атрибуции
            </v-card-title>
            <v-card-text>
              <AttributionWaterfallChart
                :data="attributionWaterfallData"
                height="400px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Точки контакта -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-dots-horizontal</v-icon>
              Анализ точек контакта
            </v-card-title>
            <v-card-text>
              <TouchpointAnalysisChart
                :data="touchpointData"
                height="350px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Путь клиента -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-map-marker-path</v-icon>
              Пути клиентов
            </v-card-title>
            <v-card-text>
              <CustomerJourneyFlow
                :data="customerJourneyData"
                height="350px"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Вкладка: Когортный анализ -->
    <div v-else-if="tabId === 'cohort_analysis'" class="tab-content">
      <v-row>
        <!-- Настройки когорт -->
        <v-col cols="12" md="3">
          <v-card>
            <v-card-title class="text-subtitle-2">
              Настройки когорт
            </v-card-title>
            <v-card-text>
              <v-select
                v-model="cohortType"
                :items="cohortTypes"
                label="Тип когорты"
                variant="outlined"
                density="compact"
                @update:model-value="handleCohortTypeChange"
              />

              <v-select
                v-model="cohortMetric"
                :items="cohortMetrics"
                label="Метрика"
                variant="outlined"
                density="compact"
                class="mt-3"
                @update:model-value="handleCohortMetricChange"
              />

              <v-text-field
                v-model="cohortPeriods"
                label="Периоды"
                type="number"
                variant="outlined"
                density="compact"
                class="mt-3"
                :min="1"
                :max="24"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Тепловая карта когорт -->
        <v-col cols="12" md="9">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-grid</v-icon>
              Когортная карта удержания
            </v-card-title>
            <v-card-text>
              <CohortHeatmapChart
                :data="cohortHeatmapData"
                :metric="cohortMetric"
                height="400px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- LTV анализ -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-timeline-variant</v-icon>
              Lifetime Value (LTV)
            </v-card-title>
            <v-card-text>
              <LTVAnalysisChart
                :data="ltvData"
                height="300px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Сегментация когорт -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-account-group</v-icon>
              Сегментация когорт
            </v-card-title>
            <v-card-text>
              <CohortSegmentationChart
                :data="cohortSegmentationData"
                height="300px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Таблица когорт -->
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-table</v-icon>
              Детальная таблица когорт
            </v-card-title>
            <v-card-text>
              <CohortDetailTable
                :data="cohortDetailData"
                :metric="cohortMetric"
                :is-editing="isEditing"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import KPIWidget from '../widgets/KPIWidget.vue'
import ROMITrendChart from '../charts/ROMITrendChart.vue'
import ROMICategoryChart from '../charts/ROMICategoryChart.vue'
import TopROMICampaignsTable from '../tables/TopROMICampaignsTable.vue'
import ChannelROMIChart from '../charts/ChannelROMIChart.vue'
import ChannelEfficiencyMatrix from '../matrices/ChannelEfficiencyMatrix.vue'
import ChannelPerformanceTable from '../tables/ChannelPerformanceTable.vue'
import AttributionModelSelector from '../selectors/AttributionModelSelector.vue'
import AttributionWaterfallChart from '../charts/AttributionWaterfallChart.vue'
import TouchpointAnalysisChart from '../charts/TouchpointAnalysisChart.vue'
import CustomerJourneyFlow from '../charts/CustomerJourneyFlow.vue'
import CohortHeatmapChart from '../charts/CohortHeatmapChart.vue'
import LTVAnalysisChart from '../charts/LTVAnalysisChart.vue'
import CohortSegmentationChart from '../charts/CohortSegmentationChart.vue'
import CohortDetailTable from '../tables/CohortDetailTable.vue'

// Props
const props = defineProps({
  tabId: {
    type: String,
    default: 'romi_overview'
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  data: {
    type: Object,
    default: () => ({})
  },
  widgets: {
    type: Array,
    default: () => []
  },
  reports: {
    type: Array,
    default: () => []
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

// Emits
defineEmits([
  'widget-updated',
  'report-drilldown'
])

// Reactive data
const selectedAttributionModel = ref('last_click')
const cohortType = ref('monthly')
const cohortMetric = ref('retention')
const cohortPeriods = ref(12)

// Options
const attributionModels = [
  { title: 'Последний клик', value: 'last_click' },
  { title: 'Первый клик', value: 'first_click' },
  { title: 'Линейная модель', value: 'linear' },
  { title: 'По времени', value: 'time_decay' },
  { title: 'По позиции', value: 'position_based' },
  { title: 'Алгоритмическая', value: 'algorithmic' }
]

const cohortTypes = [
  { title: 'Месячные когорты', value: 'monthly' },
  { title: 'Недельные когорты', value: 'weekly' },
  { title: 'Квартальные когорты', value: 'quarterly' }
]

const cohortMetrics = [
  { title: 'Удержание (%)', value: 'retention' },
  { title: 'Выручка', value: 'revenue' },
  { title: 'Заказы', value: 'orders' },
  { title: 'LTV', value: 'ltv' }
]

// Computed data
const roiKPIs = computed(() => ({
  overall_roi: 285.5,
  overall_trend: { value: 6.6, direction: 'up' },
  overall_target: 300.0,
  digital_roi: 312.8,
  digital_trend: { value: 8.2, direction: 'up' },
  digital_target: 350.0,
  traditional_roi: 189.7,
  traditional_trend: { value: 2.1, direction: 'down' },
  traditional_target: 200.0,
  customer_roi: 425.6,
  customer_trend: { value: 12.3, direction: 'up' },
  customer_target: 400.0,
  campaign_roi: 298.4,
  campaign_trend: { value: 5.7, direction: 'up' },
  campaign_target: 300.0
}))

const roiTrendData = computed(() => [
  { date: '2024-01-01', overall_romi: 245, digital_romi: 278, traditional_romi: 198 },
  { date: '2024-02-01', overall_romi: 258, digital_romi: 289, traditional_romi: 205 },
  { date: '2024-03-01', overall_romi: 267, digital_romi: 302, traditional_romi: 201 },
  { date: '2024-04-01', overall_romi: 274, digital_romi: 315, traditional_romi: 195 },
  { date: '2024-05-01', overall_romi: 281, digital_romi: 323, traditional_romi: 189 },
  { date: '2024-06-01', overall_romi: 289, digital_romi: 318, traditional_romi: 185 },
  { date: '2024-07-01', overall_romi: 295, digital_romi: 325, traditional_romi: 183 },
  { date: '2024-08-01', overall_romi: 301, digital_romi: 330, traditional_romi: 187 },
  { date: '2024-09-01', overall_romi: 285, digital_romi: 312, traditional_romi: 190 },
  { date: '2024-10-01', overall_romi: 278, digital_romi: 308, traditional_romi: 186 },
  { date: '2024-11-01', overall_romi: 282, digital_romi: 315, traditional_romi: 188 },
  { date: '2024-12-01', overall_romi: 286, digital_romi: 313, traditional_romi: 190 }
])

const roiCategoryData = computed(() => [
  { name: 'Digital Marketing', value: 312.8, color: '#2196F3' },
  { name: 'Traditional Media', value: 189.7, color: '#FF9800' },
  { name: 'Events & Sponsorship', value: 245.3, color: '#9C27B0' },
  { name: 'Content Marketing', value: 387.2, color: '#4CAF50' },
  { name: 'PR & Communications', value: 156.8, color: '#F44336' }
])

const topROMICampaigns = computed(() => [
  {
    id: 'camp_001',
    name: 'Email автоматизация Q4',
    channel: 'Email',
    romi: 1580.0,
    revenue: 3580000,
    cost: 225000,
    conversions: 1256,
    period: 'Дек 2024'
  },
  {
    id: 'camp_002',
    name: 'SEO оптимизация',
    channel: 'Organic',
    romi: 987.5,
    revenue: 2870000,
    cost: 290000,
    conversions: 895,
    period: 'Q4 2024'
  },
  {
    id: 'camp_003',
    name: 'Контекстная реклама',
    channel: 'Google Ads',
    romi: 345.2,
    revenue: 4500000,
    cost: 1300000,
    conversions: 1845,
    period: 'Дек 2024'
  },
  {
    id: 'camp_004',
    name: 'Instagram Stories',
    channel: 'Social',
    romi: 287.6,
    revenue: 1803000,
    cost: 627000,
    conversions: 623,
    period: 'Дек 2024'
  },
  {
    id: 'camp_005',
    name: 'YouTube интеграции',
    channel: 'Video',
    romi: 276.5,
    revenue: 1330000,
    cost: 481000,
    conversions: 456,
    period: 'Дек 2024'
  }
])

const channelROMIData = computed(() => [
  {
    channel: 'google_ads',
    name: 'Google Ads',
    budget: 8500000,
    romi: 345.2,
    conversions: 1250,
    cost: 2465000,
    revenue: 8510000
  },
  {
    channel: 'email',
    name: 'Email',
    budget: 225000,
    romi: 1580.0,
    conversions: 1256,
    cost: 225000,
    revenue: 3580000
  },
  {
    channel: 'yandex_direct',
    name: 'Yandex Direct',
    budget: 3000000,
    romi: 300.0,
    conversions: 890,
    cost: 933000,
    revenue: 2800000
  },
  {
    channel: 'instagram',
    name: 'Instagram',
    budget: 627000,
    romi: 287.6,
    conversions: 623,
    cost: 627000,
    revenue: 1803000
  },
  {
    channel: 'youtube',
    name: 'YouTube',
    budget: 481000,
    romi: 276.5,
    conversions: 456,
    cost: 481000,
    revenue: 1330000
  },
  {
    channel: 'facebook',
    name: 'Facebook',
    budget: 1200000,
    romi: 245.8,
    conversions: 720,
    cost: 1200000,
    revenue: 2950000
  },
  {
    channel: 'tv',
    name: 'TV',
    budget: 7000000,
    romi: 189.7,
    conversions: 450,
    cost: 7000000,
    revenue: 13279000
  },
  {
    channel: 'radio',
    name: 'Radio',
    budget: 2500000,
    romi: 156.3,
    conversions: 280,
    cost: 2500000,
    revenue: 3907500
  }
])

const channelEfficiencyData = computed(() => [
  {
    channel: 'google_ads',
    name: 'Google Ads',
    efficiency_score: 88,
    romi: 345,
    cpa: 85,
    ctr: 92,
    conversions: 88
  },
  {
    channel: 'email',
    name: 'Email',
    efficiency_score: 95,
    romi: 1580,
    cpa: 15,
    ctr: 78,
    conversions: 95
  },
  {
    channel: 'social',
    name: 'Social',
    efficiency_score: 72,
    romi: 287,
    cpa: 45,
    ctr: 65,
    conversions: 72
  },
  {
    channel: 'display',
    name: 'Display',
    efficiency_score: 58,
    romi: 156,
    cpa: 95,
    ctr: 45,
    conversions: 58
  },
  {
    channel: 'video',
    name: 'Video',
    efficiency_score: 69,
    romi: 276,
    cpa: 65,
    ctr: 71,
    conversions: 69
  }
])

const channelDetailData = computed(() => [
  {
    channel: 'Email',
    impressions: 450000,
    clicks: 27000,
    ctr: 6.0,
    conversions: 1256,
    conversionRate: 4.65,
    cost: 225000,
    cpa: 179,
    revenue: 3580000,
    romi: 1580.0
  },
  {
    channel: 'Google Ads',
    impressions: 2150000,
    clicks: 81700,
    ctr: 3.8,
    conversions: 1845,
    conversionRate: 2.26,
    cost: 1300000,
    cpa: 705,
    revenue: 4500000,
    romi: 345.2
  },
  {
    channel: 'Yandex Direct',
    impressions: 1890000,
    clicks: 56700,
    ctr: 3.0,
    conversions: 1134,
    conversionRate: 2.0,
    cost: 933000,
    cpa: 823,
    revenue: 2800000,
    romi: 300.0
  },
  {
    channel: 'Instagram',
    impressions: 890000,
    clicks: 26700,
    ctr: 3.0,
    conversions: 623,
    conversionRate: 2.33,
    cost: 627000,
    cpa: 1006,
    revenue: 1803000,
    romi: 287.6
  },
  {
    channel: 'YouTube',
    impressions: 670000,
    clicks: 20100,
    ctr: 3.0,
    conversions: 456,
    conversionRate: 2.27,
    cost: 481000,
    cpa: 1055,
    revenue: 1330000,
    romi: 276.5
  }
])

const attributionWaterfallData = computed(() => [
  { name: 'Общий доход', value: 12683000, type: 'total' },
  { name: 'Google Ads', value: 4500000, type: 'positive' },
  { name: 'Email', value: 3580000, type: 'positive' },
  { name: 'Yandex Direct', value: 2800000, type: 'positive' },
  { name: 'Instagram', value: 1803000, type: 'positive' },
  { name: 'Другие каналы', value: 0, type: 'neutral' }
])

const touchpointData = computed(() => [
  {
    touchpoint_id: 'awareness',
    name: 'Первое касание',
    type: 'awareness',
    users: 12500,
    attribution: 25.5,
    conversion_rate: 15.2,
    avg_time: '2.5 дня',
    revenue: 3200000,
    channels: ['Google Ads', 'Social', 'Display']
  },
  {
    touchpoint_id: 'consideration',
    name: 'Исследование',
    type: 'consideration',
    users: 8750,
    attribution: 18.7,
    conversion_rate: 28.4,
    avg_time: '4.2 дня',
    revenue: 2100000,
    channels: ['Organic Search', 'YouTube', 'Blog']
  },
  {
    touchpoint_id: 'decision',
    name: 'Рассмотрение',
    type: 'decision',
    users: 6200,
    attribution: 22.3,
    conversion_rate: 42.8,
    avg_time: '1.8 дня',
    revenue: 4800000,
    channels: ['Email', 'Retargeting', 'Reviews']
  },
  {
    touchpoint_id: 'purchase',
    name: 'Покупка',
    type: 'retention',
    users: 2650,
    attribution: 33.5,
    conversion_rate: 85.6,
    avg_time: '0.5 дня',
    revenue: 7200000,
    channels: ['Direct', 'Email', 'Google Ads']
  }
])

const customerJourneyData = computed(() => [
  {
    step_id: 'awareness',
    name: 'Первое касание',
    type: 'awareness',
    users: 15000,
    conversions: 2250,
    conversion_rate: 15.0,
    avg_time: '2.5 дня',
    channels: ['Google Ads', 'Social Media', 'Organic Search', 'Display']
  },
  {
    step_id: 'exploration',
    name: 'Изучение',
    type: 'consideration',
    users: 12000,
    conversions: 3000,
    conversion_rate: 25.0,
    avg_time: '3.2 дня',
    channels: ['Website', 'Blog', 'YouTube', 'Reviews']
  },
  {
    step_id: 'evaluation',
    name: 'Оценка',
    type: 'consideration',
    users: 9000,
    conversions: 3600,
    conversion_rate: 40.0,
    avg_time: '1.8 дня',
    channels: ['Email', 'Retargeting', 'Comparison Sites', 'Demo']
  },
  {
    step_id: 'decision',
    name: 'Решение',
    type: 'decision',
    users: 5400,
    conversions: 4320,
    conversion_rate: 80.0,
    avg_time: '0.5 дня',
    channels: ['Direct', 'Sales', 'Email', 'Phone']
  },
  {
    step_id: 'purchase',
    name: 'Покупка',
    type: 'retention',
    users: 4320,
    conversions: 4320,
    conversion_rate: 100.0,
    avg_time: '0.2 дня',
    channels: ['Website', 'Store', 'Mobile App']
  }
])

const cohortHeatmapData = computed(() => {
  // Генерируем данные тепловой карты для когорт
  const cohorts = []
  const months = ['Окт 24', 'Ноя 24', 'Дек 24', 'Янв 25', 'Фев 25', 'Мар 25']

  months.forEach((month, index) => {
    const periods = []
    const maxPeriods = months.length - index

    for (let i = 0; i < maxPeriods; i++) {
      const retention = cohortMetric.value === 'retention'
        ? Math.max(10, 100 - (i * 15) - Math.random() * 10)
        : Math.max(100000, 2000000 - (i * 200000) - Math.random() * 100000)

      periods.push({
        period: i,
        value: Math.round(retention * 100) / 100
      })
    }

    cohorts.push({
      cohort: month,
      size: 1200 + index * 100,
      periods
    })
  })

  return cohorts
})

const ltvData = computed(() => [
  { month: 1, ltv: 1250, cac: 850, median_ltv: 980 },
  { month: 3, ltv: 3200, cac: 1200, median_ltv: 2400 },
  { month: 6, ltv: 5800, cac: 1500, median_ltv: 4200 },
  { month: 12, ltv: 9500, cac: 1800, median_ltv: 6800 },
  { month: 18, ltv: 12400, cac: 2000, median_ltv: 8900 },
  { month: 24, ltv: 15600, cac: 2200, median_ltv: 11200 }
])

const cohortSegmentationData = computed(() => [
  { segment: 'VIP клиенты', percentage: 15.2, ltv: 45000, retention: 89.5 },
  { segment: 'Постоянные клиенты', percentage: 28.7, ltv: 18750, retention: 72.3 },
  { segment: 'Активные покупатели', percentage: 35.6, ltv: 8500, retention: 54.2 },
  { segment: 'Новые клиенты', percentage: 20.5, ltv: 2200, retention: 23.8 }
])

const cohortDetailData = computed(() => {
  return cohortHeatmapData.value.map(cohort => ({
    cohort: cohort.cohort,
    size: cohort.size,
    period0: cohort.periods[0]?.value || 0,
    period1: cohort.periods[1]?.value || 0,
    period2: cohort.periods[2]?.value || 0,
    period3: cohort.periods[3]?.value || 0,
    period6: cohort.periods[6]?.value || 0,
    period12: cohort.periods[12]?.value || 0
  }))
})

// Methods
const handleCampaignClick = (campaign) => {
  console.log('Campaign clicked:', campaign)
  // TODO: Emit drilldown event
}

const handleChannelClick = (channel) => {
  console.log('Channel clicked:', channel)
  // TODO: Emit drilldown event
}

const handleMatrixClick = (row, col, value) => {
  console.log('Matrix cell clicked:', { row, col, value })
}

const handleAttributionModelChange = (model) => {
  console.log('Attribution model changed:', model)
  // TODO: Reload attribution data
}

const handleCohortTypeChange = (type) => {
  console.log('Cohort type changed:', type)
  // TODO: Reload cohort data
}

const handleCohortMetricChange = (metric) => {
  console.log('Cohort metric changed:', metric)
  // TODO: Reload cohort data
}

// Watchers
watch(() => props.data, (newData) => {
  console.log('ROMI Dashboard data updated:', newData)
}, { deep: true })

watch([cohortType, cohortMetric, cohortPeriods], () => {
  // Reload cohort data when settings change
  console.log('Cohort settings changed, reloading data...')
})

// Lifecycle
onMounted(() => {
  console.log('ROMI Dashboard mounted with tab:', props.tabId)
})
</script>

<style scoped>
.romi-dashboard {
  height: 100%;
}

.tab-content {
  height: 100%;
}
</style>