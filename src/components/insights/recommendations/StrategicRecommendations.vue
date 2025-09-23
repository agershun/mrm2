<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Стратегические рекомендации</span>
        <v-btn-toggle v-model="recommendationType" mandatory size="small">
          <v-btn value="ai" size="small">ИИ анализ</v-btn>
          <v-btn value="expert" size="small">Экспертные</v-btn>
          <v-btn value="benchmark" size="small">Бенчмарк</v-btn>
        </v-btn-toggle>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Анализ данных и генерация рекомендаций...</p>
      </div>

      <div v-else-if="!recommendations || recommendations.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-2">mdi-lightbulb-outline</v-icon>
        <p class="text-grey mt-2">Нет доступных рекомендаций</p>
      </div>

      <div v-else>
        <!-- Сводка рекомендаций -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-card variant="tonal" color="success" class="pa-3">
              <div class="text-h6 font-weight-bold">{{ getRecommendationsCount('high') }}</div>
              <div class="text-caption">Высокий приоритет</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="tonal" color="warning" class="pa-3">
              <div class="text-h6 font-weight-bold">{{ getRecommendationsCount('medium') }}</div>
              <div class="text-caption">Средний приоритет</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="tonal" color="info" class="pa-3">
              <div class="text-h6 font-weight-bold">{{ getRecommendationsCount('low') }}</div>
              <div class="text-caption">Низкий приоритет</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="tonal" color="primary" class="pa-3">
              <div class="text-h6 font-weight-bold">{{ formatCurrency(getTotalImpact()) }}</div>
              <div class="text-caption">Потенциальный эффект</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Список рекомендаций -->
        <v-expansion-panels variant="accordion">
          <v-expansion-panel
            v-for="recommendation in filteredRecommendations"
            :key="recommendation.recommendation_id"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center w-100">
                <v-avatar
                  size="32"
                  :color="getPriorityColor(recommendation.priority)"
                  class="me-3"
                >
                  <v-icon color="white" size="16">
                    {{ getPriorityIcon(recommendation.priority) }}
                  </v-icon>
                </v-avatar>

                <div class="flex-grow-1">
                  <div class="font-weight-medium">{{ recommendation.title }}</div>
                  <div class="text-caption text-grey">{{ recommendation.category }}</div>
                </div>

                <div class="text-right me-4">
                  <v-chip
                    size="small"
                    :color="getImpactColor(recommendation.expected_impact)"
                    variant="tonal"
                  >
                    {{ formatCurrency(recommendation.expected_impact) }}
                  </v-chip>
                  <div class="text-caption text-grey mt-1">
                    {{ recommendation.timeframe }}
                  </div>
                </div>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="8">
                  <!-- Описание рекомендации -->
                  <div class="mb-4">
                    <div class="text-subtitle-2 mb-2">Описание проблемы</div>
                    <div class="text-body-2">{{ recommendation.description }}</div>
                  </div>

                  <!-- Рекомендуемые действия -->
                  <div class="mb-4">
                    <div class="text-subtitle-2 mb-2">Рекомендуемые действия</div>
                    <v-list density="compact">
                      <v-list-item
                        v-for="(action, index) in recommendation.actions"
                        :key="index"
                        class="px-0"
                      >
                        <template #prepend>
                          <v-icon color="primary" size="20">mdi-check-circle</v-icon>
                        </template>
                        <v-list-item-title class="text-body-2">{{ action }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </div>

                  <!-- Ожидаемые результаты -->
                  <div class="mb-4">
                    <div class="text-subtitle-2 mb-2">Ожидаемые результаты</div>
                    <v-chip-group>
                      <v-chip
                        v-for="benefit in recommendation.expected_benefits"
                        :key="benefit"
                        size="small"
                        color="success"
                        variant="tonal"
                      >
                        {{ benefit }}
                      </v-chip>
                    </v-chip-group>
                  </div>

                  <!-- Связанные инвестиции -->
                  <div v-if="recommendation.related_investments && recommendation.related_investments.length > 0" class="mb-4">
                    <div class="text-subtitle-2 mb-2">Связанные инвестиции</div>
                    <div class="d-flex flex-wrap gap-2">
                      <v-chip
                        v-for="investment in recommendation.related_investments"
                        :key="investment.investment_id"
                        size="small"
                        variant="outlined"
                        @click="$emit('investment-selected', investment)"
                      >
                        {{ investment.name }}
                      </v-chip>
                    </div>
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <!-- Метрики рекомендации -->
                  <v-card variant="outlined" class="pa-3 mb-3">
                    <div class="text-subtitle-2 mb-3">Метрики воздействия</div>

                    <div class="mb-3">
                      <div class="text-caption text-grey">Финансовый эффект</div>
                      <div class="text-h6 font-weight-bold text-success">
                        {{ formatCurrency(recommendation.expected_impact) }}
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="text-caption text-grey">Сложность реализации</div>
                      <v-rating
                        :model-value="recommendation.complexity_score"
                        readonly
                        color="warning"
                        size="small"
                        density="compact"
                      />
                    </div>

                    <div class="mb-3">
                      <div class="text-caption text-grey">Уверенность в прогнозе</div>
                      <v-progress-linear
                        :model-value="recommendation.confidence_score"
                        color="info"
                        height="6"
                        rounded
                      />
                      <div class="text-caption text-grey mt-1">
                        {{ recommendation.confidence_score }}%
                      </div>
                    </div>

                    <div>
                      <div class="text-caption text-grey">Срок реализации</div>
                      <div class="font-weight-medium">{{ recommendation.timeframe }}</div>
                    </div>
                  </v-card>

                  <!-- Источник рекомендации -->
                  <v-card variant="outlined" class="pa-3">
                    <div class="text-subtitle-2 mb-2">Источник</div>
                    <div class="d-flex align-center mb-2">
                      <v-icon :color="getSourceColor(recommendation.source_type)" class="me-2">
                        {{ getSourceIcon(recommendation.source_type) }}
                      </v-icon>
                      <span class="text-body-2">{{ getSourceLabel(recommendation.source_type) }}</span>
                    </div>
                    <div class="text-caption text-grey">
                      Сгенерировано: {{ formatDate(recommendation.generated_at) }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Действия -->
              <v-divider class="my-4" />
              <div class="d-flex justify-space-between align-center">
                <div>
                  <v-btn
                    variant="outlined"
                    size="small"
                    @click="scheduleRecommendation(recommendation)"
                  >
                    <v-icon start>mdi-calendar-plus</v-icon>
                    Запланировать
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    size="small"
                    class="ms-2"
                    @click="shareRecommendation(recommendation)"
                  >
                    <v-icon start>mdi-share</v-icon>
                    Поделиться
                  </v-btn>
                </div>
                <div>
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="small"
                    @click="dismissRecommendation(recommendation)"
                  >
                    Отклонить
                  </v-btn>
                  <v-btn
                    color="primary"
                    size="small"
                    class="ms-2"
                    @click="implementRecommendation(recommendation)"
                  >
                    Реализовать
                  </v-btn>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  recommendations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits([
  'recommendation-implemented',
  'recommendation-dismissed',
  'recommendation-scheduled',
  'recommendation-shared',
  'investment-selected'
])

const recommendationType = ref('ai')

const filteredRecommendations = computed(() => {
  return props.recommendations.filter(rec => rec.source_type === recommendationType.value)
})

const getRecommendationsCount = (priority) => {
  return filteredRecommendations.value.filter(rec => rec.priority === priority).length
}

const getTotalImpact = () => {
  return filteredRecommendations.value.reduce((sum, rec) => sum + (rec.expected_impact || 0), 0)
}

const getPriorityColor = (priority) => {
  const colors = {
    high: 'error',
    medium: 'warning',
    low: 'success'
  }
  return colors[priority] || 'grey'
}

const getPriorityIcon = (priority) => {
  const icons = {
    high: 'mdi-fire',
    medium: 'mdi-alert',
    low: 'mdi-information'
  }
  return icons[priority] || 'mdi-help'
}

const getImpactColor = (impact) => {
  if (impact >= 1000000) return 'success'
  if (impact >= 500000) return 'info'
  if (impact >= 100000) return 'warning'
  return 'grey'
}

const getSourceColor = (sourceType) => {
  const colors = {
    ai: 'primary',
    expert: 'success',
    benchmark: 'info'
  }
  return colors[sourceType] || 'grey'
}

const getSourceIcon = (sourceType) => {
  const icons = {
    ai: 'mdi-robot',
    expert: 'mdi-account-tie',
    benchmark: 'mdi-chart-line'
  }
  return icons[sourceType] || 'mdi-help'
}

const getSourceLabel = (sourceType) => {
  const labels = {
    ai: 'ИИ анализ данных',
    expert: 'Экспертная оценка',
    benchmark: 'Бенчмарк анализ'
  }
  return labels[sourceType] || sourceType
}

const implementRecommendation = (recommendation) => {
  emit('recommendation-implemented', recommendation)
}

const dismissRecommendation = (recommendation) => {
  emit('recommendation-dismissed', recommendation)
}

const scheduleRecommendation = (recommendation) => {
  emit('recommendation-scheduled', recommendation)
}

const shareRecommendation = (recommendation) => {
  emit('recommendation-shared', recommendation)
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

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>