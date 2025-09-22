<template>
  <div class="roi-dashboard">
    <!-- ROI KPI -->
    <v-row class="mb-6">
      <v-col
        cols="12"
        md="3"
        sm="6"
        v-for="kpi in roiKPIs"
        :key="kpi.id"
      >
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

    <!-- Главные графики -->
    <v-row class="mb-6">
      <!-- ROI по времени -->
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-trending-up</v-icon>
            Динамика ROI по каналам
            <v-spacer />
            <v-btn-toggle
              v-model="roiPeriod"
              mandatory
              size="small"
              variant="outlined"
            >
              <v-btn value="week">Неделя</v-btn>
              <v-btn value="month">Месяц</v-btn>
              <v-btn value="quarter">Квартал</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 400px;">
            <TrendChart
              :data="roiTimeData"
              :loading="isLoading"
              type="line"
              multi-series
              :period="roiPeriod"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ROI распределение -->
      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-donut</v-icon>
            Распределение ROI
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 400px;">
            <ComparisonChart
              :data="roiDistribution"
              :loading="isLoading"
              type="donut"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Анализ и таблицы -->
    <v-row class="mb-6">
      <!-- ROI vs Затраты -->
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-scatter-plot</v-icon>
            ROI vs Затраты
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 350px;">
            <div ref="scatterChart" class="chart-container" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Топ кампании по ROI -->
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-trophy</v-icon>
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
                  v-for="(campaign, index) in topROICampaigns"
                  :key="campaign.id"
                  @click="viewCampaignROI(campaign)"
                >
                  <template #prepend>
                    <v-avatar
                      :color="getRankColor(index)"
                      size="32"
                    >
                      {{ index + 1 }}
                    </v-avatar>
                  </template>

                  <v-list-item-title>{{ campaign.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ campaign.channel }} • {{ formatCurrency(campaign.cost) }}
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="text-end">
                      <div
                        class="text-h6"
                        :class="getRoiColor(campaign.roi)"
                      >
                        {{ formatPercent(campaign.roi) }}
                      </div>
                      <div class="text-caption text-success">
                        +{{ formatCurrency(campaign.profit) }}
                      </div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Детальная таблица ROI -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-table</v-icon>
            Детализация ROI по кампаниям
            <v-spacer />
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск"
              variant="outlined"
              density="compact"
              style="width: 300px"
              clearable
            />
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-data-table
              :headers="roiTableHeaders"
              :items="roiTableData"
              :loading="isLoading"
              :search="searchQuery"
              item-key="id"
              :items-per-page="15"
            >
              <!-- ROI с цветовой индикацией -->
              <template #item.roi="{ item }">
                <v-chip
                  :color="getRoiChipColor(item.roi)"
                  size="small"
                  variant="flat"
                >
                  {{ formatPercent(item.roi) }}
                </v-chip>
              </template>

              <!-- Затраты -->
              <template #item.cost="{ item }">
                {{ formatCurrency(item.cost) }}
              </template>

              <!-- Доход -->
              <template #item.revenue="{ item }">
                {{ formatCurrency(item.revenue) }}
              </template>

              <!-- Прибыль -->
              <template #item.profit="{ item }">
                <span :class="item.profit > 0 ? 'text-success' : 'text-error'">
                  {{ formatCurrency(item.profit) }}
                </span>
              </template>

              <!-- ROAS -->
              <template #item.roas="{ item }">
                {{ item.roas.toFixed(2) }}x
              </template>

              <!-- Действия -->
              <template #item.actions="{ item }">
                <v-btn
                  size="small"
                  variant="text"
                  icon
                  @click="viewCampaignROI(item)"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn
                  size="small"
                  variant="text"
                  icon
                  @click="optimizeROI(item)"
                >
                  <v-icon>mdi-tune</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог оптимизации ROI -->
    <v-dialog
      v-model="showOptimizationDialog"
      max-width="800"
    >
      <v-card v-if="selectedCampaign">
        <v-card-title>
          <v-icon class="me-2">mdi-tune</v-icon>
          Оптимизация ROI: {{ selectedCampaign.name }}
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <div class="optimization-section">
                <h4 class="mb-4">Текущие показатели</h4>
                <div class="metric-row">
                  <span>Текущий ROI:</span>
                  <strong :class="getRoiColor(selectedCampaign.roi)">
                    {{ formatPercent(selectedCampaign.roi) }}
                  </strong>
                </div>
                <div class="metric-row">
                  <span>Затраты:</span>
                  <strong>{{ formatCurrency(selectedCampaign.cost) }}</strong>
                </div>
                <div class="metric-row">
                  <span>Доход:</span>
                  <strong>{{ formatCurrency(selectedCampaign.revenue) }}</strong>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="optimization-section">
                <h4 class="mb-4">Рекомендации</h4>
                <v-alert
                  v-for="recommendation in getOptimizationRecommendations(selectedCampaign)"
                  :key="recommendation.id"
                  :type="recommendation.type"
                  variant="tonal"
                  class="mb-2"
                >
                  <div class="recommendation-title">{{ recommendation.title }}</div>
                  <div class="recommendation-description">
                    {{ recommendation.description }}
                  </div>
                  <div class="recommendation-impact">
                    Ожидаемое улучшение ROI: <strong>{{ recommendation.expectedImprovement }}</strong>
                  </div>
                </v-alert>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showOptimizationDialog = false">Закрыть</v-btn>
          <v-btn
            color="primary"
            @click="applyOptimization"
          >
            Применить рекомендации
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useInsightsStore } from '@/stores/insightsStore'
import KPIWidget from '../widgets/KPIWidget.vue'
import TrendChart from '../charts/TrendChart.vue'
import ComparisonChart from '../charts/ComparisonChart.vue'

export default {
  name: 'ROIDashboard',
  components: {
    KPIWidget,
    TrendChart,
    ComparisonChart
  },
  setup() {
    const insightsStore = useInsightsStore()

    // Reactive state
    const roiPeriod = ref('month')
    const searchQuery = ref('')
    const showOptimizationDialog = ref(false)
    const selectedCampaign = ref(null)

    // Computed properties
    const isLoading = computed(() => insightsStore.isLoading)

    const roiKPIs = computed(() => [
      {
        id: 'avg_roi',
        title: 'Средний ROI',
        value: insightsStore.averageROI,
        format: 'percent',
        trend: { value: 8.3, direction: 'up' },
        icon: 'mdi-trending-up',
        color: 'success'
      },
      {
        id: 'best_roi',
        title: 'Лучший ROI',
        value: insightsStore.bestROI,
        format: 'percent',
        trend: { value: 15.2, direction: 'up' },
        icon: 'mdi-trophy',
        color: 'primary'
      },
      {
        id: 'total_profit',
        title: 'Общая прибыль',
        value: insightsStore.totalProfit,
        format: 'currency',
        trend: { value: 22.1, direction: 'up' },
        icon: 'mdi-cash-plus',
        color: 'success'
      },
      {
        id: 'profitable_campaigns',
        title: 'Прибыльные кампании',
        value: insightsStore.profitableCampaigns,
        format: 'number',
        trend: { value: 3, direction: 'up' },
        icon: 'mdi-chart-line',
        color: 'info'
      }
    ])

    const roiTimeData = computed(() => insightsStore.roiTimeData)
    const roiDistribution = computed(() => insightsStore.roiDistribution)
    const topROICampaigns = computed(() => insightsStore.topROICampaigns)
    const roiTableData = computed(() => insightsStore.roiTableData)

    const roiTableHeaders = computed(() => [
      { title: 'Кампания', key: 'name', sortable: true },
      { title: 'Канал', key: 'channel', sortable: true },
      { title: 'ROI', key: 'roi', sortable: true },
      { title: 'Затраты', key: 'cost', sortable: true },
      { title: 'Доход', key: 'revenue', sortable: true },
      { title: 'Прибыль', key: 'profit', sortable: true },
      { title: 'ROAS', key: 'roas', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false }
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

    const getRankColor = (index) => {
      if (index === 0) return 'success'
      if (index === 1) return 'primary'
      if (index === 2) return 'warning'
      return 'grey'
    }

    const getRoiColor = (roi) => {
      if (roi > 20) return 'text-success'
      if (roi > 0) return 'text-primary'
      return 'text-error'
    }

    const getRoiChipColor = (roi) => {
      if (roi > 20) return 'success'
      if (roi > 0) return 'primary'
      return 'error'
    }

    const viewCampaignROI = (campaign) => {
      console.log('View campaign ROI:', campaign)
      // TODO: Открыть детальный анализ ROI кампании
    }

    const optimizeROI = (campaign) => {
      selectedCampaign.value = campaign
      showOptimizationDialog.value = true
    }

    const getOptimizationRecommendations = (campaign) => {
      const recommendations = []

      if (campaign.roi < 10) {
        recommendations.push({
          id: 'low_roi',
          type: 'warning',
          title: 'Низкий ROI',
          description: 'Рекомендуется пересмотреть таргетинг и оптимизировать ключевые слова',
          expectedImprovement: '+5-15%'
        })
      }

      if (campaign.ctr < 2) {
        recommendations.push({
          id: 'low_ctr',
          type: 'info',
          title: 'Низкий CTR',
          description: 'Попробуйте улучшить креативы и заголовки объявлений',
          expectedImprovement: '+3-8%'
        })
      }

      if (campaign.cpa > 1000) {
        recommendations.push({
          id: 'high_cpa',
          type: 'error',
          title: 'Высокий CPA',
          description: 'Сузьте таргетинг или увеличьте ставки на высококонвертирующие ключевые слова',
          expectedImprovement: '+10-20%'
        })
      }

      return recommendations
    }

    const applyOptimization = () => {
      console.log('Apply optimization for:', selectedCampaign.value)
      showOptimizationDialog.value = false
      // TODO: Применить рекомендации по оптимизации
    }

    // Lifecycle
    onMounted(async () => {
      await Promise.all([
        insightsStore.loadROIKPIs(),
        insightsStore.loadROITimeData(roiPeriod.value),
        insightsStore.loadROIDistribution(),
        insightsStore.loadTopROICampaigns(),
        insightsStore.loadROITableData()
      ])
    })

    return {
      // State
      roiPeriod,
      searchQuery,
      showOptimizationDialog,
      selectedCampaign,

      // Computed
      isLoading,
      roiKPIs,
      roiTimeData,
      roiDistribution,
      topROICampaigns,
      roiTableData,
      roiTableHeaders,

      // Methods
      formatCurrency,
      formatPercent,
      getRankColor,
      getRoiColor,
      getRoiChipColor,
      viewCampaignROI,
      optimizeROI,
      getOptimizationRecommendations,
      applyOptimization
    }
  }
}
</script>

<style scoped>
.roi-dashboard {
  height: 100%;
  overflow-y: auto;
}

.optimization-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 4px 0;
  border-bottom: 1px solid #e0e0e0;
}

.recommendation-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.recommendation-description {
  margin-bottom: 8px;
  font-size: 14px;
}

.recommendation-impact {
  font-size: 13px;
  font-style: italic;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>