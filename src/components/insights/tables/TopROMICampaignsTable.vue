<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Топ кампании по ROMI</span>
        <div class="d-flex align-center">
          <v-btn-toggle v-model="sortBy" mandatory size="small" class="me-2">
            <v-btn value="romi" size="small">По ROMI</v-btn>
            <v-btn value="revenue" size="small">По доходам</v-btn>
            <v-btn value="roi" size="small">По ROI</v-btn>
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
        <p class="mt-2">Загрузка кампаний...</p>
      </div>

      <div v-else-if="!campaigns || campaigns.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-2">mdi-rocket-launch</v-icon>
        <p class="text-grey mt-2">Нет данных для отображения</p>
      </div>

      <v-data-table
        v-else
        :headers="headers"
        :items="sortedCampaigns"
        :items-per-page="itemsPerPage"
        :loading="loading"
        density="compact"
        @click:row="handleRowClick"
      >
        <template #item.campaign_name="{ item }">
          <div class="d-flex align-center">
            <v-avatar
              size="32"
              :color="getChannelColor(item.channel)"
              class="me-3"
            >
              <v-icon size="16" color="white">{{ getChannelIcon(item.channel) }}</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.campaign_name }}</div>
              <div class="text-caption text-grey">{{ item.channel }} • {{ item.campaign_type }}</div>
            </div>
          </div>
        </template>

        <template #item.romi="{ item }">
          <div class="text-center">
            <v-chip
              size="small"
              :color="getROMIColor(item.romi)"
              variant="tonal"
            >
              {{ item.romi }}%
            </v-chip>
            <div class="text-caption text-grey mt-1">
              ROMI
            </div>
          </div>
        </template>

        <template #item.roi="{ item }">
          <div class="text-center">
            <div class="font-weight-medium" :class="getROIClass(item.roi)">
              {{ item.roi }}%
            </div>
            <div class="text-caption text-grey">ROI</div>
          </div>
        </template>

        <template #item.revenue="{ item }">
          <div class="text-right">
            <div class="font-weight-medium">{{ formatCurrency(item.revenue) }}</div>
            <div class="text-caption text-grey">
              {{ formatCurrency(item.spend) }} затрачено
            </div>
          </div>
        </template>

        <template #item.conversions="{ item }">
          <div class="text-center">
            <div class="font-weight-medium">{{ formatNumber(item.conversions) }}</div>
            <div class="text-caption text-grey">
              {{ item.conversion_rate }}% конверсия
            </div>
          </div>
        </template>

        <template #item.efficiency_score="{ item }">
          <div class="d-flex align-center justify-center">
            <v-progress-circular
              :model-value="item.efficiency_score"
              :color="getEfficiencyColor(item.efficiency_score)"
              size="32"
              width="3"
            >
              <span class="text-caption">{{ item.efficiency_score }}</span>
            </v-progress-circular>
          </div>
        </template>

        <template #item.period="{ item }">
          <div class="text-center">
            <div>{{ formatDate(item.start_date) }}</div>
            <div class="text-caption text-grey">
              {{ getDuration(item.start_date, item.end_date) }}
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
              <v-list-item @click="viewCampaign(item)">
                <v-list-item-title>Посмотреть детали</v-list-item-title>
              </v-list-item>
              <v-list-item @click="duplicateCampaign(item)">
                <v-list-item-title>Дублировать кампанию</v-list-item-title>
              </v-list-item>
              <v-list-item @click="optimizeCampaign(item)">
                <v-list-item-title>Оптимизировать</v-list-item-title>
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
  campaigns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  itemsPerPage: { type: Number, default: 10 }
})

const emit = defineEmits(['refresh', 'view-campaign', 'duplicate-campaign', 'optimize-campaign'])

const sortBy = ref('romi')

const headers = [
  { title: 'Кампания', key: 'campaign_name', sortable: true, width: '25%' },
  { title: 'ROMI', key: 'romi', sortable: true, align: 'center' },
  { title: 'ROI', key: 'roi', sortable: true, align: 'center' },
  { title: 'Доходы', key: 'revenue', sortable: true, align: 'end' },
  { title: 'Конверсии', key: 'conversions', sortable: true, align: 'center' },
  { title: 'Эффективность', key: 'efficiency_score', sortable: true, align: 'center' },
  { title: 'Период', key: 'period', sortable: false, align: 'center' },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center', width: '80px' }
]

const sortedCampaigns = computed(() => {
  const sorted = [...props.campaigns]

  switch (sortBy.value) {
    case 'romi':
      return sorted.sort((a, b) => (b.romi || 0) - (a.romi || 0))
    case 'revenue':
      return sorted.sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    case 'roi':
      return sorted.sort((a, b) => (b.roi || 0) - (a.roi || 0))
    default:
      return sorted
  }
})

const getChannelColor = (channel) => {
  const colors = {
    'google_ads': 'primary',
    'yandex_direct': 'warning',
    'facebook_ads': 'blue',
    'vk_ads': 'blue-grey',
    'instagram_ads': 'purple',
    'youtube_ads': 'red',
    'email': 'orange',
    'display': 'green'
  }
  return colors[channel] || 'grey'
}

const getChannelIcon = (channel) => {
  const icons = {
    'google_ads': 'mdi-google',
    'yandex_direct': 'mdi-yandex',
    'facebook_ads': 'mdi-facebook',
    'vk_ads': 'mdi-vk',
    'instagram_ads': 'mdi-instagram',
    'youtube_ads': 'mdi-youtube',
    'email': 'mdi-email',
    'display': 'mdi-web'
  }
  return icons[channel] || 'mdi-bullhorn'
}

const getROMIColor = (romi) => {
  if (romi >= 400) return 'success'
  if (romi >= 300) return 'info'
  if (romi >= 200) return 'warning'
  return 'error'
}

const getROIClass = (roi) => {
  if (roi >= 300) return 'text-success'
  if (roi >= 200) return 'text-info'
  if (roi >= 100) return 'text-warning'
  return 'text-error'
}

const getEfficiencyColor = (score) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

const getDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))

  if (diffDays < 7) return `${diffDays} дн.`
  if (diffDays < 30) return `${Math.round(diffDays / 7)} нед.`
  return `${Math.round(diffDays / 30)} мес.`
}

const handleRowClick = (event, { item }) => {
  viewCampaign(item)
}

const viewCampaign = (campaign) => {
  emit('view-campaign', campaign)
}

const duplicateCampaign = (campaign) => {
  emit('duplicate-campaign', campaign)
}

const optimizeCampaign = (campaign) => {
  emit('optimize-campaign', campaign)
}
</script>