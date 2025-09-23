<template>
  <v-card variant="outlined">
    <v-card-text class="pa-4">
      <v-row>
        <v-col cols="12" sm="6" md="3" v-for="stat in statsItems" :key="stat.key">
          <div class="text-center">
            <v-icon :color="stat.color" size="24" class="mb-2">{{ stat.icon }}</v-icon>
            <div class="text-h6 font-weight-bold">{{ formatValue(stat.value, stat.format) }}</div>
            <div class="text-caption text-grey-darken-1">{{ stat.label }}</div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const statsItems = computed(() => {
  const stats = props.stats || {}
  return [
    { key: 'total_campaigns', label: 'Всего кампаний', value: stats.total_campaigns || 0, icon: 'mdi-rocket-launch', color: 'primary', format: 'number' },
    { key: 'active_campaigns', label: 'Активных', value: stats.active_campaigns || 0, icon: 'mdi-play-circle', color: 'success', format: 'number' },
    { key: 'total_budget', label: 'Общий бюджет', value: stats.total_budget || 0, icon: 'mdi-currency-rub', color: 'info', format: 'currency' }
  ]
})

const formatValue = (value, format) => {
  if (!value) return '—'
  if (format === 'currency') return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(value)
  if (format === 'number') return Number(value).toLocaleString('ru-RU')
  return value
}
</script>