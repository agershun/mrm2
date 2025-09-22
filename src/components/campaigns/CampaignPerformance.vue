<template>
  <div class="campaign-performance">
    <!-- Loading state -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" :size="40" />
      <div class="mt-2 text-body-2">Загрузка данных производительности...</div>
    </div>

    <div v-else>
      <!-- Key Metrics -->
      <v-row class="mb-6">
        <v-col cols="12">
          <h3 class="text-h6 mb-4">Ключевые метрики</h3>
        </v-col>
        <v-col cols="6" md="3">
          <v-card variant="outlined" class="pa-4 text-center">
            <div class="text-h4 font-weight-bold primary--text">
              {{ formatNumber(performanceData?.impressions || 0) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">Показы</div>
            <div class="text-caption text-success mt-1">
              <v-icon size="16">mdi-trending-up</v-icon>
              +12.5% за неделю
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card variant="outlined" class="pa-4 text-center">
            <div class="text-h4 font-weight-bold success--text">
              {{ formatNumber(performanceData?.clicks || 0) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">Клики</div>
            <div class="text-caption text-success mt-1">
              <v-icon size="16">mdi-trending-up</v-icon>
              +8.3% за неделю
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card variant="outlined" class="pa-4 text-center">
            <div class="text-h4 font-weight-bold">
              {{ performanceData?.ctr || '0.00' }}%
            </div>
            <div class="text-body-2 text-medium-emphasis">CTR</div>
            <div class="text-caption text-error mt-1">
              <v-icon size="16">mdi-trending-down</v-icon>
              -2.1% за неделю
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card variant="outlined" class="pa-4 text-center">
            <div class="text-h4 font-weight-bold warning--text">
              {{ formatNumber(performanceData?.conversions || 0) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">Конверсии</div>
            <div class="text-caption text-success mt-1">
              <v-icon size="16">mdi-trending-up</v-icon>
              +15.7% за неделю
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Cost Metrics -->
      <v-row class="mb-6">
        <v-col cols="6" md="3">
          <v-card variant="outlined" class="pa-4 text-center">
            <div class="text-h5 font-weight-bold">
              {{ formatCurrency(performanceData?.spent || 0) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">Потрачено</div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card variant="outlined" class="pa-4 text-center">
            <div class="text-h5 font-weight-bold">
              {{ formatCurrency(performanceData?.cpc || 0) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">CPC</div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card variant="outlined" class="pa-4 text-center">
            <div class="text-h5 font-weight-bold">
              {{ formatCurrency(performanceData?.cpm || 0) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">CPM</div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card variant="outlined" class="pa-4 text-center">
            <div class="text-h5 font-weight-bold">
              {{ formatCurrency(performanceData?.cpa || 0) }}
            </div>
            <div class="text-body-2 text-medium-emphasis">CPA</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts -->
      <v-row class="mb-6">
        <v-col cols="12" lg="8">
          <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
              <span>Динамика показателей</span>
              <v-btn-toggle
                v-model="chartPeriod"
                mandatory
                variant="outlined"
                density="compact"
              >
                <v-btn value="7d">7 дней</v-btn>
                <v-btn value="30d">30 дней</v-btn>
                <v-btn value="90d">90 дней</v-btn>
              </v-btn-toggle>
            </v-card-title>
            <v-card-text>
              <div id="performance-chart" style="height: 300px;"></div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" lg="4">
          <v-card class="h-100">
            <v-card-title>Распределение бюджета</v-card-title>
            <v-card-text>
              <div id="budget-chart" style="height: 300px;"></div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Performance by Ad Groups -->
      <v-card class="mb-6">
        <v-card-title>Производительность по группам объявлений</v-card-title>
        <v-card-text>
          <v-data-table
            :headers="adGroupHeaders"
            :items="adGroupPerformance"
            :items-per-page="10"
            class="elevation-1"
          >
            <!-- Ad Group Name -->
            <template #item.name="{ item }">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="primary">mdi-folder</v-icon>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ item.creatives_count }} креативов
                  </div>
                </div>
              </div>
            </template>

            <!-- Status -->
            <template #item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                variant="flat"
              >
                {{ getStatusText(item.status) }}
              </v-chip>
            </template>

            <!-- Metrics -->
            <template #item.impressions="{ item }">
              {{ formatNumber(item.impressions) }}
            </template>

            <template #item.clicks="{ item }">
              {{ formatNumber(item.clicks) }}
            </template>

            <template #item.ctr="{ item }">
              {{ item.ctr }}%
            </template>

            <template #item.spent="{ item }">
              {{ formatCurrency(item.spent) }}
            </template>

            <template #item.cpc="{ item }">
              {{ formatCurrency(item.cpc) }}
            </template>

            <template #item.conversions="{ item }">
              {{ formatNumber(item.conversions) }}
            </template>

            <template #item.cpa="{ item }">
              {{ formatCurrency(item.cpa) }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <!-- Top Performing Creatives -->
      <v-card>
        <v-card-title>Лучшие креативы</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="creative in topCreatives"
              :key="creative.creative_id"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card variant="outlined" class="h-100">
                <div class="creative-preview pa-3">
                  <v-img
                    v-if="creative.creative_type === 'image' && creative.thumbnail"
                    :src="creative.thumbnail"
                    height="120"
                    cover
                    class="rounded"
                  />
                  <div
                    v-else
                    class="d-flex align-center justify-center rounded"
                    style="height: 120px; background: #f5f5f5;"
                  >
                    <v-icon size="48" color="grey">
                      {{ getCreativeTypeIcon(creative.creative_type) }}
                    </v-icon>
                  </div>
                </div>
                <v-card-text>
                  <h4 class="text-subtitle-2 mb-2">{{ creative.name }}</h4>
                  <div class="text-body-2 text-medium-emphasis mb-3">
                    {{ getCreativeTypeText(creative.creative_type) }}
                  </div>
                  <v-row dense>
                    <v-col cols="6">
                      <div class="text-caption text-medium-emphasis">CTR</div>
                      <div class="font-weight-medium">{{ creative.ctr }}%</div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-medium-emphasis">CPC</div>
                      <div class="font-weight-medium">{{ formatCurrency(creative.cpc) }}</div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-medium-emphasis">Конверсии</div>
                      <div class="font-weight-medium">{{ creative.conversions }}</div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-medium-emphasis">CPA</div>
                      <div class="font-weight-medium">{{ formatCurrency(creative.cpa) }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  campaign: {
    type: Object,
    required: true
  },
  performanceData: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Local state
const chartPeriod = ref('30d')

// Computed
const adGroupPerformance = computed(() => {
  return props.performanceData?.ad_groups || []
})

const topCreatives = computed(() => {
  return props.performanceData?.top_creatives || []
})

// Table headers
const adGroupHeaders = [
  { title: 'Группа объявлений', key: 'name', sortable: true, width: '20%' },
  { title: 'Статус', key: 'status', sortable: true, width: '10%' },
  { title: 'Показы', key: 'impressions', sortable: true, width: '10%' },
  { title: 'Клики', key: 'clicks', sortable: true, width: '10%' },
  { title: 'CTR', key: 'ctr', sortable: true, width: '8%' },
  { title: 'Потрачено', key: 'spent', sortable: true, width: '12%' },
  { title: 'CPC', key: 'cpc', sortable: true, width: '10%' },
  { title: 'Конверсии', key: 'conversions', sortable: true, width: '10%' },
  { title: 'CPA', key: 'cpa', sortable: true, width: '10%' }
]

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    paused: 'warning',
    draft: 'grey',
    completed: 'info',
    archived: 'grey-darken-2'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Активна',
    paused: 'На паузе',
    draft: 'Черновик',
    completed: 'Завершена',
    archived: 'Архив'
  }
  return texts[status] || status
}

const getCreativeTypeIcon = (type) => {
  const icons = {
    image: 'mdi-image',
    video: 'mdi-play',
    carousel: 'mdi-view-carousel',
    collection: 'mdi-view-grid',
    text: 'mdi-text'
  }
  return icons[type] || 'mdi-file'
}

const getCreativeTypeText = (type) => {
  const texts = {
    image: 'Изображение',
    video: 'Видео',
    carousel: 'Карусель',
    collection: 'Коллекция',
    text: 'Текст'
  }
  return texts[type] || type
}

// Lifecycle
onMounted(() => {
  // Initialize charts here if needed
  // For now, just placeholder
})
</script>

<style scoped>
.campaign-performance {
  max-width: 100%;
}

.creative-preview {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>