<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">
        <v-icon class="me-2">mdi-content-save</v-icon>
        Сохранить представление
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="handleSave">
          <v-text-field
            v-model="viewName"
            label="Название представления"
            variant="outlined"
            :rules="[rules.required]"
            maxlength="100"
            counter
            autofocus
            class="mb-3"
          />

          <v-textarea
            v-model="viewDescription"
            label="Описание (опционально)"
            variant="outlined"
            rows="3"
            maxlength="500"
            counter
            class="mb-3"
          />

          <!-- Предварительный просмотр фильтров -->
          <v-card variant="outlined" class="mb-3">
            <v-card-subtitle>Сохраняемые фильтры</v-card-subtitle>
            <v-card-text>
              <div v-if="Object.keys(currentFilters).length === 0" class="text-grey">
                Нет активных фильтров
              </div>
              <div v-else>
                <v-chip
                  v-for="(value, key) in activeFilters"
                  :key="key"
                  size="small"
                  class="me-1 mb-1"
                  color="primary"
                  variant="tonal"
                >
                  {{ getFilterLabel(key) }}: {{ getFilterValue(value) }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <!-- Дополнительные настройки -->
          <v-expansion-panels variant="accordion" class="mb-3">
            <v-expansion-panel>
              <v-expansion-panel-title>
                Дополнительные настройки
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-checkbox
                  v-model="includeTimeRange"
                  label="Сохранить временной диапазон"
                  density="compact"
                />

                <v-checkbox
                  v-model="setAsDefault"
                  label="Сделать представлением по умолчанию"
                  density="compact"
                />

                <v-checkbox
                  v-model="shareWithTeam"
                  label="Поделиться с командой"
                  density="compact"
                />

                <v-select
                  v-if="shareWithTeam"
                  v-model="accessLevel"
                  :items="accessLevels"
                  label="Уровень доступа"
                  variant="outlined"
                  density="compact"
                  class="mt-2"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="$emit('update:model-value', false)"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          :loading="saving"
          @click="handleSave"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentFilters: {
    type: Object,
    default: () => ({})
  }
})

// Emits
defineEmits(['update:model-value', 'save'])

// Reactive data
const formRef = ref(null)
const viewName = ref('')
const viewDescription = ref('')
const includeTimeRange = ref(true)
const setAsDefault = ref(false)
const shareWithTeam = ref(false)
const accessLevel = ref('view')
const saving = ref(false)

// Validation rules
const rules = {
  required: (value) => !!value || 'Поле обязательно для заполнения'
}

// Options
const accessLevels = [
  { title: 'Только просмотр', value: 'view' },
  { title: 'Редактирование', value: 'edit' },
  { title: 'Полный доступ', value: 'admin' }
]

// Computed
const activeFilters = computed(() => {
  const filters = {}
  Object.keys(props.currentFilters).forEach(key => {
    const value = props.currentFilters[key]
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        filters[key] = value
      } else if (!Array.isArray(value)) {
        filters[key] = value
      }
    }
  })
  return filters
})

// Methods
const getFilterLabel = (key) => {
  const labels = {
    period: 'Период',
    channel: 'Канал',
    region: 'Регион',
    campaigns: 'Кампании',
    activities: 'Активности',
    roiRange: 'ROI диапазон',
    status: 'Статус',
    category: 'Категория'
  }
  return labels[key] || key
}

const getFilterValue = (value) => {
  if (Array.isArray(value)) {
    if (value.length > 3) {
      return `${value.slice(0, 3).join(', ')} и еще ${value.length - 3}`
    }
    return value.join(', ')
  }

  if (typeof value === 'object' && value.start !== undefined && value.end !== undefined) {
    return `${value.start} - ${value.end}`
  }

  return String(value)
}

const handleSave = async () => {
  const { valid } = await formRef.value.validate()

  if (!valid) return

  saving.value = true

  try {
    const viewData = {
      name: viewName.value,
      description: viewDescription.value,
      filters: includeTimeRange.value ? props.currentFilters : {
        ...props.currentFilters,
        period: undefined,
        startDate: undefined,
        endDate: undefined
      },
      isDefault: setAsDefault.value,
      isShared: shareWithTeam.value,
      accessLevel: shareWithTeam.value ? accessLevel.value : 'private'
    }

    emit('save', viewData)

    // Сбрасываем форму
    resetForm()
  } catch (error) {
    console.error('Error saving view:', error)
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  viewName.value = ''
  viewDescription.value = ''
  includeTimeRange.value = true
  setAsDefault.value = false
  shareWithTeam.value = false
  accessLevel.value = 'view'

  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Генерируем название по умолчанию
    const now = new Date()
    const dateStr = now.toLocaleDateString('ru-RU')
    const timeStr = now.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
    viewName.value = `Представление от ${dateStr} ${timeStr}`
  } else {
    resetForm()
  }
})
</script>

<style scoped>
/* Кастомизация expansion panels */
:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px !important;
}
</style>