<template>
  <div class="dashboard-edit-mode">
    <!-- Edit Mode Toolbar -->
    <div class="edit-toolbar">
      <v-card class="pa-3 mb-4" elevation="2">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="warning" class="me-2">mdi-pencil</v-icon>
            <div>
              <div class="text-subtitle-1 font-weight-medium">Режим редактирования</div>
              <div class="text-caption text-grey">{{ dashboard.title }}</div>
            </div>
          </div>

          <div class="d-flex align-center gap-2">
            <!-- Layout Grid Toggle -->
            <v-btn
              :variant="showGrid ? 'flat' : 'outlined'"
              :color="showGrid ? 'primary' : 'default'"
              size="small"
              @click="showGrid = !showGrid"
            >
              <v-icon>mdi-grid</v-icon>
              <v-tooltip activator="parent" location="bottom">
                Показать сетку
              </v-tooltip>
            </v-btn>

            <!-- Add Widget -->
            <v-btn
              variant="outlined"
              color="success"
              size="small"
              @click="showAddWidgetDialog = true"
            >
              <v-icon class="me-1">mdi-plus</v-icon>
              Виджет
            </v-btn>

            <!-- Add Chart -->
            <v-btn
              variant="outlined"
              color="info"
              size="small"
              @click="showAddChartDialog = true"
            >
              <v-icon class="me-1">mdi-chart-line</v-icon>
              График
            </v-btn>

            <!-- Layout Settings -->
            <v-btn
              variant="outlined"
              size="small"
              @click="showLayoutDialog = true"
            >
              <v-icon class="me-1">mdi-view-dashboard</v-icon>
              Макет
            </v-btn>

            <!-- Save -->
            <v-btn
              variant="flat"
              color="primary"
              size="small"
              :loading="saving"
              @click="saveDashboard"
            >
              <v-icon class="me-1">mdi-content-save</v-icon>
              Сохранить
            </v-btn>

            <!-- Cancel -->
            <v-btn
              variant="outlined"
              size="small"
              @click="cancelEdit"
            >
              <v-icon class="me-1">mdi-close</v-icon>
              Отмена
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>

    <!-- Dashboard Layout Editor -->
    <div class="dashboard-editor" :class="{ 'show-grid': showGrid }">
      <div class="dashboard-grid">
        <div
          v-for="(element, index) in editableLayout"
          :key="element.id"
          draggable="true"
          @dragstart="onDragStart"
          @dragend="onDragEnd"
        >
          <div
            :key="element.id"
            class="dashboard-item"
            :class="{
              'item-selected': selectedItemId === element.id,
              'item-dragging': dragging
            }"
            :style="getItemStyle(element)"
            @click="selectItem(element.id)"
          >
            <!-- Item Content -->
            <div class="item-content">
              <component
                :is="getItemComponent(element)"
                v-bind="getItemProps(element)"
                :edit-mode="true"
                @update:config="updateItemConfig(element.id, $event)"
              />
            </div>

            <!-- Item Controls -->
            <div class="item-controls">
              <div class="controls-overlay">
                <v-btn-group density="compact" variant="elevated">
                  <v-btn
                    size="x-small"
                    icon="mdi-cog"
                    @click.stop="editItemSettings(element)"
                  />
                  <v-btn
                    size="x-small"
                    icon="mdi-content-copy"
                    @click.stop="duplicateItem(element)"
                  />
                  <v-btn
                    size="x-small"
                    icon="mdi-delete"
                    color="error"
                    @click.stop="deleteItem(element.id)"
                  />
                </v-btn-group>
              </div>

              <!-- Resize Handle -->
              <div
                class="resize-handle"
                @mousedown="startResize(element.id, $event)"
              >
                <v-icon size="small">mdi-resize-bottom-right</v-icon>
              </div>
            </div>

            <!-- Selection Border -->
            <div
              v-if="selectedItemId === element.id"
              class="selection-border"
            />
          </div>
        </div>
        </div>
      </div>

      <!-- Drop Zone for New Items -->
      <div
        v-if="newItemDragging"
        class="drop-zone"
        @dragover.prevent
        @drop="onDropNewItem"
      >
        <div class="drop-zone-content">
          <v-icon size="48" color="grey-lighten-2">mdi-plus-circle</v-icon>
          <div class="text-body-2 text-grey">Перетащите сюда для добавления</div>
        </div>
      </div>

    <!-- Dialogs -->
    <!-- Add Widget Dialog -->
    <v-dialog
      v-model="showAddWidgetDialog"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-title>Добавить виджет</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="widgetType in availableWidgets"
              :key="widgetType.type"
              cols="12"
              md="6"
            >
              <v-card
                class="widget-option"
                :class="{ 'selected': newWidget.type === widgetType.type }"
                @click="selectWidgetType(widgetType)"
                variant="outlined"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <v-avatar :color="widgetType.color" size="40" class="me-3">
                      <v-icon :icon="widgetType.icon" color="white" />
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        {{ widgetType.title }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ widgetType.description }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <div v-if="newWidget.type" class="mt-4">
            <v-text-field
              v-model="newWidget.title"
              label="Название виджета"
              variant="outlined"
              density="compact"
            />

            <widget-config-form
              v-if="newWidget.type"
              :widget-type="newWidget.type"
              :config="newWidget.config"
              @update:config="newWidget.config = $event"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAddWidgetDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!newWidget.type || !newWidget.title"
            @click="addWidget"
          >
            Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Chart Dialog -->
    <v-dialog
      v-model="showAddChartDialog"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-title>Добавить график</v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              v-for="chartType in availableCharts"
              :key="chartType.type"
              cols="12"
              md="6"
            >
              <v-card
                class="chart-option"
                :class="{ 'selected': newChart.type === chartType.type }"
                @click="selectChartType(chartType)"
                variant="outlined"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-center">
                    <v-avatar :color="chartType.color" size="40" class="me-3">
                      <v-icon :icon="chartType.icon" color="white" />
                    </v-avatar>
                    <div>
                      <div class="text-subtitle-2 font-weight-medium">
                        {{ chartType.title }}
                      </div>
                      <div class="text-caption text-grey">
                        {{ chartType.description }}
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <div v-if="newChart.type" class="mt-4">
            <v-text-field
              v-model="newChart.title"
              label="Название графика"
              variant="outlined"
              density="compact"
            />

            <chart-config-form
              v-if="newChart.type"
              :chart-type="newChart.type"
              :config="newChart.config"
              @update:config="newChart.config = $event"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAddChartDialog = false">Отмена</v-btn>
          <v-btn
            color="primary"
            :disabled="!newChart.type || !newChart.title"
            @click="addChart"
          >
            Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Layout Settings Dialog -->
    <v-dialog
      v-model="showLayoutDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title>Настройки макета</v-card-title>
        <v-card-text>
          <v-select
            v-model="layoutSettings.columns"
            :items="[1, 2, 3, 4, 6, 12]"
            label="Количество колонок"
            variant="outlined"
            density="compact"
          />

          <v-select
            v-model="layoutSettings.gap"
            :items="[8, 12, 16, 20, 24]"
            label="Отступы между элементами"
            variant="outlined"
            density="compact"
          />

          <v-switch
            v-model="layoutSettings.autoHeight"
            label="Автоматическая высота"
            color="primary"
          />

          <v-switch
            v-model="layoutSettings.responsive"
            label="Адаптивный макет"
            color="primary"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showLayoutDialog = false">Отмена</v-btn>
          <v-btn color="primary" @click="applyLayoutSettings">Применить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useInsightsStore } from '@/stores/insightsStore'
import { useAppStore } from '@/stores/appStore'
// import draggable from 'vuedraggable' // Заменено на нативные HTML5 drag&drop
import KPIWidget from './widgets/KPIWidget.vue'
import FunnelWidget from './widgets/FunnelWidget.vue'
import RevenueChart from './charts/RevenueChart.vue'
import RoiChart from './charts/RoiChart.vue'
import ChannelRevenueChart from './charts/ChannelRevenueChart.vue'
import WidgetConfigForm from './WidgetConfigForm.vue'
import ChartConfigForm from './ChartConfigForm.vue'

const props = defineProps({
  dashboard: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const insightsStore = useInsightsStore()
const appStore = useAppStore()

// Reactive data
const showGrid = ref(true)
const showAddWidgetDialog = ref(false)
const showAddChartDialog = ref(false)
const showLayoutDialog = ref(false)
const saving = ref(false)
const dragging = ref(false)
const newItemDragging = ref(false)
const selectedItemId = ref(null)

const editableLayout = ref([])
const layoutSettings = ref({
  columns: 3,
  gap: 16,
  autoHeight: true,
  responsive: true
})

const newWidget = ref({
  type: null,
  title: '',
  config: {}
})

const newChart = ref({
  type: null,
  title: '',
  config: {}
})

// Available widgets and charts
const availableWidgets = [
  {
    type: 'kpi',
    title: 'KPI виджет',
    description: 'Отображение ключевых показателей',
    icon: 'mdi-speedometer',
    color: 'primary'
  },
  {
    type: 'funnel',
    title: 'Воронка',
    description: 'Воронка конверсии',
    icon: 'mdi-filter-variant',
    color: 'success'
  },
  {
    type: 'table',
    title: 'Таблица',
    description: 'Табличные данные',
    icon: 'mdi-table',
    color: 'info'
  },
  {
    type: 'text',
    title: 'Текст',
    description: 'Текстовый блок',
    icon: 'mdi-text',
    color: 'warning'
  }
]

const availableCharts = [
  {
    type: 'line',
    title: 'Линейный график',
    description: 'Тренды во времени',
    icon: 'mdi-chart-line',
    color: 'primary'
  },
  {
    type: 'bar',
    title: 'Столбчатая диаграмма',
    description: 'Сравнение значений',
    icon: 'mdi-chart-bar',
    color: 'success'
  },
  {
    type: 'pie',
    title: 'Круговая диаграмма',
    description: 'Доли от целого',
    icon: 'mdi-chart-pie',
    color: 'warning'
  },
  {
    type: 'area',
    title: 'Диаграмма с областями',
    description: 'Накопленные значения',
    icon: 'mdi-chart-areaspline',
    color: 'info'
  }
]

// Methods
const getItemStyle = (item) => ({
  gridColumn: `span ${item.width || 1}`,
  gridRow: `span ${item.height || 1}`,
  minHeight: `${(item.height || 1) * 200}px`
})

const getItemComponent = (item) => {
  const componentMap = {
    kpi: KPIWidget,
    funnel: FunnelWidget,
    revenue_chart: RevenueChart,
    roi_chart: RoiChart,
    channel_chart: ChannelRevenueChart
  }
  return componentMap[item.type] || 'div'
}

const getItemProps = (item) => {
  return {
    ...item.config,
    data: item.data || []
  }
}

const selectItem = (id) => {
  selectedItemId.value = selectedItemId.value === id ? null : id
}

const selectWidgetType = (widgetType) => {
  newWidget.value.type = widgetType.type
  newWidget.value.title = widgetType.title
  newWidget.value.config = getDefaultWidgetConfig(widgetType.type)
}

const selectChartType = (chartType) => {
  newChart.value.type = chartType.type
  newChart.value.title = chartType.title
  newChart.value.config = getDefaultChartConfig(chartType.type)
}

const getDefaultWidgetConfig = (type) => {
  const configs = {
    kpi: {
      value: 0,
      format: 'number',
      color: 'primary',
      icon: 'mdi-chart-line'
    },
    funnel: {
      valueFormat: 'number'
    },
    table: {
      headers: [],
      itemsPerPage: 10
    },
    text: {
      content: 'Введите текст...',
      fontSize: 14,
      align: 'left'
    }
  }
  return configs[type] || {}
}

const getDefaultChartConfig = (type) => {
  const configs = {
    line: {
      smooth: true,
      showArea: false
    },
    bar: {
      orientation: 'vertical'
    },
    pie: {
      showLabels: true,
      showLegend: true
    },
    area: {
      stacked: false
    }
  }
  return configs[type] || {}
}

const addWidget = () => {
  const newItem = {
    id: `widget_${Date.now()}`,
    type: newWidget.value.type,
    title: newWidget.value.title,
    config: newWidget.value.config,
    width: 1,
    height: 1,
    x: 0,
    y: editableLayout.value.length
  }

  editableLayout.value.push(newItem)
  showAddWidgetDialog.value = false
  resetNewWidget()
}

const addChart = () => {
  const newItem = {
    id: `chart_${Date.now()}`,
    type: newChart.value.type,
    title: newChart.value.title,
    config: newChart.value.config,
    width: 2,
    height: 2,
    x: 0,
    y: editableLayout.value.length
  }

  editableLayout.value.push(newItem)
  showAddChartDialog.value = false
  resetNewChart()
}

const resetNewWidget = () => {
  newWidget.value = {
    type: null,
    title: '',
    config: {}
  }
}

const resetNewChart = () => {
  newChart.value = {
    type: null,
    title: '',
    config: {}
  }
}

const duplicateItem = (item) => {
  const newItem = {
    ...item,
    id: `${item.type}_${Date.now()}`,
    title: `${item.title} (копия)`,
    y: editableLayout.value.length
  }
  editableLayout.value.push(newItem)
}

const deleteItem = (id) => {
  const index = editableLayout.value.findIndex(item => item.id === id)
  if (index !== -1) {
    editableLayout.value.splice(index, 1)
  }
  if (selectedItemId.value === id) {
    selectedItemId.value = null
  }
}

const updateItemConfig = (id, config) => {
  const item = editableLayout.value.find(item => item.id === id)
  if (item) {
    item.config = { ...item.config, ...config }
  }
}

const editItemSettings = (item) => {
  // TODO: Implement item settings dialog
  console.log('Edit settings for:', item)
}

const onDragStart = () => {
  dragging.value = true
}

const onDragEnd = () => {
  dragging.value = false
}

const onDropNewItem = (event) => {
  newItemDragging.value = false
  // Handle drop logic here
}

const startResize = (id, event) => {
  // TODO: Implement resize logic
  console.log('Start resize for:', id, event)
}

const applyLayoutSettings = () => {
  // Apply layout settings to the dashboard
  showLayoutDialog.value = false
}

const saveDashboard = async () => {
  saving.value = true
  try {
    const dashboardData = {
      ...props.dashboard,
      layout: editableLayout.value,
      settings: layoutSettings.value
    }

    await insightsStore.updateWidget(dashboardData)
    appStore.showSuccess('Дашборд сохранен')
    emit('save', dashboardData)
  } catch (error) {
    console.error('Error saving dashboard:', error)
    appStore.showError('Ошибка сохранения дашборда')
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  emit('cancel')
}

// Lifecycle
onMounted(() => {
  editableLayout.value = props.dashboard.layout ? [...props.dashboard.layout] : []
  if (props.dashboard.settings) {
    layoutSettings.value = { ...layoutSettings.value, ...props.dashboard.settings }
  }
})
</script>

<style scoped>
.dashboard-edit-mode {
  height: 100%;
}

.edit-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
}

.dashboard-editor {
  min-height: 500px;
  position: relative;
}

.dashboard-editor.show-grid {
  background-image:
    linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(v-bind('layoutSettings.columns'), 1fr);
  gap: v-bind('layoutSettings.gap + "px"');
  padding: 16px;
}

.dashboard-item {
  position: relative;
  background: white;
  border: 2px solid transparent;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.dashboard-item:hover {
  border-color: rgba(25, 118, 210, 0.3);
}

.item-selected {
  border-color: #1976d2 !important;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.item-dragging {
  opacity: 0.7;
  transform: rotate(5deg);
}

.item-content {
  height: 100%;
  overflow: hidden;
}

.item-controls {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.dashboard-item:hover .item-controls,
.item-selected .item-controls {
  opacity: 1;
  pointer-events: auto;
}

.controls-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: se-resize;
  background: rgba(25, 118, 210, 0.8);
  border-radius: 4px 0 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selection-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #1976d2;
  border-radius: 8px;
  pointer-events: none;
}

.ghost-item {
  opacity: 0.5;
  background: #f5f5f5;
}

.chosen-item {
  transform: rotate(5deg);
}

.drop-zone {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(25, 118, 210, 0.1);
  border: 2px dashed #1976d2;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone-content {
  text-align: center;
}

.widget-option,
.chart-option {
  cursor: pointer;
  transition: all 0.2s ease;
}

.widget-option:hover,
.chart-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.widget-option.selected,
.chart-option.selected {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.05);
}
</style>