<template>
  <div class="media-plan-analytics">
    <v-row>
      <!-- Общая статистика -->
      <v-col cols="12">
        <v-card>
          <v-card-title>Общая статистика</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-primary">{{ totalPlans }}</div>
                  <div class="text-caption text-grey">Всего планов</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-success">{{ activePlans }}</div>
                  <div class="text-caption text-grey">Активных планов</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-info">{{ formatCurrency(totalBudget) }}</div>
                  <div class="text-caption text-grey">Общий бюджет</div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="text-center">
                  <div class="text-h4 font-weight-bold text-warning">{{ averageProgress }}%</div>
                  <div class="text-caption text-grey">Средний прогресс</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- График распределения по статусам -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Распределение по статусам</v-card-title>
          <v-card-text>
            <div id="status-chart" style="height: 300px;">
              <!-- Здесь будет круговая диаграмма ECharts -->
              <div class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-2">mdi-chart-pie</v-icon>
                <p class="text-grey mt-2">Диаграмма статусов</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- График бюджетов по месяцам -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Бюджеты по месяцам</v-card-title>
          <v-card-text>
            <div id="budget-chart" style="height: 300px;">
              <!-- Здесь будет столбчатая диаграмма ECharts -->
              <div class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-2">mdi-chart-bar</v-icon>
                <p class="text-grey mt-2">Диаграмма бюджетов</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Популярные каналы -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Популярные каналы</v-card-title>
          <v-card-text>
            <div v-for="channel in channelStats" :key="channel.name" class="mb-3">
              <div class="d-flex justify-space-between align-center mb-1">
                <div class="d-flex align-center">
                  <v-avatar size="24" :color="getChannelColor(channel.name)" class="me-2">
                    <v-icon size="16" color="white">{{ getChannelIcon(channel.name) }}</v-icon>
                  </v-avatar>
                  <span class="text-body-2">{{ channel.name }}</span>
                </div>
                <div class="text-right">
                  <div class="text-body-2 font-weight-medium">{{ channel.count }} планов</div>
                  <div class="text-caption text-grey">{{ formatCurrency(channel.budget) }}</div>
                </div>
              </div>
              <v-progress-linear
                :model-value="channel.percentage"
                :color="getChannelColor(channel.name)"
                height="6"
                rounded
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Производительность планов -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Производительность планов</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="plan in topPerformingPlans"
                :key="plan.plan_id"
              >
                <template #prepend>
                  <v-avatar :color="getProgressColor(plan.progress)">
                    <span class="text-caption font-weight-bold">{{ plan.progress }}%</span>
                  </v-avatar>
                </template>

                <v-list-item-title>{{ plan.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatCurrency(plan.total_budget) }} • {{ plan.channels.length }} каналов
                </v-list-item-subtitle>

                <template #append>
                  <v-chip size="small" :color="getStatusColor(plan.status)">
                    {{ getStatusLabel(plan.status) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Временная шкала -->
      <v-col cols="12">
        <v-card>
          <v-card-title>Временная шкала планов</v-card-title>
          <v-card-text>
            <div class="timeline-container">
              <div
                v-for="plan in timelinePlans"
                :key="plan.plan_id"
                class="timeline-item mb-4"
              >
                <div class="d-flex align-center mb-2">
                  <v-avatar size="32" :color="getStatusColor(plan.status)" class="me-3">
                    <v-icon size="16" color="white">mdi-calendar</v-icon>
                  </v-avatar>
                  <div>
                    <h4 class="text-subtitle-1">{{ plan.name }}</h4>
                    <p class="text-caption text-grey mb-0">
                      {{ formatDate(plan.start_date) }} - {{ formatDate(plan.end_date) }}
                    </p>
                  </div>
                  <v-spacer />
                  <v-chip size="small" :color="getStatusColor(plan.status)">
                    {{ getStatusLabel(plan.status) }}
                  </v-chip>
                </div>

                <!-- Прогресс-бар плана -->
                <div class="timeline-progress">
                  <v-progress-linear
                    :model-value="plan.progress"
                    :color="getProgressColor(plan.progress)"
                    height="8"
                    rounded
                  />
                  <div class="d-flex justify-space-between align-center mt-1">
                    <span class="text-caption">{{ plan.progress }}% выполнено</span>
                    <span class="text-caption font-weight-medium">{{ formatCurrency(plan.total_budget) }}</span>
                  </div>
                </div>

                <!-- Каналы в плане -->
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <v-chip
                    v-for="channel in plan.channels"
                    :key="channel"
                    size="x-small"
                    :color="getChannelColor(channel)"
                    variant="tonal"
                  >
                    {{ channel }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mediaplans: { type: Array, default: () => [] }
})

const totalPlans = computed(() => props.mediaplans.length)

const activePlans = computed(() =>
  props.mediaplans.filter(plan => plan.status === 'active').length
)

const totalBudget = computed(() =>
  props.mediaplans.reduce((sum, plan) => sum + (plan.total_budget || 0), 0)
)

const averageProgress = computed(() => {
  if (props.mediaplans.length === 0) return 0
  const totalProgress = props.mediaplans.reduce((sum, plan) => sum + (plan.progress || 0), 0)
  return Math.round(totalProgress / props.mediaplans.length)
})

const channelStats = computed(() => {
  const stats = {}
  const totalChannels = props.mediaplans.reduce((sum, plan) => sum + plan.channels.length, 0)

  props.mediaplans.forEach(plan => {
    plan.channels.forEach(channel => {
      if (!stats[channel]) {
        stats[channel] = { name: channel, count: 0, budget: 0 }
      }
      stats[channel].count++
      stats[channel].budget += plan.total_budget / plan.channels.length
    })
  })

  return Object.values(stats)
    .map(stat => ({
      ...stat,
      percentage: totalChannels > 0 ? (stat.count / totalChannels) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const topPerformingPlans = computed(() =>
  [...props.mediaplans]
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .slice(0, 5)
)

const timelinePlans = computed(() =>
  [...props.mediaplans]
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
)

const getStatusColor = (status) => {
  const colors = {
    draft: 'grey',
    active: 'success',
    paused: 'warning',
    completed: 'info',
    cancelled: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    draft: 'Черновик',
    active: 'Активный',
    paused: 'Приостановлен',
    completed: 'Завершен',
    cancelled: 'Отменен'
  }
  return labels[status] || status
}

const getProgressColor = (progress) => {
  if (progress >= 80) return 'success'
  if (progress >= 50) return 'warning'
  return 'primary'
}

const getChannelColor = (channel) => {
  const colors = {
    'Google Ads': 'primary',
    'Yandex Direct': 'warning',
    'Facebook': 'blue',
    'Instagram': 'purple',
    'YouTube': 'red',
    'VKontakte': 'blue-grey',
    'Telegram': 'cyan',
    'Email': 'orange'
  }
  return colors[channel] || 'grey'
}

const getChannelIcon = (channel) => {
  const icons = {
    'Google Ads': 'mdi-google',
    'Yandex Direct': 'mdi-yandex',
    'Facebook': 'mdi-facebook',
    'Instagram': 'mdi-instagram',
    'YouTube': 'mdi-youtube',
    'VKontakte': 'mdi-vk',
    'Telegram': 'mdi-telegram',
    'Email': 'mdi-email'
  }
  return icons[channel] || 'mdi-bullhorn'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}
</script>

<style scoped>
.timeline-container {
  position: relative;
}

.timeline-item {
  padding: 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface));
}

.timeline-progress {
  margin-top: 12px;
}

.gap-2 {
  gap: 8px;
}
</style>