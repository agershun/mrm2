<template>
  <div class="details-panel">
    <!-- Заголовок панели -->
    <div class="panel-header">
      <div class="pa-4">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="activity-title">
            <h3 class="text-h6">{{ selectedActivityData?.name || 'Активность' }}</h3>
            <p class="text-caption text-grey-darken-1 mb-0">
              {{ formatDateRange(selectedActivityData?.in_market_start_date, selectedActivityData?.in_market_end_date) }}
            </p>
          </div>

          <!-- Кнопка закрытия -->
          <v-btn
            icon
            variant="text"
            size="small"
            @click="closePanel"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- Действия с активностью -->
        <div class="activity-actions">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="outlined"
                size="small"
                append-icon="mdi-chevron-down"
              >
                Действия
              </v-btn>
            </template>

            <v-list density="compact">
              <v-list-item @click="addUnder">
                <template v-slot:prepend>
                  <v-icon>mdi-plus</v-icon>
                </template>
                <v-list-item-title>Добавить дочернюю</v-list-item-title>
              </v-list-item>

              <v-list-item @click="duplicate">
                <template v-slot:prepend>
                  <v-icon>mdi-content-copy</v-icon>
                </template>
                <v-list-item-title>Дублировать</v-list-item-title>
              </v-list-item>

              <v-list-item @click="syncActivity">
                <template v-slot:prepend>
                  <v-icon>mdi-sync</v-icon>
                </template>
                <v-list-item-title>Синхронизировать</v-list-item-title>
              </v-list-item>

              <v-divider />

              <v-list-item @click="deleteActivity" class="text-error">
                <template v-slot:prepend>
                  <v-icon color="error">mdi-delete</v-icon>
                </template>
                <v-list-item-title>Удалить активность</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </div>

    <!-- Вкладки -->
    <div class="panel-tabs">
      <v-tabs
        v-model="activeTab"
        density="compact"
        color="primary"
        bg-color="white"
      >
        <v-tab value="details">
          <v-icon class="me-1">mdi-information</v-icon>
          Детали
        </v-tab>
        <v-tab value="budget">
          <v-icon class="me-1">mdi-wallet</v-icon>
          Бюджет
        </v-tab>
        <v-tab value="impact">
          <v-icon class="me-1">mdi-chart-line</v-icon>
          Эффективность
        </v-tab>
        <v-tab value="kpis">
          <v-icon class="me-1">mdi-target</v-icon>
          KPI
        </v-tab>
        <v-tab
          v-if="hasWorkflow"
          value="workflow"
        >
          <v-icon class="me-1">mdi-workflow</v-icon>
          Процесс
        </v-tab>
      </v-tabs>
    </div>

    <!-- Содержимое вкладок -->
    <div class="panel-content">
      <v-tabs-window v-model="activeTab" class="tabs-window">
        <!-- Вкладка Details -->
        <v-tabs-window-item value="details">
          <DetailsPanelDetails :activity="selectedActivityData" />
        </v-tabs-window-item>

        <!-- Вкладка Budget -->
        <v-tabs-window-item value="budget">
          <DetailsPanelBudget :activity="selectedActivityData" />
        </v-tabs-window-item>

        <!-- Вкладка Impact -->
        <v-tabs-window-item value="impact">
          <DetailsPanelImpact :activity="selectedActivityData" />
        </v-tabs-window-item>

        <!-- Вкладка KPIs -->
        <v-tabs-window-item value="kpis">
          <DetailsPanelKPIs :activity="selectedActivityData" />
        </v-tabs-window-item>

        <!-- Вкладка Workflow -->
        <v-tabs-window-item
          v-if="hasWorkflow"
          value="workflow"
        >
          <DetailsPanelWorkflow :activity="selectedActivityData" />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'
import { useAppStore } from '@/stores/appStore'
import DetailsPanelDetails from './DetailsPanelDetails.vue'
import DetailsPanelBudget from './DetailsPanelBudget.vue'
import DetailsPanelImpact from './DetailsPanelImpact.vue'
import DetailsPanelKPIs from './DetailsPanelKPIs.vue'
import DetailsPanelWorkflow from './DetailsPanelWorkflow.vue'

const activitiesStore = useActivitiesStore()
const appStore = useAppStore()

// State
const activeTab = ref('details')

// Computed
const selectedActivityData = computed(() => activitiesStore.selectedActivityData)

const hasWorkflow = computed(() => {
  // В реальном приложении проверяем, есть ли workflow для данного типа активности
  return selectedActivityData.value?.activity_type_id === '3' ||
         selectedActivityData.value?.activity_type_id === '4'
})

// Methods
const closePanel = () => {
  activitiesStore.selectActivity(null)
}

const addUnder = () => {
  // TODO: Открыть мастер создания дочерней активности
  appStore.showInfo('Создание дочерней активности будет реализовано в следующих версиях')
}

const duplicate = async () => {
  if (!selectedActivityData.value) return

  try {
    await activitiesStore.duplicateActivity(selectedActivityData.value.activity_id)
    appStore.showSuccess('Активность дублирована успешно')
  } catch (error) {
    appStore.showError('Ошибка дублирования активности')
  }
}

const syncActivity = () => {
  // TODO: Синхронизировать с workflow
  appStore.showInfo('Синхронизация с рабочим процессом будет реализована в следующих версиях')
}

const deleteActivity = async () => {
  if (!selectedActivityData.value) return

  if (confirm('Вы уверены, что хотите удалить эту активность? Это действие нельзя отменить.')) {
    try {
      await activitiesStore.deleteActivity(selectedActivityData.value.activity_id)
      closePanel()
      appStore.showSuccess('Активность удалена')
    } catch (error) {
      appStore.showError('Ошибка удаления активности')
    }
  }
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return ''

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const start = formatDate(startDate)
  const end = formatDate(endDate)

  if (start && end) {
    if (start === end) return start
    return `${start} — ${end}`
  }

  return start || end
}
</script>

<style scoped>
.details-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.panel-header {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.activity-title h3 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.activity-actions {
  margin-top: 12px;
}

.panel-tabs {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.tabs-window {
  height: 100%;
}

:deep(.v-tabs-window-item) {
  height: 100%;
  overflow-y: auto;
}

/* Кастомные стили для вкладок */
:deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
  font-size: 0.875rem;
}

:deep(.v-tab--selected) {
  color: var(--v-theme-primary);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .activity-title h3 {
    max-width: 250px;
  }
}

@media (max-width: 960px) {
  .panel-header .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .activity-title {
    width: 100%;
  }

  .activity-title h3 {
    max-width: 100%;
  }
}
</style>