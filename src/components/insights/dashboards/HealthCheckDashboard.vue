<template>
  <div class="health-check-dashboard">
    <!-- Вкладка: Качество данных -->
    <div v-if="tabId === 'data_quality'" class="tab-content">
      <v-row>
        <!-- Общая оценка качества -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-gauge</v-icon>
              Общая оценка качества данных
            </v-card-title>
            <v-card-text>
              <DataQualityGauge
                :score="dataQualityScore"
                height="250px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- KPI показатели качества -->
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="6" md="3">
              <KPIWidget
                title="Полнота данных"
                :value="qualityMetrics.completeness"
                format="percent"
                :trend="qualityMetrics.completenessTrend"
                icon="mdi-database-check"
                color="success"
              />
            </v-col>

            <v-col cols="6" md="3">
              <KPIWidget
                title="Корректность"
                :value="qualityMetrics.accuracy"
                format="percent"
                :trend="qualityMetrics.accuracyTrend"
                icon="mdi-check-circle"
                color="primary"
              />
            </v-col>

            <v-col cols="6" md="3">
              <KPIWidget
                title="Консистентность"
                :value="qualityMetrics.consistency"
                format="percent"
                :trend="qualityMetrics.consistencyTrend"
                icon="mdi-sync"
                color="info"
              />
            </v-col>

            <v-col cols="6" md="3">
              <KPIWidget
                title="Актуальность"
                :value="qualityMetrics.timeliness"
                format="percent"
                :trend="qualityMetrics.timelinessTrend"
                icon="mdi-clock-check"
                color="warning"
              />
            </v-col>
          </v-row>

          <!-- Трендовая диаграмма качества -->
          <v-card class="mt-4">
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-line</v-icon>
              Динамика качества данных
            </v-card-title>
            <v-card-text>
              <DataQualityTrendChart
                :data="qualityTrendData"
                height="200px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Список проблем качества -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-alert-circle</v-icon>
              Проблемы качества данных
              <v-spacer />
              <v-chip
                :color="getIssuesSeverityColor()"
                size="small"
                variant="tonal"
              >
                {{ dataQualityIssues.length }} проблем
              </v-chip>
            </v-card-title>
            <v-card-text class="pa-0">
              <DataQualityIssuesList
                :issues="dataQualityIssues"
                :is-editing="isEditing"
                @issue-click="handleIssueClick"
                @resolve-issue="handleResolveIssue"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Рекомендации по улучшению -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-lightbulb</v-icon>
              Рекомендации по улучшению
            </v-card-title>
            <v-card-text>
              <DataQualityRecommendations
                :recommendations="qualityRecommendations"
                :is-editing="isEditing"
                @apply-recommendation="handleApplyRecommendation"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Вкладка: Несопоставленные данные -->
    <div v-else-if="tabId === 'unmapped_data'" class="tab-content">
      <v-row>
        <!-- Статистика несопоставленных данных -->
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-chart-donut</v-icon>
              Статистика несопоставленных данных
            </v-card-title>
            <v-card-text>
              <UnmappedDataChart
                :data="unmappedDataStats"
                height="250px"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- KPI несопоставленных данных -->
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="6" md="3">
              <KPIWidget
                title="Несопоставленные PO"
                :value="unmappedStats.pos"
                format="number"
                :trend="unmappedStats.posTrend"
                icon="mdi-file-document-alert"
                color="error"
              />
            </v-col>

            <v-col cols="6" md="3">
              <KPIWidget
                title="Сумма PO"
                :value="unmappedStats.posAmount"
                format="currency"
                :trend="unmappedStats.posAmountTrend"
                icon="mdi-currency-usd-off"
                color="warning"
              />
            </v-col>

            <v-col cols="6" md="3">
              <KPIWidget
                title="Несопоставленные Actuals"
                :value="unmappedStats.actuals"
                format="number"
                :trend="unmappedStats.actualsTrend"
                icon="mdi-receipt"
                color="error"
              />
            </v-col>

            <v-col cols="6" md="3">
              <KPIWidget
                title="Сумма Actuals"
                :value="unmappedStats.actualsAmount"
                format="currency"
                :trend="unmappedStats.actualsAmountTrend"
                icon="mdi-cash-off"
                color="warning"
              />
            </v-col>
          </v-row>
        </v-col>

        <!-- Таблица несопоставленных PO -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-file-document-multiple</v-icon>
              Несопоставленные заказы на покупку
              <v-spacer />
              <v-btn
                size="small"
                variant="outlined"
                prepend-icon="mdi-link"
                @click="handleBulkMapping('pos')"
              >
                Массовое сопоставление
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <UnmappedPOsTable
                :data="unmappedPOs"
                :is-editing="isEditing"
                @map-po="handleMapPO"
                @bulk-select="handleBulkSelectPO"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Таблица несопоставленных Actuals -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-receipt-text</v-icon>
              Несопоставленные фактические затраты
              <v-spacer />
              <v-btn
                size="small"
                variant="outlined"
                prepend-icon="mdi-link"
                @click="handleBulkMapping('actuals')"
              >
                Массовое сопоставление
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <UnmappedActualsTable
                :data="unmappedActuals"
                :is-editing="isEditing"
                @map-actual="handleMapActual"
                @bulk-select="handleBulkSelectActual"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Вкладка: Согласованность данных -->
    <div v-else-if="tabId === 'data_consistency'" class="tab-content">
      <v-row>
        <!-- Матрица согласованности -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-matrix</v-icon>
              Матрица согласованности между системами
            </v-card-title>
            <v-card-text>
              <DataConsistencyMatrix
                :data="consistencyMatrixData"
                @cell-click="handleConsistencyClick"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- KPI согласованности -->
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-sync</v-icon>
              Показатели согласованности
            </v-card-title>
            <v-card-text>
              <div
                v-for="metric in consistencyMetrics"
                :key="metric.id"
                class="consistency-metric mb-3"
              >
                <div class="d-flex justify-space-between align-center mb-1">
                  <span class="text-body-2 font-weight-medium">{{ metric.name }}</span>
                  <v-chip
                    :color="getConsistencyColor(metric.score)"
                    size="small"
                    variant="tonal"
                  >
                    {{ metric.score }}%
                  </v-chip>
                </div>
                <v-progress-linear
                  :model-value="metric.score"
                  :color="getConsistencyColor(metric.score)"
                  height="6"
                  rounded
                />
                <div class="text-caption text-grey mt-1">
                  {{ metric.description }}
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Последние проверки -->
          <v-card>
            <v-card-title class="text-subtitle-2">
              Последние проверки
            </v-card-title>
            <v-card-text>
              <div
                v-for="check in recentChecks"
                :key="check.id"
                class="check-item d-flex align-center mb-2"
              >
                <v-icon
                  :color="check.status === 'success' ? 'success' : 'error'"
                  size="small"
                  class="me-2"
                >
                  {{ check.status === 'success' ? 'mdi-check' : 'mdi-alert' }}
                </v-icon>
                <div class="flex-grow-1">
                  <div class="text-body-2">{{ check.name }}</div>
                  <div class="text-caption text-grey">{{ formatCheckTime(check.timestamp) }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Таблица расхождений -->
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-table-alert</v-icon>
              Обнаруженные расхождения
              <v-spacer />
              <v-btn
                size="small"
                variant="outlined"
                prepend-icon="mdi-refresh"
                @click="handleRunConsistencyCheck"
              >
                Запустить проверку
              </v-btn>
            </v-card-title>
            <v-card-text class="pa-0">
              <DataDiscrepanciesTable
                :data="dataDiscrepancies"
                :is-editing="isEditing"
                @resolve-discrepancy="handleResolveDiscrepancy"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Диалоги -->
    <MappingDialog
      v-model="showMappingDialog"
      :type="mappingType"
      :items="selectedItemsForMapping"
      @confirm="handleConfirmMapping"
    />

    <IssueDetailsDialog
      v-model="showIssueDialog"
      :issue="selectedIssue"
      @resolve="handleResolveIssueConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import KPIWidget from '../widgets/KPIWidget.vue'
import DataQualityGauge from '../charts/DataQualityGauge.vue'
import DataQualityTrendChart from '../charts/DataQualityTrendChart.vue'
import DataQualityIssuesList from '../lists/DataQualityIssuesList.vue'
import DataQualityRecommendations from '../recommendations/DataQualityRecommendations.vue'
import UnmappedDataChart from '../charts/UnmappedDataChart.vue'
import UnmappedPOsTable from '../tables/UnmappedPOsTable.vue'
import UnmappedActualsTable from '../tables/UnmappedActualsTable.vue'
import DataConsistencyMatrix from '../matrices/DataConsistencyMatrix.vue'
import DataDiscrepanciesTable from '../tables/DataDiscrepanciesTable.vue'
import MappingDialog from '../dialogs/MappingDialog.vue'
import IssueDetailsDialog from '../dialogs/IssueDetailsDialog.vue'

// Props
const props = defineProps({
  tabId: {
    type: String,
    default: 'data_quality'
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
const showMappingDialog = ref(false)
const showIssueDialog = ref(false)
const mappingType = ref('pos')
const selectedItemsForMapping = ref([])
const selectedIssue = ref(null)

// Computed data
const dataQualityScore = computed(() => 87)

const qualityMetrics = computed(() => ({
  completeness: 92.5,
  completenessTrend: { value: 2.3, direction: 'up' },
  accuracy: 88.7,
  accuracyTrend: { value: 1.2, direction: 'down' },
  consistency: 85.2,
  consistencyTrend: { value: 1.8, direction: 'up' },
  timeliness: 83.4,
  timelinessTrend: { value: 0.5, direction: 'down' }
}))

const qualityTrendData = computed(() => {
  const categories = ['2024-07-01', '2024-08-01', '2024-09-01', '2024-10-01', '2024-11-01', '2024-12-01']
  const completenessData = [89.2, 90.1, 91.5, 92.0, 91.8, 92.5]
  const accuracyData = [87.5, 88.8, 89.2, 89.5, 88.9, 88.7]
  const consistencyData = [82.1, 83.4, 84.2, 84.8, 85.0, 85.2]
  const timelinessData = [81.2, 82.8, 83.5, 84.1, 83.7, 83.4]

  return categories.map((date, index) => ({
    date,
    completeness: completenessData[index],
    accuracy: accuracyData[index],
    consistency: consistencyData[index],
    timeliness: timelinessData[index],
    overall: Math.round((completenessData[index] + accuracyData[index] + consistencyData[index] + timelinessData[index]) / 4),
    issues: index === categories.length - 1 ? ['Несопоставленные PO', 'Отсутствующие актуалы'] : []
  }))
})

const dataQualityIssues = computed(() => [
  {
    id: 'issue_001',
    title: 'Несопоставленные заказы на покупку',
    severity: 'high',
    category: 'mapping',
    count: 12,
    description: '12 заказов на сумму 2.1М₽ не привязаны к активностям',
    impact: 'Невозможно отследить ROI для этих затрат',
    lastDetected: '2024-12-23T09:30:00Z'
  },
  {
    id: 'issue_002',
    title: 'Отсутствующие фактические данные',
    severity: 'medium',
    category: 'completeness',
    count: 8,
    description: '8 активностей без данных о фактических затратах',
    impact: 'Неточный расчет производительности кампаний',
    lastDetected: '2024-12-22T14:15:00Z'
  },
  {
    id: 'issue_003',
    title: 'Несогласованные валюты',
    severity: 'low',
    category: 'consistency',
    count: 3,
    description: '3 записи с некорректными валютными кодами',
    impact: 'Ошибки в финансовой отчетности',
    lastDetected: '2024-12-21T11:45:00Z'
  },
  {
    id: 'issue_004',
    title: 'Дублирующиеся активности',
    severity: 'medium',
    category: 'duplicates',
    count: 5,
    description: '5 потенциально дублирующихся активностей',
    impact: 'Искажение статистики эффективности',
    lastDetected: '2024-12-20T16:20:00Z'
  }
])

const qualityRecommendations = computed(() => [
  {
    id: 'rec_001',
    type: 'automation',
    priority: 'high',
    title: 'Настроить автоматическое сопоставление PO',
    description: 'Внедрить правила для автоматической привязки заказов к активностям',
    effort: 'Средний',
    impact: 'Сокращение ручной работы на 80%',
    action: 'setup_auto_mapping'
  },
  {
    id: 'rec_002',
    type: 'validation',
    priority: 'medium',
    title: 'Усилить валидацию данных на входе',
    description: 'Добавить проверки корректности данных при импорте',
    effort: 'Низкий',
    impact: 'Снижение ошибок на 60%',
    action: 'enhance_validation'
  },
  {
    id: 'rec_003',
    type: 'monitoring',
    priority: 'medium',
    title: 'Настроить мониторинг качества в реальном времени',
    description: 'Создать алерты при обнаружении проблем качества',
    effort: 'Высокий',
    impact: 'Быстрое обнаружение проблем',
    action: 'setup_monitoring'
  }
])

const unmappedDataStats = computed(() => [
  { name: 'Несопоставленные PO', value: 12, color: '#F44336' },
  { name: 'Несопоставленные Actuals', value: 8, color: '#FF9800' },
  { name: 'Корректные данные', value: 180, color: '#4CAF50' }
])

const unmappedStats = computed(() => ({
  pos: 12,
  posTrend: { value: 2, direction: 'down' },
  posAmount: 2100000,
  posAmountTrend: { value: 15.5, direction: 'down' },
  actuals: 8,
  actualsTrend: { value: 1, direction: 'up' },
  actualsAmount: 856000,
  actualsAmountTrend: { value: 8.2, direction: 'up' }
}))

const unmappedPOs = computed(() => [
  {
    id: 'po_001',
    po_number: 'PO-2024-1234',
    amount: 856000,
    date: '2024-12-15',
    supplier: 'Digital Agency Pro',
    description: 'Создание рекламных креативов',
    suggested_activity: 'Осенняя digital-кампания'
  },
  {
    id: 'po_002',
    po_number: 'PO-2024-1235',
    amount: 425000,
    date: '2024-12-14',
    supplier: 'Media Buying Corp',
    description: 'Размещение контекстной рекламы',
    suggested_activity: 'Google Ads - поисковые кампании'
  },
  {
    id: 'po_003',
    po_number: 'PO-2024-1236',
    amount: 320000,
    date: '2024-12-13',
    supplier: 'Social Media Agency',
    description: 'Продвижение в Instagram',
    suggested_activity: 'Instagram Stories - осенняя коллекция'
  },
  {
    id: 'po_004',
    po_number: 'PO-2024-1237',
    amount: 275000,
    date: '2024-12-12',
    supplier: 'Email Marketing Pro',
    description: 'Email кампания',
    suggested_activity: 'Осенняя email-серия'
  }
])

const unmappedActuals = computed(() => [
  {
    id: 'actual_001',
    invoice_number: 'INV-2024-5678',
    amount: 234000,
    date: '2024-12-10',
    vendor: 'YouTube Advertising',
    description: 'Размещение видеорекламы',
    category: 'Digital Advertising'
  },
  {
    id: 'actual_002',
    invoice_number: 'INV-2024-5679',
    amount: 189000,
    date: '2024-12-09',
    vendor: 'Event Management Co',
    description: 'Организация мероприятия',
    category: 'Events'
  },
  {
    id: 'actual_003',
    invoice_number: 'INV-2024-5680',
    amount: 156000,
    date: '2024-12-08',
    vendor: 'Content Creation Studio',
    description: 'Производство контента',
    category: 'Content Marketing'
  }
])

const consistencyMatrixData = computed(() => ({
  systems: ['Kreola MRM', 'Finance System', 'CRM', 'Ad Platforms', 'Analytics'],
  metrics: ['Бюджеты', 'Затраты', 'Конверсии', 'Выручка', 'ROI'],
  consistency: [
    [100, 95, 92, 88, 90], // Kreola MRM
    [95, 100, 85, 82, 87], // Finance System
    [92, 85, 100, 95, 93], // CRM
    [88, 82, 95, 100, 91], // Ad Platforms
    [90, 87, 93, 91, 100]  // Analytics
  ]
}))

const consistencyMetrics = computed(() => [
  {
    id: 'budget_consistency',
    name: 'Согласованность бюджетов',
    score: 94,
    description: 'Соответствие между плановыми и фактическими бюджетами'
  },
  {
    id: 'spend_consistency',
    name: 'Согласованность затрат',
    score: 87,
    description: 'Соответствие затрат между системами'
  },
  {
    id: 'conversion_consistency',
    name: 'Согласованность конверсий',
    score: 91,
    description: 'Соответствие данных о конверсиях'
  },
  {
    id: 'revenue_consistency',
    name: 'Согласованность выручки',
    score: 89,
    description: 'Соответствие данных о выручке'
  }
])

const recentChecks = computed(() => [
  {
    id: 'check_001',
    name: 'Проверка PO сопоставления',
    status: 'error',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 часа назад
  },
  {
    id: 'check_002',
    name: 'Валидация валют',
    status: 'success',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 часа назад
  },
  {
    id: 'check_003',
    name: 'Синхронизация с CRM',
    status: 'success',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 часов назад
  },
  {
    id: 'check_004',
    name: 'Проверка дубликатов',
    status: 'error',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 часов назад
  }
])

const dataDiscrepancies = computed(() => [
  {
    id: 'disc_001',
    type: 'Budget Mismatch',
    systems: ['Kreola MRM', 'Finance System'],
    field: 'Budget Amount',
    value1: 1250000,
    value2: 1280000,
    difference: 30000,
    severity: 'medium',
    lastDetected: '2024-12-23T10:15:00Z'
  },
  {
    id: 'disc_002',
    type: 'Conversion Count',
    systems: ['CRM', 'Ad Platforms'],
    field: 'Total Conversions',
    value1: 2485,
    value2: 2502,
    difference: 17,
    severity: 'low',
    lastDetected: '2024-12-22T16:45:00Z'
  },
  {
    id: 'disc_003',
    type: 'Revenue Amount',
    systems: ['Kreola MRM', 'CRM'],
    field: 'Total Revenue',
    value1: 12683000,
    value2: 12750000,
    difference: 67000,
    severity: 'high',
    lastDetected: '2024-12-21T09:30:00Z'
  }
])

// Methods
const getIssuesSeverityColor = () => {
  const highIssues = dataQualityIssues.value.filter(i => i.severity === 'high').length
  if (highIssues > 0) return 'error'

  const mediumIssues = dataQualityIssues.value.filter(i => i.severity === 'medium').length
  if (mediumIssues > 0) return 'warning'

  return 'success'
}

const getConsistencyColor = (score) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'warning'
  return 'error'
}

const formatCheckTime = (timestamp) => {
  const diff = Date.now() - timestamp.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}ч ${minutes}м назад`
  } else {
    return `${minutes}м назад`
  }
}

const handleIssueClick = (issue) => {
  selectedIssue.value = issue
  showIssueDialog.value = true
}

const handleResolveIssue = (issueId) => {
  console.log('Resolving issue:', issueId)
  // TODO: Implement issue resolution
}

const handleApplyRecommendation = (recommendation) => {
  console.log('Applying recommendation:', recommendation)
  // TODO: Implement recommendation application
}

const handleMapPO = (po) => {
  console.log('Mapping PO:', po)
  // TODO: Open mapping dialog for single PO
}

const handleMapActual = (actual) => {
  console.log('Mapping Actual:', actual)
  // TODO: Open mapping dialog for single Actual
}

const handleBulkMapping = (type) => {
  mappingType.value = type
  selectedItemsForMapping.value = type === 'pos' ? unmappedPOs.value : unmappedActuals.value
  showMappingDialog.value = true
}

const handleBulkSelectPO = (selectedPOs) => {
  console.log('Bulk selected POs:', selectedPOs)
}

const handleBulkSelectActual = (selectedActuals) => {
  console.log('Bulk selected Actuals:', selectedActuals)
}

const handleConsistencyClick = (system1, system2, metric) => {
  console.log('Consistency clicked:', { system1, system2, metric })
}

const handleRunConsistencyCheck = () => {
  console.log('Running consistency check...')
  // TODO: Implement consistency check
}

const handleResolveDiscrepancy = (discrepancy) => {
  console.log('Resolving discrepancy:', discrepancy)
  // TODO: Implement discrepancy resolution
}

const handleConfirmMapping = (mappings) => {
  console.log('Confirmed mappings:', mappings)
  showMappingDialog.value = false
  // TODO: Apply mappings
}

const handleResolveIssueConfirm = (resolution) => {
  console.log('Issue resolution confirmed:', resolution)
  showIssueDialog.value = false
  // TODO: Apply resolution
}

// Watchers
watch(() => props.data, (newData) => {
  console.log('Health Check Dashboard data updated:', newData)
}, { deep: true })
</script>

<style scoped>
.health-check-dashboard {
  height: 100%;
}

.tab-content {
  height: 100%;
}

.consistency-metric {
  padding: 8px 0;
}

.check-item {
  padding: 4px 0;
}
</style>