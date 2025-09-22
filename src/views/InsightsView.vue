<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Панель навигации -->
      <v-col cols="3" class="border-e">
        <InsightsNavigation
          :dashboards="dashboards"
          :reports="reports"
          :selected-dashboard="selectedDashboard"
          :selected-report="selectedReport"
          @dashboard-selected="handleDashboardSelected"
          @report-selected="handleReportSelected"
        />
      </v-col>

      <!-- Основная область -->
      <v-col cols="9">
        <!-- Панель управления -->
        <InsightsControlBar
          :current-project="currentProject"
          :projects="projects"
          :saved-views="savedViews"
          :is-editing="isEditing"
          :can-edit="canEdit"
          @project-changed="handleProjectChanged"
          @refresh-data="handleRefreshData"
          @save-view="handleSaveView"
          @load-view="handleLoadView"
          @toggle-edit="handleToggleEdit"
        />

        <!-- Содержимое дашборда/отчета -->
        <div class="insights-content pa-4">
          <!-- Режим редактирования дашборда -->
          <DashboardEditMode
            v-if="selectedDashboard && isEditing"
            :dashboard="selectedDashboard"
            @save="handleDashboardSave"
            @cancel="handleEditCancel"
          />

          <!-- Обычный режим дашборда -->
          <InsightsDashboard
            v-else-if="selectedDashboard && !selectedReport"
            :dashboard="selectedDashboard"
            :tab-id="selectedTabId"
            :filters="dashboardFilters"
            :is-editing="isEditing"
            @tab-changed="handleTabChanged"
            @filters-changed="handleFiltersChanged"
            @widget-updated="handleWidgetUpdated"
            @report-drilldown="handleReportDrilldown"
          />

          <InsightsReport
            v-else-if="selectedReport"
            :report="selectedReport"
            :filters="reportFilters"
            @back-to-dashboard="handleBackToDashboard"
            @export-report="handleExportReport"
          />

          <!-- Состояние по умолчанию -->
          <div v-else class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-chart-areaspline
            </v-icon>
            <h3 class="text-h5 text-grey mb-2">
              Добро пожаловать в Insights
            </h3>
            <p class="text-grey">
              Выберите дашборд или отчет для начала аналитической работы
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Диалоги -->
    <SaveViewDialog
      v-model="showSaveViewDialog"
      :current-filters="currentFilters"
      @save="handleSaveViewConfirm"
    />

    <ExportDialog
      v-model="showExportDialog"
      :export-options="exportOptions"
      @export="handleExportConfirm"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useInsightsStore } from '@/stores/insightsStore'
import { useAppStore } from '@/stores/appStore'
import InsightsNavigation from '@/components/insights/InsightsNavigation.vue'
import InsightsControlBar from '@/components/insights/InsightsControlBar.vue'
import InsightsDashboard from '@/components/insights/InsightsDashboard.vue'
import InsightsReport from '@/components/insights/InsightsReport.vue'
import DashboardEditMode from '@/components/insights/DashboardEditMode.vue'
import SaveViewDialog from '@/components/insights/SaveViewDialog.vue'
import ExportDialog from '@/components/insights/ExportDialog.vue'

// Stores
const insightsStore = useInsightsStore()
const appStore = useAppStore()

// Reactive data
const selectedDashboard = ref(null)
const selectedReport = ref(null)
const selectedTabId = ref(null)
const dashboardFilters = ref({})
const reportFilters = ref({})
const currentProject = ref('q4_2025')
const isEditing = ref(false)
const showSaveViewDialog = ref(false)
const showExportDialog = ref(false)
const exportOptions = ref({})

// Computed
const dashboards = computed(() => insightsStore.dashboards)
const reports = computed(() => insightsStore.reports)
const projects = computed(() => insightsStore.projects)
const savedViews = computed(() => insightsStore.savedViews)
const canEdit = computed(() => appStore.user?.role === 'admin')
const currentFilters = computed(() => {
  return selectedDashboard.value ? dashboardFilters.value : reportFilters.value
})

// Methods
const handleDashboardSelected = async (dashboard) => {
  selectedReport.value = null
  selectedDashboard.value = dashboard
  selectedTabId.value = dashboard.tabs?.[0]?.tab_id || null
  dashboardFilters.value = {}

  // Загружаем данные дашборда
  await insightsStore.loadDashboardData(dashboard.dashboard_id)
}

const handleReportSelected = async (report) => {
  selectedDashboard.value = null
  selectedReport.value = report
  reportFilters.value = {}

  // Загружаем данные отчета
  await insightsStore.loadReportData(report.report_id)
}

const handleTabChanged = (tabId) => {
  selectedTabId.value = tabId
}

const handleFiltersChanged = (filters) => {
  if (selectedDashboard.value) {
    dashboardFilters.value = { ...filters }
  } else if (selectedReport.value) {
    reportFilters.value = { ...filters }
  }
}

const handleProjectChanged = (project) => {
  currentProject.value = project
  // Перезагружаем данные для нового проекта
  if (selectedDashboard.value) {
    insightsStore.loadDashboardData(selectedDashboard.value.dashboard_id, project)
  } else if (selectedReport.value) {
    insightsStore.loadReportData(selectedReport.value.report_id, project)
  }
}

const handleRefreshData = async () => {
  try {
    appStore.setLoading(true)

    if (selectedDashboard.value) {
      await insightsStore.loadDashboardData(selectedDashboard.value.dashboard_id, currentProject.value)
    } else if (selectedReport.value) {
      await insightsStore.loadReportData(selectedReport.value.report_id, currentProject.value)
    }

    appStore.showNotification('Данные обновлены', 'success')
  } catch (error) {
    appStore.showNotification('Ошибка обновления данных', 'error')
  } finally {
    appStore.setLoading(false)
  }
}

const handleSaveView = () => {
  showSaveViewDialog.value = true
}

const handleSaveViewConfirm = async (viewData) => {
  try {
    await insightsStore.saveView({
      ...viewData,
      dashboard_id: selectedDashboard.value?.dashboard_id,
      report_id: selectedReport.value?.report_id,
      tab_id: selectedTabId.value,
      filters: currentFilters.value,
      project: currentProject.value
    })

    appStore.showNotification('Представление сохранено', 'success')
    showSaveViewDialog.value = false
  } catch (error) {
    appStore.showNotification('Ошибка сохранения представления', 'error')
  }
}

const handleLoadView = async (view) => {
  try {
    if (view.dashboard_id) {
      const dashboard = dashboards.value.find(d => d.dashboard_id === view.dashboard_id)
      if (dashboard) {
        await handleDashboardSelected(dashboard)
        selectedTabId.value = view.tab_id
        dashboardFilters.value = view.filters || {}
      }
    } else if (view.report_id) {
      const report = reports.value.find(r => r.report_id === view.report_id)
      if (report) {
        await handleReportSelected(report)
        reportFilters.value = view.filters || {}
      }
    }

    currentProject.value = view.project || currentProject.value
    appStore.showNotification('Представление загружено', 'success')
  } catch (error) {
    appStore.showNotification('Ошибка загрузки представления', 'error')
  }
}

const handleToggleEdit = () => {
  isEditing.value = !isEditing.value
}

const handleWidgetUpdated = async (widget) => {
  try {
    await insightsStore.updateWidget(widget)
    appStore.showNotification('Виджет обновлен', 'success')
  } catch (error) {
    appStore.showNotification('Ошибка обновления виджета', 'error')
  }
}

const handleReportDrilldown = (report, filters) => {
  selectedReport.value = report
  selectedDashboard.value = null
  reportFilters.value = filters || {}
}

const handleBackToDashboard = () => {
  selectedReport.value = null
  // Возвращаемся к последнему выбранному дашборду
  if (dashboards.value.length > 0 && !selectedDashboard.value) {
    selectedDashboard.value = dashboards.value[0]
    selectedTabId.value = selectedDashboard.value.tabs?.[0]?.tab_id || null
  }
}

const handleExportReport = (report, format) => {
  exportOptions.value = {
    report,
    format,
    filters: reportFilters.value
  }
  showExportDialog.value = true
}

const handleExportConfirm = async (exportConfig) => {
  try {
    appStore.setLoading(true)
    const result = await insightsStore.exportData(exportConfig)

    // Симуляция скачивания файла
    const link = document.createElement('a')
    link.href = result.download_url
    link.download = result.file_name
    link.click()

    appStore.showNotification('Экспорт запущен', 'success')
    showExportDialog.value = false
  } catch (error) {
    appStore.showNotification('Ошибка экспорта', 'error')
  } finally {
    appStore.setLoading(false)
  }
}

const handleDashboardSave = async (dashboardData) => {
  try {
    await insightsStore.updateWidget(dashboardData)
    selectedDashboard.value = dashboardData
    isEditing.value = false
    appStore.showNotification('Дашборд сохранен', 'success')
  } catch (error) {
    appStore.showNotification('Ошибка сохранения дашборда', 'error')
  }
}

const handleEditCancel = () => {
  isEditing.value = false
}

// Lifecycle
onMounted(async () => {
  try {
    appStore.setLoading(true)

    // Загружаем основные данные
    await Promise.all([
      insightsStore.loadDashboards(),
      insightsStore.loadReports(),
      insightsStore.loadProjects(),
      insightsStore.loadSavedViews()
    ])

    // Выбираем первый дашборд по умолчанию
    if (dashboards.value.length > 0) {
      await handleDashboardSelected(dashboards.value[0])
    }
  } catch (error) {
    appStore.showNotification('Ошибка загрузки данных', 'error')
  } finally {
    appStore.setLoading(false)
  }
})
</script>

<style scoped>
.insights-content {
  height: calc(100vh - 64px - 56px); /* 100vh - header - control bar */
  overflow-y: auto;
}

.border-e {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>