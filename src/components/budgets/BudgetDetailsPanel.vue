<template>
  <div class="budget-details-panel">
    <!-- Заголовок панели -->
    <div class="panel-header d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-icon
          :icon="getBudgetIcon(selectedBudget.budget_type)"
          :color="getBudgetStatusColor(selectedBudget.status)"
          class="me-2"
          size="24"
        />
        <div>
          <h3 class="text-h6 mb-0">{{ selectedBudget.name }}</h3>
          <div class="text-caption text-grey">
            {{ selectedBudget.budget_type }} • {{ selectedBudget.status }}
          </div>
        </div>
      </div>
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        @click="$emit('close')"
      />
    </div>

    <v-divider />

    <!-- Содержимое панели -->
    <div class="panel-content" style="height: calc(100vh - 120px); overflow-y: auto;">
      <!-- Ключевые данные -->
      <v-expansion-panels v-model="expandedPanels" multiple variant="accordion">
        <!-- Основная информация -->
        <v-expansion-panel value="basic">
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon class="me-2">mdi-information</v-icon>
              Основная информация
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Kreola ID"
                  :model-value="selectedBudget.kreola_id || 'Не назначен'"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-identifier"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Persistent ID"
                  :model-value="selectedBudget.persistent_id || generatePersistentId()"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-database"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Создан"
                  :model-value="formatDateTime(selectedBudget.created_date)"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar-plus"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Последнее изменение"
                  :model-value="formatDateTime(selectedBudget.updated_date)"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar-edit"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  label="Описание"
                  :model-value="selectedBudget.description || 'Описание отсутствует'"
                  readonly
                  variant="outlined"
                  density="compact"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Финансовые показатели -->
        <v-expansion-panel value="financial">
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon class="me-2">mdi-currency-usd</v-icon>
              Финансовые показатели
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="financial-metrics">
              <v-row dense class="mb-4">
                <v-col cols="6" md="3">
                  <v-card variant="tonal" color="primary">
                    <v-card-text class="text-center pa-3">
                      <div class="text-h6 font-weight-bold">
                        {{ formatCurrency(selectedBudget.total_amount) }}
                      </div>
                      <div class="text-caption">Общий бюджет</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6" md="3">
                  <v-card variant="tonal" color="success">
                    <v-card-text class="text-center pa-3">
                      <div class="text-h6 font-weight-bold">
                        {{ formatCurrency(selectedBudget.allocated_amount) }}
                      </div>
                      <div class="text-caption">Распределено</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6" md="3">
                  <v-card variant="tonal" color="warning">
                    <v-card-text class="text-center pa-3">
                      <div class="text-h6 font-weight-bold">
                        {{ formatCurrency(selectedBudget.spent_amount) }}
                      </div>
                      <div class="text-caption">Потрачено</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6" md="3">
                  <v-card variant="tonal" color="info">
                    <v-card-text class="text-center pa-3">
                      <div class="text-h6 font-weight-bold">
                        {{ formatCurrency(selectedBudget.remaining_amount) }}
                      </div>
                      <div class="text-caption">Остаток</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Прогресс-бар использования -->
              <div class="mb-4">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-body-2 font-weight-medium">Использование бюджета</span>
                  <span class="text-h6 font-weight-bold">{{ getBudgetUtilization() }}%</span>
                </div>
                <v-progress-linear
                  :model-value="getBudgetUtilization()"
                  :color="getUtilizationColor(getBudgetUtilization())"
                  height="12"
                  rounded
                  striped
                >
                  <template v-slot:default="{ value }">
                    <strong class="text-white">{{ Math.ceil(value) }}%</strong>
                  </template>
                </v-progress-linear>
              </div>

              <!-- Дополнительные финансовые данные -->
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field
                    label="Валюта"
                    :model-value="selectedBudget.currency_code || 'RUB'"
                    readonly
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-currency-rub"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    label="Финансовый год"
                    :model-value="selectedBudget.fiscal_year || new Date().getFullYear()"
                    readonly
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-calendar"
                  />
                </v-col>
              </v-row>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Участники и доступы -->
        <v-expansion-panel value="participants">
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon class="me-2">mdi-account-group</v-icon>
              Участники и доступы
              <v-spacer />
              <v-chip size="small" variant="outlined">
                {{ assignedUsers.length }}
              </v-chip>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="participants-section">
              <!-- Список назначенных пользователей -->
              <div v-if="assignedUsers.length > 0">
                <v-list density="compact">
                  <v-list-item
                    v-for="user in assignedUsers"
                    :key="user.user_id"
                    :title="user.full_name"
                    :subtitle="user.email"
                  >
                    <template v-slot:prepend>
                      <v-avatar size="32">
                        <v-img v-if="user.avatar_url" :src="user.avatar_url" />
                        <span v-else>{{ getUserInitials(user.full_name) }}</span>
                      </v-avatar>
                    </template>
                    <template v-slot:append>
                      <v-chip
                        :color="getRoleColor(user.role)"
                        size="small"
                        variant="tonal"
                      >
                        {{ user.role }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
              <div v-else class="text-center py-4">
                <v-icon size="48" color="grey-lighten-1">mdi-account-off</v-icon>
                <p class="text-body-2 text-grey mt-2">Пользователи не назначены</p>
              </div>

              <!-- Кнопка управления пользователями -->
              <div class="mt-4">
                <v-btn
                  v-if="canManageUsers"
                  color="primary"
                  variant="outlined"
                  block
                  prepend-icon="mdi-account-plus"
                  @click="$emit('manage-users', selectedBudget)"
                >
                  Управление пользователями
                </v-btn>
              </div>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Системная информация -->
        <v-expansion-panel value="system">
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon class="me-2">mdi-cog</v-icon>
              Системная информация
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Владелец"
                  :model-value="ownerInfo.full_name || 'Не назначен'"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-account-star"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Статус синхронизации"
                  :model-value="getSyncStatus()"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-sync"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Последняя синхронизация"
                  :model-value="formatDateTime(selectedBudget.last_sync_date)"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-clock-outline"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Версия"
                  :model-value="selectedBudget.version || '1.0'"
                  readonly
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-tag"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Быстрые действия -->
        <v-expansion-panel value="actions">
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon class="me-2">mdi-lightning-bolt</v-icon>
              Быстрые действия
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="actions-grid">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-btn
                    variant="outlined"
                    size="small"
                    block
                    prepend-icon="mdi-pencil"
                    @click="$emit('edit-budget', selectedBudget)"
                  >
                    Редактировать
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    variant="outlined"
                    size="small"
                    block
                    prepend-icon="mdi-content-copy"
                    @click="$emit('copy-budget', selectedBudget)"
                  >
                    Дублировать
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    variant="outlined"
                    size="small"
                    block
                    prepend-icon="mdi-swap-horizontal"
                    @click="$emit('transfers', selectedBudget)"
                  >
                    Переводы
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    variant="outlined"
                    size="small"
                    block
                    prepend-icon="mdi-check-circle"
                    @click="$emit('approvals', selectedBudget)"
                  >
                    Утверждения
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    variant="outlined"
                    size="small"
                    block
                    prepend-icon="mdi-note-text"
                    @click="$emit('notes', selectedBudget)"
                  >
                    Заметки
                  </v-btn>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    variant="outlined"
                    size="small"
                    block
                    prepend-icon="mdi-history"
                    @click="$emit('audit-trail', selectedBudget)"
                  >
                    Аудит
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUsersStore } from '@/stores/usersStore'

// Props
const props = defineProps({
  selectedBudget: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits([
  'close',
  'manage-users',
  'edit-budget',
  'copy-budget',
  'transfers',
  'approvals',
  'notes',
  'audit-trail'
])

// Store
const usersStore = useUsersStore()

// Reactive state
const expandedPanels = ref(['basic', 'financial'])

// Computed properties
const currentUser = computed(() => usersStore.currentUser)

const canManageUsers = computed(() => {
  return ['Owner', 'Administrator'].includes(currentUser.value?.role)
})

const assignedUsers = computed(() => {
  return props.selectedBudget.assigned_users || []
})

const ownerInfo = computed(() => {
  return assignedUsers.value.find(user => user.role === 'Owner') ||
         assignedUsers.value.find(user => user.role === 'Administrator') ||
         { full_name: 'Система', email: 'system@kreola.ru' }
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

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

const getBudgetIcon = (type) => {
  switch (type) {
    case 'Folder':
      return 'mdi-folder'
    case 'Investment Plan':
      return 'mdi-chart-timeline-variant'
    default:
      return 'mdi-wallet'
  }
}

const getBudgetStatusColor = (status) => {
  switch (status) {
    case 'Active':
      return 'success'
    case 'Planning':
      return 'warning'
    case 'Reserved':
      return 'info'
    default:
      return 'grey'
  }
}

const getBudgetUtilization = () => {
  if (!props.selectedBudget.total_amount) return 0
  return Math.min(
    Math.round((props.selectedBudget.spent_amount / props.selectedBudget.total_amount) * 100),
    100
  )
}

const getUtilizationColor = (utilization) => {
  if (utilization >= 90) return 'error'
  if (utilization >= 75) return 'warning'
  if (utilization >= 50) return 'info'
  return 'success'
}

const getUserInitials = (fullName) => {
  return fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '??'
}

const getRoleColor = (role) => {
  switch (role) {
    case 'Owner':
      return 'purple'
    case 'Administrator':
      return 'red'
    case 'Editor':
      return 'orange'
    case 'Editor - Data Entry Only':
      return 'blue'
    case 'Viewer':
      return 'green'
    default:
      return 'grey'
  }
}

const generatePersistentId = () => {
  if (props.selectedBudget.persistent_id) {
    return props.selectedBudget.persistent_id
  }
  // Генерируем постоянный ID на основе budget_id
  return `PID-${props.selectedBudget.budget_id}-${Date.now().toString(36).toUpperCase()}`
}

const getSyncStatus = () => {
  const lastSync = props.selectedBudget.last_sync_date
  if (!lastSync) return 'Не синхронизировано'

  const syncDate = new Date(lastSync)
  const now = new Date()
  const diffHours = (now - syncDate) / (1000 * 60 * 60)

  if (diffHours < 1) return 'Синхронизировано'
  if (diffHours < 24) return 'Требуется синхронизация'
  return 'Устарело'
}
</script>

<style scoped>
.budget-details-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.panel-header {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.financial-metrics .v-card {
  transition: transform 0.2s ease;
}

.financial-metrics .v-card:hover {
  transform: translateY(-2px);
}

.participants-section {
  max-height: 300px;
  overflow-y: auto;
}

.actions-grid .v-btn {
  text-transform: none;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .financial-metrics .v-col {
    margin-bottom: 8px;
  }

  .actions-grid .v-col {
    margin-bottom: 4px;
  }
}

/* Стили для expansion panels */
:deep(.v-expansion-panel-title) {
  font-weight: 500;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px;
}
</style>