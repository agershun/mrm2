<template>
  <div class="investment-allocation">
    <!-- Заголовок -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h3 class="text-h6">Распределение инвестиций</h3>
      <v-btn-group variant="outlined" density="compact">
        <v-btn
          :variant="viewMode === 'chart' ? 'flat' : 'outlined'"
          @click="viewMode = 'chart'"
        >
          <v-icon>mdi-chart-pie</v-icon>
          График
        </v-btn>
        <v-btn
          :variant="viewMode === 'table' ? 'flat' : 'outlined'"
          @click="viewMode = 'table'"
        >
          <v-icon>mdi-table</v-icon>
          Таблица
        </v-btn>
        <v-btn
          :variant="viewMode === 'tree' ? 'flat' : 'outlined'"
          @click="viewMode = 'tree'"
        >
          <v-icon>mdi-file-tree</v-icon>
          Иерархия
        </v-btn>
      </v-btn-group>
    </div>

    <!-- Сводная статистика -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Общий бюджет</div>
          <div class="text-h6 font-weight-bold text-primary">
            {{ formatCurrency(totalBudget) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Распределено</div>
          <div class="text-h6 font-weight-bold text-success">
            {{ formatCurrency(allocatedAmount) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Свободно</div>
          <div class="text-h6 font-weight-bold" :class="remainingColor">
            {{ formatCurrency(remainingAmount) }}
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-3" elevation="1">
          <div class="text-caption text-medium-emphasis">Использовано</div>
          <div class="text-h6 font-weight-bold">
            {{ allocationPercentage }}%
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Прогресс-бар -->
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

    <!-- Представление графика -->
    <template v-if="viewMode === 'chart'">
      <v-row>
        <v-col cols="12" md="6">
          <v-card elevation="1">
            <v-card-title>Распределение по категориям</v-card-title>
            <v-card-text>
              <div class="chart-container">
                <div class="chart-placeholder">
                  <v-icon size="64" color="grey-lighten-2">mdi-chart-pie</v-icon>
                  <p class="text-body-2 mt-2">График будет реализован с ECharts</p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card elevation="1">
            <v-card-title>Распределение по активностям</v-card-title>
            <v-card-text>
              <div class="chart-container">
                <div class="chart-placeholder">
                  <v-icon size="64" color="grey-lighten-2">mdi-chart-donut</v-icon>
                  <p class="text-body-2 mt-2">График будет реализован с ECharts</p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Представление таблицы -->
    <template v-if="viewMode === 'table'">
      <v-card elevation="1">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="me-2">mdi-table</v-icon>
            Детальное распределение
          </div>
          <v-btn
            color="primary"
            size="small"
            @click="showAllocationDialog = true"
          >
            <v-icon>mdi-plus</v-icon>
            Добавить
          </v-btn>
        </v-card-title>

        <v-data-table
          :headers="allocationHeaders"
          :items="allocations"
          item-key="id"
          show-select
          v-model="selectedAllocations"
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
              <v-icon size="64" color="grey-lighten-2">mdi-chart-pie-outline</v-icon>
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
    </template>

    <!-- Представление иерархии -->
    <template v-if="viewMode === 'tree'">
      <v-card elevation="1">
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">mdi-file-tree</v-icon>
          Иерархическое представление
        </v-card-title>

        <v-card-text>
          <v-treeview
            :items="hierarchicalAllocations"
            item-key="id"
            item-title="name"
            item-children="children"
            open-strategy="multiple"
            return-object
          >
            <template v-slot:prepend="{ item }">
              <v-icon :color="item.color || 'grey'">
                {{ item.icon || 'mdi-folder' }}
              </v-icon>
            </template>

            <template v-slot:append="{ item }">
              <div class="d-flex align-center">
                <v-chip
                  v-if="item.amount"
                  size="small"
                  variant="outlined"
                  class="me-2"
                >
                  {{ formatCurrency(item.amount) }}
                </v-chip>
                <v-chip
                  v-if="item.percentage"
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  {{ item.percentage }}%
                </v-chip>
              </div>
            </template>
          </v-treeview>
        </v-card-text>
      </v-card>
    </template>

    <!-- Диалог создания/редактирования распределения -->
    <v-dialog v-model="showAllocationDialog" max-width="600" persistent>
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
                <v-select
                  v-model="allocationForm.activities"
                  label="Связанные активности"
                  :items="activityOptions"
                  multiple
                  chips
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
          <v-btn @click="closeAllocationDialog">Отмена</v-btn>
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
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'InvestmentAllocation',
  setup() {
    const viewMode = ref('table')
    const showAllocationDialog = ref(false)
    const editingAllocation = ref(null)
    const selectedAllocations = ref([])
    const formValid = ref(false)

    const allocationForm = ref({
      name: '',
      category: '',
      amount: 0,
      activities: [],
      description: '',
      owner: '',
      status: 'active'
    })

    const allocations = ref([
      {
        id: 1,
        name: 'Цифровая реклама',
        category: 'Marketing',
        amount: 2500000,
        activities: ['Поисковая реклама', 'Социальные сети'],
        description: 'Инвестиции в цифровые рекламные каналы',
        owner: 'Иванов И.И.',
        status: 'active'
      },
      {
        id: 2,
        name: 'Разработка продукта',
        category: 'Product',
        amount: 3000000,
        activities: ['MVP разработка', 'UX исследования'],
        description: 'Инвестиции в развитие продукта',
        owner: 'Петрова П.П.',
        status: 'active'
      },
      {
        id: 3,
        name: 'Мероприятия',
        category: 'Events',
        amount: 800000,
        activities: ['Конференции', 'Вебинары'],
        description: 'Организация маркетинговых мероприятий',
        owner: 'Сидоров С.С.',
        status: 'planned'
      }
    ])

    const allocationHeaders = [
      { title: 'Название', key: 'name', sortable: true },
      { title: 'Категория', key: 'category', sortable: true },
      { title: 'Сумма', key: 'amount', sortable: true },
      { title: '% от общего', key: 'percentage', sortable: false },
      { title: 'Ответственный', key: 'owner', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false, width: '100' }
    ]

    const categoryOptions = [
      { title: 'Маркетинг', value: 'Marketing' },
      { title: 'Продукт', value: 'Product' },
      { title: 'События', value: 'Events' },
      { title: 'Исследования', value: 'Research' },
      { title: 'Операции', value: 'Operations' }
    ]

    const activityOptions = [
      'Поисковая реклама',
      'Социальные сети',
      'MVP разработка',
      'UX исследования',
      'Конференции',
      'Вебинары',
      'Контент-маркетинг',
      'Email кампании'
    ]

    const ownerOptions = [
      'Иванов И.И.',
      'Петрова П.П.',
      'Сидоров С.С.',
      'Козлова К.К.'
    ]

    const statusOptions = [
      { title: 'Активно', value: 'active' },
      { title: 'Запланировано', value: 'planned' },
      { title: 'На паузе', value: 'paused' },
      { title: 'Завершено', value: 'completed' }
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

    const totalBudget = 10000000
    const allocatedAmount = computed(() => {
      return allocations.value.reduce((sum, allocation) => sum + allocation.amount, 0)
    })

    const remainingAmount = computed(() => {
      return totalBudget - allocatedAmount.value
    })

    const remainingColor = computed(() => {
      return remainingAmount.value >= 0 ? 'text-success' : 'text-error'
    })

    const allocationPercentage = computed(() => {
      return Math.round((allocatedAmount.value / totalBudget) * 100)
    })

    const hierarchicalAllocations = computed(() => [
      {
        id: 'marketing',
        name: 'Маркетинг',
        icon: 'mdi-bullhorn',
        color: 'blue',
        amount: 3300000,
        percentage: 33,
        children: [
          {
            id: 'digital',
            name: 'Цифровая реклама',
            icon: 'mdi-laptop',
            amount: 2500000,
            percentage: 25
          },
          {
            id: 'events',
            name: 'Мероприятия',
            icon: 'mdi-calendar',
            amount: 800000,
            percentage: 8
          }
        ]
      },
      {
        id: 'product',
        name: 'Продукт',
        icon: 'mdi-cube',
        color: 'green',
        amount: 3000000,
        percentage: 30,
        children: [
          {
            id: 'development',
            name: 'Разработка',
            icon: 'mdi-code-tags',
            amount: 2000000,
            percentage: 20
          },
          {
            id: 'research',
            name: 'Исследования',
            icon: 'mdi-magnify',
            amount: 1000000,
            percentage: 10
          }
        ]
      }
    ])

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
      return Math.round((amount / totalBudget) * 100)
    }

    const getCategoryColor = (category) => {
      const colors = {
        'Marketing': 'blue',
        'Product': 'green',
        'Events': 'purple',
        'Research': 'orange',
        'Operations': 'teal'
      }
      return colors[category] || 'grey'
    }

    const getStatusColor = (status) => {
      const colors = {
        'active': 'success',
        'planned': 'warning',
        'paused': 'info',
        'completed': 'grey'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        'active': 'Активно',
        'planned': 'Запланировано',
        'paused': 'На паузе',
        'completed': 'Завершено'
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
      const index = allocations.value.findIndex(a => a.id === allocation.id)
      if (index > -1) {
        allocations.value.splice(index, 1)
      }
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
          id: Date.now()
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
        activities: [],
        description: '',
        owner: '',
        status: 'active'
      }
    }

    return {
      viewMode,
      showAllocationDialog,
      editingAllocation,
      selectedAllocations,
      formValid,
      allocationForm,
      allocations,
      allocationHeaders,
      categoryOptions,
      activityOptions,
      ownerOptions,
      statusOptions,
      nameRules,
      categoryRules,
      amountRules,
      totalBudget,
      allocatedAmount,
      remainingAmount,
      remainingColor,
      allocationPercentage,
      hierarchicalAllocations,
      formatCurrency,
      getPercentage,
      getCategoryColor,
      getStatusColor,
      getStatusText,
      getProgressColor,
      editAllocation,
      deleteAllocation,
      saveAllocation,
      closeAllocationDialog
    }
  }
}
</script>

<style scoped>
.investment-allocation {
  height: 100%;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #666;
}

.v-progress-linear {
  border-radius: 8px;
}
</style>