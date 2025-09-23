<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Топ кампании по производительности</span>
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
        <p class="mt-2">Загрузка данных...</p>
      </div>

      <div v-else-if="!campaigns || campaigns.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-2">mdi-chart-line-variant</v-icon>
        <p class="text-grey mt-2">Нет данных для отображения</p>
      </div>

      <v-data-table
        v-else
        :headers="headers"
        :items="tableItems"
        :items-per-page="itemsPerPage"
        :loading="loading"
        density="compact"
        @click:row="handleRowClick"
      >
        <template #item.campaign_name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" :color="getStatusColor(item.status)" class="me-3">
              <v-icon size="16" color="white">{{ getStatusIcon(item.status) }}</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.campaign_name }}</div>
              <div class="text-caption text-grey">{{ item.channel }}</div>
            </div>
          </div>
        </template>

        <template #item.revenue="{ item }">
          <div class="text-right">
            <div class="font-weight-medium">{{ formatCurrency(item.revenue) }}</div>
            <div class="text-caption" :class="getRevenueChangeClass(item.revenue_change)">
              <v-icon size="12" :icon="getRevenueChangeIcon(item.revenue_change)" />
              {{ Math.abs(item.revenue_change) }}%
            </div>
          </div>
        </template>

        <template #item.roi="{ item }">
          <v-chip
            size="small"
            :color="getRoiColor(item.roi)"
            variant="tonal"
          >
            {{ item.roi }}%
          </v-chip>
        </template>

        <template #item.conversions="{ item }">
          <div class="text-right">
            <div class="font-weight-medium">{{ formatNumber(item.conversions) }}</div>
            <div class="text-caption text-grey">{{ formatNumber(item.clicks) }} кликов</div>
          </div>
        </template>

        <template #item.cost="{ item }">
          <div class="text-right">
            <div class="font-weight-medium">{{ formatCurrency(item.cost) }}</div>
            <div class="text-caption text-grey">{{ formatCurrency(item.cpc) }} CPC</div>
          </div>
        </template>

        <template #item.performance_score="{ item }">
          <div class="d-flex align-center">
            <v-progress-linear
              :model-value="item.performance_score"
              :color="getPerformanceColor(item.performance_score)"
              height="6"
              rounded
              class="me-2"
              style="min-width: 60px;"
            />
            <span class="text-caption">{{ item.performance_score }}</span>
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
              <v-list-item @click="editCampaign(item)">
                <v-list-item-title>Редактировать</v-list-item-title>
              </v-list-item>
              <v-list-item @click="duplicateCampaign(item)">
                <v-list-item-title>Дублировать</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  campaigns: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  itemsPerPage: { type: Number, default: 10 }
})

const emit = defineEmits(['refresh', 'view-campaign', 'edit-campaign', 'duplicate-campaign'])

const headers = [
  { title: 'Кампания', key: 'campaign_name', sortable: true, width: '25%' },
  { title: 'Доходы', key: 'revenue', sortable: true, align: 'end' },
  { title: 'ROI', key: 'roi', sortable: true, align: 'center' },
  { title: 'Конверсии', key: 'conversions', sortable: true, align: 'end' },
  { title: 'Затраты', key: 'cost', sortable: true, align: 'end' },
  { title: 'Производительность', key: 'performance_score', sortable: true, align: 'center' },
  { title: 'Действия', key: 'actions', sortable: false, align: 'center', width: '80px' }
]

const tableItems = computed(() => {
  return props.campaigns.map(campaign => ({
    ...campaign,
    revenue_change: campaign.revenue_change || 0,
    performance_score: campaign.performance_score || 0
  }))
})

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    paused: 'warning',
    draft: 'grey',
    completed: 'info',
    archived: 'error'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    active: 'mdi-play',
    paused: 'mdi-pause',
    draft: 'mdi-file-outline',
    completed: 'mdi-check',
    archived: 'mdi-archive'
  }
  return icons[status] || 'mdi-help'
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

const getRevenueChangeClass = (change) => {
  if (change > 0) return 'text-success'
  if (change < 0) return 'text-error'
  return 'text-grey'
}

const getRevenueChangeIcon = (change) => {
  if (change > 0) return 'mdi-trending-up'
  if (change < 0) return 'mdi-trending-down'
  return 'mdi-trending-neutral'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}

const handleRowClick = (event, { item }) => {
  viewCampaign(item)
}

const viewCampaign = (campaign) => {
  emit('view-campaign', campaign)
}

const editCampaign = (campaign) => {
  emit('edit-campaign', campaign)
}

const duplicateCampaign = (campaign) => {
  emit('duplicate-campaign', campaign)
}
</script>