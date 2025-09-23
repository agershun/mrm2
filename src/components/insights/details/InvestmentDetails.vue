<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Детали инвестиций</span>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="$emit('close')"
        />
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Загрузка деталей...</p>
      </div>

      <div v-else-if="!investment" class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-2">mdi-information-outline</v-icon>
        <p class="text-grey mt-2">Выберите инвестицию для просмотра деталей</p>
      </div>

      <div v-else>
        <!-- Основная информация -->
        <v-row class="mb-4">
          <v-col cols="12" md="8">
            <v-card variant="outlined">
              <v-card-title class="text-subtitle-1">Основная информация</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Название</div>
                    <div class="font-weight-medium">{{ investment.investment_name }}</div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Тип инвестиции</div>
                    <v-chip
                      size="small"
                      :color="getInvestmentTypeColor(investment.investment_type)"
                      variant="tonal"
                    >
                      {{ getInvestmentTypeName(investment.investment_type) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Статус</div>
                    <v-chip
                      size="small"
                      :color="getStatusColor(investment.status)"
                      variant="tonal"
                    >
                      {{ getStatusLabel(investment.status) }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="text-caption text-grey">Приоритет</div>
                    <v-rating
                      :model-value="getPriorityRating(investment.priority)"
                      readonly
                      color="warning"
                      size="small"
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12">
                    <div class="text-caption text-grey">Описание</div>
                    <div class="text-body-2">{{ investment.description || 'Описание не указано' }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card variant="outlined">
              <v-card-title class="text-subtitle-1">Финансовые показатели</v-card-title>
              <v-card-text>
                <div class="mb-3">
                  <div class="text-caption text-grey">Выделенный бюджет</div>
                  <div class="text-h6 font-weight-bold text-primary">
                    {{ formatCurrency(investment.allocated_amount) }}
                  </div>
                </div>
                <div class="mb-3">
                  <div class="text-caption text-grey">Потрачено</div>
                  <div class="text-h6 font-weight-bold">
                    {{ formatCurrency(investment.spent_amount) }}
                  </div>
                  <v-progress-linear
                    :model-value="getSpentPercentage()"
                    :color="getSpentColor()"
                    height="6"
                    rounded
                    class="mt-1"
                  />
                  <div class="text-caption text-grey mt-1">
                    {{ getSpentPercentage() }}% от бюджета
                  </div>
                </div>
                <div class="mb-3">
                  <div class="text-caption text-grey">ROI</div>
                  <div class="text-h6 font-weight-bold" :class="getROIClass()">
                    {{ investment.roi }}%
                  </div>
                </div>
                <div>
                  <div class="text-caption text-grey">Сгенерированный доход</div>
                  <div class="text-h6 font-weight-bold text-success">
                    {{ formatCurrency(investment.revenue_generated) }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Временные рамки -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-subtitle-1">Временные рамки</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="4">
                <div class="text-caption text-grey">Дата начала</div>
                <div class="font-weight-medium">{{ formatDate(investment.start_date) }}</div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-caption text-grey">Дата окончания</div>
                <div class="font-weight-medium">{{ formatDate(investment.end_date) }}</div>
              </v-col>
              <v-col cols="12" sm="4">
                <div class="text-caption text-grey">Продолжительность</div>
                <div class="font-weight-medium">{{ getDuration() }}</div>
              </v-col>
            </v-row>

            <!-- Временная шкала -->
            <div class="mt-4">
              <div class="text-caption text-grey mb-2">Прогресс выполнения</div>
              <v-progress-linear
                :model-value="getTimeProgress()"
                color="info"
                height="8"
                rounded
              />
              <div class="d-flex justify-space-between text-caption text-grey mt-1">
                <span>{{ formatDate(investment.start_date) }}</span>
                <span>{{ getTimeProgress() }}% выполнено</span>
                <span>{{ formatDate(investment.end_date) }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Ответственные -->
        <v-card variant="outlined" class="mb-4">
          <v-card-title class="text-subtitle-1">Команда проекта</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <div class="text-caption text-grey">Руководитель проекта</div>
                <div class="d-flex align-center mt-2">
                  <v-avatar size="32" class="me-3">
                    <v-img v-if="investment.project_manager?.avatar" :src="investment.project_manager.avatar" />
                    <v-icon v-else>mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ investment.project_manager?.name || 'Не назначен' }}</div>
                    <div class="text-caption text-grey">{{ investment.project_manager?.role }}</div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-grey">Бюджет-менеджер</div>
                <div class="d-flex align-center mt-2">
                  <v-avatar size="32" class="me-3">
                    <v-img v-if="investment.budget_manager?.avatar" :src="investment.budget_manager.avatar" />
                    <v-icon v-else>mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ investment.budget_manager?.name || 'Не назначен' }}</div>
                    <div class="text-caption text-grey">{{ investment.budget_manager?.role }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Участники команды -->
            <div v-if="investment.team_members && investment.team_members.length > 0" class="mt-4">
              <div class="text-caption text-grey mb-2">Участники команды</div>
              <v-chip-group>
                <v-chip
                  v-for="member in investment.team_members"
                  :key="member.user_id"
                  size="small"
                  variant="outlined"
                >
                  <v-avatar start size="24">
                    <v-img v-if="member.avatar" :src="member.avatar" />
                    <v-icon v-else size="12">mdi-account</v-icon>
                  </v-avatar>
                  {{ member.name }}
                </v-chip>
              </v-chip-group>
            </div>
          </v-card-text>
        </v-card>

        <!-- Риски и проблемы -->
        <v-card v-if="investment.risks && investment.risks.length > 0" variant="outlined" class="mb-4">
          <v-card-title class="text-subtitle-1">Риски и проблемы</v-card-title>
          <v-card-text>
            <div
              v-for="risk in investment.risks"
              :key="risk.risk_id"
              class="risk-item mb-3 pa-3"
              style="border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 4px;"
            >
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center">
                  <v-icon
                    :color="getRiskSeverityColor(risk.severity)"
                    class="me-2"
                  >
                    {{ getRiskSeverityIcon(risk.severity) }}
                  </v-icon>
                  <span class="font-weight-medium">{{ risk.title }}</span>
                </div>
                <v-chip
                  size="small"
                  :color="getRiskSeverityColor(risk.severity)"
                  variant="tonal"
                >
                  {{ getRiskSeverityLabel(risk.severity) }}
                </v-chip>
              </div>
              <div class="text-body-2 mb-2">{{ risk.description }}</div>
              <div v-if="risk.mitigation_plan" class="text-caption">
                <strong>План смягчения:</strong> {{ risk.mitigation_plan }}
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Ключевые результаты -->
        <v-card v-if="investment.key_results && investment.key_results.length > 0" variant="outlined">
          <v-card-title class="text-subtitle-1">Ключевые результаты</v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="result in investment.key_results"
                :key="result.result_id"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card variant="tonal" class="pa-3">
                  <div class="text-caption text-grey">{{ result.metric_name }}</div>
                  <div class="text-h6 font-weight-bold">{{ result.current_value }}</div>
                  <div class="text-caption">
                    Цель: {{ result.target_value }}
                  </div>
                  <v-progress-linear
                    :model-value="(result.current_value / result.target_value) * 100"
                    :color="getResultProgressColor(result.current_value, result.target_value)"
                    height="4"
                    rounded
                    class="mt-2"
                  />
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  investment: { type: Object, default: () => null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const getInvestmentTypeColor = (type) => {
  const colors = {
    marketing: 'primary',
    technology: 'info',
    infrastructure: 'success',
    research: 'warning',
    training: 'purple'
  }
  return colors[type] || 'grey'
}

const getInvestmentTypeName = (type) => {
  const names = {
    marketing: 'Маркетинг',
    technology: 'Технологии',
    infrastructure: 'Инфраструктура',
    research: 'Исследования',
    training: 'Обучение'
  }
  return names[type] || type
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    planned: 'info',
    completed: 'primary',
    cancelled: 'error',
    paused: 'warning'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Активная',
    planned: 'Запланирована',
    completed: 'Завершена',
    cancelled: 'Отменена',
    paused: 'Приостановлена'
  }
  return labels[status] || status
}

const getPriorityRating = (priority) => {
  const ratings = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
    urgent: 5
  }
  return ratings[priority] || 1
}

const getSpentPercentage = () => {
  if (!props.investment?.allocated_amount || props.investment.allocated_amount === 0) return 0
  return Math.round((props.investment.spent_amount / props.investment.allocated_amount) * 100)
}

const getSpentColor = () => {
  const percentage = getSpentPercentage()
  if (percentage >= 90) return 'error'
  if (percentage >= 75) return 'warning'
  if (percentage >= 50) return 'info'
  return 'success'
}

const getROIClass = () => {
  const roi = props.investment?.roi || 0
  if (roi >= 200) return 'text-success'
  if (roi >= 100) return 'text-info'
  if (roi >= 50) return 'text-warning'
  return 'text-error'
}

const getTimeProgress = () => {
  if (!props.investment?.start_date || !props.investment?.end_date) return 0

  const start = new Date(props.investment.start_date)
  const end = new Date(props.investment.end_date)
  const now = new Date()

  if (now < start) return 0
  if (now > end) return 100

  const total = end - start
  const elapsed = now - start
  return Math.round((elapsed / total) * 100)
}

const getRiskSeverityColor = (severity) => {
  const colors = {
    low: 'success',
    medium: 'warning',
    high: 'error',
    critical: 'error'
  }
  return colors[severity] || 'grey'
}

const getRiskSeverityIcon = (severity) => {
  const icons = {
    low: 'mdi-alert-outline',
    medium: 'mdi-alert',
    high: 'mdi-alert-circle',
    critical: 'mdi-alert-octagon'
  }
  return icons[severity] || 'mdi-help'
}

const getRiskSeverityLabel = (severity) => {
  const labels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критичный'
  }
  return labels[severity] || severity
}

const getResultProgressColor = (current, target) => {
  const percentage = (current / target) * 100
  if (percentage >= 100) return 'success'
  if (percentage >= 75) return 'info'
  if (percentage >= 50) return 'warning'
  return 'error'
}

const formatCurrency = (value) => {
  if (!value) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

const getDuration = () => {
  if (!props.investment?.start_date || !props.investment?.end_date) return '—'

  const start = new Date(props.investment.start_date)
  const end = new Date(props.investment.end_date)
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

  if (diffDays < 7) return `${diffDays} дн.`
  if (diffDays < 30) return `${Math.round(diffDays / 7)} нед.`
  return `${Math.round(diffDays / 30)} мес.`
}
</script>