<template>
  <div class="activity-toolbar">
    <v-container fluid class="pa-4">
      <div class="d-flex align-center justify-space-between">
        <!-- Левая группа кнопок -->
        <div class="d-flex align-center gap-2">
          <!-- Кнопка создания активности -->
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="createActivity"
          >
            Создать активность
          </v-btn>

          <v-divider vertical class="mx-2" />

          <!-- Кнопки фильтрации и группировки -->
          <v-btn
            variant="outlined"
            prepend-icon="mdi-filter"
            @click="openFilterDialog"
          >
            Фильтр
            <v-badge
              v-if="hasActiveFilters"
              color="error"
              content="!"
              offset-x="8"
              offset-y="8"
            />
          </v-btn>

          <v-btn
            variant="outlined"
            prepend-icon="mdi-group"
            @click="openGroupByDialog"
          >
            Группировать
            <v-chip
              v-if="currentGroupBy"
              size="x-small"
              color="primary"
              class="ml-2"
            >
              {{ getGroupByLabel(currentGroupBy) }}
            </v-chip>
          </v-btn>

          <!-- Переключатель полной иерархии -->
          <v-switch
            v-model="showFullHierarchy"
            label="Полная иерархия"
            color="primary"
            density="compact"
            hide-details
            class="ml-2"
          />
        </div>

        <!-- Центральная группа - поиск -->
        <div class="search-container">
          <v-text-field
            v-model="searchQuery"
            placeholder="Быстрый поиск активностей..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            style="width: 300px"
            @input="handleSearch"
            @click:clear="clearSearch"
          />
        </div>

        <!-- Правая группа -->
        <div class="d-flex align-center gap-2">
          <!-- Меню представлений -->
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="outlined"
                prepend-icon="mdi-view-list"
              >
                Представления
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>

            <v-list min-width="200">
              <v-list-subheader>Мои представления</v-list-subheader>
              <v-list-item
                v-for="view in personalViews"
                :key="view.id"
                @click="applyView(view)"
              >
                <v-list-item-title>{{ view.name }}</v-list-item-title>
              </v-list-item>

              <v-divider />

              <v-list-subheader>Организационные</v-list-subheader>
              <v-list-item
                v-for="view in organizationViews"
                :key="view.id"
                @click="applyView(view)"
              >
                <v-list-item-title>{{ view.name }}</v-list-item-title>
              </v-list-item>

              <v-divider />

              <v-list-item @click="saveCurrentView">
                <template v-slot:prepend>
                  <v-icon>mdi-content-save</v-icon>
                </template>
                <v-list-item-title>Сохранить текущее</v-list-item-title>
              </v-list-item>

              <v-list-item @click="manageViews">
                <template v-slot:prepend>
                  <v-icon>mdi-cog</v-icon>
                </template>
                <v-list-item-title>Управление</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- Кнопки действий -->
          <v-btn
            icon
            variant="text"
            @click="refreshData"
            title="Обновить данные"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>

          <v-btn
            icon
            variant="text"
            @click="exportData"
            title="Экспорт данных"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </div>
      </div>
    </v-container>

    <!-- Диалоги -->
    <ActivitiesFilterBy
      v-model="filterDialog"
      @apply="applyFilters"
    />

    <ActivitiesGroupBy
      v-model="groupByDialog"
      @apply="applyGroupBy"
    />

    <CreateActivity
      v-model="createActivityDialog"
      @created="handleActivityCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'
import { useAppStore } from '@/stores/appStore'
import ActivitiesFilterBy from './ActivitiesFilterBy.vue'
import ActivitiesGroupBy from './ActivitiesGroupBy.vue'
import CreateActivity from './CreateActivity.vue'

const activitiesStore = useActivitiesStore()
const appStore = useAppStore()

// State
const searchQuery = ref('')
const showFullHierarchy = ref(true)
const filterDialog = ref(false)
const groupByDialog = ref(false)
const createActivityDialog = ref(false)

// Computed
const hasActiveFilters = computed(() => {
  return Object.keys(activitiesStore.filters).length > 0
})

const currentGroupBy = computed(() => {
  return activitiesStore.groupBy
})

// Mock data for views
const personalViews = ref([
  { id: 1, name: 'Мои активности' },
  { id: 2, name: 'Активные кампании' }
])

const organizationViews = ref([
  { id: 3, name: 'Квартальный отчет' },
  { id: 4, name: 'По продуктам' }
])

// Methods
const createActivity = () => {
  createActivityDialog.value = true
}

const handleActivityCreated = () => {
  activitiesStore.fetchActivities()
}

const openFilterDialog = () => {
  filterDialog.value = true
}

const openGroupByDialog = () => {
  groupByDialog.value = true
}

const handleSearch = () => {
  // Debounce search
  clearTimeout(handleSearch.timeout)
  handleSearch.timeout = setTimeout(() => {
    activitiesStore.searchActivities(searchQuery.value)
  }, 500)
}

const clearSearch = () => {
  searchQuery.value = ''
  activitiesStore.fetchActivities()
}

const applyFilters = (filters) => {
  activitiesStore.setFilters(filters)
  activitiesStore.fetchActivities(filters)
}

const applyGroupBy = (groupField) => {
  activitiesStore.setGroupBy(groupField)
  activitiesStore.fetchActivities(activitiesStore.filters, groupField)
}

const getGroupByLabel = (field) => {
  const labels = {
    'activity_type_id': 'Тип активности',
    'status': 'Статус',
    'created_by': 'Автор',
    'region': 'Регион'
  }
  return labels[field] || field
}

const applyView = (view) => {
  // TODO: Применить сохраненное представление
  appStore.showInfo(`Применение представления "${view.name}" будет реализовано в следующих версиях`)
}

const saveCurrentView = () => {
  // TODO: Сохранить текущее представление
  appStore.showInfo('Сохранение представлений будет реализовано в следующих версиях')
}

const manageViews = () => {
  // TODO: Открыть управление представлениями
  appStore.showInfo('Управление представлениями будет реализовано в следующих версиях')
}

const refreshData = async () => {
  await activitiesStore.fetchActivities()
  appStore.showSuccess('Данные обновлены')
}

const exportData = () => {
  // TODO: Экспорт данных
  appStore.showInfo('Экспорт данных будет реализован в следующих версиях')
}
</script>

<style scoped>
.activity-toolbar {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.search-container {
  flex: 0 0 auto;
}

.gap-2 {
  gap: 8px;
}

.v-switch {
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .search-container .v-text-field {
    width: 250px !important;
  }
}

@media (max-width: 960px) {
  .d-flex.justify-space-between {
    flex-wrap: wrap;
    gap: 12px;
  }

  .search-container {
    order: 3;
    flex: 1 1 100%;
  }

  .search-container .v-text-field {
    width: 100% !important;
  }
}
</style>