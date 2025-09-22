<template>
  <div class="budget-rollup">
    <!-- Фильтры и настройки -->
    <v-card class="mb-6">
      <v-card-title>
        <v-icon class="me-2">mdi-tune</v-icon>
        Настройки сводки
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="rollupBy"
              :items="rollupOptions"
              label="Группировка"
              variant="outlined"
              density="compact"
              @update:modelValue="updateRollup"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="timeframe"
              :items="timeframeOptions"
              label="Период"
              variant="outlined"
              density="compact"
              @update:modelValue="updateRollup"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="selectedCategories"
              :items="budgetCategories"
              label="Категории"
              variant="outlined"
              density="compact"
              multiple
              chips
              closable-chips
              @update:modelValue="updateRollup"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="currency"
              :items="currencyOptions"
              label="Валюта"
              variant="outlined"
              density="compact"
              @update:modelValue="updateRollup"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Сводные карточки -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="primary" size="40" class="me-4">
                mdi-wallet
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Общий бюджет</p>
                <h3 class="text-h6">{{ formatCurrency(rollupData.totalBudget) }}</h3>
                <div class="d-flex align-center mt-1">
                  <v-icon
                    :color="rollupData.budgetTrend >= 0 ? 'success' : 'error'"
                    size="16"
                  >
                    {{ rollupData.budgetTrend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                  </v-icon>
                  <span
                    class="text-caption ml-1"
                    :class="rollupData.budgetTrend >= 0 ? 'text-success' : 'text-error'"
                  >
                    {{ Math.abs(rollupData.budgetTrend) }}% vs предыдущий период
                  </span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="success" size="40" class="me-4">
                mdi-check-circle
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Распределено</p>
                <h3 class="text-h6">{{ formatCurrency(rollupData.allocated) }}</h3>
                <v-progress-linear
                  :model-value="rollupData.allocationPercentage"
                  color="success"
                  height="4"
                  class="mt-2"
                />
                <span class="text-caption text-medium-emphasis">
                  {{ rollupData.allocationPercentage }}% от общего бюджета
                </span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="info" size="40" class="me-4">
                mdi-chart-line
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Потрачено</p>
                <h3 class="text-h6">{{ formatCurrency(rollupData.spent) }}</h3>
                <v-progress-linear
                  :model-value="rollupData.spentPercentage"
                  :color="getSpentColor(rollupData.spentPercentage)"
                  height="4"
                  class="mt-2"
                />
                <span class="text-caption text-medium-emphasis">
                  {{ rollupData.spentPercentage }}% от выделенного
                </span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="warning" size="40" class="me-4">
                mdi-clock-outline
              </v-icon>
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Остаток</p>
                <h3 class="text-h6">{{ formatCurrency(rollupData.remaining) }}</h3>
                <div class="d-flex align-center mt-1">
                  <v-chip
                    :color="rollupData.remainingDays > 30 ? 'success' : rollupData.remainingDays > 7 ? 'warning' : 'error'"
                    size="small"
                    variant="tonal"
                  >
                    {{ rollupData.remainingDays }} дней
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Графики -->
    <v-row class="mb-6">
      <v-col cols="12" lg="8">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-chart-bar</v-icon>
            {{ rollupChartTitle }}
          </v-card-title>
          <v-card-text>
            <div class="chart-container" style="height: 400px;">
              <!-- Здесь будет график с ECharts -->
              <div class="d-flex align-center justify-center h-100">
                <div class="text-center">
                  <v-icon size="64" color="grey-lighten-2">mdi-chart-bar</v-icon>
                  <p class="text-body-2 mt-4">График будет отображен здесь</p>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-chart-pie</v-icon>
            Распределение по категориям
          </v-card-title>
          <v-card-text>
            <div class="chart-container" style="height: 400px;">
              <!-- Круговая диаграмма -->
              <div class="category-breakdown">
                <div
                  v-for="category in categoryBreakdown"
                  :key="category.name"
                  class="category-item mb-3"
                >
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-body-2">{{ category.name }}</span>
                    <span class="text-body-2 font-weight-medium">
                      {{ formatCurrency(category.amount) }}
                    </span>
                  </div>
                  <v-progress-linear
                    :model-value="category.percentage"
                    :color="category.color"
                    height="8"
                    rounded
                  />
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ category.percentage }}% от общего бюджета
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Детальная таблица -->
    <v-card>
      <v-card-title>
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon class="me-2">mdi-table</v-icon>
            Детальная разбивка
          </div>
          <div class="d-flex align-center">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              label="Поиск"
              variant="outlined"
              density="compact"
              style="width: 300px"
              clearable
            />
            <v-btn
              variant="outlined"
              size="small"
              class="ml-2"
              @click="exportToExcel"
            >
              <v-icon class="me-1">mdi-download</v-icon>
              Экспорт
            </v-btn>
          </div>
        </div>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-data-table
          :headers="tableHeaders"
          :items="filteredTableData"
          :search="searchQuery"
          :loading="isLoading"
          class="elevation-0"
          item-value="id"
          show-expand
        >
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center">
              <v-icon
                :color="getItemTypeColor(item.type)"
                size="20"
                class="me-2"
              >
                {{ getItemTypeIcon(item.type) }}
              </v-icon>
              <span>{{ item.name }}</span>
            </div>
          </template>

          <template v-slot:item.budget="{ item }">
            <div class="text-right">
              {{ formatCurrency(item.budget) }}
            </div>
          </template>

          <template v-slot:item.allocated="{ item }">
            <div class="text-right">
              {{ formatCurrency(item.allocated) }}
              <v-progress-linear
                :model-value="(item.allocated / item.budget) * 100"
                color="success"
                height="3"
                class="mt-1"
              />
            </div>
          </template>

          <template v-slot:item.spent="{ item }">
            <div class="text-right">
              {{ formatCurrency(item.spent) }}
              <v-progress-linear
                :model-value="(item.spent / item.allocated) * 100"
                :color="getSpentColor((item.spent / item.allocated) * 100)"
                height="3"
                class="mt-1"
              />
            </div>
          </template>

          <template v-slot:item.remaining="{ item }">
            <div class="text-right">
              <span :class="item.remaining < 0 ? 'text-error' : 'text-success'">
                {{ formatCurrency(item.remaining) }}
              </span>
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              {{ getStatusLabel(item.status) }}
            </v-chip>
          </template>

          <template v-slot:expanded-row="{ item }">
            <tr>
              <td :colspan="tableHeaders.length" class="pa-4">
                <div class="expanded-content">
                  <h4 class="text-subtitle-1 mb-3">Подкатегории</h4>
                  <v-simple-table v-if="item.children?.length">
                    <thead>
                      <tr>
                        <th>Название</th>
                        <th class="text-right">Бюджет</th>
                        <th class="text-right">Выделено</th>
                        <th class="text-right">Потрачено</th>
                        <th class="text-right">Остаток</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="child in item.children" :key="child.id">
                        <td>{{ child.name }}</td>
                        <td class="text-right">{{ formatCurrency(child.budget) }}</td>
                        <td class="text-right">{{ formatCurrency(child.allocated) }}</td>
                        <td class="text-right">{{ formatCurrency(child.spent) }}</td>
                        <td class="text-right">
                          <span :class="child.remaining < 0 ? 'text-error' : 'text-success'">
                            {{ formatCurrency(child.remaining) }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                  <p v-else class="text-medium-emphasis">Подкатегории отсутствуют</p>
                </div>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useBudgetsStore } from '@/stores/budgetsStore'
import { useAppStore } from '@/stores/appStore'

export default {
  name: 'BudgetRollup',
  setup() {
    const budgetsStore = useBudgetsStore()
    const appStore = useAppStore()

    const rollupBy = ref('category')
    const timeframe = ref('current_year')
    const selectedCategories = ref([])
    const currency = ref('RUB')
    const searchQuery = ref('')
    const isLoading = ref(false)

    const rollupOptions = ref([
      { title: 'По категориям', value: 'category' },
      { title: 'По отделам', value: 'department' },
      { title: 'По ответственным', value: 'owner' },
      { title: 'По статусу', value: 'status' },
      { title: 'По месяцам', value: 'month' },
      { title: 'По кварталам', value: 'quarter' }
    ])

    const timeframeOptions = ref([
      { title: 'Текущий год', value: 'current_year' },
      { title: 'Предыдущий год', value: 'previous_year' },
      { title: 'Текущий квартал', value: 'current_quarter' },
      { title: 'Предыдущий квартал', value: 'previous_quarter' },
      { title: 'Последние 12 месяцев', value: 'last_12_months' },
      { title: 'Пользовательский период', value: 'custom' }
    ])

    const budgetCategories = ref([
      'Маркетинг',
      'Продажи',
      'Операции',
      'IT',
      'HR',
      'Финансы'
    ])

    const currencyOptions = ref([
      { title: 'Российский рубль (₽)', value: 'RUB' },
      { title: 'Доллар США ($)', value: 'USD' },
      { title: 'Евро (€)', value: 'EUR' }
    ])

    const tableHeaders = ref([
      { title: 'Название', key: 'name', sortable: true },
      { title: 'Бюджет', key: 'budget', sortable: true, align: 'end' },
      { title: 'Выделено', key: 'allocated', sortable: true, align: 'end' },
      { title: 'Потрачено', key: 'spent', sortable: true, align: 'end' },
      { title: 'Остаток', key: 'remaining', sortable: true, align: 'end' },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Ответственный', key: 'owner', sortable: true }
    ])

    // Mock data
    const rollupData = ref({
      totalBudget: 125000000,
      allocated: 95000000,
      spent: 72000000,
      remaining: 23000000,
      budgetTrend: 12.5,
      allocationPercentage: 76,
      spentPercentage: 76,
      remainingDays: 45
    })

    const categoryBreakdown = ref([
      {
        name: 'Маркетинг',
        amount: 45000000,
        percentage: 36,
        color: 'primary'
      },
      {
        name: 'Продажи',
        amount: 35000000,
        percentage: 28,
        color: 'success'
      },
      {
        name: 'Операции',
        amount: 25000000,
        percentage: 20,
        color: 'warning'
      },
      {
        name: 'IT',
        amount: 15000000,
        percentage: 12,
        color: 'info'
      },
      {
        name: 'HR',
        amount: 5000000,
        percentage: 4,
        color: 'secondary'
      }
    ])

    const tableData = ref([
      {
        id: '1',
        name: 'Маркетинг',
        type: 'category',
        budget: 45000000,
        allocated: 40000000,
        spent: 32000000,
        remaining: 8000000,
        status: 'active',
        owner: 'Анна Петрова',
        children: [
          {
            id: '1.1',
            name: 'Цифровая реклама',
            budget: 25000000,
            allocated: 22000000,
            spent: 18000000,
            remaining: 4000000
          },
          {
            id: '1.2',
            name: 'Контент-маркетинг',
            budget: 15000000,
            allocated: 13000000,
            spent: 10000000,
            remaining: 3000000
          }
        ]
      },
      {
        id: '2',
        name: 'Продажи',
        type: 'category',
        budget: 35000000,
        allocated: 30000000,
        spent: 25000000,
        remaining: 5000000,
        status: 'active',
        owner: 'Дмитрий Иванов'
      },
      {
        id: '3',
        name: 'Операции',
        type: 'category',
        budget: 25000000,
        allocated: 20000000,
        spent: 12000000,
        remaining: 8000000,
        status: 'active',
        owner: 'Елена Сидорова'
      }
    ])

    // Computed
    const rollupChartTitle = computed(() => {
      const titles = {
        category: 'Бюджет по категориям',
        department: 'Бюджет по отделам',
        owner: 'Бюджет по ответственным',
        status: 'Бюджет по статусу',
        month: 'Динамика по месяцам',
        quarter: 'Динамика по кварталам'
      }
      return titles[rollupBy.value] || 'Анализ бюджета'
    })

    const filteredTableData = computed(() => {
      let filtered = tableData.value

      if (selectedCategories.value.length > 0) {
        filtered = filtered.filter(item =>
          selectedCategories.value.includes(item.name)
        )
      }

      return filtered
    })

    // Methods
    const formatCurrency = (amount) => {
      const currencyMap = {
        RUB: { currency: 'RUB', locale: 'ru-RU' },
        USD: { currency: 'USD', locale: 'en-US' },
        EUR: { currency: 'EUR', locale: 'de-DE' }
      }

      const config = currencyMap[currency.value] || currencyMap.RUB

      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: 0
      }).format(amount || 0)
    }

    const getSpentColor = (percentage) => {
      if (percentage >= 90) return 'error'
      if (percentage >= 75) return 'warning'
      return 'success'
    }

    const getItemTypeIcon = (type) => {
      const icons = {
        category: 'mdi-folder',
        budget: 'mdi-wallet',
        plan: 'mdi-chart-line'
      }
      return icons[type] || 'mdi-file'
    }

    const getItemTypeColor = (type) => {
      const colors = {
        category: 'primary',
        budget: 'success',
        plan: 'info'
      }
      return colors[type] || 'grey'
    }

    const getStatusColor = (status) => {
      const colors = {
        active: 'success',
        draft: 'warning',
        approved: 'info',
        archived: 'grey'
      }
      return colors[status] || 'grey'
    }

    const getStatusLabel = (status) => {
      const labels = {
        active: 'Активный',
        draft: 'Черновик',
        approved: 'Утвержден',
        archived: 'Архивный'
      }
      return labels[status] || status
    }

    const updateRollup = async () => {
      try {
        isLoading.value = true
        // TODO: Implement actual rollup calculation
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log('Updating rollup with:', {
          rollupBy: rollupBy.value,
          timeframe: timeframe.value,
          categories: selectedCategories.value,
          currency: currency.value
        })
      } catch (error) {
        appStore.showError('Ошибка обновления сводки')
      } finally {
        isLoading.value = false
      }
    }

    const exportToExcel = () => {
      // TODO: Implement Excel export
      appStore.showInfo('Функция экспорта будет реализована в следующих версиях')
    }

    // Lifecycle
    onMounted(() => {
      updateRollup()
    })

    return {
      rollupBy,
      timeframe,
      selectedCategories,
      currency,
      searchQuery,
      isLoading,
      rollupOptions,
      timeframeOptions,
      budgetCategories,
      currencyOptions,
      tableHeaders,
      rollupData,
      categoryBreakdown,
      tableData,
      rollupChartTitle,
      filteredTableData,
      formatCurrency,
      getSpentColor,
      getItemTypeIcon,
      getItemTypeColor,
      getStatusColor,
      getStatusLabel,
      updateRollup,
      exportToExcel
    }
  }
}
</script>

<style scoped>
.budget-rollup {
  max-width: 100%;
}

.chart-container {
  position: relative;
}

.category-breakdown {
  padding: 16px;
}

.category-item {
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
}

.expanded-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}
</style>