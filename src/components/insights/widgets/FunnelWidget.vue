<template>
  <div class="funnel-widget">
    <div
      v-if="loading"
      class="funnel-loading"
    >
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      />
      <div class="mt-4 text-body-2 text-medium-emphasis">
        Загрузка данных воронки...
      </div>
    </div>

    <div
      v-else-if="!hasData"
      class="funnel-empty"
    >
      <v-icon
        size="64"
        color="grey-lighten-2"
      >
        mdi-filter-variant
      </v-icon>
      <div class="mt-4 text-body-2 text-medium-emphasis">
        Нет данных воронки
      </div>
    </div>

    <div
      v-else
      class="funnel-content"
    >
      <!-- Визуализация воронки -->
      <div class="funnel-stages">
        <div
          v-for="(stage, index) in processedStages"
          :key="stage.id"
          class="funnel-stage"
          :class="{ 'stage-clickable': stage.clickable }"
          @click="onStageClick(stage, index)"
        >
          <!-- Блок этапа -->
          <div
            class="stage-block"
            :style="getStageStyle(stage, index)"
          >
            <div class="stage-content">
              <div class="stage-name">
                {{ stage.name }}
              </div>
              <div class="stage-value">
                {{ formatValue(stage.value) }}
              </div>
              <div class="stage-percentage">
                {{ stage.percentage.toFixed(1) }}%
              </div>
            </div>
          </div>

          <!-- Стрелка между этапами -->
          <div
            v-if="index < processedStages.length - 1"
            class="stage-arrow"
          >
            <v-icon
              size="24"
              color="grey-lighten-1"
            >
              mdi-chevron-down
            </v-icon>
          </div>

          <!-- Конверсия между этапами -->
          <div
            v-if="index < processedStages.length - 1"
            class="conversion-rate"
          >
            <div
              class="conversion-value"
              :class="getConversionColor(stage.conversionToNext)"
            >
              {{ stage.conversionToNext.toFixed(1) }}%
            </div>
            <div class="conversion-label">
              конверсия
            </div>
          </div>
        </div>
      </div>

      <!-- Дополнительная статистика -->
      <div class="funnel-stats">
        <v-row>
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-item">
              <div class="stat-value text-h6 text-success">
                {{ formatValue(totalConversions) }}
              </div>
              <div class="stat-label text-caption text-medium-emphasis">
                Общие конверсии
              </div>
            </div>
          </v-col>
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-item">
              <div class="stat-value text-h6 text-primary">
                {{ overallConversionRate.toFixed(1) }}%
              </div>
              <div class="stat-label text-caption text-medium-emphasis">
                Общая конверсия
              </div>
            </div>
          </v-col>
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-item">
              <div class="stat-value text-h6 text-warning">
                {{ averageDropOff.toFixed(1) }}%
              </div>
              <div class="stat-label text-caption text-medium-emphasis">
                Средний отсев
              </div>
            </div>
          </v-col>
          <v-col
            cols="6"
            md="3"
          >
            <div class="stat-item">
              <div class="stat-value text-h6 text-info">
                {{ biggestDropStage }}
              </div>
              <div class="stat-label text-caption text-medium-emphasis">
                Наибольший отсев
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Подробная таблица -->
      <div
        v-if="showDetails"
        class="funnel-details mt-4"
      >
        <v-data-table
          :headers="detailHeaders"
          :items="processedStages"
          hide-default-footer
          density="compact"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <div
                class="stage-indicator me-2"
                :style="{ backgroundColor: getStageColor(item.index) }"
              />
              {{ item.name }}
            </div>
          </template>

          <template #item.value="{ item }">
            {{ formatValue(item.value) }}
          </template>

          <template #item.percentage="{ item }">
            {{ item.percentage.toFixed(1) }}%
          </template>

          <template #item.conversionToNext="{ item }">
            <span
              v-if="item.conversionToNext !== null"
              :class="getConversionColor(item.conversionToNext)"
            >
              {{ item.conversionToNext.toFixed(1) }}%
            </span>
            <span
              v-else
              class="text-medium-emphasis"
            >
              —
            </span>
          </template>

          <template #item.dropOff="{ item }">
            <span
              v-if="item.dropOff !== null"
              class="text-error"
            >
              {{ item.dropOff.toFixed(1) }}%
            </span>
            <span
              v-else
              class="text-medium-emphasis"
            >
              —
            </span>
          </template>
        </v-data-table>
      </div>

      <!-- Переключатель деталей -->
      <div class="funnel-actions mt-4">
        <v-btn
          variant="outlined"
          size="small"
          @click="showDetails = !showDetails"
        >
          <v-icon class="me-1">
            {{ showDetails ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
          </v-icon>
          {{ showDetails ? 'Скрыть детали' : 'Показать детали' }}
        </v-btn>

        <v-btn
          variant="outlined"
          size="small"
          class="ml-2"
          @click="exportFunnelData"
        >
          <v-icon class="me-1">
            mdi-download
          </v-icon>
          Экспорт
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  name: 'FunnelWidget',
  emits: ['stage-click', 'export'],
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    valueFormat: {
      type: String,
      default: 'number' // number, currency, percent
    },
    showConversions: {
      type: Boolean,
      default: true
    },
    colors: {
      type: Array,
      default: () => [
        '#1976D2',
        '#388E3C',
        '#F57C00',
        '#7B1FA2',
        '#C2185B'
      ]
    }
  },
  setup(props, { emit }) {
    const showDetails = ref(false)

    // Computed properties
    const hasData = computed(() => {
      return Array.isArray(props.data) && props.data.length > 0
    })

    const processedStages = computed(() => {
      if (!hasData.value) return []

      const stages = [...props.data]
      const maxValue = Math.max(...stages.map(s => s.value || 0))

      return stages.map((stage, index) => {
        const nextStage = stages[index + 1]
        const prevStage = stages[index - 1]

        return {
          ...stage,
          index,
          percentage: maxValue > 0 ? (stage.value / maxValue) * 100 : 0,
          conversionToNext: nextStage ? (nextStage.value / stage.value) * 100 : null,
          dropOff: nextStage ? ((stage.value - nextStage.value) / stage.value) * 100 : null,
          clickable: true
        }
      })
    })

    const totalConversions = computed(() => {
      if (!hasData.value) return 0
      return processedStages.value[processedStages.value.length - 1]?.value || 0
    })

    const overallConversionRate = computed(() => {
      if (!hasData.value || processedStages.value.length === 0) return 0
      const firstStage = processedStages.value[0]
      const lastStage = processedStages.value[processedStages.value.length - 1]
      return firstStage.value > 0 ? (lastStage.value / firstStage.value) * 100 : 0
    })

    const averageDropOff = computed(() => {
      if (!hasData.value) return 0
      const dropOffs = processedStages.value
        .filter(stage => stage.dropOff !== null)
        .map(stage => stage.dropOff)

      return dropOffs.length > 0 ? dropOffs.reduce((sum, dropOff) => sum + dropOff, 0) / dropOffs.length : 0
    })

    const biggestDropStage = computed(() => {
      if (!hasData.value) return '—'

      let maxDropOff = 0
      let maxDropStage = ''

      processedStages.value.forEach(stage => {
        if (stage.dropOff !== null && stage.dropOff > maxDropOff) {
          maxDropOff = stage.dropOff
          maxDropStage = stage.name
        }
      })

      return maxDropStage || '—'
    })

    const detailHeaders = computed(() => [
      { title: 'Этап', key: 'name', sortable: false },
      { title: 'Значение', key: 'value', sortable: false },
      { title: 'Доля от начала', key: 'percentage', sortable: false },
      { title: 'Конверсия в след.', key: 'conversionToNext', sortable: false },
      { title: 'Отсев', key: 'dropOff', sortable: false }
    ])

    // Methods
    const formatValue = (value) => {
      if (value === null || value === undefined) return '—'

      switch (props.valueFormat) {
        case 'currency':
          return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
          }).format(value)
        case 'percent':
          return `${value.toFixed(1)}%`
        default:
          return new Intl.NumberFormat('ru-RU').format(value)
      }
    }

    const getStageStyle = (stage, index) => {
      const maxWidth = 300
      const minWidth = 80
      const width = minWidth + (stage.percentage / 100) * (maxWidth - minWidth)

      return {
        width: `${width}px`,
        backgroundColor: getStageColor(index),
        background: `linear-gradient(135deg, ${getStageColor(index)}, ${getStageColor(index)}dd)`
      }
    }

    const getStageColor = (index) => {
      return props.colors[index % props.colors.length]
    }

    const getConversionColor = (conversionRate) => {
      if (conversionRate >= 70) return 'text-success'
      if (conversionRate >= 40) return 'text-warning'
      return 'text-error'
    }

    const onStageClick = (stage, index) => {
      emit('stage-click', { stage, index })
    }

    const exportFunnelData = () => {
      emit('export', {
        data: processedStages.value,
        summary: {
          totalConversions: totalConversions.value,
          overallConversionRate: overallConversionRate.value,
          averageDropOff: averageDropOff.value,
          biggestDropStage: biggestDropStage.value
        }
      })
    }

    return {
      showDetails,
      hasData,
      processedStages,
      totalConversions,
      overallConversionRate,
      averageDropOff,
      biggestDropStage,
      detailHeaders,
      formatValue,
      getStageStyle,
      getStageColor,
      getConversionColor,
      onStageClick,
      exportFunnelData
    }
  }
}
</script>

<style scoped>
.funnel-widget {
  width: 100%;
  height: 100%;
  padding: 16px;
}

.funnel-loading,
.funnel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
}

.funnel-content {
  height: 100%;
}

.funnel-stages {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.funnel-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
}

.stage-block {
  min-height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  position: relative;
}

.stage-clickable .stage-block {
  cursor: pointer;
}

.stage-clickable .stage-block:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.stage-content {
  text-align: center;
  padding: 12px 20px;
}

.stage-name {
  font-size: 14px;
  margin-bottom: 4px;
}

.stage-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 2px;
}

.stage-percentage {
  font-size: 12px;
  opacity: 0.9;
}

.stage-arrow {
  margin: 8px 0;
}

.conversion-rate {
  text-align: center;
  margin-bottom: 8px;
}

.conversion-value {
  font-size: 14px;
  font-weight: 600;
}

.conversion-label {
  font-size: 11px;
  color: #666;
  margin-top: 2px;
}

.funnel-stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  margin-bottom: 4px;
}

.stat-label {
  line-height: 1.2;
}

.stage-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.funnel-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .stage-block {
    min-width: 200px;
  }

  .stage-content {
    padding: 8px 16px;
  }

  .stage-name {
    font-size: 12px;
  }

  .stage-value {
    font-size: 16px;
  }
}
</style>