<template>
  <div class="main-dashboard">
    <!-- Основные KPI -->
    <v-row class="mb-6">
      <v-col cols="12" md="3" sm="6" v-for="kpi in mainKPIs" :key="kpi.id">
        <KPIWidget
          :title="kpi.title"
          :value="kpi.value"
          :format="kpi.format"
          :trend="kpi.trend"
          :icon="kpi.icon"
          :color="kpi.color"
          :loading="isLoading"
        />
      </v-col>
    </v-row>

    <!-- Графики и аналитика -->
    <v-row class="mb-6">
      <!-- Тренды доходов -->
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-line</v-icon>
            Тренды доходов и ROI
            <v-spacer />
            <v-btn-toggle v-model="revenueChartPeriod" mandatory size="small" variant="outlined">
              <v-btn value="month">Месяц</v-btn>
              <v-btn value="quarter">Квартал</v-btn>
              <v-btn value="year">Год</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 350px;">
            <TrendChart
              :data="revenueData"
              :loading="isLoading"
              type="line"
              :period="revenueChartPeriod"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Сводка по каналам -->
      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-donut</v-icon>
            Распределение по каналам
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 350px;">
            <ComparisonChart
              :data="channelData"
              :loading="isLoading"
              type="donut"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Детальная аналитика -->
    <v-row class="mb-6">
      <!-- Воронка конверсии -->
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-filter-variant</v-icon>
            Воронка конверсии
            <v-spacer />
            <v-btn
              size="small"
              variant="outlined"
              @click="showFunnelDetails"
            >
              Подробнее
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 400px;">
            <FunnelWidget
              :data="funnelData"
              :loading="isLoading"
              @stage-click="onFunnelStageClick"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- География -->
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-map</v-icon>
            География продаж
            <v-spacer />
            <v-select
              v-model="geoMetric"
              :items="geoMetrics"
              variant="outlined"
              density="compact"
              style="width: 150px"
              @update:modelValue="onGeoMetricChange"
            />
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 400px;">
            <GeographyWidget
              :data="geoData"
              :metric="geoMetric"
              :loading="isLoading"
              @region-click="onRegionClick"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Топ кампании и активности -->
    <v-row>
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-star</v-icon>
            Топ кампании по ROI
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div v-if="isLoading" class="text-center py-8">
              <v-progress-circular indeterminate />
            </div>
            <div v-else>
              <v-list>
                <v-list-item
                  v-for="(campaign, index) in topCampaigns"
                  :key="campaign.id"
                  @click="viewCampaignDetails(campaign)"
                >
                  <template v-slot:prepend>
                    <v-avatar
                      :color="index < 3 ? 'primary' : 'grey-lighten-1'"
                      size="32"
                    >
                      {{ index + 1 }}
                    </v-avatar>
                  </template>

                  <v-list-item-title>{{ campaign.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ campaign.channel }} • {{ formatCurrency(campaign.revenue) }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="text-end">
                      <div class="text-h6" :class="campaign.roi > 0 ? 'text-success' : 'text-error'">
                        {{ formatPercent(campaign.roi) }}
                      </div>
                      <div class="text-caption text-medium-emphasis">ROI</div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-trending-up</v-icon>
            Быстрорастущие сегменты
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div v-if="isLoading" class="text-center py-8">
              <v-progress-circular indeterminate />
            </div>
            <div v-else>
              <v-list>
                <v-list-item
                  v-for="segment in growingSegments"
                  :key="segment.id"
                  @click="viewSegmentDetails(segment)"
                >
                  <template v-slot:prepend>
                    <v-icon :color="segment.growth > 20 ? 'success' : 'primary'">
                      mdi-trending-up
                    </v-icon>
                  </template>

                  <v-list-item-title>{{ segment.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ segment.category }} • {{ segment.customers }} клиентов
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="text-end">
                      <v-chip
                        :color="segment.growth > 20 ? 'success' : 'primary'"
                        size="small"
                      >
                        +{{ formatPercent(segment.growth) }}
                      </v-chip>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Модальные окна для детального просмотра -->
    <v-dialog v-model="showCampaignDialog" max-width="800">
      <v-card v-if="selectedCampaign">
        <v-card-title>
          <v-icon class="me-2">mdi-bullhorn</v-icon>
          {{ selectedCampaign.name }}
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <div class="text-subtitle-2 text-medium-emphasis mb-1">Канал</div>
              <div class="text-body-1">{{ selectedCampaign.channel }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-subtitle-2 text-medium-emphasis mb-1">Период</div>
              <div class="text-body-1">{{ selectedCampaign.period }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-subtitle-2 text-medium-emphasis mb-1">Доход</div>
              <div class="text-h6 text-success">{{ formatCurrency(selectedCampaign.revenue) }}</div>
            </v-col>
            <v-col cols="6">
              <div class="text-subtitle-2 text-medium-emphasis mb-1">ROI</div>
              <div class="text-h6" :class="selectedCampaign.roi > 0 ? 'text-success' : 'text-error'">
                {{ formatPercent(selectedCampaign.roi) }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCampaignDialog = false">Закрыть</v-btn>
          <v-btn color="primary" @click="openCampaignInActivities">
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
import FunnelWidget from '../widgets/FunnelWidget.vue'
import GeographyWidget from '../widgets/GeographyWidget.vue'

export default {
  name: 'MainDashboard',
  components: {
    KPIWidget,
    TrendChart,
    ComparisonChart,
    FunnelWidget,
    GeographyWidget
  },
  setup() {
    const insightsStore = useInsightsStore()
    const router = useRouter()

    // Reactive state
    const revenueChartPeriod = ref('month')
    const geoMetric = ref('revenue')
    const showCampaignDialog = ref(false)
    const selectedCampaign = ref(null)

    // Computed properties
    const isLoading = computed(() => insightsStore.isLoading)

    const mainKPIs = computed(() => [
      {
        id: 'total_revenue',
        title: 'Общий доход',
        value: insightsStore.totalRevenue,
        format: 'currency',
        trend: { value: 12.5, direction: 'up' },
        icon: 'mdi-currency-rub',
        color: 'success'
      },
      {
        id: 'total_roi',
        title: 'Средний ROI',
        value: insightsStore.averageROI,
        format: 'percent',
        trend: { value: 8.3, direction: 'up' },
        icon: 'mdi-trending-up',
        color: 'primary'
      },
      {
        id: 'conversion_rate',
        title: 'Конверсия',
        value: insightsStore.conversionRate,
        format: 'percent',
        trend: { value: -2.1, direction: 'down' },
        icon: 'mdi-target',
        color: 'warning'
      },
      {
        id: 'active_campaigns',
        title: 'Активные кампании',
        value: insightsStore.activeCampaigns,
        format: 'number',
        trend: { value: 15, direction: 'up' },
        icon: 'mdi-bullhorn',
        color: 'info'
      }
    ])

    const revenueData = computed(() => insightsStore.revenueData)
    const channelData = computed(() => insightsStore.channelData)
    const funnelData = computed(() => insightsStore.funnelData)
    const geoData = computed(() => insightsStore.geoData)
    const topCampaigns = computed(() => insightsStore.topCampaigns)
    const growingSegments = computed(() => insightsStore.growingSegments)

    const geoMetrics = computed(() => [
      { title: 'Доход', value: 'revenue' },
      { title: 'Конверсии', value: 'conversions' },
      { title: 'Клики', value: 'clicks' },
      { title: 'Показы', value: 'impressions' }
    ])

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

    const onFunnelStageClick = (stage) => {
      console.log('Clicked funnel stage:', stage)
      // TODO: Показать детали этапа воронки
    }

    const onRegionClick = (region) => {
      console.log('Clicked region:', region)
      // TODO: Показать детали региона
    }

    const onGeoMetricChange = (metric) => {
      insightsStore.loadGeoData(metric)
    }

    const showFunnelDetails = () => {
      // TODO: Открыть детальный анализ воронки
      console.log('Show funnel details')
    }

    const viewCampaignDetails = (campaign) => {
      selectedCampaign.value = campaign
      showCampaignDialog.value = true
    }

    const viewSegmentDetails = (segment) => {
      console.log('View segment details:', segment)
      // TODO: Открыть детали сегмента
    }

    const openCampaignInActivities = () => {
      router.push({
        name: 'Activities',
        query: { campaign_id: selectedCampaign.value.id }
      })
      showCampaignDialog.value = false
    }

    // Watchers
    watch(revenueChartPeriod, (newPeriod) => {
      insightsStore.loadRevenueData(newPeriod)
    })

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        insightsStore.loadMainKPIs(),
        insightsStore.loadRevenueData(revenueChartPeriod.value),
        insightsStore.loadChannelData(),
        insightsStore.loadFunnelData(),
        insightsStore.loadGeoData(geoMetric.value),
        insightsStore.loadTopCampaigns(),
        insightsStore.loadGrowingSegments()
      ])
    })

    return {
      // State
      revenueChartPeriod,
      geoMetric,
      showCampaignDialog,
      selectedCampaign,

      // Computed
      isLoading,
      mainKPIs,
      revenueData,
      channelData,
      funnelData,
      geoData,
      topCampaigns,
      growingSegments,
      geoMetrics,

      // Methods
      formatCurrency,
      formatPercent,
      onFunnelStageClick,
      onRegionClick,
      onGeoMetricChange,
      showFunnelDetails,
      viewCampaignDetails,
      viewSegmentDetails,
      openCampaignInActivities
    }
  }
}
</script>

<style scoped>
.main-dashboard {
  height: 100%;
  overflow-y: auto;
}

.v-card {
  height: 100%;
}

.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>