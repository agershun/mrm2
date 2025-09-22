<template>
  <div class="investments-view">
    <!-- Заголовок страницы -->
    <div class="d-flex align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Инвестиции</h1>
        <p class="text-body-1 text-medium-emphasis">
          Планирование, распределение и анализ инвестиций
        </p>
      </div>
      <v-spacer />

      <!-- Переключатель представлений -->
      <v-btn-toggle v-model="currentView" mandatory variant="outlined" class="me-4">
        <v-btn value="planning" size="small">
          <v-icon>mdi-chart-timeline-variant</v-icon>
          Планирование
        </v-btn>
        <v-btn value="allocation" size="small">
          <v-icon>mdi-chart-donut</v-icon>
          Распределение
        </v-btn>
        <v-btn value="dashboard" size="small">
          <v-icon>mdi-view-dashboard</v-icon>
          Дашборд
        </v-btn>
        <v-btn value="forecast" size="small">
          <v-icon>mdi-link</v-icon>
          Связи
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
        class="me-4"
        @update:modelValue="onPeriodChange"
      />

      <!-- Действия -->
      <v-btn
        color="primary"
        @click="refreshData"
        :loading="isLoading"
      >
        <v-icon>mdi-refresh</v-icon>
        Обновить
      </v-btn>
    </div>

    <!-- Статистика -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon color="primary" size="40" class="me-4">
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
              <v-icon color="success" size="40" class="me-4">
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
              <v-icon color="warning" size="40" class="me-4">
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
              <v-icon color="info" size="40" class="me-4">
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

    <!-- Основной контент -->
    <v-row>
      <!-- Левая панель -->
      <v-col cols="12" :lg="selectedInvestment ? 8 : 12">
        <v-card class="h-100">
          <!-- Представление планирования -->
          <template v-if="currentView === 'planning'">
            <v-card-text class="pa-0" style="height: 700px; overflow: auto;">
              <InvestmentPlanning />
            </v-card-text>
          </template>

          <!-- Представление распределения -->
          <template v-if="currentView === 'allocation'">
            <v-card-text class="pa-0" style="height: 700px; overflow: auto;">
              <InvestmentAllocation />
            </v-card-text>
          </template>

          <!-- Представление дашборда -->
          <template v-if="currentView === 'dashboard'">
            <v-card-text class="pa-0" style="height: 700px; overflow: auto;">
              <InvestmentDashboard />
            </v-card-text>
          </template>

          <!-- Представление прогноза -->
          <template v-if="currentView === 'forecast'">
            <v-card-text class="pa-0" style="height: 700px; overflow: auto;">
              <ActivityInvestmentLink />
            </v-card-text>
          </template>
        </v-card>
      </v-col>

      <!-- Правая панель с деталями -->
      <v-col v-if="selectedInvestment" cols="12" lg="4">
        <v-card class="h-100">
          <v-card-title>
            <v-icon class="me-2">mdi-information</v-icon>
            Детали инвестиции
          </v-card-title>
          <v-divider />
          <v-card-text>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-information</v-icon>
              <p class="text-body-1 mt-4">Панель деталей будет реализована позже</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from 'vue'
import { useInvestmentsStore } from '@/stores/investmentsStore'
import InvestmentPlanning from '@/components/InvestmentPlanning.vue'
import InvestmentAllocation from '@/components/investments/InvestmentAllocation.vue'
import InvestmentDashboard from '@/components/investments/InvestmentDashboard.vue'
import ActivityInvestmentLink from '@/components/investments/ActivityInvestmentLink.vue'

export default {
  name: 'InvestmentsView',
  components: {
    InvestmentPlanning,
    InvestmentAllocation,
    InvestmentDashboard,
    ActivityInvestmentLink
  },
  setup() {
    const investmentsStore = useInvestmentsStore()

    // Reactive state
    const currentView = ref('planning')
    const selectedPeriod = ref('current')

    // Computed properties
    const isLoading = computed(() => investmentsStore.isLoading)
    const selectedInvestment = computed(() => investmentsStore.selectedInvestment)
    const totalInvestmentBudget = computed(() => investmentsStore.totalInvestmentBudget)
    const allocatedBudget = computed(() => investmentsStore.allocatedBudget)
    const pendingBudget = computed(() => investmentsStore.pendingBudget)
    const allocationEfficiency = computed(() => investmentsStore.allocationEfficiency)

    const periodOptions = computed(() => [
      { title: 'Текущий период', value: 'current' },
      { title: 'Следующий период', value: 'next' },
      { title: 'Все периоды', value: 'all' }
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

    const refreshData = async () => {
      await Promise.all([
        investmentsStore.fetchInvestments({ period: selectedPeriod.value }),
        investmentsStore.fetchInvestmentValues(),
        investmentsStore.fetchManualAllocations(),
        investmentsStore.fetchActivityInvestments()
      ])
    }

    const onPeriodChange = (period) => {
      investmentsStore.setPeriod(period)
      investmentsStore.fetchInvestments({ period })
    }

    // Watchers
    watch(currentView, (newView) => {
      investmentsStore.setView(newView)
    })

    // Lifecycle
    onMounted(async () => {
      await investmentsStore.initialize()
    })

    return {
      // Store state
      isLoading,
      selectedInvestment,
      totalInvestmentBudget,
      allocatedBudget,
      pendingBudget,
      allocationEfficiency,

      // Local state
      currentView,
      selectedPeriod,
      periodOptions,

      // Methods
      formatCurrency,
      refreshData,
      onPeriodChange
    }
  }
}
</script>

<style scoped>
.investments-view {
  padding: 24px;
  height: 100vh;
  overflow: auto;
}

.h-100 {
  height: 100%;
}
</style>