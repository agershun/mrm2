<template>
  <div class="activity-timeline">
    <div class="timeline-container">
      <!-- Заголовок временной шкалы -->
      <div class="timeline-header">
        <v-container fluid class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <h3 class="text-h6">Временная шкала активностей</h3>

            <!-- Элементы управления масштабом -->
            <div class="timeline-controls d-flex align-center gap-3">
              <!-- Масштаб -->
              <div class="zoom-controls d-flex align-center gap-2">
                <span class="text-caption text-grey-darken-1">Масштаб:</span>
                <v-btn-toggle
                  v-model="timelineZoom"
                  mandatory
                  variant="outlined"
                  size="small"
                  density="compact"
                  @update:model-value="handleZoomChange"
                >
                  <v-btn value="week" size="small">
                    Неделя
                  </v-btn>
                  <v-btn value="month" size="small">
                    Месяц
                  </v-btn>
                  <v-btn value="quarter" size="small">
                    Квартал
                  </v-btn>
                  <v-btn value="year" size="small">
                    Год
                  </v-btn>
                </v-btn-toggle>
              </div>

              <v-divider vertical />

              <!-- Настройки -->
              <div class="timeline-settings d-flex align-center gap-2">
                <v-switch
                  v-model="snapToGrid"
                  label="Привязка к сетке"
                  density="compact"
                  color="primary"
                  hide-details
                  inset
                />
                <v-switch
                  v-model="showDateConflicts"
                  label="Показывать конфликты"
                  density="compact"
                  color="warning"
                  hide-details
                  inset
                />
              </div>

              <v-divider vertical />

              <!-- Текущий день -->
              <div class="current-day d-flex align-center gap-2">
                <span class="text-caption text-grey-darken-1">Текущий день:</span>
                <div class="current-day-indicator"></div>
                <span class="text-caption">{{ currentDate }}</span>
              </div>
            </div>
          </div>
        </v-container>
      </div>

      <!-- Основная область временной шкалы -->
      <div class="timeline-content" ref="timelineContainer">
        <v-container fluid class="pa-0">
          <!-- Временная сетка (заголовки месяцев/кварталов) -->
          <div class="timeline-grid-header">
            <div class="activities-column">Активности</div>
            <div class="timeline-dates">
              <div
                v-for="period in timelinePeriods"
                :key="period.id"
                class="timeline-period"
                :style="{ width: period.width }"
              >
                {{ period.label }}
              </div>
            </div>
          </div>

          <!-- Временная сетка с активностями -->
          <div class="timeline-grid-body">
            <div
              v-if="!activitiesStore.isLoading && visibleActivities.length === 0"
              class="empty-state text-center pa-8"
            >
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-timeline-outline
              </v-icon>
              <h4 class="text-h6 mb-2">Нет активностей для отображения</h4>
              <p class="text-body-2 text-grey-darken-1">
                Активности появятся здесь после создания или изменения фильтров
              </p>
            </div>

            <div
              v-for="activity in visibleActivities"
              :key="activity.activity_id"
              class="timeline-row"
              :class="{ 'selected': isActivitySelected(activity.activity_id) }"
              @click="selectActivity(activity.activity_id)"
            >
              <!-- Название активности -->
              <div class="activity-name-column">
                <div class="activity-info">
                  <v-icon
                    :icon="getActivityIcon(activity.activity_type_id)"
                    :color="getActivityColor(activity.activity_type_id)"
                    size="16"
                    class="me-2"
                  />
                  <span class="text-body-2">{{ activity.name }}</span>
                  <v-chip
                    :color="getStatusColor(activity.status)"
                    size="x-small"
                    variant="outlined"
                    class="ml-2"
                  >
                    {{ getStatusText(activity.status) }}
                  </v-chip>
                </div>
              </div>

              <!-- Временные блоки активности -->
              <div class="timeline-bars">
                <!-- Предварительный просмотр при перетаскивании -->
                <div
                  v-if="dragPreview && draggedActivity === activity.activity_id"
                  class="activity-bar drag-preview"
                  :style="getDragPreviewStyle(activity)"
                >
                  <div class="activity-bar-content">
                    <span class="activity-bar-text">{{ activity.name }}</span>
                  </div>
                </div>

                <div
                  v-if="activity.in_market_start_date && activity.in_market_end_date"
                  class="activity-bar"
                  :class="{
                    'dragging': isDragging && draggedActivity === activity.activity_id,
                    'has-conflicts': hasDateConflicts(activity)
                  }"
                  :style="getActivityBarStyle(activity)"
                  :title="getActivityTooltip(activity)"
                  @mousedown="startDrag($event, activity)"
                >
                  <!-- Ручка для изменения начальной даты -->
                  <div
                    class="resize-handle resize-handle-start"
                    @mousedown.stop="startResize($event, activity, 'start')"
                    title="Изменить дату начала"
                  ></div>

                  <div class="activity-bar-content">
                    <span class="activity-bar-text">{{ activity.name }}</span>
                  </div>

                  <!-- Ручка для изменения конечной даты -->
                  <div
                    class="resize-handle resize-handle-end"
                    @mousedown.stop="startResize($event, activity, 'end')"
                    title="Изменить дату окончания"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Индикатор текущего дня -->
            <div class="current-day-line" :style="currentDayLineStyle"></div>
          </div>

          <!-- Загрузка -->
          <div v-if="activitiesStore.isLoading" class="loading-overlay">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </v-container>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'

const activitiesStore = useActivitiesStore()

// State
const timelineZoom = ref('month') // 'month', 'quarter', 'year'
const isDragging = ref(false)
const isResizing = ref(false)
const draggedActivity = ref(null)
const resizeMode = ref(null) // 'start' | 'end'
const dragStartX = ref(0)
const originalDates = ref({})
const timelineContainer = ref(null)
const snapToGrid = ref(true)
const showDateConflicts = ref(true)
const dragPreview = ref(null) // Для показа предварительного результата

// Computed
const currentDate = computed(() => {
  return new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

const visibleActivities = computed(() => {
  return activitiesStore.filteredActivities.filter(activity =>
    activity.in_market_start_date && activity.in_market_end_date
  )
})

// Динамические временные периоды в зависимости от масштаба
const timelinePeriods = computed(() => {
  return generateTimelinePeriods(timelineZoom.value)
})

const currentDayLineStyle = computed(() => {
  // Позиция текущего дня (в реальном приложении рассчитывается динамически)
  const todayPosition = '25%' // Mock значение
  return {
    left: `calc(280px + ${todayPosition})`
  }
})

// Methods
const selectActivity = (activityId) => {
  activitiesStore.selectActivity(activityId)
}

const isActivitySelected = (activityId) => {
  return activitiesStore.selectedActivity === activityId
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

const getActivityBarStyle = (activity) => {
  // В реальном приложении здесь будет расчет позиции и ширины блока
  // на основе дат начала и окончания активности
  const startPosition = '10%' // Mock
  const width = '40%' // Mock
  const color = getActivityColor(activity.activity_type_id)

  return {
    left: startPosition,
    width: width,
    backgroundColor: `var(--v-theme-${color})`,
    opacity: activity.status === 'Completed' ? 0.6 : 1
  }
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('ru-RU')
  const end = new Date(endDate).toLocaleDateString('ru-RU')
  return start === end ? start : `${start} - ${end}`
}

// Методы для drag & drop
const startDrag = (event, activity) => {
  // Игнорируем если уже идет изменение размера
  if (isResizing.value) return

  isDragging.value = true
  draggedActivity.value = activity.activity_id
  dragStartX.value = event.clientX

  // Сохраняем оригинальные даты
  originalDates.value = {
    start: activity.in_market_start_date,
    end: activity.in_market_end_date
  }

  // Инициализируем предварительный просмотр
  dragPreview.value = {
    start: activity.in_market_start_date,
    end: activity.in_market_end_date
  }

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'grabbing'
  document.body.style.userSelect = 'none'

  event.preventDefault()
}

const handleDrag = (event) => {
  if (!isDragging.value || !draggedActivity.value) return

  const deltaX = event.clientX - dragStartX.value
  let deltaTime = pixelsToTime(deltaX)

  // Применяем snap-to-grid если включен
  if (snapToGrid.value) {
    deltaTime = snapToNearestDay(deltaTime)
  }

  if (deltaTime !== 0) {
    updateDragPreview(draggedActivity.value, deltaTime, 'move')
  }
}

const stopDrag = async () => {
  if (isDragging.value && draggedActivity.value && dragPreview.value) {
    // Проверяем конфликты дат перед сохранением
    const conflicts = checkDateConflicts(draggedActivity.value, dragPreview.value)

    if (conflicts.length > 0 && showDateConflicts.value) {
      const shouldProceed = confirm(
        `Внимание! Обнаружены конфликты дат с активностями:\n${conflicts.map(c => c.name).join(', ')}\n\nПродолжить?`
      )
      if (!shouldProceed) {
        // Сбрасываем изменения
        dragPreview.value = null
        isDragging.value = false
        draggedActivity.value = null
        document.removeEventListener('mousemove', handleDrag)
        document.removeEventListener('mouseup', stopDrag)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        return
      }
    }

    // Применяем изменения из предварительного просмотра
    await applyDragPreview(draggedActivity.value)
  }

  dragPreview.value = null
  isDragging.value = false
  draggedActivity.value = null
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

const startResize = (event, activity, mode) => {
  isResizing.value = true
  draggedActivity.value = activity.activity_id
  resizeMode.value = mode
  dragStartX.value = event.clientX

  // Сохраняем оригинальные даты
  originalDates.value = {
    start: activity.in_market_start_date,
    end: activity.in_market_end_date
  }

  // Инициализируем предварительный просмотр
  dragPreview.value = {
    start: activity.in_market_start_date,
    end: activity.in_market_end_date
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = mode === 'start' ? 'w-resize' : 'e-resize'
  document.body.style.userSelect = 'none'

  event.preventDefault()
  event.stopPropagation()
}

const handleResize = (event) => {
  if (!isResizing.value || !draggedActivity.value) return

  const deltaX = event.clientX - dragStartX.value
  let deltaTime = pixelsToTime(deltaX)

  // Применяем snap-to-grid если включен
  if (snapToGrid.value) {
    deltaTime = snapToNearestDay(deltaTime)
  }

  if (deltaTime !== 0) {
    updateDragPreview(draggedActivity.value, deltaTime, resizeMode.value)
  }
}

const stopResize = async () => {
  if (isResizing.value && draggedActivity.value && dragPreview.value) {
    // Проверяем минимальную длительность активности (1 день)
    const startDate = new Date(dragPreview.value.start)
    const endDate = new Date(dragPreview.value.end)
    const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24)

    if (daysDiff < 1) {
      alert('Минимальная длительность активности - 1 день')
      dragPreview.value = null
      isResizing.value = false
      draggedActivity.value = null
      resizeMode.value = null
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('mouseup', stopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      return
    }

    // Применяем изменения из предварительного просмотра
    await applyDragPreview(draggedActivity.value)
  }

  dragPreview.value = null
  isResizing.value = false
  draggedActivity.value = null
  resizeMode.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Вспомогательные функции
const pixelsToTime = (pixels) => {
  // Более точная конвертация пикселей в дни на основе размеров контейнера
  if (!timelineContainer.value) return 0

  const containerWidth = timelineContainer.value.offsetWidth - 280 // Минус ширина колонки активностей
  const daysInTimeline = getDaysInTimeline()
  const pixelsPerDay = containerWidth / daysInTimeline

  return Math.round(pixels / pixelsPerDay)
}

const getDaysInTimeline = () => {
  // Вычисляем количество дней в видимом диапазоне временной шкалы
  switch (timelineZoom.value) {
    case 'week':
      return 7
    case 'month':
      return 30
    case 'quarter':
      return 90
    case 'year':
      return 365
    default:
      return 30
  }
}

const generateTimelinePeriods = (zoomLevel) => {
  const currentDate = new Date()
  const periods = []

  switch (zoomLevel) {
    case 'week': {
      // Показываем 4 недели
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() + (i * 7))
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Начало недели (воскресенье)

        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)

        periods.push({
          id: i + 1,
          label: `${weekStart.getDate()}.${String(weekStart.getMonth() + 1).padStart(2, '0')} - ${weekEnd.getDate()}.${String(weekEnd.getMonth() + 1).padStart(2, '0')}`,
          width: '200px'
        })
      }
      break
    }

    case 'month': {
      // Показываем 12 месяцев
      const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
      for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentDate.getFullYear(), i, 1)
        periods.push({
          id: i + 1,
          label: `${months[i]} ${monthDate.getFullYear()}`,
          width: '120px'
        })
      }
      break
    }

    case 'quarter': {
      // Показываем 4 квартала
      const quarters = ['Q1', 'Q2', 'Q3', 'Q4']
      for (let i = 0; i < 4; i++) {
        periods.push({
          id: i + 1,
          label: `${quarters[i]} ${currentDate.getFullYear()}`,
          width: '300px'
        })
      }
      break
    }

    case 'year': {
      // Показываем 3 года
      for (let i = -1; i <= 1; i++) {
        const year = currentDate.getFullYear() + i
        periods.push({
          id: i + 2,
          label: `${year}`,
          width: '400px'
        })
      }
      break
    }

    default:
      return generateTimelinePeriods('month')
  }

  return periods
}

const handleZoomChange = (newZoom) => {
  // Пересчитываем позиции активностей при изменении масштаба
  if (newZoom) {
    recalculateActivityPositions()
  }
}

const recalculateActivityPositions = () => {
  // В реальном приложении здесь будет пересчет позиций всех активностей
  // на основе их дат и нового масштаба временной шкалы
  console.log(`Пересчет позиций для масштаба: ${timelineZoom.value}`)
}

const updateDragPreview = (activityId, deltaTime, mode) => {
  if (!dragPreview.value) return

  const startDate = new Date(originalDates.value.start)
  const endDate = new Date(originalDates.value.end)

  switch (mode) {
    case 'move':
      // Перемещение всего блока
      startDate.setDate(startDate.getDate() + deltaTime)
      endDate.setDate(endDate.getDate() + deltaTime)
      break
    case 'start':
      // Изменение только начальной даты
      startDate.setDate(startDate.getDate() + deltaTime)
      // Проверяем, что начальная дата не позже конечной
      if (startDate >= endDate) {
        startDate.setTime(endDate.getTime() - 24 * 60 * 60 * 1000) // На день раньше
      }
      break
    case 'end':
      // Изменение только конечной даты
      endDate.setDate(endDate.getDate() + deltaTime)
      // Проверяем, что конечная дата не раньше начальной
      if (endDate <= startDate) {
        endDate.setTime(startDate.getTime() + 24 * 60 * 60 * 1000) // На день позже
      }
      break
  }

  // Обновляем предварительный просмотр
  dragPreview.value = {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0]
  }
}

const applyDragPreview = async (activityId) => {
  if (!dragPreview.value) return

  try {
    const activity = visibleActivities.value.find(a => a.activity_id === activityId)
    if (!activity) return

    // Обновляем локальные данные
    activity.in_market_start_date = dragPreview.value.start
    activity.in_market_end_date = dragPreview.value.end

    // Сохраняем в store
    await activitiesStore.updateActivity(activityId, {
      in_market_start_date: dragPreview.value.start,
      in_market_end_date: dragPreview.value.end
    })
  } catch (error) {
    // В случае ошибки возвращаем оригинальные даты
    const activity = visibleActivities.value.find(a => a.activity_id === activityId)
    if (activity && originalDates.value) {
      activity.in_market_start_date = originalDates.value.start
      activity.in_market_end_date = originalDates.value.end
    }
    console.error('Error saving activity dates:', error)
  }
}

// Новые вспомогательные функции
const snapToNearestDay = (deltaTime) => {
  // Привязка к ближайшему дню
  return Math.round(deltaTime)
}

const checkDateConflicts = (activityId, previewDates) => {
  const conflicts = []
  const startDate = new Date(previewDates.start)
  const endDate = new Date(previewDates.end)

  for (const activity of visibleActivities.value) {
    if (activity.activity_id === activityId) continue

    const activityStart = new Date(activity.in_market_start_date)
    const activityEnd = new Date(activity.in_market_end_date)

    // Проверяем пересечение дат
    if (startDate <= activityEnd && endDate >= activityStart) {
      conflicts.push(activity)
    }
  }

  return conflicts
}

const hasDateConflicts = (activity) => {
  if (!showDateConflicts.value) return false

  const conflicts = checkDateConflicts(activity.activity_id, {
    start: activity.in_market_start_date,
    end: activity.in_market_end_date
  })

  return conflicts.length > 0
}

const getDragPreviewStyle = (activity) => {
  if (!dragPreview.value) return {}

  // Используем те же расчеты, что и для обычного блока, но с preview датами
  const startPosition = '10%' // Mock - в реальном приложении будет расчет
  const width = '40%' // Mock
  const color = getActivityColor(activity.activity_type_id)

  return {
    left: startPosition,
    width: width,
    backgroundColor: `var(--v-theme-${color})`,
    opacity: 0.7,
    border: '2px dashed white'
  }
}

const getActivityTooltip = (activity) => {
  let tooltip = `${activity.name} (${formatDateRange(activity.in_market_start_date, activity.in_market_end_date)})`

  if (hasDateConflicts(activity)) {
    const conflicts = checkDateConflicts(activity.activity_id, {
      start: activity.in_market_start_date,
      end: activity.in_market_end_date
    })
    tooltip += `\n⚠️ Конфликт с: ${conflicts.map(c => c.name).join(', ')}`
  }

  return tooltip
}
</script>

<style scoped>
.activity-timeline {
  height: 100%;
  background: white;
}

.timeline-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-header {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.timeline-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.timeline-grid-header {
  display: flex;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
  background: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 2;
}

.activities-column {
  width: 280px;
  padding: 12px 16px;
  font-weight: 600;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.timeline-dates {
  display: flex;
  flex: 1;
}

.timeline-period {
  padding: 12px 8px;
  text-align: center;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  font-weight: 500;
  font-size: 0.875rem;
}

.timeline-grid-body {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.timeline-row {
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
  min-height: 48px;
}

.timeline-row:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.timeline-row.selected {
  background-color: rgba(25, 118, 210, 0.08);
}

.activity-name-column {
  width: 280px;
  padding: 12px 16px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
}

.activity-info {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.activity-info span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.timeline-bars {
  flex: 1;
  position: relative;
  min-height: 48px;
}

.activity-bar {
  position: absolute;
  height: 24px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 12px;
  cursor: grab;
  transition: all 0.2s ease;
  min-width: 60px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: visible;
}

.activity-bar:hover {
  transform: translateY(-50%) scale(1.05);
  z-index: 1;
}

.activity-bar.dragging {
  cursor: grabbing;
  z-index: 10;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: none;
}

.activity-bar.has-conflicts {
  border: 2px solid #ff5722;
  box-shadow: 0 0 8px rgba(255, 87, 34, 0.3);
}

.activity-bar.has-conflicts::after {
  content: '⚠️';
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff5722;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  z-index: 3;
}

.drag-preview {
  opacity: 0.7 !important;
  border: 2px dashed white !important;
  animation: drag-preview-pulse 1s infinite alternate;
}

@keyframes drag-preview-pulse {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 0.8;
  }
}

/* Ручки для изменения размера */
.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  background: transparent;
  cursor: col-resize;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 2;
}

.resize-handle-start {
  left: -4px;
  cursor: w-resize;
}

.resize-handle-end {
  right: -4px;
  cursor: e-resize;
}

.activity-bar:hover .resize-handle {
  opacity: 1;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}

.resize-handle:hover {
  background: rgba(255, 255, 255, 1) !important;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}

.resize-handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 12px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 1px;
}

.resize-handle:hover::before {
  background: rgba(0, 0, 0, 0.8);
}

.activity-bar-content {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  overflow: hidden;
}

.activity-bar-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.current-day-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #ff5722;
  z-index: 1;
  pointer-events: none;
}

.current-day-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ff5722;
}

.empty-state {
  color: #666;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

/* Стили для элементов управления временной шкалой */
.timeline-controls {
  flex-wrap: wrap;
}

.zoom-controls .v-btn-toggle {
  border-radius: 6px;
  overflow: hidden;
}

.timeline-settings .v-switch {
  flex-shrink: 0;
}

.current-day {
  flex-shrink: 0;
}

/* Адаптивность для элементов управления */
@media (max-width: 1400px) {
  .timeline-controls {
    gap: 8px;
  }

  .timeline-settings {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

@media (max-width: 1200px) {
  .timeline-controls {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .timeline-controls > div {
    flex-wrap: wrap;
  }
}

@media (max-width: 960px) {
  .timeline-header .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .timeline-controls {
    align-self: stretch;
    justify-content: space-between;
  }
}
</style>