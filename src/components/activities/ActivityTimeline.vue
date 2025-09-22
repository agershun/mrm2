<template>
  <div class="activity-timeline">
    <div class="timeline-container">
      <!-- Заголовок временной шкалы -->
      <div class="timeline-header">
        <v-container fluid class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <h3 class="text-h6">Временная шкала активностей</h3>
            <div class="timeline-controls d-flex align-center gap-2">
              <span class="text-caption text-grey-darken-1">Текущий день:</span>
              <div class="current-day-indicator"></div>
              <span class="text-caption">{{ currentDate }}</span>
            </div>
          </div>
        </v-container>
      </div>

      <!-- Основная область временной шкалы -->
      <div class="timeline-content">
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
                <div
                  v-if="activity.in_market_start_date && activity.in_market_end_date"
                  class="activity-bar"
                  :style="getActivityBarStyle(activity)"
                  :title="`${activity.name} (${formatDateRange(activity.in_market_start_date, activity.in_market_end_date)})`"
                >
                  <div class="activity-bar-content">
                    <span class="activity-bar-text">{{ activity.name }}</span>
                  </div>
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

// Mock timeline periods (в реальном приложении будет динамически генерироваться)
const timelinePeriods = ref([
  { id: 1, label: 'Янв 2025', width: '120px' },
  { id: 2, label: 'Фев 2025', width: '120px' },
  { id: 3, label: 'Мар 2025', width: '120px' },
  { id: 4, label: 'Апр 2025', width: '120px' },
  { id: 5, label: 'Май 2025', width: '120px' },
  { id: 6, label: 'Июн 2025', width: '120px' },
  { id: 7, label: 'Июл 2025', width: '120px' },
  { id: 8, label: 'Авг 2025', width: '120px' },
  { id: 9, label: 'Сен 2025', width: '120px' },
  { id: 10, label: 'Окт 2025', width: '120px' },
  { id: 11, label: 'Ноя 2025', width: '120px' },
  { id: 12, label: 'Дек 2025', width: '120px' }
])

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
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-bar:hover {
  transform: translateY(-50%) scale(1.05);
  z-index: 1;
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
</style>