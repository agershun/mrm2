<template>
  <div class="touchpoint-analysis">
    <v-card>
      <v-card-title>
        <div class="d-flex justify-space-between align-center w-100">
          <span>Анализ точек касания</span>
          <v-btn-toggle v-model="viewMode" mandatory size="small">
            <v-btn value="funnel" size="small">Воронка</v-btn>
            <v-btn value="heatmap" size="small">Тепловая карта</v-btn>
            <v-btn value="flow" size="small">Поток</v-btn>
          </v-btn-toggle>
        </div>
      </v-card-title>

      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-2">Анализ точек касания...</p>
        </div>

        <div v-else-if="!data || data.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-2">mdi-map-marker-path</v-icon>
          <p class="text-grey mt-2">Нет данных для анализа</p>
        </div>

        <div v-else>
          <!-- Воронка -->
          <div v-if="viewMode === 'funnel'" class="funnel-view">
            <div class="funnel-container">
              <div
                v-for="(touchpoint, index) in sortedTouchpoints"
                :key="touchpoint.touchpoint_id"
                class="funnel-step"
                :style="getFunnelStepStyle(touchpoint, index)"
              >
                <div class="funnel-step-content">
                  <div class="funnel-step-header">
                    <v-icon :color="getTouchpointColor(touchpoint.type)" class="me-2">
                      {{ getTouchpointIcon(touchpoint.type) }}
                    </v-icon>
                    <span class="font-weight-medium">{{ touchpoint.name }}</span>
                  </div>

                  <div class="funnel-step-metrics">
                    <div class="metric">
                      <div class="metric-value">{{ formatNumber(touchpoint.users) }}</div>
                      <div class="metric-label">Пользователей</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">{{ touchpoint.conversion_rate }}%</div>
                      <div class="metric-label">Конверсия</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">{{ formatCurrency(touchpoint.revenue) }}</div>
                      <div class="metric-label">Доходы</div>
                    </div>
                  </div>

                  <div class="funnel-step-bar">
                    <v-progress-linear
                      :model-value="touchpoint.conversion_rate"
                      :color="getConversionColor(touchpoint.conversion_rate)"
                      height="8"
                      rounded
                    />
                  </div>
                </div>

                <!-- Стрелка перехода -->
                <div v-if="index < sortedTouchpoints.length - 1" class="funnel-arrow">
                  <v-icon color="grey">mdi-arrow-down</v-icon>
                  <div class="arrow-label">
                    {{ getDropoffRate(index) }}% отсев
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Тепловая карта -->
          <div v-if="viewMode === 'heatmap'" class="heatmap-view">
            <div class="heatmap-grid">
              <div class="heatmap-header">
                <div class="heatmap-cell corner-cell"></div>
                <div
                  v-for="touchpoint in data"
                  :key="`header-${touchpoint.touchpoint_id}`"
                  class="heatmap-cell header-cell"
                >
                  {{ touchpoint.name }}
                </div>
              </div>

              <div
                v-for="fromTouchpoint in data"
                :key="`row-${fromTouchpoint.touchpoint_id}`"
                class="heatmap-row"
              >
                <div class="heatmap-cell row-header">
                  {{ fromTouchpoint.name }}
                </div>
                <div
                  v-for="toTouchpoint in data"
                  :key="`cell-${fromTouchpoint.touchpoint_id}-${toTouchpoint.touchpoint_id}`"
                  class="heatmap-cell data-cell"
                  :style="getHeatmapCellStyle(fromTouchpoint, toTouchpoint)"
                  @click="selectTransition(fromTouchpoint, toTouchpoint)"
                >
                  {{ getTransitionRate(fromTouchpoint, toTouchpoint) }}%
                </div>
              </div>
            </div>

            <!-- Легенда тепловой карты -->
            <div class="heatmap-legend mt-4">
              <div class="d-flex align-center">
                <span class="text-caption me-2">Интенсивность переходов:</span>
                <div class="legend-gradient"></div>
                <span class="text-caption ms-2">0% → 100%</span>
              </div>
            </div>
          </div>

          <!-- Поток -->
          <div v-if="viewMode === 'flow'" class="flow-view">
            <div class="flow-diagram">
              <div
                v-for="(touchpoint, index) in sortedTouchpoints"
                :key="touchpoint.touchpoint_id"
                class="flow-node"
                :style="getFlowNodeStyle(touchpoint, index)"
              >
                <div class="flow-node-content">
                  <v-avatar
                    size="48"
                    :color="getTouchpointColor(touchpoint.type)"
                  >
                    <v-icon color="white">{{ getTouchpointIcon(touchpoint.type) }}</v-icon>
                  </v-avatar>
                  <div class="flow-node-label">{{ touchpoint.name }}</div>
                  <div class="flow-node-users">{{ formatNumber(touchpoint.users) }}</div>
                </div>

                <!-- Связи -->
                <div v-if="index < sortedTouchpoints.length - 1" class="flow-connection">
                  <div
                    class="flow-line"
                    :style="getFlowLineStyle(touchpoint, sortedTouchpoints[index + 1])"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Детали выбранного перехода -->
          <v-card v-if="selectedTransition" variant="outlined" class="mt-4">
            <v-card-title class="text-subtitle-1">
              Переход: {{ selectedTransition.from.name }} → {{ selectedTransition.to.name }}
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="3">
                  <div class="text-caption text-grey">Пользователей</div>
                  <div class="font-weight-medium">{{ formatNumber(selectedTransition.users) }}</div>
                </v-col>
                <v-col cols="3">
                  <div class="text-caption text-grey">Конверсия</div>
                  <div class="font-weight-medium">{{ selectedTransition.conversion_rate }}%</div>
                </v-col>
                <v-col cols="3">
                  <div class="text-caption text-grey">Время перехода</div>
                  <div class="font-weight-medium">{{ selectedTransition.avg_time }}</div>
                </v-col>
                <v-col cols="3">
                  <div class="text-caption text-grey">Доходы</div>
                  <div class="font-weight-medium">{{ formatCurrency(selectedTransition.revenue) }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['transition-selected'])

const viewMode = ref('funnel')
const selectedTransition = ref(null)

const sortedTouchpoints = computed(() => {
  return [...props.data].sort((a, b) => (b.users || 0) - (a.users || 0))
})

const getTouchpointColor = (type) => {
  const colors = {
    awareness: 'blue',
    consideration: 'orange',
    decision: 'green',
    retention: 'purple',
    advocacy: 'pink'
  }
  return colors[type] || 'grey'
}

const getTouchpointIcon = (type) => {
  const icons = {
    awareness: 'mdi-eye',
    consideration: 'mdi-head-question',
    decision: 'mdi-cart',
    retention: 'mdi-heart',
    advocacy: 'mdi-share'
  }
  return icons[type] || 'mdi-circle'
}

const getFunnelStepStyle = (touchpoint, index) => {
  const maxUsers = Math.max(...props.data.map(t => t.users || 0))
  const width = Math.max(20, (touchpoint.users / maxUsers) * 80)

  return {
    width: `${width}%`,
    margin: '0 auto',
    marginBottom: index < sortedTouchpoints.value.length - 1 ? '24px' : '0'
  }
}

const getConversionColor = (rate) => {
  if (rate >= 20) return 'success'
  if (rate >= 10) return 'warning'
  if (rate >= 5) return 'orange'
  return 'error'
}

const getDropoffRate = (index) => {
  if (index >= sortedTouchpoints.value.length - 1) return 0

  const current = sortedTouchpoints.value[index]
  const next = sortedTouchpoints.value[index + 1]

  const dropoff = ((current.users - next.users) / current.users) * 100
  return Math.round(dropoff)
}

const getHeatmapCellStyle = (from, to) => {
  const rate = getTransitionRate(from, to)
  const intensity = rate / 100

  return {
    backgroundColor: `rgba(76, 175, 80, ${intensity})`,
    color: intensity > 0.5 ? 'white' : 'black'
  }
}

const getTransitionRate = (from, to) => {
  // Симуляция данных перехода
  if (from.touchpoint_id === to.touchpoint_id) return 100

  const fromIndex = props.data.findIndex(t => t.touchpoint_id === from.touchpoint_id)
  const toIndex = props.data.findIndex(t => t.touchpoint_id === to.touchpoint_id)

  if (Math.abs(fromIndex - toIndex) === 1) {
    return Math.round(Math.random() * 50 + 25) // 25-75%
  }

  return Math.round(Math.random() * 20) // 0-20%
}

const getFlowNodeStyle = (touchpoint, index) => {
  return {
    left: `${(index * 200) + 50}px`,
    top: '50px'
  }
}

const getFlowLineStyle = (from, to) => {
  const rate = getTransitionRate(from, to)
  const width = Math.max(2, (rate / 100) * 10)

  return {
    width: `${width}px`,
    backgroundColor: rate > 50 ? '#4caf50' : rate > 25 ? '#ff9800' : '#f44336'
  }
}

const selectTransition = (from, to) => {
  if (from.touchpoint_id === to.touchpoint_id) return

  selectedTransition.value = {
    from,
    to,
    users: Math.round((from.users || 0) * (getTransitionRate(from, to) / 100)),
    conversion_rate: getTransitionRate(from, to),
    avg_time: `${Math.round(Math.random() * 120 + 30)} мин`,
    revenue: Math.round((from.revenue || 0) * (getTransitionRate(from, to) / 100))
  }

  emit('transition-selected', selectedTransition.value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('ru-RU').format(value)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(value)
}
</script>

<style scoped>
.funnel-container {
  padding: 32px 16px;
}

.funnel-step {
  background: rgb(var(--v-theme-surface));
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 16px;
  position: relative;
}

.funnel-step-content {
  text-align: center;
}

.funnel-step-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.funnel-step-metrics {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
}

.metric {
  text-align: center;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: bold;
}

.metric-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.funnel-arrow {
  text-align: center;
  margin: 12px 0;
}

.arrow-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.heatmap-grid {
  display: inline-block;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  overflow: hidden;
}

.heatmap-header,
.heatmap-row {
  display: flex;
}

.heatmap-cell {
  min-width: 80px;
  min-height: 60px;
  padding: 8px;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.875rem;
}

.corner-cell,
.header-cell,
.row-header {
  background-color: rgb(var(--v-theme-surface-variant));
  font-weight: 500;
}

.data-cell {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.data-cell:hover {
  transform: scale(1.1);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.legend-gradient {
  width: 100px;
  height: 16px;
  background: linear-gradient(to right, rgba(76, 175, 80, 0) 0%, rgba(76, 175, 80, 1) 100%);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}

.flow-diagram {
  position: relative;
  height: 200px;
  overflow-x: auto;
  padding: 16px;
}

.flow-node {
  position: absolute;
  text-align: center;
}

.flow-node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-node-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 8px;
}

.flow-node-users {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 4px;
}

.flow-connection {
  position: absolute;
  left: 100%;
  top: 50%;
  width: 150px;
  height: 2px;
  display: flex;
  align-items: center;
}

.flow-line {
  height: 100%;
  border-radius: 1px;
  flex: 1;
}
</style>