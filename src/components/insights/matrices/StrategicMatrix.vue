<template>
  <v-card>
    <v-card-title>
      <div class="d-flex justify-space-between align-center w-100">
        <span>Стратегическая матрица</span>
        <v-btn-toggle v-model="matrixType" mandatory size="small">
          <v-btn value="priority" size="small">Приоритеты</v-btn>
          <v-btn value="impact" size="small">Воздействие</v-btn>
          <v-btn value="risk" size="small">Риски</v-btn>
        </v-btn-toggle>
      </div>
    </v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-2">Построение матрицы...</p>
      </div>

      <div v-else-if="!data || data.length === 0" class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-2">mdi-matrix</v-icon>
        <p class="text-grey mt-2">Нет данных для построения матрицы</p>
      </div>

      <div v-else class="matrix-container">
        <!-- Матрица 2x2 -->
        <div class="strategic-matrix">
          <div class="matrix-grid">
            <!-- Заголовки осей -->
            <div class="axis-label y-axis">{{ getYAxisLabel() }}</div>
            <div class="axis-label x-axis">{{ getXAxisLabel() }}</div>

            <!-- Квадранты -->
            <div class="quadrant top-left" @click="selectQuadrant('high-low')">
              <div class="quadrant-label">{{ getQuadrantLabel('high-low') }}</div>
              <div class="quadrant-items">
                <div
                  v-for="item in getQuadrantItems('high-low')"
                  :key="item.investment_id"
                  class="matrix-item"
                  :style="getItemStyle(item)"
                  @click.stop="selectItem(item)"
                >
                  <div class="item-content">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-value">{{ formatCurrency(item.budget) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="quadrant top-right" @click="selectQuadrant('high-high')">
              <div class="quadrant-label">{{ getQuadrantLabel('high-high') }}</div>
              <div class="quadrant-items">
                <div
                  v-for="item in getQuadrantItems('high-high')"
                  :key="item.investment_id"
                  class="matrix-item"
                  :style="getItemStyle(item)"
                  @click.stop="selectItem(item)"
                >
                  <div class="item-content">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-value">{{ formatCurrency(item.budget) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="quadrant bottom-left" @click="selectQuadrant('low-low')">
              <div class="quadrant-label">{{ getQuadrantLabel('low-low') }}</div>
              <div class="quadrant-items">
                <div
                  v-for="item in getQuadrantItems('low-low')"
                  :key="item.investment_id"
                  class="matrix-item"
                  :style="getItemStyle(item)"
                  @click.stop="selectItem(item)"
                >
                  <div class="item-content">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-value">{{ formatCurrency(item.budget) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="quadrant bottom-right" @click="selectQuadrant('low-high')">
              <div class="quadrant-label">{{ getQuadrantLabel('low-high') }}</div>
              <div class="quadrant-items">
                <div
                  v-for="item in getQuadrantItems('low-high')"
                  :key="item.investment_id"
                  class="matrix-item"
                  :style="getItemStyle(item)"
                  @click.stop="selectItem(item)"
                >
                  <div class="item-content">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-value">{{ formatCurrency(item.budget) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Легенда -->
        <div class="matrix-legend mt-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-3">
                <div class="text-subtitle-2 mb-2">Рекомендации по квадрантам</div>
                <div
                  v-for="(recommendation, quadrant) in getQuadrantRecommendations()"
                  :key="quadrant"
                  class="mb-2"
                >
                  <div class="font-weight-medium">{{ getQuadrantLabel(quadrant) }}:</div>
                  <div class="text-caption">{{ recommendation }}</div>
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="pa-3">
                <div class="text-subtitle-2 mb-2">Распределение бюджета</div>
                <div
                  v-for="(allocation, quadrant) in budgetAllocation"
                  :key="quadrant"
                  class="d-flex justify-space-between align-center mb-1"
                >
                  <span class="text-caption">{{ getQuadrantLabel(quadrant) }}:</span>
                  <span class="font-weight-medium">{{ formatCurrency(allocation.budget) }}</span>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Детали выбранного элемента -->
        <v-card v-if="selectedItem" variant="outlined" class="mt-4">
          <v-card-title class="text-subtitle-1">{{ selectedItem.name }}</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <div class="text-caption text-grey">Бюджет</div>
                <div class="font-weight-medium">{{ formatCurrency(selectedItem.budget) }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-caption text-grey">{{ getYAxisLabel() }}</div>
                <div class="font-weight-medium">{{ selectedItem.y_value }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-caption text-grey">{{ getXAxisLabel() }}</div>
                <div class="font-weight-medium">{{ selectedItem.x_value }}</div>
              </v-col>
              <v-col cols="12" md="3">
                <div class="text-caption text-grey">ROI</div>
                <div class="font-weight-medium">{{ selectedItem.roi }}%</div>
              </v-col>
            </v-row>
            <div v-if="selectedItem.description" class="mt-3">
              <div class="text-caption text-grey">Описание</div>
              <div>{{ selectedItem.description }}</div>
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
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['item-selected', 'quadrant-selected'])

const matrixType = ref('priority')
const selectedItem = ref(null)

const budgetAllocation = computed(() => {
  const allocation = { 'high-high': { budget: 0, count: 0 }, 'high-low': { budget: 0, count: 0 }, 'low-high': { budget: 0, count: 0 }, 'low-low': { budget: 0, count: 0 } }

  props.data.forEach(item => {
    const quadrant = getItemQuadrant(item)
    allocation[quadrant].budget += item.budget || 0
    allocation[quadrant].count += 1
  })

  return allocation
})

const getYAxisLabel = () => {
  const labels = {
    priority: 'Стратегический приоритет',
    impact: 'Потенциальное воздействие',
    risk: 'Уровень риска'
  }
  return labels[matrixType.value] || 'Y-ось'
}

const getXAxisLabel = () => {
  const labels = {
    priority: 'Сложность реализации',
    impact: 'Стоимость реализации',
    risk: 'Вероятность успеха'
  }
  return labels[matrixType.value] || 'X-ось'
}

const getQuadrantLabel = (quadrant) => {
  const labels = {
    priority: {
      'high-high': 'Сложные приоритеты',
      'high-low': 'Быстрые победы',
      'low-high': 'Наполнители',
      'low-low': 'Отложить'
    },
    impact: {
      'high-high': 'Крупные проекты',
      'high-low': 'Низко висящие плоды',
      'low-high': 'Белые слоны',
      'low-low': 'Сомнительные'
    },
    risk: {
      'high-high': 'Высокий риск/Высокий шанс',
      'high-low': 'Высокий риск/Низкий шанс',
      'low-high': 'Низкий риск/Высокий шанс',
      'low-low': 'Низкий риск/Низкий шанс'
    }
  }
  return labels[matrixType.value]?.[quadrant] || quadrant
}

const getQuadrantRecommendations = () => {
  const recommendations = {
    priority: {
      'high-high': 'Планируйте тщательно, выделяйте достаточно ресурсов',
      'high-low': 'Реализуйте в первую очередь для быстрых результатов',
      'low-high': 'Рассмотрите альтернативы или отложите',
      'low-low': 'Исключите из планов'
    },
    impact: {
      'high-high': 'Стратегические инвестиции с долгосрочным планированием',
      'high-low': 'Быстрые улучшения с минимальными затратами',
      'low-high': 'Пересмотрите обоснованность или уменьшите масштаб',
      'low-low': 'Не рекомендуется к реализации'
    },
    risk: {
      'high-high': 'Требует детального анализа рисков и планирования',
      'high-low': 'Высокий риск, низкая отдача - избегайте',
      'low-high': 'Идеальные кандидаты для реализации',
      'low-low': 'Низкоприоритетные проекты'
    }
  }
  return recommendations[matrixType.value] || {}
}

const getItemQuadrant = (item) => {
  const yValue = item.y_value || 0
  const xValue = item.x_value || 0

  const yHigh = yValue >= 50
  const xHigh = xValue >= 50

  if (yHigh && xHigh) return 'high-high'
  if (yHigh && !xHigh) return 'high-low'
  if (!yHigh && xHigh) return 'low-high'
  return 'low-low'
}

const getQuadrantItems = (quadrant) => {
  return props.data.filter(item => getItemQuadrant(item) === quadrant)
}

const getItemStyle = (item) => {
  const budget = item.budget || 0
  const maxBudget = Math.max(...props.data.map(i => i.budget || 0))
  const size = Math.max(30, Math.min(80, 30 + (budget / maxBudget) * 50))

  return {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: getQuadrantColor(getItemQuadrant(item)),
    transform: selectedItem.value?.investment_id === item.investment_id ? 'scale(1.1)' : 'scale(1)'
  }
}

const getQuadrantColor = (quadrant) => {
  const colors = {
    'high-high': 'rgba(76, 175, 80, 0.8)',   // Зеленый
    'high-low': 'rgba(33, 150, 243, 0.8)',   // Синий
    'low-high': 'rgba(255, 152, 0, 0.8)',    // Оранжевый
    'low-low': 'rgba(244, 67, 54, 0.8)'      // Красный
  }
  return colors[quadrant] || 'rgba(128, 128, 128, 0.8)'
}

const selectItem = (item) => {
  selectedItem.value = selectedItem.value?.investment_id === item.investment_id ? null : item
  emit('item-selected', selectedItem.value)
}

const selectQuadrant = (quadrant) => {
  emit('quadrant-selected', quadrant)
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
.matrix-container {
  padding: 16px;
}

.strategic-matrix {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.matrix-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  height: 400px;
  border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
  position: relative;
}

.axis-label {
  position: absolute;
  font-weight: 500;
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.y-axis {
  left: -120px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  transform-origin: center;
}

.x-axis {
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
}

.quadrant {
  position: relative;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.quadrant:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.quadrant-label {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.6);
  background-color: rgba(var(--v-theme-surface), 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 2;
}

.quadrant-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding-top: 24px;
  height: 100%;
  overflow: hidden;
}

.matrix-item {
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  font-size: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.matrix-item:hover {
  transform: scale(1.1) !important;
  z-index: 3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.item-content {
  padding: 2px;
}

.item-name {
  font-weight: 500;
  line-height: 1;
  margin-bottom: 2px;
}

.item-value {
  font-size: 0.6rem;
  opacity: 0.9;
  line-height: 1;
}
</style>