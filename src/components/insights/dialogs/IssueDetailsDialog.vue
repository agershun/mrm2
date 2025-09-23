<template>
  <v-dialog
    v-model="localShow"
    max-width="900px"
    persistent
  >
    <v-card>
      <v-card-title>
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-avatar
              size="32"
              :color="getSeverityColor(issue?.severity)"
              class="me-3"
            >
              <v-icon size="16" color="white">
                {{ getSeverityIcon(issue?.severity) }}
              </v-icon>
            </v-avatar>
            <div>
              <div class="text-h6">{{ issue?.title }}</div>
              <div class="text-caption text-grey">
                {{ getIssueTypeName(issue?.type) }} • {{ issue?.source }}
              </div>
            </div>
          </div>

          <v-chip
            :color="getSeverityColor(issue?.severity)"
            variant="tonal"
          >
            {{ getSeverityLabel(issue?.severity) }}
          </v-chip>
        </div>
      </v-card-title>

      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-2">Загрузка деталей...</p>
        </div>

        <div v-else-if="!issue" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">mdi-help</v-icon>
          <p class="text-grey mt-2">Информация о проблеме недоступна</p>
        </div>

        <div v-else>
          <!-- Основная информация -->
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1">Общая информация</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <div class="text-caption text-grey">Статус</div>
                      <v-chip
                        size="small"
                        :color="getStatusColor(issue.status)"
                        variant="tonal"
                      >
                        {{ getStatusLabel(issue.status) }}
                      </v-chip>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-grey">Приоритет</div>
                      <v-rating
                        :model-value="getPriorityRating(issue.priority)"
                        readonly
                        color="warning"
                        size="small"
                        density="compact"
                      />
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-grey">Обнаружено</div>
                      <div class="font-weight-medium">{{ formatDate(issue.detected_at) }}</div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-grey">Последнее обновление</div>
                      <div class="font-weight-medium">{{ formatDate(issue.updated_at) }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1">Затронутые данные</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <div class="text-caption text-grey">Затронутых записей</div>
                      <div class="text-h6 font-weight-bold text-error">
                        {{ formatNumber(issue.affected_records) }}
                      </div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-grey">Всего записей</div>
                      <div class="text-h6 font-weight-bold">
                        {{ formatNumber(issue.total_records) }}
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <div class="text-caption text-grey">Процент затронутых</div>
                      <v-progress-linear
                        :model-value="getAffectedPercentage()"
                        :color="getAffectedPercentageColor()"
                        height="8"
                        rounded
                        class="mt-1"
                      />
                      <div class="text-center text-caption mt-1">
                        {{ getAffectedPercentage() }}%
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Описание проблемы -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1">Описание проблемы</v-card-title>
            <v-card-text>
              <p class="text-body-1 mb-3">{{ issue.description }}</p>

              <div v-if="issue.error_details" class="mb-3">
                <div class="text-subtitle-2 mb-2">Детали ошибки:</div>
                <v-code class="pa-3" style="background-color: rgba(var(--v-theme-surface-variant), 0.5);">
                  {{ issue.error_details }}
                </v-code>
              </div>
            </v-card-text>
          </v-card>

          <!-- Примеры проблемных записей -->
          <v-card v-if="issue.sample_records && issue.sample_records.length > 0" variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1">Примеры проблемных записей</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="sampleRecordsHeaders"
                :items="issue.sample_records"
                :items-per-page="5"
                density="compact"
                hide-default-footer
              >
                <template #item.record_id="{ item }">
                  <code class="text-caption">{{ item.record_id }}</code>
                </template>

                <template #item.issue_description="{ item }">
                  <div class="text-body-2">{{ item.issue_description }}</div>
                </template>

                <template #item.expected_value="{ item }">
                  <div class="text-success">{{ item.expected_value }}</div>
                </template>

                <template #item.actual_value="{ item }">
                  <div class="text-error">{{ item.actual_value }}</div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>

          <!-- Рекомендации по исправлению -->
          <v-card v-if="issue.recommendations && issue.recommendations.length > 0" variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2" color="info">mdi-lightbulb</v-icon>
              Рекомендации по исправлению
            </v-card-title>
            <v-card-text>
              <v-expansion-panels variant="accordion">
                <v-expansion-panel
                  v-for="(recommendation, index) in issue.recommendations"
                  :key="index"
                >
                  <v-expansion-panel-title>
                    <div class="d-flex align-center">
                      <v-icon class="me-2" color="primary">mdi-check-circle</v-icon>
                      {{ recommendation.title }}
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="mb-3">{{ recommendation.description }}</div>

                    <div v-if="recommendation.steps && recommendation.steps.length > 0">
                      <div class="text-subtitle-2 mb-2">Шаги выполнения:</div>
                      <ol>
                        <li
                          v-for="step in recommendation.steps"
                          :key="step"
                          class="text-body-2 mb-1"
                        >
                          {{ step }}
                        </li>
                      </ol>
                    </div>

                    <div v-if="recommendation.estimated_time" class="mt-3">
                      <v-chip size="small" color="info" variant="tonal">
                        Время выполнения: {{ recommendation.estimated_time }}
                      </v-chip>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>

          <!-- История изменений -->
          <v-card v-if="issue.history && issue.history.length > 0" variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1">История изменений</v-card-title>
            <v-card-text>
              <v-timeline density="compact">
                <v-timeline-item
                  v-for="entry in issue.history"
                  :key="entry.timestamp"
                  :dot-color="getHistoryActionColor(entry.action)"
                  size="small"
                >
                  <template #icon>
                    <v-icon size="16" color="white">
                      {{ getHistoryActionIcon(entry.action) }}
                    </v-icon>
                  </template>

                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="font-weight-medium">{{ getHistoryActionName(entry.action) }}</div>
                      <div class="text-caption text-grey">{{ entry.description }}</div>
                      <div v-if="entry.user" class="text-caption">
                        {{ entry.user.name }}
                      </div>
                    </div>
                    <div class="text-caption text-grey">
                      {{ formatDateTime(entry.timestamp) }}
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
            </v-card-text>
          </v-card>

          <!-- Назначение ответственного -->
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-subtitle-1">Назначение и отслеживание</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedAssignee"
                    :items="availableAssignees"
                    item-title="name"
                    item-value="id"
                    label="Ответственный"
                    variant="outlined"
                    density="compact"
                  >
                    <template #item="{ props: itemProps, item }">
                      <v-list-item v-bind="itemProps">
                        <template #prepend>
                          <v-avatar size="32">
                            <v-img v-if="item.raw.avatar" :src="item.raw.avatar" />
                            <v-icon v-else>mdi-account</v-icon>
                          </v-avatar>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="dueDate"
                    label="Срок исправления"
                    type="date"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Комментарии -->
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1">Комментарии</v-card-title>
            <v-card-text>
              <div v-if="issue.comments && issue.comments.length > 0" class="mb-4">
                <div
                  v-for="comment in issue.comments"
                  :key="comment.id"
                  class="comment-item mb-3 pa-3"
                  style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 4px;"
                >
                  <div class="d-flex align-center mb-2">
                    <v-avatar size="24" class="me-2">
                      <v-img v-if="comment.user.avatar" :src="comment.user.avatar" />
                      <v-icon v-else size="12">mdi-account</v-icon>
                    </v-avatar>
                    <span class="font-weight-medium">{{ comment.user.name }}</span>
                    <v-spacer />
                    <span class="text-caption text-grey">{{ formatDateTime(comment.created_at) }}</span>
                  </div>
                  <div class="text-body-2">{{ comment.text }}</div>
                </div>
              </div>

              <v-textarea
                v-model="newComment"
                label="Добавить комментарий"
                variant="outlined"
                rows="3"
                hide-details
              />
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="close">Закрыть</v-btn>
        <v-btn
          v-if="newComment"
          color="info"
          @click="addComment"
        >
          Добавить комментарий
        </v-btn>
        <v-btn
          v-if="issue?.status === 'open'"
          color="success"
          @click="resolveIssue"
        >
          Решить проблему
        </v-btn>
        <v-btn
          color="primary"
          @click="saveChanges"
        >
          Сохранить изменения
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  issue: { type: Object, default: () => null },
  loading: { type: Boolean, default: false },
  availableAssignees: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'resolve-issue', 'save-changes', 'add-comment'])

const localShow = ref(props.show)
const selectedAssignee = ref(null)
const dueDate = ref('')
const newComment = ref('')

const sampleRecordsHeaders = [
  { title: 'ID записи', key: 'record_id', width: '15%' },
  { title: 'Описание проблемы', key: 'issue_description', width: '35%' },
  { title: 'Ожидаемое значение', key: 'expected_value', width: '25%' },
  { title: 'Фактическое значение', key: 'actual_value', width: '25%' }
]

watch(() => props.show, (newVal) => {
  localShow.value = newVal
  if (newVal && props.issue) {
    selectedAssignee.value = props.issue.assignee?.id || null
    dueDate.value = props.issue.due_date || ''
    newComment.value = ''
  }
})

watch(localShow, (newVal) => {
  if (!newVal) {
    emit('close')
  }
})

const getSeverityColor = (severity) => {
  const colors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return colors[severity] || 'grey'
}

const getSeverityIcon = (severity) => {
  const icons = {
    critical: 'mdi-alert-circle',
    high: 'mdi-alert',
    medium: 'mdi-information',
    low: 'mdi-alert-outline'
  }
  return icons[severity] || 'mdi-help'
}

const getSeverityLabel = (severity) => {
  const labels = {
    critical: 'Критичная',
    high: 'Высокая',
    medium: 'Средняя',
    low: 'Низкая'
  }
  return labels[severity] || severity
}

const getStatusColor = (status) => {
  const colors = {
    open: 'error',
    in_progress: 'warning',
    resolved: 'success',
    closed: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    open: 'Открыта',
    in_progress: 'В работе',
    resolved: 'Решена',
    closed: 'Закрыта'
  }
  return labels[status] || status
}

const getIssueTypeName = (type) => {
  const names = {
    missing_data: 'Отсутствующие данные',
    invalid_format: 'Неверный формат',
    duplicate_records: 'Дублирующие записи',
    data_inconsistency: 'Несогласованность',
    outdated_data: 'Устаревшие данные',
    validation_error: 'Ошибка валидации'
  }
  return names[type] || type
}

const getPriorityRating = (priority) => {
  const ratings = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
    urgent: 5
  }
  return ratings[priority] || 1
}

const getHistoryActionColor = (action) => {
  const colors = {
    created: 'info',
    updated: 'warning',
    resolved: 'success',
    reopened: 'error',
    assigned: 'primary'
  }
  return colors[action] || 'grey'
}

const getHistoryActionIcon = (action) => {
  const icons = {
    created: 'mdi-plus',
    updated: 'mdi-pencil',
    resolved: 'mdi-check',
    reopened: 'mdi-restore',
    assigned: 'mdi-account-plus'
  }
  return icons[action] || 'mdi-circle'
}

const getHistoryActionName = (action) => {
  const names = {
    created: 'Создана',
    updated: 'Обновлена',
    resolved: 'Решена',
    reopened: 'Переоткрыта',
    assigned: 'Назначена'
  }
  return names[action] || action
}

const getAffectedPercentage = () => {
  if (!props.issue?.total_records || props.issue.total_records === 0) return 0
  return Math.round((props.issue.affected_records / props.issue.total_records) * 100)
}

const getAffectedPercentageColor = () => {
  const percentage = getAffectedPercentage()
  if (percentage >= 75) return 'error'
  if (percentage >= 50) return 'warning'
  if (percentage >= 25) return 'info'
  return 'success'
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

const formatDateTime = (dateString) => {
  if (!dateString) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

const close = () => {
  localShow.value = false
}

const resolveIssue = () => {
  emit('resolve-issue', props.issue)
}

const saveChanges = () => {
  emit('save-changes', {
    issue: props.issue,
    assignee_id: selectedAssignee.value,
    due_date: dueDate.value
  })
}

const addComment = () => {
  if (newComment.value.trim()) {
    emit('add-comment', {
      issue: props.issue,
      comment: newComment.value.trim()
    })
    newComment.value = ''
  }
}
</script>

<style scoped>
.comment-item {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
}
</style>