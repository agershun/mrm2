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
          <div class="activity-name-cell" @dblclick="startInlineEdit(item, 'name')">
            <v-icon
              :icon="getActivityIcon(item.activity_type_id)"
              :color="getActivityColor(item.activity_type_id)"
              size="16"
              class="me-2"
            />
            <div v-if="isEditing(item, 'name')" class="inline-edit-container">
              <v-text-field
                v-model="editingValue"
                variant="outlined"
                density="compact"
                hide-details
                autofocus
                @keydown.enter="saveInlineEdit(item, 'name')"
                @keydown.esc="cancelInlineEdit"
                @blur="saveInlineEdit(item, 'name')"
              />
            </div>
            <span v-else class="editable-field">{{ item.name }}</span>
          </div>
        </template>

        <!-- Статус с цветным чипом -->
        <template v-slot:item.status="{ item }">
          <div @dblclick="startInlineEdit(item, 'status')">
            <div v-if="isEditing(item, 'status')" class="inline-edit-container">
              <v-select
                v-model="editingValue"
                :items="statusOptions"
                variant="outlined"
                density="compact"
                hide-details
                autofocus
                @update:model-value="saveInlineEdit(item, 'status')"
                @keydown.esc="cancelInlineEdit"
              />
            </div>
            <v-chip
              v-else
              :color="getStatusColor(item.status)"
              size="small"
              variant="outlined"
              class="editable-field"
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </div>
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
          <div class="text-right" @dblclick="startInlineEdit(item, 'planned_costs')">
            <div v-if="isEditing(item, 'planned_costs')" class="inline-edit-container">
              <v-text-field
                v-model="editingValue"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                autofocus
                @keydown.enter="saveInlineEdit(item, 'planned_costs')"
                @keydown.esc="cancelInlineEdit"
                @blur="saveInlineEdit(item, 'planned_costs')"
              />
            </div>
            <span v-else class="font-weight-medium editable-field">
              {{ formatCurrency(getMockPlannedCosts(item.activity_id), item.currency_code) }}
            </span>
          </div>
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
          <div class="responsible-cell" @dblclick="startInlineEdit(item, 'responsible')">
            <div v-if="isEditing(item, 'responsible')" class="inline-edit-container">
              <v-select
                v-model="editingValue"
                :items="responsibleOptions"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="compact"
                hide-details
                autofocus
                @update:model-value="saveInlineEdit(item, 'responsible')"
                @keydown.esc="cancelInlineEdit"
              >
                <template v-slot:item="{ props, item: option }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-avatar size="24" color="primary" class="me-2">
                        <span class="text-caption text-white">
                          {{ option.raw.initials }}
                        </span>
                      </v-avatar>
                    </template>
                    <v-list-item-title>{{ option.raw.name }}</v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </div>
            <div v-else class="d-flex align-center editable-field">
              <v-avatar size="24" color="primary" class="me-2">
                <span class="text-caption text-white">
                  {{ getResponsibleInitials(item.activity_id) }}
                </span>
              </v-avatar>
              <span class="text-body-2">{{ getResponsibleName(item.activity_id) }}</span>
            </div>
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

    <!-- Диалог редактора столбцов -->
    <ColumnEditor
      v-model="columnEditorDialog"
      :columns="availableColumns"
      @apply="applyColumnConfiguration"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'
import { useAppStore } from '@/stores/appStore'
import ColumnEditor from './ColumnEditor.vue'

const activitiesStore = useActivitiesStore()
const appStore = useAppStore()

// State
const tableHeight = ref(400)
const columnEditorDialog = ref(false)
const editingCell = ref(null) // { itemId, field, value }
const editingValue = ref('')
const inlineEditMode = ref(false)

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

// Доступные столбцы для редактора (полный список)
const availableColumns = ref([
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

// Видимые заголовки таблицы (настраиваются пользователем)
const visibleHeaders = ref([...availableColumns.value])

// Данные для inline редактирования
const statusOptions = [
  { title: 'Планирование', value: 'Planning' },
  { title: 'Активна', value: 'Active' },
  { title: 'Завершена', value: 'Completed' },
  { title: 'Отменена', value: 'Cancelled' },
  { title: 'Приостановлена', value: 'On Hold' }
]

const responsibleOptions = [
  { id: 'petrov', name: 'Александр Петров', initials: 'АП' },
  { id: 'ivanova', name: 'Елена Иванова', initials: 'ЕИ' },
  { id: 'sidorov', name: 'Дмитрий Сидоров', initials: 'ДС' }
]

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
  columnEditorDialog.value = true
}

const applyColumnConfiguration = (newColumns) => {
  visibleHeaders.value = newColumns
  // Сохраняем конфигурацию в localStorage
  saveColumnConfiguration(newColumns)
  appStore.showSuccess('Конфигурация столбцов обновлена')
}

const saveColumnConfiguration = (columns) => {
  try {
    localStorage.setItem('activities-table-columns', JSON.stringify(columns))
  } catch (error) {
    console.error('Error saving column configuration:', error)
  }
}

const loadColumnConfiguration = () => {
  try {
    const saved = localStorage.getItem('activities-table-columns')
    if (saved) {
      const savedColumns = JSON.parse(saved)
      // Валидируем сохраненные столбцы
      const validColumns = savedColumns.filter(savedCol =>
        availableColumns.value.some(availableCol => availableCol.key === savedCol.key)
      )
      if (validColumns.length > 0) {
        visibleHeaders.value = validColumns
      }
    }
  } catch (error) {
    console.error('Error loading column configuration:', error)
  }
}

// Экспортируем методы для внешнего доступа
defineExpose({
  openColumnEditor
})

// Lifecycle
onMounted(() => {
  loadColumnConfiguration()
})

const exportToExcel = () => {
  appStore.showInfo('Экспорт в Excel будет реализован в следующих версиях')
}

// Методы для inline редактирования
const startInlineEdit = (item, field) => {
  if (!inlineEditMode.value) {
    editingCell.value = { itemId: item.activity_id, field: field }

    // Устанавливаем текущее значение для редактирования
    switch (field) {
      case 'name':
        editingValue.value = item.name
        break
      case 'status':
        editingValue.value = item.status
        break
      case 'planned_costs':
        editingValue.value = getMockPlannedCosts(item.activity_id).toString()
        break
      case 'responsible':
        // Находим ID ответственного по имени
        const currentResponsible = responsibleOptions.find(opt => opt.name === getResponsibleName(item.activity_id))
        editingValue.value = currentResponsible ? currentResponsible.id : 'petrov'
        break
      default:
        editingValue.value = ''
    }

    inlineEditMode.value = true
  }
}

const isEditing = (item, field) => {
  return editingCell.value &&
    editingCell.value.itemId === item.activity_id &&
    editingCell.value.field === field &&
    inlineEditMode.value
}

const saveInlineEdit = async (item, field) => {
  if (!isEditing(item, field)) return

  try {
    let newValue = editingValue.value

    // Валидация и обработка значений по типу поля
    switch (field) {
      case 'name':
        if (!newValue.trim()) {
          appStore.showError('Название активности не может быть пустым')
          return
        }
        break
      case 'planned_costs':
        const numValue = parseFloat(newValue)
        if (isNaN(numValue) || numValue < 0) {
          appStore.showError('Планируемые затраты должны быть положительным числом')
          return
        }
        newValue = numValue
        break
      case 'responsible':
        const selectedResponsible = responsibleOptions.find(opt => opt.id === newValue)
        if (!selectedResponsible) {
          appStore.showError('Выберите ответственного сотрудника')
          return
        }
        break
    }

    // Имитируем обновление данных (в реальном приложении здесь будет API вызов)
    await updateActivityField(item.activity_id, field, newValue)

    cancelInlineEdit()
    appStore.showSuccess(`${getFieldDisplayName(field)} обновлено`)
  } catch (error) {
    appStore.showError(`Ошибка обновления: ${error.message}`)
  }
}

const cancelInlineEdit = () => {
  editingCell.value = null
  editingValue.value = ''
  inlineEditMode.value = false
}

const updateActivityField = async (activityId, field, value) => {
  // Имитируем API вызов с задержкой
  await new Promise(resolve => setTimeout(resolve, 300))

  // В реальном приложении здесь будет:
  // await activitiesStore.updateActivityField(activityId, field, value)

  console.log(`Updating activity ${activityId}: ${field} = ${value}`)

  // Для демонстрации обновляем локальные данные
  const activity = tableData.value.find(a => a.activity_id === activityId)
  if (activity) {
    switch (field) {
      case 'name':
        activity.name = value
        break
      case 'status':
        activity.status = value
        break
      case 'planned_costs':
        // Mock обновление planned_costs (в реальности через store)
        break
      case 'responsible':
        // Mock обновление responsible (в реальности через store)
        break
    }
  }
}

const getFieldDisplayName = (field) => {
  const fieldNames = {
    'name': 'Название',
    'status': 'Статус',
    'planned_costs': 'Планируемые затраты',
    'responsible': 'Ответственный'
  }
  return fieldNames[field] || 'Поле'
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

/* Стили для inline редактирования */
.editable-field {
  cursor: pointer;
  border-radius: 4px;
  padding: 2px 4px;
  transition: background-color 0.2s ease;
}

.editable-field:hover {
  background-color: rgba(25, 118, 210, 0.08);
  outline: 1px solid rgba(25, 118, 210, 0.3);
}

.inline-edit-container {
  min-width: 150px;
}

.inline-edit-container .v-text-field,
.inline-edit-container .v-select {
  min-height: auto;
}

.inline-edit-container :deep(.v-field) {
  min-height: 32px;
}

.inline-edit-container :deep(.v-field__input) {
  min-height: 32px;
  padding-top: 4px;
  padding-bottom: 4px;
}

.activity-name-cell .inline-edit-container {
  min-width: 200px;
}

.responsible-cell .inline-edit-container {
  min-width: 180px;
}

/* Подсказка для пользователей */
:deep(.v-data-table__wrapper) {
  position: relative;
}

:deep(.v-data-table__wrapper)::before {
  content: 'Двойной клик для редактирования';
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 1;
}

:deep(.v-data-table__wrapper):hover::before {
  opacity: 1;
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

  .inline-edit-container {
    min-width: 120px;
  }

  .activity-name-cell .inline-edit-container {
    min-width: 150px;
  }

  .responsible-cell .inline-edit-container {
    min-width: 140px;
  }

  :deep(.v-data-table__wrapper)::before {
    display: none;
  }
}
</style>