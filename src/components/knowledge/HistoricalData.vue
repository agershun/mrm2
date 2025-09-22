<template>
  <div class="historical-data">
    <v-card>
      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedChannel"
              :items="channels"
              label="Канал"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedPeriod"
              :items="periods"
              label="Период"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedMetric"
              :items="metrics"
              label="Метрика"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-btn color="primary" @click="exportData">
              <v-icon>mdi-download</v-icon>
              Экспорт
            </v-btn>
          </v-col>
        </v-row>

        <!-- Графики и таблицы -->
        <v-row>
          <v-col cols="12" md="8">
            <v-card variant="outlined">
              <v-card-title>Динамика по времени</v-card-title>
              <v-card-text>
                <div id="historical-chart" style="height: 400px;">
                  <!-- Здесь будет график ECharts -->
                  <div class="text-center pa-8">
                    <v-icon size="64" color="grey-lighten-2">mdi-chart-line</v-icon>
                    <p class="text-grey mt-2">График будет отображен здесь</p>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card variant="outlined">
              <v-card-title>Статистика</v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title>Среднее значение</v-list-item-title>
                    <v-list-item-subtitle>{{ formatValue(stats.average) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Максимум</v-list-item-title>
                    <v-list-item-subtitle>{{ formatValue(stats.max) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Минимум</v-list-item-title>
                    <v-list-item-subtitle>{{ formatValue(stats.min) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>Тренд</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        size="small"
                        :color="getTrendColor(stats.trend)"
                      >
                        {{ getTrendLabel(stats.trend) }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <v-card variant="outlined" class="mt-4">
              <v-card-title>Сравнение каналов</v-card-title>
              <v-card-text>
                <div v-for="channel in channelComparison" :key="channel.name" class="mb-2">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-body-2">{{ channel.name }}</span>
                    <span class="text-body-2 font-weight-medium">{{ formatValue(channel.value) }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="channel.percentage"
                    :color="getChannelColor(channel.name)"
                    height="6"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Таблица данных -->
        <v-card variant="outlined" class="mt-4">
          <v-card-title>Детальные данные</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="tableHeaders"
              :items="filteredData"
              :loading="loading"
              item-value="id"
              density="compact"
            >
              <template #item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>

              <template #item.channel="{ item }">
                <v-chip size="small" :color="getChannelColor(item.channel)">
                  {{ item.channel }}
                </v-chip>
              </template>

              <template #item.impressions="{ item }">
                {{ formatNumber(item.impressions) }}
              </template>

              <template #item.clicks="{ item }">
                {{ formatNumber(item.clicks) }}
              </template>

              <template #item.cost="{ item }">
                {{ formatCurrency(item.cost) }}
              </template>

              <template #item.ctr="{ item }">
                {{ formatPercent(item.ctr) }}
              </template>

              <template #item.cpc="{ item }">
                {{ formatCurrency(item.cpc) }}
              </template>

              <template #item.conversions="{ item }">
                {{ formatNumber(item.conversions) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore'

const knowledgeStore = useKnowledgeBaseStore()

const selectedChannel = ref(null)
const selectedPeriod = ref('last_30_days')
const selectedMetric = ref(null)
const loading = ref(false)

const channels = computed(() =>
  [...new Set(knowledgeStore.historicalData.map(item => item.channel))]
)

const periods = [
  { title: 'Последние 7 дней', value: 'last_7_days' },
  { title: 'Последние 30 дней', value: 'last_30_days' },
  { title: 'Последние 90 дней', value: 'last_90_days' },
  { title: 'Последний год', value: 'last_year' }
]

const metrics = [
  { title: 'Показы', value: 'impressions' },
  { title: 'Клики', value: 'clicks' },
  { title: 'CTR', value: 'ctr' },
  { title: 'CPC', value: 'cpc' },
  { title: 'Стоимость', value: 'cost' },
  { title: 'Конверсии', value: 'conversions' }
]

const tableHeaders = [
  { title: 'Дата', value: 'date', width: '12%' },
  { title: 'Канал', value: 'channel', width: '15%' },
  { title: 'Показы', value: 'impressions', width: '12%' },
  { title: 'Клики', value: 'clicks', width: '10%' },
  { title: 'CTR', value: 'ctr', width: '8%' },
  { title: 'CPC', value: 'cpc', width: '10%' },
  { title: 'Стоимость', value: 'cost', width: '12%' },
  { title: 'Конверсии', value: 'conversions', width: '10%' }
]

const filteredData = computed(() => {
  let data = knowledgeStore.historicalData

  if (selectedChannel.value) {
    data = data.filter(item => item.channel === selectedChannel.value)
  }

  // Фильтрация по периоду
  const now = new Date()
  const periodDays = {
    last_7_days: 7,
    last_30_days: 30,
    last_90_days: 90,
    last_year: 365
  }

  const days = periodDays[selectedPeriod.value] || 30
  const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

  data = data.filter(item => new Date(item.date) >= cutoffDate)

  return data.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const stats = computed(() => {
  if (!selectedMetric.value || filteredData.value.length === 0) {
    return { average: 0, max: 0, min: 0, trend: 'stable' }
  }

  const values = filteredData.value.map(item => item[selectedMetric.value]).filter(v => v != null)

  if (values.length === 0) {
    return { average: 0, max: 0, min: 0, trend: 'stable' }
  }

  const average = values.reduce((sum, val) => sum + val, 0) / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)

  // Простой расчет тренда
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length

  let trend = 'stable'
  if (secondAvg > firstAvg * 1.05) trend = 'up'
  else if (secondAvg < firstAvg * 0.95) trend = 'down'

  return { average, max, min, trend }
})

const channelComparison = computed(() => {
  if (!selectedMetric.value) return []

  const channelData = {}
  filteredData.value.forEach(item => {
    if (!channelData[item.channel]) {
      channelData[item.channel] = []
    }
    channelData[item.channel].push(item[selectedMetric.value])
  })

  const result = Object.entries(channelData).map(([name, values]) => {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    return { name, value: average }
  })

  const maxValue = Math.max(...result.map(r => r.value))
  return result.map(r => ({
    ...r,
    percentage: maxValue > 0 ? (r.value / maxValue) * 100 : 0
  }))
})

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

const getTrendColor = (trend) => {
  const colors = {
    up: 'success',
    down: 'error',
    stable: 'info'
  }
  return colors[trend] || 'grey'
}

const getTrendLabel = (trend) => {
  const labels = {
    up: 'Рост',
    down: 'Снижение',
    stable: 'Стабильно'
  }
  return labels[trend] || trend
}

const formatValue = (value) => {
  if (value == null) return '—'
  if (selectedMetric.value === 'cost' || selectedMetric.value === 'cpc') {
    return formatCurrency(value)
  }
  if (selectedMetric.value === 'ctr') {
    return formatPercent(value)
  }
  return formatNumber(value)
}

const formatNumber = (value) => {
  return value != null ? Number(value).toLocaleString('ru-RU') : '—'
}

const formatCurrency = (value) => {
  return value != null ? new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value) : '—'
}

const formatPercent = (value) => {
  return value != null ? `${(value * 100).toFixed(2)}%` : '—'
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

const exportData = () => {
  // Экспорт данных в CSV
  const headers = tableHeaders.map(h => h.title).join(',')
  const rows = filteredData.value.map(item =>
    tableHeaders.map(h => item[h.value] || '').join(',')
  )

  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `historical_data_${selectedPeriod.value}.csv`
  a.click()

  URL.revokeObjectURL(url)
}

onMounted(async () => {
  loading.value = true
  await knowledgeStore.fetchHistoricalData()
  loading.value = false
})
</script>