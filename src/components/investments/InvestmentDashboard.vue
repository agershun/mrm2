<template>
  <div class="investment-dashboard">
    <!-- KPI карточки -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center" elevation="2">
          <v-icon color="primary" size="48" class="mb-2">
            mdi-chart-pie
          </v-icon>
          <div class="text-caption text-medium-emphasis">Общий портфель</div>
          <div class="text-h5 font-weight-bold text-primary">
            {{ formatCurrency(kpis.totalPortfolio) }}
          </div>
          <div class="text-caption mt-1" :class="kpis.portfolioGrowth >= 0 ? 'text-success' : 'text-error'">
            <v-icon size="16">
              {{ kpis.portfolioGrowth >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
            </v-icon>
            {{ Math.abs(kpis.portfolioGrowth) }}% за месяц
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center" elevation="2">
          <v-icon color="success" size="48" class="mb-2">
            mdi-trending-up
          </v-icon>
          <div class="text-caption text-medium-emphasis">Средний ROI</div>
          <div class="text-h5 font-weight-bold text-success">
            {{ kpis.averageROI }}%
          </div>
          <div class="text-caption mt-1 text-success">
            <v-icon size="16">mdi-check-circle</v-icon>
            Выше целевого
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center" elevation="2">
          <v-icon color="warning" size="48" class="mb-2">
            mdi-clock-outline
          </v-icon>
          <div class="text-caption text-medium-emphasis">Активных проектов</div>
          <div class="text-h5 font-weight-bold text-warning">
            {{ kpis.activeProjects }}
          </div>
          <div class="text-caption mt-1 text-medium-emphasis">
            из {{ kpis.totalProjects }} общих
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="pa-4 text-center" elevation="2">
          <v-icon color="info" size="48" class="mb-2">
            mdi-speedometer
          </v-icon>
          <div class="text-caption text-medium-emphasis">Эффективность</div>
          <div class="text-h5 font-weight-bold text-info">
            {{ kpis.efficiency }}%
          </div>
          <div class="text-caption mt-1" :class="kpis.efficiencyTrend >= 0 ? 'text-success' : 'text-error'">
            <v-icon size="16">
              {{ kpis.efficiencyTrend >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
            </v-icon>
            {{ Math.abs(kpis.efficiencyTrend) }}% изменение
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Основные графики -->
    <v-row class="mb-6">
      <!-- График распределения портфеля -->
      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-donut</v-icon>
            Распределение портфеля
            <v-spacer />
            <v-btn-toggle v-model="portfolioView" mandatory size="small" variant="outlined">
              <v-btn value="category">Категории</v-btn>
              <v-btn value="risk">Риски</v-btn>
            </v-btn-toggle>
          </v-card-title>

          <v-card-text>
            <div class="chart-container">
              <!-- Заглушка для графика -->
              <div class="chart-placeholder">
                <v-icon size="80" color="grey-lighten-2">mdi-chart-donut</v-icon>
                <p class="text-body-1 mt-2">ECharts Donut Chart</p>
                <p class="text-caption text-medium-emphasis">
                  {{ portfolioView === 'category' ? 'По категориям' : 'По уровню риска' }}
                </p>
              </div>
            </div>

            <!-- Легенда -->
            <v-row class="mt-4">
              <v-col
                v-for="item in portfolioDistribution"
                :key="item.name"
                cols="6" md="4"
              >
                <div class="d-flex align-center">
                  <div
                    class="legend-color me-2"
                    :style="{ backgroundColor: item.color }"
                  />
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ item.name }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatCurrency(item.value) }} ({{ item.percentage }}%)
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- График ROI по времени -->
      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-chart-line</v-icon>
            ROI по времени
            <v-spacer />
            <v-select
              v-model="roiPeriod"
              :items="periodOptions"
              density="compact"
              variant="outlined"
              style="width: 120px;"
            />
          </v-card-title>

          <v-card-text>
            <div class="chart-container">
              <!-- Заглушка для графика -->
              <div class="chart-placeholder">
                <v-icon size="80" color="grey-lighten-2">mdi-chart-line</v-icon>
                <p class="text-body-1 mt-2">ECharts Line Chart</p>
                <p class="text-caption text-medium-emphasis">
                  Динамика ROI за {{ roiPeriod }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Таблица топ инвестиций и аналитика -->
    <v-row class="mb-6">
      <!-- Топ инвестиций -->
      <v-col cols="12" lg="8">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-trophy</v-icon>
            Топ инвестиций по эффективности
          </v-card-title>

          <v-data-table
            :headers="topInvestmentsHeaders"
            :items="topInvestments"
            :items-per-page="10"
            item-key="id"
            class="elevation-0"
          >
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar
                  :color="getCategoryColor(item.category)"
                  size="32"
                  class="me-3"
                >
                  <v-icon color="white" size="16">
                    {{ getCategoryIcon(item.category) }}
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.category }}</div>
                </div>
              </div>
            </template>

            <template v-slot:item.amount="{ item }">
              <span class="font-weight-medium">
                {{ formatCurrency(item.amount) }}
              </span>
            </template>

            <template v-slot:item.roi="{ item }">
              <v-chip
                :color="getROIColor(item.roi)"
                size="small"
                variant="tonal"
              >
                {{ item.roi }}%
              </v-chip>
            </template>

            <template v-slot:item.risk="{ item }">
              <v-chip
                :color="getRiskColor(item.risk)"
                size="small"
                variant="outlined"
              >
                {{ getRiskText(item.risk) }}
              </v-chip>
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

            <template v-slot:item.trend="{ item }">
              <div class="d-flex align-center">
                <v-icon
                  :color="item.trend >= 0 ? 'success' : 'error'"
                  size="16"
                  class="me-1"
                >
                  {{ item.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                </v-icon>
                <span :class="item.trend >= 0 ? 'text-success' : 'text-error'">
                  {{ Math.abs(item.trend) }}%
                </span>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Аналитика и рекомендации -->
      <v-col cols="12" lg="4">
        <v-card elevation="2" class="h-100">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-lightbulb</v-icon>
            Аналитика и рекомендации
          </v-card-title>

          <v-card-text>
            <!-- Рекомендации -->
            <div class="mb-4">
              <h4 class="text-subtitle-2 mb-2">Рекомендации</h4>
              <v-alert
                v-for="recommendation in recommendations"
                :key="recommendation.id"
                :type="recommendation.type"
                variant="tonal"
                density="compact"
                class="mb-2"
              >
                <div class="text-body-2">{{ recommendation.text }}</div>
              </v-alert>
            </div>

            <!-- Риски -->
            <div class="mb-4">
              <h4 class="text-subtitle-2 mb-2">Выявленные риски</h4>
              <v-list density="compact">
                <v-list-item
                  v-for="risk in risks"
                  :key="risk.id"
                  class="pa-2"
                >
                  <template v-slot:prepend>
                    <v-icon
                      :color="getRiskColor(risk.level)"
                      size="16"
                    >
                      mdi-alert-circle
                    </v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ risk.description }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Вероятность: {{ risk.probability }}%
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>

            <!-- Планируемые действия -->
            <div>
              <h4 class="text-subtitle-2 mb-2">Планируемые действия</h4>
              <v-timeline density="compact" align="start">
                <v-timeline-item
                  v-for="action in plannedActions"
                  :key="action.id"
                  size="x-small"
                  dot-color="primary"
                >
                  <div class="text-body-2 font-weight-medium">{{ action.title }}</div>
                  <div class="text-caption text-medium-emphasis">
                    До {{ formatDate(action.deadline) }}
                  </div>
                </v-timeline-item>
              </v-timeline>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Дополнительная аналитика -->
    <v-row>
      <!-- Сравнение с бенчмарками -->
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-compare</v-icon>
            Сравнение с рынком
          </v-card-title>

          <v-card-text>
            <div class="chart-container">
              <!-- Заглушка для сравнительного графика -->
              <div class="chart-placeholder">
                <v-icon size="80" color="grey-lighten-2">mdi-chart-bar</v-icon>
                <p class="text-body-1 mt-2">ECharts Bar Chart</p>
                <p class="text-caption text-medium-emphasis">
                  Сравнение с отраслевыми показателями
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Прогноз -->
      <v-col cols="12" md="6">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-crystal-ball</v-icon>
            Прогноз на следующий квартал
          </v-card-title>

          <v-card-text>
            <div class="chart-container">
              <!-- Заглушка для прогнозного графика -->
              <div class="chart-placeholder">
                <v-icon size="80" color="grey-lighten-2">mdi-chart-timeline-variant</v-icon>
                <p class="text-body-1 mt-2">ECharts Forecast Chart</p>
                <p class="text-caption text-medium-emphasis">
                  Прогнозируемая доходность
                </p>
              </div>
            </div>

            <!-- Прогнозные метрики -->
            <v-row class="mt-4">
              <v-col cols="6">
                <div class="text-center">
                  <div class="text-caption text-medium-emphasis">Ожидаемый ROI</div>
                  <div class="text-h6 font-weight-bold text-success">
                    {{ forecast.expectedROI }}%
                  </div>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="text-center">
                  <div class="text-caption text-medium-emphasis">Доверительный интервал</div>
                  <div class="text-body-2">
                    {{ forecast.confidenceInterval.min }}% - {{ forecast.confidenceInterval.max }}%
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'InvestmentDashboard',
  setup() {
    const portfolioView = ref('category')
    const roiPeriod = ref('3 месяца')

    const periodOptions = [
      { title: '1 месяц', value: '1 месяц' },
      { title: '3 месяца', value: '3 месяца' },
      { title: '6 месяцев', value: '6 месяцев' },
      { title: '1 год', value: '1 год' }
    ]

    const kpis = {
      totalPortfolio: 15750000,
      portfolioGrowth: 12.5,
      averageROI: 18.3,
      activeProjects: 24,
      totalProjects: 32,
      efficiency: 87,
      efficiencyTrend: 3.2
    }

    const portfolioDistribution = computed(() => {
      if (portfolioView.value === 'category') {
        return [
          { name: 'Маркетинг', value: 6300000, percentage: 40, color: '#2196F3' },
          { name: 'Продукт', value: 4725000, percentage: 30, color: '#4CAF50' },
          { name: 'Исследования', value: 2362500, percentage: 15, color: '#FF9800' },
          { name: 'Операции', value: 1575000, percentage: 10, color: '#9C27B0' },
          { name: 'Инфраструктура', value: 787500, percentage: 5, color: '#607D8B' }
        ]
      } else {
        return [
          { name: 'Низкий риск', value: 7875000, percentage: 50, color: '#4CAF50' },
          { name: 'Средний риск', value: 5512500, percentage: 35, color: '#FF9800' },
          { name: 'Высокий риск', value: 2362500, percentage: 15, color: '#F44336' }
        ]
      }
    })

    const topInvestments = [
      {
        id: 1,
        name: 'SEO оптимизация',
        category: 'Marketing',
        amount: 1200000,
        roi: 245,
        risk: 'low',
        status: 'active',
        trend: 12.5
      },
      {
        id: 2,
        name: 'Мобильное приложение',
        category: 'Product',
        amount: 3500000,
        roi: 180,
        risk: 'medium',
        status: 'active',
        trend: 8.2
      },
      {
        id: 3,
        name: 'Контент-маркетинг',
        category: 'Marketing',
        amount: 800000,
        roi: 156,
        risk: 'low',
        status: 'active',
        trend: -2.1
      },
      {
        id: 4,
        name: 'AI аналитика',
        category: 'Research',
        amount: 2200000,
        roi: 134,
        risk: 'high',
        status: 'in_progress',
        trend: 15.7
      },
      {
        id: 5,
        name: 'CRM система',
        category: 'Operations',
        amount: 1800000,
        roi: 112,
        risk: 'medium',
        status: 'active',
        trend: 5.3
      }
    ]

    const topInvestmentsHeaders = [
      { title: 'Инвестиция', key: 'name', sortable: true },
      { title: 'Сумма', key: 'amount', sortable: true },
      { title: 'ROI', key: 'roi', sortable: true },
      { title: 'Риск', key: 'risk', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Тренд', key: 'trend', sortable: true }
    ]

    const recommendations = [
      {
        id: 1,
        type: 'success',
        text: 'Увеличить инвестиции в SEO - показывает отличную доходность'
      },
      {
        id: 2,
        type: 'warning',
        text: 'Пересмотреть стратегию контент-маркетинга - снижение эффективности'
      },
      {
        id: 3,
        type: 'info',
        text: 'Рассмотреть диверсификацию в новые каналы привлечения'
      }
    ]

    const risks = [
      {
        id: 1,
        description: 'Высокая концентрация в маркетинговых каналах',
        level: 'medium',
        probability: 35
      },
      {
        id: 2,
        description: 'Зависимость от сезонности в продажах',
        level: 'low',
        probability: 20
      },
      {
        id: 3,
        description: 'Технологические риски в AI проектах',
        level: 'high',
        probability: 45
      }
    ]

    const plannedActions = [
      {
        id: 1,
        title: 'Ребалансировка портфеля',
        deadline: '2024-02-15'
      },
      {
        id: 2,
        title: 'Анализ новых возможностей',
        deadline: '2024-02-28'
      },
      {
        id: 3,
        title: 'Оптимизация рисков',
        deadline: '2024-03-10'
      }
    ]

    const forecast = {
      expectedROI: 21.7,
      confidenceInterval: {
        min: 18.2,
        max: 25.1
      }
    }

    const formatCurrency = (amount) => {
      if (!amount && amount !== 0) return '0 ₽'
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('ru-RU')
    }

    const getCategoryColor = (category) => {
      const colors = {
        'Marketing': 'blue',
        'Product': 'green',
        'Research': 'orange',
        'Operations': 'purple'
      }
      return colors[category] || 'grey'
    }

    const getCategoryIcon = (category) => {
      const icons = {
        'Marketing': 'mdi-bullhorn',
        'Product': 'mdi-cube',
        'Research': 'mdi-magnify',
        'Operations': 'mdi-cog'
      }
      return icons[category] || 'mdi-circle'
    }

    const getROIColor = (roi) => {
      if (roi >= 150) return 'success'
      if (roi >= 100) return 'warning'
      return 'error'
    }

    const getRiskColor = (risk) => {
      const colors = {
        'low': 'success',
        'medium': 'warning',
        'high': 'error'
      }
      return colors[risk] || 'grey'
    }

    const getRiskText = (risk) => {
      const texts = {
        'low': 'Низкий',
        'medium': 'Средний',
        'high': 'Высокий'
      }
      return texts[risk] || risk
    }

    const getStatusColor = (status) => {
      const colors = {
        'active': 'success',
        'in_progress': 'warning',
        'planned': 'info',
        'completed': 'grey'
      }
      return colors[status] || 'grey'
    }

    const getStatusText = (status) => {
      const texts = {
        'active': 'Активна',
        'in_progress': 'В работе',
        'planned': 'Запланирована',
        'completed': 'Завершена'
      }
      return texts[status] || status
    }

    return {
      portfolioView,
      roiPeriod,
      periodOptions,
      kpis,
      portfolioDistribution,
      topInvestments,
      topInvestmentsHeaders,
      recommendations,
      risks,
      plannedActions,
      forecast,
      formatCurrency,
      formatDate,
      getCategoryColor,
      getCategoryIcon,
      getROIColor,
      getRiskColor,
      getRiskText,
      getStatusColor,
      getStatusText
    }
  }
}
</script>

<style scoped>
.investment-dashboard {
  padding: 24px;
}

.chart-container {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>