<template>
  <v-dialog
    :model-value="modelValue"
    max-width="600"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-card>
      <v-card-title class="text-h6">
        <v-icon class="me-2">mdi-download</v-icon>
        Экспорт данных
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="handleExport">
          <!-- Выбор формата -->
          <div class="mb-4">
            <v-label class="text-subtitle-2 mb-2">Формат файла</v-label>
            <v-radio-group
              v-model="selectedFormat"
              inline
              density="compact"
            >
              <v-radio
                v-for="format in formatOptions"
                :key="format.value"
                :label="format.title"
                :value="format.value"
              >
                <template #label>
                  <div class="d-flex align-center">
                    <v-icon :icon="format.icon" size="small" class="me-2" />
                    <div>
                      <div class="font-weight-medium">{{ format.title }}</div>
                      <div class="text-caption text-grey">{{ format.description }}</div>
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </div>

          <!-- Название файла -->
          <v-text-field
            v-model="fileName"
            label="Название файла"
            variant="outlined"
            :rules="[rules.required]"
            maxlength="100"
            counter
            class="mb-3"
          >
            <template #append-inner>
              <span class="text-body-2 text-grey">.{{ selectedFormat }}</span>
            </template>
          </v-text-field>

          <!-- Что экспортировать -->
          <div class="mb-4">
            <v-label class="text-subtitle-2 mb-2">Содержимое экспорта</v-label>

            <v-checkbox
              v-model="includeData"
              label="Данные таблиц и отчетов"
              density="compact"
            />

            <v-checkbox
              v-model="includeCharts"
              label="Диаграммы и графики"
              density="compact"
              :disabled="selectedFormat === 'csv'"
            />

            <v-checkbox
              v-model="includeFilters"
              label="Примененные фильтры"
              density="compact"
            />

            <v-checkbox
              v-model="includeSummary"
              label="Сводная информация"
              density="compact"
            />
          </div>

          <!-- Дополнительные настройки -->
          <v-expansion-panels variant="accordion" class="mb-3">
            <v-expansion-panel>
              <v-expansion-panel-title>
                Дополнительные настройки
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- Настройки для PDF -->
                <div v-if="selectedFormat === 'pdf'">
                  <v-select
                    v-model="pdfSettings.orientation"
                    :items="orientationOptions"
                    label="Ориентация страницы"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  />

                  <v-select
                    v-model="pdfSettings.pageSize"
                    :items="pageSizeOptions"
                    label="Размер страницы"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  />

                  <v-checkbox
                    v-model="pdfSettings.includeHeader"
                    label="Включать заголовок и дату"
                    density="compact"
                  />

                  <v-checkbox
                    v-model="pdfSettings.includeFooter"
                    label="Включать номера страниц"
                    density="compact"
                  />
                </div>

                <!-- Настройки для Excel -->
                <div v-if="selectedFormat === 'xlsx' || selectedFormat === 'xls'">
                  <v-checkbox
                    v-model="excelSettings.multipleSheets"
                    label="Разные отчеты на отдельных листах"
                    density="compact"
                  />

                  <v-checkbox
                    v-model="excelSettings.includeFormulas"
                    label="Включать формулы"
                    density="compact"
                  />

                  <v-checkbox
                    v-model="excelSettings.includeFormatting"
                    label="Сохранять форматирование"
                    density="compact"
                  />
                </div>

                <!-- Настройки для CSV -->
                <div v-if="selectedFormat === 'csv'">
                  <v-select
                    v-model="csvSettings.delimiter"
                    :items="delimiterOptions"
                    label="Разделитель"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  />

                  <v-select
                    v-model="csvSettings.encoding"
                    :items="encodingOptions"
                    label="Кодировка"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  />
                </div>

                <!-- Общие настройки -->
                <v-divider class="my-3" />

                <v-checkbox
                  v-model="compressFile"
                  label="Сжать файл (ZIP архив)"
                  density="compact"
                />

                <v-checkbox
                  v-model="sendEmail"
                  label="Отправить на email после создания"
                  density="compact"
                />

                <v-text-field
                  v-if="sendEmail"
                  v-model="emailAddress"
                  label="Email адрес"
                  variant="outlined"
                  density="compact"
                  type="email"
                  :rules="sendEmail ? [rules.email] : []"
                  class="mt-2"
                />
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Размер файла и время -->
          <v-alert
            v-if="estimatedSize"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-3"
          >
            <div class="d-flex justify-space-between">
              <span>Примерный размер: {{ estimatedSize }}</span>
              <span>Время создания: {{ estimatedTime }}</span>
            </div>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="$emit('update:model-value', false)"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          :loading="exporting"
          @click="handleExport"
        >
          <v-icon class="me-2">mdi-download</v-icon>
          Экспорт
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  exportOptions: {
    type: Object,
    default: () => ({})
  }
})

// Emits
defineEmits(['update:model-value', 'export'])

// Reactive data
const formRef = ref(null)
const selectedFormat = ref('xlsx')
const fileName = ref('')
const includeData = ref(true)
const includeCharts = ref(true)
const includeFilters = ref(true)
const includeSummary = ref(true)
const compressFile = ref(false)
const sendEmail = ref(false)
const emailAddress = ref('')
const exporting = ref(false)

// PDF настройки
const pdfSettings = ref({
  orientation: 'landscape',
  pageSize: 'A4',
  includeHeader: true,
  includeFooter: true
})

// Excel настройки
const excelSettings = ref({
  multipleSheets: true,
  includeFormulas: false,
  includeFormatting: true
})

// CSV настройки
const csvSettings = ref({
  delimiter: ',',
  encoding: 'UTF-8'
})

// Validation rules
const rules = {
  required: (value) => !!value || 'Поле обязательно для заполнения',
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Введите корректный email адрес'
  }
}

// Options
const formatOptions = [
  {
    value: 'pdf',
    title: 'PDF',
    description: 'Портативный документ с диаграммами',
    icon: 'mdi-file-pdf-box'
  },
  {
    value: 'xlsx',
    title: 'Excel',
    description: 'Таблица с формулами и форматированием',
    icon: 'mdi-file-excel'
  },
  {
    value: 'csv',
    title: 'CSV',
    description: 'Данные в табличном формате',
    icon: 'mdi-file-delimited'
  }
]

const orientationOptions = [
  { title: 'Альбомная', value: 'landscape' },
  { title: 'Книжная', value: 'portrait' }
]

const pageSizeOptions = [
  { title: 'A4', value: 'A4' },
  { title: 'A3', value: 'A3' },
  { title: 'Letter', value: 'letter' },
  { title: 'Legal', value: 'legal' }
]

const delimiterOptions = [
  { title: 'Запятая (,)', value: ',' },
  { title: 'Точка с запятой (;)', value: ';' },
  { title: 'Табуляция', value: '\t' },
  { title: 'Пайп (|)', value: '|' }
]

const encodingOptions = [
  { title: 'UTF-8', value: 'UTF-8' },
  { title: 'Windows-1251', value: 'windows-1251' },
  { title: 'KOI8-R', value: 'KOI8-R' }
]

// Computed
const estimatedSize = computed(() => {
  let baseSize = 0

  if (includeData.value) baseSize += 500 // KB
  if (includeCharts.value && selectedFormat.value !== 'csv') baseSize += 2000 // KB
  if (includeFilters.value) baseSize += 50 // KB
  if (includeSummary.value) baseSize += 100 // KB

  // Корректировка по формату
  if (selectedFormat.value === 'pdf') baseSize *= 1.5
  if (selectedFormat.value === 'csv') baseSize *= 0.3

  if (baseSize < 1024) {
    return `${Math.round(baseSize)} KB`
  } else {
    return `${(baseSize / 1024).toFixed(1)} MB`
  }
})

const estimatedTime = computed(() => {
  let baseTime = 5 // секунд

  if (includeCharts.value && selectedFormat.value === 'pdf') baseTime += 10
  if (excelSettings.value.multipleSheets) baseTime += 5
  if (compressFile.value) baseTime += 3

  if (baseTime < 60) {
    return `${baseTime} сек`
  } else {
    return `${Math.round(baseTime / 60)} мин`
  }
})

// Methods
const generateFileName = () => {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0]
  const reportType = props.exportOptions.report?.name || 'dashboard'

  return `kreola_${reportType}_${dateStr}`.replace(/\s+/g, '_').toLowerCase()
}

const handleExport = async () => {
  const { valid } = await formRef.value.validate()

  if (!valid) return

  exporting.value = true

  try {
    const exportConfig = {
      format: selectedFormat.value,
      fileName: fileName.value,
      content: {
        includeData: includeData.value,
        includeCharts: includeCharts.value,
        includeFilters: includeFilters.value,
        includeSummary: includeSummary.value
      },
      settings: {
        pdf: selectedFormat.value === 'pdf' ? pdfSettings.value : undefined,
        excel: ['xlsx', 'xls'].includes(selectedFormat.value) ? excelSettings.value : undefined,
        csv: selectedFormat.value === 'csv' ? csvSettings.value : undefined
      },
      options: {
        compress: compressFile.value,
        email: sendEmail.value ? emailAddress.value : null
      },
      source: props.exportOptions
    }

    emit('export', exportConfig)
  } catch (error) {
    console.error('Error exporting data:', error)
  } finally {
    exporting.value = false
  }
}

const resetForm = () => {
  selectedFormat.value = 'xlsx'
  fileName.value = generateFileName()
  includeData.value = true
  includeCharts.value = true
  includeFilters.value = true
  includeSummary.value = true
  compressFile.value = false
  sendEmail.value = false
  emailAddress.value = ''

  if (formRef.value) {
    formRef.value.resetValidation()
  }
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    fileName.value = generateFileName()
  } else {
    resetForm()
  }
})

watch(selectedFormat, (newFormat) => {
  if (newFormat === 'csv') {
    includeCharts.value = false
  }
})
</script>

<style scoped>
/* Кастомизация radio group */
:deep(.v-radio-group .v-selection-control) {
  margin-bottom: 16px;
}

:deep(.v-radio .v-label) {
  margin-left: 8px;
}

/* Кастомизация expansion panels */
:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px !important;
}
</style>