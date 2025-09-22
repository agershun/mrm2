<template>
  <div class="performance-overview-dashboard">
    <!-- Вкладка: Сводка KPI -->
    <div v-if="tabId === 'kpi_summary'" class="tab-content">
      <v-row>
        <!-- Основные KPI -->
        <v-col cols="12" md="2">
          <KPIWidget
            title="Общая выручка"
            :value="mainKPIs.revenue"
            format="currency"
            :trend="mainKPIs.revenueTrend"
            :target="mainKPIs.revenueTarget"
            icon="mdi-currency-usd"
            color="primary"
          />
        </v-col>

        <v-col cols="12" md="2">
          <KPIWidget
            title="Общий ROI"
            :value="mainKPIs.roi"
            format="percent"
            :trend="mainKPIs.roiTrend"
            :target="mainKPIs.roiTarget"
            icon="mdi-trending-up"
            color="success"
          />
        </v-col>

        <v-col cols="12" md="2">
          <KPIWidget
            title="Конверсии"
            :value="mainKPIs.conversions"
            format="number"
            :trend="mainKPIs.conversionsTrend"
            :target="mainKPIs.conversionsTarget"
            icon="mdi-target"
            color="info"
          />
        </v-col>

        <v-col cols="12" md="2">
          <KPIWidget
            title="CPA"
            :value="mainKPIs.cpa"
            format="currency"
            :trend="mainKPIs.cpaTrend"
            :target="mainKPIs.cpaTarget"
            icon="mdi-account-cash"
            color="warning"
          />
        </v-col>

        <v-col cols="12" md="2">
          <KPIWidget
            title="CTR"
            :value="mainKPIs.ctr"
            format="percent"
            :trend="mainKPIs.ctrTrend"
            :target="mainKPIs.ctrTarget"
            icon="mdi-cursor-pointer"
            color="purple"
          />
        </v-col>

        <v-col cols="12" md="2">
          <KPIWidget
            title="Активных кампаний"
            :value="activeCampaigns"
            format="number"
            icon="mdi-bullhorn"
            color="teal"
          />
        </v-col>

        <!-- Диаграмма выручки по времени -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-line</v-icon>
              Динамика выручки и ROI
            </v-card-title>
            <v-card-text>
              <RevenueROIChart
                :data="revenueROIData"
                height="350px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Распределение выручки по каналам -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-pie</v-icon>
              Выручка по каналам
            </v-card-title>
            <v-card-text>
              <ChannelRevenueChart
                :data="channelRevenueData"
                height="350px"
                @segment-click="handleChannelClick"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- География производительности -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-map</v-icon>
              География продаж
            </v-card-title>
            <v-card-text>
              <GeoPerformanceMap
                :data="geoData"
                height="300px"
                @region-click="handleRegionClick"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Топ кампании -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-trophy</v-icon>
              Топ кампании по производительности
            </v-card-title>
            <v-card-text>
              <TopPerformingCampaignsTable
                :data="topCampaigns"
                :is-editing="isEditing"
                @campaign-click="handleCampaignClick"
                @export="handleTableExport"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Вкладка: Анализ трендов -->
    <div v-else-if="tabId === 'trends_analysis'" class="tab-content">
      <v-row>
        <!-- Прогнозная модель -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-crystal-ball</v-icon>
              Прогноз производительности
              <v-spacer />
              <v-chip size="small" color="success" variant="tonal">
                Точность: 87%
              </v-chip>
            </v-card-title>
            <v-card-text>
              <PerformanceForecastChart
                :data="forecastData"
                height="400px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- KPI прогноза -->
        <v-col cols="12" md="4">
          <v-row>
            <v-col cols="12">
              <KPIWidget
                title="Прогноз выручки"
                :value="forecastKPIs.revenue"
                format="currency"
                :trend="forecastKPIs.revenueTrend"
                icon="mdi-chart-line-variant"
                color="primary"
              />
            </v-col>

            <v-col cols="12">
              <KPIWidget
                title="Прогноз ROI"
                :value="forecastKPIs.roi"
                format="percent"
                :trend="forecastKPIs.roiTrend"
                icon="mdi-trending-up"
                color="success"
              />
            </v-col>

            <v-col cols="12">
              <KPIWidget
                title="Прогноз конверсий"
                :value="forecastKPIs.conversions"
                format="number"
                :trend="forecastKPIs.conversionsTrend"
                icon="mdi-target"
                color="info"
              />
            </v-col>
          </v-row>
        </v-col>

        <!-- Быстрорастущие сегменты -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-rocket-launch</v-icon>
              Быстрорастущие сегменты
            </v-card-title>
            <v-card-text>
              <GrowingSegmentsList
                :data="growingSegments"
                @segment-click="handleSegmentClick"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Сезонные тренды -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-calendar-clock</v-icon>
              Сезонные тренды
            </v-card-title>
            <v-card-text>
              <SeasonalTrendsChart
                :data="seasonalTrendsData"
                height="300px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Конкурентный анализ -->
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-sword-cross</v-icon>
              Конкурентный анализ
            </v-card-title>
            <v-card-text>
              <CompetitiveAnalysisChart
                :data="competitiveData"
                height="350px"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import KPIWidget from '../widgets/KPIWidget.vue'
import RevenueROIChart from '../charts/RevenueROIChart.vue'
import ChannelRevenueChart from '../charts/ChannelRevenueChart.vue'
import GeoPerformanceMap from '../charts/GeoPerformanceMap.vue'
import TopPerformingCampaignsTable from '../tables/TopPerformingCampaignsTable.vue'
import PerformanceForecastChart from '../charts/PerformanceForecastChart.vue'
import GrowingSegmentsList from '../lists/GrowingSegmentsList.vue'
import SeasonalTrendsChart from '../charts/SeasonalTrendsChart.vue'
import CompetitiveAnalysisChart from '../charts/CompetitiveAnalysisChart.vue'

// Props
const props = defineProps({
  tabId: {
    type: String,
    default: 'kpi_summary'
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

// Computed data
const mainKPIs = computed(() => ({
  revenue: 12683000,
  revenueTrend: 23.8,
  revenueTarget: 15000000,
  roi: 285.5,
  roiTrend: 6.6,
  roiTarget: 300.0,
  conversions: 2485,
  conversionsTrend: 15.3,
  conversionsTarget: 2800,
  cpa: 1250,
  cpaTrend: -9.7,
  cpaTarget: 1100,
  ctr: 3.8,
  ctrTrend: 18.8,
  ctrTarget: 4.2
}))

const activeCampaigns = computed(() => 45)

const revenueROIData = computed(() => ({
  categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  series: [
    {
      name: 'Выручка (млн ₽)',
      data: [8.5, 9.2, 10.1, 9.8, 11.2, 10.6, 11.8, 12.1, 10.9, 11.5, 12.2, 12.7],
      color: '#2196F3',
      yAxisIndex: 0
    },
    {
      name: 'ROI (%)',
      data: [245, 258, 267, 274, 281, 289, 295, 301, 285, 278, 282, 286],
      color: '#4CAF50',
      yAxisIndex: 1
    }
  ]
}))

const channelRevenueData = computed(() => [
  { name: 'Google Ads', value: 4500000, percentage: 35.5, color: '#4285F4' },
  { name: 'Email', value: 3580000, percentage: 28.2, color: '#34A853' },
  { name: 'Yandex Direct', value: 2800000, percentage: 22.1, color: '#FBBC04' },
  { name: 'Instagram', value: 1803000, percentage: 14.2, color: '#E4405F' }
])

const geoData = computed(() => [
  {
    region: 'moscow',
    name: 'Москва',
    revenue: 5200000,
    growth: 12.5,
    coordinates: [55.7558, 37.6176]
  },
  {
    region: 'spb',
    name: 'Санкт-Петербург',
    revenue: 3800000,
    growth: 8.3,
    coordinates: [59.9311, 30.3609]
  },
  {
    region: 'ekb',
    name: 'Екатеринбург',
    revenue: 1500000,
    growth: 15.7,
    coordinates: [56.8431, 60.6454]
  },
  {
    region: 'nsk',
    name: 'Новосибирск',
    revenue: 1200000,
    growth: 18.2,
    coordinates: [55.0084, 82.9357]
  },
  {
    region: 'kzn',
    name: 'Казань',
    revenue: 983000,
    growth: 22.1,
    coordinates: [55.8304, 49.0661]
  }
])

const topCampaigns = computed(() => [
  {
    id: 'camp_001',
    name: 'Запуск Kreola Premium',
    channel: 'Google Ads',
    status: 'active',
    revenue: 2000000,
    roi: 345.5,
    conversions: 487,
    cpa: 1190,
    period: 'Дек 2024'
  },
  {
    id: 'camp_002',
    name: 'Influencer кампания',
    channel: 'Instagram',
    status: 'active',
    revenue: 1800000,
    roi: 289.3,
    conversions: 356,
    cpa: 1742,
    period: 'Дек 2024'
  },
  {
    id: 'camp_003',
    name: 'Email-рассылка',
    channel: 'Email',
    status: 'completed',
    revenue: 1550000,
    roi: 1580.0,
    conversions: 423,
    cpa: 232,
    period: 'Дек 2024'
  },
  {
    id: 'camp_004',
    name: 'Контекстная реклама',
    channel: 'Yandex Direct',
    status: 'active',
    revenue: 1220000,
    roi: 275.8,
    conversions: 298,
    cpa: 1483,
    period: 'Дек 2024'
  },
  {
    id: 'camp_005',
    name: 'Видеореклама',
    channel: 'YouTube',
    status: 'paused',
    revenue: 1100000,
    roi: 267.2,
    conversions: 267,
    cpa: 1539,
    period: 'Дек 2024'
  }
])

const forecastKPIs = computed(() => ({
  revenue: 14200000,
  revenueTrend: 8.2,
  roi: 291.2,
  roiTrend: 2.1,
  conversions: 2650,
  conversionsTrend: 6.6
}))

const forecastData = computed(() => ({
  categories: ['Янв 25', 'Фев 25', 'Мар 25', 'Апр 25', 'Май 25', 'Июн 25'],
  series: [
    {
      name: 'Фактическая выручка',
      data: [12.7, null, null, null, null, null],
      color: '#2196F3'
    },
    {
      name: 'Прогноз выручки',
      data: [12.7, 13.8, 14.2, 15.1, 14.8, 15.5],
      color: '#4CAF50',
      dashStyle: 'dash'
    },
    {
      name: 'Доверительный интервал',
      data: [
        [12.7, 12.7],
        [12.9, 14.7],
        [13.2, 15.2],
        [14.1, 16.1],
        [13.8, 15.8],
        [14.5, 16.5]
      ],
      color: '#FFC107',
      type: 'arearange'
    }
  ]
}))

const growingSegments = computed(() => [
  {
    id: 'seg_001',
    name: 'Молодые профессионалы',
    category: 'Демография',
    growth: 28.5,
    customers: 1245,
    revenue: 2800000
  },
  {
    id: 'seg_002',
    name: 'Премиум сегмент',
    category: 'Продукт',
    growth: 35.2,
    customers: 890,
    revenue: 3200000
  },
  {
    id: 'seg_003',
    name: 'Мобильные пользователи',
    category: 'Устройство',
    growth: 22.1,
    customers: 2340,
    revenue: 1950000
  },
  {
    id: 'seg_004',
    name: 'Повторные покупатели',
    category: 'Поведение',
    growth: 18.7,
    customers: 1567,
    revenue: 2450000
  }
])

const seasonalTrendsData = computed(() => ({
  categories: ['Q1', 'Q2', 'Q3', 'Q4'],
  series: [
    {
      name: '2022',
      data: [100, 95, 85, 120],
      color: '#9E9E9E'
    },
    {
      name: '2023',
      data: [105, 98, 88, 125],
      color: '#FF9800'
    },
    {
      name: '2024',
      data: [110, 102, 92, 130],
      color: '#2196F3'
    },
    {
      name: '2025 (прогноз)',
      data: [115, 106, 96, 135],
      color: '#4CAF50',
      dashStyle: 'dash'
    }
  ]
}))

const competitiveData = computed(() => ({
  categories: ['Узнаваемость бренда', 'Доля рынка', 'Качество продукта', 'Ценовая политика', 'Клиентский сервис'],
  series: [
    {
      name: 'Kreola',
      data: [85, 32, 92, 78, 89],
      color: '#2196F3'
    },
    {
      name: 'Конкурент А',
      data: [78, 45, 85, 82, 76],
      color: '#FF9800'
    },
    {
      name: 'Конкурент Б',
      data: [72, 28, 79, 88, 71],
      color: '#4CAF50'
    },
    {
      name: 'Среднее по рынку',
      data: [70, 25, 75, 80, 70],
      color: '#9E9E9E'
    }
  ]
}))

// Methods
const handleChannelClick = (channel) => {
  console.log('Channel clicked:', channel)
  // TODO: Emit drilldown event
}

const handleRegionClick = (region) => {
  console.log('Region clicked:', region)
  // TODO: Emit drilldown event
}

const handleCampaignClick = (campaign) => {
  console.log('Campaign clicked:', campaign)
  // TODO: Emit drilldown event
}

const handleSegmentClick = (segment) => {
  console.log('Segment clicked:', segment)
  // TODO: Emit drilldown event
}

const handleTableExport = (format) => {
  console.log('Exporting table in format:', format)
  // TODO: Export table data
}

// Watchers
watch(() => props.data, (newData) => {
  console.log('Performance Overview Dashboard data updated:', newData)
}, { deep: true })
</script>

<style scoped>
.performance-overview-dashboard {
  height: 100%;
}

.tab-content {
  height: 100%;
}
</style>