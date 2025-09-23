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
                :data="forecastData.data"
                :forecast="forecastData.forecast"
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
  revenueTrend: { value: 23.8, direction: 'up' },
  revenueTarget: 15000000,
  roi: 285.5,
  roiTrend: { value: 6.6, direction: 'up' },
  roiTarget: 300.0,
  conversions: 2485,
  conversionsTrend: { value: 15.3, direction: 'up' },
  conversionsTarget: 2800,
  cpa: 1250,
  cpaTrend: { value: 9.7, direction: 'down' },
  cpaTarget: 1100,
  ctr: 3.8,
  ctrTrend: { value: 18.8, direction: 'up' },
  ctrTarget: 4.2
}))

const activeCampaigns = computed(() => 45)

const revenueROIData = computed(() => {
  const categories = ['2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-01', '2024-07-01', '2024-08-01', '2024-09-01', '2024-10-01', '2024-11-01', '2024-12-01']
  const revenueData = [8500000, 9200000, 10100000, 9800000, 11200000, 10600000, 11800000, 12100000, 10900000, 11500000, 12200000, 12700000]
  const roiData = [245, 258, 267, 274, 281, 289, 295, 301, 285, 278, 282, 286]

  return categories.map((date, index) => ({
    date,
    revenue: revenueData[index],
    roi: roiData[index]
  }))
})

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
  revenueTrend: { value: 8.2, direction: 'up' },
  roi: 291.2,
  roiTrend: { value: 2.1, direction: 'up' },
  conversions: 2650,
  conversionsTrend: { value: 6.6, direction: 'up' }
}))

const forecastData = computed(() => {
  // Historical data (only the first month with actual data)
  const historicalData = [
    {
      date: '2024-12-01',
      revenue: 12700000,
      costs: 4500000
    }
  ]

  // Forecast data for future months
  const forecastData = [
    {
      date: '2025-01-01',
      predicted_revenue: 13800000,
      predicted_costs: 4800000,
      upper_bound: 14700000,
      lower_bound: 12900000
    },
    {
      date: '2025-02-01',
      predicted_revenue: 14200000,
      predicted_costs: 5000000,
      upper_bound: 15200000,
      lower_bound: 13200000
    },
    {
      date: '2025-03-01',
      predicted_revenue: 15100000,
      predicted_costs: 5200000,
      upper_bound: 16100000,
      lower_bound: 14100000
    },
    {
      date: '2025-04-01',
      predicted_revenue: 14800000,
      predicted_costs: 5100000,
      upper_bound: 15800000,
      lower_bound: 13800000
    },
    {
      date: '2025-05-01',
      predicted_revenue: 15500000,
      predicted_costs: 5300000,
      upper_bound: 16500000,
      lower_bound: 14500000
    }
  ]

  return {
    data: historicalData,
    forecast: forecastData
  }
})

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

const seasonalTrendsData = computed(() => {
  const data = []

  // 2022 data
  const quarters2022 = [100, 95, 85, 120]
  quarters2022.forEach((value, quarter) => {
    for (let month = 1; month <= 3; month++) {
      data.push({
        year: 2022,
        month: quarter * 3 + month - 3,
        quarter: quarter + 1,
        revenue: value * 1000000, // Convert to actual revenue values
        index: value // Keep original index value for comparison
      })
    }
  })

  // 2023 data
  const quarters2023 = [105, 98, 88, 125]
  quarters2023.forEach((value, quarter) => {
    for (let month = 1; month <= 3; month++) {
      data.push({
        year: 2023,
        month: quarter * 3 + month - 3,
        quarter: quarter + 1,
        revenue: value * 1000000,
        index: value
      })
    }
  })

  // 2024 data
  const quarters2024 = [110, 102, 92, 130]
  quarters2024.forEach((value, quarter) => {
    for (let month = 1; month <= 3; month++) {
      data.push({
        year: 2024,
        month: quarter * 3 + month - 3,
        quarter: quarter + 1,
        revenue: value * 1000000,
        index: value
      })
    }
  })

  // 2025 forecast data
  const quarters2025 = [115, 106, 96, 135]
  quarters2025.forEach((value, quarter) => {
    for (let month = 1; month <= 3; month++) {
      data.push({
        year: 2025,
        month: quarter * 3 + month - 3,
        quarter: quarter + 1,
        revenue: value * 1000000,
        index: value,
        forecast: true
      })
    }
  })

  return data
})

const competitiveData = computed(() => [
  {
    company_name: 'Kreola',
    is_our_company: true,
    metrics: {
      brand_awareness: 85,
      market_share: 32,
      customer_satisfaction: 92,
      price_competitiveness: 78,
      innovation: 89
    }
  },
  {
    company_name: 'Конкурент А',
    is_our_company: false,
    metrics: {
      brand_awareness: 78,
      market_share: 45,
      customer_satisfaction: 85,
      price_competitiveness: 82,
      innovation: 76
    }
  },
  {
    company_name: 'Конкурент Б',
    is_our_company: false,
    metrics: {
      brand_awareness: 72,
      market_share: 28,
      customer_satisfaction: 79,
      price_competitiveness: 88,
      innovation: 71
    }
  },
  {
    company_name: 'Среднее по рынку',
    is_our_company: false,
    metrics: {
      brand_awareness: 70,
      market_share: 25,
      customer_satisfaction: 75,
      price_competitiveness: 80,
      innovation: 70
    }
  }
])

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