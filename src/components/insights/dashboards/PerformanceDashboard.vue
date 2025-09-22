<template>
  <div class="performance-dashboard">
    <!-- Фильтры производительности -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedChannel"
          :items="channels"
          label="Канал"
          variant="outlined"
          density="compact"
          clearable
          @update:modelValue="onFiltersChange"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedProduct"
          :items="products"
          label="Продукт"
          variant="outlined"
          density="compact"
          clearable
          @update:modelValue="onFiltersChange"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedRegion"
          :items="regions"
          label="Регион"
          variant="outlined"
          density="compact"
          clearable
          @update:modelValue="onFiltersChange"
        />
      </v-col>
    </v-row>

    <!-- KPI производительности -->
    <v-row class="mb-6">
      <v-col cols="12" lg="3" md="6" v-for="kpi in performanceKPIs" :key="kpi.id">
        <KPIWidget
          :title="kpi.title"
          :value="kpi.value"
          :format="kpi.format"
          :trend="kpi.trend"
          :icon="kpi.icon"
          :color="kpi.color"
          :loading="isLoading"
          @click="onKPIClick(kpi)"
        />
      </v-col>
    </v-row>

    <!-- Основные графики -->
    <v-row class="mb-6">
      <!-- График производительности по времени -->
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-line</v-icon>
            Динамика производительности
            <v-spacer />
            <v-btn-toggle v-model="performanceMetric" mandatory size="small" variant="outlined">
              <v-btn value="conversions">Конверсии</v-btn>
              <v-btn value="revenue">Доход</v-btn>
              <v-btn value="roi">ROI</v-btn>
              <v-btn value="cost">Затраты</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 400px;">
            <TrendChart
              :data="performanceTimeData"
              :loading="isLoading"
              :metric="performanceMetric"
              type="area"
              multi-series
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Сравнение каналов -->
      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-bar</v-icon>
            Эффективность каналов
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 400px;">
            <ComparisonChart
              :data="channelPerformance"
              :loading="isLoading"
              type="bar"
              horizontal
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Детальная аналитика -->
    <v-row class="mb-6">
      <!-- Тепловая карта производительности -->
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-grid</v-icon>
            Тепловая карта кампаний
            <v-spacer />
            <v-select
              v-model="heatmapMetric"
              :items="heatmapMetrics"
              variant="outlined"
              density="compact"
              style="width: 140px"
              @update:modelValue="onHeatmapMetricChange"
            />
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 350px;">
            <HeatmapWidget
              :data="heatmapData"
              :metric="heatmapMetric"
              :loading="isLoading"
              @cell-click="onHeatmapCellClick"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Корреляционная матрица -->
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-matrix</v-icon>
            Корреляция метрик
            <v-spacer />
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" size="small" color="grey">mdi-information</v-icon>
              </template>
              <span>Показывает взаимосвязь между различными метриками</span>
            </v-tooltip>
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 350px;">
            <CorrelationMatrix
              :data="correlationData"
              :loading="isLoading"
              @metric-click="onCorrelationClick"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Таблица детализации -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-table</v-icon>
            Детализация по кампаниям
            <v-spacer />
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск кампаний"
              variant="outlined"
              density="compact"
              style="width: 300px"
              clearable
              @update:modelValue="onSearchChange"
            />
            <v-btn
              class="ml-2"
              variant="outlined"
              @click="exportTable"
              :loading="isExporting"
            >
              <v-icon>mdi-download</v-icon>
              Экспорт
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-data-table
              :headers="tableHeaders"
              :items="filteredCampaigns"
              :loading="isLoading"
              :items-per-page="25"
              :search="searchQuery"
              item-key="id"
              show-expand
              @click:row="onRowClick"
            >
              <!-- Статус кампании -->
              <template v-slot:[`item.status`]="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  variant="flat"
                >
                  {{ getStatusText(item.status) }}
                </v-chip>
              </template>

              <!-- ROI с цветовой индикацией -->
              <template v-slot:[`item.roi`]="{ item }">
                <span :class="getRoiColor(item.roi)">
                  {{ formatPercent(item.roi) }}
                </span>
              </template>

              <!-- Доход -->
              <template v-slot:[`item.revenue`]="{ item }">
                {{ formatCurrency(item.revenue) }}
              </template>

              <!-- Затраты -->
              <template v-slot:[`item.cost`]="{ item }">
                {{ formatCurrency(item.cost) }}
              </template>

              <!-- Конверсии -->
              <template v-slot:[`item.conversions`]="{ item }">
                {{ formatNumber(item.conversions) }}
              </template>

              <!-- Действия -->
              <template v-slot:[`item.actions`]="{ item }">
                <v-btn
                  size="small"
                  variant="text"
                  icon
                  @click.stop="viewCampaignDetails(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  icon
                  @click.stop="editCampaign(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>

              <!-- Развернутая информация -->
              <template v-slot:expanded-row="{ item }">
                <tr>
                  <td :colspan="tableHeaders.length">
                    <div class="pa-4">
                      <v-row>
                        <v-col cols="6">
                          <div class="text-subtitle-2 mb-2">Детали кампании</div>
                          <div><strong>Период:</strong> {{ item.period }}</div>
                          <div><strong>Целевая аудитория:</strong> {{ item.audience }}</div>
                          <div><strong>Бюджет:</strong> {{ formatCurrency(item.budget) }}</div>
                          <div><strong>Описание:</strong> {{ item.description }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-subtitle-2 mb-2">Дополнительные метрики</div>
                          <div><strong>CTR:</strong> {{ formatPercent(item.ctr) }}</div>
                          <div><strong>CPC:</strong> {{ formatCurrency(item.cpc) }}</div>
                          <div><strong>CPM:</strong> {{ formatCurrency(item.cpm) }}</div>
                          <div><strong>CPA:</strong> {{ formatCurrency(item.cpa) }}</div>
                        </v-col>
                      </v-row>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог деталей кампании -->
    <v-dialog v-model="showDetailsDialog" max-width="1000">
      <v-card v-if="selectedCampaign">
        <v-card-title>
          <v-icon class="me-2">mdi-bullhorn</v-icon>
          {{ selectedCampaign.name }}
        </v-card-title>
        <v-divider />
        <v-card-text>
          <CampaignDetailsWidget :campaign="selectedCampaign" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDetailsDialog = false">Закрыть</v-btn>
          <v-btn color="primary" @click="openInActivities">
            Открыть в Активностях
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'
import { useInsightsStore } from '@/stores/insightsStore'
import { useRouter } from 'vue-router'
import KPIWidget from '../widgets/KPIWidget.vue'
import TrendChart from '../charts/TrendChart.vue'
import ComparisonChart from '../charts/ComparisonChart.vue'
import HeatmapWidget from '../widgets/HeatmapWidget.vue'
import CorrelationMatrix from '../widgets/CorrelationMatrix.vue'
import CampaignDetailsWidget from '../widgets/CampaignDetailsWidget.vue'

export default {
  name: 'PerformanceDashboard',
  components: {
    KPIWidget,
    TrendChart,
    ComparisonChart,
    HeatmapWidget,
    CorrelationMatrix,
    CampaignDetailsWidget
  },
  setup() {
    const insightsStore = useInsightsStore()
    const router = useRouter()

    // Reactive state
    const selectedChannel = ref(null)
    const selectedProduct = ref(null)
    const selectedRegion = ref(null)
    const performanceMetric = ref('conversions')
    const heatmapMetric = ref('roi')
    const searchQuery = ref('')
    const showDetailsDialog = ref(false)
    const selectedCampaign = ref(null)
    const isExporting = ref(false)

    // Computed properties
    const isLoading = computed(() => insightsStore.isLoading)

    const channels = computed(() => insightsStore.availableChannels)
    const products = computed(() => insightsStore.availableProducts)
    const regions = computed(() => insightsStore.availableRegions)

    const performanceKPIs = computed(() => [
      {
        id: 'total_conversions',
        title: 'Конверсии',
        value: insightsStore.totalConversions,
        format: 'number',
        trend: { value: 15.2, direction: 'up' },
        icon: 'mdi-target',
        color: 'success'
      },
      {
        id: 'avg_conversion_rate',
        title: 'Конверсия (%)',
        value: insightsStore.avgConversionRate,
        format: 'percent',
        trend: { value: -1.3, direction: 'down' },
        icon: 'mdi-percent',
        color: 'warning'
      },
      {
        id: 'avg_cpa',
        title: 'Средний CPA',
        value: insightsStore.avgCPA,
        format: 'currency',
        trend: { value: -8.7, direction: 'down' },
        icon: 'mdi-currency-rub',
        color: 'success'
      },
      {
        id: 'quality_score',
        title: 'Оценка качества',
        value: insightsStore.qualityScore,
        format: 'number',
        trend: { value: 5.1, direction: 'up' },
        icon: 'mdi-star',
        color: 'primary'
      }
    ])

    const performanceTimeData = computed(() => insightsStore.performanceTimeData)
    const channelPerformance = computed(() => insightsStore.channelPerformance)
    const heatmapData = computed(() => insightsStore.heatmapData)
    const correlationData = computed(() => insightsStore.correlationData)
    const campaignsData = computed(() => insightsStore.campaignsData)

    const heatmapMetrics = computed(() => [
      { title: 'ROI', value: 'roi' },
      { title: 'Конверсии', value: 'conversions' },
      { title: 'CTR', value: 'ctr' },
      { title: 'CPA', value: 'cpa' }
    ])

    const tableHeaders = computed(() => [
      { title: 'Кампания', key: 'name', sortable: true },
      { title: 'Канал', key: 'channel', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'ROI', key: 'roi', sortable: true },
      { title: 'Доход', key: 'revenue', sortable: true },
      { title: 'Затраты', key: 'cost', sortable: true },
      { title: 'Конверсии', key: 'conversions', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false }
    ])

    const filteredCampaigns = computed(() => {
      let filtered = [...campaignsData.value]

      if (selectedChannel.value) {
        filtered = filtered.filter(c => c.channel === selectedChannel.value)
      }
      if (selectedProduct.value) {
        filtered = filtered.filter(c => c.product === selectedProduct.value)
      }
      if (selectedRegion.value) {
        filtered = filtered.filter(c => c.region === selectedRegion.value)
      }

      return filtered
    })

    // Methods
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(value)
    }

    const formatPercent = (value) => {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
    }

    const formatNumber = (value) => {
      return new Intl.NumberFormat('ru-RU').format(value)
    }

    const getStatusColor = (status) => {
      const colors = {
        'active': 'success',
        'paused': 'warning',
        'completed': 'primary',
        'draft': 'grey'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        'active': 'Активна',
        'paused': 'Приостановлена',
        'completed': 'Завершена',
        'draft': 'Черновик'
      }
      return texts[status] || status
    }

    const getRoiColor = (roi) => {
      if (roi > 20) return 'text-success'
      if (roi > 0) return 'text-primary'
      return 'text-error'
    }

    const onFiltersChange = () => {
      insightsStore.setPerformanceFilters({
        channel: selectedChannel.value,
        product: selectedProduct.value,
        region: selectedRegion.value
      })
    }

    const onKPIClick = (kpi) => {
      console.log('KPI clicked:', kpi)
      // TODO: Показать детали KPI
    }

    const onHeatmapMetricChange = (metric) => {
      insightsStore.loadHeatmapData(metric)
    }

    const onHeatmapCellClick = (cell) => {
      console.log('Heatmap cell clicked:', cell)
      // TODO: Показать детали ячейки
    }

    const onCorrelationClick = (correlation) => {
      console.log('Correlation clicked:', correlation)
      // TODO: Показать детали корреляции
    }

    const onSearchChange = (query) => {
      // Поиск обрабатывается автоматически v-data-table
    }

    const onRowClick = (event, row) => {
      viewCampaignDetails(row.item)
    }

    const viewCampaignDetails = (campaign) => {
      selectedCampaign.value = campaign
      showDetailsDialog.value = true
    }

    const editCampaign = (campaign) => {
      router.push({
        name: 'Activities',
        query: { edit: campaign.id }
      })
    }

    const openInActivities = () => {
      router.push({
        name: 'Activities',
        query: { campaign_id: selectedCampaign.value.id }
      })
      showDetailsDialog.value = false
    }

    const exportTable = async () => {
      try {
        isExporting.value = true
        await insightsStore.exportCampaignsData({
          format: 'xlsx',
          filters: {
            channel: selectedChannel.value,
            product: selectedProduct.value,
            region: selectedRegion.value
          }
        })
      } catch (error) {
        console.error('Export error:', error)
      } finally {
        isExporting.value = false
      }
    }

    // Watchers
    watch(performanceMetric, (newMetric) => {
      insightsStore.loadPerformanceTimeData(newMetric)
    })

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        insightsStore.loadPerformanceKPIs(),
        insightsStore.loadPerformanceTimeData(performanceMetric.value),
        insightsStore.loadChannelPerformance(),
        insightsStore.loadHeatmapData(heatmapMetric.value),
        insightsStore.loadCorrelationData(),
        insightsStore.loadCampaignsData(),
        insightsStore.loadFilterOptions()
      ])
    })

    return {
      // State
      selectedChannel,
      selectedProduct,
      selectedRegion,
      performanceMetric,
      heatmapMetric,
      searchQuery,
      showDetailsDialog,
      selectedCampaign,
      isExporting,

      // Computed
      isLoading,
      channels,
      products,
      regions,
      performanceKPIs,
      performanceTimeData,
      channelPerformance,
      heatmapData,
      correlationData,
      heatmapMetrics,
      tableHeaders,
      filteredCampaigns,

      // Methods
      formatCurrency,
      formatPercent,
      formatNumber,
      getStatusColor,
      getStatusText,
      getRoiColor,
      onFiltersChange,
      onKPIClick,
      onHeatmapMetricChange,
      onHeatmapCellClick,
      onCorrelationClick,
      onSearchChange,
      onRowClick,
      viewCampaignDetails,
      editCampaign,
      openInActivities,
      exportTable
    }
  }
}
</script>

<style scoped>
.performance-dashboard {
  height: 100%;
  overflow-y: auto;
}

.v-card {
  height: 100%;
}

.v-data-table >>> tbody tr {
  cursor: pointer;
}

.v-data-table >>> tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>