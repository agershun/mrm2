<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Матрица согласованности данных</span>
        <v-btn
          icon="mdi-refresh"
          size="small"
          variant="text"
          @click="$emit('refresh')"
        />
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Анализ согласованности...</p>
      </div>

      <div v-else-if="!props.data.systems || props.data.systems.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-2">mdi-matrix</v-icon>
        <p class="text-grey mt-2">Нет данных для анализа</p>
      </div>

      <div v-else class="matrix-container">
        <!-- Легенда -->
        <div class="matrix-legend mb-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="pa-3">
                <div class="text-subtitle-2 mb-2">Уровни согласованности</div>
                <div class="d-flex align-center mb-2">
                  <div class="consistency-indicator excellent me-2"></div>
                  <span class="text-caption">90-100% - Отличная</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <div class="consistency-indicator good me-2"></div>
                  <span class="text-caption">75-89% - Хорошая</span>
                </div>
                <div class="d-flex align-center mb-2">
                  <div class="consistency-indicator fair me-2"></div>
                  <span class="text-caption">50-74% - Удовлетворительная</span>
                </div>
                <div class="d-flex align-center">
                  <div class="consistency-indicator poor me-2"></div>
                  <span class="text-caption">0-49% - Плохая</span>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="8">
              <v-card variant="outlined" class="pa-3">
                <div class="text-subtitle-2 mb-2">Общая статистика</div>
                <v-row>
                  <v-col cols="6" sm="3">
                    <div class="text-center">
                      <div class="text-h6 font-weight-bold text-success">{{ excellentCount }}</div>
                      <div class="text-caption text-grey">Отличных</div>
                    </div>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <div class="text-center">
                      <div class="text-h6 font-weight-bold text-info">{{ goodCount }}</div>
                      <div class="text-caption text-grey">Хороших</div>
                    </div>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <div class="text-center">
                      <div class="text-h6 font-weight-bold text-warning">{{ fairCount }}</div>
                      <div class="text-caption text-grey">Удовлетворительных</div>
                    </div>
                  </v-col>
                  <v-col cols="6" sm="3">
                    <div class="text-center">
                      <div class="text-h6 font-weight-bold text-error">{{ poorCount }}</div>
                      <div class="text-caption text-grey">Плохих</div>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Матрица -->
        <div class="matrix-grid">
          <div class="matrix-header">
            <div class="matrix-cell matrix-corner"></div>
            <div
              v-for="source in dataSources"
              :key="`header-${source}`"
              class="matrix-cell matrix-header-cell"
            >
              {{ source }}
            </div>
          </div>

          <div
            v-for="(sourceRow, rowIndex) in dataSources"
            :key="`row-${sourceRow}`"
            class="matrix-row"
          >
            <div class="matrix-cell matrix-row-header">
              {{ sourceRow }}
            </div>
            <div
              v-for="(sourceCol, colIndex) in dataSources"
              :key="`cell-${rowIndex}-${colIndex}`"
              class="matrix-cell matrix-data-cell"
              :class="getConsistencyClass(getConsistencyValue(sourceRow, sourceCol))"
              @click="selectCell(sourceRow, sourceCol)"
            >
              <div class="consistency-value">
                {{ formatConsistency(getConsistencyValue(sourceRow, sourceCol)) }}
              </div>
              <div class="consistency-details">
                {{ getRecordCount(sourceRow, sourceCol) }} записей
              </div>
            </div>
          </div>
        </div>

        <!-- Детали выбранной ячейки -->
        <v-card v-if="selectedCell" variant="outlined" class="mt-4">
          <v-card-title class="text-subtitle-1">
            Согласованность: {{ selectedCell.source1 }} ↔ {{ selectedCell.source2 }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <div class="text-caption text-grey">Уровень согласованности</div>
                <div class="d-flex align-center mt-1">
                  <v-progress-linear
                    :model-value="selectedCell.consistency_score"
                    :color="getConsistencyColor(selectedCell.consistency_score)"
                    height="8"
                    rounded
                    class="me-2"
                  />
                  <span class="font-weight-medium">{{ selectedCell.consistency_score }}%</span>
                </div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="text-caption text-grey">Проанализировано записей</div>
                <div class="font-weight-medium">{{ selectedCell.total_records?.toLocaleString('ru-RU') }}</div>
              </v-col>
              <v-col cols="12" md="4">
                <div class="text-caption text-grey">Несогласованных записей</div>
                <div class="font-weight-medium text-error">{{ selectedCell.inconsistent_records?.toLocaleString('ru-RU') }}</div>
              </v-col>
            </v-row>

            <!-- Основные проблемы -->
            <div v-if="selectedCell.main_issues && selectedCell.main_issues.length > 0" class="mt-4">
              <div class="text-subtitle-2 mb-2">Основные проблемы:</div>
              <v-chip-group>
                <v-chip
                  v-for="issue in selectedCell.main_issues"
                  :key="issue.type"
                  size="small"
                  :color="getIssueColor(issue.severity)"
                  variant="tonal"
                >
                  {{ getIssueTypeName(issue.type) }} ({{ issue.count }})
                </v-chip>
              </v-chip-group>
            </div>

            <!-- Примеры расхождений -->
            <div v-if="selectedCell.sample_discrepancies && selectedCell.sample_discrepancies.length > 0" class="mt-4">
              <div class="text-subtitle-2 mb-2">Примеры расхождений:</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th>Запись</th>
                    <th>{{ selectedCell.source1 }}</th>
                    <th>{{ selectedCell.source2 }}</th>
                    <th>Тип проблемы</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="discrepancy in selectedCell.sample_discrepancies.slice(0, 5)"
                    :key="discrepancy.record_id"
                  >
                    <td>{{ discrepancy.record_id }}</td>
                    <td>{{ discrepancy.source1_value }}</td>
                    <td>{{ discrepancy.source2_value }}</td>
                    <td>
                      <v-chip
                        size="x-small"
                        color="warning"
                        variant="tonal"
                      >
                        {{ getIssueTypeName(discrepancy.issue_type) }}
                      </v-chip>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <!-- Рекомендации -->
            <div v-if="selectedCell.recommendations && selectedCell.recommendations.length > 0" class="mt-4">
              <div class="text-subtitle-2 mb-2">Рекомендации:</div>
              <ul class="recommendations-list">
                <li
                  v-for="recommendation in selectedCell.recommendations"
                  :key="recommendation"
                  class="text-body-2 mb-1"
                >
                  {{ recommendation }}
                </li>
              </ul>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  data: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['refresh', 'cell-selected'])

const selectedCell = ref(null)

const dataSources = computed(() => {
  return props.data.systems || []
})

const excellentCount = computed(() => {
  if (!props.data.consistency) return 0
  let count = 0
  props.data.consistency.forEach(row => {
    row.forEach(score => {
      if (score >= 90) count++
    })
  })
  return count
})

const goodCount = computed(() => {
  if (!props.data.consistency) return 0
  let count = 0
  props.data.consistency.forEach(row => {
    row.forEach(score => {
      if (score >= 75 && score < 90) count++
    })
  })
  return count
})

const fairCount = computed(() => {
  if (!props.data.consistency) return 0
  let count = 0
  props.data.consistency.forEach(row => {
    row.forEach(score => {
      if (score >= 50 && score < 75) count++
    })
  })
  return count
})

const poorCount = computed(() => {
  if (!props.data.consistency) return 0
  let count = 0
  props.data.consistency.forEach(row => {
    row.forEach(score => {
      if (score < 50) count++
    })
  })
  return count
})

const getConsistencyValue = (source1, source2) => {
  if (!props.data.systems || !props.data.consistency) return 0

  const rowIndex = props.data.systems.indexOf(source1)
  const colIndex = props.data.systems.indexOf(source2)

  if (rowIndex === -1 || colIndex === -1) return 0

  return props.data.consistency[rowIndex]?.[colIndex] || 0
}

const getRecordCount = (source1, source2) => {
  if (source1 === source2) return 'N/A'

  // For demo purposes, generate a random record count based on consistency score
  const score = getConsistencyValue(source1, source2)
  if (score === 0) return '0'

  const baseRecords = Math.floor(Math.random() * 10000) + 1000
  return baseRecords.toLocaleString('ru-RU')
}

const getConsistencyClass = (score) => {
  if (score >= 90) return 'consistency-excellent'
  if (score >= 75) return 'consistency-good'
  if (score >= 50) return 'consistency-fair'
  return 'consistency-poor'
}

const getConsistencyColor = (score) => {
  if (score >= 90) return 'success'
  if (score >= 75) return 'info'
  if (score >= 50) return 'warning'
  return 'error'
}

const getIssueColor = (severity) => {
  const colors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success'
  }
  return colors[severity] || 'grey'
}

const getIssueTypeName = (type) => {
  const names = {
    amount_mismatch: 'Несоответствие сумм',
    date_format: 'Формат дат',
    vendor_name: 'Имена поставщиков',
    category_mapping: 'Сопоставление категорий',
    currency_conversion: 'Конвертация валют',
    rounding_differences: 'Различия в округлении'
  }
  return names[type] || type
}

const formatConsistency = (score) => {
  if (score === 100) return '100%'
  if (score === 0) return '—'
  return `${score}%`
}

const selectCell = (source1, source2) => {
  if (source1 === source2) return

  const score = getConsistencyValue(source1, source2)
  if (score === 0) return

  // Generate demo data for selected cell
  selectedCell.value = {
    source1,
    source2,
    consistency_score: score,
    total_records: Math.floor(Math.random() * 10000) + 1000,
    inconsistent_records: Math.floor((100 - score) * 50),
    main_issues: [
      { type: 'amount_mismatch', count: Math.floor(Math.random() * 20) + 5, severity: 'medium' },
      { type: 'date_format', count: Math.floor(Math.random() * 10) + 2, severity: 'low' }
    ],
    sample_discrepancies: [
      {
        record_id: 'REC_001',
        source1_value: '₽125,000',
        source2_value: '₽125,500',
        issue_type: 'amount_mismatch'
      },
      {
        record_id: 'REC_002',
        source1_value: '2024-12-15',
        source2_value: '15.12.2024',
        issue_type: 'date_format'
      }
    ],
    recommendations: [
      'Настроить автоматическую синхронизацию данных между системами',
      'Унифицировать форматы дат и валют',
      'Настроить регулярные проверки согласованности'
    ]
  }

  emit('cell-selected', selectedCell.value)
}
</script>

<style scoped>
.matrix-container {
  width: 100%;
  overflow-x: auto;
}

.matrix-grid {
  display: inline-block;
  min-width: 100%;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
}

.matrix-header {
  display: flex;
  background-color: rgb(var(--v-theme-surface-variant));
}

.matrix-row {
  display: flex;
}

.matrix-cell {
  min-width: 120px;
  min-height: 60px;
  padding: 8px;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.matrix-cell:last-child {
  border-right: none;
}

.matrix-corner {
  background-color: rgb(var(--v-theme-surface-variant));
}

.matrix-header-cell {
  font-weight: 500;
  font-size: 0.875rem;
}

.matrix-row-header {
  background-color: rgb(var(--v-theme-surface-variant));
  font-weight: 500;
  font-size: 0.875rem;
}

.matrix-data-cell {
  cursor: pointer;
  transition: all 0.2s ease;
}

.matrix-data-cell:hover {
  transform: scale(1.05);
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.consistency-value {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 4px;
}

.consistency-details {
  font-size: 0.75rem;
  opacity: 0.7;
}

.consistency-excellent {
  background-color: rgba(76, 175, 80, 0.1);
  color: rgb(76, 175, 80);
}

.consistency-good {
  background-color: rgba(33, 150, 243, 0.1);
  color: rgb(33, 150, 243);
}

.consistency-fair {
  background-color: rgba(255, 152, 0, 0.1);
  color: rgb(255, 152, 0);
}

.consistency-poor {
  background-color: rgba(244, 67, 54, 0.1);
  color: rgb(244, 67, 54);
}

.consistency-indicator {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.consistency-indicator.excellent {
  background-color: rgb(76, 175, 80);
}

.consistency-indicator.good {
  background-color: rgb(33, 150, 243);
}

.consistency-indicator.fair {
  background-color: rgb(255, 152, 0);
}

.consistency-indicator.poor {
  background-color: rgb(244, 67, 54);
}

.recommendations-list {
  margin: 0;
  padding-left: 16px;
}

.recommendations-list li {
  margin-bottom: 4px;
}
</style>