<template>
  <div class="investment-planning">
    <!-- Заголовок и фильтры -->
    <div class="d-flex align-center mb-4">
      <h3 class="text-h6 flex-grow-1">
        Планирование инвестиций
      </h3>

      <!-- Переключатель режима распределения -->
      <v-btn-toggle v-model="allocationMode" mandatory variant="outlined" class="me-2">
        <v-btn value="auto" size="small">
          <v-icon>mdi-auto-mode</v-icon>
          Авто
        </v-btn>
        <v-btn value="manual" size="small">
          <v-icon>mdi-hand-back-right</v-icon>
          Ручное
        </v-btn>
        <v-btn value="hybrid" size="small">
          <v-icon>mdi-shuffle-variant</v-icon>
          Гибрид
        </v-btn>
      </v-btn-toggle>

      <!-- Период -->
      <v-select
        v-model="selectedPeriod"
        :items="periodOptions"
        label="Период"
        variant="outlined"
        density="compact"
        style="width: 150px"
        class="me-2"
      />

      <!-- Действия -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            color="primary"
            v-bind="props"
            :disabled="isLoading"
          >
            <v-icon>mdi-plus</v-icon>
            Создать
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="showCreateInvestmentDialog">
            <v-list-item-title>
              <v-icon class="me-2">mdi-chart-timeline-variant</v-icon>
              Новая инвестиция
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="showOptimizeDialog">
            <v-list-item-title>
              <v-icon class="me-2">mdi-tune-variant</v-icon>
              Оптимизировать
            </v-list-item-title>
          </v-list-item>
          <v-list-item @click="generateForecast">
            <v-list-item-title>
              <v-icon class="me-2">mdi-crystal-ball</v-icon>
              Прогноз
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Прогресс загрузки -->
    <v-progress-linear v-if="isLoading" indeterminate class="mb-4" />

    <!-- Статистические карточки -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="primary" size="40" class="me-3">
                mdi-chart-pie
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Общий бюджет</p>
                <h3 class="text-h6">{{ formatCurrency(totalInvestmentBudget) }}</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="success" size="40" class="me-3">
                mdi-check-circle
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Распределено</p>
                <h3 class="text-h6">{{ formatCurrency(allocatedBudget) }}</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="warning" size="40" class="me-3">
                mdi-clock-outline
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">В ожидании</p>
                <h3 class="text-h6">{{ formatCurrency(pendingBudget) }}</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="info" size="40" class="me-3">
                mdi-trending-up
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Эффективность</p>
                <h3 class="text-h6">{{ allocationEfficiency }}%</h3>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Список инвестиций -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-format-list-bulleted</v-icon>
            Активные инвестиции

            <v-spacer />

            <!-- Поиск -->
            <v-text-field
              v-model="searchQuery"
              placeholder="Поиск инвестиций..."
              variant="outlined"
              density="compact"
              style="width: 300px"
              append-inner-icon="mdi-magnify"
              clearable
              @update:modelValue="onSearch"
            />
          </v-card-title>

          <v-divider />

          <v-data-table
            :headers="tableHeaders"
            :items="filteredInvestments"
            :loading="isLoading"
            item-key="investment_id"
            @click:row="selectInvestment"
            class="investment-table"
          >
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  :color="getTypeColor(item.investment_type)"
                  class="me-2"
                >
                  {{ getTypeIcon(item.investment_type) }}
                </v-icon>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.investment_type }}</div>
                </div>
              </div>
            </template>

            <template v-slot:item.budget="{ item }">
              <div>
                <div class="font-weight-medium">{{ formatCurrency(item.total_budget) }}</div>
                <v-progress-linear
                  :model-value="(item.allocated_amount / item.total_budget) * 100"
                  height="4"
                  :color="getBudgetColor(item)"
                  class="mt-1"
                />
              </div>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                variant="outlined"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template v-slot:item.roi="{ item }">
              <div class="text-center">
                <span class="font-weight-medium">{{ item.expected_roi }}%</span>
                <v-icon
                  :color="item.expected_roi >= 25 ? 'success' : 'warning'"
                  size="small"
                  class="ml-1"
                >
                  {{ item.expected_roi >= 25 ? 'mdi-trending-up' : 'mdi-trending-neutral' }}
                </v-icon>
              </div>
            </template>

            <template v-slot:item.priority="{ item }">
              <v-chip
                :color="getPriorityColor(item.priority)"
                size="small"
                variant="tonal"
              >
                {{ item.priority }}
              </v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    v-bind="props"
                  />
                </template>
                <v-list>
                  <v-list-item @click="editInvestment(item)">
                    <v-list-item-title>
                      <v-icon class="me-2">mdi-pencil</v-icon>
                      Редактировать
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="viewROI(item)">
                    <v-list-item-title>
                      <v-icon class="me-2">mdi-chart-line</v-icon>
                      ROI анализ
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="duplicateInvestment(item)">
                    <v-list-item-title>
                      <v-icon class="me-2">mdi-content-copy</v-icon>
                      Дублировать
                    </v-list-item-title>
                  </v-list-item>
                  <v-divider />
                  <v-list-item @click="deleteInvestment(item)" class="text-error">
                    <v-list-item-title>
                      <v-icon class="me-2">mdi-delete</v-icon>
                      Удалить
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Панель распределения -->
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-title>
            <v-icon class="me-2">mdi-chart-donut</v-icon>
            Распределение по типам
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div v-for="(investments, type) in investmentsByType" :key="type" class="mb-3">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">{{ type }}</span>
                <span class="text-caption">{{ investments.length }} инв.</span>
              </div>
              <v-progress-linear
                :model-value="(investments.reduce((sum, inv) => sum + inv.total_budget, 0) / totalInvestmentBudget) * 100"
                height="8"
                :color="getTypeColor(type)"
                rounded
              />
              <div class="text-caption text-medium-emphasis mt-1">
                {{ formatCurrency(investments.reduce((sum, inv) => sum + inv.total_budget, 0)) }}
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Диалог создания инвестиции -->
    <v-dialog v-model="showCreateInvestment" max-width="800">
      <v-card>
        <v-card-title>Создать новую инвестицию</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createInvestment">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newInvestment.name"
                  label="Название инвестиции"
                  required
                  :rules="[v => !!v || 'Название обязательно']"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newInvestment.investment_type"
                  :items="investmentTypes"
                  label="Тип инвестиции"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newInvestment.description"
                  label="Описание"
                  rows="3"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="newInvestment.total_budget"
                  label="Общий бюджет"
                  type="number"
                  suffix="₽"
                  required
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="newInvestment.expected_roi"
                  label="Ожидаемый ROI"
                  type="number"
                  suffix="%"
                  required
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="newInvestment.priority"
                  :items="['High', 'Medium', 'Low']"
                  label="Приоритет"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newInvestment.start_date"
                  label="Дата начала"
                  type="date"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newInvestment.end_date"
                  label="Дата окончания"
                  type="date"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateInvestment = false">Отмена</v-btn>
          <v-btn color="primary" @click="createInvestment" :loading="isCreating">
            Создать
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог оптимизации -->
    <v-dialog v-model="showOptimization" max-width="600">
      <v-card>
        <v-card-title>Оптимизация распределения</v-card-title>
        <v-card-text>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-tune-variant</v-icon>
            <p class="text-body-1 mt-4">Функция оптимизации будет реализована позже</p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showOptimization = false">Закрыть</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { useInvestmentsStore } from '@/stores/investmentsStore'

export default {
  name: 'InvestmentPlanning',
  setup() {
    const investmentsStore = useInvestmentsStore()

    // Reactive refs
    const searchQuery = ref('')
    const showCreateInvestment = ref(false)
    const showOptimization = ref(false)
    const isCreating = ref(false)

    const newInvestment = ref({
      name: '',
      description: '',
      investment_type: '',
      total_budget: 0,
      expected_roi: 25,
      priority: 'Medium',
      start_date: '',
      end_date: ''
    })

    // Computed properties
    const isLoading = computed(() => investmentsStore.isLoading)
    const filteredInvestments = computed(() => investmentsStore.filteredInvestments)
    const totalInvestmentBudget = computed(() => investmentsStore.totalInvestmentBudget)
    const allocatedBudget = computed(() => investmentsStore.allocatedBudget)
    const pendingBudget = computed(() => investmentsStore.pendingBudget)
    const allocationEfficiency = computed(() => investmentsStore.allocationEfficiency)
    const investmentsByType = computed(() => investmentsStore.investmentsByType)
    const allocationMode = computed({
      get: () => investmentsStore.allocationMode,
      set: (value) => investmentsStore.setAllocationMode(value)
    })
    const selectedPeriod = computed({
      get: () => investmentsStore.selectedPeriod,
      set: (value) => investmentsStore.setPeriod(value)
    })

    const periodOptions = computed(() => [
      { title: 'Текущий период', value: 'current' },
      { title: 'Следующий период', value: 'next' },
      { title: 'Все периоды', value: 'all' }
    ])

    const investmentTypes = computed(() => [
      'Marketing',
      'Digital Advertising',
      'Social Media',
      'Traditional Media',
      'Innovation',
      'Content Creation',
      'Brand Development',
      'Event Marketing'
    ])

    const tableHeaders = computed(() => [
      { title: 'Название', key: 'name', sortable: true },
      { title: 'Бюджет', key: 'budget', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'ROI', key: 'roi', sortable: true },
      { title: 'Приоритет', key: 'priority', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false }
    ])

    // Methods
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0)
    }

    const getTypeIcon = (type) => {
      const icons = {
        'Marketing': 'mdi-bullhorn',
        'Digital Advertising': 'mdi-web',
        'Social Media': 'mdi-share-variant',
        'Traditional Media': 'mdi-television',
        'Innovation': 'mdi-lightbulb',
        'Content Creation': 'mdi-file-document-edit',
        'Brand Development': 'mdi-star-box',
        'Event Marketing': 'mdi-calendar-star'
      }
      return icons[type] || 'mdi-chart-timeline-variant'
    }

    const getTypeColor = (type) => {
      const colors = {
        'Marketing': 'primary',
        'Digital Advertising': 'blue',
        'Social Media': 'purple',
        'Traditional Media': 'orange',
        'Innovation': 'green',
        'Content Creation': 'indigo',
        'Brand Development': 'pink',
        'Event Marketing': 'cyan'
      }
      return colors[type] || 'grey'
    }

    const getStatusColor = (status) => {
      const colors = {
        'Active': 'success',
        'Planning': 'warning',
        'Reserved': 'info',
        'Completed': 'primary',
        'Draft': 'grey'
      }
      return colors[status] || 'grey'
    }

    const getPriorityColor = (priority) => {
      const colors = {
        'High': 'error',
        'Medium': 'warning',
        'Low': 'success'
      }
      return colors[priority] || 'grey'
    }

    const getBudgetColor = (investment) => {
      const percentage = (investment.allocated_amount / investment.total_budget) * 100
      if (percentage >= 90) return 'error'
      if (percentage >= 70) return 'warning'
      return 'success'
    }

    const onSearch = (query) => {
      if (query?.trim()) {
        investmentsStore.searchInvestments(query)
      } else {
        investmentsStore.fetchInvestments()
      }
    }

    const selectInvestment = (event, { item }) => {
      investmentsStore.selectInvestment(item.investment_id)
    }

    const showCreateInvestmentDialog = () => {
      newInvestment.value = {
        name: '',
        description: '',
        investment_type: '',
        total_budget: 0,
        expected_roi: 25,
        priority: 'Medium',
        start_date: '',
        end_date: ''
      }
      showCreateInvestment.value = true
    }

    const createInvestment = async () => {
      if (!newInvestment.value.name || !newInvestment.value.investment_type) return

      try {
        isCreating.value = true
        await investmentsStore.createInvestment(newInvestment.value)
        showCreateInvestment.value = false
      } catch (error) {
        console.error('Error creating investment:', error)
      } finally {
        isCreating.value = false
      }
    }

    const editInvestment = (investment) => {
      console.log('Edit investment:', investment)
      // TODO: Реализовать редактирование
    }

    const viewROI = async (investment) => {
      try {
        const roiData = await investmentsStore.calculateROI(investment.investment_id)
        console.log('ROI data:', roiData)
        // TODO: Показать ROI анализ
      } catch (error) {
        console.error('Error calculating ROI:', error)
      }
    }

    const duplicateInvestment = (investment) => {
      newInvestment.value = {
        ...investment,
        name: investment.name + ' (копия)',
        investment_id: undefined
      }
      showCreateInvestment.value = true
    }

    const deleteInvestment = async (investment) => {
      if (confirm(`Вы уверены, что хотите удалить "${investment.name}"?`)) {
        try {
          await investmentsStore.deleteInvestment(investment.investment_id)
        } catch (error) {
          console.error('Error deleting investment:', error)
        }
      }
    }

    const showOptimizeDialog = () => {
      showOptimization.value = true
    }

    const generateForecast = async () => {
      try {
        const forecast = await investmentsStore.generateForecast()
        console.log('Forecast generated:', forecast)
        // TODO: Показать прогноз
      } catch (error) {
        console.error('Error generating forecast:', error)
      }
    }

    // Lifecycle
    onMounted(() => {
      investmentsStore.fetchInvestments()
    })

    return {
      // Store state
      isLoading,
      filteredInvestments,
      totalInvestmentBudget,
      allocatedBudget,
      pendingBudget,
      allocationEfficiency,
      investmentsByType,
      allocationMode,
      selectedPeriod,

      // Local state
      searchQuery,
      showCreateInvestment,
      showOptimization,
      isCreating,
      newInvestment,

      // Computed
      periodOptions,
      investmentTypes,
      tableHeaders,

      // Methods
      formatCurrency,
      getTypeIcon,
      getTypeColor,
      getStatusColor,
      getPriorityColor,
      getBudgetColor,
      onSearch,
      selectInvestment,
      showCreateInvestmentDialog,
      createInvestment,
      editInvestment,
      viewROI,
      duplicateInvestment,
      deleteInvestment,
      showOptimizeDialog,
      generateForecast
    }
  }
}
</script>

<style scoped>
.investment-planning {
  height: 100%;
}

:deep(.investment-table .v-data-table__tr) {
  cursor: pointer;
}

:deep(.investment-table .v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}
</style>