<template>
  <div class="strategic-alignment-gauge">
    <v-card>
      <v-card-title>Стратегическое соответствие</v-card-title>
      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-2">Анализ стратегического соответствия...</p>
        </div>

        <div v-else class="gauge-container">
          <!-- Основной индикатор -->
          <div class="main-gauge text-center mb-6">
            <v-progress-circular
              :model-value="overallAlignment"
              :color="getAlignmentColor(overallAlignment)"
              :size="200"
              :width="16"
              class="gauge-main"
            >
              <div class="gauge-content">
                <div class="gauge-score">{{ overallAlignment }}</div>
                <div class="gauge-label">из 100</div>
                <div class="gauge-status">{{ getAlignmentLabel(overallAlignment) }}</div>
              </div>
            </v-progress-circular>
          </div>

          <!-- Детальные метрики -->
          <v-row>
            <v-col
              v-for="metric in alignmentMetrics"
              :key="metric.key"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card variant="outlined" class="metric-card">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-3">
                    <v-icon
                      :color="getAlignmentColor(metric.score)"
                      class="me-2"
                      size="20"
                    >
                      {{ metric.icon }}
                    </v-icon>
                    <span class="text-subtitle-2 font-weight-medium">
                      {{ metric.label }}
                    </span>
                  </div>

                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-h6 font-weight-bold" :class="getAlignmentTextClass(metric.score)">
                        {{ metric.score }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ metric.description }}
                      </div>
                    </div>

                    <v-progress-circular
                      :model-value="metric.score"
                      :color="getAlignmentColor(metric.score)"
                      size="48"
                      width="4"
                    >
                      <v-icon
                        :color="getAlignmentColor(metric.score)"
                        size="16"
                      >
                        {{ getAlignmentIcon(metric.score) }}
                      </v-icon>
                    </v-progress-circular>
                  </div>

                  <!-- Рекомендации для улучшения -->
                  <div v-if="metric.recommendations && metric.recommendations.length > 0" class="mt-3">
                    <div class="text-caption text-grey mb-1">Рекомендации:</div>
                    <div
                      v-for="recommendation in metric.recommendations.slice(0, 2)"
                      :key="recommendation"
                      class="text-caption mb-1"
                    >
                      • {{ recommendation }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Стратегические цели -->
          <v-card variant="outlined" class="mt-6">
            <v-card-title class="text-subtitle-1">Соответствие стратегическим целям</v-card-title>
            <v-card-text>
              <div
                v-for="goal in strategicGoals"
                :key="goal.goal_id"
                class="goal-item mb-4"
              >
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center">
                    <v-avatar
                      size="32"
                      :color="getAlignmentColor(goal.alignment_score)"
                      class="me-3"
                    >
                      <v-icon size="16" color="white">{{ goal.icon }}</v-icon>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ goal.name }}</div>
                      <div class="text-caption text-grey">{{ goal.category }}</div>
                    </div>
                  </div>

                  <div class="text-right">
                    <v-chip
                      size="small"
                      :color="getAlignmentColor(goal.alignment_score)"
                      variant="tonal"
                    >
                      {{ goal.alignment_score }}%
                    </v-chip>
                    <div class="text-caption text-grey mt-1">
                      {{ formatCurrency(goal.allocated_budget) }}
                    </div>
                  </div>
                </div>

                <v-progress-linear
                  :model-value="goal.alignment_score"
                  :color="getAlignmentColor(goal.alignment_score)"
                  height="6"
                  rounded
                  class="mb-2"
                />

                <div class="d-flex justify-space-between text-caption text-grey">
                  <span>{{ goal.contributing_investments }} инвестиций</span>
                  <span>Приоритет: {{ getPriorityLabel(goal.priority) }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Действия для улучшения соответствия -->
          <v-card variant="outlined" class="mt-6">
            <v-card-title class="text-subtitle-1">
              <v-icon color="warning" class="me-2">mdi-lightbulb</v-icon>
              Действия для улучшения соответствия
            </v-card-title>
            <v-card-text>
              <v-expansion-panels variant="accordion">
                <v-expansion-panel
                  v-for="(action, index) in improvementActions"
                  :key="index"
                >
                  <v-expansion-panel-title>
                    <div class="d-flex align-center">
                      <v-icon
                        :color="getActionPriorityColor(action.priority)"
                        class="me-2"
                      >
                        {{ getActionPriorityIcon(action.priority) }}
                      </v-icon>
                      {{ action.title }}
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="mb-3">{{ action.description }}</div>

                    <div class="mb-3">
                      <div class="text-subtitle-2 mb-2">Ожидаемые результаты:</div>
                      <v-chip-group>
                        <v-chip
                          v-for="benefit in action.expected_benefits"
                          :key="benefit"
                          size="small"
                          color="success"
                          variant="tonal"
                        >
                          {{ benefit }}
                        </v-chip>
                      </v-chip-group>
                    </div>

                    <div class="d-flex align-center justify-space-between">
                      <div>
                        <v-chip size="small" color="info" variant="tonal">
                          {{ action.estimated_time }}
                        </v-chip>
                        <v-chip size="small" color="warning" variant="tonal" class="ms-2">
                          {{ formatCurrency(action.estimated_cost) }}
                        </v-chip>
                      </div>
                      <v-btn
                        size="small"
                        color="primary"
                        @click="implementAction(action)"
                      >
                        Реализовать
                      </v-btn>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['implement-action'])

const overallAlignment = computed(() => {
  return props.data.overall_alignment || 0
})

const alignmentMetrics = computed(() => {
  const defaultMetrics = [
    {
      key: 'goal_alignment',
      label: 'Соответствие целям',
      description: 'Связь с стратегическими целями',
      icon: 'mdi-target',
      score: 0,
      recommendations: []
    },
    {
      key: 'resource_efficiency',
      label: 'Эффективность ресурсов',
      description: 'Оптимальное использование бюджета',
      icon: 'mdi-chart-line',
      score: 0,
      recommendations: []
    },
    {
      key: 'impact_potential',
      label: 'Потенциал воздействия',
      description: 'Ожидаемое влияние на бизнес',
      icon: 'mdi-trending-up',
      score: 0,
      recommendations: []
    },
    {
      key: 'risk_assessment',
      label: 'Оценка рисков',
      description: 'Управление стратегическими рисками',
      icon: 'mdi-shield-check',
      score: 0,
      recommendations: []
    },
    {
      key: 'timeline_alignment',
      label: 'Временное соответствие',
      description: 'Синхронизация с планами',
      icon: 'mdi-clock-check',
      score: 0,
      recommendations: []
    },
    {
      key: 'stakeholder_support',
      label: 'Поддержка стейкхолдеров',
      description: 'Одобрение ключевых заинтересованных сторон',
      icon: 'mdi-account-group',
      score: 0,
      recommendations: []
    }
  ]

  if (!props.data.metrics) return defaultMetrics

  return defaultMetrics.map(metric => ({
    ...metric,
    ...props.data.metrics[metric.key]
  }))
})

const strategicGoals = computed(() => {
  return props.data.strategic_goals || []
})

const improvementActions = computed(() => {
  return props.data.improvement_actions || []
})

const getAlignmentColor = (score) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

const getAlignmentTextClass = (score) => {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-info'
  if (score >= 40) return 'text-warning'
  return 'text-error'
}

const getAlignmentLabel = (score) => {
  if (score >= 80) return 'Отличное соответствие'
  if (score >= 60) return 'Хорошее соответствие'
  if (score >= 40) return 'Требует улучшения'
  return 'Низкое соответствие'
}

const getAlignmentIcon = (score) => {
  if (score >= 80) return 'mdi-check'
  if (score >= 60) return 'mdi-alert'
  if (score >= 40) return 'mdi-alert-outline'
  return 'mdi-close'
}

const getActionPriorityColor = (priority) => {
  const colors = {
    high: 'error',
    medium: 'warning',
    low: 'info'
  }
  return colors[priority] || 'grey'
}

const getActionPriorityIcon = (priority) => {
  const icons = {
    high: 'mdi-fire',
    medium: 'mdi-alert',
    low: 'mdi-information'
  }
  return icons[priority] || 'mdi-help'
}

const getPriorityLabel = (priority) => {
  const labels = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий'
  }
  return labels[priority] || priority
}

const formatCurrency = (value) => {
  if (!value) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(value)
}

const implementAction = (action) => {
  emit('implement-action', action)
}
</script>

<style scoped>
.gauge-container {
  padding: 16px;
}

.main-gauge {
  margin-bottom: 32px;
}

.gauge-content {
  text-align: center;
}

.gauge-score {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
}

.gauge-label {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  line-height: 1;
  margin-top: 4px;
}

.gauge-status {
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 8px;
}

.metric-card {
  height: 100%;
  transition: transform 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
}

.goal-item {
  padding: 12px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
}
</style>