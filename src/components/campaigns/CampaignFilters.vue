<template>
  <v-card variant="outlined">
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field v-model="searchQuery" label="Поиск кампаний" prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" clearable />
        </v-col>
        <v-col cols="12" md="2">
          <v-select v-model="localFilters.status" :items="statusOptions" label="Статус" variant="outlined" density="compact" clearable />
        </v-col>
        <v-col cols="12" md="2">
          <v-select v-model="localFilters.channel" :items="channels" label="Канал" variant="outlined" density="compact" clearable />
        </v-col>
        <v-col cols="12" md="2">
          <v-btn color="primary" @click="$emit('search', searchQuery)">Найти</v-btn>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn variant="outlined" @click="clearFilters">Очистить</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  filters: { type: Object, default: () => ({}) },
  search: { type: String, default: '' },
  channels: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:filters', 'update:search', 'search', 'clear-filters'])

const searchQuery = ref(props.search)
const localFilters = ref({ ...props.filters })

const statusOptions = [
  { title: 'Активная', value: 'active' },
  { title: 'Приостановлена', value: 'paused' },
  { title: 'Завершена', value: 'completed' }
]

const clearFilters = () => {
  localFilters.value = {}
  searchQuery.value = ''
  emit('clear-filters')
}

watch(localFilters, (newFilters) => {
  emit('update:filters', newFilters)
}, { deep: true })
</script>