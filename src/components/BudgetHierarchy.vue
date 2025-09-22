<template>
  <div class="budget-hierarchy">
    <!-- Заголовок и действия -->
    <div class="d-flex align-center mb-4">
      <h3 class="text-h6 flex-grow-1">
        Иерархия бюджетов
      </h3>
      <v-btn-group variant="outlined" size="small" class="me-2">
        <v-btn
          @click="expandAll"
          :disabled="isLoading"
        >
          <v-icon>mdi-unfold-more-horizontal</v-icon>
          Развернуть все
        </v-btn>
        <v-btn
          @click="collapseAll"
          :disabled="isLoading"
        >
          <v-icon>mdi-unfold-less-horizontal</v-icon>
          Свернуть все
        </v-btn>
      </v-btn-group>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            v-bind="props"
            :disabled="isLoading"
            class="me-2"
          >
            <v-icon>mdi-plus</v-icon>
            Создать
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="showCreateFolderDialog">
            <v-list-item-title>
              <v-icon class="me-2">mdi-folder-plus</v-icon>
              Папка бюджета
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="showCreatePlanDialog">
            <v-list-item-title>
              <v-icon class="me-2">mdi-chart-timeline-variant</v-icon>
              План инвестиций
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Дерево бюджетов -->
    <v-progress-linear v-if="isLoading" indeterminate class="mb-4" />

    <div v-if="!isLoading && budgetHierarchy.length === 0" class="text-center py-8">
      <v-icon size="64" color="grey-lighten-1">mdi-folder-outline</v-icon>
      <p class="text-body-1 mt-4">Нет бюджетов для отображения</p>
      <v-btn color="primary" @click="createFirstBudget">
        Создать первый бюджет
      </v-btn>
    </div>

    <v-treeview
      v-else
      :items="budgetHierarchy"
      :opened="expandedNodes"
      :selected="[selectedBudget]"
      item-key="budget_id"
      item-title="name"
      item-children="children"
      density="compact"
      open-on-click
      @update:selected="onBudgetSelect"
      @update:opened="onNodeToggle"
    >
      <template v-slot:prepend="{ item, open }">
        <v-icon
          :icon="getBudgetIcon(item)"
          :color="getBudgetColor(item)"
          class="me-2"
        />
      </template>

      <template v-slot:append="{ item }">
        <div class="d-flex align-center">
          <!-- Статус бюджета -->
          <v-chip
            :color="getStatusColor(item.status)"
            size="x-small"
            variant="outlined"
            class="me-2"
          >
            {{ item.status }}
          </v-chip>

          <!-- Сумма бюджета -->
          <span class="text-caption me-2">
            {{ formatCurrency(item.total_amount) }}
          </span>

          <!-- Меню действий -->
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                size="x-small"
                variant="text"
                v-bind="props"
                @click.stop
              />
            </template>
            <v-list>
              <v-list-item @click="editBudget(item)">
                <v-list-item-title>
                  <v-icon class="me-2">mdi-pencil</v-icon>
                  Редактировать
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="duplicateBudget(item)">
                <v-list-item-title>
                  <v-icon class="me-2">mdi-content-copy</v-icon>
                  Дублировать
                </v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item @click="deleteBudget(item)" class="text-error">
                <v-list-item-title>
                  <v-icon class="me-2">mdi-delete</v-icon>
                  Удалить
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
    </v-treeview>

    <!-- Диалог создания папки -->
    <v-dialog v-model="showCreateFolder" max-width="500">
      <v-card>
        <v-card-title>Создать папку бюджета</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createFolder">
            <v-text-field
              v-model="newFolder.name"
              label="Название папки"
              required
              :rules="[v => !!v || 'Название обязательно']"
            />
            <v-select
              v-model="newFolder.parent_budget_id"
              :items="parentBudgetOptions"
              item-title="name"
              item-value="budget_id"
              label="Родительский бюджет"
              clearable
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateFolder = false">Отмена</v-btn>
          <v-btn color="primary" @click="createFolder" :loading="isCreating">
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог создания плана инвестиций -->
    <v-dialog v-model="showCreatePlan" max-width="500">
      <v-card>
        <v-card-title>Создать план инвестиций</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createPlan">
            <v-text-field
              v-model="newPlan.name"
              label="Название плана"
              required
              :rules="[v => !!v || 'Название обязательно']"
            />
            <v-select
              v-model="newPlan.parent_budget_id"
              :items="parentBudgetOptions"
              item-title="name"
              item-value="budget_id"
              label="Родительский бюджет"
              clearable
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreatePlan = false">Отмена</v-btn>
          <v-btn color="primary" @click="createPlan" :loading="isCreating">
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useBudgetsStore } from '@/stores/budgetsStore'

export default {
  name: 'BudgetHierarchy',
  setup() {
    const budgetsStore = useBudgetsStore()

    // Reactive refs
    const showCreateFolder = ref(false)
    const showCreatePlan = ref(false)
    const isCreating = ref(false)

    const newFolder = ref({
      name: '',
      parent_budget_id: null
    })

    const newPlan = ref({
      name: '',
      parent_budget_id: null
    })

    // Computed properties
    const budgetHierarchy = computed(() => budgetsStore.budgetHierarchy)
    const isLoading = computed(() => budgetsStore.isLoading)
    const selectedBudget = computed(() => budgetsStore.selectedBudget)
    const expandedNodes = computed(() => budgetsStore.expandedNodes)

    const parentBudgetOptions = computed(() => {
      return budgetsStore.budgets.filter(budget =>
        budget.budget_type === 'Investment Plan' || budget.budget_type === 'Folder'
      )
    })

    // Methods
    const getBudgetIcon = (budget) => {
      switch (budget.budget_type) {
        case 'Folder':
          return 'mdi-folder'
        case 'Investment Plan':
          return 'mdi-chart-timeline-variant'
        default:
          return 'mdi-wallet'
      }
    }

    const getBudgetColor = (budget) => {
      switch (budget.status) {
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

    const onBudgetSelect = (selected) => {
      if (selected.length > 0) {
        budgetsStore.selectBudget(selected[0])
      }
    }

    const onNodeToggle = (opened) => {
      // Обновляем expandedNodes в store
      Object.keys(opened).forEach(nodeId => {
        if (opened[nodeId] !== expandedNodes.value[nodeId]) {
          budgetsStore.toggleNode(nodeId)
        }
      })
    }

    const expandAll = () => {
      budgetsStore.expandAllNodes()
    }

    const collapseAll = () => {
      budgetsStore.collapseAllNodes()
    }

    const showCreateFolderDialog = () => {
      newFolder.value = { name: '', parent_budget_id: null }
      showCreateFolder.value = true
    }

    const showCreatePlanDialog = () => {
      newPlan.value = { name: '', parent_budget_id: null }
      showCreatePlan.value = true
    }

    const createFolder = async () => {
      if (!newFolder.value.name) return

      try {
        isCreating.value = true
        await budgetsStore.createBudgetFolder(newFolder.value)
        showCreateFolder.value = false
        newFolder.value = { name: '', parent_budget_id: null }
      } catch (error) {
        console.error('Error creating folder:', error)
      } finally {
        isCreating.value = false
      }
    }

    const createPlan = async () => {
      if (!newPlan.value.name) return

      try {
        isCreating.value = true
        await budgetsStore.createInvestmentPlan(newPlan.value)
        showCreatePlan.value = false
        newPlan.value = { name: '', parent_budget_id: null }
      } catch (error) {
        console.error('Error creating plan:', error)
      } finally {
        isCreating.value = false
      }
    }

    const createFirstBudget = () => {
      showCreatePlanDialog()
    }

    const editBudget = (budget) => {
      console.log('Edit budget:', budget)
      // TODO: Реализовать редактирование
    }

    const duplicateBudget = (budget) => {
      console.log('Duplicate budget:', budget)
      // TODO: Реализовать дублирование
    }

    const deleteBudget = async (budget) => {
      if (confirm(`Вы уверены, что хотите удалить "${budget.name}"?`)) {
        try {
          await budgetsStore.deleteBudget(budget.budget_id)
        } catch (error) {
          console.error('Error deleting budget:', error)
        }
      }
    }

    // Lifecycle
    onMounted(() => {
      budgetsStore.fetchBudgets()
    })

    return {
      // Store data
      budgetHierarchy,
      isLoading,
      selectedBudget,
      expandedNodes,
      parentBudgetOptions,

      // Local state
      showCreateFolder,
      showCreatePlan,
      isCreating,
      newFolder,
      newPlan,

      // Methods
      getBudgetIcon,
      getBudgetColor,
      getStatusColor,
      formatCurrency,
      onBudgetSelect,
      onNodeToggle,
      expandAll,
      collapseAll,
      showCreateFolderDialog,
      showCreatePlanDialog,
      createFolder,
      createPlan,
      createFirstBudget,
      editBudget,
      duplicateBudget,
      deleteBudget
    }
  }
}
</script>

<style scoped>
.budget-hierarchy {
  height: 100%;
}

:deep(.v-treeview-item) {
  border-radius: 4px;
}

:deep(.v-treeview-item--selected) {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

:deep(.v-treeview-item:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}
</style>