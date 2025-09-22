<template>
  <v-dialog
    v-model="isOpen"
    max-width="800"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <span>Фильтрация активностей</span>
          <div class="text-caption text-grey-darken-1 mt-1">
            Настройте условия для отображения активностей
          </div>
        </div>
        <v-btn
          icon
          variant="text"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-0">
        <div class="filter-form pa-6">
          <!-- Показать полную иерархию -->
          <div class="hierarchy-option mb-4 pa-3 rounded border">
            <v-switch
              v-model="localFilters.show_full_hierarchy"
              label="Показать полную иерархию"
              color="primary"
              density="compact"
              hide-details
            />
            <div class="text-caption text-grey-darken-1 mt-1">
              Отображать отфильтрованные активности вместе с их родительскими элементами для сохранения контекста
            </div>
          </div>

          <!-- Добавить условие фильтрации -->
          <div class="filter-conditions mb-4">
            <div class="d-flex align-center justify-space-between mb-3">
              <h4 class="text-subtitle-1">Условия фильтрации</h4>
              <v-btn
                variant="outlined"
                size="small"
                prepend-icon="mdi-plus"
                @click="addFilterCondition"
              >
                Добавить условие
              </v-btn>
            </div>

            <!-- Условия фильтрации -->
            <div v-if="filterConditions.length === 0" class="text-center pa-4 text-grey-darken-1">
              <v-icon size="48" class="mb-2">mdi-filter-off</v-icon>
              <div>Нет активных условий фильтрации</div>
              <div class="text-caption">Нажмите "Добавить условие" для создания фильтра</div>
            </div>

            <div
              v-for="(condition, index) in filterConditions"
              :key="condition.id"
              class="filter-condition-item pa-3 mb-3 rounded border"
            >
              <v-row align="center">
                <v-col cols="12" md="3">
                  <v-select
                    v-model="condition.field"
                    :items="filterFieldOptions"
                    label="Поле"
                    variant="outlined"
                    density="compact"
                    hide-details
                    @update:model-value="updateConditionType(condition)"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="condition.operator"
                    :items="getOperatorOptions(condition.field)"
                    label="Оператор"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="5">
                  <!-- Текстовое поле -->
                  <v-text-field
                    v-if="getFieldType(condition.field) === 'text'"
                    v-model="condition.value"
                    label="Значение"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                  <!-- Выбор из списка -->
                  <v-select
                    v-else-if="getFieldType(condition.field) === 'select'"
                    v-model="condition.value"
                    :items="getFieldOptions(condition.field)"
                    label="Значение"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                  />
                  <!-- Поле даты -->
                  <v-text-field
                    v-else-if="getFieldType(condition.field) === 'date'"
                    v-model="condition.value"
                    label="Значение"
                    type="date"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                  <!-- Числовое поле -->
                  <v-text-field
                    v-else-if="getFieldType(condition.field) === 'number'"
                    v-model="condition.value"
                    label="Значение"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="1">
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click="removeFilterCondition(index)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Логический оператор между условиями -->
              <div v-if="index < filterConditions.length - 1" class="text-center mt-3">
                <v-chip
                  color="primary"
                  variant="outlined"
                  size="small"
                >
                  И
                </v-chip>
              </div>
            </div>
          </div>

          <v-divider class="my-4" />

          <!-- Быстрые фильтры (оставляем для обратной совместимости) -->
          <div class="quick-filters">
            <h4 class="text-subtitle-1 mb-3">Быстрые фильтры</h4>
            <!-- Фильтр по названию -->
            <v-text-field
              v-model="localFilters.search"
              label="Название активности"
              placeholder="Введите название для поиска"
              prepend-icon="mdi-magnify"
              clearable
              class="mb-4"
            />

            <!-- Фильтр по типу активности -->
            <v-select
              v-model="localFilters.activity_type_id"
              :items="activityTypeOptions"
              label="Тип активности"
              prepend-icon="mdi-shape"
              clearable
              class="mb-4"
            />

            <!-- Фильтр по статусу -->
            <v-select
              v-model="localFilters.status"
              :items="statusOptions"
              label="Статус"
              prepend-icon="mdi-flag"
              clearable
              class="mb-4"
            />

            <!-- Фильтр по датам -->
            <div class="date-range-filter mb-4">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="localFilters.start_date"
                    label="Дата начала (от)"
                    type="date"
                    prepend-icon="mdi-calendar"
                    clearable
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="localFilters.end_date"
                    label="Дата начала (до)"
                    type="date"
                    prepend-icon="mdi-calendar"
                    clearable
                  />
                </v-col>
              </v-row>
            </div>

            <!-- Дополнительные фильтры -->
            <v-expansion-panels class="mb-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon class="me-2">mdi-tune</v-icon>
                  Дополнительные фильтры
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <!-- Фильтр по автору -->
                  <v-select
                    v-model="localFilters.created_by"
                    :items="userOptions"
                    label="Создано пользователем"
                    prepend-icon="mdi-account"
                    clearable
                    class="mb-3"
                  />

                  <!-- Фильтр по валюте -->
                  <v-select
                    v-model="localFilters.currency_code"
                    :items="currencyOptions"
                    label="Валюта"
                    prepend-icon="mdi-wallet"
                    clearable
                  />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-btn
          variant="outlined"
          @click="clearFilters"
        >
          Очистить все
        </v-btn>

        <v-spacer />

        <v-btn
          variant="outlined"
          @click="close"
        >
          Отмена
        </v-btn>

        <v-btn
          color="primary"
          @click="apply"
        >
          Применить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useActivitiesStore } from '@/stores/activitiesStore'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'apply'])

const activitiesStore = useActivitiesStore()

// State
const localFilters = ref({
  search: '',
  activity_type_id: null,
  status: null,
  start_date: null,
  end_date: null,
  created_by: null,
  currency_code: null,
  show_full_hierarchy: false
})

const filterConditions = ref([])
let conditionIdCounter = 0

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activityTypeOptions = computed(() => {
  return activitiesStore.activityTypes.map(type => ({
    value: type.activity_type_id,
    title: type.name
  }))
})

const statusOptions = ref([
  { value: 'Planning', title: 'Планирование' },
  { value: 'Active', title: 'Активна' },
  { value: 'Completed', title: 'Завершена' },
  { value: 'Cancelled', title: 'Отменена' },
  { value: 'On Hold', title: 'Приостановлена' }
])

const userOptions = ref([
  { value: '1', title: 'Александр Петров' },
  { value: '2', title: 'Елена Иванова' },
  { value: '3', title: 'Дмитрий Сидоров' }
])

const currencyOptions = ref([
  { value: 'RUB', title: 'Российский рубль (RUB)' },
  { value: 'USD', title: 'Доллар США (USD)' },
  { value: 'EUR', title: 'Евро (EUR)' }
])

// Опции для полей фильтрации
const filterFieldOptions = ref([
  { value: 'name', title: 'Название активности' },
  { value: 'activity_type_id', title: 'Тип активности' },
  { value: 'status', title: 'Статус' },
  { value: 'created_by', title: 'Создано пользователем' },
  { value: 'currency_code', title: 'Валюта' },
  { value: 'in_market_start_date', title: 'Дата начала проведения' },
  { value: 'in_market_end_date', title: 'Дата окончания проведения' },
  { value: 'planning_start_date', title: 'Дата начала планирования' },
  { value: 'planning_end_date', title: 'Дата окончания планирования' },
  { value: 'total_budget', title: 'Общий бюджет' }
])

// Операторы для разных типов полей
const textOperators = [
  { value: 'contains', title: 'содержит' },
  { value: 'not_contains', title: 'не содержит' },
  { value: 'equals', title: 'равно' },
  { value: 'not_equals', title: 'не равно' },
  { value: 'starts_with', title: 'начинается с' },
  { value: 'ends_with', title: 'заканчивается на' }
]

const selectOperators = [
  { value: 'equals', title: 'равно' },
  { value: 'not_equals', title: 'не равно' },
  { value: 'in', title: 'в списке' },
  { value: 'not_in', title: 'не в списке' }
]

const dateOperators = [
  { value: 'equals', title: 'равно' },
  { value: 'not_equals', title: 'не равно' },
  { value: 'greater_than', title: 'больше чем' },
  { value: 'less_than', title: 'меньше чем' },
  { value: 'greater_or_equal', title: 'больше или равно' },
  { value: 'less_or_equal', title: 'меньше или равно' },
  { value: 'between', title: 'между' }
]

const numberOperators = [
  { value: 'equals', title: 'равно' },
  { value: 'not_equals', title: 'не равно' },
  { value: 'greater_than', title: 'больше чем' },
  { value: 'less_than', title: 'меньше чем' },
  { value: 'greater_or_equal', title: 'больше или равно' },
  { value: 'less_or_equal', title: 'меньше или равно' },
  { value: 'between', title: 'между' }
]

// Methods
const close = () => {
  isOpen.value = false
}

const apply = () => {
  // Убираем пустые значения из базовых фильтров
  const baseFilters = Object.fromEntries(
    Object.entries(localFilters.value).filter(([key, value]) =>
      value !== null && value !== undefined && value !== ''
    )
  )

  // Добавляем условия фильтрации
  const filters = {
    ...baseFilters,
    conditions: filterConditions.value.filter(condition =>
      condition.field && condition.operator && condition.value !== null && condition.value !== ''
    )
  }

  emit('apply', filters)
  close()
}

const clearFilters = () => {
  localFilters.value = {
    search: '',
    activity_type_id: null,
    status: null,
    start_date: null,
    end_date: null,
    created_by: null,
    currency_code: null,
    show_full_hierarchy: false
  }
  filterConditions.value = []
}

const addFilterCondition = () => {
  filterConditions.value.push({
    id: ++conditionIdCounter,
    field: '',
    operator: '',
    value: ''
  })
}

const removeFilterCondition = (index) => {
  filterConditions.value.splice(index, 1)
}

const updateConditionType = (condition) => {
  // Сбрасываем оператор и значение при смене поля
  condition.operator = ''
  condition.value = ''
}

const getFieldType = (field) => {
  const fieldTypes = {
    'name': 'text',
    'activity_type_id': 'select',
    'status': 'select',
    'created_by': 'select',
    'currency_code': 'select',
    'in_market_start_date': 'date',
    'in_market_end_date': 'date',
    'planning_start_date': 'date',
    'planning_end_date': 'date',
    'total_budget': 'number'
  }
  return fieldTypes[field] || 'text'
}

const getOperatorOptions = (field) => {
  const fieldType = getFieldType(field)
  switch (fieldType) {
    case 'text':
      return textOperators
    case 'select':
      return selectOperators
    case 'date':
      return dateOperators
    case 'number':
      return numberOperators
    default:
      return textOperators
  }
}

const getFieldOptions = (field) => {
  switch (field) {
    case 'activity_type_id':
      return activityTypeOptions.value
    case 'status':
      return statusOptions.value
    case 'created_by':
      return userOptions.value
    case 'currency_code':
      return currencyOptions.value
    default:
      return []
  }
}

// Инициализация с текущими фильтрами
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Загружаем текущие фильтры
    const currentFilters = activitiesStore.filters
    localFilters.value = { ...localFilters.value, ...currentFilters }

    // Загружаем условия фильтрации если они есть
    if (currentFilters.conditions && Array.isArray(currentFilters.conditions)) {
      filterConditions.value = currentFilters.conditions.map(condition => ({
        ...condition,
        id: ++conditionIdCounter
      }))
    }
  }
})
</script>

<style scoped>
.filter-form {
  max-height: 70vh;
  overflow-y: auto;
}

.hierarchy-option {
  background: rgba(25, 118, 210, 0.05);
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.filter-conditions {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
}

.filter-condition-item {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease;
}

.filter-condition-item:hover {
  border-color: rgba(25, 118, 210, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quick-filters {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 16px;
}

.date-range-filter {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
}
</style>