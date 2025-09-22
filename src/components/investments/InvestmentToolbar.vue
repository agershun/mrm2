<template>
  <div class="investment-toolbar">
    <v-card elevation="1" class="pa-4 mb-4">
      <v-row align="center">
        <!-- Поиск -->
        <v-col cols="12" md="3">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Поиск инвестиций"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @input="onSearch"
          />
        </v-col>

        <!-- Фильтр по статусу -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.status"
            label="Статус"
            :items="statusOptions"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @update:modelValue="onFilterChange"
          />
        </v-col>

        <!-- Фильтр по типу -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.type"
            label="Тип"
            :items="typeOptions"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @update:modelValue="onFilterChange"
          />
        </v-col>

        <!-- Фильтр по владельцу -->
        <v-col cols="12" md="2">
          <v-select
            v-model="filters.owner"
            label="Владелец"
            :items="ownerOptions"
            density="compact"
            variant="outlined"
            clearable
            hide-details
            @update:modelValue="onFilterChange"
          />
        </v-col>

        <!-- Действия -->
        <v-col cols="12" md="3" class="d-flex justify-end">
          <v-btn-group variant="outlined" density="compact">
            <v-btn
              @click="showFiltersDialog = true"
              :color="hasActiveFilters ? 'primary' : undefined"
            >
              <v-icon>mdi-filter</v-icon>
              Фильтры
              <v-badge
                v-if="activeFiltersCount > 0"
                :content="activeFiltersCount"
                color="primary"
                inline
              />
            </v-btn>

            <v-btn @click="showSortDialog = true">
              <v-icon>mdi-sort</v-icon>
              Сортировка
            </v-btn>

            <v-btn @click="showViewOptions = true">
              <v-icon>mdi-view-grid</v-icon>
              Вид
            </v-btn>
          </v-btn-group>

          <v-btn
            color="primary"
            class="ml-2"
            @click="createInvestment"
          >
            <v-icon>mdi-plus</v-icon>
            Создать
          </v-btn>
        </v-col>
      </v-row>

      <!-- Активные фильтры -->
      <v-row v-if="hasActiveFilters" class="mt-2">
        <v-col cols="12">
          <div class="d-flex align-center">
            <span class="text-caption text-medium-emphasis me-2">Активные фильтры:</span>

            <v-chip
              v-if="filters.status"
              closable
              size="small"
              class="me-2"
              @click:close="filters.status = null; onFilterChange()"
            >
              Статус: {{ filters.status }}
            </v-chip>

            <v-chip
              v-if="filters.type"
              closable
              size="small"
              class="me-2"
              @click:close="filters.type = null; onFilterChange()"
            >
              Тип: {{ filters.type }}
            </v-chip>

            <v-chip
              v-if="filters.owner"
              closable
              size="small"
              class="me-2"
              @click:close="filters.owner = null; onFilterChange()"
            >
              Владелец: {{ filters.owner }}
            </v-chip>

            <v-chip
              v-if="filters.amountRange?.min || filters.amountRange?.max"
              closable
              size="small"
              class="me-2"
              @click:close="filters.amountRange = {}; onFilterChange()"
            >
              Сумма: {{ formatAmountRange() }}
            </v-chip>

            <v-btn
              size="small"
              variant="text"
              @click="clearAllFilters"
            >
              Сбросить все
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Массовые действия -->
      <v-row v-if="selectedItems.length > 0" class="mt-2">
        <v-col cols="12">
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="d-flex align-center"
          >
            <div class="d-flex align-center flex-grow-1">
              <span class="me-4">
                Выбрано инвестиций: {{ selectedItems.length }}
              </span>

              <v-btn-group variant="outlined" density="compact">
                <v-btn @click="showBulkEditDialog = true">
                  <v-icon>mdi-pencil</v-icon>
                  Редактировать
                </v-btn>

                <v-btn @click="showBulkAllocationDialog = true">
                  <v-icon>mdi-chart-pie</v-icon>
                  Распределить
                </v-btn>

                <v-btn @click="showBulkStatusDialog = true">
                  <v-icon>mdi-swap-horizontal</v-icon>
                  Статус
                </v-btn>

                <v-btn
                  color="error"
                  @click="showBulkDeleteDialog = true"
                >
                  <v-icon>mdi-delete</v-icon>
                  Удалить
                </v-btn>
              </v-btn-group>

              <v-spacer />

              <v-btn
                size="small"
                variant="text"
                @click="clearSelection"
              >
                Отменить выбор
              </v-btn>
            </div>
          </v-alert>
        </v-col>
      </v-row>
    </v-card>

    <!-- Диалог дополнительных фильтров -->
    <v-dialog v-model="showFiltersDialog" max-width="600">
      <v-card>
        <v-card-title>Дополнительные фильтры</v-card-title>
        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="advancedFilters.name"
                  label="Название содержит"
                  prepend-inner-icon="mdi-text"
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="advancedFilters.amountMin"
                  label="Сумма от"
                  type="number"
                  prefix="₽"
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="advancedFilters.amountMax"
                  label="Сумма до"
                  type="number"
                  prefix="₽"
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="advancedFilters.dateFrom"
                  label="Дата создания от"
                  type="date"
                />
              </v-col>

              <v-col cols="6">
                <v-text-field
                  v-model="advancedFilters.dateTo"
                  label="Дата создания до"
                  type="date"
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="advancedFilters.categories"
                  label="Категории"
                  :items="categoryOptions"
                  multiple
                  chips
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="advancedFilters.tags"
                  label="Теги"
                  :items="tagOptions"
                  multiple
                  chips
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="clearAdvancedFilters">Сбросить</v-btn>
          <v-btn @click="showFiltersDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="applyAdvancedFilters">Применить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог сортировки -->
    <v-dialog v-model="showSortDialog" max-width="400">
      <v-card>
        <v-card-title>Настройки сортировки</v-card-title>
        <v-card-text>
          <v-form>
            <v-select
              v-model="sortOptions.field"
              label="Поле для сортировки"
              :items="sortFieldOptions"
            />
            <v-radio-group v-model="sortOptions.direction">
              <v-radio label="По возрастанию" value="asc" />
              <v-radio label="По убыванию" value="desc" />
            </v-radio-group>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showSortDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="applySorting">Применить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог массового редактирования -->
    <v-dialog v-model="showBulkEditDialog" max-width="500">
      <v-card>
        <v-card-title>Массовое редактирование</v-card-title>
        <v-card-text>
          <v-form>
            <v-select
              v-model="bulkEdit.owner"
              label="Новый владелец"
              :items="ownerOptions"
              clearable
            />
            <v-select
              v-model="bulkEdit.status"
              label="Новый статус"
              :items="statusOptions"
              clearable
            />
            <v-select
              v-model="bulkEdit.type"
              label="Новый тип"
              :items="typeOptions"
              clearable
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showBulkEditDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="applyBulkEdit">Применить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'InvestmentToolbar',
  props: {
    selectedItems: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'search',
    'filter-change',
    'sort-change',
    'create-investment',
    'bulk-edit',
    'bulk-allocation',
    'bulk-status-change',
    'bulk-delete',
    'clear-selection'
  ],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const showFiltersDialog = ref(false)
    const showSortDialog = ref(false)
    const showViewOptions = ref(false)
    const showBulkEditDialog = ref(false)
    const showBulkAllocationDialog = ref(false)
    const showBulkStatusDialog = ref(false)
    const showBulkDeleteDialog = ref(false)

    const filters = ref({
      status: null,
      type: null,
      owner: null,
      amountRange: {}
    })

    const advancedFilters = ref({
      name: '',
      amountMin: null,
      amountMax: null,
      dateFrom: '',
      dateTo: '',
      categories: [],
      tags: []
    })

    const sortOptions = ref({
      field: 'createdAt',
      direction: 'desc'
    })

    const bulkEdit = ref({
      owner: null,
      status: null,
      type: null
    })

    const statusOptions = [
      { title: 'Активная', value: 'active' },
      { title: 'В планах', value: 'planned' },
      { title: 'На паузе', value: 'paused' },
      { title: 'Завершена', value: 'completed' },
      { title: 'Отменена', value: 'cancelled' }
    ]

    const typeOptions = [
      { title: 'Маркетинговая кампания', value: 'marketing_campaign' },
      { title: 'Продуктовая инициатива', value: 'product_initiative' },
      { title: 'Операционные расходы', value: 'operational' },
      { title: 'Исследования', value: 'research' },
      { title: 'Инфраструктура', value: 'infrastructure' }
    ]

    const ownerOptions = [
      'Иванов И.И.',
      'Петрова П.П.',
      'Сидоров С.С.',
      'Козлова К.К.',
      'Николаев Н.Н.'
    ]

    const categoryOptions = [
      'Digital Marketing',
      'Traditional Marketing',
      'Product Development',
      'Customer Acquisition',
      'Brand Building',
      'Research & Development'
    ]

    const tagOptions = [
      'Высокий приоритет',
      'Быстрый запуск',
      'Долгосрочный',
      'Экспериментальный',
      'Критичный',
      'ROI-фокус'
    ]

    const sortFieldOptions = [
      { title: 'Дата создания', value: 'createdAt' },
      { title: 'Название', value: 'name' },
      { title: 'Сумма', value: 'amount' },
      { title: 'Статус', value: 'status' },
      { title: 'Владелец', value: 'owner' }
    ]

    const hasActiveFilters = computed(() => {
      return Object.values(filters.value).some(value =>
        value !== null && value !== undefined &&
        (typeof value !== 'object' || Object.keys(value).length > 0)
      )
    })

    const activeFiltersCount = computed(() => {
      let count = 0
      if (filters.value.status) count++
      if (filters.value.type) count++
      if (filters.value.owner) count++
      if (filters.value.amountRange?.min || filters.value.amountRange?.max) count++
      return count
    })

    const onSearch = () => {
      emit('search', searchQuery.value)
    }

    const onFilterChange = () => {
      emit('filter-change', filters.value)
    }

    const formatAmountRange = () => {
      const { min, max } = filters.value.amountRange || {}
      if (min && max) return `${min} - ${max} ₽`
      if (min) return `от ${min} ₽`
      if (max) return `до ${max} ₽`
      return ''
    }

    const clearAllFilters = () => {
      filters.value = {
        status: null,
        type: null,
        owner: null,
        amountRange: {}
      }
      searchQuery.value = ''
      onFilterChange()
      onSearch()
    }

    const clearAdvancedFilters = () => {
      advancedFilters.value = {
        name: '',
        amountMin: null,
        amountMax: null,
        dateFrom: '',
        dateTo: '',
        categories: [],
        tags: []
      }
    }

    const applyAdvancedFilters = () => {
      // Применяем дополнительные фильтры
      if (advancedFilters.value.amountMin || advancedFilters.value.amountMax) {
        filters.value.amountRange = {
          min: advancedFilters.value.amountMin,
          max: advancedFilters.value.amountMax
        }
      }

      onFilterChange()
      showFiltersDialog.value = false
    }

    const applySorting = () => {
      emit('sort-change', sortOptions.value)
      showSortDialog.value = false
    }

    const createInvestment = () => {
      emit('create-investment')
    }

    const applyBulkEdit = () => {
      emit('bulk-edit', bulkEdit.value)
      showBulkEditDialog.value = false
      bulkEdit.value = {
        owner: null,
        status: null,
        type: null
      }
    }

    const clearSelection = () => {
      emit('clear-selection')
    }

    // Watchers
    watch(searchQuery, (newValue) => {
      if (newValue === '') {
        onSearch()
      }
    })

    return {
      searchQuery,
      showFiltersDialog,
      showSortDialog,
      showViewOptions,
      showBulkEditDialog,
      showBulkAllocationDialog,
      showBulkStatusDialog,
      showBulkDeleteDialog,
      filters,
      advancedFilters,
      sortOptions,
      bulkEdit,
      statusOptions,
      typeOptions,
      ownerOptions,
      categoryOptions,
      tagOptions,
      sortFieldOptions,
      hasActiveFilters,
      activeFiltersCount,
      onSearch,
      onFilterChange,
      formatAmountRange,
      clearAllFilters,
      clearAdvancedFilters,
      applyAdvancedFilters,
      applySorting,
      createInvestment,
      applyBulkEdit,
      clearSelection
    }
  }
}
</script>

<style scoped>
.investment-toolbar {
  margin-bottom: 16px;
}
</style>