<template>
  <div class="insights-dashboard">
    <!-- Заголовок дашборда -->
    <div class="dashboard-header pa-4 border-b">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h2 class="text-h5 font-weight-medium mb-1">
            <v-icon class="me-2" :color="getCategoryColor(dashboard?.category)">
              {{ dashboard?.icon || 'mdi-chart-box' }}
            </v-icon>
            {{ dashboard?.name }}
          </h2>
          <p class="text-body-2 text-grey mb-0">
            {{ dashboard?.description }}
          </p>
        </div>

        <!-- Действия дашборда -->
        <div class="d-flex align-center">
          <v-chip
            :color="dashboard?.status === 'active' ? 'success' : 'warning'"
            size="small"
            variant="tonal"
            class="me-2"
          >
            {{ dashboard?.status === 'active' ? 'Активен' : 'Неактивен' }}
          </v-chip>

          <v-btn
            icon="mdi-information-outline"
            size="small"
            variant="text"
            @click="showDashboardInfo = true"
          />
        </div>
      </div>

      <!-- Вкладки дашборда -->
      <v-tabs
        v-if="dashboard?.tabs && dashboard.tabs.length > 1"
        v-model="selectedTab"
        class="mt-3"
        density="compact"
        @update:model-value="$emit('tab-changed', $event)"
      >
        <v-tab
          v-for="tab in dashboard.tabs"
          :key="tab.tab_id"
          :value="tab.tab_id"
          :text="tab.name"
        />
      </v-tabs>
    </div>

    <!-- Фильтры дашборда -->
    <div v-if="showFilters" class="dashboard-filters pa-4 border-b bg-grey-lighten-5">
      <v-row dense>
        <v-col cols="12" md="3">
          <v-select
            v-model="localFilters.period"
            :items="periodOptions"
            item-title="text"
            item-value="value"
            label="Период"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="handleFiltersChange"
          >
            <template #prepend-inner>
              <v-icon size="small">mdi-calendar</v-icon>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="localFilters.channel"
            :items="channelOptions"
            label="Канал"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @update:model-value="handleFiltersChange"
          >
            <template #prepend-inner>
              <v-icon size="small">mdi-bullhorn</v-icon>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="localFilters.region"
            :items="regionOptions"
            label="Регион"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @update:model-value="handleFiltersChange"
          >
            <template #prepend-inner>
              <v-icon size="small">mdi-map-marker</v-icon>
            </template>
          </v-select>
        </v-col>

        <v-col cols="12" md="3" class="d-flex align-center">
          <v-btn
            variant="outlined"
            size="small"
            prepend-icon="mdi-filter-off"
            @click="clearFilters"
          >
            Сбросить
          </v-btn>

          <v-spacer />

          <v-btn
            icon="mdi-filter"
            size="small"
            variant="text"
            @click="showAdvancedFilters = !showAdvancedFilters"
          />
        </v-col>
      </v-row>

      <!-- Расширенные фильтры -->
      <v-expand-transition>
        <div v-show="showAdvancedFilters" class="mt-3">
          <v-row dense>
            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="localFilters.campaigns"
                :items="campaignOptions"
                label="Кампании"
                density="compact"
                variant="outlined"
                multiple
                chips
                closable-chips
                hide-details
                @update:model-value="handleFiltersChange"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-autocomplete
                v-model="localFilters.activities"
                :items="activityOptions"
                label="Активности"
                density="compact"
                variant="outlined"
                multiple
                chips
                closable-chips
                hide-details
                @update:model-value="handleFiltersChange"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-range-slider
                v-model="localFilters.roiRange"
                label="ROI диапазон (%)"
                :min="0"
                :max="500"
                :step="10"
                thumb-label
                hide-details
                @update:model-value="handleFiltersChange"
              />
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </div>

    <!-- Содержимое дашборда -->
    <div class="dashboard-content">
      <!-- Investment Planning Dashboard -->
      <InvestmentPlanningDashboard
        v-if="dashboard?.dashboard_id === 'investment_planning'"
        :tab-id="selectedTab"
        :filters="localFilters"
        :data="dashboardData?.data"
        :widgets="dashboardWidgets"
        :reports="dashboardReports"
        :is-editing="isEditing"
        @widget-updated="$emit('widget-updated', $event)"
        @report-drilldown="$emit('report-drilldown', $event)"
      />

      <!-- ROMI Dashboard -->
      <ROMIDashboard
        v-else-if="dashboard?.dashboard_id === 'romi'"
        :tab-id="selectedTab"
        :filters="localFilters"
        :data="dashboardData?.data"
        :widgets="dashboardWidgets"
        :reports="dashboardReports"
        :is-editing="isEditing"
        @widget-updated="$emit('widget-updated', $event)"
        @report-drilldown="$emit('report-drilldown', $event)"
      />

      <!-- Health Check Dashboard -->
      <HealthCheckDashboard
        v-else-if="dashboard?.dashboard_id === 'health_check'"
        :tab-id="selectedTab"
        :filters="localFilters"
        :data="dashboardData?.data"
        :widgets="dashboardWidgets"
        :reports="dashboardReports"
        :is-editing="isEditing"
        @widget-updated="$emit('widget-updated', $event)"
        @report-drilldown="$emit('report-drilldown', $event)"
      />

      <!-- Performance Overview Dashboard -->
      <PerformanceOverviewDashboard
        v-else-if="dashboard?.dashboard_id === 'performance_overview'"
        :tab-id="selectedTab"
        :filters="localFilters"
        :data="dashboardData?.data"
        :widgets="dashboardWidgets"
        :reports="dashboardReports"
        :is-editing="isEditing"
        @widget-updated="$emit('widget-updated', $event)"
        @report-drilldown="$emit('report-drilldown', $event)"
      />

      <!-- Fallback для неопределенных дашбордов -->
      <div v-else class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-1">mdi-chart-box-outline</v-icon>
        <h3 class="text-h6 text-grey mt-4 mb-2">
          Дашборд в разработке
        </h3>
        <p class="text-grey">
          Этот дашборд еще не реализован
        </p>
      </div>
    </div>

    <!-- Диалог информации о дашборде -->
    <v-dialog v-model="showDashboardInfo" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon class="me-2">{{ dashboard?.icon || 'mdi-chart-box' }}</v-icon>
          {{ dashboard?.name }}
        </v-card-title>

        <v-card-text>
          <p class="mb-3">{{ dashboard?.description }}</p>

          <v-divider class="my-3" />

          <div class="info-row mb-2">
            <strong>Категория:</strong>
            <v-chip
              :color="getCategoryColor(dashboard?.category)"
              size="small"
              class="ms-2"
            >
              {{ getCategoryName(dashboard?.category) }}
            </v-chip>
          </div>

          <div class="info-row mb-2">
            <strong>Статус:</strong>
            <v-chip
              :color="dashboard?.status === 'active' ? 'success' : 'warning'"
              size="small"
              class="ms-2"
            >
              {{ dashboard?.status === 'active' ? 'Активен' : 'Неактивен' }}
            </v-chip>
          </div>

          <div class="info-row mb-2">
            <strong>Вкладки:</strong>
            <span class="ms-2">{{ dashboard?.tabs?.length || 0 }}</span>
          </div>

          <div class="info-row mb-2">
            <strong>Отчеты:</strong>
            <span class="ms-2">{{ dashboardReports?.length || 0 }}</span>
          </div>

          <div class="info-row mb-2">
            <strong>Виджеты:</strong>
            <span class="ms-2">{{ dashboardWidgets?.length || 0 }}</span>
          </div>

          <div class="info-row">
            <strong>Последнее обновление:</strong>
            <span class="ms-2">{{ formatDate(dashboard?.updated_at) }}</span>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="showDashboardInfo = false">
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import InvestmentPlanningDashboard from './dashboards/InvestmentPlanningDashboard.vue'
import ROMIDashboard from './dashboards/ROMIDashboard.vue'
import HealthCheckDashboard from './dashboards/HealthCheckDashboard.vue'
import PerformanceOverviewDashboard from './dashboards/PerformanceOverviewDashboard.vue'

// Props
const props = defineProps({
  dashboard: {
    type: Object,
    default: null
  },
  tabId: {
    type: String,
    default: null
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits([
  'tab-changed',
  'filters-changed',
  'widget-updated',
  'report-drilldown'
])

// Reactive data
const selectedTab = ref(props.tabId || props.dashboard?.tabs?.[0]?.tab_id)
const localFilters = ref({ ...props.filters })
const showFilters = ref(true)
const showAdvancedFilters = ref(false)
const showDashboardInfo = ref(false)

// Computed
const dashboardData = computed(() => {
  // TODO: Получать данные из store
  return { data: {} }
})

const dashboardReports = computed(() => {
  // TODO: Получать отчеты из store
  return []
})

const dashboardWidgets = computed(() => {
  // TODO: Получать виджеты из store
  return []
})

const periodOptions = computed(() => [
  { text: 'Сегодня', value: 'today' },
  { text: 'Вчера', value: 'yesterday' },
  { text: 'Последние 7 дней', value: 'last_7_days' },
  { text: 'Последние 30 дней', value: 'last_30_days' },
  { text: 'Этот месяц', value: 'this_month' },
  { text: 'Прошлый месяц', value: 'last_month' },
  { text: 'Этот квартал', value: 'this_quarter' },
  { text: 'Прошлый квартал', value: 'last_quarter' },
  { text: 'Этот год', value: 'this_year' },
  { text: 'Прошлый год', value: 'last_year' }
])

const channelOptions = computed(() => [
  'Google Ads',
  'Yandex Direct',
  'Email',
  'Instagram',
  'YouTube',
  'Facebook',
  'VKontakte',
  'Telegram'
])

const regionOptions = computed(() => [
  'Москва',
  'Санкт-Петербург',
  'Екатеринбург',
  'Новосибирск',
  'Казань',
  'Краснодар',
  'Челябинск',
  'Ростов-на-Дону'
])

const campaignOptions = computed(() => {
  // TODO: Получать из данных кампаний
  return [
    'Q4 2025 Комплексная маркетинговая кампания',
    'Осенняя digital-кампания',
    'Instagram Stories - осенняя коллекция',
    'TikTok челленджи - #ОсеньСтиль2025',
    'YouTube интеграции'
  ]
})

const activityOptions = computed(() => {
  // TODO: Получать из данных активностей
  return [
    'Google Ads - поисковые кампании',
    'Яндекс.Директ кампании',
    'Осенняя email-серия',
    'CRM автоматизация',
    'Блог и статьи'
  ]
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

const getCategoryName = (category) => {
  const names = {
    planning: 'Планирование',
    performance: 'Производительность',
    quality: 'Качество данных',
    revenue: 'Выручка'
  }
  return names[category] || 'Прочее'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Нет данных'

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const handleFiltersChange = () => {
  // Эмитим изменения фильтров с небольшой задержкой
  setTimeout(() => {
    emit('filters-changed', localFilters.value)
  }, 300)
}

const clearFilters = () => {
  localFilters.value = {
    period: 'last_30_days'
  }
  handleFiltersChange()
}

// Watchers
watch(() => props.tabId, (newTabId) => {
  if (newTabId !== selectedTab.value) {
    selectedTab.value = newTabId
  }
})

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

// Lifecycle
onMounted(() => {
  // Устанавливаем дефолтные фильтры
  if (!localFilters.value.period) {
    localFilters.value.period = 'last_30_days'
  }

  // Устанавливаем первую вкладку если не выбрана
  if (!selectedTab.value && props.dashboard?.tabs?.length > 0) {
    selectedTab.value = props.dashboard.tabs[0].tab_id
  }
})
</script>

<style scoped>
.insights-dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  flex-shrink: 0;
  background-color: rgb(var(--v-theme-surface));
}

.dashboard-filters {
  flex-shrink: 0;
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Кастомизация tabs */
:deep(.v-tabs) {
  margin-top: 12px;
}

:deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
}

/* Кастомизация select и других полей */
:deep(.v-field__input) {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

:deep(.v-field--variant-outlined) {
  --v-field-border-width: 1px;
}
</style>