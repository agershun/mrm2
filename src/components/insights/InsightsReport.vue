<template>
  <div class="insights-report">
    <!-- Report Header -->
    <div class="report-header d-flex align-center justify-space-between mb-4">
      <div>
        <h3 class="text-h5 mb-1">{{ report.title }}</h3>
        <div class="text-body-2 text-grey">
          {{ report.description }}
        </div>
      </div>

      <div class="d-flex align-center gap-2">
        <!-- Time Range Selector -->
        <v-select
          v-model="selectedTimeRange"
          :items="timeRangeOptions"
          variant="outlined"
          density="compact"
          style="min-width: 200px"
          @update:model-value="handleTimeRangeChange"
        />

        <!-- Chart Type Selector -->
        <v-btn-toggle
          v-model="selectedChartType"
          variant="outlined"
          density="compact"
          mandatory
          @update:model-value="handleChartTypeChange"
        >
          <v-btn
            v-for="type in chartTypeOptions"
            :key="type.value"
            :value="type.value"
            size="small"
          >
            <v-icon :icon="type.icon" />
            <v-tooltip activator="parent" location="bottom">
              {{ type.title }}
            </v-tooltip>
          </v-btn>
        </v-btn-toggle>

        <!-- Report Actions -->
        <v-btn
          icon="mdi-refresh"
          variant="outlined"
          density="compact"
          @click="refreshData"
          :loading="loading"
        />

        <v-btn
          icon="mdi-download"
          variant="outlined"
          density="compact"
          @click="exportReport"
        />
      </div>
    </div>

    <!-- Filters Panel -->
    <v-expand-transition>
      <div v-if="showFilters" class="filters-panel mb-4">
        <v-card variant="outlined">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="filters.channels"
                  :items="channelOptions"
                  label="Каналы"
                  multiple
                  chips
                  clearable
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="filters.regions"
                  :items="regionOptions"
                  label="Регионы"
                  multiple
                  chips
                  clearable
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-autocomplete
                  v-model="filters.campaigns"
                  :items="campaignOptions"
                  label="Кампании"
                  multiple
                  chips
                  clearable
                  variant="outlined"
                  density="compact"
                />
              </v-col>

              <v-col cols="12" md="3">
                <v-range-slider
                  v-model="filters.budgetRange"
                  :min="0"
                  :max="1000000"
                  :step="10000"
                  label="Диапазон бюджета"
                  thumb-label
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </v-expand-transition>

    <!-- Main Chart Area -->
    <v-card class="mb-4">
      <v-card-text>
        <div v-if="loading" class="d-flex justify-center align-center" style="height: 400px;">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
          />
        </div>

        <div v-else class="chart-container">
          <!-- Revenue Chart -->
          <revenue-chart
            v-if="selectedChartType === 'revenue' && report.chartType === 'line'"
            :data="chartData"
            :options="chartOptions"
            @point-click="handleChartClick"
          />

          <!-- ROI Chart -->
          <roi-chart
            v-else-if="selectedChartType === 'roi' && report.chartType === 'line'"
            :data="chartData"
            :options="chartOptions"
            @point-click="handleChartClick"
          />

          <!-- Channel Revenue Chart -->
          <channel-revenue-chart
            v-else-if="selectedChartType === 'channel' && report.chartType === 'bar'"
            :data="chartData"
            :options="chartOptions"
            @bar-click="handleChartClick"
          />

          <!-- Geographic Performance Map -->
          <geographic-chart
            v-else-if="selectedChartType === 'geographic' && report.chartType === 'map'"
            :data="chartData"
            :options="chartOptions"
            @region-click="handleChartClick"
          />

          <!-- Funnel Chart -->
          <funnel-chart
            v-else-if="selectedChartType === 'funnel' && report.chartType === 'funnel'"
            :data="chartData"
            :options="chartOptions"
            @stage-click="handleChartClick"
          />

          <!-- Attribution Waterfall -->
          <attribution-waterfall-chart
            v-else-if="selectedChartType === 'attribution' && report.chartType === 'waterfall'"
            :data="chartData"
            :options="chartOptions"
            @touchpoint-click="handleChartClick"
          />

          <!-- Default Chart -->
          <base-chart
            v-else
            :type="report.chartType"
            :data="chartData"
            :options="chartOptions"
            @chart-click="handleChartClick"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Drill-down Data Table -->
    <v-expand-transition>
      <div v-if="drillDownData && drillDownData.length > 0" class="drill-down-section">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <div>
              <v-icon class="me-2">mdi-table-search</v-icon>
              Детализация: {{ drillDownTitle }}
            </div>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="closeDrillDown"
            />
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="drillDownHeaders"
              :items="drillDownData"
              :loading="drillDownLoading"
              item-key="id"
              class="elevation-0"
              density="compact"
              :items-per-page="10"
            >
              <template #item.revenue="{ item }">
                <div class="text-end font-weight-medium">
                  {{ formatCurrency(item.revenue) }}
                </div>
              </template>

              <template #item.roi="{ item }">
                <v-chip
                  :color="item.roi >= 100 ? 'success' : item.roi >= 50 ? 'warning' : 'error'"
                  size="small"
                  variant="tonal"
                >
                  {{ item.roi }}%
                </v-chip>
              </template>

              <template #item.trend="{ item }">
                <v-icon
                  :icon="item.trend > 0 ? 'mdi-trending-up' : item.trend < 0 ? 'mdi-trending-down' : 'mdi-trending-neutral'"
                  :color="item.trend > 0 ? 'success' : item.trend < 0 ? 'error' : 'warning'"
                />
                {{ Math.abs(item.trend) }}%
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </div>
    </v-expand-transition>

    <!-- Report Summary Cards -->
    <v-row class="mt-4">
      <v-col
        v-for="summary in reportSummary"
        :key="summary.key"
        cols="12"
        md="3"
      >
        <v-card>
          <v-card-text class="d-flex align-center">
            <div class="flex-grow-1">
              <div class="text-body-2 text-grey mb-1">{{ summary.label }}</div>
              <div class="text-h6 font-weight-bold">
                {{ summary.formatter ? summary.formatter(summary.value) : summary.value }}
              </div>
              <div class="text-caption" :class="summary.trend > 0 ? 'text-success' : summary.trend < 0 ? 'text-error' : 'text-warning'">
                <v-icon
                  :icon="summary.trend > 0 ? 'mdi-trending-up' : summary.trend < 0 ? 'mdi-trending-down' : 'mdi-trending-neutral'"
                  size="small"
                />
                {{ Math.abs(summary.trend) }}%
              </div>
            </div>
            <v-avatar :color="summary.color" size="48">
              <v-icon :icon="summary.icon" color="white" />
            </v-avatar>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useInsightsStore } from '@/stores/insightsStore'
import RevenueChart from './charts/RevenueChart.vue'
import RoiChart from './charts/RoiChart.vue'
import ChannelRevenueChart from './charts/ChannelRevenueChart.vue'
import GeographicChart from './charts/GeographicChart.vue'
import FunnelChart from './charts/FunnelChart.vue'
import AttributionWaterfallChart from './charts/AttributionWaterfallChart.vue'
import BaseChart from './charts/BaseChart.vue'

const props = defineProps({
  report: {
    type: Object,
    required: true
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  showFilters: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['filter-change', 'chart-click', 'export'])

const insightsStore = useInsightsStore()

// Reactive data
const loading = ref(false)
const drillDownLoading = ref(false)
const selectedTimeRange = ref('last_30_days')
const selectedChartType = ref(props.report.defaultView || 'revenue')
const chartData = ref([])
const drillDownData = ref([])
const drillDownTitle = ref('')

// Filters
const filters = ref({
  channels: [],
  regions: [],
  campaigns: [],
  budgetRange: [0, 1000000]
})

// Options
const timeRangeOptions = [
  { title: 'Последние 7 дней', value: 'last_7_days' },
  { title: 'Последние 30 дней', value: 'last_30_days' },
  { title: 'Последние 90 дней', value: 'last_90_days' },
  { title: 'Текущий квартал', value: 'current_quarter' },
  { title: 'Прошлый квартал', value: 'previous_quarter' },
  { title: 'Текущий год', value: 'current_year' },
  { title: 'Прошлый год', value: 'previous_year' }
]

const chartTypeOptions = computed(() => {
  const baseOptions = [
    { value: 'revenue', title: 'Выручка', icon: 'mdi-currency-usd' },
    { value: 'roi', title: 'ROI', icon: 'mdi-percent' },
    { value: 'channel', title: 'По каналам', icon: 'mdi-chart-bar' }
  ]

  if (props.report.id === 'geographic_performance') {
    baseOptions.push({ value: 'geographic', title: 'География', icon: 'mdi-map' })
  }

  if (props.report.id === 'funnel_analysis') {
    baseOptions.push({ value: 'funnel', title: 'Воронка', icon: 'mdi-funnel' })
  }

  if (props.report.id === 'attribution_analysis') {
    baseOptions.push({ value: 'attribution', title: 'Атрибуция', icon: 'mdi-vector-polyline' })
  }

  return baseOptions
})

const channelOptions = [
  'Digital', 'TV', 'Radio', 'Print', 'Outdoor', 'Social Media', 'Email', 'SEO', 'PPC'
]

const regionOptions = [
  'Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Нижний Новгород'
]

const campaignOptions = [
  'Kreola Summer 2024', 'Digital Transformation', 'Brand Awareness', 'Product Launch'
]

// Computed
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Период'
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: selectedChartType.value === 'revenue' ? 'Выручка (₽)' :
              selectedChartType.value === 'roi' ? 'ROI (%)' : 'Значение'
      }
    }
  }
}))

const drillDownHeaders = computed(() => [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Выручка', key: 'revenue', align: 'end', sortable: true },
  { title: 'ROI', key: 'roi', align: 'center', sortable: true },
  { title: 'Тренд', key: 'trend', align: 'center', sortable: true },
  { title: 'Период', key: 'period', sortable: true }
])

const reportSummary = computed(() => {
  if (!chartData.value || chartData.value.length === 0) return []

  return [
    {
      key: 'total_revenue',
      label: 'Общая выручка',
      value: 15420000,
      trend: 12.5,
      icon: 'mdi-currency-usd',
      color: 'primary',
      formatter: formatCurrency
    },
    {
      key: 'avg_roi',
      label: 'Средний ROI',
      value: 165,
      trend: 8.2,
      icon: 'mdi-percent',
      color: 'success',
      formatter: (value) => `${value}%`
    },
    {
      key: 'total_campaigns',
      label: 'Активных кампаний',
      value: 24,
      trend: -3.1,
      icon: 'mdi-rocket-launch',
      color: 'info'
    },
    {
      key: 'conversion_rate',
      label: 'Конверсия',
      value: 3.8,
      trend: 15.7,
      icon: 'mdi-target',
      color: 'warning',
      formatter: (value) => `${value}%`
    }
  ]
})

// Methods
const loadReportData = async () => {
  loading.value = true

  try {
    const result = await insightsStore.getReportData({
      reportId: props.report.id,
      timeRange: selectedTimeRange.value,
      chartType: selectedChartType.value,
      filters: filters.value
    })

    chartData.value = result.data || []
  } catch (error) {
    console.error('Error loading report data:', error)
  } finally {
    loading.value = false
  }
}

const handleTimeRangeChange = () => {
  loadReportData()
}

const handleChartTypeChange = () => {
  loadReportData()
}

const handleChartClick = async (point) => {
  if (!point || !point.dataIndex) return

  drillDownLoading.value = true
  drillDownTitle.value = `${point.label || 'Детализация'} - ${selectedTimeRange.value}`

  try {
    const result = await insightsStore.getDrillDownData({
      reportId: props.report.id,
      point: point,
      timeRange: selectedTimeRange.value,
      filters: filters.value
    })

    drillDownData.value = result.data || []
  } catch (error) {
    console.error('Error loading drill-down data:', error)
    drillDownData.value = []
  } finally {
    drillDownLoading.value = false
  }

  emit('chart-click', point)
}

const closeDrillDown = () => {
  drillDownData.value = []
  drillDownTitle.value = ''
}

const refreshData = () => {
  loadReportData()
}

const exportReport = () => {
  emit('export', {
    report: props.report,
    data: chartData.value,
    filters: filters.value,
    timeRange: selectedTimeRange.value,
    chartType: selectedChartType.value
  })
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

// Watchers
watch(() => props.filters, (newFilters) => {
  Object.assign(filters.value, newFilters)
  loadReportData()
}, { deep: true })

watch(filters, (newFilters) => {
  emit('filter-change', newFilters)
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadReportData()
})
</script>

<style scoped>
.insights-report {
  height: 100%;
}

.chart-container {
  height: 400px;
  position: relative;
}

.filters-panel {
  border-radius: 8px;
}

.drill-down-section {
  margin-top: 16px;
}

:deep(.v-data-table) {
  border-radius: 8px;
}

:deep(.v-btn-toggle .v-btn) {
  border-radius: 8px !important;
}

:deep(.v-card) {
  border-radius: 12px;
}
</style>