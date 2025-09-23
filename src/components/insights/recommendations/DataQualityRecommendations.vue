<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Рекомендации по улучшению качества данных</span>
        <v-btn
          icon="mdi-refresh"
          size="small"
          variant="text"
          @click="$emit('refresh')"
        />
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Генерация рекомендаций...</p>
      </div>

      <div v-else-if="!recommendations || recommendations.length === 0" class="text-center pa-8">
        <v-icon size="64" color="success">mdi-check-circle</v-icon>
        <p class="text-success mt-2">Качество данных на высоком уровне!</p>
        <p class="text-grey">Дополнительные улучшения не требуются</p>
      </div>

      <div v-else>
        <!-- Общие метрики улучшений -->
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="primary" size="32" class="mb-2">mdi-target</v-icon>
              <div class="text-h6 font-weight-bold">{{ potentialImprovement }}%</div>
              <div class="text-caption text-grey">Потенциальное улучшение</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="info" size="32" class="mb-2">mdi-clock</v-icon>
              <div class="text-h6 font-weight-bold">{{ estimatedTime }}</div>
              <div class="text-caption text-grey">Время на реализацию</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="warning" size="32" class="mb-2">mdi-currency-rub</v-icon>
              <div class="text-h6 font-weight-bold">{{ formatCurrency(estimatedCost) }}</div>
              <div class="text-caption text-grey">Примерная стоимость</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon color="success" size="32" class="mb-2">mdi-chart-line</v-icon>
              <div class="text-h6 font-weight-bold">{{ priorityRecommendations }}</div>
              <div class="text-caption text-grey">Приоритетных</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Категории рекомендаций -->
        <div class="recommendations-container">
          <div
            v-for="category in categorizedRecommendations"
            :key="category.name"
            class="mb-4"
          >
            <div class="d-flex align-center mb-3">
              <v-icon :color="category.color" class="me-2">{{ category.icon }}</v-icon>
              <span class="text-h6 font-weight-medium">{{ category.name }}</span>
              <v-spacer />
              <v-chip size="small" :color="category.color" variant="tonal">
                {{ category.recommendations.length }} рекомендаций
              </v-chip>
            </div>

            <v-row>
              <v-col
                v-for="recommendation in category.recommendations"
                :key="recommendation.id"
                cols="12"
                lg="6"
              >
                <v-card
                  variant="outlined"
                  class="recommendation-card"
                  :class="getRecommendationClass(recommendation.priority)"
                  @click="selectRecommendation(recommendation)"
                >
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center justify-space-between mb-3">
                      <div class="d-flex align-center">
                        <v-avatar
                          size="32"
                          :color="getPriorityColor(recommendation.priority)"
                          class="me-3"
                        >
                          <v-icon size="16" color="white">
                            {{ getPriorityIcon(recommendation.priority) }}
                          </v-icon>
                        </v-avatar>
                        <div>
                          <div class="font-weight-medium">{{ recommendation.title }}</div>
                          <div class="text-caption text-grey">
                            {{ getImpactLabel(recommendation.impact) }} воздействие
                          </div>
                        </div>
                      </div>

                      <div class="d-flex align-center">
                        <v-chip
                          size="small"
                          :color="getPriorityColor(recommendation.priority)"
                          variant="tonal"
                          class="me-2"
                        >
                          {{ getPriorityLabel(recommendation.priority) }}
                        </v-chip>
                        <v-rating
                          :model-value="recommendation.complexity"
                          readonly
                          color="warning"
                          size="x-small"
                          density="compact"
                        />
                      </div>
                    </div>

                    <p class="text-body-2 mb-3">{{ recommendation.description }}</p>

                    <!-- Ожидаемые результаты -->
                    <div class="mb-3">
                      <div class="text-caption text-grey mb-2">Ожидаемые результаты:</div>
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

                    <!-- Метрики улучшения -->
                    <div class="mb-3">
                      <v-row>
                        <v-col cols="6">
                          <div class="text-caption text-grey">Улучшение качества</div>
                          <div class="font-weight-medium text-success">
                            +{{ recommendation.quality_improvement }}%
                          </div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-grey">Время выполнения</div>
                          <div class="font-weight-medium">
                            {{ recommendation.estimated_time }}
                          </div>
                        </v-col>
                      </v-row>
                    </div>

                    <!-- Шаги реализации -->
                    <div v-if="recommendation.implementation_steps" class="mb-3">
                      <div class="text-caption text-grey mb-2">Основные шаги:</div>
                      <ol class="implementation-steps">
                        <li
                          v-for="step in recommendation.implementation_steps.slice(0, 3)"
                          :key="step"
                          class="text-caption mb-1"
                        >
                          {{ step }}
                        </li>
                        <li v-if="recommendation.implementation_steps.length > 3" class="text-caption text-grey">
                          ... еще {{ recommendation.implementation_steps.length - 3 }} шагов
                        </li>
                      </ol>
                    </div>

                    <!-- Действия -->
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-btn
                          size="small"
                          color="primary"
                          @click.stop="implementRecommendation(recommendation)"
                        >
                          Реализовать
                        </v-btn>
                        <v-btn
                          size="small"
                          variant="text"
                          @click.stop="viewDetails(recommendation)"
                        >
                          Подробнее
                        </v-btn>
                      </div>

                      <div class="d-flex align-center">
                        <v-btn
                          icon="mdi-bookmark-outline"
                          size="small"
                          variant="text"
                          @click.stop="saveRecommendation(recommendation)"
                        />
                        <v-btn
                          icon="mdi-share-variant"
                          size="small"
                          variant="text"
                          @click.stop="shareRecommendation(recommendation)"
                        />
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Автоматизированные рекомендации -->
        <v-card variant="outlined" class="mt-6">
          <v-card-title class="text-subtitle-1">
            <v-icon color="primary" class="me-2">mdi-robot</v-icon>
            Автоматизация процессов
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-3">
              <div>
                <div class="font-weight-medium">Настроить автоматические проверки качества</div>
                <div class="text-caption text-grey">
                  Ежедневная валидация данных и уведомления о проблемах
                </div>
              </div>
              <v-btn color="primary" size="small">
                Настроить
              </v-btn>
            </div>

            <v-divider class="my-3" />

            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="font-weight-medium">Включить автоматическое исправление ошибок</div>
                <div class="text-caption text-grey">
                  Исправление типичных проблем без участия пользователя
                </div>
              </div>
              <v-switch
                v-model="autoFixEnabled"
                color="primary"
                @change="toggleAutoFix"
              />
            </div>
          </v-card-text>
        </v-card>
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
  'refresh', 'recommendation-selected', 'implement-recommendation',
  'view-details', 'save-recommendation', 'share-recommendation', 'toggle-auto-fix'
])

const autoFixEnabled = ref(false)
const selectedRecommendation = ref(null)

const categorizedRecommendations = computed(() => {
  const categories = {}

  props.recommendations.forEach(rec => {
    const category = rec.category || 'general'
    if (!categories[category]) {
      categories[category] = {
        name: getCategoryName(category),
        icon: getCategoryIcon(category),
        color: getCategoryColor(category),
        recommendations: []
      }
    }
    categories[category].recommendations.push(rec)
  })

  return Object.values(categories).sort((a, b) => {
    // Сортируем по приоритету категорий
    const priorityOrder = ['data_validation', 'data_completeness', 'data_consistency', 'automation']
    const aIndex = priorityOrder.indexOf(Object.keys(categories).find(key => categories[key] === a))
    const bIndex = priorityOrder.indexOf(Object.keys(categories).find(key => categories[key] === b))
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
  })
})

const potentialImprovement = computed(() => {
  if (!props.recommendations.length) return 0
  return Math.round(
    props.recommendations.reduce((sum, rec) => sum + (rec.quality_improvement || 0), 0) / props.recommendations.length
  )
})

const estimatedTime = computed(() => {
  const totalHours = props.recommendations.reduce((sum, rec) => {
    const time = rec.estimated_time || '0h'
    const hours = parseInt(time.replace(/[^\d]/g, '')) || 0
    return sum + hours
  }, 0)

  if (totalHours < 24) return `${totalHours}ч`
  if (totalHours < 168) return `${Math.round(totalHours / 24)}д`
  return `${Math.round(totalHours / 168)}нед`
})

const estimatedCost = computed(() => {
  return props.recommendations.reduce((sum, rec) => sum + (rec.estimated_cost || 0), 0)
})

const priorityRecommendations = computed(() => {
  return props.recommendations.filter(rec => rec.priority === 'high' || rec.priority === 'critical').length
})

const getCategoryName = (category) => {
  const names = {
    data_validation: 'Валидация данных',
    data_completeness: 'Полнота данных',
    data_consistency: 'Согласованность',
    data_accuracy: 'Точность',
    automation: 'Автоматизация',
    performance: 'Производительность',
    general: 'Общие'
  }
  return names[category] || category
}

const getCategoryIcon = (category) => {
  const icons = {
    data_validation: 'mdi-shield-check',
    data_completeness: 'mdi-database-plus',
    data_consistency: 'mdi-sync',
    data_accuracy: 'mdi-target',
    automation: 'mdi-robot',
    performance: 'mdi-speedometer',
    general: 'mdi-lightbulb'
  }
  return icons[category] || 'mdi-help'
}

const getCategoryColor = (category) => {
  const colors = {
    data_validation: 'primary',
    data_completeness: 'success',
    data_consistency: 'info',
    data_accuracy: 'warning',
    automation: 'purple',
    performance: 'orange',
    general: 'grey'
  }
  return colors[category] || 'grey'
}

const getPriorityColor = (priority) => {
  const colors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return colors[priority] || 'grey'
}

const getPriorityIcon = (priority) => {
  const icons = {
    critical: 'mdi-alert-circle',
    high: 'mdi-alert',
    medium: 'mdi-information',
    low: 'mdi-check-circle'
  }
  return icons[priority] || 'mdi-help'
}

const getPriorityLabel = (priority) => {
  const labels = {
    critical: 'Критичный',
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий'
  }
  return labels[priority] || priority
}

const getImpactLabel = (impact) => {
  const labels = {
    high: 'Высокое',
    medium: 'Среднее',
    low: 'Низкое'
  }
  return labels[impact] || impact
}

const getRecommendationClass = (priority) => {
  return `recommendation-${priority}`
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(value)
}

const selectRecommendation = (recommendation) => {
  selectedRecommendation.value = selectedRecommendation.value?.id === recommendation.id ? null : recommendation
  emit('recommendation-selected', selectedRecommendation.value)
}

const implementRecommendation = (recommendation) => {
  emit('implement-recommendation', recommendation)
}

const viewDetails = (recommendation) => {
  emit('view-details', recommendation)
}

const saveRecommendation = (recommendation) => {
  emit('save-recommendation', recommendation)
}

const shareRecommendation = (recommendation) => {
  emit('share-recommendation', recommendation)
}

const toggleAutoFix = () => {
  emit('toggle-auto-fix', autoFixEnabled.value)
}
</script>

<style scoped>
.recommendation-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.recommendation-critical {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.recommendation-high {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.recommendation-medium {
  border-left: 4px solid rgb(var(--v-theme-info));
}

.recommendation-low {
  border-left: 4px solid rgb(var(--v-theme-success));
}

.implementation-steps {
  margin: 0;
  padding-left: 16px;
}

.implementation-steps li {
  margin-bottom: 4px;
}

.recommendations-container {
  max-height: 800px;
  overflow-y: auto;
}
</style>