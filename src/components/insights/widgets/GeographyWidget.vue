<template>
  <div class="geography-widget">
    <div
      v-if="loading"
      class="geo-loading"
    >
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      />
      <div class="mt-4 text-body-2 text-medium-emphasis">
        Загрузка географических данных...
      </div>
    </div>

    <div
      v-else-if="!hasData"
      class="geo-empty"
    >
      <v-icon
        size="64"
        color="grey-lighten-2"
      >
        mdi-map-outline
      </v-icon>
      <div class="mt-4 text-body-2 text-medium-emphasis">
        Нет географических данных
      </div>
    </div>

    <div
      v-else
      class="geo-content"
    >
      <!-- Карта России -->
      <div class="geo-map">
        <div
          ref="mapContainer"
          class="map-container"
        />
      </div>

      <!-- Топ регионов -->
      <div class="geo-regions">
        <div class="regions-header">
          <h4 class="text-subtitle-1 font-weight-medium">
            Топ регионы по {{ metricLabel }}
          </h4>
          <v-btn
            size="small"
            variant="text"
            @click="showAllRegions = !showAllRegions"
          >
            {{ showAllRegions ? 'Скрыть' : 'Показать все' }}
          </v-btn>
        </div>

        <div class="regions-list">
          <div
            v-for="(region, index) in displayedRegions"
            :key="region.id"
            class="region-item"
            :class="{ 'region-selected': selectedRegion?.id === region.id }"
            @click="onRegionClick(region)"
          >
            <div class="region-rank">
              {{ index + 1 }}
            </div>
            <div class="region-info">
              <div class="region-name">
                {{ region.name }}
              </div>
              <div class="region-details">
                <span class="region-value">{{ formatValue(region.value) }}</span>
                <span
                  v-if="region.growth !== undefined"
                  class="region-growth"
                  :class="getGrowthColor(region.growth)"
                >
                  {{ formatGrowth(region.growth) }}
                </span>
              </div>
            </div>
            <div class="region-bar">
              <div
                class="region-bar-fill"
                :style="{
                  width: `${(region.value / maxRegionValue) * 100}%`,
                  backgroundColor: getRegionColor(region.value)
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="geo-stats">
        <v-row dense>
          <v-col cols="6">
            <div class="stat-card">
              <div class="stat-title">Всего регионов</div>
              <div class="stat-value">{{ totalRegions }}</div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="stat-card">
              <div class="stat-title">Лидирующий регион</div>
              <div class="stat-value">{{ topRegion?.name || '—' }}</div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="stat-card">
              <div class="stat-title">Доля топ-10</div>
              <div class="stat-value">{{ topRegionsShare.toFixed(1) }}%</div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="stat-card">
              <div class="stat-title">Средний рост</div>
              <div class="stat-value" :class="getGrowthColor(averageGrowth)">
                {{ formatGrowth(averageGrowth) }}
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- Диалог детализации региона -->
    <v-dialog
      v-model="showRegionDialog"
      max-width="600"
    >
      <v-card v-if="selectedRegion">
        <v-card-title>
          <v-icon class="me-2">mdi-map-marker</v-icon>
          {{ selectedRegion.name }}
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <div class="detail-item">
                <div class="detail-label">{{ metricLabel }}</div>
                <div class="detail-value text-h6">
                  {{ formatValue(selectedRegion.value) }}
                </div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="detail-item">
                <div class="detail-label">Рост</div>
                <div
                  class="detail-value text-h6"
                  :class="getGrowthColor(selectedRegion.growth)"
                >
                  {{ formatGrowth(selectedRegion.growth) }}
                </div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="detail-item">
                <div class="detail-label">Доля в общем объеме</div>
                <div class="detail-value text-h6">
                  {{ ((selectedRegion.value / totalValue) * 100).toFixed(1) }}%
                </div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="detail-item">
                <div class="detail-label">Позиция в рейтинге</div>
                <div class="detail-value text-h6">
                  #{{ getRegionRank(selectedRegion) }}
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Дополнительные метрики -->
          <div
            v-if="selectedRegion.additionalMetrics"
            class="mt-4"
          >
            <div class="text-subtitle-2 mb-2">Дополнительные показатели</div>
            <v-row dense>
              <v-col
                v-for="metric in selectedRegion.additionalMetrics"
                :key="metric.key"
                cols="6"
              >
                <div class="detail-item">
                  <div class="detail-label">{{ metric.label }}</div>
                  <div class="detail-value">{{ metric.value }}</div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showRegionDialog = false">Закрыть</v-btn>
          <v-btn
            color="primary"
            @click="drillDownRegion"
          >
            Детализация
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

export default {
  name: 'GeographyWidget',
  emits: ['region-click', 'drill-down'],
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    metric: {
      type: String,
      default: 'revenue'
    },
    showMap: {
      type: Boolean,
      default: true
    },
    maxRegions: {
      type: Number,
      default: 10
    }
  },
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const showAllRegions = ref(false)
    const showRegionDialog = ref(false)
    const selectedRegion = ref(null)
    const mapInstance = ref(null)

    // Computed properties
    const hasData = computed(() => {
      return Array.isArray(props.data) && props.data.length > 0
    })

    const metricLabel = computed(() => {
      const labels = {
        revenue: 'Доходу',
        conversions: 'Конверсиям',
        clicks: 'Кликам',
        impressions: 'Показам',
        users: 'Пользователям'
      }
      return labels[props.metric] || props.metric
    })

    const sortedRegions = computed(() => {
      if (!hasData.value) return []
      return [...props.data].sort((a, b) => (b.value || 0) - (a.value || 0))
    })

    const displayedRegions = computed(() => {
      const limit = showAllRegions.value ? sortedRegions.value.length : props.maxRegions
      return sortedRegions.value.slice(0, limit)
    })

    const maxRegionValue = computed(() => {
      if (!hasData.value) return 0
      return Math.max(...props.data.map(r => r.value || 0))
    })

    const totalRegions = computed(() => props.data.length)

    const topRegion = computed(() => sortedRegions.value[0] || null)

    const totalValue = computed(() => {
      return props.data.reduce((sum, region) => sum + (region.value || 0), 0)
    })

    const topRegionsShare = computed(() => {
      if (!hasData.value || totalValue.value === 0) return 0
      const topValue = sortedRegions.value
        .slice(0, 10)
        .reduce((sum, region) => sum + (region.value || 0), 0)
      return (topValue / totalValue.value) * 100
    })

    const averageGrowth = computed(() => {
      const regionsWithGrowth = props.data.filter(r => r.growth !== undefined)
      if (regionsWithGrowth.length === 0) return 0
      return regionsWithGrowth.reduce((sum, r) => sum + r.growth, 0) / regionsWithGrowth.length
    })

    // Methods
    const formatValue = (value) => {
      if (value === null || value === undefined) return '—'

      switch (props.metric) {
        case 'revenue':
          return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
          }).format(value)
        default:
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}М`
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}К`
          }
          return new Intl.NumberFormat('ru-RU').format(value)
      }
    }

    const formatGrowth = (growth) => {
      if (growth === null || growth === undefined) return '—'
      return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
    }

    const getGrowthColor = (growth) => {
      if (growth === null || growth === undefined) return ''
      if (growth > 0) return 'text-success'
      if (growth < 0) return 'text-error'
      return 'text-medium-emphasis'
    }

    const getRegionColor = (value) => {
      const intensity = (value / maxRegionValue.value) * 100
      if (intensity > 80) return '#1976D2'
      if (intensity > 60) return '#42A5F5'
      if (intensity > 40) return '#90CAF9'
      if (intensity > 20) return '#BBDEFB'
      return '#E3F2FD'
    }

    const getRegionRank = (region) => {
      return sortedRegions.value.findIndex(r => r.id === region.id) + 1
    }

    const onRegionClick = (region) => {
      selectedRegion.value = region
      showRegionDialog.value = true
      emit('region-click', region)
    }

    const drillDownRegion = () => {
      emit('drill-down', selectedRegion.value)
      showRegionDialog.value = false
    }

    const initMap = () => {
      if (!mapContainer.value || !props.showMap) return

      // Простая имитация карты - в реальном проекте здесь будет интеграция с Yandex Maps или подобной
      const mapDiv = mapContainer.value
      mapDiv.innerHTML = `
        <div style="
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        ">
          <div style="
            text-align: center;
            color: #1976d2;
            font-size: 14px;
            font-weight: 500;
          ">
            <div style="margin-bottom: 8px;">🗺️</div>
            <div>Интерактивная карта России</div>
            <div style="font-size: 12px; opacity: 0.7; margin-top: 4px;">
              Показаны данные по ${totalRegions.value} регионам
            </div>
          </div>
        </div>
      `

      // Добавляем точки регионов
      const topRegions = sortedRegions.value.slice(0, 5)
      topRegions.forEach((region, index) => {
        const dot = document.createElement('div')
        dot.style.cssText = `
          position: absolute;
          width: 8px;
          height: 8px;
          background: #1976d2;
          border-radius: 50%;
          cursor: pointer;
          top: ${20 + index * 15}%;
          left: ${30 + (index % 3) * 20}%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `
        dot.title = `${region.name}: ${formatValue(region.value)}`
        dot.addEventListener('click', () => onRegionClick(region))
        mapDiv.appendChild(dot)
      })
    }

    // Watchers
    watch(() => props.data, () => {
      nextTick(() => {
        initMap()
      })
    }, { deep: true })

    watch(() => props.showMap, () => {
      nextTick(() => {
        initMap()
      })
    })

    // Lifecycle
    onMounted(() => {
      nextTick(() => {
        if (hasData.value && !props.loading) {
          initMap()
        }
      })
    })

    onUnmounted(() => {
      if (mapInstance.value) {
        // Cleanup map instance
        mapInstance.value = null
      }
    })

    return {
      mapContainer,
      showAllRegions,
      showRegionDialog,
      selectedRegion,
      hasData,
      metricLabel,
      displayedRegions,
      maxRegionValue,
      totalRegions,
      topRegion,
      totalValue,
      topRegionsShare,
      averageGrowth,
      formatValue,
      formatGrowth,
      getGrowthColor,
      getRegionColor,
      getRegionRank,
      onRegionClick,
      drillDownRegion
    }
  }
}
</script>

<style scoped>
.geography-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.geo-loading,
.geo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.geo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.geo-map {
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

.regions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.regions-list {
  max-height: 200px;
  overflow-y: auto;
}

.region-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.region-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.region-selected {
  background-color: rgba(25, 118, 210, 0.08);
}

.region-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-right: 12px;
}

.region-info {
  flex: 1;
  min-width: 0;
}

.region-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
}

.region-details {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.region-value {
  font-weight: 600;
  color: #1976d2;
}

.region-growth {
  font-size: 11px;
}

.region-bar {
  width: 60px;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
  margin-left: 12px;
}

.region-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.geo-stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.stat-card {
  text-align: center;
  padding: 8px;
}

.stat-title {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.detail-value {
  font-weight: 600;
}

@media (max-width: 768px) {
  .geo-map {
    height: 120px;
  }

  .regions-list {
    max-height: 150px;
  }

  .region-item {
    padding: 6px 8px;
  }

  .region-rank {
    width: 20px;
    height: 20px;
    font-size: 11px;
    margin-right: 8px;
  }

  .region-bar {
    width: 40px;
  }
}
</style>