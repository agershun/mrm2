<template>
  <div class="customer-journey-flow">
    <v-card>
      <v-card-title>Путь клиента</v-card-title>
      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-2">Анализ путей клиентов...</p>
        </div>
        <div v-else-if="!data || data.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">mdi-map-marker-path</v-icon>
          <p class="text-grey mt-2">Нет данных для анализа</p>
        </div>
        <div v-else class="journey-container">
          <div class="journey-steps">
            <div
              v-for="(step, index) in data"
              :key="step.step_id"
              class="journey-step"
            >
              <div class="step-content">
                <v-avatar
                  size="48"
                  :color="getStepColor(step.type)"
                >
                  <v-icon color="white">{{ getStepIcon(step.type) }}</v-icon>
                </v-avatar>
                <div class="step-label">{{ step.name }}</div>
                <div class="step-users">{{ formatNumber(step.users) }}</div>
              </div>
              <div v-if="index < data.length - 1" class="step-connector">
                <v-icon>mdi-arrow-right</v-icon>
                <div class="connector-label">{{ getConversionRate(index) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const getStepColor = (type) => {
  const colors = { awareness: 'blue', consideration: 'orange', decision: 'green', retention: 'purple' }
  return colors[type] || 'grey'
}

const getStepIcon = (type) => {
  const icons = { awareness: 'mdi-eye', consideration: 'mdi-head-question', decision: 'mdi-cart', retention: 'mdi-heart' }
  return icons[type] || 'mdi-circle'
}

const getConversionRate = (index) => {
  if (index >= props.data.length - 1) return 0
  const current = props.data[index]
  const next = props.data[index + 1]
  return Math.round((next.users / current.users) * 100)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}
</script>

<style scoped>
.journey-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  overflow-x: auto;
}

.journey-step {
  display: flex;
  align-items: center;
  text-align: center;
}

.step-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.step-label {
  font-weight: 500;
  margin-top: 8px;
}

.step-users {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 4px;
}

.step-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 24px;
}

.connector-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 4px;
}
</style>