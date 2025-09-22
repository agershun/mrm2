<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Фильтрация активностей</span>
        <v-btn
          icon
          variant="text"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="filter-form">
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
  currency_code: null
})

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

// Methods
const close = () => {
  isOpen.value = false
}

const apply = () => {
  // Убираем пустые значения
  const filters = Object.fromEntries(
    Object.entries(localFilters.value).filter(([key, value]) =>
      value !== null && value !== undefined && value !== ''
    )
  )

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
    currency_code: null
  }
}

// Инициализация с текущими фильтрами
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Загружаем текущие фильтры
    const currentFilters = activitiesStore.filters
    localFilters.value = { ...localFilters.value, ...currentFilters }
  }
})
</script>

<style scoped>
.filter-form {
  max-height: 60vh;
  overflow-y: auto;
}

.date-range-filter {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
}
</style>