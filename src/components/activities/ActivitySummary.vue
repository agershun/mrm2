<template>
  <div class="activity-summary">
    <!-- Заголовок и элементы управления -->
    <div class="summary-header">
      <v-container fluid class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <h3 class="text-h6">Сводная таблица активностей</h3>
          <div class="summary-controls d-flex align-center gap-2">
            <v-btn
              variant="outlined"
              size="small"
              prepend-icon="mdi-download"
              @click="exportToExcel"
            >
              Экспорт
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              prepend-icon="mdi-table-column"
              @click="openColumnEditor"
            >
              Настроить столбцы
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <!-- Основная таблица -->
    <div class="summary-content">
      <v-data-table
        :headers="visibleHeaders"
        :items="tableData"
        :loading="activitiesStore.isLoading"
        item-key="activity_id"
        class="activities-table"
        fixed-header
        :height="tableHeight"
        @click:row="selectActivity"
      >
        <!-- Название активности с иконкой -->
        <template v-slot:item.name="{ item }">
          <div class="activity-name-cell">
            <v-icon
              :icon="getActivityIcon(item.activity_type_id)"
              :color="getActivityColor(item.activity_type_id)"
              size="16"
              class="me-2"
            />
            <span>{{ item.name }}</span>
          </div>
        </template>

        <!-- Статус с цветным чипом -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="outlined"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <!-- Диапазон дат -->
        <template v-slot:item.date_range="{ item }">
          <span class="text-body-2">
            {{ formatDateRange(item.in_market_start_date, item.in_market_end_date) }}
          </span>
        </template>

        <!-- Тип активности -->
        <template v-slot:item.activity_type="{ item }">
          <span>{{ getActivityTypeName(item.activity_type_id) }}</span>
        </template>

        <!-- Валюта -->
        <template v-slot:item.currency_code="{ item }">
          <v-chip size="x-small" variant="outlined">
            {{ item.currency_code }}
          </v-chip>
        </template>

        <!-- Планируемые затраты (mock данные) -->
        <template v-slot:item.planned_costs="{ item }">
          <span class="text-right font-weight-medium">
            {{ formatCurrency(getMockPlannedCosts(item.activity_id), item.currency_code) }}
          </span>
        </template>

        <!-- ROI (mock данные) -->
        <template v-slot:item.roi="{ item }">
          <div class="roi-cell">
            <span
              :class="getMockROI(item.activity_id) >= 0 ? 'text-success' : 'text-error'"
              class="font-weight-medium"
            >
              {{ getMockROI(item.activity_id) }}%
            </span>
          </div>
        </template>

        <!-- Прогресс (mock данные) -->
        <template v-slot:item.progress="{ item }">
          <div class="progress-cell">
            <v-progress-linear
              :model-value="getMockProgress(item.activity_id)"
              :color="getProgressColor(getMockProgress(item.activity_id))"
              height="6"
              rounded
            />
            <span class="text-caption mt-1">
              {{ getMockProgress(item.activity_id) }}%
            </span>
          </div>
        </template>

        <!-- Ответственный -->
        <template v-slot:item.responsible="{ item }">
          <div class="responsible-cell">
            <v-avatar size="24" color="primary" class="me-2">
              <span class="text-caption text-white">
                {{ getResponsibleInitials(item.activity_id) }}
              </span>
            </v-avatar>
            <span class="text-body-2">{{ getResponsibleName(item.activity_id) }}</span>
          </div>
        </template>

        <!-- Пустое состояние -->
        <template v-slot:no-data>
          <div class="empty-state text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-table-off
            </v-icon>
            <h4 class="text-h6 mb-2">Нет данных для отображения</h4>
            <p class="text-body-2 text-grey-darken-1">
              Измените фильтры или создайте новые активности
            </p>
          </div>
        </template>

        <!-- Индикатор загрузки -->
        <template v-slot:loading>
          <div class="loading-state text-center pa-8">
            <v-progress-circular indeterminate color="primary" />
            <p class="text-body-2 mt-4">Загрузка данных...</p>
          </div>
        </template>
      </v-data-table>

      <!-- Итоговая строка -->
      <div class="summary-totals">
        <v-container fluid class="pa-4">
          <div class="totals-row">
            <span class="text-subtitle-2 font-weight-bold me-4">Итого:</span>
            <span class="me-6">
              Активностей: <strong>{{ totalActivities }}</strong>
            </span>
            <span class="me-6">
              Плановые затраты: <strong>{{ totalPlannedCosts }}</strong>
            </span>
            <span>
              Средний ROI: <strong :class="averageROI >= 0 ? 'text-success' : 'text-error'">
                {{ averageROI }}%
              </strong>
            </span>
          </div>
        </v-container>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'
import { useAppStore } from '@/stores/appStore'

const activitiesStore = useActivitiesStore()
const appStore = useAppStore()

// State
const tableHeight = ref(400)

// Computed
const tableData = computed(() => activitiesStore.filteredActivities)

const totalActivities = computed(() => tableData.value.length)

const totalPlannedCosts = computed(() => {
  const total = tableData.value.reduce((sum, activity) => {
    return sum + getMockPlannedCosts(activity.activity_id)
  }, 0)
  return formatCurrency(total, 'RUB')
})

const averageROI = computed(() => {
  if (tableData.value.length === 0) return 0
  const total = tableData.value.reduce((sum, activity) => {
    return sum + getMockROI(activity.activity_id)
  }, 0)
  return Math.round(total / tableData.value.length)
})

// Заголовки таблицы
const visibleHeaders = ref([
  {
    title: 'Название',
    key: 'name',
    sortable: true,
    width: '300px'
  },
  {
    title: 'Тип',
    key: 'activity_type',
    sortable: true,
    width: '150px'
  },
  {
    title: 'Статус',
    key: 'status',
    sortable: true,
    width: '120px'
  },
  {
    title: 'Даты проведения',
    key: 'date_range',
    sortable: false,
    width: '180px'
  },
  {
    title: 'Плановые затраты',
    key: 'planned_costs',
    sortable: true,
    width: '150px',
    align: 'end'
  },
  {
    title: 'ROI',
    key: 'roi',
    sortable: true,
    width: '100px',
    align: 'end'
  },
  {
    title: 'Прогресс',
    key: 'progress',
    sortable: true,
    width: '120px'
  },
  {
    title: 'Ответственный',
    key: 'responsible',
    sortable: true,
    width: '160px'
  },
  {
    title: 'Валюта',
    key: 'currency_code',
    sortable: true,
    width: '90px'
  }
])

// Methods
const selectActivity = (event, { item }) => {
  activitiesStore.selectActivity(item.activity_id)
}

const getActivityIcon = (typeId) => {
  const icons = {
    '1': 'mdi-file-document-outline',
    '2': 'mdi-calendar-check',
    '3': 'mdi-bullhorn',
    '4': 'mdi-folder-multiple',
    '5': 'mdi-video',
    '6': 'mdi-email',
    '7': 'mdi-presentation',
    '8': 'mdi-google-ads',
    '9': 'mdi-search-web',
    '10': 'mdi-share-variant'
  }
  return icons[typeId] || 'mdi-circle'
}

const getActivityColor = (typeId) => {
  const colors = {
    '1': 'blue-darken-2',
    '2': 'blue',
    '3': 'purple',
    '4': 'indigo',
    '5': 'green',
    '6': 'orange',
    '7': 'red',
    '8': 'teal',
    '9': 'brown',
    '10': 'pink'
  }
  return colors[typeId] || 'grey'
}

const getActivityTypeName = (typeId) => {
  const type = activitiesStore.activityTypes.find(t => t.activity_type_id === typeId)
  return type ? type.name : 'Неизвестный тип'
}

const getStatusColor = (status) => {
  const colors = {
    'Planning': 'blue',
    'Active': 'green',
    'Completed': 'grey',
    'Cancelled': 'red',
    'On Hold': 'orange'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'Planning': 'Планирование',
    'Active': 'Активна',
    'Completed': 'Завершена',
    'Cancelled': 'Отменена',
    'On Hold': 'Приостановлена'
  }
  return texts[status] || status
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return '—'

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const start = formatDate(startDate)
  const end = formatDate(endDate)

  if (start && end) {
    if (start === end) return start
    return `${start} — ${end}`
  }

  return start || end || '—'
}

const formatCurrency = (amount, currencyCode = 'RUB') => {
  const formatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  return formatter.format(amount)
}

// Mock data functions (в реальном приложении будут загружаться из API)
const getMockPlannedCosts = (activityId) => {
  const mockCosts = {
    '1': 5000000,
    '2': 1500000,
    '3': 800000,
    '4': 300000,
    '5': 150000,
    '6': 50000,
    '7': 200000,
    '8': 350000,
    '9': 120000,
    '10': 80000,
    '11': 90000,
    '12': 2000000
  }
  return mockCosts[activityId] || Math.floor(Math.random() * 500000) + 50000
}

const getMockROI = (activityId) => {
  const mockROI = {
    '1': 25,
    '2': 18,
    '3': 32,
    '4': 45,
    '5': 28,
    '6': 15,
    '7': 38,
    '8': 22,
    '9': 41,
    '10': 19,
    '11': 33,
    '12': 12
  }
  return mockROI[activityId] || Math.floor(Math.random() * 60) - 10
}

const getMockProgress = (activityId) => {
  const mockProgress = {
    '1': 15,
    '2': 65,
    '3': 30,
    '4': 85,
    '5': 95,
    '6': 100,
    '7': 45,
    '8': 70,
    '9': 25,
    '10': 80,
    '11': 55,
    '12': 10
  }
  return mockProgress[activityId] || Math.floor(Math.random() * 100)
}

const getProgressColor = (progress) => {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'warning'
  return 'error'
}

const getResponsibleName = (activityId) => {
  const mockResponsible = {
    '1': 'Александр Петров',
    '2': 'Елена Иванова',
    '3': 'Дмитрий Сидоров',
    '4': 'Елена Иванова',
    '5': 'Дмитрий Сидоров',
    '6': 'Александр Петров',
    '7': 'Елена Иванова',
    '8': 'Дмитрий Сидоров',
    '9': 'Александр Петров',
    '10': 'Елена Иванова',
    '11': 'Дмитрий Сидоров',
    '12': 'Александр Петров'
  }
  return mockResponsible[activityId] || 'Не назначен'
}

const getResponsibleInitials = (activityId) => {
  const name = getResponsibleName(activityId)
  if (name === 'Не назначен') return '?'

  const parts = name.split(' ')
  return parts.map(part => part.charAt(0)).join('').toUpperCase()
}

const openColumnEditor = () => {
  appStore.showInfo('Редактор столбцов будет реализован в следующих версиях')
}

const exportToExcel = () => {
  appStore.showInfo('Экспорт в Excel будет реализован в следующих версиях')
}
</script>

<style scoped>
.activity-summary {
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
}

.summary-header {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.summary-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.activities-table {
  flex: 1;
}

.activity-name-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.activity-name-cell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.roi-cell {
  text-align: right;
}

.progress-cell {
  min-width: 100px;
}

.responsible-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.responsible-cell span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-totals {
  flex-shrink: 0;
  background: #f5f5f5;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.totals-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-state,
.loading-state {
  color: #666;
}

.gap-2 {
  gap: 8px;
}

/* Кастомные стили для таблицы */
:deep(.v-data-table__wrapper) {
  height: 100%;
}

:deep(.v-data-table-header) {
  background-color: #f8f9fa;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .summary-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .totals-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>