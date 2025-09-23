<template>
  <v-dialog
    v-model="localShow"
    max-width="800px"
    persistent
  >
    <v-card>
      <v-card-title>
        <div class="d-flex align-center">
          <v-icon class="me-2" color="primary">mdi-link</v-icon>
          <span>Сопоставление данных</span>
        </div>
      </v-card-title>

      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-2">Поиск возможных сопоставлений...</p>
        </div>

        <div v-else>
          <!-- Информация о сопоставляемом элементе -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1">Сопоставляемый элемент</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <div class="text-caption text-grey">ID / Номер</div>
                  <div class="font-weight-medium">{{ item?.id || item?.number || item?.transaction_id }}</div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-caption text-grey">Тип</div>
                  <div class="font-weight-medium">{{ getItemTypeName(item?.type) }}</div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-caption text-grey">Сумма</div>
                  <div class="font-weight-medium">{{ formatCurrency(item?.amount) }}</div>
                </v-col>
                <v-col cols="12" md="6">
                  <div class="text-caption text-grey">Дата</div>
                  <div class="font-weight-medium">{{ formatDate(item?.date) }}</div>
                </v-col>
                <v-col cols="12">
                  <div class="text-caption text-grey">Описание</div>
                  <div class="font-weight-medium">{{ item?.description || 'Не указано' }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Поиск и фильтры -->
          <v-card variant="outlined" class="mb-4">
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="searchQuery"
                    label="Поиск"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedActivityType"
                    :items="activityTypes"
                    label="Тип активности"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Предложения автоматического сопоставления -->
          <div v-if="suggestions && suggestions.length > 0" class="mb-4">
            <div class="text-subtitle-1 mb-3">
              <v-icon class="me-2" color="info">mdi-lightbulb</v-icon>
              Предложения автоматического сопоставления
            </div>

            <v-card
              v-for="suggestion in suggestions"
              :key="suggestion.activity_id"
              variant="outlined"
              class="mb-2 suggestion-card"
              @click="selectSuggestion(suggestion)"
            >
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-avatar
                      size="32"
                      :color="getConfidenceColor(suggestion.confidence)"
                      class="me-3"
                    >
                      <span class="text-caption font-weight-bold">{{ suggestion.confidence }}%</span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ suggestion.activity_name }}</div>
                      <div class="text-caption text-grey">
                        {{ suggestion.activity_id }} • {{ formatCurrency(suggestion.planned_amount) }}
                      </div>
                    </div>
                  </div>

                  <div class="d-flex align-center">
                    <v-chip
                      size="small"
                      :color="getConfidenceColor(suggestion.confidence)"
                      variant="tonal"
                      class="me-2"
                    >
                      {{ getConfidenceLabel(suggestion.confidence) }}
                    </v-chip>
                    <v-radio-group v-model="selectedActivity" inline hide-details>
                      <v-radio :value="suggestion.activity_id" />
                    </v-radio-group>
                  </div>
                </div>

                <!-- Детали совпадения -->
                <div class="mt-2">
                  <v-chip-group>
                    <v-chip
                      v-for="match in suggestion.matching_criteria"
                      :key="match"
                      size="x-small"
                      color="success"
                      variant="tonal"
                    >
                      {{ getMatchingCriteriaName(match) }}
                    </v-chip>
                  </v-chip-group>
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Список всех активностей для ручного выбора -->
          <div>
            <div class="text-subtitle-1 mb-3">
              <v-icon class="me-2" color="primary">mdi-format-list-bulleted</v-icon>
              Все доступные активности
            </div>

            <div class="activities-list" style="max-height: 300px; overflow-y: auto;">
              <v-card
                v-for="activity in filteredActivities"
                :key="activity.activity_id"
                variant="outlined"
                class="mb-2 activity-card"
                :class="{ 'activity-selected': selectedActivity === activity.activity_id }"
                @click="selectActivity(activity)"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-avatar
                        size="32"
                        :color="getActivityStatusColor(activity.status)"
                        class="me-3"
                      >
                        <v-icon size="16" color="white">
                          {{ getActivityStatusIcon(activity.status) }}
                        </v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium">{{ activity.activity_name }}</div>
                        <div class="text-caption text-grey">
                          {{ activity.activity_id }} • {{ activity.activity_type }}
                        </div>
                      </div>
                    </div>

                    <div class="d-flex align-center">
                      <div class="text-right me-3">
                        <div class="font-weight-medium">{{ formatCurrency(activity.planned_amount) }}</div>
                        <div class="text-caption text-grey">{{ formatDate(activity.start_date) }}</div>
                      </div>
                      <v-radio-group v-model="selectedActivity" inline hide-details>
                        <v-radio :value="activity.activity_id" />
                      </v-radio-group>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>

          <!-- Создание новой активности -->
          <v-card variant="outlined" class="mt-4">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="font-weight-medium">Создать новую активность</div>
                  <div class="text-caption text-grey">
                    Если подходящая активность не найдена
                  </div>
                </div>
                <v-btn
                  color="primary"
                  variant="outlined"
                  @click="createNewActivity"
                >
                  Создать
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="close">Отмена</v-btn>
        <v-btn
          color="primary"
          :disabled="!selectedActivity"
          @click="confirmMapping"
        >
          Сопоставить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  item: { type: Object, default: () => ({}) },
  suggestions: { type: Array, default: () => [] },
  activities: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirm-mapping', 'create-new-activity'])

const localShow = ref(props.show)
const searchQuery = ref('')
const selectedActivityType = ref(null)
const selectedActivity = ref(null)

const activityTypes = [
  { title: 'Реклама', value: 'advertising' },
  { title: 'PR', value: 'pr' },
  { title: 'События', value: 'events' },
  { title: 'Контент', value: 'content' },
  { title: 'Исследования', value: 'research' },
  { title: 'Другое', value: 'other' }
]

watch(() => props.show, (newVal) => {
  localShow.value = newVal
  if (newVal) {
    // Сброс состояния при открытии
    searchQuery.value = ''
    selectedActivityType.value = null
    selectedActivity.value = null
  }
})

watch(localShow, (newVal) => {
  if (!newVal) {
    emit('close')
  }
})

const filteredActivities = computed(() => {
  let filtered = props.activities

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(activity =>
      activity.activity_name.toLowerCase().includes(query) ||
      activity.activity_id.toLowerCase().includes(query) ||
      activity.description?.toLowerCase().includes(query)
    )
  }

  if (selectedActivityType.value) {
    filtered = filtered.filter(activity =>
      activity.activity_type === selectedActivityType.value
    )
  }

  return filtered.sort((a, b) => {
    // Сначала активные, потом по дате начала
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1
    }
    return new Date(b.start_date) - new Date(a.start_date)
  })
})

const getItemTypeName = (type) => {
  const names = {
    po: 'Заказ на покупку',
    actual: 'Фактические данные',
    invoice: 'Счет',
    expense: 'Расход'
  }
  return names[type] || type
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return 'success'
  if (confidence >= 60) return 'info'
  if (confidence >= 40) return 'warning'
  return 'error'
}

const getConfidenceLabel = (confidence) => {
  if (confidence >= 80) return 'Высокая'
  if (confidence >= 60) return 'Средняя'
  if (confidence >= 40) return 'Низкая'
  return 'Очень низкая'
}

const getActivityStatusColor = (status) => {
  const colors = {
    active: 'success',
    planned: 'info',
    completed: 'primary',
    cancelled: 'error'
  }
  return colors[status] || 'grey'
}

const getActivityStatusIcon = (status) => {
  const icons = {
    active: 'mdi-play',
    planned: 'mdi-calendar',
    completed: 'mdi-check',
    cancelled: 'mdi-close'
  }
  return icons[status] || 'mdi-help'
}

const getMatchingCriteriaName = (criteria) => {
  const names = {
    amount: 'Сумма',
    vendor: 'Поставщик',
    date: 'Дата',
    description: 'Описание',
    category: 'Категория'
  }
  return names[criteria] || criteria
}

const formatCurrency = (value) => {
  if (!value) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

const selectSuggestion = (suggestion) => {
  selectedActivity.value = suggestion.activity_id
}

const selectActivity = (activity) => {
  selectedActivity.value = activity.activity_id
}

const confirmMapping = () => {
  if (selectedActivity.value) {
    emit('confirm-mapping', {
      item: props.item,
      activityId: selectedActivity.value
    })
    close()
  }
}

const createNewActivity = () => {
  emit('create-new-activity', props.item)
  close()
}

const close = () => {
  localShow.value = false
}
</script>

<style scoped>
.suggestion-card,
.activity-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-card:hover,
.activity-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.activity-selected {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.activities-list {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  padding: 8px;
}
</style>