<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Топ инвестиции</span>
        <div class="d-flex align-center">
          <v-btn-toggle v-model="sortBy" mandatory size="small" class="me-2">
            <v-btn value="roi" size="small">По ROI</v-btn>
            <v-btn value="amount" size="small">По сумме</v-btn>
            <v-btn value="performance" size="small">По результату</v-btn>
          </v-btn-toggle>
          <v-btn
            icon="mdi-refresh"
            size="small"
            variant="text"
            @click="$emit('refresh')"
          />
        </div>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Загрузка инвестиций...</p>
      </div>

      <div v-else-if="!investments || investments.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-2">mdi-chart-line-variant</v-icon>
        <p class="text-grey mt-2">Нет данных для отображения</p>
      </div>

      <v-data-table
        v-else
        :headers="headers"
        :items="sortedInvestments"
        :items-per-page="itemsPerPage"
        :loading="loading"
        density="compact"
        @click:row="handleRowClick"
      >
        <template #item.investment_name="{ item }">
          <div class="d-flex align-center">
            <v-avatar
              size="32"
              :color="getInvestmentTypeColor(item.investment_type)"
              class="me-3"
            >
              <v-icon size="16" color="white">
                {{ getInvestmentTypeIcon(item.investment_type) }}
              </v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.investment_name }}</div>
              <div class="text-caption text-grey">
                {{ getInvestmentTypeName(item.investment_type) }}
              </div>
            </div>
          </div>
        </template>

        <template #item.allocated_amount="{ item }">
          <div class="text-right">
            <div class="font-weight-medium">{{ formatCurrency(item.allocated_amount) }}</div>
            <div class="text-caption text-grey">
              из {{ formatCurrency(item.total_budget) }}
            </div>
          </div>
        </template>

        <template #item.spent_amount="{ item }">
          <div class="text-right">
            <div class="font-weight-medium">{{ formatCurrency(item.spent_amount) }}</div>
            <v-progress-linear
              :model-value="getSpentPercentage(item)"
              :color="getSpentColor(getSpentPercentage(item))"
              height="4"
              rounded
              class="mt-1"
            />
            <div class="text-caption text-grey">
              {{ getSpentPercentage(item) }}% потрачено
            </div>
          </div>
        </template>

        <template #item.roi="{ item }">
          <div class="text-center">
            <v-chip
              size="small"
              :color="getRoiColor(item.roi)"
              variant="tonal"
            >
              {{ item.roi }}%
            </v-chip>
            <div class="text-caption text-grey mt-1">
              {{ formatCurrency(item.revenue_generated) }}
            </div>
          </div>
        </template>

        <template #item.performance_score="{ item }">
          <div class="d-flex align-center justify-center">
            <v-progress-circular
              :model-value="item.performance_score"
              :color="getPerformanceColor(item.performance_score)"
              size="32"
              width="3"
            >
              <span class="text-caption">{{ item.performance_score }}</span>
            </v-progress-circular>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip
            size="small"
            :color="getStatusColor(item.status)"
            variant="tonal"
          >
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.timeline="{ item }">
          <div class="text-center">
            <div class="text-caption text-grey">
              {{ formatDate(item.start_date) }}
            </div>
            <div class="text-caption text-grey">
              - {{ formatDate(item.end_date) }}
            </div>
            <div class="text-caption" :class="getTimelineClass(item)">
              {{ getTimelineStatus(item) }}
            </div>
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
                v-bind="props"
              />
            </template>
            <v-list density="compact">
              <v-list-item @click="viewInvestment(item)">
                <v-list-item-title>Посмотреть детали</v-list-item-title>
              </v-list-item>
              <v-list-item @click="editInvestment(item)">
                <v-list-item-title>Редактировать</v-list-item-title>
              </v-list-item>
              <v-list-item @click="pauseInvestment(item)" v-if="item.status === 'active'">
                <v-list-item-title>Приостановить</v-list-item-title>
              </v-list-item>
              <v-list-item @click="resumeInvestment(item)" v-if="item.status === 'paused'">
                <v-list-item-title>Возобновить</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  investments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  itemsPerPage: { type: Number, default: 10 }
})

const emit = defineEmits([
  'refresh', 'view-investment', 'edit-investment',
  'pause-investment', 'resume-investment'
])

const sortBy = ref('roi')

const headers = [
  { title: 'Инвестиция', key: 'investment_name', sortable: true, width: '25%' },
  { title: 'Выделено', key: 'allocated_amount', sortable: true, align: 'end' },
  { title: 'Потрачено', key: 'spent_amount', sortable: true, align: 'end' },
  { title: 'ROI', key: 'roi', sortable: true, align: 'center' },
  { title: 'Результат', key: 'performance_score', sortable: true, align: 'center' },
  { title: 'Статус', key: 'status', sortable: true, align: 'center' },
  { title: 'Сроки', key: 'timeline', sortable: false, align: 'center' },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center', width: '80px' }
]

const sortedInvestments = computed(() => {
  const sorted = [...props.investments]

  switch (sortBy.value) {
    case 'roi':
      return sorted.sort((a, b) => (b.roi || 0) - (a.roi || 0))
    case 'amount':
      return sorted.sort((a, b) => (b.allocated_amount || 0) - (a.allocated_amount || 0))
    case 'performance':
      return sorted.sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
    default:
      return sorted
  }
})

const getInvestmentTypeColor = (type) => {
  const colors = {
    marketing: 'primary',
    technology: 'info',
    infrastructure: 'success',
    research: 'warning',
    training: 'purple',
    other: 'grey'
  }
  return colors[type] || 'grey'
}

const getInvestmentTypeIcon = (type) => {
  const icons = {
    marketing: 'mdi-bullhorn',
    technology: 'mdi-laptop',
    infrastructure: 'mdi-server',
    research: 'mdi-flask',
    training: 'mdi-school',
    other: 'mdi-briefcase'
  }
  return icons[type] || 'mdi-circle'
}

const getInvestmentTypeName = (type) => {
  const names = {
    marketing: 'Маркетинг',
    technology: 'Технологии',
    infrastructure: 'Инфраструктура',
    research: 'Исследования',
    training: 'Обучение',
    other: 'Другое'
  }
  return names[type] || type
}

const getSpentPercentage = (investment) => {
  if (!investment.allocated_amount || investment.allocated_amount === 0) return 0
  return Math.round((investment.spent_amount / investment.allocated_amount) * 100)
}

const getSpentColor = (percentage) => {
  if (percentage >= 90) return 'error'
  if (percentage >= 75) return 'warning'
  if (percentage >= 50) return 'info'
  return 'success'
}

const getRoiColor = (roi) => {
  if (roi >= 300) return 'success'
  if (roi >= 200) return 'info'
  if (roi >= 100) return 'warning'
  return 'error'
}

const getPerformanceColor = (score) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    paused: 'warning',
    completed: 'info',
    cancelled: 'error',
    planned: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Активная',
    paused: 'Приостановлена',
    completed: 'Завершена',
    cancelled: 'Отменена',
    planned: 'Запланирована'
  }
  return labels[status] || status
}

const getTimelineClass = (investment) => {
  const now = new Date()
  const endDate = new Date(investment.end_date)
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) return 'text-error'
  if (daysLeft <= 7) return 'text-warning'
  return 'text-success'
}

const getTimelineStatus = (investment) => {
  const now = new Date()
  const endDate = new Date(investment.end_date)
  const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) return `Просрочено на ${Math.abs(daysLeft)} дн.`
  if (daysLeft === 0) return 'Завершается сегодня'
  if (daysLeft <= 7) return `Осталось ${daysLeft} дн.`
  return `${daysLeft} дней`
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(value)
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }).format(new Date(dateString))
}

const handleRowClick = (event, { item }) => {
  viewInvestment(item)
}

const viewInvestment = (investment) => {
  emit('view-investment', investment)
}

const editInvestment = (investment) => {
  emit('edit-investment', investment)
}

const pauseInvestment = (investment) => {
  emit('pause-investment', investment)
}

const resumeInvestment = (investment) => {
  emit('resume-investment', investment)
}
</script>