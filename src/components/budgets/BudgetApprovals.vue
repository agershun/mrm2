<template>
  <v-dialog v-model="dialogVisible" max-width="1000px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-check-circle</v-icon>
          <div>
            <span class="text-h6">Система утверждений</span>
            <div class="text-caption text-grey">{{ budget.name }}</div>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="close"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <div class="approvals-content">
          <!-- Текущий статус -->
          <div class="status-header pa-4 bg-grey-lighten-5">
            <v-row align="center">
              <v-col cols="12" md="8">
                <div class="d-flex align-center">
                  <v-avatar
                    :color="getApprovalStatusColor(currentApproval.status)"
                    size="40"
                    class="me-3"
                  >
                    <v-icon
                      :icon="getApprovalStatusIcon(currentApproval.status)"
                      color="white"
                    />
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold">
                      {{ getApprovalStatusText(currentApproval.status) }}
                    </div>
                    <div class="text-caption text-grey">
                      Этап {{ currentApprovalStep }} из {{ totalApprovalSteps }}
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="4" class="text-right">
                <div class="text-caption text-grey">Последнее обновление</div>
                <div class="font-weight-medium">
                  {{ formatDateTime(currentApproval.updated_date) }}
                </div>
              </v-col>
            </v-row>

            <!-- Прогресс workflow -->
            <v-row class="mt-4">
              <v-col cols="12">
                <v-stepper
                  v-model="currentApprovalStep"
                  :items="approvalSteps"
                  hide-actions
                  flat
                  class="elevation-0"
                >
                  <template #item.title="{ item }">
                    <div class="text-body-2 font-weight-medium">{{ item.title }}</div>
                  </template>
                  <template #item.subtitle="{ item }">
                    <div class="text-caption">{{ item.subtitle }}</div>
                  </template>
                </v-stepper>
              </v-col>
            </v-row>
          </div>

          <v-divider />

          <!-- Панель управления -->
          <div class="management-toolbar pa-4">
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Поиск по утверждениям..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="statusFilter"
                  :items="approvalStatusOptions"
                  label="Статус"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="approverFilter"
                  :items="approverOptions"
                  label="Утверждающий"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <div class="d-flex gap-2">
                  <v-btn
                    v-if="canInitiateApproval"
                    color="primary"
                    variant="flat"
                    size="small"
                    prepend-icon="mdi-send"
                    @click="initiateApproval"
                  >
                    Отправить на утверждение
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </div>

          <v-divider />

          <!-- Действия для текущего пользователя -->
          <div
            v-if="userCanApprove && currentApproval.status === 'pending'"
            class="approval-actions pa-4 bg-primary-lighten-5"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="font-weight-bold text-primary">
                  Требуется ваше утверждение
                </div>
                <div class="text-caption">
                  Вы назначены утверждающим на этапе "{{ currentStepData.title }}"
                </div>
              </div>
              <div class="d-flex align-center gap-2">
                <v-btn
                  color="error"
                  variant="outlined"
                  size="small"
                  prepend-icon="mdi-close"
                  @click="openRejectDialog"
                >
                  Отклонить
                </v-btn>
                <v-btn
                  color="success"
                  variant="flat"
                  size="small"
                  prepend-icon="mdi-check"
                  @click="openApproveDialog"
                >
                  Утвердить
                </v-btn>
              </div>
            </div>
          </div>

          <!-- История утверждений -->
          <div class="approvals-history" style="height: 400px; overflow-y: auto;">
            <v-data-table
              :headers="historyHeaders"
              :items="filteredApprovalHistory"
              :search="searchQuery"
              item-key="id"
              density="compact"
              class="elevation-0"
            >
              <!-- Этап -->
              <template #item.step="{ item }">
                <div class="d-flex align-center">
                  <v-avatar
                    :color="getStepColor(item.step)"
                    size="24"
                    class="me-2"
                  >
                    <span class="text-caption font-weight-bold">{{ item.step }}</span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ item.step_name }}</div>
                    <div class="text-caption text-grey">{{ item.step_description }}</div>
                  </div>
                </div>
              </template>

              <!-- Утверждающий -->
              <template #item.approver="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="32" class="me-2">
                    <v-img v-if="item.approver.avatar_url" :src="item.approver.avatar_url" />
                    <span v-else>{{ getUserInitials(item.approver.full_name) }}</span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ item.approver.full_name }}</div>
                    <div class="text-caption text-grey">{{ item.approver.role }}</div>
                  </div>
                </div>
              </template>

              <!-- Статус -->
              <template #item.status="{ item }">
                <v-chip
                  :color="getApprovalStatusColor(item.status)"
                  size="small"
                  variant="tonal"
                >
                  <v-icon
                    :icon="getApprovalStatusIcon(item.status)"
                    size="16"
                    class="me-1"
                  />
                  {{ getApprovalStatusText(item.status) }}
                </v-chip>
              </template>

              <!-- Дата -->
              <template #item.date="{ item }">
                <div>
                  <div class="text-body-2">{{ formatDate(item.date) }}</div>
                  <div class="text-caption text-grey">{{ formatTime(item.date) }}</div>
                </div>
              </template>

              <!-- Комментарий -->
              <template #item.comment="{ item }">
                <div v-if="item.comment" class="comment-cell">
                  <div class="text-body-2">{{ item.comment }}</div>
                  <v-btn
                    v-if="item.comment.length > 100"
                    variant="text"
                    size="x-small"
                    @click="showFullComment(item)"
                  >
                    Показать полностью
                  </v-btn>
                </div>
                <span v-else class="text-grey">—</span>
              </template>

              <!-- Действия -->
              <template #item.actions="{ item }">
                <div class="d-flex align-center">
                  <v-btn
                    icon="mdi-information"
                    size="small"
                    variant="text"
                    @click="showApprovalDetails(item)"
                  />
                  <v-btn
                    v-if="item.attachments && item.attachments.length > 0"
                    icon="mdi-paperclip"
                    size="small"
                    variant="text"
                    @click="showAttachments(item)"
                  />
                </div>
              </template>
            </v-data-table>
          </div>

          <!-- Настройки workflow -->
          <div v-if="canManageWorkflow" class="workflow-settings pa-4 bg-grey-lighten-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <h4 class="text-subtitle-1">Настройки процесса утверждения</h4>
              <v-btn
                variant="outlined"
                size="small"
                prepend-icon="mdi-cog"
                @click="openWorkflowEditor"
              >
                Настроить workflow
              </v-btn>
            </div>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="workflowSettings.timeout_hours"
                  label="Таймаут (часы)"
                  type="number"
                  variant="outlined"
                  density="compact"
                  min="1"
                  max="168"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-checkbox
                  v-model="workflowSettings.auto_escalation"
                  label="Автоматическая эскалация"
                  color="primary"
                />
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <div class="d-flex align-center justify-space-between w-100">
          <!-- Статистика -->
          <div class="d-flex align-center gap-4">
            <div class="text-center">
              <div class="text-h6 font-weight-bold text-success">{{ approvedCount }}</div>
              <div class="text-caption">Утверждено</div>
            </div>
            <div class="text-center">
              <div class="text-h6 font-weight-bold text-warning">{{ pendingCount }}</div>
              <div class="text-caption">Ожидает</div>
            </div>
            <div class="text-center">
              <div class="text-h6 font-weight-bold text-error">{{ rejectedCount }}</div>
              <div class="text-caption">Отклонено</div>
            </div>
          </div>

          <!-- Основные действия -->
          <div class="d-flex align-center gap-2">
            <v-btn variant="text" @click="close">
              Закрыть
            </v-btn>
            <v-btn
              v-if="hasChanges"
              color="primary"
              variant="flat"
              @click="saveChanges"
              :loading="isSaving"
            >
              Сохранить изменения
            </v-btn>
          </div>
        </div>
      </v-card-actions>
    </v-card>

    <!-- Диалог утверждения -->
    <v-dialog v-model="showApproveDialog" max-width="600px">
      <v-card>
        <v-card-title>Утвердить бюджет</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-form @submit.prevent="submitApproval">
            <v-textarea
              v-model="approvalComment"
              label="Комментарий к утверждению"
              variant="outlined"
              rows="3"
              placeholder="Укажите комментарий (необязательно)"
            />
            <v-file-input
              v-model="approvalAttachments"
              label="Прикрепить файлы"
              variant="outlined"
              multiple
              chips
              show-size
            />
            <v-checkbox
              v-model="approvalNotifyNext"
              label="Уведомить следующего утверждающего"
              color="primary"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeApproveDialog">Отмена</v-btn>
          <v-btn
            color="success"
            @click="submitApproval"
            :loading="isSubmitting"
          >
            Утвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог отклонения -->
    <v-dialog v-model="showRejectDialog" max-width="600px">
      <v-card>
        <v-card-title>Отклонить бюджет</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-form @submit.prevent="submitRejection">
            <v-textarea
              v-model="rejectionComment"
              label="Причина отклонения *"
              variant="outlined"
              rows="3"
              required
              :rules="[v => !!v || 'Причина отклонения обязательна']"
            />
            <v-select
              v-model="rejectionAction"
              :items="rejectionActionOptions"
              label="Действие после отклонения"
              variant="outlined"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeRejectDialog">Отмена</v-btn>
          <v-btn
            color="error"
            @click="submitRejection"
            :loading="isSubmitting"
            :disabled="!rejectionComment"
          >
            Отклонить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useBudgetsStore } from '@/stores/budgetsStore'
import { useUsersStore } from '@/stores/usersStore'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  budget: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'approval-updated'])

// Stores
const budgetsStore = useBudgetsStore()
const usersStore = useUsersStore()

// Reactive state
const searchQuery = ref('')
const statusFilter = ref(null)
const approverFilter = ref(null)
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const approvalComment = ref('')
const rejectionComment = ref('')
const approvalAttachments = ref([])
const rejectionAction = ref('return_to_author')
const approvalNotifyNext = ref(true)
const isSubmitting = ref(false)
const isSaving = ref(false)
const hasChanges = ref(false)

const workflowSettings = ref({
  timeout_hours: 24,
  auto_escalation: true
})

// Computed properties
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentUser = computed(() => usersStore.currentUser)

const canInitiateApproval = computed(() => {
  return ['Owner', 'Administrator', 'Editor'].includes(currentUser.value?.role) &&
         currentApproval.value.status === 'draft'
})

const canManageWorkflow = computed(() => {
  return ['Owner', 'Administrator'].includes(currentUser.value?.role)
})

// Mock данные - в реальном приложении загружаются из API
const currentApproval = ref({
  id: 'approval_1',
  budget_id: props.budget?.budget_id,
  status: 'pending',
  current_step: 2,
  created_date: '2025-01-15T10:00:00Z',
  updated_date: '2025-01-16T14:30:00Z'
})

const approvalSteps = ref([
  {
    title: 'Инициация',
    subtitle: 'Запрос отправлен',
    icon: 'mdi-send',
    status: 'completed'
  },
  {
    title: 'Руководитель отдела',
    subtitle: 'А. Петров',
    icon: 'mdi-account-check',
    status: 'completed'
  },
  {
    title: 'Финансовый директор',
    subtitle: 'И. Сидоров',
    icon: 'mdi-currency-usd',
    status: 'active'
  },
  {
    title: 'Генеральный директор',
    subtitle: 'С. Иванов',
    icon: 'mdi-crown',
    status: 'pending'
  }
])

const approvalHistory = ref([
  {
    id: 'hist_1',
    step: 1,
    step_name: 'Инициация',
    step_description: 'Запрос создан',
    approver: {
      user_id: 'user_1',
      full_name: 'Анна Козлова',
      role: 'Editor',
      avatar_url: null
    },
    status: 'approved',
    date: '2025-01-15T10:00:00Z',
    comment: 'Создан запрос на утверждение бюджета маркетинговой кампании'
  },
  {
    id: 'hist_2',
    step: 2,
    step_name: 'Руководитель отдела',
    step_description: 'Проверка соответствия планам отдела',
    approver: {
      user_id: 'user_2',
      full_name: 'Алексей Петров',
      role: 'Administrator',
      avatar_url: null
    },
    status: 'approved',
    date: '2025-01-16T09:15:00Z',
    comment: 'Бюджет соответствует стратегии отдела маркетинга. Утверждаю.'
  },
  {
    id: 'hist_3',
    step: 3,
    step_name: 'Финансовый директор',
    step_description: 'Проверка финансовой обоснованности',
    approver: {
      user_id: 'user_3',
      full_name: 'Игорь Сидоров',
      role: 'Administrator',
      avatar_url: null
    },
    status: 'pending',
    date: '2025-01-16T14:30:00Z',
    comment: null
  }
])

const currentApprovalStep = computed(() => currentApproval.value.current_step)
const totalApprovalSteps = computed(() => approvalSteps.value.length)

const currentStepData = computed(() => {
  return approvalSteps.value[currentApprovalStep.value - 1] || {}
})

const userCanApprove = computed(() => {
  const currentStep = approvalHistory.value.find(h => h.step === currentApprovalStep.value)
  return currentStep?.approver.user_id === currentUser.value?.user_id
})

const filteredApprovalHistory = computed(() => {
  let filtered = approvalHistory.value

  if (statusFilter.value) {
    filtered = filtered.filter(item => item.status === statusFilter.value)
  }

  if (approverFilter.value) {
    filtered = filtered.filter(item => item.approver.user_id === approverFilter.value)
  }

  return filtered
})

// Опции
const approvalStatusOptions = [
  { title: 'Утверждено', value: 'approved' },
  { title: 'Ожидает', value: 'pending' },
  { title: 'Отклонено', value: 'rejected' }
]

const approverOptions = computed(() => {
  const uniqueApprovers = [...new Set(approvalHistory.value.map(h => h.approver))]
  return uniqueApprovers.map(approver => ({
    title: approver.full_name,
    value: approver.user_id
  }))
})

const rejectionActionOptions = [
  { title: 'Вернуть автору', value: 'return_to_author' },
  { title: 'Завершить процесс', value: 'terminate_process' },
  { title: 'Отправить на доработку', value: 'send_for_revision' }
]

// Заголовки таблицы
const historyHeaders = [
  { title: 'Этап', key: 'step', sortable: true },
  { title: 'Утверждающий', key: 'approver', sortable: false },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Дата', key: 'date', sortable: true },
  { title: 'Комментарий', key: 'comment', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false }
]

// Статистика
const approvedCount = computed(() => approvalHistory.value.filter(h => h.status === 'approved').length)
const pendingCount = computed(() => approvalHistory.value.filter(h => h.status === 'pending').length)
const rejectedCount = computed(() => approvalHistory.value.filter(h => h.status === 'rejected').length)

// Methods
const formatDateTime = (dateString) => {
  if (!dateString) return 'Не указано'
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

const formatTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const getUserInitials = (fullName) => {
  return fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '??'
}

const getApprovalStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'rejected':
      return 'error'
    case 'draft':
      return 'info'
    default:
      return 'grey'
  }
}

const getApprovalStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return 'mdi-check-circle'
    case 'pending':
      return 'mdi-clock'
    case 'rejected':
      return 'mdi-close-circle'
    case 'draft':
      return 'mdi-file-document-edit'
    default:
      return 'mdi-help-circle'
  }
}

const getApprovalStatusText = (status) => {
  const statusMap = {
    'approved': 'Утверждено',
    'pending': 'Ожидает утверждения',
    'rejected': 'Отклонено',
    'draft': 'Черновик'
  }
  return statusMap[status] || status
}

const getStepColor = (step) => {
  const colors = ['primary', 'secondary', 'accent', 'info', 'success']
  return colors[(step - 1) % colors.length]
}

// Event handlers
const initiateApproval = async () => {
  try {
    await budgetsStore.initiateApproval(props.budget.budget_id)
    currentApproval.value.status = 'pending'
    currentApproval.value.current_step = 1
    emit('approval-updated')
  } catch (error) {
    console.error('Failed to initiate approval:', error)
  }
}

const openApproveDialog = () => {
  approvalComment.value = ''
  approvalAttachments.value = []
  approvalNotifyNext.value = true
  showApproveDialog.value = true
}

const closeApproveDialog = () => {
  showApproveDialog.value = false
}

const openRejectDialog = () => {
  rejectionComment.value = ''
  rejectionAction.value = 'return_to_author'
  showRejectDialog.value = true
}

const closeRejectDialog = () => {
  showRejectDialog.value = false
}

const submitApproval = async () => {
  try {
    isSubmitting.value = true
    await budgetsStore.approveStep({
      approvalId: currentApproval.value.id,
      step: currentApprovalStep.value,
      comment: approvalComment.value,
      attachments: approvalAttachments.value,
      notifyNext: approvalNotifyNext.value
    })

    // Обновить историю
    const currentStepHistory = approvalHistory.value.find(h => h.step === currentApprovalStep.value)
    if (currentStepHistory) {
      currentStepHistory.status = 'approved'
      currentStepHistory.comment = approvalComment.value
      currentStepHistory.date = new Date().toISOString()
    }

    // Перейти к следующему шагу или завершить
    if (currentApprovalStep.value < totalApprovalSteps.value) {
      currentApproval.value.current_step++
    } else {
      currentApproval.value.status = 'approved'
    }

    closeApproveDialog()
    emit('approval-updated')
  } catch (error) {
    console.error('Failed to approve:', error)
  } finally {
    isSubmitting.value = false
  }
}

const submitRejection = async () => {
  if (!rejectionComment.value) return

  try {
    isSubmitting.value = true
    await budgetsStore.rejectStep({
      approvalId: currentApproval.value.id,
      step: currentApprovalStep.value,
      comment: rejectionComment.value,
      action: rejectionAction.value
    })

    // Обновить историю
    const currentStepHistory = approvalHistory.value.find(h => h.step === currentApprovalStep.value)
    if (currentStepHistory) {
      currentStepHistory.status = 'rejected'
      currentStepHistory.comment = rejectionComment.value
      currentStepHistory.date = new Date().toISOString()
    }

    currentApproval.value.status = 'rejected'

    closeRejectDialog()
    emit('approval-updated')
  } catch (error) {
    console.error('Failed to reject:', error)
  } finally {
    isSubmitting.value = false
  }
}

const showFullComment = (item) => {
  // TODO: Показать полный комментарий в диалоге
  console.log('Show full comment:', item.comment)
}

const showApprovalDetails = (item) => {
  // TODO: Показать детали утверждения
  console.log('Show approval details:', item)
}

const showAttachments = (item) => {
  // TODO: Показать вложения
  console.log('Show attachments:', item.attachments)
}

const openWorkflowEditor = () => {
  // TODO: Открыть редактор workflow
  console.log('Open workflow editor')
}

const saveChanges = async () => {
  try {
    isSaving.value = true
    await budgetsStore.updateApprovalSettings(props.budget.budget_id, workflowSettings.value)
    hasChanges.value = false
  } catch (error) {
    console.error('Failed to save changes:', error)
  } finally {
    isSaving.value = false
  }
}

const close = () => {
  dialogVisible.value = false
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Reset state when opening
    searchQuery.value = ''
    statusFilter.value = null
    approverFilter.value = null
  }
})

watch(workflowSettings, () => {
  hasChanges.value = true
}, { deep: true })
</script>

<style scoped>
.approvals-content {
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.status-header {
  flex-shrink: 0;
}

.management-toolbar {
  flex-shrink: 0;
  background-color: #f8f9fa;
}

.approval-actions {
  flex-shrink: 0;
}

.approvals-history {
  flex: 1;
  overflow-y: auto;
}

.workflow-settings {
  flex-shrink: 0;
}

.comment-cell {
  max-width: 250px;
}

/* Stepper customization */
:deep(.v-stepper) {
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.v-stepper-item) {
  padding: 8px 16px;
}

:deep(.v-stepper-item--selected) {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .management-toolbar .v-row {
    gap: 12px;
  }

  .status-header .v-row {
    text-align: center;
  }
}
</style>