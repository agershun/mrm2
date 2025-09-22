<template>
  <div class="insights-view">
    <!-- Заголовок страницы -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Аналитика</h1>
        <p class="text-body-1 text-medium-emphasis">
          Комплексная аналитика и инсайты по маркетинговой эффективности
        </p>
      </div>
      <v-spacer />

      <!-- Переключатель дашбордов -->
      <v-btn-toggle v-model="currentDashboard" mandatory variant="outlined" class="me-4">
        <v-btn value="main" size="small">
          <v-icon>mdi-view-dashboard</v-icon>
          Главный
        </v-btn>
        <v-btn value="performance" size="small">
          <v-icon>mdi-chart-line</v-icon>
          Производительность
        </v-btn>
        <v-btn value="roi" size="small">
          <v-icon>mdi-trending-up</v-icon>
          ROI
        </v-btn>
        <v-btn value="funnel" size="small">
          <v-icon>mdi-filter-variant</v-icon>
          Воронка
        </v-btn>
      </v-btn-toggle>

      <!-- Период -->
      <v-select
        v-model="selectedDateRange"
        :items="dateRangeOptions"
        label="Период"
        variant="outlined"
        density="compact"
        style="width: 180px"
        class="me-4"
        @update:modelValue="onDateRangeChange"
      />

      <!-- Действия -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            v-bind="props"
            :disabled="isLoading"
          >
            <v-icon>mdi-cog</v-icon>
            Действия
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="generateReport">
            <v-list-item-title>
              <v-icon class="me-2">mdi-file-chart</v-icon>
              Создать отчет
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="exportData">
            <v-list-item-title>
              <v-icon class="me-2">mdi-download</v-icon>
              Экспорт данных
            </v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item @click="showCustomWidget">
            <v-list-item-title>
              <v-icon class="me-2">mdi-widgets</v-icon>
              Создать виджет
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="configureDashboard">
            <v-list-item-title>
              <v-icon class="me-2">mdi-tune</v-icon>
              Настройки дашборда
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Основной контент -->
    <div class="dashboard-container">
      <!-- Главный дашборд -->
      <template v-if="currentDashboard === 'main'">
        <MainDashboard />
      </template>

      <!-- Дашборд производительности -->
      <template v-if="currentDashboard === 'performance'">
        <PerformanceDashboard />
      </template>

      <!-- ROI дашборд -->
      <template v-if="currentDashboard === 'roi'">
        <ROIDashboard />
      </template>

      <!-- Воронка дашборд -->
      <template v-if="currentDashboard === 'funnel'">
        <FunnelDashboard />
      </template>
    </div>

    <!-- Диалог создания виджета -->
    <v-dialog v-model="showWidgetDialog" max-width="600">
      <v-card>
        <v-card-title>Создать пользовательский виджет</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createWidget">
            <v-text-field
              v-model="newWidget.name"
              label="Название виджета"
              required
              :rules="[v => !!v || 'Название обязательно']"
            />
            <v-select
              v-model="newWidget.type"
              :items="widgetTypes"
              label="Тип виджета"
              required
            />
            <v-select
              v-model="newWidget.data_source"
              :items="dataSources"
              label="Источник данных"
              required
            />
            <v-textarea
              v-model="newWidget.description"
              label="Описание"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showWidgetDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="createWidget" :loading="isCreatingWidget">
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог экспорта -->
    <v-dialog v-model="showExportDialog" max-width="500">
      <v-card>
        <v-card-title>Экспорт данных</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="performExport">
            <v-select
              v-model="exportConfig.data_type"
              :items="exportDataTypes"
              label="Тип данных"
              required
            />
            <v-select
              v-model="exportConfig.format"
              :items="exportFormats"
              label="Формат"
              required
            />
            <v-checkbox
              v-model="exportConfig.include_filters"
              label="Включить текущие фильтры"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showExportDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="performExport" :loading="isExporting">
            Экспортировать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'
import { useInsightsStore } from '@/stores/insightsStore'
import MainDashboard from '@/components/insights/dashboards/MainDashboard.vue'
import PerformanceDashboard from '@/components/insights/dashboards/PerformanceDashboard.vue'
import ROIDashboard from '@/components/insights/dashboards/ROIDashboard.vue'
import FunnelDashboard from '@/components/insights/dashboards/FunnelDashboard.vue'

export default {
  name: 'InsightsView',
  components: {
    MainDashboard,
    PerformanceDashboard,
    ROIDashboard,
    FunnelDashboard
  },
  setup() {
    const insightsStore = useInsightsStore()

    // Reactive state
    const currentDashboard = ref('main')
    const selectedDateRange = ref('last_30_days')
    const showWidgetDialog = ref(false)
    const showExportDialog = ref(false)
    const isCreatingWidget = ref(false)
    const isExporting = ref(false)

    const newWidget = ref({
      name: '',
      type: '',
      data_source: '',
      description: ''
    })

    const exportConfig = ref({
      data_type: 'performance',
      format: 'xlsx',
      include_filters: true
    })

    // Computed properties
    const isLoading = computed(() => insightsStore.isLoading)

    const dateRangeOptions = computed(() => [
      { title: 'Последние 7 дней', value: 'last_7_days' },
      { title: 'Последние 30 дней', value: 'last_30_days' },
      { title: 'Последние 90 дней', value: 'last_90_days' },
      { title: 'Этот месяц', value: 'current_month' },
      { title: 'Прошлый месяц', value: 'previous_month' },
      { title: 'Этот квартал', value: 'current_quarter' }
    ])

    const widgetTypes = computed(() => [
      { title: 'График линий', value: 'line_chart' },
      { title: 'Столбчатая диаграмма', value: 'bar_chart' },
      { title: 'Круговая диаграмма', value: 'pie_chart' },
      { title: 'KPI виджет', value: 'kpi_widget' },
      { title: 'Таблица', value: 'data_table' },
      { title: 'Воронка', value: 'funnel_chart' }
    ])

    const dataSources = computed(() => [
      { title: 'Данные производительности', value: 'performance_data' },
      { title: 'KPI метрики', value: 'kpi_data' },
      { title: 'Воронка конверсии', value: 'funnel_data' },
      { title: 'Инвестиции', value: 'investments' },
      { title: 'Активности', value: 'activities' }
    ])

    const exportDataTypes = computed(() => [
      { title: 'Данные производительности', value: 'performance' },
      { title: 'KPI метрики', value: 'kpi' },
      { title: 'Воронка конверсии', value: 'funnel' },
      { title: 'Отчеты', value: 'reports' }
    ])

    const exportFormats = computed(() => [
      { title: 'Excel (XLSX)', value: 'xlsx' },
      { title: 'CSV', value: 'csv' },
      { title: 'JSON', value: 'json' },
      { title: 'PDF', value: 'pdf' }
    ])

    // Methods
    const onDateRangeChange = (range) => {
      const dateRanges = {
        'last_7_days': {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        'last_30_days': {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        'last_90_days': {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      }

      const dateRange = dateRanges[range] || dateRanges['last_30_days']
      insightsStore.setDateRange(dateRange.start, dateRange.end)
    }

    const generateReport = async () => {
      try {
        await insightsStore.generateReport({
          title: 'Аналитический отчет',
          type: 'comprehensive',
          metrics: ['revenue', 'roi', 'conversions', 'impressions'],
          format: 'json'
        })
      } catch (error) {
        console.error('Error generating report:', error)
      }
    }

    const exportData = () => {
      showExportDialog.value = true
    }

    const performExport = async () => {
      try {
        isExporting.value = true
        await insightsStore.exportData(exportConfig.value)
        showExportDialog.value = false
      } catch (error) {
        console.error('Error exporting data:', error)
      } finally {
        isExporting.value = false
      }
    }

    const showCustomWidget = () => {
      newWidget.value = {
        name: '',
        type: '',
        data_source: '',
        description: ''
      }
      showWidgetDialog.value = true
    }

    const createWidget = async () => {
      if (!newWidget.value.name || !newWidget.value.type || !newWidget.value.data_source) return

      try {
        isCreatingWidget.value = true
        await insightsStore.createCustomWidget(newWidget.value)
        showWidgetDialog.value = false
      } catch (error) {
        console.error('Error creating widget:', error)
      } finally {
        isCreatingWidget.value = false
      }
    }

    const configureDashboard = () => {
      console.log('Configure dashboard')
      // TODO: Реализовать настройки дашборда
    }

    // Watchers
    watch(currentDashboard, (newDashboard) => {
      insightsStore.setDashboard(newDashboard)
    })

    // Lifecycle
    onMounted(async () => {
      await insightsStore.initialize()
    })

    return {
      // Store state
      isLoading,

      // Local state
      currentDashboard,
      selectedDateRange,
      showWidgetDialog,
      showExportDialog,
      isCreatingWidget,
      isExporting,
      newWidget,
      exportConfig,

      // Computed
      dateRangeOptions,
      widgetTypes,
      dataSources,
      exportDataTypes,
      exportFormats,

      // Methods
      onDateRangeChange,
      generateReport,
      exportData,
      performExport,
      showCustomWidget,
      createWidget,
      configureDashboard
    }
  }
}
</script>

<style scoped>
.insights-view {
  padding: 24px;
  height: 100vh;
  overflow: auto;
}

.dashboard-container {
  height: calc(100vh - 200px);
  overflow: auto;
}
</style>