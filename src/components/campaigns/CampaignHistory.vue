<template>
  <div class="campaign-history">
    <!-- Loading state -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" :size="40" />
      <div class="mt-2 text-body-2">Загрузка истории изменений...</div>
    </div>

    <!-- Empty state -->
    <v-card v-else-if="!history || history.length === 0" class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">
        mdi-history
      </v-icon>
      <h3 class="text-h6 mb-2">История пуста</h3>
      <p class="text-body-2 text-medium-emphasis">
        Здесь будут отображаться все изменения кампании
      </p>
    </v-card>

    <!-- History Timeline -->
    <div v-else>
      <!-- Filters -->
      <v-card class="mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="filterType"
                :items="eventTypeOptions"
                label="Тип события"
                clearable
                multiple
                chips
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="filterUser"
                :items="userOptions"
                label="Пользователь"
                clearable
                density="compact"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="dateRange"
                :items="dateRangeOptions"
                label="Период"
                density="compact"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Timeline -->
      <v-timeline
        direction="vertical"
        side="end"
        density="compact"
      >
        <v-timeline-item
          v-for="event in filteredHistory"
          :key="event.id"
          :dot-color="getEventColor(event.event_type)"
          size="small"
        >
          <template #icon>
            <v-icon
              :icon="getEventIcon(event.event_type)"
              size="16"
              color="white"
            />
          </template>

          <template #opposite>
            <div class="text-body-2 text-medium-emphasis">
              {{ formatDateTime(event.timestamp) }}
            </div>
          </template>

          <v-card>
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <v-chip
                    :color="getEventColor(event.event_type)"
                    size="small"
                    variant="flat"
                    class="me-2"
                  >
                    {{ getEventTypeText(event.event_type) }}
                  </v-chip>
                  <span class="text-body-2 text-medium-emphasis">
                    {{ event.user_name || event.user_email }}
                  </span>
                </div>
                <v-btn
                  v-if="event.details"
                  size="small"
                  variant="text"
                  @click="showEventDetails(event)"
                >
                  Подробнее
                </v-btn>
              </div>

              <div class="mb-2">
                <strong>{{ event.description }}</strong>
              </div>

              <!-- Show changes if available -->
              <div v-if="event.changes && event.changes.length > 0" class="changes-list">
                <div
                  v-for="change in event.changes.slice(0, 3)"
                  :key="change.field"
                  class="d-flex align-center mb-1"
                >
                  <v-icon size="16" color="info" class="me-2">mdi-pencil</v-icon>
                  <span class="text-body-2">
                    <strong>{{ getFieldName(change.field) }}:</strong>
                    <span class="text-medium-emphasis"> {{ change.old_value }} </span>
                    <v-icon size="12" class="mx-1">mdi-arrow-right</v-icon>
                    <span class="text-success"> {{ change.new_value }} </span>
                  </span>
                </div>
                <div v-if="event.changes.length > 3" class="text-body-2 text-medium-emphasis">
                  И еще {{ event.changes.length - 3 }} изменений...
                </div>
              </div>

              <!-- Show affected objects -->
              <div v-if="event.affected_objects" class="mt-2">
                <div class="text-body-2 text-medium-emphasis mb-1">Затронутые объекты:</div>
                <v-chip-group>
                  <v-chip
                    v-for="obj in event.affected_objects"
                    :key="obj.id"
                    size="small"
                    variant="outlined"
                  >
                    {{ obj.name || obj.id }}
                  </v-chip>
                </v-chip-group>
              </div>
            </v-card-text>
          </v-card>
        </v-timeline-item>
      </v-timeline>

      <!-- Load more button -->
      <div v-if="hasMore" class="text-center mt-4">
        <v-btn
          variant="outlined"
          @click="loadMore"
          :loading="loadingMore"
        >
          Загрузить еще
        </v-btn>
      </div>
    </div>

    <!-- Event Details Dialog -->
    <v-dialog
      v-model="showDetailsDialog"
      max-width="600"
    >
      <v-card v-if="selectedEvent">
        <v-card-title>
          Детали события
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="showDetailsDialog = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <div class="text-body-2 text-medium-emphasis mb-1">Тип события</div>
              <v-chip
                :color="getEventColor(selectedEvent.event_type)"
                size="small"
                variant="flat"
              >
                {{ getEventTypeText(selectedEvent.event_type) }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-body-2 text-medium-emphasis mb-1">Время</div>
              <div class="font-weight-medium">
                {{ formatDateTime(selectedEvent.timestamp) }}
              </div>
            </v-col>
            <v-col cols="12">
              <div class="text-body-2 text-medium-emphasis mb-1">Пользователь</div>
              <div class="font-weight-medium">
                {{ selectedEvent.user_name || selectedEvent.user_email }}
              </div>
            </v-col>
            <v-col cols="12">
              <div class="text-body-2 text-medium-emphasis mb-1">Описание</div>
              <div class="font-weight-medium">
                {{ selectedEvent.description }}
              </div>
            </v-col>
          </v-row>

          <!-- Detailed changes -->
          <div v-if="selectedEvent.changes && selectedEvent.changes.length > 0" class="mt-4">
            <h4 class="text-subtitle-1 mb-3">Изменения</h4>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Поле</th>
                  <th>Старое значение</th>
                  <th>Новое значение</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="change in selectedEvent.changes" :key="change.field">
                  <td class="font-weight-medium">{{ getFieldName(change.field) }}</td>
                  <td class="text-medium-emphasis">{{ change.old_value || '—' }}</td>
                  <td class="text-success">{{ change.new_value || '—' }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <!-- Additional details -->
          <div v-if="selectedEvent.details" class="mt-4">
            <h4 class="text-subtitle-1 mb-3">Дополнительная информация</h4>
            <pre class="text-body-2">{{ JSON.stringify(selectedEvent.details, null, 2) }}</pre>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  },
  history: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Local state
const filterType = ref([])
const filterUser = ref(null)
const dateRange = ref('all')
const loadingMore = ref(false)
const hasMore = ref(false)
const showDetailsDialog = ref(false)
const selectedEvent = ref(null)

// Computed
const filteredHistory = computed(() => {
  let result = props.history || []

  // Filter by event type
  if (filterType.value.length > 0) {
    result = result.filter(event => filterType.value.includes(event.event_type))
  }

  // Filter by user
  if (filterUser.value) {
    result = result.filter(event =>
      event.user_email === filterUser.value || event.user_name === filterUser.value
    )
  }

  // Filter by date range
  if (dateRange.value !== 'all') {
    const now = new Date()
    const cutoff = new Date()

    switch (dateRange.value) {
      case '1d':
        cutoff.setDate(now.getDate() - 1)
        break
      case '7d':
        cutoff.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoff.setDate(now.getDate() - 30)
        break
    }

    result = result.filter(event => new Date(event.timestamp) >= cutoff)
  }

  return result
})

const userOptions = computed(() => {
  const users = [...new Set(props.history?.map(event => event.user_name || event.user_email) || [])]
  return users.map(user => ({ title: user, value: user }))
})

// Options
const eventTypeOptions = [
  { title: 'Создание', value: 'created' },
  { title: 'Обновление', value: 'updated' },
  { title: 'Удаление', value: 'deleted' },
  { title: 'Запуск', value: 'started' },
  { title: 'Пауза', value: 'paused' },
  { title: 'Остановка', value: 'stopped' },
  { title: 'Дублирование', value: 'duplicated' },
  { title: 'Экспорт', value: 'exported' },
  { title: 'Импорт', value: 'imported' }
]

const dateRangeOptions = [
  { title: 'Все время', value: 'all' },
  { title: 'Сегодня', value: '1d' },
  { title: 'Неделя', value: '7d' },
  { title: '30 дней', value: '30d' }
]

// Methods
const showEventDetails = (event) => {
  selectedEvent.value = event
  showDetailsDialog.value = true
}

const loadMore = () => {
  loadingMore.value = true
  // TODO: Implement loading more history items
  setTimeout(() => {
    loadingMore.value = false
  }, 1000)
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('ru-RU')
}

const getEventColor = (eventType) => {
  const colors = {
    created: 'success',
    updated: 'info',
    deleted: 'error',
    started: 'success',
    paused: 'warning',
    stopped: 'error',
    duplicated: 'purple',
    exported: 'blue',
    imported: 'teal'
  }
  return colors[eventType] || 'grey'
}

const getEventIcon = (eventType) => {
  const icons = {
    created: 'mdi-plus',
    updated: 'mdi-pencil',
    deleted: 'mdi-delete',
    started: 'mdi-play',
    paused: 'mdi-pause',
    stopped: 'mdi-stop',
    duplicated: 'mdi-content-copy',
    exported: 'mdi-download',
    imported: 'mdi-upload'
  }
  return icons[eventType] || 'mdi-information'
}

const getEventTypeText = (eventType) => {
  const texts = {
    created: 'Создание',
    updated: 'Обновление',
    deleted: 'Удаление',
    started: 'Запуск',
    paused: 'Пауза',
    stopped: 'Остановка',
    duplicated: 'Дублирование',
    exported: 'Экспорт',
    imported: 'Импорт'
  }
  return texts[eventType] || eventType
}

const getFieldName = (field) => {
  const fieldNames = {
    name: 'Название',
    description: 'Описание',
    status: 'Статус',
    phase: 'Фаза',
    objective: 'Цель',
    budget_value: 'Бюджет',
    bid_amount: 'Ставка',
    start_date: 'Дата начала',
    end_date: 'Дата окончания',
    responsible_manager: 'Ответственный',
    tags: 'Теги'
  }
  return fieldNames[field] || field
}
</script>

<style scoped>
.campaign-history {
  max-width: 100%;
}

.changes-list {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
}

pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>