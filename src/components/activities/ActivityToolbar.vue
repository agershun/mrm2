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
            @keydown.enter="performSearch"
          >
            <template v-slot:append-inner>
              <v-chip
                v-if="searchResults.length > 0 && searchQuery"
                size="x-small"
                color="primary"
                variant="outlined"
              >
                {{ searchResults.length }}
              </v-chip>
            </template>
          </v-text-field>

          <!-- Результаты поиска -->
          <v-menu
            v-model="showSearchResults"
            :activator="searchInputRef"
            location="bottom"
            offset="4"
            max-width="400"
            :close-on-content-click="false"
          >
            <v-card v-if="searchQuery && searchResults.length > 0" max-height="300">
              <v-card-title class="pa-3 text-subtitle-2">
                Найдено результатов: {{ searchResults.length }}
              </v-card-title>
              <v-divider />
              <v-list density="compact" max-height="200" class="overflow-y-auto">
                <v-list-item
                  v-for="result in searchResults.slice(0, 10)"
                  :key="result.activity_id"
                  @click="selectSearchResult(result)"
                  class="search-result-item"
                >
                  <template v-slot:prepend>
                    <v-icon
                      :icon="getActivityIcon(result.activity_type_id)"
                      :color="getActivityColor(result.activity_type_id)"
                      size="16"
                    />
                  </template>
                  <v-list-item-title>
                    <span v-html="highlightMatch(result.name, searchQuery)"></span>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ getActivityTypeName(result.activity_type_id) }}
                    <span v-if="result.parent_name" class="text-grey-darken-1">
                      • в {{ result.parent_name }}
                    </span>
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="searchResults.length > 10" disabled>
                  <v-list-item-title class="text-caption text-grey-darken-1">
                    ... и еще {{ searchResults.length - 10 }} результатов
                  </v-list-item-title>
                </v-list-item>
              </v-list>
              <v-divider />
              <v-card-actions class="pa-2">
                <v-btn
                  variant="text"
                  size="small"
                  @click="expandSearchResults"
                >
                  Показать все в иерархии
                </v-btn>
                <v-spacer />
                <v-btn
                  variant="text"
                  size="small"
                  @click="closeSearchResults"
                >
                  Закрыть
                </v-btn>
              </v-card-actions>
            </v-card>

            <v-card v-else-if="searchQuery && searchResults.length === 0">
              <v-card-text class="pa-4 text-center">
                <v-icon size="32" color="grey-lighten-1" class="mb-2">
                  mdi-magnify-remove-outline
                </v-icon>
                <div class="text-body-2 text-grey-darken-1">
                  Ничего не найдено по запросу "{{ searchQuery }}"
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
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
const showSearchResults = ref(false)
const searchResults = ref([])
const searchInputRef = ref(null)

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
  // Очищаем выбранного родителя перед созданием новой активности
  activitiesStore.clearSelectedParentForCreation()
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

const handleSearch = async () => {
  // Debounce search
  clearTimeout(handleSearch.timeout)
  handleSearch.timeout = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      searchResults.value = await performSearchInternal(searchQuery.value)
      showSearchResults.value = true
    } else {
      searchResults.value = []
      showSearchResults.value = false
      activitiesStore.clearSearchHighlight()
    }
  }, 300)
}

const performSearchInternal = async (query) => {
  const allActivities = activitiesStore.activities
  const results = []
  const searchTerm = query.toLowerCase()

  for (const activity of allActivities) {
    // Поиск по названию
    if (activity.name.toLowerCase().includes(searchTerm)) {
      // Находим родительскую активность для контекста
      const parent = allActivities.find(a => a.activity_id === activity.parent_activity_id)
      results.push({
        ...activity,
        parent_name: parent ? parent.name : null
      })
    }
    // Дополнительный поиск по ID
    else if (activity.activity_id.toString().includes(searchTerm)) {
      const parent = allActivities.find(a => a.activity_id === activity.parent_activity_id)
      results.push({
        ...activity,
        parent_name: parent ? parent.name : null
      })
    }
  }

  return results
}

const performSearch = async () => {
  if (searchQuery.value.trim()) {
    await activitiesStore.searchActivities(searchQuery.value)
    showSearchResults.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
  activitiesStore.clearSearch()
  activitiesStore.clearSearchHighlight()
}

const selectSearchResult = (result) => {
  activitiesStore.selectActivity(result.activity_id)
  activitiesStore.highlightSearchResult(result.activity_id)
  activitiesStore.expandToActivity(result.activity_id)
  showSearchResults.value = false
}

const expandSearchResults = () => {
  activitiesStore.setSearchResults(searchResults.value)
  activitiesStore.expandSearchResults()
  showSearchResults.value = false
}

const closeSearchResults = () => {
  showSearchResults.value = false
}

const highlightMatch = (text, query) => {
  if (!query) return text

  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="search-highlight">$1</mark>')
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

const getActivityTypeName = (typeId) => {
  const type = activitiesStore.activityTypes.find(t => t.activity_type_id === typeId)
  return type ? type.name : 'Неизвестный тип'
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

.search-result-item {
  cursor: pointer;
}

.search-result-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.search-highlight) {
  background-color: #ffeb3b;
  color: #333;
  padding: 1px 2px;
  border-radius: 2px;
  font-weight: 500;
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