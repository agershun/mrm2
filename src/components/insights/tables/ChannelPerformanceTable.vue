<template>
  <v-data-table
    :headers="headers"
    :items="channels"
    :loading="loading"
    density="compact"
  >
    <template #item.channel="{ item }">
      <div class="d-flex align-center">
        <v-avatar size="24" :color="getChannelColor(item.channel)" class="me-2">
          <v-icon size="12" color="white">{{ getChannelIcon(item.channel) }}</v-icon>
        </v-avatar>
        {{ getChannelName(item.channel) }}
      </div>
    </template>

    <template #item.romi="{ item }">
      <v-chip size="small" :color="getROMIColor(item.romi)" variant="tonal">
        {{ item.romi }}%
      </v-chip>
    </template>

    <template #item.spend="{ item }">
      {{ formatCurrency(item.spend) }}
    </template>

    <template #item.revenue="{ item }">
      {{ formatCurrency(item.revenue) }}
    </template>
  </v-data-table>
</template>

<script setup>
const props = defineProps({
  channels: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const headers = [
  { title: 'Канал', key: 'channel' },
  { title: 'ROMI', key: 'romi' },
  { title: 'Затраты', key: 'spend' },
  { title: 'Доходы', key: 'revenue' },
  { title: 'Конверсии', key: 'conversions' }
]

const getChannelColor = (channel) => {
  const colors = { google_ads: 'primary', yandex_direct: 'warning', facebook_ads: 'blue' }
  return colors[channel] || 'grey'
}

const getChannelIcon = (channel) => {
  const icons = { google_ads: 'mdi-google', yandex_direct: 'mdi-yandex', facebook_ads: 'mdi-facebook' }
  return icons[channel] || 'mdi-bullhorn'
}

const getChannelName = (channel) => {
  const names = { google_ads: 'Google Ads', yandex_direct: 'Яндекс.Директ', facebook_ads: 'Facebook' }
  return names[channel] || channel
}

const getROMIColor = (romi) => {
  if (romi >= 300) return 'success'
  if (romi >= 200) return 'warning'
  return 'error'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency', currency: 'RUB', minimumFractionDigits: 0
  }).format(value)
}
</script>