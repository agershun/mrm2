<template>
  <div class="budget-action-bar">
    <v-container fluid class="pa-4">
      <div class="d-flex align-center justify-space-between">
        <!-- Левая группа - основные действия -->
        <div class="d-flex align-center gap-2">
          <!-- Кнопки для владельцев системы (Owner) -->
          <template v-if="canManageHierarchy">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showCreateDialog"
              :disabled="isLoading"
            >
              New
            </v-btn>

            <v-btn
              variant="outlined"
              prepend-icon="mdi-delete"
              @click="deleteSelected"
              :disabled="!hasSelectedItems || isLoading"
              color="error"
            >
              Delete
            </v-btn>

            <v-btn
              variant="outlined"
              prepend-icon="mdi-content-copy"
              @click="copySelected"
              :disabled="!hasSelectedItems || isLoading"
            >
              Copy
            </v-btn>

            <v-btn
              variant="outlined"
              prepend-icon="mdi-cursor-move"
              @click="moveSelected"
              :disabled="!hasSelectedItems || isLoading"
            >
              Move
            </v-btn>

            <v-divider vertical class="mx-2" />
          </template>

          <!-- Кнопка Import для маркетологов -->
          <v-menu v-if="canImportData">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="outlined"
                prepend-icon="mdi-import"
                :disabled="isLoading"
              >
                Import
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>

            <v-list min-width="200">
              <v-list-subheader>Типы импорта</v-list-subheader>

              <v-list-item @click="importData('investment_plan')">
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-chart-timeline-variant</v-icon>
                </template>
                <v-list-item-title>Investment Plan</v-list-item-title>
                <v-list-item-subtitle>Импорт плана инвестиций</v-list-item-subtitle>
              </v-list-item>

              <v-list-item @click="importData('pos')">
                <template v-slot:prepend>
                  <v-icon color="warning">mdi-file-document</v-icon>
                </template>
                <v-list-item-title>POs (Purchase Orders)</v-list-item-title>
                <v-list-item-subtitle>Импорт заказов на покупку</v-list-item-subtitle>
              </v-list-item>

              <v-list-item @click="importData('actuals')">
                <template v-slot:prepend>
                  <v-icon color="success">mdi-cash</v-icon>
                </template>
                <v-list-item-title>Actuals</v-list-item-title>
                <v-list-item-subtitle>Импорт фактических затрат</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <!-- Правая группа - вспомогательные действия -->
        <div class="d-flex align-center gap-2">
          <!-- Статистика выделенных элементов -->
          <v-chip
            v-if="selectedItems.length > 0"
            color="primary"
            variant="outlined"
            size="small"
          >
            Выбрано: {{ selectedItems.length }}
          </v-chip>

          <!-- Фильтры -->
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="outlined"
                size="small"
                prepend-icon="mdi-filter"
              >
                Фильтры
                <v-badge
                  v-if="hasActiveFilters"
                  color="error"
                  content="!"
                  offset-x="8"
                  offset-y="8"
                />
              </v-btn>
            </template>

            <v-list min-width="250">
              <v-list-subheader>Фильтры отображения</v-list-subheader>

              <v-list-item>
                <v-checkbox
                  v-model="filters.showFolders"
                  label="Показать папки"
                  density="compact"
                  hide-details
                />
              </v-list-item>

              <v-list-item>
                <v-checkbox
                  v-model="filters.showInvestmentPlans"
                  label="Показать планы инвестиций"
                  density="compact"
                  hide-details
                />
              </v-list-item>

              <v-list-item>
                <v-checkbox
                  v-model="filters.showActiveOnly"
                  label="Только активные"
                  density="compact"
                  hide-details
                />
              </v-list-item>

              <v-divider />

              <v-list-item>
                <v-select
                  v-model="filters.currency"
                  :items="currencyOptions"
                  label="Валюта"
                  variant="outlined"
                  density="compact"
                  hide-details
                  clearable
                />
              </v-list-item>

              <v-list-item>
                <div class="d-flex gap-2 pt-2">
                  <v-btn
                    size="small"
                    variant="outlined"
                    @click="resetFilters"
                  >
                    Сбросить
                  </v-btn>
                  <v-btn
                    size="small"
                    color="primary"
                    @click="applyFilters"
                  >
                    Применить
                  </v-btn>
                </div>
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- Массовые операции -->
          <v-menu v-if="canManageHierarchy && selectedItems.length > 1">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="outlined"
                size="small"
                prepend-icon="mdi-cog"
              >
                Массовые операции
              </v-btn>
            </template>

            <v-list>
              <v-list-item @click="bulkChangeStatus">
                <template v-slot:prepend>
                  <v-icon>mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Изменить статус</v-list-item-title>
              </v-list-item>

              <v-list-item @click="bulkChangeCurrency">
                <template v-slot:prepend>
                  <v-icon>mdi-currency-usd</v-icon>
                </template>
                <v-list-item-title>Изменить валюту</v-list-item-title>
              </v-list-item>

              <v-list-item @click="bulkExport">
                <template v-slot:prepend>
                  <v-icon>mdi-download</v-icon>
                </template>
                <v-list-item-title>Экспорт выделенных</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- Настройки отображения -->
          <v-btn
            icon
            variant="text"
            size="small"
            @click="toggleViewMode"
            :title="isTableView ? 'Переключить на древовидный вид' : 'Переключить на табличный вид'"
          >
            <v-icon>{{ isTableView ? 'mdi-file-tree' : 'mdi-table' }}</v-icon>
          </v-btn>

          <!-- Обновить -->
          <v-btn
            icon
            variant="text"
            size="small"
            @click="refreshData"
            :loading="isLoading"
            title="Обновить данные"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </div>
    </v-container>

    <!-- Диалог создания -->
    <v-dialog v-model="createDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Создать новый элемент</span>
          <v-btn
            icon
            variant="text"
            @click="createDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-form ref="createForm" v-model="createFormValid">
            <!-- Тип элемента -->
            <v-radio-group
              v-model="newItem.type"
              label="Тип элемента"
              mandatory
              class="mb-4"
            >
              <v-radio
                label="Папка бюджета"
                value="folder"
              >
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-icon class="me-2" color="warning">mdi-folder</v-icon>
                    Папка бюджета
                  </div>
                </template>
              </v-radio>

              <v-radio
                label="План инвестиций"
                value="investment_plan"
              >
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-icon class="me-2" color="primary">mdi-chart-timeline-variant</v-icon>
                    План инвестиций
                  </div>
                </template>
              </v-radio>
            </v-radio-group>

            <!-- Название -->
            <v-text-field
              v-model="newItem.name"
              label="Название *"
              variant="outlined"
              :rules="[rules.required]"
              required
            />

            <!-- Описание -->
            <v-textarea
              v-model="newItem.description"
              label="Описание"
              variant="outlined"
              rows="3"
            />

            <!-- Родительский элемент -->
            <v-select
              v-model="newItem.parent_id"
              :items="availableParents"
              item-title="name"
              item-value="budget_id"
              label="Родительский элемент"
              variant="outlined"
              clearable
            />

            <!-- Валюта (только для планов инвестиций) -->
            <v-select
              v-if="newItem.type === 'investment_plan'"
              v-model="newItem.currency"
              :items="currencyOptions"
              label="Валюта *"
              variant="outlined"
              :rules="[rules.required]"
              required
            />

            <!-- Начальный бюджет (только для планов инвестиций) -->
            <v-text-field
              v-if="newItem.type === 'investment_plan'"
              v-model.number="newItem.initial_budget"
              label="Начальный бюджет"
              variant="outlined"
              type="number"
              min="0"
              step="0.01"
              suffix="₽"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn @click="createDialog = false">
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="createItem"
            :disabled="!createFormValid"
            :loading="isCreating"
          >
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useUsersStore } from '@/stores/usersStore'
import { useBudgetsStore } from '@/stores/budgetsStore'
import { useAppStore } from '@/stores/appStore'

const usersStore = useUsersStore()
const budgetsStore = useBudgetsStore()
const appStore = useAppStore()

// Props
const props = defineProps({
  selectedItems: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isTableView: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits([
  'create-item',
  'delete-items',
  'copy-items',
  'move-items',
  'import-data',
  'toggle-view',
  'refresh',
  'filter-change'
])

// State
const createDialog = ref(false)
const createFormValid = ref(false)
const isCreating = ref(false)
const createForm = ref(null)

const newItem = ref({
  type: 'folder',
  name: '',
  description: '',
  parent_id: null,
  currency: 'RUB',
  initial_budget: null
})

const filters = ref({
  showFolders: true,
  showInvestmentPlans: true,
  showActiveOnly: false,
  currency: null
})

// Computed
const currentUser = computed(() => usersStore.currentUser)
const hasSelectedItems = computed(() => props.selectedItems.length > 0)

// Права доступа
const canManageHierarchy = computed(() => {
  return currentUser.value?.role === 'Owner'
})

const canImportData = computed(() => {
  const allowedRoles = ['Owner', 'Administrator', 'Editor', 'Editor - Data Entry Only']
  return allowedRoles.includes(currentUser.value?.role)
})

const hasActiveFilters = computed(() => {
  return !filters.value.showFolders ||
         !filters.value.showInvestmentPlans ||
         filters.value.showActiveOnly ||
         filters.value.currency
})

const availableParents = computed(() => {
  return budgetsStore.budgets.filter(budget =>
    budget.budget_type === 'Folder' || budget.budget_type === 'Sub-folder'
  )
})

const currencyOptions = [
  { title: 'Российский рубль (RUB)', value: 'RUB' },
  { title: 'Доллар США (USD)', value: 'USD' },
  { title: 'Евро (EUR)', value: 'EUR' },
  { title: 'Британский фунт (GBP)', value: 'GBP' }
]

// Validation rules
const rules = {
  required: value => !!value || 'Поле обязательно для заполнения'
}

// Methods
const showCreateDialog = () => {
  // Сброс формы
  newItem.value = {
    type: 'folder',
    name: '',
    description: '',
    parent_id: null,
    currency: 'RUB',
    initial_budget: null
  }
  createDialog.value = true
}

const createItem = async () => {
  if (!createFormValid.value) return

  try {
    isCreating.value = true

    const itemData = {
      ...newItem.value,
      status: 'Active',
      fiscal_year: new Date().getFullYear()
    }

    await budgetsStore.createBudgetItem(itemData)

    createDialog.value = false
    appStore.showSuccess('Элемент успешно создан')
    emit('refresh')
  } catch (error) {
    appStore.showError(`Ошибка создания: ${error.message}`)
  } finally {
    isCreating.value = false
  }
}

const deleteSelected = async () => {
  if (!hasSelectedItems.value) return

  const itemNames = props.selectedItems.map(item => item.name).join(', ')
  const confirmed = confirm(
    `Вы уверены, что хотите удалить выбранные элементы?\n\n${itemNames}\n\nЭто действие нельзя отменить.`
  )

  if (confirmed) {
    try {
      await budgetsStore.deleteBudgetItems(props.selectedItems.map(item => item.budget_id))
      appStore.showSuccess(`Удалено элементов: ${props.selectedItems.length}`)
      emit('delete-items', props.selectedItems)
    } catch (error) {
      appStore.showError(`Ошибка удаления: ${error.message}`)
    }
  }
}

const copySelected = () => {
  emit('copy-items', props.selectedItems)
}

const moveSelected = () => {
  emit('move-items', props.selectedItems)
}

const importData = (type) => {
  emit('import-data', type)
}

const toggleViewMode = () => {
  emit('toggle-view')
}

const refreshData = () => {
  emit('refresh')
}

const resetFilters = () => {
  filters.value = {
    showFolders: true,
    showInvestmentPlans: true,
    showActiveOnly: false,
    currency: null
  }
  applyFilters()
}

const applyFilters = () => {
  emit('filter-change', { ...filters.value })
}

const bulkChangeStatus = () => {
  // TODO: Реализовать массовое изменение статуса
  appStore.showInfo('Массовое изменение статуса будет реализовано в следующих версиях')
}

const bulkChangeCurrency = () => {
  // TODO: Реализовать массовое изменение валюты
  appStore.showInfo('Массовое изменение валюты будет реализовано в следующих версиях')
}

const bulkExport = () => {
  // TODO: Реализовать экспорт выделенных элементов
  appStore.showInfo('Экспорт выделенных элементов будет реализован в следующих версиях')
}

// Watchers
watch(filters, (newFilters) => {
  applyFilters()
}, { deep: true })
</script>

<style scoped>
.budget-action-bar {
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.gap-2 {
  gap: 8px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .d-flex.justify-space-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .d-flex.align-center.gap-2 {
    flex-wrap: wrap;
  }
}

@media (max-width: 960px) {
  .budget-action-bar .v-container {
    padding-left: 8px;
    padding-right: 8px;
  }

  .d-flex.align-center.gap-2 .v-btn {
    min-width: auto;
  }
}
</style>