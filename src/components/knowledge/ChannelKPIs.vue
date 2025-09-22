<template>
  <div class="channel-kpis">
    <v-card>
      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedChannel"
              :items="channels"
              label="Канал"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedCategory"
              :items="categories"
              label="Категория KPI"
              variant="outlined"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-btn color="primary" @click="showAddDialog = true">
              <v-icon>mdi-plus</v-icon>
              Добавить KPI
            </v-btn>
          </v-col>
        </v-row>

        <!-- KPI по каналам -->
        <div v-for="channel in filteredChannelKPIs" :key="channel.channel" class="mb-6">
          <h3 class="text-h6 mb-3 d-flex align-center">
            <v-icon class="me-2" :color="getChannelColor(channel.channel)">
              {{ getChannelIcon(channel.channel) }}
            </v-icon>
            {{ channel.channel }}
            <v-spacer />
            <v-chip size="small" color="primary">
              {{ channel.kpis.length }} KPI
            </v-chip>
          </h3>

          <v-row>
            <v-col
              v-for="kpi in channel.kpis"
              :key="kpi.kpi_id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card variant="outlined" class="h-100">
                <v-card-text>
                  <div class="d-flex justify-space-between align-start mb-2">
                    <div>
                      <h4 class="text-subtitle-1">{{ kpi.name }}</h4>
                      <v-chip
                        size="x-small"
                        :color="getCategoryColor(kpi.category)"
                        class="mb-1"
                      >
                        {{ getCategoryLabel(kpi.category) }}
                      </v-chip>
                    </div>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn
                          icon="mdi-dots-vertical"
                          size="small"
                          variant="text"
                          v-bind="props"
                        />
                      </template>
                      <v-list>
                        <v-list-item @click="editKPI(kpi)">
                          <v-list-item-title>Редактировать</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteKPI(kpi)" class="text-error">
                          <v-list-item-title>Удалить</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>

                  <p class="text-body-2 text-grey mb-3">{{ kpi.description }}</p>

                  <v-divider class="mb-3" />

                  <div class="kpi-metrics">
                    <div v-if="kpi.benchmark_values" class="mb-3">
                      <h5 class="text-subtitle-2 mb-2">Бенчмарки:</h5>
                      <div class="d-flex flex-wrap gap-2">
                        <v-chip
                          v-for="(value, industry) in kpi.benchmark_values"
                          :key="industry"
                          size="small"
                          variant="tonal"
                        >
                          {{ industry }}: {{ value }}{{ kpi.unit }}
                        </v-chip>
                      </div>
                    </div>

                    <div v-if="kpi.target_ranges" class="mb-3">
                      <h5 class="text-subtitle-2 mb-2">Целевые диапазоны:</h5>
                      <div class="d-flex flex-wrap gap-2">
                        <v-chip
                          v-for="(range, level) in kpi.target_ranges"
                          :key="level"
                          size="small"
                          :color="getRangeColor(level)"
                        >
                          {{ getRangeLabel(level) }}: {{ range }}{{ kpi.unit }}
                        </v-chip>
                      </div>
                    </div>

                    <div class="text-caption text-grey">
                      Обновлено: {{ formatDate(kpi.updated_at) }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div v-if="filteredChannelKPIs.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">mdi-chart-line</v-icon>
          <h3 class="text-h6 mt-2">KPI не найдены</h3>
          <p class="text-grey">Добавьте KPI для выбранных каналов</p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Диалог добавления/редактирования KPI -->
    <KPIEditDialog
      v-model="showAddDialog"
      :kpi="selectedKPI"
      @saved="handleKPISaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeBaseStore } from '@/stores/knowledgeBaseStore'
import KPIEditDialog from './KPIEditDialog.vue'

const knowledgeStore = useKnowledgeBaseStore()

const selectedChannel = ref(null)
const selectedCategory = ref(null)
const showAddDialog = ref(false)
const selectedKPI = ref(null)

const channels = computed(() =>
  [...new Set(knowledgeStore.channelKpis.map(kpi => kpi.channel))]
)

const categories = [
  { title: 'Эффективность', value: 'performance' },
  { title: 'Охват', value: 'reach' },
  { title: 'Вовлечение', value: 'engagement' },
  { title: 'Конверсии', value: 'conversion' }
]

const filteredChannelKPIs = computed(() => {
  let kpis = knowledgeStore.channelKpis

  if (selectedChannel.value) {
    kpis = kpis.filter(kpi => kpi.channel === selectedChannel.value)
  }

  if (selectedCategory.value) {
    kpis = kpis.filter(kpi => kpi.category === selectedCategory.value)
  }

  // Группировка по каналам
  const grouped = kpis.reduce((acc, kpi) => {
    if (!acc[kpi.channel]) {
      acc[kpi.channel] = { channel: kpi.channel, kpis: [] }
    }
    acc[kpi.channel].kpis.push(kpi)
    return acc
  }, {})

  return Object.values(grouped)
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

const getCategoryColor = (category) => {
  const colors = {
    performance: 'success',
    reach: 'info',
    engagement: 'purple',
    conversion: 'warning'
  }
  return colors[category] || 'grey'
}

const getCategoryLabel = (category) => {
  const labels = {
    performance: 'Эффективность',
    reach: 'Охват',
    engagement: 'Вовлечение',
    conversion: 'Конверсии'
  }
  return labels[category] || category
}

const getRangeColor = (level) => {
  const colors = {
    poor: 'error',
    average: 'warning',
    good: 'success',
    excellent: 'primary'
  }
  return colors[level] || 'grey'
}

const getRangeLabel = (level) => {
  const labels = {
    poor: 'Плохо',
    average: 'Средне',
    good: 'Хорошо',
    excellent: 'Отлично'
  }
  return labels[level] || level
}

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString))
}

const editKPI = (kpi) => {
  selectedKPI.value = kpi
  showAddDialog.value = true
}

const deleteKPI = async (kpi) => {
  if (confirm(`Удалить KPI "${kpi.name}"?`)) {
    await knowledgeStore.deleteChannelKpi(kpi.kpi_id)
  }
}

const handleKPISaved = () => {
  showAddDialog.value = false
  selectedKPI.value = null
}

onMounted(async () => {
  await knowledgeStore.fetchChannelKpis()
})
</script>

<style scoped>
.kpi-metrics {
  font-size: 0.875rem;
}

.gap-2 {
  gap: 8px;
}
</style>