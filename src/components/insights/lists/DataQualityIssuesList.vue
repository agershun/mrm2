<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Проблемы качества данных</span>
        <div class="d-flex align-center">
          <v-btn-toggle v-model="filterSeverity" size="small" class="me-2">
            <v-btn value="all" size="small">Все</v-btn>
            <v-btn value="critical" size="small">Критичные</v-btn>
            <v-btn value="high" size="small">Высокие</v-btn>
          </v-btn-toggle>
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            @click="$emit('refresh')"
          />
        </div>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Загрузка проблем...</p>
      </div>

      <div v-else-if="!issues || issues.length === 0" class="text-center pa-8">
        <v-icon size="64" color="success">mdi-check-circle</v-icon>
        <p class="text-success mt-2">Проблем не обнаружено</p>
      </div>

      <div v-else>
        <!-- Сводка по типам проблем -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="error" size="32" class="mb-2">mdi-alert-circle</v-icon>
              <div class="text-h6 font-weight-bold text-error">{{ criticalIssuesCount }}</div>
              <div class="text-caption text-grey">Критичные</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="warning" size="32" class="mb-2">mdi-alert</v-icon>
              <div class="text-h6 font-weight-bold text-warning">{{ highIssuesCount }}</div>
              <div class="text-caption text-grey">Высокие</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="info" size="32" class="mb-2">mdi-information</v-icon>
              <div class="text-h6 font-weight-bold text-info">{{ mediumIssuesCount }}</div>
              <div class="text-caption text-grey">Средние</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="success" size="32" class="mb-2">mdi-check</v-icon>
              <div class="text-h6 font-weight-bold text-success">{{ resolvedIssuesCount }}</div>
              <div class="text-caption text-grey">Решенные</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Список проблем -->
        <div class="issues-list">
          <div
            v-for="issue in filteredIssues"
            :key="issue.id || issue.issue_id"
            class="issue-item mb-3"
          >
            <v-card
              variant="outlined"
              :class="getIssueCardClass(issue.severity)"
              @click="selectIssue(issue)"
            >
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between mb-3">
                  <div class="d-flex align-center">
                    <v-avatar
                      size="32"
                      :color="getSeverityColor(issue.severity)"
                      class="me-3"
                    >
                      <v-icon size="16" color="white">
                        {{ getSeverityIcon(issue.severity) }}
                      </v-icon>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ issue.title }}</div>
                      <div class="text-caption text-grey">
                        {{ getIssueTypeName(issue.category || issue.type) }} • {{ issue.source || 'Система' }}
                      </div>
                    </div>
                  </div>

                  <div class="d-flex align-center">
                    <v-chip
                      size="small"
                      :color="getSeverityColor(issue.severity)"
                      variant="tonal"
                      class="me-2"
                    >
                      {{ getSeverityLabel(issue.severity) }}
                    </v-chip>
                    <v-chip
                      size="small"
                      :color="getStatusColor(issue.status)"
                      variant="tonal"
                    >
                      {{ getStatusLabel(issue.status) }}
                    </v-chip>
                  </div>
                </div>

                <div class="mb-3">
                  <p class="text-body-2 mb-2">{{ issue.description }}</p>

                  <!-- Затронутые записи -->
                  <div class="d-flex align-center mb-2">
                    <v-icon size="14" color="grey" class="me-1">mdi-database</v-icon>
                    <span class="text-caption text-grey">
                      Затронуто записей: {{ formatNumber(issue.count || issue.affected_records || 0) }}
                    </span>
                    <span v-if="issue.total_records" class="text-caption text-grey ms-2">
                      ({{ getAffectedPercentage(issue) }}%)
                    </span>
                  </div>

                  <!-- Дата обнаружения -->
                  <div class="d-flex align-center">
                    <v-icon size="14" color="grey" class="me-1">mdi-calendar</v-icon>
                    <span class="text-caption text-grey">
                      Обнаружено: {{ formatDate(issue.lastDetected || issue.detected_at) }}
                    </span>
                    <span v-if="issue.resolved_at" class="text-caption text-grey ms-2">
                      • Решено: {{ formatDate(issue.resolved_at) }}
                    </span>
                  </div>
                </div>

                <!-- Рекомендации по исправлению -->
                <div v-if="issue.recommendations && issue.recommendations.length > 0" class="mb-3">
                  <div class="text-caption text-grey mb-1">Рекомендации:</div>
                  <ul class="recommendations-list">
                    <li
                      v-for="recommendation in issue.recommendations"
                      :key="recommendation"
                      class="text-caption"
                    >
                      {{ recommendation }}
                    </li>
                  </ul>
                </div>

                <!-- Действия -->
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <!-- Приоритет -->
                    <v-rating
                      :model-value="getPriorityRating(issue.priority)"
                      readonly
                      color="warning"
                      size="x-small"
                      density="compact"
                      class="me-3"
                    />

                    <!-- Ответственный -->
                    <div v-if="issue.assignee" class="d-flex align-center">
                      <v-avatar size="20" class="me-1">
                        <v-img v-if="issue.assignee.avatar" :src="issue.assignee.avatar" />
                        <v-icon v-else size="12">mdi-account</v-icon>
                      </v-avatar>
                      <span class="text-caption">{{ issue.assignee.name }}</span>
                    </div>
                  </div>

                  <div>
                    <v-btn
                      v-if="issue.status === 'open'"
                      size="small"
                      color="primary"
                      @click.stop="resolveIssue(issue)"
                    >
                      Решить
                    </v-btn>
                    <v-btn
                      v-else-if="issue.status === 'resolved'"
                      size="small"
                      color="success"
                      variant="tonal"
                      @click.stop="reopenIssue(issue)"
                    >
                      Переоткрыть
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="text"
                      @click.stop="viewDetails(issue)"
                    >
                      Детали
                    </v-btn>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <!-- Пагинация -->
        <div v-if="filteredIssues.length > 0" class="text-center mt-4">
          <v-btn
            v-if="hasMoreIssues"
            variant="outlined"
            @click="loadMoreIssues"
          >
            Загрузить еще
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  issues: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'refresh', 'issue-selected', 'resolve-issue',
  'reopen-issue', 'view-details', 'load-more'
])

const filterSeverity = ref('all')
const selectedIssue = ref(null)

const filteredIssues = computed(() => {
  if (filterSeverity.value === 'all') {
    return props.issues
  }
  return props.issues.filter(issue => issue.severity === filterSeverity.value)
})

const criticalIssuesCount = computed(() => {
  return props.issues.filter(issue => issue.severity === 'critical').length
})

const highIssuesCount = computed(() => {
  return props.issues.filter(issue => issue.severity === 'high').length
})

const mediumIssuesCount = computed(() => {
  return props.issues.filter(issue => issue.severity === 'medium').length
})

const resolvedIssuesCount = computed(() => {
  return props.issues.filter(issue => issue.status === 'resolved').length
})

const hasMoreIssues = computed(() => {
  // В реальном приложении это будет зависеть от пагинации API
  return false
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
    validation_error: 'Ошибка валидации',
    mapping: 'Сопоставление',
    completeness: 'Полнота данных',
    consistency: 'Согласованность',
    duplicates: 'Дубликаты'
  }
  return names[type] || type
}

const getIssueCardClass = (severity) => {
  return `issue-card-${severity}`
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

const getAffectedPercentage = (issue) => {
  if (!issue.total_records || issue.total_records === 0) return 0
  return Math.round((issue.affected_records / issue.total_records) * 100)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Не указано'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return 'Некорректная дата'
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const selectIssue = (issue) => {
  const issueId = issue.id || issue.issue_id
  const selectedId = selectedIssue.value?.id || selectedIssue.value?.issue_id
  selectedIssue.value = selectedId === issueId ? null : issue
  emit('issue-selected', selectedIssue.value)
}

const resolveIssue = (issue) => {
  emit('resolve-issue', issue)
}

const reopenIssue = (issue) => {
  emit('reopen-issue', issue)
}

const viewDetails = (issue) => {
  emit('view-details', issue)
}

const loadMoreIssues = () => {
  emit('load-more')
}
</script>

<style scoped>
.issue-item {
  cursor: pointer;
}

.issue-card-critical {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.issue-card-high {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.issue-card-medium {
  border-left: 4px solid rgb(var(--v-theme-info));
}

.issue-card-low {
  border-left: 4px solid rgb(var(--v-theme-success));
}

.recommendations-list {
  margin: 0;
  padding-left: 16px;
}

.recommendations-list li {
  margin-bottom: 4px;
}
</style>