<template>
  <v-dialog v-model="dialogVisible" max-width="800px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h6">Настройка столбцов таблицы</span>
        <v-btn
          icon
          variant="text"
          @click="close"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <div class="column-editor-content">
          <!-- Панель управления -->
          <div class="editor-toolbar pa-4 d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-3">
              <v-btn
                size="small"
                variant="outlined"
                prepend-icon="mdi-eye"
                @click="showAllColumns"
              >
                Показать все
              </v-btn>
              <v-btn
                size="small"
                variant="outlined"
                prepend-icon="mdi-eye-off"
                @click="hideAllColumns"
              >
                Скрыть все
              </v-btn>
              <v-btn
                size="small"
                variant="outlined"
                prepend-icon="mdi-restore"
                @click="resetToDefaults"
              >
                По умолчанию
              </v-btn>
            </div>

            <div class="d-flex align-center gap-2">
              <v-text-field
                v-model="searchQuery"
                placeholder="Поиск столбцов..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                style="width: 250px"
              />
            </div>
          </div>

          <v-divider />

          <!-- Список столбцов -->
          <div class="columns-list">
            <div class="pa-4">
              <div class="text-subtitle-2 text-grey-darken-1 mb-3">
                Перетащите столбцы для изменения порядка. Снимите галочку, чтобы скрыть столбец.
              </div>

              <draggable
                v-model="workingColumns"
                item-key="key"
                handle=".drag-handle"
                animation="300"
                @end="updateColumnOrder"
              >
                <template #item="{ element: column, index }">
                  <div
                    v-show="!searchQuery || column.title.toLowerCase().includes(searchQuery.toLowerCase())"
                    class="column-item"
                    :class="{ 'column-disabled': !column.visible }"
                  >
                    <div class="column-row d-flex align-center pa-3">
                      <!-- Ручка для перетаскивания -->
                      <div class="drag-handle me-3">
                        <v-icon size="20" color="grey">mdi-drag-vertical</v-icon>
                      </div>

                      <!-- Чекбокс видимости -->
                      <v-checkbox
                        v-model="column.visible"
                        density="compact"
                        hide-details
                        class="me-3"
                        @update:model-value="updateColumnVisibility(column)"
                      />

                      <!-- Информация о столбце -->
                      <div class="column-info flex-grow-1">
                        <div class="d-flex align-items-center">
                          <span class="text-body-1 font-weight-medium">{{ column.title }}</span>
                          <v-chip
                            v-if="column.required"
                            size="x-small"
                            color="primary"
                            variant="outlined"
                            class="ml-2"
                          >
                            Обязательный
                          </v-chip>
                        </div>
                        <div class="text-caption text-grey-darken-1 mt-1">
                          {{ column.description }}
                        </div>
                      </div>

                      <!-- Настройки столбца -->
                      <div class="column-settings d-flex align-center gap-2">
                        <!-- Ширина -->
                        <div class="width-setting d-flex align-center gap-2">
                          <span class="text-caption text-grey-darken-1">Ширина:</span>
                          <v-text-field
                            v-model="column.width"
                            type="number"
                            variant="outlined"
                            density="compact"
                            hide-details
                            suffix="px"
                            min="50"
                            max="500"
                            style="width: 100px"
                            @update:model-value="updateColumnWidth(column)"
                          />
                        </div>

                        <!-- Выравнивание -->
                        <div class="align-setting d-flex align-center gap-2">
                          <span class="text-caption text-grey-darken-1">Выравнивание:</span>
                          <v-btn-toggle
                            v-model="column.align"
                            mandatory
                            size="small"
                            density="compact"
                            variant="outlined"
                            @update:model-value="updateColumnAlignment(column)"
                          >
                            <v-btn value="start" size="small">
                              <v-icon size="16">mdi-format-align-left</v-icon>
                            </v-btn>
                            <v-btn value="center" size="small">
                              <v-icon size="16">mdi-format-align-center</v-icon>
                            </v-btn>
                            <v-btn value="end" size="small">
                              <v-icon size="16">mdi-format-align-right</v-icon>
                            </v-btn>
                          </v-btn-toggle>
                        </div>
                      </div>
                    </div>

                    <v-divider v-if="index < workingColumns.length - 1" />
                  </div>
                </template>
              </draggable>
            </div>
          </div>

          <!-- Предварительный просмотр -->
          <div class="preview-section">
            <v-divider />
            <div class="pa-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <h4 class="text-subtitle-1">Предварительный просмотр</h4>
                <v-chip size="small" variant="outlined">
                  Видимых столбцов: {{ visibleColumnsCount }}
                </v-chip>
              </div>

              <div class="preview-table-container">
                <div class="preview-table">
                  <div class="preview-header d-flex">
                    <div
                      v-for="column in visibleColumns"
                      :key="column.key"
                      class="preview-header-cell"
                      :style="{
                        width: column.width + 'px',
                        textAlign: column.align === 'start' ? 'left' : column.align === 'end' ? 'right' : 'center'
                      }"
                    >
                      {{ column.title }}
                    </div>
                  </div>
                  <div class="preview-row d-flex">
                    <div
                      v-for="column in visibleColumns"
                      :key="column.key"
                      class="preview-cell"
                      :style="{
                        width: column.width + 'px',
                        textAlign: column.align === 'start' ? 'left' : column.align === 'end' ? 'right' : 'center'
                      }"
                    >
                      {{ getPreviewData(column.key) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="applyChanges"
        >
          Применить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'apply'])

// State
const searchQuery = ref('')
const workingColumns = ref([])

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const visibleColumns = computed(() => {
  return workingColumns.value.filter(col => col.visible)
})

const visibleColumnsCount = computed(() => visibleColumns.value.length)

// Инициализация рабочих столбцов с дополнительными свойствами
const initializeWorkingColumns = () => {
  workingColumns.value = props.columns.map(col => ({
    ...col,
    visible: true,
    width: parseInt(col.width?.replace('px', '') || '150'),
    align: col.align || 'start',
    required: ['name'].includes(col.key), // Обязательные столбцы
    description: getColumnDescription(col.key)
  }))
}

// Методы
const getColumnDescription = (key) => {
  const descriptions = {
    'name': 'Название активности с иконкой типа',
    'activity_type': 'Тип активности (кампания, программа, вебинар и др.)',
    'status': 'Текущий статус активности',
    'date_range': 'Даты начала и окончания проведения',
    'planned_costs': 'Планируемые затраты на активность',
    'roi': 'Возврат на инвестиции в процентах',
    'progress': 'Процент выполнения активности',
    'responsible': 'Ответственный сотрудник',
    'currency_code': 'Валюта для расчетов'
  }
  return descriptions[key] || 'Столбец данных таблицы'
}

const getPreviewData = (key) => {
  const previewData = {
    'name': 'Летняя кампания 2025',
    'activity_type': 'Кампания',
    'status': 'Активна',
    'date_range': '01.06.2025 — 31.08.2025',
    'planned_costs': '1 500 000 ₽',
    'roi': '25%',
    'progress': '65%',
    'responsible': 'А. Петров',
    'currency_code': 'RUB'
  }
  return previewData[key] || 'Пример данных'
}

const showAllColumns = () => {
  workingColumns.value.forEach(col => {
    col.visible = true
  })
}

const hideAllColumns = () => {
  workingColumns.value.forEach(col => {
    if (!col.required) {
      col.visible = false
    }
  })
}

const resetToDefaults = () => {
  initializeWorkingColumns()
}

const updateColumnOrder = () => {
  // Обновление порядка столбцов уже происходит автоматически через v-model draggable
  console.log('Column order updated')
}

const updateColumnVisibility = (column) => {
  if (column.required && !column.visible) {
    // Не позволяем скрывать обязательные столбцы
    column.visible = true
  }
}

const updateColumnWidth = (column) => {
  // Валидация ширины
  if (column.width < 50) column.width = 50
  if (column.width > 500) column.width = 500
}

const updateColumnAlignment = (column) => {
  console.log('Column alignment updated:', column.key, column.align)
}

const applyChanges = () => {
  // Преобразуем обратно в формат для таблицы
  const updatedColumns = workingColumns.value
    .filter(col => col.visible)
    .map(col => ({
      title: col.title,
      key: col.key,
      sortable: col.sortable,
      width: col.width + 'px',
      align: col.align
    }))

  emit('apply', updatedColumns)
  close()
}

const close = () => {
  dialogVisible.value = false
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    initializeWorkingColumns()
  }
})

watch(() => props.columns, () => {
  if (props.modelValue) {
    initializeWorkingColumns()
  }
})

// Инициализация
initializeWorkingColumns()
</script>

<style scoped>
.column-editor-content {
  max-height: 70vh;
  overflow-y: auto;
}

.editor-toolbar {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.columns-list {
  max-height: 400px;
  overflow-y: auto;
}

.column-item {
  transition: all 0.2s ease;
}

.column-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.column-disabled {
  opacity: 0.5;
}

.column-row {
  border-radius: 4px;
}

.drag-handle {
  cursor: grab;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.drag-handle:hover {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.column-info {
  min-width: 0;
}

.column-settings {
  min-width: 300px;
}

.width-setting {
  min-width: 140px;
}

.align-setting {
  min-width: 160px;
}

.preview-section {
  background-color: #f8f9fa;
}

.preview-table-container {
  max-width: 100%;
  overflow-x: auto;
}

.preview-table {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  min-width: 100%;
}

.preview-header {
  background-color: #e0e0e0;
  font-weight: 600;
}

.preview-header-cell,
.preview-cell {
  padding: 8px 12px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-header-cell:last-child,
.preview-cell:last-child {
  border-right: none;
}

.gap-3 {
  gap: 12px;
}

.gap-2 {
  gap: 8px;
}

/* Стили для draggable */
.sortable-ghost {
  opacity: 0.5;
}

.sortable-chosen {
  transform: scale(1.02);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .column-settings {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    min-width: 250px;
  }

  .width-setting,
  .align-setting {
    min-width: auto;
  }
}

@media (max-width: 960px) {
  .column-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .column-settings {
    min-width: auto;
  }

  .preview-table-container {
    font-size: 0.75rem;
  }
}
</style>