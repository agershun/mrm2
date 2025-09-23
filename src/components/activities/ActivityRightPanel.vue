<template>
  <div class="activity-right-panel">
    <!-- Переключатель режимов отображения -->
    <div class="view-switcher">
      <v-container fluid class="pa-3">
        <div class="d-flex align-center justify-space-between">
          <v-btn-toggle
            v-model="currentView"
            color="primary"
            variant="outlined"
            divided
            mandatory
            @update:model-value="handleViewChange"
          >
            <v-btn value="timeline" size="small">
              <v-icon class="me-1">mdi-timeline</v-icon>
              Временная шкала
            </v-btn>
            <v-btn value="summary" size="small">
              <v-icon class="me-1">mdi-table</v-icon>
              Сводка
            </v-btn>
            <v-btn value="ganttastic" size="small">
              <v-icon class="me-1">mdi-chart-gantt</v-icon>
              Активности II
            </v-btn>
          </v-btn-toggle>

          <!-- Кнопки для текущего режима -->
          <div class="view-actions">
            <!-- Кнопки для режима Summary -->
            <template v-if="currentView === 'summary'">
              <v-btn
                variant="outlined"
                size="small"
                prepend-icon="mdi-table-column"
                @click="openColumnEditor"
              >
                Настроить столбцы
              </v-btn>
            </template>

            <!-- Кнопки для режима Timeline -->
            <template v-if="currentView === 'timeline'">
              <v-btn-group variant="outlined" size="small">
                <v-btn @click="changeTimelineZoom('month')">Месяц</v-btn>
                <v-btn @click="changeTimelineZoom('quarter')">Квартал</v-btn>
                <v-btn @click="changeTimelineZoom('year')">Год</v-btn>
              </v-btn-group>
            </template>

            <!-- Кнопки для режима Ganttastic -->
            <template v-if="currentView === 'ganttastic'">
              <v-btn
                variant="outlined"
                size="small"
                prepend-icon="mdi-help-circle"
                @click="showGanttasticHelp"
              >
                Справка
              </v-btn>
            </template>

          </div>
        </div>
      </v-container>
    </div>

    <!-- Область контента -->
    <div class="view-content">
      <!-- Временная шкала -->
      <div v-if="currentView === 'timeline'" class="timeline-container">
        <ActivityTimeline />
      </div>

      <!-- Сводная таблица -->
      <div v-if="currentView === 'summary'" class="summary-container">
        <ActivitySummary ref="summaryComponent" />
      </div>

      <!-- Ganttastic диаграмма -->
      <div v-if="currentView === 'ganttastic'" class="ganttastic-container">
        <ActivityGanttastic />
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'
import { useAppStore } from '@/stores/appStore'
import ActivityTimeline from './ActivityTimeline.vue'
import ActivitySummary from './ActivitySummary.vue'
import ActivityGanttastic from './ActivityGanttastic.vue'

const activitiesStore = useActivitiesStore()
const appStore = useAppStore()
const summaryComponent = ref(null)

// Computed
const currentView = computed({
  get: () => activitiesStore.currentView,
  set: (value) => activitiesStore.setView(value)
})

// Methods
const handleViewChange = (newView) => {
  if (newView) {
    currentView.value = newView
  }
}

const openColumnEditor = () => {
  // Делегируем управление редактором столбцов компоненту ActivitySummary
  if (summaryComponent.value) {
    summaryComponent.value.openColumnEditor()
  }
}

const changeTimelineZoom = (zoomLevel) => {
  // TODO: Изменить масштаб временной шкалы
  appStore.showInfo(`Масштаб "${zoomLevel}" будет реализован в следующих версиях`)
}

const showGanttasticHelp = () => {
  appStore.showInfo('Vue Ganttastic - современная Gantt-диаграмма для планирования активностей')
}

</script>

<style scoped>
.activity-right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.view-switcher {
  flex-shrink: 0;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.view-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-content {
  flex: 1;
  overflow: hidden;
  background: #fafafa;
}

.timeline-container,
.summary-container,
.ganttastic-container {
  height: 100%;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .view-switcher .d-flex {
    flex-direction: column;
    gap: 12px;
  }

  .view-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>