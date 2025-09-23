<template>
  <div class="data-quality-gauge">
    <v-card>
      <v-card-title>
        <div class="d-flex justify-space-between align-center w-100">
          <span>Качество данных</span>
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
          <p class="mt-2">Анализ качества данных...</p>
        </div>

        <div v-else class="gauge-container">
          <!-- Основной индикатор -->
          <div class="main-gauge text-center">
            <v-progress-circular
              :model-value="overallScore"
              :color="getScoreColor(overallScore)"
              :size="180"
              :width="12"
              class="gauge-main"
            >
              <div class="gauge-content">
                <div class="gauge-score">{{ overallScore }}</div>
                <div class="gauge-label">из 100</div>
                <div class="gauge-status">{{ getScoreLabel(overallScore) }}</div>
              </div>
            </v-progress-circular>
          </div>

          <!-- Детальные метрики -->
          <v-row class="mt-6">
            <v-col
              v-for="metric in qualityMetrics"
              :key="metric.key"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card variant="outlined" class="metric-card">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-3">
                    <v-icon
                      :color="getScoreColor(metric.score)"
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
                      <div class="text-h6 font-weight-bold" :class="getScoreTextClass(metric.score)">
                        {{ metric.score }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ metric.description }}
                      </div>
                    </div>

                    <v-progress-circular
                      :model-value="metric.score"
                      :color="getScoreColor(metric.score)"
                      size="48"
                      width="4"
                    >
                      <v-icon
                        :color="getScoreColor(metric.score)"
                        size="16"
                      >
                        {{ getScoreIcon(metric.score) }}
                      </v-icon>
                    </v-progress-circular>
                  </div>

                  <!-- Тренд -->
                  <div class="mt-3 d-flex align-center">
                    <v-icon
                      size="14"
                      :color="getTrendColor(metric.trend)"
                      :icon="getTrendIcon(metric.trend)"
                      class="me-1"
                    />
                    <span
                      class="text-caption"
                      :class="getTrendTextClass(metric.trend)"
                    >
                      {{ Math.abs(metric.trend) }}%
                    </span>
                    <span class="text-caption text-grey ms-1">
                      за последние 30 дней
                    </span>
                  </div>

                  <!-- Детали проблем -->
                  <div v-if="metric.issues && metric.issues.length > 0" class="mt-3">
                    <v-divider class="mb-2" />
                    <div class="text-caption text-grey mb-1">Основные проблемы:</div>
                    <div
                      v-for="issue in metric.issues.slice(0, 2)"
                      :key="issue"
                      class="text-caption text-error mb-1"
                    >
                      • {{ issue }}
                    </div>
                    <div v-if="metric.issues.length > 2" class="text-caption text-grey">
                      и еще {{ metric.issues.length - 2 }} проблем...
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Сводка по источникам данных -->
          <v-card variant="outlined" class="mt-6">
            <v-card-title class="text-subtitle-1">Качество по источникам данных</v-card-title>
            <v-card-text>
              <v-row>
                <v-col
                  v-for="source in dataSources"
                  :key="source.name"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <div class="source-item pa-3 rounded">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <div class="d-flex align-center">
                        <v-avatar
                          size="24"
                          :color="getSourceColor(source.type)"
                          class="me-2"
                        >
                          <v-icon size="12" color="white">
                            {{ getSourceIcon(source.type) }}
                          </v-icon>
                        </v-avatar>
                        <span class="text-body-2 font-weight-medium">{{ source.name }}</span>
                      </div>
                      <v-chip
                        size="x-small"
                        :color="getScoreColor(source.quality_score)"
                        variant="tonal"
                      >
                        {{ source.quality_score }}
                      </v-chip>
                    </div>

                    <v-progress-linear
                      :model-value="source.quality_score"
                      :color="getScoreColor(source.quality_score)"
                      height="6"
                      rounded
                      class="mb-2"
                    />

                    <div class="d-flex justify-space-between text-caption text-grey">
                      <span>{{ source.records_count }} записей</span>
                      <span>Обновлено {{ formatRelativeTime(source.last_updated) }}</span>
                    </div>
                  </div>
                </v-col>
              </v-row>
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

const emit = defineEmits(['refresh'])

const overallScore = computed(() => {
  return props.data.overall_score || 0
})

const qualityMetrics = computed(() => {
  const defaultMetrics = [
    {
      key: 'completeness',
      label: 'Полнота данных',
      description: 'Процент заполненных полей',
      icon: 'mdi-database-check',
      score: 0,
      trend: 0,
      issues: []
    },
    {
      key: 'accuracy',
      label: 'Точность',
      description: 'Корректность значений',
      icon: 'mdi-target',
      score: 0,
      trend: 0,
      issues: []
    },
    {
      key: 'consistency',
      label: 'Согласованность',
      description: 'Единообразие форматов',
      icon: 'mdi-sync',
      score: 0,
      trend: 0,
      issues: []
    },
    {
      key: 'timeliness',
      label: 'Актуальность',
      description: 'Своевременность обновлений',
      icon: 'mdi-clock-check',
      score: 0,
      trend: 0,
      issues: []
    },
    {
      key: 'validity',
      label: 'Валидность',
      description: 'Соответствие правилам',
      icon: 'mdi-shield-check',
      score: 0,
      trend: 0,
      issues: []
    },
    {
      key: 'uniqueness',
      label: 'Уникальность',
      description: 'Отсутствие дублей',
      icon: 'mdi-fingerprint',
      score: 0,
      trend: 0,
      issues: []
    }
  ]

  if (!props.data.metrics) return defaultMetrics

  return defaultMetrics.map(metric => ({
    ...metric,
    ...props.data.metrics[metric.key]
  }))
})

const dataSources = computed(() => {
  return props.data.sources || []
})

const getScoreColor = (score) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  if (score >= 40) return 'orange'
  return 'error'
}

const getScoreTextClass = (score) => {
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-warning'
  if (score >= 40) return 'text-orange'
  return 'text-error'
}

const getScoreLabel = (score) => {
  if (score >= 80) return 'Отлично'
  if (score >= 60) return 'Хорошо'
  if (score >= 40) return 'Удовлетворительно'
  return 'Требует внимания'
}

const getScoreIcon = (score) => {
  if (score >= 80) return 'mdi-check'
  if (score >= 60) return 'mdi-alert'
  if (score >= 40) return 'mdi-alert-outline'
  return 'mdi-close'
}

const getTrendColor = (trend) => {
  if (trend > 0) return 'success'
  if (trend < 0) return 'error'
  return 'grey'
}

const getTrendTextClass = (trend) => {
  if (trend > 0) return 'text-success'
  if (trend < 0) return 'text-error'
  return 'text-grey'
}

const getTrendIcon = (trend) => {
  if (trend > 0) return 'mdi-trending-up'
  if (trend < 0) return 'mdi-trending-down'
  return 'mdi-trending-neutral'
}

const getSourceColor = (type) => {
  const colors = {
    database: 'primary',
    api: 'info',
    file: 'success',
    stream: 'warning',
    manual: 'purple'
  }
  return colors[type] || 'grey'
}

const getSourceIcon = (type) => {
  const icons = {
    database: 'mdi-database',
    api: 'mdi-api',
    file: 'mdi-file',
    stream: 'mdi-stream',
    manual: 'mdi-account'
  }
  return icons[type] || 'mdi-help'
}

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} дн. назад`
  if (diffHours > 0) return `${diffHours} ч. назад`
  return 'только что'
}
</script>

<style scoped>
.gauge-container {
  padding: 16px;
}

.main-gauge {
  margin-bottom: 32px;
}

.gauge-main {
  position: relative;
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

.source-item {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  transition: all 0.2s ease;
}

.source-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.3);
}
</style>