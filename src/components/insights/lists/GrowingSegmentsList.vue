<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Растущие сегменты</span>
        <div>
          <v-btn-toggle v-model="sortBy" mandatory size="small">
            <v-btn value="growth" size="small">По росту</v-btn>
            <v-btn value="revenue" size="small">По доходам</v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Загрузка сегментов...</p>
      </div>

      <div v-else-if="!segments || segments.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-2">mdi-chart-line</v-icon>
        <p class="text-grey mt-2">Нет данных для отображения</p>
      </div>

      <div v-else>
        <!-- Топ растущие сегменты -->
        <div class="mb-4">
          <v-card variant="outlined" class="mb-3">
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-icon color="success" class="me-2">mdi-trending-up</v-icon>
                <span class="text-subtitle-1 font-weight-medium">Лидеры роста</span>
              </div>

              <v-list density="compact">
                <v-list-item
                  v-for="segment in topGrowingSegments"
                  :key="segment.segment_id"
                  class="px-0"
                >
                  <template #prepend>
                    <v-avatar
                      :color="getSegmentColor(segment.segment_type)"
                      size="32"
                      class="me-3"
                    >
                      <v-icon size="16" color="white">
                        {{ getSegmentIcon(segment.segment_type) }}
                      </v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">
                    {{ segment.segment_name }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ segment.segment_type }} • {{ formatNumber(segment.audience_size) }} пользователей
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="text-right">
                      <v-chip
                        size="small"
                        :color="getGrowthColor(segment.growth_rate)"
                        variant="tonal"
                      >
                        +{{ segment.growth_rate }}%
                      </v-chip>
                      <div class="text-caption text-grey mt-1">
                        {{ formatCurrency(segment.revenue) }}
                      </div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </div>

        <!-- Все сегменты -->
        <div v-for="category in segmentsByCategory" :key="category.name" class="mb-4">
          <div class="d-flex align-center mb-2">
            <v-icon :color="category.color" class="me-2">{{ category.icon }}</v-icon>
            <span class="text-subtitle-2 font-weight-medium">{{ category.name }}</span>
            <v-spacer />
            <v-chip size="x-small" color="primary" variant="tonal">
              {{ category.segments.length }}
            </v-chip>
          </div>

          <v-card variant="outlined">
            <v-card-text class="pa-2">
              <div
                v-for="segment in category.segments"
                :key="segment.segment_id"
                class="segment-item pa-3 rounded mb-2"
                @click="selectSegment(segment)"
              >
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <div>
                      <div class="font-weight-medium">{{ segment.segment_name }}</div>
                      <div class="text-caption text-grey">
                        {{ formatNumber(segment.audience_size) }} пользователей
                      </div>
                    </div>
                  </div>

                  <div class="d-flex align-center">
                    <!-- Метрики производительности -->
                    <div class="text-right me-4">
                      <div class="text-caption text-grey">Доходы</div>
                      <div class="font-weight-medium">{{ formatCurrency(segment.revenue) }}</div>
                    </div>

                    <div class="text-right me-4">
                      <div class="text-caption text-grey">Конверсия</div>
                      <div class="font-weight-medium">{{ segment.conversion_rate }}%</div>
                    </div>

                    <!-- Рост -->
                    <div class="text-right me-4">
                      <div class="text-caption text-grey">Рост</div>
                      <v-chip
                        size="x-small"
                        :color="getGrowthColor(segment.growth_rate)"
                        variant="tonal"
                      >
                        {{ segment.growth_rate > 0 ? '+' : '' }}{{ segment.growth_rate }}%
                      </v-chip>
                    </div>

                    <!-- Прогресс -->
                    <div class="segment-progress">
                      <v-progress-circular
                        :model-value="segment.performance_score"
                        :color="getPerformanceColor(segment.performance_score)"
                        size="32"
                        width="3"
                      >
                        <span class="text-caption">{{ segment.performance_score }}</span>
                      </v-progress-circular>
                    </div>
                  </div>
                </div>

                <!-- Тренд -->
                <div class="mt-3">
                  <div class="d-flex align-center mb-2">
                    <span class="text-caption text-grey me-2">Тренд (30 дней):</span>
                    <v-icon
                      size="12"
                      :color="getTrendColor(segment.trend)"
                      :icon="getTrendIcon(segment.trend)"
                    />
                  </div>
                  <v-progress-linear
                    :model-value="Math.abs(segment.trend)"
                    :color="getTrendColor(segment.trend)"
                    height="4"
                    rounded
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  segments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['segment-selected'])

const sortBy = ref('growth')

const sortedSegments = computed(() => {
  const sorted = [...props.segments]

  if (sortBy.value === 'growth') {
    return sorted.sort((a, b) => b.growth_rate - a.growth_rate)
  } else {
    return sorted.sort((a, b) => b.revenue - a.revenue)
  }
})

const topGrowingSegments = computed(() => {
  return sortedSegments.value
    .filter(s => s.growth_rate > 0)
    .slice(0, 3)
})

const segmentsByCategory = computed(() => {
  const categories = {}

  sortedSegments.value.forEach(segment => {
    const type = segment.segment_type || 'other'
    if (!categories[type]) {
      categories[type] = {
        name: getSegmentTypeName(type),
        icon: getSegmentIcon(type),
        color: getSegmentColor(type),
        segments: []
      }
    }
    categories[type].segments.push(segment)
  })

  return Object.values(categories)
})

const getSegmentTypeName = (type) => {
  const names = {
    demographic: 'Демографические',
    behavioral: 'Поведенческие',
    geographic: 'Географические',
    psychographic: 'Психографические',
    custom: 'Пользовательские',
    other: 'Другие'
  }
  return names[type] || type
}

const getSegmentIcon = (type) => {
  const icons = {
    demographic: 'mdi-account-group',
    behavioral: 'mdi-brain',
    geographic: 'mdi-map-marker',
    psychographic: 'mdi-heart',
    custom: 'mdi-puzzle',
    other: 'mdi-shape'
  }
  return icons[type] || 'mdi-circle'
}

const getSegmentColor = (type) => {
  const colors = {
    demographic: 'primary',
    behavioral: 'info',
    geographic: 'success',
    psychographic: 'warning',
    custom: 'purple',
    other: 'grey'
  }
  return colors[type] || 'grey'
}

const getGrowthColor = (growth) => {
  if (growth >= 20) return 'success'
  if (growth >= 10) return 'info'
  if (growth >= 0) return 'warning'
  return 'error'
}

const getPerformanceColor = (score) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

const getTrendColor = (trend) => {
  if (trend > 0) return 'success'
  if (trend < 0) return 'error'
  return 'grey'
}

const getTrendIcon = (trend) => {
  if (trend > 0) return 'mdi-trending-up'
  if (trend < 0) return 'mdi-trending-down'
  return 'mdi-trending-neutral'
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
  return new Intl.NumberFormat('ru-RU', {
    notation: 'compact'
  }).format(value)
}

const selectSegment = (segment) => {
  emit('segment-selected', segment)
}
</script>

<style scoped>
.segment-item {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  transition: all 0.2s ease;
}

.segment-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.segment-item:last-child {
  margin-bottom: 0;
}

.segment-progress {
  display: flex;
  align-items: center;
  min-width: 32px;
}
</style>