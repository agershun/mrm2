<template>
  <div class="activity-ganttastic">
    <div class="gantt-controls mb-4">
      <v-container fluid class="pa-3">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-3">
            <v-select
              v-model="selectedTimespan"
              :items="timespanOptions"
              label="Временной диапазон"
              variant="outlined"
              density="compact"
              style="width: 180px"
              @update:model-value="updateTimespan"
            />
            <v-select
              v-model="selectedLevel"
              :items="levelOptions"
              label="Фильтр по уровню"
              variant="outlined"
              density="compact"
              style="width: 180px"
              @update:model-value="filterByLevel"
            />
            <v-select
              v-model="displayMode"
              :items="displayModeOptions"
              label="Вид отображения"
              variant="outlined"
              density="compact"
              style="width: 150px"
              @update:model-value="changeDisplayMode"
            />
          </div>

          <div class="d-flex align-center ga-2">
            <v-btn
              variant="outlined"
              size="small"
              prepend-icon="mdi-help-circle"
              @click="showInteractionHelp"
            >
              Управление
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              prepend-icon="mdi-information"
              @click="showInfo"
            >
              Информация
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              prepend-icon="mdi-table"
              @click="switchToTable"
            >
              Таблица
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <div class="gantt-wrapper">
      <div class="gantt-container">
        <!-- Timeline with Tree Structure -->
        <div v-if="displayMode === 'timeline'" class="enhanced-gantt">
          <div class="gantt-header">
            <div class="gantt-sidebar-header">Активности</div>
            <div class="gantt-timeline-header">
              <div class="timeline-months">
                <div
                  v-for="month in timelineMonths"
                  :key="month.key"
                  class="timeline-month"
                  :style="{ width: month.width + 'px' }"
                >
                  {{ month.label }}
                </div>
              </div>
            </div>
          </div>

          <div class="gantt-body">
            <div
              v-for="activity in filteredActivities"
              :key="activity.activity_id"
              class="gantt-row"
              :class="{ 'drop-zone-active': isDragging && draggedActivity?.activity_id !== activity.activity_id }"
              @click="selectActivity(activity)"
              @drop="onDrop(activity, $event)"
              @dragover.prevent
              @dragenter.prevent
            >
              <div class="gantt-sidebar">
                <div class="activity-info">
                  <div class="d-flex align-center ga-2">
                    <v-avatar :color="getActivityColor(activity)" size="small">
                      <v-icon color="white" size="small">{{ getActivityIcon(activity.hierarchy_level) }}</v-icon>
                    </v-avatar>
                    <div>
                      <div class="activity-name">{{ activity.name }}</div>
                      <div class="activity-meta">
                        {{ getHierarchyLabel(activity.hierarchy_level) }} • {{ getStatusLabel(activity.status) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="gantt-timeline">
                <div
                  class="activity-bar"
                  :class="{ 'dragging': isDragging && draggedActivity?.activity_id === activity.activity_id }"
                  :style="getActivityBarStyle(activity)"
                  draggable="true"
                  @click.stop="openActivityDetails(activity)"
                  @dragstart="onDragStart(activity, $event)"
                  @dragend="onDragEnd"
                  @mousedown="onBarMouseDown(activity, $event)"
                >
                  <!-- Левая ручка изменения размера -->
                  <div
                    class="resize-handle resize-handle-left"
                    @mousedown.stop="startResize(activity, 'left', $event)"
                    title="Изменить дату начала"
                  ></div>

                  <div class="activity-bar-content">
                    <div class="activity-bar-progress" :style="{ width: getActivityProgress(activity) + '%' }"></div>
                    <div class="activity-bar-label">{{ getActivityDuration(activity) }}</div>
                  </div>

                  <!-- Правая ручка изменения размера -->
                  <div
                    class="resize-handle resize-handle-right"
                    @mousedown.stop="startResize(activity, 'right', $event)"
                    title="Изменить дату окончания"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hierarchical Tree View -->
        <div v-else-if="displayMode === 'tree'" class="tree-container">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon class="me-2">mdi-file-tree</v-icon>
              Иерархическая структура активностей
            </v-card-title>
            <v-card-text>
              <v-treeview
                :items="hierarchyTree"
                item-key="id"
                item-title="name"
                item-children="children"
                :open-all="treeOpenAll"
                activatable
                @update:activated="onTreeItemActivated"
              >
                <template v-slot:prepend="{ item }">
                  <v-avatar :color="getActivityColor(item)" size="x-small" class="me-2">
                    <v-icon color="white" size="x-small">{{ getActivityIcon(item.hierarchy_level) }}</v-icon>
                  </v-avatar>
                </template>

                <template v-slot:append="{ item }">
                  <div class="d-flex align-center ga-2">
                    <v-chip
                      size="x-small"
                      :color="getStatusColor(item.status)"
                      variant="tonal"
                    >
                      {{ getStatusLabel(item.status) }}
                    </v-chip>
                    <v-chip
                      size="x-small"
                      color="primary"
                      variant="outlined"
                    >
                      {{ getHierarchyLabel(item.hierarchy_level) }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">
                      {{ getActivityDuration(item) }}
                    </span>
                  </div>
                </template>
              </v-treeview>
            </v-card-text>

            <v-card-actions>
              <v-btn
                :prepend-icon="treeOpenAll ? 'mdi-collapse-all' : 'mdi-expand-all'"
                variant="text"
                @click="toggleTreeOpenAll"
              >
                {{ treeOpenAll ? 'Свернуть всё' : 'Развернуть всё' }}
              </v-btn>
              <v-spacer />
              <v-btn
                prepend-icon="mdi-chart-timeline"
                color="primary"
                variant="outlined"
                @click="displayMode = 'timeline'"
              >
                К временной шкале
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>

        <div v-else class="empty-state">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            mdi-calendar-blank
          </v-icon>
          <h3 class="text-h6 mb-2">Нет активностей для отображения</h3>
          <p class="text-body-2 text-medium-emphasis">
            Создайте активности или измените фильтры для отображения данных
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'
import { useAppStore } from '@/stores/appStore'

const activitiesStore = useActivitiesStore()
const appStore = useAppStore()

// State
const selectedTimespan = ref('6months')
const selectedLevel = ref('all')
const displayMode = ref('timeline')
const treeOpenAll = ref(false)
const isDragging = ref(false)
const isResizing = ref(false)
const draggedActivity = ref(null)
const resizeData = ref({
  activity: null,
  handle: null, // 'left' or 'right'
  startX: 0,
  originalStart: null,
  originalEnd: null
})

// Options
const timespanOptions = [
  { title: '3 месяца', value: '3months' },
  { title: '6 месяцев', value: '6months' },
  { title: '1 год', value: '1year' },
  { title: '2 года', value: '2years' }
]

const levelOptions = [
  { title: 'Все уровни', value: 'all' },
  { title: 'Программы', value: 'Program' },
  { title: 'Кампании', value: 'Campaign' },
  { title: 'Флайты', value: 'Flight' },
  { title: 'Тактики', value: 'Tactic' }
]

const displayModeOptions = [
  { title: 'Временная шкала', value: 'timeline' },
  { title: 'Иерархическое дерево', value: 'tree' }
]

// Computed
const filteredActivities = computed(() => {
  let activities = activitiesStore.activities || []

  if (selectedLevel.value !== 'all') {
    activities = activities.filter(activity => activity.hierarchy_level === selectedLevel.value)
  }

  return activities
})

const timelineMonths = computed(() => {
  const now = new Date()
  const months = []
  const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

  const monthCount = {
    '3months': 3,
    '6months': 6,
    '1year': 12,
    '2years': 24
  }[selectedTimespan.value] || 6

  for (let i = 0; i < monthCount; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i - Math.floor(monthCount / 2), 1)
    months.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      width: 120
    })
  }

  return months
})

const hierarchyTree = computed(() => {
  const activities = filteredActivities.value
  if (!activities.length) return []

  // Создаем иерархическую структуру
  const buildTree = (parentId = null, level = 0) => {
    return activities
      .filter(activity => {
        if (level === 0) return activity.hierarchy_level === 'Program'
        if (level === 1) return activity.hierarchy_level === 'Campaign'
        if (level === 2) return activity.hierarchy_level === 'Flight'
        if (level === 3) return activity.hierarchy_level === 'Tactic'
        return activity.hierarchy_level === 'Placement'
      })
      .map(activity => ({
        ...activity,
        id: activity.activity_id,
        name: activity.name,
        children: level < 4 ? buildTree(activity.activity_id, level + 1) : []
      }))
      .filter(item => item.children.length > 0 || level >= 3) // Показываем элементы с детьми или листовые элементы на последних уровнях
  }

  return buildTree()
})

// Methods
const getActivityColor = (activity) => {
  const statusColors = {
    'Planning': '#ff9800',
    'In Market': '#4caf50',
    'Completed': '#9e9e9e',
    'Cancelled': '#f44336'
  }

  const levelColors = {
    'Program': '#1976d2',
    'Campaign': '#388e3c',
    'Flight': '#f57c00',
    'Tactic': '#7b1fa2',
    'Placement': '#424242'
  }

  return statusColors[activity.status] || levelColors[activity.hierarchy_level] || '#2196f3'
}

const getActivityIcon = (level) => {
  const icons = {
    'Program': 'mdi-folder-multiple',
    'Campaign': 'mdi-bullhorn',
    'Flight': 'mdi-airplane',
    'Tactic': 'mdi-strategy',
    'Placement': 'mdi-web'
  }
  return icons[level] || 'mdi-circle'
}

const getHierarchyLabel = (level) => {
  const labels = {
    'Program': 'Программа',
    'Campaign': 'Кампания',
    'Flight': 'Флайт',
    'Tactic': 'Тактика',
    'Placement': 'Размещение'
  }
  return labels[level] || level
}

const getStatusLabel = (status) => {
  const labels = {
    'Planning': 'Планирование',
    'In Market': 'В работе',
    'Completed': 'Завершено',
    'Cancelled': 'Отменено'
  }
  return labels[status] || status
}

const getStatusColor = (status) => {
  const colors = {
    'Planning': 'orange',
    'In Market': 'success',
    'Completed': 'grey',
    'Cancelled': 'error'
  }
  return colors[status] || 'grey'
}

const getActivityBarStyle = (activity) => {
  const startDate = new Date(activity.in_market_start_date)
  const endDate = new Date(activity.in_market_end_date)
  const timelineStart = timelineMonths.value[0] ? new Date(timelineMonths.value[0].key + '-01') : new Date()
  const timelineEnd = timelineMonths.value[timelineMonths.value.length - 1] ? new Date(timelineMonths.value[timelineMonths.value.length - 1].key + '-01') : new Date()
  timelineEnd.setMonth(timelineEnd.getMonth() + 1)

  const totalWidth = timelineMonths.value.length * 120
  const totalDuration = timelineEnd - timelineStart

  const left = Math.max(0, (startDate - timelineStart) / totalDuration * totalWidth)
  const width = Math.min(totalWidth - left, (endDate - startDate) / totalDuration * totalWidth)

  return {
    left: left + 'px',
    width: Math.max(width, 20) + 'px',
    backgroundColor: getActivityColor(activity),
    opacity: activity.status === 'Completed' ? 0.7 : 1
  }
}

const getActivityProgress = (activity) => {
  const statusProgress = {
    'Planning': 0,
    'In Market': 50,
    'Completed': 100,
    'Cancelled': 0
  }

  const baseProgress = statusProgress[activity.status] || 0

  if (activity.status === 'In Market') {
    const now = new Date()
    const start = new Date(activity.in_market_start_date)
    const end = new Date(activity.in_market_end_date)

    if (now >= start && now <= end) {
      const total = end - start
      const elapsed = now - start
      return Math.min(Math.round((elapsed / total) * 100), 90)
    }
  }

  return baseProgress
}

const getActivityDuration = (activity) => {
  const start = new Date(activity.in_market_start_date)
  const end = new Date(activity.in_market_end_date)
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

  if (days < 30) {
    return `${days} дн.`
  } else if (days < 365) {
    return `${Math.round(days / 30)} мес.`
  } else {
    return `${Math.round(days / 365)} г.`
  }
}

const selectActivity = (activity) => {
  activitiesStore.selectActivity(activity)
  appStore.showInfo(`Выбрана: ${activity.name}`)
}

const openActivityDetails = (activity) => {
  activitiesStore.selectActivity(activity)
  appStore.showInfo(`Открыты детали: ${activity.name}`)
}

const updateTimespan = () => {
  appStore.showInfo(`Период изменен на ${timespanOptions.find(t => t.value === selectedTimespan.value)?.title}`)
}

const filterByLevel = () => {
  appStore.showInfo(`Фильтр: ${levelOptions.find(l => l.value === selectedLevel.value)?.title}`)
}

const changeDisplayMode = () => {
  const mode = displayModeOptions.find(d => d.value === displayMode.value)?.title
  appStore.showInfo(`Режим отображения: ${mode}`)
}

const toggleTreeOpenAll = () => {
  treeOpenAll.value = !treeOpenAll.value
}

const onTreeItemActivated = (items) => {
  if (items.length > 0) {
    const activityId = items[0]
    const activity = filteredActivities.value.find(a => a.activity_id === activityId)
    if (activity) {
      selectActivity(activity)
    }
  }
}

const showInteractionHelp = () => {
  appStore.showInfo('💡 Управление: Перетаскивайте активности между строками. Тяните за края для изменения дат начала/окончания.')
}

const showInfo = () => {
  appStore.showInfo('Активности II - Расширенная временная шкала для планирования активностей с drag & drop')
}

const switchToTable = () => {
  activitiesStore.setView('summary')
}

// Drag and Drop Methods
const onDragStart = (activity, event) => {
  isDragging.value = true
  draggedActivity.value = activity
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', activity.activity_id)

  // Добавляем полупрозрачность во время перетаскивания
  setTimeout(() => {
    event.target.style.opacity = '0.5'
  }, 0)
}

const onDragEnd = (event) => {
  isDragging.value = false
  draggedActivity.value = null
  event.target.style.opacity = '1'
}

const onDrop = (targetActivity, event) => {
  event.preventDefault()
  const draggedId = event.dataTransfer.getData('text/plain')

  if (draggedActivity.value && draggedId !== targetActivity.activity_id) {
    // Здесь можно реализовать логику перестановки активностей
    appStore.showInfo(`Активность "${draggedActivity.value.name}" перемещена к "${targetActivity.name}"`)

    // Можно добавить логику изменения порядка или иерархии
    // activitiesStore.reorderActivities(draggedActivity.value, targetActivity)
  }
}

const onBarMouseDown = (activity, event) => {
  // Предотвращаем начало drag при клике на ручки изменения размера
  if (event.target.classList.contains('resize-handle')) {
    return
  }
}

// Resize Methods
const startResize = (activity, handle, event) => {
  event.preventDefault()
  event.stopPropagation()

  isResizing.value = true
  resizeData.value = {
    activity: activity,
    handle: handle,
    startX: event.clientX,
    originalStart: new Date(activity.in_market_start_date),
    originalEnd: new Date(activity.in_market_end_date)
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = handle === 'left' ? 'w-resize' : 'e-resize'
  document.body.style.userSelect = 'none'
}

const handleResize = (event) => {
  if (!isResizing.value || !resizeData.value.activity) return

  const deltaX = event.clientX - resizeData.value.startX
  const totalWidth = timelineMonths.value.length * 120
  const timelineStart = timelineMonths.value[0] ? new Date(timelineMonths.value[0].key + '-01') : new Date()
  const timelineEnd = timelineMonths.value[timelineMonths.value.length - 1] ? new Date(timelineMonths.value[timelineMonths.value.length - 1].key + '-01') : new Date()
  timelineEnd.setMonth(timelineEnd.getMonth() + 1)

  const totalDuration = timelineEnd - timelineStart
  const pixelsPerMs = totalWidth / totalDuration
  const msChange = deltaX / pixelsPerMs

  const activity = resizeData.value.activity
  let newStart = new Date(resizeData.value.originalStart)
  let newEnd = new Date(resizeData.value.originalEnd)

  if (resizeData.value.handle === 'left') {
    // Изменяем дату начала
    newStart = new Date(newStart.getTime() + msChange)
    // Ограничиваем минимальной длительностью в 1 день
    if (newStart >= newEnd) {
      newStart = new Date(newEnd.getTime() - 24 * 60 * 60 * 1000)
    }
  } else {
    // Изменяем дату окончания
    newEnd = new Date(newEnd.getTime() + msChange)
    // Ограничиваем минимальной длительностью в 1 день
    if (newEnd <= newStart) {
      newEnd = new Date(newStart.getTime() + 24 * 60 * 60 * 1000)
    }
  }

  // Временно обновляем данные активности для предварительного просмотра
  activity.in_market_start_date = newStart.toISOString().split('T')[0]
  activity.in_market_end_date = newEnd.toISOString().split('T')[0]
}

const stopResize = () => {
  if (!isResizing.value || !resizeData.value.activity) return

  const activity = resizeData.value.activity
  const newStartDate = activity.in_market_start_date
  const newEndDate = activity.in_market_end_date

  // Сохраняем изменения
  appStore.showInfo(`Даты активности "${activity.name}" изменены: ${newStartDate} - ${newEndDate}`)

  // Здесь можно добавить сохранение в store
  // activitiesStore.updateActivity(activity.activity_id, {
  //   in_market_start_date: newStartDate,
  //   in_market_end_date: newEndDate
  // })

  isResizing.value = false
  resizeData.value = {
    activity: null,
    handle: null,
    startX: 0,
    originalStart: null,
    originalEnd: null
  }

  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// Lifecycle
onMounted(() => {
  // Очистка event listeners при размонтировании
  return () => {
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }
})
</script>

<style scoped>
.activity-ganttastic {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.gantt-controls {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: #f8f9fa;
}

.gantt-wrapper {
  flex: 1;
  overflow: hidden;
}

.gantt-container {
  height: 100%;
  padding: 16px;
  overflow: auto;
}

.enhanced-gantt {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  min-height: 400px;
}

.gantt-header {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  background: #f5f5f5;
}

.gantt-sidebar-header {
  width: 350px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  border-right: 1px solid #e0e0e0;
}

.gantt-timeline-header {
  flex: 1;
  overflow-x: auto;
}

.timeline-months {
  display: flex;
  min-width: fit-content;
}

.timeline-month {
  padding: 12px;
  text-align: center;
  font-weight: 500;
  font-size: 13px;
  border-right: 1px solid #e0e0e0;
  background: #fafafa;
}

.gantt-body {
  max-height: 500px;
  overflow-y: auto;
}

.gantt-row {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  min-height: 56px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.gantt-row:hover {
  background-color: #f8f9fa;
}

.gantt-row.drop-zone-active {
  background-color: rgba(25, 118, 210, 0.08);
  border: 2px dashed rgba(25, 118, 210, 0.3);
  transition: all 0.2s;
}

.gantt-row.drop-zone-active:hover {
  background-color: rgba(25, 118, 210, 0.12);
  border-color: rgba(25, 118, 210, 0.5);
}

.gantt-sidebar {
  width: 350px;
  padding: 12px 16px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.activity-info {
  width: 100%;
}

.activity-name {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 4px;
}

.activity-meta {
  font-size: 12px;
  color: #666;
  line-height: 1;
}

.gantt-timeline {
  flex: 1;
  position: relative;
  overflow-x: auto;
  min-width: fit-content;
}

.activity-bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  border-radius: 12px;
  cursor: grab;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.activity-bar:active {
  cursor: grabbing;
}

.activity-bar:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transform: translateY(-50%) scale(1.02);
}

.activity-bar.dragging {
  opacity: 0.5;
  transform: translateY(-50%) scale(1.05);
  z-index: 1000;
}

.resize-handle {
  position: absolute;
  top: 0;
  width: 8px;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.resize-handle-left {
  left: -4px;
  cursor: w-resize;
  border-radius: 12px 0 0 12px;
}

.resize-handle-right {
  right: -4px;
  cursor: e-resize;
  border-radius: 0 12px 12px 0;
}

.activity-bar:hover .resize-handle {
  opacity: 1;
}

.resize-handle:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 4px rgba(0,0,0,0.3);
}

.activity-bar-content {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-bar-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px 0 0 12px;
  transition: width 0.3s;
}

.activity-bar-label {
  font-size: 11px;
  font-weight: 500;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  position: relative;
  z-index: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
}

.tree-container {
  height: 100%;
  overflow: auto;
  padding: 16px;
}

.tree-container .v-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-container .v-card-text {
  flex: 1;
  overflow: auto;
}

:deep(.v-treeview-item) {
  margin-bottom: 4px;
}

:deep(.v-treeview-item--active) {
  background-color: rgba(25, 118, 210, 0.08);
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .gantt-sidebar-header,
  .gantt-sidebar {
    width: 250px;
  }

  .timeline-month {
    width: 100px !important;
  }
}
</style>