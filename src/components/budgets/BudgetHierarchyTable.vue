<template>
  <div class="budget-hierarchy-table">
    <!-- Фильтры и поиск -->
    <div class="table-filters pa-4 bg-surface">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Поиск по названию"
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
            multiple
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="typeFilter"
            :items="typeOptions"
            label="Тип"
            variant="outlined"
            density="compact"
            multiple
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2" class="d-flex align-center">
          <v-btn
            variant="outlined"
            size="small"
            @click="resetFilters"
          >
            <v-icon>mdi-filter-off</v-icon>
            Сбросить
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <v-divider />

    <!-- Основная таблица -->
    <div class="table-container">
      <v-data-table
        v-model:expanded="expandedItems"
        v-model:selected="selectedItems"
        :headers="tableHeaders"
        :items="hierarchicalData"
        :loading="isLoading"
        :search="searchQuery"
        :custom-filter="customFilter"
        item-key="budget_id"
        show-select
        show-expand
        expand-on-click
        density="compact"
        fixed-header
        height="calc(100vh - 300px)"
        class="elevation-1"
        @click:row="onRowClick"
      >
        <!-- Столбец иерархии -->
        <template #item.hierarchy="{ item, internalItem }">
          <div class="hierarchy-cell d-flex align-center">
            <div
              class="hierarchy-indent"
              :style="{ marginLeft: (item.level * 20) + 'px' }"
            >
              <v-icon
                :icon="getBudgetIcon(item)"
                :color="getBudgetColor(item)"
                size="small"
                class="me-2"
              />
              <span class="font-weight-medium">{{ item.name }}</span>
              <v-chip
                v-if="item.budget_type"
                size="x-small"
                variant="outlined"
                class="ml-2"
              >
                {{ item.budget_type }}
              </v-chip>
            </div>
          </div>
        </template>

        <!-- Панель (статус и ключевые данные) -->
        <template #item.panel="{ item }">
          <div class="panel-cell">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              {{ item.status }}
            </v-chip>
            <div class="text-caption mt-1">
              {{ formatCurrency(item.total_amount) }}
            </div>
          </div>
        </template>

        <!-- Пользователи -->
        <template #item.users="{ item }">
          <div class="users-cell">
            <v-avatar-group
              v-if="item.assigned_users && item.assigned_users.length > 0"
              size="small"
              max="3"
            >
              <v-avatar
                v-for="user in item.assigned_users.slice(0, 3)"
                :key="user.user_id"
                size="small"
              >
                <v-img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.full_name"
                />
                <span v-else>{{ getUserInitials(user.full_name) }}</span>
              </v-avatar>
            </v-avatar-group>
            <span v-else class="text-caption text-grey">Не назначен</span>
          </div>
        </template>

        <!-- Управление пользователями -->
        <template #item.manage_users="{ item }">
          <v-btn
            v-if="canManageUsers"
            icon
            size="small"
            variant="text"
            @click.stop="openUserManagement(item)"
          >
            <v-icon>mdi-account-multiple-plus</v-icon>
          </v-btn>
        </template>

        <!-- Валюта -->
        <template #item.currency="{ item }">
          <v-select
            v-if="canEditSettings"
            v-model="item.currency_code"
            :items="currencyOptions"
            density="compact"
            variant="outlined"
            hide-details
            @update:model-value="updateCurrency(item, $event)"
          />
          <span v-else>{{ item.currency_code || 'RUB' }}</span>
        </template>

        <!-- POs (Purchase Orders) -->
        <template #item.pos="{ item }">
          <div class="pos-cell">
            <div class="d-flex align-center">
              <span class="text-body-2">{{ formatCurrency(item.po_amount) }}</span>
              <v-btn
                v-if="canManageFinancials"
                icon
                size="x-small"
                variant="text"
                class="ml-1"
                @click.stop="openPOMapping(item)"
              >
                <v-icon size="16">mdi-link</v-icon>
              </v-btn>
            </div>
            <div class="text-caption text-grey">
              POs: {{ item.po_count || 0 }}
            </div>
          </div>
        </template>

        <!-- Actuals -->
        <template #item.actuals="{ item }">
          <div class="actuals-cell">
            <div class="d-flex align-center">
              <span class="text-body-2">{{ formatCurrency(item.actual_amount) }}</span>
              <v-btn
                v-if="canManageFinancials"
                icon
                size="x-small"
                variant="text"
                class="ml-1"
                @click.stop="openActualsMapping(item)"
              >
                <v-icon size="16">mdi-link</v-icon>
              </v-btn>
            </div>
            <div class="text-caption text-grey">
              Фактов: {{ item.actuals_count || 0 }}
            </div>
          </div>
        </template>

        <!-- Approvals -->
        <template #item.approvals="{ item }">
          <div class="approvals-cell">
            <v-btn
              v-if="hasApprovals(item)"
              :color="getApprovalColor(item.approval_status)"
              size="small"
              variant="tonal"
              @click.stop="openApprovals(item)"
            >
              <v-icon size="16" class="me-1">{{ getApprovalIcon(item.approval_status) }}</v-icon>
              {{ item.approval_status }}
            </v-btn>
            <span v-else class="text-caption text-grey">—</span>
          </div>
        </template>

        <!-- Transfers -->
        <template #item.transfers="{ item }">
          <div class="transfers-cell">
            <v-btn
              v-if="canManageTransfers && item.budget_type === 'Investment Plan'"
              size="small"
              variant="outlined"
              @click.stop="openTransfers(item)"
            >
              <v-icon size="16" class="me-1">mdi-swap-horizontal</v-icon>
              Переводы
            </v-btn>
            <span v-else class="text-caption text-grey">—</span>
          </div>
        </template>

        <!-- Настройки -->
        <template #item.settings="{ item }">
          <v-btn
            v-if="canEditSettings"
            icon
            size="small"
            variant="text"
            @click.stop="openSettings(item)"
          >
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </template>

        <!-- Заметки -->
        <template #item.notes="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            :color="item.notes_count > 0 ? 'primary' : 'grey'"
            @click.stop="openNotes(item)"
          >
            <v-icon>mdi-note-text</v-icon>
            <span v-if="item.notes_count > 0" class="ml-1 text-caption">
              {{ item.notes_count }}
            </span>
          </v-btn>
        </template>

        <!-- Аудит -->
        <template #item.audit="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            @click.stop="openAuditTrail(item)"
          >
            <v-icon>mdi-history</v-icon>
          </v-btn>
        </template>

        <!-- Пустое состояние -->
        <template #no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-folder-outline</v-icon>
            <p class="text-body-1 mt-4">Нет данных для отображения</p>
          </div>
        </template>

        <!-- Состояние загрузки -->
        <template #loading>
          <v-skeleton-loader
            v-for="n in 10"
            :key="n"
            type="table-row"
            class="my-1"
          />
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useBudgetsStore } from '@/stores/budgetsStore'
import { useUsersStore } from '@/stores/usersStore'

// Stores
const budgetsStore = useBudgetsStore()
const usersStore = useUsersStore()

// Props & Emits
const emit = defineEmits([
  'open-user-management',
  'open-po-mapping',
  'open-actuals-mapping',
  'open-approvals',
  'open-transfers',
  'open-settings',
  'open-notes',
  'open-audit-trail',
  'row-selected'
])

// Reactive state
const searchQuery = ref('')
const statusFilter = ref([])
const typeFilter = ref([])
const expandedItems = ref([])
const selectedItems = ref([])

// Computed properties
const isLoading = computed(() => budgetsStore.isLoading)
const currentUser = computed(() => usersStore.currentUser)

// Роли и права доступа
const canManageUsers = computed(() => {
  return ['Owner', 'Administrator'].includes(currentUser.value?.role)
})

const canManageFinancials = computed(() => {
  return ['Owner', 'Administrator', 'Editor'].includes(currentUser.value?.role)
})

const canManageTransfers = computed(() => {
  return ['Owner', 'Administrator'].includes(currentUser.value?.role)
})

const canEditSettings = computed(() => {
  return ['Owner', 'Administrator'].includes(currentUser.value?.role)
})

// Опции для фильтров
const statusOptions = computed(() => [
  { title: 'Активный', value: 'Active' },
  { title: 'Планирование', value: 'Planning' },
  { title: 'Зарезервированный', value: 'Reserved' },
  { title: 'Завершенный', value: 'Completed' }
])

const typeOptions = computed(() => [
  { title: 'Папка', value: 'Folder' },
  { title: 'План инвестиций', value: 'Investment Plan' }
])

const currencyOptions = computed(() => [
  { title: 'RUB - Российский рубль', value: 'RUB' },
  { title: 'USD - Доллар США', value: 'USD' },
  { title: 'EUR - Евро', value: 'EUR' }
])

// Заголовки таблицы
const tableHeaders = computed(() => [
  {
    title: 'Иерархия',
    key: 'hierarchy',
    sortable: true,
    width: 300,
    fixed: true
  },
  {
    title: 'Панель',
    key: 'panel',
    sortable: false,
    width: 120
  },
  {
    title: 'Пользователи',
    key: 'users',
    sortable: false,
    width: 150
  },
  {
    title: 'Управление',
    key: 'manage_users',
    sortable: false,
    width: 100
  },
  {
    title: 'Валюта',
    key: 'currency',
    sortable: true,
    width: 120
  },
  {
    title: 'POs',
    key: 'pos',
    sortable: true,
    width: 130
  },
  {
    title: 'Факты',
    key: 'actuals',
    sortable: true,
    width: 130
  },
  {
    title: 'Утверждения',
    key: 'approvals',
    sortable: false,
    width: 140
  },
  {
    title: 'Переводы',
    key: 'transfers',
    sortable: false,
    width: 120
  },
  {
    title: 'Настройки',
    key: 'settings',
    sortable: false,
    width: 100
  },
  {
    title: 'Заметки',
    key: 'notes',
    sortable: false,
    width: 100
  },
  {
    title: 'Аудит',
    key: 'audit',
    sortable: false,
    width: 100
  }
])

// Данные с иерархической структурой
const hierarchicalData = computed(() => {
  let flatData = []

  const flattenHierarchy = (items, level = 0) => {
    items.forEach(item => {
      flatData.push({
        ...item,
        level: level
      })
      if (item.children && item.children.length > 0) {
        flattenHierarchy(item.children, level + 1)
      }
    })
  }

  if (budgetsStore.budgetHierarchy && budgetsStore.budgetHierarchy.length > 0) {
    flattenHierarchy(budgetsStore.budgetHierarchy)
  }

  return flatData
})

// Methods
const getBudgetIcon = (item) => {
  switch (item.budget_type) {
    case 'Folder':
      return 'mdi-folder'
    case 'Investment Plan':
      return 'mdi-chart-timeline-variant'
    default:
      return 'mdi-wallet'
  }
}

const getBudgetColor = (item) => {
  switch (item.status) {
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

const getStatusColor = (status) => {
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0)
}

const getUserInitials = (fullName) => {
  return fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '??'
}

const hasApprovals = (item) => {
  return item.approval_status && item.approval_status !== 'None'
}

const getApprovalColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'success'
    case 'Pending':
      return 'warning'
    case 'Rejected':
      return 'error'
    default:
      return 'grey'
  }
}

const getApprovalIcon = (status) => {
  switch (status) {
    case 'Approved':
      return 'mdi-check-circle'
    case 'Pending':
      return 'mdi-clock'
    case 'Rejected':
      return 'mdi-close-circle'
    default:
      return 'mdi-help-circle'
  }
}

const customFilter = (value, query, item) => {
  if (!query) return true

  const searchLower = query.toLowerCase()
  const itemName = item?.name?.toLowerCase() || ''
  const itemType = item?.budget_type?.toLowerCase() || ''
  const itemStatus = item?.status?.toLowerCase() || ''

  return itemName.includes(searchLower) ||
         itemType.includes(searchLower) ||
         itemStatus.includes(searchLower)
}

const resetFilters = () => {
  searchQuery.value = ''
  statusFilter.value = []
  typeFilter.value = []
}

const onRowClick = (event, { item }) => {
  emit('row-selected', item)
}

// Event handlers
const openUserManagement = (item) => {
  emit('open-user-management', item)
}

const openPOMapping = (item) => {
  emit('open-po-mapping', item)
}

const openActualsMapping = (item) => {
  emit('open-actuals-mapping', item)
}

const openApprovals = (item) => {
  emit('open-approvals', item)
}

const openTransfers = (item) => {
  emit('open-transfers', item)
}

const openSettings = (item) => {
  emit('open-settings', item)
}

const openNotes = (item) => {
  emit('open-notes', item)
}

const openAuditTrail = (item) => {
  emit('open-audit-trail', item)
}

const updateCurrency = async (item, newCurrency) => {
  try {
    await budgetsStore.updateBudgetCurrency(item.budget_id, newCurrency)
  } catch (error) {
    console.error('Error updating currency:', error)
  }
}

// Lifecycle
onMounted(() => {
  budgetsStore.fetchBudgets()
})

// Watchers
watch(selectedItems, (newSelection) => {
  budgetsStore.setSelectedItems(newSelection)
})
</script>

<style scoped>
.budget-hierarchy-table {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-filters {
  flex-shrink: 0;
}

.table-container {
  flex: 1;
  overflow: hidden;
}

.hierarchy-cell {
  min-width: 250px;
}

.hierarchy-indent {
  display: flex;
  align-items: center;
}

.panel-cell,
.users-cell,
.pos-cell,
.actuals-cell,
.approvals-cell,
.transfers-cell {
  text-align: center;
}

/* Стили для таблицы */
:deep(.v-data-table) {
  height: 100%;
}

:deep(.v-data-table__wrapper) {
  height: calc(100% - 60px);
}

:deep(.v-data-table-header) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

:deep(.v-data-table__tr--selected) {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .table-filters .v-row {
    gap: 8px;
  }
}

@media (max-width: 960px) {
  .table-filters {
    padding: 12px;
  }

  .hierarchy-cell {
    min-width: 200px;
  }
}
</style>