<template>
  <div class="budget-allocations">
    <!-- Заголовок с действиями -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Распределения бюджета</h3>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="showAllocationDialog = true"
      >
        Добавить распределение
      </v-btn>
    </div>

    <!-- Сводка распределений -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Общий бюджет</div>
          <div class="text-h6 font-weight-bold text-primary">
            {{ formatCurrency(budget.plannedAmount) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Распределено</div>
          <div class="text-h6 font-weight-bold text-success">
            {{ formatCurrency(totalAllocated) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Не распределено</div>
          <div class="text-h6 font-weight-bold" :class="unallocatedColor">
            {{ formatCurrency(budget.plannedAmount - totalAllocated) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">% Распределено</div>
          <div class="text-h6 font-weight-bold">
            {{ allocationPercentage }}%
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Прогресс распределения -->
    <v-card class="mb-4" elevation="1">
      <v-card-text>
        <div class="text-subtitle-2 mb-2">Прогресс распределения</div>
        <v-progress-linear
          :model-value="allocationPercentage"
          :color="getProgressColor(allocationPercentage)"
          height="12"
          rounded
        />
        <div class="text-caption text-medium-emphasis mt-1">
          {{ allocationPercentage }}% от общего бюджета распределено
        </div>
      </v-card-text>
    </v-card>

    <!-- Таблица распределений -->
    <v-card elevation="1">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-chart-pie</v-icon>
        Список распределений
      </v-card-title>

      <v-data-table
        :headers="allocationHeaders"
        :items="allocations"
        :loading="loading"
        item-key="id"
        class="elevation-0"
      >
        <template v-slot:item.category="{ item }">
          <v-chip
            :color="getCategoryColor(item.category)"
            size="small"
            variant="tonal"
          >
            {{ item.category }}
          </v-chip>
        </template>

        <template v-slot:item.amount="{ item }">
          <span class="font-weight-medium">
            {{ formatCurrency(item.amount) }}
          </span>
        </template>

        <template v-slot:item.percentage="{ item }">
          <div class="d-flex align-center">
            <span class="me-2">{{ getPercentage(item.amount) }}%</span>
            <v-progress-linear
              :model-value="getPercentage(item.amount)"
              color="primary"
              height="4"
              style="width: 60px;"
            />
          </div>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            @click="editAllocation(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            color="error"
            @click="deleteAllocation(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>

        <template v-slot:no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-2">
              mdi-chart-pie-outline
            </v-icon>
            <p class="text-body-1 mt-4 text-medium-emphasis">
              Распределения не созданы
            </p>
            <v-btn
              color="primary"
              @click="showAllocationDialog = true"
            >
              Создать первое распределение
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания/редактирования распределения -->
    <v-dialog
      v-model="showAllocationDialog"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-title>
          {{ editingAllocation ? 'Редактировать' : 'Создать' }} распределение
        </v-card-title>

        <v-card-text>
          <v-form ref="allocationForm" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="allocationForm.name"
                  label="Название распределения"
                  :rules="nameRules"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="allocationForm.category"
                  label="Категория"
                  :items="categoryOptions"
                  :rules="categoryRules"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="allocationForm.amount"
                  label="Сумма"
                  type="number"
                  prefix="₽"
                  :rules="amountRules"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="allocationForm.description"
                  label="Описание"
                  rows="3"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="allocationForm.owner"
                  label="Ответственный"
                  :items="ownerOptions"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-select
                  v-model="allocationForm.status"
                  label="Статус"
                  :items="statusOptions"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeAllocationDialog">
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            @click="saveAllocation"
          >
            {{ editingAllocation ? 'Сохранить' : 'Создать' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog
      v-model="showDeleteDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title>Подтверждение удаления</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить распределение "{{ deletingAllocation?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteDialog = false">
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDelete"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'BudgetPanelAllocations',
  props: {
    budget: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const loading = ref(false)
    const showAllocationDialog = ref(false)
    const showDeleteDialog = ref(false)
    const editingAllocation = ref(null)
    const deletingAllocation = ref(null)
    const formValid = ref(false)

    const allocationForm = ref({
      name: '',
      category: '',
      amount: 0,
      description: '',
      owner: '',
      status: 'active'
    })

    const allocations = ref([
      {
        id: 1,
        name: 'Цифровая реклама',
        category: 'Реклама',
        amount: 500000,
        description: 'Онлайн реклама в социальных сетях',
        owner: 'Иванов И.И.',
        status: 'active',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Контент-маркетинг',
        category: 'Контент',
        amount: 300000,
        description: 'Создание и продвижение контента',
        owner: 'Петрова П.П.',
        status: 'active',
        createdAt: '2024-01-16'
      },
      {
        id: 3,
        name: 'Мероприятия',
        category: 'События',
        amount: 200000,
        description: 'Организация маркетинговых мероприятий',
        owner: 'Сидоров С.С.',
        status: 'pending',
        createdAt: '2024-01-17'
      }
    ])

    const allocationHeaders = [
      { title: 'Название', key: 'name', sortable: true },
      { title: 'Категория', key: 'category', sortable: true },
      { title: 'Сумма', key: 'amount', sortable: true },
      { title: '% от бюджета', key: 'percentage', sortable: false },
      { title: 'Ответственный', key: 'owner', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false, width: '100' }
    ]

    const categoryOptions = [
      'Реклама',
      'Контент',
      'События',
      'PR',
      'Исследования',
      'Инструменты',
      'Персонал',
      'Прочее'
    ]

    const ownerOptions = [
      'Иванов И.И.',
      'Петрова П.П.',
      'Сидоров С.С.',
      'Козлова К.К.',
      'Николаев Н.Н.'
    ]

    const statusOptions = [
      { title: 'Активно', value: 'active' },
      { title: 'В ожидании', value: 'pending' },
      { title: 'Завершено', value: 'completed' },
      { title: 'Отменено', value: 'cancelled' }
    ]

    const nameRules = [
      v => !!v || 'Название обязательно',
      v => v.length >= 3 || 'Минимум 3 символа'
    ]

    const categoryRules = [
      v => !!v || 'Категория обязательна'
    ]

    const amountRules = [
      v => !!v || 'Сумма обязательна',
      v => v > 0 || 'Сумма должна быть больше 0'
    ]

    const totalAllocated = computed(() => {
      return allocations.value.reduce((sum, allocation) => sum + allocation.amount, 0)
    })

    const allocationPercentage = computed(() => {
      if (!props.budget.plannedAmount) return 0
      return Math.round((totalAllocated.value / props.budget.plannedAmount) * 100)
    })

    const unallocatedColor = computed(() => {
      const unallocated = props.budget.plannedAmount - totalAllocated.value
      return unallocated >= 0 ? 'text-success' : 'text-error'
    })

    const formatCurrency = (amount) => {
      if (!amount && amount !== 0) return '0 ₽'
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    const getPercentage = (amount) => {
      if (!props.budget.plannedAmount) return 0
      return Math.round((amount / props.budget.plannedAmount) * 100)
    }

    const getCategoryColor = (category) => {
      const colors = {
        'Реклама': 'blue',
        'Контент': 'green',
        'События': 'purple',
        'PR': 'orange',
        'Исследования': 'teal',
        'Инструменты': 'cyan',
        'Персонал': 'pink',
        'Прочее': 'grey'
      }
      return colors[category] || 'grey'
    }

    const getStatusColor = (status) => {
      const colors = {
        'active': 'success',
        'pending': 'warning',
        'completed': 'info',
        'cancelled': 'error'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        'active': 'Активно',
        'pending': 'В ожидании',
        'completed': 'Завершено',
        'cancelled': 'Отменено'
      }
      return texts[status] || status
    }

    const getProgressColor = (percentage) => {
      if (percentage < 70) return 'success'
      if (percentage < 90) return 'warning'
      return 'error'
    }

    const editAllocation = (allocation) => {
      editingAllocation.value = allocation
      allocationForm.value = { ...allocation }
      showAllocationDialog.value = true
    }

    const deleteAllocation = (allocation) => {
      deletingAllocation.value = allocation
      showDeleteDialog.value = true
    }

    const confirmDelete = () => {
      const index = allocations.value.findIndex(a => a.id === deletingAllocation.value.id)
      if (index > -1) {
        allocations.value.splice(index, 1)
      }
      showDeleteDialog.value = false
      deletingAllocation.value = null
    }

    const saveAllocation = () => {
      if (editingAllocation.value) {
        const index = allocations.value.findIndex(a => a.id === editingAllocation.value.id)
        if (index > -1) {
          allocations.value[index] = { ...allocationForm.value, id: editingAllocation.value.id }
        }
      } else {
        const newAllocation = {
          ...allocationForm.value,
          id: Date.now(),
          createdAt: new Date().toISOString().split('T')[0]
        }
        allocations.value.push(newAllocation)
      }
      closeAllocationDialog()
    }

    const closeAllocationDialog = () => {
      showAllocationDialog.value = false
      editingAllocation.value = null
      allocationForm.value = {
        name: '',
        category: '',
        amount: 0,
        description: '',
        owner: '',
        status: 'active'
      }
    }

    return {
      loading,
      showAllocationDialog,
      showDeleteDialog,
      editingAllocation,
      deletingAllocation,
      formValid,
      allocationForm,
      allocations,
      allocationHeaders,
      categoryOptions,
      ownerOptions,
      statusOptions,
      nameRules,
      categoryRules,
      amountRules,
      totalAllocated,
      allocationPercentage,
      unallocatedColor,
      formatCurrency,
      getPercentage,
      getCategoryColor,
      getStatusColor,
      getStatusText,
      getProgressColor,
      editAllocation,
      deleteAllocation,
      confirmDelete,
      saveAllocation,
      closeAllocationDialog
    }
  }
}
</script>

<style scoped>
.budget-allocations {
  height: 100%;
}

.v-progress-linear {
  border-radius: 8px;
}
</style>