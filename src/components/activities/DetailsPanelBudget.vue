<template>
  <div class="details-panel-budget">
    <v-container fluid class="pa-4">
      <!-- Сводка бюджета -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-wallet</v-icon>
          Сводка бюджета
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col cols="12" md="4">
              <div class="budget-metric">
                <div class="metric-value text-h5 font-weight-bold text-primary">
                  {{ formatCurrency(budgetData.planned, activity?.currency_code) }}
                </div>
                <div class="metric-label text-caption text-grey-darken-1">
                  Планируемый бюджет
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="budget-metric">
                <div class="metric-value text-h5 font-weight-bold text-success">
                  {{ formatCurrency(budgetData.allocated, activity?.currency_code) }}
                </div>
                <div class="metric-label text-caption text-grey-darken-1">
                  Выделено средств
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="budget-metric">
                <div class="metric-value text-h5 font-weight-bold text-warning">
                  {{ formatCurrency(budgetData.spent, activity?.currency_code) }}
                </div>
                <div class="metric-label text-caption text-grey-darken-1">
                  Потрачено
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Прогресс использования бюджета -->
          <v-row class="mt-4">
            <v-col cols="12">
              <div class="budget-progress">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-subtitle-2">Использование бюджета</span>
                  <span class="text-body-2">{{ budgetUsagePercent }}%</span>
                </div>
                <v-progress-linear
                  :model-value="budgetUsagePercent"
                  :color="getBudgetProgressColor(budgetUsagePercent)"
                  height="8"
                  rounded
                />
                <div class="d-flex justify-space-between text-caption text-grey-darken-1 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Распределение по категориям -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-chart-pie</v-icon>
          Распределение по категориям
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row>
            <v-col
              v-for="category in budgetCategories"
              :key="category.name"
              cols="12"
              md="6"
            >
              <div class="category-item pa-3 rounded border">
                <div class="d-flex justify-space-between align-center mb-2">
                  <div class="category-info">
                    <v-icon :color="category.color" class="me-2">{{ category.icon }}</v-icon>
                    <span class="text-subtitle-2">{{ category.name }}</span>
                  </div>
                  <span class="text-h6 font-weight-bold">
                    {{ formatCurrency(category.amount, activity?.currency_code) }}
                  </span>
                </div>
                <v-progress-linear
                  :model-value="(category.amount / budgetData.planned) * 100"
                  :color="category.color"
                  height="4"
                  rounded
                />
                <div class="text-caption text-grey-darken-1 mt-1">
                  {{ Math.round((category.amount / budgetData.planned) * 100) }}% от общего бюджета
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- История изменений бюджета -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-history</v-icon>
          История изменений
        </v-card-title>
        <v-card-text class="pa-3">
          <v-timeline density="compact" side="end">
            <v-timeline-item
              v-for="(change, index) in budgetHistory"
              :key="index"
              :dot-color="change.type === 'increase' ? 'success' : change.type === 'decrease' ? 'error' : 'info'"
              size="small"
            >
              <template v-slot:icon>
                <v-icon size="16">
                  {{ change.type === 'increase' ? 'mdi-arrow-up' :
                      change.type === 'decrease' ? 'mdi-arrow-down' : 'mdi-pencil' }}
                </v-icon>
              </template>
              <div class="timeline-content">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-body-2">{{ change.description }}</span>
                  <span class="text-caption text-grey-darken-1">{{ change.date }}</span>
                </div>
                <div class="text-subtitle-2 font-weight-bold mt-1"
                     :class="change.type === 'increase' ? 'text-success' :
                             change.type === 'decrease' ? 'text-error' : 'text-info'">
                  {{ change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : '' }}
                  {{ formatCurrency(Math.abs(change.amount), activity?.currency_code) }}
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>

      <!-- Прогноз расходов -->
      <v-card elevation="0" class="mb-4">
        <v-card-title class="text-h6 pa-3">
          <v-icon class="me-2">mdi-chart-line</v-icon>
          Прогноз расходов
        </v-card-title>
        <v-card-text class="pa-3">
          <div class="forecast-container">
            <div class="forecast-summary pa-3 rounded border mb-3">
              <v-row>
                <v-col cols="12" md="4">
                  <div class="text-center">
                    <div class="text-h6 font-weight-bold text-info">
                      {{ formatCurrency(forecastData.projected, activity?.currency_code) }}
                    </div>
                    <div class="text-caption text-grey-darken-1">Прогнозируемые затраты</div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="text-center">
                    <div class="text-h6 font-weight-bold"
                         :class="forecastData.variance >= 0 ? 'text-error' : 'text-success'">
                      {{ forecastData.variance >= 0 ? '+' : '' }}{{ formatCurrency(forecastData.variance, activity?.currency_code) }}
                    </div>
                    <div class="text-caption text-grey-darken-1">Отклонение от плана</div>
                  </div>
                </v-col>
                <v-col cols="12" md="4">
                  <div class="text-center">
                    <div class="text-h6 font-weight-bold text-orange">
                      {{ formatDate(forecastData.burnDate) }}
                    </div>
                    <div class="text-caption text-grey-darken-1">Ожидаемая дата исчерпания</div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  activity: {
    type: Object,
    default: () => ({})
  }
})

const budgetData = ref({
  planned: 5000000,
  allocated: 4200000,
  spent: 1890000
})

const budgetCategories = ref([
  {
    name: 'Медиа размещение',
    amount: 3000000,
    color: 'primary',
    icon: 'mdi-television'
  },
  {
    name: 'Производство контента',
    amount: 800000,
    color: 'success',
    icon: 'mdi-camera'
  },
  {
    name: 'Дизайн и креативы',
    amount: 600000,
    color: 'warning',
    icon: 'mdi-palette'
  },
  {
    name: 'Анализ и отчетность',
    amount: 400000,
    color: 'info',
    icon: 'mdi-chart-bar'
  },
  {
    name: 'Прочие расходы',
    amount: 200000,
    color: 'secondary',
    icon: 'mdi-dots-horizontal'
  }
])

const budgetHistory = ref([
  {
    date: '15 сен 2025',
    description: 'Корректировка бюджета на медиа',
    amount: 500000,
    type: 'increase'
  },
  {
    date: '10 сен 2025',
    description: 'Оплата за производство видео',
    amount: 300000,
    type: 'decrease'
  },
  {
    date: '05 сен 2025',
    description: 'Первоначальное планирование',
    amount: 4500000,
    type: 'initial'
  }
])

const forecastData = ref({
  projected: 5200000,
  variance: 200000,
  burnDate: new Date('2025-12-15')
})

const budgetUsagePercent = computed(() => {
  return Math.round((budgetData.value.spent / budgetData.value.planned) * 100)
})

const getBudgetProgressColor = (percent) => {
  if (percent >= 90) return 'error'
  if (percent >= 75) return 'warning'
  return 'success'
}

const formatCurrency = (amount, currencyCode = 'RUB') => {
  const formatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  return formatter.format(amount)
}

const formatDate = (date) => {
  if (!date) return 'Не определена'
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<style scoped>
.details-panel-budget {
  height: 100%;
  overflow-y: auto;
}

.budget-metric {
  text-align: center;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: #fafafa;
}

.metric-value {
  line-height: 1.2;
}

.metric-label {
  margin-top: 4px;
}

.budget-progress {
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: #fafafa;
}

.category-item {
  background: #fafafa;
  transition: all 0.2s ease;
}

.category-item:hover {
  background: #f0f0f0;
}

.category-info {
  display: flex;
  align-items: center;
}

.timeline-content {
  padding: 8px 0;
}

.forecast-container {
  background: #fafafa;
  border-radius: 8px;
}

.forecast-summary {
  background: white;
}

.v-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.v-card-title {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .v-container {
    padding: 12px;
  }

  .budget-metric {
    margin-bottom: 16px;
  }

  .category-item {
    margin-bottom: 12px;
  }
}
</style>