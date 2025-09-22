<template>
  <div class="budget-toolbar">
    <v-toolbar
      color="transparent"
      flat
      density="compact"
    >
      <!-- Левая часть - действия с выбранными -->
      <div class="d-flex align-center">
        <template v-if="selectedItems.length > 0">
          <v-chip
            color="primary"
            variant="tonal"
            size="small"
            class="me-3"
          >
            Выбрано: {{ selectedItems.length }}
          </v-chip>

          <v-btn
            variant="text"
            size="small"
            @click="bulkEdit"
          >
            <v-icon class="me-1">mdi-pencil</v-icon>
            Редактировать
          </v-btn>

          <v-btn
            variant="text"
            size="small"
            @click="bulkMove"
          >
            <v-icon class="me-1">mdi-folder-move</v-icon>
            Переместить
          </v-btn>

          <v-btn
            variant="text"
            size="small"
            @click="bulkArchive"
          >
            <v-icon class="me-1">mdi-archive</v-icon>
            Архивировать
          </v-btn>

          <v-divider vertical class="mx-2" />

          <v-btn
            variant="text"
            size="small"
            color="error"
            @click="bulkDelete"
          >
            <v-icon class="me-1">mdi-delete</v-icon>
            Удалить
          </v-btn>
        </template>

        <template v-else>
          <!-- Кнопки создания -->
          <v-btn-group variant="outlined" density="compact">
            <v-btn @click="createFolder">
              <v-icon class="me-1">mdi-folder-plus</v-icon>
              Папка
            </v-btn>
            <v-btn @click="createBudget">
              <v-icon class="me-1">mdi-wallet</v-icon>
              Бюджет
            </v-btn>
            <v-btn @click="createPlan">
              <v-icon class="me-1">mdi-chart-line</v-icon>
              План
            </v-btn>
          </v-btn-group>

          <v-divider vertical class="mx-3" />

          <!-- Импорт/Экспорт -->
          <v-btn
            variant="text"
            size="small"
            @click="importBudgets"
          >
            <v-icon class="me-1">mdi-upload</v-icon>
            Импорт
          </v-btn>

          <v-btn
            variant="text"
            size="small"
            @click="exportBudgets"
          >
            <v-icon class="me-1">mdi-download</v-icon>
            Экспорт
          </v-btn>
        </template>
      </div>

      <v-spacer />

      <!-- Правая часть - настройки вида -->
      <div class="d-flex align-center">
        <!-- Фильтры -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              size="small"
              :color="hasActiveFilters ? 'primary' : 'default'"
            >
              <v-icon class="me-1">mdi-filter</v-icon>
              Фильтры
              <v-badge
                v-if="activeFiltersCount > 0"
                :content="activeFiltersCount"
                color="primary"
                offset-x="5"
                offset-y="5"
              />
            </v-btn>
          </template>
          <v-card min-width="300">
            <v-card-title class="text-subtitle-1">Фильтры</v-card-title>
            <v-divider />
            <v-card-text>
              <!-- Статус -->
              <div class="mb-4">
                <v-label class="text-caption mb-2">Статус</v-label>
                <v-chip-group
                  v-model="filters.status"
                  multiple
                  variant="outlined"
                  size="small"
                >
                  <v-chip value="active">Активные</v-chip>
                  <v-chip value="draft">Черновики</v-chip>
                  <v-chip value="approved">Утвержденные</v-chip>
                  <v-chip value="archived">Архивные</v-chip>
                </v-chip-group>
              </div>

              <!-- Тип -->
              <div class="mb-4">
                <v-label class="text-caption mb-2">Тип</v-label>
                <v-chip-group
                  v-model="filters.type"
                  multiple
                  variant="outlined"
                  size="small"
                >
                  <v-chip value="folder">Папки</v-chip>
                  <v-chip value="budget">Бюджеты</v-chip>
                  <v-chip value="plan">Планы</v-chip>
                </v-chip-group>
              </div>

              <!-- Сумма -->
              <div class="mb-4">
                <v-label class="text-caption mb-2">Диапазон сумм</v-label>
                <v-range-slider
                  v-model="filters.amountRange"
                  :min="0"
                  :max="100000000"
                  :step="1000000"
                  thumb-label="always"
                  color="primary"
                />
              </div>

              <!-- Ответственный -->
              <div class="mb-4">
                <v-autocomplete
                  v-model="filters.owners"
                  :items="availableOwners"
                  label="Ответственный"
                  variant="outlined"
                  density="compact"
                  multiple
                  chips
                  closable-chips
                />
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="clearFilters" size="small">Сбросить</v-btn>
              <v-spacer />
              <v-btn @click="applyFilters" color="primary" size="small">Применить</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>

        <v-divider vertical class="mx-2" />

        <!-- Настройки сортировки -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              size="small"
            >
              <v-icon class="me-1">mdi-sort</v-icon>
              Сортировка
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="option in sortOptions"
              :key="option.value"
              @click="setSortOrder(option.value)"
            >
              <template v-slot:prepend>
                <v-icon v-if="currentSort === option.value">mdi-check</v-icon>
              </template>
              <v-list-item-title>{{ option.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- Настройки вида -->
        <v-btn-toggle
          v-model="viewMode"
          mandatory
          variant="outlined"
          density="compact"
          class="ml-2"
        >
          <v-btn value="tree" size="small">
            <v-icon>mdi-file-tree</v-icon>
            <v-tooltip activator="parent" location="bottom">Дерево</v-tooltip>
          </v-btn>
          <v-btn value="table" size="small">
            <v-icon>mdi-table</v-icon>
            <v-tooltip activator="parent" location="bottom">Таблица</v-tooltip>
          </v-btn>
          <v-btn value="cards" size="small">
            <v-icon>mdi-view-grid</v-icon>
            <v-tooltip activator="parent" location="bottom">Карточки</v-tooltip>
          </v-btn>
        </v-btn-toggle>
      </div>
    </v-toolbar>

    <!-- Диалог массового редактирования -->
    <v-dialog v-model="showBulkEditDialog" max-width="600">
      <v-card>
        <v-card-title>Массовое редактирование</v-card-title>
        <v-card-text>
          <v-form>
            <v-select
              v-model="bulkEditData.status"
              :items="statusOptions"
              label="Статус"
              variant="outlined"
              clearable
            />
            <v-autocomplete
              v-model="bulkEditData.owner"
              :items="availableOwners"
              label="Ответственный"
              variant="outlined"
              clearable
            />
            <v-select
              v-model="bulkEditData.category"
              :items="categoryOptions"
              label="Категория"
              variant="outlined"
              clearable
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showBulkEditDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="applyBulkEdit"
            :loading="isApplyingBulkEdit"
          >
            Применить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог массового перемещения -->
    <v-dialog v-model="showBulkMoveDialog" max-width="500">
      <v-card>
        <v-card-title>Переместить в папку</v-card-title>
        <v-card-text>
          <v-treeview
            v-model:selected="targetFolder"
            :items="folderTree"
            item-title="name"
            item-value="id"
            selectable
            selection-type="leaf"
            open-on-click
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showBulkMoveDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            @click="applyBulkMove"
            :loading="isApplyingBulkMove"
            :disabled="!targetFolder.length"
          >
            Переместить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAppStore } from '@/stores/appStore'
import { useBudgetsStore } from '@/stores/budgetsStore'

export default {
  name: 'BudgetToolbar',
  emits: ['view-mode-change', 'sort-change', 'filter-change', 'create-folder', 'create-budget', 'create-plan'],
  props: {
    selectedItems: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    const appStore = useAppStore()
    const budgetsStore = useBudgetsStore()

    const viewMode = ref('tree')
    const currentSort = ref('name_asc')
    const showBulkEditDialog = ref(false)
    const showBulkMoveDialog = ref(false)
    const isApplyingBulkEdit = ref(false)
    const isApplyingBulkMove = ref(false)
    const targetFolder = ref([])

    const filters = ref({
      status: [],
      type: [],
      amountRange: [0, 100000000],
      owners: []
    })

    const bulkEditData = ref({
      status: null,
      owner: null,
      category: null
    })

    // Computed
    const hasActiveFilters = computed(() => {
      return filters.value.status.length > 0 ||
             filters.value.type.length > 0 ||
             filters.value.owners.length > 0 ||
             filters.value.amountRange[0] > 0 ||
             filters.value.amountRange[1] < 100000000
    })

    const activeFiltersCount = computed(() => {
      let count = 0
      if (filters.value.status.length > 0) count++
      if (filters.value.type.length > 0) count++
      if (filters.value.owners.length > 0) count++
      if (filters.value.amountRange[0] > 0 || filters.value.amountRange[1] < 100000000) count++
      return count
    })

    const sortOptions = ref([
      { title: 'По имени (А-Я)', value: 'name_asc' },
      { title: 'По имени (Я-А)', value: 'name_desc' },
      { title: 'По сумме (возр.)', value: 'amount_asc' },
      { title: 'По сумме (убыв.)', value: 'amount_desc' },
      { title: 'По дате создания', value: 'created_desc' },
      { title: 'По дате изменения', value: 'updated_desc' }
    ])

    const statusOptions = ref([
      { title: 'Черновик', value: 'draft' },
      { title: 'Активный', value: 'active' },
      { title: 'Утвержденный', value: 'approved' },
      { title: 'Архивный', value: 'archived' }
    ])

    const categoryOptions = ref([
      { title: 'Маркетинг', value: 'marketing' },
      { title: 'Продажи', value: 'sales' },
      { title: 'Операции', value: 'operations' },
      { title: 'IT', value: 'it' }
    ])

    const availableOwners = ref([
      'Анна Петрова',
      'Дмитрий Иванов',
      'Елена Сидорова',
      'Михаил Козлов'
    ])

    const folderTree = ref([
      {
        id: '1',
        name: 'Корневая папка',
        children: [
          { id: '1.1', name: 'Маркетинг' },
          { id: '1.2', name: 'Продажи' },
          { id: '1.3', name: 'Операции' }
        ]
      }
    ])

    // Methods
    const createFolder = () => {
      emit('create-folder')
    }

    const createBudget = () => {
      emit('create-budget')
    }

    const createPlan = () => {
      emit('create-plan')
    }

    const importBudgets = () => {
      // TODO: Implement import functionality
      appStore.showInfo('Функция импорта будет реализована в следующих версиях')
    }

    const exportBudgets = () => {
      // TODO: Implement export functionality
      appStore.showInfo('Функция экспорта будет реализована в следующих версиях')
    }

    const bulkEdit = () => {
      showBulkEditDialog.value = true
    }

    const bulkMove = () => {
      showBulkMoveDialog.value = true
    }

    const bulkArchive = async () => {
      try {
        await budgetsStore.bulkArchiveBudgets(props.selectedItems.map(item => item.id))
        appStore.showSuccess(`Архивировано ${props.selectedItems.length} элементов`)
      } catch (error) {
        appStore.showError('Ошибка архивирования')
      }
    }

    const bulkDelete = async () => {
      if (confirm(`Удалить ${props.selectedItems.length} выбранных элементов?`)) {
        try {
          await budgetsStore.bulkDeleteBudgets(props.selectedItems.map(item => item.id))
          appStore.showSuccess(`Удалено ${props.selectedItems.length} элементов`)
        } catch (error) {
          appStore.showError('Ошибка удаления')
        }
      }
    }

    const setSortOrder = (sortValue) => {
      currentSort.value = sortValue
      emit('sort-change', sortValue)
    }

    const clearFilters = () => {
      filters.value = {
        status: [],
        type: [],
        amountRange: [0, 100000000],
        owners: []
      }
      emit('filter-change', filters.value)
    }

    const applyFilters = () => {
      emit('filter-change', filters.value)
    }

    const applyBulkEdit = async () => {
      try {
        isApplyingBulkEdit.value = true
        await budgetsStore.bulkUpdateBudgets(
          props.selectedItems.map(item => item.id),
          bulkEditData.value
        )
        appStore.showSuccess(`Обновлено ${props.selectedItems.length} элементов`)
        showBulkEditDialog.value = false
      } catch (error) {
        appStore.showError('Ошибка массового редактирования')
      } finally {
        isApplyingBulkEdit.value = false
      }
    }

    const applyBulkMove = async () => {
      try {
        isApplyingBulkMove.value = true
        await budgetsStore.bulkMoveBudgets(
          props.selectedItems.map(item => item.id),
          targetFolder.value[0]
        )
        appStore.showSuccess(`Перемещено ${props.selectedItems.length} элементов`)
        showBulkMoveDialog.value = false
      } catch (error) {
        appStore.showError('Ошибка перемещения')
      } finally {
        isApplyingBulkMove.value = false
      }
    }

    // Watchers
    watch(viewMode, (newMode) => {
      emit('view-mode-change', newMode)
    })

    return {
      viewMode,
      currentSort,
      showBulkEditDialog,
      showBulkMoveDialog,
      isApplyingBulkEdit,
      isApplyingBulkMove,
      targetFolder,
      filters,
      bulkEditData,
      hasActiveFilters,
      activeFiltersCount,
      sortOptions,
      statusOptions,
      categoryOptions,
      availableOwners,
      folderTree,
      createFolder,
      createBudget,
      createPlan,
      importBudgets,
      exportBudgets,
      bulkEdit,
      bulkMove,
      bulkArchive,
      bulkDelete,
      setSortOrder,
      clearFilters,
      applyFilters,
      applyBulkEdit,
      applyBulkMove
    }
  }
}
</script>

<style scoped>
.budget-toolbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: #fafafa;
}
</style>