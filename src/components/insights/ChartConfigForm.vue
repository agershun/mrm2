<template>
  <div class="chart-config-form">
    <!-- Line Chart Config -->
    <div v-if="chartType === 'line'">
      <v-switch
        v-model="localConfig.smooth"
        label="Сглаженные линии"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showArea"
        label="Заливка под линией"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showPoints"
        label="Показывать точки"
        color="primary"
        class="mb-3"
      />

      <v-select
        v-model="localConfig.lineWidth"
        :items="[1, 2, 3, 4, 5]"
        label="Толщина линии"
        variant="outlined"
        density="compact"
        class="mb-3"
      />
    </div>

    <!-- Bar Chart Config -->
    <div v-else-if="chartType === 'bar'">
      <v-select
        v-model="localConfig.orientation"
        :items="orientationOptions"
        label="Ориентация"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.stacked"
        label="Стопка"
        color="primary"
        class="mb-3"
      />

      <v-slider
        v-model="localConfig.barWidth"
        :min="10"
        :max="100"
        label="Ширина столбцов (%)"
        step="5"
        thumb-label
        class="mb-3"
      />

      <v-slider
        v-model="localConfig.borderRadius"
        :min="0"
        :max="20"
        label="Скругление углов"
        step="1"
        thumb-label
        class="mb-3"
      />
    </div>

    <!-- Pie Chart Config -->
    <div v-else-if="chartType === 'pie'">
      <v-switch
        v-model="localConfig.showLabels"
        label="Показывать подписи"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showLegend"
        label="Показывать легенду"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showPercentages"
        label="Показывать проценты"
        color="primary"
        class="mb-3"
      />

      <v-slider
        v-model="localConfig.innerRadius"
        :min="0"
        :max="80"
        label="Внутренний радиус (%)"
        step="5"
        thumb-label
        class="mb-3"
      />

      <v-slider
        v-model="localConfig.outerRadius"
        :min="50"
        :max="100"
        label="Внешний радиус (%)"
        step="5"
        thumb-label
        class="mb-3"
      />
    </div>

    <!-- Area Chart Config -->
    <div v-else-if="chartType === 'area'">
      <v-switch
        v-model="localConfig.stacked"
        label="Накопленные области"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.smooth"
        label="Сглаженные линии"
        color="primary"
        class="mb-3"
      />

      <v-select
        v-model="localConfig.fillOpacity"
        :items="opacityOptions"
        label="Прозрачность заливки"
        variant="outlined"
        density="compact"
        class="mb-3"
      />
    </div>

    <!-- Common Chart Config -->
    <v-divider class="my-4" />

    <div class="common-config">
      <v-label class="mb-2">Общие настройки</v-label>

      <v-text-field
        v-model="localConfig.title"
        label="Заголовок графика"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-text-field
        v-model="localConfig.xAxisLabel"
        label="Подпись оси X"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-text-field
        v-model="localConfig.yAxisLabel"
        label="Подпись оси Y"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showGrid"
        label="Показывать сетку"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showTooltip"
        label="Показывать подсказки"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.enableZoom"
        label="Масштабирование"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.enableBrush"
        label="Выделение области"
        color="primary"
        class="mb-3"
      />
    </div>

    <!-- Color Scheme -->
    <v-divider class="my-4" />

    <div class="color-config">
      <v-label class="mb-2">Цветовая схема</v-label>

      <v-select
        v-model="localConfig.colorScheme"
        :items="colorSchemeOptions"
        label="Предустановленная схема"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <div v-if="localConfig.colorScheme === 'custom'" class="mb-3">
        <v-label class="mb-2">Пользовательские цвета</v-label>
        <div class="d-flex gap-2 flex-wrap">
          <v-text-field
            v-for="(color, index) in localConfig.colors"
            :key="index"
            v-model="localConfig.colors[index]"
            :label="`Цвет ${index + 1}`"
            variant="outlined"
            density="compact"
            type="color"
            style="max-width: 100px"
          />
          <v-btn
            icon="mdi-plus"
            size="small"
            variant="outlined"
            @click="addColor"
          />
        </div>
      </div>
    </div>

    <!-- Animation -->
    <v-divider class="my-4" />

    <div class="animation-config">
      <v-label class="mb-2">Анимация</v-label>

      <v-switch
        v-model="localConfig.enableAnimation"
        label="Включить анимацию"
        color="primary"
        class="mb-3"
      />

      <v-select
        v-if="localConfig.enableAnimation"
        v-model="localConfig.animationType"
        :items="animationTypeOptions"
        label="Тип анимации"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-slider
        v-if="localConfig.enableAnimation"
        v-model="localConfig.animationDuration"
        :min="500"
        :max="3000"
        label="Длительность (мс)"
        step="250"
        thumb-label
        class="mb-3"
      />
    </div>

    <!-- Data Source Config -->
    <v-divider class="my-4" />

    <div class="data-source-config">
      <v-label class="mb-2">Источник данных</v-label>

      <v-select
        v-model="localConfig.dataSource"
        :items="dataSourceOptions"
        label="Источник данных"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-text-field
        v-if="localConfig.dataSource === 'api'"
        v-model="localConfig.apiEndpoint"
        label="API Endpoint"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-select
        v-if="localConfig.dataSource === 'report'"
        v-model="localConfig.reportId"
        :items="reportOptions"
        label="Отчет"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-select
        v-if="localConfig.dataSource !== 'static'"
        v-model="localConfig.refreshInterval"
        :items="refreshIntervalOptions"
        label="Интервал обновления"
        variant="outlined"
        density="compact"
        class="mb-3"
      />
    </div>

    <!-- Size Config -->
    <v-divider class="my-4" />

    <div class="size-config">
      <v-label class="mb-2">Размер графика</v-label>

      <v-row>
        <v-col cols="6">
          <v-select
            v-model.number="localConfig.width"
            :items="[1, 2, 3, 4, 6, 12]"
            label="Ширина (колонок)"
            variant="outlined"
            density="compact"
          />
        </v-col>
        <v-col cols="6">
          <v-select
            v-model.number="localConfig.height"
            :items="[1, 2, 3, 4, 5, 6]"
            label="Высота (строк)"
            variant="outlined"
            density="compact"
          />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  chartType: {
    type: String,
    required: true
  },
  config: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:config'])

const localConfig = ref({})

// Options
const orientationOptions = [
  { title: 'Вертикальная', value: 'vertical' },
  { title: 'Горизонтальная', value: 'horizontal' }
]

const opacityOptions = [
  { title: '20%', value: 0.2 },
  { title: '40%', value: 0.4 },
  { title: '60%', value: 0.6 },
  { title: '80%', value: 0.8 },
  { title: '100%', value: 1.0 }
]

const colorSchemeOptions = [
  { title: 'По умолчанию', value: 'default' },
  { title: 'Материал', value: 'material' },
  { title: 'Пастельная', value: 'pastel' },
  { title: 'Яркая', value: 'bright' },
  { title: 'Монохромная', value: 'monochrome' },
  { title: 'Градиентная', value: 'gradient' },
  { title: 'Пользовательская', value: 'custom' }
]

const animationTypeOptions = [
  { title: 'Появление', value: 'fadeIn' },
  { title: 'Скольжение', value: 'slideIn' },
  { title: 'Масштабирование', value: 'scaleIn' },
  { title: 'Поворот', value: 'rotateIn' },
  { title: 'Волна', value: 'wave' }
]

const dataSourceOptions = [
  { title: 'Статические данные', value: 'static' },
  { title: 'API Endpoint', value: 'api' },
  { title: 'Готовый отчет', value: 'report' },
  { title: 'Пользовательский запрос', value: 'custom' }
]

const reportOptions = [
  { title: 'Анализ выручки', value: 'revenue_analysis' },
  { title: 'ROI тренды', value: 'roi_trends' },
  { title: 'Производительность каналов', value: 'channel_performance' },
  { title: 'Географическая производительность', value: 'geographic_performance' },
  { title: 'Анализ воронки', value: 'funnel_analysis' },
  { title: 'Анализ атрибуции', value: 'attribution_analysis' }
]

const refreshIntervalOptions = [
  { title: 'Не обновлять', value: 0 },
  { title: 'Каждую минуту', value: 60 },
  { title: 'Каждые 5 минут', value: 300 },
  { title: 'Каждые 15 минут', value: 900 },
  { title: 'Каждый час', value: 3600 },
  { title: 'Каждый день', value: 86400 }
]

// Methods
const addColor = () => {
  if (!localConfig.value.colors) {
    localConfig.value.colors = []
  }
  localConfig.value.colors.push('#1976D2')
}

// Initialize default config based on chart type
const initializeConfig = () => {
  const defaults = {
    line: {
      smooth: true,
      showArea: false,
      showPoints: true,
      lineWidth: 2,
      showGrid: true,
      showTooltip: true,
      enableZoom: false,
      enableBrush: false,
      enableAnimation: true,
      animationType: 'fadeIn',
      animationDuration: 1000,
      colorScheme: 'default',
      dataSource: 'static',
      refreshInterval: 0,
      width: 2,
      height: 2
    },
    bar: {
      orientation: 'vertical',
      stacked: false,
      barWidth: 60,
      borderRadius: 4,
      showGrid: true,
      showTooltip: true,
      enableZoom: false,
      enableBrush: false,
      enableAnimation: true,
      animationType: 'slideIn',
      animationDuration: 1000,
      colorScheme: 'default',
      dataSource: 'static',
      refreshInterval: 0,
      width: 2,
      height: 2
    },
    pie: {
      showLabels: true,
      showLegend: true,
      showPercentages: true,
      innerRadius: 0,
      outerRadius: 80,
      showTooltip: true,
      enableAnimation: true,
      animationType: 'scaleIn',
      animationDuration: 1000,
      colorScheme: 'default',
      dataSource: 'static',
      refreshInterval: 0,
      width: 2,
      height: 2
    },
    area: {
      stacked: false,
      smooth: true,
      fillOpacity: 0.6,
      showGrid: true,
      showTooltip: true,
      enableZoom: false,
      enableBrush: false,
      enableAnimation: true,
      animationType: 'wave',
      animationDuration: 1500,
      colorScheme: 'default',
      dataSource: 'static',
      refreshInterval: 0,
      width: 2,
      height: 2
    }
  }

  localConfig.value = {
    ...defaults[props.chartType],
    ...props.config
  }
}

// Watchers
watch(localConfig, (newConfig) => {
  emit('update:config', newConfig)
}, { deep: true })

watch(() => props.config, (newConfig) => {
  localConfig.value = { ...localConfig.value, ...newConfig }
}, { deep: true })

// Lifecycle
onMounted(() => {
  initializeConfig()
})
</script>

<style scoped>
.chart-config-form {
  max-height: 400px;
  overflow-y: auto;
}

.common-config,
.color-config,
.animation-config,
.data-source-config,
.size-config {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

:deep(.v-label) {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
}
</style>