<template>
  <div class="investment-view-controls">
    <v-card variant="outlined" class="controls-card">
      <v-card-title class="pa-3 pb-2">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-tune" class="me-2"/>
            <span class="text-subtitle-1">Управление видом</span>
          </div>
          <v-btn
            icon="mdi-chevron-up"
            size="small"
            variant="text"
            @click="toggleExpanded"
            :class="{ 'rotate-180': !isExpanded }"
          />
        </div>
      </v-card-title>

      <v-expand-transition>
        <v-card-text v-show="isExpanded" class="pa-3 pt-0">
          <!-- Быстрые фильтры -->
          <div class="quick-filters mb-4">
            <v-chip-group
              v-model="selectedQuickFilter"
              color="primary"
              mandatory
              @update:model-value="onQuickFilterChange"
            >
              <v-chip value="all" size="small">Все</v-chip>
              <v-chip value="connected" size="small">Связанные</v-chip>
              <v-chip value="unconnected" size="small">Не связанные</v-chip>
              <v-chip value="draft" size="small">Черновики</v-chip>
              <v-chip value="approved" size="small">Утвержденные</v-chip>
            </v-chip-group>
          </div>

          <v-row>
            <!-- Левая колонка - Фильтры -->
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-2 mb-3">Фильтры</h4>

              <!-- Поиск -->
              <v-text-field
                v-model="filters.search"
                label="Поиск"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                clearable
                class="mb-3"
                @update:model-value="onFilterChange"
              />

              <!-- Тип элемента -->
              <v-select
                v-model="filters.type"
                :items="typeOptions"
                label="Тип элемента"
                variant="outlined"
                density="compact"
                clearable
                multiple
                class="mb-3"
                @update:model-value="onFilterChange"
              >
                <template #selection="{ item, index }">
                  <v-chip v-if="index < 2" size="small">
                    {{ item.title }}
                  </v-chip>
                  <span v-if="index === 2" class="text-caption text-medium-emphasis ml-2">
                    (+{{ filters.type.length - 2 }} еще)
                  </span>
                </template>
              </v-select>

              <!-- Статус прогноза -->
              <v-select
                v-model="filters.forecastStatus"
                :items="forecastStatusOptions"
                label="Статус прогноза"
                variant="outlined"
                density="compact"
                clearable
                multiple
                class="mb-3"
                @update:model-value="onFilterChange"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :color="item.raw.color" icon="mdi-circle" size="12"/>
                    </template>
                  </v-list-item>
                </template>
                <template #selection="{ item }">
                  <v-chip size="small" :color="item.raw.color">
                    {{ item.title }}
                  </v-chip>
                </template>
              </v-select>

              <!-- Диапазон сумм -->
              <v-range-slider
                v-model="filters.amountRange"
                :min="0"
                :max="1000000"
                :step="10000"
                label="Диапазон сумм"
                class="mb-3"
                @update:model-value="onFilterChange"
              >
                <template #prepend>
                  <v-text-field
                    :model-value="filters.amountRange[0]"
                    variant="outlined"
                    density="compact"
                    style="width: 100px;"
                    type="number"
                    @update:model-value="updateMinAmount"
                  />
                </template>
                <template #append>
                  <v-text-field
                    :model-value="filters.amountRange[1]"
                    variant="outlined"
                    density="compact"
                    style="width: 100px;"
                    type="number"
                    @update:model-value="updateMaxAmount"
                  />
                </template>
              </v-range-slider>

              <!-- Период -->
              <v-select
                v-model="filters.period"
                :items="periodOptions"
                label="Период"
                variant="outlined"
                density="compact"
                clearable
                class="mb-3"
                @update:model-value="onFilterChange"
              />
            </v-col>

            <!-- Правая колонка - Группировка и Вид -->
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-2 mb-3">Группировка и вид</h4>

              <!-- Группировка -->
              <v-select
                v-model="grouping.field"
                :items="groupingOptions"
                label="Группировать по"
                variant="outlined"
                density="compact"
                clearable
                class="mb-3"
                @update:model-value="onGroupingChange"
              />

              <!-- Сортировка группы -->
              <v-select
                v-if="grouping.field"
                v-model="grouping.sort"
                :items="sortOptions"
                label="Сортировка групп"
                variant="outlined"
                density="compact"
                class="mb-3"
                @update:model-value="onGroupingChange"
              />

              <!-- Агрегация -->
              <v-select
                v-if="grouping.field"
                v-model="grouping.aggregation"
                :items="aggregationOptions"
                label="Агрегация"
                variant="outlined"
                density="compact"
                class="mb-3"
                @update:model-value="onGroupingChange"
              />

              <!-- Настройки отображения -->
              <div class="display-options mb-3">
                <h5 class="text-subtitle-2 mb-2">Отображение</h5>
                <v-switch
                  v-model="display.showTotals"
                  label="Показать итоги"
                  density="compact"
                  hide-details
                  @update:model-value="onDisplayChange"
                />
                <v-switch
                  v-model="display.expandAll"
                  label="Развернуть все"
                  density="compact"
                  hide-details
                  @update:model-value="onDisplayChange"
                />
                <v-switch
                  v-model="display.showEmptyRows"
                  label="Показать пустые строки"
                  density="compact"
                  hide-details
                  @update:model-value="onDisplayChange"
                />
                <v-switch
                  v-model="display.highlightChanges"
                  label="Выделить изменения"
                  density="compact"
                  hide-details
                  @update:model-value="onDisplayChange"
                />
              </div>

              <!-- Колонки -->
              <v-select
                v-model="display.visibleColumns"
                :items="columnOptions"
                label="Видимые колонки"
                variant="outlined"
                density="compact"
                multiple
                class="mb-3"
                @update:model-value="onDisplayChange"
              >
                <template #selection="{ item, index }">
                  <v-chip v-if="index < 3" size="small">
                    {{ item.title }}
                  </v-chip>
                  <span v-if="index === 3" class="text-caption text-medium-emphasis ml-2">
                    (+{{ display.visibleColumns.length - 3 }} еще)
                  </span>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <!-- Действия -->
          <v-divider class="my-3"/>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2">
              <v-btn
                size="small"
                variant="outlined"
                prepend-icon="mdi-content-save"
                @click="saveView"
              >
                Сохранить вид
              </v-btn>
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    size="small"
                    variant="outlined"
                    append-icon="mdi-chevron-down"
                    v-bind="props"
                  >
                    Загрузить вид
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-for="view in savedViews"
                    :key="view.id"
                    @click="loadView(view)"
                  >
                    <v-list-item-title>{{ view.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ view.description }}</v-list-item-subtitle>
                    <template #append>
                      <v-btn
                        icon="mdi-delete"
                        size="x-small"
                        variant="text"
                        @click.stop="deleteView(view)"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <div class="d-flex align-center gap-2">
              <v-btn
                size="small"
                variant="text"
                @click="resetFilters"
              >
                Сбросить
              </v-btn>
              <v-btn
                size="small"
                color="primary"
                @click="applyFilters"
              >
                Применить
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-expand-transition>
    </v-card>

    <!-- Активные фильтры (чипы) -->
    <div v-if="hasActiveFilters" class="active-filters mt-3">
      <div class="d-flex align-center flex-wrap gap-2">
        <span class="text-caption text-medium-emphasis">Активные фильтры:</span>

        <v-chip
          v-if="filters.search"
          size="small"
          closable
          @click:close="clearFilter('search')"
        >
          Поиск: {{ filters.search }}
        </v-chip>

        <v-chip
          v-for="type in filters.type"
          :key="type"
          size="small"
          closable
          @click:close="removeTypeFilter(type)"
        >
          {{ getTypeTitle(type) }}
        </v-chip>

        <v-chip
          v-for="status in filters.forecastStatus"
          :key="status"
          size="small"
          :color="getForecastStatusColor(status)"
          closable
          @click:close="removeForecastStatusFilter(status)"
        >
          {{ getForecastStatusTitle(status) }}
        </v-chip>

        <v-chip
          v-if="filters.period"
          size="small"
          closable
          @click:close="clearFilter('period')"
        >
          {{ getPeriodTitle(filters.period) }}
        </v-chip>

        <v-chip
          v-if="grouping.field"
          size="small"
          color="info"
          closable
          @click:close="clearGrouping"
        >
          Группировка: {{ getGroupingTitle(grouping.field) }}
        </v-chip>

        <v-btn
          size="small"
          variant="text"
          prepend-icon="mdi-close"
          @click="clearAllFilters"
        >
          Очистить все
        </v-btn>
      </div>
    </div>

    <!-- Диалог сохранения вида -->
    <v-dialog v-model="showSaveDialog" max-width="400">
      <v-card>
        <v-card-title>Сохранить вид</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newViewName"
            label="Название вида"
            variant="outlined"
            autofocus
            class="mb-3"
          />
          <v-textarea
            v-model="newViewDescription"
            label="Описание (необязательно)"
            variant="outlined"
            rows="2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer/>
          <v-btn @click="showSaveDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="confirmSaveView"
            :disabled="!newViewName.trim()"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  initialFilters: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['filters-changed', 'grouping-changed', 'display-changed', 'view-applied'])

// Reactive data
const isExpanded = ref(false)
const selectedQuickFilter = ref('all')
const showSaveDialog = ref(false)
const newViewName = ref('')
const newViewDescription = ref('')

// Фильтры
const filters = ref({
  search: '',
  type: [],
  forecastStatus: [],
  amountRange: [0, 1000000],
  period: null
})

// Группировка
const grouping = ref({
  field: null,
  sort: 'asc',
  aggregation: 'sum'
})

// Отображение
const display = ref({
  showTotals: true,
  expandAll: false,
  showEmptyRows: false,
  highlightChanges: true,
  visibleColumns: ['name', 'jan_2025', 'feb_2025', 'mar_2025', 'forecast_status', 'actions']
})

// Опции
const typeOptions = [
  { value: 'category', title: 'Категория' },
  { value: 'subcategory', title: 'Подкатегория' },
  { value: 'line_item', title: 'Статья расходов' },
  { value: 'placeholder', title: 'Резерв' }
]

const forecastStatusOptions = [
  { value: 'confident', title: 'Уверенный', color: 'success' },
  { value: 'likely', title: 'Вероятный', color: 'info' },
  { value: 'speculative', title: 'Гипотетический', color: 'warning' },
  { value: 'unlikely', title: 'Маловероятный', color: 'error' }
]

const periodOptions = [
  { value: 'current_month', title: 'Текущий месяц' },
  { value: 'current_quarter', title: 'Текущий квартал' },
  { value: 'current_year', title: 'Текущий год' },
  { value: 'next_quarter', title: 'Следующий квартал' },
  { value: 'next_year', title: 'Следующий год' }
]

const groupingOptions = [
  { value: 'type', title: 'По типу' },
  { value: 'forecast_status', title: 'По статусу прогноза' },
  { value: 'connected_to_activities', title: 'По связи с активностями' },
  { value: 'amount_range', title: 'По диапазону сумм' },
  { value: 'parent', title: 'По родительскому элементу' }
]

const sortOptions = [
  { value: 'asc', title: 'По возрастанию' },
  { value: 'desc', title: 'По убыванию' },
  { value: 'name', title: 'По алфавиту' },
  { value: 'amount', title: 'По сумме' }
]

const aggregationOptions = [
  { value: 'sum', title: 'Сумма' },
  { value: 'avg', title: 'Среднее' },
  { value: 'count', title: 'Количество' },
  { value: 'min', title: 'Минимум' },
  { value: 'max', title: 'Максимум' }
]

const columnOptions = [
  { value: 'name', title: 'Название' },
  { value: 'jan_2025', title: 'Январь 2025' },
  { value: 'feb_2025', title: 'Февраль 2025' },
  { value: 'mar_2025', title: 'Март 2025' },
  { value: 'apr_2025', title: 'Апрель 2025' },
  { value: 'may_2025', title: 'Май 2025' },
  { value: 'jun_2025', title: 'Июнь 2025' },
  { value: 'forecast_status', title: 'Статус прогноза' },
  { value: 'total', title: 'Итого' },
  { value: 'actions', title: 'Действия' }
]

// Сохраненные виды
const savedViews = ref([
  {
    id: 'view_1',
    name: 'Только активные',
    description: 'Показать только связанные с активностями элементы',
    filters: { type: ['line_item'], forecastStatus: ['confident', 'likely'] }
  },
  {
    id: 'view_2',
    name: 'По статусу прогноза',
    description: 'Группировка по статусу прогноза',
    grouping: { field: 'forecast_status' }
  }
])

// Computed properties
const hasActiveFilters = computed(() => {
  return filters.value.search ||
         filters.value.type.length > 0 ||
         filters.value.forecastStatus.length > 0 ||
         filters.value.period ||
         grouping.value.field ||
         filters.value.amountRange[0] > 0 ||
         filters.value.amountRange[1] < 1000000
})

// Methods
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const onQuickFilterChange = (filter) => {
  switch (filter) {
    case 'all':
      resetFilters()
      break
    case 'connected':
      filters.value.type = ['line_item']
      break
    case 'unconnected':
      filters.value.type = ['placeholder']
      break
    case 'draft':
      filters.value.forecastStatus = ['speculative', 'unlikely']
      break
    case 'approved':
      filters.value.forecastStatus = ['confident', 'likely']
      break
  }
  onFilterChange()
}

const onFilterChange = () => {
  emit('filters-changed', { ...filters.value })
}

const onGroupingChange = () => {
  emit('grouping-changed', { ...grouping.value })
}

const onDisplayChange = () => {
  emit('display-changed', { ...display.value })
}

const updateMinAmount = (value) => {
  filters.value.amountRange[0] = parseInt(value) || 0
  onFilterChange()
}

const updateMaxAmount = (value) => {
  filters.value.amountRange[1] = parseInt(value) || 1000000
  onFilterChange()
}

const clearFilter = (field) => {
  if (field === 'search') {
    filters.value.search = ''
  } else if (field === 'period') {
    filters.value.period = null
  }
  onFilterChange()
}

const removeTypeFilter = (type) => {
  filters.value.type = filters.value.type.filter(t => t !== type)
  onFilterChange()
}

const removeForecastStatusFilter = (status) => {
  filters.value.forecastStatus = filters.value.forecastStatus.filter(s => s !== status)
  onFilterChange()
}

const clearGrouping = () => {
  grouping.value.field = null
  onGroupingChange()
}

const clearAllFilters = () => {
  resetFilters()
  grouping.value.field = null
  selectedQuickFilter.value = 'all'
  onFilterChange()
  onGroupingChange()
}

const resetFilters = () => {
  filters.value = {
    search: '',
    type: [],
    forecastStatus: [],
    amountRange: [0, 1000000],
    period: null
  }
}

const applyFilters = () => {
  emit('view-applied', {
    filters: { ...filters.value },
    grouping: { ...grouping.value },
    display: { ...display.value }
  })
}

const saveView = () => {
  showSaveDialog.value = true
}

const confirmSaveView = () => {
  const newView = {
    id: `view_${Date.now()}`,
    name: newViewName.value,
    description: newViewDescription.value,
    filters: { ...filters.value },
    grouping: { ...grouping.value },
    display: { ...display.value }
  }

  savedViews.value.push(newView)
  showSaveDialog.value = false
  newViewName.value = ''
  newViewDescription.value = ''
}

const loadView = (view) => {
  if (view.filters) {
    filters.value = { ...filters.value, ...view.filters }
  }
  if (view.grouping) {
    grouping.value = { ...grouping.value, ...view.grouping }
  }
  if (view.display) {
    display.value = { ...display.value, ...view.display }
  }

  onFilterChange()
  onGroupingChange()
  onDisplayChange()
}

const deleteView = (view) => {
  savedViews.value = savedViews.value.filter(v => v.id !== view.id)
}

// Helper methods
const getTypeTitle = (type) => {
  return typeOptions.find(opt => opt.value === type)?.title || type
}

const getForecastStatusColor = (status) => {
  return forecastStatusOptions.find(opt => opt.value === status)?.color || 'grey'
}

const getForecastStatusTitle = (status) => {
  return forecastStatusOptions.find(opt => opt.value === status)?.title || status
}

const getPeriodTitle = (period) => {
  return periodOptions.find(opt => opt.value === period)?.title || period
}

const getGroupingTitle = (field) => {
  return groupingOptions.find(opt => opt.value === field)?.title || field
}

// Watchers
watch(() => props.initialFilters, (newFilters) => {
  if (newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  // Начальная настройка
  if (props.initialFilters) {
    filters.value = { ...filters.value, ...props.initialFilters }
  }
})

// Expose methods
defineExpose({
  applyFilters,
  resetFilters,
  clearAllFilters
})
</script>

<style scoped>
.investment-view-controls {
  /* Контейнер панели управления */
}

.controls-card {
  background-color: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
}

.quick-filters {
  /* Стили для быстрых фильтров */
}

.display-options {
  /* Стили для настроек отображения */
}

.active-filters {
  /* Стили для активных фильтров */
}

.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s;
}

/* Переходы */
.v-expand-transition-enter-active,
.v-expand-transition-leave-active {
  transition: all 0.3s ease;
}
</style>