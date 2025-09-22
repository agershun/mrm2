<template>
  <div class="investment-planning-dashboard">
    <!-- Вкладка: Сводка планирования -->
    <div v-if="tabId === 'planning_summary'" class="tab-content">
      <v-row>
        <!-- KPI виджеты -->
        <v-col cols="12" md="3">
          <KPIWidget
            title="Общий бюджет"
            :value="kpiData.totalBudget"
            format="currency"
            :trend="kpiData.budgetTrend"
            icon="mdi-wallet"
            color="primary"
          />
        </v-col>

        <v-col cols="12" md="3">
          <KPIWidget
            title="Использовано"
            :value="kpiData.budgetUsed"
            format="currency"
            :trend="kpiData.usageTrend"
            icon="mdi-cash"
            color="success"
          />
        </v-col>

        <v-col cols="12" md="3">
          <KPIWidget
            title="Остаток"
            :value="kpiData.budgetRemaining"
            format="currency"
            :trend="kpiData.remainingTrend"
            icon="mdi-piggy-bank"
            color="info"
          />
        </v-col>

        <v-col cols="12" md="3">
          <KPIWidget
            title="ROI план"
            :value="kpiData.plannedROI"
            format="percent"
            :trend="kpiData.roiTrend"
            icon="mdi-trending-up"
            color="success"
          />
        </v-col>

        <!-- График распределения бюджета -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-donut</v-icon>
              Распределение бюджета по направлениям
            </v-card-title>
            <v-card-text>
              <BudgetAllocationChart
                :data="budgetAllocationData"
                height="300px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Прогресс по целям -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-target</v-icon>
              Прогресс по целям
            </v-card-title>
            <v-card-text>
              <div
                v-for="goal in goalsProgress"
                :key="goal.id"
                class="goal-item mb-3"
              >
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-body-2 font-weight-medium">{{ goal.name }}</span>
                  <span class="text-body-2">{{ goal.progress }}%</span>
                </div>
                <v-progress-linear
                  :model-value="goal.progress"
                  :color="getProgressColor(goal.progress)"
                  height="6"
                  rounded
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Топ инвестиций -->
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-star</v-icon>
              Топ инвестиционных направлений
            </v-card-title>
            <v-card-text>
              <TopInvestmentsTable
                :data="topInvestments"
                :is-editing="isEditing"
                @row-click="handleInvestmentClick"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Вкладка: Распределение бюджета -->
    <div v-else-if="tabId === 'budget_allocation'" class="tab-content">
      <v-row>
        <!-- Treemap диаграмма -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-tree</v-icon>
              Иерархия инвестиций
            </v-card-title>
            <v-card-text>
              <InvestmentTreemapChart
                :data="investmentHierarchy"
                height="400px"
                @node-click="handleTreemapClick"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Детали выбранного узла -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-information</v-icon>
              Детали инвестиции
            </v-card-title>
            <v-card-text>
              <InvestmentDetails
                :investment="selectedInvestment"
                :is-editing="isEditing"
                @update="handleInvestmentUpdate"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Сравнение плана и прогноза -->
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-line-variant</v-icon>
              План vs Прогноз
            </v-card-title>
            <v-card-text>
              <PlanForecastChart
                :data="planForecastData"
                height="300px"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Вкладка: Стратегическое соответствие -->
    <div v-else-if="tabId === 'strategic_alignment'" class="tab-content">
      <v-row>
        <!-- Оценка соответствия -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-gauge</v-icon>
              Общая оценка соответствия
            </v-card-title>
            <v-card-text>
              <StrategicAlignmentGauge
                :score="strategicAlignmentScore"
                height="250px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Матрица соответствия -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-grid</v-icon>
              Матрица соответствия целям
            </v-card-title>
            <v-card-text>
              <StrategicMatrix
                :data="strategicMatrixData"
                :is-editing="isEditing"
                @cell-click="handleMatrixCellClick"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Рекомендации -->
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-lightbulb</v-icon>
              Рекомендации по оптимизации
            </v-card-title>
            <v-card-text>
              <StrategicRecommendations
                :recommendations="strategicRecommendations"
                :is-editing="isEditing"
                @apply-recommendation="handleApplyRecommendation"
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
import BudgetAllocationChart from '../charts/BudgetAllocationChart.vue'
import TopInvestmentsTable from '../tables/TopInvestmentsTable.vue'
import InvestmentTreemapChart from '../charts/InvestmentTreemapChart.vue'
import InvestmentDetails from '../details/InvestmentDetails.vue'
import PlanForecastChart from '../charts/PlanForecastChart.vue'
import StrategicAlignmentGauge from '../charts/StrategicAlignmentGauge.vue'
import StrategicMatrix from '../matrices/StrategicMatrix.vue'
import StrategicRecommendations from '../recommendations/StrategicRecommendations.vue'

// Props
const props = defineProps({
  tabId: {
    type: String,
    default: 'planning_summary'
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
const selectedInvestment = ref(null)

// Computed properties для данных
const kpiData = computed(() => ({
  totalBudget: 45000000,
  budgetTrend: 8.5,
  budgetUsed: 28500000,
  usageTrend: 12.3,
  budgetRemaining: 16500000,
  remainingTrend: -5.2,
  plannedROI: 285.5,
  roiTrend: 6.8
}))

const budgetAllocationData = computed(() => [
  { name: 'Digital Marketing', value: 18000000, color: '#1976D2' },
  { name: 'Traditional Advertising', value: 12000000, color: '#388E3C' },
  { name: 'Events & Sponsorship', value: 8000000, color: '#F57C00' },
  { name: 'Content Marketing', value: 5000000, color: '#7B1FA2' },
  { name: 'Other', value: 2000000, color: '#455A64' }
])

const goalsProgress = computed(() => [
  { id: 'brand_awareness', name: 'Узнаваемость бренда', progress: 78 },
  { id: 'lead_generation', name: 'Генерация лидов', progress: 65 },
  { id: 'customer_acquisition', name: 'Привлечение клиентов', progress: 82 },
  { id: 'revenue_growth', name: 'Рост выручки', progress: 71 },
  { id: 'market_share', name: 'Доля рынка', progress: 58 }
])

const topInvestments = computed(() => [
  {
    id: 'inv_001',
    name: 'Google Ads кампания',
    category: 'Digital',
    budget: 8500000,
    spent: 6200000,
    roi: 312.5,
    status: 'active'
  },
  {
    id: 'inv_002',
    name: 'Influencer маркетинг',
    category: 'Social',
    budget: 6000000,
    spent: 4800000,
    roi: 287.3,
    status: 'active'
  },
  {
    id: 'inv_003',
    name: 'Email кампании',
    category: 'Direct',
    budget: 2500000,
    spent: 1900000,
    roi: 545.8,
    status: 'active'
  },
  {
    id: 'inv_004',
    name: 'Телевизионная реклама',
    category: 'Traditional',
    budget: 12000000,
    spent: 10500000,
    roi: 189.2,
    status: 'completed'
  },
  {
    id: 'inv_005',
    name: 'Outdoor реклама',
    category: 'Traditional',
    budget: 5500000,
    spent: 5500000,
    roi: 156.7,
    status: 'completed'
  }
])

const investmentHierarchy = computed(() => ({
  name: 'Total Budget',
  value: 45000000,
  children: [
    {
      name: 'Digital Marketing',
      value: 18000000,
      children: [
        { name: 'Google Ads', value: 8500000 },
        { name: 'Facebook Ads', value: 4500000 },
        { name: 'Yandex Direct', value: 3000000 },
        { name: 'Other Digital', value: 2000000 }
      ]
    },
    {
      name: 'Traditional',
      value: 12000000,
      children: [
        { name: 'TV Advertising', value: 7000000 },
        { name: 'Radio', value: 2500000 },
        { name: 'Print', value: 2500000 }
      ]
    },
    {
      name: 'Events',
      value: 8000000,
      children: [
        { name: 'Trade Shows', value: 4000000 },
        { name: 'Conferences', value: 2500000 },
        { name: 'Sponsorships', value: 1500000 }
      ]
    },
    {
      name: 'Content',
      value: 5000000,
      children: [
        { name: 'Video Production', value: 2500000 },
        { name: 'Copywriting', value: 1500000 },
        { name: 'Photography', value: 1000000 }
      ]
    },
    {
      name: 'Other',
      value: 2000000
    }
  ]
}))

const planForecastData = computed(() => ({
  categories: ['Q1', 'Q2', 'Q3', 'Q4'],
  series: [
    {
      name: 'План',
      data: [11250000, 11250000, 11250000, 11250000],
      color: '#1976D2'
    },
    {
      name: 'Прогноз',
      data: [10800000, 11650000, 10900000, 12100000],
      color: '#388E3C'
    },
    {
      name: 'Факт',
      data: [10950000, 11420000, 10650000, null],
      color: '#F57C00'
    }
  ]
}))

const strategicAlignmentScore = computed(() => 78)

const strategicMatrixData = computed(() => ({
  goals: ['Бренд', 'Лиды', 'Продажи', 'Удержание', 'Экспансия'],
  investments: ['Digital', 'TV', 'Events', 'Content', 'PR'],
  matrix: [
    [85, 45, 30, 20, 15], // Digital
    [90, 20, 25, 15, 10], // TV
    [70, 60, 40, 50, 80], // Events
    [60, 70, 35, 40, 30], // Content
    [80, 30, 20, 35, 60]  // PR
  ]
}))

const strategicRecommendations = computed(() => [
  {
    id: 'rec_001',
    type: 'optimization',
    priority: 'high',
    title: 'Перераспределить бюджет с TV на Digital',
    description: 'TV реклама показывает ROI 189%, в то время как Digital каналы дают 312%',
    impact: 'Потенциальный рост ROI на 15%',
    effort: 'Средний',
    action: 'redistribute_budget'
  },
  {
    id: 'rec_002',
    type: 'expansion',
    priority: 'medium',
    title: 'Увеличить инвестиции в Email маркетинг',
    description: 'Email кампании показывают наивысший ROI 545%',
    impact: 'Рост общего ROI на 8%',
    effort: 'Низкий',
    action: 'increase_budget'
  },
  {
    id: 'rec_003',
    type: 'alignment',
    priority: 'medium',
    title: 'Усилить фокус на удержании клиентов',
    description: 'Текущие инвестиции слабо покрывают цель удержания',
    impact: 'Улучшение LTV на 12%',
    effort: 'Высокий',
    action: 'realign_goals'
  }
])

// Methods
const getProgressColor = (progress) => {
  if (progress >= 80) return 'success'
  if (progress >= 60) return 'warning'
  return 'error'
}

const handleInvestmentClick = (investment) => {
  selectedInvestment.value = investment
  // TODO: Emit drilldown event
}

const handleTreemapClick = (node) => {
  selectedInvestment.value = node
}

const handleInvestmentUpdate = (updatedInvestment) => {
  // TODO: Update investment data
  console.log('Investment updated:', updatedInvestment)
}

const handleMatrixCellClick = (row, col, value) => {
  console.log('Matrix cell clicked:', { row, col, value })
}

const handleApplyRecommendation = (recommendation) => {
  console.log('Applying recommendation:', recommendation)
  // TODO: Implement recommendation application
}

// Watchers
watch(() => props.data, (newData) => {
  // TODO: Update computed data when props.data changes
  console.log('Dashboard data updated:', newData)
}, { deep: true })
</script>

<style scoped>
.investment-planning-dashboard {
  height: 100%;
}

.tab-content {
  height: 100%;
}

.goal-item {
  padding: 8px 0;
}
</style>