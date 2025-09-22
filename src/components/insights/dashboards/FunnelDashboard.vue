<template>
  <div class="funnel-dashboard">
    <!-- Заголовок и фильтры -->
    <div class="d-flex align-center mb-6">
      <div class="dashboard-title">
        <h2 class="text-h5 font-weight-bold">Воронка конверсии</h2>
        <p class="text-body-2 text-medium-emphasis">
          Анализ эффективности воронки продаж и конверсий
        </p>
      </div>
      <v-spacer />

      <!-- Фильтры -->
      <v-select
        v-model="selectedFunnel"
        :items="funnelTypes"
        label="Тип воронки"
        variant="outlined"
        density="compact"
        style="width: 200px"
        class="me-4"
        @update:modelValue="loadFunnelData"
      />

      <v-select
        v-model="selectedTimeframe"
        :items="timeframes"
        label="Период"
        variant="outlined"
        density="compact"
        style="width: 180px"
        @update:modelValue="loadFunnelData"
      />
    </div>

    <!-- KPI карточки -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <KPIWidget
          title="Общая конверсия"
          :value="overallConversion"
          format="percentage"
          :trend="overallConversionTrend"
          icon="mdi-chart-line"
          color="primary"
        />
      </v-col>
      <v-col cols="12" md="3">
        <KPIWidget
          title="Всего лидов"
          :value="totalLeads"
          format="number"
          :trend="totalLeadsTrend"
          icon="mdi-account-group"
          color="info"
        />
      </v-col>
      <v-col cols="12" md="3">
        <KPIWidget
          title="Время конверсии"
          :value="averageConversionTime"
          format="time"
          :trend="conversionTimeTrend"
          icon="mdi-clock"
          color="warning"
        />
      </v-col>
      <v-col cols="12" md="3">
        <KPIWidget
          title="Ценность лида"
          :value="averageLeadValue"
          format="currency"
          :trend="leadValueTrend"
          icon="mdi-currency-rub"
          color="success"
        />
      </v-col>
    </v-row>

    <!-- Основная воронка -->
    <v-row class="mb-6">
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-filter-variant</v-icon>
            Воронка конверсии
          </v-card-title>
          <v-card-text>
            <FunnelWidget
              :data="funnelData"
              :loading="isLoading"
              @stage-click="onStageClick"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-chart-pie</v-icon>
            Распределение по каналам
          </v-card-title>
          <v-card-text>
            <TrendChart
              :data="channelDistribution"
              type="pie"
              :height="300"
              :loading="isLoading"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Анализ конверсий по этапам -->
    <v-row class="mb-6">
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-trending-up</v-icon>
            Динамика конверсий
          </v-card-title>
          <v-card-text>
            <TrendChart
              :data="conversionTrends"
              type="line"
              :height="300"
              :loading="isLoading"
              :options="{ yAxis: { axisLabel: { formatter: '{value}%' } } }"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-speedometer</v-icon>
            Скорость конверсии
          </v-card-title>
          <v-card-text>
            <TrendChart
              :data="conversionSpeed"
              type="bar"
              :height="300"
              :loading="isLoading"
              :options="{ yAxis: { axisLabel: { formatter: '{value} дней' } } }"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Тепловая карта и отток -->
    <v-row class="mb-6">
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-grid</v-icon>
            Тепловая карта конверсий
          </v-card-title>
          <v-card-text>
            <HeatmapWidget
              :data="conversionHeatmap"
              metric="conversion_rate"
              color-scheme="green"
              :loading="isLoading"
              @cell-click="onHeatmapClick"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-account-off</v-icon>
            Точки оттока
          </v-card-title>
          <v-card-text>
            <div class="drop-off-analysis">
              <div
                v-for="stage in dropOffStages"
                :key="stage.name"
                class="drop-off-item"
                :class="`drop-off-${stage.severity}`"
              >
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="font-weight-medium">{{ stage.name }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ stage.description }}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-h6 font-weight-bold" :class="`text-${stage.color}`">
                      {{ stage.dropOffRate }}%
                    </div>
                    <div class="text-caption">
                      {{ stage.lostLeads }} лидов
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Рекомендации по оптимизации -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-lightbulb</v-icon>
            Рекомендации по оптимизации
          </v-card-title>
          <v-card-text>
            <div class="recommendations-grid">
              <div
                v-for="recommendation in recommendations"
                :key="recommendation.id"
                class="recommendation-card"
                :class="`recommendation-${recommendation.priority}`"
              >
                <div class="d-flex">
                  <v-icon
                    :color="recommendation.iconColor"
                    class="me-3"
                    size="24"
                  >
                    {{ recommendation.icon }}
                  </v-icon>
                  <div class="flex-grow-1">
                    <div class="font-weight-medium mb-1">
                      {{ recommendation.title }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis mb-2">
                      {{ recommendation.description }}
                    </div>
                    <div class="d-flex align-center justify-space-between">
                      <v-chip
                        :color="recommendation.impactColor"
                        size="small"
                        variant="tonal"
                      >
                        Потенциал: +{{ recommendation.impact }}%
                      </v-chip>
                      <v-btn
                        size="small"
                        variant="text"
                        @click="onRecommendationClick(recommendation)"
                      >
                        Подробнее
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог детализации этапа -->
    <v-dialog v-model="showStageDialog" max-width="800">
      <v-card v-if="selectedStage">
        <v-card-title>
          Детализация этапа: {{ selectedStage.name }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <div class="text-subtitle-2 mb-2">Основные метрики</div>
              <div class="metrics-list">
                <div class="metric-item">
                  <span>Входящие лиды:</span>
                  <strong>{{ selectedStage.incoming?.toLocaleString() }}</strong>
                </div>
                <div class="metric-item">
                  <span>Конверсия:</span>
                  <strong>{{ selectedStage.conversionRate }}%</strong>
                </div>
                <div class="metric-item">
                  <span>Время этапа:</span>
                  <strong>{{ selectedStage.duration }} дней</strong>
                </div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-subtitle-2 mb-2">Анализ оттока</div>
              <div class="drop-reasons">
                <div
                  v-for="reason in selectedStage.dropReasons"
                  :key="reason.name"
                  class="reason-item"
                >
                  <div class="d-flex justify-space-between">
                    <span>{{ reason.name }}</span>
                    <strong>{{ reason.percentage }}%</strong>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showStageDialog = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useInsightsStore } from '@/stores/insightsStore'
import KPIWidget from '../widgets/KPIWidget.vue'
import FunnelWidget from '../widgets/FunnelWidget.vue'
import TrendChart from '../charts/TrendChart.vue'
import HeatmapWidget from '../widgets/HeatmapWidget.vue'

export default {
  name: 'FunnelDashboard',
  components: {
    KPIWidget,
    FunnelWidget,
    TrendChart,
    HeatmapWidget
  },
  setup() {
    const insightsStore = useInsightsStore()

    // Reactive state
    const selectedFunnel = ref('lead_to_sale')
    const selectedTimeframe = ref('last_30_days')
    const showStageDialog = ref(false)
    const selectedStage = ref(null)

    // Computed properties
    const isLoading = computed(() => insightsStore.isLoading)

    const funnelTypes = computed(() => [
      { title: 'Лид → Продажа', value: 'lead_to_sale' },
      { title: 'Посещение → Лид', value: 'visit_to_lead' },
      { title: 'Клик → Покупка', value: 'click_to_purchase' },
      { title: 'Полная воронка', value: 'full_funnel' }
    ])

    const timeframes = computed(() => [
      { title: 'Последние 7 дней', value: 'last_7_days' },
      { title: 'Последние 30 дней', value: 'last_30_days' },
      { title: 'Последние 90 дней', value: 'last_90_days' },
      { title: 'Этот месяц', value: 'current_month' }
    ])

    // KPI metrics
    const overallConversion = computed(() => 12.5)
    const overallConversionTrend = computed(() => ({ value: 2.3, isPositive: true }))
    const totalLeads = computed(() => 15420)
    const totalLeadsTrend = computed(() => ({ value: 8.1, isPositive: true }))
    const averageConversionTime = computed(() => 14)
    const conversionTimeTrend = computed(() => ({ value: 1.2, isPositive: false }))
    const averageLeadValue = computed(() => 45200)
    const leadValueTrend = computed(() => ({ value: 4.7, isPositive: true }))

    // Funnel data
    const funnelData = computed(() => ({
      stages: [
        { name: 'Посетители', value: 125000, percentage: 100 },
        { name: 'Лиды', value: 15420, percentage: 12.3 },
        { name: 'Квалифицированные', value: 8750, percentage: 56.7 },
        { name: 'Возможности', value: 3200, percentage: 36.6 },
        { name: 'Предложения', value: 1800, percentage: 56.3 },
        { name: 'Закрытые сделки', value: 950, percentage: 52.8 }
      ]
    }))

    // Chart data
    const channelDistribution = computed(() => ({
      series: [{
        name: 'Лиды по каналам',
        type: 'pie',
        data: [
          { name: 'Органический поиск', value: 4200 },
          { name: 'Платная реклама', value: 3800 },
          { name: 'Соцсети', value: 2900 },
          { name: 'Email-маркетинг', value: 2100 },
          { name: 'Прямые переходы', value: 1800 },
          { name: 'Партнеры', value: 620 }
        ]
      }]
    }))

    const conversionTrends = computed(() => ({
      xAxis: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
      series: [
        {
          name: 'Лид → Квал.',
          type: 'line',
          data: [52, 58, 56, 61, 59, 57]
        },
        {
          name: 'Квал. → Возм.',
          type: 'line',
          data: [34, 36, 38, 37, 35, 37]
        },
        {
          name: 'Возм. → Сделка',
          type: 'line',
          data: [48, 52, 55, 53, 56, 53]
        }
      ]
    }))

    const conversionSpeed = computed(() => ({
      xAxis: ['Лид → Квал.', 'Квал. → Возм.', 'Возм. → Предл.', 'Предл. → Сделка'],
      series: [{
        name: 'Дни',
        type: 'bar',
        data: [3.2, 7.8, 12.5, 8.9]
      }]
    }))

    const conversionHeatmap = computed(() => [
      { row: 'Email', column: 'Понедельник', value: 0.15 },
      { row: 'Email', column: 'Вторник', value: 0.18 },
      { row: 'Email', column: 'Среда', value: 0.22 },
      { row: 'Email', column: 'Четверг', value: 0.19 },
      { row: 'Email', column: 'Пятница', value: 0.12 },
      { row: 'PPC', column: 'Понедельник', value: 0.08 },
      { row: 'PPC', column: 'Вторник', value: 0.11 },
      { row: 'PPC', column: 'Среда', value: 0.14 },
      { row: 'PPC', column: 'Четверг', value: 0.13 },
      { row: 'PPC', column: 'Пятница', value: 0.09 },
      { row: 'Органика', column: 'Понедельник', value: 0.06 },
      { row: 'Органика', column: 'Вторник', value: 0.07 },
      { row: 'Органика', column: 'Среда', value: 0.09 },
      { row: 'Органика', column: 'Четверг', value: 0.08 },
      { row: 'Органика', column: 'Пятница', value: 0.05 }
    ])

    const dropOffStages = computed(() => [
      {
        name: 'Лид → Квалификация',
        description: 'Высокий отток неквалифицированных лидов',
        dropOffRate: 43.3,
        lostLeads: 6670,
        severity: 'high',
        color: 'error'
      },
      {
        name: 'Возможность → Предложение',
        description: 'Потеря интереса на этапе переговоров',
        dropOffRate: 43.7,
        lostLeads: 1400,
        severity: 'high',
        color: 'error'
      },
      {
        name: 'Предложение → Сделка',
        description: 'Конкуренция и ценовые факторы',
        dropOffRate: 47.2,
        lostLeads: 850,
        severity: 'medium',
        color: 'warning'
      }
    ])

    const recommendations = computed(() => [
      {
        id: 1,
        title: 'Улучшить квалификацию лидов',
        description: 'Внедрить скоринговую модель для лучшей оценки качества лидов',
        impact: 15,
        priority: 'high',
        icon: 'mdi-target',
        iconColor: 'error',
        impactColor: 'success'
      },
      {
        id: 2,
        title: 'Автоматизировать нутуринг',
        description: 'Создать персонализированные email-последовательности',
        impact: 22,
        priority: 'high',
        icon: 'mdi-email-fast',
        iconColor: 'primary',
        impactColor: 'success'
      },
      {
        id: 3,
        title: 'Оптимизировать ценообразование',
        description: 'Пересмотреть стратегию ценообразования для повышения конверсии',
        impact: 8,
        priority: 'medium',
        icon: 'mdi-currency-rub',
        iconColor: 'warning',
        impactColor: 'info'
      }
    ])

    // Methods
    const loadFunnelData = async () => {
      // Load funnel data based on selected filters
      console.log('Loading funnel data:', {
        funnel: selectedFunnel.value,
        timeframe: selectedTimeframe.value
      })
    }

    const onStageClick = (stage) => {
      selectedStage.value = {
        ...stage,
        incoming: stage.value,
        duration: Math.floor(Math.random() * 10) + 5,
        dropReasons: [
          { name: 'Неподходящий продукт', percentage: 35 },
          { name: 'Высокая цена', percentage: 28 },
          { name: 'Конкуренты', percentage: 22 },
          { name: 'Нет бюджета', percentage: 15 }
        ]
      }
      showStageDialog.value = true
    }

    const onHeatmapClick = (data) => {
      console.log('Heatmap cell clicked:', data)
    }

    const onRecommendationClick = (recommendation) => {
      console.log('Recommendation clicked:', recommendation)
    }

    // Lifecycle
    onMounted(() => {
      loadFunnelData()
    })

    return {
      // State
      selectedFunnel,
      selectedTimeframe,
      showStageDialog,
      selectedStage,

      // Computed
      isLoading,
      funnelTypes,
      timeframes,
      overallConversion,
      overallConversionTrend,
      totalLeads,
      totalLeadsTrend,
      averageConversionTime,
      conversionTimeTrend,
      averageLeadValue,
      leadValueTrend,
      funnelData,
      channelDistribution,
      conversionTrends,
      conversionSpeed,
      conversionHeatmap,
      dropOffStages,
      recommendations,

      // Methods
      loadFunnelData,
      onStageClick,
      onHeatmapClick,
      onRecommendationClick
    }
  }
}
</script>

<style scoped>
.funnel-dashboard {
  padding: 24px;
}

.dashboard-title {
  flex: 1;
}

.drop-off-analysis {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drop-off-item {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.drop-off-high {
  background: #ffebee;
  border-left-color: #d32f2f;
}

.drop-off-medium {
  background: #fff8e1;
  border-left-color: #f57c00;
}

.drop-off-low {
  background: #e8f5e8;
  border-left-color: #388e3c;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 16px;
}

.recommendation-card {
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  border-left: 4px solid;
}

.recommendation-high {
  border-left-color: #d32f2f;
  background: rgba(211, 47, 47, 0.02);
}

.recommendation-medium {
  border-left-color: #f57c00;
  background: rgba(245, 124, 0, 0.02);
}

.recommendation-low {
  border-left-color: #388e3c;
  background: rgba(56, 142, 60, 0.02);
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.drop-reasons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reason-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .funnel-dashboard {
    padding: 16px;
  }

  .recommendations-grid {
    grid-template-columns: 1fr;
  }

  .recommendation-card {
    padding: 16px;
  }
}
</style>