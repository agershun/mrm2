<template>
  <v-dialog v-model="dialogVisible" max-width="900px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-account-group</v-icon>
          <div>
            <span class="text-h6">Управление пользователями</span>
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
        <div class="user-management-content">
          <!-- Панель управления -->
          <div class="management-toolbar pa-4">
            <v-row align="center">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQuery"
                  placeholder="Поиск пользователей..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="roleFilter"
                  :items="roleOptions"
                  label="Роль"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-select
                  v-model="statusFilter"
                  :items="statusOptions"
                  label="Статус"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-account-plus"
                  @click="openAddUserDialog"
                >
                  Добавить
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <v-divider />

          <!-- Список пользователей -->
          <div class="users-list" style="height: 400px; overflow-y: auto;">
            <v-data-table
              v-model:selected="selectedUsers"
              :headers="tableHeaders"
              :items="filteredUsers"
              :loading="isLoading"
              :search="searchQuery"
              item-key="user_id"
              show-select
              density="compact"
              class="elevation-0"
            >
              <!-- Пользователь -->
              <template #item.user="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="32" class="me-3">
                    <v-img v-if="item.avatar_url" :src="item.avatar_url" />
                    <span v-else>{{ getUserInitials(item.full_name) }}</span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ item.full_name }}</div>
                    <div class="text-caption text-grey">{{ item.email }}</div>
                  </div>
                </div>
              </template>

              <!-- Роль -->
              <template #item.role="{ item }">
                <v-select
                  v-if="canEditUserRole(item)"
                  v-model="item.role"
                  :items="editableRoleOptions"
                  density="compact"
                  variant="outlined"
                  hide-details
                  @update:model-value="updateUserRole(item, $event)"
                />
                <v-chip
                  v-else
                  :color="getRoleColor(item.role)"
                  size="small"
                  variant="tonal"
                >
                  {{ getRoleText(item.role) }}
                </v-chip>
              </template>

              <!-- Статус регистрации -->
              <template #item.registration_status="{ item }">
                <div class="d-flex align-center">
                  <v-chip
                    :color="getRegistrationStatusColor(item.registration_status)"
                    size="small"
                    variant="tonal"
                  >
                    <v-icon
                      :icon="getRegistrationStatusIcon(item.registration_status)"
                      size="16"
                      class="me-1"
                    />
                    {{ getRegistrationStatusText(item.registration_status) }}
                  </v-chip>

                  <!-- Кнопка повторного приглашения -->
                  <v-btn
                    v-if="item.registration_status === 'invited' && canResendInvite"
                    icon="mdi-email-send"
                    size="x-small"
                    variant="text"
                    color="primary"
                    class="ml-2"
                    @click="resendInvitation(item)"
                  />
                </div>
              </template>

              <!-- Последняя активность -->
              <template #item.last_activity="{ item }">
                <div v-if="item.last_activity" class="text-caption">
                  {{ formatDateTime(item.last_activity) }}
                </div>
                <span v-else class="text-caption text-grey">Не входил</span>
              </template>

              <!-- Дата добавления -->
              <template #item.added_date="{ item }">
                <div class="text-caption">
                  {{ formatDate(item.added_date) }}
                </div>
              </template>

              <!-- Действия -->
              <template #item.actions="{ item }">
                <div class="d-flex align-center">
                  <!-- Редактировать -->
                  <v-btn
                    v-if="canEditUser(item)"
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    @click="editUser(item)"
                  />

                  <!-- Удалить -->
                  <v-btn
                    v-if="canRemoveUser(item)"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="removeUser(item)"
                  />

                  <!-- Заблокировать/Разблокировать -->
                  <v-btn
                    v-if="canToggleUserStatus(item)"
                    :icon="item.is_blocked ? 'mdi-account-check' : 'mdi-account-cancel'"
                    size="small"
                    variant="text"
                    :color="item.is_blocked ? 'success' : 'warning'"
                    @click="toggleUserStatus(item)"
                  />
                </div>
              </template>

              <!-- Пустое состояние -->
              <template #no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey-lighten-1">mdi-account-off</v-icon>
                  <p class="text-body-1 mt-4">Пользователи не найдены</p>
                </div>
              </template>
            </v-data-table>
          </div>

          <!-- Статистика -->
          <div class="statistics-section pa-4 bg-grey-lighten-5">
            <v-row>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-primary">{{ totalUsers }}</div>
                  <div class="text-caption">Всего пользователей</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-success">{{ activeUsers }}</div>
                  <div class="text-caption">Активных</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-warning">{{ pendingUsers }}</div>
                  <div class="text-caption">Ожидают</div>
                </div>
              </v-col>
              <v-col cols="6" md="3">
                <div class="text-center">
                  <div class="text-h6 font-weight-bold text-info">{{ blockedUsers }}</div>
                  <div class="text-caption">Заблокированы</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <div class="d-flex align-center justify-space-between w-100">
          <!-- Массовые действия -->
          <div class="d-flex align-center gap-2">
            <span v-if="selectedUsers.length > 0" class="text-caption">
              Выбрано: {{ selectedUsers.length }}
            </span>
            <v-btn
              v-if="selectedUsers.length > 0"
              variant="outlined"
              size="small"
              prepend-icon="mdi-email-send"
              @click="resendInvitationsForSelected"
            >
              Отправить приглашения
            </v-btn>
            <v-btn
              v-if="selectedUsers.length > 0"
              variant="outlined"
              size="small"
              color="error"
              prepend-icon="mdi-delete"
              @click="removeSelectedUsers"
            >
              Удалить выбранных
            </v-btn>
          </div>

          <!-- Основные действия -->
          <div class="d-flex align-center gap-2">
            <v-btn variant="text" @click="close">
              Отмена
            </v-btn>
            <v-btn
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

    <!-- Диалог добавления пользователя -->
    <v-dialog v-model="showAddUserDialog" max-width="600px">
      <v-card>
        <v-card-title>Добавить пользователя</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-form @submit.prevent="addUser">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newUser.email"
                  label="Email *"
                  type="email"
                  variant="outlined"
                  required
                  :rules="emailRules"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newUser.full_name"
                  label="Полное имя *"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newUser.role"
                  :items="editableRoleOptions"
                  label="Роль *"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newUser.invitation_message"
                  label="Сообщение приглашения"
                  variant="outlined"
                  rows="3"
                  placeholder="Персональное сообщение для нового пользователя (необязательно)"
                />
              </v-col>
              <v-col cols="12">
                <v-checkbox
                  v-model="newUser.send_invitation"
                  label="Отправить приглашение по email"
                  color="primary"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeAddUserDialog">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="addUser"
            :loading="isAddingUser"
            :disabled="!isAddUserFormValid"
          >
            Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useUsersStore } from '@/stores/usersStore'
import { useBudgetsStore } from '@/stores/budgetsStore'

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
const emit = defineEmits(['update:modelValue', 'users-updated'])

// Stores
const usersStore = useUsersStore()
const budgetsStore = useBudgetsStore()

// Reactive state
const searchQuery = ref('')
const roleFilter = ref(null)
const statusFilter = ref(null)
const selectedUsers = ref([])
const showAddUserDialog = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const isAddingUser = ref(false)

const newUser = ref({
  email: '',
  full_name: '',
  role: 'Viewer',
  invitation_message: '',
  send_invitation: true
})

// Computed properties
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentUser = computed(() => usersStore.currentUser)

const canResendInvite = computed(() => {
  return ['Owner', 'Administrator'].includes(currentUser.value?.role)
})

const budgetUsers = computed(() => {
  return props.budget.assigned_users || []
})

const filteredUsers = computed(() => {
  let filtered = budgetUsers.value

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(user => user.registration_status === statusFilter.value)
  }

  return filtered
})

// Статистика
const totalUsers = computed(() => budgetUsers.value.length)
const activeUsers = computed(() => budgetUsers.value.filter(u => u.registration_status === 'registered' && !u.is_blocked).length)
const pendingUsers = computed(() => budgetUsers.value.filter(u => u.registration_status === 'invited').length)
const blockedUsers = computed(() => budgetUsers.value.filter(u => u.is_blocked).length)

// Опции фильтров
const roleOptions = [
  { title: 'Владелец', value: 'Owner' },
  { title: 'Администратор', value: 'Administrator' },
  { title: 'Редактор', value: 'Editor' },
  { title: 'Редактор данных', value: 'Editor - Data Entry Only' },
  { title: 'Просмотр', value: 'Viewer' }
]

const editableRoleOptions = computed(() => {
  // Owner может назначать любые роли, кроме Owner
  if (currentUser.value?.role === 'Owner') {
    return roleOptions.filter(role => role.value !== 'Owner')
  }
  // Administrator может назначать роли ниже своего уровня
  if (currentUser.value?.role === 'Administrator') {
    return roleOptions.filter(role => !['Owner', 'Administrator'].includes(role.value))
  }
  // Остальные не могут назначать роли
  return []
})

const statusOptions = [
  { title: 'Зарегистрирован', value: 'registered' },
  { title: 'Приглашен', value: 'invited' },
  { title: 'Приглашение отклонено', value: 'declined' }
]

// Заголовки таблицы
const tableHeaders = [
  { title: 'Пользователь', key: 'user', sortable: true },
  { title: 'Роль', key: 'role', sortable: true },
  { title: 'Статус', key: 'registration_status', sortable: true },
  { title: 'Последняя активность', key: 'last_activity', sortable: true },
  { title: 'Добавлен', key: 'added_date', sortable: true },
  { title: 'Действия', key: 'actions', sortable: false }
]

// Валидация формы
const emailRules = [
  v => !!v || 'Email обязателен',
  v => /.+@.+\..+/.test(v) || 'Email должен быть действительным'
]

const isAddUserFormValid = computed(() => {
  return newUser.value.email &&
         newUser.value.full_name &&
         newUser.value.role &&
         /.+@.+\..+/.test(newUser.value.email)
})

// Methods
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

const getRoleText = (role) => {
  const roleMap = {
    'Owner': 'Владелец',
    'Administrator': 'Администратор',
    'Editor': 'Редактор',
    'Editor - Data Entry Only': 'Редактор данных',
    'Viewer': 'Просмотр'
  }
  return roleMap[role] || role
}

const getRegistrationStatusColor = (status) => {
  switch (status) {
    case 'registered':
      return 'success'
    case 'invited':
      return 'warning'
    case 'declined':
      return 'error'
    default:
      return 'grey'
  }
}

const getRegistrationStatusIcon = (status) => {
  switch (status) {
    case 'registered':
      return 'mdi-check-circle'
    case 'invited':
      return 'mdi-clock'
    case 'declined':
      return 'mdi-close-circle'
    default:
      return 'mdi-help-circle'
  }
}

const getRegistrationStatusText = (status) => {
  const statusMap = {
    'registered': 'Зарегистрирован',
    'invited': 'Приглашен',
    'declined': 'Отклонил'
  }
  return statusMap[status] || status
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'Никогда'
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

// Проверки прав доступа
const canEditUserRole = (user) => {
  // Нельзя редактировать свою собственную роль
  if (user.user_id === currentUser.value?.user_id) return false

  // Owner может редактировать все роли кроме других Owner
  if (currentUser.value?.role === 'Owner' && user.role !== 'Owner') return true

  // Administrator может редактировать роли ниже своего уровня
  if (currentUser.value?.role === 'Administrator' &&
      !['Owner', 'Administrator'].includes(user.role)) return true

  return false
}

const canEditUser = (user) => {
  return ['Owner', 'Administrator'].includes(currentUser.value?.role) &&
         user.user_id !== currentUser.value?.user_id
}

const canRemoveUser = (user) => {
  // Нельзя удалить себя
  if (user.user_id === currentUser.value?.user_id) return false

  // Owner может удалить всех кроме других Owner
  if (currentUser.value?.role === 'Owner' && user.role !== 'Owner') return true

  // Administrator может удалить роли ниже своего уровня
  if (currentUser.value?.role === 'Administrator' &&
      !['Owner', 'Administrator'].includes(user.role)) return true

  return false
}

const canToggleUserStatus = (user) => {
  return canRemoveUser(user)
}

// Event handlers
const updateUserRole = async (user, newRole) => {
  try {
    await budgetsStore.updateBudgetUserRole(props.budget.budget_id, user.user_id, newRole)
    user.role = newRole
  } catch (error) {
    console.error('Error updating user role:', error)
  }
}

const editUser = (user) => {
  console.log('Editing user:', user)
  // TODO: Implement user editing
}

const removeUser = async (user) => {
  if (confirm(`Удалить пользователя "${user.full_name}" из бюджета?`)) {
    try {
      await budgetsStore.removeBudgetUser(props.budget.budget_id, user.user_id)
      emit('users-updated')
    } catch (error) {
      console.error('Error removing user:', error)
    }
  }
}

const toggleUserStatus = async (user) => {
  const action = user.is_blocked ? 'разблокировать' : 'заблокировать'
  if (confirm(`Вы уверены, что хотите ${action} пользователя "${user.full_name}"?`)) {
    try {
      await budgetsStore.toggleBudgetUserStatus(props.budget.budget_id, user.user_id)
      user.is_blocked = !user.is_blocked
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }
}

const resendInvitation = async (user) => {
  try {
    await budgetsStore.resendBudgetInvitation(props.budget.budget_id, user.user_id)
    // TODO: Show success message
  } catch (error) {
    console.error('Error resending invitation:', error)
  }
}

const openAddUserDialog = () => {
  newUser.value = {
    email: '',
    full_name: '',
    role: 'Viewer',
    invitation_message: '',
    send_invitation: true
  }
  showAddUserDialog.value = true
}

const closeAddUserDialog = () => {
  showAddUserDialog.value = false
}

const addUser = async () => {
  if (!isAddUserFormValid.value) return

  try {
    isAddingUser.value = true
    await budgetsStore.addBudgetUser(props.budget.budget_id, newUser.value)
    closeAddUserDialog()
    emit('users-updated')
  } catch (error) {
    console.error('Error adding user:', error)
  } finally {
    isAddingUser.value = false
  }
}

const resendInvitationsForSelected = async () => {
  const invitedUsers = selectedUsers.value.filter(user => user.registration_status === 'invited')
  if (invitedUsers.length === 0) return

  try {
    await Promise.all(
      invitedUsers.map(user => budgetsStore.resendBudgetInvitation(props.budget.budget_id, user.user_id))
    )
    selectedUsers.value = []
    // TODO: Show success message
  } catch (error) {
    console.error('Error resending invitations:', error)
  }
}

const removeSelectedUsers = async () => {
  if (selectedUsers.value.length === 0) return

  if (confirm(`Удалить ${selectedUsers.value.length} пользователей из бюджета?`)) {
    try {
      await Promise.all(
        selectedUsers.value.map(user => budgetsStore.removeBudgetUser(props.budget.budget_id, user.user_id))
      )
      selectedUsers.value = []
      emit('users-updated')
    } catch (error) {
      console.error('Error removing users:', error)
    }
  }
}

const saveChanges = async () => {
  try {
    isSaving.value = true
    // Изменения уже сохраняются по мере их внесения
    close()
  } catch (error) {
    console.error('Error saving changes:', error)
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
    // Сбросить фильтры при открытии
    searchQuery.value = ''
    roleFilter.value = null
    statusFilter.value = null
    selectedUsers.value = []
  }
})
</script>

<style scoped>
.user-management-content {
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.management-toolbar {
  flex-shrink: 0;
  background-color: #f8f9fa;
}

.users-list {
  flex: 1;
  overflow-y: auto;
}

.statistics-section {
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .management-toolbar .v-row {
    gap: 12px;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>