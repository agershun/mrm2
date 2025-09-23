<template>
  <div class="media-mix-preview">
    <v-card v-if="mediaMix">
      <v-card-title>
        <v-icon class="me-2">mdi-chart-pie</v-icon>
        {{ mediaMix.name }}
      </v-card-title>

      <v-card-text>
        <!-- Основная информация -->
        <div class="mb-4">
          <v-list density="compact">
            <v-list-item>
              <v-list-item-title>Общий бюджет</v-list-item-title>
              <v-list-item-subtitle>{{ formatCurrency(mediaMix.total_budget) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Ожидаемый ROI</v-list-item-title>
              <v-list-item-subtitle>
                <span :class="getRoiColor(mediaMix.expected_roi)">
                  {{ mediaMix.expected_roi }}%
                </span>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Период</v-list-item-title>
              <v-list-item-subtitle>{{ mediaMix.campaign_duration }} дней</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>

        <!-- Диаграмма распределения бюджета -->
        <div class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Распределение бюджета</h4>
          <div id="budget-chart" style="height: 200px;">
            <!-- Здесь будет круговая диаграмма ECharts -->
            <div class="text-center pa-4">
              <v-icon size="48" color="grey-lighten-2">mdi-chart-pie</v-icon>
              <p class="text-caption text-grey mt-2">Диаграмма распределения</p>
            </div>
          </div>
        </div>

        <!-- Список каналов -->
        <div class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Каналы</h4>
          <div v-for="channel in mediaMix.channels" :key="channel.channel" class="mb-3">
            <div class="d-flex justify-space-between align-center mb-1">
              <div class="d-flex align-center">
                <v-avatar size="24" :color="getChannelColor(channel.channel)" class="me-2">
                  <v-icon size="16" color="white">{{ getChannelIcon(channel.channel) }}</v-icon>
                </v-avatar>
                <span class="text-body-2 font-weight-medium">{{ channel.channel }}</span>
              </div>
              <div class="text-right">
                <div class="text-body-2 font-weight-medium">{{ channel.budget_share }}%</div>
                <div class="text-caption text-grey">{{ formatCurrency(channel.budget_amount) }}</div>
              </div>
            </div>
            <v-progress-linear
              :model-value="channel.budget_share"
              :color="getChannelColor(channel.channel)"
              height="6"
              rounded
            />
            <div class="text-caption text-grey mt-1">
              ROI: {{ channel.expected_roi }}% | CPA: {{ formatCurrency(channel.target_cpa) }}
            </div>
          </div>
        </div>

        <!-- KPI -->
        <div v-if="mediaMix.kpis && mediaMix.kpis.length > 0" class="mb-4">
          <h4 class="text-subtitle-1 mb-3">Целевые KPI</h4>
          <v-row dense>
            <v-col
              v-for="kpi in mediaMix.kpis"
              :key="kpi.name"
              cols="6"
            >
              <v-card variant="outlined" density="compact">
                <v-card-text class="pa-2">
                  <div class="text-caption text-grey">{{ kpi.name }}</div>
                  <div class="text-body-2 font-weight-medium">{{ formatKpiValue(kpi) }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Рекомендации -->
        <div v-if="mediaMix.recommendations && mediaMix.recommendations.length > 0">
          <h4 class="text-subtitle-1 mb-3">Рекомендации</h4>
          <v-list density="compact">
            <v-list-item
              v-for="(rec, index) in mediaMix.recommendations.slice(0, 3)"
              :key="index"
              class="pa-0"
            >
              <template #prepend>
                <v-icon size="16" color="primary">mdi-lightbulb-outline</v-icon>
              </template>
              <v-list-item-title class="text-body-2">{{ rec }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="mediaMix.recommendations.length > 3" class="pa-0">
              <v-list-item-title class="text-caption text-grey">
                +{{ mediaMix.recommendations.length - 3 }} еще...
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="primary"
          variant="outlined"
          size="small"
          @click="$emit('optimize')"
        >
          <v-icon>mdi-tune</v-icon>
          Оптимизировать
        </v-btn>
        <v-btn
          color="secondary"
          variant="outlined"
          size="small"
          @click="$emit('export')"
        >
          <v-icon>mdi-download</v-icon>
          Экспорт
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-card v-else>
      <v-card-text class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-2">mdi-chart-pie-outline</v-icon>
        <h3 class="text-h6 mt-2">Медиа-микс не выбран</h3>
        <p class="text-grey">Выберите медиа-микс из списка для просмотра деталей</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mediaMix: { type: Object, default: null }
})

defineEmits(['optimize', 'export'])

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

const getRoiColor = (roi) => {
  if (roi >= 300) return 'text-success'
  if (roi >= 200) return 'text-warning'
  return 'text-error'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatKpiValue = (kpi) => {
  if (kpi.unit === '%') return `${kpi.target_value}%`
  if (kpi.unit === 'RUB') return formatCurrency(kpi.target_value)
  return `${kpi.target_value}${kpi.unit || ''}`
}
</script>