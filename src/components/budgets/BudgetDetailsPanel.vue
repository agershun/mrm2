<template>
  <div class="budget-details-panel">
    <v-card class="h-100">
      <!-- Заголовок -->
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-information-outline</v-icon>
        <span>{{ budget ? budget.name : 'Детали бюджета' }}</span>
        <v-spacer />
        <v-btn
          icon
          size="small"
          variant="text"
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <template v-if="budget">
        <!-- Вкладки -->
        <v-tabs v-model="activeTab" bg-color="transparent">
          <v-tab value="overview">
            <v-icon class="me-2">mdi-eye</v-icon>
            Обзор
          </v-tab>
          <v-tab value="allocations">
            <v-icon class="me-2">mdi-chart-pie</v-icon>
            Распределения
          </v-tab>
          <v-tab value="requests">
            <v-icon class="me-2">mdi-clipboard-list</v-icon>
            Запросы
          </v-tab>
          <v-tab value="history">
            <v-icon class="me-2">mdi-history</v-icon>
            История
          </v-tab>
        </v-tabs>

        <v-divider />

        <v-card-text class="pa-0" style="height: calc(100vh - 300px); overflow-y: auto;">
          <v-tabs-window v-model="activeTab">
            <!-- Вкладка Обзор -->
            <v-tabs-window-item value="overview" class="pa-4">
              <BudgetPanelOverview :budget="budget" />
            </v-tabs-window-item>

            <!-- Вкладка Распределения -->
            <v-tabs-window-item value="allocations" class="pa-4">
              <BudgetPanelAllocations :budget="budget" />
            </v-tabs-window-item>

            <!-- Вкладка Запросы -->
            <v-tabs-window-item value="requests" class="pa-4">
              <BudgetPanelRequests :budget="budget" />
            </v-tabs-window-item>

            <!-- Вкладка История -->
            <v-tabs-window-item value="history" class="pa-4">
              <BudgetPanelHistory :budget="budget" />
            </v-tabs-window-item>
          </v-tabs-window>
        </v-card-text>
      </template>

      <template v-else>
        <!-- Пустое состояние -->
        <v-card-text class="d-flex align-center justify-center h-100">
          <div class="text-center">
            <v-icon size="64" color="grey-lighten-2">
              mdi-information-outline
            </v-icon>
            <p class="text-body-1 mt-4 text-medium-emphasis">
              Выберите бюджет для просмотра деталей
            </p>
          </div>
        </v-card-text>
      </template>
    </v-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import BudgetPanelOverview from './BudgetPanelOverview.vue'
import BudgetPanelAllocations from './BudgetPanelAllocations.vue'
import BudgetPanelRequests from './BudgetPanelRequests.vue'
import BudgetPanelHistory from './BudgetPanelHistory.vue'

export default {
  name: 'BudgetDetailsPanel',
  components: {
    BudgetPanelOverview,
    BudgetPanelAllocations,
    BudgetPanelRequests,
    BudgetPanelHistory
  },
  emits: ['close'],
  props: {
    budget: {
      type: Object,
      default: null
    }
  },
  setup() {
    const activeTab = ref('overview')

    return {
      activeTab
    }
  }
}
</script>

<style scoped>
.budget-details-panel {
  height: 100%;
}

.h-100 {
  height: 100%;
}
</style>