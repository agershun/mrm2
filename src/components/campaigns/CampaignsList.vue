<template>
  <v-data-table
    :items="campaigns"
    :headers="headers"
    :loading="loading"
    class="campaigns-list"
    item-value="campaign_id"
  >
    <template #item.name="{ item }">
      <div class="d-flex align-center">
        <v-icon color="primary" class="mr-2">mdi-rocket-launch</v-icon>
        {{ item.name }}
      </div>
    </template>

    <template #item.status="{ item }">
      <v-chip
        :color="getStatusColor(item.status)"
        size="small"
        variant="flat"
      >
        {{ getStatusText(item.status) }}
      </v-chip>
    </template>

    <template #item.channel="{ item }">
      <v-chip
        :color="getChannelColor(item.channel)"
        size="small"
        variant="outlined"
      >
        {{ getChannelText(item.channel) }}
      </v-chip>
    </template>

    <template #item.objective="{ item }">
      <span class="text-caption">{{ getObjectiveText(item.objective) }}</span>
    </template>

    <template #item.budget_value="{ item }">
      <div class="text-right">
        <div class="font-weight-medium">{{ formatCurrency(item.budget_value) }}</div>
        <div class="text-caption text-grey-darken-1">{{ getBudgetTypeText(item.budget_type) }}</div>
      </div>
    </template>

    <template #item.dates="{ item }">
      <div class="text-caption">
        <div>{{ formatDate(item.start_date) }}</div>
        <div class="text-grey-darken-1" v-if="item.end_date">{{ formatDate(item.end_date) }}</div>
      </div>
    </template>

    <template #item.kpi_targets="{ item }">
      <div class="d-flex flex-wrap ga-1" v-if="item.kpi_targets">
        <v-chip
          v-for="kpi in item.kpi_targets.slice(0, 3)"
          :key="kpi.type"
          size="x-small"
          variant="outlined"
        >
          {{ kpi.type }}: {{ kpi.target }}
        </v-chip>
      </div>
    </template>

    <template #item.utm_params="{ item }">
      <div class="d-flex flex-wrap ga-1" v-if="item.utm_params">
        <v-chip size="x-small" variant="outlined" v-if="item.utm_params.source">
          {{ item.utm_params.source }}
        </v-chip>
        <v-chip size="x-small" variant="outlined" v-if="item.utm_params.medium">
          {{ item.utm_params.medium }}
        </v-chip>
      </div>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon="mdi-rocket-launch" size="small" @click="$emit('open-workspace', item)" title="Открыть рабочее пространство" />
      <v-btn icon="mdi-eye" size="small" @click="$emit('view-details', item)" title="Просмотр деталей" />
      <v-btn icon="mdi-pencil" size="small" @click="$emit('edit', item)" title="Редактировать" />
    </template>
  </v-data-table>
</template>

<script setup>
defineProps({
  campaigns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selected: { type: Array, default: () => [] }
})

defineEmits(['select', 'edit', 'duplicate', 'delete', 'view-details', 'open-workspace'])

// Заголовки таблицы
const headers = [
  { title: 'Название', key: 'name', sortable: true },
  { title: 'Статус', key: 'status', sortable: true },
  { title: 'Канал', key: 'channel', sortable: true },
  { title: 'Цель', key: 'objective', sortable: true },
  { title: 'Бюджет', key: 'budget_value', sortable: true },
  { title: 'Период', key: 'dates', sortable: false },
  { title: 'KPI цели', key: 'kpi_targets', sortable: false },
  { title: 'UTM', key: 'utm_params', sortable: false },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center' }
]

// Вспомогательные функции
const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    paused: 'warning',
    completed: 'info',
    cancelled: 'error',
    draft: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Активна',
    paused: 'Приостановлена',
    completed: 'Завершена',
    cancelled: 'Отменена',
    draft: 'Черновик'
  }
  return texts[status] || status
}

const getChannelColor = (channel) => {
  const colors = {
    meta: 'blue',
    google: 'green',
    yandex: 'red',
    vkontakte: 'indigo',
    telegram: 'cyan'
  }
  return colors[channel] || 'grey'
}

const getChannelText = (channel) => {
  const texts = {
    meta: 'Meta',
    google: 'Google',
    yandex: 'Яндекс',
    vkontakte: 'VK',
    telegram: 'Telegram'
  }
  return texts[channel] || channel
}

const getObjectiveText = (objective) => {
  const texts = {
    conversions: 'Конверсии',
    reach: 'Охват',
    awareness: 'Узнаваемость',
    traffic: 'Трафик',
    engagement: 'Вовлечение'
  }
  return texts[objective] || objective
}

const getBudgetTypeText = (budgetType) => {
  const texts = {
    lifetime: 'На весь период',
    daily: 'Ежедневно'
  }
  return texts[budgetType] || budgetType
}

const formatCurrency = (value) => {
  if (!value) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU')
}
</script>