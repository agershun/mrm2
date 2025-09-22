<template>
  <div class="widget-config-form">
    <!-- KPI Widget Config -->
    <div v-if="widgetType === 'kpi'">
      <v-select
        v-model="localConfig.format"
        :items="formatOptions"
        label="Формат значения"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-select
        v-model="localConfig.color"
        :items="colorOptions"
        label="Цвет"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-text-field
        v-model="localConfig.icon"
        label="Иконка (MDI)"
        variant="outlined"
        density="compact"
        placeholder="mdi-chart-line"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showTrend"
        label="Показывать тренд"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showProgress"
        label="Показывать прогресс"
        color="primary"
        class="mb-3"
      />

      <v-text-field
        v-model.number="localConfig.target"
        label="Целевое значение"
        variant="outlined"
        density="compact"
        type="number"
        class="mb-3"
      />
    </div>

    <!-- Funnel Widget Config -->
    <div v-else-if="widgetType === 'funnel'">
      <v-select
        v-model="localConfig.valueFormat"
        :items="formatOptions"
        label="Формат значений"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showConversions"
        label="Показывать конверсии"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showDetails"
        label="Показывать детали по умолчанию"
        color="primary"
        class="mb-3"
      />

      <div class="mb-3">
        <v-label class="mb-2">Цвета этапов</v-label>
        <div class="d-flex gap-2 flex-wrap">
          <v-text-field
            v-for="(color, index) in localConfig.colors"
            :key="index"
            v-model="localConfig.colors[index]"
            :label="`Этап ${index + 1}`"
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

    <!-- Table Widget Config -->
    <div v-else-if="widgetType === 'table'">
      <v-text-field
        v-model.number="localConfig.itemsPerPage"
        label="Элементов на странице"
        variant="outlined"
        density="compact"
        type="number"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showSearch"
        label="Показывать поиск"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.showPagination"
        label="Показывать пагинацию"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.sortable"
        label="Сортировка"
        color="primary"
        class="mb-3"
      />

      <div class="mb-3">
        <v-label class="mb-2">Колонки</v-label>
        <div v-for="(header, index) in localConfig.headers" :key="index" class="d-flex gap-2 mb-2">
          <v-text-field
            v-model="header.title"
            label="Заголовок"
            variant="outlined"
            density="compact"
            class="flex-grow-1"
          />
          <v-text-field
            v-model="header.key"
            label="Ключ"
            variant="outlined"
            density="compact"
            style="max-width: 150px"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="outlined"
            color="error"
            @click="removeHeader(index)"
          />
        </div>
        <v-btn
          variant="outlined"
          size="small"
          @click="addHeader"
        >
          <v-icon class="me-1">mdi-plus</v-icon>
          Добавить колонку
        </v-btn>
      </div>
    </div>

    <!-- Text Widget Config -->
    <div v-else-if="widgetType === 'text'">
      <v-textarea
        v-model="localConfig.content"
        label="Содержимое"
        variant="outlined"
        rows="4"
        class="mb-3"
      />

      <v-select
        v-model="localConfig.fontSize"
        :items="fontSizeOptions"
        label="Размер шрифта"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-select
        v-model="localConfig.align"
        :items="alignOptions"
        label="Выравнивание"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-select
        v-model="localConfig.color"
        :items="textColorOptions"
        label="Цвет текста"
        variant="outlined"
        density="compact"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.bold"
        label="Жирный"
        color="primary"
        class="mb-3"
      />

      <v-switch
        v-model="localConfig.italic"
        label="Курсив"
        color="primary"
        class="mb-3"
      />
    </div>

    <!-- Data Source Config (Common) -->
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
      <v-label class="mb-2">Размер виджета</v-label>

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
  widgetType: {
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
const formatOptions = [
  { title: 'Число', value: 'number' },
  { title: 'Валюта', value: 'currency' },
  { title: 'Проценты', value: 'percentage' },
  { title: 'Длительность', value: 'duration' }
]

const colorOptions = [
  { title: 'Основной', value: 'primary' },
  { title: 'Успех', value: 'success' },
  { title: 'Предупреждение', value: 'warning' },
  { title: 'Ошибка', value: 'error' },
  { title: 'Информация', value: 'info' },
  { title: 'Доходы', value: 'revenue' },
  { title: 'ROI', value: 'roi' },
  { title: 'Конверсии', value: 'conversions' },
  { title: 'Затраты', value: 'cost' }
]

const textColorOptions = [
  { title: 'По умолчанию', value: 'default' },
  { title: 'Основной', value: 'primary' },
  { title: 'Вторичный', value: 'secondary' },
  { title: 'Успех', value: 'success' },
  { title: 'Предупреждение', value: 'warning' },
  { title: 'Ошибка', value: 'error' }
]

const fontSizeOptions = [
  { title: 'Маленький', value: 12 },
  { title: 'Обычный', value: 14 },
  { title: 'Большой', value: 16 },
  { title: 'Очень большой', value: 18 },
  { title: 'Заголовок', value: 24 }
]

const alignOptions = [
  { title: 'Слева', value: 'left' },
  { title: 'По центру', value: 'center' },
  { title: 'Справа', value: 'right' },
  { title: 'По ширине', value: 'justify' }
]

const dataSourceOptions = [
  { title: 'Статические данные', value: 'static' },
  { title: 'API Endpoint', value: 'api' },
  { title: 'Готовый отчет', value: 'report' },
  { title: 'Пользовательский запрос', value: 'custom' }
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

const addHeader = () => {
  if (!localConfig.value.headers) {
    localConfig.value.headers = []
  }
  localConfig.value.headers.push({
    title: '',
    key: '',
    sortable: true
  })
}

const removeHeader = (index) => {
  localConfig.value.headers.splice(index, 1)
}

// Initialize default config based on widget type
const initializeConfig = () => {
  const defaults = {
    kpi: {
      format: 'number',
      color: 'primary',
      icon: 'mdi-chart-line',
      showTrend: true,
      showProgress: false,
      target: null,
      dataSource: 'static',
      refreshInterval: 0,
      width: 1,
      height: 1
    },
    funnel: {
      valueFormat: 'number',
      showConversions: true,
      showDetails: false,
      colors: ['#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#C2185B'],
      dataSource: 'static',
      refreshInterval: 0,
      width: 2,
      height: 2
    },
    table: {
      itemsPerPage: 10,
      showSearch: true,
      showPagination: true,
      sortable: true,
      headers: [
        { title: 'Название', key: 'name', sortable: true },
        { title: 'Значение', key: 'value', sortable: true }
      ],
      dataSource: 'static',
      refreshInterval: 0,
      width: 3,
      height: 2
    },
    text: {
      content: 'Введите текст...',
      fontSize: 14,
      align: 'left',
      color: 'default',
      bold: false,
      italic: false,
      dataSource: 'static',
      refreshInterval: 0,
      width: 2,
      height: 1
    }
  }

  localConfig.value = {
    ...defaults[props.widgetType],
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
.widget-config-form {
  max-height: 400px;
  overflow-y: auto;
}

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