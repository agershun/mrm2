<template>
  <div class="insights-navigation">
    <!-- Заголовок -->
    <div class="navigation-header pa-4 border-b">
      <h3 class="text-h6 font-weight-medium">
        <v-icon class="me-2" color="primary">mdi-chart-areaspline</v-icon>
        Insights
      </h3>
    </div>

    <!-- Поиск -->
    <div class="pa-3">
      <v-text-field
        v-model="searchQuery"
        placeholder="Поиск дашбордов и отчетов..."
        density="compact"
        variant="outlined"
        hide-details
        prepend-inner-icon="mdi-magnify"
        clearable
      />
    </div>

    <v-divider />

    <!-- Содержимое навигации -->
    <div class="navigation-content">
      <!-- Дашборды -->
      <v-expansion-panels
        v-model="expandedPanels"
        multiple
        variant="accordion"
        class="elevation-0"
      >
        <!-- Секция дашбордов -->
        <v-expansion-panel value="dashboards">
          <v-expansion-panel-title class="text-subtitle-2 font-weight-medium">
            <v-icon class="me-2">mdi-view-dashboard</v-icon>
            Дашборды
            <template #actions>
              <v-chip size="small" color="primary" variant="text">
                {{ filteredDashboards.length }}
              </v-chip>
            </template>
          </v-expansion-panel-title>

          <v-expansion-panel-text class="pa-0">
            <v-list density="compact" class="py-0">
              <v-list-item
                v-for="dashboard in filteredDashboards"
                :key="dashboard.dashboard_id"
                :active="selectedDashboard?.dashboard_id === dashboard.dashboard_id"
                :title="dashboard.name"
                :subtitle="dashboard.description"
                @click="$emit('dashboard-selected', dashboard)"
                class="dashboard-item"
              >
                <template #prepend>
                  <v-icon
                    :icon="dashboard.icon || 'mdi-chart-box'"
                    :color="getCategoryColor(dashboard.category)"
                    size="small"
                  />
                </template>

                <template #append>
                  <v-chip
                    v-if="dashboard.status === 'active'"
                    size="x-small"
                    color="success"
                    variant="flat"
                  />
                  <v-chip
                    v-else
                    size="x-small"
                    color="warning"
                    variant="flat"
                  />
                </template>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Секция отчетов -->
        <v-expansion-panel value="reports">
          <v-expansion-panel-title class="text-subtitle-2 font-weight-medium">
            <v-icon class="me-2">mdi-file-chart</v-icon>
            Отчеты
            <template #actions>
              <v-chip size="small" color="secondary" variant="text">
                {{ filteredReports.length }}
              </v-chip>
            </template>
          </v-expansion-panel-title>

          <v-expansion-panel-text class="pa-0">
            <!-- Группировка отчетов по категориям -->
            <v-expansion-panels
              v-model="reportCategories"
              multiple
              variant="accordion"
              class="elevation-0"
            >
              <v-expansion-panel
                v-for="category in reportCategoriesData"
                :key="category.name"
                :value="category.name"
              >
                <v-expansion-panel-title class="text-caption font-weight-medium ps-8">
                  <v-icon class="me-2" size="small">{{ category.icon }}</v-icon>
                  {{ category.label }}
                  <template #actions>
                    <v-chip size="x-small" variant="text">
                      {{ category.reports.length }}
                    </v-chip>
                  </template>
                </v-expansion-panel-title>

                <v-expansion-panel-text class="pa-0">
                  <v-list density="compact" class="py-0">
                    <v-list-item
                      v-for="report in category.reports"
                      :key="report.report_id"
                      :active="selectedReport?.report_id === report.report_id"
                      :title="report.name"
                      :subtitle="report.description"
                      @click="$emit('report-selected', report)"
                      class="report-item ps-12"
                    >
                      <template #prepend>
                        <v-icon
                          :icon="getReportIcon(report.type, report.chart_type)"
                          size="x-small"
                          color="grey"
                        />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- Футер с дополнительными действиями -->
    <div class="navigation-footer pa-3 border-t mt-auto">
      <v-btn
        variant="text"
        size="small"
        prepend-icon="mdi-plus"
        class="text-caption"
        block
        @click="$emit('create-dashboard')"
      >
        Создать дашборд
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  dashboards: {
    type: Array,
    default: () => []
  },
  reports: {
    type: Array,
    default: () => []
  },
  selectedDashboard: {
    type: Object,
    default: null
  },
  selectedReport: {
    type: Object,
    default: null
  }
})

// Emits
defineEmits([
  'dashboard-selected',
  'report-selected',
  'create-dashboard'
])

// Reactive data
const searchQuery = ref('')
const expandedPanels = ref(['dashboards', 'reports'])
const reportCategories = ref(['performance', 'planning', 'quality', 'revenue'])

// Computed
const filteredDashboards = computed(() => {
  if (!searchQuery.value) return props.dashboards

  const query = searchQuery.value.toLowerCase()
  return props.dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(query) ||
    dashboard.description?.toLowerCase().includes(query)
  )
})

const filteredReports = computed(() => {
  if (!searchQuery.value) return props.reports

  const query = searchQuery.value.toLowerCase()
  return props.reports.filter(report =>
    report.name.toLowerCase().includes(query) ||
    report.description?.toLowerCase().includes(query)
  )
})

const reportCategoriesData = computed(() => {
  const categories = [
    {
      name: 'performance',
      label: 'Производительность',
      icon: 'mdi-trending-up',
      reports: []
    },
    {
      name: 'planning',
      label: 'Планирование',
      icon: 'mdi-calendar-check',
      reports: []
    },
    {
      name: 'quality',
      label: 'Качество данных',
      icon: 'mdi-shield-check',
      reports: []
    },
    {
      name: 'revenue',
      label: 'Выручка',
      icon: 'mdi-currency-usd',
      reports: []
    },
    {
      name: 'other',
      label: 'Прочие',
      icon: 'mdi-dots-horizontal',
      reports: []
    }
  ]

  // Группируем отчеты по категориям
  filteredReports.value.forEach(report => {
    const categoryIndex = categories.findIndex(cat => cat.name === report.category)
    if (categoryIndex !== -1) {
      categories[categoryIndex].reports.push(report)
    } else {
      categories[categories.length - 1].reports.push(report) // В "Прочие"
    }
  })

  // Возвращаем только категории с отчетами
  return categories.filter(category => category.reports.length > 0)
})

// Methods
const getCategoryColor = (category) => {
  const colors = {
    planning: 'primary',
    performance: 'success',
    quality: 'warning',
    revenue: 'info'
  }
  return colors[category] || 'grey'
}

const getReportIcon = (type, chartType) => {
  if (type === 'chart') {
    const chartIcons = {
      pie: 'mdi-chart-pie',
      line: 'mdi-chart-line',
      bar: 'mdi-chart-bar',
      treemap: 'mdi-chart-tree',
      map: 'mdi-map',
      heatmap: 'mdi-grid',
      waterfall: 'mdi-chart-waterfall',
      gauge: 'mdi-gauge'
    }
    return chartIcons[chartType] || 'mdi-chart-box'
  } else if (type === 'table') {
    return 'mdi-table'
  } else if (type === 'list') {
    return 'mdi-format-list-bulleted'
  }
  return 'mdi-file-chart'
}

// Lifecycle
onMounted(() => {
  // Разворачиваем все панели по умолчанию
  expandedPanels.value = ['dashboards', 'reports']

  // Разворачиваем все категории отчетов по умолчанию
  reportCategories.value = reportCategoriesData.value.map(cat => cat.name)
})
</script>

<style scoped>
.insights-navigation {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: rgb(var(--v-theme-surface));
}

.navigation-header {
  flex-shrink: 0;
}

.navigation-content {
  flex: 1;
  overflow-y: auto;
}

.navigation-footer {
  flex-shrink: 0;
}

.dashboard-item:hover,
.report-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Кастомизация expansion panels */
:deep(.v-expansion-panel-title) {
  min-height: 40px !important;
  padding: 8px 16px !important;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}

:deep(.v-list-item) {
  min-height: 36px !important;
}

:deep(.v-list-item__content) {
  padding: 4px 0 !important;
}

:deep(.v-list-item-subtitle) {
  font-size: 0.75rem !important;
  opacity: 0.7 !important;
}
</style>