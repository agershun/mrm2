<template>
  <v-data-table
    :headers="headers"
    :items="cohorts"
    :loading="loading"
    density="compact"
  >
    <template #item.cohort_name="{ item }">
      <div class="font-weight-medium">{{ item.cohort_name }}</div>
      <div class="text-caption text-grey">{{ item.period }}</div>
    </template>

    <template #item.retention_rate="{ item }">
      <div class="d-flex align-center">
        <v-progress-linear
          :model-value="item.retention_rate"
          :color="getRetentionColor(item.retention_rate)"
          height="6"
          rounded
          class="me-2"
          style="min-width: 60px;"
        />
        <span class="text-caption">{{ item.retention_rate }}%</span>
      </div>
    </template>

    <template #item.ltv="{ item }">
      {{ formatCurrency(item.ltv) }}
    </template>

    <template #item.users_count="{ item }">
      {{ formatNumber(item.users_count) }}
    </template>
  </v-data-table>
</template>

<script setup>
const props = defineProps({
  cohorts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const headers = [
  { title: 'Когорта', key: 'cohort_name' },
  { title: 'Удержание', key: 'retention_rate' },
  { title: 'LTV', key: 'ltv' },
  { title: 'Пользователи', key: 'users_count' }
]

const getRetentionColor = (rate) => {
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'error'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency', currency: 'RUB', minimumFractionDigits: 0
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}
</script>