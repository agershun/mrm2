<template>
  <div class="details-panel-workflow">
    <v-container fluid class="pa-4">
      <!-- Статус процесса -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-workflow</v-icon>
          Статус рабочего процесса
        </v-card-title>
        <v-card-text class="pa-3">
          <div class="workflow-status-card pa-3 rounded border">
            <v-row>
              <v-col cols="12" md="4">
                <div class="status-info text-center">
                  <v-icon :color="getWorkflowStatusColor(workflowStatus.current)" size="32" class="mb-2">
                    {{ getWorkflowStatusIcon(workflowStatus.current) }}
                  </v-icon>
                  <div class="text-h6 font-weight-bold">{{ getWorkflowStatusText(workflowStatus.current) }}</div>
                  <div class="text-caption text-grey-darken-1">Текущий статус</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="status-info text-center">
                  <div class="text-h5 font-weight-bold text-primary">{{ workflowStatus.completedSteps }}</div>
                  <div class="text-body-2">из {{ workflowStatus.totalSteps }} этапов</div>
                  <div class="text-caption text-grey-darken-1">Завершено</div>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="status-info text-center">
                  <div class="text-h5 font-weight-bold text-info">{{ workflowStatus.progress }}%</div>
                  <div class="text-caption text-grey-darken-1">Общий прогресс</div>
                  <v-progress-linear
                    :model-value="workflowStatus.progress"
                    color="primary"
                    height="4"
                    rounded
                    class="mt-2"
                  />
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Этапы workflow -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-format-list-numbered</v-icon>
          Этапы выполнения
        </v-card-title>
        <v-card-text class="pa-3">
          <v-timeline side="end" density="compact">
            <v-timeline-item
              v-for="(step, index) in workflowSteps"
              :key="step.id"
              :dot-color="getStepStatusColor(step.status)"
              size="small"
              :icon="getStepStatusIcon(step.status)"
            >
              <div class="step-content">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="step-header">
                    <div class="text-subtitle-1 font-weight-medium">{{ step.name }}</div>
                    <div class="text-caption text-grey-darken-1">{{ step.description }}</div>
                  </div>
                  <div class="step-status">
                    <v-chip :color="getStepStatusColor(step.status)" size="small" variant="outlined">
                      {{ getStepStatusText(step.status) }}
                    </v-chip>
                  </div>
                </div>

                <div class="step-details">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <div class="detail-item">
                        <v-icon size="16" class="me-1">mdi-account</v-icon>
                        <span class="text-body-2">Ответственный: {{ step.assignee || 'Не назначен' }}</span>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <div class="detail-item">
                        <v-icon size="16" class="me-1">mdi-calendar</v-icon>
                        <span class="text-body-2">Срок: {{ formatDate(step.dueDate) }}</span>
                      </div>
                    </v-col>
                  </v-row>

                  <div v-if="step.status === 'in_progress'" class="step-progress mt-2">
                    <div class="d-flex justify-space-between text-caption mb-1">
                      <span>Прогресс выполнения</span>
                      <span>{{ step.progress }}%</span>
                    </div>
                    <v-progress-linear
                      :model-value="step.progress"
                      :color="getStepStatusColor(step.status)"
                      height="4"
                      rounded
                    />
                  </div>

                  <div v-if="step.comments && step.comments.length > 0" class="step-comments mt-2">
                    <div class="text-caption text-grey-darken-1 mb-1">Последний комментарий:</div>
                    <div class="comment-item pa-2 rounded bg-grey-lighten-4">
                      <div class="text-body-2">{{ step.comments[step.comments.length - 1].text }}</div>
                      <div class="text-caption text-grey-darken-1 mt-1">
                        {{ step.comments[step.comments.length - 1].author }} •
                        {{ formatDate(step.comments[step.comments.length - 1].date) }}
                      </div>
                    </div>
                  </div>

                  <div v-if="step.actions && step.actions.length > 0" class="step-actions mt-2">
                    <v-btn
                      v-for="action in step.actions"
                      :key="action.type"
                      :variant="action.primary ? 'elevated' : 'outlined'"
                      :color="action.color"
                      size="small"
                      class="me-2"
                      @click="executeAction(step, action)"
                    >
                      <v-icon start size="16">{{ action.icon }}</v-icon>
                      {{ action.label }}
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>

      <!-- Участники процесса -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-account-group</v-icon>
          Участники процесса
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col
              v-for="participant in workflowParticipants"
              :key="participant.id"
              cols="12"
              md="6"
            >
              <div class="participant-card pa-3 rounded border">
                <div class="d-flex align-center">
                  <v-avatar :color="participant.role === 'owner' ? 'primary' : 'secondary'" size="40" class="me-3">
                    <span class="text-white">{{ getInitials(participant.name) }}</span>
                  </v-avatar>
                  <div class="participant-info">
                    <div class="text-subtitle-2 font-weight-medium">{{ participant.name }}</div>
                    <div class="text-caption text-grey-darken-1">{{ getRoleText(participant.role) }}</div>
                    <div class="text-caption">{{ participant.email }}</div>
                  </div>
                  <div class="participant-status ms-auto">
                    <v-chip
                      :color="participant.status === 'active' ? 'success' : 'warning'"
                      size="x-small"
                      variant="outlined"
                    >
                      {{ participant.status === 'active' ? 'Активен' : 'Недоступен' }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- История изменений workflow -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-history</v-icon>
          История изменений
        </v-card-title>
        <v-card-text class="pa-3">
          <div
            v-for="(event, index) in workflowHistory"
            :key="index"
            class="history-event pa-3 mb-2 rounded border"
          >
            <div class="d-flex align-center">
              <v-icon :color="getEventColor(event.type)" class="me-3">{{ getEventIcon(event.type) }}</v-icon>
              <div class="event-info flex-grow-1">
                <div class="text-body-2">{{ event.description }}</div>
                <div class="text-caption text-grey-darken-1">
                  {{ event.user }} • {{ formatDateTime(event.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/appStore'

const props = defineProps({
  activity: {
    type: Object,
    default: () => ({})
  }
})

const appStore = useAppStore()

const workflowStatus = ref({
  current: 'in_progress',
  completedSteps: 3,
  totalSteps: 6,
  progress: 50
})

const workflowSteps = ref([
  {
    id: 1,
    name: 'Планирование кампании',
    description: 'Определение целей, аудитории и стратегии',
    status: 'completed',
    assignee: 'Александр Петров',
    dueDate: '2025-09-01',
    progress: 100,
    comments: [
      {
        text: 'Стратегия утверждена, переходим к следующему этапу',
        author: 'Александр Петров',
        date: '2025-09-01'
      }
    ]
  },
  {
    id: 2,
    name: 'Создание креативов',
    description: 'Разработка визуальных материалов и текстов',
    status: 'completed',
    assignee: 'Елена Иванова',
    dueDate: '2025-09-10',
    progress: 100,
    comments: [
      {
        text: 'Все креативы готовы и согласованы с заказчиком',
        author: 'Елена Иванова',
        date: '2025-09-10'
      }
    ]
  },
  {
    id: 3,
    name: 'Согласование бюджета',
    description: 'Утверждение финансирования кампании',
    status: 'completed',
    assignee: 'Дмитрий Сидоров',
    dueDate: '2025-09-15',
    progress: 100
  },
  {
    id: 4,
    name: 'Настройка рекламных кампаний',
    description: 'Техническая настройка размещения в каналах',
    status: 'in_progress',
    assignee: 'Елена Иванова',
    dueDate: '2025-09-25',
    progress: 65,
    comments: [
      {
        text: 'Google Ads настроен, работаем с Яндекс.Директ',
        author: 'Елена Иванова',
        date: '2025-09-22'
      }
    ],
    actions: [
      {
        type: 'update_progress',
        label: 'Обновить прогресс',
        icon: 'mdi-progress-clock',
        color: 'primary',
        primary: true
      },
      {
        type: 'add_comment',
        label: 'Добавить комментарий',
        icon: 'mdi-comment-plus',
        color: 'secondary'
      }
    ]
  },
  {
    id: 5,
    name: 'Запуск кампании',
    description: 'Активация рекламы во всех каналах',
    status: 'pending',
    assignee: 'Александр Петров',
    dueDate: '2025-10-01',
    progress: 0,
    actions: [
      {
        type: 'start_step',
        label: 'Начать этап',
        icon: 'mdi-play',
        color: 'success'
      }
    ]
  },
  {
    id: 6,
    name: 'Мониторинг и оптимизация',
    description: 'Отслеживание результатов и корректировка',
    status: 'pending',
    assignee: 'Дмитрий Сидоров',
    dueDate: '2025-12-31',
    progress: 0
  }
])

const workflowParticipants = ref([
  {
    id: 1,
    name: 'Александр Петров',
    email: 'a.petrov@kreola.ru',
    role: 'owner',
    status: 'active'
  },
  {
    id: 2,
    name: 'Елена Иванова',
    email: 'e.ivanova@kreola.ru',
    role: 'executor',
    status: 'active'
  },
  {
    id: 3,
    name: 'Дмитрий Сидоров',
    email: 'd.sidorov@kreola.ru',
    role: 'approver',
    status: 'active'
  },
  {
    id: 4,
    name: 'Мария Козлова',
    email: 'm.kozlova@kreola.ru',
    role: 'observer',
    status: 'inactive'
  }
])

const workflowHistory = ref([
  {
    type: 'step_completed',
    description: 'Завершен этап "Согласование бюджета"',
    user: 'Дмитрий Сидоров',
    timestamp: '2025-09-15T14:30:00Z'
  },
  {
    type: 'step_started',
    description: 'Начат этап "Настройка рекламных кампаний"',
    user: 'Елена Иванова',
    timestamp: '2025-09-15T14:35:00Z'
  },
  {
    type: 'comment_added',
    description: 'Добавлен комментарий к этапу "Настройка рекламных кампаний"',
    user: 'Елена Иванова',
    timestamp: '2025-09-22T10:15:00Z'
  },
  {
    type: 'participant_added',
    description: 'Добавлен участник Мария Козлова',
    user: 'Александр Петров',
    timestamp: '2025-09-20T09:00:00Z'
  }
])

// Methods
const getWorkflowStatusColor = (status) => {
  const colors = {
    'pending': 'grey',
    'in_progress': 'primary',
    'completed': 'success',
    'blocked': 'error',
    'cancelled': 'orange'
  }
  return colors[status] || 'grey'
}

const getWorkflowStatusIcon = (status) => {
  const icons = {
    'pending': 'mdi-clock-outline',
    'in_progress': 'mdi-play-circle',
    'completed': 'mdi-check-circle',
    'blocked': 'mdi-alert-circle',
    'cancelled': 'mdi-close-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

const getWorkflowStatusText = (status) => {
  const texts = {
    'pending': 'Ожидание',
    'in_progress': 'Выполняется',
    'completed': 'Завершен',
    'blocked': 'Заблокирован',
    'cancelled': 'Отменен'
  }
  return texts[status] || status
}

const getStepStatusColor = (status) => {
  const colors = {
    'pending': 'grey',
    'in_progress': 'primary',
    'completed': 'success',
    'blocked': 'error'
  }
  return colors[status] || 'grey'
}

const getStepStatusIcon = (status) => {
  const icons = {
    'pending': 'mdi-circle-outline',
    'in_progress': 'mdi-play',
    'completed': 'mdi-check',
    'blocked': 'mdi-block-helper'
  }
  return icons[status] || 'mdi-circle-outline'
}

const getStepStatusText = (status) => {
  const texts = {
    'pending': 'Ожидание',
    'in_progress': 'Выполняется',
    'completed': 'Завершено',
    'blocked': 'Заблокировано'
  }
  return texts[status] || status
}

const getRoleText = (role) => {
  const texts = {
    'owner': 'Владелец процесса',
    'executor': 'Исполнитель',
    'approver': 'Утверждающий',
    'observer': 'Наблюдатель'
  }
  return texts[role] || role
}

const getEventColor = (type) => {
  const colors = {
    'step_started': 'primary',
    'step_completed': 'success',
    'comment_added': 'info',
    'participant_added': 'secondary',
    'workflow_created': 'purple'
  }
  return colors[type] || 'grey'
}

const getEventIcon = (type) => {
  const icons = {
    'step_started': 'mdi-play',
    'step_completed': 'mdi-check',
    'comment_added': 'mdi-comment',
    'participant_added': 'mdi-account-plus',
    'workflow_created': 'mdi-plus'
  }
  return icons[type] || 'mdi-circle'
}

const getInitials = (name) => {
  return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
}

const formatDate = (date) => {
  if (!date) return 'Не указан'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return 'Не указано'
  return new Date(timestamp).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const executeAction = (step, action) => {
  switch (action.type) {
    case 'update_progress':
      appStore.showInfo('Диалог обновления прогресса будет реализован в следующих версиях')
      break
    case 'add_comment':
      appStore.showInfo('Диалог добавления комментария будет реализован в следующих версиях')
      break
    case 'start_step':
      appStore.showInfo('Функция запуска этапа будет реализована в следующих версиях')
      break
    default:
      appStore.showInfo(`Действие "${action.label}" будет реализовано в следующих версиях`)
  }
}
</script>

<style scoped>
.details-panel-workflow {
  height: 100%;
  overflow-y: auto;
}

.workflow-status-card {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.status-info {
  padding: 16px;
}

.step-content {
  padding: 8px 0;
}

.step-header {
  flex: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.comment-item {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.step-actions {
  margin-top: 8px;
}

.participant-card {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  height: 100%;
}

.participant-card:hover {
  background: #f0f0f0;
}

.participant-info {
  flex: 1;
}

.history-event {
  background: #fafafa;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.v-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.v-card-title {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-container {
    padding: 12px;
  }

  .participant-card {
    margin-bottom: 16px;
  }

  .step-actions .v-btn {
    margin-bottom: 8px;
  }
}
</style>